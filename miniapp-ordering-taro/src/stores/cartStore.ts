/**
 * @spec O010-shopping-cart
 * 购物车状态管理 - Zustand Store
 */
import { create } from 'zustand'
import type { CartState, CartProduct, Cart } from '../types/cart'
import { saveCart, loadCart } from '../utils/cartStorage'

/**
 * 购物车状态管理 Store
 */
export const useCartStore = create<CartState>((set, get) => ({
  // ========== State ==========
  cart: loadCart() || { items: [], timestamp: Date.now() },
  isCartOpen: false,

  // ========== Actions ==========
  addToCart: (product, selectedOptions = {}) => {
    set((state) => {
      const existingItem = state.cart.items.find(
        (item) =>
          item.product.id === product.id &&
          JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
      )

      let newItems
      if (existingItem) {
        // 商品已存在，数量+1
        newItems = state.cart.items.map((item) =>
          item.product.id === product.id &&
          JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        // 新商品，添加到购物车
        newItems = [
          ...state.cart.items,
          { product, quantity: 1, selectedOptions }
        ]
      }

      const newCart: Cart = {
        items: newItems,
        timestamp: Date.now()
      }

      saveCart(newCart)
      return { cart: newCart }
    })
  },

  updateQuantity: (productId, delta) => {
    set((state) => {
      const newItems = state.cart.items
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0) // 数量为0时移除

      const newCart: Cart = {
        items: newItems,
        timestamp: Date.now()
      }

      saveCart(newCart)
      return { cart: newCart }
    })
  },

  removeFromCart: (productId) => {
    set((state) => {
      const newItems = state.cart.items.filter(
        (item) => item.product.id !== productId
      )

      const newCart: Cart = {
        items: newItems,
        timestamp: Date.now()
      }

      saveCart(newCart)
      return { cart: newCart }
    })
  },

  clearCart: () => {
    const emptyCart: Cart = { items: [], timestamp: Date.now() }
    saveCart(emptyCart)
    set({ cart: emptyCart })
  },

  toggleCartDrawer: () => {
    set((state) => ({ isCartOpen: !state.isCartOpen }))
  },

  // ========== Selectors ==========
  totalItems: () => {
    const { cart } = get()
    return cart.items.reduce((sum, item) => sum + item.quantity, 0)
  },

  cartTotal: () => {
    const { cart } = get()
    return cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )
  },

  subtotal: () => {
    // 目前小计与总金额相同（无优惠）
    return get().cartTotal()
  }
}))

