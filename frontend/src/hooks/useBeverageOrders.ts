/**
 * @spec O003-beverage-order
 * B端饮品订单查询 Hook
 */
import { useQuery } from '@tanstack/react-query';
import {
  beverageOrderManagementService,
  type OrderQueryParams,
} from '../services/beverageOrderManagementService';

/**
 * 订单列表查询 Hook
 *
 * @param params 查询参数
 * @returns TanStack Query result
 */
export const useBeverageOrders = (params: OrderQueryParams) => {
  return useQuery({
    queryKey: ['beverage-orders', params],
    queryFn: () => beverageOrderManagementService.getOrders(params),
    staleTime: 30 * 1000, // 30秒内数据不过期
    refetchInterval: 60 * 1000, // 每分钟自动刷新
  });
};

/**
 * 待处理订单查询 Hook（待制作 + 制作中）
 *
 * @param storeId 门店ID
 * @param enabled 是否启用查询
 * @returns TanStack Query result
 */
export const usePendingOrders = (storeId: string | null, enabled = true) => {
  return useQuery({
    queryKey: ['beverage-orders', 'pending', storeId],
    queryFn: () => {
      if (!storeId) throw new Error('门店ID不能为空');
      return beverageOrderManagementService.getPendingOrders(storeId);
    },
    enabled: enabled && !!storeId,
    staleTime: 10 * 1000, // 10秒内数据不过期
    refetchInterval: 5 * 1000, // 每5秒自动刷新（实时更新）
  });
};
