/**
 * @spec O003-beverage-order
 * 创建 queue_numbers 表 - 取餐号表
 *
 * Version: V045
 * Date: 2025-12-27
 * Description: 叫号系统的取餐号，每日重置，支持语音播报和顾客取餐
 */

CREATE TABLE queue_numbers (
  -- 主键
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 取餐号
  queue_number VARCHAR(10) NOT NULL,        -- 格式: D001-D999

  -- 外键
  order_id UUID NOT NULL REFERENCES beverage_orders(id) ON DELETE CASCADE,
  store_id UUID NOT NULL,

  -- 日期与序号
  date DATE NOT NULL,                       -- 生成日期（每日重置）
  sequence INTEGER NOT NULL,                -- 当日序号（1-999）

  -- 状态
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  called_at TIMESTAMP,                      -- 叫号时间
  picked_at TIMESTAMP,                      -- 取餐时间

  -- 审计字段
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- 约束
  CONSTRAINT check_status CHECK (status IN ('PENDING', 'CALLED', 'PICKED')),
  CONSTRAINT check_sequence CHECK (sequence >= 1 AND sequence <= 999),
  CONSTRAINT unique_store_date_sequence UNIQUE (store_id, date, sequence),
  CONSTRAINT unique_order UNIQUE (order_id)  -- 一个订单只有一个取餐号
);

-- 索引
CREATE INDEX idx_queue_number ON queue_numbers(store_id, date, status);
CREATE INDEX idx_queue_order ON queue_numbers(order_id);

-- 注释
COMMENT ON TABLE queue_numbers IS '取餐号表 - 叫号系统的取餐号，每日重置';
COMMENT ON COLUMN queue_numbers.queue_number IS '取餐号格式: D001-D999';
COMMENT ON COLUMN queue_numbers.order_id IS '关联的订单 ID（一个订单只有一个取餐号）';
COMMENT ON COLUMN queue_numbers.store_id IS '门店 ID';
COMMENT ON COLUMN queue_numbers.date IS '生成日期（每日重置序号）';
COMMENT ON COLUMN queue_numbers.sequence IS '当日序号 (1-999)';
COMMENT ON COLUMN queue_numbers.status IS '状态: PENDING(待叫号), CALLED(已叫号), PICKED(已取餐)';
COMMENT ON COLUMN queue_numbers.called_at IS '叫号时间';
COMMENT ON COLUMN queue_numbers.picked_at IS '取餐时间';
