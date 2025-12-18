/**
 * Store Service
 *
 * API service for store management operations.
 * Communicates with backend GET /api/stores endpoint.
 */

import type { Store, StoreQueryParams, StoreListResponse } from '../types/store.types';

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
 * Store Service object for API calls
 */
export const storeService = {
  getStores,
};
