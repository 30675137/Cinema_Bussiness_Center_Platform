/**
 * @spec O003-beverage-order
 * 饮品详情查询 Hook
 */
import { useQuery } from '@tanstack/react-query'
import { beverageService } from '../services/beverageService'

/**
 * 饮品详情查询参数
 */
interface UseBeverageDetailParams {
  /**
   * 饮品ID
   */
  beverageId: string | null

  /**
   * 是否启用查询（默认为 true，当 beverageId 为 null 时自动禁用）
   */
  enabled?: boolean
}

/**
 * 饮品详情查询 Hook
 *
 * @param params 查询参数
 * @returns TanStack Query result with beverage detail (including specs)
 */
export const useBeverageDetail = (params: UseBeverageDetailParams) => {
  const { beverageId, enabled = true } = params

  return useQuery({
    queryKey: ['beverage', beverageId],
    queryFn: async () => {
      if (!beverageId) {
        throw new Error('饮品ID不能为空')
      }
      return beverageService.getBeverageDetail(beverageId)
    },
    staleTime: 5 * 60 * 1000, // 5分钟内数据不过期
    gcTime: 10 * 60 * 1000, // 10分钟后清理缓存
    enabled: enabled && !!beverageId, // beverageId 为空时不查询
  })
}
