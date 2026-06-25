import React, { useRef, useEffect } from 'react';
import { Card } from 'antd';
import * as echarts from 'echarts';

const LineChartNavBench: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartIns = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    chartIns.current = echarts.init(chartRef.current, 'dark');

    const xData = ['01-02','01-03','01-06','01-07','01-08','01-09','01-10'];
    const portNav = [12000,12450,12300,12890,13100,12950,13400];
    const spyIndex = [100,103,101,106,108,105,110];
    const qqqIndex = [100,105,102,109,112,107,115];

    const option = {
      tooltip: { trigger: 'axis' },
      legend: { data: ['组合净值','SPY对标','QQQ对标'] },
      grid: { left: 40, right: 60, top: 60, bottom: 40 },
      xAxis: { type: 'category', data: xData, name: '交易日' },
      yAxis: [
        { name: '资产净值', type: 'value' },
        { name: '指数基点', type: 'value', scale: true, splitLine: { show: false } }
      ],
      series: [
        { name: '组合净值', type: 'line', yAxisIndex: 0, data: portNav, lineStyle: { width:2 } },
        { name: 'SPY对标', type: 'line', yAxisIndex: 1, data: spyIndex },
        { name: 'QQQ对标', type: 'line', yAxisIndex: 1, data: qqqIndex }
      ]
    };
    chartIns.current.setOption(option);

    const resize = () => chartIns.current?.resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      chartIns.current?.dispose();
    };
  }, []);

  return (
    <div ref={chartRef} style={{ width: '100%', height: 400 }} />
  );
};
export default LineChartNavBench;