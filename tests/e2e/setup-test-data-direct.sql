/**
 * @spec P005-bom-inventory-deduction
 * Direct SQL Test Data Setup
 *
 * Purpose: Create test data directly in database for E2E testing
 * Execute this after backend is running with tables created
 *
 * Test Scenarios:
 * - Single-level BOM: Cola Product
 * - Multi-level BOM: Cocktail (2 levels)
 * - 3-level BOM: Combo Set A
 * - Inventory with sufficient and insufficient stock
 *
 * Author: Generated for E2E testing
 * Date: 2025-12-29
 */

-- Clean up existing test data
DELETE FROM inventory_reservations WHERE order_id LIKE 'test-%';
DELETE FROM bom_snapshots WHERE order_id LIKE 'test-%';
DELETE FROM inventory_transactions WHERE reference_id LIKE 'test-%';
DELETE FROM store_inventory WHERE store_id IN (SELECT id FROM stores WHERE code = 'TS-P005');
DELETE FROM bom_components WHERE parent_sku_id IN (SELECT id FROM skus WHERE code LIKE 'TEST-%');
DELETE FROM skus WHERE code LIKE 'TEST-%';
DELETE FROM stores WHERE code = 'TS-P005';

-- Step 1: Create Test Store
INSERT INTO stores (id, name, code, province, city, district, address, phone, status, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000099'::uuid,
    'Test Store P005',
    'TS-P005',
    'Shanghai',
    'Shanghai',
    'Pudong',
    'Test Address 123',
    '13800138000',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Step 2: Create Raw Material SKUs
INSERT INTO skus (id, name, code, unit, is_finished_product, created_at, updated_at)
VALUES
    ('11111111-0000-0000-0000-000000000001'::uuid, 'TEST-Whiskey', 'TEST-RM-WHISKEY', 'ml', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('11111111-0000-0000-0000-000000000002'::uuid, 'TEST-Cola', 'TEST-RM-COLA', 'ml', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('11111111-0000-0000-0000-000000000003'::uuid, 'TEST-Cup', 'TEST-RM-CUP', 'pcs', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('11111111-0000-0000-0000-000000000004'::uuid, 'TEST-Straw', 'TEST-RM-STRAW', 'pcs', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('11111111-0000-0000-0000-000000000005'::uuid, 'TEST-Snack', 'TEST-RM-SNACK', 'portion', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Step 3: Create Finished Product SKUs
INSERT INTO skus (id, name, code, unit, is_finished_product, created_at, updated_at)
VALUES
    ('22222222-0000-0000-0000-000000000001'::uuid, 'TEST-Cocktail', 'TEST-FP-COCKTAIL', 'cup', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('22222222-0000-0000-0000-000000000002'::uuid, 'TEST-Combo Set A', 'TEST-FP-COMBO-A', 'set', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('22222222-0000-0000-0000-000000000003'::uuid, 'TEST-4-Level-Product', 'TEST-FP-4LEVEL', 'set', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Step 4: Create BOM Components

-- Level 1: Cocktail = 45ml Whiskey + 150ml Cola + 1 Cup + 1 Straw
INSERT INTO bom_components (id, parent_sku_id, child_sku_id, quantity, unit, wastage_rate, created_at, updated_at)
VALUES
    (gen_random_uuid(), '22222222-0000-0000-0000-000000000001'::uuid, '11111111-0000-0000-0000-000000000001'::uuid, 45, 'ml', 0.05, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), '22222222-0000-0000-0000-000000000001'::uuid, '11111111-0000-0000-0000-000000000002'::uuid, 150, 'ml', 0.02, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), '22222222-0000-0000-0000-000000000001'::uuid, '11111111-0000-0000-0000-000000000003'::uuid, 1, 'pcs', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), '22222222-0000-0000-0000-000000000001'::uuid, '11111111-0000-0000-0000-000000000004'::uuid, 1, 'pcs', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Level 2: Combo Set A = 2 Cocktails + 1 Snack
INSERT INTO bom_components (id, parent_sku_id, child_sku_id, quantity, unit, wastage_rate, created_at, updated_at)
VALUES
    (gen_random_uuid(), '22222222-0000-0000-0000-000000000002'::uuid, '22222222-0000-0000-0000-000000000001'::uuid, 2, 'cup', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), '22222222-0000-0000-0000-000000000002'::uuid, '11111111-0000-0000-0000-000000000005'::uuid, 1, 'portion', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Level 3+: 4-Level Product (for boundary testing) = 1 Combo Set A
INSERT INTO bom_components (id, parent_sku_id, child_sku_id, quantity, unit, wastage_rate, created_at, updated_at)
VALUES
    (gen_random_uuid(), '22222222-0000-0000-0000-000000000003'::uuid, '22222222-0000-0000-0000-000000000002'::uuid, 1, 'set', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Step 5: Create Inventory

-- Sufficient stock scenario
INSERT INTO store_inventory (id, store_id, sku_id, on_hand_qty, reserved_qty, available_qty, created_at, updated_at)
VALUES
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000099'::uuid, '11111111-0000-0000-0000-000000000001'::uuid, 10000, 0, 10000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- Whiskey: 10L
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000099'::uuid, '11111111-0000-0000-0000-000000000002'::uuid, 20000, 0, 20000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- Cola: 20L
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000099'::uuid, '11111111-0000-0000-0000-000000000003'::uuid, 200, 0, 200, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- Cups: 200
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000099'::uuid, '11111111-0000-0000-0000-000000000004'::uuid, 500, 0, 500, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- Straws: 500
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000099'::uuid, '11111111-0000-0000-0000-000000000005'::uuid, 50, 0, 50, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP); -- Snacks: 50

-- Low stock scenario (for insufficient inventory testing)
INSERT INTO store_inventory (id, store_id, sku_id, on_hand_qty, reserved_qty, available_qty, created_at, updated_at)
VALUES
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000099'::uuid, '22222222-0000-0000-0000-000000000001'::uuid, 5, 0, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP); -- Cocktail finished goods: only 5

-- Print confirmation
SELECT 'Test data setup complete!' AS status,
       (SELECT COUNT(*) FROM skus WHERE code LIKE 'TEST-%') AS test_skus_count,
       (SELECT COUNT(*) FROM bom_components WHERE parent_sku_id IN (SELECT id FROM skus WHERE code LIKE 'TEST-%')) AS bom_components_count,
       (SELECT COUNT(*) FROM store_inventory WHERE store_id = '00000000-0000-0000-0000-000000000099'::uuid) AS inventory_records_count;
