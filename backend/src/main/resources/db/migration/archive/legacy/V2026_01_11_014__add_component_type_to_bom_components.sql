-- N004: Add component_type column to bom_components table
-- Supports both MATERIAL and SKU component types

ALTER TABLE bom_components
ADD COLUMN IF NOT EXISTS component_type VARCHAR(20) DEFAULT 'SKU';

COMMENT ON COLUMN bom_components.component_type IS '组件类型: MATERIAL(物料) 或 SKU';
