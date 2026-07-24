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

/**
 * 导入交易数据
 * POST /position-execution/pc/import
 * @param file base64文件字符串
 */
export function importPositionExecution(data?: Record<string, any>) {
  return request.post('/position-execution/pc/import', data);
}


/**
 * 下载错误文件
 * GET /position-execution/pc/download-error-file
 * @param params 后端需要的查询参数（根据实际需求调整）
 */
export function downloadErrorFile(params?: Record<string, any>) {
  return request.get('/position-execution/pc/download-error-file', {
    params,
    responseType: 'blob', // 文件下载必须 blob
  });
}

/**
 * 下载交易数据导入模板
 * GET /position-execution/pc/download-template
 */
export function downloadTradeTemplate(params?: Record<string, any>) {
  return request.get('/position-execution/pc/download-template', {
    params,
    responseType: 'blob',
  });
}


/**
 * 执行交易核算
 * POST /position-execution/pc/cal
 */
export function executeTradeCal(data?: Record<string, any>) {
  return request.post('/position-execution/pc/cal', data);
}