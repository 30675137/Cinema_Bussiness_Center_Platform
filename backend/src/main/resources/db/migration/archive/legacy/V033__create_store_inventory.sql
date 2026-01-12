-- P003: 门店SKU库存查询功能
-- 创建商品分类表和门店库存表

-- 创建商品分类表
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    parent_id UUID REFERENCES categories(id),
    level INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 创建分类索引
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_status ON categories(status);

-- 为 skus 表添加 category_id 字段（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'skus' AND column_name = 'category_id'
    ) THEN
        ALTER TABLE skus ADD COLUMN category_id UUID REFERENCES categories(id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_skus_category_id ON skus(category_id);

-- 创建门店库存表
CREATE TABLE IF NOT EXISTS store_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    sku_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
    on_hand_qty DECIMAL(12, 3) NOT NULL DEFAULT 0,
    available_qty DECIMAL(12, 3) NOT NULL DEFAULT 0,
    reserved_qty DECIMAL(12, 3) NOT NULL DEFAULT 0,
    safety_stock DECIMAL(12, 3) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (store_id, sku_id)
);

-- 创建库存查询索引
CREATE INDEX IF NOT EXISTS idx_store_inventory_store_id ON store_inventory(store_id);
CREATE INDEX IF NOT EXISTS idx_store_inventory_sku_id ON store_inventory(sku_id);
CREATE INDEX IF NOT EXISTS idx_store_inventory_available_qty ON store_inventory(available_qty);

-- 创建库存状态计算函数
CREATE OR REPLACE FUNCTION calculate_inventory_status(
    available_qty DECIMAL,
    safety_stock DECIMAL
) RETURNS VARCHAR AS $$
BEGIN
    IF available_qty = 0 THEN
        RETURN 'OUT_OF_STOCK';
    ELSIF available_qty < safety_stock * 0.5 THEN
        RETURN 'LOW';
    ELSIF available_qty < safety_stock THEN
        RETURN 'BELOW_THRESHOLD';
    ELSIF available_qty < safety_stock * 2 THEN
        RETURN 'NORMAL';
    ELSE
        RETURN 'SUFFICIENT';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 更新时间触发器
CREATE OR REPLACE FUNCTION update_store_inventory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_store_inventory_updated_at ON store_inventory;
CREATE TRIGGER trigger_update_store_inventory_updated_at
    BEFORE UPDATE ON store_inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_store_inventory_updated_at();

-- 插入测试分类数据
INSERT INTO categories (id, code, name, level, sort_order, status) VALUES
    ('11111111-1111-1111-1111-111111111111', 'CAT001', '酒水饮料', 1, 1, 'ACTIVE'),
    ('22222222-2222-2222-2222-222222222222', 'CAT002', '零食小吃', 1, 2, 'ACTIVE'),
    ('33333333-3333-3333-3333-333333333333', 'CAT003', '餐饮正餐', 1, 3, 'ACTIVE')
ON CONFLICT (code) DO NOTHING;

-- 插入子分类数据
INSERT INTO categories (id, code, name, parent_id, level, sort_order, status) VALUES
    ('11111111-1111-1111-1111-111111111112', 'CAT001-01', '威士忌', '11111111-1111-1111-1111-111111111111', 2, 1, 'ACTIVE'),
    ('11111111-1111-1111-1111-111111111113', 'CAT001-02', '啤酒', '11111111-1111-1111-1111-111111111111', 2, 2, 'ACTIVE'),
    ('11111111-1111-1111-1111-111111111114', 'CAT001-03', '软饮料', '11111111-1111-1111-1111-111111111111', 2, 3, 'ACTIVE'),
    ('22222222-2222-2222-2222-222222222223', 'CAT002-01', '薯片', '22222222-2222-2222-2222-222222222222', 2, 1, 'ACTIVE'),
    ('22222222-2222-2222-2222-222222222224', 'CAT002-02', '坚果', '22222222-2222-2222-2222-222222222222', 2, 2, 'ACTIVE')
ON CONFLICT (code) DO NOTHING;
