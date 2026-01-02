/**
 * @spec O006-miniapp-channel-order
 * 我的订单查询 Hook
 */

import { useQuery } from '@tanstack/react-query'
import { getMyChannelProductOrders } from '@/services/orderService'
import type { OrderStatus } from '@/types/order'

/**
 * 查询我的订单的 Query Key
 */
export const myOrdersKeys = {
  all: ['my-orders'] as const,
  lists: () => [...myOrdersKeys.all, 'list'] as const,
  list: (filters: { page?: number; pageSize?: number; status?: OrderStatus }) =>
    [...myOrdersKeys.lists(), filters] as const,
  details: () => [...myOrdersKeys.all, 'detail'] as const,
  detail: (id: string) => [...myOrdersKeys.details(), id] as const,
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
 *   const [page, setPage] = useState(1)
 *   const { data, isLoading, error } = useMyOrders({ page, pageSize: 10 })
 *
 *   if (isLoading) return <Loading />
 *   if (error) return <Error message={error.message} />
 *
 *   return (
 *     <View>
 *       {data?.data.map(order => (
 *         <OrderCard key={order.id} order={order} />
 *       ))}
 *       <Pagination
 *         current={page}
 *         total={data?.total}
 *         onChange={setPage}
 *       />
 *     </View>
 *   )
 * }
 *
 * // 按状态筛选
 * function PendingOrders() {
 *   const { data } = useMyOrders({ status: OrderStatus.PENDING_PAYMENT })
 *   return <OrderList orders={data?.data} />
 * }
 * ```
 */
export const useMyOrders = (options?: {
  page?: number
  pageSize?: number
  status?: OrderStatus
}) => {
  const { page = 1, pageSize = 10, status } = options || {}

  return useQuery({
    queryKey: myOrdersKeys.list({ page, pageSize, status }),
    queryFn: () => getMyChannelProductOrders({ page, pageSize, status }),
    staleTime: 1 * 60 * 1000, // 1分钟(订单状态可能变化)
  })
}
