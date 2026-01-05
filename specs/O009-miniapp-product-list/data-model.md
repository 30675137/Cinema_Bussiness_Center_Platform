# Data Model: 小程序商品列表API加载与展示

**Feature**: O009-miniapp-product-list
**Date**: 2026-01-05
**Status**: Draft

本文档定义了小程序商品列表功能所涉及的数据实体、字段结构、验证规则和映射关系。

---

## 核心实体概览

| 实体名称 | 类型 | 数据流向 | 说明 |
|---------|------|---------|------|
| `ChannelProductDTO` | 后端响应 | 后端 → 前端 | 商品列表 API 响应数据 |
| `ProductCard` | 前端模型 | 内部使用 | 商品卡片组件展示模型 |
| `MenuCategoryDTO` | 后端响应 | 后端 → 前端 | 菜单分类 API 响应数据 |
| `CategoryTab` | 前端模型 | 内部使用 | 分类标签组件展示模型 |
| `ProductListResponse` | 后端响应 | 后端 → 前端 | 商品列表分页响应包装 |
| `CategoryListResponse` | 后端响应 | 后端 → 前端 | 分类列表响应包装 |

---

## 1. ChannelProductDTO（后端响应）

### 实体定义

```typescript
interface ChannelProductDTO {
  id: string                 // 商品配置ID（UUID）
  skuId: string              // 关联的SKU ID（UUID）
  categoryId: string         // 关联的菜单分类ID（UUID）
  displayName: string        // 商品显示名称
  basePrice: number          // 最小销售单位价格（单位：分）
  mainImage: string          // 商品主图URL（Supabase Storage公开URL）
  isRecommended: boolean     // 是否为推荐商品
  sortOrder: number          // 排序序号（升序）
  status: string             // 商品状态（ACTIVE, INACTIVE）
  channel: string            // 销售渠道（MINIAPP, POS等）
  createdAt?: string         // 创建时间（ISO 8601格式）
  updatedAt?: string         // 更新时间（ISO 8601格式）
}
```

### 字段验证规则

| 字段 | 验证规则 | 错误提示 |
|------|---------|---------|
| `id` | UUID v4 格式，非空 | "商品ID格式无效" |
| `skuId` | UUID v4 格式，非空 | "SKU ID格式无效" |
| `categoryId` | UUID v4 格式，非空 | "分类ID格式无效" |
| `displayName` | 1-100字符，非空 | "商品名称不能为空且长度不超过100字符" |
| `basePrice` | ≥ 0 的整数（单位：分） | "价格必须为非负整数" |
| `mainImage` | 有效的HTTPS URL或空字符串 | "图片URL格式无效" |
| `isRecommended` | 布尔值 | "推荐标记必须为true或false" |
| `sortOrder` | ≥ 0 的整数 | "排序序号必须为非负整数" |
| `status` | 枚举值: ACTIVE, INACTIVE | "商品状态无效" |
| `channel` | 枚举值: MINIAPP, POS, ... | "销售渠道无效" |

### Zod 验证 Schema

```typescript
import { z } from 'zod'

export const ChannelProductDTOSchema = z.object({
  id: z.string().uuid(),
  skuId: z.string().uuid(),
  categoryId: z.string().uuid(),
  displayName: z.string().min(1).max(100),
  basePrice: z.number().int().nonnegative(),
  mainImage: z.string().url().or(z.literal('')),
  isRecommended: z.boolean(),
  sortOrder: z.number().int().nonnegative(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  channel: z.enum(['MINIAPP', 'POS']),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
})

export type ChannelProductDTO = z.infer<typeof ChannelProductDTOSchema>
```

---

## 2. ProductCard（前端展示模型）

### 实体定义

```typescript
interface ProductCard {
  id: string                 // 商品ID（用于跳转详情页）
  name: string               // 商品名称
  price: string              // 格式化后的价格（如 "¥28.00"）
  imageUrl: string           // 商品图片URL（包含占位图处理）
  isRecommended: boolean     // 是否推荐
  badge?: string             // 角标文本（如 "推荐"）
  category?: string          // 分类名称（可选，用于展示）
}
```

### 字段说明

| 字段 | 来源 | 转换规则 | 示例 |
|------|------|---------|------|
| `id` | `ChannelProductDTO.id` | 直接映射 | `"550e8400-e29b-41d4-a716-446655440000"` |
| `name` | `ChannelProductDTO.displayName` | 直接映射 | `"经典拿铁"` |
| `price` | `ChannelProductDTO.basePrice` | 分→元格式化 | `2800` → `"¥28.00"` |
| `imageUrl` | `ChannelProductDTO.mainImage` | 空值→占位图 | `""` → `DEFAULT_PRODUCT_IMAGE` |
| `isRecommended` | `ChannelProductDTO.isRecommended` | 直接映射 | `true` |
| `badge` | `ChannelProductDTO.isRecommended` | `true` → `"推荐"` | `"推荐"` |
| `category` | 通过 `categoryId` 查询 | 可选，延迟加载 | `"经典特调"` |

### 映射函数

```typescript
const DEFAULT_PRODUCT_IMAGE = '/assets/images/placeholder-product.png'

export const mapToProductCard = (dto: ChannelProductDTO): ProductCard => ({
  id: dto.id,
  name: dto.displayName,
  price: formatPrice(dto.basePrice),
  imageUrl: dto.mainImage || DEFAULT_PRODUCT_IMAGE,
  isRecommended: dto.isRecommended,
  badge: dto.isRecommended ? '推荐' : undefined,
})

export const formatPrice = (priceInCents: number | null): string => {
  if (priceInCents === null || priceInCents === undefined) {
    return '价格待定'
  }
  if (priceInCents === 0) {
    return '免费'
  }
  const yuan = priceInCents / 100
  return `¥${yuan.toFixed(2)}`
}
```

---

## 3. MenuCategoryDTO（后端响应）

### 实体定义

```typescript
interface MenuCategoryDTO {
  id: string                 // 分类ID（UUID）
  code: string               // 分类编码（唯一，如 "ALCOHOL", "COFFEE"）
  displayName: string        // 分类显示名称
  iconUrl?: string           // 分类图标URL（可选）
  productCount?: number      // 该分类下的商品数量（可选）
  isVisible: boolean         // 是否可见
  sortOrder: number          // 排序序号（升序）
  createdAt?: string         // 创建时间
  updatedAt?: string         // 更新时间
}
```

### 字段验证规则

| 字段 | 验证规则 | 错误提示 |
|------|---------|---------|
| `id` | UUID v4 格式，非空 | "分类ID格式无效" |
| `code` | 2-50字符，大写字母+下划线 | "分类编码格式无效" |
| `displayName` | 1-50字符，非空 | "分类名称不能为空" |
| `iconUrl` | 有效的HTTPS URL或空 | "图标URL格式无效" |
| `productCount` | ≥ 0 的整数 | "商品数量必须为非负整数" |
| `isVisible` | 布尔值 | "可见性必须为true或false" |
| `sortOrder` | ≥ 0 的整数 | "排序序号必须为非负整数" |

### Zod 验证 Schema

```typescript
export const MenuCategoryDTOSchema = z.object({
  id: z.string().uuid(),
  code: z.string().regex(/^[A-Z_]{2,50}$/),
  displayName: z.string().min(1).max(50),
  iconUrl: z.string().url().optional(),
  productCount: z.number().int().nonnegative().optional(),
  isVisible: z.boolean(),
  sortOrder: z.number().int().nonnegative(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
})

export type MenuCategoryDTO = z.infer<typeof MenuCategoryDTOSchema>
```

---

## 4. CategoryTab（前端展示模型）

### 实体定义

```typescript
interface CategoryTab {
  id: string | null          // 分类ID（null表示"全部"分类）
  code: string               // 分类编码（"ALL"表示全部）
  displayName: string        // 分类显示名称
  isSelected: boolean        // 是否选中
  productCount?: number      // 商品数量（可选，用于显示数量徽章）
}
```

### 字段说明

| 字段 | 来源 | 转换规则 | 示例 |
|------|------|---------|------|
| `id` | `MenuCategoryDTO.id` | 直接映射，"全部"为`null` | `"uuid"` or `null` |
| `code` | `MenuCategoryDTO.code` | 直接映射，"全部"为`"ALL"` | `"COFFEE"` or `"ALL"` |
| `displayName` | `MenuCategoryDTO.displayName` | 直接映射 | `"精品咖啡"` |
| `isSelected` | 前端状态 | 由当前选中的分类决定 | `true` |
| `productCount` | `MenuCategoryDTO.productCount` | 可选，直接映射 | `15` |

### 映射函数

```typescript
export const mapToCategoryTab = (
  dto: MenuCategoryDTO,
  selectedCategoryId: string | null
): CategoryTab => ({
  id: dto.id,
  code: dto.code,
  displayName: dto.displayName,
  isSelected: dto.id === selectedCategoryId,
  productCount: dto.productCount,
})

// 创建"全部"分类标签
export const createAllCategoryTab = (
  selectedCategoryId: string | null
): CategoryTab => ({
  id: null,
  code: 'ALL',
  displayName: '全部',
  isSelected: selectedCategoryId === null,
})
```

---

## 5. ProductListResponse（后端响应包装）

### 实体定义

```typescript
interface ProductListResponse {
  success: boolean           // 请求是否成功
  data: ChannelProductDTO[]  // 商品数据数组
  total: number              // 总商品数量
  page?: number              // 当前页码（可选，从1开始）
  pageSize?: number          // 每页数量（可选，默认20）
  hasNext: boolean           // 是否有下一页
  timestamp: string          // 响应时间戳（ISO 8601）
}
```

### 分页参数说明

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | number | 1 | 当前页码（1-based） |
| `pageSize` | number | 20 | 每页返回商品数量 |
| `total` | number | - | 符合筛选条件的商品总数 |
| `hasNext` | boolean | - | 是否存在下一页（`page * pageSize < total`） |

### Zod 验证 Schema

```typescript
export const ProductListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(ChannelProductDTOSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().optional(),
  hasNext: z.boolean(),
  timestamp: z.string().datetime(),
})

export type ProductListResponse = z.infer<typeof ProductListResponseSchema>
```

---

## 6. CategoryListResponse（后端响应包装）

### 实体定义

```typescript
interface CategoryListResponse {
  success: boolean           // 请求是否成功
  data: MenuCategoryDTO[]    // 分类数据数组
  total: number              // 总分类数量
  timestamp: string          // 响应时间戳（ISO 8601）
}
```

### Zod 验证 Schema

```typescript
export const CategoryListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(MenuCategoryDTOSchema),
  total: z.number().int().nonnegative(),
  timestamp: z.string().datetime(),
})

export type CategoryListResponse = z.infer<typeof CategoryListResponseSchema>
```

---

## 数据流示意图

```
┌──────────────────────────────────────────────────────────────────┐
│ 后端 API（Spring Boot + Supabase）                                 │
└──────────────────────────────────────────────────────────────────┘
                               │
                               │ GET /api/client/menu-categories
                               ▼
                  ┌────────────────────────────┐
                  │ CategoryListResponse       │
                  │ - success: true            │
                  │ - data: MenuCategoryDTO[]  │
                  │ - total: 5                 │
                  └────────────────────────────┘
                               │
                               │ 前端映射
                               ▼
                  ┌────────────────────────────┐
                  │ CategoryTab[]              │
                  │ - 全部（id: null）          │
                  │ - 经典特调（id: uuid）      │
                  │ - 精品咖啡（id: uuid）      │
                  └────────────────────────────┘
                               │
                               │ 用户选择分类
                               ▼
        GET /api/client/channel-products?categoryId={uuid}&page=1&pageSize=20
                               │
                               ▼
                  ┌────────────────────────────┐
                  │ ProductListResponse        │
                  │ - success: true            │
                  │ - data: ChannelProductDTO[]│
                  │ - total: 50                │
                  │ - hasNext: true            │
                  └────────────────────────────┘
                               │
                               │ 前端映射 + 价格格式化
                               ▼
                  ┌────────────────────────────┐
                  │ ProductCard[]              │
                  │ - id: uuid                 │
                  │ - name: "经典拿铁"          │
                  │ - price: "¥28.00"          │
                  │ - imageUrl: https://...    │
                  │ - badge: "推荐"             │
                  └────────────────────────────┘
                               │
                               │ 渲染到UI
                               ▼
                  ┌────────────────────────────┐
                  │ <ProductList>              │
                  │   <ProductCard />          │
                  │   <ProductCard />          │
                  │   ...                      │
                  └────────────────────────────┘
```

---

## 边界情况处理

### 价格字段边界情况

| 输入值 | 输出 | 说明 |
|--------|------|------|
| `2800` | `"¥28.00"` | 正常价格（分→元） |
| `0` | `"免费"` | 价格为0 |
| `null` | `"价格待定"` | 价格未设置 |
| `undefined` | `"价格待定"` | 价格未设置 |
| `-100` | ❌ 验证失败 | 负数价格无效 |

### 图片URL边界情况

| 输入值 | 输出 | 说明 |
|--------|------|------|
| `"https://storage.supabase.co/..."` | 原值 | 有效URL |
| `""` | `DEFAULT_PRODUCT_IMAGE` | 空字符串→占位图 |
| `null` | `DEFAULT_PRODUCT_IMAGE` | null→占位图 |
| `"invalid-url"` | ❌ 验证失败 | 无效URL |

### 分类筛选边界情况

| 场景 | categoryId 参数 | 行为 |
|------|----------------|------|
| 用户点击"全部" | 不传递参数 | 返回所有商品 |
| 用户点击"精品咖啡" | `categoryId={uuid}` | 返回该分类商品 |
| 分类无商品 | `categoryId={uuid}` | 返回 `data: []`, `total: 0` |
| 分类不存在 | `categoryId={invalid-uuid}` | 后端返回 404 或空数组 |

### 分页加载边界情况

| 场景 | page | pageSize | total | hasNext |
|------|------|----------|-------|---------|
| 第一页 | 1 | 20 | 50 | `true` |
| 最后一页 | 3 | 20 | 50 | `false` |
| 空列表 | 1 | 20 | 0 | `false` |
| 仅一页 | 1 | 20 | 15 | `false` |

---

## 数据关系

```
MenuCategoryDTO (1) ──────< (N) ChannelProductDTO
    │                               │
    │ (映射)                         │ (映射)
    ▼                               ▼
CategoryTab                    ProductCard
```

- 一个 `MenuCategoryDTO` 可以关联多个 `ChannelProductDTO`（通过 `categoryId`）
- 前端通过映射函数将后端 DTO 转换为 UI 组件需要的 Props 模型

---

## 持久化存储

### 本地缓存（Taro Storage）

| Key | Value Type | 说明 | 有效期 |
|-----|-----------|------|--------|
| `selected_category` | `string \| null` | 用户选中的分类ID | 永久 |
| `token` | `string` | JWT Token | 至过期 |

### TanStack Query 缓存

| Query Key | 数据类型 | staleTime | cacheTime |
|-----------|---------|-----------|-----------|
| `['menu-categories']` | `MenuCategoryDTO[]` | 30分钟 | 60分钟 |
| `['channel-products', categoryId]` | `ChannelProductDTO[]` | 5分钟 | 10分钟 |

---

## 类型导出结构

```typescript
// hall-reserve-taro/src/types/product.ts
export {
  ChannelProductDTO,
  ChannelProductDTOSchema,
  ProductCard,
  ProductListResponse,
  ProductListResponseSchema,
  mapToProductCard,
  formatPrice,
}

// hall-reserve-taro/src/types/category.ts
export {
  MenuCategoryDTO,
  MenuCategoryDTOSchema,
  CategoryTab,
  CategoryListResponse,
  CategoryListResponseSchema,
  mapToCategoryTab,
  createAllCategoryTab,
}
```

---

## 版本历史

| 版本 | 日期 | 修改内容 |
|------|------|---------|
| 1.0.0 | 2026-01-05 | 初始版本，定义核心实体和映射规则 |

---

**文档完成日期**: 2026-01-05
**下一步**: 创建 `contracts/api.yaml` 定义 API 契约
