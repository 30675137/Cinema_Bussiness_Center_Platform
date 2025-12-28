/**
 * @spec O003-beverage-order
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
