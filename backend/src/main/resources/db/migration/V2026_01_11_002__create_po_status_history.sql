-- @spec N001-purchase-inbound
-- Migration: N001-purchase-inbound status history
-- Date: 2026-01-11
-- Description: Create purchase order status history table

-- Create purchase_order_status_history table
CREATE TABLE IF NOT EXISTS purchase_order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    from_status VARCHAR(30),
    to_status VARCHAR(30) NOT NULL,
    changed_by UUID,
    changed_by_name VARCHAR(100),
    remarks VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT chk_posh_from_status CHECK (from_status IS NULL OR from_status IN (
        'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED',
        'PARTIAL_RECEIVED', 'FULLY_RECEIVED', 'CLOSED'
    )),
    CONSTRAINT chk_posh_to_status CHECK (to_status IN (
        'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED',
        'PARTIAL_RECEIVED', 'FULLY_RECEIVED', 'CLOSED'
    ))
);

CREATE INDEX IF NOT EXISTS idx_posh_po_id ON purchase_order_status_history(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_posh_created_at ON purchase_order_status_history(created_at DESC);

COMMENT ON TABLE purchase_order_status_history IS '采购订单状态变更历史表';
COMMENT ON COLUMN purchase_order_status_history.from_status IS '变更前状态（首次创建时为NULL）';
COMMENT ON COLUMN purchase_order_status_history.to_status IS '变更后状态';
COMMENT ON COLUMN purchase_order_status_history.changed_by IS '操作人ID';
COMMENT ON COLUMN purchase_order_status_history.changed_by_name IS '操作人姓名';
COMMENT ON COLUMN purchase_order_status_history.remarks IS '备注说明';
