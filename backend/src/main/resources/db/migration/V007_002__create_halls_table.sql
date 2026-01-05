-- ============================================================
-- Migration: V007_002__create_halls_table.sql
-- Description: 创建影厅基础表
-- ============================================================

-- 创建影厅表
CREATE TABLE IF NOT EXISTS halls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    code VARCHAR(50),
    name VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('VIP', 'PUBLIC', 'CP', 'PARTY')),
    capacity INTEGER NOT NULL CHECK (capacity > 0 AND capacity <= 1000),
    tags TEXT[],
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(store_id, code)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_halls_store_id ON halls(store_id);
CREATE INDEX IF NOT EXISTS idx_halls_status ON halls(status);
CREATE INDEX IF NOT EXISTS idx_halls_type ON halls(type);

-- 创建自动更新 updated_at 的触发器
CREATE OR REPLACE FUNCTION update_halls_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_halls_updated_at ON halls;
CREATE TRIGGER trigger_update_halls_updated_at
    BEFORE UPDATE ON halls
    FOR EACH ROW
    EXECUTE FUNCTION update_halls_updated_at();

-- 启用 RLS
ALTER TABLE halls ENABLE ROW LEVEL SECURITY;

-- RLS 策略
CREATE POLICY "Enable all access for halls"
    ON halls FOR ALL USING (true);

-- 注释
COMMENT ON TABLE halls IS '影厅信息表';
COMMENT ON COLUMN halls.store_id IS '所属门店ID';
COMMENT ON COLUMN halls.code IS '影厅编码，在门店内唯一';
COMMENT ON COLUMN halls.name IS '影厅名称';
COMMENT ON COLUMN halls.type IS '影厅类型：VIP=VIP厅, PUBLIC=普通厅, CP=情侣厅, PARTY=派对厅';
COMMENT ON COLUMN halls.capacity IS '可容纳人数（1-1000）';
COMMENT ON COLUMN halls.tags IS '影厅特性标签数组';
COMMENT ON COLUMN halls.status IS '影厅状态：active=可用, inactive=停用, maintenance=维护中';
