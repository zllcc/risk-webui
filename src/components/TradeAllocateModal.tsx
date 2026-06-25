import React, { useState, useEffect } from 'react';
import { Modal, Row, Col, Select, InputNumber, Button, Space, Typography } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { Option } = Select;

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
}

// 分配单行结构
interface AllocateLine {
  trader: string;
  strategy: string;
  amount: number;
}

interface TradeAllocateModalProps {
  open: boolean;
  tradeData: TradeRowItem | null;
  onCancel: () => void;
  onConfirm: (tradeInfo: TradeRowItem, allocateList: AllocateLine[]) => void;
}

// 模拟下拉选项
const traderOptions = ['张三', '李四', '王五'];
const strategyOptions = ['进取型', '稳健型', '保守型'];

const TradeAllocateModal: React.FC<TradeAllocateModalProps> = ({ open, tradeData, onCancel, onConfirm }) => {
  // 默认3行分配数据
  const [allocateRows, setAllocateRows] = useState<AllocateLine[]>([
    { trader: '张三', strategy: '进取型', amount: 20 },
    { trader: '张三', strategy: '进取型', amount: 20 },
    { trader: '张三', strategy: '进取型', amount: 20 },
  ]);

  // 弹窗关闭重置表单
  useEffect(() => {
    if (!open) {
      setAllocateRows([
        { trader: '张三', strategy: '进取型', amount: 20 },
        { trader: '张三', strategy: '进取型', amount: 20 },
        { trader: '张三', strategy: '进取型', amount: 20 },
      ]);
    }
  }, [open]);

  if (!tradeData) return null;

  // 数量增减
  const adjustAmount = (index: number, delta: number) => {
    const list = [...allocateRows];
    const newVal = list[index].amount + delta;
    if (newVal < 0) return;
    list[index].amount = newVal;
    setAllocateRows(list);
  };

  // 修改交易员/策略
  const changeRowField = (index: number, field: keyof AllocateLine, value: string | number) => {
    const list = [...allocateRows];
    list[index][field] = value as never;
    setAllocateRows(list);
  };

  // 新增分配行
  const addAllocateRow = () => {
    setAllocateRows(prev => [...prev, { trader: '张三', strategy: '进取型', amount: 0 }]);
  };

  // 确认分配
  const handleSubmit = () => {
    onConfirm(tradeData, allocateRows);
    onCancel();
  };

  return (
    <Modal
      title="交易分配"
      open={open}
      width={1100}
      maskClosable={false}
      onCancel={onCancel}
      footer={
        <Space size={20}>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={handleSubmit}>确定</Button>
        </Space>
      }
    >
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
          <Text strong>交易数量:{tradeData.totalAmount}</Text>
        </Col>
        <Col>
          <Text strong>未分配数量:{tradeData.unAllocateAmount}</Text>
        </Col>
      </Row>

      {/* 分配表头 */}
      <Row gutter={[20, 10]} style={{ marginBottom: 10 }}>
        <Col span={6} style={{ textAlign: 'center' }}><Text strong style={{ fontSize: 16 }}>交易员</Text></Col>
        <Col span={6} style={{ textAlign: 'center' }}><Text strong style={{ fontSize: 16 }}>策略</Text></Col>
        <Col span={6} style={{ textAlign: 'center' }}><Text strong style={{ fontSize: 16 }}>数量</Text></Col>
        <Col span={6} />
      </Row>

      {/* 多行分配输入 */}
      {allocateRows.map((row, idx) => (
        <Row gutter={[20, 12]} key={idx} align="middle" style={{ marginBottom: 14 }}>
          <Col span={6}>
            <Select
              value={row.trader}
              style={{ width: '100%' }}
              onChange={(val) => changeRowField(idx, 'trader', val)}
            >
              {traderOptions.map(item => (
                <Option key={item} value={item}>{item}</Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Select
              value={row.strategy}
              style={{ width: '100%' }}
              onChange={(val) => changeRowField(idx, 'strategy', val)}
            >
              {strategyOptions.map(item => (
                <Option key={item} value={item}>{item}</Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Space style={{ width: '100%' }}>
              <InputNumber
                min={0}
                value={row.amount}
                style={{ flex: 1 }}
                onChange={(val) => changeRowField(idx, 'amount', val ?? 0)}
              />
              <Button icon={<PlusOutlined />} onClick={() => adjustAmount(idx, 1)} />
              <Button icon={<MinusOutlined />} onClick={() => adjustAmount(idx, -1)} />
            </Space>
          </Col>
          <Col span={6} />
        </Row>
      ))}

      <Button block onClick={addAllocateRow} style={{ marginTop: 16 }}>新增分配行</Button>
    </Modal>
  );
};

export default TradeAllocateModal;