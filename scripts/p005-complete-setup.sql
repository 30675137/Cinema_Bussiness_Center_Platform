/**
 * @spec P005-bom-inventory-deduction
 * Complete Database Setup Script - Schema + Test Data
 *
 * Purpose: Create all necessary tables and insert test data in one script
 * Usage: Execute this in Supabase Dashboard SQL Editor
 *
 * Author: Generated for E2E testing
 * Date: 2025-12-29
 */

-- ===================================================================
-- PART 1: CREATE TABLES (Schema Setup)
-- ===================================================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    province VARCHAR(100),
    city VARCHAR(100),
    district VARCHAR(100),
    address TEXT,
    phone VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create skus table
CREATE TABLE IF NOT EXISTS skus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- RAW_MATERIAL, FINISHED_PRODUCT
    unit VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    category_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create bom_components table
CREATE TABLE IF NOT EXISTS bom_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    finished_product_id UUID NOT NULL REFERENCES skus(id),
    component_id UUID NOT NULL REFERENCES skus(id),
    quantity DECIMAL(12, 3) NOT NULL,
    wastage_rate DECIMAL(5, 4) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (finished_product_id, component_id)
);

-- Create store_inventory table (this is the "inventory" table)
CREATE TABLE IF NOT EXISTS store_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    sku_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
    on_hand_qty DECIMAL(12, 3) NOT NULL DEFAULT 0,
    available_qty DECIMAL(12, 3) NOT NULL DEFAULT 0,
    reserved_qty DECIMAL(12, 3) NOT NULL DEFAULT 0,
    safety_stock DECIMAL(12, 3) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (store_id, sku_id)
);

-- Create inventory_reservations table
CREATE TABLE IF NOT EXISTS inventory_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    store_id UUID NOT NULL REFERENCES stores(id),
    sku_id UUID NOT NULL REFERENCES skus(id),
    quantity NUMERIC(19,4) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    released_at TIMESTAMP
);

-- Create bom_snapshots table
CREATE TABLE IF NOT EXISTS bom_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    finished_sku_id UUID NOT NULL REFERENCES skus(id),
    raw_material_sku_id UUID NOT NULL REFERENCES skus(id),
    quantity NUMERIC(19,4) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    wastage_rate NUMERIC(5,4) DEFAULT 0,
    bom_level INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create inventory_transactions table
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id),
    sku_id UUID NOT NULL REFERENCES skus(id),
    quantity NUMERIC(19,4) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    reference_id UUID,
    bom_snapshot_id UUID,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

-- ===================================================================
-- PART 2: CREATE INDEXES
-- ===================================================================

CREATE INDEX IF NOT EXISTS idx_store_inventory_store_id ON store_inventory(store_id);
CREATE INDEX IF NOT EXISTS idx_store_inventory_sku_id ON store_inventory(sku_id);
CREATE INDEX IF NOT EXISTS idx_store_inventory_lock ON store_inventory(store_id, sku_id);
CREATE INDEX IF NOT EXISTS idx_inventory_reservations_order_id ON inventory_reservations(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_reservations_status ON inventory_reservations(status);
CREATE INDEX IF NOT EXISTS idx_bom_snapshots_order_id ON bom_snapshots(order_id);
CREATE INDEX IF NOT EXISTS idx_bom_snapshots_finished_sku ON bom_snapshots(finished_sku_id);

-- ===================================================================
-- PART 3: ADD CONSTRAINTS
-- ===================================================================

-- Fix any existing bad data first
UPDATE store_inventory
SET reserved_qty = 0
WHERE reserved_qty > on_hand_qty;

UPDATE store_inventory
SET available_qty = on_hand_qty - reserved_qty
WHERE available_qty != (on_hand_qty - reserved_qty);

-- Add constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_store_inventory_reserved_lte_on_hand'
    ) THEN
        ALTER TABLE store_inventory
        ADD CONSTRAINT chk_store_inventory_reserved_lte_on_hand
        CHECK (on_hand_qty >= reserved_qty);
    END IF;
END$$;

-- ===================================================================
-- PART 4: CLEAN UP EXISTING TEST DATA (Optional - comment out if you want to keep data)
-- ===================================================================

DELETE FROM bom_components WHERE finished_product_id IN (
    '22222222-0000-0000-0000-000000000001'::uuid,
    '22222222-0000-0000-0000-000000000002'::uuid
);
DELETE FROM store_inventory WHERE store_id = '00000000-0000-0000-0000-000000000099'::uuid;
DELETE FROM skus WHERE id IN (
    '11111111-0000-0000-0000-000000000001'::uuid,
    '11111111-0000-0000-0000-000000000002'::uuid,
    '11111111-0000-0000-0000-000000000003'::uuid,
    '11111111-0000-0000-0000-000000000004'::uuid,
    '22222222-0000-0000-0000-000000000001'::uuid,
    '22222222-0000-0000-0000-000000000002'::uuid
);
DELETE FROM stores WHERE id = '00000000-0000-0000-0000-000000000099'::uuid;

-- ===================================================================
-- PART 5: INSERT TEST DATA
-- ===================================================================

-- Step 1: Insert test store
INSERT INTO stores (id, name, status, province, city, district, address, phone)
VALUES (
    '00000000-0000-0000-0000-000000000099'::uuid,
    'Test Store P005',
    'ACTIVE',
    '北京市',
    '北京市',
    '朝阳区',
    '测试地址123号',
    '13800138000'
);

-- Step 2: Insert Raw Material SKUs
INSERT INTO skus (id, name, type, unit, status)
VALUES
    ('11111111-0000-0000-0000-000000000001'::uuid, '威士忌', 'RAW_MATERIAL', 'ml', 'ACTIVE'),
    ('11111111-0000-0000-0000-000000000002'::uuid, '可乐', 'RAW_MATERIAL', 'ml', 'ACTIVE'),
    ('11111111-0000-0000-0000-000000000003'::uuid, '杯子', 'RAW_MATERIAL', '个', 'ACTIVE'),
    ('11111111-0000-0000-0000-000000000004'::uuid, '吸管', 'RAW_MATERIAL', '根', 'ACTIVE');

-- Step 3: Insert Finished Product SKUs
INSERT INTO skus (id, name, type, unit, status)
VALUES
    ('22222222-0000-0000-0000-000000000001'::uuid, '威士忌可乐鸡尾酒', 'FINISHED_PRODUCT', '杯', 'ACTIVE'),
    ('22222222-0000-0000-0000-000000000002'::uuid, '观影套餐', 'FINISHED_PRODUCT', '份', 'ACTIVE');

-- Step 4: Insert Inventory (store_inventory table)
INSERT INTO store_inventory (store_id, sku_id, on_hand_qty, reserved_qty, available_qty)
VALUES
    ('00000000-0000-0000-0000-000000000099'::uuid, '11111111-0000-0000-0000-000000000001'::uuid, 1000.0, 0.0, 1000.0),
    ('00000000-0000-0000-0000-000000000099'::uuid, '11111111-0000-0000-0000-000000000002'::uuid, 5000.0, 0.0, 5000.0),
    ('00000000-0000-0000-0000-000000000099'::uuid, '11111111-0000-0000-0000-000000000003'::uuid, 100.0, 0.0, 100.0),
    ('00000000-0000-0000-0000-000000000099'::uuid, '11111111-0000-0000-0000-000000000004'::uuid, 200.0, 0.0, 200.0);

-- Step 5: Insert BOM Components
INSERT INTO bom_components (finished_product_id, component_id, quantity, wastage_rate)
VALUES
    -- 威士忌可乐鸡尾酒配方
    ('22222222-0000-0000-0000-000000000001'::uuid, '11111111-0000-0000-0000-000000000001'::uuid, 45.0, 0.0),
    ('22222222-0000-0000-0000-000000000001'::uuid, '11111111-0000-0000-0000-000000000002'::uuid, 150.0, 0.0),
    ('22222222-0000-0000-0000-000000000001'::uuid, '11111111-0000-0000-0000-000000000003'::uuid, 1.0, 0.0),
    ('22222222-0000-0000-0000-000000000001'::uuid, '11111111-0000-0000-0000-000000000004'::uuid, 1.0, 0.0),
    -- 观影套餐配方 (多层级)
    ('22222222-0000-0000-0000-000000000002'::uuid, '22222222-0000-0000-0000-000000000001'::uuid, 1.0, 0.0);

-- ===================================================================
-- PART 6: VERIFICATION QUERIES
-- ===================================================================

-- Show all created tables
SELECT '=== TABLES CREATED ===' AS section;
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('stores', 'skus', 'bom_components', 'store_inventory', 'inventory_reservations', 'bom_snapshots', 'inventory_transactions')
ORDER BY table_name;

-- Show test store
SELECT '=== STORES ===' AS section;
SELECT * FROM stores WHERE id = '00000000-0000-0000-0000-000000000099'::uuid;

-- Show test SKUs
SELECT '=== SKUs ===' AS section;
SELECT id, name, type, unit, status
FROM skus
WHERE id IN (
    '11111111-0000-0000-0000-000000000001'::uuid,
    '11111111-0000-0000-0000-000000000002'::uuid,
    '11111111-0000-0000-0000-000000000003'::uuid,
    '11111111-0000-0000-0000-000000000004'::uuid,
    '22222222-0000-0000-0000-000000000001'::uuid,
    '22222222-0000-0000-0000-000000000002'::uuid
)
ORDER BY type, name;

-- Show inventory
SELECT '=== INVENTORY (store_inventory) ===' AS section;
SELECT si.id, si.store_id, si.sku_id, s.name AS sku_name, s.unit,
       si.on_hand_qty, si.reserved_qty, si.available_qty
FROM store_inventory si
JOIN skus s ON si.sku_id = s.id
WHERE si.store_id = '00000000-0000-0000-0000-000000000099'::uuid
ORDER BY s.name;

-- Show BOM components
SELECT '=== BOM COMPONENTS ===' AS section;
SELECT bc.id,
       fp.name AS finished_product_name,
       c.name AS component_name,
       bc.quantity,
       c.unit,
       bc.wastage_rate
FROM bom_components bc
JOIN skus fp ON bc.finished_product_id = fp.id
JOIN skus c ON bc.component_id = c.id
WHERE bc.finished_product_id IN (
    '22222222-0000-0000-0000-000000000001'::uuid,
    '22222222-0000-0000-0000-000000000002'::uuid
)
ORDER BY fp.name, c.name;

-- Summary
SELECT '=== SETUP COMPLETE ===' AS section;
SELECT
    'Stores: ' || COUNT(*) AS result
FROM stores WHERE id = '00000000-0000-0000-0000-000000000099'::uuid
UNION ALL
SELECT
    'SKUs: ' || COUNT(*) AS result
FROM skus WHERE id IN (
    '11111111-0000-0000-0000-000000000001'::uuid,
    '11111111-0000-0000-0000-000000000002'::uuid,
    '11111111-0000-0000-0000-000000000003'::uuid,
    '11111111-0000-0000-0000-000000000004'::uuid,
    '22222222-0000-0000-0000-000000000001'::uuid,
    '22222222-0000-0000-0000-000000000002'::uuid
)
UNION ALL
SELECT
    'Inventory Records: ' || COUNT(*) AS result
FROM store_inventory WHERE store_id = '00000000-0000-0000-0000-000000000099'::uuid
UNION ALL
SELECT
    'BOM Components: ' || COUNT(*) AS result
FROM bom_components WHERE finished_product_id IN (
    '22222222-0000-0000-0000-000000000001'::uuid,
    '22222222-0000-0000-0000-000000000002'::uuid
);
