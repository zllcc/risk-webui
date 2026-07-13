import request from './request';

// ===================== 原有风控查询接口 =====================
export interface RiskQueryParams {
  accountCodes: string[];
  tradeNames: string[];
  strategyNames: string[];
  startDate: string;
  endDate: string;
  dateType: number | null;
}

export interface RiskVarVo {
  day: number;
  confidence: number;
  amount: number;
  totalAssetRatio: number;
}

export interface PressureTestItem {
  scene: string;
  amount: number;
}

export interface RiskDashboardRes {
  var: RiskVarVo;
  es: number;
  maxDrawdown: number;
  iv: number;
  marginRatio: number;
  vix: number;
  pressureTestVo: PressureTestItem[];
}

/**
 * 风控仪表盘指标查询 /risk-dashboard/pc/query-var
 */
export function queryRiskDashboard(params: RiskQueryParams) {
  return request<RiskDashboardRes>({
    url: '/risk-dashboard/pc/query-var',
    method: 'POST',
    data: params
  });
}

// ===================== 新增接口1：收益前10资产 =====================
// 扩展通用入参，新增dailyDate，修正后端startDat笔误为startDate
export interface RiskQueryParams {
  accountCodes: string[];
  tradeNames: string[];
  strategyNames: string[];
  startDate: string;
  endDate: string;
  dateType: number | null;
}

// 收益TOP10 单项出参（后端返回结构）
export interface Top10ProfitItem {
  conid: number;
  symbol: string;
  realizedPnl: number;
  unrealizedPnl: number;
  totalPnl: number;
}
export type Top10ProfitRes = Top10ProfitItem[];

/**
 * 收益前10资产树图接口 /risk-dashboard/pc/query-top10-profit
 */
export function queryTop10Profit(params: RiskQueryParams) {
  return request<Top10ProfitRes>({
    url: '/risk-dashboard/pc/query-top10-profit',
    method: 'POST',
    data: params
  });
}

// ===================== 新增接口2：资产类型占比 =====================
// 环形图统一入参（和top10接口结构一致）
export interface RiskQueryParams {
  accountCodes: string[];
  tradeNames: string[];
  strategyNames: string[];
  startDate: string;
  endDate: string;
  dateType: number | null;
}

// 资产/风险占比单项出参
export interface AssetRatioItem {
  secType: string;
  count: number;
  ratio: number;
}
export type AssetRatioRes = AssetRatioItem[];

/**
 * 获取资产类型占比环形图数据 /risk-dashboard/pc/query-asset-ratio
 */
export function queryAssetRatio(params: RiskQueryParams) {
  return request<AssetRatioRes>({
    url: '/risk-dashboard/pc/query-asset-ratio',
    method: 'POST',
    data: params
  });
}