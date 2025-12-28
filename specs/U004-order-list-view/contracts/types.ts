/**
 * @spec U004-order-list-view
 * Shared TypeScript types for Order List & Status View feature
 *
 * **Type Reuse Strategy**:
 * - Core domain types (ReservationOrder, ReservationItem, etc.) are REUSED from U001
 * - Only U004-specific filter/UI types are defined here
 * - Import U001 types from `@/types/reservationOrder` to avoid duplication
 */

import type {
  ReservationOrder,
  ReservationItem,
  ReservationStatus,
  OperationLog,
  OperationType,
  ReservationListQueryRequest,
  ReservationListResponse,
  ConfirmReservationRequest,
  CancelReservationRequest,
  CancelReasonType,
} from '@/types/reservationOrder'

// Re-export U001 types for convenience
export type {
  ReservationOrder,
  ReservationItem,
  ReservationStatus,
  OperationLog,
  OperationType,
  ReservationListQueryRequest,
  ReservationListResponse,
  ConfirmReservationRequest,
  CancelReservationRequest,
  CancelReasonType,
}

// ========================================
// U004-Specific Types (Frontend State)
// ========================================

/**
 * 时间范围类型
 */
export type TimeRangeType = 'all' | 'today' | 'last7days' | 'last30days' | 'custom'

/**
 * 自定义时间范围
 */
export interface CustomTimeRange {
  start: string // YYYY-MM-DD
  end: string // YYYY-MM-DD
}

/**
 * 订单列表筛选状态 (Zustand store)
 *
 * **Usage**: Managed by `useOrderListFilterStore`
 */
export interface OrderListFilterState {
  // Filter values
  selectedStatuses: ReservationStatus[]
  timeRangeType: TimeRangeType
  customTimeRange?: CustomTimeRange
  phoneSearch: string // Sanitized (digits only)

  // Actions
  setSelectedStatuses: (statuses: ReservationStatus[]) => void
  setTimeRangeType: (type: TimeRangeType) => void
  setCustomTimeRange: (start: string, end: string) => void
  setPhoneSearch: (phone: string) => void
  resetFilters: () => void
}

/**
 * 订单详情抽屉状态 (Component local state)
 *
 * **Usage**: useState in OrderListPage component
 */
export interface OrderDetailDrawerState {
  visible: boolean
  orderId: string | null
}

/**
 * 分页状态 (TanStack Query managed)
 *
 * **Usage**: Derived from API response and query params
 */
export interface PaginationState {
  page: number // Current page (1-based)
  pageSize: number // Items per page
  total: number // Total items
  totalPages: number // Total pages
}

/**
 * 订单列表查询参数 (Frontend to Backend)
 *
 * **Usage**: Converted from FilterState + PaginationState
 */
export interface OrderListQueryParams extends ReservationListQueryRequest {
  // All fields from ReservationListQueryRequest
  // No additional fields needed for U004
}

/**
 * 表格列配置
 */
export interface OrderTableColumn {
  key: string
  title: string
  dataIndex?: string
  width?: number
  fixed?: 'left' | 'right'
  sorter?: boolean
  render?: (value: any, record: ReservationOrder) => React.ReactNode
}

/**
 * 订单状态配置
 *
 * **Source**: Reused from U001 `RESERVATION_STATUS_CONFIG`
 */
export interface OrderStatusConfig {
  label: string
  color: string
  badgeStatus: 'default' | 'processing' | 'success' | 'error' | 'warning'
}

/**
 * 时间范围选项配置
 */
export interface TimeRangeOption {
  value: TimeRangeType
  label: string
  getDates: () => { start?: string; end?: string } // Returns YYYY-MM-DD
}

/**
 * API 响应格式 (Generic)
 */
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  timestamp?: string
}

/**
 * API 错误响应
 */
export interface ErrorResponse {
  success: false
  error: string // Error code
  message: string // User-friendly message
  details?: Record<string, any>
  timestamp: string
}

// ========================================
// Utility Types
// ========================================

/**
 * Order list table row type
 *
 * **Usage**: Ant Design Table<OrderTableRow>
 */
export type OrderTableRow = ReservationOrder

/**
 * Order detail drawer props
 */
export interface OrderDetailDrawerProps {
  visible: boolean
  orderId: string | null
  onClose: () => void
  onOrderUpdated?: () => void // Callback when order status changes
}

/**
 * Filter bar props
 */
export interface FilterBarProps {
  selectedStatuses: ReservationStatus[]
  onStatusChange: (statuses: ReservationStatus[]) => void
  onReset: () => void
}

/**
 * Search bar props
 */
export interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

/**
 * Time range filter props
 */
export interface TimeRangeFilterProps {
  timeRangeType: TimeRangeType
  customTimeRange?: CustomTimeRange
  onTimeRangeChange: (type: TimeRangeType) => void
  onCustomRangeChange: (start: string, end: string) => void
}

/**
 * Order status tag props
 */
export interface OrderStatusTagProps {
  status: ReservationStatus
}

/**
 * Order action buttons props
 */
export interface OrderActionButtonsProps {
  order: ReservationOrder
  onConfirm: (orderId: string, requiresPayment: boolean) => void
  onCancel: (orderId: string, reason: string, reasonType?: string) => void
  loading?: boolean
}

// ========================================
// Validation Schemas (Zod)
// ========================================

/**
 * Phone search input schema
 *
 * **Usage**: Validate and sanitize phone number input
 */
export const phoneSearchSchema = {
  pattern: /^\d*$/,
  maxLength: 11,
  transform: (value: string) => value.replace(/\D/g, ''), // Strip non-digits
}

/**
 * Custom time range schema
 *
 * **Usage**: Validate custom date range input
 */
export const timeRangeSchema = {
  datePattern: /^\d{4}-\d{2}-\d{2}$/,
  validate: (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const today = new Date()

    if (startDate > endDate) {
      return { valid: false, error: '开始日期不能晚于结束日期' }
    }
    if (endDate > today) {
      return { valid: false, error: '结束日期不能晚于今天' }
    }
    return { valid: true }
  },
}

// ========================================
// Type Guards
// ========================================

/**
 * Check if order status allows confirmation
 */
export function canConfirmOrder(order: ReservationOrder): boolean {
  return order.status === 'PENDING'
}

/**
 * Check if order status allows cancellation
 */
export function canCancelOrder(order: ReservationOrder): boolean {
  return order.status === 'PENDING' || order.status === 'CONFIRMED'
}

/**
 * Type guard for successful API response
 */
export function isSuccessResponse<T>(
  response: ApiResponse<T> | ErrorResponse
): response is ApiResponse<T> {
  return response.success === true
}

/**
 * Type guard for error response
 */
export function isErrorResponse(response: ApiResponse | ErrorResponse): response is ErrorResponse {
  return response.success === false
}

// ========================================
// Constants
// ========================================

/**
 * Default pagination settings
 */
export const DEFAULT_PAGINATION = {
  page: 1,
  pageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
} as const

/**
 * Time range options configuration
 */
export const TIME_RANGE_OPTIONS: TimeRangeOption[] = [
  {
    value: 'all',
    label: '全部',
    getDates: () => ({}),
  },
  {
    value: 'today',
    label: '今天',
    getDates: () => {
      const today = new Date().toISOString().split('T')[0]
      return { start: today, end: today }
    },
  },
  {
    value: 'last7days',
    label: '最近7天',
    getDates: () => {
      const end = new Date()
      const start = new Date(end)
      start.setDate(start.getDate() - 6)
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      }
    },
  },
  {
    value: 'last30days',
    label: '最近30天',
    getDates: () => {
      const end = new Date()
      const start = new Date(end)
      start.setDate(start.getDate() - 29)
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      }
    },
  },
  {
    value: 'custom',
    label: '自定义范围',
    getDates: () => ({}), // User provides custom dates
  },
]

/**
 * Table column keys
 */
export const TABLE_COLUMNS = {
  ORDER_NUMBER: 'orderNumber',
  CONTACT_NAME: 'contactName',
  CONTACT_PHONE: 'contactPhone',
  SCENARIO_PACKAGE: 'scenarioPackageName',
  RESERVATION_TIME: 'reservationTime',
  STATUS: 'status',
  TOTAL_AMOUNT: 'totalAmount',
  CREATED_AT: 'createdAt',
  ACTIONS: 'actions',
} as const

/**
 * Query stale time (30 seconds)
 */
export const QUERY_STALE_TIME = 30 * 1000

/**
 * Query cache time (5 minutes)
 */
export const QUERY_CACHE_TIME = 5 * 60 * 1000

/**
 * Phone search debounce delay (500ms)
 */
export const PHONE_SEARCH_DEBOUNCE = 500
