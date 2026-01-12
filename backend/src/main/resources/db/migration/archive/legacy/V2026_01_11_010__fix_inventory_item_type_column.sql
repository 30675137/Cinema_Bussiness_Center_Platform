/**
 * @spec N004-procurement-material-selector
 * Fix inventory_item_type column type: PostgreSQL enum -> VARCHAR
 * 
 * Problem: JPA @Enumerated(EnumType.STRING) sends VARCHAR but the column is PostgreSQL enum type.
 * Solution: Convert the column to VARCHAR(20) to be compatible with JPA string enum mapping.
 */

-- Step 1: Drop the check constraint that references the enum type
ALTER TABLE store_inventory
DROP CONSTRAINT IF EXISTS inventory_item_reference_exclusive;

-- Step 2: Change column type from enum to VARCHAR
ALTER TABLE store_inventory
ALTER COLUMN inventory_item_type TYPE VARCHAR(20) USING inventory_item_type::text;

-- Step 3: Set NOT NULL and default value
ALTER TABLE store_inventory
ALTER COLUMN inventory_item_type SET NOT NULL,
ALTER COLUMN inventory_item_type SET DEFAULT 'SKU';

-- Step 4: Recreate the check constraint with VARCHAR comparison
ALTER TABLE store_inventory
ADD CONSTRAINT inventory_item_reference_exclusive CHECK (
    (inventory_item_type = 'SKU' AND sku_id IS NOT NULL AND material_id IS NULL) OR
    (inventory_item_type = 'MATERIAL' AND sku_id IS NULL AND material_id IS NOT NULL)
);

-- Note: The enum type 'inventory_item_type' is kept for potential future use by other tables
