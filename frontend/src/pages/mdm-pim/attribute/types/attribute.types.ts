/**
 * Page-level types and query keys for Attribute Dictionary Management
 *
 * Note: Core data types are defined in @/features/attribute-dictionary/types/index.ts
 * This file contains page-specific types, query keys, and UI state types
 */

import type {
  DictionaryType,
  DictionaryItem,
  AttributeTemplate,
  Attribute,
} from '@/features/attribute-dictionary/types';

// ============================================================================
// Query Key Factory
// ============================================================================

/**
 * Query keys for dictionary-related queries
 * Following the same pattern as categoryKeys
 */
export const dictionaryKeys = {
  all: ['dictionary'] as const,
  types: () => [...dictionaryKeys.all, 'types'] as const,
  typesList: (params?: DictionaryTypeListParams) =>
    [...dictionaryKeys.types(), 'list', params] as const,
  typeDetail: (id: string) => [...dictionaryKeys.types(), 'detail', id] as const,
  items: (typeId: string) => [...dictionaryKeys.all, 'items', typeId] as const,
  itemDetail: (typeId: string, id: string) =>
    [...dictionaryKeys.items(typeId), 'detail', id] as const,
} as const;

/**
 * Query keys for attribute template-related queries
 */
export const attributeTemplateKeys = {
  all: ['attribute-templates'] as const,
  lists: () => [...attributeTemplateKeys.all, 'list'] as const,
  list: (params?: AttributeTemplateListParams) =>
    [...attributeTemplateKeys.lists(), params] as const,
  detail: (id: string) => [...attributeTemplateKeys.all, 'detail', id] as const,
  byCategory: (categoryId: string) =>
    [...attributeTemplateKeys.all, 'byCategory', categoryId] as const,
  attributes: (templateId: string) =>
    [...attributeTemplateKeys.all, 'attributes', templateId] as const,
  attribute: (id: string) => [...attributeTemplateKeys.all, 'attribute', id] as const,
} as const;

// ============================================================================
// List Params Types
// ============================================================================

export interface DictionaryTypeListParams {
  status?: 'active' | 'inactive';
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface DictionaryItemListParams {
  typeId: string;
  status?: 'active' | 'inactive';
  search?: string;
}

export interface AttributeTemplateListParams {
  categoryId?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

// ============================================================================
// UI State Types
// ============================================================================

export type DrawerMode = 'create' | 'edit' | 'view';

export interface DictionaryTypeDrawerState {
  visible: boolean;
  mode: DrawerMode;
  currentType?: DictionaryType;
}

export interface DictionaryItemDrawerState {
  visible: boolean;
  mode: DrawerMode;
  typeId: string;
  currentItem?: DictionaryItem;
}

export interface AttributeTemplateDrawerState {
  visible: boolean;
  mode: DrawerMode;
  currentTemplate?: AttributeTemplate;
}

export interface AttributeDrawerState {
  visible: boolean;
  mode: DrawerMode;
  templateId: string;
  currentAttribute?: Attribute;
}

// ============================================================================
// Tab Keys
// ============================================================================

export type AttributePageTab = 'dictionary' | 'template';

// ============================================================================
// Form Values Types (for React Hook Form)
// ============================================================================

export interface DictionaryTypeFormValues {
  code: string;
  name: string;
  description?: string;
  category?: 'basic' | 'business' | 'custom';
  sort?: number;
}

export interface DictionaryItemFormValues {
  typeId: string;
  code: string;
  name: string;
  value?: string;
  parentId?: string;
  level?: number;
  sort?: number;
  remark?: string;
  status?: 'active' | 'inactive';
}

export interface AttributeTemplateFormValues {
  categoryId: string;
  name: string;
}

export interface AttributeFormValues {
  templateId: string;
  name: string;
  code: string;
  type: 'text' | 'number' | 'single-select' | 'multi-select' | 'boolean' | 'date';
  required: boolean;
  description?: string;
  dictionaryTypeId?: string;
  customValues?: string[];
  defaultValue?: string;
  sort?: number;
  group?: string;
  level?: 'SPU' | 'SKU' | 'both';
}

// ============================================================================
// Re-export core types for convenience
// ============================================================================

export type {
  DictionaryType,
  DictionaryItem,
  AttributeTemplate,
  Attribute,
  AttributeType,
  CreateDictionaryTypeRequest,
  UpdateDictionaryTypeRequest,
  CreateDictionaryItemRequest,
  UpdateDictionaryItemRequest,
  CreateAttributeTemplateRequest,
  UpdateAttributeTemplateRequest,
  CreateAttributeRequest,
  UpdateAttributeRequest,
  BatchUpdateSortRequest,
  ListResponse,
  ApiResponse,
} from '@/features/attribute-dictionary/types';
