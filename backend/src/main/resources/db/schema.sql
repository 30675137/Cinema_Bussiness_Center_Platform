-- ============================================================================
-- Cinema Hall & Store 数据库表结构
-- 数据库：Supabase PostgreSQL
-- ============================================================================

-- 1. 创建 stores 表（门店）
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    region VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建 halls 表（影厅）
CREATE TABLE IF NOT EXISTS halls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    code VARCHAR(50),
    name VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('VIP', 'PUBLIC', 'CP', 'PARTY')),
    capacity INTEGER NOT NULL CHECK (capacity > 0 AND capacity <= 1000),
    tags TEXT[],
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_id, code)
);

-- 3. 创建索引
CREATE INDEX IF NOT EXISTS idx_stores_code ON stores(code);
CREATE INDEX IF NOT EXISTS idx_stores_status ON stores(status);
CREATE INDEX IF NOT EXISTS idx_halls_store_id ON halls(store_id);
CREATE INDEX IF NOT EXISTS idx_halls_status ON halls(status);
CREATE INDEX IF NOT EXISTS idx_halls_type ON halls(type);

-- 4. 创建 updated_at 自动更新触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. 为 stores 表添加触发器
DROP TRIGGER IF EXISTS update_stores_updated_at ON stores;
CREATE TRIGGER update_stores_updated_at
    BEFORE UPDATE ON stores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. 为 halls 表添加触发器
DROP TRIGGER IF EXISTS update_halls_updated_at ON halls;
CREATE TRIGGER update_halls_updated_at
    BEFORE UPDATE ON halls
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. 启用 Row Level Security (RLS)
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE halls ENABLE ROW LEVEL SECURITY;

-- 8. 创建 RLS 策略（允许所有操作 - 可根据实际需求调整）
CREATE POLICY "Enable all access for stores" ON stores FOR ALL USING (true);
CREATE POLICY "Enable all access for halls" ON halls FOR ALL USING (true);

-- ============================================================================
-- 注释
-- ============================================================================
COMMENT ON TABLE stores IS '门店信息表';
COMMENT ON COLUMN stores.code IS '门店编码，唯一标识';
COMMENT ON COLUMN stores.name IS '门店名称';
COMMENT ON COLUMN stores.region IS '门店所属区域';
COMMENT ON COLUMN stores.status IS '门店状态：active=营业中, inactive=已停业';

COMMENT ON TABLE halls IS '影厅信息表';
COMMENT ON COLUMN halls.store_id IS '所属门店ID';
COMMENT ON COLUMN halls.code IS '影厅编码，在门店内唯一';
COMMENT ON COLUMN halls.name IS '影厅名称';
COMMENT ON COLUMN halls.type IS '影厅类型：VIP=VIP厅, PUBLIC=普通厅, CP=情侣厅, PARTY=派对厅';
COMMENT ON COLUMN halls.capacity IS '可容纳人数（1-1000）';
COMMENT ON COLUMN halls.tags IS '影厅特性标签数组';
COMMENT ON COLUMN halls.status IS '影厅状态：active=可用, inactive=停用, maintenance=维护中';
