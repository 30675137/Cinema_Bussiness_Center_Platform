/**
 * @spec O002-miniapp-menu-config
 * 菜单分类类型定义（B端管理后台）
 */

import { z } from 'zod';

// ============================================================================
// Zod 验证 Schema (T087)
// ============================================================================

/**
 * 分类编码验证规则
 * - 必须以字母开头
 * - 只能包含大写字母、数字和下划线
 * - 长度 2-50 字符
 */
export const categoryCodeSchema = z
  .string()
  .min(2, '编码长度至少2字符')
  .max(50, '编码长度不能超过50字符')
  .regex(/^[A-Za-z][A-Za-z0-9_]*$/, '编码必须以字母开头，只能包含字母、数字和下划线')
  .transform((val) => val.toUpperCase());

/**
 * 显示名称验证规则
 */
export const displayNameSchema = z
  .string()
  .min(1, '显示名称不能为空')
  .max(50, '名称长度不能超过50字符')
  .transform((val) => val.trim());

/**
 * URL 验证规则（可选）
 */
export const optionalUrlSchema = z
  .string()
  .url('请输入有效的 URL 地址')
  .max(500, 'URL 长度不能超过500字符')
  .optional()
  .or(z.literal(''));

/**
 * 描述验证规则（可选）
 */
export const descriptionSchema = z
  .string()
  .max(500, '描述长度不能超过500字符')
  .optional();

/**
 * 创建分类请求 Schema
 */
export const createMenuCategorySchema = z.object({
  code: categoryCodeSchema,
  displayName: displayNameSchema,
  sortOrder: z.number().int().min(0).max(9999).optional(),
  isVisible: z.boolean().optional().default(true),
  iconUrl: optionalUrlSchema,
  description: descriptionSchema,
});

/**
 * 更新分类请求 Schema
 */
export const updateMenuCategorySchema = z.object({
  displayName: displayNameSchema.optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
  isVisible: z.boolean().optional(),
  iconUrl: optionalUrlSchema,
  description: descriptionSchema,
});

/**
 * 切换可见性请求 Schema
 */
export const toggleVisibilitySchema = z.object({
  isVisible: z.boolean(),
});

/**
 * 批量更新排序请求 Schema
 */
export const batchUpdateSortOrderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid('无效的分类 ID'),
      sortOrder: z.number().int().min(0).max(9999),
    })
  ).min(1, '至少需要一个排序项'),
});

// 从 Schema 推导类型
export type CreateMenuCategoryInput = z.infer<typeof createMenuCategorySchema>;
export type UpdateMenuCategoryInput = z.infer<typeof updateMenuCategorySchema>;
export type ToggleVisibilityInput = z.infer<typeof toggleVisibilitySchema>;
export type BatchUpdateSortOrderInput = z.infer<typeof batchUpdateSortOrderSchema>;

// ============================================================================
// 基础类型
// ============================================================================

/**
 * 菜单分类 DTO
 */
export interface MenuCategoryDTO {
  /** 分类 ID */
  id: string;

  /** 分类编码（如 "ALCOHOL", "COFFEE"）*/
  code: string;

  /** 显示名称（如 "经典特调"）*/
  displayName: string;

  /** 排序序号 */
  sortOrder: number;

  /** 是否可见 */
  isVisible: boolean;

  /** 是否为默认分类 */
  isDefault: boolean;

  /** 图标 URL */
  iconUrl?: string;

  /** 分类描述 */
  description?: string;

  /** 关联商品数量 */
  productCount?: number;

  /** 创建时间 */
  createdAt?: string;

  /** 更新时间 */
  updatedAt?: string;
}

/**
 * 客户端菜单分类 DTO（精简版）
 */
export interface ClientMenuCategoryDTO {
  /** 分类 ID */
  id: string;

  /** 分类编码 */
  code: string;

  /** 显示名称 */
  displayName: string;

  /** 图标 URL */
  iconUrl?: string;

  /** 商品数量 */
  productCount?: number;
}

// ============================================================================
// 请求类型
// ============================================================================

/**
 * 创建分类请求
 */
export interface CreateMenuCategoryRequest {
  /** 分类编码（必填，唯一编码） */
  code: string;

  /** 显示名称（必填） */
  displayName: string;

  /** 排序序号（可选，默认 0） */
  sortOrder?: number;

  /** 是否可见（可选，默认 true） */
  isVisible?: boolean;

  /** 图标 URL（可选） */
  iconUrl?: string;

  /** 分类描述（可选） */
  description?: string;
}

/**
 * 更新分类请求
 */
export interface UpdateMenuCategoryRequest {
  /** 显示名称 */
  displayName?: string;

  /** 排序序号 */
  sortOrder?: number;

  /** 是否可见 */
  isVisible?: boolean;

  /** 图标 URL */
  iconUrl?: string;

  /** 分类描述 */
  description?: string;
}

/**
 * 批量更新排序请求
 */
export interface BatchUpdateSortOrderRequest {
  /** 排序项列表 */
  items: Array<{
    /** 分类 ID */
    id: string;
    /** 新的排序序号 */
    sortOrder: number;
  }>;
}

/**
 * 切换可见性请求
 */
export interface ToggleVisibilityRequest {
  /** 是否可见 */
  isVisible: boolean;
}

// ============================================================================
// 响应类型
// ============================================================================

/**
 * 删除分类响应数据
 */
export interface DeleteCategoryData {
  /** 被删除的分类 ID */
  deletedCategoryId: string;

  /** 被删除的分类名称 */
  deletedCategoryName: string;

  /** 受影响的商品数量 */
  affectedProductCount: number;

  /** 商品迁移目标分类 ID */
  targetCategoryId?: string;

  /** 商品迁移目标分类名称 */
  targetCategoryName?: string;
}

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
 * API 错误响应格式
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

/**
 * 分类列表响应
 */
export type MenuCategoryListResponse = ApiResponse<MenuCategoryDTO[]>;

/**
 * 单个分类响应
 */
export type MenuCategoryResponse = ApiResponse<MenuCategoryDTO>;

/**
 * 删除分类响应
 */
export type DeleteCategoryResponse = ApiResponse<DeleteCategoryData>;

/**
 * 客户端分类列表响应
 */
export type ClientMenuCategoryListResponse = ApiResponse<ClientMenuCategoryDTO[]>;

// ============================================================================
// 查询参数类型
// ============================================================================

/**
 * 获取分类列表查询参数
 */
export interface GetMenuCategoriesParams {
  /** 是否包含隐藏分类 */
  includeHidden?: boolean;

  /** 是否包含商品数量 */
  includeProductCount?: boolean;
}

// ============================================================================
// 表单类型
// ============================================================================

/**
 * 分类表单数据
 */
export interface MenuCategoryFormData {
  code: string;
  displayName: string;
  sortOrder?: number;
  isVisible: boolean;
  iconUrl?: string;
  description?: string;
}

/**
 * 分类表单模式
 */
export type CategoryFormMode = 'create' | 'edit';

// ============================================================================
// 错误码
// ============================================================================

/**
 * 分类相关错误码
 */
export const CategoryErrorCodes = {
  /** 分类不存在 */
  CATEGORY_NOT_FOUND: 'CAT_NTF_001',

  /** 分类编码已存在 */
  DUPLICATE_CATEGORY_CODE: 'CAT_DUP_001',

  /** 无法删除默认分类 */
  CANNOT_DELETE_DEFAULT_CATEGORY: 'CAT_BIZ_001',

  /** 无法隐藏默认分类 */
  CANNOT_HIDE_DEFAULT_CATEGORY: 'CAT_BIZ_002',

  /** 分类编码格式无效 */
  INVALID_CATEGORY_CODE: 'CAT_VAL_001',

  /** 显示名称格式无效 */
  INVALID_DISPLAY_NAME: 'CAT_VAL_002',
} as const;

export type CategoryErrorCode = typeof CategoryErrorCodes[keyof typeof CategoryErrorCodes];
