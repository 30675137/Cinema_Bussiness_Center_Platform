/**
 * 舍入工具 - 按单位类别应用默认精度
 * P002-unit-conversion
 *
 * FR-010: 支持按单位类型配置默认舍入精度
 * - VOLUME: 1位小数 (如 750.5ml)
 * - WEIGHT: 0位小数 (如 500g)
 * - COUNT: 0位小数 (如 10瓶)
 */

import type { UnitCategory } from '../types';

/**
 * 各单位类别的默认精度配置
 */
export const DEFAULT_PRECISION: Record<UnitCategory, number> = {
  VOLUME: 1,  // 容量: 1位小数
  WEIGHT: 0,  // 重量: 整数
  COUNT: 0,   // 数量: 整数
};

/**
 * 根据单位类别获取默认精度
 *
 * @param category 单位类别
 * @returns 小数位数
 */
export function getPrecision(category: UnitCategory): number {
  return DEFAULT_PRECISION[category] ?? 2;
}

/**
 * 按单位类别舍入数值
 *
 * @param value 原始数值
 * @param category 单位类别
 * @returns 舍入后的数值
 *
 * @example
 * ```typescript
 * roundByCategory(750.456, 'VOLUME') // 750.5
 * roundByCategory(499.8, 'WEIGHT')   // 500
 * roundByCategory(9.7, 'COUNT')      // 10
 * ```
 */
export function roundByCategory(value: number, category: UnitCategory): number {
  const precision = getPrecision(category);
  return roundToPrecision(value, precision);
}

/**
 * 按指定精度舍入数值
 *
 * @param value 原始数值
 * @param precision 小数位数
 * @returns 舍入后的数值
 *
 * @example
 * ```typescript
 * roundToPrecision(123.456, 2) // 123.46
 * roundToPrecision(123.456, 1) // 123.5
 * roundToPrecision(123.456, 0) // 123
 * ```
 */
export function roundToPrecision(value: number, precision: number): number {
  const multiplier = Math.pow(10, precision);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * 格式化数值为字符串（保留指定小数位）
 *
 * @param value 数值
 * @param category 单位类别
 * @returns 格式化后的字符串
 *
 * @example
 * ```typescript
 * formatByCategory(750.5, 'VOLUME') // "750.5"
 * formatByCategory(500, 'WEIGHT')   // "500"
 * formatByCategory(10, 'COUNT')     // "10"
 * ```
 */
export function formatByCategory(value: number, category: UnitCategory): string {
  const precision = getPrecision(category);
  const rounded = roundByCategory(value, category);
  return rounded.toFixed(precision);
}

/**
 * 格式化换算结果（带单位）
 *
 * @param value 数值
 * @param unit 单位名称
 * @param category 单位类别
 * @returns 格式化后的字符串 (如 "750.5 ml")
 */
export function formatConversionResult(
  value: number,
  unit: string,
  category: UnitCategory
): string {
  const formatted = formatByCategory(value, category);
  return `${formatted} ${unit}`;
}

/**
 * 判断数值是否需要舍入（与舍入后不同）
 *
 * @param value 原始数值
 * @param category 单位类别
 * @returns 是否需要舍入
 */
export function needsRounding(value: number, category: UnitCategory): boolean {
  const rounded = roundByCategory(value, category);
  return value !== rounded;
}
