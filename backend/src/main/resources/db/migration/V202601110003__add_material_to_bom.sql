-- M001: 物料单位体系统一 - BOM组件表支持双引用
-- 创建时间: 2026-01-14
-- 用途: 扩展BOM组件表,支持引用Material和SKU

-- 添加 material_id 字段到 bom_components 表
ALTER TABLE bom_components
ADD COLUMN material_id UUID,
ADD COLUMN component_type VARCHAR(20) DEFAULT 'SKU' CHECK (component_type IN ('SKU', 'MATERIAL'));

-- 添加外键约束
ALTER TABLE bom_components
ADD CONSTRAINT fk_bom_material FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE RESTRICT;

-- 创建索引
CREATE INDEX idx_bom_material_id ON bom_components(material_id);
CREATE INDEX idx_bom_component_type ON bom_components(component_type);

-- 添加约束：component_id 和 material_id 必须有且仅有一个为非空
ALTER TABLE bom_components
ADD CONSTRAINT bom_component_reference_check CHECK (
    (component_id IS NOT NULL AND material_id IS NULL AND component_type = 'SKU')
    OR (component_id IS NULL AND material_id IS NOT NULL AND component_type = 'MATERIAL')
);

-- 更新唯一性约束，防止重复添加相同组件
-- 先删除原有唯一约束
ALTER TABLE bom_components DROP CONSTRAINT IF EXISTS uk_bom_component;

-- 创建新的唯一约束（支持SKU和Material）
CREATE UNIQUE INDEX uk_bom_sku_component 
ON bom_components(finished_product_id, component_id) 
WHERE component_type = 'SKU' AND component_id IS NOT NULL;

CREATE UNIQUE INDEX uk_bom_material_component 
ON bom_components(finished_product_id, material_id) 
WHERE component_type = 'MATERIAL' AND material_id IS NOT NULL;

-- 添加列注释
COMMENT ON COLUMN bom_components.material_id IS 'M001: 物料ID，当component_type=MATERIAL时使用';
COMMENT ON COLUMN bom_components.component_type IS 'M001: 组件类型，SKU(成品引用SKU) 或 MATERIAL(原料/包材引用Material)';

-- 添加表注释更新
COMMENT ON TABLE bom_components IS '扩展支持：成品BOM可引用SKU或Material。原料/包材组件使用Material，成品组件使用SKU';
