/**
 * @spec O002-miniapp-menu-config
 * 菜单分类查询 Hook
 */
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { menuCategoryService } from '../services/menuCategoryService'
import type { MenuCategoryDTO } from '../types/menuCategory'

/**
 * 菜单分类查询 Key 工厂
 */
export const menuCategoryKeys = {
  all: ['menuCategories'] as const,
  lists: () => [...menuCategoryKeys.all, 'list'] as const,
}

/**
 * 菜单分类查询参数
 */
interface UseMenuCategoriesParams {
  /**
   * 是否启用查询（默认为 true）
   */
  enabled?: boolean

  /**
   * 是否使用本地缓存策略（默认为 true）
   */
  useLocalCache?: boolean
}

/**
 * 菜单分类列表查询 Hook
 *
 * @param params 查询参数
 * @returns TanStack Query result with categories list
 */
export function useMenuCategories(params?: UseMenuCategoriesParams) {
  const { enabled = true, useLocalCache = true } = params || {}

  return useQuery({
    queryKey: menuCategoryKeys.lists(),
    queryFn: async () => {
      return useLocalCache
        ? menuCategoryService.getMenuCategoriesWithCache()
        : menuCategoryService.getMenuCategories()
    },
    // 服务端缓存 5 分钟
    staleTime: 5 * 60 * 1000,
    // 10 分钟后清理缓存
    gcTime: 10 * 60 * 1000,
    enabled,
    // 错误重试配置
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * (attemptIndex + 1), 5000),
  })
}

/**
 * 获取分类显示名称
 */
export function getCategoryDisplayName(
  categories: MenuCategoryDTO[],
  categoryId: string
): string {
  const category = categories.find((c) => c.id === categoryId)
  return category?.displayName || '未知分类'
}

/**
 * 根据编码获取分类
 */
export function getCategoryByCode(
  categories: MenuCategoryDTO[],
  code: string
): MenuCategoryDTO | undefined {
  return categories.find((c) => c.code === code)
}

/**
 * 刷新分类缓存 Hook
 */
export function useRefreshMenuCategories() {
  const queryClient = useQueryClient()

  return {
    /**
     * 使缓存失效并重新获取
     */
    refresh: async () => {
      menuCategoryService.clearMenuCategoryCache()
      await queryClient.invalidateQueries({ queryKey: menuCategoryKeys.all })
    },
    /**
     * 仅使缓存失效
     */
    invalidate: () => {
      menuCategoryService.clearMenuCategoryCache()
      queryClient.invalidateQueries({ queryKey: menuCategoryKeys.all })
    },
  }
}
