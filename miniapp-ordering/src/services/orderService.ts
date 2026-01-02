/**
 * @spec O006-miniapp-channel-order
 * 渠道商品订单 API 服务
 */

import { get, post } from '@/utils/request'
import type {
  ChannelProductOrderDTO,
  CreateChannelProductOrderDTO,
  OrderStatus,
} from '@/types/order'

/**
 * 订单列表响应
 */
export interface ChannelProductOrderListResponse {
  data: ChannelProductOrderDTO[]
  total: number
  page: number
  pageSize: number
}

/**
 * 创建渠道商品订单
 *
 * @param orderData 订单创建请求数据
 * @returns Promise<创建成功的订单>
 *
 * @example
 * ```typescript
 * const newOrder = await createChannelProductOrder({
 *   items: [
 *     {
 *       channelProductId: 'product-123',
 *       selectedSpecs: {...},
 *       quantity: 2,
 *       unitPrice: 2500
 *     }
 *   ]
 * })
 *
 * console.log('订单号:', newOrder.orderNumber)
 * console.log('取餐号:', newOrder.queueNumber)
 * ```
 */
export const createChannelProductOrder = async (
  orderData: CreateChannelProductOrderDTO
): Promise<ChannelProductOrderDTO> => {
  return post<ChannelProductOrderDTO>(
    '/client/channel-product-orders',
    orderData,
    {
      showLoading: true,
      loadingText: '提交订单中...',
    }
  )
}

/**
 * 查询我的订单列表
 *
 * @param options 查询选项
 * @returns Promise<订单列表响应>
 *
 * @example
 * ```typescript
 * // 查询所有订单(第一页,每页 10 条)
 * const orders = await getMyChannelProductOrders()
 *
 * // 查询指定状态的订单
 * const pendingOrders = await getMyChannelProductOrders({
 *   status: OrderStatus.PENDING_PAYMENT,
 *   page: 1,
 *   pageSize: 20
 * })
 * ```
 */
export const getMyChannelProductOrders = async (options?: {
  page?: number
  pageSize?: number
  status?: OrderStatus
}): Promise<ChannelProductOrderListResponse> => {
  const { page = 1, pageSize = 10, status } = options || {}

  const params = new URLSearchParams()
  params.append('page', String(page))
  params.append('pageSize', String(pageSize))

  if (status) {
    params.append('status', status)
  }

  return get<ChannelProductOrderListResponse>(
    `/client/channel-product-orders/my?${params.toString()}`
  )
}

/**
 * 获取订单详情
 *
 * @param id 订单 ID
 * @returns Promise<订单详情>
 *
 * @throws {RequestError} 订单不存在时抛出 404 错误
 *
 * @example
 * ```typescript
 * const order = await getChannelProductOrderDetail('order-id-123')
 * console.log('订单状态:', order.status)
 * console.log('订单项数量:', order.items.length)
 * ```
 */
export const getChannelProductOrderDetail = async (
  id: string
): Promise<ChannelProductOrderDTO> => {
  return get<ChannelProductOrderDTO>(`/client/channel-product-orders/${id}`)
}

/**
 * 模拟支付订单(Mock 实现)
 *
 * @param orderId 订单 ID
 * @returns Promise<支付后的订单>
 *
 * @description
 * 由于 O006 规格要求支付使用 Mock 实现,此方法模拟支付流程:
 * 1. 调用后端 API 更新订单状态为"已支付"
 * 2. 订单状态自动流转: PENDING_PAYMENT → PENDING_PREPARE
 * 3. 返回更新后的订单数据
 *
 * @example
 * ```typescript
 * try {
 *   const paidOrder = await mockPayChannelProductOrder('order-id-123')
 *   Taro.showToast({ title: '支付成功', icon: 'success' })
 *   console.log('新状态:', paidOrder.status) // PENDING_PREPARE
 * } catch (error) {
 *   Taro.showToast({ title: '支付失败', icon: 'error' })
 * }
 * ```
 */
export const mockPayChannelProductOrder = async (
  orderId: string
): Promise<ChannelProductOrderDTO> => {
  return post<ChannelProductOrderDTO>(
    `/client/channel-product-orders/${orderId}/mock-pay`,
    {},
    {
      showLoading: true,
      loadingText: '支付中...',
    }
  )
}
