import { Modal, Input, Button, Space } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

export interface StrategyItem {
  id: string;
  strategyName: string;
}

export interface StrategyModalProps {
  open: boolean;
  list: StrategyItem[];
  onCancel: () => void;
  onAddRow: () => void;
  onDeleteRow: (id: string) => void;
  onUpdateText: (id: string, value: string) => void;
}

const StrategyConfigModal: React.FC<StrategyModalProps> = ({
  open,
  list,
  onCancel,
  onAddRow,
  onDeleteRow,
  onUpdateText,
}) => {
  return (
    <Modal
      title="策略配置"
      open={open}
      footer={null}
      width={520}
      onCancel={onCancel}
    >
      {list.map((item) => (
        <Space key={item.id} style={{ marginBottom: 10, width: '100%' }}>
          <Input
            value={item.strategyName}
            onChange={(e) => onUpdateText(item.id, e.target.value)}
            style={{ flex: 1 }}
          />
          <Button type="text" icon={<CheckOutlined />} />
          <Button type="text" danger icon={<CloseOutlined />} onClick={() => onDeleteRow(item.id)} />
        </Space>
      ))}
      <Space style={{ marginTop: 16, justifyContent: 'flex-end', width: '100%' }}>
        <Button type="primary" onClick={onAddRow}>新增</Button>
        <Button onClick={onCancel}>取消</Button>
      </Space>
    </Modal>
  );
};

export default StrategyConfigModal;