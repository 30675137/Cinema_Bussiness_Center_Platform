-- @spec init-category-brand-data
-- 类目和品牌初始化数据脚本
-- 包含品牌表(brands)和菜单分类表(menu_category)的初始化数据

-- ============================================
-- 品牌数据初始化
-- ============================================

-- 品牌表结构参考：
-- id, brand_code, name, english_name, brand_type, primary_categories, company, 
-- brand_level, tags, description, status, created_by, updated_by, created_at, updated_at

INSERT INTO brands (brand_code, name, english_name, brand_type, primary_categories, company, brand_level, tags, description, status, created_by, updated_by) VALUES
('BRAND001', '耀莱影院', 'Yaolai Cinema', 'own', ARRAY['影院', '娱乐']::TEXT[], '耀莱文化', 'A', ARRAY['自营', '高端']::TEXT[], '耀莱集团旗下高端影院品牌', 'enabled', 'init-script', 'init-script'),
('BRAND002', '可口可乐', 'Coca-Cola', 'agency', ARRAY['饮料', '碳酸饮品']::TEXT[], '可口可乐公司', 'A', ARRAY['代理', '饮料']::TEXT[], '全球知名饮料品牌', 'enabled', 'init-script', 'init-script'),
('BRAND003', '百事可乐', 'Pepsi', 'agency', ARRAY['饮料', '碳酸饮品']::TEXT[], '百事公司', 'A', ARRAY['代理', '饮料']::TEXT[], '全球知名饮料品牌', 'enabled', 'init-script', 'init-script'),
('BRAND004', '自制爆米花', 'Homemade Popcorn', 'own', ARRAY['零食', '爆米花']::TEXT[], '耀莱影院', 'B', ARRAY['自营', '零食']::TEXT[], '影院自制特色爆米花', 'enabled', 'init-script', 'init-script'),
('BRAND005', '星巴克', 'Starbucks', 'joint', ARRAY['咖啡', '饮品']::TEXT[], '星巴克中国', 'A', ARRAY['联营', '咖啡']::TEXT[], '全球知名咖啡连锁品牌', 'enabled', 'init-script', 'init-script'),
('BRAND006', '奥利奥', 'Oreo', 'agency', ARRAY['零食', '饼干']::TEXT[], '亿滋国际', 'B', ARRAY['代理', '零食']::TEXT[], '经典夹心饼干品牌', 'enabled', 'init-script', 'init-script'),
('BRAND007', '蒙牛', 'Mengniu', 'agency', ARRAY['乳制品', '冰淇淋']::TEXT[], '蒙牛乳业', 'B', ARRAY['代理', '乳品']::TEXT[], '国内知名乳制品品牌', 'enabled', 'init-script', 'init-script'),
('BRAND008', '雀巢', 'Nestle', 'agency', ARRAY['咖啡', '饮品']::TEXT[], '雀巢公司', 'A', ARRAY['代理', '食品']::TEXT[], '瑞士跨国食品制造商', 'enabled', 'init-script', 'init-script'),
('BRAND009', '康师傅', 'Master Kong', 'agency', ARRAY['饮料', '方便食品']::TEXT[], '康师傅控股', 'B', ARRAY['代理', '饮品']::TEXT[], '知名方便食品和饮料品牌', 'enabled', 'init-script', 'init-script'),
('BRAND010', '农夫山泉', 'Nongfu Spring', 'agency', ARRAY['饮用水', '饮料']::TEXT[], '农夫山泉股份', 'B', ARRAY['代理', '饮品']::TEXT[], '国内知名饮用水品牌', 'enabled', 'init-script', 'init-script'),
('DEFAULT', '默认品牌', 'Default Brand', 'own', ARRAY['通用']::TEXT[], '系统默认', 'C', ARRAY['系统']::TEXT[], '系统默认品牌', 'enabled', 'init-script', 'init-script')
ON CONFLICT (brand_code) DO NOTHING;

-- ============================================
-- 菜单分类数据初始化
-- ============================================

-- 菜单分类表结构参考：
-- id, code, display_name, sort_order, is_visible, is_default, icon_url, description, 
-- version, created_at, updated_at, created_by, updated_by, deleted_at

INSERT INTO menu_category (code, display_name, sort_order, is_visible, is_default, description) VALUES
('BEVERAGE', '饮品', 1, true, false, '各类饮品，包括咖啡、奶茶、果汁等'),
('SNACK', '小食', 2, true, false, '零食小吃，包括爆米花、薯片等'),
('COMBO', '套餐', 3, true, false, '组合套餐，包含多种商品'),
('POPCORN', '爆米花', 4, true, false, '各种口味爆米花'),
('FOOD', '餐食', 5, true, false, '正餐、快餐等餐食类商品'),
('MERCHANDISE', '周边商品', 6, true, false, '电影周边、纪念品等'),
('VIP_SERVICE', '会员服务', 7, true, false, '会员卡、增值服务等'),
('MOVIE_TICKET', '电影票务', 8, true, false, '电影票、场次预订等'),
('EVENT', '活动', 9, true, false, '促销活动、优惠券等'),
('OTHER', '其他', 99, true, true, '其他未分类商品（默认分类）')
ON CONFLICT (code) WHERE deleted_at IS NULL DO NOTHING;

-- ============================================
-- 初始化完成说明
-- ============================================

-- 此脚本为幂等脚本，可安全重复执行
-- 使用 ON CONFLICT 子句确保不会重复插入相同的数据
-- 如需更新现有数据，请使用对应的更新语句