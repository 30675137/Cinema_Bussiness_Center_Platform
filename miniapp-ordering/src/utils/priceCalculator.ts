/**
 * @spec O006-miniapp-channel-order
 * 价格计算工具函数
 */

import type { SelectedSpec, SpecType } from '@/types/productSpec'
import type { CartItem } from '@/types/cart'

/**
 * 计算商品规格调整后的单价
 *
 * @param basePrice 基础价格(单位:分)
 * @param selectedSpecs 用户选择的规格
 * @returns 单价(基础价 + 规格调整)
 *
 * @example
 * ```typescript
 * const basePrice = 2500 // 25.00元
 * const selectedSpecs = {
 *   [SpecType.SIZE]: { priceAdjustment: 500 }, // +5.00元
 *   [SpecType.TOPPING]: { priceAdjustment: 300 } // +3.00元
 * }
 * const unitPrice = calculateUnitPrice(basePrice, selectedSpecs)
 * // unitPrice = 3300 (33.00元)
 * ```
 */
export const calculateUnitPrice = (
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
 * 计算购物车项小计
 *
 * @param unitPrice 单价(单位:分)
 * @param quantity 数量
 * @returns 小计(单价 x 数量)
 */
export const calculateSubtotal = (
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
export const calculateCartTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.subtotal, 0)
}

/**
 * 计算购物车总数量
 *
 * @param items 购物车项列表
 * @returns 总数量(所有商品数量之和)
 */
export const calculateCartQuantity = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

/**
 * 价格分转元(保留 2 位小数)
 *
 * @param priceInCents 价格(单位:分)
 * @returns 价格(单位:元,字符串形式)
 *
 * @example
 * ```typescript
 * centToYuan(2500) // "25.00"
 * centToYuan(99) // "0.99"
 * centToYuan(10) // "0.10"
 * ```
 */
export const centToYuan = (priceInCents: number): string => {
  return (priceInCents / 100).toFixed(2)
}

/**
 * 价格元转分
 *
 * @param priceInYuan 价格(单位:元)
 * @returns 价格(单位:分,整数)
 *
 * @example
 * ```typescript
 * yuanToCent(25.5) // 2550
 * yuanToCent(0.99) // 99
 * yuanToCent(10) // 1000
 * ```
 */
export const yuanToCent = (priceInYuan: number): number => {
  return Math.round(priceInYuan * 100)
}

/**
 * 格式化价格显示(带货币符号)
 *
 * @param priceInCents 价格(单位:分)
 * @param showSymbol 是否显示货币符号(默认 true)
 * @returns 格式化后的价格字符串
 *
 * @example
 * ```typescript
 * formatPrice(2500) // "¥25.00"
 * formatPrice(2500, false) // "25.00"
 * formatPrice(99) // "¥0.99"
 * ```
 */
export const formatPrice = (
  priceInCents: number,
  showSymbol = true
): string => {
  const yuan = centToYuan(priceInCents)
  return showSymbol ? `¥${yuan}` : yuan
}

/**
 * 格式化价格范围(如"¥25.00 - ¥35.00")
 *
 * @param minPriceInCents 最低价格(单位:分)
 * @param maxPriceInCents 最高价格(单位:分)
 * @returns 格式化后的价格范围字符串
 *
 * @example
 * ```typescript
 * formatPriceRange(2500, 3500) // "¥25.00 - ¥35.00"
 * formatPriceRange(2500, 2500) // "¥25.00" (相同价格不显示范围)
 * ```
 */
export const formatPriceRange = (
  minPriceInCents: number,
  maxPriceInCents: number
): string => {
  if (minPriceInCents === maxPriceInCents) {
    return formatPrice(minPriceInCents)
  }

  return `${formatPrice(minPriceInCents)} - ${formatPrice(maxPriceInCents)}`
}

/**
 * 计算折扣价格
 *
 * @param originalPrice 原价(单位:分)
 * @param discountPercent 折扣百分比(如 20 表示 8折,80 表示 2折)
 * @returns 折后价(单位:分,向下取整)
 *
 * @example
 * ```typescript
 * calculateDiscountPrice(10000, 20) // 8000 (8折)
 * calculateDiscountPrice(10000, 50) // 5000 (5折)
 * ```
 */
export const calculateDiscountPrice = (
  originalPrice: number,
  discountPercent: number
): number => {
  return Math.floor(originalPrice * (1 - discountPercent / 100))
}

/**
 * 检查价格是否有效(非负数)
 *
 * @param priceInCents 价格(单位:分)
 * @returns 是否有效
 */
export const isPriceValid = (priceInCents: number): boolean => {
  return Number.isFinite(priceInCents) && priceInCents >= 0
}
