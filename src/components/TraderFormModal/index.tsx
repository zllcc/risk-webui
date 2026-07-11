import { Modal, Input, InputNumber, Space, Button } from 'antd';

export type ModalOperateType = 'add' | 'edit';

export interface TraderFormModalProps {
  open: boolean;
  traderName: string;
  principal: number;
  onCancel: () => void;
  onConfirm: (trader: string, principal: number) => void;
  onChangeTrader: (val: string) => void;
  onChangePrincipal: (val: number | null) => void;
}

const TraderFormModal: React.FC<TraderFormModalProps> = ({
  open,
  traderName,
  principal,
  onCancel,
  onConfirm,
  onChangeTrader,
  onChangePrincipal,
}) => {

  return (
    <Modal
      title="新增交易员"
      open={open}
      onCancel={onCancel}
      footer={
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={() => onConfirm(traderName, principal)}>确认</Button>
        </Space>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size={14}>
        <Space style={{ width: '100%' }}>
          <span style={{ width: 70 }}>交易员</span>
          <Input
            value={traderName}
            onChange={(e) => onChangeTrader(e.target.value)}
            placeholder="填写交易员名称"
          />
        </Space>
        <Space style={{ width: '100%' }}>
          <span style={{ width: 70 }}>本金</span>
          <InputNumber
            style={{ flex: 1 }}
            min={0}
            value={principal}
            onChange={onChangePrincipal}
            placeholder="填写本金数值"
          />
        </Space>
      </Space>
    </Modal>
  );
};

export default TraderFormModal;