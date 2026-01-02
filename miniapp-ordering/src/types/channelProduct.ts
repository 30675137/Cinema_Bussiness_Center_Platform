/**
 * @spec O006-miniapp-channel-order
 * 渠道商品类型定义
 */

/**
 * 渠道分类枚举(扩展自 O003 的饮品分类)
 */
export enum ChannelCategory {
  ALCOHOL = 'ALCOHOL', // 酒水
  COFFEE = 'COFFEE', // 咖啡
  BEVERAGE = 'BEVERAGE', // 饮料
  SNACK = 'SNACK', // 小食
  MEAL = 'MEAL', // 餐品
  OTHER = 'OTHER', // 其他
}

/**
 * 商品状态枚举
 */
export enum ProductStatus {
  ACTIVE = 'ACTIVE', // 已上架
  INACTIVE = 'INACTIVE', // 已下架
}

/**
 * 库存状态枚举
 */
export enum StockStatus {
  IN_STOCK = 'IN_STOCK', // 有货
  LOW_STOCK = 'LOW_STOCK', // 库存不足
  OUT_OF_STOCK = 'OUT_OF_STOCK', // 无货
}

/**
 * 渠道商品 DTO - 商品列表/详情
 *
 * @description 代表小程序菜单中的可售商品
 *
 * @validation
 * - id: 非空字符串,UUID 格式
 * - basePrice: 非负整数,单位为分(100 分 = 1 元)
 * - displayName: 非空字符串,长度 1-100 字符
 * - mainImage: 有效的 URL,HTTPS 协议
 * - channelCategory: 必须是枚举值之一
 *
 * @businessRules
 * - status = INACTIVE 的商品不显示在小程序菜单中
 * - stockStatus = OUT_OF_STOCK 的商品禁用"加入购物车"按钮
 * - isRecommended = true 的商品在列表顶部显示推荐标签
 */
export interface ChannelProductDTO {
  /** 渠道商品配置 ID */
  id: string

  /** 关联的 SKU ID (finished_product) */
  skuId: string

  /** 渠道类型(小程序固定值) */
  channelType: 'MINI_PROGRAM'

  /** 商品分类 */
  channelCategory: ChannelCategory

  /** 显示名称 */
  displayName: string

  /** 基础价格(单位:分) */
  basePrice: number

  /** 主图 URL */
  mainImage: string

  /** 详情图 URL 列表 */
  detailImages: string[]

  /** 商品描述(详情页使用) */
  description?: string

  /** 商品状态 */
  status: ProductStatus

  /** 是否推荐 */
  isRecommended: boolean

  /** 排序权重 */
  sortOrder: number

  /** 库存状态(详情页使用) */
  stockStatus?: StockStatus
}

/**
 * 渠道分类显示名称映射
 */
export const CHANNEL_CATEGORY_LABELS: Record<ChannelCategory, string> = {
  [ChannelCategory.ALCOHOL]: '酒水',
  [ChannelCategory.COFFEE]: '咖啡',
  [ChannelCategory.BEVERAGE]: '饮料',
  [ChannelCategory.SNACK]: '小食',
  [ChannelCategory.MEAL]: '餐品',
  [ChannelCategory.OTHER]: '其他',
}

/**
 * 商品状态显示名称映射
 */
export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  [ProductStatus.ACTIVE]: '已上架',
  [ProductStatus.INACTIVE]: '已下架',
}

/**
 * 库存状态显示名称映射
 */
export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  [StockStatus.IN_STOCK]: '有货',
  [StockStatus.LOW_STOCK]: '库存不足',
  [StockStatus.OUT_OF_STOCK]: '无货',
}

/**
 * 检查商品是否可以购买
 */
export const isProductAvailable = (product: ChannelProductDTO): boolean => {
  return (
    product.status === ProductStatus.ACTIVE &&
    product.stockStatus !== StockStatus.OUT_OF_STOCK
  )
}

/**
 * 获取商品图片 URL(主图优先,否则使用第一张详情图)
 */
export const getProductImageUrl = (product: ChannelProductDTO): string => {
  return product.mainImage || product.detailImages[0] || ''
}
