-- @spec O005-channel-product-config
-- E2E Test Data Cleanup Script
-- 仅用于开发环境！禁止在生产环境执行！

-- ============================================================================
-- 清理 E2E 测试数据
-- ============================================================================

BEGIN;

-- 1. 软删除所有 E2E 测试商品（设置 deleted_at）
UPDATE channel_product_config
SET deleted_at = NOW()
WHERE description LIKE '%E2E测试%'
   OR description LIKE '%test%'
   OR display_name LIKE '%E2E测试%'
   OR sort_order = 999
   AND deleted_at IS NULL;

-- 2. 硬删除所有已软删除的 E2E 测试数据
DELETE FROM channel_product_config
WHERE (
    description LIKE '%E2E测试%'
    OR description LIKE '%test%'
    OR display_name LIKE '%E2E测试%'
    OR sort_order = 999
    OR sku_id IN (
        SELECT id FROM skus WHERE code LIKE '%test-sku-e2e-%'
    )
)
AND deleted_at IS NOT NULL;

-- 3. 清理孤立的测试 SKU（如果需要）
-- DELETE FROM skus
-- WHERE code LIKE '%test-sku-e2e-%';

-- 4. 验证清理结果
SELECT
    COUNT(*) as remaining_test_records,
    COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) as active_test_records,
    COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as soft_deleted_test_records
FROM channel_product_config
WHERE description LIKE '%E2E测试%'
   OR description LIKE '%test%'
   OR display_name LIKE '%E2E测试%';

-- 预期结果：remaining_test_records = 0

COMMIT;

-- ============================================================================
-- 使用说明
-- ============================================================================
--
-- 执行方式 1：直接在数据库中执行
-- psql -h localhost -U postgres -d cinema_db -f cleanup-e2e-data.sql
--
-- 执行方式 2：通过 Supabase SQL Editor
-- 1. 登录 Supabase Dashboard
-- 2. 打开 SQL Editor
-- 3. 粘贴此脚本并执行
--
-- 执行方式 3：在 E2E 测试后自动调用
-- 在测试框架中配置 afterAll() 钩子执行此脚本
--
-- ⚠️ 警告：此脚本会永久删除数据，仅在开发环境使用！
-- ============================================================================
