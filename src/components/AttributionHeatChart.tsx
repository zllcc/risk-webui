import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as echarts from 'echarts';
import { Spin, message, Empty } from 'antd';
import { FilterParams } from './FilterPanel.tsx';
import {
  queryTop10Profit,
  RiskQueryParams,
  Top10ProfitItem
} from '@/api/riskApi';

interface Props {
  filter: FilterParams;
}

// 转换后端接口数据为echarts树图标准结构
const transformTreeData = (list: Top10ProfitItem[]) => {
  return list.map(item => ({
    name: item.symbol,
    value: Math.abs(item.totalPnl), // 方块大小用绝对值
    profit: item.totalPnl // 正负用于区分颜色、tooltip展示
  }));
};

const PositionTreemap: React.FC<Props> = ({ filter }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartIns = useRef<echarts.ECharts | null>(null);
  const resizeFnRef = useRef<(() => void) | null>(null);
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState<Array<{ name: string; value: number; profit: number }>>([]);

  // 统一初始化图表实例（只执行一次）
  const initChart = useCallback(() => {
    if (!chartRef.current || chartIns.current) return;
    // 固定深色主题，canvas渲染
    chartIns.current = echarts.init(chartRef.current, 'dark', { renderer: 'canvas' });
    // 窗口自适应
    const resize = () => chartIns.current?.resize();
    resizeFnRef.current = resize;
    window.addEventListener('resize', resize);
  }, []);

  // 统一销毁释放资源
  const disposeChart = useCallback(() => {
    if (resizeFnRef.current) {
      window.removeEventListener('resize', resizeFnRef.current);
      resizeFnRef.current = null;
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

  // 筛选变更 → 请求接口拉取TOP10资产数据
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 转换FilterParams为后端接口入参，对齐后端字段
        const reqParams: RiskQueryParams = {
          accountCodes: filter.accountCodes,
          tradeNames: filter.tradeNames,
          strategyNames: filter.strategyNames,
          startDate: filter.startDate || '',
          endDate: filter.endDate || '',
          dailyDate: filter.dailyDate || ''
        };
        const res = await queryTop10Profit(reqParams);
        const chartData = transformTreeData(res);
        setTreeData(chartData);
      } catch (err) {
        message.error('加载资产盈亏树图数据失败');
        console.error('树图接口报错：', err);
        setTreeData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filter]);

  // 数据更新重绘图表（依赖treeData）
  useEffect(() => {
    // 先初始化实例
    initChart();
    if (!chartIns.current) return;

    // 无数据不渲染图表配置
    // if (treeData.length === 0) return;
    console.log('渲染树图数据：', treeData);

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const val = params.data.profit;
          return `标的代码：${params.name}<br/>总盈亏：${val >= 0 ? '+' : ''}${val.toFixed(2)}`;
        }
      },
      series: [
        {
          type: 'treemap',
          data: treeData,
          roam: false,
          label: {
            show: true,
            formatter: '{b}\n{c}',
            fontSize: 14,
            color: '#ffffff'
          },
          itemStyle: {
            borderColor: '#222',
            borderWidth: 1,
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
    // false = 增量更新，保留主题、原有配置，不会重置画布
    chartIns.current.setOption(option, false);
  }, [treeData, initChart]);

  return (
    <div style={{ width: '100%', height: 452, position: 'relative' }}>
      <Spin spinning={loading} style={{ height: '100%' }}>
        {treeData.length === 0 && !loading ? (
          <div style={{ height: 452, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Empty description="暂无资产盈亏数据" />
          </div>
        ) : (
          <div ref={chartRef} style={{ width: '100%', height: 452 }} />
        )}
      </Spin>
    </div>
  );
};

export default PositionTreemap;