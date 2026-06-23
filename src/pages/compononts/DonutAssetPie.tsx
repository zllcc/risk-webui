import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';
import { FilterParams } from './FilterPanel.tsx';


interface Props {
  filter: FilterParams;
  chartType: 'asset' | 'risk';
}

const DonutAssetPie: React.FC<Props> = ({ filter, chartType }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartIns = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    // 根据 chartType 请求资产/风险两类占比数据
    const fetchData = async () => {
      // api.getDonutData(filter, chartType)
    };
    fetchData();
  }, [filter, chartType]);

  useEffect(() => {
    if (!chartRef.current) return;
    chartIns.current = echarts.init(chartRef.current);

    const option = {
      tooltip: { trigger: 'item', formatter: '{b}: {c}%' },
      legend: { bottom: 10 },
      series: [
        {
          name: '资产品类市值占比',
          type: 'pie',
          radius: ['40%', '70%'], // 环形饼图
          avoidLabelOverlap: false,
          data: [
            { value: 45, name: '股票' },
            { value: 30, name: '期权' },
            { value: 15, name: 'ETF' },
            { value: 7, name: '现金' },
            { value: 3, name: '债券' },
          ],
        },
      ],
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
export default DonutAssetPie;