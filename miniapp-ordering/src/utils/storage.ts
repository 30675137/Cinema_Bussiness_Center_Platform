/**
 * @spec O006-miniapp-channel-order
 * Taro 存储工具封装 - 统一本地存储接口
 */

import Taro from '@tarojs/taro'

/**
 * 存储键名常量(避免硬编码)
 */
export const STORAGE_KEYS = {
  /** 认证 Token */
  AUTH_TOKEN: 'auth_token',

  /** 用户信息 */
  USER_INFO: 'user_info',

  /** 购物车数据(可选持久化) */
  CART_DATA: 'cart_data',

  /** 最近浏览的商品 ID 列表 */
  RECENT_PRODUCTS: 'recent_products',

  /** 用户偏好设置 */
  USER_PREFERENCES: 'user_preferences',
} as const

/**
 * 存储值类型(确保类型安全)
 */
export interface StorageValues {
  [STORAGE_KEYS.AUTH_TOKEN]: string
  [STORAGE_KEYS.USER_INFO]: {
    id: string
    nickname: string
    avatar: string
  }
  [STORAGE_KEYS.CART_DATA]: unknown // 根据实际购物车数据结构定义
  [STORAGE_KEYS.RECENT_PRODUCTS]: string[]
  [STORAGE_KEYS.USER_PREFERENCES]: {
    theme: 'light' | 'dark'
    language: 'zh-CN' | 'en-US'
  }
}

/**
 * 设置存储值(同步)
 *
 * @param key 存储键
 * @param value 存储值
 * @returns 是否成功
 *
 * @example
 * ```typescript
 * setStorageSync(STORAGE_KEYS.AUTH_TOKEN, 'your-token-here')
 * setStorageSync(STORAGE_KEYS.USER_INFO, { id: '123', nickname: '用户A', avatar: 'url' })
 * ```
 */
export const setStorageSync = <K extends keyof StorageValues>(
  key: K,
  value: StorageValues[K]
): boolean => {
  try {
    Taro.setStorageSync(key, value)
    return true
  } catch (error) {
    console.error(`Failed to set storage for key "${key}":`, error)
    return false
  }
}

/**
 * 获取存储值(同步)
 *
 * @param key 存储键
 * @param defaultValue 默认值(如果不存在)
 * @returns 存储值或默认值
 *
 * @example
 * ```typescript
 * const token = getStorageSync(STORAGE_KEYS.AUTH_TOKEN, null)
 * const userInfo = getStorageSync(STORAGE_KEYS.USER_INFO, null)
 * ```
 */
export const getStorageSync = <K extends keyof StorageValues>(
  key: K,
  defaultValue: StorageValues[K] | null = null
): StorageValues[K] | null => {
  try {
    const value = Taro.getStorageSync(key)
    return value !== undefined && value !== '' ? value : defaultValue
  } catch (error) {
    console.error(`Failed to get storage for key "${key}":`, error)
    return defaultValue
  }
}

/**
 * 移除存储值(同步)
 *
 * @param key 存储键
 * @returns 是否成功
 *
 * @example
 * ```typescript
 * removeStorageSync(STORAGE_KEYS.AUTH_TOKEN)
 * ```
 */
export const removeStorageSync = <K extends keyof StorageValues>(
  key: K
): boolean => {
  try {
    Taro.removeStorageSync(key)
    return true
  } catch (error) {
    console.error(`Failed to remove storage for key "${key}":`, error)
    return false
  }
}

/**
 * 清空所有存储(同步)
 *
 * @returns 是否成功
 *
 * @example
 * ```typescript
 * clearStorageSync()
 * ```
 */
export const clearStorageSync = (): boolean => {
  try {
    Taro.clearStorageSync()
    return true
  } catch (error) {
    console.error('Failed to clear storage:', error)
    return false
  }
}

/**
 * 检查存储键是否存在
 *
 * @param key 存储键
 * @returns 是否存在
 *
 * @example
 * ```typescript
 * if (hasStorage(STORAGE_KEYS.AUTH_TOKEN)) {
 *   console.log('已登录')
 * }
 * ```
 */
export const hasStorage = <K extends keyof StorageValues>(key: K): boolean => {
  try {
    const value = Taro.getStorageSync(key)
    return value !== undefined && value !== ''
  } catch (error) {
    return false
  }
}

/**
 * 获取所有存储信息(异步)
 *
 * @returns 存储信息对象
 *
 * @example
 * ```typescript
 * const info = await getStorageInfo()
 * console.log('已使用空间:', info.currentSize)
 * console.log('总空间:', info.limitSize)
 * console.log('所有键:', info.keys)
 * ```
 */
export const getStorageInfo = async (): Promise<Taro.getStorageInfo.Promised> => {
  return Taro.getStorageInfo()
}

// ========== 异步方法(支持 Promise) ==========

/**
 * 设置存储值(异步)
 *
 * @param key 存储键
 * @param value 存储值
 * @returns Promise<是否成功>
 */
export const setStorage = async <K extends keyof StorageValues>(
  key: K,
  value: StorageValues[K]
): Promise<boolean> => {
  try {
    await Taro.setStorage({ key, data: value })
    return true
  } catch (error) {
    console.error(`Failed to set storage for key "${key}":`, error)
    return false
  }
}

/**
 * 获取存储值(异步)
 *
 * @param key 存储键
 * @param defaultValue 默认值
 * @returns Promise<存储值或默认值>
 */
export const getStorage = async <K extends keyof StorageValues>(
  key: K,
  defaultValue: StorageValues[K] | null = null
): Promise<StorageValues[K] | null> => {
  try {
    const result = await Taro.getStorage({ key })
    return result.data ?? defaultValue
  } catch (error) {
    console.error(`Failed to get storage for key "${key}":`, error)
    return defaultValue
  }
}

/**
 * 移除存储值(异步)
 *
 * @param key 存储键
 * @returns Promise<是否成功>
 */
export const removeStorage = async <K extends keyof StorageValues>(
  key: K
): Promise<boolean> => {
  try {
    await Taro.removeStorage({ key })
    return true
  } catch (error) {
    console.error(`Failed to remove storage for key "${key}":`, error)
    return false
  }
}

/**
 * 清空所有存储(异步)
 *
 * @returns Promise<是否成功>
 */
export const clearStorage = async (): Promise<boolean> => {
  try {
    await Taro.clearStorage()
    return true
  } catch (error) {
    console.error('Failed to clear storage:', error)
    return false
  }
}
