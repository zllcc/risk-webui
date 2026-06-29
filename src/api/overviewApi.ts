import request from './request';
import { PortfolioQueryParams, PortfolioQueryRes } from '@/types/portfolio';

/**
 * POST /portfolio-overview/pc/query-list
 * 投资组合总览 查询表格+图表数据
 * @param params 筛选入参
 */
export function queryPortfolioOverviewList(params: PortfolioQueryParams) {
    console.log(params, '入参');
  return request<PortfolioQueryRes>({
    url: '/portfolio-overview/pc/query-list',
    method: 'POST',
    data: params,
  });
}