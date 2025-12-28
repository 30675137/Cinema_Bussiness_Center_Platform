/**
 * 预约单API服务
 * 封装C端预约单相关的API调用
 */
import { request } from '../utils/request'
import type {
  CreateReservationRequest,
  ReservationOrder,
  ReservationListItem,
  PageResponse,
} from './types/reservation.types'

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
    requiresAuth: true, // 需要登录
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
  console.log('[ReservationService] getMyReservations called with params:', params)
  const queryParams = new URLSearchParams()
  if (params?.page !== undefined) queryParams.set('page', String(params.page))
  if (params?.size !== undefined) queryParams.set('size', String(params.size))
  if (params?.status) queryParams.set('status', params.status)

  const queryString = queryParams.toString()
  const url = `/api/reservations/my${queryString ? `?${queryString}` : ''}`
  console.log('[ReservationService] Request URL:', url)

  const result = await request<PageResponse<ReservationListItem>>({
    url,
    method: 'GET',
    requiresAuth: true, // 需要登录
  })
  console.log('[ReservationService] Response:', result)
  return result
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
    requiresAuth: true, // 需要登录
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
    requiresAuth: true, // 需要登录
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
    requiresAuth: true, // 需要登录
  })
}

/**
 * 获取待处理订单数量
 * 待处理订单定义为: PENDING(待确认) 或 CONFIRMED且requiresPayment=true(已确认待支付)
 * @returns 待处理订单数量
 */
export async function getPendingCount(): Promise<number> {
  try {
    const result = await request<{ pendingCount: number }>({
      url: '/api/reservations/pending-count',
      method: 'GET',
      showError: false,
      requiresAuth: true, // 需要登录
    })
    return result.pendingCount || 0
  } catch (error) {
    console.error('获取待处理订单数失败:', error)
    return 0
  }
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
  getPendingCount,
}

export default reservationService
