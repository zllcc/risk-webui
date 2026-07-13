import { Modal, Input, Button, Space, message, Spin, Typography } from 'antd';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { useCallback, useEffect, useState } from 'react';
const { Text } = Typography;
import {
  queryStrategyPage,
  updateStrategyBatch,
  StrategyItem,
  StrategyPageParams,
  StrategyUpdateParams
} from '@/api/strategyApi';

// 组件对外props
export interface StrategyModalProps {
  open: boolean;
  onCancel: () => void;
}

const StrategyConfigModal: React.FC<StrategyModalProps> = ({
  open,
  onCancel,
}) => {
  // 列表数据
  const [list, setList] = useState<StrategyItem[]>([]);
  // 请求loading
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // 拉取策略分页数据
  const fetchStrategyList = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams: StrategyPageParams = {
        pageNum: 1,
        pageSize: 100, // 一次性拉取全部可配置策略
        orderColumn: 'id',
        orderType: 'desc',
        idList: [],
        strategyName: ''
      };
      const res = await queryStrategyPage(queryParams);
      setList(res.records);
    } catch (err) {
      message.error('策略列表加载失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 弹窗打开触发接口请求
  useEffect(() => {
    if (open) {
      fetchStrategyList();
    }
  }, [open, fetchStrategyList]);

  // 新增一行空策略
  const onAddRow = () => {
    const newItem: StrategyItem = {
      id: String(Date.now()), // 前端临时生成id标识，新增条目后端会分配真实主键
      strategyName: ''
    };
    setList(prev => [...prev, newItem]);
  };

  // 删除单行策略
  const onDeleteRow = (id: string) => {
    setList(prev => prev.filter(item => item.id !== id));
  };

  // 更新单行输入框内容
  const onUpdateText = (id: string, value: string) => {
    setList(prev => prev.map(item => item.id === id ? { ...item, strategyName: value } : item));
  };

  // 保存批量提交
  const handleSave = async () => {
    // 简单校验：策略名称不能为空
    const emptyName = list.some(item => !item.strategyName.trim());
    if (emptyName) {
      message.warn('策略名称不允许为空，请补全内容');
      return;
    }
    setSaveLoading(true);
    try {
      const submitPayload: StrategyUpdateParams = {
        investmentStrategys: list.map(item => ({
          id: Number(item.id),
          strategyName: item.strategyName
        }))
      };
      await updateStrategyBatch(submitPayload);
      message.success('策略配置保存成功');
      onCancel(); // 保存成功关闭弹窗
    } catch (err) {
      message.error('策略保存失败，请重试');
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <Modal
      title={<>
        <span style={{ paddingRight: '12px' }}>策略配置</span>
      </>}
      open={open}
      footer={null}
      width={520}
      onCancel={onCancel}
    >
      <Spin spinning={loading}>
        {list.map((item) => (
          <Space key={item.id} style={{ marginTop: 10, width: '100%' }}>
            <Input
              value={item.strategyName}
              onChange={(e) => onUpdateText(item.id, e.target.value)}
              style={{ flex: 1 }}
              placeholder="填写策略名称"
            />
            <Button type="text" danger icon={<CloseOutlined />} onClick={() => onDeleteRow(item.id)} />
          </Space>
        ))}
      <Button
        type="dashed"
        block
        icon={<PlusOutlined />}
        style={{ marginTop: 16, width: 100 }}
        onClick={onAddRow}
      >新增</Button>
      </Spin>
      <Space style={{ marginTop: 20, justifyContent: 'flex-end', width: '100%' }}>
        <Button loading={saveLoading} type="primary" onClick={handleSave}>保存</Button>
        <Button onClick={onCancel}>取消</Button>
      </Space>
    </Modal>
  );
};

export default StrategyConfigModal;