import { Modal, Table, Spin, message, Input, InputNumber, Space, Button } from 'antd';
import type { TableProps } from 'antd';
import { useEffect, useState, useCallback } from 'react';
import { getTraderDetail, TraderOperateParams, updateTrader } from '@/api/tradeApi';

export interface ChangeRecordRow {
  oldTrader: string;
  oldPrincipal: number;
  newTrader: string;
  newPrincipal: number;
  changeDate: string;
}

// 弹窗操作类型：查看只读 / 编辑可修改
export type RecordModalMode = 'view' | 'edit';

interface ChangeRecordModalProps {
  open: boolean;
  mode: RecordModalMode;
  // 请求详情接口参数
  traderId: number;
  traderName: string;
  capital: number;
  onCancel: () => void;
  // 父页面执行更新接口后刷新列表
  fetchTraderList: () => void;
}

const ChangeRecordModal: React.FC<ChangeRecordModalProps> = ({
  open,
  mode,
  traderId,
  traderName,
  capital,
  onCancel,
  fetchTraderList,
}) => {
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [recordList, setRecordList] = useState<ChangeRecordRow[]>([]);
  // 弹窗内可编辑的最新交易员、本金（顶部输入框绑定）
  const [editTrader, setEditTrader] = useState(traderName);
  const [editCapital, setEditCapital] = useState(capital);

  // 调用更新交易员接口
  const handleTraderUpdate = async () => {
    await updateTrader({
      id: traderId,
      traderName: editTrader,
      capital: editCapital
    });
    fetchTraderList();
  };

  // 表格列配置：全部只读，仅展示历史变更记录
  const columns: TableProps<ChangeRecordRow>['columns'] = [
    { title: '原交易员', dataIndex: 'oldTrader' },
    { title: '原本金', dataIndex: 'oldPrincipal' },
    { title: '现交易员', dataIndex: 'newTrader' },
    { title: '现本金', dataIndex: 'newPrincipal' },
    { title: '变更日期', dataIndex: 'changeDate' },
  ];

  // 请求交易员详情接口，加载变更历史
  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const params: TraderOperateParams = {
        id: traderId,
        traderName,
        capital,
      };
      const res = await getTraderDetail(params);
      const list: ChangeRecordRow[] = res.modifiedHistoryList.map((item) => ({
        oldTrader: item.orgTraderName,
        oldPrincipal: item.orgCapital,
        newTrader: item.currentTraderName,
        newPrincipal: item.currentCapital,
        changeDate: item.modifiedTime,
      }));
      setEditTrader(res.traderName);
      setEditCapital(res.capital);
      setRecordList(list);
    } catch (err) {
      message.error('获取变更记录失败');
      console.error('获取详情报错：', err);
      setRecordList([]);
    } finally {
      setLoading(false);
    }
  }, [traderId, traderName, capital]);

  // 弹窗打开加载数据，关闭清空缓存
  useEffect(() => {
    if (open && traderId) {
      fetchDetail();
    }
    if (!open) {
      setRecordList([]);
      setEditTrader('');
      setEditCapital(0);
    }
  }, [open, fetchDetail, traderId]);

  // 保存按钮点击事件
  const handleSave = async () => {
    if (!editTrader.trim()) {
      message.warning('请填写交易员名称');
      return;
    }
    if (editCapital <= 0) {
      message.warning('本金必须大于0');
      return;
    }
    setSaveLoading(true);
    try {
      await handleTraderUpdate();
      message.success('修改保存成功');
      onCancel();
    } catch (err) {
      message.error('保存失败，请重试');
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <Modal
      title={mode === 'edit' ? '编辑交易员' : '查看变更记录'}
      open={open}
      onCancel={onCancel}
      width={750}
      footer={mode === 'edit' ? (
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" loading={saveLoading} onClick={handleSave}>保存</Button>
        </Space>
      ) : null}
    >
      {/* 顶部：当前交易员、本金区域，区分查看/编辑模式 */}
      <Space size={32} style={{ marginBottom: 16, alignItems: 'center' }}>
        <Space style={{ alignItems: 'center' }}>
          <span style={{ fontWeight: 500, width: 80 }}>当前交易员：</span>
          {mode === 'edit' ? (
            <Input
              value={editTrader}
              onChange={(e) => setEditTrader(e.target.value)}
              placeholder="输入交易员名称"
              style={{ width: 180 }}
            />
          ) : (
            <span>{editTrader || '-'}</span>
          )}
        </Space>
        <Space style={{ alignItems: 'center' }}>
          <span style={{ fontWeight: 500, width: 80 }}>当前本金：</span>
          {mode === 'edit' ? (
            <InputNumber
              min={0}
              value={editCapital}
              onChange={(val) => setEditCapital(val ?? 0)}
              placeholder="输入本金"
              style={{ width: 180 }}
            />
          ) : (
            <span>{editCapital}</span>
          )}
        </Space>
      </Space>

      <Spin spinning={loading}>
        <Table
          rowKey="changeDate"
          columns={columns}
          dataSource={recordList}
          pagination={false}
          bordered
        />
      </Spin>
    </Modal>
  );
};

export default ChangeRecordModal;