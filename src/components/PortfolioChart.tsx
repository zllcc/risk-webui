import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { getRandomHexColor } from '@/utils/color';

type DataItem = {
  date: string;
  nav: number;
  portReturn: number;
  // 动态基准收益数组，可多条
  benchmarks: {
    key: string;
    name: string;
    value: number;
  }[];
};

interface Props {
  chartData: DataItem[];
}

const PortfolioChart: React.FC<Props> = ({ chartData }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartIns = useRef<echarts.ECharts | null>(null);

  // 数据变更，重绘图表
  useEffect(() => {
    if (!chartRef.current || chartData.length === 0) return;
    // 销毁旧实例防止重叠
    if (chartIns.current) chartIns.current.dispose();
    chartIns.current = echarts.init(chartRef.current);

    // 公共X轴日期
    const xAxisData = chartData.map(d => d.date);
    // 柱状固定单条：净值
    const navData = chartData.map(d => d.nav);
    // 组合收益折线
    const portReturnData = chartData.map(d => d.portReturn);

    // 动态处理多条基准折线
    const benchmarkList = chartData[0].benchmarks;
    const benchmarkSeries = benchmarkList.map(item => {
      const lineData = chartData.map(d => {
        const target = d.benchmarks.find(b => b.key === item.key);
        return target?.value ?? 0;
      });
      return {
        name: item.name,
        type: 'line',
        yAxisIndex: 1,
        data: lineData,
        lineStyle: { width: 2, color: getRandomHexColor() },
        itemStyle: { color: getRandomHexColor() },
      };
    });

    // 组装全部series：1柱状 + 组合收益折线 + 动态多条基准折线
    const allSeries = [
      {
        name: 'Portfolio NAV',
        type: 'bar',
        yAxisIndex: 0,
        data: navData,
        itemStyle: { color: '#405175' },
        barWidth: '40%',
      },
      {
        name: 'Portfolio Return',
        type: 'line',
        yAxisIndex: 1,
        data: portReturnData,
        lineStyle: { width: 2, color: '#1874cd' },
        itemStyle: { color: '#1874cd' },
      },
      ...benchmarkSeries,
    ];

    // 图例名称自动收集
    const legendData = allSeries.map(s => s.name);

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        bottom: 5,
        left: 'center',
        data: legendData,
        textStyle: { color: '#cbd5e1' },
      },
      grid: {
        left: 60,
        right: 60,
        top: 60,
        bottom: 80,
      },
      xAxis: [
        {
          type: 'category',
          data: xAxisData,
          axisTick: { alignWithLabel: true },
          axisLine: { lineStyle: { color: '#475569' } },
          axisLabel: { color: '#94a3b8' },
        },
      ],
      yAxis: [
        {
          name: 'Net Asset Value',
          type: 'value',
          splitLine: { lineStyle: { type: 'dashed', color: '#334155' } },
          axisLine: { lineStyle: { color: '#475569' } },
          axisLabel: { color: '#94a3b8' },
          nameTextStyle: { color: '#cbd5e1' },
        },
        {
          name: 'Cumulative Return',
          type: 'value',
          splitLine: { show: false },
          axisLabel: { formatter: '{value}', color: '#94a3b8' },
          axisLine: { lineStyle: { color: '#475569' } },
          nameTextStyle: { color: '#cbd5e1' },
        },
      ],
      series: allSeries,
    };

    chartIns.current.setOption(option);

    // 窗口自适应
    const resize = () => chartIns.current?.resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      chartIns.current?.dispose();
    };
  }, [chartData]);

  return (
    <div style={{ width: '100%', height: 650, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 40px' }}>
        <h3 style={{ color: '#cbd5e1', fontWeight: 400, margin: 0 }}>Net Asset Value</h3>
        <h3 style={{ color: '#cbd5e1', fontWeight: 400, margin: 0 }}>Cumulative Return</h3>
      </div>
      <div ref={chartRef} style={{ width: '100%', height: 'calc(100% - 50px)' }} />
    </div>
  );
};

export default PortfolioChart;