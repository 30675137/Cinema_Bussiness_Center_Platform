/**
 * @spec O006-miniapp-channel-order
 * Zustand Store - 购物车状态管理
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '../types/order'
import type { SelectedSpec } from '../types/channelProduct'
import { calculateUnitPrice } from '../utils/priceCalculator'
// 简单的 UUID 生成函数（避免引入额外依赖）
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

interface CartState {
  // 状态
  items: CartItem[]

  // Actions
  addToCart: (item: Omit<CartItem, 'cartItemId' | 'unitPrice' | 'subtotal'>) => void
  removeFromCart: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  updateSpecs: (cartItemId: string, selectedSpecs: SelectedSpec[]) => void
  clearCart: () => void

  // 计算属性辅助方法
  getTotalAmount: () => number
  getTotalItems: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      /**
       * 添加商品到购物车
       */
      addToCart: (item) => {
        const { items } = get()

        // 计算单价和小计
        const unitPrice = calculateUnitPrice(item.basePrice, item.selectedSpecs)
        const subtotal = unitPrice * item.quantity

        const newItem: CartItem = {
          ...item,
          cartItemId: generateUUID(),
          unitPrice,
          subtotal,
        }

        // 检查是否存在相同商品+相同规格的项
        const existingIndex = items.findIndex(
          (i) =>
            i.channelProductId === item.channelProductId &&
            JSON.stringify(i.selectedSpecs) === JSON.stringify(item.selectedSpecs)
        )

        if (existingIndex !== -1) {
          // 合并数量
          const updatedItems = [...items]
          const existingItem = updatedItems[existingIndex]
          const newQuantity = existingItem.quantity + item.quantity

          updatedItems[existingIndex] = {
            ...existingItem,
            quantity: newQuantity,
            subtotal: existingItem.unitPrice * newQuantity,
          }

          set({ items: updatedItems })
        } else {
          // 添加新项
          set({ items: [...items, newItem] })
        }
      },

      /**
       * 从购物车移除商品
       */
      removeFromCart: (cartItemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.cartItemId !== cartItemId),
        }))
      },

      /**
       * 更新商品数量
       */
      updateQuantity: (cartItemId, quantity) => {
        if (quantity < 1) {
          get().removeFromCart(cartItemId)
          return
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.cartItemId === cartItemId
              ? {
                  ...item,
                  quantity,
                  subtotal: item.unitPrice * quantity,
                }
              : item
          ),
        }))
      },

      /**
       * 更新商品规格（重新计算价格）
       */
      updateSpecs: (cartItemId, selectedSpecs) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.cartItemId !== cartItemId) return item

            const unitPrice = calculateUnitPrice(item.basePrice, selectedSpecs)
            const subtotal = unitPrice * item.quantity

            return {
              ...item,
              selectedSpecs,
              unitPrice,
              subtotal,
            }
          }),
        }))
      },

      /**
       * 清空购物车
       */
      clearCart: () => {
        set({ items: [] })
      },

      /**
       * 获取购物车总金额（分）
       */
      getTotalAmount: () => {
        const { items } = get()
        return items.reduce((sum, item) => sum + item.subtotal, 0)
      },

      /**
       * 获取购物车商品总数（件）
       */
      getTotalItems: () => {
        const { items } = get()
        return items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    {
      name: 'channel-product-cart', // 本地存储 key
      // 使用 Taro 存储 API (跨平台兼容)
      storage: {
        getItem: async (name) => {
          try {
            const { default: Taro } = await import('@tarojs/taro')
            const value = Taro.getStorageSync(name)
            return value || null
          } catch {
            return null
          }
        },
        setItem: async (name, value) => {
          try {
            const { default: Taro } = await import('@tarojs/taro')
            Taro.setStorageSync(name, value)
          } catch (error) {
            console.error('Failed to save cart to storage:', error)
          }
        },
        removeItem: async (name) => {
          try {
            const { default: Taro } = await import('@tarojs/taro')
            Taro.removeStorageSync(name)
          } catch (error) {
            console.error('Failed to remove cart from storage:', error)
          }
        },
      },
    }
  )
)
