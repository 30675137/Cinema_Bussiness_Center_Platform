/**
 * @spec O006-miniapp-channel-order
 * 价格计算工具函数
 */

import { SelectedSpec, ChannelProductSpecDTO } from '../types/channelProduct'

/**
 * 计算商品单价(基础价 + 规格调整)
 * @param basePrice 基础价格(分)
 * @param selectedSpecs 用户选择的规格列表
 * @returns 最终单价(分)
 */
export function calculateUnitPrice(
  basePrice: number,
  selectedSpecs: SelectedSpec[]
): number {
  const specsAdjustment = selectedSpecs.reduce(
    (sum, spec) => sum + spec.priceAdjustment,
    0
  )
  return basePrice + specsAdjustment
}

/**
 * 验证必选规格是否已全部选择
 * @param specs 商品所有规格列表
 * @param selectedSpecs 用户选择的规格列表
 * @returns { valid: boolean, missingSpecs: string[] }
 */
export function validateRequiredSpecs(
  specs: ChannelProductSpecDTO[],
  selectedSpecs: SelectedSpec[]
): { valid: boolean; missingSpecs: string[] } {
  const requiredSpecs = specs.filter((spec) => spec.isRequired)
  const selectedSpecTypes = new Set(
    selectedSpecs.map((spec) => spec.specType)
  )

  const missingSpecs = requiredSpecs
    .filter((spec) => !selectedSpecTypes.has(spec.specType))
    .map((spec) => spec.specName)

  return {
    valid: missingSpecs.length === 0,
    missingSpecs,
  }
}

/**
 * 格式化价格显示(分 → 元)
 * @param priceInCents 价格(分)
 * @returns 格式化字符串 "¥12.50"
 */
export function formatPrice(priceInCents: number): string {
  const yuan = (priceInCents / 100).toFixed(2)
  return `¥${yuan}`
}

/**
 * 格式化价格调整显示
 * @param adjustment 价格调整(分,可为负)
 * @returns 格式化字符串 "+5.00" 或 "-3.00"
 */
export function formatPriceAdjustment(adjustment: number): string {
  if (adjustment === 0) return ''
  const yuan = (Math.abs(adjustment) / 100).toFixed(2)
  return adjustment > 0 ? `+${yuan}` : `-${yuan}`
}
