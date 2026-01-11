/** @spec M001-material-unit-system */
import { apiClient } from './api'
import type { Unit, UnitCreateRequest, UnitUpdateRequest, UnitCategory } from '@/types/unit'

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  timestamp?: string
}

export const unitService = {
  getAll: async (category?: UnitCategory): Promise<Unit[]> => {
    const response = await apiClient.get<ApiResponse<Unit[]>>('/units', { params: { category } })
    return response.data.data || []
  },

  getById: async (id: string): Promise<Unit> => {
    const response = await apiClient.get<ApiResponse<Unit>>(`/units/${id}`)
    return response.data.data
  },

  getByCode: async (code: string): Promise<Unit> => {
    const response = await apiClient.get<ApiResponse<Unit>>(`/units/code/${code}`)
    return response.data.data
  },

  create: async (data: UnitCreateRequest): Promise<Unit> => {
    const response = await apiClient.post<ApiResponse<Unit>>('/units', data)
    return response.data.data
  },

  update: async (id: string, data: UnitUpdateRequest): Promise<Unit> => {
    const response = await apiClient.put<ApiResponse<Unit>>(`/units/${id}`, data)
    return response.data.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/units/${id}`)
  },
}
