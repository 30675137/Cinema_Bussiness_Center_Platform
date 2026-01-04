# Data Model: B端商品配置 - 动态菜单分类集成

**@spec O008-channel-product-category-migration**

**Date**: 2026-01-04

## Overview

本文档描述 `ChannelProductConfig` 实体从硬编码枚举到动态分类的数据模型变更。

## Entity Changes

### ChannelProductConfig (渠道商品配置)

**变更前**:
```typescript
export type ChannelProductConfig = {
  id: string;
  skuId: string;
  channelType: ChannelType;
  displayName: string | null;
  channelCategory: ChannelCategory;  // ❌ 删除
  channelPrice: number | null;
  mainImage: string | null;
  detailImages: string[];
  description: string | null;
  specs: ChannelProductSpec[];
  isRecommended: boolean;
  status: ChannelProductStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  sku?: SkuBasicInfo;
}
```

**变更后**:
```typescript
export type ChannelProductConfig = {
  id: string;
  skuId: string;
  channelType: ChannelType;
  displayName: string | null;
  categoryId: string;  // ✅ 新增: UUID，外键关联 menu_category.id
  channelPrice: number | null;
  mainImage: string | null;
  detailImages: string[];
  description: string | null;
  specs: ChannelProductSpec[];
  isRecommended: boolean;
  status: ChannelProductStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  sku?: SkuBasicInfo;
  category?: MenuCategoryDTO;  // ✅ 新增: 可选，查询时返回关联的分类信息
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `categoryId` | `string` (UUID) | 是 | 关联 `menu_category.id`，商品所属分类 |
| `category` | `MenuCategoryDTO` | 否 | 查询时可选返回完整分类信息（用于显示分类名称） |

### 删除的类型

```typescript
// ❌ 删除以下枚举和映射
export enum ChannelCategory {
  ALCOHOL = 'ALCOHOL',
  COFFEE = 'COFFEE',
  BEVERAGE = 'BEVERAGE',
  SNACK = 'SNACK',
  MEAL = 'MEAL',
  OTHER = 'OTHER',
}

export const CHANNEL_CATEGORY_LABELS: Record<ChannelCategory, string> = {
  [ChannelCategory.ALCOHOL]: '酒',
  [ChannelCategory.COFFEE]: '咖啡',
  [ChannelCategory.BEVERAGE]: '饮料',
  [ChannelCategory.SNACK]: '小食',
  [ChannelCategory.MEAL]: '餐品',
  [ChannelCategory.OTHER]: '其他',
};
```

## Request/Response DTOs

### CreateChannelProductRequest

**变更前**:
```typescript
export type CreateChannelProductRequest = {
  skuId: string;
  channelType?: ChannelType;
  displayName?: string;
  channelCategory: ChannelCategory;  // ❌ 删除
  // ... other fields
}
```

**变更后**:
```typescript
export type CreateChannelProductRequest = {
  skuId: string;
  channelType?: ChannelType;
  displayName?: string;
  categoryId: string;  // ✅ 新增: UUID
  channelPrice?: number;
  mainImage?: string;
  detailImages?: string[];
  description?: string;
  specs?: ChannelProductSpec[];
  isRecommended?: boolean;
  status?: ChannelProductStatus;
  sortOrder?: number;
}
```

### UpdateChannelProductRequest

**变更后**:
```typescript
export type UpdateChannelProductRequest = {
  displayName?: string;
  categoryId?: string;  // ✅ 新增: UUID
  channelPrice?: number | null;
  mainImage?: string | null;
  detailImages?: string[];
  description?: string | null;
  specs?: ChannelProductSpec[];
  isRecommended?: boolean;
  status?: ChannelProductStatus;
  sortOrder?: number;
}
```

### ChannelProductQueryParams

**变更后**:
```typescript
export type ChannelProductQueryParams = {
  channelType?: ChannelType;
  categoryId?: string;  // ✅ 改为 UUID
  status?: ChannelProductStatus;
  keyword?: string;
  page?: number;
  size?: number;
}
```

## Relationships

```
┌─────────────────────────┐       ┌─────────────────────────┐
│  ChannelProductConfig   │       │     MenuCategory        │
├─────────────────────────┤       ├─────────────────────────┤
│ id: UUID (PK)           │       │ id: UUID (PK)           │
│ skuId: UUID (FK)        │       │ code: string            │
│ categoryId: UUID (FK) ──┼──────>│ displayName: string     │
│ channelType: enum       │  N:1  │ sortOrder: number       │
│ displayName: string     │       │ isVisible: boolean      │
│ channelPrice: number    │       │ isDefault: boolean      │
│ status: enum            │       │ iconUrl: string         │
│ ...                     │       │ description: string     │
└─────────────────────────┘       └─────────────────────────┘
```

**关系说明**:
- `ChannelProductConfig.categoryId` → `MenuCategory.id` (Many-to-One)
- 一个商品配置关联一个分类
- 一个分类可以关联多个商品配置

## Validation Rules

### categoryId 验证

```typescript
import { z } from 'zod';

/**
 * 分类 ID 验证 Schema
 */
export const categoryIdSchema = z
  .string({ required_error: '请选择商品分类' })
  .uuid('无效的分类 ID 格式');

/**
 * 创建商品请求验证 Schema
 */
export const createChannelProductSchema = z.object({
  skuId: z.string().uuid('无效的 SKU ID'),
  categoryId: categoryIdSchema,
  channelType: z.nativeEnum(ChannelType).optional(),
  displayName: z.string().max(100).optional(),
  channelPrice: z.number().int().min(1).optional(),
  mainImage: z.string().url().optional().or(z.literal('')),
  detailImages: z.array(z.string().url()).optional(),
  description: z.string().max(500).optional(),
  specs: z.array(channelProductSpecSchema).optional(),
  isRecommended: z.boolean().optional(),
  status: z.nativeEnum(ChannelProductStatus).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

/**
 * 更新商品请求验证 Schema
 */
export const updateChannelProductSchema = z.object({
  categoryId: categoryIdSchema.optional(),
  displayName: z.string().max(100).optional(),
  channelPrice: z.number().int().min(1).nullable().optional(),
  mainImage: z.string().url().nullable().optional().or(z.literal('')),
  detailImages: z.array(z.string().url()).optional(),
  description: z.string().max(500).nullable().optional(),
  specs: z.array(channelProductSpecSchema).optional(),
  isRecommended: z.boolean().optional(),
  status: z.nativeEnum(ChannelProductStatus).optional(),
  sortOrder: z.number().int().min(0).optional(),
});
```

## Database Schema (参考)

> 注意：本功能主要是前端变更，以下为后端数据库 schema 参考

```sql
-- 商品配置表变更
ALTER TABLE channel_product_config
  DROP COLUMN channel_category,
  ADD COLUMN category_id UUID REFERENCES menu_category(id) ON DELETE SET NULL;

-- 为 category_id 创建索引
CREATE INDEX idx_channel_product_config_category_id
  ON channel_product_config(category_id);

-- 默认分类处理：删除分类时，商品自动迁移到默认分类
-- 由 O002 MenuCategory 删除逻辑处理
```

## Migration Notes

### 开发阶段策略

由于系统处于开发阶段，采用以下简化策略：

1. **直接删除旧字段**: 无需数据迁移脚本
2. **清理旧代码**: 删除 `ChannelCategory` 枚举及所有引用
3. **Mock 数据更新**: 更新 MSW handlers 使用 `categoryId`

### 清理清单

- [ ] 删除 `ChannelCategory` 枚举定义
- [ ] 删除 `CHANNEL_CATEGORY_LABELS` 映射
- [ ] 更新 `ChannelProductConfig` 类型
- [ ] 更新 `CreateChannelProductRequest` 类型
- [ ] 更新 `UpdateChannelProductRequest` 类型
- [ ] 更新 `ChannelProductQueryParams` 类型
- [ ] 更新 Zod 验证 Schema
- [ ] 更新 MSW mock handlers
