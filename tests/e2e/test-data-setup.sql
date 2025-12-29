-- @spec P005-bom-inventory-deduction
-- Test Data Setup for E2E Tests
-- Creates BOM components, inventory, and test products

-- Create test SKUs (finished products)
INSERT INTO skus (id, name, type, category_id, unit, created_at, updated_at)
VALUES
  ('sku-cocktail-001'::uuid, '威士忌可乐鸡尾酒', 'FINISHED_PRODUCT', '00000000-0000-0000-0000-000000000001'::uuid, 'cup', NOW(), NOW()),
  ('sku-combo-lovers'::uuid, '情侣套餐', 'COMBO', '00000000-0000-0000-0000-000000000001'::uuid, 'set', NOW(), NOW()),
  ('sku-whiskey-001'::uuid, '威士忌', 'RAW_MATERIAL', '00000000-0000-0000-0000-000000000002'::uuid, 'ml', NOW(), NOW()),
  ('sku-cola-001'::uuid, '可乐', 'RAW_MATERIAL', '00000000-0000-0000-0000-000000000002'::uuid, 'ml', NOW(), NOW()),
  ('sku-cup-001'::uuid, '杯子', 'RAW_MATERIAL', '00000000-0000-0000-0000-000000000003'::uuid, '个', NOW(), NOW()),
  ('sku-straw-001'::uuid, '吸管', 'RAW_MATERIAL', '00000000-0000-0000-0000-000000000003'::uuid, '根', NOW(), NOW()),
  ('sku-popcorn-001'::uuid, '爆米花', 'FINISHED_PRODUCT', '00000000-0000-0000-0000-000000000001'::uuid, '桶', NOW(), NOW()),
  ('sku-corn-001'::uuid, '玉米粒', 'RAW_MATERIAL', '00000000-0000-0000-0000-000000000002'::uuid, 'g', NOW(), NOW()),
  ('sku-butter-001'::uuid, '黄油', 'RAW_MATERIAL', '00000000-0000-0000-0000-000000000002'::uuid, 'g', NOW(), NOW()),
  ('sku-bucket-001'::uuid, '纸桶', 'RAW_MATERIAL', '00000000-0000-0000-0000-000000000003'::uuid, '个', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create BOM components for cocktail
INSERT INTO bom_components (id, finished_product_id, component_id, quantity, unit, wastage_rate, is_optional, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'sku-cocktail-001'::uuid, 'sku-whiskey-001'::uuid, 45, 'ml', 0.05, false, NOW(), NOW()),
  (gen_random_uuid(), 'sku-cocktail-001'::uuid, 'sku-cola-001'::uuid, 150, 'ml', 0.02, false, NOW(), NOW()),
  (gen_random_uuid(), 'sku-cocktail-001'::uuid, 'sku-cup-001'::uuid, 1, '个', 0.0, false, NOW(), NOW()),
  (gen_random_uuid(), 'sku-cocktail-001'::uuid, 'sku-straw-001'::uuid, 1, '根', 0.0, false, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create BOM components for popcorn
INSERT INTO bom_components (id, finished_product_id, component_id, quantity, unit, wastage_rate, is_optional, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'sku-popcorn-001'::uuid, 'sku-corn-001'::uuid, 50, 'g', 0.1, false, NOW(), NOW()),
  (gen_random_uuid(), 'sku-popcorn-001'::uuid, 'sku-butter-001'::uuid, 10, 'g', 0.05, false, NOW(), NOW()),
  (gen_random_uuid(), 'sku-popcorn-001'::uuid, 'sku-bucket-001'::uuid, 1, '个', 0.0, false, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create BOM components for combo (multi-level)
INSERT INTO bom_components (id, finished_product_id, component_id, quantity, unit, wastage_rate, is_optional, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'sku-combo-lovers'::uuid, 'sku-cocktail-001'::uuid, 1, 'cup', 0.0, false, NOW(), NOW()),
  (gen_random_uuid(), 'sku-combo-lovers'::uuid, 'sku-popcorn-001'::uuid, 1, '桶', 0.0, false, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Set up inventory for test store
INSERT INTO inventory (id, store_id, sku_id, on_hand_qty, reserved_qty, available_qty, unit, created_at, updated_at)
VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001'::uuid, 'sku-whiskey-001'::uuid, 1000.0, 0.0, 1000.0, 'ml', NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001'::uuid, 'sku-cola-001'::uuid, 5000.0, 0.0, 5000.0, 'ml', NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001'::uuid, 'sku-cup-001'::uuid, 100.0, 0.0, 100.0, '个', NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001'::uuid, 'sku-straw-001'::uuid, 200.0, 0.0, 200.0, '根', NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001'::uuid, 'sku-corn-001'::uuid, 2000.0, 0.0, 2000.0, 'g', NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001'::uuid, 'sku-butter-001'::uuid, 500.0, 0.0, 500.0, 'g', NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001'::uuid, 'sku-bucket-001'::uuid, 50.0, 0.0, 50.0, '个', NOW(), NOW())
ON CONFLICT (store_id, sku_id) DO UPDATE
  SET on_hand_qty = EXCLUDED.on_hand_qty,
      reserved_qty = 0.0,
      available_qty = EXCLUDED.on_hand_qty,
      updated_at = NOW();

-- Clear any existing test data (optional, for clean state)
DELETE FROM inventory_reservations WHERE order_id::text LIKE '%test%';
DELETE FROM inventory_transactions WHERE related_order_id::text LIKE '%test%';
DELETE FROM bom_snapshots WHERE order_id::text LIKE '%test%';

COMMIT;
