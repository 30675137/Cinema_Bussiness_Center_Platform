// 通用响应接口
export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

// 分页响应接口
export interface PaginationResponse<T = any> {
  items: T[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// 分页查询参数
export interface QueryParams {
  current?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: 'ascend' | 'descend';
  keyword?: string;
}

// 用户信息接口
export interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  department?: string;
  status: UserStatus;
  lastLoginAt?: string;
}

export enum UserRole {
  ADMIN = 'admin',
  PURCHASE_MANAGER = 'purchase_manager',
  WAREHOUSE_MANAGER = 'warehouse_manager',
  FINANCE = 'finance',
  STORE_MANAGER = 'store_manager',
  OPERATOR = 'operator'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  LOCKED = 'locked'
}

// 联系信息接口
export interface ContactInfo {
  person: string;
  phone: string;
  email?: string;
  fax?: string;
}

// 地址信息接口
export interface Address {
  country: string;
  province: string;
  city: string;
  district?: string;
  detail: string;
  zipCode?: string;
}

// 附件信息接口
export interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
  uploadedAt: string;
  uploadedBy: User;
}

// 审批记录接口
export interface ApprovalRecord {
  id: string;
  step: number;
  approver: User;
  status: ApprovalStatus;
  comments?: string;
  approvedAt: string;
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// 银行账户接口
export interface BankAccount {
  bankName: string;
  accountName: string;
  accountNumber: string;
  bankAddress?: string;
  isDefault: boolean;
}

// 质检结果接口
export interface QualityResult {
  itemId: string;
  status: QualityStatus;
  quantity: number;
  defectiveQuantity: number;
  remarks?: string;
  inspectedAt: string;
  inspector: User;
}

export enum QualityStatus {
  QUALIFIED = 'qualified',
  UNQUALIFIED = 'unqualified',
  PENDING = 'pending',
  EXEMPTED = 'exempted'
}

// 存储位置接口
export interface StorageLocation {
  id: string;
  code: string;
  name: string;
  type: LocationType;
  status: LocationStatus;
  capacity?: number;
  currentStock?: number;
  area: string;
  row: string;
  column: string;
  level: string;
}

export enum LocationType {
  SHELF = 'shelf',
  FLOOR = 'floor',
  COLD_STORAGE = 'cold_storage',
  HAZARDOUS = 'hazardous'
}

export enum LocationStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance'
}

// 通用枚举
export enum FileUploadType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  EXCEL = 'excel',
  PDF = 'pdf'
}

// 操作日志接口
export interface OperationLog {
  id: string;
  operation: string;
  module: string;
  targetId: string;
  targetName: string;
  operator: User;
  operateAt: string;
  details?: Record<string, any>;
}

// 数据字典接口
export interface Dictionary {
  code: string;
  name: string;
  value: string;
  category: string;
  sort: number;
  status: boolean;
  description?: string;
}

// 通用状态接口
export interface StatusOption {
  value: string;
  label: string;
  color: string;
  disabled?: boolean;
}

// 表格列配置接口
export interface TableColumn {
  key: string;
  title: string;
  dataIndex: string;
  width?: number;
  fixed?: 'left' | 'right';
  sorter?: boolean;
  filterable?: boolean;
  render?: (value: any, record: any, index: number) => React.ReactNode;
}

// 搜索表单字段配置接口
export interface SearchFormField {
  name: string;
  label: string;
  type: 'input' | 'select' | 'dateRange' | 'numberRange';
  placeholder?: string;
  options?: StatusOption[];
  width?: number;
  span?: number;
  rules?: any[];
  defaultValue?: any;
}

// 导出配置接口
export interface ExportConfig {
  filename: string;
  format: 'excel' | 'csv' | 'pdf';
  columns: string[];
  data?: any[];
}

// 路由配置接口
export interface RouteConfig {
  path: string;
  component: React.LazyExoticComponent<any>;
  exact?: boolean;
  children?: RouteConfig[];
  meta?: {
    title: string;
    icon?: React.ReactNode;
    hideInMenu?: boolean;
    authority?: string[];
  };
}