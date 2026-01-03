/**
 * @spec O007-miniapp-menu-api
 * 分类映射工具
 */

import { ChannelCategory } from '../types/product'

/**
 * 分类显示名称映射
 */
export const CATEGORY_DISPLAY_NAMES: Record<ChannelCategory, string> = {
  [ChannelCategory.ALCOHOL]: '经典特调',
  [ChannelCategory.COFFEE]: '精品咖啡',
  [ChannelCategory.BEVERAGE]: '清爽饮品',
  [ChannelCategory.SNACK]: '主厨小食',
  [ChannelCategory.MEAL]: '主厨正餐',
  [ChannelCategory.OTHER]: '其他',
}

/**
 * 分类图标映射 (SVG path data)
 * 使用简洁的线性图标风格
 */
export const CATEGORY_ICONS: Record<ChannelCategory, string> = {
  // 鸡尾酒杯图标
  [ChannelCategory.ALCOHOL]: 'cocktail',
  // 咖啡杯图标
  [ChannelCategory.COFFEE]: 'coffee',
  // 饮品杯图标
  [ChannelCategory.BEVERAGE]: 'beverage',
  // 小食图标
  [ChannelCategory.SNACK]: 'snack',
  // 餐食图标
  [ChannelCategory.MEAL]: 'meal',
  // 其他图标
  [ChannelCategory.OTHER]: 'other',
}

/**
 * 获取分类显示名称
 * @param category 分类枚举值
 * @returns 中文显示名称
 */
export function getCategoryDisplayName(category: ChannelCategory): string {
  return CATEGORY_DISPLAY_NAMES[category] || '未知分类'
}

/**
 * 获取分类图标名称
 * @param category 分类枚举值
 * @returns 图标名称
 */
export function getCategoryIcon(category: ChannelCategory): string {
  return CATEGORY_ICONS[category] || 'other'
}
