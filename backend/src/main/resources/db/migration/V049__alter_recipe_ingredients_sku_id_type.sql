/**
 * @spec O003-beverage-order
 * 修改 recipe_ingredients 表 sku_id 字段类型为 UUID
 *
 * 背景：
 * - 原字段类型为 BIGINT，但实际存储的是 UUID 格式
 * - 为保持与 skus 表的 id 类型一致，需要改为 UUID
 *
 * 修复: BUG-009 - 配方创建时类型不匹配
 */

-- 修改 sku_id 字段类型从 BIGINT 改为 UUID
ALTER TABLE recipe_ingredients
  ALTER COLUMN sku_id TYPE UUID USING sku_id::text::uuid;
