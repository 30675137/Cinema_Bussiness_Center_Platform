/**
 * @spec O002-miniapp-menu-config
 * 菜单分类类型定义（B端管理后台）
 */

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
