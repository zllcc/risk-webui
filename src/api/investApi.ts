import request from './request'

/**
 * 获取投资策略列表
 * @param strategyName 策略名称模糊搜索
 */
export function queryInvestStrategy(strategyName: string) {
  return request({
    url: '/select/pc/investment-strategy',
    method: 'POST',
    data: {
      strategyName
    }
  })
}

/**
 * 获取持仓关联数据
 */
export function queryPositionRelation(params?: Record<string, any>) {
  return request({
    url: '/select/pc/position-relation',
    method: 'POST',
    data: params
  })
}

// 获取板块下拉
export function getContractSectorList() {
  return request<{value:string; label:string}[]>({
    url: '/select/pc/contract-sector',
    method: 'POST',
    data: {}
  })
}

// 获取标的下拉
export function getContractList(symbol: string = '') {
  return request<{value:string; label:string}[]>({
    url: '/select/pc/contract',
    method: 'POST',
    data: { symbol }
  })
}

export function getZoneOptions() {
  return request<{value:string; label:string}[]>({
    url: '/select/pc/zone',
    method: 'POST',
    data: {}
  })
}
