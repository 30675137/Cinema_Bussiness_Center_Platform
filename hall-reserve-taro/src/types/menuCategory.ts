/**
 * @spec O002-miniapp-menu-config
 * 菜单分类类型定义（C端小程序）
 */

// ============================================================================
// 基础类型
// ============================================================================

/**
 * 菜单分类 DTO（C端展示用）
 */
export interface MenuCategoryDTO {
  /** 分类 ID */
  id: string;

  /** 分类编码（如 "ALCOHOL", "COFFEE"）*/
  code: string;

  /** 显示名称（如 "经典特调"）*/
  displayName: string;

  /** 图标 URL */
  iconUrl?: string;

  /** 商品数量 */
  productCount?: number;
}

// ============================================================================
// 响应类型
// ============================================================================

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
 * 分类列表响应
 */
export type MenuCategoryListResponse = ApiResponse<MenuCategoryDTO[]>;

// ============================================================================
// 状态类型
// ============================================================================

/**
 * 分类加载状态
 */
export interface MenuCategoryState {
  /** 分类列表 */
  categories: MenuCategoryDTO[];

  /** 当前选中的分类 ID */
  selectedCategoryId: string | null;

  /** 是否正在加载 */
  isLoading: boolean;

  /** 错误信息 */
  error: string | null;

  /** 最后更新时间 */
  lastUpdatedAt: number | null;
}

/**
 * 分类 Store Actions
 */
export interface MenuCategoryActions {
  /** 设置分类列表 */
  setCategories: (categories: MenuCategoryDTO[]) => void;

  /** 选择分类 */
  selectCategory: (categoryId: string | null) => void;

  /** 设置加载状态 */
  setLoading: (loading: boolean) => void;

  /** 设置错误信息 */
  setError: (error: string | null) => void;

  /** 重置状态 */
  reset: () => void;

  /** 获取当前选中的分类 */
  getSelectedCategory: () => MenuCategoryDTO | null;
}

// ============================================================================
// 向后兼容类型
// ============================================================================

/**
 * 旧版分类枚举映射（向后兼容）
 * @deprecated 使用 API 返回的动态分类
 */
export const LEGACY_CATEGORY_MAP: Record<string, string> = {
  ALCOHOL: '经典特调',
  COFFEE: '精品咖啡',
  BEVERAGE: '经典饮品',
  SNACK: '主厨小食',
  MEAL: '精品餐食',
  OTHER: '其他商品',
};

/**
 * 旧版分类编码类型
 * @deprecated 使用动态分类
 */
export type LegacyCategoryCode = keyof typeof LEGACY_CATEGORY_MAP;

// ============================================================================
// 辅助函数类型
// ============================================================================

/**
 * 根据 ID 获取分类显示名称
 */
export type GetCategoryDisplayName = (
  categories: MenuCategoryDTO[],
  categoryId: string
) => string;

/**
 * 根据编码获取分类
 */
export type GetCategoryByCode = (
  categories: MenuCategoryDTO[],
  code: string
) => MenuCategoryDTO | undefined;
