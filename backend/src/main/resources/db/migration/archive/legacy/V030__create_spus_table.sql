-- SPU主数据表 - 创建脚本
-- 功能: 存储SPU(标准产品单元)主数据
-- 作者: AI Generated
-- 日期: 2025-12-25

-- ========================================
-- 创建SPU表
-- ========================================
CREATE TABLE IF NOT EXISTS spus (
    -- 主键
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 基础信息
    code VARCHAR(50) NOT NULL UNIQUE,           -- SPU编码，如 'SPU000001'
    name VARCHAR(200) NOT NULL,                  -- SPU名称
    short_name VARCHAR(100),                     -- 简称
    description TEXT,                            -- 描述
    
    -- 分类和品牌
    category_id VARCHAR(100),                    -- 类目ID
    category_name VARCHAR(200),                  -- 类目名称（冗余，便于查询）
    brand_id VARCHAR(100),                       -- 品牌ID
    brand_name VARCHAR(100),                     -- 品牌名称（冗余，便于查询）
    
    -- 状态
    status VARCHAR(20) NOT NULL DEFAULT 'draft', -- 状态: draft, active, inactive, archived
    
    -- 单位
    unit VARCHAR(20),                            -- 基本单位
    
    -- 标签
    tags TEXT[],                                 -- 标签数组
    
    -- 图片
    images JSONB DEFAULT '[]'::jsonb,            -- 图片列表 [{url, alt, sort}]
    
    -- 规格和属性
    specifications JSONB DEFAULT '[]'::jsonb,    -- 规格列表 [{name, value}]
    attributes JSONB DEFAULT '[]'::jsonb,        -- 属性列表 [{name, value}]
    
    -- 审计字段
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- ========================================
-- 创建索引
-- ========================================
CREATE INDEX IF NOT EXISTS idx_spus_code ON spus(code);
CREATE INDEX IF NOT EXISTS idx_spus_name ON spus(name);
CREATE INDEX IF NOT EXISTS idx_spus_status ON spus(status);
CREATE INDEX IF NOT EXISTS idx_spus_category_id ON spus(category_id);
CREATE INDEX IF NOT EXISTS idx_spus_brand_id ON spus(brand_id);
CREATE INDEX IF NOT EXISTS idx_spus_created_at ON spus(created_at);

-- ========================================
-- 添加表注释
-- ========================================
COMMENT ON TABLE spus IS 'SPU主数据表 - 标准产品单元';
COMMENT ON COLUMN spus.id IS '主键UUID';
COMMENT ON COLUMN spus.code IS 'SPU编码，唯一标识';
COMMENT ON COLUMN spus.name IS 'SPU名称';
COMMENT ON COLUMN spus.short_name IS 'SPU简称';
COMMENT ON COLUMN spus.description IS 'SPU描述';
COMMENT ON COLUMN spus.category_id IS '所属类目ID';
COMMENT ON COLUMN spus.category_name IS '所属类目名称';
COMMENT ON COLUMN spus.brand_id IS '所属品牌ID';
COMMENT ON COLUMN spus.brand_name IS '所属品牌名称';
COMMENT ON COLUMN spus.status IS '状态: draft-草稿, active-启用, inactive-停用, archived-归档';
COMMENT ON COLUMN spus.unit IS '基本单位';
COMMENT ON COLUMN spus.tags IS '标签数组';
COMMENT ON COLUMN spus.images IS '图片列表JSON';
COMMENT ON COLUMN spus.specifications IS '规格列表JSON';
COMMENT ON COLUMN spus.attributes IS '属性列表JSON';

-- ========================================
-- 插入与SKU关联的SPU测试数据
-- 对应V029中SKU使用的5个spu_id
-- ========================================
INSERT INTO spus (id, code, name, short_name, description, category_id, category_name, brand_id, brand_name, status, unit, tags, created_by, updated_by) VALUES
-- 原料SPU
('00000000-0000-0000-0000-000000000001', 'SPU000001', '调酒原料', '调酒原料', '用于调制各类鸡尾酒的基础原料', 'cat_raw', '原料 > 基础原料', 'brand_general', '通用原料', 'active', '份', ARRAY['原料', '调酒', '基础']::TEXT[], 'system', 'system'),

-- 包材SPU
('00000000-0000-0000-0000-000000000002', 'SPU000002', '杯具包材', '杯具包材', '各类杯具和包装材料', 'cat_pack', '包材 > 容器包装', 'brand_pack', '通用包材', 'active', '个', ARRAY['包材', '杯具', '容器']::TEXT[], 'system', 'system'),

-- 饮品成品SPU
('00000000-0000-0000-0000-000000000003', 'SPU000003', '特调饮品', '特调饮品', '影院自制特调饮品系列', 'cat_drink', '成品 > 饮品', 'brand_drink', '自制饮品', 'active', '杯', ARRAY['饮品', '特调', '成品']::TEXT[], 'system', 'system'),

-- 爆米花成品SPU
('00000000-0000-0000-0000-000000000004', 'SPU000004', '爆米花', '爆米花', '影院自制爆米花系列', 'cat_snack', '成品 > 零食', 'brand_popcorn', '自制爆米花', 'active', '份', ARRAY['爆米花', '零食', '成品']::TEXT[], 'system', 'system'),

-- 套餐SPU
('00000000-0000-0000-0000-000000000005', 'SPU000005', '观影套餐', '观影套餐', '影院观影套餐组合', 'cat_combo', '套餐 > 观影套餐', 'brand_combo', '影院套餐', 'active', '份', ARRAY['套餐', '观影', '组合']::TEXT[], 'system', 'system')
ON CONFLICT (code) DO NOTHING;
