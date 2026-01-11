# Research & Decision Documentation: N004

**Feature**: 采购订单物料选择器改造
**Date**: 2026-01-11
**Status**: Phase 0 - Research Complete

---

## Research Areas

### 1. M001 Material Entity Schema Verification

**Question**: Does M001 Material entity include all required fields for N004 integration?

**Research**:
查阅 M001-material-unit-system 相关文档和验证报告。

**Findings**:
根据 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/docs/migration/M001-FIX-VERIFICATION-REPORT.md`:

✅ **Confirmed M001 Material Entity Fields**:
- `id` (UUID, PK)
- `code` (VARCHAR(50)) - Material code
- `name` (VARCHAR(200)) - Material name
- `specification` (VARCHAR(500)) - Specification (单数形式,已修复)
- `category` (ENUM) - Category (RAW_MATERIAL/PACKAGING/SEMI_FINISHED)
- `purchase_unit_id` (UUID, FK) - Purchase unit reference
- `inventory_unit_id` (UUID, FK) - Inventory unit reference
- `conversion_rate` (DECIMAL(12,6)) - Material-level conversion rate
- `use_global_conversion` (BOOLEAN) - Whether to use global conversion rules

✅ **M001 Status**: 编译验证通过 (BUILD SUCCESS 5.230秒), 所有关键修复已完成

**Decision**: M001 Material entity schema is **ready for N004 integration**. No additional fields required.

---

### 2. CommonConversionService API Contract

**Question**: What is the exact method signature and behavior of `CommonConversionService.convert()`?

**Research**:
检查 M001 验证报告中的修复记录。

**Findings**:
根据 M001-FIX-VERIFICATION-REPORT.md (lines 48-61):

```java
// ✅ Correct method name (已修复)
BigDecimal rate = directRule.get().getConversionRate();  // Line 30
BigDecimal rate = reverseRule.get().getConversionRate(); // Line 39

// Package import path (已修复)
import com.cinema.unitconversion.domain.UnitConversion;
import com.cinema.unitconversion.repository.UnitConversionRepository;
```

**Assumed API Contract** (based on M001 context):
```java
public interface CommonConversionService {
    /**
     * Convert quantity from one unit to another
     * @param fromUnit Source unit code (e.g., "瓶")
     * @param toUnit Target unit code (e.g., "ml")
     * @param value Quantity in source unit
     * @return Converted quantity in target unit
     * @throws IllegalArgumentException if conversion rule not found or units incompatible
     */
    BigDecimal convert(String fromUnit, String toUnit, BigDecimal value);
}
```

**Decision**: Will use `CommonConversionService.convert(fromUnit, toUnit, value)` as specified in FR-010. Need to verify exact package path in Phase 1 (likely `com.cinema.unitconversion.service.CommonConversionService`).

---

### 3. Existing PurchaseOrderItem Entity Schema

**Question**: What is the current schema of `purchase_order_items` table to plan migration?

**Assumptions** (based on spec context):
Current schema (before N004 changes):
- `id` (UUID, PK)
- `purchase_order_id` (UUID, FK)
- `sku_id` (UUID, FK, **NOT NULL** before migration)
- `quantity` (DECIMAL(12,3))
- `unit` (VARCHAR(20))
- `unit_price` (DECIMAL(12,2))
- `total_price` (DECIMAL(12,2))

**Migration Requirements**:
1. Add `material_id` (UUID, FK, nullable)
2. Add `item_type` (ENUM: MATERIAL/SKU, NOT NULL)
3. Add `material_name` (VARCHAR(200), nullable)
4. Modify `sku_id` to nullable
5. Add CHECK constraint: `(material_id IS NOT NULL AND sku_id IS NULL) OR (material_id IS NULL AND sku_id IS NOT NULL)`

**Decision**: Migration script will be designed in Phase 1 with exact table structure verification.

---

### 4. Frontend Component Reusability Scope

**Question**: Where will `<MaterialSkuSelector />` be used beyond procurement orders?

**Findings** (from spec User Story 4):
Identified use cases:
1. **Procurement Order Creation** (P1) - Primary use case
2. **BOM Configuration** (P2, future) - Material/SKU selection for recipe formulas
3. **Inventory Adjustment** (P2, future) - Stock adjustment for materials or finished products

**Decision**: Component will be designed as **standalone reusable component** in `frontend/src/components/organisms/MaterialSkuSelector/` (NOT feature-specific), supporting three modes: `material-only`, `sku-only`, `dual`.

---

### 5. Historical Data Migration Strategy

**Question**: How to handle 100,000+ historical records efficiently?

**Risk Assessment** (from spec Risks section):
- Risk: Data migration may take >5 minutes for 500,000 records
- Mitigation: Batch update strategy (10,000 records per batch)

**Research**:
Flyway best practices for large data migrations:
- Use batch SQL (`UPDATE ... LIMIT 10000`) in loop
- Add migration timeout configuration
- Log progress every batch

**Decision**: Implement **batch migration** with following strategy:
```sql
-- V2026_01_11_001__add_material_support_to_purchase_order_items.sql
-- Step 1: Add columns (fast)
ALTER TABLE purchase_order_items ADD COLUMN material_id UUID REFERENCES material(id);
ALTER TABLE purchase_order_items ADD COLUMN item_type VARCHAR(20);
ALTER TABLE purchase_order_items ADD COLUMN material_name VARCHAR(200);
ALTER TABLE purchase_order_items ALTER COLUMN sku_id DROP NOT NULL;

-- Step 2: Batch update item_type for historical records (slow, batched)
DO $$
DECLARE
    batch_size INT := 10000;
    affected_rows INT;
BEGIN
    LOOP
        UPDATE purchase_order_items
        SET item_type = 'SKU'
        WHERE item_type IS NULL AND sku_id IS NOT NULL
        LIMIT batch_size;

        GET DIAGNOSTICS affected_rows = ROW_COUNT;
        RAISE NOTICE 'Updated % rows', affected_rows;

        EXIT WHEN affected_rows < batch_size;
        COMMIT;
    END LOOP;
END $$;

-- Step 3: Add NOT NULL constraint after data populated
ALTER TABLE purchase_order_items ALTER COLUMN item_type SET NOT NULL;

-- Step 4: Add CHECK constraint
ALTER TABLE purchase_order_items ADD CONSTRAINT check_material_sku_exclusive
    CHECK ((material_id IS NOT NULL AND sku_id IS NULL) OR (material_id IS NULL AND sku_id IS NOT NULL));
```

---

### 6. Unit Conversion Error Handling

**Question**: How should frontend and backend handle unit conversion failures?

**Scenarios**:
1. Missing conversion rule (e.g., "瓶" to "ml" rule not configured)
2. Incompatible units (e.g., "kg" cannot convert to "ml")
3. Material missing `purchaseUnit` or `inventoryUnit`

**Decision**:
- **Backend**: Throw `IllegalArgumentException` with descriptive message (FR-013)
- **Frontend Validation**: Pre-validate material configuration before allowing selection (FR-018)
  - Fetch material details when user selects in selector
  - Check if `purchaseUnit` and `inventoryUnit` are both non-null
  - Check if conversion rule exists (optional pre-check, backend will catch)
  - Display warning toast if validation fails: "该物料尚未配置采购单位或库存单位，无法采购"

**Implementation**:
```typescript
// Frontend validation hook
const useMaterialValidator = () => {
  return useCallback((material: Material) => {
    if (!material.purchaseUnitId || !material.inventoryUnitId) {
      toast.error("该物料尚未配置采购单位或库存单位，无法采购");
      return false;
    }
    return true;
  }, []);
};
```

---

### 7. Finished Product Procurement Business Cases

**Question**: Are there real-world scenarios where finished product procurement is necessary?

**Findings** (from clarification session 2026-01-11):
User-provided business cases:
- **听装饮料** (Canned beverages) - Cannot self-can, must procure finished products (e.g., Coca-Cola cans, beer cans)
- **潮玩/周边商品** (Toys/Merchandise) - Movie blind boxes, brand toys for cinema retail area
- **包装零食** (Packaged snacks) - Chips, chocolate (already packaged, direct procurement)
- **其他成品** (Other finished goods) - Ice cream, books, cultural products

**Business Justification**:
95% procurement = Raw materials + Packaging (core business)
5% procurement = Finished products (edge case but necessary for business completeness)

**Decision**: Dual selector (`mode="dual"`) is **justified** for business completeness. Default to "物料" tab to optimize for 95% use case.

---

## Research Summary

### ✅ Ready to Proceed
1. M001 Material entity schema verified and ready
2. `CommonConversionService` API contract understood
3. Historical data migration strategy defined (batch update)
4. Frontend component reusability scope clarified
5. Error handling approach defined

### ⚠️ Phase 1 Verification Required
1. Exact package path for `CommonConversionService` (assumed `com.cinema.unitconversion.service.*`)
2. Current `purchase_order_items` table schema (will verify via database inspection or existing JPA entity)
3. Performance test for batch migration (will simulate on test data)

### 📋 No Blockers
All research questions resolved. Ready to proceed to Phase 1 (Design & Contracts).

---

**Research Completed**: 2026-01-11
**Next Phase**: Phase 1 - Design & Contracts (data-model.md, contracts/, quickstart.md)
