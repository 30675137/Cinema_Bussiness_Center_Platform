/**
 * 单位类别映射工具
 * P002-unit-conversion
 */

import type { UnitCategory, DbUnitCategory } from '../types';

/**
 * 数据库值到前端显示的映射
 */
export const DB_TO_DISPLAY: Record<DbUnitCategory, UnitCategory> = {
  volume: 'VOLUME',
  weight: 'WEIGHT',
  quantity: 'COUNT',
};

/**
 * 前端显示到数据库值的映射
 */
export const DISPLAY_TO_DB: Record<UnitCategory, DbUnitCategory> = {
  VOLUME: 'volume',
  WEIGHT: 'weight',
  COUNT: 'quantity',
};

/**
 * 类别中文显示名
 */
export const CATEGORY_LABELS: Record<UnitCategory, string> = {
  VOLUME: '体积',
  WEIGHT: '重量',
  COUNT: '计数',
};

/**
 * 数据库类别中文显示名
 */
export const DB_CATEGORY_LABELS: Record<DbUnitCategory, string> = {
  volume: '体积',
  weight: '重量',
  quantity: '计数',
};

/**
 * 默认舍入精度
 */
export const DEFAULT_PRECISION: Record<UnitCategory, number> = {
  VOLUME: 1,
  WEIGHT: 0,
  COUNT: 0,
};

/**
 * 类别选项列表 (用于表单下拉)
 */
export const CATEGORY_OPTIONS: Array<{ value: DbUnitCategory; label: string }> = [
  { value: 'volume', label: '体积' },
  { value: 'weight', label: '重量' },
  { value: 'quantity', label: '计数' },
];

/**
 * 将数据库类别转换为前端显示类别
 */
export function toDisplayCategory(dbCategory: DbUnitCategory): UnitCategory {
  return DB_TO_DISPLAY[dbCategory];
}

/**
 * 将前端显示类别转换为数据库类别
 */
export function toDbCategory(displayCategory: UnitCategory): DbUnitCategory {
  return DISPLAY_TO_DB[displayCategory];
}

/**
 * 获取类别的中文标签
 */
export function getCategoryLabel(category: DbUnitCategory | UnitCategory): string {
  if (category in DB_CATEGORY_LABELS) {
    return DB_CATEGORY_LABELS[category as DbUnitCategory];
  }
  return CATEGORY_LABELS[category as UnitCategory];
}

/**
 * 获取类别的默认精度
 */
export function getDefaultPrecision(category: DbUnitCategory | UnitCategory): number {
  const displayCategory =
    category in DB_TO_DISPLAY
      ? DB_TO_DISPLAY[category as DbUnitCategory]
      : (category as UnitCategory);
  return DEFAULT_PRECISION[displayCategory];
}
