# Research: P008 SKU 类型重构

**@spec P008-sku-type-refactor**
**Date**: 2026-01-10

## 1. 现有代码分析

### 1.1 后端 SKU 类型实现

#### SkuType 枚举 (已存在，保留)
**文件**: `backend/src/main/java/com/cinema/hallstore/domain/enums/SkuType.java`

```java
public enum SkuType {
    RAW_MATERIAL("raw_material"),
    PACKAGING("packaging"),
    FINISHED_PRODUCT("finished_product"),
    COMBO("combo");
}
```

#### SKU 实体 (保持不变)
**文件**: `backend/src/main/java/com/cinema/hallstore/domain/Sku.java`

```java
@Column(name = "sku_type", nullable = false, length = 20)
private SkuType skuType;
```

- SKU 的 `skuType` 字段使用 `SkuType` 枚举
- 通过 `SkuTypeJpaConverter` 自动转换为数据库字符串
- 创建时必填 (`nullable = false`)

#### SPU 实体 (需要移除 productType)
**文件**: `backend/src/main/java/com/cinema/hallstore/domain/Spu.java`

```java
@Column(name = "product_type", length = 20)
private String productType;  // 需要移除
```

- SPU 的 `productType` 是 String 类型，非枚举
- 注释声称 "SKU创建时继承此类型" 但未实现
- 存在与 SKU 的 `skuType` 冗余

### 1.2 前端类型定义

#### SKU 类型 (保留)
**文件**: `frontend/src/types/sku.ts`

```typescript
export enum SkuType {
  RAW_MATERIAL = 'raw_material',
  PACKAGING = 'packaging',
  FINISHED_PRODUCT = 'finished_product',
  COMBO = 'combo',
}

export const SKU_TYPE_CONFIG: Record<SkuType, { label: string; color: string }> = {
  [SkuType.RAW_MATERIAL]: { label: '原料', color: 'blue' },
  [SkuType.PACKAGING]: { label: '包材', color: 'purple' },
  [SkuType.FINISHED_PRODUCT]: { label: '成品', color: 'green' },
  [SkuType.COMBO]: { label: '套餐', color: 'orange' },
};
```

#### SPU 类型 (需要移除 productType)
**文件**: `frontend/src/types/spu.ts`

```typescript
export type ProductType = 'raw_material' | 'packaging' | 'finished_product' | 'combo';

export const PRODUCT_TYPE_OPTIONS = [
  { value: 'raw_material', label: '原料', color: 'blue' },
  { value: 'packaging', label: '包材', color: 'purple' },
  { value: 'finished_product', label: '成品', color: 'green' },
  { value: 'combo', label: '套餐', color: 'orange' },
];
```

### 1.3 现有 SKU 表单组件

**文件**: `frontend/src/components/sku/SkuForm/index.tsx`

- 使用 React Hook Form + Zod 验证
- 根据 SKU 类型显示/隐藏不同 Tab：
  - 成品 (FINISHED_PRODUCT): 显示 BOM 配置
  - 套餐 (COMBO): 显示套餐配置
  - 原料/包材: 隐藏 BOM 和套餐配置

**文件**: `frontend/src/components/sku/SkuForm/BasicInfoTab.tsx`

- 当前未显示 SKU 类型选择器
- 需要添加类型选择功能

## 2. 需要修改的文件清单

### 2.1 后端修改

| 文件 | 修改类型 | 说明 |
|------|---------|------|
| `Spu.java` | 删除字段 | 移除 `productType` 字段 |
| `SpuController.java` | 更新 | 移除 productType 相关参数和响应 |
| `SpuService.java` | 更新 | 移除 productType 相关逻辑 |
| `SkuController.java` | 更新 | 添加 skuType 更新禁止逻辑 |
| `SkuService.java` | 更新 | 添加 skuType 不可变校验 |

### 2.2 前端修改

| 文件 | 修改类型 | 说明 |
|------|---------|------|
| `frontend/src/types/spu.ts` | 更新 | 移除 ProductType 相关定义 |
| `frontend/src/services/spuService.ts` | 更新 | 移除 productType 字段处理 |
| `frontend/src/components/sku/SkuForm/BasicInfoTab.tsx` | 更新 | 添加 SKU 类型选择器 |
| `frontend/src/components/sku/SkuForm/schema.ts` | 更新 | 添加 skuType 必填校验 |
| SPU 表单组件 | 更新 | 移除产品类型选择器 |
| SPU 列表组件 | 更新 | 移除产品类型列 |

## 3. 数据迁移策略

### 3.1 不需要数据迁移

- **SPU.productType**: 后端忽略即可，数据库列保留
- **SKU.skuType**: 现有数据保持不变

### 3.2 兼容性考虑

- 前端请求不再发送 `productType`
- 后端响应不再返回 `productType`
- 旧数据查询时自动忽略 `productType`

## 4. SKU 类型业务规则

| 类型 | 中文 | 标准成本 | BOM 配置 | 套餐配置 |
|------|------|---------|---------|---------|
| RAW_MATERIAL | 原料 | 必填(手动输入) | 隐藏 | 隐藏 |
| PACKAGING | 包材 | 必填(手动输入) | 隐藏 | 隐藏 |
| FINISHED_PRODUCT | 成品 | 自动计算 | 必填 | 隐藏 |
| COMBO | 套餐 | 自动计算 | 隐藏 | 必填 |

## 5. API 变更总结

### 5.1 SPU API (移除 productType)

```diff
# POST /api/spu/create
- "product_type": "raw_material"

# GET /api/spu/{id}
- "product_type": "raw_material"

# PUT /api/spu/{id}
- "product_type": "raw_material"

# GET /api/spu/list
- "product_type": "raw_material"  (移除筛选参数)
```

### 5.2 SKU API (保持 skuType)

```yaml
# POST /api/skus
skuType: required  # 创建时必填

# PUT /api/skus/{id}
skuType: forbidden  # 更新时禁止修改，返回 400

# GET /api/skus/{id}
skuType: readonly  # 只读返回
```

## 6. 风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 前端遗漏 productType 引用 | 编译错误 | TypeScript 类型检查 |
| 后端 DTO 遗漏更新 | 序列化错误 | 单元测试覆盖 |
| 现有 SKU 无 skuType | 查询异常 | 数据验证脚本 |

## 7. 依赖关系

```
SkuType 枚举 (保留)
    │
    ├── Sku 实体
    │   └── SkuService
    │       └── SkuController
    │
    └── 前端 SkuForm
        ├── BasicInfoTab (添加类型选择器)
        └── schema.ts (添加验证)

SPU.productType (移除)
    │
    ├── Spu 实体
    │   └── SpuService
    │       └── SpuController
    │
    └── 前端 SPU 表单/列表
```
