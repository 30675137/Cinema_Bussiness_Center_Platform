-- ============================================================
-- Migration: V023_001__store_add_cinema_fields.sql
-- Description: 添加影城相关字段（开业时间、面积、影厅数、座位数）
-- Author: System
-- Date: 2025-12-23
-- ============================================================

-- 添加开业时间字段
ALTER TABLE stores ADD COLUMN IF NOT EXISTS opening_date DATE;
COMMENT ON COLUMN stores.opening_date IS '开业时间';

-- 添加面积字段（单位：平方米）
ALTER TABLE stores ADD COLUMN IF NOT EXISTS area INTEGER;
COMMENT ON COLUMN stores.area IS '门店面积（平方米）';

-- 添加影厅数字段
ALTER TABLE stores ADD COLUMN IF NOT EXISTS hall_count INTEGER;
COMMENT ON COLUMN stores.hall_count IS '影厅数量';

-- 添加座位数字段
ALTER TABLE stores ADD COLUMN IF NOT EXISTS seat_count INTEGER;
COMMENT ON COLUMN stores.seat_count IS '总座位数';

-- 添加约束：面积、影厅数、座位数必须为正数
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_stores_area_positive') THEN
        ALTER TABLE stores ADD CONSTRAINT ck_stores_area_positive CHECK (area IS NULL OR area > 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_stores_hall_count_positive') THEN
        ALTER TABLE stores ADD CONSTRAINT ck_stores_hall_count_positive CHECK (hall_count IS NULL OR hall_count > 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_stores_seat_count_positive') THEN
        ALTER TABLE stores ADD CONSTRAINT ck_stores_seat_count_positive CHECK (seat_count IS NULL OR seat_count > 0);
    END IF;
END $$;
