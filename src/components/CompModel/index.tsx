import React, { useState } from 'react';
import { Modal, Typography, Button, Divider } from 'antd';
import { PlusOutlined, MinusOutlined, CheckCircleFilled } from '@ant-design/icons';
import styles from './index.module.less';

const { Text } = Typography;

// 字段类型
interface FieldItem {
  key: string;
  label: string;
  desc: string;
}

// 初始已选（上方红色）
const initSelected: FieldItem[] = [
  {
    key: 'attribution',
    label: '收益归因',
    desc: '拆解组合收益来源，量化板块配置与个股选择对整体业绩的贡献度。',
  },
  {
    key: 'attrRanking',
    label: '归因排名',
    desc: '对各维度收益归因结果进行横向对比，实现标的与板块的绩效排名分析。',
  },
  {
    key: 'concentration',
    label: '集中度风险',
    desc: '统计持仓、板块与品类权重分布，识别资产集中带来的单一风险敞口。',
  },
  {
    key: 'quantitativeRisk',
    label: '量化风险指标',
    desc: '汇总组合多维风险数据，通过多项风控指标量化整体风险水平与波动特征。',
  },
  {
    key: 'greek',
    label: '衍生品希腊敞口总览',
    desc: '通通过 Delta、Gamma、Vega、Theta 量化衍生品整体敞口与敏感性风险。',
  },
  {
    key: 'riskReward',
    label: '风险收益绩效比',
    desc: '通过夏普、索提诺、卡玛等比率，综合评估组合风险性价比与盈利质量。',
  },
];

// 初始可用（下方绿色）
const initAvailable: FieldItem[] = [];

type Props = {
  open: boolean;
  onCancel: () => void;
  onOk: (params: any) => void
};

const ComponotsModel: React.FC<Props> = ({ open, onCancel, onOk }) => {
  const [selectedList, setSelectedList] = useState<FieldItem[]>(initSelected);
  const [availableList, setAvailableList] = useState<FieldItem[]>(initAvailable);

  // 点击已选条目 → 移动到可用
  const moveToAvailable = (targetKey: string) => {
    const targetItem = selectedList.find(item => item.key === targetKey);
    if (!targetItem) return;
    const newSelected = selectedList.filter(item => item.key !== targetKey);
    const newAvailable = [...availableList, targetItem];
    setSelectedList(newSelected);
    setAvailableList(newAvailable);
  };

  // 点击可用条目 → 移动到已选
  const moveToSelected = (targetKey: string) => {
    const targetItem = availableList.find(item => item.key === targetKey);
    if (!targetItem) return;
    const newAvailable = availableList.filter(item => item.key !== targetKey);
    const newSelected = [...selectedList, targetItem];
    setAvailableList(newAvailable);
    setSelectedList(newSelected);
  };

  // 保存回调
  const handleSave = () => {
    const selectKeys = selectedList.map(i => i.key);
    console.log('最终选中字段', selectKeys);
    onOk({ selectedKeys: selectKeys });
  };

  // 渲染单行条目
  const renderItem = (
    item: FieldItem,
    dotColorIcon: React.ReactNode,
    isSelected: boolean,
  ) => (
    <div
      key={item.key}
      className={styles.listItem}
    >
      {dotColorIcon}
      <div className={styles.itemContent}>
        <Text strong className={styles.itemLabel}>{item.label}</Text>
        <div className={styles.itemDesc}>
          {item.desc}
        </div>
      </div>
      {/* hover才显示操作按钮 */}
      <div
        className={styles.actionBtn}
        onClick={(e) => {
          e.stopPropagation();
          isSelected ? moveToAvailable(item.key) : moveToSelected(item.key);
        }}
      >
        {isSelected ? <MinusOutlined /> : <PlusOutlined />}
      </div>
    </div>
  );

  return (
    <Modal
      className={styles.modalWrap}
      title="自定义面板字段"
      open={open}
      width={720}
      footer={[
        <Button onClick={onCancel}>取消</Button>,
        <Button type="primary" onClick={handleSave}>保存</Button>,
      ]}
      onCancel={onCancel}
    >
      <div className={styles.scrollBox}>
        {/* 上方：已选列表 */}
        <Text strong className={styles.groupTitle}>已选</Text>
        <div className={styles.listBox}>
          {selectedList.length === 0 ? (
            <div className={styles.emptyTip}>暂无选中字段</div>
          ) : (
            selectedList.map((item) => renderItem(item, <CheckCircleFilled style={{ color: '#52c41a', fontSize: 14, marginTop: 4, marginRight: 4 }} />, true))
          )}
        </div>

        <Divider className={styles.dividerLine} />

        {/* 下方：可用列表 */}
        <Text strong className={styles.groupTitle}>可选</Text>
        <div className={styles.listBox}>
          {availableList.length === 0 ? (
            <div className={styles.emptyTip}>无更多可选组件</div>
          ) : (
            availableList.map((item) => renderItem(item,<></>, false))
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ComponotsModel;