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

// 分配接口详情入参
interface AllocateDetailItem {
  accountCode: string;
  conid: number;
  strategyName: string;
  traderName: string;
  allocateQty: number;
}

// 分配接口整体入参
export interface AllocateApiParams {
  id: number;
  operateType: number;
  details: AllocateDetailItem[];
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

export function allocateTrade(params: AllocateApiParams) {
  return request<{ data: boolean }>({
    url: '/contract-execution/pc/allocate',
    method: 'POST',
    data: params
  });
}