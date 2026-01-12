-- ============================================================================
-- 测试数据插入脚本
-- ============================================================================

-- 1. 插入测试门店数据
INSERT INTO stores (id, code, name, region, status) VALUES
    ('11111111-1111-1111-1111-111111111111', 'STORE-001', '北京朝阳店', '北京', 'active'),
    ('22222222-2222-2222-2222-222222222222', 'STORE-002', '上海浦东店', '上海', 'active'),
    ('33333333-3333-3333-3333-333333333333', 'STORE-003', '深圳南山店', '深圳', 'inactive')
ON CONFLICT (code) DO NOTHING;

-- 2. 插入测试影厅数据（北京朝阳店）
INSERT INTO halls (store_id, code, name, type, capacity, tags, status) VALUES
    ('11111111-1111-1111-1111-111111111111', 'HALL-A01', 'VIP豪华厅A', 'VIP', 80, ARRAY['真皮沙发', '4K投影', '杜比音响'], 'active'),
    ('11111111-1111-1111-1111-111111111111', 'HALL-B01', '情侣专属厅B', 'CP', 40, ARRAY['双人沙发', '玫瑰装饰'], 'active'),
    ('11111111-1111-1111-1111-111111111111', 'HALL-C01', '派对狂欢厅C', 'PARTY', 60, ARRAY['KTV设备', '酒吧台', '彩灯'], 'active'),
    ('11111111-1111-1111-1111-111111111111', 'HALL-D01', '普通观影厅D', 'PUBLIC', 150, ARRAY['标准座椅'], 'active')
ON CONFLICT (store_id, code) DO NOTHING;

-- 3. 插入测试影厅数据（上海浦东店）
INSERT INTO halls (store_id, code, name, type, capacity, tags, status) VALUES
    ('22222222-2222-2222-2222-222222222222', 'HALL-A01', 'VIP至尊厅', 'VIP', 100, ARRAY['按摩座椅', 'IMAX屏幕'], 'active'),
    ('22222222-2222-2222-2222-222222222222', 'HALL-B01', '普通厅B', 'PUBLIC', 200, ARRAY['标准座椅'], 'active'),
    ('22222222-2222-2222-2222-222222222222', 'HALL-C01', '维护中厅C', 'PUBLIC', 180, ARRAY[]::TEXT[], 'maintenance')
ON CONFLICT (store_id, code) DO NOTHING;

-- 4. 插入测试影厅数据（深圳南山店 - 已停业）
INSERT INTO halls (store_id, code, name, type, capacity, tags, status) VALUES
    ('33333333-3333-3333-3333-333333333333', 'HALL-A01', '停业影厅A', 'PUBLIC', 120, ARRAY[]::TEXT[], 'inactive')
ON CONFLICT (store_id, code) DO NOTHING;


INSERT INTO "public"."materials" ("id", "code", "name", "category", "inventory_unit_id", "purchase_unit_id", "conversion_rate", "use_global_conversion", "specification", "description", "status", "created_at", "updated_at", "created_by", "updated_by", "standard_cost") VALUES ('59a703da-bb33-4a1c-9d55-61dd0ada49ed', 'MAT-RAW-010', '可乐糖浆', 'RAW_MATERIAL', '4d2acae5-f03d-49da-8fd4-5b5e1f0b24cb', 'fa9008a8-a241-4e60-a785-fd66a28ae82a', '500.000000', 'false', null, null, 'ACTIVE', '2026-01-11 09:48:09.372788+00', '2026-01-11 13:49:12.996683+00', null, null, '0.60'), ('75b8c47d-4295-463d-8e29-eeefe342a864', 'MAT-RAW-020', '苏打水', 'RAW_MATERIAL', '4d2acae5-f03d-49da-8fd4-5b5e1f0b24cb', 'fa9008a8-a241-4e60-a785-fd66a28ae82a', '500.000000', 'false', null, null, 'ACTIVE', '2026-01-11 13:21:31.9598+00', '2026-01-11 13:49:48.12824+00', null, null, '0.10'), ('7d256f75-f681-41f6-8973-12f134798469', 'MAT-RAW-017', '青柠', 'RAW_MATERIAL', '9930ba6c-922b-4dfa-ad95-b7175bc78970', '026d0734-5b3b-4b1c-a99f-045190b7e4f5', '100.000000', 'false', '100片/袋', null, 'ACTIVE', '2026-01-11 13:55:19.686192+00', '2026-01-11 13:55:19.686204+00', null, null, '0.50'), ('bb700b02-81e5-49ed-a6b3-4a5fc91a1c24', 'MAT-RAW-016', '朗姆酒', 'RAW_MATERIAL', '4d2acae5-f03d-49da-8fd4-5b5e1f0b24cb', 'fa9008a8-a241-4e60-a785-fd66a28ae82a', '500.000000', 'false', '500ml /瓶', null, 'ACTIVE', '2026-01-11 13:54:23.304364+00', '2026-01-11 14:01:10.265638+00', null, null, '0.10'), ('d2d487e5-a0ab-494c-b84c-cc947d634656', 'MAT-RAW-015', '薄荷叶', 'RAW_MATERIAL', '9930ba6c-922b-4dfa-ad95-b7175bc78970', '10d8732f-9706-4e21-a48c-5dab6131a31e', '120.000000', 'false', null, null, 'ACTIVE', '2026-01-11 13:13:35.768013+00', '2026-01-11 14:00:19.02039+00', null, null, '0.10'), ('ef0b549a-36f6-46cb-bc95-0ab410ddca4b', 'MAT-RAW-018', '白砂糖', 'RAW_MATERIAL', '1a8fe40f-623a-48c2-a115-120590859ead', '026d0734-5b3b-4b1c-a99f-045190b7e4f5', '1000.000000', 'false', '1000克/袋', null, 'ACTIVE', '2026-01-11 13:56:02.918036+00', '2026-01-11 13:56:02.918046+00', null, null, '0.30');
-- ============================================================================
-- 验证数据
-- ============================================================================

-- 查询门店数量
SELECT '门店总数' as label, COUNT(*) as count FROM stores;

-- 查询影厅数量（按状态分组）
SELECT 
    '影厅数量统计' as label,
    status,
    COUNT(*) as count
FROM halls
GROUP BY status
ORDER BY status;

-- 查询每个门店的影厅数量
SELECT 
    s.name as store_name,
    COUNT(h.id) as hall_count
FROM stores s
LEFT JOIN halls h ON s.id = h.store_id
GROUP BY s.id, s.name
ORDER BY s.name;
