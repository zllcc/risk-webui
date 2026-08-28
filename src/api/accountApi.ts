import request from './request'

/**
 * 获取账号下拉选项
 * POST /select/pc/account
 */
export function getAccountSelectList(accountCode: string = '') {
  return request<{value: string; label: string}[]>({
    url: '/select/pc/account',
    method: 'POST',
    data: { accountCode }
  })
}

/**
 * 获取操盘人下拉选项
 * POST /select/pc/trader
 */
export function getTraderSelectList(params: {accountCodes: string[], traderName: string}) {
  return request<{value: string; label: string}[]>({
    url: '/select/pc/trader',
    method: 'POST',
    data: params
  })
}

/**
 * 获取币种下拉选项
 * POST /select/pc/currency
 */
export function getCurrencySelectList(currency: string = '') {
  return request<{value: string; label: string}[]>({
    url: '/select/pc/currency',
    method: 'POST',
    data: { currency }
  })
}