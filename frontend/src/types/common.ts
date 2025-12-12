// API 响应基础类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message: string
  code?: string
  timestamp?: string
}

// 分页参数
export interface PaginationParams {
  page: number
  pageSize: number
}

// 分页响应
export interface PaginationResponse<T> {
  list: T[]
  pagination: {
    current: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// 错误响应
export interface ErrorResponse {
  success: false
  message: string
  code: string
  details?: any
  timestamp: string
}

// 加载状态
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

// 操作状态
export interface OperationState<T = any> {
  loading: boolean
  error?: string
  data?: T
}

// 表单字段验证错误
export interface FormFieldError {
  field: string
  message: string
}

// 表单验证状态
export interface FormValidationState {
  isValid: boolean
  errors: FormFieldError[]
  touched: Set<string>
}

// 搜索参数
export interface SearchParams {
  keyword?: string
  filters?: Record<string, any>
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 通知类型
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

// 通知消息
export interface NotificationMessage {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  closable?: boolean
}

// 用户信息
export interface User {
  id: string
  username: string
  name: string
  email?: string
  avatar?: string
  roles: string[]
  permissions: string[]
}

// 菜单项
export interface MenuItem {
  key: string
  label: string
  icon?: string
  path?: string
  children?: MenuItem[]
  disabled?: boolean
}

// 面包屑项
export interface BreadcrumbItem {
  title: string
  path?: string
}

// 文件上传项
export interface UploadFile {
  id: string
  name: string
  url: string
  size: number
  type: string
  status: 'uploading' | 'done' | 'error'
  percent?: number
  error?: string
}

// 表格列配置
export interface TableColumn {
  key: string
  title: string
  dataIndex?: string
  width?: number
  fixed?: 'left' | 'right'
  sorter?: boolean
  filterable?: boolean
  render?: (value: any, record: any, index: number) => React.ReactNode
}

// 批量操作配置
export interface BatchOperation {
  key: string
  label: string
  icon?: string
  danger?: boolean
  confirm?: {
    title: string
    content?: string
  }
  action: (selectedRows: any[]) => Promise<any>
}

// 导出配置
export interface ExportConfig {
  filename?: string
  format?: 'excel' | 'csv'
  columns?: string[]
  filters?: Record<string, any>
}

// 导入配置
export interface ImportConfig {
  accept?: string[]
  maxSize?: number
  templateUrl?: string
  validator?: (file: File) => boolean
}