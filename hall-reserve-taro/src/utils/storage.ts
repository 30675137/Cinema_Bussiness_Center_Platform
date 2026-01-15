/**
 * 本地存储工具
 *
 * 封装 Taro.setStorageSync/getStorageSync，提供类型安全的存储 API
 */

import Taro from '@tarojs/taro'
import { User } from '../types/user'
import { Token } from '../types/auth'
import type { CartItem } from '../types/cart' // @spec O010-shopping-cart

/**
 * 存储键常量
 */
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  TOKEN_EXPIRES_AT: 'token_expires_at',
  USER_INFO: 'user_info',
  CART: 'cart', // @spec O010-shopping-cart
} as const

/**
 * 设置访问令牌
 */
export const setAccessToken = (token: string): void => {
  Taro.setStorageSync(STORAGE_KEYS.ACCESS_TOKEN, token)
}

/**
 * 获取访问令牌
 */
export const getAccessToken = (): string | null => {
  return Taro.getStorageSync(STORAGE_KEYS.ACCESS_TOKEN) || null
}

/**
 * 设置刷新令牌
 */
export const setRefreshToken = (token: string): void => {
  Taro.setStorageSync(STORAGE_KEYS.REFRESH_TOKEN, token)
}

/**
 * 获取刷新令牌
 */
export const getRefreshToken = (): string | null => {
  return Taro.getStorageSync(STORAGE_KEYS.REFRESH_TOKEN) || null
}

/**
 * 设置令牌过期时间
 *
 * @param expiresAt 过期时间戳（毫秒）
 */
export const setTokenExpiresAt = (expiresAt: number): void => {
  Taro.setStorageSync(STORAGE_KEYS.TOKEN_EXPIRES_AT, expiresAt)
}

/**
 * 获取令牌过期时间
 */
export const getTokenExpiresAt = (): number | null => {
  const expiresAt = Taro.getStorageSync(STORAGE_KEYS.TOKEN_EXPIRES_AT)
  return expiresAt ? Number(expiresAt) : null
}

/**
 * 设置完整令牌信息
 *
 * @param accessToken 访问令牌
 * @param refreshToken 刷新令牌
 * @param expiresIn 访问令牌有效期（秒）
 */
export const setToken = (
  accessToken: string,
  refreshToken: string,
  expiresIn: number
): void => {
  const now = Date.now()
  const expiresAt = now + expiresIn * 1000

  setAccessToken(accessToken)
  setRefreshToken(refreshToken)
  setTokenExpiresAt(expiresAt)

  console.log('[Storage] Token saved, expires at:', new Date(expiresAt).toISOString())
}

/**
 * 获取完整令牌信息
 */
export const getToken = (): Token | null => {
  const accessToken = getAccessToken()
  const refreshToken = getRefreshToken()
  const expiresAt = getTokenExpiresAt()

  if (!accessToken || !refreshToken || !expiresAt) {
    return null
  }

  return {
    accessToken,
    refreshToken,
    expiresAt,
  }
}

/**
 * 移除所有令牌
 */
export const removeToken = (): void => {
  Taro.removeStorageSync(STORAGE_KEYS.ACCESS_TOKEN)
  Taro.removeStorageSync(STORAGE_KEYS.REFRESH_TOKEN)
  Taro.removeStorageSync(STORAGE_KEYS.TOKEN_EXPIRES_AT)

  console.log('[Storage] Token removed')
}

/**
 * 设置用户信息
 */
export const setUser = (user: User): void => {
  Taro.setStorageSync(STORAGE_KEYS.USER_INFO, JSON.stringify(user))
  console.log('[Storage] User info saved:', user.id)
}

/**
 * 获取用户信息
 */
export const getUser = (): User | null => {
  const userJson = Taro.getStorageSync(STORAGE_KEYS.USER_INFO)

  if (!userJson) {
    return null
  }

  try {
    return JSON.parse(userJson) as User
  } catch (error) {
    console.error('[Storage] Failed to parse user info:', error)
    return null
  }
}

/**
 * 移除用户信息
 */
export const removeUser = (): void => {
  Taro.removeStorageSync(STORAGE_KEYS.USER_INFO)
  console.log('[Storage] User info removed')
}

/**
 * 清除所有认证相关数据
 */
export const clearAuth = (): void => {
  removeToken()
  removeUser()
  console.log('[Storage] All auth data cleared')
}

/**
 * 检查是否已登录
 *
 * @returns true 如果存在有效的令牌和用户信息
 */
export const isLoggedIn = (): boolean => {
  const token = getToken()
  const user = getUser()

  return !!(token && user)
}

// ========== 购物车存储 (@spec O010-shopping-cart) ==========

/**
 * 保存购物车到本地存储
 * @spec O010-shopping-cart
 */
export const saveCart = (cart: CartItem[]): void => {
  try {
    Taro.setStorageSync(STORAGE_KEYS.CART, cart)
  } catch (error) {
    console.error('[Storage] Failed to save cart:', error)
  }
}

/**
 * 从本地存储加载购物车
 * @spec O010-shopping-cart
 * @returns 购物车项数组（如果加载失败或数据无效，返回空数组）
 */
export const loadCart = (): CartItem[] => {
  try {
    const cart = Taro.getStorageSync(STORAGE_KEYS.CART)

    // 验证数据结构
    if (!Array.isArray(cart)) {
      console.warn('[Storage] Invalid cart data structure, resetting to empty cart')
      return []
    }

    // 过滤无效项
    const validItems = cart.filter(item =>
      item.product &&
      typeof item.product.id === 'string' &&
      typeof item.product.price === 'number' &&
      typeof item.quantity === 'number' &&
      item.quantity > 0
    )

    // 如果有无效项被过滤，更新存储
    if (validItems.length !== cart.length) {
      console.warn(`[Storage] Filtered ${cart.length - validItems.length} invalid cart items`)
      saveCart(validItems)
    }

    return validItems
  } catch (error) {
    console.error('[Storage] Failed to load cart:', error)
    return []
  }
}

/**
 * 清空购物车本地存储
 * @spec O010-shopping-cart
 */
export const clearCartStorage = (): void => {
  try {
    Taro.removeStorageSync(STORAGE_KEYS.CART)
    console.log('[Storage] Cart cleared')
  } catch (error) {
    console.error('[Storage] Failed to clear cart:', error)
  }
}
