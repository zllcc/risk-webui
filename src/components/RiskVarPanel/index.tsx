import React, { useEffect, useState } from 'react';
import { Card, Typography, Row, Col, Progress, message, Spin } from 'antd';
import styles from './index.module.less';
import { FilterParams } from '../FilterPanel';
import { queryRiskDashboard, RiskQueryParams, RiskDashboardRes, PressureTestItem } from '@/api/riskApi';

const { Text } = Typography;

type TimeRanges = '1D' | '7D' | 'MTD' | '1M' | 'QTD' | 'YTD' | '1Y';

interface Props {
  filter: FilterParams;
}

// 格式化美元金额
const formatUSD = (num: number) => {
  return `$${num.toLocaleString()}`;
};

const RiskDashboard: React.FC<Props> = ({ filter }) => {
  const [loading, setLoading] = useState(false);
  const [riskData, setRiskData] = useState<RiskDashboardRes | null>(null);

  // 筛选变更，转换参数并请求后端接口
  useEffect(() => {
    const fetchRiskData = async () => {
      setLoading(true);
      try {
        // 转换筛选参数为后端接口入参，完全对齐后端字段
        const reqParams: RiskQueryParams = {
          accountCodes: filter.accountKeys,
          tradeNames: filter.operatorKeys,
          strategyNames: filter.strategyKeys,
          startDate: filter.customDate?.[0] || '',
          endDate: filter.customDate?.[1] || '',
        };
        const res = await queryRiskDashboard(reqParams);
        setRiskData(res);
      } catch (err) {
        message.error('加载风控指标数据失败');
        console.error('风控接口请求异常：', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRiskData();
  }, [filter]);

  // 无数据占位
  if (!riskData) {
    return (
      <div className={styles.wrap} style={{ textAlign: 'center', padding: 60 }}>
        <Spin spinning={loading} size="large" />
      </div>
    );
  }

  // 拆分后端返回字段
  const { var: varInfo, es, maxDrawdown, iv, marginRatio, vix, pressureTestVo } = riskData;

  // 匹配压力测试场景名称
  const getSceneLabel = (scene: string) => {
    if (scene.includes('2020') || scene === '2020熔断场景') return '2020熔断场景：';
    if (scene.includes('加息') || scene === '加息暴跌场景') return '加息暴跌场景：';
    return `${scene}：`;
  };

  return (
    <div className={styles.wrap}>
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {/* 左侧四组数值卡片 */}
          <Col span={12}>
            {/* VaR 99% 3日 后端 var 对象 */}
            <Card
              styles={{ body: { padding: 20 } }}
              className={styles.cardItem}
            >
              <Text className={styles.cardTextLabel}>VaR {varInfo.confidence}% {varInfo.day}日（历史模拟法）</Text>
              <Row justify="space-between" align="bottom" style={{ marginTop: 12 }}>
                <Col>
                  <Text className={styles.cardValueMain}>
                    {formatUSD(varInfo.amount)}
                  </Text>
                  <Text className={styles.cardTextDesc}>绝对金额</Text>
                </Col>
                <Col>
                  <Text className={styles.cardTextDesc}>占总资产百分比：{varInfo.totalAssetRatio}%</Text>
                </Col>
              </Row>
            </Card>

            {/* ES 预期损失 */}
            <Card
              styles={{ body: { padding: 20 }, header: { display: 'none' } }}
              className={styles.cardItem}
              style={{ marginTop: 16 }}
            >
              <Text className={styles.cardTextLabel}>ES</Text>
              <Text className={styles.cardValueMain}>
                {formatUSD(es)}
              </Text>
            </Card>

            {/* 最大回撤 */}
            <Card
              styles={{ body: { padding: 20 }, header: { display: 'none' } }}
              className={styles.cardItem}
              style={{ marginTop: 16 }}
            >
              <Text className={styles.cardTextLabel}>最大回撤(Max Drawdown)</Text>
              <Text className={styles.cardValueMain}>
                {maxDrawdown}%
              </Text>
            </Card>

            {/* 组合加权隐含波动率IV */}
            <Card
              styles={{ body: { padding: 20 }, header: { display: 'none' } }}
              className={styles.cardItem}
              style={{ marginTop: 16 }}
            >
              <Text className={styles.cardTextLabel}>组合加权隐含波动率(IV)</Text>
              <Text className={styles.cardValueMain}>
                {iv}%
              </Text>
            </Card>
          </Col>

          {/* 右侧三块模块 */}
          <Col span={12}>
            {/* VIX数值卡片 */}
            <Card
              styles={{ body: { padding: 20 } }}
              className={styles.cardItem}
            >
              <Text className={styles.cardTextLabel}>市场VIX对标数值</Text>
              <Text className={styles.cardValueMain}>
                {vix}
              </Text>
            </Card>

            {/* 保证金使用率进度条 后端 marginRatio */}
            <Card
              styles={{ body: { padding: 20 }, header: { display: 'none' } }}
              className={styles.cardItem}
              style={{ marginTop: 16 }}
            >
              <Row justify="space-between">
                <Text className={styles.cardTextLabel}>保证金使用率</Text>
                <Text style={{ color: '#ff4d4f' }}>安全区间</Text>
              </Row>
              <div className={styles.progressWrap}>
                <Progress
                  percent={marginRatio}
                  showInfo={false}
                  strokeColor={
                    marginRatio >= 90
                      ? '#ff4d4f'
                      : marginRatio >= 80
                      ? '#faad14'
                      : '#1890ff'
                  }
                  trailColor="#222"
                  size={[240, 18]}
                />
                <Text className={styles.progressTip}>超过80%橙黄色预警，超过90%红色强预警</Text>
                <Text className={styles.progressRateNum}>
                  {marginRatio}%
                </Text>
              </div>
            </Card>

            {/* 压力测试预估损失 动态渲染后端 pressureTestVo 数组 */}
            <Card
              styles={{ body: { padding: 20 }, header: { display: 'none' } }}
              className={styles.cardItem}
              style={{ marginTop: 16 }}
            >
              <Text className={styles.cardTextLabel}>压力测试预估损失</Text>
              <Row gutter={16} className={styles.stressBoxWrap}>
                {pressureTestVo?.map((item: PressureTestItem) => (
                  <Col span={12} className={styles.stressBox} key={item.scene}>
                    <Text className={styles.cardTextDesc}>{getSceneLabel(item.scene)}</Text>
                    <Text className={styles.stressValue}>
                      {formatUSD(item.amount)}
                    </Text>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default RiskDashboard;