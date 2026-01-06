/**
 * @spec O010-shopping-cart
 * 价格格式化工具函数
 */

/**
 * 格式化价格（分 → 元）
 * @param priceInCents 价格（分）
 * @returns 格式化后的价格字符串（如 "¥1", "¥10.5", "¥9.99"）
 */
export const formatPrice = (priceInCents: number): string => {
  const yuan = priceInCents / 100
  return yuan % 1 === 0 ? `¥${yuan}` : `¥${yuan.toFixed(2)}`
}
