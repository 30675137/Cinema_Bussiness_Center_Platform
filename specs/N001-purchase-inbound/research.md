# Research: 采购入库模块

**Spec**: N001-purchase-inbound
**Date**: 2026-01-11
**Status**: Completed

## 1. 现有数据库结构分析

### 1.1 相关表结构

#### store_inventory 表 (V033)
```sql
CREATE TABLE store_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    sku_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
    on_hand_qty DECIMAL(12, 3) NOT NULL DEFAULT 0,
    available_qty DECIMAL(12, 3) NOT NULL DEFAULT 0,
    reserved_qty DECIMAL(12, 3) NOT NULL DEFAULT 0,
    safety_stock DECIMAL(12, 3) DEFAULT 0,
    version INTEGER DEFAULT 1,  -- 乐观锁
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (store_id, sku_id)
);
```

**关键发现**:
- 库存表已支持乐观锁 (`version` 字段)
- `on_hand_qty` 和 `available_qty` 是收货入库需要更新的核心字段
- 唯一约束 `(store_id, sku_id)` 确保每个门店每个 SKU 只有一条库存记录

#### inventory_adjustments 表 (V035) - 参考
```sql
CREATE TABLE inventory_adjustments (
    id UUID PRIMARY KEY,
    adjustment_number VARCHAR(30) UNIQUE NOT NULL,
    sku_id UUID NOT NULL,
    store_id UUID NOT NULL,
    ...
    version INTEGER DEFAULT 1
);
```

**参考价值**:
- 单号生成使用 sequence + 日期格式 (如 `ADJ20251226001`)
- 采购订单号可参考此模式：`PO20260111001`

### 1.2 缺失的表 (需新建)

| 表名 | 用途 | 状态 |
|------|------|------|
| `suppliers` | 供应商主数据 | ❌ 不存在 |
| `purchase_orders` | 采购订单主表 | ❌ 不存在 |
| `purchase_order_items` | 采购订单明细 | ❌ 不存在 |
| `goods_receipts` | 收货入库单 | ❌ 不存在 |
| `goods_receipt_items` | 收货入库明细 | ❌ 不存在 |

## 2. 现有 JPA 实体分析

### 2.1 可复用实体

| 实体 | 位置 | 用途 |
|------|------|------|
| `Inventory` | `inventory/entity/Inventory.java` | 门店库存，收货时更新 |
| `Sku` | `hallstore/domain/Sku.java` | SKU 主数据，采购明细关联 |
| `StoreEntity` | `inventory/entity/StoreEntity.java` | 门店只读实体 |

### 2.2 Inventory 实体关键字段

```java
@Entity
@Table(name = "store_inventory")
public class Inventory {
    private UUID id;
    private UUID storeId;
    private UUID skuId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sku_id")
    private Sku sku;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id")
    private StoreEntity store;

    private BigDecimal onHandQty;       // 现存库存
    private BigDecimal availableQty;    // 可用库存
    private BigDecimal reservedQty;     // 预占库存

    // 乐观锁 (需添加 @Version)
}
```

### 2.3 StoreInventoryJpaRepository 可复用方法

```java
// 查询 SKU+门店 组合是否已有库存
Optional<Inventory> findBySkuIdAndStoreIdWithDetails(UUID skuId, UUID storeId);
```

**收货入库逻辑**:
1. 调用 `findBySkuIdAndStoreIdWithDetails(skuId, storeId)`
2. 如果存在：`onHandQty += 收货数量`, `availableQty += 收货数量`
3. 如果不存在：创建新 Inventory 记录

## 3. 供应商数据处理方案

### 3.1 现状
- **suppliers 表不存在**
- 前端 `SupplierList.tsx` 使用 Mock 数据
- spec 声明供应商管理 Out of Scope

### 3.2 推荐方案
**创建简化版 suppliers 表**，仅包含采购订单需要的基本信息：

```sql
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    contact_name VARCHAR(100),
    contact_phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

**初始数据**: 预置 2-3 个测试供应商

## 4. 订单号生成策略

### 4.1 现有模式 (inventory_adjustments)
```sql
-- 使用 sequence + 日期
CREATE SEQUENCE adjustment_number_seq START WITH 1;

CREATE FUNCTION generate_adjustment_number() RETURNS varchar AS $$
  today_str := to_char(CURRENT_DATE, 'YYYYMMDD');
  seq_val := nextval('adjustment_number_seq');
  RETURN 'ADJ' || today_str || lpad(seq_val::text, 4, '0');
$$ LANGUAGE plpgsql;
```

### 4.2 采购订单号方案

| 单据类型 | 前缀 | 格式 | 示例 |
|---------|------|------|------|
| 采购订单 | PO | PO + 日期 + 4位序号 | `PO202601110001` |
| 收货入库单 | GR | GR + 日期 + 4位序号 | `GR202601110001` |

**PostgreSQL 实现**:
```sql
CREATE SEQUENCE purchase_order_number_seq START WITH 1;
CREATE SEQUENCE goods_receipt_number_seq START WITH 1;

CREATE FUNCTION generate_po_number() RETURNS VARCHAR AS $$
BEGIN
  RETURN 'PO' || to_char(CURRENT_DATE, 'YYYYMMDD')
       || lpad(nextval('purchase_order_number_seq')::text, 4, '0');
END;
$$ LANGUAGE plpgsql;
```

## 5. 并发控制方案

### 5.1 场景分析

| 场景 | 风险 | 解决方案 |
|------|------|---------|
| 同一订单多人同时收货 | 重复收货 | 乐观锁 + 状态校验 |
| 同一 SKU 同时入库 | 库存数据不一致 | 乐观锁 (version 字段) |
| 订单审批与收货并发 | 状态冲突 | 状态机 + 事务隔离 |

### 5.2 乐观锁实现

```java
@Entity
@Table(name = "purchase_orders")
public class PurchaseOrderEntity {
    // ...

    @Version
    @Column(name = "version")
    private Integer version;
}

@Entity
@Table(name = "store_inventory")
public class Inventory {
    // 已有 version 列，需添加 @Version 注解
    @Version
    @Column(name = "version")
    private Integer version;
}
```

### 5.3 收货入库事务

```java
@Transactional(isolation = Isolation.REPEATABLE_READ)
public void confirmGoodsReceipt(GoodsReceiptDTO receipt) {
    // 1. 锁定采购订单
    PurchaseOrder po = repository.findByIdWithLock(receipt.getPurchaseOrderId());
    if (po.getStatus() != OrderStatus.APPROVED) {
        throw new BusinessException("订单状态不允许收货");
    }

    // 2. 更新库存 (带乐观锁)
    for (GoodsReceiptItemDTO item : receipt.getItems()) {
        updateInventory(item.getSkuId(), item.getStoreId(), item.getReceivedQty());
    }

    // 3. 更新订单状态
    updateOrderStatus(po, receipt);
}
```

## 6. 前端复用分析

### 6.1 组件复用情况

| 组件 | Mock 数据位置 | 改造方案 |
|------|-------------|---------|
| PurchaseOrderList.tsx | lines 34-233 | 替换为 TanStack Query |
| PurchaseOrders.tsx | line 130 "开发中" | 完成 SKU 选择器 |
| ReceivingForm.tsx | lines 64-102 | 替换为 API 调用 |
| ReceivingList.tsx | lines 39-318 | 替换为 TanStack Query |
| ReceivingDetail.tsx | lines 65-175 | 替换为 API 调用 |

### 6.2 现有类型定义

`frontend/src/types/purchase.ts`:
```typescript
interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: Supplier;
  store: Store;
  status: OrderStatus;
  totalAmount: number;
  items: PurchaseOrderItem[];
  // ...
}
```

**需确认**: 类型定义是否与后端 DTO 一致

### 6.3 SKU 选择器实现

参考现有 SKU 选择实现：
- `frontend/src/components/SkuSelector/` (如存在)
- 或使用 Ant Design `Select` + 远程搜索

## 7. 关键技术决策

### 7.1 确定的决策

| 决策 | 选择 | 原因 |
|------|------|------|
| 数据访问 | JPA | 用户明确要求 |
| 订单号生成 | PostgreSQL sequence | 与现有 adjustment 保持一致 |
| 并发控制 | 乐观锁 (@Version) | 已有基础设施 |
| 供应商表 | 新建简化版 | 采购订单必需 |

### 7.2 待确认问题

无需进一步澄清的问题 - 所有技术决策已确定。

## 8. 下一步

1. **Phase 1**: 创建 data-model.md
   - 定义 4 个 JPA 实体
   - 定义 Flyway migration 脚本

2. **Phase 1**: 创建 contracts/api.yaml
   - 定义 8 个 API 端点
   - OpenAPI 3.0 规范

3. **Phase 1**: 创建 quickstart.md
   - 开发环境配置
   - 测试数据准备
