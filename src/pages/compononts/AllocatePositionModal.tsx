import React, { useState, useEffect } from 'react';
import { Modal, Row, Col, Select, InputNumber, Button, Space, Typography } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

// 传入弹窗的单行持仓数据
export interface PositionRowItem {
  id: number;
  account: string; // 账号
  contract: string; // 合约
  totalAmount: number; // 总数量
  unAllocateAmount: number; // 未分配数量
}

// 单行分配行数据
interface AllocateLine {
  trader: string;
  strategy: string;
  amount: number;
}

interface AllocateModalProps {
  open: boolean;
  data: PositionRowItem | null;
  onCancel: () => void;
  onConfirm: (data: PositionRowItem, allocateList: AllocateLine[]) => void;
}

// 模拟下拉数据源
const traderList = ['张三', '李四', '王五'];
const strategyList = ['进取型', '稳健型', '保守型'];

const AllocatePositionModal: React.FC<AllocateModalProps> = ({ open, data, onCancel, onConfirm }) => {
  // 分配多行列表
  const [allocateLines, setAllocateLines] = useState<AllocateLine[]>([
    { trader: '张三', strategy: '进取型', amount: 20 },
    { trader: '张三', strategy: '进取型', amount: 20 },
    { trader: '张三', strategy: '进取型', amount: 20 },
  ]);

  // 弹窗关闭重置表单
  useEffect(() => {
    if (!open) {
      setAllocateLines([
        { trader: '张三', strategy: '进取型', amount: 20 },
        { trader: '张三', strategy: '进取型', amount: 20 },
        { trader: '张三', strategy: '进取型', amount: 20 },
      ]);
    }
  }, [open]);

  if (!data) return null;

  // 增减单行数量
  const changeAmount = (index: number, delta: number) => {
    const newLines = [...allocateLines];
    const newVal = newLines[index].amount + delta;
    if (newVal < 0) return;
    newLines[index].amount = newVal;
    setAllocateLines(newLines);
  };

  // 修改交易员/策略
  const changeLineField = (index: number, field: keyof AllocateLine, val: string | number) => {
    const newLines = [...allocateLines];
    newLines[index][field] = val as never;
    setAllocateLines(newLines);
  };

  // 新增一行分配
  const addLine = () => {
    setAllocateLines(prev => [...prev, { trader: '张三', strategy: '进取型', amount: 0 }]);
  };

  // 提交分配
  const handleSubmit = () => {
    onConfirm(data, allocateLines);
    onCancel();
  };

  return (
    <Modal
      title="持仓分配"
      open={open}
      width={1200}
      maskClosable={false}
      onCancel={onCancel}
      footer={
        <Space size={16}>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={handleSubmit}>确定</Button>
        </Space>
      }
    >
      {/* 顶部账号、合约、数量信息栏 */}
      <Row align="middle" gutter={[16, 12]} style={{ marginBottom: 24 }}>
        <Col>
          <Space align="middle">
            <Text strong>账号</Text>
            <Select value={data.account} style={{ width: 200 }} disabled>
              <Option value={data.account}>{data.account}</Option>
            </Select>
          </Space>
        </Col>
        <Col>
          <Space align="middle">
            <Text strong>合约</Text>
            <Select value={data.contract} style={{ width: 200 }} disabled>
              <Option value={data.contract}>{data.contract}</Option>
            </Select>
          </Space>
        </Col>
        <Col>
          <Text strong>总数量：{data.totalAmount}</Text>
        </Col>
        <Col>
          <Text strong>未分配数量：{data.unAllocateAmount}</Text>
        </Col>
      </Row>

      {/* 分配表头 */}
      <Row gutter={[16, 12]} style={{ marginBottom: 8 }}>
        <Col span={6}><Title level={5} style={{ margin: 0, textAlign: 'center' }}>交易员</Title></Col>
        <Col span={6}><Title level={5} style={{ margin: 0, textAlign: 'center' }}>策略</Title></Col>
        <Col span={6}><Title level={5} style={{ margin: 0, textAlign: 'center' }}>数量</Title></Col>
        <Col span={6} />
      </Row>

      {/* 多行分配输入 */}
      {allocateLines.map((line, idx) => (
        <Row gutter={[16, 12]} key={idx} align="middle" style={{ marginBottom: 12 }}>
          <Col span={6}>
            <Select
              value={line.trader}
              style={{ width: '100%' }}
              onChange={(val) => changeLineField(idx, 'trader', val)}
            >
              {traderList.map(item => (
                <Option key={item} value={item}>{item}</Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Select
              value={line.strategy}
              style={{ width: '100%' }}
              onChange={(val) => changeLineField(idx, 'strategy', val)}
            >
              {strategyList.map(item => (
                <Option key={item} value={item}>{item}</Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Space align="middle" style={{ width: '100%' }}>
              <InputNumber
                min={0}
                value={line.amount}
                style={{ flex: 1 }}
                onChange={(val) => changeLineField(idx, 'amount', val ?? 0)}
              />
              <Button icon={<PlusOutlined />} onClick={() => changeAmount(idx, 1)} />
              <Button icon={<MinusOutlined />} onClick={() => changeAmount(idx, -1)} />
            </Space>
          </Col>
          <Col span={6} />
        </Row>
      ))}

      <Button block onClick={addLine} style={{ marginTop: 12 }}>新增分配行</Button>
    </Modal>
  );
};

export default AllocatePositionModal;