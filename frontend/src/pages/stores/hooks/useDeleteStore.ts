/**
 * useDeleteStore Hook
 *
 * TanStack Query mutation hook for deleting a store.
 * @since 022-store-crud
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteStore } from '../services/storeService';

/**
 * Hook for deleting a store
 * 
 * @example
 * ```tsx
 * const { mutate, isPending } = useDeleteStore();
 * 
 * const handleDelete = (storeId: string) => {
 *   Modal.confirm({
 *     title: '确认删除',
 *     content: '删除后无法恢复，确定要删除此门店吗？',
 *     onOk: () => {
 *       mutate(storeId, {
 *         onSuccess: () => message.success('门店删除成功'),
 *         onError: (error) => message.error(error.message),
 *       });
 *     },
 *   });
 * };
 * ```
 */
export function useDeleteStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
    onError: (error: Error) => {
      console.error('Failed to delete store:', error);
    },
  });
}

export default useDeleteStore;
