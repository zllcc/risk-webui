import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

type TimeRanges = '1D' | '7D' | 'MTD' | '1M' | 'QTD' | 'YTD' | '1Y';

interface FilterParams {
  accountKeys: string[];
  operatorKeys: string[];
  strategyKeys: string[];
  timeRange: TimeRanges | null;
  customDate: [string, string] | null;
}

interface Props {
  filter: FilterParams;
}

// 模拟截图对应数据，value为盈亏绝对值，颜色由正负区分
const mockTreeData = [
  { name: '股票一', value: 14691, profit: 14691 },
  { name: '科技股票', value: 11260, profit: 11260 },
  { name: 'ai股票', value: 6037.6, profit: 6037.6 },
  { name: '材料股票', value: 4567, profit: 4567 },
  { name: '电路股票', value: 1459, profit: 1459 },
  { name: '医药股票', value: 1396.9, profit: 1396.9 },
  { name: '隆基股票', value: 1510.4, profit: -1510.4 },
  { name: '', value: 1224.84, profit: -1224.84 },
  { name: '矿业股票', value: 807, profit: -807 },
  { name: '光威股票', value: 776, profit: -776 },
];

const PositionTreemap: React.FC<Props> = ({ filter }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartIns = useRef<echarts.ECharts | null>(null);

  // 筛选条件变化重新拉取数据
  useEffect(() => {
    const fetchData = async () => {
      // const res = await api.getPositionTreemap(filter);
    };
    fetchData();
  }, [filter]);

  useEffect(() => {
    if (!chartRef.current) return;
    // 深色主题适配页面暗色卡片
    chartIns.current = echarts.init(chartRef.current, 'dark');

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        formatter: (params: any) => {
          const val = params.data.profit;
          return `个股：${params.name}<br/>盈亏：${val >= 0 ? '+' : ''}${val.toFixed(2)}`;
        }
      },
      series: [
        {
          type: 'treemap',
          data: mockTreeData,
          roam: false,
          label: {
            show: true,
            formatter: '{b}\n{c}',
            fontSize: 14,
            color: '#fff'
          },
          itemStyle: {
            borderColor: '#222',
            borderWidth: 1,
            // 盈利橙红，亏损蓝色
            color: function (params: any) {
              return params.data.profit >= 0 ? '#ff6b4a' : '#3671e9';
            }
          },
          levels: [
            { itemStyle: { borderWidth: 2, borderColor: '#222' } },
            { itemStyle: { borderWidth: 1, borderColor: '#222' } }
          ]
        }
      ]
    };

    chartIns.current.setOption(option);

    // 窗口自适应
    const resize = () => chartIns.current?.resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      chartIns.current?.dispose();
    };
  }, []);

  return (
    <div style={{ width: '100%', height: 480 }}>
      <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default PositionTreemap;