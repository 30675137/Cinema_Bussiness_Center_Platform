/**
 * @spec O006-miniapp-channel-order
 * 购物车类型定义
 */

import type { SpecType, SelectedSpec } from './productSpec'
import type { ChannelProductDTO } from './channelProduct'

/**
 * 购物车项(Zustand store)
 *
 * @description 代表购物车中的一个商品项(含规格)
 *
 * @validation
 * - quantity: 必须 ≥ 1
 * - cartItemId: 前端生成的唯一 ID(UUID)
 * - 相同商品不同规格组合作为独立购物车项
 *
 * @businessRules
 * - 加入购物车时快照商品名称/价格/规格,避免后续商品配置变更影响已选商品
 * - 购物车数据存储在 Zustand 内存状态中,刷新页面后清空
 * - 删除商品时数量减为 0,从列表中移除
 *
 * @priceCalculation
 * - 单价计算: unitPrice = basePrice + Σ(selectedSpecs.priceAdjustment)
 * - 小计计算: subtotal = unitPrice * quantity
 * - 总价计算: totalPrice = Σ(items.subtotal)
 */
export interface CartItem {
  /** 购物车项唯一 ID(前端生成) */
  cartItemId: string

  /** 渠道商品 ID */
  channelProductId: string

  /** 商品名称快照 */
  productName: string

  /** 商品图片快照 */
  productImage: string

  /** 基础价格快照 */
  basePrice: number

  /** 选中的规格 */
  selectedSpecs: Record<SpecType, SelectedSpec>

  /** 数量 */
  quantity: number

  /** 单价(基础价 + 规格调整) */
  unitPrice: number

  /** 小计(单价 x 数量) */
  subtotal: number
}

/**
 * 购物车状态(Zustand)
 *
 * @description 管理购物车的完整状态和操作
 */
export interface CartStore {
  /** 购物车项列表 */
  items: CartItem[]

  /** 商品总数量 */
  totalQuantity: number

  /** 总价 */
  totalPrice: number

  // Actions

  /**
   * 添加商品到购物车
   *
   * @param product 商品信息
   * @param selectedSpecs 用户选择的规格
   */
  addItem: (
    product: ChannelProductDTO,
    selectedSpecs: Record<SpecType, SelectedSpec>
  ) => void

  /**
   * 更新购物车项数量
   *
   * @param cartItemId 购物车项 ID
   * @param quantity 新数量(如果为 0 则移除该项)
   */
  updateQuantity: (cartItemId: string, quantity: number) => void

  /**
   * 从购物车移除商品
   *
   * @param cartItemId 购物车项 ID
   */
  removeItem: (cartItemId: string) => void

  /**
   * 清空购物车
   */
  clearCart: () => void
}

/**
 * 生成购物车项的唯一标识
 *
 * @description 相同商品 + 相同规格组合 = 相同购物车项
 * @param channelProductId 商品 ID
 * @param selectedSpecs 选中的规格
 * @returns 唯一标识字符串
 */
export const generateCartItemKey = (
  channelProductId: string,
  selectedSpecs: Record<SpecType, SelectedSpec>
): string => {
  const specKeys = Object.keys(selectedSpecs)
    .sort()
    .map((key) => {
      const spec = selectedSpecs[key as SpecType]
      return `${spec.specType}:${spec.optionId}`
    })
    .join('|')

  return `${channelProductId}__${specKeys}`
}

/**
 * 计算购物车项的单价
 *
 * @param basePrice 基础价格
 * @param selectedSpecs 选中的规格
 * @returns 单价(基础价 + 规格调整)
 */
export const calculateCartItemUnitPrice = (
  basePrice: number,
  selectedSpecs: Record<SpecType, SelectedSpec>
): number => {
  const specAdjustment = Object.values(selectedSpecs).reduce(
    (sum, spec) => sum + spec.priceAdjustment,
    0
  )

  return basePrice + specAdjustment
}

/**
 * 计算购物车项的小计
 *
 * @param unitPrice 单价
 * @param quantity 数量
 * @returns 小计(单价 x 数量)
 */
export const calculateCartItemSubtotal = (
  unitPrice: number,
  quantity: number
): number => {
  return unitPrice * quantity
}

/**
 * 计算购物车总价
 *
 * @param items 购物车项列表
 * @returns 总价(所有小计之和)
 */
export const calculateCartTotalPrice = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.subtotal, 0)
}

/**
 * 计算购物车商品总数量
 *
 * @param items 购物车项列表
 * @returns 总数量(所有商品数量之和)
 */
export const calculateCartTotalQuantity = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

/**
 * 检查购物车是否为空
 *
 * @param items 购物车项列表
 * @returns 是否为空
 */
export const isCartEmpty = (items: CartItem[]): boolean => {
  return items.length === 0
}
