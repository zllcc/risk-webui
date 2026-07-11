import { useState, useEffect } from 'react';
import { Card, Input, Table, Button, Space, message } from 'antd';
import type { TableProps } from 'antd';
// 导入抽离弹窗组件
import TraderFormModal from '@/components/TraderFormModal';
import ChangeRecordModal from '@/components/ChangeRecordModal';
import StrategyConfigModal from '@/components/StrategyConfigModal';
import {
  createTrader,
  deleteTrader,
  queryTraderPage,
  TraderPageParams,
} from '@/api/tradeApi';
import { StrategyItem } from '@/api/strategyApi';

// ========== 类型定义 ==========
interface MainTableRow {
  id: number;
  traderName: string;
  principal: number;
  updateTime: string;
}

export default function TraderPrincipalPage() {
  // 搜索条件：交易员名称（传给接口traderName）
  const [searchTraderName, setSearchTraderName] = useState('');
  const [traderName, setTraderName] = useState('');

  // 下方主表格数据
  const [mainTableData, setMainTableData] = useState<MainTableRow[]>([]);

  // 策略配置弹窗
  const [strategyModalOpen, setStrategyModalOpen] = useState(false);
  const [strategyList, setStrategyList] = useState<StrategyItem[]>([]);

  // 新增/编辑表单弹窗状态
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [modalTrader, setModalTrader] = useState('');
  const [modalPrincipal, setModalPrincipal] = useState(0);
  const [currentEditRow, setCurrentEditRow] = useState<MainTableRow | null>(null);

  // 变更记录弹窗状态
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [recordMode, setRecordMode] = useState<'view' | 'edit'>('view');

  // 分页状态
  const [pageNum, setPageNum] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // 加载交易员列表（携带搜索条件traderName）
  const fetchTraderList = async () => {
    setLoading(true);
    try {
      const params: TraderPageParams = {
        pageNum,
        pageSize,
        orderColumn: 'id',
        orderType: 'desc',
        idList: [],
        traderName: searchTraderName // 搜索条件传给后端对应字段
      };
      const res = await queryTraderPage(params);
      // 后端records 映射前端表格数据
      const tableData = res.records.map(item => ({
        id: item.id,
        traderName: item.traderName,
        principal: item.capital,
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

  // 分页、搜索条件变更自动刷新
  useEffect(() => {
    fetchTraderList();
  }, [pageNum, pageSize, traderName]);

  // 查询按钮：重置到第一页，触发接口请求
  const handleSearch = () => {
    setPageNum(1);
    setTraderName(searchTraderName);
  };

  // 重置按钮：清空搜索框，回到第一页
  const handleReset = () => {
    setSearchTraderName('');
    setTraderName('');
    setPageNum(1);
  };

  // 新增弹窗提交
  const submitFormModal = async (trader: string, capital: number) => {
    if (!trader) {
      message.warning('请输入交易员名称');
      return;
    }
    if (capital <= 0) {
      message.warning('本金必须大于0');
      return;
    }
    try {
      await createTrader({
        id: 0,
        traderName: trader,
        capital: capital
      });
      message.success('新增成功');
      setFormModalOpen(false);
      fetchTraderList();
    } catch (err) {
      message.error('操作失败，请重试');
    }
  };

  // ========== 表格列配置 ==========
  const mainTableCols: TableProps<MainTableRow>['columns'] = [
    { title: '交易员', dataIndex: 'traderName' },
    { title: '本金', dataIndex: 'principal' },
    { title: '更新时间', dataIndex: 'updateTime' },
    {
      title: '操作',
      key: 'action',
      width: 260,
      render: (_record, row) => (
        <Space>
          <Button type="link" size="small" onClick={() => openRecordModal(row, 'view')}>查看</Button>
          <Button type="link" size="small" onClick={() => openRecordModal(row, 'edit')}>编辑</Button>
          <Button
            type="link"
            size="small"
            danger
            onClick={async () => {
              await deleteTrader({
                id: row.id,
                traderName: row.traderName,
                capital: row.principal
              });
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

  // 打开变更记录弹窗（查看｜编辑）
  const openRecordModal = (row: MainTableRow, mode: 'view' | 'edit') => {
    setRecordMode(mode);
    setCurrentEditRow(row);
    setRecordModalOpen(true);
  };

  // 打开新增弹窗
  const openAddModal = () => {
    setCurrentEditRow(null);
    setModalTrader('');
    setModalPrincipal(0);
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
    <Card title="交易员本金配置">
      {/* 顶部搜索区域 */}
      <Space size={12} style={{ marginBottom: 18, alignItems: 'center' }}>
        <span>交易员：</span>
        <Input
          placeholder="请输入交易员名称搜索"
          value={searchTraderName}
          onChange={(e) => setSearchTraderName(e.target.value)}
          style={{ width: 240 }}
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
        traderName={modalTrader}
        principal={modalPrincipal}
        onCancel={() => setFormModalOpen(false)}
        onConfirm={submitFormModal}
        onChangeTrader={setModalTrader}
        onChangePrincipal={setModalPrincipal}
      />

      {/* 查看/编辑共用变更记录弹窗 */}
      {currentEditRow && (
        <ChangeRecordModal
          open={recordModalOpen}
          mode={recordMode}
          traderId={currentEditRow.id}
          traderName={currentEditRow.traderName}
          capital={currentEditRow.principal}
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