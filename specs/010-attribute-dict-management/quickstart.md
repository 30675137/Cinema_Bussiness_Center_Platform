# Quick Start Guide: 属性模板与数据字典管理

**Feature**: 010-attribute-dict-management
**Date**: 2025-12-14
**Purpose**: Quick start guide for implementing the attribute template and dictionary management system

## Overview

This guide provides step-by-step instructions for implementing the attribute template and data dictionary management feature. It covers the technical architecture, setup instructions, and implementation patterns.

## Prerequisites

### System Requirements

- Node.js 18+
- npm or yarn
- TypeScript 5.9.3
- React 19.2.0
- Ant Design 6.1.0
- Zustand 5.0.9
- TanStack Query 5.90.12
- React Hook Form 7.68.0
- MSW 2.12.4

### Dependencies to Install

```bash
# Core dependencies
npm install zustand@5.0.9 @tanstack/react-query@5.90.12 react-hook-form@7.68.0

# Additional dependencies
npm install pinyin-pro @hookform/resolvers zod@4.1.13
npm install -D @types/pinyin-pro
```

## Project Setup

### 1. Directory Structure

Create the following directory structure under `frontend/src/`:

```
src/
├── features/
│   └── attribute-dictionary/
│       ├── components/
│       │   ├── atoms/
│       │   ├── molecules/
│       │   └── organisms/
│       ├── hooks/
│       ├── services/
│       ├── stores/
│       ├── types/
│       └── utils/
├── pages/
│   └── attribute-dictionary/
└── mocks/
    └── handlers/
        └── attribute-dictionary.ts
```

### 2. Type Definitions

Create `frontend/src/features/attribute-dictionary/types/index.ts`:

```typescript
// Dictionary Types
export interface DictionaryType {
  id: string;
  code: string;
  name: string;
  description?: string;
  isSystem: boolean;
  category: 'basic' | 'business' | 'custom';
  sort: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  itemCount?: number;
}

// Dictionary Items
export interface DictionaryItem {
  id: string;
  typeId: string;
  code: string;
  name: string;
  value?: any;
  parentId?: string;
  level: number;
  sort: number;
  status: 'active' | 'inactive';
  remark?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  typeName?: string;
}

// Attribute Types
export type AttributeType =
  | 'text'
  | 'number'
  | 'single-select'
  | 'multi-select'
  | 'boolean'
  | 'date';

// Attribute
export interface Attribute {
  id: string;
  templateId: string;
  name: string;
  code: string;
  type: AttributeType;
  required: boolean;
  description?: string;
  dictionaryTypeId?: string;
  customValues?: string[];
  defaultValue?: any;
  sort: number;
  group?: string;
  level: 'SPU' | 'SKU' | 'both';
  validation?: ValidationRule[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  templateName?: string;
  dictionaryTypeName?: string;
}

// Attribute Template
export interface AttributeTemplate {
  id: string;
  categoryId: string;
  name: string;
  version: number;
  isActive: boolean;
  appliedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  categoryName?: string;
  attributeCount?: number;
  attributes?: Attribute[];
}

// Validation Rule
export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

// Form Types
export interface FormFieldConfig {
  name: string;
  label: string;
  type: AttributeType;
  required: boolean;
  dictionaryTypeId?: string;
  defaultValue?: any;
  validation?: ValidationRule[];
  sort: number;
}
```

### 3. Zustand Store Setup

Create `frontend/src/features/attribute-dictionary/stores/dictionaryStore.ts`:

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  DictionaryType,
  DictionaryItem,
  AttributeTemplate,
  Attribute
} from '../types';

interface DictionaryState {
  // State
  dictionaryTypes: DictionaryType[];
  dictionaryItems: Map<string, DictionaryItem[]>;
  attributeTemplates: Map<string, AttributeTemplate>;

  // Loading states
  loading: {
    types: boolean;
    items: Record<string, boolean>;
    templates: Record<string, boolean>;
  };

  // Error states
  errors: Record<string, string>;

  // Computed values
  getActiveItems: (typeId: string) => DictionaryItem[];
  getItemsByCode: (codes: string[]) => DictionaryItem[];
  getTemplateByCategory: (categoryId: string) => AttributeTemplate | undefined;

  // Actions
  initializeData: () => void;

  // Dictionary Type actions
  setDictionaryTypes: (types: DictionaryType[]) => void;
  addDictionaryType: (type: DictionaryType) => void;
  updateDictionaryType: (id: string, updates: Partial<DictionaryType>) => void;
  deleteDictionaryType: (id: string) => void;

  // Dictionary Item actions
  setDictionaryItems: (typeId: string, items: DictionaryItem[]) => void;
  addDictionaryItem: (typeId: string, item: DictionaryItem) => void;
  updateDictionaryItem: (id: string, updates: Partial<DictionaryItem>) => void;
  deleteDictionaryItem: (id: string) => void;
  batchUpdateItemSort: (updates: { id: string; sort: number }[]) => void;

  // Template actions
  setAttributeTemplate: (categoryId: string, template: AttributeTemplate) => void;
  addAttributeTemplate: (template: AttributeTemplate) => void;
  updateAttributeTemplate: (id: string, updates: Partial<AttributeTemplate>) => void;
  deleteAttributeTemplate: (id: string) => void;
}

export const useDictionaryStore = create<DictionaryState>()(
  persist(
    (set, get) => ({
      // Initial state
      dictionaryTypes: [],
      dictionaryItems: new Map(),
      attributeTemplates: new Map(),
      loading: { types: false, items: {}, templates: {} },
      errors: {},

      // Computed values
      getActiveItems: (typeId: string) => {
        const items = get().dictionaryItems.get(typeId) || [];
        return items
          .filter(item => item.status === 'active')
          .sort((a, b) => a.sort - b.sort);
      },

      getItemsByCode: (codes: string[]) => {
        const result: DictionaryItem[] = [];
        for (const items of get().dictionaryItems.values()) {
          const found = items.filter(item => codes.includes(item.code));
          result.push(...found);
        }
        return result;
      },

      getTemplateByCategory: (categoryId: string) => {
        return get().attributeTemplates.get(categoryId);
      },

      // Actions
      initializeData: () => {
        const state = get();
        if (state.dictionaryTypes.length === 0) {
          // Load initial mock data
          import('../mocks/initialData').then(({ initialData }) => {
            set(initialData);
          });
        }
      },

      setDictionaryTypes: (types) => set({ dictionaryTypes: types }),

      addDictionaryType: (type) => set((state) => ({
        dictionaryTypes: [...state.dictionaryTypes, type]
      })),

      updateDictionaryType: (id, updates) => set((state) => ({
        dictionaryTypes: state.dictionaryTypes.map(type =>
          type.id === id ? { ...type, ...updates } : type
        )
      })),

      deleteDictionaryType: (id) => set((state) => ({
        dictionaryTypes: state.dictionaryTypes.filter(type => type.id !== id)
      })),

      setDictionaryItems: (typeId, items) => set((state) => {
        const newItemsMap = new Map(state.dictionaryItems);
        newItemsMap.set(typeId, items);
        return { dictionaryItems: newItemsMap };
      }),

      addDictionaryItem: (typeId, item) => set((state) => {
        const newItemsMap = new Map(state.dictionaryItems);
        const items = newItemsMap.get(typeId) || [];
        newItemsMap.set(typeId, [...items, item]);
        return { dictionaryItems: newItemsMap };
      }),

      updateDictionaryItem: (id, updates) => set((state) => {
        const newItemsMap = new Map(state.dictionaryItems);
        for (const [typeId, items] of newItemsMap) {
          const index = items.findIndex(item => item.id === id);
          if (index !== -1) {
            items[index] = { ...items[index], ...updates };
            break;
          }
        }
        return { dictionaryItems: newItemsMap };
      }),

      deleteDictionaryItem: (id) => set((state) => {
        const newItemsMap = new Map(state.dictionaryItems);
        for (const [typeId, items] of newItemsMap) {
          const filteredItems = items.filter(item => item.id !== id);
          newItemsMap.set(typeId, filteredItems);
        }
        return { dictionaryItems: newItemsMap };
      }),

      batchUpdateItemSort: (updates) => set((state) => {
        const newItemsMap = new Map(state.dictionaryItems);
        for (const update of updates) {
          for (const [typeId, items] of newItemsMap) {
            const index = items.findIndex(item => item.id === update.id);
            if (index !== -1) {
              items[index].sort = update.sort;
              break;
            }
          }
        }
        return { dictionaryItems: newItemsMap };
      }),

      setAttributeTemplate: (categoryId, template) => set((state) => {
        const newTemplatesMap = new Map(state.attributeTemplates);
        newTemplatesMap.set(categoryId, template);
        return { attributeTemplates: newTemplatesMap };
      }),

      addAttributeTemplate: (template) => set((state) => {
        const newTemplatesMap = new Map(state.attributeTemplates);
        newTemplatesMap.set(template.categoryId, template);
        return { attributeTemplates: newTemplatesMap };
      }),

      updateAttributeTemplate: (id, updates) => set((state) => {
        const newTemplatesMap = new Map(state.attributeTemplates);
        for (const [categoryId, template] of newTemplatesMap) {
          if (template.id === id) {
            newTemplatesMap.set(categoryId, { ...template, ...updates });
            break;
          }
        }
        return { attributeTemplates: newTemplatesMap };
      }),

      deleteAttributeTemplate: (id) => set((state) => {
        const newTemplatesMap = new Map(state.attributeTemplates);
        for (const [categoryId, template] of newTemplatesMap) {
          if (template.id === id) {
            newTemplatesMap.delete(categoryId);
            break;
          }
        }
        return { attributeTemplates: newTemplatesMap };
      }),
    }),
    {
      name: 'dictionary-store',
      storage: createJSONStorage(() => localStorage),
      serialize: {
        Map: (map) => Object.fromEntries(map.entries())
      },
      deserialize: {
        Map: (obj) => new Map(Object.entries(obj))
      },
    }
  )
);
```

### 4. API Service Setup

Create `frontend/src/features/attribute-dictionary/services/api.ts`:

```typescript
import type {
  DictionaryType,
  DictionaryItem,
  AttributeTemplate,
  Attribute,
  CreateAttributeType,
  CreateDictionaryItem,
  CreateAttribute
} from '../types';

const API_BASE = '/api';

// Dictionary Types API
export const dictionaryTypeApi = {
  // Get all dictionary types
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    status?: 'active' | 'inactive';
    search?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.set(key, String(value));
        }
      });
    }

    const response = await fetch(`${API_BASE}/dictionary-types?${searchParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch dictionary types');
    }
    return response.json();
  },

  // Create dictionary type
  create: async (data: CreateAttributeType) => {
    const response = await fetch(`${API_BASE}/dictionary-types`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create dictionary type');
    }
    return response.json();
  },

  // Update dictionary type
  update: async (id: string, data: Partial<DictionaryType>) => {
    const response = await fetch(`${API_BASE}/dictionary-types/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update dictionary type');
    }
    return response.json();
  },

  // Delete dictionary type
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE}/dictionary-types/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) {
      throw new Error('Failed to delete dictionary type');
    }
  },
};

// Dictionary Items API
export const dictionaryItemApi = {
  // Get items by type
  getByType: async (typeId: string, params?: {
    status?: 'active' | 'inactive';
    search?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.set(key, String(value));
        }
      });
    }

    const response = await fetch(
      `${API_BASE}/dictionary-types/${typeId}/items?${searchParams}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch dictionary items');
    }
    return response.json();
  },

  // Create dictionary item
  create: async (typeId: string, data: CreateDictionaryItem) => {
    const response = await fetch(`${API_BASE}/dictionary-types/${typeId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create dictionary item');
    }
    return response.json();
  },

  // Update dictionary item
  update: async (id: string, data: Partial<DictionaryItem>) => {
    const response = await fetch(`${API_BASE}/dictionary-items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update dictionary item');
    }
    return response.json();
  },

  // Delete dictionary item
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE}/dictionary-items/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) {
      throw new Error('Failed to delete dictionary item');
    }
  },

  // Batch update sort order
  batchUpdateSort: async (updates: { id: string; sort: number }[]) => {
    const response = await fetch(`${API_BASE}/dictionary-items/batch-update-sort`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates }),
    });
    if (!response.ok) {
      throw new Error('Failed to batch update sort order');
    }
    return response.json();
  },
};

// Attribute Templates API
export const attributeTemplateApi = {
  // Get templates
  getAll: async (params?: {
    categoryId?: string;
    isActive?: boolean;
    page?: number;
    pageSize?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.set(key, String(value));
        }
      });
    }

    const response = await fetch(`${API_BASE}/attribute-templates?${searchParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch attribute templates');
    }
    return response.json();
  },

  // Get template by ID
  getById: async (id: string) => {
    const response = await fetch(`${API_BASE}/attribute-templates/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch attribute template');
    }
    return response.json();
  },

  // Create template
  create: async (data: {
    categoryId: string;
    name: string;
    attributes?: CreateAttribute[];
  }) => {
    const response = await fetch(`${API_BASE}/attribute-templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create attribute template');
    }
    return response.json();
  },

  // Copy template
  copy: async (fromCategoryId: string, toCategoryId: string) => {
    const response = await fetch(`${API_BASE}/attribute-templates/copy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromCategoryId, toCategoryId }),
    });
    if (!response.ok) {
      throw new Error('Failed to copy attribute template');
    }
    return response.json();
  },
};
```

### 5. MSW Mock Setup

Create `frontend/src/mocks/handlers/attribute-dictionary.ts`:

```typescript
import { rest } from 'msw';
import { useDictionaryStore } from '../../features/attribute-dictionary/stores/dictionaryStore';

const API_BASE = '/api';

export const attributeDictionaryHandlers = [
  // Dictionary Types
  rest.get(`${API_BASE}/dictionary-types`, (req, res, ctx) => {
    const store = useDictionaryStore.getState();
    return res(ctx.json(store.dictionaryTypes));
  }),

  rest.post(`${API_BASE}/dictionary-types`, async (req, res, ctx) => {
    const data = await req.json();
    const newType = {
      id: `dt-${Date.now()}`,
      ...data,
      status: 'active' as const,
      sort: data.sort || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user',
      updatedBy: 'current-user',
    };

    useDictionaryStore.getState().addDictionaryType(newType);
    return res(ctx.status(201), ctx.json(newType));
  }),

  rest.put(`${API_BASE}/dictionary-types/:typeId`, async (req, res, ctx) => {
    const { typeId } = req.params;
    const updates = await req.json();

    useDictionaryStore.getState().updateDictionaryType(typeId as string, updates);

    const store = useDictionaryStore.getState();
    const updatedType = store.dictionaryTypes.find(t => t.id === typeId);

    if (!updatedType) {
      return res(ctx.status(404), ctx.json({ error: 'Dictionary type not found' }));
    }

    return res(ctx.json(updatedType));
  }),

  rest.delete(`${API_BASE}/dictionary-types/:typeId`, (req, res, ctx) => {
    const { typeId } = req.params;
    const store = useDictionaryStore.getState();

    // Check if type has items
    const items = store.dictionaryItems.get(typeId as string);
    if (items && items.length > 0) {
      return res(
        ctx.status(400),
        ctx.json({ error: 'Cannot delete dictionary type with existing items' })
      );
    }

    useDictionaryStore.getState().deleteDictionaryType(typeId as string);
    return res(ctx.status(204));
  }),

  // Dictionary Items
  rest.get(`${API_BASE}/dictionary-types/:typeId/items`, (req, res, ctx) => {
    const { typeId } = req.params;
    const store = useDictionaryStore.getState();
    const items = store.dictionaryItems.get(typeId as string) || [];
    return res(ctx.json(items));
  }),

  rest.post(`${API_BASE}/dictionary-types/:typeId/items`, async (req, res, ctx) => {
    const { typeId } = req.params;
    const data = await req.json();

    const newItem = {
      id: `di-${Date.now()}`,
      typeId: typeId as string,
      ...data,
      status: 'active' as const,
      level: data.level || 0,
      sort: data.sort || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user',
      updatedBy: 'current-user',
    };

    useDictionaryStore.getState().addDictionaryItem(typeId as string, newItem);
    return res(ctx.status(201), ctx.json(newItem));
  }),

  rest.put(`${API_BASE}/dictionary-items/:itemId`, async (req, res, ctx) => {
    const { itemId } = req.params;
    const updates = await req.json();

    useDictionaryStore.getState().updateDictionaryItem(itemId as string, {
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: 'current-user',
    });

    // Return updated item
    const store = useDictionaryStore.getState();
    for (const items of store.dictionaryItems.values()) {
      const item = items.find(i => i.id === itemId);
      if (item) {
        return res(ctx.json(item));
      }
    }

    return res(ctx.status(404), ctx.json({ error: 'Dictionary item not found' }));
  }),

  rest.delete(`${API_BASE}/dictionary-items/:itemId`, (req, res, ctx) => {
    const { itemId } = req.params;

    // TODO: Check if item is referenced by attributes or SPU/SKU

    useDictionaryStore.getState().deleteDictionaryItem(itemId as string);
    return res(ctx.status(204));
  }),

  rest.post(`${API_BASE}/dictionary-items/batch-update-sort`, async (req, res, ctx) => {
    const { updates } = await req.json();
    useDictionaryStore.getState().batchUpdateItemSort(updates);
    return res(ctx.json({ updated: updates.length }));
  }),
];
```

### 6. React Hook Form Integration

Create `frontend/src/features/attribute-dictionary/components/DynamicForm.tsx`:

```typescript
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Form, Input, InputNumber, Select, Switch, DatePicker, Checkbox } from 'antd';
import type { AttributeTemplate, Attribute } from '../types';
import { useDictionaryStore } from '../stores/dictionaryStore';

interface DynamicFormProps {
  template: AttributeTemplate;
  onSubmit: (data: Record<string, any>) => void;
  initialValues?: Record<string, any>;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
  template,
  onSubmit,
  initialValues = {}
}) => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: template.attributes?.reduce((acc, attr) => {
      acc[attr.code] = initialValues[attr.code] ?? attr.defaultValue ?? '';
      return acc;
    }, {} as Record<string, any>) || {}
  });

  const getDictionaryItems = (dictionaryTypeId?: string) => {
    if (!dictionaryTypeId) return [];
    return useDictionaryStore.getState().getActiveItems(dictionaryTypeId);
  };

  const renderField = (attribute: Attribute) => {
    const dictionaryItems = getDictionaryItems(attribute.dictionaryTypeId);

    switch (attribute.type) {
      case 'text':
        return (
          <Controller
            name={attribute.code}
            control={control}
            rules={{
              required: attribute.required ? `${attribute.name}不能为空` : false
            }}
            render={({ field, fieldState: { error } }) => (
              <Input
                {...field}
                status={error ? 'error' : undefined}
                placeholder={`请输入${attribute.name}`}
              />
            )}
          />
        );

      case 'number':
        return (
          <Controller
            name={attribute.code}
            control={control}
            rules={{
              required: attribute.required ? `${attribute.name}不能为空` : false
            }}
            render={({ field, fieldState: { error } }) => (
              <InputNumber
                {...field}
                status={error ? 'error' : undefined}
                style={{ width: '100%' }}
                placeholder={`请输入${attribute.name}`}
              />
            )}
          />
        );

      case 'single-select':
        return (
          <Controller
            name={attribute.code}
            control={control}
            rules={{
              required: attribute.required ? `请选择${attribute.name}` : false
            }}
            render={({ field, fieldState: { error } }) => (
              <Select
                {...field}
                status={error ? 'error' : undefined}
                placeholder={`请选择${attribute.name}`}
                allowClear
              >
                {dictionaryItems.map(item => (
                  <Select.Option key={item.id} value={item.code}>
                    {item.name}
                  </Select.Option>
                ))}
              </Select>
            )}
          />
        );

      case 'multi-select':
        return (
          <Controller
            name={attribute.code}
            control={control}
            rules={{
              required: attribute.required ? `请选择${attribute.name}` : false
            }}
            render={({ field, fieldState: { error } }) => (
              <Select
                {...field}
                mode="multiple"
                status={error ? 'error' : undefined}
                placeholder={`请选择${attribute.name}`}
                allowClear
              >
                {dictionaryItems.map(item => (
                  <Select.Option key={item.id} value={item.code}>
                    {item.name}
                  </Select.Option>
                ))}
              </Select>
            )}
          />
        );

      case 'boolean':
        return (
          <Controller
            name={attribute.code}
            control={control}
            render={({ field }) => (
              <Switch {...field} checked={field.value} />
            )}
          />
        );

      case 'date':
        return (
          <Controller
            name={attribute.code}
            control={control}
            rules={{
              required: attribute.required ? `请选择${attribute.name}` : false
            }}
            render={({ field, fieldState: { error } }) => (
              <DatePicker
                {...field}
                status={error ? 'error' : undefined}
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
              />
            )}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Form
      layout="vertical"
      onFinish={handleSubmit(onSubmit)}
      initialValues={initialValues}
    >
      {template.attributes
        ?.sort((a, b) => a.sort - b.sort)
        .map(attribute => (
          <Form.Item
            key={attribute.id}
            label={attribute.name}
            required={attribute.required}
            validateStatus={errors[attribute.code] ? 'error' : undefined}
            help={errors[attribute.code]?.message}
          >
            {renderField(attribute)}
          </Form.Item>
        ))}
    </Form>
  );
};
```

### 7. Chinese Name to Code Generation

Create `frontend/src/features/attribute-dictionary/utils/codeGenerator.ts`:

```typescript
import pinyin from 'pinyin-pro';

/**
 * Generate base code from Chinese name
 */
function generateBaseCode(chineseName: string): string {
  const pinyinArray = pinyin(chineseName, {
    type: 'string',
    toneType: 'none',
    separator: '_'
  });
  return pinyinArray.toUpperCase();
}

/**
 * Resolve code conflict by adding suffix
 */
function resolveConflict(baseCode: string, existingCodes: Set<string>): string {
  if (!existingCodes.has(baseCode)) {
    return baseCode;
  }

  let counter = 2;
  let newCode;
  do {
    newCode = `${baseCode}_${counter}`;
    counter++;
  } while (existingCodes.has(newCode));

  return newCode;
}

/**
 * Generate unique code from Chinese name
 */
export function generateUniqueCode(
  chineseName: string,
  existingCodes: Set<string>
): string {
  const baseCode = generateBaseCode(chineseName);
  return resolveConflict(baseCode, existingCodes);
}

/**
 * Generate unique code with async checking
 */
export async function generateUniqueCodeAsync(
  chineseName: string,
  checkExists: (code: string) => Promise<boolean>
): Promise<string> {
  const baseCode = generateBaseCode(chineseName);

  if (!(await checkExists(baseCode))) {
    return baseCode;
  }

  let counter = 2;
  let newCode;
  do {
    newCode = `${baseCode}_${counter}`;
    counter++;
  } while (await checkExists(newCode));

  return newCode;
}
```

## Implementation Steps

### Step 1: Setup Basic Structure

1. Create the directory structure as shown above
2. Install all required dependencies
3. Set up TypeScript types
4. Configure Zustand store with persistence
5. Set up MSW handlers for API mocking

### Step 2: Implement Dictionary Management

1. Create dictionary type management components:
   - `DictionaryTypeList` - List all dictionary types
   - `DictionaryTypeForm` - Create/edit dictionary type
   - `DictionaryItemList` - List items for a type
   - `DictionaryItemForm` - Create/edit dictionary item

2. Implement the following features:
   - CRUD operations for dictionary types
   - CRUD operations for dictionary items
   - Batch update of sort orders
   - Search and filtering
   - Status toggle (active/inactive)

### Step 3: Implement Attribute Templates

1. Create attribute template components:
   - `AttributeTemplateList` - List templates by category
   - `AttributeTemplateForm` - Create/edit template
   - `AttributeForm` - Create/edit individual attributes
   - `TemplatePreview` - Preview template structure

2. Implement features:
   - Template creation with attributes
   - Attribute configuration (type, validation, default values)
   - Dictionary binding for select/multi-select attributes
   - Template copying between categories

### Step 4: Implement Dynamic Form Generation

1. Create dynamic form components:
   - `DynamicFormGenerator` - Main form generator
   - `FormField` - Individual field renderer
   - `FormValidation` - Validation rules handler

2. Integrate with SPU/SKU creation/editing flows:
   - Load template based on selected category
   - Generate form fields dynamically
   - Handle form submission and validation

### Step 5: Add Advanced Features

1. Implement search optimization:
   - Debounced search input
   - Indexed search for performance
   - Virtual scrolling for large lists

2. Add permission controls:
   - Role-based access control
   - Read-only view for operators
   - Edit permissions for admins

3. Performance optimizations:
   - Lazy loading of dictionary items
   - Memoization of expensive computations
   - Efficient state updates

## Testing Guidelines

### Unit Tests

```typescript
// Example: Dictionary Store Test
import { renderHook, act } from '@testing-library/react';
import { useDictionaryStore } from '../stores/dictionaryStore';

describe('Dictionary Store', () => {
  beforeEach(() => {
    useDictionaryStore.setState({
      dictionaryTypes: [],
      dictionaryItems: new Map(),
      attributeTemplates: new Map(),
    });
  });

  it('should add dictionary type', () => {
    const { result } = renderHook(() => useDictionaryStore());

    act(() => {
      result.current.addDictionaryType({
        id: 'test-1',
        code: 'test_type',
        name: 'Test Type',
        status: 'active',
        sort: 0,
        isSystem: false,
        category: 'custom',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        createdBy: 'user-1',
        updatedBy: 'user-1',
      });
    });

    expect(result.current.dictionaryTypes).toHaveLength(1);
    expect(result.current.dictionaryTypes[0].code).toBe('test_type');
  });
});
```

### Integration Tests

```typescript
// Example: API Integration Test
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { dictionaryTypeApi } from '../services/api';

const server = setupServer(
  rest.get('/api/dictionary-types', (req, res, ctx) => {
    return res(ctx.json([
      { id: '1', code: 'test', name: 'Test', status: 'active' }
    ]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it('should fetch dictionary types', async () => {
  const types = await dictionaryTypeApi.getAll();
  expect(types).toHaveLength(1);
  expect(types[0].code).toBe('test');
});
```

### E2E Tests

```typescript
// Example: Playwright Test
import { test, expect } from '@playwright/test';

test('can create dictionary type', async ({ page }) => {
  await page.goto('/dictionary-types');

  await page.click('[data-testid="create-type-btn"]');
  await page.fill('[data-testid="code-input"]', 'test_type');
  await page.fill('[data-testid="name-input"]', 'Test Type');
  await page.click('[data-testid="submit-btn"]');

  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  await expect(page.locator('text=Test Type')).toBeVisible();
});
```

## Common Issues and Solutions

### Issue 1: Zustand Persistence Not Working
**Solution**: Ensure proper serialization/deserialization of Map objects:
```typescript
import { persist, createJSONStorage } from 'zustand/middleware';

persist(
  (set, get) => ({ /* store logic */ }),
  {
    name: 'dictionary-store',
    storage: createJSONStorage(() => localStorage),
    serialize: {
      Map: (map) => Object.fromEntries(map.entries())
    },
    deserialize: {
      Map: (obj) => new Map(Object.entries(obj))
    },
  }
)
```

### Issue 2: Form Validation Not Triggering
**Solution**: Properly connect React Hook Form with Ant Design:
```typescript
<Controller
  name={fieldName}
  control={control}
  render={({ field, fieldState: { error } }) => (
    <Form.Item validateStatus={error ? 'error' : undefined}>
      <Input {...field} />
    </Form.Item>
  )}
/>
```

### Issue 3: Performance with Large Lists
**Solution**: Implement virtual scrolling:
```typescript
import { FixedSizeList as List } from 'react-window';

const VirtualizedList = ({ items }) => (
  <List
    height={600}
    itemCount={items.length}
    itemSize={50}
  >
    {({ index, style }) => (
      <div style={style}>
        {items[index].name}
      </div>
    )}
  </List>
);
```

## Best Practices

1. **Code Organization**
   - Keep feature modules self-contained
   - Use barrel exports for clean imports
   - Separate types, components, hooks, and services

2. **State Management**
   - Use Zustand for simple state management
   - Implement proper serialization for persistence
   - Keep state normalized for performance

3. **API Design**
   - Use consistent naming conventions
   - Implement proper error handling
   - Add pagination for list endpoints

4. **Testing**
   - Write unit tests for business logic
   - Mock external dependencies
   - Test user interactions with E2E tests

5. **Performance**
   - Use React.memo for expensive components
   - Implement virtual scrolling for large lists
   - Debounce search and validation

## Next Steps

1. Complete the implementation following the steps outlined above
2. Add comprehensive test coverage
3. Implement error boundaries and proper error handling
4. Add loading states and optimistic updates
5. Consider adding audit logging for important operations
6. Plan for future enhancements like template versioning and multi-language support

## Support

For questions or issues related to this implementation:
1. Check the feature specification in `spec.md`
2. Review the data model in `data-model.md`
3. Refer to the API contracts in `contracts/api.yaml`
4. Consult the research findings in `research.md`