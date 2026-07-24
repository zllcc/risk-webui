import request from './request';

// 获取合约列表
export const getContractData = (data: any) => request.post('/contract/pc/query-page', data);

// 仅更新合约代码
export const updateContractCode = (data: { id: number; shortName: string }) => request.post('/contract/pc/update', data);

// 获取合约历史行情（查看弹窗表格数据）
export const getContractPriceHistory = (data: any) => request.post('/contract/pc/market-history', data);