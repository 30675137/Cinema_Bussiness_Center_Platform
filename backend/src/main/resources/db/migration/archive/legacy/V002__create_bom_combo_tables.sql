-- BOM 和套餐表迁移脚本
-- 功能: P001-sku-master-data
-- 描述: 创建 bom_components 和 combo_items 表，支持成品 BOM 配置和套餐子项配置
-- 作者: Claude Code
-- 日期: 2025-12-24

-- ============================================================
-- BOM 组件表（成品类型 SKU 的物料清单）
-- ============================================================

CREATE TABLE IF NOT EXISTS bom_components (
    -- 主键
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 成品 SKU ID（外键）
    finished_product_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,

    -- 组件 SKU ID（外键，必须是原料或包材类型）
    component_id UUID NOT NULL REFERENCES skus(id) ON DELETE RESTRICT,

    -- 数量配置
    quantity DECIMAL(10,3) NOT NULL CHECK (quantity > 0),
    unit VARCHAR(20) NOT NULL,

    -- 成本信息（冗余字段，用于快速计算）
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2) GENERATED ALWAYS AS (quantity * COALESCE(unit_cost, 0)) STORED,

    -- 可选组件标记
    is_optional BOOLEAN DEFAULT FALSE,

    -- 排序序号
    sort_order INTEGER DEFAULT 0,

    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 唯一性约束：一个成品不能重复添加相同的组件
    CONSTRAINT uk_bom_component UNIQUE (finished_product_id, component_id)
);

-- 创建索引以优化查询性能

-- 普通索引：成品 ID（用于查询某个成品的 BOM）
CREATE INDEX idx_bom_finished_product ON bom_components(finished_product_id);

-- 普通索引：组件 ID（用于检查组件被哪些成品引用）
CREATE INDEX idx_bom_component ON bom_components(component_id);

-- 组合索引：成品 ID + 排序序号（用于按顺序返回 BOM）
CREATE INDEX idx_bom_finished_product_sort ON bom_components(finished_product_id, sort_order);

-- 创建触发器：自动更新 updated_at 时间戳
CREATE TRIGGER trigger_bom_components_updated_at
BEFORE UPDATE ON bom_components
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 添加表注释
COMMENT ON TABLE bom_components IS 'BOM 组件表，记录成品 SKU 的物料清单';
COMMENT ON COLUMN bom_components.id IS '主键 UUID';
COMMENT ON COLUMN bom_components.finished_product_id IS '成品 SKU ID，外键引用 skus 表';
COMMENT ON COLUMN bom_components.component_id IS '组件 SKU ID，外键引用 skus 表（必须是原料或包材类型）';
COMMENT ON COLUMN bom_components.quantity IS '数量，必须大于 0';
COMMENT ON COLUMN bom_components.unit IS '单位，如：个、ml、g';
COMMENT ON COLUMN bom_components.unit_cost IS '单位成本（元），冗余字段用于快速计算';
COMMENT ON COLUMN bom_components.total_cost IS '总成本（元），计算列 = quantity * unit_cost';
COMMENT ON COLUMN bom_components.is_optional IS '是否可选组件';
COMMENT ON COLUMN bom_components.sort_order IS '排序序号，用于显示顺序';
COMMENT ON COLUMN bom_components.created_at IS '创建时间';
COMMENT ON COLUMN bom_components.updated_at IS '更新时间';

-- ============================================================
-- 套餐子项表（套餐类型 SKU 的子项配置）
-- ============================================================

CREATE TABLE IF NOT EXISTS combo_items (
    -- 主键
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 套餐 SKU ID（外键）
    combo_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,

    -- 子项 SKU ID（外键，可以是原料、包材、成品，但不能是套餐）
    sub_item_id UUID NOT NULL REFERENCES skus(id) ON DELETE RESTRICT,

    -- 数量配置
    quantity DECIMAL(10,3) NOT NULL CHECK (quantity > 0),
    unit VARCHAR(20) NOT NULL,

    -- 成本信息（冗余字段，用于快速计算）
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2) GENERATED ALWAYS AS (quantity * COALESCE(unit_cost, 0)) STORED,

    -- 可选子项标记
    is_optional BOOLEAN DEFAULT FALSE,

    -- 排序序号
    sort_order INTEGER DEFAULT 0,

    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 唯一性约束：一个套餐不能重复添加相同的子项
    CONSTRAINT uk_combo_sub_item UNIQUE (combo_id, sub_item_id)
);

-- 创建索引以优化查询性能

-- 普通索引：套餐 ID（用于查询某个套餐的子项）
CREATE INDEX idx_combo_combo_id ON combo_items(combo_id);

-- 普通索引：子项 ID（用于检查子项被哪些套餐引用）
CREATE INDEX idx_combo_sub_item ON combo_items(sub_item_id);

-- 组合索引：套餐 ID + 排序序号（用于按顺序返回套餐子项）
CREATE INDEX idx_combo_combo_id_sort ON combo_items(combo_id, sort_order);

-- 创建触发器：自动更新 updated_at 时间戳
CREATE TRIGGER trigger_combo_items_updated_at
BEFORE UPDATE ON combo_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 添加表注释
COMMENT ON TABLE combo_items IS '套餐子项表，记录套餐 SKU 的子项配置';
COMMENT ON COLUMN combo_items.id IS '主键 UUID';
COMMENT ON COLUMN combo_items.combo_id IS '套餐 SKU ID，外键引用 skus 表';
COMMENT ON COLUMN combo_items.sub_item_id IS '子项 SKU ID，外键引用 skus 表（不能是套餐类型）';
COMMENT ON COLUMN combo_items.quantity IS '数量，必须大于 0';
COMMENT ON COLUMN combo_items.unit IS '单位，如：个、ml、g';
COMMENT ON COLUMN combo_items.unit_cost IS '单位成本（元），冗余字段用于快速计算';
COMMENT ON COLUMN combo_items.total_cost IS '总成本（元），计算列 = quantity * unit_cost';
COMMENT ON COLUMN combo_items.is_optional IS '是否可选子项';
COMMENT ON COLUMN combo_items.sort_order IS '排序序号，用于显示顺序';
COMMENT ON COLUMN combo_items.created_at IS '创建时间';
COMMENT ON COLUMN combo_items.updated_at IS '更新时间';

-- ============================================================
-- 业务规则触发器：防止套餐包含套餐
-- ============================================================

CREATE OR REPLACE FUNCTION check_combo_no_combo_subitem()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM skus
        WHERE id = NEW.sub_item_id
        AND sku_type = 'combo'
    ) THEN
        RAISE EXCEPTION '套餐不能包含套餐类型的子项';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_combo_no_combo_subitem
BEFORE INSERT OR UPDATE ON combo_items
FOR EACH ROW
EXECUTE FUNCTION check_combo_no_combo_subitem();

-- ============================================================
-- 业务规则触发器：防止 BOM 组件引用成品或套餐
-- ============================================================

CREATE OR REPLACE FUNCTION check_bom_component_type()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM skus
        WHERE id = NEW.component_id
        AND sku_type NOT IN ('raw_material', 'packaging')
    ) THEN
        RAISE EXCEPTION 'BOM 组件必须是原料或包材类型';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_bom_component_type
BEFORE INSERT OR UPDATE ON bom_components
FOR EACH ROW
EXECUTE FUNCTION check_bom_component_type();
