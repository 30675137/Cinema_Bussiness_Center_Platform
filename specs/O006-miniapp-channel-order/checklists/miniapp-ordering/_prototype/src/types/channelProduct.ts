/**
 * @spec O006-miniapp-channel-order
 * 渠道商品类型定义 - 支持小程序点餐功能
 */

/**
 * 渠道分类枚举(扩展自 O003 的饮品分类)
 */
export enum ChannelCategory {
  ALCOHOL = 'ALCOHOL',    // 酒水
  COFFEE = 'COFFEE',      // 咖啡
  BEVERAGE = 'BEVERAGE',  // 饮料
  SNACK = 'SNACK',        // 小食
  MEAL = 'MEAL',          // 餐品
  OTHER = 'OTHER'         // 其他
}

/**
 * 商品状态枚举
 */
export enum ProductStatus {
  ACTIVE = 'ACTIVE',      // 已上架
  INACTIVE = 'INACTIVE'   // 已下架
}

/**
 * 库存状态枚举
 */
export enum StockStatus {
  IN_STOCK = 'IN_STOCK',        // 有货
  LOW_STOCK = 'LOW_STOCK',      // 库存不足
  OUT_OF_STOCK = 'OUT_OF_STOCK' // 无货
}

/**
 * 渠道商品 DTO - 商品列表/详情
 */
export interface ChannelProductDTO {
  id: string                      // 渠道商品配置 ID
  skuId: string                   // 关联的 SKU ID (finished_product)
  channelType: 'MINI_PROGRAM'     // 渠道类型(小程序固定值)
  channelCategory: ChannelCategory // 商品分类
  displayName: string             // 显示名称
  basePrice: number               // 基础价格(单位:分)
  mainImage: string               // 主图 URL
  detailImages: string[]          // 详情图 URL 列表
  description?: string            // 商品描述(详情页使用)
  status: ProductStatus           // 商品状态
  isRecommended: boolean          // 是否推荐
  sortOrder: number               // 排序权重
  stockStatus?: StockStatus       // 库存状态(详情页使用)
}

/**
 * 规格类型枚举(扩展自 O003 的 4 种到 7 种)
 */
export enum SpecType {
  SIZE = 'SIZE',              // 杯型/尺寸
  TEMPERATURE = 'TEMPERATURE', // 温度
  SWEETNESS = 'SWEETNESS',     // 甜度
  TOPPING = 'TOPPING',        // 配料
  SPICINESS = 'SPICINESS',    // 辣度 (新增)
  SIDE = 'SIDE',              // 配菜 (新增)
  COOKING = 'COOKING'         // 做法 (新增)
}

/**
 * 规格选项 DTO
 */
export interface SpecOptionDTO {
  id: string                  // 选项 ID
  optionName: string          // 选项名称(如"大杯", "热")
  priceAdjustment: number     // 价格调整(单位:分,可为负数)
  isDefault: boolean          // 是否默认选中
  sortOrder: number           // 排序权重
}

/**
 * 渠道商品规格 DTO
 */
export interface ChannelProductSpecDTO {
  id: string                    // 规格 ID
  channelProductId: string      // 所属渠道商品 ID
  specType: SpecType            // 规格类型
  specName: string              // 规格名称(如"杯型", "温度")
  options: SpecOptionDTO[]      // 规格选项列表
  isRequired: boolean           // 是否必选
  allowMultiple: boolean        // 是否允许多选
  sortOrder: number             // 排序权重
}

/**
 * 用户选择的规格(前端状态)
 */
export interface SelectedSpec {
  specType: SpecType          // 规格类型
  specName: string            // 规格名称
  optionId: string            // 选中的选项 ID
  optionName: string          // 选项名称
  priceAdjustment: number     // 价格调整
}
