/** @spec M001-material-unit-system */
import { apiClient } from './api'
import type { Material, MaterialCreateRequest, MaterialUpdateRequest, MaterialCategory } from '@/types/material'

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  timestamp?: string
}

/** N004: 后端返回的分页格式 */
interface MaterialPageResponse {
  data: Material[]
  total: number
  page: number
  pageSize: number
}

export const materialService = {
  getAll: async (category?: MaterialCategory): Promise<Material[]> => {
    const response = await apiClient.get<ApiResponse<MaterialPageResponse>>('/materials', { params: { category, size: 1000 } })
    // N004: 后端返回分页格式 { data: { data: [...], total, page, pageSize } }
    return response.data.data?.data || []
  },

  getById: async (id: string): Promise<Material> => {
    const response = await apiClient.get<ApiResponse<Material>>(`/materials/${id}`)
    return response.data.data
  },

  getByCode: async (code: string): Promise<Material> => {
    const response = await apiClient.get<ApiResponse<Material>>(`/materials/code/${code}`)
    return response.data.data
  },

  create: async (data: MaterialCreateRequest): Promise<Material> => {
    const response = await apiClient.post<ApiResponse<Material>>('/materials', data)
    return response.data.data
  },

  update: async (id: string, data: MaterialUpdateRequest): Promise<Material> => {
    const response = await apiClient.put<ApiResponse<Material>>(`/materials/${id}`, data)
    return response.data.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/materials/${id}`)
  },
}
