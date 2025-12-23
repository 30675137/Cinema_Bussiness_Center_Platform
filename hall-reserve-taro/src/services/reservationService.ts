/**
 * 预约单API服务
 * 封装C端预约单相关的API调用
 */
import Taro from '@tarojs/taro'
import type {
  ApiResponse,
  CreateReservationRequest,
  ReservationOrder,
  ReservationListItem,
  PageResponse,
} from './types/reservation.types'

// API基础URL - H5环境直接使用默认值
const API_BASE_URL = 'http://localhost:8080'

/**
 * 获取JWT Token
 */
function getToken(): string | null {
  return Taro.getStorageSync('access_token')
}

/**
 * 统一请求封装
 */
async function request<T>(options: {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: unknown
  showError?: boolean
}): Promise<T> {
  const { url, method, data, showError = true } = options
  const token = getToken()

  try {
    const response = await Taro.request({
      url: `${API_BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    // HTTP状态码检查
    if (response.statusCode === 401) {
      // Token过期，跳转登录
      Taro.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
      Taro.removeStorageSync('access_token')
      Taro.navigateTo({ url: '/pages/login/index' })
      throw new Error('Unauthorized')
    }

    if (response.statusCode >= 400) {
      const errorData = response.data as { message?: string; code?: string }
      const errorMessage = errorData.message || '请求失败'
      if (showError) {
        Taro.showToast({ title: errorMessage, icon: 'none' })
      }
      throw new Error(errorMessage)
    }

    // 解析API响应
    const apiResponse = response.data as ApiResponse<T>
    if (apiResponse.success === false) {
      const errorMessage = apiResponse.message || '请求失败'
      if (showError) {
        Taro.showToast({ title: errorMessage, icon: 'none' })
      }
      throw new Error(errorMessage)
    }

    return apiResponse.data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('网络请求失败')
  }
}

/**
 * 创建预约
 * @param data 预约请求数据
 * @returns 创建的预约单信息
 */
export async function createReservation(
  data: CreateReservationRequest
): Promise<ReservationOrder> {
  return request<ReservationOrder>({
    url: '/api/reservations',
    method: 'POST',
    data,
  })
}

/**
 * 获取我的预约列表
 * @param params 查询参数
 * @returns 分页预约列表
 */
export async function getMyReservations(params?: {
  page?: number
  size?: number
  status?: string
}): Promise<PageResponse<ReservationListItem>> {
  const queryParams = new URLSearchParams()
  if (params?.page !== undefined) queryParams.set('page', String(params.page))
  if (params?.size !== undefined) queryParams.set('size', String(params.size))
  if (params?.status) queryParams.set('status', params.status)

  const queryString = queryParams.toString()
  const url = `/api/reservations/my${queryString ? `?${queryString}` : ''}`

  return request<PageResponse<ReservationListItem>>({
    url,
    method: 'GET',
  })
}

/**
 * 获取预约单详情
 * @param id 预约单ID
 * @returns 预约单详情
 */
export async function getReservationDetail(id: string): Promise<ReservationOrder> {
  return request<ReservationOrder>({
    url: `/api/reservations/${id}`,
    method: 'GET',
  })
}

/**
 * 根据预约单号获取详情
 * @param orderNumber 预约单号
 * @returns 预约单详情
 */
export async function getReservationByOrderNumber(
  orderNumber: string
): Promise<ReservationOrder> {
  return request<ReservationOrder>({
    url: `/api/reservations/order-number/${orderNumber}`,
    method: 'GET',
  })
}

/**
 * 取消预约（用户自行取消）
 * @param id 预约单ID
 * @param reason 取消原因
 * @returns 更新后的预约单
 */
export async function cancelMyReservation(
  id: string,
  reason: string
): Promise<ReservationOrder> {
  return request<ReservationOrder>({
    url: `/api/reservations/${id}/cancel`,
    method: 'POST',
    data: { cancelReason: reason },
  })
}

/**
 * 预约服务对象
 */
export const reservationService = {
  createReservation,
  getMyReservations,
  getReservationDetail,
  getReservationByOrderNumber,
  cancelMyReservation,
}

export default reservationService
