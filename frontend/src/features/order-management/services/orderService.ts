/**
 * @spec O001-product-order-list
 * @spec O003-beverage-order
 * 订单管理 API 服务（支持统一订单查询）
 */

import type {
  OrderQueryParams,
  OrderListResponse,
  UnifiedOrderListResponse,
  OrderDetailResponse,
  UpdateStatusRequest,
  ApiErrorResponse
} from '../types/order'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

/**
 * 构建查询参数字符串
 */
const buildQueryString = (params: OrderQueryParams): string => {
  const searchParams = new URLSearchParams()

  if (params.page) searchParams.append('page', params.page.toString())
  if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString())
  if (params.status) searchParams.append('status', params.status)
  if (params.startDate) searchParams.append('startDate', params.startDate)
  if (params.endDate) searchParams.append('endDate', params.endDate)
  if (params.search) searchParams.append('search', params.search)
  if (params.sortBy) searchParams.append('sortBy', params.sortBy)
  if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder)

  return searchParams.toString()
}

/**
 * 获取统一订单列表（包含商品订单和饮品订单）
 * @param params 查询参数
 * @returns 统一订单列表响应
 */
export const fetchOrders = async (
  params: OrderQueryParams = {}
): Promise<UnifiedOrderListResponse> => {
  const queryString = buildQueryString(params)
  const url = `${API_BASE_URL}/orders${queryString ? `?${queryString}` : ''}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // TODO: Add Authorization header when auth is implemented
      // 'Authorization': `Bearer ${getToken()}`
    }
  })

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json()
    throw new Error(errorData.message || '获取订单列表失败')
  }

  return response.json()
}

/**
 * 获取订单详情
 * @param orderId 订单ID
 * @returns 订单详情响应
 */
export const fetchOrderDetail = async (orderId: string): Promise<OrderDetailResponse> => {
  const url = `${API_BASE_URL}/orders/${orderId}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // TODO: Add Authorization header when auth is implemented
      // 'Authorization': `Bearer ${getToken()}`
    }
  })

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json()
    throw new Error(errorData.message || '获取订单详情失败')
  }

  return response.json()
}

/**
 * 更新订单状态
 * @param orderId 订单ID
 * @param request 更新请求
 * @returns 更新后的订单详情
 */
export const updateOrderStatus = async (
  orderId: string,
  request: UpdateStatusRequest
): Promise<OrderDetailResponse> => {
  const url = `${API_BASE_URL}/orders/${orderId}/status`

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      // TODO: Add Authorization header when auth is implemented
      // 'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(request)
  })

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json()
    throw new Error(errorData.message || '更新订单状态失败')
  }

  return response.json()
}

export default {
  fetchOrders,
  fetchOrderDetail,
  updateOrderStatus
}
