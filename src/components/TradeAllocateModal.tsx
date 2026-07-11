import React, { useState, useEffect } from 'react';
import { Modal, Row, Col, Select, InputNumber, Button, Space, Typography, message, Spin } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { allocateTrade, AllocateApiParams } from '@/api/tradeApi';
import { getTraderSelectList } from '@/api/accountApi';
import { queryInvestStrategy } from '@/api/investApi';
import type { SelectProps } from 'antd/es/select';

const { Text } = Typography;
const { Option } = Select;

// 后端返回分配明细子项
interface BackendAllocateItem {
  traderName: string;
  strategyName: string;
  allocateQty: number;
}

// 表格单行交易数据类型
export interface TradeRowItem {
  id: number;
  account: string;
  contract: string;
  buySell: string; // 买/卖
  totalAmount: number; // 交易总数量
  unAllocateAmount: number; // 未分配数量
  quantity: number;
  matchPrice: number;
  profitLoss: number;
  fee: number;
  currency: string;
  tradeTime: string;
  shares: number;
  originRecord: {
    positionAllocateDetails?: BackendAllocateItem[];
  };
}

// 分配单行结构（前端渲染用）
interface AllocateLine {
  trader: string;
  strategy: string;
  amount: number;
}

interface TradeAllocateModalProps {
  open: boolean;
  tradeData: TradeRowItem | null;
  onCancel: () => void;
  onConfirm: () => void; // 分配成功后父页面刷新表格
}

const TradeAllocateModal: React.FC<TradeAllocateModalProps> = ({ open, tradeData, onCancel, onConfirm }) => {
  // 加载状态
  const [submitLoading, setSubmitLoading] = useState(false);
  const [optionLoading, setOptionLoading] = useState(false);

  // 下拉数据源（接口返回）
  const [traderOptions, setTraderOptions] = useState<SelectProps['options']>([]);
  const [strategyOptions, setStrategyOptions] = useState<SelectProps['options']>([]);

  // 默认分配数据
  const [allocateRows, setAllocateRows] = useState<AllocateLine[]>([
    { trader: '', strategy: '', amount: 0 },
  ]);

  // 转换后端分配数据 → 前端AllocateLine格式（回填核心方法）
  const transformBackDataToFront = (list?: BackendAllocateItem[]): AllocateLine[] => {
    if (!list || !Array.isArray(list) || list.length === 0) {
      return [{ trader: '', strategy: '', amount: 0 }];
    }
    // 后端字段映射前端字段
    return list.map(item => ({
      trader: item.traderName,
      strategy: item.strategyName,
      amount: item.allocateQty
    }));
  };

  // 弹窗打开时：1.拉取下拉 2.回填历史分配数据
  useEffect(() => {
    if (!open || !tradeData) return;
    const initModalData = async () => {
      setOptionLoading(true);
      try {
        // 1. 加载交易员下拉
        const traderRes = await getTraderSelectList({
          accountCodes: [tradeData.account],
          traderName: ''
        });
        setTraderOptions(traderRes);

        // 2. 加载策略下拉并格式化
        const strategyRes = await queryInvestStrategy('');
        setStrategyOptions(strategyRes);

        // 3. 核心：回填历史分配数据
        const backAllocateList = tradeData.originRecord.positionAllocateDetails;
        const frontList = transformBackDataToFront(backAllocateList);
        setAllocateRows(frontList);

      } catch (err) {
        console.error('弹窗初始化加载失败', err);
        // message.error('加载数据失败');
      } finally {
        setOptionLoading(false);
      }
    };
    initModalData();
  }, [open, tradeData]);

  // 弹窗关闭重置所有状态
  useEffect(() => {
    if (!open) {
      setAllocateRows([{ trader: '', strategy: '', amount: 0 }]);
      setTraderOptions([]);
      setStrategyOptions([]);
    }
  }, [open]);

  if (!tradeData) return null;

  // 修改单行字段
  const changeRowField = (index: number, field: keyof AllocateLine, value: string | number) => {
    const list = [...allocateRows];
    list[index][field] = value as never;
    setAllocateRows(list);
  };

  // 新增分配行
  const addAllocateRow = () => {
    setAllocateRows(prev => [...prev, { trader: '', strategy: '', amount: 0 }]);
  };

  // 删除行，最少保留1行
  const deleteRow = (delIndex: number) => {
    if (allocateRows.length <= 1) {
      message.warn('至少保留一条分配记录');
      return;
    }
    const newList = allocateRows.filter((_, idx) => idx !== delIndex);
    setAllocateRows(newList);
  };

  // 提交分配
  const handleSubmit = async () => {
    // 空行校验
    const emptyRow = allocateRows.find(item => !item.trader || !item.strategy);
    if (emptyRow) {
      message.info('请完整填写每一行的交易员与策略');
      return;
    }

    // 总量校验
    const totalAllocate = allocateRows.reduce((sum, item) => sum + item.amount, 0);
    if (totalAllocate <= 0) {
      message.info('分配总数量不能为0');
      return;
    }
    if (totalAllocate > tradeData.unAllocateAmount) {
      message.info(`分配总量不可超过未分配数量 ${tradeData.unAllocateAmount}`);
      return;
    }

    setSubmitLoading(true);
    try {
      const apiParams: AllocateApiParams = {
        id: tradeData.id,
        operateType: 2,
        details: allocateRows.map(item => ({
          accountCode: tradeData.account,
          conid: tradeData?.originRecord?.conid,
          strategyName: item.strategy,
          traderName: item.trader,
          allocateQty: item.amount
        }))
      };
      const res = await allocateTrade(apiParams);
      if (res === true) {
        message.success('交易分配成功');
        onConfirm();
        onCancel();
      } else {
        message.error('分配失败，请重试');
      }
    } catch (err) {
      message.error('分配接口异常，请稍后重试');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Modal
      title="交易分配"
      open={open}
      width={1100}
      maskClosable={false}
      onCancel={onCancel}
      confirmLoading={submitLoading}
      footer={
        <Space size={20}>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" loading={submitLoading} onClick={handleSubmit}>确定</Button>
        </Space>
      }
    >
      <Spin spinning={optionLoading} tip="加载交易员、策略及历史分配数据...">
        {/* 顶部基础信息栏 */}
        <Row align="middle" gutter={[16, 14]} style={{ marginBottom: 28 }}>
          <Col>
            <Space>
              <Text strong>账号</Text>
              <Select value={tradeData.account} style={{ width: 160 }} disabled>
                <Option value={tradeData.account}>{tradeData.account}</Option>
              </Select>
            </Space>
          </Col>
          <Col>
            <Space>
              <Text strong>合约</Text>
              <Select value={tradeData.contract} style={{ width: 160 }} disabled>
                <Option value={tradeData.contract}>{tradeData.contract}</Option>
              </Select>
            </Space>
          </Col>
          <Col>
            <Space>
              <Text strong>买卖</Text>
              <Select value={tradeData.buySell} style={{ width: 100 }} disabled>
                <Option value={tradeData.buySell}>{tradeData.buySell}</Option>
              </Select>
            </Space>
          </Col>
          <Col>
            <Text strong>交易数量:{tradeData.quantity}</Text>
          </Col>
          <Col>
            <Text strong>未分配数量:{tradeData.unAllocateAmount}</Text>
          </Col>
        </Row>

        {/* 分配表头 */}
        <Row gutter={[20, 10]} style={{ marginBottom: 10 }}>
          <Col span={6} style={{ textAlign: 'center' }}><Text strong style={{ fontSize: 16 }}>交易员</Text></Col>
          <Col span={6} style={{ textAlign: 'center' }}><Text strong style={{ fontSize: 16 }}>策略</Text></Col>
          <Col span={2} style={{ textAlign: 'center' }}><Text strong style={{ fontSize: 16 }}>分配数量</Text></Col>
          <Col span={6} style={{ textAlign: 'center' }}><Text strong style={{ fontSize: 16 }}>操作</Text></Col>
        </Row>

        {/* 分配行渲染 */}
        {allocateRows.map((row, idx) => (
          <Row gutter={[20, 12]} key={idx} align="middle" style={{ marginBottom: 14 }}>
            <Col span={6}>
              <Select
                value={row.trader || undefined}
                placeholder="请选择交易员"
                style={{ width: '100%' }}
                onChange={(val) => changeRowField(idx, 'trader', val)}
                options={traderOptions}
                allowClear
              />
            </Col>
            <Col span={6}>
              <Select
                value={row.strategy || undefined}
                placeholder="请选择策略"
                style={{ width: '100%' }}
                onChange={(val) => changeRowField(idx, 'strategy', val)}
                options={strategyOptions}
                allowClear
              />
            </Col>
            <Col span={2}>
              <InputNumber
                min={0}
                value={row.amount}
                style={{ width: '100%' }}
                onChange={(val) => changeRowField(idx, 'amount', val ?? 0)}
              />
            </Col>
            <Col span={6} style={{ textAlign: 'center' }}>
              <Button danger icon={<DeleteOutlined />} onClick={() => deleteRow(idx)}>删除</Button>
            </Col>
          </Row>
        ))}

        <Button
          block
          icon={<PlusOutlined />}
          disabled={allocateRows.length >= tradeData.unAllocateAmount}
          onClick={addAllocateRow}
          style={{ width: 160 }}
        >新增分配行</Button>
      </Spin>
    </Modal>
  );
};

export default TradeAllocateModal;