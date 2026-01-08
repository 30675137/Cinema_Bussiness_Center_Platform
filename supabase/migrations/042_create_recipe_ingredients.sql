/**
 * @spec O003-beverage-order
 * 创建 recipe_ingredients 表 - 配方原料关联表
 *
 * Version: V042
 * Date: 2025-12-27
 * Description: 关联饮品配方与具体原料（SKU），定义用量
 * Dependencies: 依赖 P001-sku-master-data 的 skus 表
 */

CREATE TABLE recipe_ingredients (
  -- 主键
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 外键
  recipe_id UUID NOT NULL REFERENCES beverage_recipes(id) ON DELETE CASCADE,
  sku_id UUID NOT NULL REFERENCES skus(id) ON DELETE RESTRICT,  -- 依赖 P001

  -- 用量信息
  quantity DECIMAL(10,3) NOT NULL,          -- 用量（支持小数）
  unit VARCHAR(20) NOT NULL,                -- 单位（g/ml/个）

  -- 审计字段
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- 约束
  CONSTRAINT check_quantity CHECK (quantity > 0),
  CONSTRAINT unique_recipe_sku UNIQUE (recipe_id, sku_id)
);

-- 索引
CREATE INDEX idx_recipe_ingredient ON recipe_ingredients(recipe_id);
CREATE INDEX idx_ingredient_sku ON recipe_ingredients(sku_id);

-- 注释
COMMENT ON TABLE recipe_ingredients IS '配方原料关联表 - 定义配方所需的原料及用量';
COMMENT ON COLUMN recipe_ingredients.recipe_id IS '关联的配方 ID';
COMMENT ON COLUMN recipe_ingredients.sku_id IS '关联的 SKU ID (原料)，外键引用 P001 skus 表';
COMMENT ON COLUMN recipe_ingredients.quantity IS '原料用量（支持小数）';
COMMENT ON COLUMN recipe_ingredients.unit IS '用量单位: g(克), ml(毫升), piece(个)';
