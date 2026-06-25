import axios from 'axios'
import { message } from 'antd'

// 创建实例
const request = axios.create({
  baseURL: '', // 开发环境靠vite代理，不用写完整域名
  timeout: 15000
})

// 请求拦截器：自动携带token
request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：统一处理报错、返回数据
request.interceptors.response.use(
  (res) => {
    // 根据后端返回结构调整，示例：后端 { code:200, data: {}, msg:'' }
    const data = res.data
    if (data.code !== 0) {
      message.error(data.msg || '接口请求失败')
      return Promise.reject(data)
    }
    return data.data // 直接返回业务数据，页面不用多层取data
  },
  (err) => {
    message.error('网络异常，请检查服务连接')
    return Promise.reject(err)
  }
)

export default request;