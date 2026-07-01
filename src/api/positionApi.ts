import request from './request';

export interface PositionQueryParams {
  pageNum: number;
  pageSize: number;
  orderColumn: string;
  orderType: 'asc' | 'desc';
  idList: number[];
  accountCodes: string[];
  conids: number[];
  secType: string;
  // 新增筛选字段
  tradeNames: string[];
  strategyNames: string[];
  startDate: string;
  endDate: string;
  sectors: string[];
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

// 查询持仓列表
export function getPositionList(params: PositionQueryParams) {
  return request<PositionRes>({
    url: '/position/pc/query-page',
    method: 'POST',
    data: params
  });
}