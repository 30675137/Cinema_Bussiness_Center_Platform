/**
 * useCreateStore Hook
 *
 * TanStack Query mutation hook for creating a new store.
 * Handles API call, cache invalidation, and optimistic updates.
 * @since 022-store-crud
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createStore } from '../services/storeService';
import type { CreateStoreDTO, Store } from '../types/store.types';

/**
 * Mutation result for createStore
 */
export interface CreateStoreMutationResult {
  /** Mutate function to trigger store creation */
  mutate: (data: CreateStoreDTO) => void;
  /** Async mutate function that returns a promise */
  mutateAsync: (data: CreateStoreDTO) => Promise<Store>;
  /** Whether the mutation is currently running */
  isPending: boolean;
  /** Whether the mutation completed successfully */
  isSuccess: boolean;
  /** Whether the mutation failed */
  isError: boolean;
  /** Error object if mutation failed */
  error: Error | null;
  /** Reset mutation state */
  reset: () => void;
}

/**
 * Hook for creating a new store
 * 
 * Features:
 * - Automatically invalidates store list cache on success
 * - Provides loading and error states
 * - Returns created store data on success
 * 
 * @example
 * ```tsx
 * const { mutate, isPending, isError } = useCreateStore();
 * 
 * const handleSubmit = (data: CreateStoreDTO) => {
 *   mutate(data, {
 *     onSuccess: (store) => {
 *       message.success('门店创建成功');
 *       closeModal();
 *     },
 *     onError: (error) => {
 *       message.error(error.message);
 *     }
 *   });
 * };
 * ```
 */
export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStore,
    onSuccess: () => {
      // Invalidate store list cache to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
    onError: (error: Error) => {
      console.error('Failed to create store:', error);
    },
  });
}

export default useCreateStore;
