-- @spec P005-bom-inventory-deduction
-- Complete test data including reservations and BOM snapshots
-- Execute this in Supabase Dashboard SQL Editor

-- Clean up existing test data (in correct order to respect foreign keys)
-- 1. Delete reservations and snapshots first (child tables)
DELETE FROM bom_snapshots WHERE order_id IN (
    '33333333-0000-0000-0000-000000000001'::uuid,
    '33333333-0000-0000-0000-000000000002'::uuid
);
-- Also delete snapshots that reference our test SKUs
DELETE FROM bom_snapshots WHERE finished_sku_id IN (
    '11111111-0000-0000-0000-000000000001'::uuid,
    '11111111-0000-0000-0000-000000000002'::uuid,
    '11111111-0000-0000-0000-000000000003'::uuid,
    '11111111-0000-0000-0000-000000000004'::uuid,
    '22222222-0000-0000-0000-000000000001'::uuid,
    '22222222-0000-0000-0000-000000000002'::uuid
);
DELETE FROM bom_snapshots WHERE raw_material_sku_id IN (
    '11111111-0000-0000-0000-000000000001'::uuid,
    '11111111-0000-0000-0000-000000000002'::uuid,
    '11111111-0000-0000-0000-000000000003'::uuid,
    '11111111-0000-0000-0000-000000000004'::uuid
);
DELETE FROM inventory_reservations WHERE order_id IN (
    '33333333-0000-0000-0000-000000000001'::uuid,
    '33333333-0000-0000-0000-000000000002'::uuid
);
-- 2. Also delete any existing reservations that reference our test SKUs
DELETE FROM inventory_reservations WHERE sku_id IN (
    '11111111-0000-0000-0000-000000000001'::uuid,
    '11111111-0000-0000-0000-000000000002'::uuid,
    '11111111-0000-0000-0000-000000000003'::uuid,
    '11111111-0000-0000-0000-000000000004'::uuid,
    '22222222-0000-0000-0000-000000000001'::uuid,
    '22222222-0000-0000-0000-000000000002'::uuid
);
-- 3. Delete BOM components
DELETE FROM bom_components WHERE finished_product_id IN (
    '22222222-0000-0000-0000-000000000001'::uuid,
    '22222222-0000-0000-0000-000000000002'::uuid
);
-- 4. Delete store inventory
DELETE FROM store_inventory WHERE store_id = '00000000-0000-0000-0000-000000000099'::uuid;
-- 5. Delete SKUs
DELETE FROM skus WHERE id IN (
    '11111111-0000-0000-0000-000000000001'::uuid,
    '11111111-0000-0000-0000-000000000002'::uuid,
    '11111111-0000-0000-0000-000000000003'::uuid,
    '11111111-0000-0000-0000-000000000004'::uuid,
    '22222222-0000-0000-0000-000000000001'::uuid,
    '22222222-0000-0000-0000-000000000002'::uuid
);
-- 6. Delete SPUs
DELETE FROM spus WHERE id IN (
    '99999999-0000-0000-0000-000000000001'::uuid,
    '99999999-0000-0000-0000-000000000002'::uuid
);
-- 7. Delete store
DELETE FROM stores WHERE id = '00000000-0000-0000-0000-000000000099'::uuid;

-- Step 1: Insert test store
INSERT INTO stores (id, code, name, status, province, city, district, address, phone)
VALUES (
    '00000000-0000-0000-0000-000000000099'::uuid,
    'STORE-P005-TEST',
    'Test Store P005',
    'active',
    '北京市',
    '北京市',
    '朝阳区',
    '测试地址123号',
    '13800138000'
);

-- Step 2a: Insert test SPUs first
INSERT INTO spus (id, code, name, status)
VALUES
    ('99999999-0000-0000-0000-000000000001'::uuid, 'SPU-RAW-MATERIALS', 'P005测试原料SPU', 'enabled'),
    ('99999999-0000-0000-0000-000000000002'::uuid, 'SPU-FINISHED-PRODUCTS', 'P005测试成品SPU', 'enabled')
ON CONFLICT (code) DO NOTHING;

-- Step 2b: Insert Raw Material SKUs
INSERT INTO skus (id, code, name, sku_type, main_unit, status, spu_id)
VALUES
    ('11111111-0000-0000-0000-000000000001'::uuid, 'RAW-WHISKEY', '威士忌', 'raw_material', 'ml', 'enabled', '99999999-0000-0000-0000-000000000001'::uuid),
    ('11111111-0000-0000-0000-000000000002'::uuid, 'RAW-COLA', '可乐', 'raw_material', 'ml', 'enabled', '99999999-0000-0000-0000-000000000001'::uuid),
    ('11111111-0000-0000-0000-000000000003'::uuid, 'RAW-CUP', '杯子', 'raw_material', '个', 'enabled', '99999999-0000-0000-0000-000000000001'::uuid),
    ('11111111-0000-0000-0000-000000000004'::uuid, 'RAW-STRAW', '吸管', 'raw_material', '根', 'enabled', '99999999-0000-0000-0000-000000000001'::uuid);

-- Step 3: Insert Finished Product SKUs
INSERT INTO skus (id, code, name, sku_type, main_unit, status, spu_id)
VALUES
    ('22222222-0000-0000-0000-000000000001'::uuid, 'FIN-COCKTAIL', '威士忌可乐鸡尾酒', 'finished_product', '杯', 'enabled', '99999999-0000-0000-0000-000000000002'::uuid),
    ('22222222-0000-0000-0000-000000000002'::uuid, 'FIN-COMBO', '观影套餐', 'finished_product', '份', 'enabled', '99999999-0000-0000-0000-000000000002'::uuid);

-- Step 4: Insert Inventory (store_inventory table)
INSERT INTO store_inventory (store_id, sku_id, on_hand_qty, reserved_qty, available_qty)
VALUES
    ('00000000-0000-0000-0000-000000000099'::uuid, '11111111-0000-0000-0000-000000000001'::uuid, 1000.0, 45.0, 955.0),
    ('00000000-0000-0000-0000-000000000099'::uuid, '11111111-0000-0000-0000-000000000002'::uuid, 5000.0, 150.0, 4850.0),
    ('00000000-0000-0000-0000-000000000099'::uuid, '11111111-0000-0000-0000-000000000003'::uuid, 100.0, 1.0, 99.0),
    ('00000000-0000-0000-0000-000000000099'::uuid, '11111111-0000-0000-0000-000000000004'::uuid, 200.0, 1.0, 199.0);

-- Step 5: Insert BOM Components
INSERT INTO bom_components (finished_product_id, component_id, quantity, unit)
VALUES
    -- 威士忌可乐鸡尾酒配方
    ('22222222-0000-0000-0000-000000000001'::uuid, '11111111-0000-0000-0000-000000000001'::uuid, 45.0, 'ml'),
    ('22222222-0000-0000-0000-000000000001'::uuid, '11111111-0000-0000-0000-000000000002'::uuid, 150.0, 'ml'),
    ('22222222-0000-0000-0000-000000000001'::uuid, '11111111-0000-0000-0000-000000000003'::uuid, 1.0, '个'),
    ('22222222-0000-0000-0000-000000000001'::uuid, '11111111-0000-0000-0000-000000000004'::uuid, 1.0, '根'),
    -- 观影套餐配方 (多层级)
    ('22222222-0000-0000-0000-000000000002'::uuid, '22222222-0000-0000-0000-000000000001'::uuid, 1.0, '杯');

-- Step 6: Insert test orders (for reservation context)
-- Note: We assume orders exist in a separate table, but we'll use UUIDs for testing

-- Step 7: Insert Inventory Reservations (库存预占记录)
INSERT INTO inventory_reservations (
    id,
    order_id,
    store_id,
    sku_id,
    quantity,
    reserved_quantity,
    status,
    created_at,
    expires_at
)
VALUES
    -- Order 1: 1杯威士忌可乐鸡尾酒 (预占成品 SKU)
    (
        gen_random_uuid(),
        '33333333-0000-0000-0000-000000000001'::uuid,
        '00000000-0000-0000-0000-000000000099'::uuid,
        '22222222-0000-0000-0000-000000000001'::uuid,
        1.0,
        1.0,
        'ACTIVE',
        NOW(),
        NOW() + INTERVAL '30 minutes'
    );

-- Step 8: Insert BOM Snapshots (配方快照)
-- These snapshots freeze the BOM formula at reservation time
INSERT INTO bom_snapshots (
    id,
    order_id,
    finished_sku_id,
    raw_material_sku_id,
    quantity,
    unit,
    wastage_rate,
    bom_level,
    created_at
)
VALUES
    -- Order 1: 威士忌可乐鸡尾酒的配方快照
    (
        gen_random_uuid(),
        '33333333-0000-0000-0000-000000000001'::uuid,
        '22222222-0000-0000-0000-000000000001'::uuid,
        '11111111-0000-0000-0000-000000000001'::uuid,
        45.0,
        'ml',
        0.0,
        1,
        NOW()
    ),
    (
        gen_random_uuid(),
        '33333333-0000-0000-0000-000000000001'::uuid,
        '22222222-0000-0000-0000-000000000001'::uuid,
        '11111111-0000-0000-0000-000000000002'::uuid,
        150.0,
        'ml',
        0.0,
        1,
        NOW()
    ),
    (
        gen_random_uuid(),
        '33333333-0000-0000-0000-000000000001'::uuid,
        '22222222-0000-0000-0000-000000000001'::uuid,
        '11111111-0000-0000-0000-000000000003'::uuid,
        1.0,
        '个',
        0.0,
        1,
        NOW()
    ),
    (
        gen_random_uuid(),
        '33333333-0000-0000-0000-000000000001'::uuid,
        '22222222-0000-0000-0000-000000000001'::uuid,
        '11111111-0000-0000-0000-000000000004'::uuid,
        1.0,
        '根',
        0.0,
        1,
        NOW()
    );

-- Verification
SELECT '=== Test Data Inserted Successfully ===' AS status;
SELECT COUNT(*) AS store_count FROM stores WHERE id = '00000000-0000-0000-0000-000000000099'::uuid;
SELECT COUNT(*) AS sku_count FROM skus WHERE id::text LIKE '11111111%' OR id::text LIKE '22222222%';
SELECT COUNT(*) AS inventory_count FROM store_inventory WHERE store_id = '00000000-0000-0000-0000-000000000099'::uuid;
SELECT COUNT(*) AS bom_count FROM bom_components WHERE finished_product_id::text LIKE '22222222%';
SELECT COUNT(*) AS reservation_count FROM inventory_reservations WHERE order_id = '33333333-0000-0000-0000-000000000001'::uuid;
SELECT COUNT(*) AS snapshot_count FROM bom_snapshots WHERE order_id = '33333333-0000-0000-0000-000000000001'::uuid;

-- Show test data for manual verification
SELECT 'Inventory Reservations:' AS section;
SELECT * FROM inventory_reservations WHERE order_id = '33333333-0000-0000-0000-000000000001'::uuid;

SELECT 'BOM Snapshots:' AS section;
SELECT * FROM bom_snapshots WHERE order_id = '33333333-0000-0000-0000-000000000001'::uuid;

SELECT 'Store Inventory (before deduction):' AS section;
SELECT * FROM store_inventory WHERE store_id = '00000000-0000-0000-0000-000000000099'::uuid;
