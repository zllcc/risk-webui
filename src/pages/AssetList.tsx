import { useState, useEffect, useCallback } from 'react';
import {
  Card, Tabs, Select, Table, Checkbox,
  Space, Typography, Row, Col, message, Spin, Empty
} from 'antd';
import FilterPanel, { FilterParams } from '@/components/FilterPanel';
import { secTypeArr } from '@/utils/common';
import { getZoneOptions } from '@/api/investApi';
import { getPositionList, PositionRecord, AssetQueryParams } from '@/api/positionApi';
import { getPageColumnDisplay, updateColumnDisplay, ColumnDisplayItem } from '@/api/columnDisplayApi';

const { TabPane } = Tabs;
const { Title } = Typography;

const PAGE_NAME = '持仓列表';

export default function AssetList() {
  const [columnConfigList, setColumnConfigList] = useState<ColumnDisplayItem[]>([]);
  const [visibleCols, setVisibleCols] = useState<string[]>([]);

  const [activeTab, setActiveTab] = useState("股票");
  const [zoneOptions, setZoneOptions] = useState<{value: string; label: string}[]>([]);
  const [zoneType, setZoneType] = useState('');
  const [tableData, setTableData] = useState<PositionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [colLoading, setColLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageTotal, setPageTotal] = useState(0);
  const pageSize = 10;

  const [searchParams, setSearchParams] = useState<FilterParams>({
    accountCodes: [],
    tradeNames: [],
    strategyNames: [],
    startDate: '',
    endDate: '',
    dateType: 1,
  });

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

  // 勾选变更，仅更新变化字段
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
      const promises = updateList.map(item => updateColumnDisplay({
        pageName: PAGE_NAME,
        type: activeTab,
        columnName: item.columnName,
        isDisplay: item.isDisplay
      }));
      await Promise.all(promises);
    } catch (err) {
      message.error('保存表头配置失败');
      console.error(err);
      setVisibleCols(oldKeys);
    }
  };

  // 直接赋值原始数据，无转换
  const fetchPositionData = useCallback(async () => {
    setLoading(true);
    try {
      let zoneState = zoneType;
      if(!zoneOptions.length) {
        const res = await getZoneOptions() || [];
        zoneState = res[0]?.value;
        setZoneOptions(res);
        setZoneType(res[0]?.value);
      }
      const apiParams: AssetQueryParams = {
        pageNum,
        pageSize,
        conids: searchParams?.accountCodes ?? [],
        secType: activeTab,
        startDate: searchParams?.startDate ?? "",
        endDate: searchParams?.endDate ?? "",
        sectors: searchParams?.sectors ?? [],
        dateType: searchParams?.dateType ?? null,
        zoneType: zoneState,
      };

    const res = await getPositionList(apiParams);
      setTableData(res.records);
      setPageTotal(res.total);
    } catch (err) {
      console.error('加载持仓列表失败', err);
      message.error('数据加载失败，请稍后重试');
      setTableData([]);
      setPageTotal(0);
    } finally {
      setLoading(false);
    }
  }, [pageNum, activeTab, searchParams, zoneType]);

  useEffect(() => {
    fetchPositionData();
  }, []);

  const handleSearch = (params: FilterParams) => {
    setSearchParams(params);
    setPageNum(1);
  };

  // 动态列，dataIndex = 后端原生columnName
  const tableColumns = columnConfigList
    .filter(config => visibleCols.includes(config.columnName))
    .map(config => {
      const fieldName = config.columnName;
      const fieldKey = config.columnKey;

      const colItem = {
        title: fieldName,
        dataIndex: fieldKey,
        key: fieldKey,
        render: undefined as any,
      };

      // 盈亏颜色
      if (["unrealizedPnl", "realizedPnl", "dailyUnrealizedPnl", "dailyRealizedPnl"].includes(fieldKey)) {
        colItem.render = (val: number) => (
          <span style={{ color: val > 0 ? "#f5222d" : "#52c41a" }}>
            {val > 0 ? "+" : ""}{val?.toLocaleString() ?? 0}
          </span>
        );
      }
      // 数值千分位
      else if (["positionQty", "avgCost", "marketPrice", "marketValue", "commissionAndFees"].includes(fieldKey)) {
        colItem.render = (val: number) => val?.toLocaleString() ?? 0;
      }
      return colItem;
    });

  return (
    <Card title={<Title level={5}>持仓列表</Title>}>
      <FilterPanel onSearch={handleSearch} pageType="asset" />

      <Row justify="space-between" align="middle" style={{ marginBottom: 16, marginTop: 16 }}>
        <Col>
          <Tabs
            activeKey={activeTab}
            onChange={(key) => {
              setActiveTab(key);
              setPageNum(1);
            }}
            type="card"
          >
            {secTypeArr.map(item => (
              <TabPane tab={item.label} key={item.label} />
            ))}
          </Tabs>
        </Col>
        <Col>
          <Select
            value={zoneType}
            onChange={(v) => { setZoneType(v); setPageNum(1); }}
            style={{ width: 160 }}
            placeholder="国家/地区"
            options={zoneOptions}
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