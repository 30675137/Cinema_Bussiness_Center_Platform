import Taro from '@tarojs/taro'

// API Base URL 配置
// 开发环境统一使用本地后端，生产环境再替换为线上地址
// 小程序中 localhost 指向模拟器本身，需要使用电脑的局域网 IP
const BASE_URL = 'http://192.168.10.71:8080'

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
