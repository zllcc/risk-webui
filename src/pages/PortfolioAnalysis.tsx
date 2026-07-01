import React, { useState } from 'react';
import {
  Card, Tabs, Button, Modal, Typography, Row, Col
} from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import AccountModalContent from '@/components/AccountModalContent';
import ComponotsModel from '@/components/CompModel'
import AttributionHeatChart from '@/components/AttributionHeatChart';
import HorizontalBarContribution from '@/components/HorizontalBar';
import DonutAssetPie from '@/components/DonutAssetPie';
import RiskDashboard from '@/components/RiskVarPanel';
import FilterPanel, { FilterParams } from '@/components/FilterPanel';
import RiskGreekDashboard from '@/components/RiskGreekDashboard';
import PerformanceRatioTable from '@/components/PerformanceRatioTable';


const { TabPane } = Tabs;
const { Title, Text } = Typography;

const PortfolioAnalysis: React.FC = () => {
  // 弹窗状态
  const [modalOpen, setModalOpen] = useState(false);
  const [componentsModalOpen, setcomponentsModalOpen] = useState(false);

    // 组件展示状态
  const [selectedKeys, setSelectedKeys] = useState<string[]>([
    'attribution',
    'attrRanking',
    'concentration',
    'quantitativeRisk',
    'greek',
    'riskReward'
  ]);

  // 卡片内部Tab激活key
  const [concentrationTab, setConcentrationTab] = useState('asset');

  // 全局生效筛选参数
  const [activeFilter, setActiveFilter] = useState<FilterParams>({
    accountKeys: [],
    traderKeys: [],
    strategyKeys: [],
    timeQuick: 'MTD',
    customDate: null,
    benchmarkType: 'default'
  });

  // 卡片头部复用组件
  const CardHeader = ({ title }: { title: string; }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Title level={5} style={{ margin: 0 }}>{title}</Title>
    </div>
  );

  // FilterPanel 查询回调
  const handleSearch = (params: FilterParams) => {
    setActiveFilter(params);
    console.log('全局筛选条件更新', params);
  };

  const onOk = (params: any) => {
    setSelectedKeys(params.selectedKeys);
    setcomponentsModalOpen(false);
  };

  const cardArray = [
    {
      key: 'attribution',
      title: '收益归因',
      span: 8,
      content:
      <>
        <Text type="secondary">当前筛选账户数量：{activeFilter.accountKeys.length}</Text>
        <AttributionHeatChart filter={activeFilter} />
      </>
    },
    {
      key: 'attrRanking',
      title: '归因排名',
      span: 8,
      content: <HorizontalBarContribution filter={activeFilter} />,
    },
    {
      key: 'concentration',
      title: '集中度风险',
      span: 8, 
      content: (
        <Tabs activeKey={concentrationTab} onChange={setConcentrationTab} size="small">
          <TabPane tab="资产占比环形图" key="asset">
            <DonutAssetPie filter={activeFilter} chartType="asset" />
          </TabPane>
          <TabPane tab="风险占比环形图" key="risk">
            <DonutAssetPie filter={activeFilter} chartType="risk" />
          </TabPane>
        </Tabs>
      ),
    },
    {
      key: 'quantitativeRisk',
      title: '量化风险指标',
      span: 16,
      content: <RiskDashboard filter={activeFilter} />,
    },
    {
      key: 'greek',
      title: '衍生品希腊敞口总览',
      span: 24,
      content: <RiskGreekDashboard />,
    },
    {
      key: 'riskReward',
      title: '风险收益绩效比',
      span: 24,
      content: <PerformanceRatioTable />,
    }
  ];

  return (
    <Card title={<Title level={5}>投资组合分析</Title>}>
      {/* 顶部独立筛选组件 */}
      <FilterPanel onSearch={handleSearch} pageType="analysis" />

      {/* 右上角：组件配置弹窗按钮 */}
      <Row justify="end" style={{ padding: '0 0 24px' }}>
        <Button onClick={() => setcomponentsModalOpen(true)}>配置组件</Button>
        <ComponotsModel
          open={componentsModalOpen}
          onCancel={() => setcomponentsModalOpen(false)}
          onOk={(params: any) => onOk(params)}
        />
      </Row>

      {/* 全局图表卡片栅格布局 */}
      <Row gutter={[24, 8]}>

        {cardArray.map(card => (
          selectedKeys.includes(card.key) &&
          <Col span={card.span} key={card.key}>
            <Card
              title={<CardHeader title={card.title} />}
            >
              {card.content}
            </Card>
          </Col>
        ))}
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