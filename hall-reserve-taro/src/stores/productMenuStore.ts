/**
 * @spec O009-miniapp-product-list
 * Zustand store for product menu client state management
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Product menu UI state
 */
export interface ProductMenuState {
  /** Currently selected category ID (null = "All" category) */
  selectedCategoryId: string | null

  /** Search keyword */
  searchKeyword: string

  /** View mode (list or grid) */
  viewMode: 'list' | 'grid'

  /** Filter: show only recommended products */
  showOnlyRecommended: boolean

  /** Sort order */
  sortOrder: 'default' | 'price-asc' | 'price-desc' | 'name'

  /** Actions */
  setSelectedCategoryId: (categoryId: string | null) => void
  setSearchKeyword: (keyword: string) => void
  setViewMode: (mode: 'list' | 'grid') => void
  setShowOnlyRecommended: (show: boolean) => void
  setSortOrder: (order: 'default' | 'price-asc' | 'price-desc' | 'name') => void
  resetFilters: () => void
}

/**
 * Initial state
 */
const initialState = {
  selectedCategoryId: null,
  searchKeyword: '',
  viewMode: 'list' as const,
  showOnlyRecommended: false,
  sortOrder: 'default' as const,
}

/**
 * Product menu store
 * Manages client-side UI state for product filtering and display preferences
 *
 * @example
 * // Select a category
 * const { selectedCategoryId, setSelectedCategoryId } = useProductMenuStore()
 * setSelectedCategoryId('uuid-xxx')
 *
 * // Reset filters
 * const { resetFilters } = useProductMenuStore()
 * resetFilters()
 */
export const useProductMenuStore = create<ProductMenuState>()(
  persist(
    (set) => ({
      ...initialState,

      setSelectedCategoryId: (categoryId) =>
        set({ selectedCategoryId: categoryId }),

      setSearchKeyword: (keyword) =>
        set({ searchKeyword: keyword }),

      setViewMode: (mode) =>
        set({ viewMode: mode }),

      setShowOnlyRecommended: (show) =>
        set({ showOnlyRecommended: show }),

      setSortOrder: (order) =>
        set({ sortOrder: order }),

      resetFilters: () =>
        set({
          selectedCategoryId: null,
          searchKeyword: '',
          showOnlyRecommended: false,
          sortOrder: 'default',
        }),
    }),
    {
      name: 'product-menu-storage',
      // Only persist UI preferences, not search/filter state
      partialize: (state) => ({
        viewMode: state.viewMode,
        sortOrder: state.sortOrder,
      }),
    }
  )
)

/**
 * Selectors for derived state
 */

/**
 * Check if any filters are active
 */
export const useHasActiveFilters = () => {
  return useProductMenuStore((state) =>
    state.selectedCategoryId !== null ||
    state.searchKeyword !== '' ||
    state.showOnlyRecommended
  )
}

/**
 * Get current filter summary for display
 */
export const useFilterSummary = () => {
  return useProductMenuStore((state) => {
    const filters: string[] = []

    if (state.selectedCategoryId) {
      filters.push('已选分类')
    }

    if (state.searchKeyword) {
      filters.push(`搜索: ${state.searchKeyword}`)
    }

    if (state.showOnlyRecommended) {
      filters.push('仅推荐')
    }

    return filters.join(' · ')
  })
}
