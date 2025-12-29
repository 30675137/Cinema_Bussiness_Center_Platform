/**
 * @spec O003-beverage-order
 * 修复 beverage_recipes 表字段名称与实体类不匹配问题
 *
 * Version: V048
 * Date: 2025-12-28
 * Description: 将字段名从 spec_combination/instructions/preparation_time
 *              修改为 applicable_specs/name/description，与 BeverageRecipe 实体类保持一致
 *
 * 问题来源: BUG-007 - beverage_recipes 表字段名不匹配导致查询失败
 */

-- 1. 重命名字段
ALTER TABLE beverage_recipes
  RENAME COLUMN spec_combination TO applicable_specs;

-- 2. 删除不需要的字段
ALTER TABLE beverage_recipes
  DROP COLUMN IF EXISTS instructions,
  DROP COLUMN IF EXISTS preparation_time;

-- 3. 添加新字段
ALTER TABLE beverage_recipes
  ADD COLUMN name VARCHAR(100) NOT NULL DEFAULT 'Default Recipe',
  ADD COLUMN description TEXT;

-- 4. 移除默认值（仅用于迁移）
ALTER TABLE beverage_recipes
  ALTER COLUMN name DROP DEFAULT;

-- 5. 修改 applicable_specs 类型为 TEXT（与实体类一致）
ALTER TABLE beverage_recipes
  ALTER COLUMN applicable_specs TYPE TEXT USING applicable_specs::TEXT;

-- 6. 更新约束（删除旧约束，添加新约束）
ALTER TABLE beverage_recipes
  DROP CONSTRAINT IF EXISTS unique_beverage_recipe;

-- 一个饮品可以有多个配方（通过 name 区分），不再需要唯一约束

-- 7. 更新注释
COMMENT ON COLUMN beverage_recipes.applicable_specs IS '适用规格组合 JSON 字符串，NULL 表示适用所有规格';
COMMENT ON COLUMN beverage_recipes.name IS '配方名称';
COMMENT ON COLUMN beverage_recipes.description IS '配方描述';
