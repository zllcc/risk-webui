import React, { useRef, useEffect } from 'react';
import { Card } from 'antd';
import * as echarts from 'echarts';

const PieFirstLayer: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartIns = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    chartIns.current = echarts.init(chartRef.current);

    const option = {
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left' },
      series: [{
        name: '一级维度分布',
        type: 'pie',
        radius: '60%',
        data: [
          { value: 42, name: '主交易账号A' },
          { value: 28, name: '套利策略组' },
          { value: 18, name: '对冲子账号' },
          { value: 12, name: '波段小仓账号' }
        ]
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
    <div ref={chartRef} style={{ width: '100%', height: 360 }} />
  );
};
export default PieFirstLayer;