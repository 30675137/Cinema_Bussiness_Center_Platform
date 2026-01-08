-- =====================================================
-- Migration: V016_001__extend_store_reservation_settings.sql
-- Feature: 016-store-reservation-settings
-- Description: 扩展门店预约设置表，添加时间段、提前量、时长单位、押金等字段
-- Date: 2025-12-22
-- =====================================================

-- 添加新字段到现有的 store_reservation_settings 表
-- 使用 IF NOT EXISTS 避免重复添加

-- 时间段配置 (JSONB)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'store_reservation_settings' AND column_name = 'time_slots'
    ) THEN
        ALTER TABLE store_reservation_settings 
        ADD COLUMN time_slots JSONB NOT NULL DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- 最小提前小时数
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'store_reservation_settings' AND column_name = 'min_advance_hours'
    ) THEN
        ALTER TABLE store_reservation_settings 
        ADD COLUMN min_advance_hours INTEGER NOT NULL DEFAULT 1 CHECK (min_advance_hours > 0);
    END IF;
END $$;

-- 预约时长单位（小时）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'store_reservation_settings' AND column_name = 'duration_unit'
    ) THEN
        ALTER TABLE store_reservation_settings 
        ADD COLUMN duration_unit INTEGER NOT NULL DEFAULT 1 CHECK (duration_unit IN (1, 2, 4));
    END IF;
END $$;

-- 是否需要押金
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'store_reservation_settings' AND column_name = 'deposit_required'
    ) THEN
        ALTER TABLE store_reservation_settings 
        ADD COLUMN deposit_required BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
END $$;

-- 押金金额
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'store_reservation_settings' AND column_name = 'deposit_amount'
    ) THEN
        ALTER TABLE store_reservation_settings 
        ADD COLUMN deposit_amount DECIMAL(10, 2) CHECK (deposit_amount IS NULL OR deposit_amount >= 0);
    END IF;
END $$;

-- 押金比例
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'store_reservation_settings' AND column_name = 'deposit_percentage'
    ) THEN
        ALTER TABLE store_reservation_settings 
        ADD COLUMN deposit_percentage INTEGER CHECK (deposit_percentage IS NULL OR (deposit_percentage >= 0 AND deposit_percentage <= 100));
    END IF;
END $$;

-- 配置是否生效
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'store_reservation_settings' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE store_reservation_settings 
        ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
    END IF;
END $$;

-- 创建时间段索引
CREATE INDEX IF NOT EXISTS idx_store_reservation_settings_time_slots 
    ON store_reservation_settings USING GIN (time_slots);

-- 创建is_active索引
CREATE INDEX IF NOT EXISTS idx_store_reservation_settings_is_active 
    ON store_reservation_settings(is_active);

-- 为现有记录设置默认时间段
UPDATE store_reservation_settings 
SET time_slots = '[
    {"dayOfWeek": 1, "startTime": "09:00", "endTime": "21:00"},
    {"dayOfWeek": 2, "startTime": "09:00", "endTime": "21:00"},
    {"dayOfWeek": 3, "startTime": "09:00", "endTime": "21:00"},
    {"dayOfWeek": 4, "startTime": "09:00", "endTime": "21:00"},
    {"dayOfWeek": 5, "startTime": "09:00", "endTime": "21:00"},
    {"dayOfWeek": 6, "startTime": "09:00", "endTime": "21:00"},
    {"dayOfWeek": 7, "startTime": "09:00", "endTime": "21:00"}
]'::jsonb
WHERE time_slots = '[]'::jsonb;

-- 添加表注释
COMMENT ON COLUMN store_reservation_settings.time_slots IS '可预约时间段列表，JSONB格式，每个元素包含dayOfWeek(1-7)、startTime、endTime';
COMMENT ON COLUMN store_reservation_settings.min_advance_hours IS '最小提前小时数，如2表示至少提前2小时预约';
COMMENT ON COLUMN store_reservation_settings.duration_unit IS '预约单位时长（小时），仅允许1、2、4';
COMMENT ON COLUMN store_reservation_settings.deposit_required IS '是否需要押金';
COMMENT ON COLUMN store_reservation_settings.deposit_amount IS '押金金额（元）';
COMMENT ON COLUMN store_reservation_settings.deposit_percentage IS '押金比例（百分比，0-100）';
COMMENT ON COLUMN store_reservation_settings.is_active IS '配置是否生效，门店停用时设为false';
