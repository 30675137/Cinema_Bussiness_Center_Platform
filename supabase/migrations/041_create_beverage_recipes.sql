/**
 * @spec O003-beverage-order
 * 创建 beverage_recipes 表 - 饮品配方表
 *
 * Version: V041
 * Date: 2025-12-27
 * Description: 定义饮品的制作配方（BOM），关联规格组合和所需原料
 */

CREATE TABLE beverage_recipes (
  -- 主键
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 外键
  beverage_id UUID NOT NULL REFERENCES beverages(id) ON DELETE CASCADE,

  -- 规格组合（可选）
  spec_combination JSONB,                   -- {"size":"large","temperature":"hot"}

  -- 制作说明
  instructions TEXT,                        -- 制作步骤文本
  preparation_time INTEGER DEFAULT 120,     -- 预计制作时间（秒）

  -- 审计字段
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- 约束（一个饮品+规格组合只有一个配方）
  CONSTRAINT unique_beverage_recipe UNIQUE (beverage_id, spec_combination)
);

-- 索引
CREATE INDEX idx_recipe_beverage ON beverage_recipes(beverage_id);

-- 注释
COMMENT ON TABLE beverage_recipes IS '饮品配方表 - BOM 制作配方';
COMMENT ON COLUMN beverage_recipes.beverage_id IS '关联的饮品 ID';
COMMENT ON COLUMN beverage_recipes.spec_combination IS '规格组合 JSON，NULL 表示基础配方（适用所有规格）';
COMMENT ON COLUMN beverage_recipes.instructions IS '制作步骤文本说明';
COMMENT ON COLUMN beverage_recipes.preparation_time IS '预计制作时间（秒），默认 120 秒';
