import type { SPUItem, SPUQueryParams, SPUCreationForm, SPUUpdateForm, SPUBatchOperation, SPUListResponse } from '@/types/spu'
import type { ApiResponse } from '@/types/common'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

class SPUService {
  // 获取SPU列表
  async getSPUList(params: SPUQueryParams): Promise<SPUListResponse> {
    const queryParams = new URLSearchParams()

    if (params.page) queryParams.append('page', params.page.toString())
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params.keyword) queryParams.append('keyword', params.keyword)
    if (params.categoryId) queryParams.append('categoryId', params.categoryId)
    if (params.brandId) queryParams.append('brandId', params.brandId)
    if (params.status) queryParams.append('status', params.status)
    if (params.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder)

    const response = await fetch(`${API_BASE_URL}/spu/list?${queryParams}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result: ApiResponse<SPUListResponse> = await response.json()

    if (!result.success) {
      throw new Error(result.message)
    }

    return result.data!
  }

  // 获取SPU详情
  async getSPUDetail(id: string): Promise<SPUItem> {
    const response = await fetch(`${API_BASE_URL}/spu/${id}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result: ApiResponse<SPUItem> = await response.json()

    if (!result.success) {
      throw new Error(result.message)
    }

    return result.data!
  }

  // 创建SPU
  async createSPU(data: SPUCreationForm): Promise<SPUItem> {
    const response = await fetch(`${API_BASE_URL}/spu/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result: ApiResponse<SPUItem> = await response.json()

    if (!result.success) {
      throw new Error(result.message)
    }

    return result.data!
  }

  // 更新SPU
  async updateSPU(id: string, data: SPUUpdateForm): Promise<SPUItem> {
    const response = await fetch(`${API_BASE_URL}/spu/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result: ApiResponse<SPUItem> = await response.json()

    if (!result.success) {
      throw new Error(result.message)
    }

    return result.data!
  }

  // 删除SPU
  async deleteSPU(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/spu/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result: ApiResponse = await response.json()

    if (!result.success) {
      throw new Error(result.message)
    }
  }

  // 批量操作
  async batchOperation(data: SPUBatchOperation): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/spu/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result: ApiResponse = await response.json()

    if (!result.success) {
      throw new Error(result.message)
    }

    return result.data
  }
}

export const spuService = new SPUService()