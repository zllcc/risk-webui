import React, { useEffect, useRef, useState } from 'react';
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

type TimeRanges = '当日' | '近7日' | '30日' | 'YTD' | '近1年';

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

// Mock数据：benchmarks数组可自由增减，折线自动渲染多条
const mockData: DataItem[] = [
  {
    date: '2023-01',
    nav: 2000,
    portReturn: 1000,
    benchmarks: [
      { key: 'spy', name: 'SPY', value: 900 },
      { key: 'qqq', name: 'QQQ', value: 850},
    ],
  },
  {
    date: '2023-02',
    nav: 2120,
    portReturn: 1120,
    benchmarks: [
      { key: 'spy', name: 'SPY', value: 980 },
      { key: 'qqq', name: 'QQQ', value: 930},
    ],
  },
  {
    date: '2023-03',
    nav: 2250,
    portReturn: 1260,
    benchmarks: [
      { key: 'spy', name: 'SPY', value: 1070 },
      { key: 'qqq', name: 'QQQ', value: 1020},
    ],
  },
  {
    date: '2023-04',
    nav: 2380,
    portReturn: 1410,
    benchmarks: [
      { key: 'spy', name: 'SPY', value: 1165 },
      { key: 'qqq', name: 'QQQ', value: 1115},
    ],
  },
  {
    date: '2023-05',
    nav: 2520,
    portReturn: 1575,
    benchmarks: [
      { key: 'spy', name: 'SPY', value: 1268 },
      { key: 'qqq', name: 'QQQ', value: 1220},
    ],
  },
  {
    date: '2023-06',
    nav: 2670,
    portReturn: 1755,
    benchmarks: [
      { key: 'spy', name: 'SPY', value: 1378 },
      { key: 'qqq', name: 'QQQ', value: 1335},
    ],
  },
  {
    date: '2023-07',
    nav: 2830,
    portReturn: 1950,
    benchmarks: [
      { key: 'spy', name: 'SPY', value: 1495 },
      { key: 'qqq', name: 'QQQ', value: 1460},
    ],
  },
  {
    date: '2023-08',
    nav: 2990,
    portReturn: 2160,
    benchmarks: [
      { key: 'spy', name: 'SPY', value: 1620 },
      { key: 'qqq', name: 'QQQ', value: 1595},
    ],
  },
  {
    date: '2023-09',
    nav: 3160,
    portReturn: 2385,
    benchmarks: [
      { key: 'spy', name: 'SPY', value: 1752 },
      { key: 'qqq', name: 'QQQ', value: 1740},
    ],
  },
  {
    date: '2023-10',
    nav: 3340,
    portReturn: 2625,
    benchmarks: [
      { key: 'spy', name: 'SPY', value: 1892 },
      { key: 'qqq', name: 'QQQ', value: 1895},
    ],
  },
  {
    date: '2023-11',
    nav: 3530,
    portReturn: 2880,
    benchmarks: [
      { key: 'spy', name: 'SPY', value: 2040 },
      { key: 'qqq', name: 'QQQ', value: 2060},
    ],
  },
  {
    date: '2023-12',
    nav: 3730,
    portReturn: 3150,
    benchmarks: [
      { key: 'spy', name: 'SPY', value: 2195 },
      { key: 'qqq', name: 'QQQ', value: 2235},
    ],
  },
  {
    date: '2024-01',
    nav: 3940,
    portReturn: 3435,
    benchmarks: [
      { key: 'spy', name: 'SPY', value: 2358 },
      { key: 'qqq', name: 'QQQ', value: 2420},
    ],
  },
  {
    date: '2024-02',
    nav: 4160,
    portReturn: 3735,
    benchmarks: [
      { key: 'spy', name: 'SPY', value: 2528 },
      { key: 'qqq', name: 'QQQ', value: 2615},
    ],
  },
  {
    date: '2024-03',
    nav: 4390,
    portReturn: 4050,
    benchmarks: [
      { key: 'spy', name: 'SPY', value: 2705 },
      { key: 'qqq', name: 'QQQ', value: 2820},
    ],
  },
  {
    date: '2024-04',
    nav: 4630,
    portReturn: 4380,
    benchmarks: [
      { key: 'spy', name: 'SPY', value: 2890 },
      { key: 'qqq', name: 'QQQ', value: 3035},
    ],
  },
  {
    date: '2024-05',
    nav: 4880,
    portReturn: 4725,
    benchmarks: [
      { key: 'spy', name: 'SPY', value: 3082 },
      { key: 'qqq', name: 'QQQ', value: 3260},
    ],
  },
  {
    date: '2024-06',
    nav: 5140,
    portReturn: 5085,
    benchmarks: [
      { key: 'spy', name: 'SPY', value: 3282 },
      { key: 'qqq', name: 'QQQ', value: 3495},
    ],
  },
  {
    date: '2024-07',
    nav: 5410,
    portReturn: 5460,
    benchmarks: [
      { key: 'spy', name: 'SPY', value: 3490 },
      { key: 'qqq', name: 'QQQ', value: 3740},
    ],
  },
  {
    date: '2024-08',
    nav: 5690,
    portReturn: 5850,
    benchmarks: [
      { key: 'spy', name: 'SPY', value: 3705 },
      { key: 'qqq', name: 'QQQ', value: 3995},
    ],
  },
  {
    date: '2024-09',
    nav: 5980,
    portReturn: 6255,
    benchmarks: [
      { key: 'spy', name: 'SPY', value: 3928 },
      { key: 'qqq', name: 'QQQ', value: 4260},
    ],
  },
  {
    date: '2024-10',
    nav: 6280,
    portReturn: 6675,
    benchmarks: [
      { key: 'spy', name: 'SPY', value: 4158 },
      { key: 'qqq', name: 'QQQ', value: 4535},
    ],
  },
  {
    date: '2024-11',
    nav: 6590,
    portReturn: 7110,
    benchmarks: [
      { key: 'spy', name: 'SPY', value: 4395 },
      { key: 'qqq', name: 'QQQ', value: 4820},
    ],
  },
  {
    date: '2024-12',
    nav: 6910,
    portReturn: 7560,
    benchmarks: [
      { key: 'spy', name: 'SPY', value: 4640 },
      { key: 'qqq', name: 'QQQ', value: 5115},
    ],
  },
  {
    date: '2025-01',
    nav: 7240,
    portReturn: 8025,
    benchmarks: [
      { key: 'spy', name: 'SPY', value: 4892 },
      { key: 'qqq', name: 'QQQ', value: 5420},
    ],
  },
  {
    date: '2025-02',
    nav: 7580,
    portReturn: 8505,
    benchmarks: [
      { key: 'spy', name: 'SPY', value: 5152 },
      { key: 'qqq', name: 'QQQ', value: 5735},
    ],
  },
  {
    date: '2025-03',
    nav: 7930,
    portReturn: 9000,
    benchmarks: [
      { key: 'spy', name: 'SPY', value: 5420 },
      { key: 'qqq', name: 'QQQ', value: 6060},
    ],
  },
  {
    date: '2025-04',
    nav: 8290,
    portReturn: 9510,
    benchmarks: [
      { key: 'spy', name: 'SPY', value: 5695 },
      { key: 'qqq', name: 'QQQ', value: 6395},
    ],
  },
  {
    date: '2025-05',
    nav: 8660,
    portReturn: 10035,
    benchmarks: [
      { key: 'spy', name: 'SPY', value: 5978 },
      { key: 'qqq', name: 'QQQ', value: 6740},
    ],
  },
  {
    date: '2025-06',
    nav: 9040,
    portReturn: 10575,
    benchmarks: [
      { key: 'spy', name: 'SPY', value: 6268 },
      { key: 'qqq', name: 'QQQ', value: 7095},
    ],
  },
  {
    date: '2025-07',
    nav: 9430,
    portReturn: 11130,
    benchmarks: [
      { key: 'spy', name: 'SPY', value: 6565 },
      { key: 'qqq', name: 'QQQ', value: 7460},
    ],
  },
  {
    date: '2025-08',
    nav: 9830,
    portReturn: 11700,
    benchmarks: [
      { key: 'spy', name: 'SPY', value: 6870 },
      { key: 'qqq', name: 'QQQ', value: 7835},
    ],
  },
  {
    date: '2025-09',
    nav: 10240,
    portReturn: 12285,
    benchmarks: [
      { key: 'spy', name: 'SPY', value: 7182},
      { key: 'qqq', name: 'QQQ', value: 8220},
    ],
  },
  {
    date: '2025-10',
    nav: 10660,
    portReturn: 12885,
    benchmarks: [
      { key: 'spy', name: 'SPY', value: 7502 },
      { key: 'qqq', name: 'QQQ', value: 8615},
    ],
  },
  {
    date: '2025-11',
    nav: 11090,
    portReturn: 13500,
    benchmarks: [
      { key: 'spy', name: 'SPY', value: 7830 },
      { key: 'qqq', name: 'QQQ', value: 9020},
    ],
  },
  {
    date: '2025-12',
    nav: 11530,
    portReturn: 14130,
    benchmarks: [
      { key: 'spy', name: 'SPY', value: 8165 },
      { key: 'qqq', name: 'QQQ', value: 9435},
    ],
  },
];

const PortfolioChart: React.FC<Props> = ({ filter }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartIns = useRef<echarts.ECharts | null>(null);
  const [chartData, setChartData] = useState<DataItem[]>([]);

  // 筛选条件变更，刷新数据并重绘图表
  useEffect(() => {
    const fetchData = async () => {
      // const res = await api.getChartData(filter);
      const res = mockData;
      setChartData(res);
    };
    fetchData();
  }, [filter]);

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