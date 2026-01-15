/**
 * 单位换算系统类型定义
 * P002-unit-conversion
 */

/**
 * 单位类别枚举 (前端显示值)
 */
export type UnitCategory = 'VOLUME' | 'WEIGHT' | 'COUNT';

/**
 * 数据库存储的类别值（小写）
 */
export type DbUnitCategory = 'volume' | 'weight' | 'quantity';

/**
 * 单位换算规则
 */
export interface UnitConversion {
  id: string;
  fromUnit: string;
  toUnit: string;
  conversionRate: number;
  category: DbUnitCategory;
  categoryDisplay: UnitCategory;
}

/**
 * 创建/更新换算规则请求
 */
export interface CreateConversionRequest {
  fromUnit: string;
  toUnit: string;
  conversionRate: number;
  category: DbUnitCategory;
  description?: string;
}

/**
 * 换算路径计算请求
 */
export interface CalculatePathRequest {
  fromUnit: string;
  toUnit: string;
}

/**
 * 循环验证请求
 */
export interface ValidateCycleRequest {
  fromUnit: string;
  toUnit: string;
  excludeId?: string;
}

/**
 * 换算路径计算响应
 */
export interface ConversionPath {
  fromUnit: string;
  toUnit: string;
  path: string[];
  totalRate: number;
  steps: number;
  found: boolean;
}

/**
 * 循环验证响应
 */
export interface CycleValidationResult {
  valid: boolean;
  cyclePath?: string[];
  message: string;
}

/**
 * 统计信息
 */
export interface ConversionStats {
  volumeCount: number;
  weightCount: number;
  countCount: number;
  totalCount: number;
}

/**
 * API 响应包装类型
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

/**
 * 列表响应类型
 */
export interface ListResponse<T> extends ApiResponse<T[]> {
  total: number;
}

/**
 * 错误响应类型
 */
export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  details?: Record<string, string>;
  cyclePath?: string[];
  references?: Array<{ bomId: string; productName: string }>;
  timestamp: string;
}
