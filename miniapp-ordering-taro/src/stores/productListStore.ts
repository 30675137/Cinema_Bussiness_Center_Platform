/**
 * @spec O007-miniapp-menu-api
 * 商品列表状态管理
 */

import { create } from 'zustand'
import { ChannelCategory } from '../types/product'

/**
 * 商品列表状态接口
 */
export interface ProductListState {
  /** 当前选中的分类（null 表示"全部"） */
  selectedCategory: ChannelCategory | null
  
  /** 设置选中的分类 */
  setSelectedCategory: (category: ChannelCategory | null) => void
  
  /** 重置状态 */
  reset: () => void
}

/**
 * 商品列表状态管理 Hook
 */
export const useProductListStore = create<ProductListState>((set) => ({
  selectedCategory: null,
  
  setSelectedCategory: (category) => {
    set({ selectedCategory: category })
  },
  
  reset: () => {
    set({ selectedCategory: null })
  },
}))
