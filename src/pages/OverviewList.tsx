import React, { useState, useMemo, useEffect } from 'react';
import { Card, Table, Typography, Checkbox, Space, Row, Col, Empty } from 'antd';
import FilterPanel, { FilterParams } from '@/components/FilterPanel';
import PortfolioChart from '@/components/PortfolioChart';
import { queryPortfolioOverviewList } from '@/api/overviewApi';
import {
  PortfolioQueryParams,
  PortfolioTableRow,
  PortfolioChartItem
} from '@/types/portfolio';
import { getQuickDateRange } from '@/utils/dateRange';

const { Title } = Typography;

// 表格显示字段配置
const allFieldList = [
  { key: "group", label: "组别", defaultShow: true },
  { key: "inputCapital", label: "投入本金", defaultShow: true },
  { key: "yearCapital", label: "本年本金", defaultShow: true },
  { key: "marketValue", label: "市值", defaultShow: true },
  { key: "deltaGap", label: "Delta敞口", defaultShow: true },
  { key: "cash", label: "现金", defaultShow: true },
  { key: "loan", label: "贷款", defaultShow: true },
  { key: "realized", label: "费前已实现", defaultShow: true },
  { key: "unrealized", label: "费前未实现", defaultShow: true },
  { key: "fee", label: "费用类", defaultShow: true },
  { key: "totalProfit", label: "总盈亏", defaultShow: true },
  { key: "rate", label: "增长率", defaultShow: true },
  { key: "deltaRate", label: "Delta增长率", defaultShow: true },
  { key: "excessRate", label: "超额收益率", defaultShow: true },
];

// 后端字段key → 前端表格key映射
const fieldMap = {
  traderName: 'group',
  yearCapital: 'yearCapital',
  grossPositionValue: 'marketValue',
  deltaExposure: 'deltaGap',
  availableFunds: 'cash',
  loan: 'loan',
  realizedPnl: 'realized',
  unrealizedPnl: 'unrealized',
  cost: 'fee',
  pnl: 'totalProfit',
  growthRate: 'rate',
  deltaGrowthRate: 'deltaRate',
  excessReturn: 'excessRate',
} as Record<string, string>;

// 后端数据转前端表格结构
const transformTableData = (source: PortfolioTableRow[]) => {
  return source.map(item => {
    const row: Record<string, any> = {};
    Object.entries(item).forEach(([backKey, value]) => {
      const frontKey = fieldMap[backKey];
      if (frontKey) row[frontKey] = value;
    })
    row.inputCapital = null;
    return row;
  })
};

// 指标卡片子组件
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

export default function PortfolioOverview() {
  const defaultCheckedKeys = allFieldList.filter((item) => item.defaultShow).map((item) => item.key);
  const [checkedFieldKeys, setCheckedFieldKeys] = useState<string[]>(defaultCheckedKeys);
  // 表格初始为空，完全依赖后端接口
  const [tableData, setTableData] = useState<Record<string, any>[]>([]);

  // 接口入参
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

  // 请求后端接口
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await queryPortfolioOverviewList(queryParams);
      console.log('后端返回完整数据', res);
      // 转换后端列表字段给表格使用
      setTableData(transformTableData(res.portfolioOverviewList));
      setChartData(res.chartList);
      setSummary({
        growthRate: res.growthRate,
        deltaGrowthRate: res.deltaGrowthRate,
        excessReturn: res.excessReturn,
        profitAmount: res.profitAmount,
      });
    } catch (err) {
      console.error('接口请求失败', err);
      // 接口报错清空数据，不展示假mock
      setTableData([]);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  // 页面初始化 / 筛选参数变更 自动请求
  useEffect(() => {
    fetchData();
  }, [queryParams]);

  // 动态生成表格列
  const dynamicTableColumns = useMemo(() => {
    return allFieldList
      .filter((fieldItem) => checkedFieldKeys.includes(fieldItem.key))
      .map((fieldItem) => {
        const baseCol = {
          title: fieldItem.label,
          dataIndex: fieldItem.key,
          key: fieldItem.key,
        };
        if (fieldItem.key === "group") return baseCol;
        // 百分比格式化
        if (["rate", "deltaRate", "excessRate"].includes(fieldItem.key)) {
          return {
            ...baseCol,
            render: (val: number | null) => val === null ? '--' : `${(val * 100).toFixed(2)}%`,
          };
        }
        // 总盈亏 正负颜色区分
        if (fieldItem.key === "totalProfit") {
          return {
            ...baseCol,
            render: (val: number | null) => {
              if (val === null) return '--';
              return (
                <span style={{ color: val >= 0 ? "#f5222d" : "#52c41a" }}>
                  {val >= 0 ? "+" : ""}{val.toLocaleString()}
                </span>
              );
            },
          };
        }
        // 普通数值空值展示--
        return {
          ...baseCol,
          render: (val: number | null) => val === null ? '--' : val.toLocaleString(),
        };
      });
  }, [checkedFieldKeys]);

  // 筛选回调，更新请求参数触发接口重拉
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
      {/* 筛选栏 */}
      <FilterPanel onSearch={handleSearch} pageType="overview" />

      {/* 顶部指标卡片 */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <MetricCard title="收益额" value={summary.profitAmount} />
        </Col>
        <Col span={6}>
          <MetricCard title="Delta收益率" value={summary.deltaGrowthRate} />
        </Col>
        <Col span={6}>
          <MetricCard title="增长率" value={summary.growthRate} />
        </Col>
        <Col span={6}>
          <MetricCard title="超额收益率" value={summary.excessReturn} />
        </Col>
      </Row>

      {/* 字段勾选面板 */}
      <div style={{ marginBottom: 12 }}>
        <Space size="small" align="baseline" wrap>
          <span>表格显示字段：</span>
          <Checkbox.Group value={checkedFieldKeys} onChange={setCheckedFieldKeys}>
            <Space wrap size={[8, 4]}>
              {allFieldList.map((item) => (
                <Checkbox key={item.key} value={item.key}>
                  {item.label}
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        </Space>
      </div>

      {/* 汇总表格，无数据展示空状态 */}
      <Table
        bordered
        columns={dynamicTableColumns}
        dataSource={tableData}
        rowKey="group"
        pagination={false}
        scroll={{ x: "max-content" }}
        size="middle"
        loading={loading}
        style={{ marginBottom: 24 }}
        locale={{ emptyText: <Empty description="暂无数据，请调整筛选条件查询" /> }}
      />

      {/* 图表组件 */}
      <PortfolioChart chartData={chartData} />
    </Card>
  );
}