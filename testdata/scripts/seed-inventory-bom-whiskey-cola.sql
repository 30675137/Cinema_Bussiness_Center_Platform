-- @spec T004-e2e-testdata-planner
-- BOM Inventory Test Data Seeding Script
-- Purpose: Initialize inventory data for E2E-INVENTORY-002 test
-- Database: Supabase PostgreSQL

-- =============================================================================
-- Step 1: 清理旧的测试数据（幂等性）
-- =============================================================================

-- 删除库存事务记录（外键依赖，先删除）
DELETE FROM inventory_transactions
WHERE sku_id IN (
  '550e8400-e29b-41d4-a716-446655440001',  -- 威士忌
  '550e8400-e29b-41d4-a716-446655440002'   -- 可乐糖浆
);

-- 删除库存记录
DELETE FROM inventory
WHERE sku_id IN (
  '550e8400-e29b-41d4-a716-446655440001',  -- 威士忌
  '550e8400-e29b-41d4-a716-446655440002'   -- 可乐糖浆
);

-- =============================================================================
-- Step 2: 插入初始库存数据
-- =============================================================================

INSERT INTO inventory (
  sku_id,
  sku_name,
  on_hand,
  reserved,
  unit,
  store_id,
  created_at,
  updated_at
)
VALUES
  -- 威士忌原料（初始库存 100ml，预占 0ml）
  (
    '550e8400-e29b-41d4-a716-446655440001',
    '威士忌',
    100,
    0,
    'ml',
    1,
    NOW(),
    NOW()
  ),
  -- 可乐糖浆原料（初始库存 500ml，预占 0ml）
  (
    '550e8400-e29b-41d4-a716-446655440002',
    '可乐糖浆',
    500,
    0,
    'ml',
    1,
    NOW(),
    NOW()
  )
ON CONFLICT (sku_id, store_id) DO UPDATE
SET
  on_hand = EXCLUDED.on_hand,
  reserved = EXCLUDED.reserved,
  updated_at = NOW();

-- =============================================================================
-- Step 3: 验证插入结果
-- =============================================================================

-- 可选：返回插入的数据供 fixture 验证
SELECT
  sku_id,
  sku_name,
  on_hand,
  reserved,
  unit,
  store_id
FROM inventory
WHERE sku_id IN (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002'
)
ORDER BY sku_name;
