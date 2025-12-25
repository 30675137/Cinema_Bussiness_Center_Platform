-- Migration: Create Package Tiers, Add-ons, and Time Slot Tables
-- Feature: 001-scenario-package-tabs
-- Date: 2025-12-23
-- Description: Creates tables for package tiers, add-on items, time slot templates

-- =============================================
-- 1. 套餐档位表 (Package Tiers)
-- =============================================
CREATE TABLE IF NOT EXISTS package_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),  -- 单位：元
    original_price DECIMAL(10,2),  -- 原价，单位：元
    tags JSONB,  -- 标签数组，如 ["人气推荐", "VIP专享"]
    service_description TEXT,  -- 服务内容描述
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tier_package ON package_tiers(package_id, sort_order);

-- =============================================
-- 2. 加购项表 (Add-on Items)
-- =============================================
CREATE TABLE IF NOT EXISTS addon_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),  -- 单位：元
    category VARCHAR(50) NOT NULL CHECK (category IN ('CATERING', 'BEVERAGE', 'DECORATION', 'SERVICE', 'OTHER')),
    image_url TEXT,
    inventory INTEGER,  -- 库存，NULL表示不限
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addon_category ON addon_items(category);
CREATE INDEX IF NOT EXISTS idx_addon_active ON addon_items(is_active) WHERE is_active = true;

-- =============================================
-- 3. 场景包-加购项关联表 (Package-AddOn Associations)
-- =============================================
CREATE TABLE IF NOT EXISTS package_addons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE CASCADE,
    addon_item_id UUID NOT NULL REFERENCES addon_items(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_required BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(package_id, addon_item_id)
);

CREATE INDEX IF NOT EXISTS idx_pkg_addon_package ON package_addons(package_id, sort_order);

-- =============================================
-- 4. 时段模板表 (Time Slot Templates)
-- =============================================
CREATE TABLE IF NOT EXISTS time_slot_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),  -- 0=周日, 1=周一, ..., 6=周六
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    capacity INTEGER,  -- 预约容量
    price_adjustment JSONB,  -- 价格调整 {"type": "PERCENTAGE"|"FIXED", "value": number}
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_tst_package ON time_slot_templates(package_id);
CREATE INDEX IF NOT EXISTS idx_tst_enabled ON time_slot_templates(package_id, is_enabled) WHERE is_enabled = true;

-- =============================================
-- 5. 时段覆盖表 (Time Slot Overrides)
-- =============================================
CREATE TABLE IF NOT EXISTS time_slot_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE CASCADE,
    override_date DATE NOT NULL,
    override_type VARCHAR(20) NOT NULL CHECK (override_type IN ('CANCEL', 'MODIFY', 'ADD')),
    start_time TIME,
    end_time TIME,
    capacity INTEGER,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tso_package_date ON time_slot_overrides(package_id, override_date);

-- =============================================
-- Triggers: 自动更新 updated_at
-- =============================================
DROP TRIGGER IF EXISTS update_package_tiers_updated_at ON package_tiers;
CREATE TRIGGER update_package_tiers_updated_at
    BEFORE UPDATE ON package_tiers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_addon_items_updated_at ON addon_items;
CREATE TRIGGER update_addon_items_updated_at
    BEFORE UPDATE ON addon_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_time_slot_templates_updated_at ON time_slot_templates;
CREATE TRIGGER update_time_slot_templates_updated_at
    BEFORE UPDATE ON time_slot_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_time_slot_overrides_updated_at ON time_slot_overrides;
CREATE TRIGGER update_time_slot_overrides_updated_at
    BEFORE UPDATE ON time_slot_overrides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
