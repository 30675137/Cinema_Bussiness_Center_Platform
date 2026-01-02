/**
 * @spec O006-miniapp-channel-order
 * 我的订单列表查询 Hook
 */

import { useQuery } from '@tanstack/react-query'
import { getMyChannelProductOrders } from '@/services/orderService'
import type { OrderStatus } from '@/types/order'
import { orderKeys } from './useCreateOrder'

export interface UseMyOrdersOptions {
  /** 订单状态筛选 */
  status?: OrderStatus

  /** 页码(从 1 开始) */
  page?: number

  /** 每页数量 */
  pageSize?: number

  /** 是否启用查询(默认 true) */
  enabled?: boolean
}

/**
 * 获取我的订单列表
 *
 * @param options 查询选项
 * @returns TanStack Query 查询结果
 *
 * @example
 * ```typescript
 * function MyOrdersPage() {
 *   const [status, setStatus] = useState<OrderStatus | undefined>()
 *   const [page, setPage] = useState(1)
 *
 *   const { data, isLoading, error } = useMyOrders({
 *     status,
 *     page,
 *     pageSize: 10
 *   })
 *
 *   if (isLoading) return <Loading />
 *   if (error) return <Error message="加载失败" />
 *
 *   return (
 *     <View>
 *       {/* 状态筛选 */}
 *       <OrderStatusTabs active={status} onChange={setStatus} />
 *
 *       {/* 订单列表 */}
 *       {data?.data.map(order => (
 *         <OrderCard key={order.id} order={order} />
 *       ))}
 *
 *       {/* 分页 */}
 *       <Pagination 
 *         current={page} 
 *         total={data?.total} 
 *         onChange={setPage} 
 *       />
 *     </View>
 *   )
 * }
 *
 * // 查询待支付订单
 * function PendingPaymentOrders() {
 *   const { data } = useMyOrders({
 *     status: OrderStatus.PENDING_PAYMENT
 *   })
 *
 *   return <OrderList orders={data?.data} />
 * }
 * ```
 */
export const useMyOrders = (options: UseMyOrdersOptions = {}) => {
  const { status, page = 1, pageSize = 10, enabled = true } = options

  return useQuery({
    queryKey: orderKeys.list({ status, page }),
    queryFn: () =>
      getMyChannelProductOrders({
        status,
        page,
        pageSize,
      }),
    enabled,
    staleTime: 30 * 1000, // 30秒(订单状态变化较快)
  })
}
