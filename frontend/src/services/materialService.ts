/** @spec M001-material-unit-system */
import { apiClient } from './apiClient'
import type { Material, MaterialCreateRequest, MaterialUpdateRequest, MaterialCategory } from '@/types/material'

export const materialService = {
  getAll: (category?: MaterialCategory) =>
    apiClient.get<Material[]>('/api/materials', { params: { category } }),

  getById: (id: string) =>
    apiClient.get<Material>(`/api/materials/${id}`),

  getByCode: (code: string) =>
    apiClient.get<Material>(`/api/materials/code/${code}`),

  create: (data: MaterialCreateRequest) =>
    apiClient.post<Material>('/api/materials', data),

  update: (id: string, data: MaterialUpdateRequest) =>
    apiClient.put<Material>(`/api/materials/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/api/materials/${id}`),
}
