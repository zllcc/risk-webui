import { useState, useEffect } from 'react';
import {
  Card, Tabs, Select, Table, Checkbox,
  Modal, Space, Typography, Row, Col
} from 'antd';
import ReactECharts from 'echarts-for-react';
// 引入封装好的筛选组件与类型
import FilterPanel, { FilterParams } from '@/components/FilterPanel';
// 引入持仓分配弹窗组件
import AllocatePositionModal, { PositionRowItem } from '@/components/AllocatePositionModal';

const { TabPane } = Tabs;
const { Option } = Select;
const { Title } = Typography;

// ====================== 模拟持仓表格数据（匹配持仓列表表头） ======================
const mockPositionData: PositionRowItem[] = [
  {
    id: 1,
    account: 'U123456',
    contract: 'AAPL',
    amount: 100,
    avgCostPrice: 152.35,
    marketPrice: 158.62,
    marketValue: 15862,
    updateTime: '2026-06-23 15:30:00',
    realizedProfit: 23600,
    unrealizedProfit: 627,
    unAllocateAmount: 10,
    totalAmount: 100
  },
  {
    id: 2,
    account: 'U654321',
    contract: 'MSFT',
    amount: 50,
    avgCostPrice: 320.10,
    marketPrice: 335.40,
    marketValue: 16770,
    updateTime: '2026-06-23 15:30:00',
    realizedProfit: 12500,
    unrealizedProfit: 765,
    unAllocateAmount: 0,
    totalAmount: 50
  }
];

// ====================== 所有可配置列（持仓列表表头，按图片1） ======================
const allColumns = [
  { key: "account", label: "账号" },
  { key: "contract", label: "合约" },
  { key: "amount", label: "数量" },
  { key: "avgCostPrice", label: "平均成本价" },
  { key: "marketPrice", label: "市场价格" },
  { key: "marketValue", label: "市场值" },
  { key: "updateTime", label: "最后更新时间" },
  { key: "realizedProfit", label: "实现盈亏" },
  { key: "unrealizedProfit", label: "未实现盈亏" },
  { key: "unAllocateAmount", label: "未分配数量" },
];

// ====================== 主页面 ======================
export default function AssetList() {
  const [activeTab, setActiveTab] = useState("股票");
  const [region, setRegion] = useState("CN");
  const [tableData, setTableData] = useState(mockPositionData);
  // 默认展示全部列
  const [visibleCols, setVisibleCols] = useState(allColumns.map(item => item.key));
  // 图表弹窗状态
  const [modalVisible, setModalVisible] = useState(false);
  const [chartTitle, setChartTitle] = useState("");
  const [chartType, setChartType] = useState("profit");

  // 分配弹窗状态
  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<PositionRowItem | null>(null);

  // 切换 Tab 加载对应数据（简化，统一展示持仓列表）
  useEffect(() => {
    setTableData(mockPositionData);
  }, [activeTab]);

  // 筛选查询回调
  const handleSearch = (params: FilterParams) => {
    console.log('资产列表筛选条件', params);
    setTableData(mockPositionData);
  };

  // 分配弹窗确认回调
  const handleAllocateConfirm = (pos: PositionRowItem, allocateList: any[]) => {
    console.log('执行分配操作', pos, allocateList);
    // 此处调用分配接口，成功后刷新表格数据
  };

  // 打开图表弹窗
  const showChart = (record, type) => {
    setChartTitle(`${record.contract} - ${type === "profit" ? "每日盈亏趋势" : "市值走势"}`);
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

      // 实现盈亏、未实现盈亏 点击打开盈亏图表
      if (["realizedProfit", "unrealizedProfit"].includes(col.key)) {
        item.render = (val: number, record: PositionRowItem) => (
          <a onClick={() => showChart(record, "profit")} style={{ color: val >= 0 ? "#f5222d" : "#52c41a" }}>
            {val >= 0 ? "+" : ""}{val.toLocaleString()}
          </a>
        );
      }

      // 市场值、数量、价格千分位格式化
      else if (["amount", "avgCostPrice", "marketPrice", "marketValue", "realizedProfit", "unrealizedProfit", "unAllocateAmount"].includes(col.key)) {
        item.render = (val: number) => val.toLocaleString();
      }

      return item;
    });

  return (
    <Card title={<Title level={5}>持仓列表</Title>}>
      {/* 1. 顶部筛选组件：账号/操盘人/策略/时间段查询 */}
      <FilterPanel onSearch={handleSearch} pageType="asset" />

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
      <div style={{ marginBottom: 16, padding: '8px 12px', borderRadius: 4 }}>
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

      {/* 4. 持仓表格，max-content 自适应横向滚动 */}
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

      {/* 6. 持仓分配弹窗组件 */}
      <AllocatePositionModal
        open={allocateModalOpen}
        data={currentPosition}
        onCancel={() => setAllocateModalOpen(false)}
        onConfirm={handleAllocateConfirm}
      />
    </Card>
  );
}