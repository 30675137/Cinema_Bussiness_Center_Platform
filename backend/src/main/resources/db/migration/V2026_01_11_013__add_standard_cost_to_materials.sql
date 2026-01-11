-- ============================================================================
-- Migration: V2026_01_11_013__add_standard_cost_to_materials.sql
-- Purpose: Add standard_cost column to materials table for BOM cost calculation
-- ============================================================================

-- Add standard_cost column to materials table
-- standard_cost is the cost per inventory unit (元/库存单位), used for BOM cost calculation
ALTER TABLE materials
ADD COLUMN IF NOT EXISTS standard_cost DECIMAL(12, 2) DEFAULT 0.00;

-- Add comment for the column
COMMENT ON COLUMN materials.standard_cost IS '标准成本（元/库存单位），用于 BOM 成本计算';
