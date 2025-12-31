/**
 * 预约单管理页面类型定义
 */

// 从全局类型重导出
export {
  type ReservationStatus,
  type OperationType,
  type CancelReasonType,
  type ReservationItem,
  type OperationLog,
  type ReservationOrder,
  type ReservationListItem,
  type AddonItemRequest,
  type CreateReservationRequest,
  type ConfirmReservationRequest,
  type CancelReservationRequest,
  type UpdateReservationRequest,
  type ReservationListQueryRequest,
  type ReservationListResponse,
  RESERVATION_STATUS_CONFIG,
  OPERATION_TYPE_CONFIG,
  CANCEL_REASON_TYPE_CONFIG,
} from '@/types/reservationOrder';

// ============== 页面专用类型 ==============

/**
 * 筛选条件表单值
 */
export interface ReservationFilterFormValues {
  orderNumber?: string;
  contactPhone?: string;
  statuses?: string[];
  dateRange?: [string, string];
  createdAtRange?: [string, string];
}

/**
 * 确认预约弹窗 Props
 */
export interface ConfirmOrderModalProps {
  open: boolean;
  orderId: string;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * 取消预约弹窗 Props
 */
export interface CancelOrderModalProps {
  open: boolean;
  orderId: string;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * 编辑预约弹窗 Props
 */
export interface EditOrderModalProps {
  open: boolean;
  order: import('@/types/reservationOrder').ReservationOrder | null;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * 状态徽章 Props
 */
export interface OrderStatusBadgeProps {
  status: import('@/types/reservationOrder').ReservationStatus;
}

/**
 * 筛选组件 Props
 */
export interface OrderFiltersProps {
  onFilterChange: (filters: ReservationFilterFormValues) => void;
  loading?: boolean;
}

/**
 * 操作按钮配置
 */
export interface OrderActionConfig {
  key: string;
  label: string;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

/**
 * 表格行数据类型
 */
export type ReservationTableRecord = import('@/types/reservationOrder').ReservationListItem & {
  key: string;
};
