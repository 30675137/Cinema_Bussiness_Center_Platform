/**
 * @spec O003-beverage-order
 * 饮品相关类型定义
 */

/**
 * 饮品分类
 */
export type BeverageCategory = 'COFFEE' | 'TEA' | 'JUICE' | 'SMOOTHIE' | 'MILK_TEA' | 'OTHER'

/**
 * 饮品状态
 */
export type BeverageStatus = 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'

/**
 * 饮品 DTO
 */
export interface BeverageDTO {
  id: string
  name: string
  description: string
  category: BeverageCategory
  imageUrl: string
  detailImages?: string[]
  basePrice: number
  nutritionInfo?: string
  status: BeverageStatus
  isRecommended: boolean
  sortOrder: number
  createdAt?: string
  updatedAt?: string
}

/**
 * 规格类型
 */
export type SpecType = 'SIZE' | 'TEMPERATURE' | 'SWEETNESS' | 'TOPPING'

/**
 * 饮品规格
 */
export interface BeverageSpecDTO {
  id: string
  skuId: string // SKU ID
  specType: SpecType
  specName: string
  specCode: string
  priceAdjustment: number
  isDefault: boolean
  sortOrder: number
}

/**
 * 饮品详情 DTO
 */
export interface BeverageDetailDTO extends BeverageDTO {
  specs: Record<SpecType, BeverageSpecDTO[]>
}

/**
 * 选中的规格
 */
export interface SelectedSpec {
  name: string
  code: string
  priceAdjustment: number
}

/**
 * 订单项
 */
export interface OrderItemDTO {
  skuId: string // SKU ID
  beverageName: string
  beverageImageUrl: string
  quantity: number
  selectedSpecs: Record<string, SelectedSpec>
  unitPrice: number
  subtotal: number
}

/**
 * 创建订单请求
 */
export interface CreateOrderRequest {
  storeId: string
  items: {
    skuId: string // SKU ID
    quantity: number
    selectedSpecs: Record<string, SelectedSpec>
  }[]
  customerNote?: string
}

/**
 * 订单状态
 */
export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PENDING_PRODUCTION'
  | 'PRODUCING'
  | 'COMPLETED'
  | 'DELIVERED'
  | 'CANCELLED'

/**
 * 订单 DTO
 */
export interface BeverageOrderDTO {
  id: string
  orderNumber: string
  userId: string
  storeId: string
  totalPrice: number
  status: OrderStatus
  queueNumber?: string
  items: OrderItemDTO[]
  customerNote?: string
  createdAt: string
  updatedAt?: string
  paidAt?: string
  productionStartTime?: string
  completedAt?: string
  deliveredAt?: string
}
