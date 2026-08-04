import React, { useState, useEffect, useCallback } from 'react';
import { Card, Input, Select, Table, Pagination, Space, Button, message, Typography } from 'antd';
import type { TableProps } from 'antd';
import ContractEditModal from '@/components/ContractEditModal';
import ContractViewModal from '@/components/ContractViewModal';
import { getContractData } from '@/api/contractApi';
import { getSecTypeOptions } from '@/api/investApi';
import ImportBtnGroup from '@/components/ImportBtnGroup';

const { Title } = Typography;

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
  const [searchSymbol, setSearchSymbol] = useState('');
  const [searchShortName, setSearchShortName] = useState('');
  const [searchSecType, setSearchSecType] = useState<string | undefined>(undefined);
  const [secTypeOptions, setSecTypeOptions] = useState<{value: string; label: string}[]>([]);

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

  // 加载标的类型下拉
  useEffect(() => {
    getSecTypeOptions().then(res => {
      setSecTypeOptions(res || []);
    }).catch(() => {
      console.error('获取标的类型失败');
    });
  }, []);

  // 请求列表数据
  const fetchList = useCallback(async (symbol: string, shortName: string, secType: string, page: number) => {
    setLoading(true);
    try {
      const params = {
        pageNum: page,
        pageSize,
        symbol,
        shortName,
        secType,
      };
      const res = await getContractData(params);
      setTableData(res.records);
      setTotal(res.total);
    } catch (e) {
      message.error('标的资产列表加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 仅组件挂载时加载一次
  useEffect(() => {
    fetchList('', '', '', 1);
  }, [fetchList]);

  const handleSearch = () => {
    setPageNum(1);
    fetchList(searchSymbol, searchShortName, searchSecType ?? '', 1);
  }

  const handleReset = () => {
    setSearchSymbol('');
    setSearchShortName('');
    setSearchSecType(undefined);
    setPageNum(1);
    fetchList('', '', '', 1);
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
    fetchList(searchSymbol, searchShortName, searchSecType ?? '', pageNum);
  };

  const columns: TableProps<ContractRow>['columns'] = [
    { title: '标的资产', dataIndex: 'symbol', key: 'symbol' },
    { title: '类型', dataIndex: 'secType', key: 'secType' },
    { title: '交易所', dataIndex: 'exchange', key: 'exchange' },
    { title: '币种', dataIndex: 'currency', key: 'currency' },
    { title: '合约乘数', dataIndex: 'multiplier', key: 'multiplier',render: (val) => val ?? '--',},
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
      title={<Title level={5}>标的资产</Title>}
      extra={<ImportBtnGroup type="3" />}
    >
      {/* 筛选区域 */}
      <Space size={12} style={{ marginBottom: 18, alignItems: 'center' }} wrap>
        <span>标的资产：</span>
        <Input
          placeholder="请输入标的资产"
          value={searchSymbol}
          onChange={(e) => setSearchSymbol(e.target.value)}
          style={{ width: 180 }}
          allowClear
        />
        <span>标的资产代码：</span>
        <Input
          placeholder="请输入标的资产代码"
          value={searchShortName}
          onChange={(e) => setSearchShortName(e.target.value)}
          style={{ width: 180 }}
          allowClear
        />
        <span>标的类型：</span>
        <Select
          placeholder="请选择标的类型"
          value={searchSecType}
          onChange={(v) => setSearchSecType(v)}
          style={{ minWidth: 180 }}
          allowClear
          options={secTypeOptions}
        />
        <Button type="primary" onClick={handleSearch}>查询</Button>
        <Button onClick={handleReset}>重置</Button>
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
        onChange={(page) => {
          setPageNum(page);
          fetchList(searchSymbol, searchShortName, searchSecType ?? '', page);
        }}
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