/**
 * @spec P006-fix-sku-edit-data
 * Product type definitions for SKU edit page data loading
 */

// ============================================
// Core Entities
// ============================================

/**
 * SKU (Stock Keeping Unit) - 库存量单位
 * 代表可销售的具体商品规格
 */
export interface SKU {
  /** 主键ID */
  id: string;

  /** SKU编码，唯一标识（如 FIN-COCKTAIL） */
  code: string;

  /** SKU名称 */
  name: string;

  /** 销售价格（单位：分） */
  price: number;

  /** 库存数量 */
  stockQuantity: number;

  /** 状态（active | inactive | deleted） */
  status: SKUStatus;

  /** 关联的SPU ID（可为空） */
  spuId: string | null;

  /** 乐观锁版本号（用于并发冲突检测） */
  version: number;

  /** 创建时间 */
  createdAt: string;

  /** 更新时间 */
  updatedAt: string;

  /** 创建人ID */
  createdBy: string;

  /** 更新人ID */
  updatedBy: string;
}

export type SKUStatus = 'active' | 'inactive' | 'deleted';

/**
 * SPU (Standard Product Unit) - 标准产品单元
 * 代表产品的抽象概念
 */
export interface SPU {
  /** 主键ID */
  id: string;

  /** 产品名称 */
  name: string;

  /** 产品分类ID */
  categoryId: string;

  /** 品牌ID（可选） */
  brandId: string | null;

  /** 产品描述 */
  description: string;

  /** 状态（valid | invalid） */
  status: SPUStatus;

  /** 创建时间 */
  createdAt: string;

  /** 更新时间 */
  updatedAt: string;
}

export type SPUStatus = 'valid' | 'invalid';

/**
 * BOM (Bill of Materials) - 物料清单/配方
 * 定义成品SKU由哪些原料SKU组成
 */
export interface BOM {
  /** 主键ID */
  id: string;

  /** 关联的成品SKU ID */
  skuId: string;

  /** 配方名称（可选） */
  name: string | null;

  /** 损耗率（百分比，如 5 表示 5%） */
  wasteRate: number;

  /** 状态（active | inactive） */
  status: BOMStatus;

  /** BOM组成项列表 */
  components: BOMComponent[];

  /** 创建时间 */
  createdAt: string;

  /** 更新时间 */
  updatedAt: string;
}

export type BOMStatus = 'active' | 'inactive';

/**
 * BOMComponent - BOM配方组成项
 * 代表配方中的一条原料记录
 */
export interface BOMComponent {
  /** 主键ID */
  id: string;

  /** 关联的BOM ID */
  bomId: string;

  /** 原料SKU ID */
  ingredientSkuId: string;

  /** 原料SKU编码（冗余字段，用于显示） */
  ingredientSkuCode: string;

  /** 原料SKU名称（冗余字段，用于显示） */
  ingredientSkuName: string;

  /** 用量 */
  quantity: number;

  /** 单位（ml | g | kg | 个 | 瓶 | 升） */
  unit: string;

  /** 标准成本（单位：分，可选） */
  standardCost: number | null;

  /** 状态（valid | invalid） */
  status: BOMComponentStatus;

  /** 排序顺序 */
  sortOrder: number;

  /** 创建时间 */
  createdAt: string;

  /** 更新时间 */
  updatedAt: string;
}

export type BOMComponentStatus = 'valid' | 'invalid';

// ============================================
// Response DTOs
// ============================================

/**
 * SKU详情聚合响应
 * SKU编辑页面加载时的聚合响应数据
 */
export interface SKUDetailResponse {
  /** SKU基本信息 */
  sku: SKU;

  /** 关联的SPU信息（可为null） */
  spu: SPU | null;

  /** 关联的BOM配方（可为null） */
  bom: BOM | null;

  /** 加载元数据（标识各部分数据加载状态） */
  metadata: LoadMetadata;
}

/**
 * 数据加载元数据
 * 标识SPU和BOM数据的加载状态和有效性
 */
export interface LoadMetadata {
  /** SPU加载是否成功 */
  spuLoadSuccess: boolean;

  /** BOM加载是否成功 */
  bomLoadSuccess: boolean;

  /** SPU状态（valid=有效，invalid=失效，not_linked=未关联） */
  spuStatus: 'valid' | 'invalid' | 'not_linked';

  /** BOM状态（active=有效，inactive=禁用，not_configured=未配置） */
  bomStatus: 'active' | 'inactive' | 'not_configured';
}

// ============================================
// Request DTOs
// ============================================

/**
 * SKU更新请求
 * 包含乐观锁版本号用于并发冲突检测
 */
export interface SKUUpdateRequest {
  /** SKU编码（可选，通常不允许修改） */
  code?: string;

  /** SKU名称 */
  name?: string;

  /** 销售价格（单位：分） */
  price?: number;

  /** 库存数量 */
  stockQuantity?: number;

  /** 状态 */
  status?: SKUStatus;

  /** 关联的SPU ID */
  spuId?: string | null;

  /** 乐观锁版本号（用于并发冲突检测，必填） */
  version: number;
}

// ============================================
// Error Types
// ============================================

/**
 * API错误响应
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

/**
 * SKU模块错误编号
 * 格式: SKU_<类别>_<序号>
 */
export const SKU_ERROR_CODES = {
  // 未找到错误 (NTF - Not Found)
  SKU_NTF_001: 'SKU_NTF_001', // SKU不存在
  SKU_NTF_002: 'SKU_NTF_002', // SPU不存在（已删除）
  SKU_NTF_003: 'SKU_NTF_003', // BOM不存在

  // 业务规则错误 (BIZ - Business Rule)
  SKU_BIZ_001: 'SKU_BIZ_001', // 并发冲突（版本号不匹配）
  SKU_BIZ_002: 'SKU_BIZ_002', // SPU已失效
  SKU_BIZ_003: 'SKU_BIZ_003', // BOM已禁用

  // 验证错误 (VAL - Validation)
  SKU_VAL_001: 'SKU_VAL_001', // SKU编码格式无效
  SKU_VAL_002: 'SKU_VAL_002', // 价格为负数
  SKU_VAL_003: 'SKU_VAL_003', // 库存数量为负数
  SKU_VAL_004: 'SKU_VAL_004', // 状态值无效
  SKU_VAL_005: 'SKU_VAL_005', // 版本号缺失

  // 系统错误 (SYS - System)
  SKU_SYS_001: 'SKU_SYS_001', // 数据库连接失败
  SKU_SYS_002: 'SKU_SYS_002', // Supabase调用超时
} as const;

export type SKUErrorCode = (typeof SKU_ERROR_CODES)[keyof typeof SKU_ERROR_CODES];

/**
 * Type guard: 检查是否为API错误响应
 */
export function isApiErrorResponse(response: unknown): response is ApiErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    response.success === false &&
    'error' in response &&
    'message' in response
  );
}
