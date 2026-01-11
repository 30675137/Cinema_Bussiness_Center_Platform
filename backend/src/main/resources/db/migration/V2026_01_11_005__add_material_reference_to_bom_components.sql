/**
 * @spec M001-material-unit-system
 * Add material_id field to bom_components table for dual reference support
 *
 * User Story: US2 - 物料主数据管理
 * Requirement: FR-014.1 - BOM 组件表支持双引用字段（sku_id 和 material_id 互斥）
 *
 * This migration extends the bom_components table to support referencing either:
 * - component_id (SKU) for finished products
 * - material_id (Material) for raw materials and packaging
 */

-- Add material_id column (nullable, foreign key to materials table)
ALTER TABLE bom_components
ADD COLUMN IF NOT EXISTS material_id UUID REFERENCES materials(id) ON DELETE RESTRICT;

-- Add component_type column to distinguish between SKU and Material references
ALTER TABLE bom_components
ADD COLUMN IF NOT EXISTS component_type VARCHAR(20) NOT NULL DEFAULT 'SKU' CHECK (component_type IN ('SKU', 'MATERIAL'));

-- Add constraint: component_id and material_id are mutually exclusive (drop if exists first)
ALTER TABLE bom_components DROP CONSTRAINT IF EXISTS bom_component_reference_exclusive;
ALTER TABLE bom_components
ADD CONSTRAINT bom_component_reference_exclusive
    CHECK (
        (component_id IS NOT NULL AND material_id IS NULL AND component_type = 'SKU') OR
        (component_id IS NULL AND material_id IS NOT NULL AND component_type = 'MATERIAL')
    );

-- Create index for material_id (if not exists)
CREATE INDEX IF NOT EXISTS idx_bom_material_id ON bom_components(material_id);

-- Create index for component_type (if not exists)
CREATE INDEX IF NOT EXISTS idx_bom_component_type ON bom_components(component_type);

-- Update table comment
COMMENT ON TABLE bom_components IS 'BOM 组件表，记录成品 SKU 的物料清单（支持引用 SKU 或 Material）';

-- Add column comments
COMMENT ON COLUMN bom_components.material_id IS '物料 ID（外键到 materials 表），与 component_id 互斥';
COMMENT ON COLUMN bom_components.component_type IS '组件类型（SKU=引用 SKU, MATERIAL=引用 Material）';

-- Update existing constraint comment
COMMENT ON CONSTRAINT bom_component_reference_exclusive ON bom_components IS 'component_id 和 material_id 必须互斥（只能有一个非空）';

-- Drop old unique constraint and create new one including material_id
ALTER TABLE bom_components DROP CONSTRAINT IF EXISTS uk_bom_component;

-- New unique constraint: prevent duplicate (finished_product_id, component_id) or (finished_product_id, material_id)
DROP INDEX IF EXISTS uk_bom_component_sku;
CREATE UNIQUE INDEX uk_bom_component_sku ON bom_components(finished_product_id, component_id)
    WHERE component_id IS NOT NULL;

DROP INDEX IF EXISTS uk_bom_component_material;
CREATE UNIQUE INDEX uk_bom_component_material ON bom_components(finished_product_id, material_id)
    WHERE material_id IS NOT NULL;

-- Modify component_id to be nullable (since material_id is an alternative)
ALTER TABLE bom_components ALTER COLUMN component_id DROP NOT NULL;
