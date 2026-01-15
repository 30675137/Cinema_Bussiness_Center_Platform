/**
 * @spec O007-miniapp-menu-api
 * 商品类型定义
 */

/**
 * 渠道分类枚举
 */
export enum ChannelCategory {
  /** 经典特调 */
  ALCOHOL = 'ALCOHOL',
  /** 特调饮品 */
  COCKTAIL = 'COCKTAIL',
  /** 精品咖啡 */
  COFFEE = 'COFFEE',
  /** 经典饮品 */
  BEVERAGE = 'BEVERAGE',
  /** 主厨小食 */
  SNACK = 'SNACK',
  /** 主厨正餐 */
  MEAL = 'MEAL',
  /** 甜点蛋糕 */
  DESSERT = 'DESSERT',
  /** 其他 */
  OTHER = 'OTHER',
}

/**
 * 分类信息（嵌套对象）
 */
export interface CategoryInfo {
  id: string
  code: string
  displayName: string
}

/**
 * 渠道商品 DTO（后端返回数据）
 */
export interface ChannelProductDTO {
  /** 商品ID */
  id: string
  /** SKU ID */
  skuId?: string
  /** 产品ID（兼容旧字段） */
  productId?: string
  /** 商品名称（后端实际字段） */
  displayName: string
  /** 商品名称（兼容旧字段） */
  productName?: string
  /** 主图（后端实际字段） */
  mainImage: string | null
  /** 主图URL（兼容旧字段） */
  mainImageUrl?: string | null
  /** 详情图 */
  detailImages?: string[]
  /** 描述 */
  description?: string | null
  /** 分类对象（后端实际返回） */
  category: CategoryInfo | ChannelCategory
  /** 分类ID */
  categoryId?: string
  /** 渠道分类 */
  channelCategory?: string
  /** 销售渠道 */
  salesChannel?: string
  /** 状态 */
  status: 'ACTIVE' | 'INACTIVE'
  /** 基础价格（元，后端实际字段） */
  basePrice: number
  /** 价格（分，兼容旧字段） */
  priceInCents?: number
  /** 是否推荐 */
  isRecommended?: boolean
  /** 排序 */
  sortOrder: number
  /** 标签 */
  tags?: string[]
  /** 库存状态 */
  stockStatus: 'IN_STOCK' | 'OUT_OF_STOCK' | 'LOW_STOCK'
}

/**
 * 商品卡片视图模型（前端展示）
 */
export interface ProductCard {
  /** 商品ID */
  id: string
  /** 商品名称 */
  name: string
  /** 图片URL */
  imageUrl: string
  /** 价格文本（已格式化） */
  priceText: string
  /** 标签 */
  tags: string[]
  /** 最小销售单位 */
  minSalesUnit: string
  /** 是否可用 */
  isAvailable: boolean
  /** 分类 */
  category: ChannelCategory
}

/**
 * API 响应泛型
 */
export interface ApiResponse<T> {
  /** 是否成功 */
  success: boolean
  /** 数据 */
  data: T
  /** 时间戳 */
  timestamp: string
  /** 消息 */
  message?: string
}

/**
 * @spec O007-miniapp-menu-api
 * 商品列表查询参数
 */
export interface ProductListParams {
  /**
   * 分类 ID 筛选（UUID 格式，优先级最高）
   */
  categoryId?: string | null
  /** 分类过滤（编码字符串，优先级次之） */
  category?: string | null
  /** 销售渠道 */
  salesChannel?: string
  /** 状态过滤 */
  status?: 'ACTIVE' | 'INACTIVE'
  /** 页码 */
  page?: number
  /** 每页数量 */
  pageSize?: number
  /** 排序字段 */
  sortBy?: 'sortOrder' | 'priceInCents' | 'productName'
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc'
}
