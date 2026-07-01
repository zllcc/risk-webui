import { useState, useEffect, useCallback } from 'react';
import {
  Card, Tabs, Select, Table, Button, Checkbox,
  Space, Typography, Row, Col, Pagination, Spin, Empty
} from 'antd';
import FilterPanel from '@/components/FilterPanel';
import TradeAllocateModal from '@/components/TradeAllocateModal';
import { getTradePageList, TradePageParams, TradeRecordItem } from '@/api/tradeApi';
import { getQuickDateRange } from '@/utils/dateRange';
import { secTypeArr } from '@/utils/common';

const { TabPane } = Tabs;
const { Option } = Select;
const { Title } = Typography;

// 表格列配置
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

// 后端原始记录 → 前端表格行转换
const transformTradeRecord = (item: TradeRecordItem) => {
  return {
    id: item.id,
    account: item.accountCode,
    contract: item.symbol,
    buySell: item.side === 'BUY' ? '买' : item.side === 'SELL' ? '卖' : '--',
    quantity: item.shares,
    matchPrice: Number(item.price) || 0,
    profitLoss: item.realizedPnl,
    fee: Number(item.commissionAndFees) || 0,
    currency: item.currency,
    tradeTime: item.time,
    unAllocateAmount: item.remainQty,
    // 保存后端完整原始对象，传给分配弹窗
    originRecord: item
  };
};
type TradeTableItem = ReturnType<typeof transformTradeRecord>;

export default function TradeList() {
  const [activeFilter, setActiveFilter] = useState<TradePageParams>({
    accountCodes: [],
      tradeNames: [],
      strategyNames: [],
      startDate: getQuickDateRange('当日')[0],
      endDate: getQuickDateRange('当日')[1],
      conids: [],
      sectors: [],
      pageNum: 1,
      pageSize: 10,
      secType: 'STK',
  });
  const [activeTab, setActiveTab] = useState("STK");
  const [region, setRegion] = useState("US");
  const [tableData, setTableData] = useState<TradeTableItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [visibleCols, setVisibleCols] = useState(allTradeColumns.map(item => item.key));

  // 分页
  const [pageNum, setPageNum] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);

  // 分配弹窗
  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [currentTrade, setCurrentTrade] = useState<TradeTableItem | null>(null);

  // 请求交易列表
  const fetchTradeList = useCallback(async () => {
    setLoading(true);
    try {
      // 时间转为后端要求 ISO 格式
      // const timeStart = dayjs(activeFilter.startDate).toISOString();
      // const timeEnd = dayjs(activeFilter.endDate).endOf('day').toISOString();
      console.log('请求参数', activeFilter, pageNum, region);
      const reqParams: TradePageParams = {
        ...activeFilter,
        secType: activeTab,
        pageSize:10,
        pageNum
      };
      const res = await getTradePageList(reqParams);
      const tableRows = res.records.map(transformTradeRecord);
      setTableData(tableRows);
      setTotal(res.total);
    } catch (err) {
      console.error("交易列表请求失败", err);
      setTableData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, pageNum, activeTab, region]);

  // 筛选/分页/Tab/地区变更重载数据
  useEffect(() => {
    fetchTradeList();
  }, [activeTab, region, pageNum, activeFilter]);

  // 筛选查询
  const handleSearch = (params: TradePageParams) => {
    setActiveFilter(params);
    
    setPageNum(1);
  };

  // 打开分配弹窗
  const openAllocateDialog = (record: TradeTableItem) => {
    setCurrentTrade(record);
    setAllocateModalOpen(true);
  };

  // 分配提交回调
  const handleAllocateConfirm = (tradeInfo: TradeTableItem, allocateList: any[]) => {
    console.log('分配提交', tradeInfo.originRecord, allocateList);
    fetchTradeList();
    setAllocateModalOpen(false);
  };

  // 动态表格列
  const tableColumns = allTradeColumns
    .filter(col => visibleCols.includes(col.key))
    .map(col => {
      const colConfig = {
        title: col.label,
        dataIndex: col.key,
        key: col.key,
        render: undefined as any, // 占位，后续根据字段类型动态渲染
      };

      if (col.key === "action") {
        colConfig.render = (_val: any, record: TradeTableItem) => (
          <Button type="link" onClick={() => openAllocateDialog(record)}>分配</Button>
        );
      } else if (col.key === "profitLoss") {
        colConfig.render = (val: number) => (
          <span style={{ color: val >= 0 ? "#f5222d" : "#52c41a" }}>
            {val >= 0 ? "+" : ""}{val.toLocaleString()}
          </span>
        );
      } else if (["quantity", "matchPrice", "fee", "unAllocateAmount"].includes(col.key)) {
        colConfig.render = (val: number) => val?.toLocaleString() ?? "--";
      }
      return colConfig;
    });

  return (
    <Card title={<Title level={5}>交易列表</Title>}>
      <FilterPanel onSearch={handleSearch} pageType='asset' />

      <Row justify="space-between" align="middle" style={{ marginBottom: 16, marginTop: 16 }}>
        <Col>
          <Tabs activeKey={activeTab} onChange={(v) => { setActiveTab(v); setPageNum(1); }} type="card">
            {secTypeArr.map(item => (
              <TabPane tab={item.label} key={item.key} />
            ))}
          </Tabs>
        </Col>
        <Col>
          <Select
            value={region}
            onChange={(v) => { setRegion(v); setPageNum(1); }}
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

      <Spin spinning={loading}>
        <Table
          columns={tableColumns}
          dataSource={tableData}
          rowKey="id"
          bordered
          pagination={false}
          scroll={{ x: "max-content" }}
          locale={{ emptyText: <Empty description="暂无交易数据，请调整筛选条件" /> }}
        />
      </Spin>

      <Row justify="end" style={{ marginTop: 16 }}>
        <Pagination
          current={pageNum}
          total={total}
          pageSize={pageSize}
          onChange={(page) => setPageNum(page)}
          showSizeChanger={false}
        />
      </Row>

      <TradeAllocateModal
        open={allocateModalOpen}
        tradeData={currentTrade}
        onCancel={() => setAllocateModalOpen(false)}
        onConfirm={handleAllocateConfirm}
      />
    </Card>
  );
}