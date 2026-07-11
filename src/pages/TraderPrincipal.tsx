import { useState, useEffect } from 'react';
import { Card, Input, InputNumber, Table, Button, Space, Typography, message } from 'antd';
import type { TableProps } from 'antd';
// 导入抽离弹窗组件
import TraderFormModal, { ModalOperateType } from '@/components/TraderFormModal';
import ChangeRecordModal, { ChangeRecordRow } from '@/components/ChangeRecordModal';
import StrategyConfigModal from '@/components/StrategyConfigModal';
import {
  createTrader,
  deleteTrader,
  queryTraderPage,
  updateTrader,
  TraderPageParams,
  TraderItem,
  TraderModifiedHistory
} from '@/api/tradeApi';
import { queryStrategyPage, StrategyItem, StrategyUpdateParams, updateStrategyBatch } from '@/api/strategyApi';

const { Title } = Typography;

// ========== 类型定义 ==========
interface MainTableRow {
  id: string;
  traderName: string;
  principal: number;
  updateTime: string;
}

export default function TraderPrincipalPage() {
  // 顶部基础信息
  const [topTrader] = useState('张三');
  const [topPrincipal, setTopPrincipal] = useState<number>(100);

  // 下方主表格数据（每条数据自带自身变更流水）
  const [mainTableData, setMainTableData] = useState<MainTableRow[]>([]);

  // 策略配置弹窗
  const [strategyModalOpen, setStrategyModalOpen] = useState(false);
  const [strategyList, setStrategyList] = useState<StrategyItem[]>([
    { id: '1', strategyName: '进攻型' },
    { id: '2', strategyName: '进攻型' },
    { id: '3', strategyName: '进攻型' },
  ]);

  // 新增/编辑表单弹窗状态
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [operateType, setOperateType] = useState<ModalOperateType>('add');
  const [modalTrader, setModalTrader] = useState('');
  const [modalPrincipal, setModalPrincipal] = useState(0);
  const [currentEditRow, setCurrentEditRow] = useState<MainTableRow | null>({ id: '', traderName: '', principal: 0, updateTime: '' });

  // 变更记录弹窗状态
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  // 分页状态
  const [pageNum, setPageNum] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // 加载交易员列表
  const fetchTraderList = async () => {
    setLoading(true);
    try {
      const params: TraderPageParams = {
        pageNum,
        pageSize,
        orderColumn: 'id',
        orderType: 'desc',
        idList: [],
        traderName: ''
      };
      const res = await queryTraderPage(params);
      // 后端records 映射前端表格数据，绑定变更记录数组
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

  useEffect(() => {
    fetchTraderList();
  }, [pageNum, pageSize]);

  const submitFormModal = async (trader: string, capital: number) => {
  if (!trader) {
    message.warn('请输入交易员名称');
    return;
  }
  if (capital <= 0) {
    message.warn('本金必须大于0');
    return;
  }
  try {
    if (operateType === 'add') {
      // 新增接口
      await createTrader({
        id: 0,
        traderName: trader,
        capital: capital
      });
      message.success('新增成功');
    } else if (operateType === 'edit' && currentEditRow) {
      // 更新接口
      await updateTrader({
        id: currentEditRow.id,
        traderName: trader,
        capital: capital
      });
      message.success('编辑成功');
    }
    setFormModalOpen(false);
    fetchTraderList(); // 刷新列表
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
          <Button type="link" size="small" onClick={() => openRecordModal(row)}>查看</Button>
          <Button type="link" size="small" onClick={() => openEditModal(row)}>编辑</Button>
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

  // 打开变更记录弹窗（查看按钮）
  const openRecordModal = (row: MainTableRow) => {
    setCurrentEditRow(row);
    setRecordModalOpen(true);
  };

  // 打开新增弹窗
  const openAddModal = () => {
    setOperateType('add');
    setCurrentEditRow(null);
    setModalTrader('');
    setModalPrincipal(0);
    setFormModalOpen(true);
  };

  // 打开编辑弹窗
  const openEditModal = (row: MainTableRow) => {
    setOperateType('edit');
    setCurrentEditRow(row);
    setModalTrader(row.traderName);
    setModalPrincipal(row.principal);
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
      {/* 顶部输入区域 */}
      <Space size={32} style={{ marginBottom: 18 }}>
        <Space>
          <span>交易员</span>
          <Input value={topTrader} disabled style={{ width: 200 }} />
        </Space>
        <Space>
          <span>本金</span>
          <InputNumber value={topPrincipal} onChange={val => setTopPrincipal(val ?? 0)} style={{ width: 200 }} min={0} />
        </Space>
      </Space>

      {/* 操作按钮区 */}
      <Space style={{ marginBottom: 10, marginLeft: 24 }}>
        <Button type="primary" onClick={openAddModal}>新增</Button>
        <Button onClick={() => setStrategyModalOpen(true)}>策略配置</Button>
      </Space>

      {/* 主数据表格 */}
      <Table
        rowKey="id"
        columns={mainTableCols}
        dataSource={mainTableData}
        pagination={false}
        bordered
        style={{ marginBottom: 22 }}
      />

      {/* 1. 新增/编辑表单弹窗 */}
      <TraderFormModal
        open={formModalOpen}
        operateType={operateType}
        traderName={modalTrader}
        principal={modalPrincipal}
        onCancel={() => setFormModalOpen(false)}
        onConfirm={submitFormModal}
        onChangeTrader={setModalTrader}
        onChangePrincipal={setModalPrincipal}
      />

      {/* 2. 变更记录弹窗（点击查看弹出） */}
      <ChangeRecordModal
        open={recordModalOpen}
        traderId={currentEditRow?.id}
        traderName={currentEditRow?.traderName}
        capital={currentEditRow?.principal}
        onCancel={() => setRecordModalOpen(false)}
      />

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