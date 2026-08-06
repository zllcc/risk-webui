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
  startDate: string;
  endDate: string;
  conids: string[];
  sectors: string[];
  pageNum: number;
  pageSize: number;
  secType: string;
  dateType: number | null;
  zoneType: string;
  tradeNames?: string[];
  strategyNames?: string[];
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
  strategyName: string;
  loan: number;
  interest: number;
  fee: number;
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
  traderName?: string;
  strategyName?: string;
  traderNames?: string[];
  strategyNames?: string[];
  accountCodes?: string[];
}

// 分页返回结构
export interface TraderPageRes {
  size: number;
  records: TraderItem[];
  current: number;
  total: number;
}

// 新增入参
export interface TraderAddParams {
  traderName: string;
  strategyName?: string;
  capital: number;
  loan?: number;
  interest?: number;
  fee?: number;
}

// 编辑/删除入参
export interface TraderOperateParams {
  id: number;
  traderName: string;
  capital: number;
  strategyName?: string;
  loan?: number;
  interest?: number;
  fee?: number;
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
 * 新增交易员 /trader-capital/pc/add
 */
export function createTrader(params: TraderAddParams) {
  return request<number>({
    url: '/trader-capital/pc/add',
    method: 'POST',
    data: params
  });
}

/**
 * 删除交易员 /trader-capital/pc/delete
 */
export function deleteTrader(params: { id: number }) {
  return request<number>({
    url: '/trader-capital/pc/delete',
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
 * 分页查询交易员列表 /trader-capital/pc/query-page
 */
export function queryTraderPage(params: TraderPageParams) {
  return request<TraderPageRes>({
    url: '/trader-capital/pc/query-page',
    method: 'POST',
    data: params
  });
}

/**
 * 更新交易员 /trader-capital/pc/update
 */
export function updateTrader(params: TraderOperateParams) {
  return request<number>({
    url: '/trader-capital/pc/update',
    method: 'POST',
    data: params
  });
}

// 交易员历史记录项
export interface TraderHistoryItem {
  id: number;
  traderName: string;
  capital: number;
  strategyName?: string;
  loan?: number;
  interest?: number;
  fee?: number;
  modifiedTime: string;
  createTime: string;
}

// 历史记录分页参数
export interface TraderHistoryParams {
  traderId: number;
  pageNum: number;
  pageSize: number;
}

// 历史记录分页返回
export interface TraderHistoryPageRes {
  size: number;
  records: TraderHistoryItem[];
  current: number;
  total: number;
}

/**
 * 查询交易员历史记录 /trader-capital/pc/history-page
 */
export function queryTraderHistory(params: TraderHistoryParams) {
  return request<TraderHistoryPageRes>({
    url: '/trader-capital/pc/history-page',
    method: 'POST',
    data: params
  });
}

/**
 * POST /position-trader-execution/pc/query-page
 * 交易员交易执行明细分页查询
 */
export function getTraderTradePageList(params: TradePageParams) {
  return request<TradePageRes>({
    url: '/position-trader-execution/pc/query-page',
    method: 'POST',
    data: params
  });
}

/**
 * 交易员交易核算
 * POST /position-trader-execution/pc/trader-cal
 */
export function executeTraderTradeCal(data?: Record<string, any>) {
  return request.post('/position-trader-execution/pc/trader-cal', data);
}

