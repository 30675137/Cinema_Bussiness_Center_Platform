-- @spec O002-miniapp-menu-config
-- 补丁迁移：为 menu_category 表添加缺失的 version 字段
--
-- 问题背景：
-- - MenuCategory 实体类定义了 @Version 字段（乐观锁）
-- - 但数据库表中缺少此字段，导致查询报错
-- - 原因：表可能在 V2026_01_03_001 迁移前手动创建
--
-- 解决方案：
-- - 添加 version 字段（如果不存在）
-- - 为现有记录设置默认值 0

-- 添加 version 字段（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'menu_category'
        AND column_name = 'version'
    ) THEN
        ALTER TABLE menu_category
        ADD COLUMN version BIGINT NOT NULL DEFAULT 0;

        -- 添加列注释
        COMMENT ON COLUMN menu_category.version IS '乐观锁版本号，用于并发控制（JPA @Version）';

        RAISE NOTICE 'Added version column to menu_category table';
    ELSE
        RAISE NOTICE 'Version column already exists in menu_category table';
    END IF;
END $$;
