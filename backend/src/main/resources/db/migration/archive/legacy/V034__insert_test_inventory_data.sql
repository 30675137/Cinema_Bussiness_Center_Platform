-- ============================================================
-- Migration: V034__insert_test_inventory_data.sql
-- Description: 为门店库存查询功能插入测试数据
-- Author: AI Generated
-- Date: 2025-12-26
-- 依赖: V024_001 (stores), V029 (skus), V033 (store_inventory, categories)
-- ============================================================

-- ============================================================
-- 第1步: 更新SKU的category_id关联
-- ============================================================

-- 将酒水类SKU关联到"酒水饮料"分类
UPDATE skus SET category_id = '11111111-1111-1111-1111-111111111111'
WHERE code IN ('6901234567001', '6901234567002', '6901234567003',
               '6901234567021', '6901234567022', '6901234567023',
               '6901234567024', '6901234567025');

-- 将零食类SKU关联到"零食小吃"分类
UPDATE skus SET category_id = '22222222-2222-2222-2222-222222222222'
WHERE code IN ('6901234567026', '6901234567027', '6901234567028');

-- 将包材类SKU关联到"酒水饮料-软饮料"子分类 (临时归类)
UPDATE skus SET category_id = '11111111-1111-1111-1111-111111111114'
WHERE code IN ('6901234567011', '6901234567012', '6901234567013',
               '6901234567014', '6901234567015');

-- ============================================================
-- 第2步: 为北京五棵松店插入库存数据 (模拟旗舰店库存充足)
-- ============================================================

-- 获取五棵松店ID并插入库存数据
INSERT INTO store_inventory (store_id, sku_id, on_hand_qty, available_qty, reserved_qty, safety_stock)
SELECT
    s.id as store_id,
    k.id as sku_id,
    CASE
        -- 成品库存较高
        WHEN k.sku_type = 'finished_product' THEN FLOOR(RANDOM() * 200 + 100)::decimal
        -- 原料库存更高
        WHEN k.sku_type = 'raw_material' THEN FLOOR(RANDOM() * 5000 + 2000)::decimal
        -- 包材库存最高
        WHEN k.sku_type = 'packaging' THEN FLOOR(RANDOM() * 1000 + 500)::decimal
        ELSE 100
    END as on_hand_qty,
    CASE
        WHEN k.sku_type = 'finished_product' THEN FLOOR(RANDOM() * 180 + 80)::decimal
        WHEN k.sku_type = 'raw_material' THEN FLOOR(RANDOM() * 4500 + 1800)::decimal
        WHEN k.sku_type = 'packaging' THEN FLOOR(RANDOM() * 900 + 450)::decimal
        ELSE 90
    END as available_qty,
    CASE
        WHEN k.sku_type = 'finished_product' THEN FLOOR(RANDOM() * 20 + 5)::decimal
        WHEN k.sku_type = 'raw_material' THEN FLOOR(RANDOM() * 200 + 50)::decimal
        WHEN k.sku_type = 'packaging' THEN FLOOR(RANDOM() * 50 + 10)::decimal
        ELSE 10
    END as reserved_qty,
    CASE
        WHEN k.sku_type = 'finished_product' THEN 50
        WHEN k.sku_type = 'raw_material' THEN 1000
        WHEN k.sku_type = 'packaging' THEN 200
        ELSE 30
    END as safety_stock
FROM stores s
CROSS JOIN skus k
WHERE s.code = 'STORE-YLCL-WKS'
AND k.sku_type IN ('finished_product', 'raw_material', 'packaging')
ON CONFLICT (store_id, sku_id) DO UPDATE SET
    on_hand_qty = EXCLUDED.on_hand_qty,
    available_qty = EXCLUDED.available_qty,
    reserved_qty = EXCLUDED.reserved_qty,
    safety_stock = EXCLUDED.safety_stock,
    updated_at = NOW();

-- ============================================================
-- 第3步: 为北京慈云寺店插入库存数据 (模拟普通门店，部分商品库存偏低)
-- ============================================================

INSERT INTO store_inventory (store_id, sku_id, on_hand_qty, available_qty, reserved_qty, safety_stock)
SELECT
    s.id as store_id,
    k.id as sku_id,
    CASE
        WHEN k.sku_type = 'finished_product' THEN FLOOR(RANDOM() * 50 + 20)::decimal
        WHEN k.sku_type = 'raw_material' THEN FLOOR(RANDOM() * 1000 + 300)::decimal
        WHEN k.sku_type = 'packaging' THEN FLOOR(RANDOM() * 300 + 100)::decimal
        ELSE 30
    END as on_hand_qty,
    CASE
        -- 部分商品可用库存较低
        WHEN k.sku_type = 'finished_product' THEN FLOOR(RANDOM() * 40 + 15)::decimal
        WHEN k.sku_type = 'raw_material' THEN FLOOR(RANDOM() * 800 + 200)::decimal
        WHEN k.sku_type = 'packaging' THEN FLOOR(RANDOM() * 250 + 80)::decimal
        ELSE 25
    END as available_qty,
    CASE
        WHEN k.sku_type = 'finished_product' THEN FLOOR(RANDOM() * 10 + 2)::decimal
        WHEN k.sku_type = 'raw_material' THEN FLOOR(RANDOM() * 100 + 20)::decimal
        WHEN k.sku_type = 'packaging' THEN FLOOR(RANDOM() * 30 + 5)::decimal
        ELSE 5
    END as reserved_qty,
    CASE
        WHEN k.sku_type = 'finished_product' THEN 50
        WHEN k.sku_type = 'raw_material' THEN 1000
        WHEN k.sku_type = 'packaging' THEN 200
        ELSE 30
    END as safety_stock
FROM stores s
CROSS JOIN skus k
WHERE s.code = 'STORE-YLCL-CYS'
AND k.sku_type IN ('finished_product', 'raw_material', 'packaging')
ON CONFLICT (store_id, sku_id) DO UPDATE SET
    on_hand_qty = EXCLUDED.on_hand_qty,
    available_qty = EXCLUDED.available_qty,
    reserved_qty = EXCLUDED.reserved_qty,
    safety_stock = EXCLUDED.safety_stock,
    updated_at = NOW();

-- ============================================================
-- 第4步: 为房山天街店插入库存数据 (模拟部分缺货场景)
-- ============================================================

INSERT INTO store_inventory (store_id, sku_id, on_hand_qty, available_qty, reserved_qty, safety_stock)
SELECT
    s.id as store_id,
    k.id as sku_id,
    CASE
        -- 部分成品缺货
        WHEN k.code = '6901234567024' THEN 0  -- 听装可乐缺货
        WHEN k.code = '6901234567028' THEN 5  -- 焦糖爆米花(小) 库存不足
        WHEN k.sku_type = 'finished_product' THEN FLOOR(RANDOM() * 30 + 10)::decimal
        WHEN k.sku_type = 'raw_material' THEN FLOOR(RANDOM() * 500 + 100)::decimal
        WHEN k.sku_type = 'packaging' THEN FLOOR(RANDOM() * 150 + 50)::decimal
        ELSE 20
    END as on_hand_qty,
    CASE
        WHEN k.code = '6901234567024' THEN 0  -- 缺货
        WHEN k.code = '6901234567028' THEN 3  -- 可用很少
        WHEN k.sku_type = 'finished_product' THEN FLOOR(RANDOM() * 25 + 8)::decimal
        WHEN k.sku_type = 'raw_material' THEN FLOOR(RANDOM() * 400 + 80)::decimal
        WHEN k.sku_type = 'packaging' THEN FLOOR(RANDOM() * 120 + 40)::decimal
        ELSE 18
    END as available_qty,
    CASE
        WHEN k.code IN ('6901234567024', '6901234567028') THEN 2
        WHEN k.sku_type = 'finished_product' THEN FLOOR(RANDOM() * 5 + 1)::decimal
        WHEN k.sku_type = 'raw_material' THEN FLOOR(RANDOM() * 50 + 10)::decimal
        WHEN k.sku_type = 'packaging' THEN FLOOR(RANDOM() * 20 + 3)::decimal
        ELSE 2
    END as reserved_qty,
    CASE
        WHEN k.sku_type = 'finished_product' THEN 50
        WHEN k.sku_type = 'raw_material' THEN 1000
        WHEN k.sku_type = 'packaging' THEN 200
        ELSE 30
    END as safety_stock
FROM stores s
CROSS JOIN skus k
WHERE s.code = 'STORE-YLCL-FSTJ'
AND k.sku_type IN ('finished_product', 'raw_material', 'packaging')
ON CONFLICT (store_id, sku_id) DO UPDATE SET
    on_hand_qty = EXCLUDED.on_hand_qty,
    available_qty = EXCLUDED.available_qty,
    reserved_qty = EXCLUDED.reserved_qty,
    safety_stock = EXCLUDED.safety_stock,
    updated_at = NOW();

-- ============================================================
-- 第5步: 为广州正佳店插入库存数据 (模拟库存充足)
-- ============================================================

INSERT INTO store_inventory (store_id, sku_id, on_hand_qty, available_qty, reserved_qty, safety_stock)
SELECT
    s.id as store_id,
    k.id as sku_id,
    CASE
        WHEN k.sku_type = 'finished_product' THEN FLOOR(RANDOM() * 150 + 80)::decimal
        WHEN k.sku_type = 'raw_material' THEN FLOOR(RANDOM() * 4000 + 1500)::decimal
        WHEN k.sku_type = 'packaging' THEN FLOOR(RANDOM() * 800 + 400)::decimal
        ELSE 80
    END as on_hand_qty,
    CASE
        WHEN k.sku_type = 'finished_product' THEN FLOOR(RANDOM() * 140 + 70)::decimal
        WHEN k.sku_type = 'raw_material' THEN FLOOR(RANDOM() * 3800 + 1400)::decimal
        WHEN k.sku_type = 'packaging' THEN FLOOR(RANDOM() * 750 + 380)::decimal
        ELSE 75
    END as available_qty,
    CASE
        WHEN k.sku_type = 'finished_product' THEN FLOOR(RANDOM() * 15 + 3)::decimal
        WHEN k.sku_type = 'raw_material' THEN FLOOR(RANDOM() * 150 + 30)::decimal
        WHEN k.sku_type = 'packaging' THEN FLOOR(RANDOM() * 40 + 8)::decimal
        ELSE 5
    END as reserved_qty,
    CASE
        WHEN k.sku_type = 'finished_product' THEN 50
        WHEN k.sku_type = 'raw_material' THEN 1000
        WHEN k.sku_type = 'packaging' THEN 200
        ELSE 30
    END as safety_stock
FROM stores s
CROSS JOIN skus k
WHERE s.code = 'STORE-YLCL-GZZC'
AND k.sku_type IN ('finished_product', 'raw_material', 'packaging')
ON CONFLICT (store_id, sku_id) DO UPDATE SET
    on_hand_qty = EXCLUDED.on_hand_qty,
    available_qty = EXCLUDED.available_qty,
    reserved_qty = EXCLUDED.reserved_qty,
    safety_stock = EXCLUDED.safety_stock,
    updated_at = NOW();

-- ============================================================
-- 第6步: 为成都西锦店插入库存数据 (模拟库存偏低)
-- ============================================================

INSERT INTO store_inventory (store_id, sku_id, on_hand_qty, available_qty, reserved_qty, safety_stock)
SELECT
    s.id as store_id,
    k.id as sku_id,
    CASE
        WHEN k.sku_type = 'finished_product' THEN FLOOR(RANDOM() * 40 + 15)::decimal
        WHEN k.sku_type = 'raw_material' THEN FLOOR(RANDOM() * 800 + 200)::decimal
        WHEN k.sku_type = 'packaging' THEN FLOOR(RANDOM() * 200 + 80)::decimal
        ELSE 25
    END as on_hand_qty,
    CASE
        WHEN k.sku_type = 'finished_product' THEN FLOOR(RANDOM() * 35 + 12)::decimal
        WHEN k.sku_type = 'raw_material' THEN FLOOR(RANDOM() * 700 + 150)::decimal
        WHEN k.sku_type = 'packaging' THEN FLOOR(RANDOM() * 180 + 70)::decimal
        ELSE 22
    END as available_qty,
    CASE
        WHEN k.sku_type = 'finished_product' THEN FLOOR(RANDOM() * 8 + 2)::decimal
        WHEN k.sku_type = 'raw_material' THEN FLOOR(RANDOM() * 80 + 15)::decimal
        WHEN k.sku_type = 'packaging' THEN FLOOR(RANDOM() * 25 + 5)::decimal
        ELSE 3
    END as reserved_qty,
    CASE
        WHEN k.sku_type = 'finished_product' THEN 50
        WHEN k.sku_type = 'raw_material' THEN 1000
        WHEN k.sku_type = 'packaging' THEN 200
        ELSE 30
    END as safety_stock
FROM stores s
CROSS JOIN skus k
WHERE s.code = 'STORE-YLCL-CDXJ'
AND k.sku_type IN ('finished_product', 'raw_material', 'packaging')
ON CONFLICT (store_id, sku_id) DO UPDATE SET
    on_hand_qty = EXCLUDED.on_hand_qty,
    available_qty = EXCLUDED.available_qty,
    reserved_qty = EXCLUDED.reserved_qty,
    safety_stock = EXCLUDED.safety_stock,
    updated_at = NOW();

-- ============================================================
-- 验证数据
-- ============================================================
-- SELECT
--     st.name as store_name,
--     COUNT(*) as sku_count,
--     SUM(CASE WHEN calculate_inventory_status(si.available_qty, si.safety_stock) = 'OUT_OF_STOCK' THEN 1 ELSE 0 END) as out_of_stock,
--     SUM(CASE WHEN calculate_inventory_status(si.available_qty, si.safety_stock) = 'LOW' THEN 1 ELSE 0 END) as low,
--     SUM(CASE WHEN calculate_inventory_status(si.available_qty, si.safety_stock) = 'BELOW_THRESHOLD' THEN 1 ELSE 0 END) as below_threshold,
--     SUM(CASE WHEN calculate_inventory_status(si.available_qty, si.safety_stock) = 'NORMAL' THEN 1 ELSE 0 END) as normal,
--     SUM(CASE WHEN calculate_inventory_status(si.available_qty, si.safety_stock) = 'SUFFICIENT' THEN 1 ELSE 0 END) as sufficient
-- FROM store_inventory si
-- JOIN stores st ON si.store_id = st.id
-- GROUP BY st.name;
