/**
 * 类目管理功能相关的TypeScript类型定义
 * 基于规格文档中的数据模型设计
 */

// 基础类型定义
export type CategoryLevel = 1 | 2 | 3;
export type CategoryStatus = 'enabled' | 'disabled';
export type AttributeType = 'text' | 'number' | 'single-select' | 'multi-select';

// 验证规则类型
export interface ValidationRule {
  type: 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'custom';
  value: string | number;
  message: string;
}

// 类目实体
export interface Category {
  id: string;
  name: string;
  code?: string;
  level: CategoryLevel;
  parentId?: string;
  sortOrder?: number;
  status: CategoryStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// 树结构节点
export interface CategoryTreeNode extends Category {
  children?: CategoryTreeNode[];
  path: string;
  isLeaf: boolean;
}

// 类目属性
export interface CategoryAttribute {
  id: string;
  name: string;
  type: AttributeType;
  required: boolean;
  optionalValues?: string[];
  defaultValue?: string;
  placeholder?: string;
  description?: string;
  sortOrder: number;
  validation?: ValidationRule[];
  createdAt: string;
  updatedAt: string;
}

// 属性模板
export interface AttributeTemplate {
  id: string;
  categoryId: string;
  attributes: CategoryAttribute[];
  createdAt: string;
  updatedAt: string;
}

// API请求类型
export interface CreateCategoryRequest {
  name: string;
  parentId?: string;
  sortOrder?: number;
  status?: CategoryStatus;
}

export interface UpdateCategoryRequest {
  name?: string;
  sortOrder?: number;
  status?: CategoryStatus;
}

export interface CreateAttributeRequest {
  name: string;
  type: AttributeType;
  required: boolean;
  optionalValues?: string[];
  defaultValue?: string;
  placeholder?: string;
  description?: string;
  sortOrder: number;
  validation?: ValidationRule[];
}

export interface UpdateAttributeRequest {
  name?: string;
  type?: AttributeType;
  required?: boolean;
  optionalValues?: string[];
  defaultValue?: string;
  placeholder?: string;
  description?: string;
  sortOrder?: number;
  validation?: ValidationRule[];
}

export interface SaveAttributeTemplateRequest {
  attributes: CreateAttributeRequest[];
}

// 查询参数类型
export interface CategoryQueryParams {
  level?: CategoryLevel;
  parentId?: string;
  status?: CategoryStatus;
  keyword?: string;
  includeChildren?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'sortOrder' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
  details?: any;
}

export interface CategoryTreeResponse {
  success: boolean;
  data: CategoryTreeNode[];
  total: number;
}

export interface CategoryListResponse {
  success: boolean;
  data: {
    items: Category[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface CategoryChildrenResponse {
  success: boolean;
  data: Category[];
}

export interface AttributeTemplateResponse {
  success: boolean;
  data: AttributeTemplate;
}

export interface AttributeResponse {
  success: boolean;
  data: CategoryAttribute;
}

export interface SuccessResponse {
  success: boolean;
  message: string;
}

// 错误代码枚举
export enum ErrorCode {
  // 通用错误
  INVALID_REQUEST = 'INVALID_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',

  // 类目相关错误
  CATEGORY_NOT_FOUND = 'CATEGORY_NOT_FOUND',
  CATEGORY_NAME_EXISTS = 'CATEGORY_NAME_EXISTS',
  CATEGORY_HAS_CHILDREN = 'CATEGORY_HAS_CHILDREN',
  CATEGORY_IN_USE = 'CATEGORY_IN_USE',
  INVALID_CATEGORY_LEVEL = 'INVALID_CATEGORY_LEVEL',
  INVALID_PARENT_CATEGORY = 'INVALID_PARENT_CATEGORY',

  // 属性相关错误
  ATTRIBUTE_NOT_FOUND = 'ATTRIBUTE_NOT_FOUND',
  ATTRIBUTE_NAME_EXISTS = 'ATTRIBUTE_NAME_EXISTS',
  ATTRIBUTE_IN_USE = 'ATTRIBUTE_IN_USE',
  INVALID_ATTRIBUTE_TYPE = 'INVALID_ATTRIBUTE_TYPE',
  REQUIRED_OPTIONAL_VALUES = 'REQUIRED_OPTIONAL_VALUES',
}

// 错误信息映射
export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCode.INVALID_REQUEST]: '请求参数无效',
  [ErrorCode.UNAUTHORIZED]: '未授权访问',
  [ErrorCode.FORBIDDEN]: '权限不足',
  [ErrorCode.NOT_FOUND]: '资源不存在',

  [ErrorCode.CATEGORY_NOT_FOUND]: '类目不存在',
  [ErrorCode.CATEGORY_NAME_EXISTS]: '类目名称已存在',
  [ErrorCode.CATEGORY_HAS_CHILDREN]: '类目下存在子类目，无法删除',
  [ErrorCode.CATEGORY_IN_USE]: '类目已被SPU使用，无法删除',
  [ErrorCode.INVALID_CATEGORY_LEVEL]: '类目等级无效',
  [ErrorCode.INVALID_PARENT_CATEGORY]: '上级类目无效',

  [ErrorCode.ATTRIBUTE_NOT_FOUND]: '属性不存在',
  [ErrorCode.ATTRIBUTE_NAME_EXISTS]: '属性名称已存在',
  [ErrorCode.ATTRIBUTE_IN_USE]: '属性已被SPU使用，无法删除',
  [ErrorCode.INVALID_ATTRIBUTE_TYPE]: '属性类型无效',
  [ErrorCode.REQUIRED_OPTIONAL_VALUES]: '选择类型属性必须提供可选值',
};

// Zustand状态管理类型
export interface CategoryStore {
  // UI状态
  expandedKeys: string[];
  selectedCategoryId: string | null;
  searchKeyword: string;
  isEditing: boolean;
  editingCategoryId: string | null;

  // Actions
  setExpandedKeys: (keys: string[]) => void;
  setSelectedCategoryId: (id: string | null) => void;
  setSearchKeyword: (keyword: string) => void;
  setEditing: (editing: boolean) => void;
  setEditingCategoryId: (id: string | null) => void;

  // 工具方法
  toggleExpand: (key: string) => void;
  reset: () => void;
}

// 表单类型
export interface CategoryFormData {
  name: string;
  parentId?: string;
  sortOrder?: number;
  status: CategoryStatus;
}

export interface AttributeFormData {
  name: string;
  type: AttributeType;
  required: boolean;
  optionalValues: string[];
  defaultValue?: string;
  placeholder?: string;
  description?: string;
  sortOrder: number;
}

// 组件Props类型
export interface CategoryTreeProps {
  selectedKeys?: string[];
  expandedKeys?: string[];
  onselect?: (selectedKeys: string[], info: any) => void;
  onExpand?: (expandedKeys: string[], info: any) => void;
}

export interface CategoryDetailProps {
  categoryId: string | null;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
}

export interface CategoryFormProps {
  category?: Category;
  parentId?: string;
  mode: 'create' | 'edit';
  visible: boolean;
  onCancel?: () => void;
  onSuccess?: (category: Category) => void;
}

export interface AttributeTemplateProps {
  categoryId: string;
  disabled?: boolean;
}

// Mock数据类型
export interface MockSPU {
  id: string;
  name: string;
  categoryId: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface MockDataState {
  categories: Category[];
  attributeTemplates: Record<string, AttributeTemplate>;
  spus: MockSPU[];
}

// 明确重新导出所有类型以确保正确的模块导出
export type {
  CategoryLevel,
  CategoryStatus,
  AttributeType,
  Category,
  CategoryTreeNode,
  CategoryAttribute,
  AttributeTemplate,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateAttributeRequest,
  UpdateAttributeRequest,
  SaveAttributeTemplateRequest,
  CategoryQueryParams,
  ApiResponse,
  CategoryTreeResponse,
  CategoryListResponse,
  CategoryChildrenResponse,
  AttributeTemplateResponse,
  AttributeResponse,
  SuccessResponse,
  CategoryStore,
  CategoryFormData,
  AttributeFormData,
  CategoryTreeProps,
  CategoryDetailProps,
  CategoryFormProps,
  AttributeTemplateProps,
  MockSPU,
  MockDataState
};