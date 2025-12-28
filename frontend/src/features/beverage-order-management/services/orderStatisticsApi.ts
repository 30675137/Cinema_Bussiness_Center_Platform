/**
 * @spec O003-beverage-order
 * 订单统计 API 服务 (B端)
 */
import axios from 'axios'
import type { OrderStatisticsDTO } from '../types/statistics'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

/**
 * 获取订单统计数据参数
 */
interface GetStatisticsParams {
  storeId?: string
  rangeType: 'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM'
  startDate?: string
  endDate?: string
}

/**
 * 导出报表参数
 */
interface ExportReportParams {
  storeId?: string
  startDate: string
  endDate: string
}

/**
 * 订单统计 API
 */
export const orderStatisticsApi = {
  /**
   * 获取订单统计数据
   *
   * FR-022: B端管理员查看营业统计
   *
   * GET /api/admin/beverage-orders/statistics
   */
  async getStatistics(params: GetStatisticsParams): Promise<OrderStatisticsDTO> {
    const queryParams = new URLSearchParams()

    if (params.storeId) {
      queryParams.append('storeId', params.storeId)
    }

    queryParams.append('rangeType', params.rangeType)

    if (params.rangeType === 'CUSTOM') {
      if (params.startDate) {
        queryParams.append('startDate', params.startDate)
      }
      if (params.endDate) {
        queryParams.append('endDate', params.endDate)
      }
    }

    const response = await axios.get(
      `${API_BASE_URL}/api/admin/beverage-orders/statistics?${queryParams.toString()}`
    )

    // 后端返回格式: { success: true, data: OrderStatisticsDTO }
    if (response.data.success) {
      return response.data.data
    } else {
      throw new Error(response.data.message || '获取统计数据失败')
    }
  },

  /**
   * 导出销售报表（Excel格式）
   *
   * FR-023: B端管理员导出报表
   *
   * GET /api/admin/beverage-orders/export
   */
  async exportReport(params: ExportReportParams): Promise<Blob> {
    const queryParams = new URLSearchParams()

    if (params.storeId) {
      queryParams.append('storeId', params.storeId)
    }

    queryParams.append('startDate', params.startDate)
    queryParams.append('endDate', params.endDate)

    const response = await axios.get(
      `${API_BASE_URL}/api/admin/beverage-orders/export?${queryParams.toString()}`,
      {
        responseType: 'blob', // 接收二进制数据
      }
    )

    return response.data
  },
}
