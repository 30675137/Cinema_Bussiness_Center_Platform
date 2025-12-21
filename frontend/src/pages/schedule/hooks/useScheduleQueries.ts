/**
 * TanStack Query hooks for Schedule Management
 *
 * Provides hooks for:
 * - Fetching schedule events list
 * - Fetching schedule event detail
 * - Fetching halls list
 * - Fetching hall detail
 * - Fetching stores list
 * - Fetching store detail
 * - Fetching halls by store
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { scheduleService, type Store, type StoreQueryParams } from '../services/scheduleService';
import type {
  ScheduleEvent,
  Hall,
  ScheduleQueryParams,
  HallQueryParams,
} from '../types/schedule.types';

// ============================================================================
// Query Key Factory
// ============================================================================

export const scheduleKeys = {
  all: ['schedules'] as const,
  lists: () => [...scheduleKeys.all, 'list'] as const,
  list: (params: ScheduleQueryParams) => [...scheduleKeys.lists(), params] as const,
  details: () => [...scheduleKeys.all, 'detail'] as const,
  detail: (id: string) => [...scheduleKeys.details(), id] as const,
  halls: () => [...scheduleKeys.all, 'halls'] as const,
  hallsList: (params?: HallQueryParams) => [...scheduleKeys.halls(), 'list', params] as const,
  hallDetail: (id: string) => [...scheduleKeys.halls(), 'detail', id] as const,
  // 新增：门店相关 keys
  stores: () => [...scheduleKeys.all, 'stores'] as const,
  storesList: (params?: StoreQueryParams) => [...scheduleKeys.stores(), 'list', params] as const,
  storeDetail: (id: string) => [...scheduleKeys.stores(), 'detail', id] as const,
  hallsByStore: (storeId: string, params?: HallQueryParams) =>
    [...scheduleKeys.stores(), storeId, 'halls', params] as const,
};

// ============================================================================
// Query Options Configuration
// ============================================================================

const DEFAULT_QUERY_OPTIONS = {
  staleTime: 2 * 60 * 1000, // 2 minutes (schedules change frequently)
  gcTime: 5 * 60 * 1000, // 5 minutes
  retry: 2,
  refetchOnWindowFocus: false,
} as const;

// ============================================================================
// Schedule Event Queries
// ============================================================================

/**
 * Hook to fetch list of schedule events for a specific date
 */
export function useScheduleListQuery(
  params: ScheduleQueryParams,
  options?: Omit<
    UseQueryOptions<ScheduleEvent[], Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<ScheduleEvent[], Error>({
    queryKey: scheduleKeys.list(params),
    queryFn: async () => {
      const response = await scheduleService.getScheduleList(params);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch schedule list');
      }
      return response.data;
    },
    ...DEFAULT_QUERY_OPTIONS,
    ...options,
  });
}

/**
 * Hook to fetch a single schedule event by ID
 */
export function useScheduleDetailQuery(
  id: string | undefined,
  options?: Omit<
    UseQueryOptions<ScheduleEvent, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<ScheduleEvent, Error>({
    queryKey: scheduleKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) {
        throw new Error('Schedule event ID is required');
      }
      const response = await scheduleService.getScheduleDetail(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch schedule detail');
      }
      return response.data;
    },
    enabled: !!id,
    ...DEFAULT_QUERY_OPTIONS,
    ...options,
  });
}

// ============================================================================
// Hall Queries
// ============================================================================

/**
 * Hook to fetch list of halls
 */
export function useHallsListQuery(
  params?: HallQueryParams,
  options?: Omit<
    UseQueryOptions<Hall[], Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<Hall[], Error>({
    queryKey: scheduleKeys.hallsList(params),
    queryFn: async () => {
      const response = await scheduleService.getHallList(params);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch halls list');
      }
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (halls change infrequently)
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    ...options,
  });
}

/**
 * Hook to fetch a single hall by ID
 */
export function useHallDetailQuery(
  id: string | undefined,
  options?: Omit<
    UseQueryOptions<Hall, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<Hall, Error>({
    queryKey: scheduleKeys.hallDetail(id || ''),
    queryFn: async () => {
      if (!id) {
        throw new Error('Hall ID is required');
      }
      const response = await scheduleService.getHallDetail(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch hall detail');
      }
      return response.data;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    ...options,
  });
}

// ============================================================================
// Store Queries（新增：门店查询）
// ============================================================================

/**
 * Hook to fetch list of stores
 * 用于前端下拉选择门店、按门店筛选影厅等场景
 */
export function useStoresListQuery(
  params?: StoreQueryParams,
  options?: Omit<
    UseQueryOptions<Store[], Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<Store[], Error>({
    queryKey: scheduleKeys.storesList(params),
    queryFn: async () => {
      const response = await scheduleService.getStoreList(params);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch stores list');
      }
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (stores change infrequently)
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    ...options,
  });
}

/**
 * Hook to fetch a single store by ID
 */
export function useStoreDetailQuery(
  id: string | undefined,
  options?: Omit<
    UseQueryOptions<Store, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<Store, Error>({
    queryKey: scheduleKeys.storeDetail(id || ''),
    queryFn: async () => {
      if (!id) {
        throw new Error('Store ID is required');
      }
      const response = await scheduleService.getStoreDetail(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch store detail');
      }
      return response.data;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    ...options,
  });
}

/**
 * Hook to fetch halls by store ID
 * 用于按门店维度查询影厅列表
 */
export function useHallsByStoreQuery(
  storeId: string | undefined,
  params?: HallQueryParams,
  options?: Omit<
    UseQueryOptions<Hall[], Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<Hall[], Error>({
    queryKey: scheduleKeys.hallsByStore(storeId || '', params),
    queryFn: async () => {
      if (!storeId) {
        throw new Error('Store ID is required');
      }
      const response = await scheduleService.getHallsByStore(storeId, params);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch halls by store');
      }
      return response.data;
    },
    enabled: !!storeId,
    staleTime: 10 * 60 * 1000, // 10 minutes (halls change infrequently)
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    ...options,
  });
}

