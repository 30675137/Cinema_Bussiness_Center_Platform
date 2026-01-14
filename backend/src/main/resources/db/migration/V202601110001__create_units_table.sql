-- M001: 物料单位体系统一 - 单位主数据表
-- 创建时间: 2026-01-14
-- 用途: 存储计量单位主数据,替代前端硬编码的单位列表

-- 创建单位表
CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL UNIQUE,           -- 单位代码（如 ml, L, bottle）
    name VARCHAR(50) NOT NULL,                  -- 单位名称（如 毫升, 升, 瓶）
    category VARCHAR(20) NOT NULL,              -- 分类：VOLUME, WEIGHT, COUNT
    decimal_places INTEGER NOT NULL DEFAULT 2,  -- 小数位数
    is_base_unit BOOLEAN NOT NULL DEFAULT false,-- 是否基础单位
    description TEXT,                           -- 描述
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT units_category_check CHECK (category IN ('VOLUME', 'WEIGHT', 'COUNT'))
);

-- 创建索引
CREATE INDEX idx_units_category ON units(category);
CREATE INDEX idx_units_code ON units(code);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_units_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_units_updated_at
    BEFORE UPDATE ON units
    FOR EACH ROW
    EXECUTE FUNCTION update_units_updated_at();

-- 插入预置基础单位数据
INSERT INTO units (code, name, category, decimal_places, is_base_unit, description) VALUES
-- 体积单位
('ml', '毫升', 'VOLUME', 1, true, '基础体积单位'),
('L', '升', 'VOLUME', 2, false, '1L = 1000ml'),
('bottle', '瓶', 'VOLUME', 2, false, '瓶装单位，具体容量由物料定义'),
('cup', '杯', 'VOLUME', 1, false, '杯装单位，具体容量由物料定义'),
('can', '听', 'VOLUME', 2, false, '听装单位，常见330ml或500ml'),

-- 重量单位
('g', '克', 'WEIGHT', 1, true, '基础重量单位'),
('kg', '千克', 'WEIGHT', 2, false, '1kg = 1000g'),

-- 计数单位
('piece', '个', 'COUNT', 0, true, '基础计数单位'),
('box', '箱', 'COUNT', 0, false, '箱装单位，具体数量由物料定义'),
('serving', '份', 'COUNT', 0, false, '份装单位，用于成品计量'),
('bag', '袋', 'COUNT', 0, false, '袋装单位'),
('pack', '包', 'COUNT', 0, false, '包装单位');

-- 添加表注释
COMMENT ON TABLE units IS 'M001: 单位主数据表，存储系统所有计量单位';
COMMENT ON COLUMN units.code IS '单位代码，全局唯一标识符';
COMMENT ON COLUMN units.category IS '单位分类：VOLUME(体积)、WEIGHT(重量)、COUNT(计数)';
COMMENT ON COLUMN units.is_base_unit IS '是否基础单位（如ml、g、个），基础单位不可删除';
COMMENT ON COLUMN units.decimal_places IS '数值保留小数位数，计数类通常为0';
