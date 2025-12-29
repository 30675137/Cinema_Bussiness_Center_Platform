/**
 * Reservation Settings Service
 *
 * API service for store reservation settings operations.
 * Communicates with backend GET /api/stores/{storeId}/reservation-settings endpoint.
 */

import type {
  StoreReservationSettings,
  StoreReservationSettingsResponse,
  UpdateStoreReservationSettingsRequest,
  BatchUpdateStoreReservationSettingsRequest,
  BatchUpdateResult,
} from '../types/reservation-settings.types';

// API base URL from environment or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Get reservation settings for a specific store
 *
 * @param storeId Store ID (UUID string)
 * @returns Promise resolving to StoreReservationSettings object
 */
export async function getStoreReservationSettings(
  storeId: string
): Promise<StoreReservationSettings> {
  const response = await fetch(
    `${API_BASE_URL}/api/stores/${storeId}/reservation-settings`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Reservation settings not found for store: ${storeId}`);
    }
    throw new Error(`Failed to fetch reservation settings: ${response.statusText}`);
  }

  const result: StoreReservationSettingsResponse = await response.json();

  // Return data from ApiResponse wrapper
  return result.data;
}

/**
 * Get reservation settings for all stores
 * This fetches settings for each store individually (can be optimized later with a batch endpoint)
 *
 * @param storeIds Array of store IDs
 * @returns Promise resolving to array of StoreReservationSettings
 */
export async function getAllStoresReservationSettings(
  storeIds: string[]
): Promise<StoreReservationSettings[]> {
  // Fetch settings for all stores in parallel
  const promises = storeIds.map((storeId) =>
    getStoreReservationSettings(storeId).catch((error) => {
      // If a store doesn't have settings, return null (will be filtered out)
      console.warn(`Failed to fetch settings for store ${storeId}:`, error);
      return null;
    })
  );

  const results = await Promise.all(promises);

  // Filter out null results (stores without settings)
  return results.filter(
    (settings): settings is StoreReservationSettings => settings !== null
  );
}

/**
 * Update reservation settings for a specific store
 *
 * @param storeId Store ID (UUID string)
 * @param request Update request
 * @returns Promise resolving to updated StoreReservationSettings
 */
export async function updateStoreReservationSettings(
  storeId: string,
  request: UpdateStoreReservationSettingsRequest
): Promise<StoreReservationSettings> {
  const response = await fetch(
    `${API_BASE_URL}/api/stores/${storeId}/reservation-settings`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    if (response.status === 400) {
      const error = await response.json();
      throw new Error(error.message || 'Validation failed');
    }
    if (response.status === 404) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `预约设置不存在: ${storeId}`);
    }
    throw new Error(`Failed to update reservation settings: ${response.statusText}`);
  }

  const result: StoreReservationSettingsResponse = await response.json();
  return result.data;
}

/**
 * Batch update reservation settings for multiple stores
 *
 * @param request Batch update request
 * @returns Promise resolving to BatchUpdateResult
 */
export async function batchUpdateStoreReservationSettings(
  request: BatchUpdateStoreReservationSettingsRequest
): Promise<BatchUpdateResult> {
  const response = await fetch(
    `${API_BASE_URL}/api/stores/reservation-settings/batch`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    if (response.status === 400) {
      const error = await response.json();
      throw new Error(error.message || 'Validation failed');
    }
    throw new Error(`Failed to batch update reservation settings: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
}

/**
 * Reservation Settings Service object for API calls
 */
export const reservationSettingsService = {
  getStoreReservationSettings,
  getAllStoresReservationSettings,
  updateStoreReservationSettings,
  batchUpdateStoreReservationSettings,
};
