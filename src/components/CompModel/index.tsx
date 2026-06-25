import React, { useState } from 'react';
import { Modal, Typography, Button, Divider } from 'antd';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
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
    key: 'activity',
    label: '活动',
    desc: '细分持仓配置、利息、摊薄、股息、公司行政以及每日基准收益的各个部分。',
  },
  {
    key: 'riskIndex',
    label: '风险指标',
    desc: '使用多种风险指标（包括最大回撤、夏普波动比率、置信比率、卡利比率、Alpha、Beta、正则测、总离差等）衡量投资组合风险。',
  },
  {
    key: 'newFeature',
    label: '新功能',
    desc: '查看投资组合分析新的桌面端新增功能、优化及变动。下拉展开可深入了解每一项新增功能、优化或变动的详细技术。',
  },
  {
    key: 'concentration',
    label: '集中度',
    desc: '统计持仓和权重类别的投资组合风险敞口，按多头和空头分类。作基本面解析为基金持仓的，也有仅解析为基金持仓的。还能按产业、板块、金融产品、地区和国家汇总。',
  },
  {
    key: 'attribution',
    label: '归因 vs. 基准',
    desc: '相对于基准而言，投资组合板块分配和证券选择对业绩表现的影响。',
  },
  {
    key: 'greek',
    label: '希腊字母',
    desc: '通过Delta/Delta美元、gamma/美元、vega和Theta衡量投资组合风险特征。可深入查看各适用持仓的金融产品和投资组合细分。',
  },
  {
    key: 'riskValue',
    label: '风险价值',
    desc: '使用历史方差方法计算的投资组合风险价值。',
  },
  {
    key: 'rateSensitivity',
    label: '利率敏感性',
    desc: '查看固定收益持仓的短期利率敏感性、按货币细分。下拉展开可按货币细分每种固定收益持仓的短期利率敏感性。',
  },
];

// 初始可用（下方绿色）
const initAvailable: FieldItem[] = [
  {
    key: 'esg',
    label: 'ESG',
    desc: 'ESG投资组合得分，包括持仓层面得分、争议分布、最大持仓的得分和ESG表现最好和最差的持仓。',
  },
  {
    key: 'allocation',
    label: '分配目标',
    desc: '管理投资组合实际与目标资产类别的资产权重分配。目标可以以绝对或相对百分比进行配置，可深入查看各持仓的匹配情况。',
  },
  {
    key: 'performance',
    label: '业绩划分',
    desc: '查看不同时间段内按资产类别、板块、金融产品、地区和国家、日期以及持仓显示的业绩表现。',
  },
  {
    key: 'bond',
    label: '债券',
    desc: '债券，短期固收和中期固收指标。包括平均久期、久期和票面利率、信用评级、信用质量、期限类型和每月付息细分。',
  },
];

type Props = {
  open: boolean;
  onCancel: () => void;
};

const ComponotsModel: React.FC<Props> = ({ open, onCancel }) => {
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
    onCancel();
  };

  // 渲染单行条目
  const renderItem = (
    item: FieldItem,
    dotColorIcon: React.ReactNode,
    clickHandler: () => void
  ) => (
    <div
      key={item.key}
      className={styles.listItem}
      onClick={clickHandler}
    >
      {dotColorIcon}
      <div className={styles.itemContent}>
        <Text strong className={styles.itemLabel}>{item.label}</Text>
        <div className={styles.itemDesc}>
          {item.desc}
        </div>
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
      maskClosable={false}
    >
      <div className={styles.scrollBox}>
        {/* 上方：已选列表 红点 */}
        <Text strong className={styles.groupTitle}>已选</Text>
        <div className={styles.listBox}>
          {selectedList.length === 0 ? (
            <div className={styles.emptyTip}>暂无选中字段</div>
          ) : (
            selectedList.map((item) =>
              renderItem(
                item,
                <CloseCircleFilled style={{ color: '#f5222d', fontSize: 14, marginTop: 4 }} />,
                () => moveToAvailable(item.key)
              )
            )
          )}
        </div>

        <Divider className={styles.dividerLine} />

        {/* 下方：可用列表 绿点 */}
        <Text strong className={styles.groupTitle}>可用</Text>
        <div className={styles.listBox}>
          {availableList.length === 0 ? (
            <div className={styles.emptyTip}>无更多可选字段</div>
          ) : (
            availableList.map((item) =>
              renderItem(
                item,
                <CheckCircleFilled style={{ color: '#52c41a', fontSize: 14, marginTop: 4 }} />,
                () => moveToSelected(item.key)
              )
            )
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ComponotsModel;