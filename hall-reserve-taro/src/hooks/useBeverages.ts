/**
 * @spec O003-beverage-order
 * 饮品列表查询 Hook
 */
import { useQuery } from '@tanstack/react-query'
import { beverageService } from '../services/beverageService'
import type { BeverageDTO } from '../types/beverage'

/**
 * 饮品菜单查询参数
 */
interface UseBeveragesParams {
  /**
   * 分类筛选（可选）
   */
  category?: string

  /**
   * 是否只查询推荐饮品
   */
  recommendedOnly?: boolean

  /**
   * 是否启用查询（默认为 true）
   */
  enabled?: boolean
}

/**
 * 饮品列表查询结果（按分类分组）
 */
export interface BeveragesByCategory {
  [category: string]: BeverageDTO[]
}

/**
 * 饮品列表查询 Hook
 *
 * @param params 查询参数
 * @returns TanStack Query result
 */
export const useBeverages = (params?: UseBeveragesParams) => {
  const { category, recommendedOnly = false, enabled = true } = params || {}

  return useQuery({
    queryKey: ['beverages', { category, recommendedOnly }],
    queryFn: async () => {
      if (recommendedOnly) {
        return beverageService.getRecommendedBeverages()
      }
      return beverageService.getBeverages(category)
    },
    staleTime: 5 * 60 * 1000, // 5分钟内数据不过期
    gcTime: 10 * 60 * 1000, // 10分钟后清理缓存
    enabled,
  })
}
