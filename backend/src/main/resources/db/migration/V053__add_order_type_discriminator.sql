/**
 * @spec O003-beverage-order
 * 添加订单类型判别器 - 支持统一订单查询
 *
 * Version: V053
 * Date: 2025-12-28
 * Description: 在 product_orders 和 beverage_orders 表添加 order_type 字段，
 *              用于在统一订单列表中区分订单类型
 */

-- 1. 为 product_orders 表添加订单类型字段
ALTER TABLE product_orders
ADD COLUMN IF NOT EXISTS order_type VARCHAR(20) NOT NULL DEFAULT 'PRODUCT';

-- 2. 为 beverage_orders 表添加订单类型字段
ALTER TABLE beverage_orders
ADD COLUMN IF NOT EXISTS order_type VARCHAR(20) NOT NULL DEFAULT 'BEVERAGE';

-- 3. 添加约束
ALTER TABLE product_orders
ADD CONSTRAINT check_product_order_type CHECK (order_type = 'PRODUCT');

ALTER TABLE beverage_orders
ADD CONSTRAINT check_beverage_order_type CHECK (order_type = 'BEVERAGE');

-- 4. 创建索引
CREATE INDEX IF NOT EXISTS idx_product_orders_type ON product_orders(order_type);
CREATE INDEX IF NOT EXISTS idx_beverage_orders_type ON beverage_orders(order_type);

-- 5. 添加注释
COMMENT ON COLUMN product_orders.order_type IS '订单类型: PRODUCT(商品订单)';
COMMENT ON COLUMN beverage_orders.order_type IS '订单类型: BEVERAGE(饮品订单)';

-- 6. 创建统一订单视图（可选，用于快速查询）
CREATE OR REPLACE VIEW unified_orders AS
SELECT
    id,
    order_number,
    user_id,
    status,
    total_amount AS total_price,
    payment_method,
    payment_time AS paid_at,
    created_at,
    updated_at,
    'PRODUCT' AS order_type
FROM product_orders
UNION ALL
SELECT
    id,
    order_number,
    user_id,
    status,
    total_price,
    payment_method,
    paid_at,
    created_at,
    updated_at,
    'BEVERAGE' AS order_type
FROM beverage_orders;

COMMENT ON VIEW unified_orders IS '统一订单视图 - 合并商品订单和饮品订单';
