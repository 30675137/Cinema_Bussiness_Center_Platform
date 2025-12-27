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
