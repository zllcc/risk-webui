import request from './request';
import { PortfolioQueryParams, PortfolioQueryRes } from '@/types/portfolio';
import { ReferenceIndexRes } from '@/types/common';

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

/**
 * POST /select/pc/reference-index
 * 获取基准指数下拉列表
 */
export function getReferenceIndexList() {
  return request<ReferenceIndexRes>({
    url: '/select/pc/reference-index',
    method: 'POST',
    data: {},
  });
}