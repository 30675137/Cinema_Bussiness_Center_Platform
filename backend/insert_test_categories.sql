-- 临时脚本：手动插入测试分类数据
-- 用于修复 O010 Bug: 菜单页左侧分类菜单未显示

-- 先删除可能存在的测试数据（避免重复插入）
DELETE FROM menu_category WHERE code IN ('ALCOHOL', 'COFFEE', 'BEVERAGE', 'SNACK', 'MEAL', 'OTHER');

-- 插入 6 个测试分类
INSERT INTO menu_category (id, code, display_name, sort_order, is_visible, is_default, created_at, updated_at, deleted_at, version)
VALUES
    (gen_random_uuid(), 'ALCOHOL',  '经典特调', 1, true, false, NOW(), NOW(), NULL, 0),
    (gen_random_uuid(), 'COFFEE',   '精品咖啡', 2, true, false, NOW(), NOW(), NULL, 0),
    (gen_random_uuid(), 'BEVERAGE', '经典饮品', 3, true, false, NOW(), NOW(), NULL, 0),
    (gen_random_uuid(), 'SNACK',    '主厨小食', 4, true, false, NOW(), NOW(), NULL, 0),
    (gen_random_uuid(), 'MEAL',     '精品餐食', 5, true, false, NOW(), NOW(), NULL, 0),
    (gen_random_uuid(), 'OTHER',    '其他商品', 99, true, true, NOW(), NOW(), NULL, 0);

-- 验证插入结果
SELECT code, display_name, sort_order, is_visible, is_default
FROM menu_category
WHERE deleted_at IS NULL
ORDER BY sort_order;
