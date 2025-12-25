-- Migration: V5__add_store_associations.sql
-- Feature: 019-store-association
-- Date: 2025-12-21
-- Description: 场景包-门店关联表，实现场景包与门店的多对多关系

-- 场景包-门店关联表
CREATE TABLE IF NOT EXISTS scenario_package_store_associations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100),

    -- 防止重复关联
    CONSTRAINT unique_package_store UNIQUE(package_id, store_id)
);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_pkg_store_package ON scenario_package_store_associations(package_id);
CREATE INDEX IF NOT EXISTS idx_pkg_store_store ON scenario_package_store_associations(store_id);

-- 启用 Row Level Security
ALTER TABLE scenario_package_store_associations ENABLE ROW LEVEL SECURITY;

-- RLS 策略（允许所有操作 - 可根据实际需求调整）
CREATE POLICY "Enable all access for scenario_package_store_associations"
    ON scenario_package_store_associations FOR ALL USING (true);

-- 注释
COMMENT ON TABLE scenario_package_store_associations IS '场景包-门店关联表，实现场景包与门店的多对多关系';
COMMENT ON COLUMN scenario_package_store_associations.package_id IS '场景包ID，关联 scenario_packages 表';
COMMENT ON COLUMN scenario_package_store_associations.store_id IS '门店ID，关联 stores 表';
COMMENT ON COLUMN scenario_package_store_associations.created_by IS '创建人（用户ID或用户名）';
