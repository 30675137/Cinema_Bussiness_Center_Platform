/**
 * @spec O003-beverage-order
 * 饮品配置管理类型定义 (User Story 3)
 */

/**
 * 饮品分类枚举
 */
export enum BeverageCategory {
  COFFEE = 'COFFEE',
  TEA = 'TEA',
  JUICE = 'JUICE',
  SMOOTHIE = 'SMOOTHIE',
  MILK_TEA = 'MILK_TEA',
  OTHER = 'OTHER',
}

/**
 * 饮品状态枚举
 */
export enum BeverageStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

/**
 * 规格类型枚举
 */
export enum SpecType {
  SIZE = 'SIZE',
  TEMPERATURE = 'TEMPERATURE',
  SWEETNESS = 'SWEETNESS',
  TOPPING = 'TOPPING',
}

/**
 * 饮品基本信息DTO
 */
export interface BeverageDTO {
  id: string
  name: string
  category: BeverageCategory
  basePrice: number // 单位:分
  description?: string
  mainImage?: string
  detailImages?: string[]
  isRecommended: boolean
  status: BeverageStatus
  specCount: number
  recipeCount: number
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}

/**
 * 饮品详细信息DTO
 */
export interface BeverageDetailDTO extends BeverageDTO {
  specs: BeverageSpecDTO[]
  recipes: BeverageRecipeDTO[]
}

/**
 * 饮品规格DTO
 */
export interface BeverageSpecDTO {
  id: string
  beverageId: string
  specType: SpecType
  name: string
  priceAdjustment: number // 单位:分
  isDefault: boolean
  sortOrder: number
  description?: string
  createdAt: string
  updatedAt: string
}

/**
 * 饮品配方DTO
 */
export interface BeverageRecipeDTO {
  id: string
  beverageId: string
  name: string
  applicableSpecs?: string
  description?: string
  ingredients: RecipeIngredientDTO[]
  createdAt: string
  updatedAt: string
}

/**
 * 配方原料项DTO
 */
export interface RecipeIngredientDTO {
  id: string
  skuId: number
  ingredientName: string
  quantity: number
  unit: string
  note?: string
  stockStatus?: SkuStockStatus
}

/**
 * SKU库存状态
 */
export interface SkuStockStatus {
  inStock: boolean
  availableQuantity: number
  unit: string
  statusText: string
}

/**
 * 创建饮品请求
 */
export interface CreateBeverageRequest {
  name: string
  category: BeverageCategory
  basePrice: number // 单位:分
  description?: string
  mainImage: string
  detailImages?: string[]
  isRecommended?: boolean
  status?: BeverageStatus
}

/**
 * 更新饮品请求
 */
export interface UpdateBeverageRequest {
  name?: string
  category?: BeverageCategory
  basePrice?: number
  description?: string
  mainImage?: string
  detailImages?: string[]
  isRecommended?: boolean
  status?: BeverageStatus
}

/**
 * 创建规格请求
 */
export interface CreateSpecRequest {
  specType: SpecType
  name: string
  priceAdjustment: number
  isDefault?: boolean
  sortOrder?: number
  description?: string
}

/**
 * 更新规格请求
 */
export interface UpdateSpecRequest {
  specType?: SpecType
  name?: string
  priceAdjustment?: number
  isDefault?: boolean
  sortOrder?: number
  description?: string
}

/**
 * 创建配方请求
 */
export interface CreateRecipeRequest {
  name: string
  applicableSpecs?: string
  description?: string
  ingredients: RecipeIngredientRequest[]
}

/**
 * 配方原料请求
 */
export interface RecipeIngredientRequest {
  skuId: number
  ingredientName: string
  quantity: number
  unit: string
  note?: string
}

/**
 * 更新配方请求
 */
export interface UpdateRecipeRequest {
  name?: string
  applicableSpecs?: string
  description?: string
  ingredients?: RecipeIngredientRequest[]
}

/**
 * 分页查询参数
 */
export interface BeverageQueryParams {
  page?: number
  size?: number
  name?: string
  category?: string
  status?: BeverageStatus
}

/**
 * 分页响应
 */
export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
}
