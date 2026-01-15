# Data Model: 订单创建时库存预占

**Feature**: O012-order-inventory-reservation  
**Date**: 2026-01-14  

---

## Overview

O012规格**完全复用P005-bom-inventory-deduction已创建的数据库表结构**，无需新增表或字段。本文档仅记录数据模型的复用情况和业务语义。

---

## Reused Tables (from P005)

### 1. `store_inventory` (库存表) - P005已创建

**Purpose**: 存储门店SKU的库存信息，包含现存库存、预占库存、可用库存。

**Schema**:

```sql
CREATE TABLE store_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id),
    sku_id UUID NOT NULL REFERENCES skus(id),
    on_hand_qty DECIMAL(12,3) NOT NULL DEFAULT 0,      -- 现存库存（物理库存）
    available_qty DECIMAL(12,3) NOT NULL DEFAULT 0,    -- 可用库存 = on_hand - reserved
    reserved_qty DECIMAL(12,3) NOT NULL DEFAULT 0,     -- 预占库存（已锁定但未扣减）
    safety_stock DECIMAL(12,3) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    version INTEGER NOT NULL DEFAULT 1,                 -- 乐观锁版本号
    UNIQUE (store_id, sku_id),
    CHECK (on_hand_qty >= reserved_qty)                 -- 约束：预占不能超过现存
);

-- 索引（P005已创建）
CREATE INDEX idx_inventory_lock ON store_inventory(store_id, sku_id); -- 行锁性能优化
```

**O012使用场景**:
- 订单创建时：读取 `available_qty` 判断库存是否充足
- 预占成功时：增加 `reserved_qty`，`available_qty` 自动减少
- 预占释放时：减少 `reserved_qty`，`available_qty` 自动增加

**计算公式**:
```
available_qty = on_hand_qty - reserved_qty
```

**并发控制**:
- 使用 `SELECT FOR UPDATE` 行级锁（P005 `InventoryRepository.findByStoreIdAndSkuIdForUpdate()`）
- 事务隔离级别：`READ_COMMITTED`

---

### 2. `inventory_reservations` (库存预占记录表) - P005已创建

**Purpose**: 记录每笔订单对库存的预占明细，支持审计追踪和预占释放。

**Schema**:

```sql
CREATE TABLE inventory_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,                             -- 关联订单ID
    store_id UUID NOT NULL REFERENCES stores(id),
    sku_id UUID NOT NULL REFERENCES skus(id),
    quantity DECIMAL(19,4) NOT NULL,                    -- 预占数量（与reserved_quantity相同）
    reserved_quantity DECIMAL(19,4) NOT NULL,           -- 预占数量
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',       -- ACTIVE | RELEASED | CANCELLED | EXPIRED
    notes TEXT,                                         -- 备注（如"超时自动释放"）
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    fulfilled_at TIMESTAMPTZ,                           -- 履约时间（出品扣减时）
    cancelled_at TIMESTAMPTZ,                           -- 取消时间
    CONSTRAINT chk_reservation_status CHECK (status IN ('ACTIVE', 'FULFILLED', 'CANCELLED', 'EXPIRED'))
);

-- 索引（P005已创建）
CREATE INDEX idx_reservations_order ON inventory_reservations(order_id);
CREATE INDEX idx_reservations_status_created ON inventory_reservations(status, created_at);
CREATE INDEX idx_reservations_sku ON inventory_reservations(store_id, sku_id);
```

**O012使用场景**:
- 订单创建时：插入 `status = 'ACTIVE'` 的预占记录
- 订单取消时：更新 `status = 'CANCELLED'`，设置 `cancelled_at`
- 超时自动释放：更新 `status = 'EXPIRED'`
- 审计查询：按 `order_id` 或 `status` 查询历史预占记录

**状态流转**:
```
ACTIVE → CANCELLED  (订单取消)
ACTIVE → EXPIRED    (超时自动释放)
ACTIVE → FULFILLED  (订单履约，由P005处理)
```

---

### 3. `bom_snapshots` (BOM配方快照表) - P005已创建

**Purpose**: 锁定订单创建时的BOM配方版本，防止配方变更影响已下单订单。

**Schema**:

```sql
CREATE TABLE bom_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,                             -- 关联订单ID
    finished_sku_id UUID NOT NULL,                      -- 成品SKU ID
    raw_material_sku_id UUID NOT NULL,                  -- 原料SKU ID
    quantity DECIMAL(19,4) NOT NULL,                    -- BOM用量
    unit VARCHAR(20) NOT NULL,                          -- 单位
    wastage_rate DECIMAL(5,4) DEFAULT 0,                -- 损耗率（0.05 = 5%）
    bom_level INTEGER NOT NULL,                         -- BOM层级（1=直接原料，2=间接原料）
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 索引（P005已创建）
CREATE INDEX idx_bom_snapshots_order ON bom_snapshots(order_id);
CREATE INDEX idx_bom_snapshots_order_sku ON bom_snapshots(order_id, finished_sku_id);
```

**O012使用场景**:
- 订单创建时：调用 `BomSnapshotService.createSnapshots()` 创建快照
- 订单履约时：P005根据快照扣减库存（O012不涉及）

---

## No New Tables Required

O012规格**不需要新增任何表或字段**，完全复用P005的基础设施。

**原因**:
1. ✅ `store_inventory.reserved_qty` 字段已支持预占库存管理
2. ✅ `inventory_reservations` 表已支持预占记录的完整生命周期管理
3. ✅ `bom_snapshots` 表已支持配方版本锁定
4. ✅ 所有必需的索引已创建，性能已优化

---

## Entity Relationships

```
orders (订单表, O003/U001已有)
  |
  | 1:N
  |
inventory_reservations (预占记录)
  |
  | N:1
  |
store_inventory (库存表)
  |
  | N:1
  |
skus (SKU主数据, P001已有)

orders
  |
  | 1:N
  |
bom_snapshots (BOM快照)
```

---

## Data Validation Rules

### 库存约束

1. **预占不能超过现存**:
   ```sql
   CHECK (on_hand_qty >= reserved_qty)
   ```

2. **可用库存计算**:
   ```
   available_qty = on_hand_qty - reserved_qty
   ```

3. **预占数量必须为正数**:
   ```sql
   CHECK (reserved_qty >= 0)
   ```

### 预占记录约束

1. **状态有效性**:
   ```sql
   CHECK (status IN ('ACTIVE', 'FULFILLED', 'CANCELLED', 'EXPIRED'))
   ```

2. **预占数量必须大于0**:
   ```sql
   CHECK (reserved_quantity > 0)
   ```

3. **订单ID必须存在**:
   ```sql
   FOREIGN KEY (order_id) REFERENCES orders(id) -- 由应用层保证
   ```

---

## JPA Entity Mapping (Java)

### Inventory Entity (P005已实现)

```java
/**
 * @spec P005-bom-inventory-deduction
 * 库存实体（含预占字段）
 */
@Entity
@Table(name = "store_inventory")
public class Inventory {
    @Id
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
    private BigDecimal reservedQty = BigDecimal.ZERO; // O012关键字段
    
    @Column(name = "safety_stock", precision = 12, scale = 3)
    private BigDecimal safetyStock = BigDecimal.ZERO;
    
    // 计算可用库存（用于预占检查）
    public BigDecimal calculateAvailableForReservation() {
        return onHandQty.subtract(reservedQty);
    }
    
    // 检查库存是否充足
    public boolean hasSufficientAvailable(BigDecimal quantity) {
        return calculateAvailableForReservation().compareTo(quantity) >= 0;
    }
}
```

### InventoryReservation Entity (P005已实现)

```java
/**
 * @spec P005-bom-inventory-deduction
 * 库存预占记录实体
 */
@Entity
@Table(name = "inventory_reservations")
public class InventoryReservation {
    
    public enum ReservationStatus {
        ACTIVE,      // 活跃预占（O012创建时设置）
        FULFILLED,   // 已履约（P005出品时设置）
        CANCELLED,   // 已取消（O012订单取消时设置）
        EXPIRED      // 已过期（O012超时释放时设置）
    }
    
    @Id
    private UUID id;
    
    @Column(name = "order_id", nullable = false)
    private UUID orderId; // O012订单ID
    
    @Column(name = "store_id", nullable = false)
    private UUID storeId;
    
    @Column(name = "sku_id", nullable = false)
    private UUID skuId;
    
    @Column(name = "reserved_quantity", nullable = false)
    private BigDecimal reservedQuantity;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ReservationStatus status = ReservationStatus.ACTIVE;
    
    @Column(name = "notes")
    private String notes;
    
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
    
    @Column(name = "cancelled_at")
    private Instant cancelledAt;
    
    @Column(name = "fulfilled_at")
    private Instant fulfilledAt;
    
    // O012业务方法
    public void markAsCancelled() {
        this.status = ReservationStatus.CANCELLED;
        this.cancelledAt = Instant.now();
    }
    
    public void markAsExpired() {
        this.status = ReservationStatus.EXPIRED;
        this.cancelledAt = Instant.now(); // 复用cancelled_at字段
        this.notes = "超时自动释放";
    }
}
```

---

## Migration Scripts

**O012不需要任何数据库迁移脚本**，因为所有表结构已由P005创建。

如需验证表结构，可执行：

```sql
-- 验证store_inventory表
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'store_inventory'
  AND column_name IN ('reserved_qty', 'available_qty', 'on_hand_qty');

-- 验证inventory_reservations表
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'inventory_reservations'
  AND column_name IN ('order_id', 'status', 'reserved_quantity');

-- 验证索引
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('store_inventory', 'inventory_reservations');
```

---

## Data Flow Diagram

```
订单创建流程（O012）:

1. [订单请求] → BeverageOrderService.createOrder()
                    ↓
2. [BOM展开] → BomExpansionService.expandBomBatch()
                    ↓
3. [预占库存] → InventoryReservationService.reserveInventory()
                    ↓
4. [锁定库存行] SELECT FOR UPDATE store_inventory
                    ↓
5. [检查可用库存] available_qty >= required_qty ?
                    ↓ YES
6. [增加预占] UPDATE store_inventory SET reserved_qty = reserved_qty + qty
                    ↓
7. [创建预占记录] INSERT INTO inventory_reservations (status='ACTIVE')
                    ↓
8. [创建BOM快照] INSERT INTO bom_snapshots
                    ↓
9. [返回订单] OrderCreationResponse


订单取消流程（O012）:

1. [取消请求] → OrderCancellationService.cancelOrder()
                    ↓
2. [查询订单] SELECT * FROM orders WHERE id = ?
                    ↓
3. [释放预占] → InventoryReservationService.releaseReservation()
                    ↓
4. [锁定库存行] SELECT FOR UPDATE store_inventory
                    ↓
5. [减少预占] UPDATE store_inventory SET reserved_qty = reserved_qty - qty
                    ↓
6. [更新预占记录] UPDATE inventory_reservations SET status='CANCELLED'
                    ↓
7. [更新订单状态] UPDATE orders SET status='CANCELLED'


超时释放流程（O012）:

1. [定时任务执行] @Scheduled(cron = "0 */5 * * * *")
                    ↓
2. [查询超时预占] SELECT * FROM inventory_reservations
                  WHERE status='ACTIVE' AND created_at < now() - 30min
                    ↓
3. [批量释放] FOR EACH expired_reservation:
                    ↓
4. [释放预占] → InventoryReservationService.releaseReservation()
                    ↓
5. [更新状态] UPDATE inventory_reservations SET status='EXPIRED'
```

---

## Summary

✅ **O012规格完全复用P005数据模型**  
✅ **无需新增表或字段**  
✅ **无需执行数据库迁移**  
✅ **所有必需的索引和约束已就绪**  

**数据模型成熟度**: 生产级（已由P005验证）

**下一步**: 生成API契约定义（contracts/api.yaml）
