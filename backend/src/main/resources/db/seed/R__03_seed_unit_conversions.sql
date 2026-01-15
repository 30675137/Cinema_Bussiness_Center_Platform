-- @spec T003-flyway-migration
-- 单位换算初始化数据 (Repeatable Migration)
-- 每次内容变化时自动重新执行，使用 ON CONFLICT DO NOTHING 保证幂等性

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
('瓶', '箱', 0.041667, 'quantity'),
('箱', '瓶', 24, 'quantity'),
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
