/**
 * 预约单详情查询 Hook
 *
 * 使用 TanStack Query 管理详情数据的获取和缓存
 */

import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { ReservationOrder } from '../types/reservation-order.types'
import { getReservationDetail } from '../services/reservationOrderService'
import { RESERVATION_QUERY_KEY } from './useReservationOrders'

/** 缓存过期时间: 5分钟 */
const STALE_TIME = 5 * 60 * 1000

/**
 * 预约单详情查询 Hook
 *
 * @param id 预约单ID
 * @param enabled 是否启用查询
 */
export function useReservationDetail(
  id: string | null | undefined,
  enabled: boolean = true
) {
  return useQuery<ReservationOrder, Error>({
    queryKey: [RESERVATION_QUERY_KEY, 'detail', id],
    queryFn: () => {
      if (!id) {
        throw new Error('预约单ID不能为空')
      }
      return getReservationDetail(id)
    },
    staleTime: STALE_TIME,
    enabled: !!id && enabled,
  })
}

/**
 * 刷新预约单详情 Hook
 *
 * 用于在操作成功后主动刷新详情
 */
export function useRefreshReservationDetail() {
  const queryClient = useQueryClient()

  return (id: string) => {
    queryClient.invalidateQueries({
      queryKey: [RESERVATION_QUERY_KEY, 'detail', id],
    })
  }
}

/**
 * 预约单详情数据预加载 Hook
 *
 * 用于在导航前预加载详情数据
 */
export function usePrefetchReservationDetail() {
  const queryClient = useQueryClient()

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: [RESERVATION_QUERY_KEY, 'detail', id],
      queryFn: () => getReservationDetail(id),
      staleTime: STALE_TIME,
    })
  }
}

export default useReservationDetail
