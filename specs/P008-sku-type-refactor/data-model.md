# Data Model: P008 SKU 类型重构

**@spec P008-sku-type-refactor**
**Date**: 2026-01-10

## 1. 变更概述

本次重构主要修改两个实体：
- **SPU**: 移除 `productType` 字段
- **SKU**: 保持 `skuType` 字段，增强类型管理逻辑

## 2. 数据模型变更

### 2.1 SKU 实体 (保持不变)

```java
/**
 * @spec P008-sku-type-refactor
 * SKU 实体 - 库存单元
 */
@Entity
@Table(name = "sku")
public class Sku {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "spu_id", nullable = false)
    private String spuId;

    /**
     * SKU 类型 - 决定业务规则
     * - RAW_MATERIAL: 原料 (需手动输入标准成本)
     * - PACKAGING: 包材 (需手动输入标准成本)
     * - FINISHED_PRODUCT: 成品 (需配置 BOM，成本自动计算)
     * - COMBO: 套餐 (需配置套餐子项)
     */
    @Column(name = "sku_type", nullable = false, length = 20)
    private SkuType skuType;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "code", nullable = false, unique = true)
    private String code;

    @Column(name = "standard_cost", precision = 10, scale = 2)
    private BigDecimal standardCost;

    // ... 其他字段
}
```

### 2.2 SPU 实体 (移除 productType)

```diff
@Entity
@Table(name = "spu")
public class Spu {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "code", nullable = false, unique = true)
    private String code;

-   /**
-    * 产品类型: raw_material-原料, packaging-包材,
-    * finished_product-成品, combo-套餐
-    * SKU创建时继承此类型
-    */
-   @Column(name = "product_type", length = 20)
-   private String productType;

    @Column(name = "brand_id")
    private String brandId;

    @Column(name = "category_id")
    private String categoryId;

    // ... 其他字段保持不变
}
```

### 2.3 SkuType 枚举 (保持不变)

```java
/**
 * @spec P008-sku-type-refactor
 * SKU 类型枚举
 */
public enum SkuType {
    RAW_MATERIAL("raw_material"),      // 原料
    PACKAGING("packaging"),             // 包材
    FINISHED_PRODUCT("finished_product"), // 成品
    COMBO("combo");                     // 套餐

    private final String value;

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static SkuType fromValue(String value) {
        for (SkuType type : values()) {
            if (type.value.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown SkuType: " + value);
    }
}
```

## 3. 数据库变更

### 3.1 无 DDL 变更

SPU 表的 `product_type` 列保留，不做物理删除：

```sql
-- 不执行任何 DDL 变更
-- SPU 表的 product_type 列继续存在，但后端代码不再读写
```

### 3.2 数据验证脚本

```sql
-- 检查所有 SKU 是否都有有效的 sku_type
SELECT COUNT(*) AS invalid_count
FROM sku
WHERE sku_type IS NULL
   OR sku_type NOT IN ('raw_material', 'packaging', 'finished_product', 'combo');

-- 预期结果: 0
```

## 4. DTO 变更

### 4.1 SKU 创建请求 (保持 skuType 必填)

```java
/**
 * @spec P008-sku-type-refactor
 */
public class SkuCreateRequest {

    @NotNull(message = "SKU类型不能为空")
    private SkuType skuType;

    @NotBlank(message = "SPU ID不能为空")
    private String spuId;

    @NotBlank(message = "SKU名称不能为空")
    private String name;

    // 根据 skuType 条件必填
    private BigDecimal standardCost;

    // 成品类型必填
    private List<BomComponentInput> bomComponents;

    // 套餐类型必填
    private List<ComboItemInput> comboItems;
}
```

### 4.2 SKU 更新请求 (禁止修改 skuType)

```java
/**
 * @spec P008-sku-type-refactor
 */
public class SkuUpdateRequest {

    // 不包含 skuType 字段 - 禁止修改

    private String name;
    private BigDecimal standardCost;
    private List<BomComponentInput> bomComponents;
    private List<ComboItemInput> comboItems;
}
```

### 4.3 SPU 请求/响应 (移除 productType)

```diff
public class SpuCreateRequest {
    @NotBlank
    private String name;

-   private String productType;

    private String brandId;
    private String categoryId;
    // ...
}

public class SpuResponse {
    private String id;
    private String name;

-   private String productType;

    private String brandId;
    private String categoryId;
    // ...
}
```

## 5. 前端类型变更

### 5.1 SKU 类型 (保持)

```typescript
// frontend/src/types/sku.ts

export enum SkuType {
  RAW_MATERIAL = 'raw_material',
  PACKAGING = 'packaging',
  FINISHED_PRODUCT = 'finished_product',
  COMBO = 'combo',
}

export const SKU_TYPE_CONFIG: Record<SkuType, { label: string; color: string; description: string }> = {
  [SkuType.RAW_MATERIAL]: {
    label: '原料',
    color: 'blue',
    description: '需手动输入标准成本'
  },
  [SkuType.PACKAGING]: {
    label: '包材',
    color: 'purple',
    description: '需手动输入标准成本'
  },
  [SkuType.FINISHED_PRODUCT]: {
    label: '成品',
    color: 'green',
    description: '需配置 BOM，成本自动计算'
  },
  [SkuType.COMBO]: {
    label: '套餐',
    color: 'orange',
    description: '需配置套餐子项'
  },
};
```

### 5.2 SPU 类型 (移除 productType)

```diff
// frontend/src/types/spu.ts

-export type ProductType = 'raw_material' | 'packaging' | 'finished_product' | 'combo';

-export const PRODUCT_TYPE_OPTIONS = [
-  { value: 'raw_material', label: '原料', color: 'blue' },
-  { value: 'packaging', label: '包材', color: 'purple' },
-  { value: 'finished_product', label: '成品', color: 'green' },
-  { value: 'combo', label: '套餐', color: 'orange' },
-];

export interface SPUItem {
  id: string;
  name: string;
  code: string;
- productType?: ProductType;
  brandId: string;
  categoryId: string;
  // ...
}

export interface SPUCreationForm {
  name: string;
- productType: ProductType;
  brandId: string;
  categoryId: string;
  // ...
}
```

## 6. 业务规则映射

| SkuType | 标准成本 | BOM 配置 | 套餐配置 | 损耗率 |
|---------|---------|---------|---------|--------|
| RAW_MATERIAL | 必填 (手动) | - | - | - |
| PACKAGING | 必填 (手动) | - | - | - |
| FINISHED_PRODUCT | 自动计算 | 必填 | - | 可选 |
| COMBO | 自动计算 | - | 必填 | - |

## 7. 迁移清单

### 7.1 后端

- [ ] Spu.java - 移除 productType 字段
- [ ] SpuController.java - 移除 productType 参数
- [ ] SpuService.java - 移除 productType 逻辑
- [ ] SpuDTO 类 - 移除 productType 字段
- [ ] SkuController.java - 添加 skuType 不可变校验
- [ ] SkuService.java - 添加 skuType 不可变校验

### 7.2 前端

- [ ] types/spu.ts - 移除 ProductType 定义
- [ ] services/spuService.ts - 移除 productType 处理
- [ ] SPU 表单组件 - 移除产品类型选择器
- [ ] SPU 列表组件 - 移除产品类型列
- [ ] SkuForm/BasicInfoTab.tsx - 添加 SKU 类型选择器
- [ ] SkuForm/schema.ts - 添加 skuType 必填校验
