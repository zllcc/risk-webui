import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Spin } from 'antd';
import ReactEcharts from 'echarts-for-react';
import { FilterParams } from '../FilterPanel';
import { queryOptDelta, RiskQueryParams } from '@/api/riskApi';
import styles from './index.module.less';

const { Title, Text } = Typography;

interface Props {
  filter: FilterParams;
}

// 希腊指标类型定义
interface GreekItem {
  label: string;
  value: string | number;
  highlight?: boolean; // 是否高亮（当前Delta）
}

const RiskGreekDashboard: React.FC<Props> = ({ filter }) => {
  const [loading, setLoading] = useState(false);
  const [optData, setOptData] = useState<{ delta: number; gamma: number; vega: number; theta: number } | null>(null);
  const [areaSeries, setAreaSeries] = useState([]);
  const [xAxisTime, setXAxisTime] = useState([]);

  // 筛选变更，转换参数并请求后端接口
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 转换筛选参数为后端接口入参，完全对齐后端字段
        const reqParams: RiskQueryParams = {
          accountCodes: filter.accountCodes,
          tradeNames: filter.tradeNames,
          strategyNames: filter.strategyNames,
          startDate: filter.startDate || '',
          endDate: filter.endDate || '',
          dateType: filter.dateType || null,
        };
        const res = await queryOptDelta(reqParams);
        const obj = {
          "Delta": res?.delta,
          "Gamma": res?.gamma,
          "Vega": res?.vega,
          "Theta": res?.theta,
        };
        const arr = Object.entries(obj).map(([label, value]) => ({ label, value }));
        const time = res?.optDeltaValueList?.map(item => item.dailyDate) || [];
        const series = [
          { name: '多头Delta总和', color: '#f5222d', data: res?.optDeltaValueList?.map(item => item.optDeltaLongValue) || [] },
          { name: '空头Delta总和', color: '#52c41a', data: res?.optDeltaValueList?.map(item => item.optDeltaShortValue) || [] },
        ];


        setGreekList(arr);
        setOptData(res);
        setAreaSeries(series);
        setXAxisTime(time);
      } catch (err) {
        console.error('风控接口请求异常：', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filter]);
  // 模拟接口返回希腊字母数据
  const [greekList, setGreekList] = useState<GreekItem[]>([]);

  if (!optData) {
    return (
      <div className={styles.wrap} style={{ textAlign: 'center', padding: 60 }}>
        <Spin spinning={loading} size="large" />
      </div>
    );
  }

  return (
    <>
      {/* 顶部4个指标栏 4等分栅格 */}
      <Row gutter={[16, 16]}>
        {greekList.map((item, idx) => (
          <Col span={6} key={idx}>
            <div className={item.label === 'Delta' ? styles.greekItemActive : styles.greekItem}>
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