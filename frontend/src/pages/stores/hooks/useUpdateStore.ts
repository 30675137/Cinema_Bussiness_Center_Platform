/**
 * useUpdateStore Hook
 *
 * TanStack Query mutation hook for updating an existing store.
 * Handles API call with optimistic locking support.
 * @since 022-store-crud
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateStore } from '../services/storeService';
import type { UpdateStoreDTO, Store } from '../types/store.types';

interface UpdateStoreParams {
  storeId: string;
  data: UpdateStoreDTO;
}

/**
 * Hook for updating an existing store
 * 
 * Features:
 * - Automatically invalidates store list cache on success
 * - Supports optimistic locking via version field
 * - Provides loading and error states
 * 
 * @example
 * ```tsx
 * const { mutate, isPending } = useUpdateStore();
 * 
 * const handleSubmit = (storeId: string, data: UpdateStoreDTO) => {
 *   mutate({ storeId, data }, {
 *     onSuccess: (store) => {
 *       message.success('门店更新成功');
 *       closeModal();
 *     },
 *     onError: (error) => {
 *       if (error.message.includes('刷新')) {
 *         // Optimistic lock conflict
 *         message.warning(error.message);
 *       } else {
 *         message.error(error.message);
 *       }
 *     }
 *   });
 * };
 * ```
 */
export function useUpdateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storeId, data }: UpdateStoreParams) => updateStore(storeId, data),
    onSuccess: () => {
      // Invalidate store list cache to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
    onError: (error: Error) => {
      console.error('Failed to update store:', error);
    },
  });
}

export default useUpdateStore;
