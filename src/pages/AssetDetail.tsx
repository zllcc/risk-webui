// AssetDetail.jsx
import { Card, Row, Col } from 'antd';
import LineChartNavBench from './compononts/LineChart.tsx';
import BarChartPeriodReturn from './compononts/BarChart.tsx';
import HorizontalBarContribution from './compononts/HorizontalBar.tsx';
import PieFirstLayer from './compononts/PieFirstLayer';
export default function AssetDetail() {
  return (
    <Card title="详情">
      <Row gutter={[24,24]}>
        {/* 双折线图 整行 */}
        <Col span={24}>
          <LineChartNavBench />
        </Col>
        {/* 月度柱状 + 横向条形 左右分栏 */}
        <Col span={12}>
          <BarChartPeriodReturn />
        </Col>
        <Col span={12}>
          <HorizontalBarContribution />
        </Col>
        {/* 两级饼图 左右分栏 */}
        <Col span={12}>
          <PieFirstLayer />
        </Col>
      </Row>
    </Card>
  );
}