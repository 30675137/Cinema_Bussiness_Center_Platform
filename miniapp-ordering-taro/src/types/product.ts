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
  /** 精品咖啡 */
  COFFEE = 'COFFEE',
  /** 经典饮品 */
  BEVERAGE = 'BEVERAGE',
  /** 主厨小食 */
  SNACK = 'SNACK',
  /** 主厨正餐 */
  MEAL = 'MEAL',
  /** 其他 */
  OTHER = 'OTHER',
}

/**
 * 渠道商品 DTO（后端返回数据）
 */
export interface ChannelProductDTO {
  /** 商品ID */
  id: string
  /** 产品ID */
  productId: string
  /** 商品名称 */
  productName: string
  /** 主图URL */
  mainImageUrl: string | null
  /** 分类 */
  category: ChannelCategory
  /** 销售渠道 */
  salesChannel: string
  /** 状态 */
  status: 'ACTIVE' | 'INACTIVE'
  /** 价格（分） */
  priceInCents: number
  /** 排序 */
  sortOrder: number
  /** 标签 */
  tags: string[]
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
 * 商品列表查询参数
 * @spec O002-miniapp-menu-config
 */
export interface ProductListParams {
  /**
   * @spec O002-miniapp-menu-config
   * 分类 ID 筛选（UUID 格式，优先级最高）
   */
  categoryId?: string | null
  /** 分类过滤（编码，优先级次之） */
  category?: ChannelCategory | null
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
