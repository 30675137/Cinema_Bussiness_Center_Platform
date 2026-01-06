/**
 * @spec O010-shopping-cart
 * 购物车状态管理 Store
 *
 * 使用 Zustand 管理购物车状态，支持添加商品、更新数量、删除商品等操作
 * 集成 Taro 本地存储实现数据持久化
 */

import { create } from 'zustand'
import type { CartItem, CartProduct, CartState } from '../types/cart'
import { loadCart, saveCart } from '../utils/storage'

/**
 * 购物车 Store
 *
 * 功能：
 * - 添加商品到购物车
 * - 更新商品数量（增量）
 * - 移除商品
 * - 清空购物车
 * - 打开/关闭购物车抽屉
 * - 计算总件数、小计、总金额
 * - 查询商品数量
 */
export const useCartStore = create<CartState>((set, get) => ({
  // ========== 状态 ==========

  /** 购物车项列表，从本地存储恢复 */
  cart: loadCart(),

  /** 购物车抽屉是否打开 */
  isCartOpen: false,

  // ========== 动作 ==========

  /**
   * 添加商品到购物车
   * @param product 商品信息
   * @param quantity 数量（默认 1）
   * @param selectedOptions 商品选项（可选）
   */
  addToCart: (product: CartProduct, quantity = 1, selectedOptions?: Record<string, string>) => {
    set((state) => {
      // 查找是否已存在相同商品（ID 和选项都相同）
      const existingItemIndex = state.cart.findIndex(
        (item) =>
          item.product.id === product.id &&
          JSON.stringify(item.selectedOptions || {}) === JSON.stringify(selectedOptions || {})
      )

      let newCart: CartItem[]

      if (existingItemIndex !== -1) {
        // 商品已存在，累加数量
        newCart = state.cart.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        // 新商品，添加到购物车
        newCart = [
          ...state.cart,
          {
            product,
            quantity,
            selectedOptions,
          },
        ]
      }

      // 持久化到本地存储
      saveCart(newCart)

      return { cart: newCart }
    })
  },

  /**
   * 更新商品数量（增量更新）
   * @param productId 商品 ID
   * @param delta 数量变化值（+1 或 -1）
   * @param selectedOptions 商品选项（可选）
   */
  updateQuantity: (productId: string, delta: number, selectedOptions?: Record<string, string>) => {
    set((state) => {
      const newCart = state.cart
        .map((item) => {
          // 匹配商品 ID 和选项
          const isMatch =
            item.product.id === productId &&
            JSON.stringify(item.selectedOptions || {}) === JSON.stringify(selectedOptions || {})

          if (isMatch) {
            return { ...item, quantity: item.quantity + delta }
          }
          return item
        })
        .filter((item) => item.quantity > 0) // 数量为 0 自动移除

      // 持久化到本地存储
      saveCart(newCart)

      return { cart: newCart }
    })
  },

  /**
   * 从购物车移除商品
   * @param productId 商品 ID
   * @param selectedOptions 商品选项（可选）
   */
  removeFromCart: (productId: string, selectedOptions?: Record<string, string>) => {
    set((state) => {
      const newCart = state.cart.filter(
        (item) =>
          !(
            item.product.id === productId &&
            JSON.stringify(item.selectedOptions || {}) === JSON.stringify(selectedOptions || {})
          )
      )

      // 持久化到本地存储
      saveCart(newCart)

      return { cart: newCart }
    })
  },

  /**
   * 清空购物车
   */
  clearCart: () => {
    set({ cart: [] })
    saveCart([])
  },

  /**
   * 切换购物车抽屉显示状态
   */
  toggleCartDrawer: () => {
    set((state) => ({ isCartOpen: !state.isCartOpen }))
  },

  /**
   * 设置购物车抽屉显示状态
   * @param open 是否打开
   */
  setCartOpen: (open: boolean) => {
    set({ isCartOpen: open })
  },

  // ========== 计算值（Selectors） ==========

  /**
   * 获取购物车总件数
   * @returns 所有商品数量之和
   */
  totalItems: () => {
    return get().cart.reduce((sum, item) => sum + item.quantity, 0)
  },

  /**
   * 获取购物车小计（分）
   * @returns 所有商品价格 * 数量之和
   */
  subtotal: () => {
    return get().cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  },

  /**
   * 获取购物车总金额（分）
   * @returns 小计 - 优惠金额
   *
   * 注：当前版本无优惠逻辑，直接返回小计
   */
  cartTotal: () => {
    return get().subtotal()
  },

  /**
   * 获取指定商品的数量
   * @param productId 商品 ID
   * @param selectedOptions 商品选项（可选）
   * @returns 商品数量（不存在返回 0）
   */
  getProductQuantity: (productId: string, selectedOptions?: Record<string, string>) => {
    const item = get().cart.find(
      (item) =>
        item.product.id === productId &&
        JSON.stringify(item.selectedOptions || {}) === JSON.stringify(selectedOptions || {})
    )
    return item ? item.quantity : 0
  },
}))
