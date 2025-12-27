# 类目管理功能快速开始指南

## 概述

本文档提供类目管理功能的快速开发指南，包括环境准备、代码结构、核心实现步骤和测试方法。

## 前置要求

- Node.js 18+
- TypeScript 5.9.3
- React 19.2.0
- 熟悉 React Hooks、TanStack Query、Zustand 的使用

## 项目结构

```
frontend/src/
├── components/Category/          # 类目管理组件
│   ├── CategoryTree.tsx         # 类目树组件
│   ├── CategoryManager.tsx      # 类目管理器
│   ├── CategoryDetail.tsx       # 类目详情组件
│   ├── CategoryForm.tsx         # 类目表单组件
│   └── AttributeTemplatePanel.tsx # 属性模板配置面板
├── pages/CategoryManagement/     # 类目管理页面
│   └── index.tsx
├── services/
│   ├── categoryService.ts       # 类目服务（需增强）
│   ├── attributeService.ts      # 属性服务（需增强）
│   └── queryKeys.ts             # 查询键管理（需添加类目键）
├── hooks/api/
│   ├── useCategoryQuery.ts      # 类目查询 Hooks
│   ├── useCategoryMutation.ts  # 类目变更 Hooks
│   └── useAttributeTemplateQuery.ts # 属性模板查询 Hooks
├── stores/
│   └── categoryStore.ts         # 类目 UI 状态管理（Zustand）
├── types/
│   └── category.ts              # 类目类型定义（需完善）
└── mocks/
    ├── handlers/
    │   └── categoryHandlers.ts  # 类目 Mock API 处理器
    └── data/
        └── categoryMockData.ts  # 类目 Mock 数据生成器
```

## 实施步骤

### 步骤 1: 完善类型定义

**文件**: `frontend/src/types/category.ts`

基于 `data-model.md` 中的类型定义，完善类目相关的 TypeScript 类型：

```typescript
// 类目状态
export type CategoryStatus = 'active' | 'inactive';

// 类目层级
export type CategoryLevel = 1 | 2 | 3;

// 类目实体
export interface Category {
  id: string;
  code: string;
  name: string;
  description?: string;
  level: CategoryLevel;
  parentId?: string;
  parentName?: string;
  path: string[];
  status: CategoryStatus;
  sortOrder: number;
  spuCount: number;
  attributeTemplateId?: string;
  createdAt: string;
  updatedAt: string;
}

// 类目树节点
export interface CategoryTree extends Category {
  children?: CategoryTree[];
  hasChildren: boolean;
  isLeaf: boolean;
  key: string;
  title: string;
}

// 属性模板相关类型
export type AttributeType = 'text' | 'number' | 'single-select' | 'multi-select';

export interface CategoryAttribute {
  id: string;
  name: string;
  displayName: string;
  type: AttributeType;
  required: boolean;
  optionalValues?: string[];
  sortOrder: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttributeTemplate {
  id: string;
  categoryId: string;
  attributes: CategoryAttribute[];
  createdAt: string;
  updatedAt: string;
}
```

### 步骤 2: 添加查询键管理

**文件**: `frontend/src/services/queryKeys.ts`

添加类目相关的查询键：

```typescript
import { QueryKeyFactory } from './queryKeys';

// 类目查询键工厂
export const categoryKeys = new QueryKeyFactory('categories');

// 使用示例：
// categoryKeys.all()                    // ['categories']
// categoryKeys.detail(categoryId)       // ['categories', 'detail', categoryId]
// categoryKeys.tree()                   // ['categories', 'tree']
// categoryKeys.children(parentId)       // ['categories', 'children', parentId]
// categoryKeys.search(keyword)          // ['categories', 'search', keyword]
```

### 步骤 3: 增强类目服务

**文件**: `frontend/src/services/categoryService.ts`

基于现有服务，添加缺失的方法：

```typescript
// 获取类目树
async getCategoryTree(lazy: boolean = true): Promise<CategoryTree[]>

// 获取类目详情
async getCategoryDetail(categoryId: string): Promise<Category>

// 获取子类目列表（懒加载）
async getCategoryChildren(parentId: string): Promise<Category[]>

// 搜索类目
async searchCategories(keyword: string): Promise<Category[]>

// 创建类目
async createCategory(data: CreateCategoryRequest): Promise<Category>

// 更新类目
async updateCategory(id: string, data: UpdateCategoryRequest): Promise<Category>

// 删除类目
async deleteCategory(id: string): Promise<void>

// 更新类目状态
async updateCategoryStatus(id: string, status: CategoryStatus): Promise<Category>
```

### 步骤 4: 创建 Query Hooks

**文件**: `frontend/src/hooks/api/useCategoryQuery.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/services/categoryService';
import { categoryKeys } from '@/services/queryKeys';

// 获取类目树
export const useCategoryTreeQuery = (lazy: boolean = true) => {
  return useQuery({
    queryKey: categoryKeys.tree(),
    queryFn: () => categoryService.getCategoryTree(lazy),
    staleTime: 10 * 60 * 1000, // 10分钟（静态数据）
    gcTime: 30 * 60 * 1000, // 30分钟
  });
};

// 获取类目详情
export const useCategoryDetailQuery = (categoryId: string | undefined) => {
  return useQuery({
    queryKey: categoryKeys.detail(categoryId!),
    queryFn: () => categoryService.getCategoryDetail(categoryId!),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000, // 5分钟
  });
};

// 获取子类目列表（懒加载）
export const useCategoryChildrenQuery = (parentId: string | undefined) => {
  return useQuery({
    queryKey: categoryKeys.children(parentId!),
    queryFn: () => categoryService.getCategoryChildren(parentId!),
    enabled: !!parentId,
    staleTime: 10 * 60 * 1000,
  });
};

// 搜索类目
export const useCategorySearchQuery = (keyword: string) => {
  return useQuery({
    queryKey: categoryKeys.search(keyword),
    queryFn: () => categoryService.searchCategories(keyword),
    enabled: keyword.length > 0,
    staleTime: 2 * 60 * 1000, // 2分钟
  });
};
```

### 步骤 5: 创建 Mutation Hooks

**文件**: `frontend/src/hooks/api/useCategoryMutation.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '@/services/categoryService';
import { categoryKeys } from '@/services/queryKeys';
import { showSuccess, showError, getFriendlyErrorMessage } from '@/utils/message';

// 创建类目
export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoryService.createCategory(data),
    onSuccess: (newCategory) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.all() });
      showSuccess('类目创建成功');
    },
    onError: (error) => {
      showError(getFriendlyErrorMessage(error));
    },
  });
};

// 更新类目
export const useUpdateCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) =>
      categoryService.updateCategory(id, data),
    onSuccess: (updatedCategory) => {
      queryClient.setQueryData(categoryKeys.detail(updatedCategory.id), updatedCategory);
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
      showSuccess('类目更新成功');
    },
    onError: (error) => {
      showError(getFriendlyErrorMessage(error));
    },
  });
};

// 删除类目
export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: string) => categoryService.deleteCategory(categoryId),
    onSuccess: (_, categoryId) => {
      queryClient.removeQueries({ queryKey: categoryKeys.detail(categoryId) });
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
      showSuccess('类目删除成功');
    },
    onError: (error) => {
      showError(getFriendlyErrorMessage(error));
    },
  });
};

// 更新类目状态
export const useUpdateCategoryStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: CategoryStatus }) =>
      categoryService.updateCategoryStatus(id, status),
    onSuccess: (updatedCategory) => {
      queryClient.setQueryData(categoryKeys.detail(updatedCategory.id), updatedCategory);
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
      showSuccess(`类目已${updatedCategory.status === 'active' ? '启用' : '停用'}`);
    },
    onError: (error) => {
      showError(getFriendlyErrorMessage(error));
    },
  });
};
```

### 步骤 6: 创建 Zustand Store

**文件**: `frontend/src/stores/categoryStore.ts`

```typescript
import { create } from 'zustand';

interface CategoryStore {
  // UI 状态
  expandedKeys: string[];
  selectedCategoryId: string | null;
  searchKeyword: string;
  isEditing: boolean;
  
  // Actions
  setExpandedKeys: (keys: string[]) => void;
  setSelectedCategoryId: (id: string | null) => void;
  setSearchKeyword: (keyword: string) => void;
  setEditing: (editing: boolean) => void;
  
  // 工具方法
  toggleExpand: (key: string) => void;
  reset: () => void;
}

export const useCategoryStore = create<CategoryStore>((set) => ({
  expandedKeys: [],
  selectedCategoryId: null,
  searchKeyword: '',
  isEditing: false,
  
  setExpandedKeys: (keys) => set({ expandedKeys: keys }),
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
  setEditing: (editing) => set({ isEditing: editing }),
  
  toggleExpand: (key) => set((state) => ({
    expandedKeys: state.expandedKeys.includes(key)
      ? state.expandedKeys.filter(k => k !== key)
      : [...state.expandedKeys, key]
  })),
  
  reset: () => set({
    expandedKeys: [],
    selectedCategoryId: null,
    searchKeyword: '',
    isEditing: false,
  }),
}));
```

### 步骤 7: 实现类目树组件

**文件**: `frontend/src/components/Category/CategoryTree.tsx`

```typescript
import React from 'react';
import { Tree } from 'antd';
import type { CategoryTree } from '@/types/category';
import { useCategoryTreeQuery } from '@/hooks/api/useCategoryQuery';
import { useCategoryStore } from '@/stores/categoryStore';

export const CategoryTreeComponent: React.FC = () => {
  const { data: treeData, isLoading } = useCategoryTreeQuery();
  const { expandedKeys, selectedCategoryId, setExpandedKeys, setSelectedCategoryId } = useCategoryStore();

  const handleSelect = (selectedKeys: React.Key[]) => {
    const categoryId = selectedKeys[0] as string;
    setSelectedCategoryId(categoryId || null);
  };

  const handleExpand = (expandedKeys: React.Key[]) => {
    setExpandedKeys(expandedKeys as string[]);
  };

  const loadData = async (node: any) => {
    // 懒加载子节点
    if (node.children && node.children.length > 0) {
      return;
    }
    // 调用 API 加载子节点
    // const children = await categoryService.getCategoryChildren(node.id);
    // node.children = children;
  };

  return (
    <Tree
      virtual={true}
      loadData={loadData}
      treeData={treeData}
      expandedKeys={expandedKeys}
      selectedKeys={selectedCategoryId ? [selectedCategoryId] : []}
      onSelect={handleSelect}
      onExpand={handleExpand}
      loading={isLoading}
    />
  );
};
```

### 步骤 8: 实现类目详情组件

**文件**: `frontend/src/components/Category/CategoryDetail.tsx`

```typescript
import React from 'react';
import { Card, Descriptions, Button, Space, Tag } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useCategoryDetailQuery } from '@/hooks/api/useCategoryQuery';
import { useCategoryStore } from '@/stores/categoryStore';
import { hasCategoryManagePermission } from '@/services/permissionService';

export const CategoryDetail: React.FC = () => {
  const { selectedCategoryId, setEditing } = useCategoryStore();
  const { data: category, isLoading } = useCategoryDetailQuery(selectedCategoryId);
  const canManage = hasCategoryManagePermission();

  if (!selectedCategoryId) {
    return <Card>请选择一个类目</Card>;
  }

  if (isLoading) {
    return <Card loading>加载中...</Card>;
  }

  if (!category) {
    return <Card>类目不存在</Card>;
  }

  return (
    <Card
      title="类目详情"
      extra={
        canManage && (
          <Button
            icon={<EditOutlined />}
            onClick={() => setEditing(true)}
          >
            编辑
          </Button>
        )
      }
    >
      <Descriptions column={2}>
        <Descriptions.Item label="类目名称">{category.name}</Descriptions.Item>
        <Descriptions.Item label="类目编码">{category.code}</Descriptions.Item>
        <Descriptions.Item label="类目等级">
          {category.level === 1 ? '一级类目' : category.level === 2 ? '二级类目' : '三级类目'}
        </Descriptions.Item>
        <Descriptions.Item label="上级类目">
          {category.parentName || '无'}
        </Descriptions.Item>
        <Descriptions.Item label="类目路径">
          {category.path.join(' / ')}
        </Descriptions.Item>
        <Descriptions.Item label="状态">
          <Tag color={category.status === 'active' ? 'green' : 'red'}>
            {category.status === 'active' ? '启用' : '停用'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="排序序号">{category.sortOrder}</Descriptions.Item>
        <Descriptions.Item label="关联SPU数量">{category.spuCount}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
};
```

### 步骤 9: 实现 MSW Mock Handlers

**文件**: `frontend/src/mocks/handlers/categoryHandlers.ts`

```typescript
import { http, HttpResponse } from 'msw';
import { categoryMockData } from '../data/categoryMockData';

export const categoryHandlers = [
  // 获取类目树
  http.get('/api/categories/tree', ({ request }) => {
    const url = new URL(request.url);
    const lazy = url.searchParams.get('lazy') !== 'false';
    const tree = categoryMockData.getCategoryTree(lazy);
    return HttpResponse.json({
      success: true,
      data: tree,
      message: '获取成功',
      code: 200,
    });
  }),

  // 获取类目列表
  http.get('/api/categories', ({ request }) => {
    const url = new URL(request.url);
    const params = {
      page: parseInt(url.searchParams.get('page') || '1'),
      pageSize: parseInt(url.searchParams.get('pageSize') || '20'),
      keyword: url.searchParams.get('keyword') || undefined,
      status: url.searchParams.get('status') || undefined,
      level: url.searchParams.get('level') ? parseInt(url.searchParams.get('level')!) : undefined,
      parentId: url.searchParams.get('parentId') || undefined,
    };
    const result = categoryMockData.getCategoryList(params);
    return HttpResponse.json({
      success: true,
      data: result,
      message: '获取成功',
      code: 200,
    });
  }),

  // 获取类目详情
  http.get('/api/categories/:id', ({ params }) => {
    const category = categoryMockData.getCategoryById(params.id as string);
    if (!category) {
      return HttpResponse.json(
        { success: false, message: '类目不存在', code: 404 },
        { status: 404 }
      );
    }
    return HttpResponse.json({
      success: true,
      data: category,
      message: '获取成功',
      code: 200,
    });
  }),

  // 创建类目
  http.post('/api/categories', async ({ request }) => {
    const data = await request.json();
    const newCategory = categoryMockData.createCategory(data);
    return HttpResponse.json({
      success: true,
      data: newCategory,
      message: '创建成功',
      code: 200,
    });
  }),

  // 更新类目
  http.put('/api/categories/:id', async ({ params, request }) => {
    const data = await request.json();
    const updatedCategory = categoryMockData.updateCategory(params.id as string, data);
    return HttpResponse.json({
      success: true,
      data: updatedCategory,
      message: '更新成功',
      code: 200,
    });
  }),

  // 删除类目
  http.delete('/api/categories/:id', ({ params }) => {
    const success = categoryMockData.deleteCategory(params.id as string);
    if (!success) {
      return HttpResponse.json(
        { success: false, message: '类目已被使用，不可删除', code: 400 },
        { status: 400 }
      );
    }
    return HttpResponse.json({
      success: true,
      message: '删除成功',
      code: 200,
    });
  }),
];
```

### 步骤 10: 集成到主页面

**文件**: `frontend/src/pages/CategoryManagement/index.tsx`

更新现有页面，集成新组件：

```typescript
import React from 'react';
import { Row, Col } from 'antd';
import { CategoryTreeComponent } from '@/components/Category/CategoryTree';
import { CategoryDetail } from '@/components/Category/CategoryDetail';
import { AttributeTemplatePanel } from '@/components/Category/AttributeTemplatePanel';

export const CategoryManagementPage: React.FC = () => {
  return (
    <Row gutter={16}>
      <Col span={8}>
        <CategoryTreeComponent />
      </Col>
      <Col span={16}>
        <CategoryDetail />
        <AttributeTemplatePanel />
      </Col>
    </Row>
  );
};
```

## 测试

### 单元测试

```typescript
// frontend/src/components/Category/__tests__/CategoryTree.test.tsx
import { render, screen } from '@testing-library/react';
import { CategoryTreeComponent } from '../CategoryTree';

describe('CategoryTreeComponent', () => {
  it('should render category tree', () => {
    render(<CategoryTreeComponent />);
    // 测试逻辑
  });
});
```

### E2E 测试

```typescript
// frontend/tests/e2e/category-management.spec.ts
import { test, expect } from '@playwright/test';

test('类目管理流程', async ({ page }) => {
  await page.goto('/category-management');
  
  // 测试类目树展示
  await expect(page.locator('.ant-tree')).toBeVisible();
  
  // 测试类目选择
  await page.click('.ant-tree-node:first-child');
  await expect(page.locator('.category-detail')).toBeVisible();
  
  // 测试创建类目
  await page.click('button:has-text("新增类目")');
  // ... 更多测试
});
```

## 常见问题

### Q: 如何实现懒加载？

A: 使用 Ant Design Tree 的 `loadData` 属性，配合 `useCategoryChildrenQuery` Hook 实现。

### Q: 如何处理权限控制？

A: 使用 `hasCategoryManagePermission()` 函数检查权限，在组件中条件渲染操作按钮。

### Q: 如何优化大型树结构的性能？

A: 启用虚拟滚动（`virtual={true}`），使用懒加载，合理设置 TanStack Query 的缓存时间。

## 下一步

- 实现属性模板配置功能
- 添加类目导入导出功能
- 优化搜索和筛选体验
- 添加批量操作功能


