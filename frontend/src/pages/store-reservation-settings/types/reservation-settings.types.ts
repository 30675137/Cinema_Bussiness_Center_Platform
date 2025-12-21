/**
 * Store Reservation Settings Types
 *
 * Type definitions for Store Reservation Settings entities matching backend DTOs exactly.
 * Based on specs/015-store-reservation-settings/data-model.md
 */

/**
 * Store reservation settings entity interface
 * Matches backend StoreReservationSettingsDTO fields exactly
 */
export interface StoreReservationSettings {
  id: string;                    // UUID as string
  storeId: string;               // UUID as string
  isReservationEnabled: boolean; // 是否开放预约
  maxReservationDays: number;    // 可预约天数 (0-365)
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
  updatedBy?: string;            // 最后更新人（可选）
}

/**
 * Update reservation settings request
 * Matches backend UpdateStoreReservationSettingsRequest
 */
export interface UpdateStoreReservationSettingsRequest {
  isReservationEnabled: boolean;
  maxReservationDays: number; // 1-365 when enabled, 0 when disabled
}

/**
 * Batch update reservation settings request
 * Matches backend BatchUpdateStoreReservationSettingsRequest
 */
export interface BatchUpdateStoreReservationSettingsRequest {
  storeIds: string[]; // Array of store UUIDs
  settings: UpdateStoreReservationSettingsRequest;
}

/**
 * Batch update result
 * Matches backend BatchUpdateResult
 */
export interface BatchUpdateResult {
  successCount: number;
  failureCount: number;
  failures: Array<{
    storeId: string;
    error: string;
    message: string;
  }>;
}

/**
 * API Response for single reservation settings (standard format per Constitution 1.3.0)
 */
export interface StoreReservationSettingsResponse {
  data: StoreReservationSettings;
  timestamp: string;
}

/**
 * Query parameters for reservation settings list API (if needed)
 */
export interface ReservationSettingsQueryParams {
  storeId?: string;
  isReservationEnabled?: boolean;
}

