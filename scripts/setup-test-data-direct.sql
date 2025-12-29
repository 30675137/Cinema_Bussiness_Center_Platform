-- @spec P005-bom-inventory-deduction
-- P005 Test Data Setup Script
-- Execute this SQL directly via Spring Boot application or psql

-- Clean up existing test data
DELETE FROM bom_components WHERE finished_product_id IN (
    '22222222-0000-0000-0000-000000000001',
    '22222222-0000-0000-0000-000000000002'
);
DELETE FROM inventory WHERE store_id = '00000000-0000-0000-0000-000000000099';
DELETE FROM skus WHERE id IN (
    '11111111-0000-0000-0000-000000000001',
    '11111111-0000-0000-0000-000000000002',
    '11111111-0000-0000-0000-000000000003',
    '11111111-0000-0000-0000-000000000004',
    '22222222-0000-0000-0000-000000000001',
    '22222222-0000-0000-0000-000000000002'
);
DELETE FROM stores WHERE id = '00000000-0000-0000-0000-000000000099';

-- Step 1: Insert test store
INSERT INTO stores (id, name, status, province, city, district, address, phone, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000099',
    'Test Store P005',
    'ACTIVE',
    '北京市',
    '北京市',
    '朝阳区',
    '测试地址123号',
    '13800138000',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Step 2: Insert SKUs (raw materials)
INSERT INTO skus (id, name, type, unit, status, created_at, updated_at)
VALUES
    ('11111111-0000-0000-0000-000000000001', '威士忌', 'RAW_MATERIAL', 'ml', 'ACTIVE', NOW(), NOW()),
    ('11111111-0000-0000-0000-000000000002', '可乐', 'RAW_MATERIAL', 'ml', 'ACTIVE', NOW(), NOW()),
    ('11111111-0000-0000-0000-000000000003', '杯子', 'RAW_MATERIAL', '个', 'ACTIVE', NOW(), NOW()),
    ('11111111-0000-0000-0000-000000000004', '吸管', 'RAW_MATERIAL', '根', 'ACTIVE', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Step 3: Insert SKUs (finished products)
INSERT INTO skus (id, name, type, unit, status, created_at, updated_at)
VALUES
    ('22222222-0000-0000-0000-000000000001', '威士忌可乐鸡尾酒', 'FINISHED_PRODUCT', '杯', 'ACTIVE', NOW(), NOW()),
    ('22222222-0000-0000-0000-000000000002', '观影套餐', 'FINISHED_PRODUCT', '份', 'ACTIVE', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Step 4: Insert inventory
INSERT INTO inventory (store_id, sku_id, on_hand_qty, reserved_qty, created_at, updated_at)
VALUES
    ('00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000001', 1000.0, 0.0, NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000002', 5000.0, 0.0, NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000003', 100.0, 0.0, NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000004', 200.0, 0.0, NOW(), NOW())
ON CONFLICT (store_id, sku_id) DO UPDATE SET
    on_hand_qty = EXCLUDED.on_hand_qty,
    reserved_qty = EXCLUDED.reserved_qty,
    updated_at = NOW();

-- Step 5: Insert BOM components
-- 威士忌可乐鸡尾酒 BOM配方
INSERT INTO bom_components (finished_product_id, component_id, quantity, wastage_rate, created_at, updated_at)
VALUES
    ('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 45.0, 0.0, NOW(), NOW()),
    ('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002', 150.0, 0.0, NOW(), NOW()),
    ('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000003', 1.0, 0.0, NOW(), NOW()),
    ('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000004', 1.0, 0.0, NOW(), NOW())
ON CONFLICT (finished_product_id, component_id) DO UPDATE SET
    quantity = EXCLUDED.quantity,
    wastage_rate = EXCLUDED.wastage_rate,
    updated_at = NOW();

-- 观影套餐 BOM配方 (多层级 - 包含鸡尾酒)
INSERT INTO bom_components (finished_product_id, component_id, quantity, wastage_rate, created_at, updated_at)
VALUES
    ('22222222-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000001', 1.0, 0.0, NOW(), NOW())
ON CONFLICT (finished_product_id, component_id) DO UPDATE SET
    quantity = EXCLUDED.quantity,
    wastage_rate = EXCLUDED.wastage_rate,
    updated_at = NOW();

-- Verification queries
SELECT '=== Stores ===' AS section;
SELECT * FROM stores WHERE id = '00000000-0000-0000-0000-000000000099';

SELECT '=== SKUs ===' AS section;
SELECT * FROM skus WHERE id IN (
    '11111111-0000-0000-0000-000000000001',
    '11111111-0000-0000-0000-000000000002',
    '11111111-0000-0000-0000-000000000003',
    '11111111-0000-0000-0000-000000000004',
    '22222222-0000-0000-0000-000000000001',
    '22222222-0000-0000-0000-000000000002'
) ORDER BY type, name;

SELECT '=== Inventory ===' AS section;
SELECT i.*, s.name AS sku_name
FROM inventory i
JOIN skus s ON i.sku_id = s.id
WHERE i.store_id = '00000000-0000-0000-0000-000000000099'
ORDER BY s.name;

SELECT '=== BOM Components ===' AS section;
SELECT bc.*,
       fp.name AS finished_product_name,
       c.name AS component_name
FROM bom_components bc
JOIN skus fp ON bc.finished_product_id = fp.id
JOIN skus c ON bc.component_id = c.id
WHERE bc.finished_product_id IN (
    '22222222-0000-0000-0000-000000000001',
    '22222222-0000-0000-0000-000000000002'
)
ORDER BY fp.name, c.name;
