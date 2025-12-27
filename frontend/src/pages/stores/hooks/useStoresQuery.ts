/**
 * TanStack Query hooks for Store Management
 *
 * Provides hooks for:
 * - Fetching stores list
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { storeService } from '../services/storeService';
import type { Store, StoreQueryParams } from '../types/store.types';

// ============================================================================
// Query Key Factory
// ============================================================================

export const storeKeys = {
  all: ['stores'] as const,
  lists: () => [...storeKeys.all, 'list'] as const,
  list: (params?: StoreQueryParams) => [...storeKeys.lists(), params] as const,
};

// ============================================================================
// Query Options Configuration
// ============================================================================

const DEFAULT_QUERY_OPTIONS = {
  staleTime: 10 * 60 * 1000, // 10 minutes (stores change infrequently)
  gcTime: 30 * 60 * 1000, // 30 minutes
  retry: 2,
  refetchOnWindowFocus: false,
} as const;

// ============================================================================
// Store Queries
// ============================================================================

/**
 * Hook to fetch list of stores
 * Used for store selection dropdowns and store filtering
 */
export function useStoresQuery(
  params?: StoreQueryParams,
  options?: Omit<UseQueryOptions<Store[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<Store[], Error>({
    queryKey: storeKeys.list(params),
    queryFn: async () => {
      const data = await storeService.getStores(params);
      return data;
    },
    ...DEFAULT_QUERY_OPTIONS,
    ...options,
  });
}
