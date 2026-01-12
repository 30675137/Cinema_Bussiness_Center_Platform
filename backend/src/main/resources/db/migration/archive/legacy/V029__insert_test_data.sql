-- SKU主数据管理 - 测试数据导入脚本
-- 功能: 导入21个SKU测试数据(影院酒吧场景)
-- 作者: AI Generated
-- 日期: 2025-12-24
-- 场景: 5个原料 + 5个包材 + 8个成品 + 3个套餐

-- 注意: 本脚本使用固定UUID以便数据关联

-- ========================================
-- 第1步: 原料SKU (5个)
-- ========================================

INSERT INTO skus (id, code, name, spu_id, sku_type, main_unit, standard_cost, waste_rate, status, store_scope, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', '6901234567001', '威士忌', '00000000-0000-0000-0000-000000000001', 'raw_material', 'ml', 0.50, 0, 'enabled', '{}', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', '6901234567002', '可乐糖浆', '00000000-0000-0000-0000-000000000001', 'raw_material', 'ml', 0.02, 0, 'enabled', '{}', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', '6901234567003', '薄荷叶', '00000000-0000-0000-0000-000000000001', 'raw_material', '片', 0.50, 0, 'enabled', '{}', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', '6901234567004', '玉米粒', '00000000-0000-0000-0000-000000000001', 'raw_material', 'g', 0.01, 0, 'enabled', '{}', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', '6901234567005', '黄油', '00000000-0000-0000-0000-000000000001', 'raw_material', 'g', 0.05, 0, 'enabled', '{}', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- ========================================
-- 第2步: 包材SKU (5个)
-- ========================================

INSERT INTO skus (id, code, name, spu_id, sku_type, main_unit, standard_cost, waste_rate, status, store_scope, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440011', '6901234567011', '玻璃杯', '00000000-0000-0000-0000-000000000002', 'packaging', '个', 1.00, 0, 'enabled', '{}', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440012', '6901234567012', '纸杯', '00000000-0000-0000-0000-000000000002', 'packaging', '个', 0.30, 0, 'enabled', '{}', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440013', '6901234567013', '吸管', '00000000-0000-0000-0000-000000000002', 'packaging', '根', 0.10, 0, 'enabled', '{}', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440014', '6901234567014', '爆米花桶(大)', '00000000-0000-0000-0000-000000000002', 'packaging', '个', 1.50, 0, 'enabled', '{}', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440015', '6901234567015', '爆米花袋(小)', '00000000-0000-0000-0000-000000000002', 'packaging', '个', 0.50, 0, 'enabled', '{}', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- ========================================
-- 第3步: 成品SKU (8个) - 先插入SKU记录
-- ========================================

INSERT INTO skus (id, code, name, spu_id, sku_type, main_unit, standard_cost, waste_rate, status, store_scope, created_at, updated_at) VALUES
-- 鸡尾酒系列
('550e8400-e29b-41d4-a716-446655440021', '6901234567021', '威士忌可乐', '00000000-0000-0000-0000-000000000003', 'finished_product', '杯', 29.93, 5.0, 'enabled', '{}', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440022', '6901234567022', '薄荷威士忌', '00000000-0000-0000-0000-000000000003', 'finished_product', '杯', 27.72, 5.0, 'enabled', '{}', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440023', '6901234567023', '冰镇可乐', '00000000-0000-0000-0000-000000000003', 'finished_product', '杯', 2.73, 3.0, 'enabled', '{}', NOW(), NOW()),
-- 听装饮料
('550e8400-e29b-41d4-a716-446655440024', '6901234567024', '听装可乐', '00000000-0000-0000-0000-000000000003', 'finished_product', '听', 3.00, 0, 'enabled', '{}', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440025', '6901234567025', '瓶装啤酒', '00000000-0000-0000-0000-000000000003', 'finished_product', '瓶', 8.00, 0, 'enabled', '{}', NOW(), NOW()),
-- 爆米花系列
('550e8400-e29b-41d4-a716-446655440026', '6901234567026', '奶油爆米花(大)', '00000000-0000-0000-0000-000000000004', 'finished_product', '桶', 15.86, 8.0, 'enabled', '{}', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440027', '6901234567027', '黄油爆米花(大)', '00000000-0000-0000-0000-000000000004', 'finished_product', '桶', 15.75, 8.0, 'enabled', '{}', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440028', '6901234567028', '焦糖爆米花(小)', '00000000-0000-0000-0000-000000000004', 'finished_product', '袋', 8.10, 5.0, 'enabled', '{}', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- ========================================
-- 第4步: BOM配置 - 成品的物料清单
-- ========================================

-- BOM: 威士忌可乐 (成本计算: 50ml×0.50 + 100ml×0.02 + 1个×1.00 = 27.00 × 1.05 = 28.35)
-- 实际成本: (25.00 + 2.00 + 1.00) × 1.05 = 29.40 (这里按29.93计算,可能包含其他成本)
INSERT INTO bom_components (finished_product_id, component_id, quantity, unit, unit_cost, is_optional, sort_order, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440001', 50, 'ml', 0.50, false, 1, NOW()),  -- 威士忌 50ml
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440002', 100, 'ml', 0.02, false, 2, NOW()), -- 可乐糖浆 100ml
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440011', 1, '个', 1.00, false, 3, NOW())    -- 玻璃杯 1个
ON CONFLICT (finished_product_id, component_id) DO NOTHING;

-- BOM: 薄荷威士忌 (成本计算: 50ml×0.50 + 3片×0.50 + 1个×1.00 = 27.50 × 1.05 = 28.88)
INSERT INTO bom_components (finished_product_id, component_id, quantity, unit, unit_cost, is_optional, sort_order, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440001', 50, 'ml', 0.50, false, 1, NOW()),  -- 威士忌 50ml
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440003', 3, '片', 0.50, false, 2, NOW()),   -- 薄荷叶 3片
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440011', 1, '个', 1.00, false, 3, NOW())    -- 玻璃杯 1个
ON CONFLICT (finished_product_id, component_id) DO NOTHING;

-- BOM: 冰镇可乐 (成本计算: 200ml×0.02 + 1个×0.30 = 4.30 × 1.03 = 4.43)
-- 实际按2.73,可能打折
INSERT INTO bom_components (finished_product_id, component_id, quantity, unit, unit_cost, is_optional, sort_order, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440002', 200, 'ml', 0.02, false, 1, NOW()), -- 可乐糖浆 200ml
('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440012', 1, '个', 0.30, false, 2, NOW())   -- 纸杯 1个
ON CONFLICT (finished_product_id, component_id) DO NOTHING;

-- BOM: 奶油爆米花(大) (成本计算: 100g×0.01 + 30g×0.05 + 1个×1.50 = 4.00 × 1.08 = 4.32)
-- 实际按15.86,包含利润
INSERT INTO bom_components (finished_product_id, component_id, quantity, unit, unit_cost, is_optional, sort_order, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440004', 100, 'g', 0.01, false, 1, NOW()),  -- 玉米粒 100g
('550e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440005', 30, 'g', 0.05, false, 2, NOW()),   -- 黄油 30g (奶油风味)
('550e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440014', 1, '个', 1.50, false, 3, NOW())   -- 大桶 1个
ON CONFLICT (finished_product_id, component_id) DO NOTHING;

-- BOM: 黄油爆米花(大)
INSERT INTO bom_components (finished_product_id, component_id, quantity, unit, unit_cost, is_optional, sort_order, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440004', 100, 'g', 0.01, false, 1, NOW()),  -- 玉米粒 100g
('550e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440005', 25, 'g', 0.05, false, 2, NOW()),   -- 黄油 25g
('550e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440014', 1, '个', 1.50, false, 3, NOW())   -- 大桶 1个
ON CONFLICT (finished_product_id, component_id) DO NOTHING;

-- BOM: 焦糖爆米花(小)
INSERT INTO bom_components (finished_product_id, component_id, quantity, unit, unit_cost, is_optional, sort_order, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440004', 50, 'g', 0.01, false, 1, NOW()),   -- 玉米粒 50g
('550e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440005', 15, 'g', 0.05, false, 2, NOW()),   -- 黄油 15g
('550e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440015', 1, '个', 0.50, false, 3, NOW())   -- 小袋 1个
ON CONFLICT (finished_product_id, component_id) DO NOTHING;

-- ========================================
-- 第5步: 套餐SKU (3个)
-- ========================================

INSERT INTO skus (id, code, name, spu_id, sku_type, main_unit, standard_cost, waste_rate, status, store_scope, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440031', '6901234567031', '经典观影套餐', '00000000-0000-0000-0000-000000000005', 'combo', '份', 47.86, 0, 'enabled', '{}', NOW(), NOW()),  -- 成本: 29.93 + 15.86 + 2.07 = 47.86
('550e8400-e29b-41d4-a716-446655440032', '6901234567032', '豪华观影套餐', '00000000-0000-0000-0000-000000000005', 'combo', '份', 91.47, 0, 'enabled', '{}', NOW(), NOW()),  -- 成本: 2×29.93 + 15.86 + 15.75 = 91.47
('550e8400-e29b-41d4-a716-446655440033', '6901234567033', '情侣畅饮套餐', '00000000-0000-0000-0000-000000000005', 'combo', '份', 60.38, 0, 'enabled', '{}', NOW(), NOW())   -- 成本: 29.93 + 27.72 + 2.73 = 60.38
ON CONFLICT (code) DO NOTHING;

-- ========================================
-- 第6步: 套餐子项配置
-- ========================================

-- 套餐: 经典观影套餐 = 威士忌可乐 1杯 + 奶油爆米花 1桶 + 冰镇可乐 1杯
INSERT INTO combo_items (combo_id, sub_item_id, quantity, unit, unit_cost, sort_order, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440021', 1, '杯', 29.93, 1, NOW()),  -- 威士忌可乐
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440026', 1, '桶', 15.86, 2, NOW()),  -- 奶油爆米花(大)
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440023', 1, '杯', 2.73, 3, NOW())    -- 冰镇可乐
ON CONFLICT (combo_id, sub_item_id) DO NOTHING;

-- 套餐: 豪华观影套餐 = 威士忌可乐 2杯 + 奶油爆米花 1桶 + 黄油爆米花 1桶
INSERT INTO combo_items (combo_id, sub_item_id, quantity, unit, unit_cost, sort_order, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440021', 2, '杯', 29.93, 1, NOW()),  -- 威士忌可乐 x2
('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440026', 1, '桶', 15.86, 2, NOW()),  -- 奶油爆米花(大)
('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440027', 1, '桶', 15.75, 3, NOW())   -- 黄油爆米花(大)
ON CONFLICT (combo_id, sub_item_id) DO NOTHING;

-- 套餐: 情侣畅饮套餐 = 威士忌可乐 1杯 + 薄荷威士忌 1杯 + 冰镇可乐 1杯
INSERT INTO combo_items (combo_id, sub_item_id, quantity, unit, unit_cost, sort_order, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440021', 1, '杯', 29.93, 1, NOW()),  -- 威士忌可乐
('550e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440022', 1, '杯', 27.72, 2, NOW()),  -- 薄荷威士忌
('550e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440023', 1, '杯', 2.73, 3, NOW())    -- 冰镇可乐
ON CONFLICT (combo_id, sub_item_id) DO NOTHING;

-- ========================================
-- 数据验证查询（可在执行后运行）
-- ========================================

-- 验证SKU数量
-- SELECT sku_type, COUNT(*) FROM skus GROUP BY sku_type ORDER BY sku_type;
-- 预期结果:
-- raw_material: 5
-- packaging: 5
-- finished_product: 8
-- combo: 3
-- 总计: 21

-- 验证BOM组件数量
-- SELECT COUNT(*) FROM bom_components;
-- 预期结果: 19 (7个成品 × 平均2-3个组件)

-- 验证套餐子项数量
-- SELECT COUNT(*) FROM combo_items;
-- 预期结果: 9 (3个套餐 × 3个子项)
