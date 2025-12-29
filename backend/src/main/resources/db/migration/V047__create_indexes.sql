/**
 * @spec O003-beverage-order
 * 数据库索引创建 - 补充索引（如需要）
 *
 * Version: V047
 * Date: 2025-12-27
 * Description: 根据 data-model.md Section 6 索引策略创建额外索引
 * Note: 大部分核心索引已在各表创建脚本中内联创建（V001-V008）
 */

-- =====================================================================
-- 索引策略总结（已在 V001-V008 中创建）
-- =====================================================================
--
-- beverages 表:
--   - idx_beverage_category_status: (category, status) WHERE status = 'ACTIVE'
--   - idx_beverage_sort: (sort_order DESC, created_at DESC)
--
-- beverage_specs 表:
--   - idx_spec_beverage: (beverage_id, spec_type)
--
-- beverage_recipes 表:
--   - idx_recipe_beverage: (beverage_id)
--
-- recipe_ingredients 表:
--   - idx_recipe_ingredient: (recipe_id)
--   - idx_ingredient_sku: (sku_id)
--
-- beverage_orders 表:
--   - idx_order_user: (user_id, created_at DESC)
--   - idx_order_store_status: (store_id, status, created_at DESC)
--   - idx_order_number: (order_number)
--   - idx_order_created_at: (created_at DESC)
--
-- beverage_order_items 表:
--   - idx_order_item_order: (order_id)
--   - idx_order_item_beverage: (beverage_id)
--
-- queue_numbers 表:
--   - idx_queue_number: (store_id, date, status)
--   - idx_queue_order: (order_id)
--
-- beverage_order_status_logs 表:
--   - idx_status_log_order: (order_id, created_at DESC)
--
-- =====================================================================

-- 如果未来需要添加额外的性能优化索引，可在此文件追加
-- 例如：
-- CREATE INDEX idx_custom_query ON table_name(column1, column2);

-- 当前 MVP 阶段无需额外索引
