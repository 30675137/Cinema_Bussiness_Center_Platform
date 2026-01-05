/**
 * @spec O009-miniapp-product-list
 * React hooks for category data fetching with TanStack Query
 */

import { useQuery } from '@tanstack/react-query'
import type { UseQueryOptions } from '@tanstack/react-query'
import {
  fetchCategories,
  fetchCategoryById,
  fetchCategoryByCode,
} from '@/services/categoryService'
import type {
  CategoryListResponse,
  MenuCategoryDTO,
} from '@/types/category'
import { CACHE_CONFIG } from '@/constants/api'

/**
 * Query key factory for categories
 */
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: () => [...categoryKeys.lists()] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
  byCode: (code: string) => [...categoryKeys.all, 'by-code', code] as const,
}

/**
 * Hook to fetch all visible menu categories
 * @param options - TanStack Query options
 * @returns Query result with category list
 * @example
 * const { data, isLoading } = useCategories()
 * console.log(data.data) // MenuCategoryDTO[]
 */
export const useCategories = (
  options?: Omit<
    UseQueryOptions<CategoryListResponse>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: () => fetchCategories(),
    staleTime: CACHE_CONFIG.CATEGORIES_STALE_TIME,
    gcTime: CACHE_CONFIG.CATEGORIES_CACHE_TIME,
    ...options,
  })
}

/**
 * Hook to fetch a single category by ID
 * @param categoryId - Menu category ID (UUID)
 * @param options - TanStack Query options
 * @returns Query result with category detail
 * @example
 * const { data, isLoading } = useCategory('uuid-xxx')
 */
export const useCategory = (
  categoryId: string,
  options?: Omit<
    UseQueryOptions<MenuCategoryDTO>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: categoryKeys.detail(categoryId),
    queryFn: () => fetchCategoryById(categoryId),
    staleTime: CACHE_CONFIG.CATEGORIES_STALE_TIME,
    gcTime: CACHE_CONFIG.CATEGORIES_CACHE_TIME,
    enabled: !!categoryId,
    ...options,
  })
}

/**
 * Hook to fetch a category by code
 * @param code - Menu category code (e.g., "BEVERAGES", "SNACKS")
 * @param options - TanStack Query options
 * @returns Query result with category detail
 * @example
 * const { data } = useCategoryByCode('BEVERAGES')
 */
export const useCategoryByCode = (
  code: string,
  options?: Omit<
    UseQueryOptions<MenuCategoryDTO>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: categoryKeys.byCode(code),
    queryFn: () => fetchCategoryByCode(code),
    staleTime: CACHE_CONFIG.CATEGORIES_STALE_TIME,
    gcTime: CACHE_CONFIG.CATEGORIES_CACHE_TIME,
    enabled: !!code && code.trim() !== '',
    ...options,
  })
}
