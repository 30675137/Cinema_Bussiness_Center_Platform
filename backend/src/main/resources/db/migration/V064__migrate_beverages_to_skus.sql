-- @spec O004-beverage-sku-reuse
-- Data Migration: beverages → skus table
-- Purpose: Migrate existing beverage data to unified SKU system
-- Tasks: T040 + T041
-- Date: 2025-12-31
--
-- 注意: 此功能不包含权限与认证逻辑(详见宪法"认证与权限要求分层"原则)

-- ============================================================
-- Idempotent Data Migration: beverages → skus
-- ============================================================
--
-- Migration Strategy:
-- 1. Migrate beverages table records to skus table as finished_product type
-- 2. Record mapping in beverage_sku_mapping table (old_beverage_id → new_sku_id)
-- 3. Use INSERT...ON CONFLICT DO NOTHING for idempotency (safe to re-run)
-- 4. Preserve original beverages table for rollback (marked as deprecated)
--
-- Success Criteria:
-- - Migration success rate ≥95%
-- - All migrated SKUs have sku_type = 'finished_product'
-- - beverage_sku_mapping table populated correctly
-- - Original beverages table preserved (not deleted)

-- ============================================================
-- Step 1: Migrate beverages → skus table
-- ============================================================

INSERT INTO skus (
    id,
    code,
    name,
    sku_type,
    category_id,
    main_unit,
    standard_cost,
    status,
    created_at,
    updated_at,
    spu_id,
    waste_rate,
    store_scope
)
SELECT
    -- Generate new UUID for SKU (not reusing beverage.id to avoid conflicts)
    gen_random_uuid() AS id,

    -- Generate SKU code: FIN-{NAME}-{SEQUENCE}
    -- Example: "威士忌可乐" → "FIN-WHISKEY-COLA-001"
    CONCAT(
        'FIN-',
        UPPER(
            REGEXP_REPLACE(
                REGEXP_REPLACE(name, '[^\u4e00-\u9fa5a-zA-Z0-9]+', '-', 'g'),  -- Replace special chars with '-'
                '-+', '-', 'g'  -- Replace multiple '-' with single '-'
            )
        ),
        '-',
        LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 3, '0')
    ) AS code,

    -- Basic info
    name AS name,
    'finished_product' AS sku_type,

    -- Category mapping (beverages.category → categories.id)
    -- Note: Assuming categories table has been populated with beverage categories
    -- If categories don't exist, they will be NULL (need manual fix)
    (
        SELECT id FROM categories
        WHERE name = CASE b.category
            WHEN 'COFFEE' THEN '咖啡'
            WHEN 'TEA' THEN '茶饮'
            WHEN 'JUICE' THEN '果汁'
            WHEN 'SMOOTHIE' THEN '奶昔'
            WHEN 'MILK_TEA' THEN '奶茶'
            WHEN 'OTHER' THEN '其他'
            ELSE '其他'
        END
        LIMIT 1
    ) AS category_id,

    '份' AS main_unit,  -- Default unit for beverages

    -- Cost (use base_price as cost)
    base_price AS standard_cost,

    -- Status mapping
    CASE b.status
        WHEN 'ACTIVE' THEN 'enabled'
        WHEN 'INACTIVE' THEN 'disabled'
        WHEN 'OUT_OF_STOCK' THEN 'disabled'
        ELSE 'enabled'
    END AS status,

    -- Audit fields (preserve original timestamps)
    created_at AS created_at,
    updated_at AS updated_at,

    -- Required fields for skus table
    gen_random_uuid() AS spu_id,  -- Generate temporary SPU ID
    0 AS waste_rate,  -- Default waste rate
    '{}' AS store_scope  -- Empty array = available to all stores

FROM beverages b
WHERE NOT EXISTS (
    -- Idempotency check: Skip if already migrated
    SELECT 1 FROM beverage_sku_mapping bsm WHERE bsm.old_beverage_id = b.id
)
ON CONFLICT (code) DO NOTHING;  -- Idempotency: Skip if SKU code already exists

-- ============================================================
-- Step 2: Populate beverage_sku_mapping table
-- ============================================================

INSERT INTO beverage_sku_mapping (
    old_beverage_id,
    new_sku_id,
    migrated_at,
    migration_script_version,
    status
)
SELECT
    b.id AS old_beverage_id,
    s.id AS new_sku_id,
    NOW() AS migrated_at,
    'V064' AS migration_script_version,
    'active' AS status
FROM beverages b
JOIN skus s ON (
    -- Match by name (since we just migrated based on name)
    s.name = b.name
    AND s.sku_type = 'finished_product'
    -- Match by approximate creation time (within 1 second)
    AND ABS(EXTRACT(EPOCH FROM (s.created_at - b.created_at))) < 1
)
WHERE NOT EXISTS (
    -- Idempotency check: Skip if mapping already exists
    SELECT 1 FROM beverage_sku_mapping bsm WHERE bsm.old_beverage_id = b.id
)
ON CONFLICT (old_beverage_id) DO NOTHING;  -- Idempotency: Skip if mapping exists

-- ============================================================
-- Step 3: Mark beverages table as deprecated
-- ============================================================

COMMENT ON TABLE beverages IS
    '⚠️  DEPRECATED (2025-12-31): Migrated to skus table (sku_type=finished_product).
    See beverage_sku_mapping for old_beverage_id → new_sku_id mapping.
    DO NOT DELETE - Kept for rollback and historical reference.';

-- ============================================================
-- Step 4: Verification Query (for manual check)
-- ============================================================
--
-- Run these queries after migration to verify success:
--
-- 1. Check migration success rate:
-- SELECT
--     COUNT(*) AS total_beverages,
--     (SELECT COUNT(*) FROM beverage_sku_mapping) AS migrated_count,
--     ROUND((SELECT COUNT(*) FROM beverage_sku_mapping)::numeric / COUNT(*)::numeric * 100, 2) AS success_rate_percent
-- FROM beverages;
--
-- Expected: success_rate_percent ≥ 95%
--
-- 2. Check for unmigrated beverages:
-- SELECT b.id, b.name, b.category, b.status
-- FROM beverages b
-- WHERE NOT EXISTS (SELECT 1 FROM beverage_sku_mapping bsm WHERE bsm.old_beverage_id = b.id);
--
-- Expected: Empty result or <5% of total beverages
--
-- 3. Verify all migrated SKUs are finished_product type:
-- SELECT sku_type, COUNT(*) AS count
-- FROM skus
-- WHERE id IN (SELECT new_sku_id FROM beverage_sku_mapping)
-- GROUP BY sku_type;
--
-- Expected: Only 'finished_product' type
--
-- 4. Check for NULL category_id (needs manual fix):
-- SELECT s.id, s.code, s.name, s.category_id
-- FROM skus s
-- JOIN beverage_sku_mapping bsm ON s.id = bsm.new_sku_id
-- WHERE s.category_id IS NULL;
--
-- Expected: Empty result (all categories mapped correctly)

-- ============================================================
-- Migration Complete
-- ============================================================
