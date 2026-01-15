# Data Model Design: N004

**Feature**: 采购订单物料选择器改造
**Date**: 2026-01-11
**Status**: Phase 1 - Design

---

## Entity Relationship Diagram (ERD)

```
┌─────────────────────┐       ┌──────────────────────┐
│   Material (M001)   │       │   SKU (Existing)     │
│─────────────────────│       │──────────────────────│
│ id (UUID, PK)       │       │ id (UUID, PK)        │
│ code (VARCHAR(50))  │       │ code (VARCHAR(50))   │
│ name (VARCHAR(200)) │       │ name (VARCHAR(200))  │
│ category (ENUM)     │       │ main_unit (VARCHAR)  │
│ purchase_unit_id ───┼──┐    │ ...                  │
│ inventory_unit_id ──┼──┤    │                      │
│ conversion_rate     │  │    │                      │
│ ...                 │  │    │                      │
└─────────────────────┘  │    └──────────────────────┘
           │             │              │
           │ 0..1        │              │ 0..1
           │             │              │
           │             │              │
           ▼             │              ▼
┌────────────────────────┴──────────────────────────┐
│     PurchaseOrderItem (Modified for N004)         │
│───────────────────────────────────────────────────│
│ id (UUID, PK)                                     │
│ purchase_order_id (UUID, FK) → PurchaseOrder      │
│ item_type (ENUM: MATERIAL/SKU) ★NEW★             │
│ material_id (UUID, FK, nullable) ★NEW★           │
│ sku_id (UUID, FK, nullable) ★MODIFIED★           │
│ material_name (VARCHAR(200), nullable) ★NEW★     │
│ quantity (DECIMAL(12,3))                          │
│ unit (VARCHAR(20))                                │
│ unit_price (DECIMAL(12,2))                        │
│ total_price (DECIMAL(12,2))                       │
│ created_at (TIMESTAMP)                            │
│ updated_at (TIMESTAMP)                            │
│                                                   │
│ CONSTRAINT check_material_sku_exclusive:          │
│   (material_id IS NOT NULL AND sku_id IS NULL) OR │
│   (material_id IS NULL AND sku_id IS NOT NULL)    │
└───────────────────────────────────────────────────┘
           │
           │ N
           │
           ▼
┌─────────────────────┐
│   PurchaseOrder     │
│─────────────────────│
│ id (UUID, PK)       │
│ order_no (VARCHAR)  │
│ supplier_id (UUID)  │
│ status (ENUM)       │
│ ...                 │
└─────────────────────┘
```

---

## Database Schema Changes

### 1. PurchaseOrderItem Table Migration

**Migration Script**: `V2026_01_11_001__add_material_support_to_purchase_order_items.sql`

```sql
-- ============================================================
-- Migration: Add Material support to purchase_order_items
-- Spec: N004-procurement-material-selector
-- Date: 2026-01-11
-- ============================================================

-- Step 1: Add new columns (fast operation)
ALTER TABLE purchase_order_items
ADD COLUMN material_id UUID REFERENCES material(id) ON DELETE RESTRICT,
ADD COLUMN item_type VARCHAR(20),
ADD COLUMN material_name VARCHAR(200);

-- Step 2: Allow sku_id to be nullable (fast operation)
ALTER TABLE purchase_order_items
ALTER COLUMN sku_id DROP NOT NULL;

-- Step 3: Backfill item_type for historical records (slow, batched)
-- All existing records have sku_id, so set them to 'SKU' type
DO $$
DECLARE
    batch_size INT := 10000;
    affected_rows INT;
    total_updated INT := 0;
BEGIN
    RAISE NOTICE 'Starting batch update for item_type column...';

    LOOP
        -- Update in batches to avoid long-running transactions
        UPDATE purchase_order_items
        SET item_type = 'SKU'
        WHERE item_type IS NULL
          AND sku_id IS NOT NULL
          AND material_id IS NULL
        LIMIT batch_size;

        GET DIAGNOSTICS affected_rows = ROW_COUNT;
        total_updated := total_updated + affected_rows;

        RAISE NOTICE 'Updated % rows (total: %)', affected_rows, total_updated;

        -- Exit when no more rows to update
        EXIT WHEN affected_rows < batch_size;

        -- Commit after each batch
        COMMIT;
    END LOOP;

    RAISE NOTICE 'Batch update completed. Total rows updated: %', total_updated;
END $$;

-- Step 4: Set item_type as NOT NULL after data populated
ALTER TABLE purchase_order_items
ALTER COLUMN item_type SET NOT NULL;

-- Step 5: Add CHECK constraint for mutual exclusivity
ALTER TABLE purchase_order_items
ADD CONSTRAINT check_material_sku_exclusive
    CHECK (
        (material_id IS NOT NULL AND sku_id IS NULL) OR
        (material_id IS NULL AND sku_id IS NOT NULL)
    );

-- Step 6: Create index for material_id lookups
CREATE INDEX idx_purchase_order_items_material_id
ON purchase_order_items(material_id)
WHERE material_id IS NOT NULL;

-- Step 7: Create index for item_type filtering
CREATE INDEX idx_purchase_order_items_item_type
ON purchase_order_items(item_type);

-- ============================================================
-- Migration Validation
-- ============================================================

-- Verify all records have valid item_type
DO $$
DECLARE
    invalid_count INT;
BEGIN
    SELECT COUNT(*) INTO invalid_count
    FROM purchase_order_items
    WHERE item_type NOT IN ('MATERIAL', 'SKU');

    IF invalid_count > 0 THEN
        RAISE EXCEPTION 'Migration validation failed: % records have invalid item_type', invalid_count;
    END IF;

    RAISE NOTICE 'Validation passed: All records have valid item_type';
END $$;

-- Verify CHECK constraint works (test will fail, proving constraint is active)
-- Uncomment to test:
-- INSERT INTO purchase_order_items (id, purchase_order_id, item_type, material_id, sku_id, quantity, unit, unit_price, total_price)
-- VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'MATERIAL', gen_random_uuid(), gen_random_uuid(), 10, '瓶', 50.00, 500.00);
-- Expected error: "new row for relation \"purchase_order_items\" violates check constraint \"check_material_sku_exclusive\""

COMMIT;
```

**Rollback Script**: `V2026_01_11_001__rollback.sql`

```sql
-- Rollback script for N004 migration (emergency use only)

-- Remove CHECK constraint
ALTER TABLE purchase_order_items
DROP CONSTRAINT IF EXISTS check_material_sku_exclusive;

-- Remove indexes
DROP INDEX IF EXISTS idx_purchase_order_items_material_id;
DROP INDEX IF EXISTS idx_purchase_order_items_item_type;

-- Remove new columns
ALTER TABLE purchase_order_items
DROP COLUMN IF EXISTS material_id,
DROP COLUMN IF EXISTS item_type,
DROP COLUMN IF EXISTS material_name;

-- Restore sku_id NOT NULL constraint
ALTER TABLE purchase_order_items
ALTER COLUMN sku_id SET NOT NULL;

COMMIT;
```

---

## JPA Entity Definitions

### 1. PurchaseOrderItem Entity (Modified)

**Path**: `backend/src/main/java/com/cinema/procurement/domain/PurchaseOrderItem.java`

```java
/**
 * @spec N004-procurement-material-selector
 * Purchase order item entity - supports both Material and SKU procurement
 */
package com.cinema.procurement.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "purchase_order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    private PurchaseOrder purchaseOrder;

    /**
     * Item type: MATERIAL or SKU
     * NEW in N004 - determines which entity reference to use
     */
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "item_type", nullable = false, length = 20)
    private ItemType itemType;

    /**
     * Material reference (nullable, used when itemType = MATERIAL)
     * NEW in N004 - replaces SKU for raw material/packaging procurement
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id")
    private Material material;

    /**
     * SKU reference (nullable, used when itemType = SKU)
     * MODIFIED in N004 - changed from NOT NULL to nullable
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sku_id")
    private Sku sku;

    /**
     * Material name redundancy (for soft-delete scenarios)
     * NEW in N004 - preserves material name even if Material entity is deleted
     */
    @Column(name = "material_name", length = 200)
    private String materialName;

    @NotNull
    @Positive
    @Column(nullable = false, precision = 12, scale = 3)
    private BigDecimal quantity;

    @NotNull
    @Column(nullable = false, length = 20)
    private String unit;

    @NotNull
    @Positive
    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @NotNull
    @Positive
    @Column(name = "total_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        // Validate mutual exclusivity (redundant with DB constraint, defensive programming)
        validateMaterialSkuExclusivity();

        // Auto-populate material_name for Material items
        if (itemType == ItemType.MATERIAL && material != null) {
            materialName = material.getName();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        validateMaterialSkuExclusivity();

        // Update material_name if Material changed
        if (itemType == ItemType.MATERIAL && material != null) {
            materialName = material.getName();
        }
    }

    /**
     * Validate that exactly one of material_id or sku_id is non-null
     * @throws IllegalStateException if both are null or both are non-null
     */
    private void validateMaterialSkuExclusivity() {
        boolean hasMaterial = (material != null);
        boolean hasSku = (sku != null);

        if (!hasMaterial && !hasSku) {
            throw new IllegalStateException(
                "PurchaseOrderItem must have either material_id or sku_id, both are null"
            );
        }

        if (hasMaterial && hasSku) {
            throw new IllegalStateException(
                "PurchaseOrderItem cannot have both material_id and sku_id, they are mutually exclusive"
            );
        }

        // Validate item_type matches entity reference
        if (itemType == ItemType.MATERIAL && !hasMaterial) {
            throw new IllegalStateException(
                "item_type is MATERIAL but material_id is null"
            );
        }

        if (itemType == ItemType.SKU && !hasSku) {
            throw new IllegalStateException(
                "item_type is SKU but sku_id is null"
            );
        }
    }

    /**
     * Item type enumeration
     */
    public enum ItemType {
        MATERIAL,  // Raw material or packaging procurement
        SKU        // Finished product procurement
    }
}
```

---

## TypeScript Type Definitions

### 1. Frontend Types

**Path**: `frontend/src/types/procurement.ts`

```typescript
/** @spec N004-procurement-material-selector */

/**
 * Purchase order item type enumeration
 */
export type PurchaseOrderItemType = 'MATERIAL' | 'SKU';

/**
 * Material entity (from M001)
 */
export interface Material {
  id: string;
  code: string;
  name: string;
  category: 'RAW_MATERIAL' | 'PACKAGING' | 'SEMI_FINISHED';
  specification: string | null;
  purchaseUnitId: string;
  inventoryUnitId: string;
  conversionRate: number;
  useGlobalConversion: boolean;

  // Populated by API join
  purchaseUnit?: {
    id: string;
    code: string;
    name: string;
  };
  inventoryUnit?: {
    id: string;
    code: string;
    name: string;
  };
}

/**
 * SKU entity (existing, minimal fields for N004)
 */
export interface Sku {
  id: string;
  code: string;
  name: string;
  mainUnit: string;
  specification: string | null;
}

/**
 * Purchase order item DTO (request)
 */
export interface CreatePurchaseOrderItemRequest {
  itemType: PurchaseOrderItemType;
  materialId?: string;  // Required if itemType = MATERIAL
  skuId?: string;       // Required if itemType = SKU
  quantity: number;
  unitPrice: number;

  // Auto-calculated fields (not sent, returned by API)
  // unit: string;  // Auto-filled from Material.purchaseUnit or SKU.mainUnit
  // totalPrice: number;  // quantity * unitPrice
}

/**
 * Purchase order item DTO (response)
 */
export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  itemType: PurchaseOrderItemType;

  // Material reference (populated if itemType = MATERIAL)
  materialId: string | null;
  materialName: string | null;  // Redundancy for soft-delete
  material: Material | null;

  // SKU reference (populated if itemType = SKU)
  skuId: string | null;
  sku: Sku | null;

  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;

  createdAt: string;
  updatedAt: string;
}

/**
 * Material selector component props
 */
export interface MaterialSkuSelectorProps {
  /**
   * Selector mode:
   * - 'material-only': Show only Material list
   * - 'sku-only': Show only SKU list
   * - 'dual': Show both with tab navigation
   */
  mode: 'material-only' | 'sku-only' | 'dual';

  /**
   * Callback when user selects an item
   */
  onChange: (selection: MaterialSkuSelection) => void;

  /**
   * Optional category filter for Material (only applies in material-only/dual mode)
   */
  materialCategory?: Material['category'];

  /**
   * Optional placeholder text
   */
  placeholder?: string;

  /**
   * Optional disabled state
   */
  disabled?: boolean;
}

/**
 * Material/SKU selection result
 */
export interface MaterialSkuSelection {
  type: PurchaseOrderItemType;
  data: Material | Sku;
}
```

---

## Validation Rules

### 1. Backend Validation

**Bean Validation Annotations** (Spring Boot):

```java
/**
 * @spec N004-procurement-material-selector
 * DTO for creating purchase order item
 */
public class CreatePurchaseOrderItemRequest {

    @NotNull(message = "Item type is required")
    private ItemType itemType;

    private UUID materialId;
    private UUID skuId;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    @Digits(integer = 9, fraction = 3, message = "Quantity must be DECIMAL(12,3)")
    private BigDecimal quantity;

    @NotNull(message = "Unit price is required")
    @Positive(message = "Unit price must be positive")
    @Digits(integer = 10, fraction = 2, message = "Unit price must be DECIMAL(12,2)")
    private BigDecimal unitPrice;

    /**
     * Custom validator: Ensure itemType matches materialId/skuId presence
     */
    @AssertTrue(message = "Item type and ID mismatch: MATERIAL items must have materialId, SKU items must have skuId")
    public boolean isValidItemTypeAndId() {
        if (itemType == ItemType.MATERIAL) {
            return materialId != null && skuId == null;
        } else if (itemType == ItemType.SKU) {
            return skuId != null && materialId == null;
        }
        return false;  // Invalid itemType
    }
}
```

### 2. Frontend Validation (Zod)

```typescript
/** @spec N004-procurement-material-selector */
import { z } from 'zod';

/**
 * Zod schema for purchase order item creation
 */
export const createPurchaseOrderItemSchema = z.object({
  itemType: z.enum(['MATERIAL', 'SKU'], {
    errorMap: () => ({ message: 'Item type must be MATERIAL or SKU' })
  }),
  materialId: z.string().uuid().optional(),
  skuId: z.string().uuid().optional(),
  quantity: z.number().positive({ message: 'Quantity must be positive' }),
  unitPrice: z.number().positive({ message: 'Unit price must be positive' }),
}).refine(
  (data) => {
    // Validate mutual exclusivity
    if (data.itemType === 'MATERIAL') {
      return data.materialId != null && data.skuId == null;
    } else if (data.itemType === 'SKU') {
      return data.skuId != null && data.materialId == null;
    }
    return false;
  },
  {
    message: 'Item type and ID mismatch: MATERIAL items must have materialId, SKU items must have skuId',
    path: ['itemType']
  }
);

export type CreatePurchaseOrderItemFormData = z.infer<typeof createPurchaseOrderItemSchema>;
```

---

## Data Flow Diagram

### Create Purchase Order with Material Item

```
┌──────────────┐
│   Frontend   │
│ (Order Form) │
└──────┬───────┘
       │ 1. User selects Material from <MaterialSkuSelector />
       ▼
┌────────────────────────┐
│ MaterialSkuSelector    │
│ - mode="dual"          │
│ - Tab: "物料" active   │
│ - Fetch materials via  │
│   TanStack Query       │
└──────┬─────────────────┘
       │ 2. User picks "可乐糖浆 MAT-RAW-001"
       │    Selection: { type: 'MATERIAL', data: Material }
       ▼
┌────────────────────────┐
│ OrderForm Component    │
│ - Auto-fill unit from  │
│   material.purchaseUnit│
│ - User enters quantity │
│ - Submit form          │
└──────┬─────────────────┘
       │ 3. POST /api/procurement/orders
       │    Body: {
       │      items: [{
       │        itemType: 'MATERIAL',
       │        materialId: 'uuid-123',
       │        quantity: 10,
       │        unitPrice: 50.00
       │      }]
       │    }
       ▼
┌────────────────────────┐
│ Backend Controller     │
│ - Validate DTO         │
│ - Call Service         │
└──────┬─────────────────┘
       │ 4. ProcurementOrderService.createOrder()
       ▼
┌────────────────────────┐
│ Service Layer          │
│ - Fetch Material entity│
│ - Extract purchaseUnit │
│ - Calculate totalPrice │
│ - Build entity         │
│ - Save via JPA         │
└──────┬─────────────────┘
       │ 5. INSERT INTO purchase_order_items
       │    (id, purchase_order_id, item_type, material_id, sku_id, quantity, unit, ...)
       │    VALUES (uuid, order-uuid, 'MATERIAL', mat-uuid, NULL, 10, '瓶', ...)
       ▼
┌────────────────────────┐
│ Database               │
│ - CHECK constraint OK  │
│ - Record persisted     │
└────────────────────────┘
```

### Procurement Inbound with Unit Conversion

```
┌──────────────┐
│   Frontend   │
│ (Inbound Page)│
└──────┬───────┘
       │ 1. User clicks "Confirm Inbound" for order with Material items
       ▼
┌────────────────────────┐
│ POST /api/procurement/ │
│   orders/{id}/inbound  │
└──────┬─────────────────┘
       │ 2. Backend receives inbound request
       ▼
┌────────────────────────┐
│ InboundService         │
│ - Fetch PurchaseOrder  │
│ - Iterate items        │
└──────┬─────────────────┘
       │ 3. For each item with itemType = MATERIAL:
       ▼
┌────────────────────────┐
│ - Fetch Material       │
│ - Get purchaseUnit     │
│ - Get inventoryUnit    │
│ - Call conversion:     │
│   CommonConversionService│
│   .convert(            │
│     "瓶",              │
│     "ml",              │
│     10                 │
│   )                    │
└──────┬─────────────────┘
       │ 4. Conversion result: 5000ml
       ▼
┌────────────────────────┐
│ InventoryService       │
│ - Update or create     │
│   Inventory record     │
│   (inventory_item_type=│
│    MATERIAL,           │
│    material_id=uuid,   │
│    quantity=5000,      │
│    unit="ml")          │
└──────┬─────────────────┘
       │ 5. Commit transaction
       ▼
┌────────────────────────┐
│ Return success response│
│ with converted quantity│
└────────────────────────┘
```

---

## Data Model Summary

### Changes Introduced by N004

| Component | Change Type | Details |
|-----------|------------|---------|
| `purchase_order_items` table | **Modified** | Added `material_id`, `item_type`, `material_name`; made `sku_id` nullable; added CHECK constraint |
| `PurchaseOrderItem` JPA Entity | **Modified** | New fields + validation logic |
| `CreatePurchaseOrderItemRequest` DTO | **Modified** | Support `itemType` field + custom validation |
| `Material` (from M001) | **Referenced** | No changes, used as-is |
| Frontend types | **New** | `MaterialSkuSelection`, `PurchaseOrderItemType`, enhanced `PurchaseOrderItem` interface |

### Data Integrity Guarantees

1. **Mutual Exclusivity**: Database CHECK constraint + JPA validation + Zod validation (triple layer)
2. **Historical Data Compatibility**: Migration script sets `item_type = "SKU"` for all existing records
3. **Soft Delete Handling**: `material_name` redundancy preserves display name even if Material is deleted
4. **Unit Consistency**: Purchase unit always from Material (for MATERIAL items) or SKU (for SKU items)

---

**Data Model Completed**: 2026-01-11
**Next Step**: API Contracts (OpenAPI specification)
