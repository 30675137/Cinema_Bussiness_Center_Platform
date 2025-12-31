/**
 * Type definitions for Attribute Dictionary Management feature
 *
 * This file contains all TypeScript interfaces and types for:
 * - Dictionary Types (字典类型)
 * - Dictionary Items (字典项)
 * - Attribute Templates (属性模板)
 * - Attributes (属性)
 * - SPU/SKU Attribute Values
 */

// ============================================================================
// Dictionary Types (字典类型)
// ============================================================================

export interface DictionaryType {
  // Primary fields
  id: string; // Unique identifier (UUID v4)
  code: string; // Unique code (e.g., 'capacity_unit')
  name: string; // Display name (e.g., '容量单位')
  description?: string; // Optional description

  // Classification
  isSystem: boolean; // Whether this is a system-built-in type
  category: 'basic' | 'business' | 'custom'; // Type category

  // Ordering and status
  sort: number; // Display order
  status: 'active' | 'inactive'; // Status

  // Metadata
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
  createdBy: string; // User ID who created
  updatedBy: string; // User ID who last updated

  // Computed fields
  itemCount?: number; // Number of items in this type
}

// ============================================================================
// Dictionary Items (字典项)
// ============================================================================

export interface DictionaryItem {
  // Primary fields
  id: string; // Unique identifier (UUID v4)
  typeId: string; // Reference to DictionaryType.id
  code: string; // Unique code within type (e.g., '500ml')
  name: string; // Display name (e.g., '500毫升')
  value?: any; // Actual stored value

  // Hierarchy (optional)
  parentId?: string; // For hierarchical items
  level: number; // Hierarchy level (0 for root)

  // Display and ordering
  sort: number; // Display order within type
  status: 'active' | 'inactive'; // Status
  remark?: string; // Optional notes

  // Metadata
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
  createdBy: string; // User ID who created
  updatedBy: string; // User ID who last updated

  // Computed fields
  typeName?: string; // Dictionary type name (for display)
}

// ============================================================================
// Attribute Templates (属性模板)
// ============================================================================

export interface AttributeTemplate {
  // Primary fields
  id: string; // Unique identifier (UUID v4)
  categoryId: string; // Reference to Category.id (must be level 3)
  name: string; // Template name
  version: number; // Version for change tracking

  // Template status
  isActive: boolean; // Whether this template is active
  appliedAt?: string; // When this template was applied

  // Metadata
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
  createdBy: string; // User ID who created
  updatedBy: string; // User ID who last updated

  // Associations (lazy loaded)
  attributes?: Attribute[]; // Attributes in this template
  categoryName?: string; // Category name (for display)
}

// ============================================================================
// Attributes (属性)
// ============================================================================

export type AttributeType =
  | 'text' // 文本输入
  | 'number' // 数字输入
  | 'single-select' // 单选
  | 'multi-select' // 多选
  | 'boolean' // 布尔值
  | 'date'; // 日期

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

export interface Attribute {
  // Primary fields
  id: string; // Unique identifier (UUID v4)
  templateId: string; // Reference to AttributeTemplate.id
  name: string; // Display name (e.g., '容量')
  code: string; // Unique code within template (e.g., 'capacity')

  // Attribute definition
  type: AttributeType; // Attribute type
  required: boolean; // Whether this attribute is required
  description?: string; // Description

  // Value configuration
  dictionaryTypeId?: string; // Reference to DictionaryType.id
  customValues?: string[]; // Custom predefined values
  defaultValue?: any; // Default value

  // Display and grouping
  sort: number; // Display order
  group?: string; // Group name for organization

  // Level applicability
  level: 'SPU' | 'SKU' | 'both'; // Where this attribute applies

  // Validation rules (JSON schema)
  validation?: ValidationRule[];

  // Metadata
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
  createdBy: string; // User ID who created
  updatedBy: string; // User ID who last updated
}

// ============================================================================
// SPU/SKU Attribute Values
// ============================================================================

export interface SPUAttributeValue {
  id: string; // Unique identifier (UUID v4)
  spuId: string; // Reference to SPU.id
  attributeId: string; // Reference to Attribute.id
  value: any; // Actual attribute value

  // Metadata
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
  createdBy: string; // User ID who created
  updatedBy: string; // User ID who last updated
}

export interface SKUAttributeValue {
  id: string; // Unique identifier (UUID v4)
  skuId: string; // Reference to SKU.id
  attributeId: string; // Reference to Attribute.id
  value: any; // Actual attribute value

  // Metadata
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
  createdBy: string; // User ID who created
  updatedBy: string; // User ID who last updated
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface CreateDictionaryTypeRequest {
  code: string;
  name: string;
  description?: string;
  category?: 'basic' | 'business' | 'custom';
  sort?: number;
}

export interface UpdateDictionaryTypeRequest {
  name?: string;
  description?: string;
  sort?: number;
  status?: 'active' | 'inactive';
}

export interface CreateDictionaryItemRequest {
  typeId: string;
  code: string;
  name: string;
  value?: any;
  parentId?: string;
  level?: number;
  sort?: number;
  remark?: string;
}

export interface UpdateDictionaryItemRequest {
  name?: string;
  value?: any;
  sort?: number;
  status?: 'active' | 'inactive';
  remark?: string;
}

export interface CreateAttributeTemplateRequest {
  categoryId: string;
  name: string;
}

export interface UpdateAttributeTemplateRequest {
  name?: string;
  isActive?: boolean;
}

export interface CreateAttributeRequest {
  templateId: string;
  name: string;
  code: string;
  type: AttributeType;
  required: boolean;
  description?: string;
  dictionaryTypeId?: string;
  customValues?: string[];
  defaultValue?: any;
  sort?: number;
  group?: string;
  level?: 'SPU' | 'SKU' | 'both';
  validation?: ValidationRule[];
}

export interface UpdateAttributeRequest {
  name?: string;
  required?: boolean;
  description?: string;
  dictionaryTypeId?: string;
  customValues?: string[];
  defaultValue?: any;
  sort?: number;
  group?: string;
  level?: 'SPU' | 'SKU' | 'both';
  validation?: ValidationRule[];
}

export interface BatchUpdateSortRequest {
  updates: Array<{
    id: string;
    sort: number;
  }>;
}

// ============================================================================
// Pagination and Query Types
// ============================================================================

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationResponse {
  current: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ListResponse<T> {
  data: T[];
  pagination: PaginationResponse;
  success: boolean;
  message?: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp?: string;
}

export interface DictionaryTypeQueryParams extends Partial<PaginationParams> {
  status?: 'active' | 'inactive';
  search?: string;
}

export interface DictionaryItemQueryParams {
  typeId: string;
  status?: 'active' | 'inactive';
  search?: string;
}

export interface AttributeTemplateQueryParams extends Partial<PaginationParams> {
  categoryId?: string;
  isActive?: boolean;
}

export interface AttributeQueryParams {
  templateId: string;
}
