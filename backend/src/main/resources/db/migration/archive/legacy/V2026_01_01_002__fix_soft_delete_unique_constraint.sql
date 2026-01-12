-- ============================================================================
-- @spec O005-channel-product-config
-- Migration: Fix unique constraint to support soft delete
-- Purpose: Replace UNIQUE constraint with partial unique index that excludes deleted records
-- Date: 2026-01-01
-- ============================================================================

-- 1. Drop the old UNIQUE constraint
ALTER TABLE channel_product_config DROP CONSTRAINT IF EXISTS uq_sku_channel;

-- 2. Create a partial unique index that only applies to non-deleted records
-- This allows the same (sku_id, channel_type) combination to exist multiple times
-- if some records are soft-deleted (deleted_at IS NOT NULL)
CREATE UNIQUE INDEX uq_sku_channel_active
ON channel_product_config (sku_id, channel_type)
WHERE deleted_at IS NULL;

-- Add comment
COMMENT ON INDEX uq_sku_channel_active IS '唯一索引：同一 SKU 在同一渠道只能有一条有效配置（排除已删除记录）';
