# Data Model: SKU编辑页面数据加载修复

**Feature**: P006-fix-sku-edit-data
**Created**: 2025-12-31
**Status**: Design Phase

## Overview

本文档定义 SKU 编辑页面数据加载修复功能所涉及的数据模型、验证规则、状态转换和数据关系。

## Core Entities

### 1. SKU (Stock Keeping Unit)

库存量单位，代表可销售的具体商品规格。

#### TypeScript Interface

```typescript
/**
 * @spec P006-fix-sku-edit-data
 * SKU 实体 - 库存量单位
 */
export interface SKU {
  /** 主键ID */
  id: string;

  /** SKU编码，唯一标识（如 FIN-COCKTAIL） */
  code: string;

  /** SKU名称 */
  name: string;

  /** 销售价格（单位：分） */
  price: number;

  /** 库存数量 */
  stockQuantity: number;

  /** 状态（active | inactive | deleted） */
  status: SKUStatus;

  /** 关联的SPU ID（可为空） */
  spuId: string | null;

  /** 乐观锁版本号（用于并发冲突检测） */
  version: number;

  /** 创建时间 */
  createdAt: string;

  /** 更新时间 */
  updatedAt: string;

  /** 创建人ID */
  createdBy: string;

  /** 更新人ID */
  updatedBy: string;
}

export type SKUStatus = 'active' | 'inactive' | 'deleted';
```

#### Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| `code` | 必填，格式：`/^[A-Z0-9-]+$/`，长度 3-50 | "SKU编码格式无效，仅支持大写字母、数字和连字符" |
| `name` | 必填，长度 1-100 | "SKU名称不能为空且不超过100字符" |
| `price` | 必填，>= 0 | "价格不能为负数" |
| `stockQuantity` | 必填，>= 0 | "库存数量不能为负数" |
| `status` | 必填，枚举值 | "状态必须为 active、inactive 或 deleted" |
| `version` | 自动管理，不可手动修改 | "版本号由系统自动维护" |

#### State Transitions

```
┌─────────┐
│ active  │ ◄─┐
└────┬────┘   │
     │        │
     ▼        │
┌─────────┐   │
│inactive │───┘
└────┬────┘
     │
     ▼
┌─────────┐
│ deleted │
└─────────┘
```

**允许的转换**:
- `active` → `inactive` (下架)
- `inactive` → `active` (重新上架)
- `inactive` → `deleted` (删除，软删除)
- ❌ `deleted` → `active/inactive` (禁止复活已删除SKU)

---

### 2. SPU (Standard Product Unit)

标准产品单元，代表产品的抽象概念。

#### TypeScript Interface

```typescript
/**
 * @spec P006-fix-sku-edit-data
 * SPU 实体 - 标准产品单元
 */
export interface SPU {
  /** 主键ID */
  id: string;

  /** 产品名称 */
  name: string;

  /** 产品分类ID */
  categoryId: string;

  /** 品牌ID（可选） */
  brandId: string | null;

  /** 产品描述 */
  description: string;

  /** 状态（valid | invalid） */
  status: SPUStatus;

  /** 创建时间 */
  createdAt: string;

  /** 更新时间 */
  updatedAt: string;
}

export type SPUStatus = 'valid' | 'invalid';
```

#### Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| `name` | 必填，长度 1-200 | "SPU名称不能为空且不超过200字符" |
| `categoryId` | 必填，必须引用存在的分类 | "产品分类不存在" |
| `brandId` | 可选，如有则必须引用存在的品牌 | "品牌不存在" |
| `description` | 可选，长度 0-2000 | "描述不超过2000字符" |
| `status` | 必填，枚举值 | "状态必须为 valid 或 invalid" |

#### State Transitions

```
┌───────┐
│ valid │ ◄──►
└───────┘     │
              ▼
         ┌─────────┐
         │ invalid │
         └─────────┘
```

**允许的转换**:
- `valid` ↔ `invalid` (双向转换，SPU可启用/禁用)

---

### 3. BOM (Bill of Materials)

物料清单/配方，定义成品SKU由哪些原料SKU组成。

#### TypeScript Interface

```typescript
/**
 * @spec P006-fix-sku-edit-data
 * BOM 实体 - 物料清单/配方
 */
export interface BOM {
  /** 主键ID */
  id: string;

  /** 关联的成品SKU ID */
  skuId: string;

  /** 配方名称（可选） */
  name: string | null;

  /** 损耗率（百分比，如 5 表示 5%） */
  wasteRate: number;

  /** 状态（active | inactive） */
  status: BOMStatus;

  /** BOM组成项列表 */
  components: BOMComponent[];

  /** 创建时间 */
  createdAt: string;

  /** 更新时间 */
  updatedAt: string;
}

export type BOMStatus = 'active' | 'inactive';
```

#### Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| `skuId` | 必填，必须引用存在的SKU | "关联的SKU不存在" |
| `name` | 可选，长度 0-100 | "配方名称不超过100字符" |
| `wasteRate` | 必填，>= 0 && <= 100 | "损耗率必须在 0-100 之间" |
| `status` | 必填，枚举值 | "状态必须为 active 或 inactive" |
| `components` | 必填，至少包含1个组成项 | "BOM必须至少包含一个原料" |

#### State Transitions

```
┌────────┐
│ active │ ◄──►
└────────┘     │
               ▼
          ┌──────────┐
          │ inactive │
          └──────────┘
```

**允许的转换**:
- `active` ↔ `inactive` (双向转换，配方可启用/禁用)

---

### 4. BOMComponent

BOM配方组成项，代表配方中的一条原料记录。

#### TypeScript Interface

```typescript
/**
 * @spec P006-fix-sku-edit-data
 * BOM组成项 - 配方中的原料记录
 */
export interface BOMComponent {
  /** 主键ID */
  id: string;

  /** 关联的BOM ID */
  bomId: string;

  /** 原料SKU ID */
  ingredientSkuId: string;

  /** 原料SKU编码（冗余字段，用于显示） */
  ingredientSkuCode: string;

  /** 原料SKU名称（冗余字段，用于显示） */
  ingredientSkuName: string;

  /** 用量 */
  quantity: number;

  /** 单位（ml | g | kg | 个 | 瓶 | 升） */
  unit: string;

  /** 标准成本（单位：分，可选） */
  standardCost: number | null;

  /** 状态（valid | invalid） */
  status: BOMComponentStatus;

  /** 排序顺序 */
  sortOrder: number;

  /** 创建时间 */
  createdAt: string;

  /** 更新时间 */
  updatedAt: string;
}

export type BOMComponentStatus = 'valid' | 'invalid';
```

#### Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| `bomId` | 必填，必须引用存在的BOM | "关联的BOM不存在" |
| `ingredientSkuId` | 必填，必须引用存在的SKU | "原料SKU不存在" |
| `quantity` | 必填，> 0 | "用量必须大于0" |
| `unit` | 必填，枚举值 | "单位必须为 ml、g、kg、个、瓶或升" |
| `standardCost` | 可选，>= 0 | "标准成本不能为负数" |
| `status` | 必填，枚举值 | "状态必须为 valid 或 invalid" |
| `sortOrder` | 必填，>= 0 | "排序顺序不能为负数" |

#### State Transitions

```
┌───────┐
│ valid │ ◄──►
└───────┘     │
              ▼
         ┌─────────┐
         │ invalid │
         └─────────┘
```

**允许的转换**:
- `valid` ↔ `invalid` (双向转换，原料可标记为失效/恢复)

---

## Response DTOs

### SKUDetailResponse

SKU编辑页面加载时的聚合响应数据。

#### TypeScript Interface

```typescript
/**
 * @spec P006-fix-sku-edit-data
 * SKU详情聚合响应 - 包含SKU、SPU、BOM数据
 */
export interface SKUDetailResponse {
  /** SKU基本信息 */
  sku: SKU;

  /** 关联的SPU信息（可为null） */
  spu: SPU | null;

  /** 关联的BOM配方（可为null） */
  bom: BOM | null;

  /** 加载元数据（标识各部分数据加载状态） */
  metadata: {
    /** SPU加载是否成功 */
    spuLoadSuccess: boolean;

    /** BOM加载是否成功 */
    bomLoadSuccess: boolean;

    /** SPU状态（valid=有效，invalid=失效，not_linked=未关联） */
    spuStatus: 'valid' | 'invalid' | 'not_linked';

    /** BOM状态（active=有效，inactive=禁用，not_configured=未配置） */
    bomStatus: 'active' | 'inactive' | 'not_configured';
  };
}
```

#### Metadata Field Logic

| Scenario | `spuLoadSuccess` | `bomLoadSuccess` | `spuStatus` | `bomStatus` |
|----------|------------------|------------------|-------------|-------------|
| SKU无关联SPU | `true` | `true` | `not_linked` | `not_configured` |
| SKU有SPU且加载成功 | `true` | `true` | `valid` | `active` |
| SPU已删除（脏数据） | `false` | `true` | `invalid` | `active` |
| BOM加载失败（网络错误） | `true` | `false` | `valid` | `not_configured` |
| 完全加载失败 | `false` | `false` | `not_linked` | `not_configured` |

---

### SKUUpdateRequest

更新SKU时的请求数据（包含并发冲突检测）。

#### TypeScript Interface

```typescript
/**
 * @spec P006-fix-sku-edit-data
 * SKU更新请求 - 包含乐观锁版本号
 */
export interface SKUUpdateRequest {
  /** SKU编码（可选，通常不允许修改） */
  code?: string;

  /** SKU名称 */
  name?: string;

  /** 销售价格（单位：分） */
  price?: number;

  /** 库存数量 */
  stockQuantity?: number;

  /** 状态 */
  status?: SKUStatus;

  /** 关联的SPU ID */
  spuId?: string | null;

  /** 乐观锁版本号（用于并发冲突检测，必填） */
  version: number;
}
```

#### Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| `version` | 必填，必须与数据库中当前版本匹配 | "数据已被其他用户修改，请刷新后重试" |
| `price` | 可选，>= 0 | "价格不能为负数" |
| `stockQuantity` | 可选，>= 0 | "库存数量不能为负数" |
| `status` | 可选，枚举值 | "状态必须为 active、inactive 或 deleted" |

---

## Entity Relationships

### 关系图

```
┌─────────────┐
│     SPU     │
│ (1对多)     │
└──────┬──────┘
       │
       │ spuId
       │
       ▼
┌─────────────┐         ┌─────────────┐
│     SKU     │ ◄─────► │     BOM     │
│             │  skuId  │ (1对1)      │
└─────────────┘         └──────┬──────┘
                               │
                               │ bomId
                               │
                               ▼
                        ┌─────────────────┐
                        │  BOMComponent   │
                        │  (1对多)        │
                        └──────┬──────────┘
                               │
                               │ ingredientSkuId
                               │
                               ▼
                        ┌─────────────┐
                        │     SKU     │
                        │  (原料SKU)  │
                        └─────────────┘
```

### 关系说明

1. **SPU → SKU** (一对多)
   - 一个 SPU 可以对应多个 SKU（如"威士忌可乐鸡尾酒"SPU → "500ml瓶装"、"1L桶装"等SKU）
   - SKU 的 `spuId` 字段可为 `null`（表示未关联SPU）

2. **SKU → BOM** (一对一)
   - 一个成品 SKU 只能关联一个 BOM 配方
   - BOM 的 `skuId` 字段必须唯一（数据库唯一索引）

3. **BOM → BOMComponent** (一对多)
   - 一个 BOM 配方包含多个原料组成项
   - BOMComponent 的 `bomId` 字段引用 BOM

4. **BOMComponent → SKU** (多对一)
   - 每个 BOM 组成项引用一个原料 SKU
   - 同一原料 SKU 可以在多个不同的 BOM 中使用
   - BOMComponent 的 `ingredientSkuId` 字段引用原料 SKU

### 数据完整性约束

| Constraint | Rule |
|------------|------|
| SKU.spuId | FOREIGN KEY 引用 SPU.id，允许 NULL |
| BOM.skuId | FOREIGN KEY 引用 SKU.id，NOT NULL，UNIQUE |
| BOMComponent.bomId | FOREIGN KEY 引用 BOM.id，NOT NULL |
| BOMComponent.ingredientSkuId | FOREIGN KEY 引用 SKU.id，NOT NULL |
| SKU.version | JPA `@Version` 注解，自动递增 |

---

## Validation Error Responses

### 错误编号规范

按照 R8.8 规则，错误编号格式为 `<模块前缀>_<类别>_<序号>`。

| 错误编号 | HTTP状态码 | 场景 | 消息示例 |
|---------|-----------|------|---------|
| `SKU_NTF_001` | 404 | SKU不存在 | "SKU不存在，请检查SKU ID" |
| `SKU_VAL_001` | 400 | SKU编码格式无效 | "SKU编码格式无效，仅支持大写字母、数字和连字符" |
| `SKU_VAL_002` | 400 | 价格为负数 | "价格不能为负数" |
| `SKU_VAL_003` | 400 | 库存数量为负数 | "库存数量不能为负数" |
| `SKU_BIZ_001` | 422 | 并发冲突（版本号不匹配） | "数据已被其他用户修改，请刷新后重试" |
| `SKU_BIZ_002` | 422 | 禁止复活已删除SKU | "已删除的SKU不能重新启用" |
| `SPU_NTF_001` | 404 | SPU不存在 | "SPU不存在或已失效" |
| `BOM_NTF_001` | 404 | BOM不存在 | "BOM配方不存在" |
| `BOM_VAL_001` | 400 | 损耗率超出范围 | "损耗率必须在 0-100 之间" |
| `BOM_VAL_002` | 400 | 配方无原料 | "BOM必须至少包含一个原料" |
| `CMP_VAL_001` | 400 | 原料用量无效 | "原料用量必须大于0" |
| `CMP_NTF_001` | 404 | 原料SKU不存在 | "原料SKU不存在或已失效" |

### 错误响应示例

```json
{
  "success": false,
  "error": "SKU_BIZ_001",
  "message": "数据已被其他用户修改，请刷新后重试",
  "details": {
    "expectedVersion": 5,
    "actualVersion": 7
  },
  "timestamp": "2025-12-31T10:30:00Z"
}
```

---

## Performance Considerations

### 虚拟滚动触发条件

按照 NFR-003 要求，当 BOM 配方包含超过 10 种原料时，必须使用虚拟滚动技术。

```typescript
/**
 * @spec P006-fix-sku-edit-data
 * 判断是否需要启用虚拟滚动
 */
export const shouldUseVirtualScrolling = (bom: BOM | null): boolean => {
  if (!bom || !bom.components) return false;
  return bom.components.length > 10;
};
```

### 数据缓存策略

按照研究决策，前端使用 TanStack Query 2分钟缓存：

```typescript
/**
 * @spec P006-fix-sku-edit-data
 * SKU编辑数据查询配置
 */
export const SKU_EDIT_QUERY_CONFIG = {
  staleTime: 2 * 60 * 1000, // 2分钟
  cacheTime: 5 * 60 * 1000, // 5分钟
  retry: 2, // 失败重试2次
  retryDelay: 1000, // 重试间隔1秒
};
```

---

## Database Schema Migration

### 新增字段（乐观锁）

```sql
-- 为 SKU 表添加版本号字段（用于并发冲突检测）
ALTER TABLE sku ADD COLUMN version INTEGER NOT NULL DEFAULT 0;

-- 创建索引（优化查询性能）
CREATE INDEX idx_sku_spu_id ON sku(spu_id);
CREATE INDEX idx_bom_sku_id ON bom(sku_id);
CREATE INDEX idx_bom_component_bom_id ON bom_component(bom_id);
CREATE INDEX idx_bom_component_ingredient_sku_id ON bom_component(ingredient_sku_id);
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-31 | 初始版本：定义SKU、SPU、BOM、BOMComponent实体及验证规则 |

---

**Related Documents**:
- [Feature Specification](spec.md)
- [Implementation Plan](plan.md)
- [Research Decisions](research.md)
- [API Contracts](contracts/api.yaml)
- [Quick Start Guide](quickstart.md)
