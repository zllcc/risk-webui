import { useState, useEffect } from 'react';
import { Card, Select, Table, Button, Space, message, DatePicker } from 'antd';
import dayjs from 'dayjs';
import type { TableProps } from 'antd';
// 导入抽离弹窗组件
import TraderFormModal from '@/components/TraderFormModal';
import ChangeRecordModal from '@/components/ChangeRecordModal';
import StrategyConfigModal from '@/components/StrategyConfigModal';
import ImportBtnGroup from '@/components/ImportBtnGroup';
import {
  createTrader,
  deleteTrader,
  getTraderCapitalDetail,
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
  accountCode: string;
  principal: number;
  strategyName: string;
  loan: number;
  capitalInterest: number;
  loanInterest: number;
  fee: number;
  dailyDate: string;
  updateTime: string;
}

export default function TraderPrincipalPage() {
  // 搜索条件（多选）
  const [searchTraderNames, setSearchTraderNames] = useState<string[]>([]);
  const [searchStrategyNames, setSearchStrategyNames] = useState<string[]>([]);
  const [searchAccountCodes, setSearchAccountCodes] = useState<string[]>([]);
  const [searchDailyDate, setSearchDailyDate] = useState<string>('');
  const [traderNames, setTraderNames] = useState<string[]>([]);
  const [strategyNames, setStrategyNames] = useState<string[]>([]);
  const [accountCodes, setAccountCodes] = useState<string[]>([]);
  const [dailyDate, setDailyDate] = useState<string>('');

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
  const [modalAccount, setModalAccount] = useState('');
  const [modalPrincipal, setModalPrincipal] = useState(0);
  const [modalStrategy, setModalStrategy] = useState('');
  const [modalLoan, setModalLoan] = useState(0);
  const [modalCapitalInterest, setModalCapitalInterest] = useState(0);
  const [modalLoanInterest, setModalLoanInterest] = useState(0);
  const [modalFee, setModalFee] = useState(0);
  const [modalDate, setModalDate] = useState('');
  const [currentEditRow, setCurrentEditRow] = useState<MainTableRow | null>(null);
  const [editTraderId, setEditTraderId] = useState<number>(0);
  // 新增模式下，detail 接口返回的记录 id（>0 表示已有记录，确认时走 update；否则走 add）
  const [modalDetailId, setModalDetailId] = useState<number>(0);

  // 变更记录弹窗状态
  const [recordModalOpen, setRecordModalOpen] = useState(false);

  // 分页状态 pageSize改为state，支持手动输入
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTrigger, setSearchTrigger] = useState(0);

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
        accountCodes: accountCodes.length > 0 ? accountCodes : undefined,
        dailyDate: dailyDate || undefined
      };
      const res = await queryTraderPage(params);
      // 后端records 映射前端表格数据
      const tableData = res.records.map(item => ({
        id: item.id,
        traderName: item.traderName,
        accountCode: item.accountCode ?? '',
        principal: item.capital,
        strategyName: item.strategyName,
        loan: item.loan,
        capitalInterest: item.capitalInterest ?? item.interest ?? 0,
        loanInterest: item.loanInterest ?? 0,
        fee: item.fee,
        dailyDate: item.dailyDate ?? '',
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

  // 首次挂载加载一次下拉选项
  useEffect(() => {
    fetchStrategyOptions();
    fetchTraderOptions();
    fetchAccountOptions();
  }, []);

  // 搜索条件或分页变化时刷新列表；searchTrigger 保证查询/重置按钮总能触发请求
  useEffect(() => {
    fetchTraderList();
  }, [pageNum, pageSize, traderNames, strategyNames, accountCodes, dailyDate, searchTrigger]);

  // 查询按钮：同步搜索条件、回到第一页、强制触发请求
  const handleSearch = () => {
    setPageNum(1);
    setTraderNames(searchTraderNames);
    setStrategyNames(searchStrategyNames);
    setAccountCodes(searchAccountCodes);
    setDailyDate(searchDailyDate);
    setSearchTrigger(t => t + 1);
  };

  // 重置按钮：清空搜索框、回到第一页、强制触发请求
  const handleReset = () => {
    setSearchTraderNames([]);
    setSearchStrategyNames([]);
    setSearchAccountCodes([]);
    setSearchDailyDate('');
    setTraderNames([]);
    setStrategyNames([]);
    setAccountCodes([]);
    setDailyDate('');
    setPageNum(1);
    setSearchTrigger(t => t + 1);
  };

  // 新增/编辑弹窗提交
  const submitFormModal = async (trader: string, accountCode: string, capital: number, strategy: string, loan: number, capitalInterest: number, loanInterest: number, fee: number, dailyDate: string) => {
    if (!dailyDate) {
      message.warning('请选择日期');
      return;
    }
    if (!trader) {
      message.warning('请输入交易员名称');
      return;
    }
    if (!accountCode) {
      message.warning('请输入或选择账号');
      return;
    }
    if (!strategy) {
      message.warning('请输入策略名称');
      return;
    }
    // if (capital <= 0) {
    //   message.warning('本金必须大于0');
    //   return;
    // }
    try {
      if (formModalMode === 'add') {
        // 新增模式下：若 detail 接口已返回记录 id，则走 update；否则走 add
        if (modalDetailId > 0) {
          await updateTrader({
            id: modalDetailId,
            traderName: trader,
            accountCode: accountCode || undefined,
            capital: capital,
            strategyName: strategy,
            loan: loan,
            capitalInterest: capitalInterest,
            loanInterest: loanInterest,
            fee: fee,
            dailyDate: dailyDate
          });
          message.success('编辑成功');
        } else {
          await createTrader({
            traderName: trader,
            accountCode: accountCode || undefined,
            capital: capital,
            strategyName: strategy,
            loan: loan,
            capitalInterest: capitalInterest,
            loanInterest: loanInterest,
            fee: fee,
            dailyDate: dailyDate
          });
          message.success('新增成功');
        }
      } else {
        await updateTrader({
          id: editTraderId,
          traderName: trader,
          accountCode: accountCode || undefined,
          capital: capital,
          strategyName: strategy,
          loan: loan,
          capitalInterest: capitalInterest,
          loanInterest: loanInterest,
          fee: fee,
          dailyDate: dailyDate
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
    { title: '日期', dataIndex: 'dailyDate' },
    { title: '交易员', dataIndex: 'traderName' },
    { title: '账号', dataIndex: 'accountCode' },
    { title: '策略', dataIndex: 'strategyName' },
    { title: '本金', dataIndex: 'principal', render: (val: number) => val ?? 0 },
    { title: '本金利息', dataIndex: 'capitalInterest', render: (val: number) => val ?? 0 },
    { title: '贷款', dataIndex: 'loan', render: (val: number) => val ?? 0 },
    { title: '贷款利息', dataIndex: 'loanInterest', render: (val: number) => val ?? 0 },
    { title: '费用', dataIndex: 'fee', render: (val: number) => val ?? 0 },
    { title: '更新时间', dataIndex: 'updateTime' },
    {
      title: '操作',
      key: 'action',
      width: 260,
      render: (_record, row) => (
        <Space>
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
    setModalAccount(row.accountCode ?? '');
    setModalPrincipal(row.principal);
    setModalStrategy(row.strategyName);
    setModalLoan(row.loan);
    setModalCapitalInterest(row.capitalInterest);
    setModalLoanInterest(row.loanInterest);
    setModalFee(row.fee);
    setModalDate(row.dailyDate);
    setModalDetailId(0);
    setFormModalOpen(true);
  };

  // 打开新增弹窗
  const openAddModal = () => {
    setFormModalMode('add');
    setEditTraderId(0);
    setCurrentEditRow(null);
    setModalTrader('');
    setModalAccount('');
    setModalPrincipal(0);
    setModalStrategy('');
    setModalLoan(0);
    setModalCapitalInterest(0);
    setModalLoanInterest(0);
    setModalFee(0);
    setModalDate('');
    setModalDetailId(0);
    setFormModalOpen(true);
  };

  // 新增模式下，日期/交易员/账号/策略四项齐全时，自动调用 detail 接口填充本金等字段
  // 任一项被清空时，将本金/本金利息/贷款/贷款利息/费用重置为默认值 0
  useEffect(() => {
    // 仅在弹窗打开且为新增模式时触发
    if (!formModalOpen || formModalMode !== 'add') return;
    // 四项任一为空：重置金额类字段为 0，并清空已绑定记录 id
    if (!modalDate || !modalTrader || !modalAccount || !modalStrategy) {
      setModalPrincipal(0);
      setModalLoan(0);
      setModalCapitalInterest(0);
      setModalLoanInterest(0);
      setModalFee(0);
      setModalDetailId(0);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await getTraderCapitalDetail({
          traderName: modalTrader,
          accountCode: modalAccount,
          strategyName: modalStrategy,
          dailyDate: modalDate
        });
        if (cancelled) return;
        // 记录 detail 返回的 id，确认时若存在则走 update，否则走 add
        setModalDetailId(res.id ?? 0);
        setModalPrincipal(res.capital ?? 0);
        setModalLoan(res.loan ?? 0);
        setModalCapitalInterest(res.capitalInterest ?? res.interest ?? 0);
        setModalLoanInterest(res.loanInterest ?? 0);
        setModalFee(res.fee ?? 0);
      } catch (err) {
        // 静默失败，不打断用户输入
        console.error('自动填充本金详情失败', err);
      }
    })();
    return () => { cancelled = true; };
  }, [formModalOpen, formModalMode, modalDate, modalTrader, modalAccount, modalStrategy]);

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
        <span>日期：</span>
        <DatePicker
          value={searchDailyDate ? dayjs(searchDailyDate) : null}
          onChange={(_, dateStr) => setSearchDailyDate(dateStr as string)}
          placeholder="请选择日期"
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
          showSizeChanger: true,
          pageSizeOptions: ['10','20','50','100','200'],
          onChange: (page, size) => {
            setPageNum(page);
            setPageSize(size);
          },
          showTotal: (totalNum) => `共 ${totalNum} 条`
        }}
      />

      {/* 1. 新增/编辑表单弹窗 */}
      <TraderFormModal
        open={formModalOpen}
        mode={formModalMode}
        traderName={modalTrader}
        accountCode={modalAccount}
        principal={modalPrincipal}
        strategyName={modalStrategy}
        loan={modalLoan}
        capitalInterest={modalCapitalInterest}
        loanInterest={modalLoanInterest}
        fee={modalFee}
        dailyDate={modalDate}
        traderOptions={traderOptions}
        accountOptions={accountOptions}
        strategyOptions={strategyOptions}
        onCancel={() => setFormModalOpen(false)}
        onConfirm={submitFormModal}
        onChangeTrader={setModalTrader}
        onChangeAccount={setModalAccount}
        onChangePrincipal={setModalPrincipal}
        onChangeStrategy={setModalStrategy}
        onChangeLoan={setModalLoan}
        onChangeCapitalInterest={setModalCapitalInterest}
        onChangeLoanInterest={setModalLoanInterest}
        onChangeFee={setModalFee}
        onChangeDate={setModalDate}
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
          interest={currentEditRow.capitalInterest}
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