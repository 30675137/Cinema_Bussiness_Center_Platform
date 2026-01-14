-- M001: 物料单位体系统一 - 物料主数据表
-- 创建时间: 2026-01-14
-- 用途: 独立管理原料和包材,不依赖SPU/SKU体系

-- 创建物料表
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,           -- 物料编码（如 MAT-RAW-001）
    name VARCHAR(100) NOT NULL,                 -- 物料名称（如 朗姆酒）
    category VARCHAR(20) NOT NULL,              -- 类别：RAW_MATERIAL, PACKAGING
    inventory_unit_code VARCHAR(20) NOT NULL,   -- 库存单位代码（外键 → units.code）
    purchase_unit_code VARCHAR(20),             -- 采购单位代码（外键 → units.code）
    conversion_rate NUMERIC(10, 6),             -- 物料级换算率（采购→库存）
    use_global_conversion BOOLEAN DEFAULT false,-- 是否使用全局换算
    standard_cost NUMERIC(10, 2),               -- 标准成本（元/库存单位）
    description TEXT,                           -- 描述
    status VARCHAR(20) DEFAULT 'ACTIVE',        -- 状态：ACTIVE, INACTIVE
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT materials_category_check CHECK (category IN ('RAW_MATERIAL', 'PACKAGING')),
    CONSTRAINT materials_status_check CHECK (status IN ('ACTIVE', 'INACTIVE')),
    CONSTRAINT fk_inventory_unit FOREIGN KEY (inventory_unit_code) REFERENCES units(code) ON DELETE RESTRICT,
    CONSTRAINT fk_purchase_unit FOREIGN KEY (purchase_unit_code) REFERENCES units(code) ON DELETE RESTRICT,
    CONSTRAINT materials_conversion_check CHECK (
        (purchase_unit_code IS NULL AND conversion_rate IS NULL AND use_global_conversion = false)
        OR (purchase_unit_code IS NOT NULL)
    )
);

-- 创建索引
CREATE INDEX idx_materials_category ON materials(category);
CREATE INDEX idx_materials_status ON materials(status);
CREATE INDEX idx_materials_code ON materials(code);
CREATE INDEX idx_materials_inventory_unit ON materials(inventory_unit_code);
CREATE INDEX idx_materials_purchase_unit ON materials(purchase_unit_code);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_materials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_materials_updated_at
    BEFORE UPDATE ON materials
    FOR EACH ROW
    EXECUTE FUNCTION update_materials_updated_at();

-- 创建物料编码自动生成序列
CREATE SEQUENCE materials_raw_seq START 1;
CREATE SEQUENCE materials_pkg_seq START 1;

-- 创建物料编码生成函数
CREATE OR REPLACE FUNCTION generate_material_code(p_category VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
    v_prefix VARCHAR(10);
    v_seq_num INTEGER;
    v_code VARCHAR(50);
BEGIN
    IF p_category = 'RAW_MATERIAL' THEN
        v_prefix := 'MAT-RAW-';
        v_seq_num := nextval('materials_raw_seq');
    ELSIF p_category = 'PACKAGING' THEN
        v_prefix := 'MAT-PKG-';
        v_seq_num := nextval('materials_pkg_seq');
    ELSE
        RAISE EXCEPTION 'Invalid material category: %', p_category;
    END IF;
    
    v_code := v_prefix || LPAD(v_seq_num::TEXT, 3, '0');
    RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- 添加表注释
COMMENT ON TABLE materials IS 'M001: 物料主数据表，独立管理原料和包材，替代SKU表中的RAW_MATERIAL/PACKAGING类型';
COMMENT ON COLUMN materials.code IS '物料编码，格式: MAT-{RAW|PKG}-{序号}，自动生成';
COMMENT ON COLUMN materials.category IS '物料类别：RAW_MATERIAL(原料)、PACKAGING(包材)';
COMMENT ON COLUMN materials.conversion_rate IS '物料级换算率，优先级高于全局换算。例如: 1瓶=500ml，则值为500';
COMMENT ON COLUMN materials.use_global_conversion IS '是否使用全局换算规则。true时忽略conversion_rate，使用unit_conversions表';
COMMENT ON COLUMN materials.standard_cost IS '标准成本，以库存单位计价';
