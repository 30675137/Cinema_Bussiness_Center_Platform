/**
 * @spec O003-beverage-order
 * 取餐号查询 Hook
 */
import { useQuery } from '@tanstack/react-query'
import { orderService } from '../services/orderService'

/**
 * 取餐号查询参数
 */
interface UseQueueNumberParams {
  /**
   * 订单ID
   */
  orderId: string | null

  /**
   * 是否启用查询（默认为 true，当 orderId 为 null 时自动禁用）
   */
  enabled?: boolean
}

/**
 * 取餐号查询 Hook
 *
 * @param params 查询参数
 * @returns TanStack Query result with queue number
 */
export const useQueueNumber = (params: UseQueueNumberParams) => {
  const { orderId, enabled = true } = params

  return useQuery({
    queryKey: ['queue-number', orderId],
    queryFn: async () => {
      if (!orderId) {
        throw new Error('订单ID不能为空')
      }
      return orderService.getQueueNumber(orderId)
    },
    staleTime: Infinity, // 取餐号不会变化，永久缓存
    gcTime: 10 * 60 * 1000, // 10分钟后清理缓存
    enabled: enabled && !!orderId,
  })
}
