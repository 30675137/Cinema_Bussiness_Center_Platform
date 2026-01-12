/**
 * @spec N004-procurement-material-selector
 * N004: Add Material support to goods_receipt_items table
 * 
 * This migration extends the goods_receipt_items table to support Material procurement receipts,
 * complementing the existing SKU receipt capability.
 */

-- Step 1: Add item_type column (default SKU for backward compatibility)
ALTER TABLE goods_receipt_items
ADD COLUMN IF NOT EXISTS item_type VARCHAR(20) NOT NULL DEFAULT 'SKU';

-- Step 2: Add material_id column
ALTER TABLE goods_receipt_items
ADD COLUMN IF NOT EXISTS material_id UUID REFERENCES materials(id);

-- Step 3: Make sku_id nullable (it was previously NOT NULL)
ALTER TABLE goods_receipt_items
ALTER COLUMN sku_id DROP NOT NULL;

-- Step 4: Add constraint to ensure either material_id or sku_id is provided based on item_type
-- (This is a documentation-only constraint; actual validation is in application code)
COMMENT ON COLUMN goods_receipt_items.item_type IS 'N004: Item type - MATERIAL or SKU';
COMMENT ON COLUMN goods_receipt_items.material_id IS 'N004: Material reference (when item_type = MATERIAL)';
COMMENT ON COLUMN goods_receipt_items.sku_id IS 'N004: SKU reference (when item_type = SKU, nullable)';

-- Step 5: Create index for material_id lookups
CREATE INDEX IF NOT EXISTS idx_goods_receipt_items_material_id 
ON goods_receipt_items(material_id) 
WHERE material_id IS NOT NULL;

-- Step 6: Create index for item_type filtering
CREATE INDEX IF NOT EXISTS idx_goods_receipt_items_item_type 
ON goods_receipt_items(item_type);
