-- @spec T003-flyway-migration
-- 品牌初始化数据 (Repeatable Migration)
-- 每次内容变化时自动重新执行，使用 ON CONFLICT DO NOTHING 保证幂等性

-- 基础品牌数据
INSERT INTO brands (brand_code, name, english_name, brand_type, primary_categories, company, brand_level, tags, description, status, created_by, updated_by) VALUES
('BRAND001', '耀莱影院', 'Yaolai Cinema', 'own', ARRAY['影院', '娱乐']::TEXT[], '耀莱文化', 'A', ARRAY['自营', '高端']::TEXT[], '耀莱集团旗下高端影院品牌', 'enabled', 'flyway-seed', 'flyway-seed'),
('BRAND002', '可口可乐', 'Coca-Cola', 'agency', ARRAY['饮料', '碳酸饮品']::TEXT[], '可口可乐公司', 'A', ARRAY['代理', '饮料']::TEXT[], '全球知名饮料品牌', 'enabled', 'flyway-seed', 'flyway-seed'),
('BRAND003', '百事可乐', 'Pepsi', 'agency', ARRAY['饮料', '碳酸饮品']::TEXT[], '百事公司', 'A', ARRAY['代理', '饮料']::TEXT[], '全球知名饮料品牌', 'enabled', 'flyway-seed', 'flyway-seed'),
('BRAND004', '自制爆米花', 'Homemade Popcorn', 'own', ARRAY['零食', '爆米花']::TEXT[], '耀莱影院', 'B', ARRAY['自营', '零食']::TEXT[], '影院自制特色爆米花', 'enabled', 'flyway-seed', 'flyway-seed'),
('BRAND005', '星巴克', 'Starbucks', 'joint', ARRAY['咖啡', '饮品']::TEXT[], '星巴克中国', 'A', ARRAY['联营', '咖啡']::TEXT[], '全球知名咖啡连锁品牌', 'enabled', 'flyway-seed', 'flyway-seed'),
('DEFAULT', '默认品牌', 'Default Brand', 'own', ARRAY['通用']::TEXT[], '系统默认', 'C', ARRAY['系统']::TEXT[], '系统默认品牌', 'enabled', 'flyway-seed', 'flyway-seed')
ON CONFLICT (brand_code) DO NOTHING;
