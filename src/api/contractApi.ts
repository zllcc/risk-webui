import request from './request';

// 获取合约列表
export const getContractList = (params: any) => request.get('/contract/list', { params });

// 仅更新合约代码
export const updateContractCode = (data: { id: number; code: string }) => request.post('/contract/updateCode', data);

// 获取合约历史行情（查看弹窗表格数据）
export const getContractPriceHistory = (params: any) => request.get('/contract/priceHistory', { params });