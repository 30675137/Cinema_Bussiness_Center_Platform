/**
 * @spec O007-miniapp-menu-api
 * 错误处理工具 - 定义 API 错误类和错误处理函数
 */

/**
 * API 错误码枚举
 */
export enum ApiErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN = 'UNKNOWN',
}

/**
 * API 错误类
 */
export class ApiError extends Error {
  /** 错误码 */
  code: ApiErrorCode
  /** HTTP 状态码 */
  statusCode?: number
  /** 错误详情 */
  details?: Record<string, unknown>

  constructor(
    code: ApiErrorCode,
    message: string,
    statusCode?: number,
    details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }

  /**
   * 是否为网络错误
   */
  get isNetworkError(): boolean {
    return this.code === ApiErrorCode.NETWORK_ERROR || this.code === ApiErrorCode.TIMEOUT
  }

  /**
   * 是否为认证错误
   */
  get isAuthError(): boolean {
    return this.code === ApiErrorCode.UNAUTHORIZED || this.code === ApiErrorCode.FORBIDDEN
  }

  /**
   * 是否为服务器错误
   */
  get isServerError(): boolean {
    return this.code === ApiErrorCode.SERVER_ERROR
  }

  /**
   * 获取用户友好的错误消息
   */
  getUserMessage(): string {
    switch (this.code) {
      case ApiErrorCode.NETWORK_ERROR:
        return '网络已断开，请检查网络连接'
      case ApiErrorCode.TIMEOUT:
        return '网络超时，请检查网络后重试'
      case ApiErrorCode.UNAUTHORIZED:
        return '登录已过期，请重新登录'
      case ApiErrorCode.FORBIDDEN:
        return '暂无访问权限'
      case ApiErrorCode.NOT_FOUND:
        return '请求的资源不存在'
      case ApiErrorCode.SERVER_ERROR:
        return '服务异常，请稍后重试'
      default:
        return '操作失败，请重试'
    }
  }
}

/**
 * 根据 HTTP 状态码创建 ApiError
 */
export function createApiError(
  statusCode: number,
  message?: string,
  details?: Record<string, unknown>
): ApiError {
  let code: ApiErrorCode
  let defaultMessage: string

  switch (statusCode) {
    case 401:
      code = ApiErrorCode.UNAUTHORIZED
      defaultMessage = '未授权访问'
      break
    case 403:
      code = ApiErrorCode.FORBIDDEN
      defaultMessage = '禁止访问'
      break
    case 404:
      code = ApiErrorCode.NOT_FOUND
      defaultMessage = '资源不存在'
      break
    case 408:
    case 504:
      code = ApiErrorCode.TIMEOUT
      defaultMessage = '请求超时'
      break
    case 500:
    case 502:
    case 503:
      code = ApiErrorCode.SERVER_ERROR
      defaultMessage = '服务器错误'
      break
    default:
      if (statusCode >= 400 && statusCode < 500) {
        code = ApiErrorCode.UNKNOWN
        defaultMessage = '请求错误'
      } else if (statusCode >= 500) {
        code = ApiErrorCode.SERVER_ERROR
        defaultMessage = '服务器错误'
      } else {
        code = ApiErrorCode.UNKNOWN
        defaultMessage = '未知错误'
      }
  }

  return new ApiError(code, message || defaultMessage, statusCode, details)
}

/**
 * 创建网络错误
 */
export function createNetworkError(message?: string): ApiError {
  return new ApiError(
    ApiErrorCode.NETWORK_ERROR,
    message || '网络连接失败',
    undefined,
    undefined
  )
}

/**
 * 创建超时错误
 */
export function createTimeoutError(message?: string): ApiError {
  return new ApiError(
    ApiErrorCode.TIMEOUT,
    message || '请求超时',
    408,
    undefined
  )
}

/**
 * 判断是否为网络错误
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.isNetworkError
  }
  if (error instanceof Error) {
    const msg = error.message.toLowerCase()
    return msg.includes('network') || msg.includes('timeout') || msg.includes('连接')
  }
  return false
}

/**
 * 判断是否为认证错误
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.isAuthError
  }
  return false
}
