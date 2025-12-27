-- SKU主数据表迁移脚本
-- 功能: P001-sku-master-data
-- 描述: 创建完整的 skus 表结构，支持四种 SKU 类型（原料、包材、成品、套餐）
-- 作者: Claude Code
-- 日期: 2025-12-24

-- 创建 SKU 类型枚举（如果不存在）
DO $$ BEGIN
    CREATE TYPE sku_type_enum AS ENUM ('raw_material', 'packaging', 'finished_product', 'combo');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 创建 SKU 状态枚举（如果不存在）
DO $$ BEGIN
    CREATE TYPE sku_status_enum AS ENUM ('draft', 'enabled', 'disabled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 创建 skus 表
CREATE TABLE IF NOT EXISTS skus (
    -- 主键
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 基本信息
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    spu_id UUID NOT NULL,

    -- SKU 类型（原料、包材、成品、套餐）
    sku_type sku_type_enum NOT NULL,

    -- 单位配置
    main_unit VARCHAR(20) NOT NULL,

    -- 门店范围配置（空数组表示全门店可用）
    store_scope TEXT[] DEFAULT '{}',

    -- 成本配置
    standard_cost DECIMAL(10,2) CHECK (
        -- 原料和包材必须有标准成本
        (sku_type IN ('raw_material', 'packaging') AND standard_cost IS NOT NULL AND standard_cost >= 0)
        OR
        -- 成品和套餐的成本由系统计算，允许为 NULL 或 >= 0
        (sku_type IN ('finished_product', 'combo') AND (standard_cost IS NULL OR standard_cost >= 0))
    ),

    -- 损耗率（仅成品类型使用，百分比 0-100）
    waste_rate DECIMAL(5,2) DEFAULT 0 CHECK (
        waste_rate >= 0 AND waste_rate <= 100
    ),

    -- 状态
    status sku_status_enum NOT NULL DEFAULT 'draft',

    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 约束：成品必须有 BOM 配置后才能启用
    -- 约束：套餐必须有子项配置后才能启用
    -- 注意：这些约束将在应用层验证，不在数据库层强制执行

    -- 软删除标记（可选，暂不实现）
    -- deleted_at TIMESTAMP WITH TIME ZONE

    CONSTRAINT chk_sku_type CHECK (sku_type IN ('raw_material', 'packaging', 'finished_product', 'combo')),
    CONSTRAINT chk_status CHECK (status IN ('draft', 'enabled', 'disabled'))
);

-- 创建索引以优化查询性能

-- 唯一索引：SKU 编码
CREATE UNIQUE INDEX idx_skus_code ON skus(code);

-- 普通索引：SPU ID（用于按 SPU 查询 SKU）
CREATE INDEX idx_skus_spu_id ON skus(spu_id);

-- 普通索引：SKU 类型（用于按类型筛选）
CREATE INDEX idx_skus_type ON skus(sku_type);

-- 普通索引：状态（用于筛选启用/停用的 SKU）
CREATE INDEX idx_skus_status ON skus(status);

-- GIN 索引：门店范围（用于门店范围查询，如 'store-1' = ANY(store_scope)）
CREATE INDEX idx_skus_store_scope ON skus USING GIN(store_scope);

-- 组合索引：类型 + 状态（用于常见的筛选组合）
CREATE INDEX idx_skus_type_status ON skus(sku_type, status);

-- 创建触发器：自动更新 updated_at 时间戳
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_skus_updated_at
BEFORE UPDATE ON skus
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 添加表注释
COMMENT ON TABLE skus IS 'SKU主数据表，支持原料、包材、成品、套餐四种类型';
COMMENT ON COLUMN skus.id IS '主键 UUID';
COMMENT ON COLUMN skus.code IS 'SKU编码，系统自动生成，唯一';
COMMENT ON COLUMN skus.name IS 'SKU名称';
COMMENT ON COLUMN skus.spu_id IS 'SPU ID，外键引用 spus 表';
COMMENT ON COLUMN skus.sku_type IS 'SKU类型：raw_material(原料), packaging(包材), finished_product(成品), combo(套餐)';
COMMENT ON COLUMN skus.main_unit IS '主库存单位，如：个、瓶、ml、g';
COMMENT ON COLUMN skus.store_scope IS '门店范围，空数组表示全门店可用';
COMMENT ON COLUMN skus.standard_cost IS '标准成本（元），原料/包材手动设置，成品/套餐自动计算';
COMMENT ON COLUMN skus.waste_rate IS '损耗率（%），仅成品类型使用，范围 0-100';
COMMENT ON COLUMN skus.status IS '状态：draft(草稿), enabled(启用), disabled(停用)';
COMMENT ON COLUMN skus.created_at IS '创建时间';
COMMENT ON COLUMN skus.updated_at IS '更新时间';
