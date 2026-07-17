import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, Table, Typography, Checkbox, Space, Row, Col, Empty, message } from 'antd';
import FilterPanel, { FilterParams } from '@/components/FilterPanel';
import PortfolioChart from '@/components/PortfolioChart';
import { queryPortfolioOverviewList } from '@/api/overviewApi';
import {
  PortfolioQueryParams,
  PortfolioTableRow,
  PortfolioChartItem
} from '@/types/portfolio';
import { getPageColumnDisplay, updateColumnDisplay, ColumnDisplayItem } from '@/api/columnDisplayApi';

const { Title } = Typography;

// 指标卡片
const MetricCard: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
  <div style={{
    background: 'rgba(204, 235, 255, 0.4)',
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

const PAGE_NAME = '总览';
const PAGE_TYPE = '0';

export default function PortfolioOverview() {
  // 后端返回完整字段配置（含columnName、isDisplay）
  const [columnConfigList, setColumnConfigList] = useState<ColumnDisplayItem[]>([]);
  const [checkedFieldKeys, setCheckedFieldKeys] = useState<string[]>([]);

  const [tableData, setTableData] = useState<PortfolioTableRow[]>([]);
  const [queryParams, setQueryParams] = useState<PortfolioQueryParams>({
    accountCodes: [],
    tradeNames: [],
    strategyNames: [],
    startDate: '',
    endDate: '',
    referenceIndexConids: [],
    dateType: 1,
  });
  const [chartData, setChartData] = useState<PortfolioChartItem[]>([]);
  const [summary, setSummary] = useState({
    growthRate: 0,
    deltaGrowthRate: 0,
    excessReturn: 0,
    profitAmount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [colLoading, setColLoading] = useState(false);

  // 加载后端字段配置
  const loadColumnConfig = useCallback(async () => {
    setColLoading(true);
    try {
      const res = await getPageColumnDisplay({ pageName: PAGE_NAME, type: PAGE_TYPE });
      setColumnConfigList(res);
      const displayKeys = res.filter(item => item.isDisplay).map(item => item.columnName);
      setCheckedFieldKeys(displayKeys);
    } catch (err) {
      console.error('加载表头配置失败', err);
      setColumnConfigList([]);
      setCheckedFieldKeys([]);
    } finally {
      setColLoading(false);
    }
  }, []);

  useEffect(() => {
    loadColumnConfig();
  }, [loadColumnConfig]);

  // 加载业务表格数据，不再转换字段，直接存储原始后端数组
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await queryPortfolioOverviewList(queryParams);
      // 直接赋值原始数据，无任何字段转换
      setTableData(res.portfolioOverviewList);
      setChartData(res.chartList);
      setSummary({
        growthRate: res.growthRate,
        deltaGrowthRate: res.deltaGrowthRate,
        excessReturn: res.excessReturn,
        profitAmount: res.profitAmount,
      });
    } catch (err) {
      console.error('接口请求失败', err);
      setTableData([]);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [queryParams]);

  // 勾选变更，只更新变化的字段
  const handleCheckChange = async (newKeys: string[]) => {
    const oldKeys = [...checkedFieldKeys];
    setCheckedFieldKeys(newKeys);
    try {
      const updateList: ColumnDisplayItem[] = [];
      // 新增勾选
      newKeys.forEach(key => {
        if (!oldKeys.includes(key)) {
          const target = columnConfigList.find(c => c.columnName === key);
          if (target) updateList.push({ ...target, isDisplay: true });
        }
      });
      // 取消勾选
      oldKeys.forEach(key => {
        if (!newKeys.includes(key)) {
          const target = columnConfigList.find(c => c.columnName === key);
          if (target) updateList.push({ ...target, isDisplay: false });
        }
      });
      const savePromises = updateList.map(item => updateColumnDisplay({
        pageName: PAGE_NAME,
        type: PAGE_TYPE,
        columnName: item.columnName,
        isDisplay: item.isDisplay
      }));
      await Promise.all(savePromises);
    } catch (err) {
      message.error('表头配置保存失败');
      console.error(err);
      setCheckedFieldKeys(oldKeys);
    }
  };

  // 动态生成表格列，dataIndex = 后端columnName，无字段映射
  const dynamicTableColumns = useMemo(() => {
    return columnConfigList
      .filter(config => checkedFieldKeys.includes(config.columnName))
      .map(config => {
        const fieldKey = config.columnKey;
        const fieldName = config.columnName;
        const baseCol = {
          title: fieldName,
          dataIndex: fieldKey,
          key: fieldKey,
        };

        // 百分比格式化字段（字段名由后端统一固定）
        if (["growthRate", "deltaGrowthRate", "excessReturn"].includes(fieldKey)) {
          return {
            ...baseCol,
            render: (val: number | null) => val === null ? '--' : `${(val * 100).toFixed(2)}%`,
          };
        }
        // 盈亏颜色区分字段
        if (fieldKey === "pnl") {
          return {
            ...baseCol,
            render: (val: number | null) => {
              if (val === null) return '--';
              return (
                <span style={{ color: val >= 0 ? "#f5222d" : "#52c41a" }}>
                  {val >= 0 ? "+" : ""}{val?.toLocaleString()}
                </span>
              );
            },
          };
        }
        // 普通数值
        return {
          ...baseCol,
          render: (val: number | null) => val === null ? '--' : val?.toLocaleString(),
        };
      });
  }, [columnConfigList, checkedFieldKeys]);

  const handleSearch = (params: FilterParams) => {
    setQueryParams(prev => ({
      ...prev,
      accountCodes: params.accountCodes ?? [],
      tradeNames: params.tradeNames ?? [],
      strategyNames: params.strategyNames ?? [],
      startDate: params.startDate,
      endDate: params.endDate,
      referenceIndexConids: params.referenceIndexConids ?? [],
      dateType: params.dateType ?? null,
    }));
  };

  return (
    <Card title={<Title level={5}>组合总览</Title>}>
      <FilterPanel onSearch={handleSearch} pageType="overview" />

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <MetricCard title="收益额" value={summary.profitAmount} />
        </Col>
        <Col span={6}>
          <MetricCard title="Delta收益率" value={`${(summary.deltaGrowthRate * 100).toFixed(2)}%`} />
        </Col>
        <Col span={6}>
          <MetricCard title="增长率" value={`${(summary.growthRate * 100).toFixed(2)}%`} />
        </Col>
        <Col span={6}>
          <MetricCard title="超额收益率" value={`${(summary.excessReturn * 100).toFixed(2)}%`} />
        </Col>
      </Row>

      <div style={{ marginBottom: 12 }}>
        <Space size="small" align="baseline" wrap>
          <span>表格显示字段：</span>
          <Checkbox.Group value={checkedFieldKeys} onChange={handleCheckChange} disabled={colLoading}>
            <Space wrap size={[8, 4]}>
              {columnConfigList.map((item) => (
                <Checkbox key={item.columnName} value={item.columnName}>
                  {item.columnName}
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        </Space>
      </div>

      <Table
        bordered
        columns={dynamicTableColumns}
        dataSource={tableData}
        rowKey="traderName"
        pagination={false}
        scroll={{ x: "max-content" }}
        size="middle"
        loading={loading}
        style={{ marginBottom: 24 }}
        locale={{ emptyText: <Empty description="暂无数据，请调整筛选条件查询" /> }}
      />

      <PortfolioChart chartData={chartData} />
    </Card>
  );
}