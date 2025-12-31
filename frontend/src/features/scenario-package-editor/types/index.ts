/**
 * 场景包编辑器 TypeScript 类型定义
 * Feature: 001-scenario-package-tabs
 * @see /specs/001-scenario-package-tabs/data-model.md
 */

// ========== 枚举类型 ==========

/**
 * 发布状态
 */
export enum PublishStatus {
  DRAFT = 'DRAFT', // 草稿
  PUBLISHED = 'PUBLISHED', // 已发布
  ARCHIVED = 'ARCHIVED', // 已下架
}

/**
 * 星期几 (0=周日, 1=周一...6=周六)
 */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * 覆盖类型
 */
export enum OverrideType {
  ADD = 'ADD', // 新增时段
  MODIFY = 'MODIFY', // 修改时段
  CANCEL = 'CANCEL', // 取消时段
}

/**
 * 加购项分类
 */
export enum AddOnCategory {
  CATERING = 'CATERING', // 餐饮
  BEVERAGE = 'BEVERAGE', // 饮品
  SERVICE = 'SERVICE', // 服务
  DECORATION = 'DECORATION', // 布置
}

// ========== 核心实体 ==========

/**
 * 价格调整规则
 */
export interface PriceAdjustment {
  type: 'PERCENTAGE' | 'FIXED'; // 百分比调整或固定金额调整
  value: number; // 调整值
}

/**
 * 场景包(Scenario Package)
 */
export interface ScenarioPackage {
  id: string;
  name: string; // 必填,最大100字符
  description?: string | null; // 可选,最大500字符
  category: string; // 必填,从预定义分类列表选择
  mainImage: string; // 必填,Supabase Storage URL
  status: PublishStatus; // 发布状态
  effectiveStartDate?: string | null; // 生效开始日期,YYYY-MM-DD格式
  effectiveEndDate?: string | null; // 生效结束日期,YYYY-MM-DD格式
  advanceBookingDays?: number | null; // 提前预订天数
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
  createdBy: string; // 创建人ID
  updatedBy: string; // 最后修改人ID
}

/**
 * 套餐(Package Tier)
 */
export interface PackageTier {
  id: string;
  scenarioPackageId: string;
  name: string; // 必填,如"豪华套餐"、"标准套餐"
  price: number; // 必填,单位:元
  originalPrice?: number | null; // 可选,原价,必须 >= price
  tags?: string[] | null; // 可选,标签数组
  serviceDescription?: string | null; // 可选,服务内容描述
  sortOrder: number; // 排序顺序
  createdAt: string;
  updatedAt: string;
}

/**
 * 加购项(Add-on Item)
 */
export interface AddOnItem {
  id: string;
  name: string; // 必填
  price: number; // 必填,单位:分
  category: AddOnCategory; // 分类
  imageUrl?: string | null; // 可选,图片URL
  inventory?: number | null; // 可选,库存数量,null表示无限制
  isActive: boolean; // 是否上架
  createdAt: string;
  updatedAt: string;
}

/**
 * 场景包-加购项关联
 */
export interface ScenarioPackageAddOn {
  id: string;
  scenarioPackageId: string;
  addOnItemId: string;
  sortOrder: number; // 排序顺序
  isRequired: boolean; // 是否必选
  createdAt: string;
}

/**
 * 时段模板(Time Slot Template)
 */
export interface TimeSlotTemplate {
  id: string;
  scenarioPackageId: string;
  dayOfWeek: DayOfWeek; // 星期几
  startTime: string; // HH:mm格式
  endTime: string; // HH:mm格式
  capacity?: number | null; // 可选,容量限制
  priceAdjustment?: PriceAdjustment | null; // 可选,价格调整规则
  isEnabled: boolean; // 是否启用
  createdAt: string;
  updatedAt: string;
}

/**
 * 时段日期覆盖(Time Slot Override)
 */
export interface TimeSlotOverride {
  id: string;
  scenarioPackageId: string;
  date: string; // YYYY-MM-DD格式
  overrideType: OverrideType;
  startTime?: string | null; // overrideType=ADD/MODIFY时必填
  endTime?: string | null; // overrideType=ADD/MODIFY时必填
  capacity?: number | null; // overrideType=MODIFY时可选
  reason?: string | null; // 可选,覆盖原因说明
  createdAt: string;
  updatedAt: string;
}

/**
 * 时段库存(Time Slot Inventory)
 */
export interface TimeSlotInventory {
  id: string;
  scenarioPackageId: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:mm-HH:mm格式
  totalCapacity: number; // 总容量
  bookedCount: number; // 已预订数量
  availableCount: number; // 剩余可预订数量
  updatedAt: string;
}

// ========== 请求 DTO ==========

/**
 * 基础信息更新请求
 */
export interface UpdateBasicInfoRequest {
  name: string;
  description?: string | null;
  category: string;
  mainImage: string;
}

/**
 * 创建套餐请求
 */
export interface CreatePackageTierRequest {
  name: string;
  price: number;
  originalPrice?: number | null;
  tags?: string[] | null;
  serviceDescription?: string | null;
  sortOrder?: number;
}

/**
 * 更新套餐请求
 */
export interface UpdatePackageTierRequest extends CreatePackageTierRequest {
  id: string;
}

/**
 * 更新加购项关联请求
 */
export interface UpdateAddOnsRequest {
  addons: Array<{
    addOnItemId: string;
    sortOrder: number;
    isRequired: boolean;
  }>;
}

/**
 * 创建时段模板请求
 */
export interface CreateTimeSlotTemplateRequest {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  capacity?: number | null;
  priceAdjustment?: PriceAdjustment | null;
  isEnabled?: boolean;
}

/**
 * 创建时段覆盖请求
 */
export interface CreateTimeSlotOverrideRequest {
  date: string;
  overrideType: OverrideType;
  startTime?: string | null;
  endTime?: string | null;
  capacity?: number | null;
  reason?: string | null;
}

/**
 * 发布设置请求
 */
export interface UpdatePublishSettingsRequest {
  effectiveStartDate?: string | null;
  effectiveEndDate?: string | null;
  advanceBookingDays?: number | null;
}

// ========== 响应 DTO ==========

/**
 * API 统一响应格式
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
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
  details?: {
    missingItems?: string[];
    [key: string]: unknown;
  };
  timestamp: string;
}

/**
 * 发布验证结果
 */
export interface PublishValidationResult {
  canPublish: boolean;
  checks: Array<{
    item: string;
    passed: boolean;
    message: string;
  }>;
}

/**
 * 场景包完整数据（编辑器用）
 */
export interface ScenarioPackageFullData {
  package: ScenarioPackage;
  packages: PackageTier[];
  addons: ScenarioPackageAddOn[];
  timeSlotTemplates: TimeSlotTemplate[];
  timeSlotOverrides: TimeSlotOverride[];
}

// ========== 分类数据 ==========

/**
 * 预定义分类列表
 */
export const SCENARIO_CATEGORIES = [
  { value: 'TEAM', label: '商务团建' },
  { value: 'MOVIE', label: '私人订制' },
  { value: 'PARTY', label: '派对策划' },
] as const;

export type ScenarioCategory = (typeof SCENARIO_CATEGORIES)[number]['value'];

// ========== 星期几工具 ==========

export const DAY_OF_WEEK_LABELS: Record<DayOfWeek, string> = {
  0: '周日',
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六',
};
