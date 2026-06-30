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
