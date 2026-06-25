import React, { useRef, useEffect } from 'react';
import { Card } from 'antd';
import * as echarts from 'echarts';

const BarChartPeriodReturn: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartIns = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    chartIns.current = echarts.init(chartRef.current);

    const monthData = ['1月','2月','3月','4月','5月','6月','7月'];
    const returnData = [2400,-1200,3600,800,-2100,4200,1500];

    const option = {
      tooltip: { trigger: 'axis' },
      legend: { data: ['区间收益'] },
      grid: { left: 40, right: 30, top: 40, bottom: 40 },
      xAxis: { type: 'category', data: monthData, name: '月份' },
      yAxis: { type: 'value', name: '收益' },
      series: [{
        name: '区间收益',
        type: 'bar',
        data: returnData.map(val => ({
          value: val,
          itemStyle: { color: val >= 0 ? '#36c661' : '#f53f3f' }
        })),
        barWidth: '40%'
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
    <div ref={chartRef} style={{ width: '100%', height: 380 }} />
  );
};
export default BarChartPeriodReturn;