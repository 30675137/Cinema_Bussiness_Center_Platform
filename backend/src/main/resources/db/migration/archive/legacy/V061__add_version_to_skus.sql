/**
 * @spec P006-fix-sku-edit-data
 * Migration: Add version field to skus table for optimistic locking
 * 
 * This migration adds a version column to support concurrent edit conflict detection
 * as specified in FR-011.
 */

-- Add version column with default value 0
ALTER TABLE skus
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add index for better performance on version checks
CREATE INDEX IF NOT EXISTS idx_skus_version ON skus(version);

-- Update existing rows to have version = 1 (indicating they've been through initial creation)
UPDATE skus SET version = 1 WHERE version = 0;

COMMENT ON COLUMN skus.version IS '乐观锁版本号，用于并发冲突检测 (@spec P006-fix-sku-edit-data)';
