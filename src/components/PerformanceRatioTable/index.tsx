import React, { useState, useEffect } from 'react';
import { Card, Table, Tag } from 'antd';
import styles from './index.module.less';

// 指标类型定义
interface RatioItem {
  key: string;
  label: string;
  desc: string;
  groupA: number;
  groupB: number;
  groupC: number;
  bestKey: 'groupA' | 'groupB' | 'groupC'; // 最优组合
}

const PerformanceRatioTable = () => {
  // 模拟表格数据，对应截图数值
  const tableData: RatioItem[] = [
    {
      key: 'sharpe',
      label: '夏普比率(Sharpe Ratio)',
      desc: '超额收益 / 组合波动率（越高越好）',
      groupA: 27.34,
      groupB: 27.38,
      groupC: 2.248,
      bestKey: 'groupB'
    },
    {
      key: 'sortino',
      label: '索提诺比率(Sortino Ratio)',
      desc: '仅下行波动率，剔除上涨波动干扰',
      groupA: 22.52,
      groupB: 22.89,
      groupC: 2.162,
      bestKey: 'groupB'
    },
    {
      key: 'calmar',
      label: '卡玛比率(Calmar Ratio)',
      desc: '年化收益 / 最大回撤，衡量回撤性价比',
      groupA: 22.86,
      groupB: 2.330,
      groupC: 2.338,
      bestKey: 'groupC'
    },
    {
      key: 'winloss',
      label: '盈亏比(Win/Loss Ratio)',
      desc: '盈利交易平均盈利 / 亏损交易平均亏损',
      groupA: 22.58,
      groupB: 2.25,
      groupC: 2.852,
      bestKey: 'groupC'
    },
    {
      key: 'varRatio',
      label: '风险占比(95% VaR / 总资产)',
      desc: '极端风险资产占比',
      groupA: 22.58,
      groupB: 22.58,
      groupC: 2.252,
      bestKey: 'groupA'
    },
    {
      key: 'ivPremium',
      label: '波动率溢价(组合 IV-市场 VIX)',
      desc: '组合相对大盘波动差值',
      groupA: 23.56,
      groupB: 27.58,
      groupC: 23.56,
      bestKey: 'groupB'
    }
  ];

  // 渲染单元格数值，最优标红+No.1标签
  const renderCellValue = (val: number, currentKey: string, bestKey: string) => {
    const isBest = currentKey === bestKey;
    return (
      <div className={isBest ? styles.bestCell : styles.normalCell}>
        {val}
        {isBest && <Tag color="red" className={styles.no1Tag}>No.1</Tag>}
      </div>
    );
  };

  const columns = [
    {
      title: '指标名称',
      dataIndex: 'label',
      width: 320,
      render: (text: string, record: RatioItem) => (
        <div className={styles.labelCol}>
          <div className={styles.mainLabel}>{text}</div>
          <div className={styles.descText}>{record.desc}</div>
        </div>
      )
    },
    {
      title: '组合A',
      dataIndex: 'groupA',
      width: 160,
      render: (_val: number, record: RatioItem) => renderCellValue(record.groupA, 'groupA', record.bestKey)
    },
    {
      title: '组合B',
      dataIndex: 'groupB',
      width: 160,
      render: (_val: number, record: RatioItem) => renderCellValue(record.groupB, 'groupB', record.bestKey)
    },
    {
      title: '组合C',
      dataIndex: 'groupC',
      width: 160,
      render: (_val: number, record: RatioItem) => renderCellValue(record.groupC, 'groupC', record.bestKey)
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={tableData}
      rowKey="key"
      pagination={false}
      bordered
      className={styles.darkTable}
    />
  );
};

export default PerformanceRatioTable;