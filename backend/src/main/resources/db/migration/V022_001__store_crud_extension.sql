-- ============================================================
-- Feature 022-store-crud Database Migration
-- 门店管理CRUD功能 - 创建操作日志表
-- Note: stores表及version字段已在V007_001中创建
-- ============================================================

-- ============================================================

-- 2. Create store_operation_logs table for audit logging
CREATE TABLE IF NOT EXISTS store_operation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  operation_type VARCHAR(20) NOT NULL CHECK (operation_type IN ('CREATE', 'UPDATE', 'STATUS_CHANGE', 'DELETE')),
  operator_id UUID,
  operator_name VARCHAR(100),
  before_value JSONB,
  after_value JSONB,
  operation_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address VARCHAR(45),
  remark TEXT
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_store_operation_logs_store_id ON store_operation_logs(store_id);
CREATE INDEX IF NOT EXISTS idx_store_operation_logs_operation_time ON store_operation_logs(operation_time DESC);

-- Add table and column comments
COMMENT ON TABLE store_operation_logs IS '门店操作审计日志';
COMMENT ON COLUMN store_operation_logs.operation_type IS '操作类型: CREATE | UPDATE | STATUS_CHANGE | DELETE';
COMMENT ON COLUMN store_operation_logs.before_value IS 'JSON格式的修改前快照(UPDATE/STATUS_CHANGE时有值)';
COMMENT ON COLUMN store_operation_logs.after_value IS 'JSON格式的修改后快照';

-- ============================================================

-- 3. Update existing stores to have default version (if needed)
UPDATE stores
SET version = 0
WHERE version IS NULL;
