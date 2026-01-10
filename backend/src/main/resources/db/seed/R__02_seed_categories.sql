-- @spec T003-flyway-migration
-- 菜单分类初始化数据 (Repeatable Migration)
-- 每次内容变化时自动重新执行，使用 ON CONFLICT DO NOTHING 保证幂等性
-- 注意：menu_category.created_by 是 UUID 类型，使用 NULL

-- 基础分类数据
INSERT INTO menu_category (code, display_name, sort_order, is_visible, is_default, description) VALUES
('BEVERAGE', '饮品', 1, true, false, '各类饮品，包括咖啡、奶茶、果汁等'),
('SNACK', '小食', 2, true, false, '零食小吃，包括爆米花、薯片等'),
('COMBO', '套餐', 3, true, false, '组合套餐，包含多种商品'),
('POPCORN', '爆米花', 4, true, false, '各种口味爆米花'),
('OTHER', '其他', 99, true, true, '其他未分类商品（默认分类）')
ON CONFLICT (code) WHERE deleted_at IS NULL DO NOTHING;
