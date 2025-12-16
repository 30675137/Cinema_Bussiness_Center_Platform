/**
 * TanStack Query hooks for Schedule Management
 * 
 * Provides hooks for:
 * - Fetching schedule events list
 * - Fetching schedule event detail
 * - Fetching halls list
 * - Fetching hall detail
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { scheduleService } from '../services/scheduleService';
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

