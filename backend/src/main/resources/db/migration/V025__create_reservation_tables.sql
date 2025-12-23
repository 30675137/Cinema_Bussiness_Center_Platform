-- Migration: Create Reservation Order Tables
-- Feature: U001-reservation-order-management
-- Date: 2025-12-23
-- Description: Creates tables for reservation orders, items, operation logs, and inventory snapshots

-- =============================================
-- 1. 预约单主表 (Reservation Orders)
-- =============================================
CREATE TABLE IF NOT EXISTS reservation_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(20) NOT NULL,
    user_id UUID NOT NULL,
    scenario_package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE RESTRICT,
    package_tier_id UUID NOT NULL REFERENCES package_tiers(id) ON DELETE RESTRICT,
    time_slot_template_id UUID NOT NULL REFERENCES time_slot_templates(id) ON DELETE RESTRICT,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    remark TEXT,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    requires_payment BOOLEAN NOT NULL DEFAULT false,
    payment_id VARCHAR(100),
    payment_time TIMESTAMPTZ,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cancelled_at TIMESTAMPTZ,
    cancel_reason TEXT,
    
    -- 约束
    CONSTRAINT chk_reservation_status CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),
    CONSTRAINT chk_reservation_amount CHECK (total_amount > 0),
    CONSTRAINT chk_reservation_phone CHECK (contact_phone ~ '^1[3-9][0-9]{9}$')
);

-- 预约单唯一索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_reservation_order_number ON reservation_orders(order_number);

-- 预约单查询索引
CREATE INDEX IF NOT EXISTS idx_reservation_user ON reservation_orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reservation_status ON reservation_orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reservation_date ON reservation_orders(reservation_date, reservation_time);
CREATE INDEX IF NOT EXISTS idx_reservation_package ON reservation_orders(scenario_package_id, created_at DESC);

-- 表注释
COMMENT ON TABLE reservation_orders IS '预约单主表（U001-reservation-order-management）';
COMMENT ON COLUMN reservation_orders.order_number IS '预约单号，格式：R+yyyyMMddHHmmss+4位随机数';
COMMENT ON COLUMN reservation_orders.status IS '状态：PENDING(待确认)、CONFIRMED(已确认)、CANCELLED(已取消)、COMPLETED(已完成)';
COMMENT ON COLUMN reservation_orders.requires_payment IS '是否要求支付，运营人员确认时设置';
COMMENT ON COLUMN reservation_orders.version IS '乐观锁版本号';

-- =============================================
-- 2. 预约单加购项明细表 (Reservation Items)
-- =============================================
CREATE TABLE IF NOT EXISTS reservation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_order_id UUID NOT NULL REFERENCES reservation_orders(id) ON DELETE CASCADE,
    addon_item_id UUID NOT NULL REFERENCES addon_items(id) ON DELETE RESTRICT,
    addon_name_snapshot VARCHAR(100) NOT NULL,
    addon_price_snapshot DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- 约束
    CONSTRAINT chk_item_quantity CHECK (quantity > 0),
    CONSTRAINT chk_item_subtotal CHECK (subtotal >= 0)
);

-- 加购项明细索引
CREATE INDEX IF NOT EXISTS idx_item_reservation ON reservation_items(reservation_order_id);

-- 表注释
COMMENT ON TABLE reservation_items IS '预约单加购项明细表';
COMMENT ON COLUMN reservation_items.addon_name_snapshot IS '加购项名称快照（创建时保存）';
COMMENT ON COLUMN reservation_items.addon_price_snapshot IS '加购项单价快照（创建时保存）';

-- =============================================
-- 3. 预约单操作日志表 (Reservation Operation Logs)
-- =============================================
CREATE TABLE IF NOT EXISTS reservation_operation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_order_id UUID NOT NULL REFERENCES reservation_orders(id) ON DELETE CASCADE,
    operation_type VARCHAR(20) NOT NULL,
    operator_id UUID,
    operator_name VARCHAR(100),
    before_value JSONB,
    after_value JSONB NOT NULL,
    operation_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address VARCHAR(45),
    remark TEXT,
    
    -- 约束
    CONSTRAINT chk_log_operation_type CHECK (operation_type IN ('CREATE', 'CONFIRM', 'CANCEL', 'UPDATE', 'PAYMENT'))
);

-- 操作日志索引
CREATE INDEX IF NOT EXISTS idx_log_reservation ON reservation_operation_logs(reservation_order_id, operation_time DESC);
CREATE INDEX IF NOT EXISTS idx_log_operator ON reservation_operation_logs(operator_id, operation_time DESC);

-- 表注释
COMMENT ON TABLE reservation_operation_logs IS '预约单操作日志表（审计追踪）';
COMMENT ON COLUMN reservation_operation_logs.operation_type IS '操作类型：CREATE/CONFIRM/CANCEL/UPDATE/PAYMENT';
COMMENT ON COLUMN reservation_operation_logs.before_value IS '操作前数据快照（JSONB）';
COMMENT ON COLUMN reservation_operation_logs.after_value IS '操作后数据快照（JSONB）';

-- =============================================
-- 4. 时段库存快照表 (Slot Inventory Snapshots)
-- =============================================
CREATE TABLE IF NOT EXISTS slot_inventory_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_order_id UUID NOT NULL REFERENCES reservation_orders(id) ON DELETE CASCADE,
    time_slot_template_id UUID NOT NULL REFERENCES time_slot_templates(id) ON DELETE RESTRICT,
    reservation_date DATE NOT NULL,
    total_capacity INTEGER NOT NULL,
    booked_count INTEGER NOT NULL,
    remaining_capacity INTEGER NOT NULL,
    snapshot_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- 约束
    CONSTRAINT chk_snapshot_capacity CHECK (total_capacity > 0),
    CONSTRAINT chk_snapshot_booked CHECK (booked_count >= 0)
);

-- 库存快照索引（每个预约单只有一个快照）
CREATE UNIQUE INDEX IF NOT EXISTS idx_snapshot_reservation ON slot_inventory_snapshots(reservation_order_id);
CREATE INDEX IF NOT EXISTS idx_snapshot_slot_date ON slot_inventory_snapshots(time_slot_template_id, reservation_date);

-- 表注释
COMMENT ON TABLE slot_inventory_snapshots IS '时段库存快照表（预约创建时记录）';
COMMENT ON COLUMN slot_inventory_snapshots.remaining_capacity IS '预约时的剩余容量';

-- =============================================
-- 5. 触发器：自动更新 updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_reservation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reservation_updated_at ON reservation_orders;
CREATE TRIGGER trg_reservation_updated_at
    BEFORE UPDATE ON reservation_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_reservation_updated_at();

-- =============================================
-- 完成
-- =============================================
-- Migration VU001_001 complete: Created 4 tables for reservation order management
