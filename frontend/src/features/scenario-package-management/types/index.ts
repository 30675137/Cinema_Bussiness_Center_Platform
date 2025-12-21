/**
 * 场景包管理 TypeScript 类型定义
 *
 * @author Cinema Platform
 * @since 2025-12-19
 */

/**
 * 场景包状态枚举
 */
export type PackageStatus = 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED';

/**
 * 硬权益类型枚举
 */
export type BenefitType = 'DISCOUNT_TICKET' | 'FREE_SCREENING';

/**
 * 场景包详情（完整信息）
 */
export interface ScenarioPackageDetail {
  /** 场景包唯一标识 */
  id: string;
  /** 基础包 ID（版本分组） */
  basePackageId: string | null;
  /** 版本号 */
  version: number;
  /** 乐观锁版本号 */
  versionLock: number;
  /** 场景包名称 */
  name: string;
  /** 描述信息 */
  description?: string;
  /** 背景图片 URL */
  backgroundImageUrl?: string;
  /** 状态 */
  status: PackageStatus;
  /** 是否为最新版本 */
  isLatest: boolean;
  /** 使用规则 */
  rule?: PackageRule;
  /** 适用影厅类型 */
  hallTypes: HallType[];
  /** 内容组合 */
  content: PackageContent;
  /** 定价信息 */
  pricing?: PackagePricing;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
  /** 创建人 */
  createdBy?: string;
}

/**
 * 场景包摘要（列表展示）
 */
export interface ScenarioPackageSummary {
  /** 场景包唯一标识 */
  id: string;
  /** 场景包名称 */
  name: string;
  /** 描述信息 */
  description?: string;
  /** 背景图片 URL */
  backgroundImageUrl?: string;
  /** 状态 */
  status: PackageStatus;
  /** 版本号 */
  version: number;
  /** 是否为最新版本 */
  isLatest: boolean;
  /** 时长（小时） */
  durationHours?: number;
  /** 人数范围 */
  peopleRange?: string;
  /** 打包价格 */
  packagePrice?: number;
  /** 优惠比例 */
  discountPercentage?: number;
  /** 影厅数量 */
  hallCount: number;
  /** 单品数量 */
  itemCount: number;
  /** 服务数量 */
  serviceCount: number;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/**
 * 场景包规则
 */
export interface PackageRule {
  /** 时长（小时，支持小数） */
  durationHours: number;
  /** 最小人数 */
  minPeople?: number;
  /** 最大人数 */
  maxPeople?: number;
}

/**
 * 影厅类型
 */
export interface HallType {
  /** 影厅类型 ID */
  id: string;
  /** 影厅类型名称 */
  name: string;
}

/**
 * 场景包内容组合
 */
export interface PackageContent {
  /** 硬权益列表 */
  benefits: PackageBenefit[];
  /** 软权益（单品）列表 */
  items: PackageItem[];
  /** 服务项目列表 */
  services: PackageService[];
}

/**
 * 场景包硬权益
 */
export interface PackageBenefit {
  /** 硬权益 ID */
  id: string;
  /** 权益类型 */
  benefitType: BenefitType;
  /** 折扣率（如 0.75 表示 75 折） */
  discountRate?: number;
  /** 免费场次数量 */
  freeCount?: number;
  /** 权益描述 */
  description?: string;
  /** 排序序号 */
  sortOrder: number;
}

/**
 * 场景包软权益（单品）
 */
export interface PackageItem {
  /** 单品项 ID */
  id: string;
  /** 单品主数据 ID */
  itemId: string;
  /** 数量 */
  quantity: number;
  /** 单品名称快照 */
  itemNameSnapshot: string;
  /** 单品价格快照 */
  itemPriceSnapshot: number;
  /** 排序序号 */
  sortOrder: number;
}

/**
 * 场景包服务项目
 */
export interface PackageService {
  /** 服务项 ID */
  id: string;
  /** 服务主数据 ID */
  serviceId: string;
  /** 服务名称快照 */
  serviceNameSnapshot: string;
  /** 服务价格快照 */
  servicePriceSnapshot: number;
  /** 排序序号 */
  sortOrder: number;
}

/**
 * 场景包定价
 */
export interface PackagePricing {
  /** 打包一口价 */
  packagePrice: number;
  /** 参考总价快照 */
  referencePriceSnapshot?: number;
  /** 优惠比例（%） */
  discountPercentage?: number;
  /** 优惠金额 */
  discountAmount?: number;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

// ========== 请求 DTO ==========

/**
 * 创建场景包请求
 */
export interface CreatePackageRequest {
  /** 场景包名称 */
  name: string;
  /** 描述信息 */
  description?: string;
  /** 背景图片 URL */
  backgroundImageUrl?: string;
  /** 使用规则 */
  rule: {
    durationHours: number;
    minPeople?: number;
    maxPeople?: number;
  };
  /** 适用影厅类型 ID 列表 */
  hallTypeIds: string[];
  /** 内容组合 */
  content?: {
    benefits?: Array<{
      benefitType: BenefitType;
      discountRate?: number;
      freeCount?: number;
      description?: string;
    }>;
    items?: Array<{
      itemId: string;
      quantity: number;
    }>;
    services?: Array<{
      serviceId: string;
    }>;
  };
  /** 定价信息 */
  pricing?: {
    packagePrice: number;
  };
}

/**
 * 更新场景包请求
 */
export interface UpdatePackageRequest extends Partial<CreatePackageRequest> {
  /** 乐观锁版本号（必需） */
  versionLock: number;
}

/**
 * 列表查询参数
 */
export interface ListPackagesParams {
  /** 页码（从 0 开始） */
  page?: number;
  /** 每页大小 */
  size?: number;
  /** 状态筛选 */
  status?: PackageStatus;
  /** 影厅类型 ID 筛选 */
  hallTypeId?: string;
  /** 搜索关键词（名称） */
  keyword?: string;
  /** 排序字段 */
  sortBy?: 'createdAt' | 'updatedAt' | 'name';
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc';
}

// ========== 响应 DTO ==========

/**
 * 参考总价响应
 */
export interface ReferencePriceResponse {
  /** 参考总价 */
  referencePrice: number;
  /** 单品总价 */
  itemsTotal: number;
  /** 服务总价 */
  servicesTotal: number;
  /** 当前打包价格 */
  packagePrice?: number;
  /** 优惠比例 */
  discountPercentage?: number;
  /** 优惠金额 */
  discountAmount?: number;
}

/**
 * 图片上传 URL 响应
 */
export interface UploadUrlResponse {
  /** 预签名上传 URL（临时，用于 PUT 上传） */
  uploadUrl: string;
  /** 公开访问 URL（永久） */
  publicUrl: string;
  /** URL 有效期（秒） */
  expiresIn: number;
}

/**
 * API 统一响应格式
 */
export interface ApiResponse<T> {
  data: T;
  timestamp: string;
}

/**
 * 列表响应格式
 */
export interface ListResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  message?: string;
  timestamp: string;
}

/**
 * 错误响应格式
 */
export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  details?: any;
  timestamp: string;
}

// ============================================================
// 门店关联相关类型
// Feature: 019-store-association
// ============================================================

/**
 * 门店摘要信息（用于关联选择展示）
 */
export interface StoreSummary {
  /** 门店唯一标识 */
  id: string;
  /** 门店编码 */
  code: string | null;
  /** 门店名称 */
  name: string;
  /** 所属区域（可选） */
  region: string | null;
  /** 门店状态 */
  status: 'active' | 'disabled';
}

/**
 * 场景包门店关联记录
 */
export interface ScenarioPackageStoreAssociation {
  /** 关联记录ID */
  id: string;
  /** 场景包ID */
  packageId: string;
  /** 门店ID */
  storeId: string;
  /** 门店信息（查询时关联） */
  store?: StoreSummary;
  /** 创建时间 */
  createdAt: string;
  /** 创建人 */
  createdBy?: string;
}

/**
 * 场景包详情（扩展门店关联）
 * 扩展现有 ScenarioPackageDetail 类型
 */
export interface ScenarioPackageDetailWithStores extends ScenarioPackageDetail {
  /** 关联的门店列表 */
  stores: StoreSummary[];
  /** 关联的门店ID列表（用于表单提交） */
  storeIds: string[];
}

/**
 * 门店选择器组件 Props
 */
export interface StoreSelectorProps {
  /** 已选中的门店ID列表 */
  value: string[];
  /** 选中状态变化回调 */
  onChange: (storeIds: string[]) => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否必填（至少选择一个） */
  required?: boolean;
}

// ============================================================
// Zod Schemas for Store Association (Runtime Validation)
// Feature: 019-store-association
// ============================================================

import { z } from 'zod';

/**
 * 门店摘要 Schema
 */
export const StoreSummarySchema = z.object({
  id: z.string().uuid(),
  code: z.string().nullable(),
  name: z.string().min(1),
  region: z.string().nullable(),
  status: z.enum(['active', 'disabled']),
});

/**
 * 场景包门店关联请求 Schema
 */
export const StoreAssociationRequestSchema = z.object({
  storeIds: z.array(z.string().uuid()).min(1, '请至少选择一个门店'),
});

/**
 * 场景包创建/更新请求（扩展门店关联）
 */
export interface CreatePackageRequestWithStores extends CreatePackageRequest {
  /** 关联的门店ID列表 */
  storeIds: string[];
}

export interface UpdatePackageRequestWithStores extends UpdatePackageRequest {
  /** 关联的门店ID列表 */
  storeIds: string[];
}
