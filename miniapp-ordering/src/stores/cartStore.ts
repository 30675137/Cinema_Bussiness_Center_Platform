/**
 * @spec O006-miniapp-channel-order
 * 购物车 Zustand Store
 */

import { create } from 'zustand'
import type { CartItem, CartStore } from '@/types/cart'
import type { ChannelProductDTO } from '@/types/channelProduct'
import type { SelectedSpec, SpecType } from '@/types/productSpec'
import {
  generateCartItemKey,
  calculateCartItemUnitPrice,
  calculateCartItemSubtotal,
  calculateCartTotalPrice,
  calculateCartTotalQuantity,
} from '@/types/cart'

/**
 * 购物车状态管理
 *
 * @description
 * - 使用 Zustand 管理购物车状态(内存中,刷新后清空)
 * - 相同商品 + 相同规格组合 = 合并为一个购物车项并累加数量
 * - 支持添加/更新/删除商品
 *
 * @example
 * ```typescript
 * import { useCartStore } from '@/stores/cartStore'
 *
 * function Component() {
 *   const { items, totalPrice, addItem, removeItem } = useCartStore()
 *
 *   const handleAddToCart = () => {
 *     addItem(product, selectedSpecs)
 *   }
 *
 *   return (
 *     <View>
 *       <Text>购物车商品数: {items.length}</Text>
 *       <Text>总价: ¥{(totalPrice / 100).toFixed(2)}</Text>
 *     </View>
 *   )
 * }
 * ```
 */
export const useCartStore = create<CartStore>((set, get) => ({
  // State
  items: [],
  totalQuantity: 0,
  totalPrice: 0,

  // Actions

  /**
   * 添加商品到购物车
   *
   * @description
   * - 如果相同商品+相同规格已存在,则数量 +1
   * - 否则创建新的购物车项
   */
  addItem: (
    product: ChannelProductDTO,
    selectedSpecs: Record<SpecType, SelectedSpec>
  ) => {
    const currentItems = get().items

    // 生成购物车项唯一标识
    const cartItemKey = generateCartItemKey(product.id, selectedSpecs)

    // 检查是否已存在相同商品+规格组合
    const existingItemIndex = currentItems.findIndex(
      (item) =>
        generateCartItemKey(item.channelProductId, item.selectedSpecs) ===
        cartItemKey
    )

    if (existingItemIndex !== -1) {
      // 已存在,数量 +1
      const updatedItems = [...currentItems]
      const existingItem = updatedItems[existingItemIndex]

      if (existingItem) {
        const newQuantity = existingItem.quantity + 1
        existingItem.quantity = newQuantity
        existingItem.subtotal = calculateCartItemSubtotal(
          existingItem.unitPrice,
          newQuantity
        )

        set({
          items: updatedItems,
          totalQuantity: calculateCartTotalQuantity(updatedItems),
          totalPrice: calculateCartTotalPrice(updatedItems),
        })
      }
    } else {
      // 不存在,创建新购物车项
      const unitPrice = calculateCartItemUnitPrice(
        product.basePrice,
        selectedSpecs
      )
      const quantity = 1
      const subtotal = calculateCartItemSubtotal(unitPrice, quantity)

      const newItem: CartItem = {
        cartItemId: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, // 简单的 ID 生成
        channelProductId: product.id,
        productName: product.displayName,
        productImage: product.mainImage,
        basePrice: product.basePrice,
        selectedSpecs,
        quantity,
        unitPrice,
        subtotal,
      }

      const updatedItems = [...currentItems, newItem]

      set({
        items: updatedItems,
        totalQuantity: calculateCartTotalQuantity(updatedItems),
        totalPrice: calculateCartTotalPrice(updatedItems),
      })
    }
  },

  /**
   * 更新购物车项数量
   *
   * @description
   * - 如果数量为 0,则移除该项
   * - 否则更新数量和小计
   */
  updateQuantity: (cartItemId: string, quantity: number) => {
    const currentItems = get().items

    if (quantity <= 0) {
      // 数量为 0,移除该项
      get().removeItem(cartItemId)
      return
    }

    const updatedItems = currentItems.map((item) => {
      if (item.cartItemId === cartItemId) {
        return {
          ...item,
          quantity,
          subtotal: calculateCartItemSubtotal(item.unitPrice, quantity),
        }
      }
      return item
    })

    set({
      items: updatedItems,
      totalQuantity: calculateCartTotalQuantity(updatedItems),
      totalPrice: calculateCartTotalPrice(updatedItems),
    })
  },

  /**
   * 从购物车移除商品
   */
  removeItem: (cartItemId: string) => {
    const currentItems = get().items
    const updatedItems = currentItems.filter(
      (item) => item.cartItemId !== cartItemId
    )

    set({
      items: updatedItems,
      totalQuantity: calculateCartTotalQuantity(updatedItems),
      totalPrice: calculateCartTotalPrice(updatedItems),
    })
  },

  /**
   * 清空购物车
   */
  clearCart: () => {
    set({
      items: [],
      totalQuantity: 0,
      totalPrice: 0,
    })
  },
}))
