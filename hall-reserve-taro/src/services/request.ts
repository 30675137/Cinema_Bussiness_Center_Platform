/**
 * @spec O009-miniapp-product-list
 * Unified API request service with token refresh interceptor
 */

import Taro from '@tarojs/taro'
import { BASE_URL, DEFAULT_HEADERS, TIMEOUT_CONFIG } from '@/constants/api'

/**
 * Request configuration
 */
export interface RequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  data?: Record<string, any>
  header?: Record<string, string>
  timeout?: number
  skipAuth?: boolean
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  timestamp: string
  message?: string
  error?: string
}

/**
 * Request error
 */
export class RequestError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errorCode?: string
  ) {
    super(message)
    this.name = 'RequestError'
  }
}

/**
 * Token storage keys
 */
const TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

/**
 * Get access token from storage
 */
export const getAccessToken = (): string | null => {
  return Taro.getStorageSync(TOKEN_KEY)
}

/**
 * Get refresh token from storage
 */
export const getRefreshToken = (): string | null => {
  return Taro.getStorageSync(REFRESH_TOKEN_KEY)
}

/**
 * Set access token to storage
 */
export const setAccessToken = (token: string): void => {
  Taro.setStorageSync(TOKEN_KEY, token)
}

/**
 * Set refresh token to storage
 */
export const setRefreshToken = (token: string): void => {
  Taro.setStorageSync(REFRESH_TOKEN_KEY, token)
}

/**
 * Clear all tokens
 */
export const clearTokens = (): void => {
  Taro.removeStorageSync(TOKEN_KEY)
  Taro.removeStorageSync(REFRESH_TOKEN_KEY)
}

/**
 * Refresh token flag to prevent concurrent refresh requests
 */
let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

/**
 * Subscribe to token refresh
 */
const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback)
}

/**
 * Notify all subscribers when token is refreshed
 */
const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token))
  refreshSubscribers = []
}

/**
 * Refresh access token using refresh token
 */
const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    throw new RequestError('No refresh token available', 401, 'NO_REFRESH_TOKEN')
  }

  try {
    const response = await Taro.request({
      url: `${BASE_URL}/api/auth/refresh`,
      method: 'POST',
      header: {
        ...DEFAULT_HEADERS,
        Authorization: `Bearer ${refreshToken}`,
      },
      timeout: TIMEOUT_CONFIG.DEFAULT,
    })

    const result = response.data as ApiResponse<{ accessToken: string; refreshToken?: string }>

    if (!result.success || !result.data.accessToken) {
      throw new RequestError('Failed to refresh token', 401, 'REFRESH_FAILED')
    }

    // Update tokens
    setAccessToken(result.data.accessToken)
    if (result.data.refreshToken) {
      setRefreshToken(result.data.refreshToken)
    }

    return result.data.accessToken
  } catch (error) {
    clearTokens()
    throw new RequestError('Token refresh failed', 401, 'REFRESH_FAILED')
  }
}

/**
 * Unified request function with token refresh interceptor
 */
export const request = async <T = any>(config: RequestConfig): Promise<T> => {
  const {
    url,
    method = 'GET',
    data,
    header = {},
    timeout = TIMEOUT_CONFIG.DEFAULT,
    skipAuth = false,
  } = config

  // Build full URL
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`

  // Build headers
  const requestHeader = {
    ...DEFAULT_HEADERS,
    ...header,
  }

  // Add authorization header if not skipped
  if (!skipAuth) {
    const token = getAccessToken()
    if (token) {
      requestHeader.Authorization = `Bearer ${token}`
    }
  }

  try {
    const response = await Taro.request({
      url: fullUrl,
      method,
      data,
      header: requestHeader,
      timeout,
    })

    // Check response status
    if (response.statusCode >= 200 && response.statusCode < 300) {
      const result = response.data as ApiResponse<T>

      if (!result.success) {
        throw new RequestError(
          result.message || 'Request failed',
          response.statusCode,
          result.error
        )
      }

      return result.data
    }

    // Handle 401 Unauthorized - Token expired
    if (response.statusCode === 401 && !skipAuth) {
      if (!isRefreshing) {
        isRefreshing = true

        try {
          const newToken = await refreshAccessToken()
          isRefreshing = false
          onTokenRefreshed(newToken)

          // Retry original request with new token
          return request(config)
        } catch (refreshError) {
          isRefreshing = false
          refreshSubscribers = []

          // Navigate to login page
          Taro.navigateTo({ url: '/pages/login/index' })

          throw new RequestError('Authentication failed', 401, 'AUTH_FAILED')
        }
      } else {
        // Wait for token refresh to complete
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh(() => {
            request(config).then(resolve).catch(reject)
          })
        })
      }
    }

    // Handle other HTTP errors
    const errorData = response.data as ApiResponse
    throw new RequestError(
      errorData.message || `HTTP ${response.statusCode}`,
      response.statusCode,
      errorData.error
    )
  } catch (error) {
    if (error instanceof RequestError) {
      throw error
    }

    // Handle network errors
    throw new RequestError(
      '网络请求失败,请检查网络连接',
      0,
      'NETWORK_ERROR'
    )
  }
}

/**
 * GET request
 */
export const get = <T = any>(
  url: string,
  params?: Record<string, any>,
  config?: Omit<RequestConfig, 'url' | 'method' | 'data'>
): Promise<T> => {
  // Build query string
  let fullUrl = url
  if (params) {
    const queryString = Object.entries(params)
      .filter(([, value]) => value !== null && value !== undefined)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&')

    if (queryString) {
      fullUrl += `?${queryString}`
    }
  }

  return request<T>({ ...config, url: fullUrl, method: 'GET' })
}

/**
 * POST request
 */
export const post = <T = any>(
  url: string,
  data?: Record<string, any>,
  config?: Omit<RequestConfig, 'url' | 'method' | 'data'>
): Promise<T> => {
  return request<T>({ ...config, url, method: 'POST', data })
}

/**
 * PUT request
 */
export const put = <T = any>(
  url: string,
  data?: Record<string, any>,
  config?: Omit<RequestConfig, 'url' | 'method' | 'data'>
): Promise<T> => {
  return request<T>({ ...config, url, method: 'PUT', data })
}

/**
 * DELETE request
 */
export const del = <T = any>(
  url: string,
  config?: Omit<RequestConfig, 'url' | 'method'>
): Promise<T> => {
  return request<T>({ ...config, url, method: 'DELETE' })
}
