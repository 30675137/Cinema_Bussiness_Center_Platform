-- Migration: Create Scenario Package Management Tables
-- Feature: 017-scenario-package
-- Date: 2025-12-19
-- Description: Creates all tables for scenario package management with versioning, optimistic locking, and snapshot pattern

-- 1. 场景包主表 (Scenario Package Main Table)
CREATE TABLE IF NOT EXISTS scenario_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_package_id UUID REFERENCES scenario_packages(id) ON DELETE RESTRICT,
    version INTEGER NOT NULL DEFAULT 1,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    background_image_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'UNPUBLISHED')),
    is_latest BOOLEAN NOT NULL DEFAULT true,
    version_lock INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by VARCHAR(100)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pkg_base_version ON scenario_packages(base_package_id, version) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pkg_latest ON scenario_packages(base_package_id, is_latest) WHERE is_latest = true AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pkg_status ON scenario_packages(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pkg_created_at ON scenario_packages(created_at DESC);

-- 2. 场景包规则 (Package Rules)
CREATE TABLE IF NOT EXISTS package_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL UNIQUE REFERENCES scenario_packages(id) ON DELETE CASCADE,
    duration_hours DECIMAL(5,2) NOT NULL CHECK (duration_hours > 0),
    min_people INTEGER CHECK (min_people IS NULL OR min_people >= 0),
    max_people INTEGER CHECK (max_people IS NULL OR (min_people IS NULL OR max_people >= min_people)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_rule_package ON package_rules(package_id);

-- 3. 场景包-影厅关联 (Package-Hall Associations)
CREATE TABLE IF NOT EXISTS package_hall_associations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE CASCADE,
    hall_type_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(package_id, hall_type_id)
);

CREATE INDEX IF NOT EXISTS idx_pkg_hall_package ON package_hall_associations(package_id);
CREATE INDEX IF NOT EXISTS idx_pkg_hall_hall ON package_hall_associations(hall_type_id);

-- 4. 场景包硬权益 (Package Benefits - Hard Benefits)
CREATE TABLE IF NOT EXISTS package_benefits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE CASCADE,
    benefit_type VARCHAR(50) NOT NULL CHECK (benefit_type IN ('DISCOUNT_TICKET', 'FREE_SCREENING')),
    discount_rate DECIMAL(5,2) CHECK (discount_rate IS NULL OR (discount_rate > 0 AND discount_rate <= 1)),
    free_count INTEGER CHECK (free_count IS NULL OR free_count >= 0),
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_benefit_package ON package_benefits(package_id, sort_order);

-- 5. 场景包软权益（单品）(Package Items - Soft Benefits with Snapshot)
CREATE TABLE IF NOT EXISTS package_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE CASCADE,
    item_id UUID NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    item_name_snapshot VARCHAR(255) NOT NULL,
    item_price_snapshot DECIMAL(10,2) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_item_package ON package_items(package_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_item_item_id ON package_items(item_id);

-- 6. 场景包服务项目 (Package Services with Snapshot)
CREATE TABLE IF NOT EXISTS package_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE CASCADE,
    service_id UUID NOT NULL,
    service_name_snapshot VARCHAR(255) NOT NULL,
    service_price_snapshot DECIMAL(10,2) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_package ON package_services(package_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_service_service_id ON package_services(service_id);

-- 7. 场景包定价 (Package Pricing)
CREATE TABLE IF NOT EXISTS package_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL UNIQUE REFERENCES scenario_packages(id) ON DELETE CASCADE,
    package_price DECIMAL(10,2) NOT NULL CHECK (package_price > 0),
    reference_price_snapshot DECIMAL(10,2),
    discount_percentage DECIMAL(5,2),
    discount_amount DECIMAL(10,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pricing_package ON package_pricing(package_id);

-- Triggers: 自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_scenario_packages_updated_at ON scenario_packages;
CREATE TRIGGER update_scenario_packages_updated_at
    BEFORE UPDATE ON scenario_packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_package_pricing_updated_at ON package_pricing;
CREATE TRIGGER update_package_pricing_updated_at
    BEFORE UPDATE ON package_pricing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
