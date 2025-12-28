/**
 * @spec O003-beverage-order
 * 我的订单列表查询 Hook
 */
import { useInfiniteQuery } from '@tanstack/react-query'
import { orderService } from '../services/orderService'

/**
 * 我的订单列表查询参数
 */
interface UseMyOrdersParams {
  /**
   * 每页数量（默认 20）
   */
  pageSize?: number

  /**
   * 是否启用查询（默认为 true）
   */
  enabled?: boolean
}

/**
 * 我的订单列表查询 Hook（支持无限滚动）
 *
 * @param params 查询参数
 * @returns TanStack Query infinite query result
 */
export const useMyOrders = (params?: UseMyOrdersParams) => {
  const { pageSize = 20, enabled = true } = params || {}

  return useInfiniteQuery({
    queryKey: ['my-orders', { pageSize }],
    queryFn: async ({ pageParam = 0 }) => {
      return orderService.getMyOrders(pageParam, pageSize)
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // 如果当前页数据量 < pageSize，说明没有下一页
      if (lastPage.data.length < pageSize) {
        return undefined
      }
      // 返回下一页页码
      return allPages.length
    },
    staleTime: 30 * 1000, // 30秒内数据不过期
    gcTime: 5 * 60 * 1000, // 5分钟后清理缓存
    enabled,
  })
}
