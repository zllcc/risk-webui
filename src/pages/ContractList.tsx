import React, { useState, useEffect, useCallback } from 'react';
import { Card, Input, Select, Table, Pagination, Space, Button, message, Typography } from 'antd';
import type { TableProps } from 'antd';
const { Search } = Input;
import ContractEditModal from '@/components/ContractEditModal';
import ContractViewModal from '@/components/ContractViewModal';
import { getContractData } from '@/api/contractApi';
import ImportBtnGroup from '@/components/ImportBtnGroup';

const { Title } = Typography;

const { Option } = Select;

// ========== 类型定义 ==========
export interface ContractRow {
  id: number;
  conid: number;
  symbol: string; // 合约
  secType: string; // 类型
  exchange: string; // 交易所
  currency: string; // 币种
  strike: number | null; // 行权价
  optRiaht: string | null; // 期权类型
  lastTradeDate: string | null; // 到期日
  shortName: string; // 代码
}


const ContractList = () => {
  // 筛选条件
  const [contractKeyword, setContractKeyword] = useState('');

  // 表格数据
  const [tableData, setTableData] = useState<ContractRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);

  // 弹窗控制
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<ContractRow | null>(null);

  // 请求列表数据
  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        pageNum,
        pageSize,
        symbolOrType: contractKeyword,
      };
      const res = await getContractData(params);
      setTableData(res.records);
      setTotal(res.total);
    } catch (e) {
      message.error('合约列表加载失败');
    } finally {
      setLoading(false);
    }
  }, [pageNum, contractKeyword]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleSearch = (value: any) => {
    setContractKeyword(value);
  }

  // 打开编辑弹窗
  const openEdit = (record: ContractRow) => {
    setCurrentRow(record);
    setEditModalOpen(true);
  };

  // 打开查看弹窗
  const openView = (record: ContractRow) => {
    setCurrentRow(record);
    setViewModalOpen(true);
  };

  // 编辑提交成功回调，刷新列表
  const afterEditSuccess = () => {
    setEditModalOpen(false);
    fetchList();
  };

  const columns: TableProps<ContractRow>['columns'] = [
    { title: '合约', dataIndex: 'symbol', key: 'symbol' },
    { title: '类型', dataIndex: 'secType', key: 'secType' },
    { title: '交易所', dataIndex: 'exchange', key: 'exchange' },
    { title: '币种', dataIndex: 'currency', key: 'currency' },
    {
      title: '行权价',
      dataIndex: 'strike',
      key: 'strike',
      render: (val) => val ?? '--',
    },
    {
      title: '期权类型',
      dataIndex: 'optRiaht',
      key: 'optRiaht',
      render: (val) => val ?? '--',
    },
    {
      title: '到期日',
      dataIndex: 'lastTradeDate',
      key: 'lastTradeDate',
      render: (val) => val ?? '--',
    },
    { title: '代码', dataIndex: 'shortName', key: 'shortName' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => openEdit(record)}>编辑</Button>
          <Button type="link" onClick={() => openView(record)}>查看</Button>
        </Space>
      )
    }
  ];

  return (
    <Card
      title={<Title level={5}>合约列表</Title>}
      extra={<ImportBtnGroup type="3" />}
    >
      {/* 筛选区域 */}
      <Space size="large" style={{ marginBottom: 36 }}>
        <Space>
          <span>合约/类型:</span>
          <Search
            placeholder="请输入合约或类型"
            enterButton="查询"
            onSearch={handleSearch}
            style={{ width: 240 }}
            allowClear
          />
        </Space>
      </Space>

      {/* 主表格 */}
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={tableData}
        pagination={false}
        bordered
      />

      {/* 底部分页 */}
      {!!tableData.length && <Pagination
        style={{ marginTop: 16, textAlign: 'right', justifyContent: 'right' }}
        current={pageNum}
        pageSize={pageSize}
        total={total}
        onChange={(page) => setPageNum(page)}
      />}

      {/* 编辑弹窗 */}
      <ContractEditModal
        open={editModalOpen}
        detail={currentRow}
        onCancel={() => setEditModalOpen(false)}
        onSuccess={afterEditSuccess}
      />

      {/* 查看弹窗 */}
      <ContractViewModal
        open={viewModalOpen}
        detail={currentRow}
        onCancel={() => setViewModalOpen(false)}
      />
    </Card>
  );
};

export default ContractList;