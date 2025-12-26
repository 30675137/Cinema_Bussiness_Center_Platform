-- Migration: P004-inventory-adjustment
-- Date: 2025-12-26
-- Description: Add tables for inventory adjustment management

-- 1. Create adjustment_reasons table (调整原因字典)
CREATE TABLE IF NOT EXISTS adjustment_reasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(50) NOT NULL UNIQUE,
  name varchar(100) NOT NULL,
  category varchar(20) NOT NULL CHECK (category IN ('surplus', 'shortage', 'damage')),
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE adjustment_reasons IS '库存调整原因字典表';
COMMENT ON COLUMN adjustment_reasons.code IS '原因代码';
COMMENT ON COLUMN adjustment_reasons.name IS '原因名称';
COMMENT ON COLUMN adjustment_reasons.category IS '分类：surplus(盘盈)/shortage(盘亏)/damage(报损)';
COMMENT ON COLUMN adjustment_reasons.is_active IS '是否启用';
COMMENT ON COLUMN adjustment_reasons.sort_order IS '排序序号';

-- Insert initial reason data
INSERT INTO adjustment_reasons (code, name, category, sort_order) VALUES
('STOCK_DIFF', '盘点差异', 'surplus', 1),
('STOCK_DIFF_SHORTAGE', '盘点差异', 'shortage', 2),
('GOODS_DAMAGE', '货物损坏', 'damage', 3),
('EXPIRED_WRITE_OFF', '过期报废', 'damage', 4),
('INBOUND_ERROR', '入库错误', 'shortage', 5),
('OTHER_SURPLUS', '其他(盘盈)', 'surplus', 6),
('OTHER_SHORTAGE', '其他(盘亏)', 'shortage', 7),
('OTHER_DAMAGE', '其他(报损)', 'damage', 8)
ON CONFLICT (code) DO NOTHING;

-- 2. Create inventory_adjustments table (库存调整单)
CREATE TABLE IF NOT EXISTS inventory_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  adjustment_number varchar(30) UNIQUE NOT NULL,
  sku_id uuid NOT NULL,
  store_id uuid NOT NULL,
  adjustment_type varchar(20) NOT NULL CHECK (adjustment_type IN ('surplus', 'shortage', 'damage')),
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price decimal(12,2) NOT NULL DEFAULT 0,
  adjustment_amount decimal(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  reason_code varchar(50) NOT NULL,
  reason_text varchar(500),
  remarks varchar(500),
  status varchar(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected', 'withdrawn')),
  stock_before integer NOT NULL DEFAULT 0,
  stock_after integer NOT NULL DEFAULT 0,
  available_before integer NOT NULL DEFAULT 0,
  available_after integer NOT NULL DEFAULT 0,
  requires_approval boolean DEFAULT false,
  operator_id uuid NOT NULL,
  operator_name varchar(100) NOT NULL,
  approved_at timestamptz,
  approved_by uuid,
  transaction_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  version integer DEFAULT 1,
  
  -- Foreign keys
  CONSTRAINT fk_adjustments_reason FOREIGN KEY (reason_code) REFERENCES adjustment_reasons(code)
);

-- Add indexes for inventory_adjustments
CREATE INDEX IF NOT EXISTS idx_adjustments_sku_store ON inventory_adjustments(sku_id, store_id);
CREATE INDEX IF NOT EXISTS idx_adjustments_status ON inventory_adjustments(status);
CREATE INDEX IF NOT EXISTS idx_adjustments_created_at ON inventory_adjustments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_adjustments_operator ON inventory_adjustments(operator_id);
CREATE INDEX IF NOT EXISTS idx_adjustments_requires_approval ON inventory_adjustments(requires_approval) WHERE requires_approval = true;

COMMENT ON TABLE inventory_adjustments IS '库存调整单表';
COMMENT ON COLUMN inventory_adjustments.adjustment_number IS '调整单号，如 ADJ20251226001';
COMMENT ON COLUMN inventory_adjustments.adjustment_type IS '调整类型：surplus(盘盈)/shortage(盘亏)/damage(报损)';
COMMENT ON COLUMN inventory_adjustments.quantity IS '调整数量（始终为正数）';
COMMENT ON COLUMN inventory_adjustments.unit_price IS 'SKU单价';
COMMENT ON COLUMN inventory_adjustments.adjustment_amount IS '调整金额 = quantity × unit_price（自动计算）';
COMMENT ON COLUMN inventory_adjustments.status IS '状态：draft/pending_approval/approved/rejected/withdrawn';
COMMENT ON COLUMN inventory_adjustments.requires_approval IS '是否需要审批（金额>=阈值）';
COMMENT ON COLUMN inventory_adjustments.version IS '乐观锁版本号';

-- 3. Create approval_records table (审批记录)
CREATE TABLE IF NOT EXISTS approval_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  adjustment_id uuid NOT NULL REFERENCES inventory_adjustments(id) ON DELETE CASCADE,
  approver_id uuid NOT NULL,
  approver_name varchar(100) NOT NULL,
  action varchar(20) NOT NULL CHECK (action IN ('approve', 'reject', 'withdraw')),
  status_before varchar(20) NOT NULL,
  status_after varchar(20) NOT NULL,
  comments text,
  action_time timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Add indexes for approval_records
CREATE INDEX IF NOT EXISTS idx_approval_adjustment ON approval_records(adjustment_id);
CREATE INDEX IF NOT EXISTS idx_approval_approver ON approval_records(approver_id);
CREATE INDEX IF NOT EXISTS idx_approval_action_time ON approval_records(action_time DESC);

COMMENT ON TABLE approval_records IS '库存调整审批记录表';
COMMENT ON COLUMN approval_records.action IS '操作类型：approve/reject/withdraw';
COMMENT ON COLUMN approval_records.status_before IS '操作前状态';
COMMENT ON COLUMN approval_records.status_after IS '操作后状态';

-- 4. Extend store_inventory table (add safety_stock and version columns if not exist)
DO $$
BEGIN
  -- Add safety_stock column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'store_inventory' AND column_name = 'safety_stock'
  ) THEN
    ALTER TABLE store_inventory ADD COLUMN safety_stock integer DEFAULT 0 CHECK (safety_stock >= 0);
    COMMENT ON COLUMN store_inventory.safety_stock IS '安全库存阈值（可编辑）';
  END IF;

  -- Add version column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'store_inventory' AND column_name = 'version'
  ) THEN
    ALTER TABLE store_inventory ADD COLUMN version integer DEFAULT 1 NOT NULL;
    COMMENT ON COLUMN store_inventory.version IS '乐观锁版本号';
  END IF;
END $$;

-- 5. Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_adjustment_reasons_updated_at ON adjustment_reasons;
CREATE TRIGGER update_adjustment_reasons_updated_at
  BEFORE UPDATE ON adjustment_reasons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventory_adjustments_updated_at ON inventory_adjustments;
CREATE TRIGGER update_inventory_adjustments_updated_at
  BEFORE UPDATE ON inventory_adjustments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Create sequence for adjustment number (if needed)
CREATE SEQUENCE IF NOT EXISTS adjustment_number_seq START WITH 1;

-- 7. Create function to generate adjustment number
CREATE OR REPLACE FUNCTION generate_adjustment_number()
RETURNS varchar AS $$
DECLARE
  new_number varchar;
  today_str varchar;
  seq_val integer;
BEGIN
  today_str := to_char(CURRENT_DATE, 'YYYYMMDD');
  seq_val := nextval('adjustment_number_seq');
  new_number := 'ADJ' || today_str || lpad(seq_val::text, 4, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- 8. Row Level Security (RLS) policies
ALTER TABLE inventory_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE adjustment_reasons ENABLE ROW LEVEL SECURITY;

-- Public read access for adjustment reasons
DROP POLICY IF EXISTS adjustment_reasons_read ON adjustment_reasons;
CREATE POLICY adjustment_reasons_read ON adjustment_reasons
  FOR SELECT USING (true);

-- Allow all operations for authenticated users on adjustments (simplified for dev)
DROP POLICY IF EXISTS adjustments_authenticated_all ON inventory_adjustments;
CREATE POLICY adjustments_authenticated_all ON inventory_adjustments
  FOR ALL USING (true);

-- Allow all operations for authenticated users on approval_records (simplified for dev)
DROP POLICY IF EXISTS approval_records_authenticated_all ON approval_records;
CREATE POLICY approval_records_authenticated_all ON approval_records
  FOR ALL USING (true);
