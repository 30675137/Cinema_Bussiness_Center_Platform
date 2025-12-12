// 品牌状态
export type BrandStatus = 'active' | 'inactive'

// 基础品牌类型
export interface BrandItem {
  id: string
  code: string
  name: string
  englishName?: string
  description?: string
  logo?: string
  website?: string
  country?: string
  foundedYear?: number
  status: BrandStatus
  spuCount: number
  contactInfo?: BrandContactInfo
  createdAt: string
  updatedAt: string
}

// 品牌联系信息
export interface BrandContactInfo {
  phone?: string
  email?: string
  address?: string
  website?: string
}

// 品牌创建表单
export interface BrandCreationForm {
  code: string
  name: string
  englishName?: string
  description?: string
  logo?: string
  website?: string
  country?: string
  foundedYear?: number
  contactInfo?: BrandContactInfo
}

// 品牌更新表单
export interface BrandUpdateForm extends Partial<BrandCreationForm> {
  status?: BrandStatus
}

// 品牌查询参数
export interface BrandQueryParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: BrandStatus
  country?: string
  sortBy?: 'name' | 'createdAt' | 'spuCount'
  sortOrder?: 'asc' | 'desc'
}

// 品牌操作响应
export interface BrandOperationResponse {
  success: boolean
  data?: any
  message: string
}

// 品牌选择器选项
export interface BrandSelectOption {
  value: string
  label: string
  disabled?: boolean
}