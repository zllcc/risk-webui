import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

type DataItem = {
  date: string;
  nav: number;
  portReturn: number;
  spy: number;
  qqq: number;
};

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

const mockData: DataItem[] = [
  { date: '2023-01', nav: 2000, portReturn: 1000, spy: 900, qqq: 850 },
  { date: '2023-02', nav: 2120, portReturn: 1120, spy: 980, qqq: 930 },
  { date: '2023-03', nav: 2250, portReturn: 1260, spy: 1070, qqq: 1020 },
  { date: '2023-04', nav: 2380, portReturn: 1410, spy: 1165, qqq: 1115 },
  { date: '2023-05', nav: 2520, portReturn: 1575, spy: 1268, qqq: 1220 },
  { date: '2023-06', nav: 2670, portReturn: 1755, spy: 1378, qqq: 1335 },
  { date: '2023-07', nav: 2830, portReturn: 1950, spy: 1495, qqq: 1460 },
  { date: '2023-08', nav: 2990, portReturn: 2160, spy: 1620, qqq: 1595 },
  { date: '2023-09', nav: 3160, portReturn: 2385, spy: 1752, qqq: 1740 },
  { date: '2023-10', nav: 3340, portReturn: 2625, spy: 1892, qqq: 1895 },
  { date: '2023-11', nav: 3530, portReturn: 2880, spy: 2040, qqq: 2060 },
  { date: '2023-12', nav: 3730, portReturn: 3150, spy: 2195, qqq: 2235 },
  // 2024 全年（整体抬升）
  { date: '2024-01', nav: 3940, portReturn: 3435, spy: 2358, qqq: 2420 },
  { date: '2024-02', nav: 4160, portReturn: 3735, spy: 2528, qqq: 2615 },
  { date: '2024-03', nav: 4390, portReturn: 4050, spy: 2705, qqq: 2820 },
  { date: '2024-04', nav: 4630, portReturn: 4380, spy: 2890, qqq: 3035 },
  { date: '2024-05', nav: 4880, portReturn: 4725, spy: 3082, qqq: 3260 },
  { date: '2024-06', nav: 5140, portReturn: 5085, spy: 3282, qqq: 3495 },
  { date: '2024-07', nav: 5410, portReturn: 5460, spy: 3490, qqq: 3740 },
  { date: '2024-08', nav: 5690, portReturn: 5850, spy: 3705, qqq: 3995 },
  { date: '2024-09', nav: 5980, portReturn: 6255, spy: 3928, qqq: 4260 },
  { date: '2024-10', nav: 6280, portReturn: 6675, spy: 4158, qqq: 4535 },
  { date: '2024-11', nav: 6590, portReturn: 7110, spy: 4395, qqq: 4820 },
  { date: '2024-12', nav: 6910, portReturn: 7560, spy: 4640, qqq: 5115 },
  // 2025 全年（涨幅扩大，超额跑赢基准）
  { date: '2025-01', nav: 7240, portReturn: 8025, spy: 4892, qqq: 5420 },
  { date: '2025-02', nav: 7580, portReturn: 8505, spy: 5152, qqq: 5735 },
  { date: '2025-03', nav: 7930, portReturn: 9000, spy: 5420, qqq: 6060 },
  { date: '2025-04', nav: 8290, portReturn: 9510, spy: 5695, qqq: 6395 },
  { date: '2025-05', nav: 8660, portReturn: 10035, spy: 5978, qqq: 6740 },
  { date: '2025-06', nav: 9040, portReturn: 10575, spy: 6268, qqq: 7095 },
  { date: '2025-07', nav: 9430, portReturn: 11130, spy: 6565, qqq: 7460 },
  { date: '2025-08', nav: 9830, portReturn: 11700, spy: 6870, qqq: 7835 },
  { date: '2025-09', nav: 10240, portReturn: 12285, spy: 7182, qqq: 8220 },
  { date: '2025-10', nav: 10660, portReturn: 12885, spy: 7502, qqq: 8615 },
  { date: '2025-11', nav: 11090, portReturn: 13500, spy: 7830, qqq: 9020 },
  { date: '2025-12', nav: 11530, portReturn: 14130, spy: 8165, qqq: 9435 },
];

const PortfolioChart: React.FC<Props> = ({ filter }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartIns = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    // 点击查询后filter变更，重新请求接口
    const fetchData = async () => {
      // 接口传参：账号/操盘人/策略/时间段
      // const res = await api.getChartData(filter);
      // setChartData(res);
    };
    fetchData();
  }, [filter]);

  useEffect(() => {
    if (!chartRef.current) return;
    chartIns.current = echarts.init(chartRef.current);

    const xAxisData = mockData.map(d => d.date);
    const navData = mockData.map(d => d.nav);
    const portData = mockData.map(d => d.portReturn);
    const spyData = mockData.map(d => d.spy);
    const qqqData = mockData.map(d => d.qqq);

    const option = {
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        bottom: 5,
        left: 'center',
        data: ['Portfolio NAV', 'Portfolio Return', 'SPY', 'QQQ'],
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
        },
      ],
      yAxis: [
        {
          name: 'Net Asset Value',
          type: 'value',
          splitLine: { lineStyle: { type: 'dashed' } },
        },
        {
          name: 'Cumulative Return',
          type: 'value',
          splitLine: { show: false },
          axisLabel: { formatter: '{value}%' },
        },
      ],
      series: [
        // 柱状：净值 绑定左轴
        {
          name: 'Portfolio NAV',
          type: 'bar',
          yAxisIndex: 0,
          data: navData,
          itemStyle: { color: '#405175' },
          barWidth: '40%',
        },
        // 三条折线：收益率 绑定右轴
        {
          name: 'Portfolio Return',
          type: 'line',
          yAxisIndex: 1,
          data: portData,
          lineStyle: { width: 2.5, color: '#1874cd' },
          itemStyle: { color: '#1874cd' },
        },
        {
          name: 'SPY',
          type: 'line',
          yAxisIndex: 1,
          data: spyData,
          lineStyle: { width: 2, color: '#73b840' },
          itemStyle: { color: '#73b840' },
        },
        {
          name: 'QQQ',
          type: 'line',
          yAxisIndex: 1,
          data: qqqData,
          lineStyle: { width: 2, color: '#f2b138' },
          itemStyle: { color: '#f2b138' },
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
    <div style={{ width: '100%', height: 650, background: '#fff', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 40px' }}>
        <h3 style={{ color: '#666', fontWeight: 400 }}>Net Asset Value</h3>
        <h3 style={{ color: '#666', fontWeight: 400 }}>Cumulative Return</h3>
      </div>
      <div ref={chartRef} style={{ width: '100%', height: 'calc(100% - 50px)' }} />
    </div>
  );
};

export default PortfolioChart;