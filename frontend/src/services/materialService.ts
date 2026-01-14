/**
 * @spec M001-material-unit-system
 * @spec M002-material-filter
 */
import { apiClient } from './api'
import type {
  Material,
  MaterialCreateRequest,
  MaterialUpdateRequest,
  MaterialCategory,
  MaterialFilter,
  MaterialImportResult,
} from '@/types/material'

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
    const response = await apiClient.get<ApiResponse<MaterialPageResponse>>('/materials', {
      params: { category, size: 1000 },
    })
    // N004: 后端返回分页格式 { data: { data: [...], total, page, pageSize } }
    return response.data.data?.data || []
  },

  /**
   * M002: 筛选查询物料列表（支持分页）
   * User Story: US1 - 快速筛选物料
   */
  filterMaterials: async (
    filter: MaterialFilter,
    page: number = 0,
    size: number = 20
  ): Promise<MaterialPageResponse> => {
    const params: Record<string, any> = { page, size }

    if (filter.category) params.category = filter.category
    if (filter.status) params.status = filter.status
    if (filter.minCost !== undefined) params.minCost = filter.minCost
    if (filter.maxCost !== undefined) params.maxCost = filter.maxCost
    if (filter.keyword) params.keyword = filter.keyword

    const response = await apiClient.get<ApiResponse<MaterialPageResponse>>('/materials', { params })
    return response.data.data
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

  /**
   * M002: 导出物料数据为 Excel
   * User Story: US2 - 批量导出物料数据
   */
  exportMaterials: async (filter: MaterialFilter): Promise<void> => {
    const params: Record<string, any> = {}

    if (filter.category) params.category = filter.category
    if (filter.status) params.status = filter.status
    if (filter.minCost !== undefined) params.minCost = filter.minCost
    if (filter.maxCost !== undefined) params.maxCost = filter.maxCost
    if (filter.keyword) params.keyword = filter.keyword

    const response = await apiClient.get('/materials/export', {
      params,
      responseType: 'blob',
    })

    // 下载文件
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    // 生成文件名
    const timestamp = new Date().toISOString().replace(/[:\-T]/g, '').slice(0, 14)
    const fileName = `物料数据_${timestamp}.xlsx`

    // 触发下载
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = fileName
    link.click()
    window.URL.revokeObjectURL(link.href)
  },

  /**
   * M002: 预览导入物料数据（不保存到数据库）
   * User Story: US3 - 批量导入物料数据
   * 
   * @param file Excel 文件
   * @returns 导入结果（包含校验详情）
   */
  previewImport: async (file: File): Promise<MaterialImportResult> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post<ApiResponse<MaterialImportResult>>(
      '/materials/import/preview',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data.data
  },

  /**
   * M002: 确认导入物料数据（保存到数据库）
   * User Story: US3 - 批量导入物料数据
   * 
   * @param file Excel 文件
   * @returns 导入结果（包含保存详情）
   */
  confirmImport: async (file: File): Promise<MaterialImportResult> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post<ApiResponse<MaterialImportResult>>(
      '/materials/import/confirm',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data.data
  },
}
