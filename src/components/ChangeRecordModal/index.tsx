import { Modal, Table } from 'antd';
import type { TableProps } from 'antd';

export interface ChangeRecordRow {
  oldTrader: string;
  oldPrincipal: number;
  newTrader: string;
  newPrincipal: number;
  changeDate: string;
}

interface ChangeRecordModalProps {
  open: boolean;
  recordList: ChangeRecordRow[];
  onCancel: () => void;
}

const ChangeRecordModal: React.FC<ChangeRecordModalProps> = ({ open, recordList, onCancel }) => {
  const columns: TableProps<ChangeRecordRow>['columns'] = [
    { title: '原交易员', dataIndex: 'oldTrader' },
    { title: '原本金', dataIndex: 'oldPrincipal' },
    { title: '现交易员', dataIndex: 'newTrader' },
    { title: '现本金', dataIndex: 'newPrincipal' },
    { title: '变更日期', dataIndex: 'changeDate' },
  ];

  return (
    <Modal
      title="变更记录"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={700}
    >
      <Table
        rowKey="changeDate"
        columns={columns}
        dataSource={recordList}
        pagination={false}
        bordered
      />
    </Modal>
  );
};

export default ChangeRecordModal;