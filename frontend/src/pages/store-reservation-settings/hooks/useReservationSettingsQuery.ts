/**
 * Reservation Settings Query Hooks
 *
 * TanStack Query hooks for fetching store reservation settings.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getStoreReservationSettings,
  getAllStoresReservationSettings,
  updateStoreReservationSettings,
  batchUpdateStoreReservationSettings,
} from '../services/reservationSettingsService';
import type {
  StoreReservationSettings,
  UpdateStoreReservationSettingsRequest,
  BatchUpdateStoreReservationSettingsRequest,
  BatchUpdateResult,
} from '../types/reservation-settings.types';

/**
 * Query hook for fetching reservation settings for a single store
 *
 * @param storeId Store ID (UUID string)
 * @returns TanStack Query result with reservation settings
 */
export function useStoreReservationSettings(storeId: string | undefined) {
  return useQuery({
    queryKey: ['store-reservation-settings', storeId],
    queryFn: () => {
      if (!storeId) {
        throw new Error('Store ID is required');
      }
      return getStoreReservationSettings(storeId);
    },
    enabled: !!storeId,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
}

/**
 * Query hook for fetching reservation settings for multiple stores
 *
 * @param storeIds Array of store IDs
 * @returns TanStack Query result with array of reservation settings
 */
export function useAllStoresReservationSettings(storeIds: string[] | undefined) {
  return useQuery({
    queryKey: ['store-reservation-settings', 'all', storeIds],
    queryFn: () => {
      if (!storeIds || storeIds.length === 0) {
        return [];
      }
      return getAllStoresReservationSettings(storeIds);
    },
    enabled: !!storeIds && storeIds.length > 0,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
}

/**
 * Mutation hook for updating reservation settings for a single store
 *
 * @param storeId Store ID (UUID string)
 * @returns TanStack Query mutation for updating settings
 */
export function useUpdateStoreReservationSettings(storeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateStoreReservationSettingsRequest) =>
      updateStoreReservationSettings(storeId, request),
    onSuccess: () => {
      // Invalidate and refetch reservation settings for this store
      queryClient.invalidateQueries({
        queryKey: ['store-reservation-settings', storeId],
      });
      // Also invalidate the "all stores" query to refresh the list
      queryClient.invalidateQueries({
        queryKey: ['store-reservation-settings', 'all'],
      });
    },
  });
}

/**
 * Mutation hook for batch updating reservation settings for multiple stores
 *
 * @returns TanStack Query mutation for batch updating settings
 */
export function useBatchUpdateStoreReservationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BatchUpdateStoreReservationSettingsRequest) =>
      batchUpdateStoreReservationSettings(request),
    onSuccess: (_, variables) => {
      // Invalidate queries for all affected stores
      variables.storeIds.forEach((storeId) => {
        queryClient.invalidateQueries({
          queryKey: ['store-reservation-settings', storeId],
        });
      });
      // Also invalidate the "all stores" query
      queryClient.invalidateQueries({
        queryKey: ['store-reservation-settings', 'all'],
      });
    },
  });
}

