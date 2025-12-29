/**
 * @spec O003-beverage-order
 * 订单历史查询 Hook (C端)
 */
import { useQuery } from '@tanstack/react-query'
import beverageService from '../services/beverageService'
import type { BeverageOrder } from '../services/beverageService'

/**
 * 订单历史查询参数
 */
interface UseOrderHistoryParams {
  /**
   * 用户ID
   */
  userId: string

  /**
   * 订单状态筛选（可选）
   */
  status?: BeverageOrder['status']

  /**
   * 页码（从1开始）
   */
  page?: number

  /**
   * 每页数量
   */
  pageSize?: number

  /**
   * 是否启用查询
   */
  enabled?: boolean
}

/**
 * 订单历史查询响应
 */
interface OrderHistoryResponse {
  /**
   * 订单列表
   */
  content: BeverageOrder[]

  /**
   * 总记录数
   */
  totalElements: number

  /**
   * 总页数
   */
  totalPages: number

  /**
   * 当前页码
   */
  number: number

  /**
   * 每页数量
   */
  size: number
}

/**
 * 订单历史查询 Hook
 *
 * US3: FR-019
 * 用户能够查看历史订单列表，按时间倒序排列
 *
 * @param params 查询参数
 * @returns TanStack Query result
 */
export const useOrderHistory = (params: UseOrderHistoryParams) => {
  const { userId, status, page = 1, pageSize = 10, enabled = true } = params

  return useQuery<OrderHistoryResponse>({
    queryKey: ['orderHistory', userId, status, page, pageSize],
    queryFn: async () => {
      if (!userId) {
        throw new Error('用户ID不能为空')
      }

      const response = await beverageService.getOrderHistory({
        userId,
        status,
        page,
        pageSize,
      })

      return response
    },
    enabled: enabled && !!userId,
    staleTime: 30 * 1000, // 30秒内认为数据新鲜
  })
}

/**
 * 搜索订单 Hook
 *
 * US3: T130
 * 实现订单搜索功能（按订单号）
 *
 * @param userId 用户ID
 * @param searchQuery 搜索关键词（订单号）
 * @returns TanStack Query result
 */
export const useSearchOrders = (userId: string, searchQuery: string) => {
  return useQuery<BeverageOrderDTO | null>({
    queryKey: ['searchOrder', userId, searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.trim().length === 0) {
        return null
      }

      try {
        const order = await orderService.getOrderByNumber(searchQuery.trim())
        // 验证订单是否属于当前用户
        if (order.userId !== userId) {
          throw new Error('订单不存在')
        }
        return order
      } catch (error) {
        console.error('搜索订单失败:', error)
        return null
      }
    },
    enabled: !!userId && !!searchQuery,
    staleTime: 0, // 搜索结果不缓存
  })
}
