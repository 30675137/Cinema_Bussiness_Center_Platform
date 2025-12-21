import Taro from '@tarojs/taro'

// API Base URL 配置
const BASE_URL = process.env.TARO_ENV === 'weapp'
  ? 'https://api.production.com'  // 生产环境（小程序）
  : 'http://localhost:8080'        // 开发环境（H5）

/**
 * 统一网络请求封装
 * 基于 Taro.request 实现，支持微信小程序和 H5 多端
 */
export async function request<T>(url: string, options?: Taro.request.Option): Promise<T> {
  try {
    const response = await Taro.request({
      url: `${BASE_URL}${url}`,
      timeout: 10000, // 10 秒超时
      header: {
        'Content-Type': 'application/json',
        // 如需添加 Token，可在此处处理
        // 'Authorization': `Bearer ${getToken()}`
      },
      ...options,
    })

    // 检查 HTTP 状态码
    if (response.statusCode !== 200) {
      throw new Error(`HTTP ${response.statusCode}: ${response.data?.message || 'Request failed'}`)
    }

    return response.data as T
  } catch (error) {
    console.error('Request error:', error)
    throw error
  }
}
