// 接口入参类型
export interface PortfolioQueryParams {
  accountCodes: string[];
  tradeNames: string[];
  strategyNames: string[];
  startDate: string;
  endDate: string;
  referenceIndexConids: number[];
  dateType: number | null;
}

// 图表基准指标子项
export interface BenchmarkItem {
  key: string;
  name: string;
  value: number;
}

// 图表单条数据
export interface PortfolioChartItem {
  date: string;
  nav: number;
  portReturn: number;
  benchmarks: BenchmarkItem[];
}

// 表格行数据
export interface PortfolioTableRow {
  traderName: string;
  yearCapital: number;
  grossPositionValue: number;
  deltaExposure: number;
  availableFunds: number;
  sumGrossPositionValue: number;
  loan: number;
  realizedPnl: number;
  unrealizedPnl: number;
  cost: number;
  pnl: number;
  growthRate: number;
  deltaGrowthRate: number;
  excessReturn: number;
}

// 接口data内部结构
export interface PortfolioQueryData {
  portfolioOverviewList: PortfolioTableRow[];
  chartList: PortfolioChartItem[];
  growthRate: number;
  deltaGrowthRate: number;
  excessReturn: number;
  profitAmount: number;
}

// 完整接口返回体
export interface PortfolioQueryRes {
  msg: string;
  errorMsg: string;
  code: number;
  data: PortfolioQueryData;
}