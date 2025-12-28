-- 单位换算测试数据迁移脚本
-- 功能: P001-sku-master-data
-- 描述: 创建常用单位定义和换算关系，支持 SKU 单位配置
-- 作者: Claude Code
-- 日期: 2025-12-24
-- 注意: 这是测试/演示数据，生产环境可以选择性执行

-- ============================================================
-- 单位表（如果不存在）
-- ============================================================

CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    category VARCHAR(20) NOT NULL, -- 单位类别：quantity(数量), volume(容量), weight(重量)
    is_base_unit BOOLEAN DEFAULT FALSE, -- 是否为该类别的基础单位
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE units IS '单位定义表';
COMMENT ON COLUMN units.code IS '单位代码，如：个、ml、g';
COMMENT ON COLUMN units.name IS '单位名称，如：个、毫升、克';
COMMENT ON COLUMN units.category IS '单位类别：quantity(数量), volume(容量), weight(重量)';
COMMENT ON COLUMN units.is_base_unit IS '是否为该类别的基础单位，用于换算';

-- ============================================================
-- 单位换算关系表
-- ============================================================

CREATE TABLE IF NOT EXISTS unit_conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_unit_id UUID NOT NULL REFERENCES units(id),
    to_unit_id UUID NOT NULL REFERENCES units(id),
    conversion_rate DECIMAL(10,6) NOT NULL CHECK (conversion_rate > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uk_unit_conversion UNIQUE (from_unit_id, to_unit_id)
);

COMMENT ON TABLE unit_conversions IS '单位换算关系表';
COMMENT ON COLUMN unit_conversions.from_unit_id IS '源单位 ID';
COMMENT ON COLUMN unit_conversions.to_unit_id IS '目标单位 ID';
COMMENT ON COLUMN unit_conversions.conversion_rate IS '换算比率，1 源单位 = conversion_rate 目标单位';

CREATE INDEX idx_unit_conversions_from ON unit_conversions(from_unit_id);
CREATE INDEX idx_unit_conversions_to ON unit_conversions(to_unit_id);

-- ============================================================
-- 插入常用单位数据
-- ============================================================

-- 数量类单位
INSERT INTO units (code, name, category, is_base_unit) VALUES
('个', '个', 'quantity', true),
('打', '打', 'quantity', false),
('箱', '箱', 'quantity', false);

-- 容量类单位（基础单位：毫升 ml）
INSERT INTO units (code, name, category, is_base_unit) VALUES
('ml', '毫升', 'volume', true),
('l', '升', 'volume', false),
('oz', '盎司', 'volume', false);

-- 重量类单位（基础单位：克 g）
INSERT INTO units (code, name, category, is_base_unit) VALUES
('g', '克', 'weight', true),
('kg', '千克', 'weight', false),
('mg', '毫克', 'weight', false);

-- ============================================================
-- 插入单位换算关系
-- ============================================================

-- 数量类换算
INSERT INTO unit_conversions (from_unit_id, to_unit_id, conversion_rate)
SELECT
    (SELECT id FROM units WHERE code = '打'),
    (SELECT id FROM units WHERE code = '个'),
    12 -- 1 打 = 12 个
WHERE NOT EXISTS (
    SELECT 1 FROM unit_conversions
    WHERE from_unit_id = (SELECT id FROM units WHERE code = '打')
    AND to_unit_id = (SELECT id FROM units WHERE code = '个')
);

INSERT INTO unit_conversions (from_unit_id, to_unit_id, conversion_rate)
SELECT
    (SELECT id FROM units WHERE code = '箱'),
    (SELECT id FROM units WHERE code = '个'),
    24 -- 1 箱 = 24 个（示例值）
WHERE NOT EXISTS (
    SELECT 1 FROM unit_conversions
    WHERE from_unit_id = (SELECT id FROM units WHERE code = '箱')
    AND to_unit_id = (SELECT id FROM units WHERE code = '个')
);

-- 容量类换算
INSERT INTO unit_conversions (from_unit_id, to_unit_id, conversion_rate)
SELECT
    (SELECT id FROM units WHERE code = 'l'),
    (SELECT id FROM units WHERE code = 'ml'),
    1000 -- 1 升 = 1000 毫升
WHERE NOT EXISTS (
    SELECT 1 FROM unit_conversions
    WHERE from_unit_id = (SELECT id FROM units WHERE code = 'l')
    AND to_unit_id = (SELECT id FROM units WHERE code = 'ml')
);

INSERT INTO unit_conversions (from_unit_id, to_unit_id, conversion_rate)
SELECT
    (SELECT id FROM units WHERE code = 'oz'),
    (SELECT id FROM units WHERE code = 'ml'),
    29.5735 -- 1 盎司 ≈ 29.5735 毫升
WHERE NOT EXISTS (
    SELECT 1 FROM unit_conversions
    WHERE from_unit_id = (SELECT id FROM units WHERE code = 'oz')
    AND to_unit_id = (SELECT id FROM units WHERE code = 'ml')
);

-- 重量类换算
INSERT INTO unit_conversions (from_unit_id, to_unit_id, conversion_rate)
SELECT
    (SELECT id FROM units WHERE code = 'kg'),
    (SELECT id FROM units WHERE code = 'g'),
    1000 -- 1 千克 = 1000 克
WHERE NOT EXISTS (
    SELECT 1 FROM unit_conversions
    WHERE from_unit_id = (SELECT id FROM units WHERE code = 'kg')
    AND to_unit_id = (SELECT id FROM units WHERE code = 'g')
);

INSERT INTO unit_conversions (from_unit_id, to_unit_id, conversion_rate)
SELECT
    (SELECT id FROM units WHERE code = 'g'),
    (SELECT id FROM units WHERE code = 'mg'),
    1000 -- 1 克 = 1000 毫克
WHERE NOT EXISTS (
    SELECT 1 FROM unit_conversions
    WHERE from_unit_id = (SELECT id FROM units WHERE code = 'g')
    AND to_unit_id = (SELECT id FROM units WHERE code = 'mg')
);

-- ============================================================
-- 辅助函数：获取单位换算比率
-- ============================================================

CREATE OR REPLACE FUNCTION get_unit_conversion_rate(
    from_unit_code VARCHAR,
    to_unit_code VARCHAR
) RETURNS DECIMAL AS $$
DECLARE
    rate DECIMAL(10,6);
BEGIN
    -- 如果是同一个单位，返回 1
    IF from_unit_code = to_unit_code THEN
        RETURN 1.0;
    END IF;

    -- 查找直接换算关系
    SELECT conversion_rate INTO rate
    FROM unit_conversions uc
    JOIN units u1 ON uc.from_unit_id = u1.id
    JOIN units u2 ON uc.to_unit_id = u2.id
    WHERE u1.code = from_unit_code
    AND u2.code = to_unit_code;

    IF FOUND THEN
        RETURN rate;
    END IF;

    -- 查找反向换算关系
    SELECT 1.0 / conversion_rate INTO rate
    FROM unit_conversions uc
    JOIN units u1 ON uc.from_unit_id = u1.id
    JOIN units u2 ON uc.to_unit_id = u2.id
    WHERE u1.code = to_unit_code
    AND u2.code = from_unit_code;

    IF FOUND THEN
        RETURN rate;
    END IF;

    -- 未找到换算关系，返回 NULL
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_unit_conversion_rate IS '获取单位换算比率，如果无法换算返回 NULL';
