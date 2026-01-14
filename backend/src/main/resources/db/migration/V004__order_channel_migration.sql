-- @spec O013-order-channel-migration
-- Migration: Order Module to Channel Product System
-- Date: 2026-01-14
-- Description: Migrate beverage_order_items from beverages table to channel_product_config

-- ============================================================
-- Step 1: Add new columns to beverage_order_items
-- ============================================================

-- 1.1 Add channel_product_id column (nullable initially for existing records)
ALTER TABLE beverage_order_items
ADD COLUMN IF NOT EXISTS channel_product_id UUID;

-- 1.2 Add sku_id column (for inventory deduction, nullable initially)
ALTER TABLE beverage_order_items
ADD COLUMN IF NOT EXISTS sku_id UUID;

-- 1.3 Add product_snapshot column (JSONB for product snapshot)
ALTER TABLE beverage_order_items
ADD COLUMN IF NOT EXISTS product_snapshot JSONB;

-- ============================================================
-- Step 2: Rename columns for clarity
-- ============================================================

-- 2.1 Rename beverage_name to product_name
ALTER TABLE beverage_order_items
RENAME COLUMN beverage_name TO product_name;

-- 2.2 Rename beverage_image_url to product_image_url
ALTER TABLE beverage_order_items
RENAME COLUMN beverage_image_url TO product_image_url;

-- ============================================================
-- Step 3: Drop old foreign key constraint
-- ============================================================

-- 3.1 Drop the beverages foreign key constraint
-- First, find and drop any existing constraint on beverage_id
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    -- Find the constraint name
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'beverage_order_items'::regclass
      AND confrelid = 'beverages'::regclass;
    
    -- Drop if exists
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE beverage_order_items DROP CONSTRAINT %I', constraint_name);
        RAISE NOTICE 'Dropped foreign key constraint: %', constraint_name;
    END IF;
END $$;

-- 3.2 Make beverage_id nullable (it will be deprecated)
ALTER TABLE beverage_order_items
ALTER COLUMN beverage_id DROP NOT NULL;

-- ============================================================
-- Step 4: Add new foreign key constraint
-- ============================================================

-- 4.1 Add foreign key to channel_product_config
-- Note: We use DEFERRABLE for migration flexibility
ALTER TABLE beverage_order_items
ADD CONSTRAINT fk_order_item_channel_product
FOREIGN KEY (channel_product_id) REFERENCES channel_product_config(id)
ON DELETE RESTRICT
DEFERRABLE INITIALLY DEFERRED;

-- ============================================================
-- Step 5: Create indexes for performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_order_item_channel_product 
ON beverage_order_items(channel_product_id);

CREATE INDEX IF NOT EXISTS idx_order_item_sku 
ON beverage_order_items(sku_id);

-- ============================================================
-- Step 6: Add column comments for documentation
-- ============================================================

COMMENT ON COLUMN beverage_order_items.channel_product_id IS 
'@spec O013-order-channel-migration 渠道商品配置 ID，关联 channel_product_config 表';

COMMENT ON COLUMN beverage_order_items.sku_id IS 
'@spec O013-order-channel-migration SKU ID，用于库存扣减，从 channel_product_config.sku_id 获取';

COMMENT ON COLUMN beverage_order_items.product_snapshot IS 
'@spec O013-order-channel-migration 商品快照 JSONB，包含下单时的完整商品信息，确保历史订单数据完整性';

COMMENT ON COLUMN beverage_order_items.product_name IS 
'@spec O013-order-channel-migration 商品名称快照（原 beverage_name）';

COMMENT ON COLUMN beverage_order_items.product_image_url IS 
'@spec O013-order-channel-migration 商品图片 URL 快照（原 beverage_image_url）';

COMMENT ON COLUMN beverage_order_items.beverage_id IS 
'@deprecated @spec O013-order-channel-migration 已废弃字段，保留用于过渡期兼容。新订单使用 channel_product_id';
