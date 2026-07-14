import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Spin, message, Empty } from 'antd';
import styles from './index.module.less';
import { FilterParams } from './FilterPanel.tsx';
import { queryTraderRiskMetrics, RiskQueryParams, TraderRiskMetricItem } from '@/api/riskApi';

interface Props {
  filter: FilterParams;
}

// 前端固定指标配置（映射后端字段）
const metricConfigList = [
  {
    key: 'sharpeRatio',
    label: '夏普比率(Sharpe Ratio)',
    desc: '超额收益 / 组合波动率（越高越好）'
  },
  {
    key: 'sortinoRatio',
    label: '索提诺比率(Sortino Ratio)',
    desc: '仅下行波动率，剔除上涨波动干扰'
  },
  {
    key: 'calmarRatio',
    label: '卡玛比率(Calmar Ratio)',
    desc: '年化收益 / 最大回撤，衡量回撤性价比'
  },
  {
    key: 'winLossRatio',
    label: '盈亏比(Win/Loss Ratio)',
    desc: '盈利交易平均盈利 / 亏损交易平均亏损'
  },
  {
    key: 'riskRatio',
    label: '风险占比(95% VaR / 总资产)',
    desc: '极端风险资产占比'
  },
  {
    key: 'volatilityPremium',
    label: '波动率溢价(组合 IV-市场 VIX)',
    desc: '组合相对大盘波动差值'
  }
];

const PerformanceRatioTable: React.FC<Props> = ({ filter }) => {
  const [loading, setLoading] = useState(false);
  // 后端原始交易员指标数组
  const [traderMetricList, setTraderMetricList] = useState<TraderRiskMetricItem[]>([]);

  // 筛选条件变更，请求接口
  useEffect(() => {
    const fetchMetricData = async () => {
      setLoading(true);
      try {
        // 转换筛选参数对齐后端入参
        const reqParams: RiskQueryParams = {
          accountCodes: filter.accountCodes,
          tradeNames: filter.tradeNames,
          strategyNames: filter.strategyNames,
          startDate: filter.startDate || '',
          endDate: filter.endDate || '',
          dateType: filter.dateType || null
        };
        const res = await queryTraderRiskMetrics(reqParams);
        console.log('交易员风险指标接口返回：', res);
        setTraderMetricList(res);
      } catch (err) {
        message.error('加载交易员风险指标失败');
        console.error('指标接口报错：', err);
        setTraderMetricList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMetricData();
  }, [filter]);

  // 渲染单元格：判断当前指标所有交易员中最大值，标红No.1
  const renderMetricCell = (metricKey: string, traderItem: TraderRiskMetricItem, allTraders: TraderRiskMetricItem[]) => {
    // 获取当前交易员该指标数值
    const currentVal = traderItem[metricKey as keyof TraderRiskMetricItem] as number;
    // 取出所有交易员同指标数值，找出最大值
    const allValues = allTraders.map(item => item[metricKey as keyof TraderRiskMetricItem] as number);
    const maxVal = Math.max(...allValues);
    const isBest = currentVal === maxVal;

    return (
      <div className={isBest ? styles.bestCell : styles.normalCell}>
        {currentVal}
        {isBest && <Tag color="red" className={styles.no1Tag}>No.1</Tag>}
      </div>
    );
  };

  // 动态生成表格列
  const generateColumns = () => {
    const baseCol = [
      {
        title: '指标名称',
        width: 340,
        render: (_: any, record: typeof metricConfigList[0]) => (
          <div className={styles.labelCol}>
            <div className={styles.mainLabel}>{record.label}</div>
            <div className={styles.descText}>{record.desc}</div>
          </div>
        )
      }
    ];

    // 循环后端返回的交易员，生成动态列
    const traderCols = traderMetricList.map(trader => ({
      title: trader.traderName,
      width: 160,
      render: (_: any, metricRow: typeof metricConfigList[0]) => {
        return renderMetricCell(metricRow.key, trader, traderMetricList);
      }
    }));

    return [...baseCol, ...traderCols];
  };

  // 表格数据源：固定指标行
  const tableDataSource = metricConfigList.map(item => ({ ...item }));

  return (
    <Spin spinning={loading}>
      {traderMetricList.length === 0 && !loading ? (
        <Empty description="暂无交易员风险指标数据" style={{ padding: 40 }} />
      ) : (
        <Table
          columns={generateColumns()}
          dataSource={tableDataSource}
          rowKey="key"
          pagination={false}
          bordered
          className={styles.darkTable}
        />
      )}
    </Spin>
  );
};

export default PerformanceRatioTable;