-- ============================================================================
-- @spec O005-channel-product-config
-- Migration: Create channel_product_config table
-- Purpose: Store channel-specific product configurations for mini-program
-- Date: 2026-01-01
-- ============================================================================

-- Create channel_product_config table
CREATE TABLE IF NOT EXISTS channel_product_config (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign Key to skus table
    sku_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,

    -- Channel Configuration
    channel_type VARCHAR(50) NOT NULL DEFAULT 'MINI_PROGRAM',
    display_name VARCHAR(100),
    channel_category VARCHAR(50) NOT NULL,
    channel_price BIGINT,

    -- Images and Description
    main_image TEXT,
    detail_images JSONB DEFAULT '[]'::JSONB,
    description TEXT,

    -- Specifications (JSONB for flexible structure)
    specs JSONB DEFAULT '[]'::JSONB,

    -- Display and Sorting
    is_recommended BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    sort_order INT DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,

    -- Constraints
    CONSTRAINT uq_sku_channel UNIQUE (sku_id, channel_type),
    CONSTRAINT chk_channel_type CHECK (channel_type IN ('MINI_PROGRAM', 'POS', 'DELIVERY', 'ECOMMERCE')),
    CONSTRAINT chk_channel_category CHECK (channel_category IN ('ALCOHOL', 'COFFEE', 'BEVERAGE', 'SNACK', 'MEAL', 'OTHER')),
    CONSTRAINT chk_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'OUT_OF_STOCK')),
    CONSTRAINT chk_channel_price CHECK (channel_price IS NULL OR channel_price > 0),
    CONSTRAINT chk_sort_order CHECK (sort_order >= 0)
);

-- Create indexes for performance
CREATE INDEX idx_channel_product_channel_type ON channel_product_config(channel_type);
CREATE INDEX idx_channel_product_category ON channel_product_config(channel_category);
CREATE INDEX idx_channel_product_status ON channel_product_config(status);
CREATE INDEX idx_channel_product_sku_id ON channel_product_config(sku_id);
CREATE INDEX idx_channel_product_created_at ON channel_product_config(created_at DESC);

-- Add table comments
COMMENT ON TABLE channel_product_config IS '渠道商品配置表，记录 SKU 成品在特定销售渠道的展示配置';
COMMENT ON COLUMN channel_product_config.id IS '配置唯一标识符';
COMMENT ON COLUMN channel_product_config.sku_id IS '关联的 SKU 成品 ID';
COMMENT ON COLUMN channel_product_config.channel_type IS '渠道类型：MINI_PROGRAM/POS/DELIVERY/ECOMMERCE';
COMMENT ON COLUMN channel_product_config.display_name IS '渠道展示名称（空则使用 SKU 名称）';
COMMENT ON COLUMN channel_product_config.channel_category IS '渠道分类：ALCOHOL/COFFEE/BEVERAGE/SNACK/MEAL/OTHER';
COMMENT ON COLUMN channel_product_config.channel_price IS '渠道价格（分），空则使用 SKU 价格';
COMMENT ON COLUMN channel_product_config.main_image IS '主图 URL（空则使用 SKU 主图）';
COMMENT ON COLUMN channel_product_config.detail_images IS '详情图 URL 数组（JSONB）';
COMMENT ON COLUMN channel_product_config.description IS '渠道商品描述';
COMMENT ON COLUMN channel_product_config.specs IS '规格配置 JSONB，结构见 data-model.md';
COMMENT ON COLUMN channel_product_config.is_recommended IS '是否推荐';
COMMENT ON COLUMN channel_product_config.status IS '状态：ACTIVE/INACTIVE/OUT_OF_STOCK';
COMMENT ON COLUMN channel_product_config.sort_order IS '排序序号';
COMMENT ON COLUMN channel_product_config.created_at IS '创建时间';
COMMENT ON COLUMN channel_product_config.updated_at IS '更新时间';
COMMENT ON COLUMN channel_product_config.deleted_at IS '软删除时间';

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_channel_product_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_channel_product_config_updated_at
    BEFORE UPDATE ON channel_product_config
    FOR EACH ROW
    EXECUTE FUNCTION update_channel_product_config_updated_at();
