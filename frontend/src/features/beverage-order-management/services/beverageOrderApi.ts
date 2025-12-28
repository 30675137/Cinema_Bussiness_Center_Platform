/**
 * @spec O003-beverage-order
 * B端饮品订单管理 API 服务
 */
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

/**
 * API 响应格式
 */
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  timestamp: string
}

/**
 * 列表响应格式
 */
export interface ListResponse<T> {
  success: boolean
  data: T[]
  total: number
  page: number
  pageSize: number
  message?: string
}

/**
 * 错误响应格式
 */
export interface ErrorResponse {
  success: false
  error: string
  message: string
  details?: Record<string, any>
  timestamp: string
}

/**
 * 统一请求实例
 */
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 添加 Token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 统一错误处理
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const errorResponse: ErrorResponse = error.response?.data || {
      success: false,
      error: 'NETWORK_ERROR',
      message: error.message || '网络请求失败',
      timestamp: new Date().toISOString(),
    }
    return Promise.reject(errorResponse)
  }
)

/**
 * 饮品订单数据类型
 */
export interface BeverageOrder {
  id: string
  orderNumber: string
  userId: string
  storeId: string
  totalPrice: number
  status: 'PENDING_PAYMENT' | 'PENDING_PRODUCTION' | 'PRODUCING' | 'COMPLETED' | 'DELIVERED' | 'CANCELLED'
  paymentMethod?: string
  transactionId?: string
  paidAt?: string
  productionStartTime?: string
  completedAt?: string
  deliveredAt?: string
  cancelledAt?: string
  customerNote?: string
  createdAt: string
  updatedAt: string
  items?: BeverageOrderItem[]
  queueNumber?: string
}

/**
 * 饮品订单项数据类型
 */
export interface BeverageOrderItem {
  id: string
  orderId: string
  beverageId: string
  beverageName: string
  beverageImageUrl: string
  selectedSpecs: Record<string, string>
  quantity: number
  unitPrice: number
  subtotal: number
  customerNote?: string
}

/**
 * 订单状态流转请求
 */
export interface UpdateOrderStatusRequest {
  status: 'PRODUCING' | 'COMPLETED' | 'DELIVERED' | 'CANCELLED'
  operatorNote?: string
}

/**
 * 取餐号数据类型
 */
export interface QueueNumber {
  id: string
  storeId: string
  orderId: string
  queueNumber: string
  date: string
  sequence: number
  status: 'ACTIVE' | 'CALLED' | 'COMPLETED'
  createdAt: string
}

// ==================== 订单管理 API ====================

/**
 * 获取订单列表（支持筛选）
 */
export async function getOrders(params?: {
  storeId?: string
  status?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}): Promise<ListResponse<BeverageOrder>> {
  return axiosInstance.get('/api/beverage-orders', { params })
}

/**
 * 获取订单详情
 */
export async function getOrderById(orderId: string): Promise<ApiResponse<BeverageOrder>> {
  return axiosInstance.get(`/api/beverage-orders/${orderId}`)
}

/**
 * 获取订单详情（通过订单号）
 */
export async function getOrderByNumber(orderNumber: string): Promise<ApiResponse<BeverageOrder>> {
  return axiosInstance.get(`/api/beverage-orders/by-number/${orderNumber}`)
}

/**
 * 更新订单状态
 */
export async function updateOrderStatus(
  orderId: string,
  request: UpdateOrderStatusRequest
): Promise<ApiResponse<BeverageOrder>> {
  return axiosInstance.patch(`/api/beverage-orders/${orderId}/status`, request)
}

/**
 * 开始制作订单
 */
export async function startProduction(orderId: string): Promise<ApiResponse<BeverageOrder>> {
  return axiosInstance.post(`/api/beverage-orders/${orderId}/start-production`)
}

/**
 * 完成制作
 */
export async function completeProduction(orderId: string): Promise<ApiResponse<BeverageOrder>> {
  return axiosInstance.post(`/api/beverage-orders/${orderId}/complete-production`)
}

/**
 * 标记为已交付
 */
export async function markAsDelivered(orderId: string): Promise<ApiResponse<BeverageOrder>> {
  return axiosInstance.post(`/api/beverage-orders/${orderId}/deliver`)
}

/**
 * 取消订单
 */
export async function cancelOrder(
  orderId: string,
  reason?: string
): Promise<ApiResponse<BeverageOrder>> {
  return axiosInstance.post(`/api/beverage-orders/${orderId}/cancel`, { reason })
}

/**
 * 叫号
 */
export async function callQueue(orderId: string): Promise<ApiResponse<QueueNumber>> {
  return axiosInstance.post(`/api/beverage-orders/${orderId}/call-queue`)
}

/**
 * 获取待处理订单数量
 */
export async function getPendingOrderCount(storeId?: string): Promise<ApiResponse<number>> {
  return axiosInstance.get('/api/beverage-orders/pending-count', {
    params: { storeId },
  })
}

/**
 * 获取今日订单统计
 */
export async function getTodayOrderStats(storeId?: string): Promise<
  ApiResponse<{
    totalOrders: number
    totalRevenue: number
    completedOrders: number
    cancelledOrders: number
  }>
> {
  return axiosInstance.get('/api/beverage-orders/today-stats', {
    params: { storeId },
  })
}

export default {
  getOrders,
  getOrderById,
  getOrderByNumber,
  updateOrderStatus,
  startProduction,
  completeProduction,
  markAsDelivered,
  cancelOrder,
  callQueue,
  getPendingOrderCount,
  getTodayOrderStats,
}
