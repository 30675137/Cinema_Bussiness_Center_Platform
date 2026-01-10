# Data Model: 品牌创建问题修复

**Spec**: B001-fix-brand-creation
**Date**: 2026-01-10
**Status**: 参考现有模型

---

## 概述

本次修复不涉及数据模型变更，仅参考现有品牌模块的数据结构。

---

## 现有实体：Brand（品牌）

**文件位置**: `frontend/src/pages/mdm-pim/brand/types/brand.types.ts`

### Brand 实体定义

```typescript
interface Brand {
  id: string;                      // 唯一标识符
  name: string;                    // 品牌名称（必填）
  englishName?: string;            // 英文名称
  brandType: BrandType;            // 品牌类型
  primaryCategories: string[];     // 主营类目数组
  company?: string;                // 所属公司
  brandLevel?: string;             // 品牌等级
  tags?: string[];                 // 品牌标签
  description?: string;            // 品牌描述
  status: BrandStatus;             // 品牌状态
  createdAt: string;               // 创建时间
  updatedAt: string;               // 更新时间
}
```

### 枚举类型

```typescript
enum BrandType {
  DOMESTIC = 'domestic',      // 国产品牌
  IMPORTED = 'imported',      // 进口品牌
  JOINT_VENTURE = 'joint',    // 合资品牌
}

enum BrandStatus {
  DRAFT = 'draft',            // 草稿
  ACTIVE = 'active',          // 启用
  INACTIVE = 'inactive',      // 停用
}
```

---

## API 请求/响应模型

### CreateBrandRequest

```typescript
interface CreateBrandRequest {
  name: string;                    // 品牌名称（必填）
  englishName?: string;            // 英文名称
  brandType: BrandType;            // 品牌类型（必填）
  primaryCategories: string[];     // 主营类目（必填，至少一个）
  company?: string;                // 所属公司
  brandLevel?: string;             // 品牌等级
  tags?: string[];                 // 品牌标签
  description?: string;            // 品牌描述
  status?: BrandStatus;            // 状态（默认 DRAFT）
}
```

### ApiResponse<Brand>

```typescript
interface ApiResponse<T> {
  success: boolean;               // 请求是否成功
  data: T;                        // 响应数据
  message?: string;               // 响应消息
  timestamp: string;              // 时间戳
}
```

### BrandListResponse

```typescript
interface BrandListResponse {
  success: boolean;
  data: Brand[];                  // 品牌列表
  total: number;                  // 总数
  page: number;                   // 当前页
  pageSize: number;               // 每页数量
}
```

---

## TanStack Query Key 结构

### 当前定义（存在问题）

```typescript
// brand.types.ts
const brandQueryKeys = {
  all: ['brands'] as const,
  lists: ['brands', 'list'] as const,
  list: (filters: BrandFilters) => [...brandQueryKeys.lists, filters] as const,
  details: ['brands', 'detail'] as const,
  detail: (id: string) => [...brandQueryKeys.details, id] as const,
};
```

### 实际使用（useBrandList.ts）

```typescript
// 实际查询使用的 key
queryKey: ['brands', filters, pagination]

// 问题：与 brandQueryKeys.lists = ['brands', 'list'] 不匹配
```

### 修复后的预期

```typescript
// 方案 1：修改查询 key 使用 brandQueryKeys
queryKey: brandQueryKeys.list(filters)

// 方案 2：修改 invalidateQueries 使用更宽泛的 key
queryClient.invalidateQueries({ queryKey: ['brands'] })
```

---

## MSW Mock 数据结构

**文件位置**: `frontend/src/mocks/handlers/brandHandlers.ts`

### mockBrands 数组

```typescript
// MSW handler 内部维护的品牌数组
let mockBrands: Brand[] = [
  // 预置的 mock 品牌数据
];
```

### 创建品牌 Handler

```typescript
// POST /api/brands
http.post('/api/brands', async ({ request }) => {
  const data = await request.json() as CreateBrandRequest;

  const newBrand: Brand = {
    id: `brand-${Date.now()}`,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockBrands.push(newBrand);  // 正确添加到数组

  return HttpResponse.json({
    success: true,
    data: newBrand,
    message: '品牌创建成功',
  });
});
```

---

## 数据流图

```
┌─────────────────────────────────────────────────────────────────┐
│                      品牌创建数据流                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  BrandForm                                                      │
│      │                                                          │
│      ▼                                                          │
│  BrandDrawer.handleSubmit()                                     │
│      │                                                          │
│      ▼                                                          │
│  useBrandActions.createBrand()                                  │
│      │                                                          │
│      ├──────────────────────────────────────┐                   │
│      │ 当前（有问题）                         │ 修复后            │
│      ▼                                      ▼                   │
│  内部 brandApi.createBrand()          brandService.create()     │
│      │ (不更新 mockBrands)                  │                   │
│      │                                      ▼                   │
│      │                              MSW Handler 拦截             │
│      │                                      │                   │
│      │                              mockBrands.push()           │
│      │                                      │                   │
│      └──────────────┬───────────────────────┘                   │
│                     ▼                                           │
│            invalidateQueries()                                  │
│                     │                                           │
│      ┌──────────────┴──────────────┐                           │
│      │ 当前（不匹配）               │ 修复后（匹配）            │
│      ▼                             ▼                           │
│  key: ['brands', 'list']    key: ['brands']                    │
│      ✗ 不匹配                     ✓ 匹配                       │
│      │                             │                           │
│      │                             ▼                           │
│      │                       useBrandList 重新获取              │
│      │                             │                           │
│      │                             ▼                           │
│      │                       列表显示新品牌                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 验证规则

### 品牌名称

- 必填
- 最大长度：100 字符
- 允许字符：中文、英文、数字、空格、连字符、下划线、& 符号
- 正则：`/^[\u4e00-\u9fa5a-zA-Z0-9\s\-_&]+$/`

### 英文名称

- 可选
- 最大长度：200 字符
- 允许字符：英文、数字、空格、连字符、下划线、& 符号
- 正则：`/^[a-zA-Z0-9\s\-_&]+$/`

### 主营类目

- 必填，至少选择一个
- 预定义选项：饮料、酒水、食品、服装、电子、家居、美妆、母婴、运动、汽车、其他

### 品牌标签

- 可选
- 最多 10 个标签

### 品牌描述

- 可选
- 最大长度：1000 字符

---

**最后更新**: 2026-01-10
**数据模型变更**: 无（仅参考现有模型）
