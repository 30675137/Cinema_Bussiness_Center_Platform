/**
 * Store Management Types
 *
 * Type definitions for Store entities matching backend StoreDTO exactly.
 * Based on specs/014-hall-store-backend/data-model.md
 */

/**
 * Store status enumeration (must match backend StoreStatus enum values)
 */
export type StoreStatus = 'active' | 'disabled';

/**
 * Store entity interface
 * Matches backend StoreDTO fields exactly (camelCase, lowercase enum values)
 */
export interface Store {
  id: string;                    // UUID as string
  code: string | null;           // Optional store code
  name: string;                  // Store name
  region: string | null;         // Region/city (optional, can be null)
  status: StoreStatus;           // Store status (active | disabled)
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
}

/**
 * API Response for store list (standard format per research.md Decision 8)
 */
export interface StoreListResponse {
  success: boolean;
  data: Store[];
  total: number;
  message: string;
  code: number;
}

/**
 * Query parameters for store list API
 */
export interface StoreQueryParams {
  status?: StoreStatus;
}

/**
 * Client-side pagination state for store table
 */
export interface StorePaginationState {
  current: number;
  pageSize: number;
  total: number;
}

/**
 * Store table filter state
 */
export interface StoreFilterState {
  searchText: string;
  status: StoreStatus | 'all';
}
