-- =====================================================
-- V002__seed_data.sql
-- 初始化数据（Baseline Seed Data）
-- 生成时间: 2026-01-11
-- =====================================================

-- 关闭外键检查以允许批量插入
SET session_replication_role = replica;

-- =====================================================
-- 1. 计量单位 (units)
-- =====================================================
INSERT INTO units (id, code, name, category, decimal_places, is_base_unit, description, created_at, updated_at) VALUES
('1a8fe40f-623a-48c2-a115-120590859ead', 'g', '克', 'WEIGHT', 2, true, '重量基础单位', NOW(), NOW()),
('4e9e15f8-453d-4564-9861-e700a93e3142', 'kg', '千克', 'WEIGHT', 3, false, '1kg = 1000g', NOW(), NOW()),
('026d0734-5b3b-4b1c-a99f-045190b7e4f5', '袋', '袋', 'WEIGHT', 0, false, '重量单位，具体重量由物料定义', NOW(), NOW()),
('4d2acae5-f03d-49da-8fd4-5b5e1f0b24cb', 'ml', '毫升', 'VOLUME', 2, true, '体积基础单位', NOW(), NOW()),
('1607c62a-de41-49b7-af31-81a22ae95970', 'L', '升', 'VOLUME', 2, false, '1L = 1000ml', NOW(), NOW()),
('b513686e-6564-4599-b53a-45a995a02a0d', '杯', '杯', 'VOLUME', 0, false, '容量单位，具体容量由物料定义', NOW(), NOW()),
('fa9008a8-a241-4e60-a785-fd66a28ae82a', '瓶', '瓶', 'VOLUME', 0, false, '容量单位，具体容量由物料定义', NOW(), NOW()),
('ea6f3451-bec9-424f-bed3-c4ac7a55dbd3', '个', '个', 'COUNT', 0, true, '计数基础单位', NOW(), NOW()),
('10d8732f-9706-4e21-a48c-5dab6131a31e', '箱', '箱', 'COUNT', 0, false, '包装单位，具体数量由物料定义', NOW(), NOW()),
('acc7cdcd-4e39-4ee5-857c-eff2cc318c2e', '盒', '盒', 'COUNT', 0, false, '包装单位', NOW(), NOW()),
('9930ba6c-922b-4dfa-ad95-b7175bc78970', '份', '片', 'COUNT', 2, false, '份量单位', NOW(), NOW()),
('9c8ceb2f-b1c4-4b1b-998b-9f4dafeac887', 'p', '片', 'COUNT', 2, false, NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. 单位换算规则 (unit_conversions)
-- =====================================================
INSERT INTO unit_conversions (id, from_unit, to_unit, conversion_rate, category) VALUES
-- 重量换算
('1b798092-d604-412e-8bbb-91ad2f487f91', 'kg', 'g', 1000.000000, 'weight'),
('9bef79bd-20e3-4eaf-aeb7-8a226c32ba8f', 'g', 'kg', 0.001000, 'weight'),
('2599778b-f0f4-411c-8f44-bf35537d8f98', 'g', '克', 1.000000, 'weight'),
('321cfdad-8888-4572-a340-030f7648654a', '克', 'g', 1.000000, 'weight'),
('2eba0c67-645c-43bb-8320-e7fba8343026', 'kg', '千克', 1.000000, 'weight'),
('bb5a4f12-bcd2-4abe-8988-ea84d4b68790', '千克', 'kg', 1.000000, 'weight'),
('a46f4ce5-c66a-4765-ab59-3c95fa82ef4a', 'g', '千克', 0.001000, 'weight'),
('c436e43d-534a-4d5a-aba4-d45fd11433e7', '千克', 'g', 1000.000000, 'weight'),
-- 体积换算
('66761653-122b-44bc-9db2-009caab7d8a4', 'l', 'ml', 1000.000000, 'volume'),
('46b4af8a-9ad1-4121-b672-86e743f797cb', 'ml', 'l', 0.001000, 'volume'),
('2c01fe26-fe58-4c72-8baf-f443b0664fb5', '升', 'l', 1.000000, 'volume'),
('40e63888-0bc0-48ac-b75d-858cabdf4c92', 'l', '升', 1.000000, 'volume'),
('7e07f49d-8014-4ca8-a868-abc6f6ef71ed', '升', 'ml', 1000.000000, 'volume'),
('696ef5ab-b42b-4725-82cc-2b8431e71b7b', 'ml', '升', 0.001000, 'volume'),
('d0f11769-10db-4aa0-94e2-b6ad13b0e0b4', '瓶', 'ml', 500.000000, 'volume'),
-- 数量换算
('17b91919-ecef-4a29-849e-34bce6b936ac', '箱', '瓶', 12.000000, 'quantity'),
('f376fe0f-0a9d-4195-abdd-dac524fd5346', '瓶', '箱', 0.083333, 'quantity'),
('50c9dd22-ecb5-40dc-8dd3-48f3ed88c079', '打', '个', 12.000000, 'quantity'),
('1fecc759-1c57-4827-ae49-ea0f51ed2109', '个', '打', 0.083333, 'quantity'),
('62b30f55-a08d-4079-9f94-e3884e15cf94', '个', '件', 1.000000, 'quantity'),
('fa0d1a84-43f8-4e3b-934a-3f2a0d3093dc', '件', '个', 1.000000, 'quantity'),
('30728401-5c64-4146-a20a-6dcc9cca813a', '个', '杯', 1.000000, 'quantity'),
('528a54ae-2a86-4a13-92ad-ef87ad2538ed', '杯', '个', 1.000000, 'quantity'),
('4a16579f-d598-4067-85be-b8ab2a8f16a0', '个', '桶', 1.000000, 'quantity'),
('cdd110e0-75d0-4b6e-b40f-607dc9110d6c', '桶', '个', 1.000000, 'quantity'),
('105a836e-4d23-4fbe-a9e4-a5a5992984f8', '包', '片', 10.000000, 'quantity'),
('8b46ed02-6fa6-4cc2-a7e5-c910b50423a6', '片', '包', 0.100000, 'quantity'),
('686fddf3-4ad8-4195-924b-cbbb0516fdbe', '包', '根', 10.000000, 'quantity'),
('6961e383-08e0-428a-a9ba-f5a96a983f80', '根', '包', 0.100000, 'quantity')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. 调整原因 (adjustment_reasons)
-- =====================================================
INSERT INTO adjustment_reasons (id, code, name, category, is_active, sort_order, created_at, updated_at) VALUES
('ac7eb694-47b0-4a95-8d0b-c42db9bfae42', 'STOCK_DIFF', '盘点差异', 'surplus', true, 1, NOW(), NOW()),
('834a232c-4512-40cc-af62-108e292bd3b3', 'STOCK_DIFF_SHORTAGE', '盘点差异', 'shortage', true, 2, NOW(), NOW()),
('f3821450-af05-4033-a153-4ea38dc2c8b1', 'GOODS_DAMAGE', '货物损坏', 'damage', true, 3, NOW(), NOW()),
('f288d955-af28-4d2e-8df1-6ff23f585a8c', 'EXPIRED_WRITE_OFF', '过期报废', 'damage', true, 4, NOW(), NOW()),
('91464c53-f077-4551-8c00-6ad2c7d035e5', 'INBOUND_ERROR', '入库错误', 'shortage', true, 5, NOW(), NOW()),
('5d343f4d-5e6f-4068-8b5d-4dbea1baec59', 'OTHER_SURPLUS', '其他(盘盈)', 'surplus', true, 6, NOW(), NOW()),
('2c690b6d-a31c-49cf-b712-ed3e5afaea3e', 'OTHER_SHORTAGE', '其他(盘亏)', 'shortage', true, 7, NOW(), NOW()),
('82409fcb-e21e-4f04-9a2b-3abd77ded4f4', 'OTHER_DAMAGE', '其他(报损)', 'damage', true, 8, NOW(), NOW()),
('a143771f-c43c-452f-843b-9fb98d499067', 'SHORTAGE_SALE', '销售损耗', 'shortage', true, 9, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 4. 菜单分类 (menu_category)
-- =====================================================
INSERT INTO menu_category (id, code, display_name, sort_order, is_visible, is_default, icon_url, description, created_at, updated_at, version) VALUES
('ca6c4f0b-eb49-4c21-b6d3-7f8893a942b7', 'ALCOHOL', '经典特调', 1, true, false, NULL, NULL, NOW(), NOW(), 0),
('7dd4a9d2-544d-4648-b901-a1e797e62075', 'COCKTAIL', '特调饮品', 2, true, false, NULL, NULL, NOW(), NOW(), 0),
('fe36efc2-e7a0-418a-9c33-0003c7db7eea', 'COFFEE', '精品咖啡', 2, true, false, NULL, NULL, NOW(), NOW(), 0),
('fd02eba4-28f3-4db9-b944-c2e4421f493d', 'BEVERAGE', '经典饮品', 3, true, false, NULL, NULL, NOW(), NOW(), 0),
('8b260301-d5cb-4446-80a3-2a0bcbb10f28', 'COMBO', '套餐', 3, true, false, NULL, '组合套餐，包含多种商品', NOW(), NOW(), 0),
('c8d06d45-752d-4c42-aeca-c1276408a2de', 'POPCORN', '爆米花', 4, true, false, NULL, '各种口味爆米花', NOW(), NOW(), 0),
('8ebd798c-f90e-4498-974f-d6bb0a8dc6e4', 'SNACK', '主厨小食', 4, true, false, NULL, NULL, NOW(), NOW(), 0),
('148c9b75-ca17-476e-8e78-d52416da0dbf', 'DESSERT', '甜点蛋糕', 5, true, false, NULL, NULL, NOW(), NOW(), 0),
('516e7766-862a-4060-a13b-99b3c98f6631', 'MEAL', '精品餐食', 5, false, false, NULL, NULL, NOW(), NOW(), 0),
('4c781206-054c-4df9-9b52-ea1b6a992c4f', 'OTHER', '其他商品', 99, true, true, NULL, NULL, NOW(), NOW(), 0)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 5. 商品分类 (categories)
-- =====================================================
INSERT INTO categories (id, code, name, parent_id, level, sort_order, status, created_at, updated_at) VALUES
-- 一级分类
('11111111-1111-1111-1111-111111111111', 'CAT001', '酒水饮料', NULL, 1, 1, 'ACTIVE', NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', 'CAT002', '零食小吃', NULL, 1, 2, 'ACTIVE', NOW(), NOW()),
('33333333-3333-3333-3333-333333333333', 'CAT003', '餐饮正餐', NULL, 1, 3, 'ACTIVE', NOW(), NOW()),
('e285cb44-6d0e-4b5a-8025-47f48c2f3b13', 'UTENSILS', '餐饮器具', NULL, 1, 10, 'ACTIVE', NOW(), NOW()),
-- 二级分类
('11111111-1111-1111-1111-111111111112', 'CAT001-01', '威士忌', '11111111-1111-1111-1111-111111111111', 2, 1, 'ACTIVE', NOW(), NOW()),
('11111111-1111-1111-1111-111111111113', 'CAT001-02', '啤酒', '11111111-1111-1111-1111-111111111111', 2, 2, 'ACTIVE', NOW(), NOW()),
('11111111-1111-1111-1111-111111111114', 'CAT001-03', '软饮料', '11111111-1111-1111-1111-111111111111', 2, 3, 'ACTIVE', NOW(), NOW()),
('e2638d39-3045-4c49-a555-5c406955ca3e', 'CAT001-04', '鸡尾酒/特调', '11111111-1111-1111-1111-111111111111', 2, 4, 'ACTIVE', NOW(), NOW()),
('22222222-2222-2222-2222-222222222223', 'CAT002-01', '薯片', '22222222-2222-2222-2222-222222222222', 2, 1, 'ACTIVE', NOW(), NOW()),
('22222222-2222-2222-2222-222222222224', 'CAT002-02', '坚果', '22222222-2222-2222-2222-222222222222', 2, 2, 'ACTIVE', NOW(), NOW()),
('fa956d8d-2abb-464a-ab18-ea3f279a26f2', 'GLASSWARE', '玻璃器皿', 'e285cb44-6d0e-4b5a-8025-47f48c2f3b13', 2, 1, 'ACTIVE', NOW(), NOW()),
-- 三级分类
('4c2070e2-c7b8-4038-a0f3-3ab4a1a09449', 'STEMWARE', '高脚杯', 'fa956d8d-2abb-464a-ab18-ea3f279a26f2', 3, 1, 'ACTIVE', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 6. 品牌 (brands)
-- =====================================================
INSERT INTO brands (id, brand_code, name, english_name, brand_type, primary_categories, company, brand_level, tags, description, logo_url, status, created_at, updated_at, created_by, updated_by) VALUES
('4958024c-c975-4520-979a-d6b4566d8298', 'DEFAULT', '默认品牌', 'Default Brand', 'own', '{"通用"}', '系统默认', 'C', '{"系统"}', '系统默认品牌', NULL, 'enabled', NOW(), NOW(), 'system', 'system'),
('5aa03458-c51d-46d9-a687-0ffd6e327204', 'BRAND001', '耀莱影院', 'Yaolai Cinema', 'own', '{"影院","娱乐"}', '耀莱文化', 'A', '{"自营","高端"}', '耀莱集团旗下高端影院品牌', NULL, 'enabled', NOW(), NOW(), 'system', 'system'),
('84a61e22-f8d9-40a3-9e0a-a74964881463', 'BRAND002', '可口可乐', 'Coca-Cola', 'agency', '{"饮料","碳酸饮品"}', '可口可乐公司', 'A', '{"代理","饮料"}', '全球知名饮料品牌', NULL, 'enabled', NOW(), NOW(), 'system', 'system'),
('176257a9-7bc1-4215-9f3c-5bb1f6f795d8', 'BRAND003', '百事可乐', 'Pepsi', 'agency', '{"饮料","碳酸饮品"}', '百事公司', 'A', '{"代理","饮料"}', '全球知名饮料品牌', NULL, 'enabled', NOW(), NOW(), 'system', 'system'),
('017b1dcd-8794-4e21-83d4-0790513b91ba', 'BRAND004', '自制爆米花', 'Homemade Popcorn', 'own', '{"零食","爆米花"}', '耀莱影院', 'B', '{"自营","零食"}', '影院自制特色爆米花', NULL, 'enabled', NOW(), NOW(), 'system', 'system'),
('9b9e718d-01a3-4c24-9b9a-2dd03a16a5c0', 'BRAND005', '星巴克', 'Starbucks', 'joint', '{"咖啡","饮品"}', '星巴克中国', 'A', '{"联营","咖啡"}', '全球知名咖啡连锁品牌', NULL, 'enabled', NOW(), NOW(), 'system', 'system'),
('7a5c0a34-8d53-45cd-b9b8-a0d706b4f982', 'BRAND006', '利比', 'Libbey', 'agency', '{"玻璃器皿","餐饮器具"}', '利比公司', 'A', '{"代理","玻璃器皿"}', '美国知名玻璃器皿品牌，创立于1818年', NULL, 'enabled', NOW(), NOW(), 'system', 'system'),
('802951b4-66e3-4a58-902d-d857256f5146', 'BRAND007', '芝华士', 'Chivas', 'agency', '{"酒水"}', NULL, NULL, '{}', '苏格兰威士忌品牌，创立于1801年', NULL, 'enabled', NOW(), NOW(), 'system', 'system'),
('6df3b9d0-f8d3-48e9-add1-1270b7dba9f5', 'BRAND008', '三得利', 'Suntory', 'agency', '{"酒水"}', '三得利', 'A', '{"日本"}', NULL, NULL, 'enabled', NOW(), NOW(), 'system', 'system')
ON CONFLICT (id) DO NOTHING;

-- 恢复外键检查
SET session_replication_role = DEFAULT;

-- =====================================================
-- 完成
-- =====================================================
