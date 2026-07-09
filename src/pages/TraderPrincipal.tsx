import { useState } from 'react';
import { Card, Input, InputNumber, Table, Button, Space, Typography } from 'antd';
import type { TableProps } from 'antd';
// 导入抽离弹窗组件
import TraderFormModal, { ModalOperateType } from '@/components/TraderFormModal';
import ChangeRecordModal, { ChangeRecordRow } from '@/components/ChangeRecordModal';
import StrategyConfigModal, { StrategyItem } from '@/components/StrategyConfigModal';

const { Title } = Typography;

// ========== 类型定义 ==========
interface MainTableRow {
  id: string;
  traderName: string;
  principal: number;
  updateTime: string;
  // 绑定本条数据对应的所有变更记录
  recordList: ChangeRecordRow[];
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
  const [currentEditRow, setCurrentEditRow] = useState<MainTableRow | null>(null);

  // 变更记录弹窗状态
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [showRecordList, setShowRecordList] = useState<ChangeRecordRow[]>([]);

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
          <Button type="link" size="small" danger onClick={() => {
            setMainTableData(prev => prev.filter(item => item.id !== row.id));
          }}>删除</Button>
        </Space>
      )
    }
  ];

  // 打开变更记录弹窗（查看按钮）
  const openRecordModal = (row: MainTableRow) => {
    setShowRecordList(row.recordList);
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

  // 表单弹窗确认提交
  const submitFormModal = (trader: string, principal: number) => {
    const now = new Date().toLocaleString();
    if (operateType === 'add') {
      // 新增数据，初始化空变更记录
      const newRow: MainTableRow = {
        id: crypto.randomUUID(),
        traderName: trader,
        principal: principal,
        updateTime: now,
        recordList: [
          {
            oldTrader: '-',
            oldPrincipal: 0,
            newTrader: trader,
            newPrincipal: principal,
            changeDate: now
          }
        ]
      };
      setMainTableData(prev => [...prev, newRow]);
    }
    if (operateType === 'edit' && currentEditRow) {
      // 编辑，追加一条变更记录
      const newRecord: ChangeRecordRow = {
        oldTrader: currentEditRow.traderName,
        oldPrincipal: currentEditRow.principal,
        newTrader: trader,
        newPrincipal: principal,
        changeDate: now
      };
      setMainTableData(prev => prev.map(item => {
        if (item.id === currentEditRow.id) {
          return {
            ...item,
            traderName: trader,
            principal: principal,
            updateTime: now,
            recordList: [...item.recordList, newRecord]
          };
        }
        return item;
      }));
    }
    setFormModalOpen(false);
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
      <Space style={{ marginBottom: 10 }}>
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
        recordList={showRecordList}
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