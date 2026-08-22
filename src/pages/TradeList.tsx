import { useState, useEffect, useCallback } from 'react';
import {
  Card, Tabs, Select, Table, Button, Checkbox, Modal,
  Space, Typography, Row, Col, Pagination, Spin, Empty, message, DatePicker
} from 'antd';
import FilterPanel, { FilterParams, timeShortOpts } from '@/components/FilterPanel';
import TradeAllocateModal from '@/components/TradeAllocateModal';
import { getTradePageList, TradePageParams, TradeRecordItem } from '@/api/tradeApi';
import { getZoneOptions } from '@/api/investApi';
import { secTypeArr } from '@/utils/common';
import { getPageColumnDisplay, updateColumnDisplay, ColumnDisplayItem } from '@/api/columnDisplayApi';
import ImportBtnGroup from '@/components/ImportBtnGroup';
import { executeTradeCal, exportUncalibratedTrades } from '@/api/positionApi';
import { saveBlobFile } from '@/utils/file';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const { TabPane } = Tabs;
const { Title } = Typography;

const PAGE_NAME = '交易列表';

export default function TradeList() {
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
  const [zoneReady, setZoneReady] = useState(false);
  const [tableData, setTableData] = useState<TradeRecordItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [colLoading, setColLoading] = useState(false);
  const [calLoading, setCalLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [dateType, setDateType] = useState<number | null>(1);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  const [pageNum, setPageNum] = useState(1);
  // pageSize改为state，支持手动输入
  const [pageSize, setPageSize] = useState(10);
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

  // 直接使用后端原始records，无转换
  const fetchTradeList = useCallback(async () => {
    setLoading(true);
    try {
      if (!zoneReady) return;
      const reqParams: TradePageParams = {
        accountCodes: activeFilter?.accountCodes ?? [],
        conids: activeFilter?.conids ?? [],
        secType: activeTab,
        startDate: activeFilter?.startDate ?? '',
        endDate: activeFilter?.endDate ?? '',
        sectors: activeFilter?.sectors ?? [],
        dateType: activeFilter?.dateType || null,
        zoneType,
        pageSize,
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
  }, [activeFilter, pageNum, pageSize, activeTab, zoneType, zoneReady, dateType, dateRange]);

  useEffect(() => {
    fetchTradeList();
  }, [fetchTradeList]);

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

  // ========== 新增：核算点击事件 ==========
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
          await executeTradeCal();
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

  // ========== 新增：导出未核算交易数据 ==========
  const handleExportUncalibrated = async () => {
    setExportLoading(true);
    try {
      const reqParams = {
        accountCodes: activeFilter?.accountCodes ?? [],
        conids: activeFilter?.conids ?? [],
        secType: activeTab,
        tradeNames: activeFilter?.tradeNames ?? [],
        strategyNames: activeFilter?.strategyNames ?? [],
        startDate: activeFilter?.startDate ?? "",
        endDate: activeFilter?.endDate ?? "",
        sectors: activeFilter?.sectors ?? [],
        dateType: activeFilter?.dateType || null,
        zoneType,
      };
      const res = await exportUncalibratedTrades(reqParams as any);
      const blob = new Blob([res.data]);
      const url = URL.createObjectURL(blob);
      const fileName = `交易数据_${new Date().toISOString().slice(0, 10)}.xlsx`;
      saveBlobFile(url as any, fileName);
      message.success('导出成功');
    } catch (err) {
      message.error('导出失败，请稍后重试');
    } finally {
      setExportLoading(false);
    }
  };

  // 动态表格列，完全依赖后端columnName
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

      if (fieldKey === "operation") {
        colConfig.render = (_val: any, record: TradeRecordItem) => (
          <Button type="link" onClick={() => openAllocateDialog(record)}>分配</Button>
        );
      } else if (fieldKey === "calExecutionUnrealizedPnl") {
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
    <Card
      title={<Title level={5}>交易列表</Title>}
      extra={
        <Space>
          <Button type="primary" loading={calLoading} onClick={handleCalTrade}>核算</Button>
          <Button loading={exportLoading} onClick={handleExportUncalibrated}>导出</Button>
          <ImportBtnGroup type='2' onSuccess={fetchTradeList} />
        </Space>
      }
    >
      <FilterPanel onSearch={handleSearch} pageType='trade' />

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
          showSizeChanger
          pageSizeOptions={['10','20','50','100','200']}
          onChange={(page,size) => {
            setPageNum(page);
            setPageSize(size);
          }}
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