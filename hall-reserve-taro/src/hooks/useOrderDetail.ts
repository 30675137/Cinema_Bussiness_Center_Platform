/**
 * @spec O003-beverage-order
 * 订单详情查询 Hook（支持轮询）
 */
import { useQuery } from '@tanstack/react-query'
import { orderService } from '../services/orderService'
import { BEVERAGE_CONFIG } from '../config'

/**
 * 订单详情查询参数
 */
interface UseOrderDetailParams {
  /**
   * 订单ID
   */
  orderId: string | null

  /**
   * 是否启用查询（默认为 true，当 orderId 为 null 时自动禁用）
   */
  enabled?: boolean

  /**
   * 是否启用轮询（默认为 false）
   * 如果启用，每 8 秒轮询一次订单状态
   */
  polling?: boolean
}

/**
 * 订单详情查询 Hook
 *
 * 支持轮询模式，用于实时更新订单状态（制作中 -> 已完成 -> 已交付）
 *
 * @param params 查询参数
 * @returns TanStack Query result with order detail
 */
export const useOrderDetail = (params: UseOrderDetailParams) => {
  const { orderId, enabled = true, polling = false } = params

  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) {
        throw new Error('订单ID不能为空')
      }
      return orderService.getOrderById(orderId)
    },
    staleTime: polling ? 0 : 30 * 1000, // 轮询模式不缓存，否则缓存30秒
    gcTime: 5 * 60 * 1000, // 5分钟后清理缓存
    enabled: enabled && !!orderId,
    refetchInterval: polling ? BEVERAGE_CONFIG.POLLING_INTERVAL_MS : false, // 轮询间隔 8 秒
    refetchIntervalInBackground: false, // 后台不轮询
  })
}
