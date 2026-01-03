/**
 * @spec O007-miniapp-menu-api
 * @spec O002-miniapp-menu-config
 * 商品列表状态管理
 */

import { create } from 'zustand'
import { ChannelCategory } from '../types/product'

/**
 * 商品列表状态接口
 * @spec O002-miniapp-menu-config
 */
export interface ProductListState {
  /**
   * @spec O002-miniapp-menu-config
   * 当前选中的分类 ID（UUID 格式，优先级最高）
   */
  selectedCategoryId: string | null

  /** 当前选中的分类编码（null 表示"全部"，向后兼容） */
  selectedCategory: ChannelCategory | null

  /**
   * @spec O002-miniapp-menu-config
   * 设置选中的分类（同时设置 ID 和 code）
   */
  setSelectedCategory: (
    categoryId: string | null,
    category: ChannelCategory | null
  ) => void

  /** 重置状态 */
  reset: () => void
}

/**
 * 商品列表状态管理 Hook
 * @spec O002-miniapp-menu-config
 */
export const useProductListStore = create<ProductListState>((set) => ({
  selectedCategoryId: null,
  selectedCategory: null,

  setSelectedCategory: (categoryId, category) => {
    set({ selectedCategoryId: categoryId, selectedCategory: category })
  },

  reset: () => {
    set({ selectedCategoryId: null, selectedCategory: null })
  },
}))
