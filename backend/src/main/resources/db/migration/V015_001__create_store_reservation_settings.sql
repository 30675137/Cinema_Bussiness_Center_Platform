-- ============================================================
-- Migration: V015_001__create_store_reservation_settings.sql
-- Feature: 015-store-reservation-settings
-- Description: 创建门店预约设置基础表
-- Date: 2025-12-22
-- ============================================================

-- 创建门店预约设置表
CREATE TABLE IF NOT EXISTS store_reservation_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL UNIQUE REFERENCES stores(id) ON DELETE CASCADE,
    is_reservation_enabled BOOLEAN NOT NULL DEFAULT false,
    max_reservation_days INTEGER NOT NULL DEFAULT 0 CHECK (max_reservation_days >= 0 AND max_reservation_days <= 365),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by VARCHAR(255)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_store_reservation_settings_store_id ON store_reservation_settings(store_id);
CREATE INDEX IF NOT EXISTS idx_store_reservation_settings_enabled ON store_reservation_settings(is_reservation_enabled);

-- 创建自动更新 updated_at 的触发器
CREATE OR REPLACE FUNCTION update_store_reservation_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_store_reservation_settings_updated_at ON store_reservation_settings;
CREATE TRIGGER trigger_update_store_reservation_settings_updated_at
    BEFORE UPDATE ON store_reservation_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_store_reservation_settings_updated_at();

-- 启用 RLS
ALTER TABLE store_reservation_settings ENABLE ROW LEVEL SECURITY;

-- RLS 策略
CREATE POLICY "Enable all access for store_reservation_settings"
    ON store_reservation_settings FOR ALL USING (true);

-- 注释
COMMENT ON TABLE store_reservation_settings IS '门店预约设置表，存储每个门店的预约配置';
COMMENT ON COLUMN store_reservation_settings.store_id IS '门店ID，与stores表一对一关系';
COMMENT ON COLUMN store_reservation_settings.is_reservation_enabled IS '是否开放预约';
COMMENT ON COLUMN store_reservation_settings.max_reservation_days IS '可预约天数（未来N天），范围0-365';
COMMENT ON COLUMN store_reservation_settings.updated_by IS '最后更新人';
