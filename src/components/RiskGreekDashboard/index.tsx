import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography } from 'antd';
import ReactEcharts from 'echarts-for-react';
import styles from './index.module.less';

const { Title, Text } = Typography;

// 希腊指标类型定义
interface GreekItem {
  label: string;
  value: string | number;
  highlight?: boolean; // 是否高亮（当前Delta）
}

const RiskGreekDashboard = () => {
  // 模拟接口返回希腊字母数据
  const [greekList, setGreekList] = useState<GreekItem[]>([
    { label: 'Delta', value: '2,356', highlight: true },
    { label: 'Gamma', value: '2005.99' },
    { label: 'Vega', value: '0,8' },
    { label: 'Theta', value: '325.78' },
  ]);

  // 热力图模拟数据
  const heatmapData = [
    ['半年内', '半年均', 11],
    ['半年内', '转期日', 19.9],
    ['半年内', '待兑付日', 10.9],
    ['半年内', '到期日', 30],
    ['半年内', '到期前日', 20.7],
    ['半年内', '到期前日2', 30],
    ['90日内', '半年均', 1.1],
    ['90日内', '转期日', 19.9],
    ['90日内', '待兑付日', 19.5],
    ['90日内', '到期日', 27.27],
    ['90日内', '到期前日', 10.7],
    ['90日内', '到期前日2', 30],
    ['15日内', '半年均', 1.1],
    ['15日内', '转期日', 19.5],
    ['15日内', '待兑付日', 15.3],
    ['15日内', '到期日', 16.9],
    ['15日内', '到期前日', 30],
    ['15日内', '到期前日2', 30],
  ];

  // 多折线面积图模拟数据
  const areaSeries = [
    { name: '多头Delta总和', color: '#f5222d', data: [50, 120, 220, 480, 360, 420, 330] },
    { name: '空头Delta总和', color: '#52c41a', data: [30, 90, 180, 320, 280, 340, 290] },
  ];
  const xAxisTime = ['03:13', '09:25', '13:05', '17:05', '11:00', '16:30', '19:30'];

  return (
    <>
      {/* 顶部4个指标栏 4等分栅格 */}
      <Row gutter={[16, 16]}>
        {greekList.map((item, idx) => (
          <Col span={6} key={idx}>
            <div className={item.highlight ? styles.greekItemActive : styles.greekItem}>
              <div className={styles.labelRow}>
                <Text className={styles.labelText}>{item.label}</Text>
              </div>
              <Title level={2} className={styles.valueText}>{item.value}</Title>
              <div className={styles.miniChart}></div>
            </div>
          </Col>
        ))}
      </Row>

      {/* 分割间距 */}
      <div className={styles.divider} />

      {/* 下方左右图表 各占12栅格 */}
      <Row gutter={24}>
        <Col span={24}>
        <div className={styles.chartBox}>
            <Text strong className={styles.chartTitle}>
              <span className={styles.tagRed}>多头Delta总和</span>
              <span className={styles.tagGreen}>空头Delta总和</span>
            </Text>
            <ReactEcharts
              option={{
                tooltip: { trigger: 'axis' },
                legend: { data: areaSeries.map(s => s.name), left: 10 },
                grid: { top: 60, left: 40, right: 30, bottom: 60 },
                xAxis: { type: 'category', data: xAxisTime },
                yAxis: { type: 'value' },
                series: areaSeries.map(s => ({
                  name: s.name,
                  type: 'line',
                  smooth: true,
                  areaStyle: { opacity: 0.2 },
                  lineStyle: { color: s.color },
                  data: s.data
                }))
              }}
              style={{ height: 360 }}
            />
          </div>
          </Col>
      </Row>
    </>
  );
};

export default RiskGreekDashboard;