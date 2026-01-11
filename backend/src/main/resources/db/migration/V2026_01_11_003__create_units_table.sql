/**
 * @spec M001-material-unit-system
 * Create units table for unit master data management
 *
 * User Story: US1 - 单位主数据管理
 *
 * This migration creates the units table to replace hardcoded unit strings
 * and provides a centralized unit master data system.
 */

-- Create unit_category ENUM type (if not exists)
DO $$ BEGIN
    CREATE TYPE unit_category AS ENUM ('VOLUME', 'WEIGHT', 'COUNT');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create units table
CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    category unit_category NOT NULL,
    decimal_places SMALLINT NOT NULL DEFAULT 2 CHECK (decimal_places >= 0 AND decimal_places <= 6),
    is_base_unit BOOLEAN NOT NULL DEFAULT false,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes (if not exists)
CREATE INDEX IF NOT EXISTS idx_units_category ON units(category);
CREATE INDEX IF NOT EXISTS idx_units_code ON units(code);
CREATE INDEX IF NOT EXISTS idx_units_is_base_unit ON units(is_base_unit);

-- Add comments
COMMENT ON TABLE units IS '单位主数据表 - Unit master data';
COMMENT ON COLUMN units.code IS '单位代码（唯一标识符，如 ml, L, g, kg, 瓶, 个）';
COMMENT ON COLUMN units.name IS '单位名称（显示名称）';
COMMENT ON COLUMN units.category IS '单位分类（VOLUME=体积, WEIGHT=重量, COUNT=计数）';
COMMENT ON COLUMN units.decimal_places IS '小数位数（0-6），用于显示格式控制';
COMMENT ON COLUMN units.is_base_unit IS '是否为基础单位（如 ml 是体积的基础单位）';
COMMENT ON COLUMN units.description IS '单位描述';

-- Insert base units (预置基础单位数据) - ON CONFLICT DO NOTHING for idempotency
INSERT INTO units (code, name, category, decimal_places, is_base_unit, description) VALUES
    -- 体积单位
    ('ml', '毫升', 'VOLUME', 2, true, '体积基础单位'),
    ('L', '升', 'VOLUME', 2, false, '1L = 1000ml'),
    ('瓶', '瓶', 'VOLUME', 0, false, '容量单位，具体容量由物料定义'),
    ('杯', '杯', 'VOLUME', 0, false, '容量单位，具体容量由物料定义'),

    -- 重量单位
    ('g', '克', 'WEIGHT', 2, true, '重量基础单位'),
    ('kg', '千克', 'WEIGHT', 3, false, '1kg = 1000g'),
    ('袋', '袋', 'WEIGHT', 0, false, '重量单位，具体重量由物料定义'),

    -- 计数单位
    ('个', '个', 'COUNT', 0, true, '计数基础单位'),
    ('份', '份', 'COUNT', 0, false, '份量单位'),
    ('盒', '盒', 'COUNT', 0, false, '包装单位'),
    ('箱', '箱', 'COUNT', 0, false, '包装单位，具体数量由物料定义')
ON CONFLICT (code) DO NOTHING;

-- Add updated_at trigger (drop if exists first for idempotency)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_units_updated_at ON units;
CREATE TRIGGER update_units_updated_at
    BEFORE UPDATE ON units
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
