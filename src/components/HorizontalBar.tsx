import React, { useRef, useEffect } from 'react';
import { Card } from 'antd';
import * as echarts from 'echarts';

const HorizontalBarContribution: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartIns = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    chartIns.current = echarts.init(chartRef.current);

    const labels = ['个股多头','购权认购','指数ETF','融券空头','认沽期权','做空期货'];
    const contribData = [4800,3200,1600,-1200,-2600,-4100];

    const option = {
      tooltip: { trigger: 'axis' },
      legend: { data: ['资产类别收益贡献'] },
      grid: { left: 100, right: 40, top: 40, bottom: 40 },
      xAxis: { type: 'value', name: '收益贡献' },
      yAxis: { type: 'category', data: labels },
      series: [{
        name: '资产类别收益贡献',
        type: 'bar',
        barWidth: 24,
        data: contribData.map(v => ({
          value: v,
          itemStyle: { color: v >= 0 ? '#36c661' : '#f53f3f' }
        }))
      }]
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
    <div ref={chartRef} style={{ width: '100%', height: 420 }} />
  );
};
export default HorizontalBarContribution;