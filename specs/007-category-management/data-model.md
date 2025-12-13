# 类目管理数据模型设计

## 概述

本文档定义类目管理功能的数据模型，包括类目实体、属性模板实体、以及它们之间的关系。所有数据模型使用 TypeScript 类型定义，确保类型安全和代码可维护性。

## 核心实体

### 1. Category (类目)

类目是商品分类体系的核心实体，支持三级层级结构（一级/二级/三级类目）。

#### 类型定义

```typescript
// 类目状态
export type CategoryStatus = 'active' | 'inactive';

// 类目层级
export type CategoryLevel = 1 | 2 | 3;

// 类目实体
export interface Category {
  // 基础标识
  id: string;                    // 类目唯一标识
  code: string;                  // 类目编码（系统生成或只读）
  name: string;                  // 类目名称（必填）
  description?: string;           // 类目描述（可选）
  
  // 层级关系
  level: CategoryLevel;          // 类目层级（1/2/3，只读）
  parentId?: string;             // 父类目ID（一级类目为空）
  parentName?: string;           // 父类目名称（用于显示）
  path: string[];                // 类目路径（如：['饮料', '碳酸饮料', '可乐']）
  
  // 状态和排序
  status: CategoryStatus;         // 类目状态（启用/停用）
  sortOrder: number;             // 排序序号（用于展示顺序）
  
  // 关联数据
  spuCount: number;              // 关联的SPU数量（用于删除校验）
  attributeTemplateId?: string;  // 属性模板ID（可选）
  
  // 元数据
  createdAt: string;             // 创建时间
  updatedAt: string;             // 更新时间
  createdBy?: string;            // 创建人
  updatedBy?: string;            // 更新人
}
```

#### 验证规则

- **name**: 必填，长度 1-50 字符
- **code**: 系统生成或只读，格式：`CAT-{LEVEL}-{SEQUENCE}`（如：CAT-1-001）
- **level**: 只读，根据 parentId 自动判定
  - 无 parentId → Level 1
  - parentId 为 Level 1 → Level 2
  - parentId 为 Level 2 → Level 3
- **sortOrder**: 可选，数字类型，默认 0
- **status**: 必填，默认 'active'
- **parentId**: 可选，但必须指向有效的父类目

#### 状态转换

```
[active] ←→ [inactive]
  ↓
[deleted] (软删除，仅当 spuCount === 0 时允许)
```

#### 业务规则

1. **删除约束**: 如果 `spuCount > 0`，禁止删除类目
2. **状态影响**: 
   - `active`: 可用于新建 SPU
   - `inactive`: 不可用于新建 SPU，但已有 SPU 不受影响
3. **层级限制**: 最多支持三级类目，不允许更深层级
4. **编码规则**: 类目编码由系统自动生成，用户不可编辑

### 2. CategoryTree (类目树节点)

类目树节点用于树形结构展示，包含层级关系和子节点信息。

#### 类型定义

```typescript
// 类目树节点
export interface CategoryTree {
  // 继承 Category 的所有字段
  ...Category;
  
  // 树结构特有字段
  children?: CategoryTree[];      // 子节点列表
  hasChildren: boolean;          // 是否有子节点（用于懒加载）
  isLeaf: boolean;               // 是否为叶子节点
  key: string;                   // Ant Design Tree 需要的 key
  title: string;                 // Ant Design Tree 需要的 title
}
```

#### 转换逻辑

```typescript
// 将 Category 列表转换为树形结构
function buildCategoryTree(categories: Category[]): CategoryTree[] {
  const categoryMap = new Map<string, CategoryTree>();
  const rootCategories: CategoryTree[] = [];
  
  // 第一遍：创建所有节点
  categories.forEach(category => {
    const treeNode: CategoryTree = {
      ...category,
      children: [],
      hasChildren: false,
      isLeaf: category.level === 3,
      key: category.id,
      title: category.name,
    };
    categoryMap.set(category.id, treeNode);
  });
  
  // 第二遍：建立父子关系
  categories.forEach(category => {
    const treeNode = categoryMap.get(category.id)!;
    if (category.parentId) {
      const parent = categoryMap.get(category.parentId);
      if (parent) {
        parent.children!.push(treeNode);
        parent.hasChildren = true;
        parent.isLeaf = false;
      }
    } else {
      rootCategories.push(treeNode);
    }
  });
  
  // 按 sortOrder 排序
  const sortTree = (nodes: CategoryTree[]) => {
    nodes.sort((a, b) => a.sortOrder - b.sortOrder);
    nodes.forEach(node => {
      if (node.children) {
        sortTree(node.children);
      }
    });
  };
  
  sortTree(rootCategories);
  return rootCategories;
}
```

### 3. AttributeTemplate (属性模板)

属性模板定义类目下 SPU 需要填写的属性字段。

#### 类型定义

```typescript
// 属性类型
export type AttributeType = 'text' | 'number' | 'single-select' | 'multi-select';

// 属性定义
export interface CategoryAttribute {
  // 基础标识
  id: string;                    // 属性唯一标识
  name: string;                  // 属性名称（必填）
  displayName: string;           // 显示名称（用于UI展示）
  
  // 属性配置
  type: AttributeType;           // 属性类型
  required: boolean;            // 是否必填
  optionalValues?: string[];     // 可选值列表（用于 select 类型）
  sortOrder: number;            // 排序序号
  
  // 元数据
  description?: string;          // 属性描述
  createdAt: string;            // 创建时间
  updatedAt: string;            // 更新时间
}

// 属性模板
export interface AttributeTemplate {
  // 基础标识
  id: string;                    // 模板唯一标识
  categoryId: string;           // 关联的类目ID
  
  // 属性列表
  attributes: CategoryAttribute[];  // 属性定义列表
  
  // 元数据
  createdAt: string;            // 创建时间
  updatedAt: string;            // 更新时间
}
```

#### 验证规则

- **name**: 必填，长度 1-50 字符，同一模板内不能重复
- **displayName**: 必填，长度 1-50 字符
- **type**: 必填，必须是预定义的类型之一
- **required**: 必填，布尔类型
- **optionalValues**: 
  - 当 `type === 'single-select' || type === 'multi-select'` 时必填
  - 数组长度至少 1 项
  - 每项长度 1-50 字符
- **sortOrder**: 必填，数字类型，用于排序

#### 业务规则

1. **删除约束**: 如果属性已被 SPU 使用，禁止删除
2. **类型约束**: 
   - `text`: 文本输入，无可选值
   - `number`: 数字输入，无可选值
   - `single-select`: 单选下拉，必须有可选值
   - `multi-select`: 多选下拉，必须有可选值
3. **模板关联**: 每个类目最多只能有一个属性模板（1:1 关系）

## 数据关系

### 实体关系图

```
Category (1) ──< (0..1) AttributeTemplate
    │                      │
    │                      └──> (1..n) CategoryAttribute
    │
    └──> (0..n) Category (self-reference, parent-child)
    │
    └──> (0..n) SPU (referenced by SPU.categoryId)
```

### 关系说明

1. **Category ↔ AttributeTemplate**: 1:1 关系
   - 每个类目可以有一个属性模板
   - 属性模板必须关联到一个类目
   - 属性模板是可选的（类目可以没有属性模板）

2. **AttributeTemplate ↔ CategoryAttribute**: 1:n 关系
   - 一个属性模板包含多个属性定义
   - 每个属性定义属于一个属性模板

3. **Category ↔ Category (self-reference)**: 树形结构
   - 类目通过 `parentId` 建立父子关系
   - 最多支持三级层级（Level 1 → Level 2 → Level 3）

4. **Category ↔ SPU**: 1:n 关系（通过 SPU.categoryId 引用）
   - 一个类目可以被多个 SPU 引用
   - SPU 必须关联到一个三级类目
   - 删除类目时需要检查 `spuCount`

## 数据操作

### 类目操作

#### 创建类目

```typescript
interface CreateCategoryRequest {
  name: string;                  // 必填
  parentId?: string;            // 可选，用于创建子类目
  description?: string;        // 可选
  sortOrder?: number;          // 可选，默认 0
  status?: CategoryStatus;      // 可选，默认 'active'
}

// 系统自动处理：
// - 生成 code
// - 根据 parentId 判定 level
// - 构建 path
// - 设置 createdAt, updatedAt
```

#### 更新类目

```typescript
interface UpdateCategoryRequest {
  id: string;                   // 必填
  name?: string;               // 可选
  description?: string;        // 可选
  sortOrder?: number;         // 可选
  status?: CategoryStatus;     // 可选
}

// 限制：
// - 不能修改 code, level, parentId（只读字段）
// - 不能修改 path（自动计算）
```

#### 删除类目

```typescript
interface DeleteCategoryRequest {
  id: string;
}

// 前置检查：
// - 如果 spuCount > 0，禁止删除
// - 如果有子类目，需要先删除子类目（或级联删除）
```

### 属性模板操作

#### 获取属性模板

```typescript
// 根据类目ID获取属性模板
getAttributeTemplate(categoryId: string): Promise<AttributeTemplate | null>
```

#### 保存属性模板

```typescript
interface SaveAttributeTemplateRequest {
  categoryId: string;
  attributes: Omit<CategoryAttribute, 'id' | 'createdAt' | 'updatedAt'>[];
}

// 操作说明：
// - 如果模板不存在，创建新模板
// - 如果模板已存在，更新现有模板
// - 自动处理属性的创建、更新、删除
```

#### 添加属性

```typescript
interface AddAttributeRequest {
  categoryId: string;
  attribute: Omit<CategoryAttribute, 'id' | 'createdAt' | 'updatedAt'>;
}
```

#### 更新属性

```typescript
interface UpdateAttributeRequest {
  categoryId: string;
  attributeId: string;
  attribute: Partial<Omit<CategoryAttribute, 'id' | 'createdAt' | 'updatedAt'>>;
}
```

#### 删除属性

```typescript
interface DeleteAttributeRequest {
  categoryId: string;
  attributeId: string;
}

// 前置检查：
// - 如果属性已被 SPU 使用，禁止删除
```

## 数据查询

### 类目查询

#### 获取类目树

```typescript
// 获取完整的类目树结构
getCategoryTree(): Promise<CategoryTree[]>

// 返回所有一级类目及其子节点
// 支持懒加载：初始只返回一级类目，子节点按需加载
```

#### 获取类目列表

```typescript
interface CategoryQueryParams {
  page?: number;              // 分页页码
  pageSize?: number;          // 每页数量
  keyword?: string;           // 关键词搜索（名称、编码）
  status?: CategoryStatus;    // 状态筛选
  level?: CategoryLevel;      // 层级筛选
  parentId?: string;          // 父类目筛选
  sortBy?: 'name' | 'code' | 'sortOrder' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

getCategoryList(params: CategoryQueryParams): Promise<PaginatedResponse<Category>>
```

#### 获取类目详情

```typescript
getCategoryDetail(categoryId: string): Promise<Category>
```

#### 获取子类目列表

```typescript
// 获取指定类目的直接子类目（用于懒加载）
getCategoryChildren(parentId: string): Promise<Category[]>
```

#### 搜索类目

```typescript
// 搜索类目并返回匹配路径
searchCategories(keyword: string): Promise<Category[]>

// 返回所有匹配的类目，并包含完整的路径信息
// 用于在树中高亮显示匹配节点
```

## 数据持久化

### Mock 数据存储

在 Mock 数据实现中，使用以下存储策略：

1. **内存存储**: 使用 Map 或数组存储类目数据
2. **localStorage 持久化**: 将类目数据保存到 localStorage，刷新页面后恢复
3. **数据生成器**: 使用 Faker.js 生成初始测试数据

### 数据结构

```typescript
// localStorage 存储结构
interface CategoryStorage {
  categories: Category[];
  attributeTemplates: AttributeTemplate[];
  lastUpdated: string;
}
```

## 类型导出

所有类型定义导出在 `frontend/src/types/category.ts` 文件中，供整个应用使用。


