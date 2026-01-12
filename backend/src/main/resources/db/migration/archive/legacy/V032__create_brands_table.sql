-- 品牌管理表创建脚本
-- 功能: 存储品牌信息
-- 日期: 2025-12-25

-- 创建brands表
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    english_name VARCHAR(200),
    brand_type VARCHAR(20) NOT NULL DEFAULT 'own' CHECK (brand_type IN ('own', 'agency', 'joint', 'other')),
    primary_categories TEXT[] DEFAULT '{}',
    company VARCHAR(200),
    brand_level VARCHAR(20),
    tags TEXT[] DEFAULT '{}',
    description TEXT,
    logo_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'enabled', 'disabled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_brands_code ON brands(brand_code);
CREATE INDEX IF NOT EXISTS idx_brands_name ON brands(name);
CREATE INDEX IF NOT EXISTS idx_brands_status ON brands(status);
CREATE INDEX IF NOT EXISTS idx_brands_type ON brands(brand_type);

-- 添加注释
COMMENT ON TABLE brands IS '品牌管理表';
COMMENT ON COLUMN brands.brand_code IS '品牌编码，唯一标识';
COMMENT ON COLUMN brands.name IS '品牌名称（中文）';
COMMENT ON COLUMN brands.english_name IS '品牌英文名';
COMMENT ON COLUMN brands.brand_type IS '品牌类型: own(自有), agency(代理), joint(联营), other(其他)';
COMMENT ON COLUMN brands.primary_categories IS '主营类目数组';
COMMENT ON COLUMN brands.company IS '所属公司/供应商';
COMMENT ON COLUMN brands.brand_level IS '品牌等级(A/B/C)';
COMMENT ON COLUMN brands.tags IS '品牌标签数组';
COMMENT ON COLUMN brands.description IS '品牌介绍';
COMMENT ON COLUMN brands.logo_url IS '品牌LOGO URL';
COMMENT ON COLUMN brands.status IS '状态: draft(草稿), enabled(启用), disabled(停用)';

-- 插入测试数据
INSERT INTO brands (brand_code, name, english_name, brand_type, primary_categories, company, brand_level, tags, description, status, created_by, updated_by) VALUES
('BRAND001', '耀莱影院', 'Yaolai Cinema', 'own', ARRAY['影院', '娱乐']::TEXT[], '耀莱文化', 'A', ARRAY['自营', '高端']::TEXT[], '耀莱集团旗下高端影院品牌', 'enabled', 'system', 'system'),
('BRAND002', '可口可乐', 'Coca-Cola', 'agency', ARRAY['饮料', '碳酸饮品']::TEXT[], '可口可乐公司', 'A', ARRAY['代理', '饮料']::TEXT[], '全球知名饮料品牌', 'enabled', 'system', 'system'),
('BRAND003', '百事可乐', 'Pepsi', 'agency', ARRAY['饮料', '碳酸饮品']::TEXT[], '百事公司', 'A', ARRAY['代理', '饮料']::TEXT[], '全球知名饮料品牌', 'enabled', 'system', 'system'),
('BRAND004', '自制爆米花', 'Homemade Popcorn', 'own', ARRAY['零食', '爆米花']::TEXT[], '耀莱影院', 'B', ARRAY['自营', '零食']::TEXT[], '影院自制特色爆米花', 'enabled', 'system', 'system'),
('BRAND005', '星巴克', 'Starbucks', 'joint', ARRAY['咖啡', '饮品']::TEXT[], '星巴克中国', 'A', ARRAY['联营', '咖啡']::TEXT[], '全球知名咖啡连锁品牌', 'enabled', 'system', 'system')
ON CONFLICT (brand_code) DO NOTHING;
