import { useState, useEffect } from 'react';
import { Card, Select, Table, Button, Space, message } from 'antd';
import type { TableProps } from 'antd';
// 导入抽离弹窗组件
import TraderFormModal from '@/components/TraderFormModal';
import ChangeRecordModal from '@/components/ChangeRecordModal';
import StrategyConfigModal from '@/components/StrategyConfigModal';
import ImportBtnGroup from '@/components/ImportBtnGroup';
import {
  createTrader,
  deleteTrader,
  queryTraderPage,
  TraderPageParams,
  updateTrader,
} from '@/api/tradeApi';
import { StrategyItem } from '@/api/strategyApi';
import { queryInvestStrategy } from '@/api/investApi';
import { getTraderSelectList, getAccountSelectList } from '@/api/accountApi';

// ========== 类型定义 ==========
interface MainTableRow {
  id: number;
  traderName: string;
  principal: number;
  strategyName: string;
  loan: number;
  interest: number;
  fee: number;
  updateTime: string;
}

export default function TraderPrincipalPage() {
  // 搜索条件（多选）
  const [searchTraderNames, setSearchTraderNames] = useState<string[]>([]);
  const [searchStrategyNames, setSearchStrategyNames] = useState<string[]>([]);
  const [searchAccountCodes, setSearchAccountCodes] = useState<string[]>([]);
  const [traderNames, setTraderNames] = useState<string[]>([]);
  const [strategyNames, setStrategyNames] = useState<string[]>([]);
  const [accountCodes, setAccountCodes] = useState<string[]>([]);

  // 交易员下拉选项
  const [traderOptions, setTraderOptions] = useState<Array<{ value: string; label: string }>>([]);
  // 账号下拉选项
  const [accountOptions, setAccountOptions] = useState<Array<{ value: string; label: string }>>([]);

  // 下方主表格数据
  const [mainTableData, setMainTableData] = useState<MainTableRow[]>([]);

  // 策略配置弹窗
  const [strategyModalOpen, setStrategyModalOpen] = useState(false);
  const [strategyList, setStrategyList] = useState<StrategyItem[]>([]);

  // 策略下拉选项
  const [strategyOptions, setStrategyOptions] = useState<Array<{ value: string; label: string }>>([]);

  // 新增/编辑表单弹窗状态
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formModalMode, setFormModalMode] = useState<'add' | 'edit'>('add');
  const [modalTrader, setModalTrader] = useState('');
  const [modalPrincipal, setModalPrincipal] = useState(0);
  const [modalStrategy, setModalStrategy] = useState('');
  const [modalLoan, setModalLoan] = useState(0);
  const [modalInterest, setModalInterest] = useState(0);
  const [modalFee, setModalFee] = useState(0);
  const [currentEditRow, setCurrentEditRow] = useState<MainTableRow | null>(null);
  const [editTraderId, setEditTraderId] = useState<number>(0);

  // 变更记录弹窗状态
  const [recordModalOpen, setRecordModalOpen] = useState(false);

  // 分页状态
  const [pageNum, setPageNum] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // 加载交易员下拉选项
  const fetchTraderOptions = async () => {
    try {
      const res = await getTraderSelectList({ accountCodes: [], traderName: '' });
      setTraderOptions(res);
    } catch (err) {
      console.error('获取交易员列表失败', err);
    }
  };

  // 加载账号下拉选项
  const fetchAccountOptions = async () => {
    try {
      const res = await getAccountSelectList('');
      setAccountOptions(res);
    } catch (err) {
      console.error('获取账号列表失败', err);
    }
  };

  // 加载交易员列表（携带搜索条件）
  const fetchTraderList = async () => {
    setLoading(true);
    try {
      const params: TraderPageParams = {
        pageNum,
        pageSize,
        orderColumn: 'id',
        orderType: 'desc',
        idList: [],
        traderNames: traderNames.length > 0 ? traderNames : undefined,
        strategyNames: strategyNames.length > 0 ? strategyNames : undefined,
        accountCodes: accountCodes.length > 0 ? accountCodes : undefined
      };
      const res = await queryTraderPage(params);
      // 后端records 映射前端表格数据
      const tableData = res.records.map(item => ({
        id: item.id,
        traderName: item.traderName,
        principal: item.capital,
        strategyName: item.strategyName,
        loan: item.loan,
        interest: item.interest,
        fee: item.fee,
        updateTime: item.modifiedTime,
      }));
      setMainTableData(tableData);
      setTotal(res.total);
    } catch (err) {
      message.error('加载交易员列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载策略下拉选项
  const fetchStrategyOptions = async () => {
    try {
      const res = await queryInvestStrategy('');
      setStrategyOptions(res);
    } catch (err) {
      console.error('获取策略列表失败', err);
    }
  };

  // 分页、搜索条件变更自动刷新
  useEffect(() => {
    fetchTraderList();
    fetchStrategyOptions();
    fetchTraderOptions();
    fetchAccountOptions();
  }, [pageNum, pageSize, traderNames, strategyNames, accountCodes]);

  // 查询按钮：重置到第一页，触发接口请求
  const handleSearch = () => {
    setPageNum(1);
    setTraderNames(searchTraderNames);
    setStrategyNames(searchStrategyNames);
    setAccountCodes(searchAccountCodes);
  };

  // 重置按钮：清空搜索框，回到第一页
  const handleReset = () => {
    setSearchTraderNames([]);
    setSearchStrategyNames([]);
    setSearchAccountCodes([]);
    setTraderNames([]);
    setStrategyNames([]);
    setAccountCodes([]);
    setPageNum(1);
  };

  // 新增/编辑弹窗提交
  const submitFormModal = async (trader: string, capital: number, strategy: string, loan: number, interest: number, fee: number) => {
    if (!trader) {
      message.warning('请输入交易员名称');
      return;
    }
    if (capital <= 0) {
      message.warning('本金必须大于0');
      return;
    }
    try {
      if (formModalMode === 'add') {
        await createTrader({
          traderName: trader,
          capital: capital,
          strategyName: strategy,
          loan: loan,
          interest: interest,
          fee: fee
        });
        message.success('新增成功');
      } else {
        await updateTrader({
          id: editTraderId,
          traderName: trader,
          capital: capital,
          strategyName: strategy,
          loan: loan,
          interest: interest,
          fee: fee
        });
        message.success('编辑成功');
      }
      setFormModalOpen(false);
      fetchTraderList();
    } catch (err) {
      message.error('操作失败，请重试');
    }
  };

  // ========== 表格列配置 ==========
  const mainTableCols: TableProps<MainTableRow>['columns'] = [
    { title: '交易员', dataIndex: 'traderName' },
    { title: '本金', dataIndex: 'principal', render: (val: number) => val?.toLocaleString() ?? 0 },
    { title: '策略', dataIndex: 'strategyName' },
    { title: '贷款', dataIndex: 'loan', render: (val: number) => val?.toLocaleString() ?? 0 },
    { title: '利息', dataIndex: 'interest', render: (val: number) => val?.toLocaleString() ?? 0 },
    { title: '费用', dataIndex: 'fee', render: (val: number) => val?.toLocaleString() ?? 0 },
    { title: '更新时间', dataIndex: 'updateTime' },
    {
      title: '操作',
      key: 'action',
      width: 260,
      render: (_record, row) => (
        <Space>
          <Button type="link" size="small" onClick={() => openRecordModal(row)}>查看</Button>
          <Button type="link" size="small" onClick={() => openEditModal(row)}>编辑</Button>
          <Button
            type="link"
            size="small"
            danger
            onClick={async () => {
              await deleteTrader({ id: row.id });
              message.success('删除成功');
              fetchTraderList();
            }}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  // 打开变更记录弹窗（查看模式）
  const openRecordModal = (row: MainTableRow) => {
    setCurrentEditRow(row);
    setRecordModalOpen(true);
  };

  // 打开编辑弹窗
  const openEditModal = (row: MainTableRow) => {
    setFormModalMode('edit');
    setEditTraderId(row.id);
    setModalTrader(row.traderName);
    setModalPrincipal(row.principal);
    setModalStrategy(row.strategyName);
    setModalLoan(row.loan);
    setModalInterest(row.interest);
    setModalFee(row.fee);
    setFormModalOpen(true);
  };

  // 打开新增弹窗
  const openAddModal = () => {
    setFormModalMode('add');
    setEditTraderId(0);
    setCurrentEditRow(null);
    setModalTrader('');
    setModalPrincipal(0);
    setModalStrategy('');
    setModalLoan(0);
    setModalInterest(0);
    setModalFee(0);
    setFormModalOpen(true);
  };

  // ========== 策略弹窗交互 ==========
  const addStrategyRow = () => {
    setStrategyList(prev => [...prev, { id: crypto.randomUUID(), strategyName: '' }]);
  };
  const delStrategyRow = (rowId: string) => {
    setStrategyList(prev => prev.filter(item => item.id !== rowId));
  };
  const updateStrategyText = (rowId: string, val: string) => {
    setStrategyList(prev => prev.map(item => item.id === rowId ? { ...item, strategyName: val } : item));
  };

  return (
    <Card title="交易员本金配置" extra={<ImportBtnGroup type="5" onSuccess={fetchTraderList} />}>
      {/* 顶部搜索区域 */}
      <Space size={12} style={{ marginBottom: 18, alignItems: 'center' }}>
        <span>账号：</span>
        <Select
          mode="multiple"
          placeholder="请选择账号"
          value={searchAccountCodes}
          onChange={(val) => setSearchAccountCodes(val)}
          style={{ minWidth: 220 }}
          options={accountOptions}
          allowClear
        />
        <span>交易员：</span>
        <Select
          mode="multiple"
          placeholder="请选择交易员"
          value={searchTraderNames}
          onChange={(val) => setSearchTraderNames(val)}
          style={{ minWidth: 220 }}
          options={traderOptions}
          allowClear
        />
        <span>策略：</span>
        <Select
          mode="multiple"
          placeholder="请选择策略"
          value={searchStrategyNames}
          onChange={(val) => setSearchStrategyNames(val)}
          style={{ minWidth: 220 }}
          options={strategyOptions}
          allowClear
        />
        <Button type="primary" onClick={handleSearch}>查询</Button>
        <Button onClick={handleReset}>重置</Button>
      </Space>

      {/* 操作按钮区：左右两端对齐，按钮居右 */}
      <Space
        style={{
          marginBottom: 10,
          width: '100%',
          justifyContent: 'flex-end'
        }}
      >
        <Button type="primary" onClick={openAddModal}>新增</Button>
        <Button onClick={() => setStrategyModalOpen(true)}>策略配置</Button>
      </Space>

      {/* 主数据表格 + 分页 */}
      <Table
        rowKey="id"
        columns={mainTableCols}
        dataSource={mainTableData}
        loading={loading}
        bordered
        style={{ marginBottom: 22 }}
        pagination={{
          current: pageNum,
          pageSize,
          total,
          onChange: (page) => setPageNum(page),
          showTotal: (totalNum) => `共 ${totalNum} 条`
        }}
      />

      {/* 1. 新增/编辑表单弹窗 */}
      <TraderFormModal
        open={formModalOpen}
        mode={formModalMode}
        traderName={modalTrader}
        principal={modalPrincipal}
        strategyName={modalStrategy}
        loan={modalLoan}
        interest={modalInterest}
        fee={modalFee}
        strategyOptions={strategyOptions}
        onCancel={() => setFormModalOpen(false)}
        onConfirm={submitFormModal}
        onChangeTrader={setModalTrader}
        onChangePrincipal={setModalPrincipal}
        onChangeStrategy={setModalStrategy}
        onChangeLoan={setModalLoan}
        onChangeInterest={setModalInterest}
        onChangeFee={setModalFee}
      />

      {/* 查看变更记录弹窗 */}
      {currentEditRow && (
        <ChangeRecordModal
          open={recordModalOpen}
          traderId={currentEditRow.id}
          traderName={currentEditRow.traderName}
          capital={currentEditRow.principal}
          strategyName={currentEditRow.strategyName}
          loan={currentEditRow.loan}
          interest={currentEditRow.interest}
          fee={currentEditRow.fee}
          onCancel={() => setRecordModalOpen(false)}
          fetchTraderList={() => fetchTraderList()}
        />
      )}

      {/* 3. 策略配置弹窗 */}
      <StrategyConfigModal
        open={strategyModalOpen}
        list={strategyList}
        onCancel={() => setStrategyModalOpen(false)}
        onAddRow={addStrategyRow}
        onDeleteRow={delStrategyRow}
        onUpdateText={updateStrategyText}
      />
    </Card>
  );
}