import React, { useState, useEffect } from 'react';
import { Modal, Input, Space, Button, message, Spin } from 'antd';
import { ContractRow } from '@/pages/ContractList';
import { updateContractCode } from '@/api/contractApi';

interface Props {
  open: boolean;
  detail: ContractRow | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const ContractEditModal: React.FC<Props> = ({ open, detail, onCancel, onSuccess }) => {
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editCode, setEditCode] = useState('');

  // 弹窗打开回填数据
  useEffect(() => {
    if (open && detail) {
      setEditCode(detail.code);
    } else {
      setEditCode('');
    }
  }, [open, detail]);

  const handleSubmit = async () => {
    if (!detail || !editCode.trim()) {
      message.warning('代码不能为空');
      return;
    }
    setSubmitLoading(true);
    try {
      await updateContractCode({ id: detail.id, code: editCode.trim() });
      message.success('修改成功');
      onSuccess();
    } catch (e) {
      message.error('修改失败，请重试');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Modal
      title="编辑合约"
      open={open}
      maskClosable={false}
      confirmLoading={submitLoading}
      footer={
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" loading={submitLoading} onClick={handleSubmit}>确定</Button>
        </Space>
      }
    >
      <Spin spinning={!detail}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space>
            <span>合约：</span>
            <Input value={detail?.contractSymbol} disabled style={{ width: 300 }} />
          </Space>
          <Space>
            <span>类型：</span>
            <Input value={detail?.secType} disabled style={{ width: 300 }} />
          </Space>
          <Space>
            <span>代码：</span>
            <Input
              value={editCode}
              onChange={e => setEditCode(e.target.value)}
              style={{ width: 300 }}
              placeholder="请填写代码"
            />
          </Space>
        </Space>
      </Spin>
    </Modal>
  );
};

export default ContractEditModal;