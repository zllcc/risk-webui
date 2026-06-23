import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { FilterParams } from './FilterPanel.tsx';

// 指标类型枚举
export type PerformanceMetric = 'sharpe' | 'sortino' | 'calmar' | 'winloss' | 'varRatio' | 'ivSpread';

interface Props {
  filter: FilterParams | null;
  metric: PerformanceMetric;
}

// 指标名称映射
const metricNameMap: Record<PerformanceMetric, string> = {
  sharpe: '夏普比率 Sharpe Ratio',
  sortino: '索提诺比率 Sortino Ratio',
  calmar: '卡玛比率 Calmar Ratio',
  winloss: '盈亏比 Win/Loss Ratio',
  varRatio: '风险占比(95%VaR/总资产)',
  ivSpread: '波动率溢价(组合IV-VIX)'
};

const PerformanceTrendChart: React.FC<Props> = ({ filter, metric }) => {
  const [chartData, setChartData] = useState<number[]>([]);
  const xAxisData = ['1D', '7D', '1M', '3M', '6M', 'YTD', '1Y'];

  // 根据筛选条件+指标拉取趋势数据
  useEffect(() => {
    if (!filter) return;
    const fetchData = async () => {
      console.log('请求绩效趋势数据', filter, metric);
      // 模拟接口返回不同指标数据
      const mockMap: Record<PerformanceMetric, number[]> = {
        sharpe: [0.32, 0.45, 0.61, 0.58, 0.72, 0.68, 0.75],
        sortino: [0.41, 0.53, 0.66, 0.63, 0.77, 0.74, 0.81],
        calmar: [0.22, 0.35, 0.48, 0.44, 0.56, 0.52, 0.60],
        winloss: [1.22, 1.35, 1.41, 1.38, 1.45, 1.43, 1.48],
        varRatio: [0.042, 0.038, 0.035, 0.039, 0.033, 0.036, 0.031],
        ivSpread: [0.021, 0.028, 0.019, 0.025, 0.016, 0.022, 0.014]
      };
      setChartData(mockMap[metric]);
    };
    fetchData();
  }, [filter, metric]);

  const option = {
    title: {
      text: metricNameMap[metric],
      left: 'center',
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any[]) => `${params[0].axisValue}<br/>数值: ${params[0].data.toFixed(3)}`
    },
    grid: { left: 40, right: 20, top: 60, bottom: 40 },
    xAxis: {
      type: 'category',
      data: xAxisData
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: metricNameMap[metric],
        type: 'line',
        smooth: true,
        data: chartData,
        lineStyle: { width: 2 },
        symbol: 'circle',
        symbolSize: 6
      }
    ]
  };

  return <ReactECharts option={option} style={{ height: 320, width: '100%' }} />;
};

export default PerformanceTrendChart;