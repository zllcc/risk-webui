import { useState, useEffect, useCallback } from 'react';
import {
  Card, Tabs, Select, Table, Checkbox,
  Space, Typography, Row, Col, message
} from 'antd';
// 引入封装好的筛选组件与类型
import FilterPanel, { FilterParams } from '@/components/FilterPanel';
import { secTypeArr } from '@/utils/common';
import { getPositionList, PositionRecord, PositionQueryParams } from '@/api/positionApi';

const { TabPane } = Tabs;
const { Option } = Select;
const { Title } = Typography;

// ====================== 所有可配置列 ======================
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

// 后端数据 → 前端表格行转换
const transformPositionRecord = (item: PositionRecord) => {
  return {
    id: item.id,
    account: item.accountCode,
    contract: item.symbol,
    amount: item.positionQty,
    avgCostPrice: item.avgCost,
    marketPrice: item.marketPrice,
    marketValue: item.marketValue,
    updateTime: new Date().toLocaleString(), // TODO：后端无更新时间，临时填充
    realizedProfit: item.realizedPnl,
    unrealizedProfit: item.unrealizedPnl,
    unAllocateAmount: item.remainQty,
    totalAmount: item.positionQty
  };
};

// ====================== 主页面 ======================
export default function AssetList() {
  // Tab证券类型
  const [activeTab, setActiveTab] = useState("STK");
  const [region, setRegion] = useState("CN");
  // 表格数据、加载态、分页
  const [tableData, setTableData] = useState<ReturnType<typeof transformPositionRecord>[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageTotal, setPageTotal] = useState(0);
  const pageSize = 10;

  // 默认展示全部列
  const [visibleCols, setVisibleCols] = useState(allColumns.map(item => item.key));

  // 缓存筛选条件
  const [searchParams, setSearchParams] = useState<FilterParams | null>(null);

  // 请求持仓接口
  const fetchPositionData = useCallback(async () => {
    setLoading(true);
    try {
      // 组装完整接口入参，新增tradeNames/strategyNames/startDate/endDate/sectors
      const apiParams: PositionQueryParams = {
        pageNum,
        pageSize,
        orderColumn: "id",
        orderType: "desc",
        idList: [],
        accountCodes: searchParams?.accountCodes ?? [],
        conids: [],
        secType: activeTab,
        // 新增筛选字段，无值时兜底空数组/空字符串
        tradeNames: searchParams?.tradeNames ?? [],
        strategyNames: searchParams?.strategyNames ?? [],
        startDate: searchParams?.startDate ?? "",
        endDate: searchParams?.endDate ?? "",
        sectors: searchParams?.sectorKeys ?? [],
      };
      const res = await getPositionList(apiParams);
      // 转换后端数据
      const list = res.records.map(transformPositionRecord);
      setTableData(list);
      setPageTotal(res.total);
    } catch (err) {
      console.error('加载持仓列表失败', err);
      message.error('数据加载失败，请稍后重试');
      setTableData([]);
      setPageTotal(0);
    } finally {
      setLoading(false);
    }
  }, [pageNum, activeTab, searchParams]);

  // 切换Tab/页码/筛选条件 重新请求
  useEffect(() => {
    fetchPositionData();
  }, [fetchPositionData]);

  // 筛选查询回调
  const handleSearch = (params: FilterParams) => {
    setSearchParams(params);
    setPageNum(1); // 查询重置到第一页
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

      // 盈亏仅展示颜色，移除点击图表跳转逻辑
      if (["realizedProfit", "unrealizedProfit"].includes(col.key)) {
        item.render = (val: number) => (
          <span style={{ color: val >= 0 ? "#f5222d" : "#52c41a" }}>
            {val >= 0 ? "+" : ""}{val?.toLocaleString() ?? 0}
          </span>
        );
      }

      // 数值千分位格式化
      else if (["amount", "avgCostPrice", "marketPrice", "marketValue", "unAllocateAmount"].includes(col.key)) {
        item.render = (val: number) => val?.toLocaleString() ?? 0;
      }

      return item;
    });

  return (
    <Card title={<Title level={5}>持仓列表</Title>}>
      {/* 1. 顶部筛选组件 */}
      <FilterPanel onSearch={handleSearch} pageType="asset" />

      {/* 2. 资产分类Tab + 地区下拉 */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16, marginTop: 16 }}>
        <Col>
          <Tabs
            activeKey={activeTab}
            onChange={(key) => {
              setActiveTab(key);
              setPageNum(1); // 切换Tab重置第一页
            }}
            type="card"
          >
            {secTypeArr.map(item => (
              <TabPane tab={item.label} key={item.key} />
            ))}
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

      {/* 3. 表格列显隐配置 */}
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

      {/* 4. 持仓表格 + 分页 */}
      <Table
        loading={loading}
        columns={tableColumns}
        dataSource={tableData}
        rowKey="id"
        bordered
        scroll={{ x: "max-content" }}
        pagination={{
          current: pageNum,
          pageSize,
          total: pageTotal,
          onChange: (page) => setPageNum(page),
          showSizeChanger: false,
          showTotal: (total) => `共 ${total} 条持仓`
        }}
      />
    </Card>
  );
}