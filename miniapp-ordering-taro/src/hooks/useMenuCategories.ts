/**
 * @spec O007-miniapp-menu-api
 * 菜单分类 Hook
 */

import { useQuery } from '@tanstack/react-query'
import {
  fetchMenuCategories,
  MenuCategoryDTO,
} from '../services/menuCategoryService'

/**
 * 分类列表查询键
 */
export const MENU_CATEGORIES_QUERY_KEY = ['menuCategories'] as const

/**
 * @spec O007-miniapp-menu-api
 * 获取菜单分类列表 Hook
 * @returns TanStack Query 查询结果
 */
export function useMenuCategories() {
  return useQuery({
    queryKey: MENU_CATEGORIES_QUERY_KEY,

    queryFn: async () => {
      const response = await fetchMenuCategories()
      return response.data
    },

    // 分类数据缓存 5 分钟
    staleTime: 5 * 60 * 1000,

    // 缓存时间 10 分钟
    gcTime: 10 * 60 * 1000,

    // 窗口聚焦不刷新（分类很少变化）
    refetchOnWindowFocus: false,

    // 失败重试 2 次
    retry: 2,

    // 重试延迟
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * 导出类型
 */
export type { MenuCategoryDTO }
