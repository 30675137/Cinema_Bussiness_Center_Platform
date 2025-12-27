/**
 * @spec O001-product-order-list
 * 订单列表查询 Hook - 使用 TanStack Query
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { fetchOrders } from '../services/orderService'
import type { OrderQueryParams, OrderListResponse, OrderStatus } from '../types/order'

/**
 * 订单列表查询 Hook
 *
 * @param params 查询参数（page, pageSize, status, startDate, endDate, search, sortBy, sortOrder）
 * @returns TanStack Query 查询结果
 *
 * 特性:
 * - staleTime: 30秒 - 数据在30秒内被视为新鲜，不会重新获取
 * - keepPreviousData: true - 页面切换时保留之前的数据，避免加载闪烁
 * - refetchOnWindowFocus: false - 窗口聚焦时不自动刷新
 */
export const useOrders = (
  params: OrderQueryParams = {}
): UseQueryResult<OrderListResponse, Error> => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => fetchOrders(params),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (previously cacheTime)
    refetchOnWindowFocus: false,
    retry: 1, // 失败后重试1次
  })
}

/**
 * 订单列表查询的 Query Key 工厂函数
 * 用于手动失效缓存或预取数据
 */
export const ordersQueryKey = (params: OrderQueryParams = {}) => ['orders', params]

/**
 * URL 查询参数同步 Hook
 *
 * 从 URL 查询参数中读取筛选条件，并提供更新方法
 *
 * @returns [queryParams, updateQueryParams] - 当前查询参数和更新函数
 *
 * @example
 * ```tsx
 * const [queryParams, updateQueryParams] = useOrderQueryParams()
 *
 * // 更新筛选条件
 * updateQueryParams({ status: OrderStatus.PAID, page: 1 })
 * ```
 */
export const useOrderQueryParams = (): [
  OrderQueryParams,
  (newParams: Partial<OrderQueryParams>) => void
] => {
  const [searchParams, setSearchParams] = useSearchParams()

  // 从 URL 解析查询参数
  const queryParams: OrderQueryParams = {
    page: Number(searchParams.get('page')) || 1,
    pageSize: Number(searchParams.get('pageSize')) || 20,
    status: (searchParams.get('status') as OrderStatus) || undefined,
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
    search: searchParams.get('search') || undefined,
    sortBy: (searchParams.get('sortBy') as 'createdAt' | 'totalAmount') || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
  }

  // 更新 URL 查询参数
  const updateQueryParams = (newParams: Partial<OrderQueryParams>) => {
    const params = new URLSearchParams()

    const merged = { ...queryParams, ...newParams }

    // 只添加有值的参数到 URL
    if (merged.page && merged.page !== 1) params.set('page', merged.page.toString())
    if (merged.pageSize && merged.pageSize !== 20) params.set('pageSize', merged.pageSize.toString())
    if (merged.status) params.set('status', merged.status)
    if (merged.startDate) params.set('startDate', merged.startDate)
    if (merged.endDate) params.set('endDate', merged.endDate)
    if (merged.search) params.set('search', merged.search)
    if (merged.sortBy && merged.sortBy !== 'createdAt') params.set('sortBy', merged.sortBy)
    if (merged.sortOrder && merged.sortOrder !== 'desc') params.set('sortOrder', merged.sortOrder)

    setSearchParams(params)
  }

  return [queryParams, updateQueryParams]
}

export default useOrders
