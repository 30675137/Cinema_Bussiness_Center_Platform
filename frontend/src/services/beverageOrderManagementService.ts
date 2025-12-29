/**
 * @spec O003-beverage-order
 * B端饮品订单管理服务
 */
import { apiClient } from './apiClient'
import type {
  BeverageOrderDTO,
  BeverageOrderStatus,
  PageResponse,
} from '../types/beverageOrder'

/**
 * 订单查询参数
 */
export interface OrderQueryParams {
  storeId?: string
  status?: BeverageOrderStatus
  page?: number
  pageSize?: number
}

/**
 * 更新订单状态请求
 */
export interface UpdateOrderStatusRequest {
  targetStatus: BeverageOrderStatus
}

/**
 * B端饮品订单管理服务
 */
export const beverageOrderManagementService = {
  /**
   * 查询订单列表（支持筛选）
   */
  async getOrders(params: OrderQueryParams): Promise<PageResponse<BeverageOrderDTO>> {
    const response = await apiClient.get<PageResponse<BeverageOrderDTO>>(
      '/api/admin/beverage-orders',
      { params }
    )
    return response.data
  },

  /**
   * 查询待处理订单（待制作 + 制作中）
   */
  async getPendingOrders(storeId: string): Promise<BeverageOrderDTO[]> {
    const response = await apiClient.get<BeverageOrderDTO[]>(
      '/api/admin/beverage-orders/pending',
      { params: { storeId } }
    )
    return response.data
  },

  /**
   * 获取订单详情
   */
  async getOrderById(orderId: string): Promise<BeverageOrderDTO> {
    const response = await apiClient.get<BeverageOrderDTO>(
      `/api/client/beverage-orders/${orderId}`
    )
    return response.data
  },

  /**
   * 更新订单状态
   */
  async updateOrderStatus(
    orderId: string,
    targetStatus: BeverageOrderStatus
  ): Promise<BeverageOrderDTO> {
    const response = await apiClient.put<BeverageOrderDTO>(
      `/api/admin/beverage-orders/${orderId}/status`,
      { targetStatus }
    )
    return response.data
  },

  /**
   * 开始制作订单（待制作 -> 制作中）
   */
  async startProduction(orderId: string): Promise<BeverageOrderDTO> {
    const response = await apiClient.post<BeverageOrderDTO>(
      `/api/admin/beverage-orders/${orderId}/start-production`
    )
    return response.data
  },

  /**
   * 完成制作（制作中 -> 已完成）
   */
  async completeOrder(orderId: string): Promise<BeverageOrderDTO> {
    const response = await apiClient.post<BeverageOrderDTO>(
      `/api/admin/beverage-orders/${orderId}/complete`
    )
    return response.data
  },

  /**
   * 交付订单（已完成 -> 已交付）
   */
  async deliverOrder(orderId: string): Promise<BeverageOrderDTO> {
    const response = await apiClient.post<BeverageOrderDTO>(
      `/api/admin/beverage-orders/${orderId}/deliver`
    )
    return response.data
  },

  /**
   * 取消订单
   */
  async cancelOrder(orderId: string): Promise<BeverageOrderDTO> {
    const response = await apiClient.post<BeverageOrderDTO>(
      `/api/admin/beverage-orders/${orderId}/cancel`
    )
    return response.data
  },
}
