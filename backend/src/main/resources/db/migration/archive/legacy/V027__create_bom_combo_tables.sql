-- SKU主数据管理 - BOM和套餐表创建脚本
-- 功能: 支持成品BOM配置和套餐子项管理
-- 作者: AI Generated
-- 日期: 2025-12-24

-- 创建BOM组件表
CREATE TABLE IF NOT EXISTS bom_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  finished_product_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
  component_id UUID NOT NULL REFERENCES skus(id) ON DELETE RESTRICT,
  quantity DECIMAL(10,3) NOT NULL CHECK (quantity > 0),
  unit VARCHAR(20) NOT NULL,
  unit_cost DECIMAL(10,2),
  is_optional BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT uk_bom_component UNIQUE (finished_product_id, component_id)
);

-- 创建BOM组件表索引
CREATE INDEX IF NOT EXISTS idx_bom_finished_product ON bom_components(finished_product_id);
CREATE INDEX IF NOT EXISTS idx_bom_component ON bom_components(component_id);

-- BOM表注释
COMMENT ON TABLE bom_components IS 'BOM组件表:成品SKU的物料清单配置';
COMMENT ON COLUMN bom_components.finished_product_id IS '成品SKU ID';
COMMENT ON COLUMN bom_components.component_id IS '组件SKU ID(必须是原料或包材类型)';
COMMENT ON COLUMN bom_components.quantity IS '组件数量';
COMMENT ON COLUMN bom_components.unit IS '组件单位';
COMMENT ON COLUMN bom_components.unit_cost IS '单位成本快照(保存时记录)';
COMMENT ON COLUMN bom_components.is_optional IS '是否可选组件';
COMMENT ON COLUMN bom_components.sort_order IS '排序序号';

-- 创建套餐子项表
CREATE TABLE IF NOT EXISTS combo_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  combo_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
  sub_item_id UUID NOT NULL REFERENCES skus(id) ON DELETE RESTRICT,
  quantity DECIMAL(10,3) NOT NULL CHECK (quantity > 0),
  unit VARCHAR(20) NOT NULL,
  unit_cost DECIMAL(10,2),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT uk_combo_sub_item UNIQUE (combo_id, sub_item_id)
);

-- 创建套餐子项表索引
CREATE INDEX IF NOT EXISTS idx_combo_combo_id ON combo_items(combo_id);
CREATE INDEX IF NOT EXISTS idx_combo_sub_item ON combo_items(sub_item_id);

-- 套餐表注释
COMMENT ON TABLE combo_items IS '套餐子项表:套餐SKU的子项配置';
COMMENT ON COLUMN combo_items.combo_id IS '套餐SKU ID';
COMMENT ON COLUMN combo_items.sub_item_id IS '子项SKU ID(不能是套餐类型,避免嵌套)';
COMMENT ON COLUMN combo_items.quantity IS '子项数量';
COMMENT ON COLUMN combo_items.unit IS '子项单位';
COMMENT ON COLUMN combo_items.unit_cost IS '单位成本快照(保存时记录)';
COMMENT ON COLUMN combo_items.sort_order IS '排序序号';
