import { useState, useEffect } from 'react';
import {
  Card, Tabs, Select, Table, Button, Checkbox,
  Modal, Form, Space, Tag, Typography, Row, Col
} from 'antd';
import {
  SettingOutlined, BarChartOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
// 引入封装好的筛选组件与类型
import FilterPanel, { FilterParams } from './compononts/FilterPanel.tsx';

const { TabPane } = Tabs;
const { Option } = Select;
const { Title } = Typography;

// ====================== 模拟数据 ======================
const mockData = {
  "标准资产": [
    { id: 1, name: "标准债权A", principal: 1000000, loan: 200000, cost: 980000, dailyProfit: 12500, totalProfit: 86400, marketValue: 1080000, amount: 10000, rate: "4.2%" },
    { id: 2, name: "标准债权B", principal: 2000000, loan: 400000, cost: 1920000, dailyProfit: -8200, totalProfit: 42100, marketValue: 2042000, amount: 20000, rate: "3.8%" },
  ],
  "非标资产": [
    { id: 3, name: "信托计划X", principal: 5000000, loan: 0, cost: 4850000, dailyProfit: 28100, totalProfit: 326800, marketValue: 5326800, amount: 5000, rate: "5.6%" },
  ],
  "股票": [
    { id: 4, name: "贵州茅台", principal: 320000, loan: 0, cost: 305200, dailyProfit: -6280, totalProfit: 28400, marketValue: 348400, amount: 2000, rate: "+8.2%" },
    { id: 5, name: "宁德时代", principal: 240000, loan: 0, cost: 231500, dailyProfit: 4150, totalProfit: 18200, marketValue: 258200, amount: 3000, rate: "+7.0%" },
  ],
  "债券": [
    { id: 6, name: "国开债2401", principal: 1500000, loan: 0, cost: 1476000, dailyProfit: 3850, totalProfit: 42300, marketValue: 1542300, amount: 15000, rate: "2.9%" },
  ],
  "期货": [
    { id: 7, name: "螺纹钢2405", principal: 800000, loan: 4000000, cost: 786000, dailyProfit: 18420, totalProfit: 58900, marketValue: 858900, amount: 40, rate: "+7.0%" },
  ],
  "期权": [
    { id: 8, name: "50ETF购2.8", principal: 120000, loan: 0, cost: 114200, dailyProfit: 6850, totalProfit: 21300, marketValue: 141300, amount: 50000, rate: "+15.1%" },
  ]
};

// ====================== 所有可配置列 ======================
const allColumns = [
  { key: "name", label: "资产名称" },
  { key: "principal", label: "本金" },
  { key: "loan", label: "贷款" },
  { key: "cost", label: "持仓成本" },
  { key: "dailyProfit", label: "每日盈亏" },
  { key: "totalProfit", label: "累计盈亏" },
  { key: "marketValue", label: "市值" },
  { key: "amount", label: "持仓数量" },
  { key: "rate", label: "收益率" },
];

// ====================== 主页面 ======================
export default function AssetList() {
  // 筛选组件生效参数
  const [activeFilter, setActiveFilter] = useState<FilterParams | null>(null);
  const [activeTab, setActiveTab] = useState("标准资产");
  const [region, setRegion] = useState("CN");
  const [tableData, setTableData] = useState([]);
  // 默认展示列
  const [visibleCols, setVisibleCols] = useState(["name", "principal", "dailyProfit", "marketValue", "amount"]);
  const [modalVisible, setModalVisible] = useState(false);
  const [chartTitle, setChartTitle] = useState("");
  const [chartType, setChartType] = useState("profit");

  // 切换 Tab 加载对应数据
  useEffect(() => {
    setTableData(mockData[activeTab] || []);
  }, [activeTab]);

  // 筛选查询回调
  const handleSearch = (params: FilterParams) => {
    setActiveFilter(params);
    console.log('资产列表筛选条件', params);
    // 真实场景：根据账号/操盘人/策略/时间重新请求资产接口
    setTableData(mockData[activeTab] || []);
  };

  // 打开图表弹窗
  const showChart = (record, type) => {
    setChartTitle(`${record.name} - ${type === "profit" ? "每日盈亏趋势" : "市值走势"}`);
    setChartType(type);
    setModalVisible(true);
  };

  // 图表配置
  const getChartOption = () => {
    const xData = ["1日", "2日", "3日", "4日", "5日", "6日", "7日"];
    const profitData = [12500, -8200, 6300, -4100, 9200, 5400, 6850];
    const valueData = [102, 105, 103, 107, 106, 109, 112];

    return {
      tooltip: { trigger: "axis" },
      xAxis: { data: xData },
      yAxis: {},
      series: [{
        type: "line",
        smooth: true,
        data: chartType === "profit" ? profitData : valueData,
        lineStyle: { width: 2 },
        itemStyle: { color: chartType === "profit" ? "#3498db" : "#e74c3c" }
      }]
    };
  };

  // 动态生成表格列
  const tableColumns = allColumns
    .filter(col => visibleCols.includes(col.key))
    .map(col => {
      const item = {
        title: col.label,
        dataIndex: col.key,
        key: col.key,
      };

      // 每日盈亏 点击弹窗
      if (col.key === "dailyProfit") {
        item.render = (val, record) => (
          <a onClick={() => showChart(record, "profit")} style={{ color: val >= 0 ? "#f5222d" : "#52c41a" }}>
            {val >= 0 ? "+" : ""}{val.toLocaleString()}
          </a>
        );
      }
      // 市值 点击弹窗
      else if (col.key === "marketValue") {
        item.render = (val, record) => (
          <a onClick={() => showChart(record, "value")} style={{ color: "#1890ff" }}>
            {val.toLocaleString()}
          </a>
        );
      }
      // 金额千分位格式化
      else if (["principal", "loan", "cost", "totalProfit"].includes(col.key)) {
        item.render = (val) => val.toLocaleString();
      }

      return item;
    });

  return (
    <Card title={<Title level={5}>资产全品类列表</Title>}>
      {/* 1. 顶部筛选组件：账号/操盘人/策略/时间段查询 */}
      <FilterPanel onSearch={handleSearch} />

      {/* 2. 资产分类Tab + 地区下拉 */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16, marginTop: 16 }}>
        <Col>
          <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
            <TabPane tab="标准资产" key="标准资产" />
            <TabPane tab="非标资产" key="非标资产" />
            <TabPane tab="股票" key="股票" />
            <TabPane tab="债券" key="债券" />
            <TabPane tab="期货" key="期货" />
            <TabPane tab="期权" key="期权" />
          </Tabs>
        </Col>
        <Col>
          <Select
            value={region}
            onChange={setRegion}
            style={{ width: 160 }}
            placeholder="国家/地区"
          >
            <Option value="CN">中国大陆</Option>
            <Option value="HK">中国香港</Option>
            <Option value="US">美国</Option>
            <Option value="EU">欧洲</Option>
          </Select>
        </Col>
      </Row>

      {/* 3. 表头字段配置，移至表格上方独立区域 */}
      <div style={{ marginBottom: 16, padding: '8px 12px', background: '#f7f8fa', borderRadius: 4 }}>
        <Space align="baseline" wrap>
          <span style={{ fontWeight: 500 }}>表格显示字段：</span>
          <Checkbox.Group
            value={visibleCols}
            onChange={setVisibleCols}
          >
            <Space wrap size={[8, 6]}>
              {allColumns.map(col => (
                <Checkbox key={col.key} value={col.key}>{col.label}</Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        </Space>
      </div>

      {/* 4. 资产表格，max-content 自适应横向滚动 */}
      <Table
        columns={tableColumns}
        dataSource={tableData}
        rowKey="id"
        bordered
        pagination={false}
        scroll={{ x: "max-content" }}
      />

      {/* 5. 单资产趋势图表弹窗 */}
      <Modal
        title={chartTitle}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <ReactECharts option={getChartOption()} style={{ height: 400 }} />
      </Modal>
    </Card>
  );
}