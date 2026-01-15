/**
 * @spec O003-beverage-order, O006-miniapp-channel-order
 * 订单服务 - 封装订单相关 API 调用
 */
import {
  createOrder,
  payOrder,
  getOrderById,
  getOrderByNumber,
  getMyOrders,
  getQueueNumber,
  getOrderHistory,
  type CreateOrderRequest,
  type BeverageOrder,
  type ApiResponse,
  type ListResponse,
  type QueueNumber,
  type OrderHistoryResponse,
} from './beverageService'

// 重新导出类型
export type {
  CreateOrderRequest,
  BeverageOrder,
  ApiResponse,
  ListResponse,
  QueueNumber,
  OrderHistoryResponse,
}

/**
 * 订单服务对象
 */
export const orderService = {
  /**
   * 创建订单
   */
  createOrder: async (request: CreateOrderRequest): Promise<BeverageOrder> => {
    const response = await createOrder(request)
    return response.data
  },

  /**
   * 支付订单
   */
  payOrder: async (orderId: string): Promise<BeverageOrder> => {
    const response = await payOrder(orderId)
    return response.data
  },

  /**
   * 获取订单详情
   */
  getOrderById: async (orderId: string): Promise<BeverageOrder> => {
    const response = await getOrderById(orderId)
    return response.data
  },

  /**
   * 通过订单号获取订单
   */
  getOrderByNumber: async (orderNumber: string): Promise<BeverageOrder> => {
    const response = await getOrderByNumber(orderNumber)
    return response.data
  },

  /**
   * 获取我的订单列表
   */
  getMyOrders,

  /**
   * 获取取餐号
   */
  getQueueNumber: async (orderId: string): Promise<QueueNumber> => {
    const response = await getQueueNumber(orderId)
    return response.data
  },

  /**
   * 获取订单历史
   */
  getOrderHistory,
}

export default orderService

/**
 * @spec O006-miniapp-channel-order
 * 渠道商品订单服务扩展
 */
import { post, get } from '../utils/request'
import type {
  CreateChannelProductOrderDTO,
  ChannelProductOrderDTO,
  OrderListQuery,
  OrderListResponse,
} from '../types/order'

/**
 * 创建渠道商品订单
 */
export async function createChannelProductOrder(
  request: CreateChannelProductOrderDTO
): Promise<ChannelProductOrderDTO> {
  return post<ChannelProductOrderDTO>('/client/channel-orders', {
    data: request,
  })
}

/**
 * 获取订单详情
 */
export async function getChannelOrderDetail(
  orderId: string
): Promise<ChannelProductOrderDTO> {
  return get<ChannelProductOrderDTO>(`/client/channel-orders/${orderId}`)
}

/**
 * 获取订单列表
 */
export async function getChannelOrderList(
  query?: OrderListQuery
): Promise<OrderListResponse> {
  return get<OrderListResponse>('/client/channel-orders', {
    data: query,
  })
}
