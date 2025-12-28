# Data Model: P003-inventory-query

**Date**: 2025-12-26
**Spec**: [spec.md](./spec.md)

## Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│   stores    │     │ store_inventory │     │    skus     │
├─────────────┤     ├─────────────────┤     ├─────────────┤
│ id (PK)     │◄────│ store_id (FK)   │     │ id (PK)     │
│ code        │     │ sku_id (FK)     │────►│ code        │
│ name        │     │ on_hand_qty     │     │ name        │
│ region      │     │ available_qty   │     │ main_unit   │
│ status      │     │ reserved_qty    │     │ category_id │──┐
└─────────────┘     │ safety_stock    │     │ status      │  │
                    │ updated_at      │     └─────────────┘  │
                    └─────────────────┘                      │
                                                             │
                    ┌─────────────────┐                      │
                    │   categories    │◄─────────────────────┘
                    ├─────────────────┤
                    │ id (PK)         │
                    │ code            │
                    │ name            │
                    │ parent_id (FK)  │
                    │ level           │
                    └─────────────────┘
```

## Entities

### 1. store_inventory (门店库存表) - 新建

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | 主键 |
| store_id | UUID | FK → stores.id, NOT NULL | 门店ID |
| sku_id | UUID | FK → skus.id, NOT NULL | SKU ID |
| on_hand_qty | DECIMAL(12,3) | NOT NULL, DEFAULT 0 | 现存数量 |
| available_qty | DECIMAL(12,3) | NOT NULL, DEFAULT 0 | 可用数量 |
| reserved_qty | DECIMAL(12,3) | NOT NULL, DEFAULT 0 | 预占数量 |
| safety_stock | DECIMAL(12,3) | DEFAULT 0 | 安全库存阈值 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 最后更新时间 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 创建时间 |

**Unique Constraint**: (store_id, sku_id)

**Computed Fields** (in API response):
- `inventory_status`: 根据 available_qty 和 safety_stock 计算的五级状态

**Status Calculation Logic**:
```sql
CASE
  WHEN available_qty = 0 THEN 'OUT_OF_STOCK'
  WHEN available_qty < safety_stock * 0.5 THEN 'LOW'
  WHEN available_qty < safety_stock THEN 'BELOW_THRESHOLD'
  WHEN available_qty < safety_stock * 2 THEN 'NORMAL'
  ELSE 'SUFFICIENT'
END
```

### 2. categories (商品分类表) - 新建

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | 主键 |
| code | VARCHAR(50) | UNIQUE, NOT NULL | 分类编码 |
| name | VARCHAR(100) | NOT NULL | 分类名称 |
| parent_id | UUID | FK → categories.id, NULL | 父分类ID (NULL=顶级分类) |
| level | INTEGER | NOT NULL, DEFAULT 1 | 层级深度 |
| sort_order | INTEGER | DEFAULT 0 | 排序序号 |
| status | VARCHAR(20) | DEFAULT 'ACTIVE' | 状态 (ACTIVE/INACTIVE) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 创建时间 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 更新时间 |

### 3. skus (现有表 - 扩展)

需要确保 `category_id` 字段存在:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| category_id | UUID | FK → categories.id, NULL | 商品分类ID |

## Validation Rules

### store_inventory
- `on_hand_qty` >= 0
- `available_qty` >= 0
- `reserved_qty` >= 0
- `safety_stock` >= 0
- `available_qty` = `on_hand_qty` - `reserved_qty` (业务约束)

### categories
- `code` 唯一且非空
- `name` 非空
- `level` >= 1
- 如果 `parent_id` 非空，则父分类必须存在

## State Definitions

### InventoryStatus (库存状态枚举)

| Status | Code | Color | Condition |
|--------|------|-------|-----------|
| 充足 | SUFFICIENT | green | available >= safety × 2 |
| 正常 | NORMAL | blue | safety <= available < safety × 2 |
| 偏低 | BELOW_THRESHOLD | yellow | safety × 0.5 <= available < safety |
| 不足 | LOW | orange | 0 < available < safety × 0.5 |
| 缺货 | OUT_OF_STOCK | red | available = 0 |

## Database Migration

### V029__create_store_inventory.sql

```sql
-- 创建商品分类表
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    parent_id UUID REFERENCES categories(id),
    level INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 创建分类索引
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_status ON categories(status);

-- 为 skus 表添加 category_id 字段（如果不存在）
ALTER TABLE skus ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);
CREATE INDEX IF NOT EXISTS idx_skus_category_id ON skus(category_id);

-- 创建门店库存表
CREATE TABLE IF NOT EXISTS store_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    sku_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
    on_hand_qty DECIMAL(12, 3) NOT NULL DEFAULT 0,
    available_qty DECIMAL(12, 3) NOT NULL DEFAULT 0,
    reserved_qty DECIMAL(12, 3) NOT NULL DEFAULT 0,
    safety_stock DECIMAL(12, 3) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (store_id, sku_id)
);

-- 创建库存查询索引
CREATE INDEX idx_store_inventory_store_id ON store_inventory(store_id);
CREATE INDEX idx_store_inventory_sku_id ON store_inventory(sku_id);
CREATE INDEX idx_store_inventory_available_qty ON store_inventory(available_qty);

-- 创建库存状态计算函数
CREATE OR REPLACE FUNCTION calculate_inventory_status(
    available_qty DECIMAL,
    safety_stock DECIMAL
) RETURNS VARCHAR AS $$
BEGIN
    IF available_qty = 0 THEN
        RETURN 'OUT_OF_STOCK';
    ELSIF available_qty < safety_stock * 0.5 THEN
        RETURN 'LOW';
    ELSIF available_qty < safety_stock THEN
        RETURN 'BELOW_THRESHOLD';
    ELSIF available_qty < safety_stock * 2 THEN
        RETURN 'NORMAL';
    ELSE
        RETURN 'SUFFICIENT';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 更新时间触发器
CREATE OR REPLACE FUNCTION update_store_inventory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_store_inventory_updated_at
    BEFORE UPDATE ON store_inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_store_inventory_updated_at();
```

## TypeScript Types

```typescript
// 库存状态枚举
export type InventoryStatus =
  | 'SUFFICIENT'      // 充足
  | 'NORMAL'          // 正常
  | 'BELOW_THRESHOLD' // 偏低
  | 'LOW'             // 不足
  | 'OUT_OF_STOCK';   // 缺货

// 库存状态配置
export const INVENTORY_STATUS_CONFIG: Record<InventoryStatus, {
  label: string;
  color: string;
}> = {
  SUFFICIENT: { label: '充足', color: 'green' },
  NORMAL: { label: '正常', color: 'blue' },
  BELOW_THRESHOLD: { label: '偏低', color: 'gold' },
  LOW: { label: '不足', color: 'orange' },
  OUT_OF_STOCK: { label: '缺货', color: 'red' },
};

// 库存记录
export interface StoreInventory {
  id: string;
  storeId: string;
  skuId: string;
  onHandQty: number;
  availableQty: number;
  reservedQty: number;
  safetyStock: number;
  updatedAt: string;
  createdAt: string;
  // 关联数据
  sku?: {
    code: string;
    name: string;
    mainUnit: string;
    categoryId?: string;
  };
  store?: {
    code: string;
    name: string;
  };
  category?: {
    id: string;
    name: string;
  };
  // 计算字段
  inventoryStatus: InventoryStatus;
}

// 商品分类
export interface Category {
  id: string;
  code: string;
  name: string;
  parentId?: string;
  level: number;
  sortOrder: number;
  status: 'ACTIVE' | 'INACTIVE';
  children?: Category[];
}

// 查询参数
export interface InventoryQueryParams {
  storeId?: string;
  keyword?: string;
  categoryId?: string;
  statuses?: InventoryStatus[];
  page?: number;
  pageSize?: number;
}

// 分页响应
export interface InventoryListResponse {
  success: boolean;
  data: StoreInventory[];
  total: number;
  page: number;
  pageSize: number;
}
```

## Java Entities

### StoreInventory.java

```java
@Entity
@Table(name = "store_inventory", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"store_id", "sku_id"})
})
public class StoreInventory {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "store_id", nullable = false)
    private UUID storeId;

    @Column(name = "sku_id", nullable = false)
    private UUID skuId;

    @Column(name = "on_hand_qty", nullable = false, precision = 12, scale = 3)
    private BigDecimal onHandQty = BigDecimal.ZERO;

    @Column(name = "available_qty", nullable = false, precision = 12, scale = 3)
    private BigDecimal availableQty = BigDecimal.ZERO;

    @Column(name = "reserved_qty", nullable = false, precision = 12, scale = 3)
    private BigDecimal reservedQty = BigDecimal.ZERO;

    @Column(name = "safety_stock", precision = 12, scale = 3)
    private BigDecimal safetyStock = BigDecimal.ZERO;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    // 计算库存状态
    @Transient
    public InventoryStatus getInventoryStatus() {
        if (availableQty.compareTo(BigDecimal.ZERO) == 0) {
            return InventoryStatus.OUT_OF_STOCK;
        }
        BigDecimal threshold = safetyStock.multiply(new BigDecimal("0.5"));
        BigDecimal doubleThreshold = safetyStock.multiply(new BigDecimal("2"));

        if (availableQty.compareTo(threshold) < 0) {
            return InventoryStatus.LOW;
        } else if (availableQty.compareTo(safetyStock) < 0) {
            return InventoryStatus.BELOW_THRESHOLD;
        } else if (availableQty.compareTo(doubleThreshold) < 0) {
            return InventoryStatus.NORMAL;
        }
        return InventoryStatus.SUFFICIENT;
    }
}

public enum InventoryStatus {
    SUFFICIENT,      // 充足
    NORMAL,          // 正常
    BELOW_THRESHOLD, // 偏低
    LOW,             // 不足
    OUT_OF_STOCK     // 缺货
}
```
