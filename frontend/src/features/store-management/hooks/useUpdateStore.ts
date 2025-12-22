/**
 * useUpdateStore Hook
 *
 * TanStack Query mutation hook for updating store address information.
 *
 * @since 020-store-address
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type { Store } from '../../../pages/stores/types/store.types';
import { storeKeys } from '../../../pages/stores/hooks/useStoresQuery';
import type { AddressFormData } from '../components/AddressForm';

// API base URL from environment or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Update store address request payload
 */
export interface UpdateStoreAddressPayload extends AddressFormData {
  // AddressFormData already has province, city, district, address, phone
}

/**
 * API Response for store update
 */
interface UpdateStoreResponse {
  success: boolean;
  data?: Store;
  message?: string;
  error?: string;
}

/**
 * Update store address API call
 */
async function updateStoreAddress(
  storeId: string,
  payload: UpdateStoreAddressPayload
): Promise<Store> {
  const response = await fetch(`${API_BASE_URL}/api/stores/${storeId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `更新门店地址失败: ${response.statusText}`);
  }

  const result: UpdateStoreResponse = await response.json();

  if (result.success === false) {
    throw new Error(result.message || result.error || '更新门店地址失败');
  }

  if (!result.data) {
    throw new Error('更新成功但返回数据为空');
  }

  return result.data;
}

/**
 * Hook for updating store address
 *
 * Usage:
 * ```tsx
 * const { mutate, isPending } = useUpdateStore();
 * mutate({ storeId: 'xxx', data: { province: '北京市', city: '北京市', district: '朝阳区' } });
 * ```
 */
export function useUpdateStore() {
  const queryClient = useQueryClient();

  return useMutation<
    Store,
    Error,
    { storeId: string; data: UpdateStoreAddressPayload }
  >({
    mutationFn: async ({ storeId, data }) => {
      return updateStoreAddress(storeId, data);
    },
    onSuccess: (updatedStore) => {
      // Invalidate store list queries to refetch with updated data
      queryClient.invalidateQueries({ queryKey: storeKeys.all });
      message.success('门店地址更新成功');
    },
    onError: (error) => {
      message.error(error.message || '更新门店地址失败');
    },
  });
}

export default useUpdateStore;
