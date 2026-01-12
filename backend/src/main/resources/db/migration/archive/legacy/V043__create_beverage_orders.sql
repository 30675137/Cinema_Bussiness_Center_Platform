/**
 * @spec O003-beverage-order
 * 创建 beverage_orders 表 - 饮品订单主表
 *
 * Version: V043
 * Date: 2025-12-27
 * Description: 定义饮品订单的主表，包含订单状态、支付信息、时间追踪等
 */

CREATE TABLE beverage_orders (
  -- 主键
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 订单编号（业务主键）
  order_number VARCHAR(50) NOT NULL UNIQUE, -- "BORDT" + yyyyMMddHHmmss + 4位随机

  -- 用户与门店
  user_id UUID NOT NULL,                    -- 下单用户（关联认证系统）
  store_id UUID NOT NULL,                   -- 门店 ID

  -- 订单金额
  total_price DECIMAL(10,2) NOT NULL,       -- 订单总价

  -- 订单状态
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING_PAYMENT',

  -- 支付信息（MVP 阶段为 Mock）
  payment_method VARCHAR(50),               -- MOCK_WECHAT_PAY
  transaction_id VARCHAR(100),              -- 支付流水号
  paid_at TIMESTAMP,                        -- 支付时间

  -- 时间追踪
  production_start_time TIMESTAMP,          -- 开始制作时间
  completed_at TIMESTAMP,                   -- 完成时间
  delivered_at TIMESTAMP,                   -- 交付时间
  cancelled_at TIMESTAMP,                   -- 取消时间

  -- 顾客备注
  customer_note TEXT,

  -- 审计字段
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- 约束
  CONSTRAINT check_status CHECK (status IN (
    'PENDING_PAYMENT',      -- 待支付
    'PENDING_PRODUCTION',   -- 待制作
    'PRODUCING',            -- 制作中
    'COMPLETED',            -- 已完成（待取餐）
    'DELIVERED',            -- 已交付
    'CANCELLED'             -- 已取消
  )),
  CONSTRAINT check_total_price CHECK (total_price >= 0)
);

-- 索引
CREATE INDEX idx_beverage_order_user ON beverage_orders(user_id, created_at DESC);
CREATE INDEX idx_beverage_order_store_status ON beverage_orders(store_id, status, created_at DESC);
CREATE INDEX idx_beverage_order_number ON beverage_orders(order_number);
CREATE INDEX idx_beverage_order_created_at ON beverage_orders(created_at DESC);

-- 注释
COMMENT ON TABLE beverage_orders IS '饮品订单主表 - 顾客的饮品订单';
COMMENT ON COLUMN beverage_orders.order_number IS '订单号（业务主键）: BORDT + yyyyMMddHHmmss + 4位随机数';
COMMENT ON COLUMN beverage_orders.user_id IS '下单用户 ID';
COMMENT ON COLUMN beverage_orders.store_id IS '门店 ID';
COMMENT ON COLUMN beverage_orders.total_price IS '订单总价';
COMMENT ON COLUMN beverage_orders.status IS '订单状态: PENDING_PAYMENT(待支付), PENDING_PRODUCTION(待制作), PRODUCING(制作中), COMPLETED(已完成), DELIVERED(已交付), CANCELLED(已取消)';
COMMENT ON COLUMN beverage_orders.payment_method IS '支付方式（MVP 阶段为 MOCK_WECHAT_PAY）';
COMMENT ON COLUMN beverage_orders.transaction_id IS '支付流水号';
COMMENT ON COLUMN beverage_orders.paid_at IS '支付时间';
COMMENT ON COLUMN beverage_orders.production_start_time IS '开始制作时间';
COMMENT ON COLUMN beverage_orders.completed_at IS '完成时间';
COMMENT ON COLUMN beverage_orders.delivered_at IS '交付时间';
COMMENT ON COLUMN beverage_orders.cancelled_at IS '取消时间';
COMMENT ON COLUMN beverage_orders.customer_note IS '顾客备注';
