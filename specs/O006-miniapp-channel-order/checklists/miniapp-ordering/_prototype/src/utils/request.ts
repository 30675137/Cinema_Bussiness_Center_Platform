/**
 * 统一的HTTP请求封装
 *
 * 功能:
 * - 自动添加 Authorization header
 * - 自动处理 401 错误(令牌过期时自动刷新)
 * - 统一错误提示
 * - 请求/响应拦截
 */

import Taro from '@tarojs/taro'
import { getAccessToken, getUser } from './storage'
import { refreshToken } from '../services/authService'
import { clearAuth } from './storage'

/**
 * API基础URL
 */
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.cinema-hall.com' // 生产环境
  : 'http://192.168.10.71:8080' // 开发环境

/**
 * 请求配置接口
 */
export interface RequestConfig {
  /** 请求路径(相对于 API_BASE_URL) */
  url: string
  /** HTTP 方法 */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  /** 请求数据 */
  data?: unknown
  /** 额外的请求头 */
  header?: Record<string, string>
  /** 是否显示错误提示(默认 true) */
  showError?: boolean
  /** 是否需要认证(默认 true) */
  requiresAuth?: boolean
}

/**
 * API 响应格式
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
}

/**
 * 是否正在刷新令牌
 */
let isRefreshing = false

/**
 * 等待刷新令牌完成的 Promise 队列
 */
let refreshSubscribers: Array<() => void> = []

/**
 * 添加到刷新令牌等待队列
 */
function subscribeTokenRefresh(callback: () => void) {
  refreshSubscribers.push(callback)
}

/**
 * 令牌刷新完成,通知所有等待的请求
 */
function onTokenRefreshed() {
  refreshSubscribers.forEach((callback) => callback())
  refreshSubscribers = []
}

/**
 * 统一请求方法
 *
 * @param config 请求配置
 * @returns Promise<T> 返回响应数据
 */
export async function request<T = any>(config: RequestConfig): Promise<T> {
  const {
    url,
    method,
    data,
    header = {},
    showError = true,
    requiresAuth = true,
  } = config

  // Step 1: 准备请求头
  const requestHeader: Record<string, string> = {
    'Content-Type': 'application/json',
    ...header,
  }

  // 添加 Authorization header (如果需要认证)
  if (requiresAuth) {
    const token = getAccessToken()
    if (token) {
      requestHeader.Authorization = `Bearer ${token}`
    }
    // 添加 X-User-Id header
    const user = getUser()
    if (user?.id) {
      requestHeader['X-User-Id'] = user.id
    }
  }

  try {
    // Step 2: 发起请求
    const response = await Taro.request({
      url: `${API_BASE_URL}${url}`,
      method,
      data,
      header: requestHeader,
    })

    // Step 3: 处理 401 未授权错误
    if (response.statusCode === 401) {
      console.log('[Request] 401 Unauthorized, attempting token refresh...')

      // 如果正在刷新令牌,等待刷新完成后重试
      if (isRefreshing) {
        console.log('[Request] Token refresh in progress, queuing request...')
        return new Promise((resolve) => {
          subscribeTokenRefresh(async () => {
            console.log('[Request] Token refreshed, retrying original request...')
            resolve(await request<T>(config))
          })
        })
      }

      // 开始刷新令牌
      isRefreshing = true
      try {
        await refreshToken()
        isRefreshing = false

        // 通知所有等待的请求
        onTokenRefreshed()

        // 重试原请求
        console.log('[Request] Token refreshed successfully, retrying original request...')
        return await request<T>(config)

      } catch (refreshError) {
        isRefreshing = false
        refreshSubscribers = []

        // 刷新失败,清除认证数据
        clearAuth()

        Taro.showToast({
          title: '登录已过期,请重启小程序',
          icon: 'none',
          duration: 2000,
        })

        throw new Error('Token refresh failed, please restart the app')
      }
    }

    // Step 4: 处理其他 HTTP 错误
    if (response.statusCode >= 400) {
      const errorData = response.data as { message?: string; error?: string }
      const errorMessage = errorData.message || errorData.error || '请求失败'

      if (showError) {
        Taro.showToast({
          title: errorMessage,
          icon: 'none',
          duration: 2000,
        })
      }

      throw new Error(errorMessage)
    }

    // Step 5: 解析 API 响应
    const apiResponse = response.data as ApiResponse<T>

    if (apiResponse.success === false) {
      const errorMessage = apiResponse.message || apiResponse.error || '请求失败'

      if (showError) {
        Taro.showToast({
          title: errorMessage,
          icon: 'none',
          duration: 2000,
        })
      }

      throw new Error(errorMessage)
    }

    // Step 6: 返回数据
    return apiResponse.data as T

  } catch (error: any) {
    // 网络错误处理
    if (error.errMsg?.includes('request:fail')) {
      const networkError = '网络异常,请检查网络连接'

      if (showError) {
        Taro.showToast({
          title: networkError,
          icon: 'none',
          duration: 2000,
        })
      }

      throw new Error(networkError)
    }

    // 其他错误直接抛出
    throw error
  }
}

/**
 * GET 请求
 */
export function get<T = any>(url: string, config?: Partial<RequestConfig>): Promise<T> {
  return request<T>({ url, method: 'GET', ...config })
}

/**
 * POST 请求
 */
export function post<T = any>(url: string, data?: unknown, config?: Partial<RequestConfig>): Promise<T> {
  return request<T>({ url, method: 'POST', data, ...config })
}

/**
 * PUT 请求
 */
export function put<T = any>(url: string, data?: unknown, config?: Partial<RequestConfig>): Promise<T> {
  return request<T>({ url, method: 'PUT', data, ...config })
}

/**
 * DELETE 请求
 */
export function del<T = any>(url: string, config?: Partial<RequestConfig>): Promise<T> {
  return request<T>({ url, method: 'DELETE', ...config })
}
