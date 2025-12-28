/**
 * @spec O003-beverage-order
 * 添加 recipe_ingredients 表缺失的字段
 *
 * 背景：
 * - V042 创建的表缺少 ingredient_name 和 note 字段
 * - RecipeIngredient 实体类包含这些字段，导致插入失败
 *
 * 修复: BUG-010 - recipe_ingredients 表缺少 ingredient_name 字段
 */

-- 添加 ingredient_name 字段（原料名称，冗余存储用于展示）
ALTER TABLE recipe_ingredients
  ADD COLUMN ingredient_name VARCHAR(100) NOT NULL DEFAULT '';

-- 添加 note 字段（备注信息）
ALTER TABLE recipe_ingredients
  ADD COLUMN note VARCHAR(200);

-- 移除默认值（仅用于迁移现有数据）
ALTER TABLE recipe_ingredients
  ALTER COLUMN ingredient_name DROP DEFAULT;

-- 注释
COMMENT ON COLUMN recipe_ingredients.ingredient_name IS '原料名称（冗余存储，便于展示）';
COMMENT ON COLUMN recipe_ingredients.note IS '备注（如"室温"、"需加热"等）';
