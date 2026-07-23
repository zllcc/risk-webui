import React, { useState, useEffect, useCallback } from 'react';
import { Card, Input, Select, Table, Pagination, Space, Button, message, Typography } from 'antd';
import type { TableProps } from 'antd';
import ContractEditModal from '@/components/ContractEditModal';
import ContractViewModal from '@/components/ContractViewModal';
// import { getContractList, updateContractCode } from '@/api/contractApi';

const { Title } = Typography;

const { Option } = Select;

// ========== 类型定义 ==========
export interface ContractRow {
  id: number;
  contractSymbol: string; // 合约
  secType: string; // 类型
  exchange: string; // 交易所
  currency: string; // 币种
  strikePrice: number | null; // 行权价
  optionType: string | null; // 期权类型
  expireDate: string | null; // 到期日
  code: string; // 代码
}

// ========== Mock 模拟数据 ==========
const mockContractData: ContractRow[] = [
  {
    id: 1,
    contractSymbol: 'AAPL',
    secType: 'STK',
    exchange: 'NASDAQ',
    currency: 'USD',
    strikePrice: null,
    optionType: null,
    expireDate: null,
    code: 'AAPL US Equity',
  },
  {
    id: 2,
    contractSymbol: 'AAPL',
    secType: 'OPT',
    exchange: 'NASDAQ',
    currency: 'USD',
    strikePrice: 190,
    optionType: 'CALL',
    expireDate: '2026-09-18',
    code: 'AAPL 260918C00190000',
  },
  {
    id: 3,
    contractSymbol: 'MSFT',
    secType: 'STK',
    exchange: 'NASDAQ',
    currency: 'USD',
    strikePrice: null,
    optionType: null,
    expireDate: null,
    code: 'MSFT US Equity',
  },
  {
    id: 4,
    contractSymbol: 'TSLA',
    secType: 'OPT',
    exchange: 'NASDAQ',
    currency: 'USD',
    strikePrice: 235,
    optionType: 'PUT',
    expireDate: '2026-10-16',
    code: 'TSLA 261016P00235000',
  },
  {
    id: 5,
    contractSymbol: 'NVDA',
    secType: 'STK',
    exchange: 'NASDAQ',
    currency: 'USD',
    strikePrice: null,
    optionType: null,
    expireDate: null,
    code: 'NVDA US Equity',
  },
  {
    id: 6,
    contractSymbol: 'GOOG',
    secType: 'OPT',
    exchange: 'NASDAQ',
    currency: 'USD',
    strikePrice: 175,
    optionType: 'CALL',
    expireDate: '2026-08-21',
    code: 'GOOG 260821C00175000',
  },
];

/** mock接口模拟分页 + 筛选 */
async function mockContractList(params: {
  pageNum: number;
  pageSize: number;
  contractSymbol?: string;
  secType?: string;
}) {
  const { pageNum, pageSize, contractSymbol, secType } = params;
  let list = [...mockContractData];

  // 合约名称筛选
  if (contractSymbol) {
    list = list.filter(item =>
      item.contractSymbol.toLowerCase().includes(contractSymbol.toLowerCase())
    );
  }
  // 类型筛选
  if (secType) {
    list = list.filter(item => item.secType === secType);
  }

  const total = list.length;
  const start = (pageNum - 1) * pageSize;
  const records = list.slice(start, start + pageSize);

  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 400));
  return { records, total };
}

const ContractList = () => {
  // 开关：true 使用mock，false 使用真实接口
  const useMock = true;

  // 筛选条件
  const [contractKeyword, setContractKeyword] = useState('');
  const [secType, setSecType] = useState<string>('');

  // 表格数据
  const [tableData, setTableData] = useState<ContractRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const pageSize = 3;
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
        contractSymbol: contractKeyword,
        secType,
      };
      let res;
      if (useMock) {
        res = await mockContractList(params);
      } else {
        // res = await getContractList(params);
      }
      setTableData(res.records);
      setTotal(res.total);
    } catch (e) {
      message.error('合约列表加载失败');
    } finally {
      setLoading(false);
    }
  }, [pageNum, contractKeyword, secType, useMock]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

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
    { title: '合约', dataIndex: 'contractSymbol', key: 'contractSymbol' },
    { title: '类型', dataIndex: 'secType', key: 'secType' },
    { title: '交易所', dataIndex: 'exchange', key: 'exchange' },
    { title: '币种', dataIndex: 'currency', key: 'currency' },
    {
      title: '行权价',
      dataIndex: 'strikePrice',
      key: 'strikePrice',
      render: (val) => val ?? '--',
    },
    {
      title: '期权类型',
      dataIndex: 'optionType',
      key: 'optionType',
      render: (val) => val ?? '--',
    },
    {
      title: '到期日',
      dataIndex: 'expireDate',
      key: 'expireDate',
      render: (val) => val ?? '--',
    },
    { title: '代码', dataIndex: 'code', key: 'code' },
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
    <Card title={<Title level={5}>交易列表</Title>}>
      {/* 筛选区域 */}
      <Space size="large" style={{ marginBottom: 36 }}>
        <Space>
          <span>合约:</span>
          <Input
            placeholder="请输入"
            value={contractKeyword}
            onChange={e => setContractKeyword(e.target.value)}
            style={{ width: 240 }}
            allowClear
          />
        </Space>
        <Space>
          <span>类型:</span>
          <Select
            value={secType}
            onChange={(val) => {
              setSecType(val);
              setPageNum(1); // 筛选重置第一页
            }}
            placeholder="请选择类型"
            style={{ width: 240 }}
            allowClear
          >
            <Option value="STK">股票STK</Option>
            <Option value="OPT">期权OPT</Option>
          </Select>
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
      <Pagination
        style={{ marginTop: 16, textAlign: 'right' }}
        current={pageNum}
        pageSize={pageSize}
        total={total}
        onChange={(page) => setPageNum(page)}
      />

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