import { useState, useEffect, useCallback } from 'react';
import {
  Card, Tabs, Select, Table, Button, Checkbox,
  Space, Typography, Row, Col, Pagination, Spin, Empty, message
} from 'antd';
import FilterPanel from '@/components/FilterPanel';
import TradeAllocateModal from '@/components/TradeAllocateModal';
import { getTradePageList, TradePageParams, TradeRecordItem } from '@/api/tradeApi';
import { secTypeArr, areaArr } from '@/utils/common';
import { getPageColumnDisplay, updateColumnDisplay, ColumnDisplayItem } from '@/api/columnDisplayApi';

const { TabPane } = Tabs;
const { Title } = Typography;

const PAGE_NAME = '交易列表';

export default function TradeList() {
  const [columnConfigList, setColumnConfigList] = useState<ColumnDisplayItem[]>([]);
  const [visibleCols, setVisibleCols] = useState<string[]>([]);

  const [activeFilter, setActiveFilter] = useState<TradePageParams>({
    accountCodes: [],
    tradeNames: [],
    strategyNames: [],
    startDate: '',
    endDate: '',
    conids: [],
    sectors: [],
    pageNum: 1,
    pageSize: 10,
    secType: 'STK',
    dateType: 1,
  });
  const [activeTab, setActiveTab] = useState("股票");
  const [region, setRegion] = useState("US");
  const [tableData, setTableData] = useState<TradeRecordItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [colLoading, setColLoading] = useState(false);

  const [pageNum, setPageNum] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);

  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [currentTrade, setCurrentTrade] = useState<TradeRecordItem | null>(null);

  // 加载表头配置
  const loadColumnConfig = useCallback(async (type: string) => {
    setColLoading(true);
    try {
      const res = await getPageColumnDisplay({ pageName: PAGE_NAME, type });
      setColumnConfigList(res);
      const displayKeys = res.filter(i => i.isDisplay).map(i => i.columnName);
      setVisibleCols(displayKeys);
    } catch (err) {
      console.error('加载表头配置失败', err);
      setColumnConfigList([]);
      setVisibleCols([]);
    } finally {
      setColLoading(false);
    }
  }, []);

  useEffect(() => {
    loadColumnConfig(activeTab);
  }, [activeTab, loadColumnConfig]);

  // 仅更新变更字段
  const handleColCheckChange = async (newKeys: string[]) => {
    const oldKeys = [...visibleCols];
    setVisibleCols(newKeys);
    try {
      const updateList: ColumnDisplayItem[] = [];
      newKeys.forEach(key => {
        if (!oldKeys.includes(key)) {
          const target = columnConfigList.find(c => c.columnName === key);
          if (target) updateList.push({ ...target, isDisplay: true });
        }
      });
      oldKeys.forEach(key => {
        if (!newKeys.includes(key)) {
          const target = columnConfigList.find(c => c.columnName === key);
          if (target) updateList.push({ ...target, isDisplay: false });
        }
      });
      const allSave = updateList.map(item => updateColumnDisplay({
        pageName: PAGE_NAME,
        type: activeTab,
        columnName: item.columnName,
        isDisplay: item.isDisplay
      }));
      await Promise.all(allSave);
    } catch (err) {
      message.error('表头配置保存失败');
      console.error(err);
      setVisibleCols(oldKeys);
    }
  };

  // 直接使用后端原始records，无转换
  const fetchTradeList = useCallback(async () => {
    setLoading(true);
    try {
      const reqParams: TradePageParams = {
        ...activeFilter,
        secType: activeTab,
        pageSize: 10,
        pageNum
      };
      const res = await getTradePageList(reqParams);
      setTableData(res.records);
      setTotal(res.total);
    } catch (err) {
      console.error("交易列表请求失败", err);
      setTableData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, pageNum, activeTab, region]);

  useEffect(() => {
    fetchTradeList();
  }, [activeTab, region, pageNum, activeFilter]);

  const handleSearch = (params: TradePageParams) => {
    setActiveFilter(params);
    setPageNum(1);
  };

  const openAllocateDialog = (record: TradeRecordItem) => {
    setCurrentTrade(record);
    setAllocateModalOpen(true);
  };

  const handleAllocateConfirm = () => {
    fetchTradeList();
    setAllocateModalOpen(false);
  };

  // 动态表格列，完全依赖后端columnName
  const tableColumns = columnConfigList
    .filter(col => visibleCols.includes(col.columnName))
    .map(col => {
      const fieldKey = col.columnName;
      const colConfig = {
        title: fieldKey,
        dataIndex: fieldKey,
        key: fieldKey,
        render: undefined as any,
      };

      if (fieldKey === "action") {
        colConfig.render = (_val: any, record: TradeRecordItem) => (
          <Button type="link" onClick={() => openAllocateDialog(record)}>分配</Button>
        );
      } else if (fieldKey === "calExecutionUnrealizedPnl") {
        colConfig.render = (val: number) => (
          <span style={{ color: val >= 0 ? "#f5222d" : "#52c41a" }}>
            {val > 0 ? "+" : ""}{val?.toLocaleString()}
          </span>
        );
      } else if (["shares", "price", "commissionAndFees", "allocateRemainQty"].includes(fieldKey)) {
        colConfig.render = (val: number) => val?.toLocaleString() ?? "--";
      } else if (fieldKey === "side") {
        colConfig.render = (val: string) => val === 'BOT' ? '买' : val === 'SLD' ? '卖' : '--';
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
              <TabPane tab={item.label} key={item.label} />
            ))}
          </Tabs>
        </Col>
        <Col>
          <Select
            value={region}
            onChange={(v) => { setRegion(v); setPageNum(1); }}
            style={{ width: 160 }}
            placeholder="国家/地区"
            options={areaArr}
          />
        </Col>
      </Row>

      <div style={{ marginBottom: 16, padding: '8px 12px', borderRadius: 4 }}>
        <Space align="baseline" wrap>
          <span style={{ fontWeight: 500 }}>表格显示字段：</span>
          <Checkbox.Group value={visibleCols} onChange={handleColCheckChange} disabled={colLoading}>
            <Space wrap size={[8, 6]}>
              {columnConfigList.map(item => (
                <Checkbox key={item.columnName} value={item.columnName}>
                  {item.columnName}
                </Checkbox>
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

      {allocateModalOpen && currentTrade &&
        (<TradeAllocateModal
          open={allocateModalOpen}
          tradeData={currentTrade}
          onCancel={() => setAllocateModalOpen(false)}
          onConfirm={handleAllocateConfirm}
        />)
      }
    </Card>
  );
}