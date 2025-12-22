/**
 * useToggleStoreStatus Hook
 *
 * TanStack Query mutation hook for toggling store status.
 * @since 022-store-crud
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleStoreStatus } from '../services/storeService';
import type { ToggleStatusDTO, Store } from '../types/store.types';

interface ToggleStatusParams {
  storeId: string;
  data: ToggleStatusDTO;
}

/**
 * Hook for toggling store status (ACTIVE <-> INACTIVE)
 * 
 * @example
 * ```tsx
 * const { mutate, isPending } = useToggleStoreStatus();
 * 
 * const handleToggle = (storeId: string, newStatus: StoreStatusEnum) => {
 *   mutate({ storeId, data: { status: newStatus } }, {
 *     onSuccess: () => message.success('状态切换成功'),
 *     onError: (error) => message.error(error.message),
 *   });
 * };
 * ```
 */
export function useToggleStoreStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storeId, data }: ToggleStatusParams) => toggleStoreStatus(storeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
    onError: (error: Error) => {
      console.error('Failed to toggle store status:', error);
    },
  });
}

export default useToggleStoreStatus;
