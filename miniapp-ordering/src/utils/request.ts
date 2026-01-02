/**
 * @spec O006-miniapp-channel-order
 * Taro 请求封装 - 统一 API 请求处理
 */

import Taro from '@tarojs/taro'

/**
 * API 响应格式(后端标准响应)
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp?: string
}

/**
 * 请求配置选项
 */
export interface RequestOptions {
  /** 请求 URL (支持相对路径,自动拼接 baseURL) */
  url: string

  /** HTTP 方法 */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

  /** 请求数据 */
  data?: Record<string, unknown> | string

  /** 请求头 */
  header?: Record<string, string>

  /** 超时时间(毫秒) */
  timeout?: number

  /** 是否需要认证(默认 true) */
  needAuth?: boolean

  /** 是否显示加载提示(默认 false) */
  showLoading?: boolean

  /** 加载提示文案 */
  loadingText?: string
}

/**
 * 请求错误类
 */
export class RequestError extends Error {
  code: string
  statusCode?: number

  constructor(message: string, code: string, statusCode?: number) {
    super(message)
    this.name = 'RequestError'
    this.code = code
    this.statusCode = statusCode
  }
}

/**
 * API 基础 URL (根据环境变量配置)
 */
const getBaseURL = (): string => {
  if (process.env.TARO_ENV === 'h5') {
    // H5 开发环境使用 Vite 代理
    return '/api'
  }

  // 小程序环境使用完整 URL
  return process.env.API_BASE_URL || 'http://localhost:8080/api'
}

/**
 * 获取认证 Token
 */
const getAuthToken = (): string | null => {
  try {
    return Taro.getStorageSync('auth_token') || null
  } catch (error) {
    console.warn('Failed to get auth token:', error)
    return null
  }
}

/**
 * 设置认证 Token
 */
export const setAuthToken = (token: string): void => {
  try {
    Taro.setStorageSync('auth_token', token)
  } catch (error) {
    console.error('Failed to set auth token:', error)
  }
}

/**
 * 清除认证 Token
 */
export const clearAuthToken = (): void => {
  try {
    Taro.removeStorageSync('auth_token')
  } catch (error) {
    console.error('Failed to clear auth token:', error)
  }
}

/**
 * 统一请求方法
 *
 * @param options 请求配置
 * @returns Promise<响应数据>
 *
 * @throws {RequestError} 请求失败时抛出错误
 *
 * @example
 * ```typescript
 * // GET 请求
 * const products = await request<ChannelProductDTO[]>({
 *   url: '/channel-products',
 *   method: 'GET'
 * })
 *
 * // POST 请求
 * const order = await request<ChannelProductOrderDTO>({
 *   url: '/channel-product-orders',
 *   method: 'POST',
 *   data: { items: [...] },
 *   showLoading: true,
 *   loadingText: '提交订单中...'
 * })
 * ```
 */
export const request = async <T = unknown>(
  options: RequestOptions
): Promise<T> => {
  const {
    url,
    method = 'GET',
    data,
    header = {},
    timeout = 30000,
    needAuth = true,
    showLoading = false,
    loadingText = '加载中...',
  } = options

  // 显示加载提示
  if (showLoading) {
    Taro.showLoading({ title: loadingText, mask: true })
  }

  try {
    // 构建完整 URL
    const fullURL = url.startsWith('http') ? url : `${getBaseURL()}${url}`

    // 构建请求头
    const requestHeader: Record<string, string> = {
      'Content-Type': 'application/json',
      ...header,
    }

    // 添加认证 Token
    if (needAuth) {
      const token = getAuthToken()
      if (token) {
        requestHeader.Authorization = `Bearer ${token}`
      }
    }

    // 发起请求
    const response = await Taro.request({
      url: fullURL,
      method,
      data,
      header: requestHeader,
      timeout,
    })

    // 隐藏加载提示
    if (showLoading) {
      Taro.hideLoading()
    }

    // 处理 HTTP 状态码
    if (response.statusCode >= 200 && response.statusCode < 300) {
      // 解析响应数据
      const apiResponse = response.data as ApiResponse<T>

      if (apiResponse.success !== undefined) {
        // 后端标准响应格式
        if (apiResponse.success) {
          return apiResponse.data as T
        } else {
          // 业务错误
          throw new RequestError(
            apiResponse.message || '请求失败',
            apiResponse.error || 'BUSINESS_ERROR',
            response.statusCode
          )
        }
      } else {
        // 直接返回数据(非标准格式)
        return response.data as T
      }
    } else if (response.statusCode === 401) {
      // 未认证,清除 Token 并提示登录
      clearAuthToken()
      Taro.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000,
      })
      throw new RequestError('未认证', 'UNAUTHORIZED', 401)
    } else if (response.statusCode === 403) {
      // 无权限
      Taro.showToast({
        title: '无权限访问',
        icon: 'none',
        duration: 2000,
      })
      throw new RequestError('无权限', 'FORBIDDEN', 403)
    } else if (response.statusCode === 404) {
      // 资源不存在
      throw new RequestError('资源不存在', 'NOT_FOUND', 404)
    } else {
      // 其他 HTTP 错误
      throw new RequestError(
        `请求失败 (${response.statusCode})`,
        'HTTP_ERROR',
        response.statusCode
      )
    }
  } catch (error) {
    // 隐藏加载提示
    if (showLoading) {
      Taro.hideLoading()
    }

    // 处理错误
    if (error instanceof RequestError) {
      throw error
    } else if (error instanceof Error) {
      // 网络错误或其他异常
      Taro.showToast({
        title: '网络请求失败',
        icon: 'none',
        duration: 2000,
      })
      throw new RequestError(error.message, 'NETWORK_ERROR')
    } else {
      // 未知错误
      throw new RequestError('未知错误', 'UNKNOWN_ERROR')
    }
  }
}

/**
 * GET 请求快捷方法
 */
export const get = <T = unknown>(
  url: string,
  options?: Omit<RequestOptions, 'url' | 'method'>
): Promise<T> => {
  return request<T>({ url, method: 'GET', ...options })
}

/**
 * POST 请求快捷方法
 */
export const post = <T = unknown>(
  url: string,
  data?: Record<string, unknown>,
  options?: Omit<RequestOptions, 'url' | 'method' | 'data'>
): Promise<T> => {
  return request<T>({ url, method: 'POST', data, ...options })
}

/**
 * PUT 请求快捷方法
 */
export const put = <T = unknown>(
  url: string,
  data?: Record<string, unknown>,
  options?: Omit<RequestOptions, 'url' | 'method' | 'data'>
): Promise<T> => {
  return request<T>({ url, method: 'PUT', data, ...options })
}

/**
 * DELETE 请求快捷方法
 */
export const del = <T = unknown>(
  url: string,
  options?: Omit<RequestOptions, 'url' | 'method'>
): Promise<T> => {
  return request<T>({ url, method: 'DELETE', ...options })
}
