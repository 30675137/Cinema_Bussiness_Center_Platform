/**
 * @spec O003-beverage-order
 * 创建 beverage_order_status_logs 表 - 订单状态变更日志表
 *
 * Version: V046
 * Date: 2025-12-27
 * Description: 记录订单状态变更历史，用于审计和问题排查
 */

CREATE TABLE beverage_order_status_logs (
  -- 主键
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 外键
  order_id UUID NOT NULL REFERENCES beverage_orders(id) ON DELETE CASCADE,

  -- 状态变更信息
  from_status VARCHAR(20),
  to_status VARCHAR(20) NOT NULL,

  -- 操作人与原因
  changed_by UUID,                          -- 操作人（NULL表示系统自动）
  change_reason TEXT,                       -- 变更原因

  -- 审计字段
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- 约束
  CONSTRAINT check_from_status CHECK (from_status IN (
    'PENDING_PAYMENT', 'PENDING_PRODUCTION', 'PRODUCING', 'COMPLETED', 'DELIVERED', 'CANCELLED'
  )),
  CONSTRAINT check_to_status CHECK (to_status IN (
    'PENDING_PAYMENT', 'PENDING_PRODUCTION', 'PRODUCING', 'COMPLETED', 'DELIVERED', 'CANCELLED'
  ))
);

-- 索引
CREATE INDEX idx_status_log_order ON beverage_order_status_logs(order_id, created_at DESC);

-- 注释
COMMENT ON TABLE beverage_order_status_logs IS '订单状态变更日志表 - 用于审计和问题排查';
COMMENT ON COLUMN beverage_order_status_logs.order_id IS '关联的订单 ID';
COMMENT ON COLUMN beverage_order_status_logs.from_status IS '变更前状态';
COMMENT ON COLUMN beverage_order_status_logs.to_status IS '变更后状态';
COMMENT ON COLUMN beverage_order_status_logs.changed_by IS '操作人 UUID，NULL 表示系统自动变更';
COMMENT ON COLUMN beverage_order_status_logs.change_reason IS '变更原因说明';
