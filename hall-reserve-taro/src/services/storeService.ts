/**
 * Store Service
 * C端门店服务 - 获取门店信息
 *
 * @since 020-store-address
 */

import { request } from '../utils/request'
import { Store } from '../types/store'

/**
 * API 响应结构 - 后端实际返回格式
 * 成功时返回 {data: T, timestamp?: string}
 */
interface ApiResponse<T> {
  data: T
  timestamp?: string
  message?: string
  total?: number
}

/**
 * 门店服务
 */
export const storeService = {
  /**
   * 根据 ID 获取门店详情
   * @param storeId 门店 ID
   * @returns Promise<Store> 门店信息
   */
  async getStoreById(storeId: string): Promise<Store> {
    const response = await request<ApiResponse<Store>>(`/api/stores/${storeId}`)
    
    if (!response.data) {
      throw new Error(response.message || '获取门店信息失败')
    }
    
    return response.data
  },

  /**
   * 获取门店列表
   * @param status 可选状态过滤
   * @returns Promise<Store[]> 门店列表
   */
  async getStores(status?: 'active' | 'inactive'): Promise<Store[]> {
    const url = status ? `/api/stores?status=${status}` : '/api/stores'
    const response = await request<ApiResponse<Store[]>>(url)
    
    if (!response.data) {
      throw new Error(response.message || '获取门店列表失败')
    }
    
    return response.data
  },

  /**
   * 根据门店编码获取门店详情
   * @param code 门店编码
   * @returns Promise<Store> 门店信息
   */
  async getStoreByCode(code: string): Promise<Store> {
    const response = await request<ApiResponse<Store>>(`/api/stores/code/${code}`)
    
    if (!response.data) {
      throw new Error(response.message || '获取门店信息失败')
    }
    
    return response.data
  },
}

/**
 * Mock 门店数据（用于开发测试）
 */
export const mockStores: Store[] = [
  {
    id: 'mock-store-001',
    code: 'BJ001',
    name: '耀莱成龙影城（五棵松店）',
    province: '北京市',
    city: '北京市',
    district: '海淀区',
    address: '复兴路69号五棵松华熙LIVE购物中心3层',
    phone: '13800138001',
    addressSummary: '北京市 海淀区',
    status: 'active',
  },
  {
    id: 'mock-store-002',
    code: 'BJ002',
    name: '万达影城（CBD店）',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    address: '建国路93号万达广场B座10层',
    phone: '010-85858585',
    addressSummary: '北京市 朝阳区',
    status: 'active',
  },
  {
    id: 'mock-store-003',
    code: 'SH001',
    name: 'CGV影城（徐家汇店）',
    province: '上海市',
    city: '上海市',
    district: '徐汇区',
    address: '虹桥路1号港汇恒隆广场6层',
    phone: '400-1234-5678',
    addressSummary: '上海市 徐汇区',
    status: 'inactive',
  },
]

/**
 * Mock 服务（用于开发测试）
 */
export const mockStoreService = {
  async getStoreById(storeId: string): Promise<Store> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const store = mockStores.find((s) => s.id === storeId)
    if (!store) {
      throw new Error('门店不存在')
    }
    return store
  },

  async getStores(status?: 'active' | 'inactive'): Promise<Store[]> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    if (status) {
      return mockStores.filter((s) => s.status === status)
    }
    return mockStores
  },
}
