# Research Findings: 属性模板与数据字典管理

**Feature**: 010-attribute-dict-management
**Date**: 2025-12-14
**Purpose**: Technical research to resolve implementation unknowns before Phase 1 design

## Overview

This document consolidates research findings for implementing the data dictionary and attribute template management system. Research focuses on three critical technical decisions:

1. **Chinese Name to Code Generation** - How to auto-generate unique codes from Chinese dictionary names
2. **Dynamic Form Generation Pattern** - How to render SPU/SKU forms based on category attribute templates
3. **Mock Data Persistence Strategy** - How to persist complex relational mock data across page refreshes

---

## Research Areas

### 1. Chinese Name to Code Generation

**Decision**: Use pinyin conversion library with conflict resolution

**Rationale**:
- Provides readable English codes from Chinese names
- Handles common special characters and tone marks
- Automatic conflict detection and resolution
- Performance suitable for real-time generation

**Implementation Pattern**:
```typescript
import pinyin from 'pinyin-pro';

// 生成基础编码
function generateBaseCode(chineseName: string): string {
  const pinyinArray = pinyin(chineseName, {
    type: 'string',
    toneType: 'none',
    separator: '_'
  });
  return pinyinArray.toUpperCase();
}

// 冲突检测和解决
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

// 完整的编码生成
export function generateUniqueCode(chineseName: string, existingCodes: Set<string>): string {
  const baseCode = generateBaseCode(chineseName);
  return resolveConflict(baseCode, existingCodes);
}
```

**Alternative**: Use UUID v4 for guaranteed uniqueness, then allow manual override to readable codes

---

### 2. Dynamic Form Generation Pattern

**Decision**: Configuration-driven approach using React Hook Form with Ant Design components

**Rationale**:
- Aligns with project's existing tech stack (React Hook Form 7.68.0, Ant Design 6.1.0)
- Provides excellent performance with minimal re-renders
- Type-safe with TypeScript integration
- Flexible validation rules support

**Implementation Pattern**:
```typescript
// 表单字段配置
interface FormFieldConfig {
  name: string;
  label: string;
  type: AttributeType;
  required: boolean;
  dictionaryTypeId?: string;
  defaultValue?: any;
  validation?: ValidationRule[];
  sort: number;
}

// 动态表单生成器
const DynamicFormGenerator: React.FC<{
  template: AttributeTemplate;
  onSubmit: (data: any) => void;
}> = ({ template, onSubmit }) => {
  const { control, handleSubmit, watch } = useForm({
    defaultValues: template.attributes.reduce((acc, attr) => {
      acc[attr.code] = attr.defaultValue;
      return acc;
    }, {} as Record<string, any>)
  });

  return (
    <Form onFinish={handleSubmit(onSubmit)}>
      {template.attributes
        .sort((a, b) => a.sort - b.sort)
        .map(attribute => (
          <FormField
            key={attribute.code}
            attribute={attribute}
            control={control}
            watch={watch}
          />
        ))}
    </Form>
  );
};

// 属性字段渲染组件
const FormField: React.FC<FormFieldProps> = ({ attribute, control }) => {
  const dictionaryItems = useDictionaryStore(
    state => attribute.dictionaryTypeId
      ? state.getActiveItems(attribute.dictionaryTypeId)
      : []
  );

  const renderControl = () => {
    switch (attribute.type) {
      case 'text':
        return <Controller
          name={attribute.code}
          control={control}
          render={({ field }) => <Input {...field} />}
        />;

      case 'number':
        return <Controller
          name={attribute.code}
          control={control}
          render={({ field }) => <InputNumber {...field} style={{ width: '100%' }} />}
        />;

      case 'single-select':
        return <Controller
          name={attribute.code}
          control={control}
          render={({ field }) => (
            <Select {...field}>
              {dictionaryItems.map(item => (
                <Select.Option key={item.id} value={item.code}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          )}
        />;

      case 'multi-select':
        return <Controller
          name={attribute.code}
          control={control}
          render={({ field }) => (
            <Select mode="multiple" {...field}>
              {dictionaryItems.map(item => (
                <Select.Option key={item.id} value={item.code}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          )}
        />;

      case 'boolean':
        return <Controller
          name={attribute.code}
          control={control}
          render={({ field }) => <Switch {...field} />}
        />;

      case 'date':
        return <Controller
          name={attribute.code}
          control={control}
          render={({ field }) => <DatePicker {...field} style={{ width: '100%' }} />}
        />;

      default:
        return null;
    }
  };

  return (
    <Form.Item
      label={attribute.name}
      required={attribute.required}
      rules={[
        { required: attribute.required, message: `${attribute.name}不能为空` }
      ]}
    >
      {renderControl()}
    </Form.Item>
  );
};
```

**Performance Optimization**:
- Use `React.memo` for FormField component
- Implement virtual scrolling for forms with many fields
- Debounce validation for complex rules

---

### 3. Mock Data Persistence Strategy

**Decision**: Hybrid approach using Zustand state + localStorage for persistence + MSW for API simulation

**Rationale**:
- Zustand provides efficient state management with minimal boilerplate
- localStorage ensures data persists across page refreshes
- MSW simulates real API behavior for development
- Supports TanStack Query caching and invalidation

**Implementation Pattern**:
```typescript
// Zustand store with persistence
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface DictionaryStore {
  // State
  dictionaryTypes: DictionaryType[];
  dictionaryItems: Map<string, DictionaryItem[]>; // typeId -> items
  attributeTemplates: Map<string, AttributeTemplate>; // categoryId -> template

  // Actions
  initializeData: () => void;
  addDictionaryType: (type: DictionaryType) => void;
  updateDictionaryItem: (id: string, updates: Partial<DictionaryItem>) => void;
  // ... other actions
}

export const useDictionaryStore = create<DictionaryStore>()(
  persist(
    (set, get) => ({
      dictionaryTypes: [],
      dictionaryItems: new Map(),
      attributeTemplates: new Map(),

      initializeData: () => {
        // Initialize with default data if empty
        const state = get();
        if (state.dictionaryTypes.length === 0) {
          // Load initial mock data
          import('./mockData').then(({ initialData }) => {
            set(initialData);
          });
        }
      },

      addDictionaryType: (type) => set((state) => ({
        dictionaryTypes: [...state.dictionaryTypes, type]
      })),

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
    }),
    {
      name: 'dictionary-store',
      storage: createJSONStorage(() => localStorage),
      serialize: { Map: (map) => Object.fromEntries(map.entries()) },
      deserialize: { Map: (obj) => new Map(Object.entries(obj)) },
    }
  )
);

// MSW handlers for API simulation
import { rest } from 'msw';

export const dictionaryHandlers = [
  rest.get('/api/dictionary-types', (req, res, ctx) => {
    const types = useDictionaryStore.getState().dictionaryTypes;
    return res(ctx.json(types));
  }),

  rest.post('/api/dictionary-items', (req, res, ctx) => {
    const newItem = req.body as DictionaryItem;
    useDictionaryStore.getState().addDictionaryItem(newItem);
    return res(ctx.json(newItem));
  }),

  // ... other handlers
];

// TanStack Query integration
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useDictionaryTypes = () => {
  return useQuery({
    queryKey: ['dictionary-types'],
    queryFn: async () => {
      const response = await fetch('/api/dictionary-types');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateDictionaryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Omit<DictionaryItem, 'id'>) => {
      const response = await fetch('/api/dictionary-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dictionary-items'] });
    },
  });
};
```

**Data Migration Strategy**:
```typescript
// Versioned localStorage migration
const STORAGE_VERSION = '1.0.0';

const migrateData = (storedState: any): any => {
  const version = storedState._version || '0.0.0';

  if (version === '0.0.0') {
    // Migrate from version 0 to 1
    return {
      ...storedState,
      _version: STORAGE_VERSION,
      dictionaryItems: convertLegacyItems(storedState.dictionaryItems || []),
    };
  }

  return storedState;
};
```

---

## Additional Technical Decisions

### 4. Virtual Scrolling for Large Lists

**Decision**: Use Ant Design's built-in `<Table>` virtual scrolling with `virtual` prop

**Rationale**:
- Ant Design 6.1.0 has native virtual scrolling support for tables
- Handles up to 200 items per dictionary type (spec requirement SC-006)
- No additional dependencies needed
- Consistent with existing UI library

**Implementation Pattern**:
```typescript
import { Table } from 'antd';

<Table
  virtual
  scroll={{ y: 600, x: 1000 }}
  dataSource={dictionaryItems}
  columns={columns}
  pagination={false}
/>
```

**Performance Target**: Smooth scrolling for 200+ items, <500ms render time (per SC-005)

---

### 5. Permission Control Implementation

**Decision**: Context-based role checking with UI component guards

**Rationale**:
- Aligned with FR-021/FR-022/FR-023 requirements
- Uses existing auth context (assumed to exist per spec assumptions)
- Declarative permission checks in components

**Implementation Pattern**:
```typescript
// hooks/usePermission.ts
export const usePermission = () => {
  const { user } = useAuth();
  return {
    canEditDictionary: ['admin', 'mdm-admin', 'product-admin'].includes(user.role),
    canViewDictionary: true, // All roles per FR-022
  };
};

// Component usage
const DictionaryList = () => {
  const { canEditDictionary } = usePermission();

  return (
    <>
      {canEditDictionary && <Button>编辑</Button>}
      {!canEditDictionary && <Text type="secondary">只读</Text>}
    </>
  );
};
```

---

### 6. Attribute Type to Form Control Mapping

**Decision**: Direct mapping table following FR-016 requirements

**Rationale**:
- Clear 1:1 mapping per specification
- Leverages Ant Design components
- Extensible for future attribute types

**Mapping Table**:

| Attribute Type | Form Control | Ant Design Component |
|---------------|--------------|---------------------|
| 文本 (text) | Input | `<Input>` |
| 数字 (number) | InputNumber | `<InputNumber>` |
| 单选 (select) | Select | `<Select>` |
| 多选 (multi-select) | CheckboxGroup | `<Checkbox.Group>` |
| 布尔 (boolean) | Switch | `<Switch>` |
| 日期 (date) | DatePicker | `<DatePicker>` |

**Implementation Pattern**:
```typescript
const ATTRIBUTE_CONTROL_MAP = {
  text: Input,
  number: InputNumber,
  select: Select,
  'multi-select': Checkbox.Group,
  boolean: Switch,
  date: DatePicker,
} as const;

function renderAttributeField(attribute: AttributeTemplate) {
  const Control = ATTRIBUTE_CONTROL_MAP[attribute.type];
  return <Control {...getControlProps(attribute)} />;
}
```

---

## Summary of Decisions

| Area | Decision | Status |
|------|----------|--------|
| Code Generation | Pinyin conversion with conflict resolution | ✅ Decided |
| Dynamic Forms | React Hook Form + configuration-driven | ✅ Decided |
| Mock Persistence | Zustand + localStorage + MSW | ✅ Decided |
| Virtual Scrolling | Ant Design native `virtual` prop | ✅ Decided |
| Permission Control | Context-based role checks | ✅ Decided |
| Form Control Mapping | Direct mapping per FR-016 | ✅ Decided |

---

## Implementation Considerations

### Performance Optimization
1. Use Map data structures for O(1) lookups
2. Implement debounced search with 300ms delay
3. Lazy load dictionary items by type
4. Use React.memo for form field components

### Data Consistency
1. Implement reference integrity checks before deletion
2. Use optimistic updates with rollback on error
3. Validate dictionary codes for uniqueness

### User Experience
1. Show loading states during async operations
2. Provide clear error messages
3. Support keyboard navigation
4. Maintain scroll position during updates

---

## Next Steps

1. ✅ Research completed - all technical decisions made
2. ⏳ Proceed to Phase 1: Data Model & API Contracts design
3. ⏳ Create data-model.md with entity definitions
4. ⏳ Generate API contracts in /contracts/ directory
5. ⏳ Create quickstart.md with implementation guide
