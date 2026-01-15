/**
 * 认证类型定义
 *
 * 包含登录请求、响应、令牌等类型
 */

import { User } from './user'

/**
 * 登录请求
 */
export interface LoginRequest {
  /** 微信小程序登录凭证 code */
  code: string
}

/**
 * 登录响应
 */
export interface LoginResponse {
  /** 访问令牌（JWT） */
  accessToken: string

  /** 刷新令牌 */
  refreshToken: string

  /** 访问令牌有效期（秒） */
  expiresIn: number

  /** 用户基本信息 */
  user: User
}

/**
 * 刷新令牌请求
 */
export interface RefreshTokenRequest {
  /** 刷新令牌 */
  refreshToken: string
}

/**
 * 刷新令牌响应
 */
export interface RefreshTokenResponse {
  /** 新的访问令牌 */
  accessToken: string

  /** 新的刷新令牌 */
  refreshToken: string

  /** 访问令牌有效期（秒） */
  expiresIn: number
}

/**
 * Token 信息
 */
export interface Token {
  /** 访问令牌 */
  accessToken: string

  /** 刷新令牌 */
  refreshToken: string

  /** 过期时间戳（毫秒） */
  expiresAt: number
}

/**
 * API 统一响应格式
 */
export interface ApiResponse<T = any> {
  /** 是否成功 */
  success: boolean

  /** 响应数据（成功时） */
  data?: T

  /** 错误代码（失败时） */
  error?: string

  /** 错误消息（失败时） */
  message?: string

  /** 响应时间戳 */
  timestamp: string
}
