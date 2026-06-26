import { useState, useEffect } from 'react';
import {
  Card, Tabs, Select, Table, Button, Checkbox,
  Modal, Space, Typography, Row, Col, Pagination
} from 'antd';
import { FilterParams } from '@/components/FilterPanel';
import FilterPanel from '@/components/FilterPanel';
import TradeAllocateModal, { TradeRowItem } from '@/components/TradeAllocateModal';

const { TabPane } = Tabs;
const { Option } = Select;
const { Title, Text } = Typography;

// ====================== 模拟交易列表数据 ======================
const mockTradeData: TradeRowItem[] = [
  {
    id: 1,
    account: "U12345",
    contract: "AAPL",
    buySell: "买",
    quantity: 100,
    matchPrice: 192.56,
    profitLoss: 1260,
    fee: 35.6,
    currency: "USD",
    tradeTime: "2026-06-23 09:32:15",
    totalAmount: 100,
    unAllocateAmount: 10
  },
  {
    id: 2,
    account: "U12345",
    contract: "MSFT",
    buySell: "卖",
    quantity: 50,
    matchPrice: 428.12,
    profitLoss: -452,
    fee: 22.3,
    currency: "USD",
    tradeTime: "2026-06-23 10:15:42",
    totalAmount: 50,
    unAllocateAmount: 0
  },
  {
    id: 3,
    account: "U67890",
    contract: "SPX",
    buySell: "买",
    quantity: 10,
    matchPrice: 5421.30,
    profitLoss: 3680,
    fee: 18.9,
    currency: "USD",
    tradeTime: "2026-06-23 14:22:08",
    totalAmount: 10,
    unAllocateAmount: 5
  }
];

// ====================== 表格列配置（完全匹配截图表头） ======================
const allTradeColumns = [
  { key: "account", label: "账号" },
  { key: "contract", label: "合约" },
  { key: "buySell", label: "买卖" },
  { key: "quantity", label: "数量" },
  { key: "matchPrice", label: "成交单价" },
  { key: "profitLoss", label: "盈亏" },
  { key: "fee", label: "佣金及各项费用" },
  { key: "currency", label: "结算币种" },
  { key: "tradeTime", label: "成交时间" },
  { key: "unAllocateAmount", label: "未分配数量" },
  { key: "action", label: "操作" },
];

export default function TradeList() {
  // 筛选状态
  const [activeFilter, setActiveFilter] = useState<FilterParams | null>(null);
  const [activeTab, setActiveTab] = useState("股票");
  const [region, setRegion] = useState("CN");
  const [tableData, setTableData] = useState<TradeRowItem[]>(mockTradeData);
  // 表格字段显隐
  const [visibleCols, setVisibleCols] = useState(allTradeColumns.map(item => item.key));
  // 分页
  const [pageNum, setPageNum] = useState(2);
  // 分配弹窗
  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [currentTrade, setCurrentTrade] = useState<TradeRowItem | null>(null);

  // Tab切换刷新数据
  useEffect(() => {
    setTableData(mockTradeData);
  }, [activeTab]);

  // 筛选查询回调
  const handleSearch = (params: FilterParams) => {
    setActiveFilter(params);
    console.log('交易列表筛选条件', params);
    setTableData(mockTradeData);
  };

  // 打开分配弹窗
  const openAllocateDialog = (record: TradeRowItem) => {
    setCurrentTrade(record);
    setAllocateModalOpen(true);
  };

  // 分配提交回调
  const handleAllocateConfirm = (tradeInfo: TradeRowItem, allocateList: any[]) => {
    console.log('执行交易分配', tradeInfo, allocateList);
    // 此处对接分配接口，成功后刷新表格
  };

  // 动态生成表格列
  const tableColumns = allTradeColumns
    .filter(col => visibleCols.includes(col.key))
    .map(col => {
      const colConfig = {
        title: col.label,
        dataIndex: col.key,
        key: col.key,
      };

      // 操作列：分配按钮
      if (col.key === "action") {
        colConfig.render = (_val: any, record: TradeRowItem) => (
          <Button type="link" onClick={() => openAllocateDialog(record)}>分配</Button>
        );
      }

      // 盈亏正负颜色区分
      else if (col.key === "profitLoss") {
        colConfig.render = (val: number) => (
          <span style={{ color: val >= 0 ? "#f5222d" : "#52c41a" }}>
            {val >= 0 ? "+" : ""}{val.toLocaleString()}
          </span>
        );
      }

      // 金额/数字格式化
      else if (["quantity", "matchPrice", "profitLoss", "fee", "unAllocateAmount"].includes(col.key)) {
        colConfig.render = (val: number) => val.toLocaleString();
      }

      return colConfig;
    });

  return (
    <Card title={<Title level={5}>交易列表</Title>}>
      {/* 顶部筛选组件 */}
      <FilterPanel onSearch={handleSearch} pageType='asset' />

      {/* Tab + 地区下拉 */}
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

      {/* 表格字段勾选配置 */}
      <div style={{ marginBottom: 16, padding: '8px 12px', borderRadius: 4 }}>
        <Space align="baseline" wrap>
          <span style={{ fontWeight: 500 }}>表格显示字段：</span>
          <Checkbox.Group value={visibleCols} onChange={setVisibleCols}>
            <Space wrap size={[8, 6]}>
              {allTradeColumns.map(col => (
                <Checkbox key={col.key} value={col.key}>{col.label}</Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        </Space>
      </div>

      {/* 交易表格 */}
      <Table
        columns={tableColumns}
        dataSource={tableData}
        rowKey="id"
        bordered
        pagination={false}
        scroll={{ x: "max-content" }}
      />

      {/* 分页组件（匹配截图底部分页） */}
      <Row justify="end" style={{ marginTop: 16 }}>
        <Pagination
          current={pageNum}
          total={15}
          pageSize={3}
          onChange={(page) => setPageNum(page)}
        />
      </Row>

      {/* 交易分配弹窗 */}
      <TradeAllocateModal
        open={allocateModalOpen}
        tradeData={currentTrade}
        onCancel={() => setAllocateModalOpen(false)}
        onConfirm={handleAllocateConfirm}
      />
    </Card>
  );
}