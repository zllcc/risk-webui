import request from './request'

// 获取账户列表接口
export function getPcAccount(params?: any) {
  return request({
    url: '/select/pc/account',
    method: 'GET',
    params // 分页/筛选参数，自动拼接到url
  })
}