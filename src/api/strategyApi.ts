import request from './request';

// 单条策略实体
export interface StrategyItem {
  id: number;
  strategyName: string;
}

// 策略分页查询入参
export interface StrategyPageParams {
  pageNum: number;
  pageSize: number;
  orderColumn: string;
  orderType: 'asc' | 'desc';
  idList: number[];
  strategyName: string;
}

// 策略分页返回
export interface StrategyPageRes {
  size: number;
  records: StrategyItem[];
  current: number;
  total: number;
}

// 批量更新策略入参
export interface StrategyUpdateParams {
  investmentStrategys: StrategyItem[];
}

/**
 * 分页查询投资策略 /investment-strategy/pc/query-page
 */
export function queryStrategyPage(params: StrategyPageParams) {
  return request<StrategyPageRes>({
    url: '/investment-strategy/pc/query-page',
    method: 'POST',
    data: params
  });
}

/**
 * 批量更新投资策略 /investment-strategy/pc/update
 */
export function updateStrategyBatch(params: StrategyUpdateParams) {
  return request<number>({
    url: '/investment-strategy/pc/update',
    method: 'POST',
    data: params
  });
}