# 数据模型：SKU 管理

**功能**: SKU 管理  
**创建日期**: 2025-01-27  
**版本**: 1.0.0

## 概述

本文档定义 SKU 管理功能涉及的所有数据实体、字段、关系和验证规则。所有数据操作通过前端 Mock 服务实现，不依赖后端数据库。

## 核心实体

### SKU (Stock Keeping Unit)

SKU 是可计库存/可售的最小商品单元，是商品中心的基础数据单元。

#### 字段定义

| 字段名 | 类型 | 必填 | 说明 | 验证规则 |
|--------|------|------|------|----------|
| `id` | `string` | 是 | SKU唯一标识符 | UUID格式，系统自动生成 |
| `code` | `string` | 是 | SKU编码 | 系统自动生成，唯一 |
| `name` | `string` | 是 | SKU名称 | 长度1-200字符 |
| `spuId` | `string` | 是 | 所属SPU ID | 必须关联到已存在的SPU |
| `spuName` | `string` | 是 | 所属SPU名称 | 继承自SPU |
| `brand` | `string` | 否 | 品牌 | 继承自SPU，只读 |
| `category` | `string` | 否 | 类目 | 继承自SPU，只读 |
| `spec` | `string` | 否 | 规格/型号 | 长度0-200字符 |
| `mainUnit` | `string` | 是 | 主库存单位 | 从单位管理模块选择 |
| `mainBarcode` | `string` | 是 | 主条码 | 唯一，不能与其他SKU重复，格式校验（长度、字符类型） |
| `otherBarcodes` | `Barcode[]` | 否 | 其他条码列表 | 每个条码必须唯一 |
| `salesUnits` | `SalesUnit[]` | 否 | 销售单位配置 | 每个销售单位需配置换算关系 |
| `manageInventory` | `boolean` | 是 | 是否管理库存 | 默认值：true |
| `allowNegativeStock` | `boolean` | 是 | 是否允许负库存 | 默认值：false |
| `minOrderQty` | `number` | 否 | 最小起订量 | 必须 > 0（如果提供） |
| `minSaleQty` | `number` | 否 | 最小销售量 | 必须 > 0（如果提供） |
| `status` | `'draft' \| 'enabled' \| 'disabled'` | 是 | 状态 | 默认值：'draft' |
| `createdAt` | `string` | 是 | 创建时间 | ISO 8601格式 |
| `updatedAt` | `string` | 是 | 更新时间 | ISO 8601格式 |
| `createdBy` | `string` | 是 | 创建人 | Mock用户ID |
| `updatedBy` | `string` | 是 | 更新人 | Mock用户ID |

#### 状态转换

```
draft → enabled (用户手动启用)
draft → disabled (用户手动停用)
enabled → disabled (用户手动停用)
disabled → enabled (用户手动启用)
```

#### 业务规则

1. **SPU关联**: SKU必须关联到一个已存在的SPU，选择SPU后自动继承品牌和类目
2. **条码唯一性**: 主条码和其他条码都必须唯一，不能与其他SKU重复
3. **单位配置**: 主库存单位必填，销售单位可选，每个销售单位需配置与主库存单位的换算关系（必须 > 0）
4. **状态管理**: 新建SKU默认为"草稿"状态，需要手动启用
5. **库存管理**: 默认管理库存，虚拟/权益类商品可设置为不管理库存

### Barcode (条码)

条码实体，用于表示SKU的条码信息。

#### 字段定义

| 字段名 | 类型 | 必填 | 说明 | 验证规则 |
|--------|------|------|------|----------|
| `id` | `string` | 是 | 条码唯一标识符 | UUID格式 |
| `barcode` | `string` | 是 | 条码值 | 唯一，不能与其他SKU重复，格式校验 |
| `remark` | `string` | 否 | 备注 | 长度0-200字符 |

### SalesUnit (销售单位)

销售单位配置，定义SKU的销售单位及其与主库存单位的换算关系。

#### 字段定义

| 字段名 | 类型 | 必填 | 说明 | 验证规则 |
|--------|------|------|------|----------|
| `id` | `string` | 是 | 销售单位配置唯一标识符 | UUID格式 |
| `unit` | `string` | 是 | 销售单位名称 | 从单位管理模块选择 |
| `conversionRate` | `number` | 是 | 换算关系 | 1 销售单位 = X 主库存单位，必须 > 0 |
| `enabled` | `boolean` | 是 | 是否启用 | 默认值：true |

### SPU (Standard Product Unit)

标准产品单元，SKU的父级实体。本功能依赖SPU管理模块，但不在此定义详细结构。

#### 关联关系

- SKU `belongsTo` SPU (多对一)
- 选择SPU后，SKU自动继承SPU的品牌和类目信息

### Unit (单位)

商品计量单位。本功能依赖单位管理模块，但不在此定义详细结构。

#### 关联关系

- SKU `uses` Unit (主库存单位，多对一)
- SKU `uses` Unit (销售单位，多对多，通过SalesUnit配置)

## 查询参数

### SkuQueryParams (SKU查询参数)

用于SKU列表的筛选、搜索、分页和排序。

#### 字段定义

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `keyword` | `string` | 否 | 关键字搜索（匹配SKU编码、名称、主条码） |
| `spuId` | `string` | 否 | 所属SPU筛选 |
| `brand` | `string` | 否 | 品牌筛选 |
| `category` | `string` | 否 | 类目筛选 |
| `status` | `'draft' \| 'enabled' \| 'disabled'` | 否 | 状态筛选 |
| `manageInventory` | `boolean` | 否 | 是否管理库存筛选 |
| `page` | `number` | 否 | 页码（从1开始） |
| `pageSize` | `number` | 否 | 每页数量（默认20） |
| `sortField` | `string` | 否 | 排序字段（如：createdAt, status） |
| `sortOrder` | `'asc' \| 'desc'` | 否 | 排序方向 |

## 类型定义 (TypeScript)

```typescript
// SKU状态枚举
export enum SkuStatus {
  DRAFT = 'draft',
  ENABLED = 'enabled',
  DISABLED = 'disabled'
}

// 条码实体
export interface Barcode {
  id: string;
  barcode: string;
  remark?: string;
}

// 销售单位配置
export interface SalesUnit {
  id: string;
  unit: string;
  conversionRate: number; // 1 销售单位 = X 主库存单位
  enabled: boolean;
}

// SKU实体
export interface SKU {
  id: string;
  code: string;
  name: string;
  spuId: string;
  spuName: string;
  brand?: string;
  category?: string;
  spec?: string;
  mainUnit: string;
  mainBarcode: string;
  otherBarcodes: Barcode[];
  salesUnits: SalesUnit[];
  manageInventory: boolean;
  allowNegativeStock: boolean;
  minOrderQty?: number;
  minSaleQty?: number;
  status: SkuStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// SKU查询参数
export interface SkuQueryParams {
  keyword?: string;
  spuId?: string;
  brand?: string;
  category?: string;
  status?: SkuStatus;
  manageInventory?: boolean;
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

// SKU列表响应
export interface SkuListResponse {
  items: SKU[];
  total: number;
  page: number;
  pageSize: number;
}

// SKU创建/更新请求
export interface SkuCreateRequest {
  name: string;
  spuId: string;
  spec?: string;
  mainUnit: string;
  mainBarcode: string;
  otherBarcodes?: Omit<Barcode, 'id'>[];
  salesUnits?: Omit<SalesUnit, 'id'>[];
  manageInventory?: boolean;
  allowNegativeStock?: boolean;
  minOrderQty?: number;
  minSaleQty?: number;
  status?: SkuStatus;
}

export interface SkuUpdateRequest extends Partial<SkuCreateRequest> {
  id: string;
}
```

## 验证规则汇总

### SKU创建/更新验证

1. **必填字段验证**:
   - `name`: 不能为空，长度1-200字符
   - `spuId`: 必须选择已存在的SPU
   - `mainUnit`: 必须选择主库存单位
   - `mainBarcode`: 不能为空，格式校验通过

2. **唯一性验证**:
   - `mainBarcode`: 不能与其他SKU的主条码或其他条码重复
   - `otherBarcodes[].barcode`: 每个条码不能与其他SKU的条码重复

3. **格式验证**:
   - `mainBarcode`: 长度和字符类型校验（前端基础检查）
   - `otherBarcodes[].barcode`: 长度和字符类型校验

4. **数值验证**:
   - `salesUnits[].conversionRate`: 必须 > 0
   - `minOrderQty`: 如果提供，必须 > 0
   - `minSaleQty`: 如果提供，必须 > 0

5. **业务规则验证**:
   - SPU必须已存在
   - 条码唯一性检查（通过Mock API）

## Mock数据生成规则

### 数据规模

- 生成1000条SKU记录
- 关联到50-100个不同的SPU
- 每个SKU配置1-3个销售单位
- 每个SKU配置0-2个其他条码

### 数据分布

- **状态分布**: 草稿20%，启用60%，停用20%
- **库存管理**: 90%管理库存，10%不管理库存
- **负库存**: 80%不允许负库存，20%允许负库存

### 数据关联

- SKU与SPU的关联关系：每个SPU关联5-20个SKU
- SKU与单位的关联关系：主库存单位从预定义单位列表中选择
- 销售单位配置：从预定义单位列表中选择，换算关系随机生成（1-100之间）

## 数据一致性要求

1. **SPU关联一致性**: SKU的spuId必须指向已存在的SPU
2. **品牌类目一致性**: SKU的品牌和类目必须与所属SPU保持一致
3. **条码唯一性**: 所有SKU的条码（主条码+其他条码）必须全局唯一
4. **单位有效性**: SKU使用的主库存单位和销售单位必须来自单位管理模块的有效单位列表
