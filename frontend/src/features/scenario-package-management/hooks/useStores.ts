/**
 * useStores Hook
 *
 * TanStack Query hook for fetching stores list.
 * Feature: 019-store-association
 *
 * @author Cinema Platform
 * @since 2025-12-21
 */

import { useQuery } from '@tanstack/react-query';
import { getStores } from '../../../pages/stores/services/storeService';
import type { Store, StoreQueryParams } from '../../../pages/stores/types/store.types';

/**
 * 获取门店列表的 Query Key
 */
export const STORES_QUERY_KEY = ['stores'] as const;

/**
 * 获取门店列表 Hook
 *
 * @param params 查询参数（可选的状态筛选）
 * @returns TanStack Query 结果
 */
export function useStores(params?: StoreQueryParams) {
  return useQuery({
    queryKey: [...STORES_QUERY_KEY, params],
    queryFn: () => getStores(params),
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    gcTime: 10 * 60 * 1000, // 10分钟垃圾回收
  });
}

/**
 * 获取活跃门店列表 Hook（常用场景）
 *
 * @returns TanStack Query 结果（仅包含 active 状态的门店）
 */
export function useActiveStores() {
  return useStores({ status: 'active' });
}

export type { Store, StoreQueryParams };
