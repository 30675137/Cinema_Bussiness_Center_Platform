# Data Model: BOM配方库存预占与扣料

**Feature**: P005-bom-inventory-deduction
**Date**: 2025-12-29
**Database**: Supabase PostgreSQL

---

## Overview

This data model extends the existing inventory management schema to support BOM-based inventory reservation and deduction. It introduces three new tables and extends two existing tables to handle reservation locks, transaction logging, and BOM formula version snapshotting.

---

## Entity Relationship Diagram

```
┌─────────────────┐         ┌──────────────────────┐         ┌─────────────────┐
│     orders      │────────>│inventory_reservations│<────────│   inventory     │
│                 │  1:N    │                      │   N:1   │                 │
│ - id            │         │ - id                 │         │ - id            │
│ - store_id      │         │ - order_id (FK)      │         │ - store_id      │
│ - customer_id   │         │ - store_id (FK)      │         │ - sku_id        │
│ - status        │         │ - sku_id (FK)        │         │ - current_qty   │
│ - created_at    │         │ - reserved_quantity  │         │ - reserved_qty  │← NEW
└─────────────────┘         │ - status             │         │ - available_qty │← COMPUTED
                            │ - created_at         │         │ - updated_at    │
                            │ - expires_at         │         └─────────────────┘
                            │ - fulfilled_at       │                  │
                            │ - cancelled_at       │                  │
                            └──────────────────────┘                  │
                                     │                                │
                                     │                                │
                                     ▼                                ▼
                            ┌──────────────────────┐         ┌─────────────────┐
                            │   bom_snapshots      │         │inventory_txns   │
                            │                      │         │                 │
                            │ - id                 │         │ - id            │
                            │ - order_id (FK)      │         │ - store_id (FK) │
                            │ - sku_id (FK)        │         │ - sku_id (FK)   │
                            │ - snapshot_data(JSON)│         │ - txn_type      │← EXTENDED
                            │ - created_at         │         │ - quantity      │
                            └──────────────────────┘         │ - qty_before    │
                                                             │ - qty_after     │
                            ┌─────────────────┐              │ - order_id (FK) │← NEW
                            │      skus       │              │ - bom_snap_id   │← NEW
                            │                 │              │ - operator_id   │
                            │ - id            │              │ - operated_at   │
                            │ - name          │              │ - notes         │
                            │ - type          │              └─────────────────┘
                            │ - unit          │
                            │ - cost          │
                            └─────────────────┘
                                     ▲
                                     │
                                     │
                            ┌─────────────────┐
                            │  bom_components │
                            │                 │
                            │ - id            │
                            │ - parent_sku_id │
                            │ - component_id  │
                            │ - quantity      │
                            │ - wastage_rate  │
                            └─────────────────┘
```

---

## Table Definitions

### 1. `inventory` (Extended)

**Purpose**: Extends existing inventory table to track reserved quantities.

**Modifications**:
- Add `reserved_quantity` column to track locked inventory

```sql
-- Extension to existing inventory table
ALTER TABLE inventory
ADD COLUMN reserved_quantity DECIMAL(15, 4) NOT NULL DEFAULT 0.0
    CHECK (reserved_quantity >= 0);

-- Add computed column for available inventory (optional, can be computed in app layer)
ALTER TABLE inventory
ADD COLUMN available_quantity DECIMAL(15, 4)
    GENERATED ALWAYS AS (current_quantity - reserved_quantity) STORED;

-- Add index for concurrent locking
CREATE INDEX idx_inventory_lock ON inventory(store_id, sku_id);

-- Table structure after extension:
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    sku_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
    current_quantity DECIMAL(15, 4) NOT NULL DEFAULT 0.0 CHECK (current_quantity >= 0),
    reserved_quantity DECIMAL(15, 4) NOT NULL DEFAULT 0.0 CHECK (reserved_quantity >= 0), -- NEW
    available_quantity DECIMAL(15, 4) GENERATED ALWAYS AS (current_quantity - reserved_quantity) STORED, -- NEW
    min_quantity DECIMAL(15, 4),
    max_quantity DECIMAL(15, 4),
    unit VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (store_id, sku_id),
    CHECK (current_quantity >= reserved_quantity) -- Ensure reserved ≤ current
);
```

**Validation Rules**:
- `reserved_quantity` ≥ 0
- `current_quantity` ≥ `reserved_quantity` (cannot reserve more than available)
- `available_quantity` = `current_quantity` - `reserved_quantity` (computed field)

**Indexes**:
- `idx_inventory_lock (store_id, sku_id)`: For row-level locking in SELECT FOR UPDATE

---

### 2. `inventory_reservations` (New)

**Purpose**: Records inventory reservation locks created when orders are placed.

**Schema**:

```sql
CREATE TABLE inventory_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    sku_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
    reserved_quantity DECIMAL(15, 4) NOT NULL CHECK (reserved_quantity > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ, -- Optional: auto-release after timeout (e.g., 30 minutes)
    fulfilled_at TIMESTAMPTZ, -- When order was fulfilled and inventory deducted
    cancelled_at TIMESTAMPTZ, -- When reservation was released due to order cancellation
    notes TEXT,
    CONSTRAINT chk_reservation_status CHECK (status IN ('ACTIVE', 'FULFILLED', 'CANCELLED', 'EXPIRED'))
);

-- Indexes
CREATE INDEX idx_reservations_order ON inventory_reservations(order_id);
CREATE INDEX idx_reservations_status_expires ON inventory_reservations(status, expires_at) WHERE status = 'ACTIVE';
CREATE INDEX idx_reservations_sku ON inventory_reservations(store_id, sku_id);
```

**Fields**:

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | UUID | Primary key | PK, auto-generated |
| `order_id` | UUID | Referenced order | FK to orders(id), NOT NULL |
| `store_id` | UUID | Store where inventory is reserved | FK to stores(id), NOT NULL |
| `sku_id` | UUID | SKU being reserved | FK to skus(id), NOT NULL |
| `reserved_quantity` | DECIMAL(15,4) | Quantity locked | > 0 |
| `status` | VARCHAR(20) | Reservation state | ACTIVE \| FULFILLED \| CANCELLED \| EXPIRED |
| `created_at` | TIMESTAMPTZ | Reservation creation time | NOT NULL, default NOW() |
| `expires_at` | TIMESTAMPTZ | Auto-release time | NULL (no expiry) or future timestamp |
| `fulfilled_at` | TIMESTAMPTZ | When order was fulfilled | NULL until fulfillment |
| `cancelled_at` | TIMESTAMPTZ | When reservation was cancelled | NULL until cancellation |
| `notes` | TEXT | Additional information | - |

**State Transitions**:

```
ACTIVE ──(fulfillment)──> FULFILLED
   │
   ├──(cancellation)────> CANCELLED
   │
   └──(timeout)─────────> EXPIRED
```

**Validation Rules**:
- Only one ACTIVE reservation per (order_id, sku_id) pair
- `reserved_quantity` must be > 0
- Status must be one of: ACTIVE, FULFILLED, CANCELLED, EXPIRED
- `fulfilled_at` is set only when status = FULFILLED
- `cancelled_at` is set only when status = CANCELLED or EXPIRED

**Indexes**:
- `idx_reservations_order`: For querying all reservations for an order
- `idx_reservations_status_expires`: For timeout cleanup job (find ACTIVE + expired records)
- `idx_reservations_sku`: For inventory availability checks

---

### 3. `inventory_transactions` (Extended)

**Purpose**: Extends existing inventory transaction log to support BOM deduction tracking.

**Modifications**:
- Extend `transaction_type` enum to include BOM-related types
- Add `related_order_id` to link transactions to orders
- Add `bom_snapshot_id` to track which BOM version was used

```sql
-- Extend transaction_type enum
ALTER TYPE transaction_type ADD VALUE 'BOM_RESERVATION';
ALTER TYPE transaction_type ADD VALUE 'BOM_DEDUCTION';
ALTER TYPE transaction_type ADD VALUE 'RESERVATION_RELEASE';

-- Add new columns
ALTER TABLE inventory_transactions
ADD COLUMN related_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
ADD COLUMN bom_snapshot_id UUID REFERENCES bom_snapshots(id) ON DELETE SET NULL;

-- Add indexes
CREATE INDEX idx_transactions_order ON inventory_transactions(related_order_id);
CREATE INDEX idx_transactions_store_type ON inventory_transactions(store_id, transaction_type);

-- Full table structure after extension:
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    sku_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL, -- ADJUSTMENT_SURPLUS | ADJUSTMENT_SHORTAGE | DAMAGE | BOM_RESERVATION | BOM_DEDUCTION | RESERVATION_RELEASE | TRANSFER_IN | TRANSFER_OUT
    quantity DECIMAL(15, 4) NOT NULL, -- Positive = increase, Negative = decrease
    quantity_before DECIMAL(15, 4) NOT NULL,
    quantity_after DECIMAL(15, 4) NOT NULL,
    related_order_id UUID REFERENCES orders(id) ON DELETE SET NULL, -- NEW: For BOM transactions
    bom_snapshot_id UUID REFERENCES bom_snapshots(id) ON DELETE SET NULL, -- NEW: For audit trail
    adjustment_reason_id UUID REFERENCES adjustment_reasons(id) ON DELETE SET NULL, -- From P004
    operator_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    operated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_transactions_sku_time ON inventory_transactions(sku_id, operated_at DESC);
CREATE INDEX idx_transactions_order ON inventory_transactions(related_order_id);
CREATE INDEX idx_transactions_store_type ON inventory_transactions(store_id, transaction_type);
```

**New Transaction Types**:

| Type | Description | Quantity Sign | Use Case |
|------|-------------|---------------|----------|
| `BOM_RESERVATION` | Inventory reserved for order | 0 (informational) | Track when reservation is created |
| `BOM_DEDUCTION` | Inventory deducted for fulfillment | Negative | Actual inventory consumption |
| `RESERVATION_RELEASE` | Reservation released (cancellation/expiry) | 0 (informational) | Track when reservation is freed |

**Example Records**:

```sql
-- Reservation creation (informational, no quantity change)
INSERT INTO inventory_transactions VALUES (
    '...', 'store-001', 'sku-whiskey', 'BOM_RESERVATION',
    0, 100, 100, -- No quantity change, but reserved_quantity increased separately
    'order-123', NULL, NULL, 'operator-001', NOW(), 'Reserved 45ml for order'
);

-- Fulfillment deduction
INSERT INTO inventory_transactions VALUES (
    '...', 'store-001', 'sku-whiskey', 'BOM_DEDUCTION',
    -45, 100, 55, -- Deduct 45ml from current_quantity
    'order-123', 'snapshot-001', NULL, 'operator-001', NOW(), 'Deducted 45ml for cocktail fulfillment'
);

-- Cancellation release (informational)
INSERT INTO inventory_transactions VALUES (
    '...', 'store-001', 'sku-whiskey', 'RESERVATION_RELEASE',
    0, 55, 55, -- No quantity change, but reserved_quantity decreased separately
    'order-123', NULL, NULL, 'operator-001', NOW(), 'Released reservation due to order cancellation'
);
```

---

### 4. `bom_snapshots` (New)

**Purpose**: Stores BOM formula snapshots at order creation time to lock component versions.

**Schema**:

```sql
CREATE TABLE bom_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    sku_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
    snapshot_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_snapshots_order ON bom_snapshots(order_id);
CREATE INDEX idx_snapshots_sku ON bom_snapshots(sku_id);
```

**Fields**:

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | UUID | Primary key | PK, auto-generated |
| `order_id` | UUID | Referenced order | FK to orders(id), NOT NULL |
| `sku_id` | UUID | Finished product SKU | FK to skus(id), NOT NULL |
| `snapshot_data` | JSONB | BOM formula snapshot (JSON) | NOT NULL |
| `created_at` | TIMESTAMPTZ | Snapshot creation time | NOT NULL, default NOW() |

**`snapshot_data` JSON Schema**:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["formulaId", "skuId", "skuName", "components"],
  "properties": {
    "formulaId": {
      "type": "string",
      "description": "BOM formula ID at snapshot time"
    },
    "skuId": {
      "type": "string",
      "description": "Finished product SKU ID"
    },
    "skuName": {
      "type": "string",
      "description": "Finished product name"
    },
    "components": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["skuId", "skuName", "quantity", "unit"],
        "properties": {
          "skuId": {"type": "string"},
          "skuName": {"type": "string"},
          "quantity": {"type": "number"},
          "unit": {"type": "string"},
          "wastageRate": {"type": "number", "default": 0.0}
        }
      }
    }
  }
}
```

**Example Snapshot**:

```json
{
  "formulaId": "f001",
  "skuId": "s123",
  "skuName": "威士忌可乐鸡尾酒",
  "components": [
    {
      "skuId": "raw001",
      "skuName": "Jack Daniel's威士忌",
      "quantity": 45.0,
      "unit": "ml",
      "wastageRate": 0.05
    },
    {
      "skuId": "raw002",
      "skuName": "可乐糖浆",
      "quantity": 150.0,
      "unit": "ml",
      "wastageRate": 0.02
    },
    {
      "skuId": "pkg001",
      "skuName": "高脚杯",
      "quantity": 1.0,
      "unit": "个",
      "wastageRate": 0.0
    },
    {
      "skuId": "pkg002",
      "skuName": "吸管",
      "quantity": 1.0,
      "unit": "根",
      "wastageRate": 0.0
    }
  ]
}
```

---

## Data Integrity Rules

### Inventory Constraints

1. **Non-negative quantities**:
   ```sql
   CHECK (current_quantity >= 0)
   CHECK (reserved_quantity >= 0)
   CHECK (current_quantity >= reserved_quantity)
   ```

2. **Available quantity consistency**:
   ```sql
   -- Computed field ensures consistency
   available_quantity = current_quantity - reserved_quantity
   ```

### Reservation State Machine

1. **Single active reservation** per (order_id, sku_id):
   ```sql
   CREATE UNIQUE INDEX idx_reservations_active
   ON inventory_reservations(order_id, sku_id)
   WHERE status = 'ACTIVE';
   ```

2. **Terminal states** (FULFILLED, CANCELLED, EXPIRED) cannot transition:
   ```sql
   -- Enforced at application layer
   if (reservation.status IN ('FULFILLED', 'CANCELLED', 'EXPIRED')) {
       throw new IllegalStateException("Cannot modify terminal reservation");
   }
   ```

### Transaction Log Integrity

1. **Quantity consistency**:
   ```sql
   CHECK (quantity_after = quantity_before + quantity)
   ```

2. **BOM transaction linkage**:
   - `BOM_RESERVATION`, `BOM_DEDUCTION`, `RESERVATION_RELEASE` types **must have** `related_order_id`
   - `BOM_DEDUCTION` **should have** `bom_snapshot_id` for audit trail

---

## Performance Considerations

### Indexing Strategy

1. **Concurrent access**:
   - `inventory(store_id, sku_id)`: For row-level locking in SELECT FOR UPDATE
   - `inventory_reservations(status, expires_at)`: For timeout cleanup job

2. **Query optimization**:
   - `inventory_transactions(sku_id, operated_at DESC)`: For transaction history queries
   - `inventory_transactions(related_order_id)`: For order-linked transaction lookup
   - `inventory_transactions(store_id, transaction_type)`: For filtering by type

3. **Foreign key lookups**:
   - `inventory_reservations(order_id)`: For querying all reservations for an order
   - `bom_snapshots(order_id)`: For retrieving BOM snapshot during fulfillment

### Database Optimization

1. **Partitioning** (future enhancement):
   - Partition `inventory_transactions` by `operated_at` (monthly partitions)
   - Archive old partitions to reduce active data set

2. **Caching**:
   - Cache BOM formulas in application layer (Caffeine cache, TTL=5 min)
   - Cache inventory availability checks (Redis, TTL=10 sec) for high-traffic SKUs

3. **Connection pooling**:
   - Configure HikariCP with appropriate pool size for concurrent reservation operations
   - Recommended: `maximumPoolSize = 20`, `minimumIdle = 5`

---

## Migration Scripts

### Phase 1: Extend existing tables

```sql
-- Add reserved_quantity to inventory
BEGIN;

ALTER TABLE inventory
ADD COLUMN reserved_quantity DECIMAL(15, 4) NOT NULL DEFAULT 0.0
    CHECK (reserved_quantity >= 0);

ALTER TABLE inventory
ADD COLUMN available_quantity DECIMAL(15, 4)
    GENERATED ALWAYS AS (current_quantity - reserved_quantity) STORED;

ALTER TABLE inventory
ADD CONSTRAINT chk_inventory_reserved
    CHECK (current_quantity >= reserved_quantity);

CREATE INDEX idx_inventory_lock ON inventory(store_id, sku_id);

COMMIT;
```

### Phase 2: Create new tables

```sql
-- Create inventory_reservations table
BEGIN;

CREATE TABLE inventory_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    sku_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
    reserved_quantity DECIMAL(15, 4) NOT NULL CHECK (reserved_quantity > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    fulfilled_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    notes TEXT,
    CONSTRAINT chk_reservation_status CHECK (status IN ('ACTIVE', 'FULFILLED', 'CANCELLED', 'EXPIRED'))
);

CREATE INDEX idx_reservations_order ON inventory_reservations(order_id);
CREATE INDEX idx_reservations_status_expires ON inventory_reservations(status, expires_at) WHERE status = 'ACTIVE';
CREATE INDEX idx_reservations_sku ON inventory_reservations(store_id, sku_id);

COMMIT;
```

```sql
-- Create bom_snapshots table
BEGIN;

CREATE TABLE bom_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    sku_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
    snapshot_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_snapshots_order ON bom_snapshots(order_id);
CREATE INDEX idx_snapshots_sku ON bom_snapshots(sku_id);

COMMIT;
```

### Phase 3: Extend inventory_transactions

```sql
-- Extend inventory_transactions table
BEGIN;

-- Add new columns
ALTER TABLE inventory_transactions
ADD COLUMN related_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
ADD COLUMN bom_snapshot_id UUID REFERENCES bom_snapshots(id) ON DELETE SET NULL;

-- Add indexes
CREATE INDEX idx_transactions_order ON inventory_transactions(related_order_id);
CREATE INDEX idx_transactions_store_type ON inventory_transactions(store_id, transaction_type);

-- Note: transaction_type enum extension depends on database setup
-- If using CHECK constraint instead of enum:
ALTER TABLE inventory_transactions DROP CONSTRAINT IF EXISTS chk_transaction_type;
ALTER TABLE inventory_transactions ADD CONSTRAINT chk_transaction_type
    CHECK (transaction_type IN (
        'ADJUSTMENT_SURPLUS', 'ADJUSTMENT_SHORTAGE', 'DAMAGE',
        'BOM_RESERVATION', 'BOM_DEDUCTION', 'RESERVATION_RELEASE',
        'TRANSFER_IN', 'TRANSFER_OUT'
    ));

COMMIT;
```

---

## Rollback Scripts

```sql
-- Rollback Phase 3
BEGIN;
ALTER TABLE inventory_transactions DROP COLUMN related_order_id;
ALTER TABLE inventory_transactions DROP COLUMN bom_snapshot_id;
DROP INDEX idx_transactions_order;
DROP INDEX idx_transactions_store_type;
-- Restore original transaction_type constraint
ALTER TABLE inventory_transactions DROP CONSTRAINT chk_transaction_type;
ALTER TABLE inventory_transactions ADD CONSTRAINT chk_transaction_type
    CHECK (transaction_type IN (
        'ADJUSTMENT_SURPLUS', 'ADJUSTMENT_SHORTAGE', 'DAMAGE',
        'TRANSFER_IN', 'TRANSFER_OUT'
    ));
COMMIT;

-- Rollback Phase 2
BEGIN;
DROP TABLE bom_snapshots;
DROP TABLE inventory_reservations;
COMMIT;

-- Rollback Phase 1
BEGIN;
DROP INDEX idx_inventory_lock;
ALTER TABLE inventory DROP CONSTRAINT chk_inventory_reserved;
ALTER TABLE inventory DROP COLUMN available_quantity;
ALTER TABLE inventory DROP COLUMN reserved_quantity;
COMMIT;
```

---

## Testing Strategy

### Unit Tests

1. **Inventory constraints**:
   - Verify `current_quantity` ≥ `reserved_quantity` constraint
   - Test negative quantity rejection
   - Test available_quantity computation

2. **Reservation state transitions**:
   - Test ACTIVE → FULFILLED transition
   - Test ACTIVE → CANCELLED transition
   - Test ACTIVE → EXPIRED transition
   - Verify terminal states cannot be modified

3. **Transaction log integrity**:
   - Verify `quantity_after = quantity_before + quantity`
   - Test BOM transaction types require `related_order_id`

### Integration Tests

1. **Concurrent reservation**:
   - Simulate 100 concurrent orders for same SKU
   - Verify no overselling (available_quantity never negative)
   - Measure lock contention and throughput

2. **BOM snapshot versioning**:
   - Create order with BOM v1
   - Update BOM to v2
   - Fulfill order, verify deduction uses v1 snapshot

3. **Transaction log audit**:
   - Create reservation → verify BOM_RESERVATION transaction
   - Fulfill order → verify BOM_DEDUCTION transaction with correct quantities
   - Cancel order → verify RESERVATION_RELEASE transaction

---

**Data Model Complete** ✅
Ready to proceed to API Contracts generation.
