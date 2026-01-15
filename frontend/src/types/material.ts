/**
 * @spec M001-material-unit-system
 * @spec N004-procurement-material-selector
 * @spec M002-material-filter
 */
import type { Unit } from './unit'
import { z } from 'zod'

export enum MaterialCategory {
  RAW_MATERIAL = 'RAW_MATERIAL',
  PACKAGING = 'PACKAGING',
}

/**
 * N004: Material status
 */
export type MaterialStatus = 'ACTIVE' | 'INACTIVE'

export interface Material {
  id: string
  code: string
  name: string
  category: MaterialCategory
  inventoryUnit: Unit
  purchaseUnit: Unit
  conversionRate?: number
  useGlobalConversion: boolean
  /** 标准成本（元/库存单位），用于 BOM 成本计算 */
  standardCost?: number
  specification?: string
  description?: string
  status: MaterialStatus
  createdAt: string
  updatedAt: string
}

/**
 * N004: Material DTO for procurement order item
 */
export interface MaterialDTO {
  id: string
  code: string
  name: string
  specification?: string
  purchaseUnitName?: string
  inventoryUnitName?: string
}

export interface MaterialCreateRequest {
  code?: string
  name: string
  category: MaterialCategory
  inventoryUnitId: string
  purchaseUnitId: string
  conversionRate?: number
  useGlobalConversion?: boolean
  /** 标准成本（元/库存单位） */
  standardCost?: number
  description?: string
  specification?: string
}

export interface MaterialUpdateRequest {
  name?: string
  inventoryUnitId?: string
  purchaseUnitId?: string
  conversionRate?: number
  useGlobalConversion?: boolean
  /** 标准成本（元/库存单位） */
  standardCost?: number
  description?: string
  specification?: string
}

// ============================================================
// M002-material-filter: Filter, Export, Import, Batch Types
// ============================================================

/**
 * Material filter - 筛选条件
 * User Story: US1 - 快速筛选物料
 */
export interface MaterialFilter {
  category?: MaterialCategory
  status?: 'ACTIVE' | 'INACTIVE'
  minCost?: number
  maxCost?: number
  keyword?: string
}

/**
 * Material export data - 导出数据
 * User Story: US2 - 批量导出物料数据
 */
export interface MaterialExportData {
  code: string
  name: string
  category: string // '原料' | '包材'
  status: string // '在用' | '停用'
  inventoryUnitName: string
  purchaseUnitName: string
  conversionRate?: number
  standardCost?: number
  specification?: string
  description?: string
  createdAt: string // 'YYYY-MM-DD HH:mm:ss'
}

/**
 * Material import data - 导入数据
 * User Story: US3 - 批量导入物料数据
 */
export interface MaterialImportData {
  code?: string // 可选，留空自动生成
  name: string // 必填
  category: MaterialCategory // 必填
  inventoryUnitId: string // 必填
  purchaseUnitId: string // 必填
  conversionRate?: number // 可选
  useGlobalConversion?: boolean // 可选，默认 false
  standardCost?: number // 可选
  specification?: string // 可选
  description?: string // 可选
}

/**
 * Material import record - 导入记录及校验状态
 * User Story: US3 - 批量导入物料数据
 */
export interface MaterialImportRecord {
  rowIndex: number
  data: MaterialImportData
  valid: boolean
  errors?: string[]
}

/**
 * Material import result - 导入汇总结果
 * User Story: US3 - 批量导入物料数据
 */
export interface MaterialImportResult {
  totalCount: number
  successCount: number
  failureCount: number
  records: MaterialImportRecord[]
}

/**
 * Batch operation type - 批量操作类型
 * User Story: US4 - 批量操作物料
 */
export enum BatchOperationType {
  DELETE = 'DELETE',
  UPDATE_STATUS = 'UPDATE_STATUS',
}

/**
 * Material batch operation request - 批量操作请求
 * User Story: US4 - 批量操作物料
 */
export interface MaterialBatchOperationRequest {
  materialIds: string[]
  operation: BatchOperationType
  targetStatus?: 'ACTIVE' | 'INACTIVE' // UPDATE_STATUS 时必填
}

/**
 * Material batch operation item - 批量操作单项结果
 * User Story: US4 - 批量操作物料
 */
export interface MaterialBatchOperationItem {
  materialId: string
  materialCode: string
  success: boolean
  error?: string
}

/**
 * Material batch operation result - 批量操作结果
 * User Story: US4 - 批量操作物料
 */
export interface MaterialBatchOperationResult {
  successCount: number
  failureCount: number
  items: MaterialBatchOperationItem[]
}

// ============================================================
// M002-material-filter: Zod Validation Schemas
// ============================================================

/**
 * Material filter schema - 筛选条件验证
 * User Story: US1 - 快速筛选物料
 */
export const MaterialFilterSchema = z
  .object({
    category: z.nativeEnum(MaterialCategory).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    minCost: z.number().min(0).optional(),
    maxCost: z.number().min(0).optional(),
    keyword: z.string().max(100).optional(),
  })
  .refine(
    (data) => {
      if (data.minCost !== undefined && data.maxCost !== undefined) {
        return data.minCost <= data.maxCost
      }
      return true
    },
    { message: '最小成本不能大于最大成本' }
  )

/**
 * Material import data schema - 导入数据验证
 * User Story: US3 - 批量导入物料数据
 */
export const MaterialImportDataSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1, '物料名称不能为空').max(100),
  category: z.nativeEnum(MaterialCategory),
  inventoryUnitId: z.string().uuid(),
  purchaseUnitId: z.string().uuid(),
  conversionRate: z.number().positive().optional(),
  useGlobalConversion: z.boolean().optional(),
  standardCost: z.number().nonnegative().optional(),
  specification: z.string().max(500).optional(),
  description: z.string().max(1000).optional(),
})
