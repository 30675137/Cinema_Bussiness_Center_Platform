// 分类状态
export type CategoryStatus = 'active' | 'inactive'

// 分类层级
export type CategoryLevel = 1 | 2 | 3

// 基础分类类型
export interface CategoryItem {
  id: string
  code: string
  name: string
  description?: string
  level: CategoryLevel
  parentId?: string
  parentName?: string
  path: string[]
  icon?: string
  image?: string
  status: CategoryStatus
  sortOrder: number
  spuCount: number
  hasChildren: boolean
  children?: CategoryItem[]
  attributeTemplate?: AttributeTemplate
  createdAt: string
  updatedAt: string
}

// 兼容旧接口
export interface ProductCategory {
  id: string;
  name: string;
  code: string;
  level: number;
  parentId?: string;
  path: string;
  children?: ProductCategory[];
  sortOrder: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// 分类树形结构
export interface CategoryTree {
  id: string
  code: string
  name: string
  level: CategoryLevel
  parentId?: string
  path: string[]
  status: CategoryStatus
  sortOrder: number
  spuCount: number
  children?: CategoryTree[]
  attributeTemplate?: AttributeTemplate
}

export interface CategoryTreeNode extends CategoryTree {
  key: string;
  title: string;
  value: string;
  children?: CategoryTreeNode[];
  isLeaf?: boolean;
  checkable?: boolean;
  selectable?: boolean;
}

// 属性模板
export interface AttributeTemplate {
  id: string
  categoryId: string
  name: string
  description?: string
  attributes: TemplateAttribute[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// 模板属性
export interface TemplateAttribute {
  id: string
  name: string
  displayName: string
  type: AttributeType
  required: boolean
  defaultValue?: any
  options?: string[]
  validation?: AttributeValidation
  description?: string
  sortOrder: number
}

// 属性类型
export type AttributeType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'select'
  | 'multiSelect'
  | 'date'
  | 'image'
  | 'file'

// 属性验证规则
export interface AttributeValidation {
  min?: number
  max?: number
  pattern?: string
  options?: string[]
  required?: boolean
}