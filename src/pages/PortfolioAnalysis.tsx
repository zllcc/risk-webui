import React, { useState, useMemo } from 'react';
import {
  Card, Tabs, Button, Modal, Space, Typography, Row, Col
} from 'antd';
import { RightOutlined, CloseOutlined } from '@ant-design/icons';
import AccountModalContent from '@/components/AccountModalContent';
import ComponotsModel from '@/components/CompModel'
import AttributionHeatChart from '@/components/AttributionHeatChart';
import HorizontalBarContribution from '@/components/HorizontalBar';
import DonutAssetPie from '@/components/DonutAssetPie';
import RiskDashboard from '@/components/RiskVarPanel';
import FilterPanel, { FilterParams } from '@/components/FilterPanel';
// 引入抽离的绩效趋势图
import PerformanceTrendChart, { PerformanceMetric } from '@/components/PerformanceTrendChart';
import RiskGreekDashboard from '@/components/RiskGreekDashboard';
import PerformanceRatioTable from '@/components/PerformanceRatioTable';
import TotalGreekExposure from '@/components/TotalGreekExposure';


const { TabPane } = Tabs;
const { Title, Text } = Typography;

const PortfolioAnalysis: React.FC = () => {
  // 弹窗状态
  const [modalOpen, setModalOpen] = useState(false);
  const [componentsModalOpen, setcomponentsModalOpen] = useState(false);

  // 卡片折叠状态（新增dash7总敞口卡片）
  const [collapse, setCollapse] = useState({
    dash1: false, dash2: false, dash3: false, dash4: false, dash5: false, dash6: false, dash7: false,
  });

  // 卡片内部Tab激活key
  const [concentrationTab, setConcentrationTab] = useState('asset');
  const [performanceTab, setPerformanceTab] = useState<PerformanceMetric>('sharpe');

  // 全局生效筛选参数
  const [activeFilter, setActiveFilter] = useState<FilterParams>({
    accountKeys: [],
    traderKeys: [],
    strategyKeys: [],
    timeQuick: 'MTD',
    customDate: null,
    benchmarkType: 'default'
  });

  // 切换卡片折叠
  const toggleCard = (key: keyof typeof collapse) => {
    setCollapse(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // 卡片头部复用组件
  const CardHeader = ({ title, cardKey }: { title: string; cardKey: keyof typeof collapse }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Title level={5} style={{ margin: 0 }}>{title}</Title>
      <RightOutlined
        rotate={collapse[cardKey] ? 90 : 0}
        onClick={() => toggleCard(cardKey)}
        style={{ cursor: 'pointer', transition: '0.2s' }}
      />
    </div>
  );

  // FilterPanel 查询回调
  const handleSearch = (params: FilterParams) => {
    setActiveFilter(params);
    console.log('全局筛选条件更新', params);
  };

  return (
    <Card title={<Title level={5}>投资组合分析</Title>}>
      {/* 顶部独立筛选组件 */}
      <FilterPanel onSearch={handleSearch} />

      {/* 右上角：组件配置弹窗按钮 */}
      <Row justify="end" style={{ padding: '0 0 24px' }}>
        <Button onClick={() => setcomponentsModalOpen(true)}>配置组件</Button>
        <ComponotsModel open={componentsModalOpen} onCancel={() => setcomponentsModalOpen(false)} />
      </Row>

      {/* 全局图表卡片栅格布局 */}
      <Row gutter={[24, 8]}>
        {/* 1. 收益归因 */}
        <Col span={8}>
          <Card
            title={<CardHeader title="收益归因" cardKey="dash1" />}
          >
            <Text type="secondary">当前筛选账户数量：{activeFilter.accountKeys.length}</Text>
            <AttributionHeatChart filter={activeFilter} />
          </Card>
        </Col>

        {/* 2. 归因排名 */}
        <Col span={8}>
          <Card
            title={<CardHeader title="归因排名" cardKey="dash2" />}
          >
            <HorizontalBarContribution filter={activeFilter} />
          </Card>
        </Col>

        {/* 3. 集中度风险 - 双Tab环形饼图 */}
        <Col span={8}>
          <Card
            title={<CardHeader title="集中度风险" cardKey="dash3" />}
          >
            <Tabs activeKey={concentrationTab} onChange={setConcentrationTab} size="small">
              <TabPane tab="资产占比环形图" key="asset">
                <DonutAssetPie filter={activeFilter} chartType="asset" />
              </TabPane>
              <TabPane tab="风险占比环形图" key="risk">
                <DonutAssetPie filter={activeFilter} chartType="risk" />
              </TabPane>
            </Tabs>
          </Card>
        </Col>

        {/* 4. 量化风险指标 */}
        <Col span={16}>
          <Card
            title={<CardHeader title="量化风险指标" cardKey="dash4" />}
          >
            <RiskDashboard filter={activeFilter} />
          </Card>
        </Col>

        {/* 6. 新增：总敞口总览卡片 */}
        <Col span={8}>
          <Card
            title={<CardHeader title="总敞口总览" cardKey="dash7" />}
          >
            {/* <TotalGreekExposure /> */}
          </Card>
        </Col>

        {/* 5. 衍生品希腊敞口总览 */}
        <Col span={24}>
          <Card
            title={<CardHeader title="衍生品希腊敞口总览" cardKey="dash5" />}
          >
            <RiskGreekDashboard />
          </Card>
        </Col>

        {/* 7. 风险收益绩效比 - 6个Tab，每个Tab渲染独立趋势图组件 */}
        <Col span={24}>
          <Card
            title={<CardHeader title="风险收益绩效比" cardKey="dash6" />}
          >
            <PerformanceRatioTable />
            {/* <Tabs activeKey={performanceTab} onChange={(k) => setPerformanceTab(k as PerformanceMetric)} size="small">
              <TabPane tab="夏普比率" key="sharpe">
                <PerformanceTrendChart filter={activeFilter} metric="sharpe" />
              </TabPane>
              <TabPane tab="索提诺比率" key="sortino">
                <PerformanceTrendChart filter={activeFilter} metric="sortino" />
              </TabPane>
              <TabPane tab="卡玛比率" key="calmar">
                <PerformanceTrendChart filter={activeFilter} metric="calmar" />
              </TabPane>
              <TabPane tab="盈亏比" key="winloss">
                <PerformanceTrendChart filter={activeFilter} metric="winloss" />
              </TabPane>
              <TabPane tab="风险占比" key="varRatio">
                <PerformanceTrendChart filter={activeFilter} metric="varRatio" />
              </TabPane>
              <TabPane tab="波动率溢价" key="ivSpread">
                <PerformanceTrendChart filter={activeFilter} metric="ivSpread" />
              </TabPane>
            </Tabs> */}
          </Card>
        </Col>
      </Row>

      {/* 选择账户弹窗 */}
      <Modal
        title="选择账户"
        open={modalOpen}
        width={480}
        footer={null}
        closeIcon={<CloseOutlined />}
        onCancel={() => setModalOpen(false)}
      >
        <AccountModalContent />
      </Modal>
    </Card>
  );
};

export default PortfolioAnalysis;