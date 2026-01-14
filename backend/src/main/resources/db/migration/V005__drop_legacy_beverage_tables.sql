-- @spec O013-order-channel-migration
-- Migration: Drop Legacy Beverage Tables
-- Date: 2026-01-14
-- Description: Remove legacy tables after migration verification
-- WARNING: This migration is DESTRUCTIVE. Execute only after verifying migration success.

-- ============================================================
-- Pre-flight check: Verify no active references
-- ============================================================

-- This check will raise an error if there are any orders still referencing beverages table
-- DO $$
-- BEGIN
--     IF EXISTS (
--         SELECT 1 FROM beverage_order_items 
--         WHERE channel_product_id IS NULL 
--         AND beverage_id IS NOT NULL
--         LIMIT 1
--     ) THEN
--         RAISE EXCEPTION 'Cannot drop legacy tables: Some order items still reference old beverage_id without channel_product_id';
--     END IF;
-- END $$;

-- ============================================================
-- Step 1: Drop recipe_ingredients (depends on beverage_recipes)
-- ============================================================

DROP TABLE IF EXISTS recipe_ingredients CASCADE;

-- ============================================================
-- Step 2: Drop beverage_recipes (depends on beverages)
-- ============================================================

DROP TABLE IF EXISTS beverage_recipes CASCADE;

-- ============================================================
-- Step 3: Drop beverage_specs (depends on beverages)
-- ============================================================

DROP TABLE IF EXISTS beverage_specs CASCADE;

-- ============================================================
-- Step 4: Drop beverage_sku_mapping (migration mapping table)
-- ============================================================

DROP TABLE IF EXISTS beverage_sku_mapping CASCADE;

-- ============================================================
-- Step 5: Drop beverages table (SPU legacy table)
-- ============================================================

-- First, drop the deprecated beverage_id column from order items
-- (Optional - can keep for historical reference)
-- ALTER TABLE beverage_order_items DROP COLUMN IF EXISTS beverage_id;

DROP TABLE IF EXISTS beverages CASCADE;

-- ============================================================
-- Step 6: Update constraints on beverage_order_items
-- ============================================================

-- Make channel_product_id and sku_id NOT NULL for new orders
-- Note: This is safe only after all existing orders have been migrated
-- ALTER TABLE beverage_order_items
-- ALTER COLUMN channel_product_id SET NOT NULL,
-- ALTER COLUMN sku_id SET NOT NULL;

-- ============================================================
-- Summary
-- ============================================================

-- Dropped tables:
-- - recipe_ingredients (beverage recipe ingredients, replaced by bom_components)
-- - beverage_recipes (beverage recipes, replaced by BOM)
-- - beverage_specs (beverage specifications, replaced by channel_product_config.specs JSONB)
-- - beverage_sku_mapping (migration mapping, no longer needed)
-- - beverages (legacy SPU table, replaced by skus + channel_product_config)
--
-- Total: 5 tables removed
