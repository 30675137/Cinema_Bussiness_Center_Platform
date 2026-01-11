/**
 * @spec M001-material-unit-system
 * Create materials table for material master data management
 *
 * User Story: US2 - 物料主数据管理
 *
 * This migration creates the materials table to manage raw materials and packaging
 * independently from the SPU/SKU system.
 */

-- Create material_category ENUM type (if not exists)
DO $$ BEGIN
    CREATE TYPE material_category AS ENUM ('RAW_MATERIAL', 'PACKAGING');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create materials table
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    category material_category NOT NULL,

    -- Unit references (foreign keys to units table)
    inventory_unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
    purchase_unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,

    -- Material-level conversion
    conversion_rate DECIMAL(10, 6) CHECK (conversion_rate > 0),
    use_global_conversion BOOLEAN NOT NULL DEFAULT true,

    -- Metadata
    specification TEXT,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),

    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),

    -- Business constraints
    CONSTRAINT materials_conversion_rate_required_when_not_using_global
        CHECK (use_global_conversion = true OR conversion_rate IS NOT NULL)
);

-- Create indexes (if not exists)
CREATE INDEX IF NOT EXISTS idx_materials_code ON materials(code);
CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category);
CREATE INDEX IF NOT EXISTS idx_materials_status ON materials(status);
CREATE INDEX IF NOT EXISTS idx_materials_inventory_unit_id ON materials(inventory_unit_id);
CREATE INDEX IF NOT EXISTS idx_materials_purchase_unit_id ON materials(purchase_unit_id);

-- Add comments
COMMENT ON TABLE materials IS '物料主数据表 - Material master data for raw materials and packaging';
COMMENT ON COLUMN materials.code IS '物料编码（格式：MAT-{RAW|PKG}-{001-999}）';
COMMENT ON COLUMN materials.name IS '物料名称';
COMMENT ON COLUMN materials.category IS '物料类别（RAW_MATERIAL=原料, PACKAGING=包材）';
COMMENT ON COLUMN materials.inventory_unit_id IS '库存单位（外键到 units 表）';
COMMENT ON COLUMN materials.purchase_unit_id IS '采购单位（外键到 units 表）';
COMMENT ON COLUMN materials.conversion_rate IS '换算率（1 采购单位 = conversion_rate 库存单位）';
COMMENT ON COLUMN materials.use_global_conversion IS '是否使用全局换算规则（false 时使用物料级换算率）';
COMMENT ON COLUMN materials.specification IS '规格说明（如：750ml/瓶，500g/袋）';
COMMENT ON COLUMN materials.description IS '物料描述';
COMMENT ON COLUMN materials.status IS '状态（ACTIVE=启用, INACTIVE=停用）';

-- Add updated_at trigger (drop if exists first for idempotency)
DROP TRIGGER IF EXISTS update_materials_updated_at ON materials;
CREATE TRIGGER update_materials_updated_at
    BEFORE UPDATE ON materials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add sequence for material code generation (helper)
CREATE SEQUENCE IF NOT EXISTS material_code_seq START WITH 1;

COMMENT ON SEQUENCE material_code_seq IS '物料编码序号生成器（用于生成 MAT-RAW-001, MAT-PKG-001 等）';
