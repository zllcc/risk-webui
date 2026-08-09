import { Modal, Table, Spin, message } from 'antd';
import type { TableProps } from 'antd';
import { useEffect, useState, useCallback } from 'react';
import { queryTraderHistory } from '@/api/tradeApi';

export interface ChangeRecordRow {
  traderName: string;
  capital: number;
  strategyName?: string;
  loan?: number;
  interest?: number;
  fee?: number;
  createTime: string;
}

interface ChangeRecordModalProps {
  open: boolean;
  traderId: number;
  traderName: string;
  capital: number;
  strategyName?: string;
  loan?: number;
  interest?: number;
  fee?: number;
  onCancel: () => void;
  fetchTraderList: () => void;
}

const ChangeRecordModal: React.FC<ChangeRecordModalProps> = ({
  open,
  traderId,
  traderName,
  capital,
  strategyName,
  loan,
  interest,
  fee,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [recordList, setRecordList] = useState<ChangeRecordRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const pageSize = 10;

  // 表格列配置
  const columns: TableProps<ChangeRecordRow>['columns'] = [
    { title: '交易员', dataIndex: 'traderName' },
    { title: '策略', dataIndex: 'strategyName' },
    { title: '本金', dataIndex: 'capital', render: (val: number) => val ?? 0 },
    { title: '本金利息', dataIndex: 'capitalInterest', render: (val: number) => val ?? 0 },
    { title: '贷款', dataIndex: 'loan', render: (val: number) => val ?? 0 },
    { title: '贷款利息', dataIndex: 'loanInterest', render: (val: number) => val ?? 0 },
    { title: '费用', dataIndex: 'fee', render: (val: number) => val ?? 0 },
    { title: '创建时间', dataIndex: 'createTime' },
  ];

  // 请求交易员历史记录
  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const res = await queryTraderHistory({
        traderId,
        pageNum,
        pageSize
      });
      const list: ChangeRecordRow[] = res.records.map((item) => ({
        traderName: item.traderName,
        capital: item.capital,
        strategyName: item.strategyName,
        loan: item.loan,
        interest: item.interest,
        fee: item.fee,
        createTime: item.createTime,
      }));
      setRecordList(list);
      setTotal(res.total);
    } catch (err) {
      message.error('获取变更记录失败');
      console.error('获取历史记录报错：', err);
      setRecordList([]);
    } finally {
      setLoading(false);
    }
  }, [traderId, pageNum]);

  // 弹窗打开加载数据
  useEffect(() => {
    if (open && traderId) {
      fetchDetail();
    }
    if (!open) {
      setRecordList([]);
      setTotal(0);
      setPageNum(1);
    }
  }, [open, fetchDetail, traderId]);

  return (
    <Modal
      title="查看变更记录"
      open={open}
      onCancel={onCancel}
      width={1000}
      footer={null}
    >
      {/* 顶部：当前数据展示区域，一行显示 */}
      <Space size={20} style={{ width: '100%', marginBottom: 16, alignItems: 'center' }} wrap>
        <Space style={{ alignItems: 'center' }}>
          <span style={{ fontWeight: 500, width: 70 }}>交易员：</span>
          <span>{traderName || '-'}</span>
        </Space>
        <Space style={{ alignItems: 'center' }}>
          <span style={{ fontWeight: 500, width: 70 }}>策略：</span>
          <span>{strategyName || '-'}</span>
        </Space>
        <Space style={{ alignItems: 'center' }}>
          <span style={{ fontWeight: 500, width: 70 }}>贷款：</span>
          <span>{loan ?? 0}</span>
        </Space>
        <Space style={{ alignItems: 'center' }}>
          <span style={{ fontWeight: 500, width: 70 }}>利息：</span>
          <span>{interest ?? 0}</span>
        </Space>
        <Space style={{ alignItems: 'center' }}>
          <span style={{ fontWeight: 500, width: 70 }}>费用：</span>
          <span>{fee ?? 0}</span>
        </Space>
        <Space style={{ alignItems: 'center' }}>
          <span style={{ fontWeight: 500, width: 70 }}>本金：</span>
          <span>{capital ?? 0}</span>
        </Space>
      </Space>

      <Spin spinning={loading}>
        <Table
          rowKey={(record, index) => `${record.traderName}_${record.createTime}_${index}`}
          columns={columns}
          dataSource={recordList}
          pagination={{
            current: pageNum,
            pageSize,
            total,
            onChange: (page) => setPageNum(page),
            showTotal: (totalNum) => `共 ${totalNum} 条`
          }}
          bordered
          scroll={{ x: 900 }}
        />
      </Spin>
    </Modal>
  );
};

export default ChangeRecordModal;
