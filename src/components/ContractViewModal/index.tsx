import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Input, Table, Pagination, Spin, Space } from 'antd';
import { ContractRow } from '@/pages/ContractList';
import { getContractPriceHistory } from '@/api/contractApi';

interface PriceItem {
  tradeDate: string;
  price: number;
}

interface Props {
  open: boolean;
  detail: ContractRow | null;
  onCancel: () => void;
}

const ContractViewModal: React.FC<Props> = ({ open, detail, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [priceData, setPriceData] = useState<PriceItem[]>([]);
  const [pageNum, setPageNum] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);

  // 查询历史行情表格
  const fetchPriceData = useCallback(async () => {
    if (!detail?.conid) return;
    setLoading(true);
    try {
      const res = await getContractPriceHistory({
        conid: detail.conid,
        pageNum,
        pageSize
      });
      setPriceData(res.records);
      setTotal(res.total);
    } catch (e) {
      console.error('行情数据加载失败');
    } finally {
      setLoading(false);
    }
  }, [detail, pageNum]);

  useEffect(() => {
    if (open) fetchPriceData();
  }, [open, fetchPriceData]);

  // 弹窗关闭重置分页
  useEffect(() => {
    if (!open) setPageNum(1);
  }, [open]);

  const columns = [
    { title: '日期', dataIndex: 'dailyDate', key: 'dailyDate' },
    { title: '价格', dataIndex: 'positionMarketPrice', key: 'positionMarketPrice' }
  ];

  return (
    <Modal
      title="合约详情查看"
      width={700}
      open={open}
      footer={null}
      onCancel={onCancel}
    >
      <Spin spinning={!detail}>
        {/* 顶部只读信息 */}
        <Space size="large" style={{ marginBottom: 20 }}>
          <Space>
            <span>合约：</span>
            <Input value={detail?.symbol} disabled style={{ width: 200 }} />
          </Space>
          <Space>
            <span>类型：</span>
            <Input value={detail?.secType} disabled style={{ width: 200 }} />
          </Space>
        </Space>

        {/* 行情表格 */}
        <Table
          rowKey="tradeDate"
          loading={loading}
          columns={columns}
          dataSource={priceData}
          pagination={false}
          bordered
        />

        {/* 表格分页 */}
        {!!priceData.length && <Pagination
          style={{ marginTop: 16, justifyContent: 'right', display: 'flex' }}
          current={pageNum}
          pageSize={pageSize}
          total={total}
          onChange={setPageNum}
        />}
      </Spin>
    </Modal>
  );
};

export default ContractViewModal;