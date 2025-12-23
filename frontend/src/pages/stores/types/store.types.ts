/**
 * Store Management Types
 *
 * Type definitions for Store entities matching backend StoreDTO exactly.
 * Based on specs/014-hall-store-backend/data-model.md
 * @updated 022-store-crud 添加CRUD相关类型
 */

/**
 * Store status enumeration (must match backend StoreStatus enum values)
 * @updated 022-store-crud: INACTIVE 替代 disabled
 */
export type StoreStatus = 'active' | 'disabled' | 'inactive';

/**
 * Store status enum for create/update operations
 */
export enum StoreStatusEnum {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

/**
 * Operation type for audit logging
 * @since 022-store-crud
 */
export enum OperationType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  STATUS_CHANGE = 'STATUS_CHANGE',
  DELETE = 'DELETE',
}

/**
 * Store entity interface
 * Matches backend StoreDTO fields exactly (camelCase, lowercase enum values)
 * @updated 020-store-address 添加地址字段
 * @updated 022-store-crud 添加version字段
 */
export interface Store {
  id: string;                    // UUID as string
  code: string | null;           // Optional store code
  name: string;                  // Store name
  region: string | null;         // Region/city (optional, can be null)
  status: StoreStatus;           // Store status (active | inactive)
  version: number;               // 乐观锁版本号 @since 022-store-crud
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
  createdBy?: string | null;     // 创建人ID @since 022-store-crud
  updatedBy?: string | null;     // 最后修改人ID @since 022-store-crud
  // 020-store-address 新增字段
  province?: string | null;      // 省份
  city?: string | null;          // 城市
  district?: string | null;      // 区县
  address?: string | null;       // 详细地址
  phone?: string | null;         // 联系电话
  addressSummary?: string | null; // 地址摘要（派生字段）
  // 023-store-cinema-fields 新增字段
  openingDate?: string | null;    // 开业时间 (ISO date string)
  area?: number | null;           // 面积(平方米)
  hallCount?: number | null;      // 影厅数
  seatCount?: number | null;      // 座位数
}

/**
 * DTO for creating a new store
 * @since 022-store-crud
 */
export interface CreateStoreDTO {
  name: string;           // 门店名称（必填，唯一）
  region: string;         // 所属区域
  city: string;           // 所属城市
  province?: string;      // 所属省份
  district?: string;      // 所属区县
  address: string;        // 详细地址
  phone: string;          // 联系电话
  // 023-store-cinema-fields 新增字段
  openingDate?: string;   // 开业时间 (YYYY-MM-DD)
  area?: number;          // 面积(平方米)
  hallCount?: number;     // 影厅数
  seatCount?: number;     // 座位数
  // status defaults to ACTIVE on server side
}

/**
 * DTO for updating an existing store
 * @since 022-store-crud
 */
export interface UpdateStoreDTO {
  name?: string;          // 门店名称
  region?: string;        // 所属区域
  city?: string;          // 所属城市
  province?: string;      // 所属省份
  district?: string;      // 所属区县
  address?: string;       // 详细地址
  phone?: string;         // 联系电话
  // 023-store-cinema-fields 新增字段
  openingDate?: string;   // 开业时间 (YYYY-MM-DD)
  area?: number;          // 面积(平方米)
  hallCount?: number;     // 影厅数
  seatCount?: number;     // 座位数
  version: number;        // 必填，用于乐观锁
}

/**
 * DTO for toggling store status
 * @since 022-store-crud
 */
export interface ToggleStatusDTO {
  status: StoreStatusEnum;
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
