import request from './request';

// 获取页面表头配置入参
export interface GetColumnDisplayParams {
  pageName: string;
  type: string;
  columnName: string;
  isDisplay: boolean;
}

// 单列表头配置项
export interface ColumnDisplayItem {
  id: number;
  userId: number;
  pageName: string;
  type: string;
  columnName: string;
  isDisplay: boolean;
}

// 更新表头展示状态入参
export interface UpdateColumnDisplayParams {
  pageName: string;
  type: string;
  columnName: string;
  isDisplay: boolean;
}

/**
 * 根据页面名称、分类获取表头展示配置
 */
export function getPageColumnDisplay(params: GetColumnDisplayParams) {
  return request<ColumnDisplayItem[]>({
    url: '/page-column-display/pc/get-by-page',
    method: 'POST',
    data: params
  });
}

/**
 * 更新表头显隐配置
 */
export function updateColumnDisplay(params: UpdateColumnDisplayParams) {
  return request<number>({
    url: '/page-column-display/pc/update-display',
    method: 'POST',
    data: params
  });
}