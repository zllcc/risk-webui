import { Modal, Table, Spin, message } from 'antd';
import type { TableProps } from 'antd';
import { useEffect, useState, useCallback } from 'react';
import { getTraderDetail, TraderOperateParams, TraderModifiedHistory } from '@/api/tradeApi';

export interface ChangeRecordRow {
  oldTrader: string;
  oldPrincipal: number;
  newTrader: string;
  newPrincipal: number;
  changeDate: string;
}

interface ChangeRecordModalProps {
  open: boolean;
  // 用于请求详情接口的参数
  traderId: number;
  traderName: string;
  capital: number;
  onCancel: () => void;
}

const ChangeRecordModal: React.FC<ChangeRecordModalProps> = ({
  open,
  traderId,
  traderName,
  capital,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [recordList, setRecordList] = useState<ChangeRecordRow[]>([]);

  const columns: TableProps<ChangeRecordRow>['columns'] = [
    { title: '原交易员', dataIndex: 'oldTrader' },
    { title: '原本金', dataIndex: 'oldPrincipal' },
    { title: '现交易员', dataIndex: 'newTrader' },
    { title: '现本金', dataIndex: 'newPrincipal' },
    { title: '变更日期', dataIndex: 'changeDate' },
  ];

  // 请求交易员详情接口，转换变更记录
  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const params: TraderOperateParams = {
        id: traderId,
        traderName,
        capital,
      };
      const res = await getTraderDetail(params);
      console.log('获取详情接口返回：', res);
      // 后端modifiedHistoryList 转前端表格字段
      const list: ChangeRecordRow[] = res.modifiedHistoryList.map((item: TraderModifiedHistory) => ({
        oldTrader: item.orgTraderName,
        oldPrincipal: item.orgCapital,
        newTrader: item.currentTraderName,
        newPrincipal: item.currentCapital,
        changeDate: item.modifiedTime,
      }));
      setRecordList(list);
    } catch (err) {
      message.error('获取变更记录失败');
      console.error('获取详情报错：', err);
      setRecordList([]);
    } finally {
      setLoading(false);
    }
  }, [traderId, traderName, capital]);

  // 弹窗打开时拉取数据
  useEffect(() => {
    if (open && traderId) {
      fetchDetail();
    }
    // 弹窗关闭清空列表，避免下次打开缓存旧数据
    if (!open) {
      setRecordList([]);
    }
  }, [open, fetchDetail, traderId]);

  return (
    <Modal
      title="变更记录"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={700}
    >
      <Spin spinning={loading}>
        <Table
          rowKey="changeDate"
          columns={columns}
          dataSource={recordList}
          pagination={false}
          bordered
        />
      </Spin>
    </Modal>
  );
};

export default ChangeRecordModal;