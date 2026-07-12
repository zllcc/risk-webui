import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as echarts from 'echarts';
import { Spin, message } from 'antd';
import { FilterParams } from './FilterPanel.tsx';
import { queryAssetRatio, RiskQueryParams, AssetRatioItem } from '@/api/riskApi';

interface Props {
  filter: FilterParams;
  chartType: 'asset' | 'risk';
}

const DonutAssetPie: React.FC<Props> = ({ filter, chartType }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartIns = useRef<echarts.ECharts | null>(null);
  const resizeHandlerRef = useRef<(() => void) | null>(null);
  const [loading, setLoading] = useState(false);
  const [pieData, setPieData] = useState<Array<{ name: string; value: number }>>([]);

  // 1. 统一初始化ECharts实例（抽离函数，只执行一次）
  const initChart = useCallback(() => {
    if (!chartRef.current || chartIns.current) return;
    // 固定深色dark主题，全局透明背景
    chartIns.current = echarts.init(chartRef.current, 'dark', { renderer: 'canvas' });
    // 窗口自适应
    const resizeHandler = () => chartIns.current?.resize();
    resizeHandlerRef.current = resizeHandler;
    window.addEventListener('resize', resizeHandler);
  }, []);

  // 2. 销毁实例统一清理函数
  const disposeChart = useCallback(() => {
    if (resizeHandlerRef.current) {
      window.removeEventListener('resize', resizeHandlerRef.current);
      resizeHandlerRef.current = null;
    }
    if (chartIns.current) {
      chartIns.current.dispose();
      chartIns.current = null;
    }
  }, []);

  // 组件卸载销毁实例
  useEffect(() => {
    return () => disposeChart();
  }, [disposeChart]);

  // 3. 请求接口数据（filter/chartType变更触发）
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const reqParams: RiskQueryParams = {
          accountCodes: filter.accountCodes,
          tradeNames: filter.tradeNames,
          strategyNames: filter.strategyNames,
          startDate: filter.startDate || '',
          endDate: filter.endDate || '',
          dailyDate: filter.dailyDate || '',
        };
        const res = await queryAssetRatio(reqParams);
        const chartData = res.map((item: AssetRatioItem) => ({
          name: item.secType,
          value: item.ratio
        }));
        setPieData(chartData);
        // setPieData([
        //   { name: '股票', value: 45 },
        //   { name: '期权', value: 30 },
        // ]);
      } catch (err) {
        message.error(`${chartType === 'asset' ? '资产' : '风险'}占比数据加载失败`);
        console.error('环形饼图接口报错：', err);
        setPieData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filter, chartType]);

  // 4. 渲染/更新图表（依赖pieData、chartType，数据/类型变化都会重绘）
  useEffect(() => {
    // 先初始化实例
    initChart();
    if (!chartIns.current || pieData.length === 0) return;

    // 根据类型切换文案
    const seriesName = chartType === 'asset' ? '资产品类市值占比' : '风险品类占比';
    const tooltipSuffix = chartType === 'asset' ? '市值占比' : '风险占比';

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: `{b}: {c}% ${tooltipSuffix}`
      },
      legend: {
        bottom: 10,
        textStyle: { color: '#ffffff' }
      },
      series: [
        {
          name: seriesName,
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: true,
            color: '#fff'
          },
          data: pieData,
        },
      ],
    };
    // notMerge:false 合并更新，深色主题不会丢失
    chartIns.current.setOption(option, false);
  }, [pieData, chartType, initChart]);

  return (
    <div style={{ width: '100%', height: 420, position: 'relative' }}>
      <Spin spinning={loading} style={{ height: '100%' }}>
        <div ref={chartRef} style={{ width: '100%', height: 420 }} />
      </Spin>
    </div>
  );
};

export default DonutAssetPie;