/**
 * @spec M001-material-unit-system
 * Add material support to store_inventory table for dual reference
 *
 * User Story: US2 - 物料主数据管理
 * Requirement: FR-015.1 - 库存表增加 inventory_item_type 字段，支持 MATERIAL/SKU 多态引用
 *
 * This migration extends the store_inventory table to support storing inventory for both:
 * - SKU (finished products, combos)
 * - Material (raw materials, packaging)
 */

-- Create inventory_item_type ENUM (if not exists)
DO $$ BEGIN
    CREATE TYPE inventory_item_type AS ENUM ('SKU', 'MATERIAL');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Add new columns to store_inventory table
ALTER TABLE store_inventory
ADD COLUMN IF NOT EXISTS inventory_item_type inventory_item_type NOT NULL DEFAULT 'SKU',
ADD COLUMN IF NOT EXISTS material_id UUID REFERENCES materials(id) ON DELETE CASCADE;

-- Add constraint: sku_id and material_id are mutually exclusive based on type (drop if exists first)
ALTER TABLE store_inventory DROP CONSTRAINT IF EXISTS inventory_item_reference_exclusive;
ALTER TABLE store_inventory
ADD CONSTRAINT inventory_item_reference_exclusive
    CHECK (
        (inventory_item_type = 'SKU' AND sku_id IS NOT NULL AND material_id IS NULL) OR
        (inventory_item_type = 'MATERIAL' AND sku_id IS NULL AND material_id IS NOT NULL)
    );

-- Create indexes for material_id and inventory_item_type (if not exists)
CREATE INDEX IF NOT EXISTS idx_store_inventory_material_id ON store_inventory(material_id);
CREATE INDEX IF NOT EXISTS idx_store_inventory_item_type ON store_inventory(inventory_item_type);

-- Create composite index for material inventory queries (if not exists)
CREATE INDEX IF NOT EXISTS idx_store_inventory_store_material ON store_inventory(store_id, material_id)
    WHERE material_id IS NOT NULL;

-- Update table comment
COMMENT ON TABLE store_inventory IS '门店库存表（支持 SKU 和 Material 两种库存类型）';

-- Add column comments
COMMENT ON COLUMN store_inventory.inventory_item_type IS '库存项类型（SKU=成品/套餐, MATERIAL=原料/包材）';
COMMENT ON COLUMN store_inventory.material_id IS '物料 ID（外键到 materials 表），与 sku_id 互斥';

-- Update unique constraint to support both SKU and Material
ALTER TABLE store_inventory DROP CONSTRAINT IF EXISTS store_inventory_store_id_sku_id_key;

-- New unique constraints: prevent duplicate inventory records (drop if exists first)
DROP INDEX IF EXISTS uk_store_inventory_sku;
CREATE UNIQUE INDEX uk_store_inventory_sku ON store_inventory(store_id, sku_id)
    WHERE sku_id IS NOT NULL;

DROP INDEX IF EXISTS uk_store_inventory_material;
CREATE UNIQUE INDEX uk_store_inventory_material ON store_inventory(store_id, material_id)
    WHERE material_id IS NOT NULL;

-- Modify sku_id to be nullable (since material_id is an alternative)
ALTER TABLE store_inventory ALTER COLUMN sku_id DROP NOT NULL;

COMMENT ON CONSTRAINT inventory_item_reference_exclusive ON store_inventory IS 'sku_id 和 material_id 必须互斥（基于 inventory_item_type）';
