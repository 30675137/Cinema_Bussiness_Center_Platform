-- M001: 物料单位体系统一 - 库存表支持物料
-- 创建时间: 2026-01-14
-- 用途: 扩展库存表,支持管理Material库存和SKU库存

-- 添加字段到 inventory 表
ALTER TABLE inventory
ADD COLUMN material_id UUID,
ADD COLUMN inventory_item_type VARCHAR(20) DEFAULT 'SKU' CHECK (inventory_item_type IN ('SKU', 'MATERIAL'));

-- 添加外键约束
ALTER TABLE inventory
ADD CONSTRAINT fk_inventory_material FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE RESTRICT;

-- 创建索引
CREATE INDEX idx_inventory_material_id ON inventory(material_id);
CREATE INDEX idx_inventory_item_type ON inventory(inventory_item_type);
CREATE INDEX idx_inventory_material_store ON inventory(material_id, store_id) WHERE material_id IS NOT NULL;

-- 添加约束：sku_id 和 material_id 必须有且仅有一个为非空
ALTER TABLE inventory
ADD CONSTRAINT inventory_item_reference_check CHECK (
    (sku_id IS NOT NULL AND material_id IS NULL AND inventory_item_type = 'SKU')
    OR (sku_id IS NULL AND material_id IS NOT NULL AND inventory_item_type = 'MATERIAL')
);

-- 更新唯一性约束
-- 先删除原有唯一约束（如果存在）
ALTER TABLE inventory DROP CONSTRAINT IF EXISTS uk_inventory_sku_store;

-- 创建新的唯一约束（分别针对SKU和Material）
CREATE UNIQUE INDEX uk_inventory_sku_store 
ON inventory(sku_id, store_id) 
WHERE inventory_item_type = 'SKU' AND sku_id IS NOT NULL;

CREATE UNIQUE INDEX uk_inventory_material_store 
ON inventory(material_id, store_id) 
WHERE inventory_item_type = 'MATERIAL' AND material_id IS NOT NULL;

-- 添加列注释
COMMENT ON COLUMN inventory.material_id IS 'M001: 物料ID，当inventory_item_type=MATERIAL时使用';
COMMENT ON COLUMN inventory.inventory_item_type IS 'M001: 库存项类型，SKU(成品/套餐库存) 或 MATERIAL(原料/包材库存)';

-- 添加表注释更新
COMMENT ON TABLE inventory IS '扩展支持：库存可管理SKU(成品/套餐)或Material(原料/包材)';
