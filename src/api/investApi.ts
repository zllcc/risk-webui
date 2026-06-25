import request from './request'

/**
 * 获取投资策略列表
 * @param strategyName 策略名称模糊搜索
 */
export function getInvestStrategy(strategyName: string) {
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
export function getPositionRelation(params?: Record<string, any>) {
  return request({
    url: '/select/pc/position-relation',
    method: 'POST',
    data: params
  })
}

/**
 * 获取交易员列表
 */
export function getTraderList(params?: Record<string, any>) {
  return request({
    url: '/select/pc/trader',
    method: 'POST',
    data: params
  })
}
