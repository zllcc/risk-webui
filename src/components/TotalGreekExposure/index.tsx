import React, { useState } from 'react';
import { Card, Row, Col, Typography } from 'antd';
import ReactEcharts from 'echarts-for-react';
import styles from './index.module.less';

const { Text, Title } = Typography;

// 1. 希腊敞口指标类型
interface GreekSumItem {
  name: string;
  value: string | number;
  highlight?: boolean;
}

// 2. 热力图数据类型（行权价Y / 到期日X / Delta数值）
type HeatCell = [strikePrice: string, expireDate: string, value: number];

const TotalGreekExposure = () => {
  // 顶部四宫格汇总数据
  const greekList: GreekSumItem[] = [
    { name: 'Delta', value: '2356', highlight: true },
    { name: 'Gamma', value: '2005.99' },
    { name: 'Vega', value: '0.8' },
    { name: 'Theta', value: '325.78' },
  ];

  // 二维热力图模拟数据
  const heatData: HeatCell[] = [
    ['15日内', '半年均', 1.1],
    ['15日内', '转期日', 19.5],
    ['15日内', '待兑付日', 15.3],
    ['15日内', '到期日', 16.9],
    ['90日内', '半年均', 1.1],
    ['90日内', '转期日', 19.9],
    ['90日内', '待兑付日', 19.5],
    ['90日内', '到期日', 27.27],
    ['半年内', '半年均', 1.1],
    ['半年内', '转期日', 19.9],
    ['半年内', '待兑付日', 30],
    ['半年内', '到期日', 30],
  ];
  const heatYAxis = ['15日内', '90日内', '半年内'];
  const heatXAxis = ['半年均', '转期日', '待兑付日', '到期日'];

  // 多空Delta趋势数据
  const deltaTrendX = ['03:13','09:25','13:05','17:05','11:00','16:30','19:30'];
  const longDelta = [50, 120, 220, 480, 360, 420, 330];
  const shortDelta = [30, 90, 180, 320, 280, 340, 290];

  // 渲染单个希腊指标卡片
  const renderGreekCard = (item: GreekSumItem) => (
    <div className={item.highlight ? styles.greekActive : styles.greekNormal}>
      <div className={styles.greekTitleRow}>
        <Text className={styles.greekLabel}>{item.name}</Text>
        <span className={styles.dropArrow}>⌄</span>
      </div>
      <Title level={2} className={styles.greekVal}>{item.value}</Title>
      <div className={styles.miniSpark}></div>
    </div>
  );

  return (
    <Card title="全资产总敞口" className={styles.wrapperCard} bordered={false}>
      {/* 模块1：四宫格汇总希腊敞口 */}
      <Row gutter={[16, 16]}>
        {greekList.map((item, idx) => (
          <Col span={6} key={idx}>
            {renderGreekCard(item)}
          </Col>
        ))}
      </Row>

      <div className={styles.divider} />

      {/* 模块2：二维热力图 行权价×到期日Delta分布 */}
      <div className={styles.chartBlock}>
        <Text strong className={styles.chartHead}>二维风险热力图 <span className={styles.tagBlue}>Delta敞口分布</span></Text>
        <ReactEcharts
          option={{
            tooltip: { trigger: 'item' },
            grid: { top: 40, left: 60, right: 40, bottom: 60 },
            xAxis: { type: 'category', data: heatXAxis },
            yAxis: { type: 'category', data: heatYAxis },
            visualMap: {
              min: 0, max: 30, calculable: true,
              orient: 'vertical', right: 10, top: 'center'
            },
            series: [
              {
                name: 'Delta数值',
                type: 'heatmap',
                data: heatData,
                label: { show: true }
              }
            ]
          }}
          style={{ height: 340, width: '100%' }}
        />
        <Text className={styles.tipText}>Y轴：行权价区间 | X轴：到期时间 | 色块深浅代表单合约Delta风险集中程度</Text>
      </div>

      <div className={styles.divider} />

      {/* 模块3：多空Delta平衡面积条形图 */}
      <div className={styles.chartBlock}>
        <Text strong className={styles.chartHead}>多空Delta对冲平衡图
          <span className={styles.tagRed}>多头Delta总和</span>
          <span className={styles.tagGreen}>空头Delta总和</span>
        </Text>
        <ReactEcharts
          option={{
            tooltip: { trigger: 'axis' },
            legend: { data: ['多头Delta总和','空头Delta总和'], left: 10 },
            grid: { top: 60, left: 40, right: 30, bottom: 60 },
            xAxis: { type: 'category', data: deltaTrendX },
            yAxis: { type: 'value', name: 'Delta总量' },
            series: [
              {
                name: '多头Delta总和',
                type: 'line', smooth: true,
                lineStyle: { color: '#f5222d' },
                areaStyle: { opacity: 0.18, color: 'rgba(245,34,45,0.2)' },
                data: longDelta
              },
              {
                name: '空头Delta总和',
                type: 'line', smooth: true,
                lineStyle: { color: '#52c41a' },
                areaStyle: { opacity: 0.18, color: 'rgba(82,196,26,0.2)' },
                data: shortDelta
              }
            ]
          }}
          style={{ height: 340, width: '100%' }}
        />
        <Text className={styles.tipText}>红蓝曲线差值代表净Delta敞口，差值越小多空对冲越平衡</Text>
      </div>
    </Card>
  );
};

export default TotalGreekExposure;