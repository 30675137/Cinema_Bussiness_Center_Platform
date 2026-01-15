/**
 * @spec O007-miniapp-menu-api
 * @spec O002-miniapp-menu-config
 * 商品列表状态管理
 */

import { create } from 'zustand'

/**
 * @spec O007-miniapp-menu-api
 * 商品列表状态接口
 */
export interface ProductListState {
  /**
   * 当前选中的分类 ID（UUID 格式）
   */
  selectedCategoryId: string | null

  /**
   * 当前选中的分类编码（字符串，如 'COFFEE', 'ALCOHOL'）
   */
  selectedCategory: string | null

  /**
   * @spec O007-miniapp-menu-api
   * 设置选中的分类（同时设置 ID 和 code）
   */
  setSelectedCategory: (
    categoryId: string | null,
    categoryCode: string | null
  ) => void

  /** 重置状态 */
  reset: () => void
}

/**
 * @spec O007-miniapp-menu-api
 * 商品列表状态管理 Hook
 */
export const useProductListStore = create<ProductListState>((set) => ({
  selectedCategoryId: null,
  selectedCategory: null,

  setSelectedCategory: (categoryId, categoryCode) => {
    set({ selectedCategoryId: categoryId, selectedCategory: categoryCode })
  },

  reset: () => {
    set({ selectedCategoryId: null, selectedCategory: null })
  },
}))
