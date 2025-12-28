/**
 * @spec O003-beverage-order
 * C端饮品订单 API 服务
 */
import Taro from '@tarojs/taro'
import { API_CONFIG } from '../config'

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
 * 统一请求封装
 */
async function request<T>(options: Taro.request.Option): Promise<T> {
  try {
    const token = Taro.getStorageSync('access_token')

    const response = await Taro.request({
      ...options,
      url: `${API_CONFIG.BASE_URL}${options.url}`,
      timeout: API_CONFIG.TIMEOUT,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.header,
      },
    })

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return response.data as T
    }

    // 处理错误响应
    const errorData = response.data as ErrorResponse
    throw new Error(errorData.message || '请求失败')
  } catch (error: any) {
    console.error('API请求失败:', error)
    throw error
  }
}

/**
 * 饮品数据类型
 */
export interface Beverage {
  id: string
  name: string
  description: string
  category: string
  imageUrl: string
  detailImages: string[]
  basePrice: number
  nutritionInfo?: Record<string, any>
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'
  isRecommended: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

/**
 * 饮品规格数据类型
 */
export interface BeverageSpec {
  id: string
  beverageId: string
  specType: 'SIZE' | 'TEMPERATURE' | 'SWEETNESS' | 'TOPPING'
  specName: string
  priceAdjustment: number
  sortOrder: number
}

/**
 * 订单数据类型
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
 * 订单项数据类型
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
 * 创建订单请求
 */
export interface CreateOrderRequest {
  storeId: string
  items: Array<{
    beverageId: string
    selectedSpecs: Record<string, string>
    quantity: number
    customerNote?: string
  }>
  customerNote?: string
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

// ==================== 饮品 API ====================

/**
 * 获取饮品列表
 */
export async function getBeverages(params?: {
  category?: string
  status?: string
}): Promise<ListResponse<Beverage>> {
  return request<ListResponse<Beverage>>({
    url: '/api/beverages',
    method: 'GET',
    data: params,
  })
}

/**
 * 获取饮品详情
 */
export async function getBeverageById(id: string): Promise<ApiResponse<Beverage>> {
  return request<ApiResponse<Beverage>>({
    url: `/api/beverages/${id}`,
    method: 'GET',
  })
}

/**
 * 获取饮品规格列表
 */
export async function getBeverageSpecs(beverageId: string): Promise<ListResponse<BeverageSpec>> {
  return request<ListResponse<BeverageSpec>>({
    url: `/api/beverages/${beverageId}/specs`,
    method: 'GET',
  })
}

// ==================== 订单 API ====================

/**
 * 创建订单
 */
export async function createOrder(request: CreateOrderRequest): Promise<ApiResponse<BeverageOrder>> {
  return request<ApiResponse<BeverageOrder>>({
    url: '/api/beverage-orders',
    method: 'POST',
    data: request,
  })
}

/**
 * 支付订单 (Mock)
 */
export async function payOrder(orderId: string): Promise<ApiResponse<BeverageOrder>> {
  return request<ApiResponse<BeverageOrder>>({
    url: `/api/beverage-orders/${orderId}/pay`,
    method: 'POST',
  })
}

/**
 * 获取订单详情
 */
export async function getOrderById(orderId: string): Promise<ApiResponse<BeverageOrder>> {
  return request<ApiResponse<BeverageOrder>>({
    url: `/api/beverage-orders/${orderId}`,
    method: 'GET',
  })
}

/**
 * 获取订单详情（通过订单号）
 */
export async function getOrderByNumber(orderNumber: string): Promise<ApiResponse<BeverageOrder>> {
  return request<ApiResponse<BeverageOrder>>({
    url: `/api/beverage-orders/by-number/${orderNumber}`,
    method: 'GET',
  })
}

/**
 * 获取我的订单列表
 */
export async function getMyOrders(params?: {
  status?: string
  page?: number
  pageSize?: number
}): Promise<ListResponse<BeverageOrder>> {
  return request<ListResponse<BeverageOrder>>({
    url: '/api/beverage-orders/my',
    method: 'GET',
    data: params,
  })
}

/**
 * 获取订单取餐号
 */
export async function getQueueNumber(orderId: string): Promise<ApiResponse<QueueNumber>> {
  return request<ApiResponse<QueueNumber>>({
    url: `/api/beverage-orders/${orderId}/queue-number`,
    method: 'GET',
  })
}

/**
 * 订单历史查询响应
 * US3: FR-019
 */
export interface OrderHistoryResponse {
  content: BeverageOrder[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

/**
 * 获取订单历史（支持筛选）
 * US3: FR-019
 */
export async function getOrderHistory(params: {
  userId: string
  status?: string
  page?: number
  pageSize?: number
}): Promise<OrderHistoryResponse> {
  const queryParams = new URLSearchParams()
  queryParams.append('userId', params.userId)
  if (params.status) queryParams.append('status', params.status)
  if (params.page) queryParams.append('page', params.page.toString())
  if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString())

  const response = await request<ApiResponse<OrderHistoryResponse>>({
    url: `/api/beverage-orders/history?${queryParams.toString()}`,
    method: 'GET',
  })

  return response.data
}

export default {
  getBeverages,
  getBeverageById,
  getBeverageSpecs,
  createOrder,
  payOrder,
  getOrderById,
  getOrderByNumber,
  getMyOrders,
  getQueueNumber,
  getOrderHistory,
}
