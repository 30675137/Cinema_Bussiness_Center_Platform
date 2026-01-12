/**
 * @spec O003-beverage-order
 * 为 beverage_order_items 表添加 customer_note 字段
 *
 * Version: V051
 * Date: 2025-12-28
 * Description: 添加单品备注字段，允许顾客对订单中的每个饮品单独备注（如"少冰"、"多糖"等）
 */

-- 添加 customer_note 字段
ALTER TABLE beverage_order_items
ADD COLUMN IF NOT EXISTS customer_note TEXT;

-- 添加注释
COMMENT ON COLUMN beverage_order_items.customer_note IS '顾客对单个饮品的备注（如"少冰"、"多糖"等）';
