import React, { useState, useMemo } from 'react';
import { Card, Table, Typography, Checkbox, Space, Row, Col } from 'antd';
import dayjs from 'dayjs';
import FilterPanel, { FilterParams } from '@/components/FilterPanel';
import PortfolioChart from '@/components/PortfolioChart';

const { Title } = Typography;

const allFieldList = [
  { key: "group", label: "组别", defaultShow: true },
  { key: "inputCapital", label: "投入本金", defaultShow: true },
  { key: "yearCapital", label: "本年本金", defaultShow: true },
  { key: "marketValue", label: "市值", defaultShow: true },
  { key: "deltaGap", label: "Delta敞口", defaultShow: true },
  { key: "cash", label: "现金", defaultShow: true },
  { key: "loan", label: "贷款", defaultShow: true },
  { key: "realized", label: "费前已实现", defaultShow: true },
  { key: "unrealized", label: "费前未实现", defaultShow: true },
  { key: "fee", label: "费用类", defaultShow: true },
  { key: "totalProfit", label: "总盈亏", defaultShow: true },
  { key: "rate", label: "增长率", defaultShow: true },
  { key: "deltaRate", label: "Delta增长率", defaultShow: true },
  { key: "excessRate", label: "超额收益率", defaultShow: true },
];

const mockOriginData = [
  { group: "自营小计", inputCapital: 37564995, yearCapital: 33287321, marketValue: 75853631, deltaGap: 9231393, cash: 42518715, loan: 0, realized: 0, unrealized: 0, fee: 0, totalProfit: 5553720, rate: 0.1373, deltaRate: 0.1373, excessRate: 0.0015 },
  { group: "郭老师", inputCapital: 18561800, yearCapital: 17485955, marketValue: 58731128, deltaGap: 5632672, cash: 23118627, loan: 0, realized: 0, unrealized: 0, fee: 0, totalProfit: 4557027, rate: 0.2262, deltaRate: 0.2262, excessRate: -0.0002 },
  { group: "贺总组", inputCapital: 1896851, yearCapital: 1962363, marketValue: 1962363, deltaGap: 1106, cash: 1963469, loan: 0, realized: 0, unrealized: 0, fee: 0, totalProfit: 66617, rate: 0.0367, deltaRate: 0.0367, excessRate: 0.0203 },
  { group: "裘欣组", inputCapital: 8360671, yearCapital: 6653248, marketValue: 8446000, deltaGap: 2714047, cash: 9367294, loan: 0, realized: 0, unrealized: 0, fee: 0, totalProfit: 1006623, rate: 0.1204, deltaRate: 0.1204, excessRate: 0.0081 },
  { group: "陈总组", inputCapital: 3950986, yearCapital: 2157086, marketValue: 1812191, deltaGap: 1310660, cash: 3467746, loan: 0, realized: 0, unrealized: 0, fee: 0, totalProfit: -483240, rate: -0.1157, deltaRate: -0.1157, excessRate: 0.0326 },
  { group: "张全斌", inputCapital: 1108303, yearCapital: 125483, marketValue: 125483, deltaGap: 974605, cash: 110087, loan: 0, realized: 0, unrealized: 0, fee: 0, totalProfit: -8215, rate: -0.0074, deltaRate: -0.0074, excessRate: -0.0089 },
  { group: "胡总", inputCapital: 1139309, yearCapital: 1027027, marketValue: 1009260, deltaGap: -127981, cash: 899047, loan: 0, realized: 0, unrealized: 0, fee: 0, totalProfit: 359738, rate: 0.0435, deltaRate: 0.0435, excessRate: 0.0133 },
  { group: "William", inputCapital: 119814, yearCapital: 12607, marketValue: 12607, deltaGap: 119965, cash: 132572, loan: 0, realized: 0, unrealized: 0, fee: 0, totalProfit: 12758, rate: 0.1068, deltaRate: 0.1068, excessRate: -0.0070 },
  { group: "黄金海", inputCapital: 495832, yearCapital: 478532, marketValue: 349017, deltaGap: 93244, cash: 571776, loan: 0, realized: 0, unrealized: 0, fee: 0, totalProfit: 75944, rate: 0.1532, deltaRate: 0.1532, excessRate: -0.0035 },
  { group: "郭老师其他", inputCapital: 3367682, yearCapital: 1025365, marketValue: 1025365, deltaGap: 2390317, cash: 3415681, loan: 0, realized: 0, unrealized: 0, fee: 0, totalProfit: 47999, rate: 0.0148, deltaRate: 0.0148, excessRate: -0.0124 },
  { group: "KUKA", inputCapital: 2081107, yearCapital: 1277104, marketValue: 1277104, deltaGap: 738054, cash: 2015158, loan: 0, realized: 0, unrealized: 0, fee: 0, totalProfit: -65949, rate: -0.0329, deltaRate: -0.0329, excessRate: -0.0181 },
  { group: "其他（利息等）", inputCapital: -3942326, yearCapital: 619631, marketValue: 619631, deltaGap: -646844, cash: -4027214, loan: 0, realized: 0, unrealized: 0, fee: 0, totalProfit: -84888, rate: -0.1714, deltaRate: -0.1714, excessRate: -0.0175 },
  { group: "FOF小计", inputCapital: 37564995, yearCapital: 33287321, marketValue: 75853631, deltaGap: 9231393, cash: 42518715, loan: 0, realized: 0, unrealized: 0, fee: 0, totalProfit: 5553720, rate: 0.1373, deltaRate: 0.1373, excessRate: 0.0015 },
  { group: "境外", inputCapital: 18561800, yearCapital: 17485955, marketValue: 58731128, deltaGap: 5632672, cash: 23118627, loan: 0, realized: 0, unrealized: 0, fee: 0, totalProfit: 4557027, rate: 0.2262, deltaRate: 0.2262, excessRate: -0.0002 },
  { group: "境内", inputCapital: 1896851, yearCapital: 1962363, marketValue: 1962363, deltaGap: 1106, cash: 1963469, loan: 0, realized: 0, unrealized: 0, fee: 0, totalProfit: 66617, rate: 0.0367, deltaRate: 0.0367, excessRate: 0.0203 },
  { group: "固收小计", inputCapital: 37564995, yearCapital: 33287321, marketValue: 75853631, deltaGap: 9231393, cash: 42518715, loan: 0, realized: 0, unrealized: 0, fee: 0, totalProfit: 5553720, rate: 0.1373, deltaRate: 0.1373, excessRate: 0.0015 },
  { group: "其他小计", inputCapital: 37564995, yearCapital: 33287321, marketValue: 75853631, deltaGap: 9231393, cash: 42518715, loan: 0, realized: 0, unrealized: 0, fee: 0, totalProfit: 5553720, rate: 0.1373, deltaRate: 0.1373, excessRate: 0.0015 },
];

// 指标卡片子组件
const MetricCard: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
  <div style={{
    background: 'rgb(204, 235, 255, 0.4)',
    padding: '16px 12px',
    borderRadius: 4,
    textAlign: 'center',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  }}>
    <div style={{ fontSize: 14, marginBottom: 8 }}>{title}</div>
    <div style={{ fontSize: 18, fontWeight: 500 }}>{value}</div>
  </div>
);

export default function PortfolioOverview() {
  const defaultCheckedKeys = allFieldList.filter((item) => item.defaultShow).map((item) => item.key);
  const [checkedFieldKeys, setCheckedFieldKeys] = useState<string[]>(defaultCheckedKeys);
  const [activeFilter, setActiveFilter] = useState<FilterParams | null>(null);
  const [tableData, setTableData] = useState(mockOriginData);

  const dynamicTableColumns = useMemo(() => {
    return allFieldList
      .filter((fieldItem) => checkedFieldKeys.includes(fieldItem.key))
      .map((fieldItem) => {
        const baseCol = {
          title: fieldItem.label,
          dataIndex: fieldItem.key,
          key: fieldItem.key,
        };
        if (fieldItem.key === "group") return baseCol;
        if (["rate", "deltaRate", "excessRate"].includes(fieldItem.key)) {
          return {
            ...baseCol,
            render: (val: number) => `${(val * 100).toFixed(2)}%`,
          };
        }
        if (fieldItem.key === "totalProfit") {
          return {
            ...baseCol,
            render: (val: number) => (
              <span style={{ color: val >= 0 ? "#f5222d" : "#52c41a" }}>
                {val >= 0 ? "+" : ""}{val.toLocaleString()}
              </span>
            ),
          };
        }
        return {
          ...baseCol,
          render: (val: number) => val.toLocaleString(),
        };
      });
  }, [checkedFieldKeys]);

  // 筛选后汇总计算4个指标
  const summaryMetrics = useMemo(() => {
    if (!activeFilter) {
      return {
        profitAmount: '--',
        deltaRate: '--',
        rate: '--',
        excessRate: '--'
      };
    }
    // 模拟根据筛选条件过滤数据后汇总
    const totalProfit = tableData.reduce((sum, item) => sum + item.totalProfit, 0);
    const avgDeltaRate = tableData.reduce((sum, item) => sum + item.deltaRate, 0) / tableData.length;
    const avgRate = tableData.reduce((sum, item) => sum + item.rate, 0) / tableData.length;
    const avgExcessRate = tableData.reduce((sum, item) => sum + item.excessRate, 0) / tableData.length;

    return {
      profitAmount: totalProfit.toLocaleString(),
      deltaRate: `${(avgDeltaRate * 100).toFixed(2)}%`,
      rate: `${(avgRate * 100).toFixed(2)}%`,
      excessRate: `${(avgExcessRate * 100).toFixed(2)}%`
    };
  }, [activeFilter, tableData]);

  const handleSearch = (params: FilterParams) => {
    setActiveFilter(params);
    console.log('筛选参数', params);
    setTableData([...mockOriginData]);
  };

  return (
    <Card title={<Title level={5}>组合总览</Title>}>
      {/* 1. 顶部筛选区域 */}
      <FilterPanel onSearch={handleSearch} />

      {/* 2. 新增：4个总览指标卡片，和截图布局一致 */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <MetricCard title="收益额" value={summaryMetrics.profitAmount} />
        </Col>
        <Col span={6}>
          <MetricCard title="Delta收益率" value={summaryMetrics.deltaRate} />
        </Col>
        <Col span={6}>
          <MetricCard title="收益率" value={summaryMetrics.rate} />
        </Col>
        <Col span={6}>
          <MetricCard title="超额收益率" value={summaryMetrics.excessRate} />
        </Col>
      </Row>

      {/* 3. 表格字段选择区 */}
      <div style={{ marginBottom: 12 }}>
        <Space size="small" align="baseline" wrap>
          <span>表格显示字段：</span>
          <Checkbox.Group value={checkedFieldKeys} onChange={setCheckedFieldKeys}>
            <Space wrap size={[8, 4]}>
              {allFieldList.map((item) => (
                <Checkbox key={item.key} value={item.key}>
                  {item.label}
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        </Space>
      </div>

      {/* 4. 汇总表格 */}
      <Table
        bordered
        columns={dynamicTableColumns}
        dataSource={tableData}
        rowKey="group"
        pagination={false}
        scroll={{ x: "max-content" }}
        size="middle"
        style={{ marginBottom: 24 }}
      />

      {/* 5. 图表区域 */}
      <PortfolioChart filter={activeFilter} />
    </Card>
  );
}