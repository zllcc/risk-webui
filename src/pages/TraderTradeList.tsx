import { useState, useEffect, useCallback } from 'react';
import {
  Card, Tabs, Select, Table, Checkbox, Modal,
  Space, Typography, Row, Col, Pagination, Spin, Empty, message, Button
} from 'antd';
import FilterPanel, { FilterParams } from '@/components/FilterPanel';
import ImportBtnGroup from '@/components/ImportBtnGroup';
import { getTraderTradePageList, TradePageParams, TradeRecordItem, executeTraderTradeCal } from '@/api/tradeApi';
import { getZoneOptions } from '@/api/investApi';
import { secTypeArr } from '@/utils/common';
import { getPageColumnDisplay, updateColumnDisplay, ColumnDisplayItem } from '@/api/columnDisplayApi';

const { TabPane } = Tabs;
const { Title } = Typography;

const PAGE_NAME = '交易员交易列表';

export default function TraderTradeList() {
  const [columnConfigList, setColumnConfigList] = useState<ColumnDisplayItem[]>([]);
  const [visibleCols, setVisibleCols] = useState<string[]>([]);

  const [activeFilter, setActiveFilter] = useState<FilterParams>({
    accountCodes: [],
    tradeNames: [],
    strategyNames: [],
    startDate: '',
    endDate: '',
    conids: [],
    sectors: [],
    dateType: 1,
  });
  const [activeTab, setActiveTab] = useState("股票");
  const [zoneOptions, setZoneOptions] = useState<{value: string; label: string}[]>([]);
  const [zoneType, setZoneType] = useState('');
  // 区域是否初始化完成标记
  const [zoneReady, setZoneReady] = useState(false);
  const [tableData, setTableData] = useState<TradeRecordItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [colLoading, setColLoading] = useState(false);

  const [pageNum, setPageNum] = useState(1);
  // pageSize改为state，支持修改每页条数
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  // 核算按钮loading
  const [calLoading, setCalLoading] = useState(false);

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

  // 加载区域下拉
  const getZone = useCallback(async () => {
    try {
      const res = await getZoneOptions() || [];
      setZoneOptions(res);
      if (res.length > 0) {
        setZoneType(res[0].value);
      }
    } catch (err) {
      console.error('获取区域失败');
    } finally {
      setZoneReady(true);
    }
  }, []);

  useEffect(() => {
    getZone();
  }, [getZone]);

  // 使用 /positionTraderExecution/pc/query-page 接口
  const fetchTradeList = useCallback(async () => {
    setLoading(true);
    try {
      if (!zoneReady) return;

      const reqParams: TradePageParams = {
        accountCodes: activeFilter?.accountCodes ?? [],
        tradeNames: activeFilter?.tradeNames ?? [],
        strategyNames: activeFilter?.strategyNames ?? [],
        conids: activeFilter?.conids ?? [],
        secType: activeTab,
        startDate: activeFilter?.startDate ?? "",
        endDate: activeFilter?.endDate ?? "",
        sectors: activeFilter?.sectors ?? [],
        dateType: activeFilter?.dateType || null,
        zoneType,
        pageSize,
        pageNum
      };
      const res = await getTraderTradePageList(reqParams);
      setTableData(res.records);
      setTotal(res.total);
    } catch (err) {
      console.error("交易员交易列表请求失败", err);
      setTableData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, pageNum, pageSize, activeTab, zoneType, zoneReady]);

  useEffect(() => {
    fetchTradeList();
  }, [fetchTradeList]);

  const handleSearch = (params: FilterParams) => {
    setActiveFilter(params);
    setPageNum(1);
  };

  // 核算确认弹窗及接口调用
  const handleCalTrade = () => {
    Modal.confirm({
      title: '交易核算确认',
      content: '核算会重新计算所有交易盈亏数据，任务耗时较长。确认执行交易核算？',
      okText: '确认核算',
      cancelText: '取消',
      okButtonProps: { danger: false },
      onOk: async () => {
        setCalLoading(true);
        try {
          await executeTraderTradeCal();
          message.success('核算任务已提交成功');
          fetchTradeList();
        } catch (err) {
          message.error('核算提交失败，请稍后重试');
        } finally {
          setCalLoading(false);
        }
      }
    });
  };

  // 动态表格列，完全依赖后端 columnName
  const tableColumns = columnConfigList
    .filter(col => visibleCols.includes(col.columnName))
    .map(col => {
      const fieldName = col.columnName;
      const fieldKey = col.columnKey;

      const colConfig = {
        title: fieldName,
        dataIndex: fieldKey,
        key: fieldKey,
        render: undefined as any,
      };

      if (fieldKey === "calExecutionUnrealizedPnl") {
        colConfig.render = (val: number) => (
          <span style={{ color: val >= 0 ? "#f5222d" : "#52c41a" }}>
            {val > 0 ? "+" : ""}{val}
          </span>
        );
      } else if (["shares", "price", "commissionAndFees", "allocateRemainQty"].includes(fieldKey)) {
        colConfig.render = (val: number) => val ?? "--";
      } else if (fieldKey === "side") {
        colConfig.render = (val: string) => val === 'BOT' ? '买' : val === 'SLD' ? '卖' : '--';
      }
      return colConfig;
    });

  return (
    <Card bodyStyle={{ padding: 12 }}>
      <Row style={{ marginBottom: 12 }} justify="end">
        <Button style={{ marginRight: 8}} loading={calLoading} onClick={handleCalTrade}>核算</Button>
        <ImportBtnGroup type='6' onSuccess={fetchTradeList} />
      </Row>
      <FilterPanel onSearch={handleSearch} pageType='traderTrade' />

      <Row justify="space-between" align="middle" style={{ marginTop: 12 }}>
        <Col>
          <Tabs activeKey={activeTab} onChange={(v) => { setActiveTab(v); setPageNum(1); }} type="card">
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

      <div style={{ marginBottom: 16, borderRadius: 4 }}>
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
          onChange={(page, size) => {
            setPageNum(page);
            setPageSize(size);
          }}
          showSizeChanger={true}
          pageSizeOptions={['10','20','50','100','200']}
        />
      </Row>
    </Card>
  );
}