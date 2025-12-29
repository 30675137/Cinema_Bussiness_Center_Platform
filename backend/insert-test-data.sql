-- @spec P005-bom-inventory-deduction
-- Insert P005 test data after Flyway migrations complete
-- Execute this in Supabase Dashboard SQL Editor

-- Clean up existing test data (optional)
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
DELETE FROM spus WHERE id IN (
    '99999999-0000-0000-0000-000000000001'::uuid,
    '99999999-0000-0000-0000-000000000002'::uuid
);
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
    ('00000000-0000-0000-0000-000000000099'::uuid, '11111111-0000-0000-0000-000000000001'::uuid, 1000.0, 0.0, 1000.0),
    ('00000000-0000-0000-0000-000000000099'::uuid, '11111111-0000-0000-0000-000000000002'::uuid, 5000.0, 0.0, 5000.0),
    ('00000000-0000-0000-0000-000000000099'::uuid, '11111111-0000-0000-0000-000000000003'::uuid, 100.0, 0.0, 100.0),
    ('00000000-0000-0000-0000-000000000099'::uuid, '11111111-0000-0000-0000-000000000004'::uuid, 200.0, 0.0, 200.0);

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

-- Verification
SELECT '=== Test Data Inserted Successfully ===' AS status;
SELECT COUNT(*) AS store_count FROM stores WHERE id = '00000000-0000-0000-0000-000000000099'::uuid;
SELECT COUNT(*) AS sku_count FROM skus WHERE id::text LIKE '11111111%' OR id::text LIKE '22222222%';
SELECT COUNT(*) AS inventory_count FROM store_inventory WHERE store_id = '00000000-0000-0000-0000-000000000099'::uuid;
SELECT COUNT(*) AS bom_count FROM bom_components WHERE finished_product_id::text LIKE '22222222%';
