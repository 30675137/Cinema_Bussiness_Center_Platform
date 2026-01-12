-- @spec O002-miniapp-menu-config
-- 回滚脚本：撤销分类数据迁移
--
-- 任务 T061: 创建回滚脚本
--
-- 警告：此脚本仅用于紧急回滚，执行前请确保已备份数据
-- 执行方式：手动执行，不会被 Flyway 自动执行

-- ============================================
-- Step 1: 移除外键约束
-- ============================================

ALTER TABLE channel_product_config
DROP CONSTRAINT IF EXISTS fk_channel_product_category;

-- ============================================
-- Step 2: 清空 category_id 列
-- ============================================

UPDATE channel_product_config
SET category_id = NULL;

-- ============================================
-- Step 3: 删除初始分类数据
-- ============================================

DELETE FROM menu_category
WHERE code IN ('ALCOHOL', 'COFFEE', 'BEVERAGE', 'SNACK', 'MEAL', 'OTHER');

-- ============================================
-- 验证回滚
-- ============================================

DO $$
DECLARE
    category_count INTEGER;
    product_with_category INTEGER;
BEGIN
    -- 检查分类表
    SELECT COUNT(*) INTO category_count
    FROM menu_category
    WHERE deleted_at IS NULL;

    -- 检查商品分类关联
    SELECT COUNT(*) INTO product_with_category
    FROM channel_product_config
    WHERE category_id IS NOT NULL;

    RAISE NOTICE '=== Rollback Summary ===';
    RAISE NOTICE 'Remaining categories: %', category_count;
    RAISE NOTICE 'Products with category_id: %', product_with_category;

    IF category_count = 0 AND product_with_category = 0 THEN
        RAISE NOTICE 'Rollback completed successfully';
    ELSE
        RAISE WARNING 'Rollback may be incomplete';
    END IF;
END $$;

-- ============================================
-- 注意事项
-- ============================================
-- 1. 此脚本不会删除 menu_category 表本身
--    如需完全回滚，需要单独执行：
--    DROP TABLE IF EXISTS category_audit_log;
--    DROP TABLE IF EXISTS menu_category;
--    ALTER TABLE channel_product_config DROP COLUMN IF EXISTS category_id;
--
-- 2. 回滚后 channel_category 枚举字段仍然可用
--    商品可继续通过枚举值进行分类查询
