/**
 * @spec O003-beverage-order
 * 创建 beverage_order_items 表 - 订单商品项表
 *
 * Version: V044
 * Date: 2025-12-27
 * Description: 订单中的具体饮品项，记录下单时的饮品快照（价格、规格等）
 */

CREATE TABLE beverage_order_items (
  -- 主键
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 外键
  order_id UUID NOT NULL REFERENCES beverage_orders(id) ON DELETE CASCADE,
  beverage_id UUID NOT NULL REFERENCES beverages(id) ON DELETE RESTRICT,

  -- 饮品快照（下单时的数据）
  beverage_name VARCHAR(100) NOT NULL,      -- 饮品名称快照
  beverage_image_url TEXT,                  -- 图片快照
  selected_specs JSONB NOT NULL,            -- 选中的规格快照

  -- 数量与价格
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,        -- 单价快照（含规格调整）
  subtotal DECIMAL(10,2) NOT NULL,          -- 小计 = unit_price * quantity

  -- 审计字段
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- 约束
  CONSTRAINT check_quantity CHECK (quantity > 0),
  CONSTRAINT check_unit_price CHECK (unit_price >= 0),
  CONSTRAINT check_subtotal CHECK (subtotal >= 0),
  CONSTRAINT check_subtotal_calculation CHECK (subtotal = unit_price * quantity)
);

-- 索引
CREATE INDEX idx_order_item_order ON beverage_order_items(order_id);
CREATE INDEX idx_order_item_beverage ON beverage_order_items(beverage_id);

-- 注释
COMMENT ON TABLE beverage_order_items IS '订单商品项表 - 订单中的具体饮品项及快照';
COMMENT ON COLUMN beverage_order_items.order_id IS '关联的订单 ID';
COMMENT ON COLUMN beverage_order_items.beverage_id IS '关联的饮品 ID';
COMMENT ON COLUMN beverage_order_items.beverage_name IS '饮品名称快照（下单时的名称）';
COMMENT ON COLUMN beverage_order_items.beverage_image_url IS '饮品图片 URL 快照';
COMMENT ON COLUMN beverage_order_items.selected_specs IS '选中的规格快照 JSON，包含 size/temperature/sweetness/topping';
COMMENT ON COLUMN beverage_order_items.quantity IS '购买数量';
COMMENT ON COLUMN beverage_order_items.unit_price IS '单价快照（含规格调整后的价格）';
COMMENT ON COLUMN beverage_order_items.subtotal IS '小计 = unit_price × quantity';
