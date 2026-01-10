/**
 * @spec B001-fix-brand-creation
 * SPU相关类型定义
 */

// SPU 状态枚举
type SPUStatus = 'draft' | 'active' | 'inactive' | 'archived';

// 品牌类型（用于SPU表单）
export interface Brand {
  id: string;
  name: string;
  code?: string;
  description?: string;
  status?: 'active' | 'inactive';
  logo?: string;
}

// 分类类型（用于SPU表单，支持树形结构）
export interface Category {
  id: string;
  name: string;
  code?: string;
  parentId?: string;
  level?: number;
  status?: 'active' | 'inactive';
  children?: Category[];
}

/**
 * @spec P008-sku-type-refactor
 * ProductType 已移除 - SKU 类型由 SKU.skuType 管理
 * 参见 frontend/src/types/sku.ts 中的 SkuType 枚举
 */

// 基础SPU类型
export interface SPUItem {
  // 基础信息
  id: string;
  code: string;
  name: string;
  shortName?: string;
  description?: string;
  unit?: string;

  // 分类和品牌
  categoryId?: string;
  categoryName?: string;
  categoryPath?: string[];
  brandId?: string;
  brandName?: string;
  brand?: {
    id: string;
    name: string;
    code?: string;
    logo?: string;
    status?: string;
  };
  category?: {
    id: string;
    name: string;
    path?: string[];
  };

  // 状态管理
  status: SPUStatus;
  auditStatus?: 'approved' | 'pending' | 'rejected';

  // @spec P008-sku-type-refactor: productType 已移除，SKU 类型由 SKU.skuType 管理

  // 属性信息
  attributes?: SPUAttribute[];
  specifications?: Array<{ name: string; value: string }>;
  images?: Array<{ url: string; alt: string }>;
  tags?: string[];

  // 关联信息
  skuCount?: number;
  priceRange?: {
    min: number;
    max: number;
  };
  inventory?: {
    totalStock: number;
    availableStock: number;
  };

  // 操作历史
  operationHistory?: Array<{
    type: 'create' | 'update' | 'delete';
    action: string;
    timestamp: string;
    operator: string;
    description?: string;
    changes?: any;
  }>;

  // 审计信息
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  creator?: string;
  modifier?: string;
}

// SPU属性
export interface SPUAttribute {
  id: string;
  name: string;
  value: string | number | boolean | string[];
  type: AttributeType;
  required: boolean;
  editable: boolean;
  group?: string;
  category?: string;
  description?: string;
  validation?: AttributeValidation;
}

// 属性类型
export type AttributeType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'date'
  | 'url'
  | 'image'
  | 'file';

// 属性验证规则
export interface AttributeValidation {
  min?: number;
  max?: number;
  pattern?: string;
  options?: string[];
  required?: boolean;
}

// 商品图片
export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  sort: number;
}

// SPU 创建表单数据
// @spec P008-sku-type-refactor: productType 已移除
export interface SPUCreationForm {
  name: string;
  shortName?: string;
  description?: string;
  unit?: string;
  categoryId: string;
  brandId: string;
  // productType 已移除 - SKU 类型由 SKU.skuType 管理
  attributes: Record<string, any>;
  tags: string[];
  images: ProductImage[];
}

// SPU 更新表单数据
export interface SPUUpdateForm extends Partial<SPUCreationForm> {
  status?: SPUStatus;
}

// SPU 查询参数
export interface SPUQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  categoryId?: string;
  brandId?: string;
  status?: SPUStatus;
  sortBy?: 'createdAt' | 'updatedAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}

// SPU 列表响应
export interface SPUListResponse {
  list: SPUItem[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// 批量操作参数
export interface SPUBatchOperation {
  operation: 'delete' | 'activate' | 'deactivate' | 'export';
  ids: string[];
}

// SPU 操作响应
export interface SPUOperationResponse {
  success: boolean;
  data?: any;
  message: string;
}

// === 属性模板相关类型 ===

// 属性模板
export interface AttributeTemplate {
  id: string;
  name: string;
  code: string;
  description?: string;
  categoryId?: string;
  categoryName?: string;
  status: 'active' | 'inactive';
  attributes: AttributeTemplateItem[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// 属性模板项
export interface AttributeTemplateItem {
  id: string;
  name: string;
  code: string;
  type: AttributeType;
  required: boolean;
  defaultValue?: any;
  description?: string;
  validation?: AttributeValidation;
  options?: AttributeOption[];
  group?: string;
  sort: number;
  status: 'active' | 'inactive';
}

// 属性选项（用于select和multiselect类型）
export interface AttributeOption {
  id: string;
  label: string;
  value: string;
  sort: number;
  status: 'active' | 'inactive';
}

// 属性模板查询参数
export interface AttributeTemplateQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  categoryId?: string;
  status?: 'active' | 'inactive';
  isSystem?: boolean;
}

// 属性模板列表响应
export interface AttributeTemplateListResponse {
  list: AttributeTemplate[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// 属性模板操作响应
export interface AttributeTemplateOperationResponse {
  success: boolean;
  data?: any;
  message: string;
}

// 属性模板创建/更新表单
export interface AttributeTemplateForm {
  name: string;
  code: string;
  description?: string;
  categoryId?: string;
  status: 'active' | 'inactive';
  attributes: Omit<AttributeTemplateItem, 'id'>[];
}

// === 导入导出相关类型 ===

// 导出格式类型
export type ExportFormat = 'xlsx' | 'csv' | 'json';

// 导出数据类型
export type ExportDataType = 'spu' | 'category' | 'brand' | 'attribute_template';

// 导出配置
export interface ExportConfig {
  dataType: ExportDataType;
  format: ExportFormat;
  fields?: string[];
  filters?: Record<string, any>;
  includeHeaders?: boolean;
  pageSize?: number;
}

// 导出任务状态
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed';

// 导出任务
export interface ExportTask {
  id: string;
  dataType: ExportDataType;
  format: ExportFormat;
  status: ExportStatus;
  totalRecords: number;
  processedRecords: number;
  fileName?: string;
  downloadUrl?: string;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

// 导入格式类型
export type ImportFormat = 'xlsx' | 'csv';

// 导入数据类型
export type ImportDataType = 'spu' | 'category' | 'brand' | 'attribute_template';

// 导入配置
export interface ImportConfig {
  dataType: ImportDataType;
  format: ImportFormat;
  filePath: string;
  options?: {
    skipFirstRow?: boolean;
    sheetName?: string;
    mapping?: Record<string, string>;
    validation?: boolean;
    batchSize?: number;
  };
}

// 导入任务状态
export type ImportStatus =
  | 'pending'
  | 'processing'
  | 'validating'
  | 'importing'
  | 'completed'
  | 'failed';

// 导入任务
export interface ImportTask {
  id: string;
  dataType: ImportDataType;
  format: ImportFormat;
  status: ImportStatus;
  totalRows: number;
  processedRows: number;
  successCount: number;
  errorCount: number;
  filePath: string;
  fileName: string;
  errors?: ImportError[];
  warnings?: ImportWarning[];
  createdAt: string;
  completedAt?: string;
}

// 导入错误
export interface ImportError {
  row: number;
  column: string;
  value: any;
  message: string;
  field?: string;
}

// 导入警告
export interface ImportWarning {
  row: number;
  column: string;
  value: any;
  message: string;
  field?: string;
}

// 导入验证结果
export interface ImportValidationResult {
  isValid: boolean;
  errors: ImportError[];
  warnings: ImportWarning[];
  totalRows: number;
  validRows: number;
  invalidRows: number;
}

// 导入导出响应
export interface ExportResponse {
  success: boolean;
  data?: {
    taskId: string;
    downloadUrl?: string;
    fileName?: string;
  };
  message: string;
}

export interface ImportResponse {
  success: boolean;
  data?: {
    taskId: string;
    validationResult?: ImportValidationResult;
  };
  message: string;
}

export type { SPUStatus };
