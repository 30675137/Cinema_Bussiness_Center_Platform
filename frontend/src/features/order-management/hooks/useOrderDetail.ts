/**
 * @spec O001-product-order-list
 * 订单详情查询 Hook - 使用 TanStack Query
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { fetchOrderDetail } from '../services/orderService'
import type { OrderDetailResponse } from '../types/order'

/**
 * 订单详情查询 Hook
 *
 * @param orderId 订单ID
 * @returns TanStack Query 查询结果
 *
 * 特性:
 * - staleTime: 1分钟 - 数据在1分钟内被视为新鲜
 * - enabled: 仅当orderId存在时才执行查询
 * - refetchOnWindowFocus: false - 窗口聚焦时不自动刷新
 * - retry: 1 - 失败后重试1次
 */
export const useOrderDetail = (
  orderId: string | undefined
): UseQueryResult<OrderDetailResponse, Error> => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrderDetail(orderId!),
    enabled: !!orderId, // 只有当orderId存在时才执行查询
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1
  })
}

/**
 * 订单详情查询的 Query Key 工厂函数
 * 用于手动失效缓存或预取数据
 */
export const orderDetailQueryKey = (orderId: string) => ['order', orderId]

export default useOrderDetail
