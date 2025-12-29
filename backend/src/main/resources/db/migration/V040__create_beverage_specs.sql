/**
 * @spec O003-beverage-order
 * 创建 beverage_specs 表 - 饮品规格表
 *
 * Version: V040
 * Date: 2025-12-27
 * Description: 定义饮品的可选规格（大小、温度、甜度、配料）及价格调整
 */

CREATE TABLE beverage_specs (
  -- 主键
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 外键
  beverage_id UUID NOT NULL REFERENCES beverages(id) ON DELETE CASCADE,

  -- 规格信息
  spec_type VARCHAR(50) NOT NULL,           -- SIZE/TEMPERATURE/SWEETNESS/TOPPING
  spec_name VARCHAR(50) NOT NULL,           -- 具体规格值（如：小杯/中杯/大杯）
  spec_code VARCHAR(50),                    -- 规格代码（用于配方匹配）
  price_adjustment DECIMAL(10,2) DEFAULT 0, -- 价格调整（±）

  -- 展示与排序
  sort_order INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,         -- 是否默认选中

  -- 审计字段
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- 约束
  CONSTRAINT check_spec_type CHECK (spec_type IN ('SIZE', 'TEMPERATURE', 'SWEETNESS', 'TOPPING')),
  CONSTRAINT unique_beverage_spec UNIQUE (beverage_id, spec_type, spec_name)
);

-- 索引
CREATE INDEX idx_spec_beverage ON beverage_specs(beverage_id, spec_type);

-- 注释
COMMENT ON TABLE beverage_specs IS '饮品规格表 - 饮品的可选规格及价格调整';
COMMENT ON COLUMN beverage_specs.spec_type IS '规格类型: SIZE(容量), TEMPERATURE(温度), SWEETNESS(甜度), TOPPING(配料)';
COMMENT ON COLUMN beverage_specs.spec_name IS '规格名称，如：小杯, 中杯, 大杯';
COMMENT ON COLUMN beverage_specs.spec_code IS '规格代码，用于配方匹配';
COMMENT ON COLUMN beverage_specs.price_adjustment IS '价格调整（可正可负），0表示无调整';
COMMENT ON COLUMN beverage_specs.is_default IS '是否默认选中该规格';
