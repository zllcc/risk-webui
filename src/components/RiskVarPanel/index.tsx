import React, { useEffect, useState } from 'react';
import { Card, Typography, Row, Col, Progress } from 'antd';
import styles from './index.module.less';
import { FilterParams } from '../FilterPanel';

const { Text } = Typography;

type TimeRanges = '1D' | '7D' | 'MTD' | '1M' | 'QTD' | 'YTD' | '1Y';

// interface FilterParams {
//   accountKeys: string[];
//   operatorKeys: string[];
//   strategyKeys: string[];
//   timeRange: TimeRanges | null;
//   customDate: [string, string] | null;
// }

interface Props {
  filter: FilterParams;
}

// 模拟风控指标数据
const mockRiskData = {
  var99_3d: {
    amount: 12500000,
    ratio: 3.2
  },
  es: 11800000,
  maxDrawdown: 18.7,
  iv: 24.3,
  vix: 28.9,
  marginRate: 78,
  stress2020: 9200000,
  stressCrash: 7500000
};

// 格式化美元金额
const formatUSD = (num: number) => {
  return `$${num.toLocaleString()}`;
};

const RiskDashboard: React.FC<Props> = ({ filter }) => {
  const [riskData, setRiskData] = useState(mockRiskData);

  // 筛选变更刷新风控数据
  useEffect(() => {
    const fetchRiskData = async () => {
      // 真实业务：const res = await api.getRiskIndex(filter);
      // setRiskData(res);
    };
    fetchRiskData();
  }, [filter]);

  return (
    <div className={styles.wrap}>
      <Row gutter={[16, 16]}>
        {/* 左侧四组数值卡片 */}
        <Col span={12}>
          {/* VaR 99% 3日 */}
          <Card
            styles={{ body: { padding: 20 } }}
            className={styles.cardItem}
          >
            <Text className={styles.cardTextLabel}>VaR 99% 3日（历史模拟法）</Text>
            <Row justify="space-between" align="bottom" style={{ marginTop: 12 }}>
              <Col>
                <Text className={styles.cardValueMain}>
                  {formatUSD(riskData.var99_3d.amount)}
                </Text>
                <Text className={styles.cardTextDesc}>绝对金额</Text>
              </Col>
              <Col>
                <Text className={styles.cardTextDesc}>绝对金额：占总资产百分比：{riskData.var99_3d.ratio}%</Text>
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
              {formatUSD(riskData.es)}
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
              {riskData.maxDrawdown}%
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
              {riskData.iv}%
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
              {riskData.vix}
            </Text>
          </Card>

          {/* 保证金使用率进度条 */}
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
                percent={riskData.marginRate}
                showInfo={false}
                strokeColor={
                  riskData.marginRate >= 90
                    ? '#ff4d4f'
                    : riskData.marginRate >= 80
                    ? '#faad14'
                    : '#1890ff'
                }
                trailColor="#222"
                size={[240, 18]}
              />
              <Text className={styles.progressTip}>超过80%橙黄色预警，超过90%红色强预警</Text>
              <Text className={styles.progressRateNum}>
                {riskData.marginRate}%
              </Text>
            </div>
          </Card>

          {/* 压力测试预估损失 双卡片并排 */}
          <Card
            styles={{ body: { padding: 20 }, header: { display: 'none' } }}
            className={styles.cardItem}
            style={{ marginTop: 16 }}
          >
            <Text className={styles.cardTextLabel}>压力测试预估损失</Text>
            <Row gutter={16} className={styles.stressBoxWrap}>
              <Col span={12} className={styles.stressBox}>
                <Text className={styles.cardTextDesc}>2020熔断场景：</Text>
                <Text className={styles.stressValue}>
                  {formatUSD(riskData.stress2020)}
                </Text>
              </Col>
              <Col span={12} className={styles.stressBox}>
                <Text className={styles.cardTextDesc}>加息暴跌场景：</Text>
                <Text className={styles.stressValue}>
                  {formatUSD(riskData.stressCrash)}
                </Text>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RiskDashboard;