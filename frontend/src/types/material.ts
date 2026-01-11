/**
 * @spec M001-material-unit-system
 * @spec N004-procurement-material-selector
 */
import type { Unit } from './unit'

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
