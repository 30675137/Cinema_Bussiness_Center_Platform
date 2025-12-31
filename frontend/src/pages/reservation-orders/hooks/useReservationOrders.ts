/**
 * 预约单列表查询 Hook
 *
 * 使用 TanStack Query 管理列表数据的获取和缓存
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  ReservationListQueryRequest,
  ReservationListResponse,
} from '../types/reservation-order.types';
import { getReservationList } from '../services/reservationOrderService';

/** 查询键前缀 */
export const RESERVATION_QUERY_KEY = 'reservations';

/** 缓存过期时间: 5分钟 */
const STALE_TIME = 5 * 60 * 1000;

/**
 * 预约单列表查询 Hook
 *
 * @param params 查询参数
 * @param enabled 是否启用查询
 */
export function useReservationOrders(
  params?: ReservationListQueryRequest,
  enabled: boolean = true
) {
  return useQuery<ReservationListResponse, Error>({
    queryKey: [RESERVATION_QUERY_KEY, 'list', params],
    queryFn: () => getReservationList(params),
    staleTime: STALE_TIME,
    enabled,
  });
}

/**
 * 预刷新列表数据 Hook
 *
 * 用于在操作成功后主动刷新列表
 */
export function useRefreshReservationList() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({
      queryKey: [RESERVATION_QUERY_KEY, 'list'],
    });
  };
}

/**
 * 预约单列表数据预加载 Hook
 *
 * 用于在导航前预加载下一页数据
 */
export function usePrefetchReservationList() {
  const queryClient = useQueryClient();

  return (params: ReservationListQueryRequest) => {
    queryClient.prefetchQuery({
      queryKey: [RESERVATION_QUERY_KEY, 'list', params],
      queryFn: () => getReservationList(params),
      staleTime: STALE_TIME,
    });
  };
}

export default useReservationOrders;
