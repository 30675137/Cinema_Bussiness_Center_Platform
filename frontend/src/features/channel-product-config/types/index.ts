/**
 * @spec O005-channel-product-config
 * @spec O008-channel-product-category-migration
 * TypeScript type definitions for Channel Product Configuration
 */

import type { MenuCategoryDTO } from '@/features/menu-category/types';

// ============================================================================
// Enums
// ============================================================================

/** 渠道类型 */
export enum ChannelType {
  MINI_PROGRAM = 'MINI_PROGRAM',
  POS = 'POS',
  DELIVERY = 'DELIVERY',
  ECOMMERCE = 'ECOMMERCE',
}

/** 商品状态 */
export enum ChannelProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

/** 规格类型 */
export enum SpecType {
  SIZE = 'SIZE',
  TEMPERATURE = 'TEMPERATURE',
  SWEETNESS = 'SWEETNESS',
  TOPPING = 'TOPPING',
  SPICINESS = 'SPICINESS',
  SIDE = 'SIDE',
  COOKING = 'COOKING',
  CUSTOM = 'CUSTOM',
}

// ============================================================================
// Label Mappings
// ============================================================================

/** 商品状态标签 */
export const CHANNEL_PRODUCT_STATUS_LABELS: Record<ChannelProductStatus, string> = {
  [ChannelProductStatus.ACTIVE]: '已上架',
  [ChannelProductStatus.INACTIVE]: '已下架',
  [ChannelProductStatus.OUT_OF_STOCK]: '缺货',
};

/** 规格类型标签 */
export const SPEC_TYPE_LABELS: Record<SpecType, string> = {
  [SpecType.SIZE]: '大小',
  [SpecType.TEMPERATURE]: '温度',
  [SpecType.SWEETNESS]: '甜度',
  [SpecType.TOPPING]: '加料',
  [SpecType.SPICINESS]: '辣度',
  [SpecType.SIDE]: '配菜',
  [SpecType.COOKING]: '做法',
  [SpecType.CUSTOM]: '自定义',
};

// ============================================================================
// Interfaces
// ============================================================================

/** 规格选项 */
export type SpecOption = {
  id: string;
  name: string;
  priceAdjust: number; // 分
  isDefault: boolean;
  sortOrder: number;
};

/** 规格配置 */
export type ChannelProductSpec = {
  id: string;
  type: SpecType;
  name: string;
  required: boolean;
  multiSelect: boolean;
  options: SpecOption[];
};

/** SKU 基础信息（查询时 JOIN） */
export type SkuBasicInfo = {
  id: string;
  skuCode: string;
  skuName: string;
  price: number;
  imageUrl: string | null;
};

/** 渠道商品配置 */
export type ChannelProductConfig = {
  id: string;
  skuId: string;
  channelType: ChannelType;
  displayName: string | null;
  categoryId: string; // UUID，关联 menu_category.id
  channelPrice: number | null; // 分
  mainImage: string | null;
  detailImages: string[];
  description: string | null;
  specs: ChannelProductSpec[];
  isRecommended: boolean;
  status: ChannelProductStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  // 关联的 SKU 信息（查询时 JOIN）
  sku?: SkuBasicInfo;

  // 关联的分类信息（查询时 JOIN）
  category?: MenuCategoryDTO;
};

// ============================================================================
// Request/Response DTOs
// ============================================================================

/** 创建请求 */
export type CreateChannelProductRequest = {
  skuId: string;
  channelType?: ChannelType;
  displayName?: string;
  categoryId: string; // UUID，关联 menu_category.id
  channelPrice?: number;
  mainImage?: string;
  detailImages?: string[];
  description?: string;
  specs?: ChannelProductSpec[];
  isRecommended?: boolean;
  status?: ChannelProductStatus;
  sortOrder?: number;
};

/** 更新请求 */
export type UpdateChannelProductRequest = {
  displayName?: string;
  categoryId?: string; // UUID，关联 menu_category.id
  channelPrice?: number | null;
  mainImage?: string | null;
  detailImages?: string[];
  description?: string | null;
  specs?: ChannelProductSpec[];
  isRecommended?: boolean;
  status?: ChannelProductStatus;
  sortOrder?: number;
};

/** 查询参数 */
export type ChannelProductQueryParams = {
  channelType?: ChannelType;
  categoryId?: string; // UUID，关联 menu_category.id
  status?: ChannelProductStatus;
  keyword?: string; // 搜索名称或 SKU 编码
  page?: number;
  size?: number;
};

/** 列表响应 */
export type ChannelProductListResponse = {
  items: ChannelProductConfig[];
  total: number;
  page: number;
  size: number;
};

/** 状态更新请求 */
export type UpdateStatusRequest = {
  status: ChannelProductStatus;
};
