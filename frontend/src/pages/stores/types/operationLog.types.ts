/**
 * Store Operation Log Types
 *
 * Type definitions for store operation audit logs
 * @since 022-store-crud
 */

import { OperationType } from './store.types';

/**
 * Store operation log entity interface
 */
export interface StoreOperationLog {
  id: string; // UUID
  storeId: string; // 关联的门店ID
  operationType: OperationType; // 操作类型
  operatorId?: string | null; // 操作人ID
  operatorName?: string | null; // 操作人名称
  beforeValue?: Record<string, unknown> | null; // 修改前的值（JSONB）
  afterValue: Record<string, unknown>; // 修改后的值（JSONB）
  operationTime: string; // 操作时间（ISO 8601）
  ipAddress?: string | null; // 操作IP地址
  remark?: string | null; // 备注
}

/**
 * API Response for operation log list
 */
export interface OperationLogListResponse {
  success: boolean;
  data: StoreOperationLog[];
  total: number;
  message: string;
  code: number;
}

/**
 * Query parameters for operation log list
 */
export interface OperationLogQueryParams {
  storeId?: string;
  operationType?: OperationType;
  page?: number;
  pageSize?: number;
}
