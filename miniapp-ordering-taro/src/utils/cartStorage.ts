/**
 * @spec O010-shopping-cart
 * 购物车本地存储工具函数
 */
import Taro from '@tarojs/taro'
import type { Cart } from '../types/cart'

const CART_STORAGE_KEY = 'cart'
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000 // 7天（毫秒）

/**
 * 保存购物车到本地存储
 * @param cart 购物车数据
 */
export const saveCart = (cart: Cart): void => {
  try {
    Taro.setStorageSync(CART_STORAGE_KEY, cart)
  } catch (error) {
    console.error('[cartStorage] 保存购物车失败:', error)
    // 存储失败时仅打印警告，不影响功能
    Taro.showToast({
      title: '购物车保存失败',
      icon: 'none',
      duration: 2000
    })
  }
}

/**
 * 从本地存储加载购物车
 * @returns 购物车数据，如果不存在或已过期则返回 null
 */
export const loadCart = (): Cart | null => {
  try {
    const cart = Taro.getStorageSync<Cart>(CART_STORAGE_KEY)

    if (!cart) {
      return null
    }

    // 检查是否超过7天
    const now = Date.now()
    if (now - cart.timestamp > SEVEN_DAYS_MS) {
      console.log('[cartStorage] 购物车已过期（超过7天），自动清空')
      clearCart()
      Taro.showToast({
        title: '购物车已过期，已自动清空',
        icon: 'none',
        duration: 2000
      })
      return null
    }

    return cart
  } catch (error) {
    console.error('[cartStorage] 加载购物车失败:', error)
    return null
  }
}

/**
 * 清空购物车
 */
export const clearCart = (): void => {
  try {
    Taro.removeStorageSync(CART_STORAGE_KEY)
  } catch (error) {
    console.error('[cartStorage] 清空购物车失败:', error)
  }
}
