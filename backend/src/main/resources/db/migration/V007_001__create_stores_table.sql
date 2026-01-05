-- ============================================================
-- Migration: V007_001__create_stores_table.sql
-- Description: 创建门店基础表
-- ============================================================

-- 创建门店表
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL UNIQUE,
    region VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    -- 地址字段 (020-store-address)
    province VARCHAR(50),
    city VARCHAR(50),
    district VARCHAR(50),
    address TEXT,
    phone VARCHAR(30),
    -- 影城字段 (023-store-cinema-fields)
    opening_date DATE,
    area INTEGER,
    hall_count INTEGER,
    seat_count INTEGER
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_stores_status ON stores(status);
CREATE INDEX IF NOT EXISTS idx_stores_region ON stores(region);
CREATE INDEX IF NOT EXISTS idx_stores_code ON stores(code);

-- 启用 RLS
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- RLS 策略
CREATE POLICY "Enable all access for stores"
    ON stores FOR ALL USING (true);

-- 注释
COMMENT ON TABLE stores IS '门店基础表';
COMMENT ON COLUMN stores.code IS '门店编码，唯一标识';
COMMENT ON COLUMN stores.name IS '门店名称';
COMMENT ON COLUMN stores.region IS '所属区域';
COMMENT ON COLUMN stores.status IS '门店状态: active | inactive';
COMMENT ON COLUMN stores.version IS '乐观锁版本号';
COMMENT ON COLUMN stores.province IS '省份';
COMMENT ON COLUMN stores.city IS '城市';
COMMENT ON COLUMN stores.district IS '区县';
COMMENT ON COLUMN stores.address IS '详细地址';
COMMENT ON COLUMN stores.phone IS '联系电话';
COMMENT ON COLUMN stores.opening_date IS '开业时间';
COMMENT ON COLUMN stores.area IS '面积(平方米)';
COMMENT ON COLUMN stores.hall_count IS '影厅数';
COMMENT ON COLUMN stores.seat_count IS '座位数';
