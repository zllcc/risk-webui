import request from './request';

export interface PositionQueryParams {
  pageNum: number;
  pageSize: number;
  accountCodes: string[];
  conids: string[];
  secType: string;
  tradeNames: string[];
  strategyNames: string[];
  startDate: string;
  endDate: string;
  sectors: string[];
  dateType: number | null;
  zoneType:string;
}

export interface AssetQueryParams {
  pageNum: number;
  pageSize: number;
  conids: string[];
  secType: string;
  startDate: string;
  endDate: string;
  sectors: string[];
  dateType: number | null;
  zoneType:string;
}

export interface PositionRecord {
  id: number;
  conid: number;
  accountCode: string;
  modelCode: string;
  positionQty: number;
  avgCost: number;
  unrealizedPnl: number;
  marketPrice: number;
  marketValue: number;
  realizedPnl: number;
  remainQty: number;
  symbol: string;
}

export interface PositionRes {
  size: number;
  records: PositionRecord[];
  current: number;
  total: number;
}

// 查询交易员持仓列表
export function getTraderPositionList(params: PositionQueryParams) {
  return request<PositionRes>({
    url: '/position-relation-history/pc/query-page',
    method: 'POST',
    data: params
  });
}

// 查询持仓列表
export function getPositionList(params: AssetQueryParams) {
  return request<PositionRes>({
    url: '/position-history/pc/query-page',
    method: 'POST',
    data: params
  });
}