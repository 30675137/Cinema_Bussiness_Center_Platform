/**
 * Store Service
 *
 * API service for store management operations.
 * Communicates with backend /api/stores endpoints.
 * @updated 022-store-crud 添加CRUD操作方法
 */

import type {
  Store,
  StoreQueryParams,
  CreateStoreDTO,
  UpdateStoreDTO,
  ToggleStatusDTO,
} from '../types/store.types';

// API base URL from environment or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Get list of all stores
 *
 * @param params Query parameters (optional status filter)
 * @returns Promise resolving to array of Store objects
 */
export async function getStores(params?: StoreQueryParams): Promise<Store[]> {
  const url = new URL(`${API_BASE_URL}/api/stores`);

  // Add query parameters
  if (params?.status) {
    url.searchParams.append('status', params.status);
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch stores: ${response.statusText}`);
  }

  // Backend returns format: { data, total }
  // StoreQueryController returns Map.of("data", stores, "total", stores.size())
  const result = await response.json();

  // Handle both formats: { data, total } or { success, data, total, message, code }
  if (result.success === false) {
    throw new Error(result.message || 'Failed to fetch stores');
  }

  // Return data array (compatible with both formats)
  return result.data || [];
}

/**
 * Create a new store
 * @since 022-store-crud
 * @param data Store creation data
 * @returns Promise resolving to created Store object
 */
export async function createStore(data: CreateStoreDTO): Promise<Store> {
  const response = await fetch(`${API_BASE_URL}/api/stores`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || `创建门店失败: ${response.statusText}`;

    // 409 Conflict: 名称重复
    if (response.status === 409) {
      throw new Error(errorData.message || '门店名称已存在');
    }
    throw new Error(errorMessage);
  }

  const result = await response.json();
  return result.data || result;
}

/**
 * Update an existing store
 * @since 022-store-crud
 * @param storeId Store ID
 * @param data Store update data (must include version for optimistic locking)
 * @returns Promise resolving to updated Store object
 */
export async function updateStore(storeId: string, data: UpdateStoreDTO): Promise<Store> {
  const response = await fetch(`${API_BASE_URL}/api/stores/${storeId}/full`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    // 409 Conflict: 名称重复或乐观锁冲突
    if (response.status === 409) {
      throw new Error(errorData.message || '门店信息已被他人修改，请刷新后重试');
    }
    // 404 Not Found
    if (response.status === 404) {
      throw new Error('门店不存在');
    }
    throw new Error(errorData.message || `更新门店失败: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data || result;
}

/**
 * Toggle store status (ACTIVE <-> INACTIVE)
 * @since 022-store-crud
 * @param storeId Store ID
 * @param data Status toggle data
 * @returns Promise resolving to updated Store object
 */
export async function toggleStoreStatus(storeId: string, data: ToggleStatusDTO): Promise<Store> {
  const response = await fetch(`${API_BASE_URL}/api/stores/${storeId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 404) {
      throw new Error('门店不存在');
    }
    throw new Error(errorData.message || `状态切换失败: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data || result;
}

/**
 * Delete a store
 * @since 022-store-crud
 * @param storeId Store ID
 * @returns Promise resolving when deletion is complete
 */
export async function deleteStore(storeId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/stores/${storeId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    // 409 Conflict: 存在依赖关系
    if (response.status === 409) {
      throw new Error(errorData.message || '无法删除门店，请先删除关联的影厅');
    }
    // 404 Not Found
    if (response.status === 404) {
      throw new Error('门店不存在');
    }
    throw new Error(errorData.message || `删除门店失败: ${response.statusText}`);
  }
}

/**
 * Store Service object for API calls
 */
export const storeService = {
  getStores,
  createStore,
  updateStore,
  toggleStoreStatus,
  deleteStore,
};
