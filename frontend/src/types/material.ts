/** @spec M001-material-unit-system */
import type { Unit } from './unit'

export enum MaterialCategory {
  RAW_MATERIAL = 'RAW_MATERIAL',
  PACKAGING = 'PACKAGING',
}

export interface Material {
  id: string
  code: string
  name: string
  category: MaterialCategory
  inventoryUnit: Unit
  purchaseUnit: Unit
  conversionRate?: number
  useGlobalConversion: boolean
  description?: string
  specifications?: string
  createdAt: string
  updatedAt: string
}

export interface MaterialCreateRequest {
  code?: string
  name: string
  category: MaterialCategory
  inventoryUnitId: string
  purchaseUnitId: string
  conversionRate?: number
  useGlobalConversion?: boolean
  description?: string
  specifications?: string
}

export interface MaterialUpdateRequest {
  name?: string
  inventoryUnitId?: string
  purchaseUnitId?: string
  conversionRate?: number
  useGlobalConversion?: boolean
  description?: string
  specifications?: string
}
