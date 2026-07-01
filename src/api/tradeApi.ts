import request from './request';

// 交易列表分页完整入参
export interface TradePageParams {
  accountCodes: string[];
  tradeNames: string[];
  strategyNames: string[];
  startDate: string;
  endDate: string;
  conids: string[];
  sectors: string[];
  pageNum: number;
  pageSize: number;
  secType: string;
}

// 后端单条交易记录
export interface TradeRecordItem {
  id: number;
  conid: number;
  symbol: string;
  time: string;
  accountCode: string;
  exchange: string;
  side: string;
  shares: number;
  price: string;
  commissionAndFees: string;
  currency: string;
  realizedPnl: number;
  remainQty: number;
}

// 分页data结构
export interface TradePageData {
  size: number;
  records: TradeRecordItem[];
  current: number;
  total: number;
}

// 接口完整返回体
export interface TradePageRes {
  msg: string;
  errorMsg: string;
  code: number;
  data: TradePageData;
}

/**
 * POST /contract-execution/pc/query-page
 * 分页查询交易执行明细
 */
export function getTradePageList(params: TradePageParams) {
  return request<TradePageRes>({
    url: '/contract-execution/pc/query-page',
    method: 'POST',
    data: params
  });
}