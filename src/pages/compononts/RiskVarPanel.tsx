import React, { useRef, useEffect, useState } from 'react';
import { Card, Tabs, Typography } from 'antd';
import * as echarts from 'echarts';

const { Title, Text } = Typography;

// 希腊指标数据类型
interface GreekItem {
  label: string;
  value: string | number;
  color: string;
}
interface RiskBlockData {
  delta: number;
  maxDrawdown: string;
  vol1: GreekItem[];
  vol2: GreekItem[];
}

const RiskVarPanel: React.FC = () => {
  const donutChartRef = useRef<HTMLDivElement>(null);
  const chartIns = useRef<echarts.ECharts | null>(null);
  const [activeTab, setActiveTab] = useState('gamma');

  // 模拟指标数据
  const riskData: RiskBlockData = {
    delta: 4506,
    maxDrawdown: '539.00%',
    vol1: [
      { label: '621mo', value: 364186, color: '#40a9ff' },
      { label: '7899o', value: 855, color: '#fa9500' },
    ],
    vol2: [
      { label: '50mo', value: 758, color: '#40a9ff' },
      { label: '30398', value: 30398, color: '#fa9500' },
    ],
  };

  // 环形占比图初始化
  useEffect(() => {
    if (!donutChartRef.current) return;
    chartIns.current = echarts.init(donutChartRef.current);
    const option = {
      tooltip: { trigger: 'item' },
      series: [
        {
          name: '头寸占比',
          type: 'pie',
          radius: ['65%', '85%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: true,
          label: { show: false },
          emphasis: { label: { show: true, fontSize: 24, fontWeight: 'bold' } },
          labelLine: { show: false },
          data: [
            { value: 60, name: '主要头寸', itemStyle: { color: '#40a9ff' } },
            { value: 40, name: '其他头寸', itemStyle: { color: '#fa9500' } },
          ],
        },
      ],
      graphic: [
        {
          type: 'text',
          left: 'center',
          top: 'center',
          style: { fill: '#fff', fontSize: 28, fontWeight: 'bold' },
          text: '60%',
        },
        {
          type: 'text',
          left: 'center',
          top: 'center',
          style: { fill: '#aaa', fontSize: 16, textAlign: 'center' },
          text: '占比',
          bounding: { top: 30 },
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

  const tabItems = [
    { key: 'gamma', label: '总Gamma' },
    { key: 'vega', label: '总Vega' },
    { key: 'theta', label: '总Theta' },
  ];

  return (
    <>
      <Tabs
        activeKey={activeTab}
        items={tabItems}
        onChange={setActiveTab}
        size="large"
        type="card"
        style={{ marginBottom: 0 }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '72% 26%', gap: '2%' }}>
        {/* 左侧指标面板 */}
        <div style={{ padding: 20, borderRadius: 8 }}>
          {/* Delta 区域 */}
          <div style={{ marginBottom: 24 }}>
            <Text style={{ color: '#aaa' }}>总Delta Delta</Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
              <div style={{ width: 4, height: 24, background: '#40a9ff' }} />
              <Title level={2} style={{ color: '#fff', margin: 0 }}>Delta</Title>
              <div style={{ width: 4, height: 24, background: '#fa9500' }} />
              <Title level={2} style={{ color: '#fff', margin: 0 }}>{riskData.delta}</Title>
            </div>
          </div>

          {/* 最大回撤 */}
          <div style={{ marginBottom: 24 }}>
            <Text style={{ color: '#aaa' }}>最大回撤</Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#8892a0' }} />
              <Text style={{ color: '#fff', fontSize: 16 }}>最大回撤</Text>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fa9500', marginLeft: 16 }} />
              <Text style={{ color: '#fa9500', fontSize: 16 }}>{riskData.maxDrawdown}</Text>
            </div>
          </div>

          {/* 两组波动率指标 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <Text style={{ color: '#aaa' }}>波动率</Text>
              {riskData.vol1.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                  <div style={{ width: 12, height: 3, background: item.color }} />
                  <Text style={{ color: '#aaa' }}>{item.label}</Text>
                  <Text style={{ color: '#fff', marginLeft: 'auto' }}>{item.value}</Text>
                </div>
              ))}
            </div>
            <div>
              <Text style={{ color: '#aaa' }}>波动率</Text>
              {riskData.vol2.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                  <div style={{ width: 12, height: 3, background: item.color }} />
                  <Text style={{ color: '#aaa' }}>{item.label}</Text>
                  <Text style={{ color: '#fff', marginLeft: 'auto' }}>{item.value}</Text>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧环形占比图 */}
        <div style={{ textAlign: 'center' }}>
          <Text style={{ color: '#aaa', fontSize: 16 }}>最为占比</Text>
          <div ref={donutChartRef} style={{ width: '100%', height: 320, marginTop: 16 }} />
        </div>
      </div>
    </>
  );
};

export default RiskVarPanel;