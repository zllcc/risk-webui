import React, { useState, useMemo } from 'react';
import {
  Card, Tabs, Button, Modal, Space, Typography, Row, Col
} from 'antd';
import { RightOutlined, CloseOutlined } from '@ant-design/icons';
import AccountModalContent from './compononts/AccountModalContent.tsx';
import ComponotsModel from './compononts/ComponotsModel.tsx'
import PortfolioChart from './compononts/PortfolioChart.tsx';
import HorizontalBarContribution from './compononts/HorizontalBar.tsx';
import DonutAssetPie from './compononts/DonutAssetPie.tsx';
import RiskVarPanel from './compononts/RiskVarPanel.tsx';
import FilterPanel, { FilterParams } from './compononts/FilterPanel.tsx';
// 引入抽离的绩效趋势图
import PerformanceTrendChart, { PerformanceMetric } from './compononts/PerformanceTrendChart.tsx';

const { TabPane } = Tabs;
const { Title, Text } = Typography;
const currentAccount = { id: 'U10726086', name: 'U10726086', type: '机构', totalAsset: 23590000, profitRate: -7.87, deposit: 0, withdraw: 0 };

// ===================== 类型定义 =====================
type TimeRange = '1D' | '7D' | 'MTD' | '1M' | 'QTD' | 'YTD' | '1Y';
const rangeList: TimeRange[] = ['1D', '7D', 'MTD', '1M', 'QTD', 'YTD', '1Y'];

interface TreeOption {
  value: string;
  label: string;
  idx?: string;
  children?: TreeOption[];
}

const originTreeData: TreeOption[] = [
  {
    value: 'num1',
    label: '账号一',
    children: [
      {
        value: 'zhangsan',
        label: '张三(操盘人)',
        children: [
          { value: 'str1', label: '策略一', idx: 'SPY' },
        ],
      },
    ],
  },
  {
    value: 'num2',
    label: '账号二',
    children: [
      {
        value: 'lisi',
        label: '李四(操盘人)',
        children: [
          { value: 'str1', label: '策略一', idx: 'SPY' },
          { value: 'str2', label: '策略二', idx: 'SPY' },
        ],
      },
    ],
  },
];

const PortfolioAnalysis: React.FC = () => {
  // 弹窗状态
  const [modalOpen, setModalOpen] = useState(false);
  const [componontsModalOpen, setComponontsModalOpen] = useState(false);

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
        <Button onClick={() => setComponontsModalOpen(true)}>配置图表组件</Button>
        <ComponotsModel open={componontsModalOpen} onCancel={() => setComponontsModalOpen(false)} />
      </Row>

      {/* 全局图表卡片栅格布局 */}
      <Row gutter={24}>
        {/* 1. 收益归因 */}
        <Col span={8}>
          <Card
            title={<CardHeader title="收益归因" cardKey="dash1" />}
          >
            <Text type="secondary">当前筛选账户数量：{activeFilter.accountKeys.length}</Text>
            <PortfolioChart filter={activeFilter} />
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
        <Col span={8}>
          <Card
            title={<CardHeader title="量化风险指标" cardKey="dash4" />}
          >
            <RiskVarPanel filter={activeFilter} />
          </Card>
        </Col>

        {/* 5. 衍生品希腊敞口总览 */}
        <Col span={8}>
          <Card
            title={<CardHeader title="衍生品希腊敞口总览" cardKey="dash5" />}
          >
            <Text type="secondary">Delta/Gamma/Vega/Theta 希腊值汇总图表</Text>
          </Card>
        </Col>

        {/* 6. 新增：总敞口总览卡片 */}
        <Col span={8}>
          <Card
            title={<CardHeader title="总敞口总览" cardKey="dash7" />}
          >
            <Text type="secondary">全品类总Delta、总风险敞口、多空对冲汇总图表</Text>
          </Card>
        </Col>

        {/* 7. 风险收益绩效比 - 6个Tab，每个Tab渲染独立趋势图组件 */}
        <Col span={8}>
          <Card
            title={<CardHeader title="风险收益绩效比" cardKey="dash6" />}
          >
            <Tabs activeKey={performanceTab} onChange={(k) => setPerformanceTab(k as PerformanceMetric)} size="small">
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
            </Tabs>
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