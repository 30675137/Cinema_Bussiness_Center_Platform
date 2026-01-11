/** @spec M001-material-unit-system */

export enum UnitCategory {
  VOLUME = 'VOLUME',
  WEIGHT = 'WEIGHT',
  COUNT = 'COUNT',
}

export interface Unit {
  id: string
  code: string
  name: string
  category: UnitCategory
  decimalPlaces: number
  isBaseUnit: boolean
  description?: string
  createdAt: string
  updatedAt: string
}

export interface UnitCreateRequest {
  code: string
  name: string
  category: UnitCategory
  decimalPlaces?: number
  isBaseUnit?: boolean
  description?: string
}

export interface UnitUpdateRequest {
  name?: string
  decimalPlaces?: number
  isBaseUnit?: boolean
  description?: string
}
