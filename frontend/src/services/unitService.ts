/** @spec M001-material-unit-system */
import { apiClient } from './apiClient'
import type { Unit, UnitCreateRequest, UnitUpdateRequest, UnitCategory } from '@/types/unit'

export const unitService = {
  getAll: (category?: UnitCategory) =>
    apiClient.get<Unit[]>('/api/units', { params: { category } }),

  getById: (id: string) =>
    apiClient.get<Unit>(`/api/units/${id}`),

  getByCode: (code: string) =>
    apiClient.get<Unit>(`/api/units/code/${code}`),

  create: (data: UnitCreateRequest) =>
    apiClient.post<Unit>('/api/units', data),

  update: (id: string, data: UnitUpdateRequest) =>
    apiClient.put<Unit>(`/api/units/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/api/units/${id}`),
}
