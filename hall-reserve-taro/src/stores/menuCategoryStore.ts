/**
 * @spec O002-miniapp-menu-config
 * 菜单分类状态管理 Store (Zustand)
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Taro from '@tarojs/taro'
import type { MenuCategoryDTO, MenuCategoryState, MenuCategoryActions } from '../types/menuCategory'

/**
 * Taro 存储适配器 (用于 persist middleware)
 */
const taroStorage = {
  getItem: (name: string): string | null => {
    try {
      return Taro.getStorageSync(name) || null
    } catch {
      return null
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      Taro.setStorageSync(name, value)
    } catch (e) {
      console.error('[menuCategoryStore] 存储失败:', e)
    }
  },
  removeItem: (name: string): void => {
    try {
      Taro.removeStorageSync(name)
    } catch {
      // ignore
    }
  },
}

/**
 * 初始状态
 */
const initialState: MenuCategoryState = {
  categories: [],
  selectedCategoryId: null,
  isLoading: false,
  error: null,
  lastUpdatedAt: null,
}

/**
 * 菜单分类状态管理 Store
 *
 * 使用场景：
 * - 存储从 API 获取的分类列表
 * - 管理当前选中的分类
 * - 跟踪加载状态和错误信息
 */
export const useMenuCategoryStore = create<MenuCategoryState & MenuCategoryActions>()(
  persist(
    (set, get) => ({
      // 初始状态
      ...initialState,

      // Actions
      setCategories: (categories: MenuCategoryDTO[]) =>
        set({
          categories,
          lastUpdatedAt: Date.now(),
          error: null,
        }),

      selectCategory: (categoryId: string | null) =>
        set({ selectedCategoryId: categoryId }),

      setLoading: (loading: boolean) =>
        set({ isLoading: loading }),

      setError: (error: string | null) =>
        set({ error }),

      reset: () =>
        set({
          ...initialState,
          // 保留 categories 数据避免闪烁
          categories: get().categories,
        }),

      getSelectedCategory: (): MenuCategoryDTO | null => {
        const { categories, selectedCategoryId } = get()
        if (!selectedCategoryId) return null
        return categories.find((c) => c.id === selectedCategoryId) || null
      },
    }),
    {
      name: 'menu-category-store',
      storage: createJSONStorage(() => taroStorage),
      // 只持久化 categories 和 selectedCategoryId
      partialize: (state) => ({
        categories: state.categories,
        selectedCategoryId: state.selectedCategoryId,
        lastUpdatedAt: state.lastUpdatedAt,
      }),
    }
  )
)

/**
 * 选择器：获取第一个分类（默认分类）
 */
export const selectFirstCategory = (state: MenuCategoryState): MenuCategoryDTO | null => {
  return state.categories.length > 0 ? state.categories[0] : null
}

/**
 * 选择器：获取分类数量
 */
export const selectCategoryCount = (state: MenuCategoryState): number => {
  return state.categories.length
}

/**
 * 选择器：检查是否有分类数据
 */
export const selectHasCategories = (state: MenuCategoryState): boolean => {
  return state.categories.length > 0
}

/**
 * 选择器：根据 ID 获取分类
 */
export const selectCategoryById = (
  state: MenuCategoryState,
  categoryId: string
): MenuCategoryDTO | undefined => {
  return state.categories.find((c) => c.id === categoryId)
}

/**
 * 选择器：根据编码获取分类
 */
export const selectCategoryByCode = (
  state: MenuCategoryState,
  code: string
): MenuCategoryDTO | undefined => {
  return state.categories.find((c) => c.code === code)
}
