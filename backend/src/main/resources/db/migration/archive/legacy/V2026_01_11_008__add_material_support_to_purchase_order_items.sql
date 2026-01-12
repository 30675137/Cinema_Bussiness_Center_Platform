-- ============================================================
-- @spec N004-procurement-material-selector
-- Migration: Add Material support to purchase_order_items
-- Date: 2026-01-11
-- Description: Support Material procurement (raw materials/packaging)
--              in addition to existing SKU procurement
-- ============================================================

-- Step 1: Add new columns (fast operation)
-- material_id: Reference to Material entity for raw material/packaging procurement
ALTER TABLE purchase_order_items
ADD COLUMN IF NOT EXISTS material_id UUID REFERENCES materials(id) ON DELETE RESTRICT;

-- item_type: Discriminator for MATERIAL vs SKU
ALTER TABLE purchase_order_items
ADD COLUMN IF NOT EXISTS item_type VARCHAR(20);

-- material_name: Redundancy for soft-delete scenarios (preserve name after deletion)
ALTER TABLE purchase_order_items
ADD COLUMN IF NOT EXISTS material_name VARCHAR(200);

-- Step 2: Allow sku_id to be nullable (historical records have it, new Material records won't)
ALTER TABLE purchase_order_items
ALTER COLUMN sku_id DROP NOT NULL;

-- Step 3: Backfill item_type for historical records
-- All existing records have sku_id, so set them to 'SKU' type
-- Using batched update for performance with large datasets (per NFR-003)
DO $$
DECLARE
    batch_size INT := 10000;
    affected_rows INT;
    total_updated INT := 0;
BEGIN
    RAISE NOTICE 'Starting batch update for item_type column...';

    LOOP
        -- Update in batches to avoid long-running transactions
        WITH batch AS (
            SELECT id FROM purchase_order_items
            WHERE item_type IS NULL
              AND sku_id IS NOT NULL
              AND material_id IS NULL
            LIMIT batch_size
            FOR UPDATE SKIP LOCKED
        )
        UPDATE purchase_order_items
        SET item_type = 'SKU'
        WHERE id IN (SELECT id FROM batch);

        GET DIAGNOSTICS affected_rows = ROW_COUNT;
        total_updated := total_updated + affected_rows;

        RAISE NOTICE 'Updated % rows (total: %)', affected_rows, total_updated;

        -- Exit when no more rows to update
        EXIT WHEN affected_rows = 0;

        -- Small pause between batches to reduce lock contention
        PERFORM pg_sleep(0.1);
    END LOOP;

    RAISE NOTICE 'Batch update completed. Total rows updated: %', total_updated;
END $$;

-- Step 4: Set item_type as NOT NULL after data populated
ALTER TABLE purchase_order_items
ALTER COLUMN item_type SET NOT NULL;

-- Step 5: Add CHECK constraint for mutual exclusivity
-- Ensures exactly one of material_id or sku_id is populated
ALTER TABLE purchase_order_items
DROP CONSTRAINT IF EXISTS check_material_sku_exclusive;

ALTER TABLE purchase_order_items
ADD CONSTRAINT check_material_sku_exclusive
    CHECK (
        (material_id IS NOT NULL AND sku_id IS NULL) OR
        (material_id IS NULL AND sku_id IS NOT NULL)
    );

-- Step 6: Create index for material_id lookups (partial index for efficiency)
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_material_id
ON purchase_order_items(material_id)
WHERE material_id IS NOT NULL;

-- Step 7: Create index for item_type filtering
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_item_type
ON purchase_order_items(item_type);

-- Step 8: Add comments for documentation
COMMENT ON COLUMN purchase_order_items.item_type IS 'Item type: MATERIAL (raw material/packaging) or SKU (finished product)';
COMMENT ON COLUMN purchase_order_items.material_id IS 'Reference to materials table for raw material/packaging procurement';
COMMENT ON COLUMN purchase_order_items.material_name IS 'Material name redundancy for soft-delete scenarios';

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

-- Verify CHECK constraint works
-- This should succeed (existing SKU records)
DO $$
DECLARE
    constraint_works BOOLEAN;
BEGIN
    -- Try to check if constraint exists and is active
    SELECT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'check_material_sku_exclusive'
          AND conrelid = 'purchase_order_items'::regclass
    ) INTO constraint_works;

    IF constraint_works THEN
        RAISE NOTICE 'CHECK constraint check_material_sku_exclusive is active';
    ELSE
        RAISE EXCEPTION 'CHECK constraint check_material_sku_exclusive was not created';
    END IF;
END $$;

-- ============================================================
-- Summary
-- ============================================================
-- Added columns:
--   - material_id (UUID, FK to materials, nullable)
--   - item_type (VARCHAR(20), NOT NULL: 'MATERIAL' or 'SKU')
--   - material_name (VARCHAR(200), nullable)
-- Modified columns:
--   - sku_id (now nullable)
-- Added constraints:
--   - check_material_sku_exclusive (mutual exclusivity of material_id/sku_id)
-- Added indexes:
--   - idx_purchase_order_items_material_id (partial index)
--   - idx_purchase_order_items_item_type
-- ============================================================
