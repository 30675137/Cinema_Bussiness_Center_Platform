-- SKU主数据管理 - 单位换算表和测试数据
-- 功能: 支持不同单位之间的换算(体积、重量、数量)
-- 作者: AI Generated
-- 日期: 2025-12-24

-- 创建单位换算表
CREATE TABLE IF NOT EXISTS unit_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_unit VARCHAR(20) NOT NULL,
  to_unit VARCHAR(20) NOT NULL,
  conversion_rate DECIMAL(10,6) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('volume', 'weight', 'quantity')),
  CONSTRAINT uk_conversion_from_to UNIQUE (from_unit, to_unit)
);

-- 表注释
COMMENT ON TABLE unit_conversions IS '单位换算表:支持体积、重量、数量单位转换';
COMMENT ON COLUMN unit_conversions.from_unit IS '源单位';
COMMENT ON COLUMN unit_conversions.to_unit IS '目标单位';
COMMENT ON COLUMN unit_conversions.conversion_rate IS '换算率(1 from_unit = ? to_unit)';
COMMENT ON COLUMN unit_conversions.category IS '单位类别:volume(体积)|weight(重量)|quantity(数量)';

-- 插入基础单位换算数据
-- 体积换算
INSERT INTO unit_conversions (from_unit, to_unit, conversion_rate, category) VALUES
('ml', 'l', 0.001, 'volume'),
('l', 'ml', 1000, 'volume'),
('ml', '升', 0.001, 'volume'),
('升', 'ml', 1000, 'volume'),
('l', '升', 1, 'volume'),
('升', 'l', 1, 'volume')
ON CONFLICT (from_unit, to_unit) DO NOTHING;

-- 重量换算
INSERT INTO unit_conversions (from_unit, to_unit, conversion_rate, category) VALUES
('g', 'kg', 0.001, 'weight'),
('kg', 'g', 1000, 'weight'),
('g', '克', 1, 'weight'),
('克', 'g', 1, 'weight'),
('kg', '千克', 1, 'weight'),
('千克', 'kg', 1, 'weight'),
('千克', 'g', 1000, 'weight'),
('g', '千克', 0.001, 'weight')
ON CONFLICT (from_unit, to_unit) DO NOTHING;

-- 数量换算
INSERT INTO unit_conversions (from_unit, to_unit, conversion_rate, category) VALUES
('个', '打', 0.083333, 'quantity'),
('打', '个', 12, 'quantity'),
('瓶', '箱', 0.083333, 'quantity'),
('箱', '瓶', 12, 'quantity'),
('片', '包', 0.1, 'quantity'),
('包', '片', 10, 'quantity'),
('根', '包', 0.1, 'quantity'),
('包', '根', 10, 'quantity'),
('个', '件', 1, 'quantity'),
('件', '个', 1, 'quantity'),
('杯', '个', 1, 'quantity'),
('个', '杯', 1, 'quantity'),
('桶', '个', 1, 'quantity'),
('个', '桶', 1, 'quantity')
ON CONFLICT (from_unit, to_unit) DO NOTHING;
