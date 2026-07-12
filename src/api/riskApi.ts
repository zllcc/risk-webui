import request from './request';

// 接口入参 完全匹配后端定义
export interface RiskQueryParams {
  accountCodes: string[];
  tradeNames: string[];
  strategyNames: string[];
  startDate: string;
  endDate: string;
}

// VaR 子结构
export interface RiskVarVo {
  day: number;
  confidence: number;
  amount: number;
  totalAssetRatio: number;
}

// 压力测试单项
export interface PressureTestItem {
  scene: string;
  amount: number;
}

// 接口完整出参结构
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
 * 风控仪表盘查询接口 /risk-dashboard/pc/query-var
 */
export function queryRiskDashboard(params: RiskQueryParams) {
  return request<RiskDashboardRes>({
    url: '/risk-dashboard/pc/query-var',
    method: 'POST',
    data: params
  });
}