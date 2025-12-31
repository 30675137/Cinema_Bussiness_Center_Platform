/**
 * TanStack Query hooks for Dictionary Type and Item queries
 *
 * Provides hooks for:
 * - Fetching dictionary types list
 * - Fetching dictionary type detail
 * - Fetching dictionary items for a type
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { attributeService } from '../services/attributeService';
import {
  dictionaryKeys,
  type DictionaryTypeListParams,
  type DictionaryItemListParams,
} from '../types/attribute.types';
import type { DictionaryType, DictionaryItem } from '@/features/attribute-dictionary/types';

// ============================================================================
// Query Options Configuration
// ============================================================================

const DEFAULT_QUERY_OPTIONS = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
  retry: 2,
  refetchOnWindowFocus: false,
} as const;

// ============================================================================
// Dictionary Type Queries
// ============================================================================

interface DictionaryTypesQueryResult {
  data: DictionaryType[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Hook to fetch list of dictionary types
 */
export function useDictionaryTypesQuery(
  params?: DictionaryTypeListParams,
  options?: Omit<UseQueryOptions<DictionaryTypesQueryResult, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<DictionaryTypesQueryResult, Error>({
    queryKey: dictionaryKeys.typesList(params),
    queryFn: async () => {
      const response = await attributeService.getDictionaryTypes(params);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch dictionary types');
      }
      return response.data;
    },
    ...DEFAULT_QUERY_OPTIONS,
    ...options,
  });
}

/**
 * Hook to fetch a single dictionary type by ID
 */
export function useDictionaryTypeQuery(
  id: string | undefined,
  options?: Omit<UseQueryOptions<DictionaryType, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<DictionaryType, Error>({
    queryKey: dictionaryKeys.typeDetail(id || ''),
    queryFn: async () => {
      if (!id) {
        throw new Error('Dictionary type ID is required');
      }
      const response = await attributeService.getDictionaryType(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch dictionary type');
      }
      return response.data;
    },
    enabled: !!id,
    ...DEFAULT_QUERY_OPTIONS,
    ...options,
  });
}

// ============================================================================
// Dictionary Item Queries
// ============================================================================

/**
 * Hook to fetch dictionary items for a specific type
 */
export function useDictionaryItemsQuery(
  typeId: string | undefined,
  params?: Omit<DictionaryItemListParams, 'typeId'>,
  options?: Omit<UseQueryOptions<DictionaryItem[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<DictionaryItem[], Error>({
    queryKey: dictionaryKeys.items(typeId || ''),
    queryFn: async () => {
      if (!typeId) {
        throw new Error('Dictionary type ID is required');
      }
      const response = await attributeService.getDictionaryItems(typeId, params);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch dictionary items');
      }
      return response.data;
    },
    enabled: !!typeId,
    ...DEFAULT_QUERY_OPTIONS,
    // Items may change more frequently, shorter stale time
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

/**
 * Hook to fetch active dictionary items for a type (for dropdown options)
 */
export function useActiveDictionaryItemsQuery(
  typeId: string | undefined,
  options?: Omit<UseQueryOptions<DictionaryItem[], Error>, 'queryKey' | 'queryFn'>
) {
  return useDictionaryItemsQuery(typeId, { status: 'active' }, options);
}
