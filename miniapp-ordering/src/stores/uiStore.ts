/**
 * @spec O006-miniapp-channel-order
 * UI 状态 Zustand Store
 */

import { create } from 'zustand'
import type { ChannelCategory } from '@/types/channelProduct'

/**
 * UI 状态接口
 */
interface UIStore {
  // 商品列表页状态
  selectedCategory: ChannelCategory | null
  setSelectedCategory: (category: ChannelCategory | null) => void

  // 商品详情页状态
  specsPanelVisible: boolean
  setSpecsPanelVisible: (visible: boolean) => void

  // 购物车页状态
  cartVisible: boolean
  setCartVisible: (visible: boolean) => void

  // 全局加载状态(可选,用于页面级加载)
  isGlobalLoading: boolean
  setGlobalLoading: (loading: boolean) => void
}

/**
 * UI 状态管理
 *
 * @description
 * - 管理页面 UI 交互状态(分类选择、面板显示等)
 * - 与业务数据分离,避免污染业务状态
 *
 * @example
 * ```typescript
 * import { useUIStore } from '@/stores/uiStore'
 *
 * function ProductListPage() {
 *   const { selectedCategory, setSelectedCategory } = useUIStore()
 *
 *   const handleCategoryChange = (category: ChannelCategory) => {
 *     setSelectedCategory(category)
 *   }
 *
 *   return <CategoryTabs value={selectedCategory} onChange={handleCategoryChange} />
 * }
 * ```
 */
export const useUIStore = create<UIStore>((set) => ({
  // 商品列表页 - 选中的分类
  selectedCategory: null,
  setSelectedCategory: (category) => set({ selectedCategory: category }),

  // 商品详情页 - 规格选择面板
  specsPanelVisible: false,
  setSpecsPanelVisible: (visible) => set({ specsPanelVisible: visible }),

  // 购物车显示状态
  cartVisible: false,
  setCartVisible: (visible) => set({ cartVisible: visible }),

  // 全局加载状态
  isGlobalLoading: false,
  setGlobalLoading: (loading) => set({ isGlobalLoading: loading }),
}))
