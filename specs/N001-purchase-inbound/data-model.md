# Data Model: 采购入库模块

**Spec**: N001-purchase-inbound
**Date**: 2026-01-11
**Status**: Draft

## Entity Relationship Diagram

```
┌─────────────────┐      ┌──────────────────────┐      ┌────────────────────┐
│    suppliers    │      │   purchase_orders    │      │   goods_receipts   │
├─────────────────┤      ├──────────────────────┤      ├────────────────────┤
│ id (PK)         │◄────┐│ id (PK)              │◄────┐│ id (PK)            │
│ code            │     ││ order_number         │     ││ receipt_number     │
│ name            │     ││ supplier_id (FK)─────┘     ││ purchase_order_id──┘
│ contact_name    │      │ store_id (FK)───────┐     ││ store_id (FK)───┐
│ contact_phone   │      │ status              │     ││ status          │
│ status          │      │ total_amount        │     ││ received_by     │
└─────────────────┘      │ planned_arrival     │     ││ received_at     │
                         │ remarks             │     │└────────────────────┘
                         │ created_by          │     │         │
                         │ approved_by         │     │         │
                         │ version             │     │         ▼
                         └──────────────────────┘     │┌───────────────────────┐
                                    │                 ││ goods_receipt_items   │
                                    ▼                 │├───────────────────────┤
                         ┌─────────────────────────┐  ││ id (PK)               │
                         │ purchase_order_items   │  ││ goods_receipt_id (FK) │
                         ├─────────────────────────┤  ││ sku_id (FK)           │
                         │ id (PK)                 │  ││ ordered_qty           │
                         │ purchase_order_id (FK)  │  ││ received_qty          │
                         │ sku_id (FK)─────────────┼──┤│ quality_status        │
                         │ quantity               │  │└───────────────────────┘
                         │ unit_price             │  │
                         │ line_amount            │  │
                         └─────────────────────────┘  │
                                                      │
                                    ┌─────────────────┘
                                    ▼
                         ┌─────────────────────┐      ┌─────────────────┐
                         │      stores         │      │      skus       │
                         ├─────────────────────┤      ├─────────────────┤
                         │ id (PK)             │      │ id (PK)         │
                         │ code                │      │ code            │
                         │ name                │      │ name            │
                         │ status              │      │ main_unit       │
                         └─────────────────────┘      │ status          │
                                    │                 └─────────────────┘
                                    ▼                         │
                         ┌──────────────────────┐             │
                         │   store_inventory    │◄────────────┘
                         ├──────────────────────┤
                         │ id (PK)              │
                         │ store_id (FK)        │
                         │ sku_id (FK)          │
                         │ on_hand_qty          │
                         │ available_qty        │
                         │ reserved_qty         │
                         │ version              │
                         └──────────────────────┘
```

## JPA Entities

### 1. SupplierEntity (供应商)

```java
/**
 * @spec N001-purchase-inbound
 */
@Entity
@Table(name = "suppliers")
public class SupplierEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "code", length = 50, nullable = false, unique = true)
    private String code;

    @Column(name = "name", length = 200, nullable = false)
    private String name;

    @Column(name = "contact_name", length = 100)
    private String contactName;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @Column(name = "status", length = 20)
    @Enumerated(EnumType.STRING)
    private SupplierStatus status = SupplierStatus.ACTIVE;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    // Getters and Setters
}

public enum SupplierStatus {
    ACTIVE, INACTIVE
}
```

### 2. PurchaseOrderEntity (采购订单)

```java
/**
 * @spec N001-purchase-inbound
 */
@Entity
@Table(name = "purchase_orders")
public class PurchaseOrderEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "order_number", length = 30, nullable = false, unique = true)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private SupplierEntity supplier;

    @Column(name = "supplier_id", insertable = false, updatable = false)
    private UUID supplierId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private StoreEntity store;

    @Column(name = "store_id", insertable = false, updatable = false)
    private UUID storeId;

    @Column(name = "status", length = 20, nullable = false)
    @Enumerated(EnumType.STRING)
    private PurchaseOrderStatus status = PurchaseOrderStatus.DRAFT;

    @Column(name = "total_amount", precision = 12, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "planned_arrival_date")
    private LocalDate plannedArrivalDate;

    @Column(name = "remarks", length = 500)
    private String remarks;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "approved_by")
    private UUID approvedBy;

    @Column(name = "approved_at")
    private Instant approvedAt;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurchaseOrderItemEntity> items = new ArrayList<>();

    @Version
    @Column(name = "version")
    private Integer version;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    // 业务方法
    public void addItem(PurchaseOrderItemEntity item) {
        items.add(item);
        item.setPurchaseOrder(this);
        recalculateTotal();
    }

    public void recalculateTotal() {
        this.totalAmount = items.stream()
            .map(PurchaseOrderItemEntity::getLineAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // Getters and Setters
}

public enum PurchaseOrderStatus {
    DRAFT,              // 草稿
    PENDING_APPROVAL,   // 待审核
    APPROVED,           // 已审核
    REJECTED,           // 已拒绝
    PARTIAL_RECEIVED,   // 部分收货
    FULLY_RECEIVED,     // 全部收货
    CLOSED              // 已关闭
}
```

### 3. PurchaseOrderItemEntity (采购订单明细)

```java
/**
 * @spec N001-purchase-inbound
 */
@Entity
@Table(name = "purchase_order_items")
public class PurchaseOrderItemEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    private PurchaseOrderEntity purchaseOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sku_id", nullable = false)
    private Sku sku;

    @Column(name = "sku_id", insertable = false, updatable = false)
    private UUID skuId;

    @Column(name = "quantity", precision = 12, scale = 3, nullable = false)
    private BigDecimal quantity;

    @Column(name = "unit_price", precision = 12, scale = 2, nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "line_amount", precision = 12, scale = 2)
    private BigDecimal lineAmount;

    @Column(name = "received_qty", precision = 12, scale = 3)
    private BigDecimal receivedQty = BigDecimal.ZERO;

    @Column(name = "pending_qty", precision = 12, scale = 3)
    private BigDecimal pendingQty;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
        calculateLineAmount();
        this.pendingQty = this.quantity;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
        calculateLineAmount();
        this.pendingQty = this.quantity.subtract(this.receivedQty);
    }

    private void calculateLineAmount() {
        if (quantity != null && unitPrice != null) {
            this.lineAmount = quantity.multiply(unitPrice);
        }
    }

    // Getters and Setters
}
```

### 4. GoodsReceiptEntity (收货入库单)

```java
/**
 * @spec N001-purchase-inbound
 */
@Entity
@Table(name = "goods_receipts")
public class GoodsReceiptEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "receipt_number", length = 30, nullable = false, unique = true)
    private String receiptNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    private PurchaseOrderEntity purchaseOrder;

    @Column(name = "purchase_order_id", insertable = false, updatable = false)
    private UUID purchaseOrderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private StoreEntity store;

    @Column(name = "store_id", insertable = false, updatable = false)
    private UUID storeId;

    @Column(name = "status", length = 20, nullable = false)
    @Enumerated(EnumType.STRING)
    private GoodsReceiptStatus status = GoodsReceiptStatus.PENDING;

    @Column(name = "received_by")
    private UUID receivedBy;

    @Column(name = "received_by_name", length = 100)
    private String receivedByName;

    @Column(name = "received_at")
    private Instant receivedAt;

    @Column(name = "remarks", length = 500)
    private String remarks;

    @OneToMany(mappedBy = "goodsReceipt", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GoodsReceiptItemEntity> items = new ArrayList<>();

    @Version
    @Column(name = "version")
    private Integer version;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    // 业务方法
    public void addItem(GoodsReceiptItemEntity item) {
        items.add(item);
        item.setGoodsReceipt(this);
    }

    // Getters and Setters
}

public enum GoodsReceiptStatus {
    PENDING,    // 待收货
    CONFIRMED,  // 已确认
    CANCELLED   // 已取消
}
```

### 5. GoodsReceiptItemEntity (收货入库明细)

```java
/**
 * @spec N001-purchase-inbound
 */
@Entity
@Table(name = "goods_receipt_items")
public class GoodsReceiptItemEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "goods_receipt_id", nullable = false)
    private GoodsReceiptEntity goodsReceipt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sku_id", nullable = false)
    private Sku sku;

    @Column(name = "sku_id", insertable = false, updatable = false)
    private UUID skuId;

    @Column(name = "ordered_qty", precision = 12, scale = 3, nullable = false)
    private BigDecimal orderedQty;

    @Column(name = "received_qty", precision = 12, scale = 3, nullable = false)
    private BigDecimal receivedQty;

    @Column(name = "quality_status", length = 20)
    @Enumerated(EnumType.STRING)
    private QualityStatus qualityStatus = QualityStatus.QUALIFIED;

    @Column(name = "rejection_reason", length = 200)
    private String rejectionReason;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    // Getters and Setters
}

public enum QualityStatus {
    QUALIFIED,      // 合格
    UNQUALIFIED,    // 不合格
    PENDING_CHECK   // 待检验
}
```

## Flyway Migration Script

```sql
-- Migration: N001-purchase-inbound
-- Date: 2026-01-11
-- Description: Create purchase and goods receipt tables

-- 1. Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    contact_name VARCHAR(100),
    contact_phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_suppliers_code ON suppliers(code);
CREATE INDEX idx_suppliers_status ON suppliers(status);

COMMENT ON TABLE suppliers IS '供应商表';

-- 2. Create purchase_orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(30) NOT NULL UNIQUE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    store_id UUID NOT NULL REFERENCES stores(id),
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    total_amount DECIMAL(12, 2) DEFAULT 0,
    planned_arrival_date DATE,
    remarks VARCHAR(500),
    created_by UUID,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    rejection_reason VARCHAR(500),
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT chk_po_status CHECK (status IN (
        'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED',
        'PARTIAL_RECEIVED', 'FULLY_RECEIVED', 'CLOSED'
    ))
);

CREATE INDEX idx_po_order_number ON purchase_orders(order_number);
CREATE INDEX idx_po_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX idx_po_store_id ON purchase_orders(store_id);
CREATE INDEX idx_po_status ON purchase_orders(status);
CREATE INDEX idx_po_created_at ON purchase_orders(created_at DESC);

COMMENT ON TABLE purchase_orders IS '采购订单表';

-- 3. Create purchase_order_items table
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    sku_id UUID NOT NULL REFERENCES skus(id),
    quantity DECIMAL(12, 3) NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    line_amount DECIMAL(12, 2),
    received_qty DECIMAL(12, 3) DEFAULT 0,
    pending_qty DECIMAL(12, 3),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_poi_order_id ON purchase_order_items(purchase_order_id);
CREATE INDEX idx_poi_sku_id ON purchase_order_items(sku_id);

COMMENT ON TABLE purchase_order_items IS '采购订单明细表';

-- 4. Create goods_receipts table
CREATE TABLE IF NOT EXISTS goods_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_number VARCHAR(30) NOT NULL UNIQUE,
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id),
    store_id UUID NOT NULL REFERENCES stores(id),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    received_by UUID,
    received_by_name VARCHAR(100),
    received_at TIMESTAMPTZ,
    remarks VARCHAR(500),
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT chk_gr_status CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED'))
);

CREATE INDEX idx_gr_receipt_number ON goods_receipts(receipt_number);
CREATE INDEX idx_gr_po_id ON goods_receipts(purchase_order_id);
CREATE INDEX idx_gr_store_id ON goods_receipts(store_id);
CREATE INDEX idx_gr_status ON goods_receipts(status);

COMMENT ON TABLE goods_receipts IS '收货入库单表';

-- 5. Create goods_receipt_items table
CREATE TABLE IF NOT EXISTS goods_receipt_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goods_receipt_id UUID NOT NULL REFERENCES goods_receipts(id) ON DELETE CASCADE,
    sku_id UUID NOT NULL REFERENCES skus(id),
    ordered_qty DECIMAL(12, 3) NOT NULL,
    received_qty DECIMAL(12, 3) NOT NULL,
    quality_status VARCHAR(20) DEFAULT 'QUALIFIED',
    rejection_reason VARCHAR(200),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT chk_gri_quality CHECK (quality_status IN ('QUALIFIED', 'UNQUALIFIED', 'PENDING_CHECK'))
);

CREATE INDEX idx_gri_receipt_id ON goods_receipt_items(goods_receipt_id);
CREATE INDEX idx_gri_sku_id ON goods_receipt_items(sku_id);

COMMENT ON TABLE goods_receipt_items IS '收货入库明细表';

-- 6. Create sequences for order numbers
CREATE SEQUENCE IF NOT EXISTS purchase_order_number_seq START WITH 1;
CREATE SEQUENCE IF NOT EXISTS goods_receipt_number_seq START WITH 1;

-- 7. Create function to generate PO number
CREATE OR REPLACE FUNCTION generate_po_number() RETURNS VARCHAR AS $$
BEGIN
    RETURN 'PO' || to_char(CURRENT_DATE, 'YYYYMMDD')
         || lpad(nextval('purchase_order_number_seq')::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- 8. Create function to generate GR number
CREATE OR REPLACE FUNCTION generate_gr_number() RETURNS VARCHAR AS $$
BEGIN
    RETURN 'GR' || to_char(CURRENT_DATE, 'YYYYMMDD')
         || lpad(nextval('goods_receipt_number_seq')::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- 9. Updated at triggers
CREATE TRIGGER update_suppliers_updated_at
    BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at
    BEFORE UPDATE ON purchase_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_order_items_updated_at
    BEFORE UPDATE ON purchase_order_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goods_receipts_updated_at
    BEFORE UPDATE ON goods_receipts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goods_receipt_items_updated_at
    BEFORE UPDATE ON goods_receipt_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Insert test suppliers
INSERT INTO suppliers (code, name, contact_name, contact_phone) VALUES
    ('SUP001', '北京食品供应商', '张三', '13800138001'),
    ('SUP002', '上海饮料批发', '李四', '13900139002'),
    ('SUP003', '广州零食配送', '王五', '13700137003')
ON CONFLICT (code) DO NOTHING;
```

## Repository Interfaces

### SupplierRepository

```java
@Repository
public interface SupplierRepository extends JpaRepository<SupplierEntity, UUID> {

    Optional<SupplierEntity> findByCode(String code);

    List<SupplierEntity> findByStatusOrderByNameAsc(SupplierStatus status);

    @Query("SELECT s FROM SupplierEntity s WHERE s.status = 'ACTIVE' ORDER BY s.name")
    List<SupplierEntity> findAllActive();
}
```

### PurchaseOrderRepository

```java
@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrderEntity, UUID> {

    Optional<PurchaseOrderEntity> findByOrderNumber(String orderNumber);

    @Query("SELECT po FROM PurchaseOrderEntity po " +
           "LEFT JOIN FETCH po.supplier " +
           "LEFT JOIN FETCH po.store " +
           "WHERE po.id = :id")
    Optional<PurchaseOrderEntity> findByIdWithDetails(@Param("id") UUID id);

    @Query("SELECT po FROM PurchaseOrderEntity po " +
           "LEFT JOIN FETCH po.supplier " +
           "LEFT JOIN FETCH po.store " +
           "WHERE (:storeId IS NULL OR po.storeId = :storeId) " +
           "AND (:status IS NULL OR po.status = :status) " +
           "ORDER BY po.createdAt DESC")
    List<PurchaseOrderEntity> findByFilters(
        @Param("storeId") UUID storeId,
        @Param("status") PurchaseOrderStatus status,
        Pageable pageable
    );

    @Query("SELECT COUNT(po) FROM PurchaseOrderEntity po " +
           "WHERE (:storeId IS NULL OR po.storeId = :storeId) " +
           "AND (:status IS NULL OR po.status = :status)")
    long countByFilters(@Param("storeId") UUID storeId, @Param("status") PurchaseOrderStatus status);

    @Lock(LockModeType.OPTIMISTIC)
    @Query("SELECT po FROM PurchaseOrderEntity po WHERE po.id = :id")
    Optional<PurchaseOrderEntity> findByIdWithLock(@Param("id") UUID id);
}
```

### GoodsReceiptRepository

```java
@Repository
public interface GoodsReceiptRepository extends JpaRepository<GoodsReceiptEntity, UUID> {

    Optional<GoodsReceiptEntity> findByReceiptNumber(String receiptNumber);

    @Query("SELECT gr FROM GoodsReceiptEntity gr " +
           "LEFT JOIN FETCH gr.purchaseOrder " +
           "LEFT JOIN FETCH gr.store " +
           "WHERE gr.id = :id")
    Optional<GoodsReceiptEntity> findByIdWithDetails(@Param("id") UUID id);

    List<GoodsReceiptEntity> findByPurchaseOrderId(UUID purchaseOrderId);

    @Query("SELECT gr FROM GoodsReceiptEntity gr " +
           "LEFT JOIN FETCH gr.purchaseOrder " +
           "LEFT JOIN FETCH gr.store " +
           "WHERE (:storeId IS NULL OR gr.storeId = :storeId) " +
           "AND (:status IS NULL OR gr.status = :status) " +
           "ORDER BY gr.createdAt DESC")
    List<GoodsReceiptEntity> findByFilters(
        @Param("storeId") UUID storeId,
        @Param("status") GoodsReceiptStatus status,
        Pageable pageable
    );
}
```

## Key Business Logic

### 收货入库库存更新

```java
@Service
public class GoodsReceiptService {

    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public GoodsReceiptDTO confirmReceipt(UUID receiptId) {
        GoodsReceiptEntity receipt = repository.findByIdWithDetails(receiptId)
            .orElseThrow(() -> new NotFoundException("收货单不存在"));

        // 1. 校验状态
        if (receipt.getStatus() != GoodsReceiptStatus.PENDING) {
            throw new BusinessException("收货单状态不允许确认");
        }

        // 2. 更新库存
        for (GoodsReceiptItemEntity item : receipt.getItems()) {
            if (item.getQualityStatus() == QualityStatus.QUALIFIED) {
                updateInventory(receipt.getStoreId(), item.getSkuId(), item.getReceivedQty());
            }
        }

        // 3. 更新收货单状态
        receipt.setStatus(GoodsReceiptStatus.CONFIRMED);
        receipt.setReceivedAt(Instant.now());

        // 4. 更新采购订单收货数量和状态
        updatePurchaseOrderReceivedQty(receipt);

        return mapper.toDTO(repository.save(receipt));
    }

    private void updateInventory(UUID storeId, UUID skuId, BigDecimal qty) {
        Optional<Inventory> existingOpt = inventoryRepository
            .findBySkuIdAndStoreIdWithDetails(skuId, storeId);

        if (existingOpt.isPresent()) {
            Inventory inv = existingOpt.get();
            inv.setOnHandQty(inv.getOnHandQty().add(qty));
            inv.setAvailableQty(inv.getAvailableQty().add(qty));
            inventoryRepository.save(inv);
        } else {
            // 创建新库存记录
            Inventory inv = new Inventory();
            inv.setStoreId(storeId);
            inv.setSkuId(skuId);
            inv.setOnHandQty(qty);
            inv.setAvailableQty(qty);
            inv.setReservedQty(BigDecimal.ZERO);
            inventoryRepository.save(inv);
        }
    }
}
```
