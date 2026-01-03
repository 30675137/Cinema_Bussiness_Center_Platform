-- @spec O002-miniapp-menu-config
-- 数据迁移脚本：从 ChannelCategory 枚举迁移到 menu_category 表
--
-- 任务：
-- T055: 创建数据迁移脚本
-- T056: 插入初始分类数据
-- T057: 设置 OTHER 为默认分类
-- T058: 更新 category_id 基于 channel_category 枚举值
-- T059: 处理 null/无效分类的商品
-- T060: 添加验证查询

-- ============================================
-- T056: 插入初始分类数据
-- ============================================
-- 基于 O007 的核心分类 + 扩展分类

INSERT INTO menu_category (code, display_name, sort_order, is_visible, is_default, created_at, updated_at)
VALUES
    -- O007 核心分类
    ('ALCOHOL',  '经典特调', 1, true, false, NOW(), NOW()),
    ('COFFEE',   '精品咖啡', 2, true, false, NOW(), NOW()),
    ('BEVERAGE', '经典饮品', 3, true, false, NOW(), NOW()),
    ('SNACK',    '主厨小食', 4, true, false, NOW(), NOW()),
    -- 扩展分类
    ('MEAL',     '精品餐食', 5, true, false, NOW(), NOW()),
    -- T057: 默认分类（is_default = true）
    ('OTHER',    '其他商品', 99, true, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ============================================
-- T058: 更新 channel_product_config.category_id
-- 基于现有的 channel_category 枚举值
-- ============================================

-- ALCOHOL -> 经典特调
UPDATE channel_product_config cp
SET category_id = mc.id
FROM menu_category mc
WHERE cp.channel_category = 'ALCOHOL'
  AND mc.code = 'ALCOHOL'
  AND cp.category_id IS NULL
  AND mc.deleted_at IS NULL;

-- COFFEE -> 精品咖啡
UPDATE channel_product_config cp
SET category_id = mc.id
FROM menu_category mc
WHERE cp.channel_category = 'COFFEE'
  AND mc.code = 'COFFEE'
  AND cp.category_id IS NULL
  AND mc.deleted_at IS NULL;

-- BEVERAGE -> 经典饮品
UPDATE channel_product_config cp
SET category_id = mc.id
FROM menu_category mc
WHERE cp.channel_category = 'BEVERAGE'
  AND mc.code = 'BEVERAGE'
  AND cp.category_id IS NULL
  AND mc.deleted_at IS NULL;

-- SNACK -> 主厨小食
UPDATE channel_product_config cp
SET category_id = mc.id
FROM menu_category mc
WHERE cp.channel_category = 'SNACK'
  AND mc.code = 'SNACK'
  AND cp.category_id IS NULL
  AND mc.deleted_at IS NULL;

-- MEAL -> 精品餐食
UPDATE channel_product_config cp
SET category_id = mc.id
FROM menu_category mc
WHERE cp.channel_category = 'MEAL'
  AND mc.code = 'MEAL'
  AND cp.category_id IS NULL
  AND mc.deleted_at IS NULL;

-- OTHER -> 其他商品
UPDATE channel_product_config cp
SET category_id = mc.id
FROM menu_category mc
WHERE cp.channel_category = 'OTHER'
  AND mc.code = 'OTHER'
  AND cp.category_id IS NULL
  AND mc.deleted_at IS NULL;

-- ============================================
-- T059: 处理 null/无效分类的商品
-- 将未匹配的商品迁移到默认分类
-- ============================================

UPDATE channel_product_config
SET category_id = (
    SELECT id FROM menu_category
    WHERE is_default = true
      AND deleted_at IS NULL
    LIMIT 1
)
WHERE category_id IS NULL
  AND deleted_at IS NULL;

-- ============================================
-- 添加外键约束
-- ============================================

-- 先检查是否已存在外键约束
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_channel_product_category'
          AND table_name = 'channel_product_config'
    ) THEN
        ALTER TABLE channel_product_config
        ADD CONSTRAINT fk_channel_product_category
        FOREIGN KEY (category_id) REFERENCES menu_category(id)
        ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================
-- T060: 验证迁移完整性
-- ============================================

-- 验证 1: 检查是否所有商品都有 category_id
DO $$
DECLARE
    null_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO null_count
    FROM channel_product_config
    WHERE category_id IS NULL
      AND deleted_at IS NULL;

    IF null_count > 0 THEN
        RAISE WARNING 'Migration Warning: % products still have NULL category_id', null_count;
    ELSE
        RAISE NOTICE 'Migration Success: All products have valid category_id';
    END IF;
END $$;

-- 验证 2: 检查分类分布
DO $$
DECLARE
    rec RECORD;
BEGIN
    RAISE NOTICE '=== Category Migration Summary ===';
    FOR rec IN
        SELECT
            mc.code AS category_code,
            mc.display_name,
            COUNT(cp.id) AS product_count
        FROM menu_category mc
        LEFT JOIN channel_product_config cp ON cp.category_id = mc.id AND cp.deleted_at IS NULL
        WHERE mc.deleted_at IS NULL
        GROUP BY mc.code, mc.display_name, mc.sort_order
        ORDER BY mc.sort_order
    LOOP
        RAISE NOTICE 'Category: % (%) - Products: %',
            rec.category_code, rec.display_name, rec.product_count;
    END LOOP;
END $$;

-- 验证 3: 检查默认分类是否存在
DO $$
DECLARE
    default_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO default_count
    FROM menu_category
    WHERE is_default = true
      AND deleted_at IS NULL;

    IF default_count = 1 THEN
        RAISE NOTICE 'Default category check: PASS (exactly 1 default category exists)';
    ELSIF default_count = 0 THEN
        RAISE EXCEPTION 'Default category check: FAIL (no default category found)';
    ELSE
        RAISE EXCEPTION 'Default category check: FAIL (% default categories found, expected 1)', default_count;
    END IF;
END $$;

-- ============================================
-- 完成
-- ============================================
-- 注意：channel_category 枚举字段暂时保留用于向后兼容
-- 可在确认无问题后通过后续迁移删除
