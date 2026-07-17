import request from './request';

// 交易列表分页完整入参
export interface TradefilterParams {
  accountCodes: string[];
  tradeNames: string[];
  strategyNames: string[];
  startDate: string;
  endDate: string;
  conids: string[];
  sectors: string[];
  dateType: number;
}

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
  dateType: number;
  zoneType: string;
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
  allocateRemainQty: number;
  positionAllocateDetails?: TradeRecordItem[];
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
// 交易员基础实体
export interface TraderItem {
  id: number;
  traderName: string;
  capital: number;
  modifiedTime: string;
}

// 变更历史记录
export interface TraderModifiedHistory {
  orgTraderName: string;
  orgCapital: number;
  currentTraderName: string;
  currentCapital: number;
  modifiedTime: string;
}

// 交易员详情返回
export interface TraderDetailRes {
  id: number;
  traderName: string;
  capital: number;
  modifiedHistoryList: TraderModifiedHistory[];
}

// 分页查询入参
export interface TraderPageParams {
  pageNum: number;
  pageSize: number;
  orderColumn: string;
  orderType: 'asc' | 'desc';
  idList: number[];
  traderName: string;
}

// 分页返回结构
export interface TraderPageRes {
  size: number;
  records: TraderItem[];
  current: number;
  total: number;
}

// 新增/编辑/删除共用入参
export interface TraderOperateParams {
  id: number;
  traderName: string;
  capital: number;
}

/**
 * POST /position-execution/pc/query-page
 * 分页查询交易执行明细
 */
export function getTradePageList(params: TradePageParams) {
  return request<TradePageRes>({
    url: '/position-execution/pc/query-page',
    method: 'POST',
    data: params
  });
}

export function allocateTrade(params: AllocateApiParams) {
  return request<{ data: boolean }>({
    url: '/position-execution/pc/allocate',
    method: 'POST',
    data: params
  });
}

/**
 * 新增交易员 /trader/pc/create
 */
export function createTrader(params: TraderOperateParams) {
  return request<number>({
    url: '/trader/pc/create',
    method: 'POST',
    data: params
  });
}

/**
 * 删除交易员 /trader/pc/delete
 */
export function deleteTrader(params: TraderOperateParams) {
  return request<number>({
    url: '/trader/pc/delete',
    method: 'POST',
    data: params
  });
}

/**
 * 获取交易员详情（含变更记录） /trader/pc/detail
 */
export function getTraderDetail(params: TraderOperateParams) {
  return request<TraderDetailRes>({
    url: '/trader/pc/detail',
    method: 'POST',
    data: params
  });
}

/**
 * 分页查询交易员列表 /trader/pc/query-page
 */
export function queryTraderPage(params: TraderPageParams) {
  return request<TraderPageRes>({
    url: '/trader/pc/query-page',
    method: 'POST',
    data: params
  });
}

/**
 * 更新交易员 /trader/pc/update
 */
export function updateTrader(params: TraderOperateParams) {
  return request<number>({
    url: '/trader/pc/update',
    method: 'POST',
    data: params
  });
}