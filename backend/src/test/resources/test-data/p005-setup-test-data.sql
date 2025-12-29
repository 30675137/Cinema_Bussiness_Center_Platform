-- @spec P005-bom-inventory-deduction
-- P005 Test Data Setup Script
-- Execute via Spring Boot test or database client

-- Clean up existing test data (optional, comment out if you want to keep data)
DELETE FROM bom_components WHERE finished_product_id IN (
    '22222222-0000-0000-0000-000000000001'::uuid,
    '22222222-0000-0000-0000-000000000002'::uuid
);
DELETE FROM inventory WHERE store_id = '00000000-0000-0000-0000-000000000099'::uuid;
DELETE FROM skus WHERE id IN (
    '11111111-0000-0000-0000-000000000001'::uuid,
    '11111111-0000-0000-0000-000000000002'::uuid,
    '11111111-0000-0000-0000-000000000003'::uuid,
    '11111111-0000-0000-0000-000000000004'::uuid,
    '22222222-0000-0000-0000-000000000001'::uuid,
    '22222222-0000-0000-0000-000000000002'::uuid
);
DELETE FROM stores WHERE id = '00000000-0000-0000-0000-000000000099'::uuid;

-- Insert test data
-- Step 1: Store
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

-- Step 2: Raw Material SKUs
INSERT INTO skus (id, name, type, unit, status)
VALUES
    ('11111111-0000-0000-0000-000000000001'::uuid, '威士忌', 'RAW_MATERIAL', 'ml', 'ACTIVE'),
    ('11111111-0000-0000-0000-000000000002'::uuid, '可乐', 'RAW_MATERIAL', 'ml', 'ACTIVE'),
    ('11111111-0000-0000-0000-000000000003'::uuid, '杯子', 'RAW_MATERIAL', '个', 'ACTIVE'),
    ('11111111-0000-0000-0000-000000000004'::uuid, '吸管', 'RAW_MATERIAL', '根', 'ACTIVE');

-- Step 3: Finished Product SKUs
INSERT INTO skus (id, name, type, unit, status)
VALUES
    ('22222222-0000-0000-0000-000000000001'::uuid, '威士忌可乐鸡尾酒', 'FINISHED_PRODUCT', '杯', 'ACTIVE'),
    ('22222222-0000-0000-0000-000000000002'::uuid, '观影套餐', 'FINISHED_PRODUCT', '份', 'ACTIVE');

-- Step 4: Inventory
INSERT INTO inventory (store_id, sku_id, on_hand_qty, reserved_qty)
VALUES
    ('00000000-0000-0000-0000-000000000099'::uuid, '11111111-0000-0000-0000-000000000001'::uuid, 1000.0, 0.0),
    ('00000000-0000-0000-0000-000000000099'::uuid, '11111111-0000-0000-0000-000000000002'::uuid, 5000.0, 0.0),
    ('00000000-0000-0000-0000-000000000099'::uuid, '11111111-0000-0000-0000-000000000003'::uuid, 100.0, 0.0),
    ('00000000-0000-0000-0000-000000000099'::uuid, '11111111-0000-0000-0000-000000000004'::uuid, 200.0, 0.0);

-- Step 5: BOM Components
INSERT INTO bom_components (finished_product_id, component_id, quantity, wastage_rate)
VALUES
    -- 威士忌可乐鸡尾酒配方
    ('22222222-0000-0000-0000-000000000001'::uuid, '11111111-0000-0000-0000-000000000001'::uuid, 45.0, 0.0),
    ('22222222-0000-0000-0000-000000000001'::uuid, '11111111-0000-0000-0000-000000000002'::uuid, 150.0, 0.0),
    ('22222222-0000-0000-0000-000000000001'::uuid, '11111111-0000-0000-0000-000000000003'::uuid, 1.0, 0.0),
    ('22222222-0000-0000-0000-000000000001'::uuid, '11111111-0000-0000-0000-000000000004'::uuid, 1.0, 0.0),
    -- 观影套餐配方 (多层级)
    ('22222222-0000-0000-0000-000000000002'::uuid, '22222222-0000-0000-0000-000000000001'::uuid, 1.0, 0.0);
