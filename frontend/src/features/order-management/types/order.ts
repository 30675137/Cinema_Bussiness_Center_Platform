/**
 * @spec O001-product-order-list
 * 订单相关的 TypeScript 类型定义
 */

export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum LogAction {
  CREATE_ORDER = 'CREATE_ORDER',
  PAYMENT = 'PAYMENT',
  SHIP = 'SHIP',
  COMPLETE = 'COMPLETE',
  CANCEL = 'CANCEL',
  SYSTEM_AUTO = 'SYSTEM_AUTO'
}

export interface ShippingAddress {
  province: string
  city: string
  district: string
  detail: string
}

export interface ProductOrder {
  id: string
  orderNumber: string
  userId: string
  status: OrderStatus
  productTotal: number
  shippingFee: number
  discountAmount: number
  totalAmount: number
  shippingAddress: ShippingAddress | null
  paymentMethod: string | null
  paymentTime: string | null
  shippedTime: string | null
  completedTime: string | null
  cancelledTime: string | null
  cancelReason: string | null
  createdAt: string
  updatedAt: string
  version: number

  // 关联数据
  items?: OrderItem[]
  logs?: OrderLog[]
  user?: User
  productSummary?: string
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  productName: string
  productSpec: string | null
  productImage: string | null
  quantity: number
  unitPrice: number
  subtotal: number
  createdAt: string
}

export interface OrderLog {
  id: string
  orderId: string
  action: LogAction
  statusBefore: OrderStatus | null
  statusAfter: OrderStatus | null
  operatorId: string
  operatorName: string
  comments: string | null
  createdAt: string
}

export interface User {
  id: string
  username: string
  phone: string
  province: string | null
  city: string | null
  district: string | null
  address: string | null
}

export interface OrderQueryParams {
  page?: number
  pageSize?: number
  status?: OrderStatus
  startDate?: string
  endDate?: string
  search?: string
  sortBy?: 'createdAt' | 'totalAmount'
  sortOrder?: 'asc' | 'desc'
}

export interface OrderListResponse {
  success: boolean
  data: ProductOrder[]
  total: number
  page: number
  pageSize: number
  message?: string
  timestamp: string
}

export interface OrderDetailResponse {
  success: boolean
  data: ProductOrder
  message?: string
  timestamp: string
}

export interface UpdateStatusRequest {
  status: OrderStatus
  version: number
  cancelReason?: string
}

export interface ApiErrorResponse {
  success: false
  error: string
  message: string
  details?: Record<string, any>
  timestamp: string
}
