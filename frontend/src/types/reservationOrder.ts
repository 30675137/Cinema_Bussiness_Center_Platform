/**
 * 预约单相关类型定义
 * 与后端 DTO 保持一致
 */

// ============== 枚举类型 ==============

/**
 * 预约单状态
 */
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

/**
 * 操作类型
 */
export type OperationType = 'CREATE' | 'CONFIRM' | 'CANCEL' | 'UPDATE' | 'PAYMENT';

/**
 * 取消原因类型
 */
export type CancelReasonType =
  | 'RESOURCE_CONFLICT'
  | 'CUSTOMER_REQUEST'
  | 'TIME_ADJUSTMENT'
  | 'OTHER';

// ============== 状态配置 ==============

/**
 * 预约单状态配置
 */
export const RESERVATION_STATUS_CONFIG: Record<
  ReservationStatus,
  {
    label: string;
    color: string;
    badgeStatus: 'default' | 'processing' | 'success' | 'error' | 'warning';
  }
> = {
  PENDING: { label: '待确认', color: 'gold', badgeStatus: 'warning' },
  CONFIRMED: { label: '已确认', color: 'blue', badgeStatus: 'processing' },
  COMPLETED: { label: '已完成', color: 'green', badgeStatus: 'success' },
  CANCELLED: { label: '已取消', color: 'default', badgeStatus: 'default' },
};

/**
 * 操作类型配置
 */
export const OPERATION_TYPE_CONFIG: Record<OperationType, { label: string }> = {
  CREATE: { label: '创建预约' },
  CONFIRM: { label: '确认预约' },
  CANCEL: { label: '取消预约' },
  UPDATE: { label: '修改信息' },
  PAYMENT: { label: '完成支付' },
};

/**
 * 取消原因类型配置
 */
export const CANCEL_REASON_TYPE_CONFIG: Record<CancelReasonType, { label: string }> = {
  RESOURCE_CONFLICT: { label: '资源冲突' },
  CUSTOMER_REQUEST: { label: '客户要求取消' },
  TIME_ADJUSTMENT: { label: '时段调整' },
  OTHER: { label: '其他' },
};

// ============== 数据接口 ==============

/**
 * 预约单加购项明细
 */
export interface ReservationItem {
  id: string;
  addonItemId: string;
  addonItemName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

/**
 * 操作日志
 */
export interface OperationLog {
  id: string;
  operationType: OperationType;
  operationTypeDisplayName: string;
  operatorId?: string;
  operatorName?: string;
  operatedAt: string;
  reason?: string;
  previousStatus?: string;
  newStatus?: string;
  extraData?: Record<string, unknown>;
}

/**
 * 预约单详情
 */
export interface ReservationOrder {
  id: string;
  orderNumber: string;
  userId: string;
  scenarioPackageId: string;
  scenarioPackageName: string;
  packageTierId: string;
  packageTierName: string;
  timeSlotTemplateId: string;
  reservationDate: string;
  reservationTime: string;
  reservationEndTime: string;
  contactName: string;
  contactPhone: string;
  remark?: string;
  totalAmount: number;
  status: ReservationStatus;
  statusDisplayName: string;
  requiresPayment: boolean;
  paymentId?: string;
  paymentTime?: string;
  cancelReason?: string;
  cancelledAt?: string;
  items: ReservationItem[];
  operationLogs?: OperationLog[];
  createdAt: string;
  updatedAt: string;
}

/**
 * 预约单列表项 (简化版)
 */
export interface ReservationListItem {
  id: string;
  orderNumber: string;
  scenarioPackageName: string;
  packageTierName: string;
  reservationDate: string;
  reservationTime: string;
  reservationEndTime: string;
  contactName: string;
  contactPhone: string;
  totalAmount: number;
  status: ReservationStatus;
  statusDisplayName: string;
  requiresPayment: boolean;
  createdAt: string;
}

// ============== 请求接口 ==============

/**
 * 创建预约请求 - 加购项
 */
export interface AddonItemRequest {
  addonItemId: string;
  quantity: number;
}

/**
 * 创建预约请求 (C端)
 */
export interface CreateReservationRequest {
  scenarioPackageId: string;
  packageTierId: string;
  timeSlotTemplateId: string;
  reservationDate: string;
  contactName: string;
  contactPhone: string;
  remark?: string;
  addonItems?: AddonItemRequest[];
}

/**
 * 确认预约请求 (B端)
 */
export interface ConfirmReservationRequest {
  requiresPayment: boolean;
  remark?: string;
}

/**
 * 取消预约请求 (B端)
 */
export interface CancelReservationRequest {
  cancelReasonType?: CancelReasonType;
  cancelReason: string;
}

/**
 * 修改预约请求 (B端)
 */
export interface UpdateReservationRequest {
  contactName?: string;
  contactPhone?: string;
  remark?: string;
}

/**
 * 预约单列表查询请求 (B端)
 */
export interface ReservationListQueryRequest {
  orderNumber?: string;
  contactPhone?: string;
  statuses?: ReservationStatus[];
  scenarioPackageId?: string;
  reservationDateStart?: string;
  reservationDateEnd?: string;
  createdAtStart?: string;
  createdAtEnd?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// ============== 响应接口 ==============

/**
 * 预约单列表响应
 */
export interface ReservationListResponse {
  content: ReservationListItem[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
