-- @spec O004-beverage-sku-reuse
-- Create beverage_sku_mapping table for data migration tracking
-- This table records the mapping from old beverage IDs to new SKU IDs during migration
-- Purpose: Backward compatibility and data traceability during beverage → SKU migration

CREATE TABLE IF NOT EXISTS beverage_sku_mapping (
    -- Primary key: old beverage ID from beverage_config table
    old_beverage_id UUID PRIMARY KEY,

    -- Foreign key to new SKU (must be finished_product type)
    new_sku_id UUID NOT NULL,

    -- Migration timestamp
    migrated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Migration script version for rollback support
    migration_script_version VARCHAR(50) NOT NULL,

    -- Mapping status: active (valid mapping) or deprecated (no longer used)
    status VARCHAR(20) NOT NULL DEFAULT 'active',

    -- Constraints
    CONSTRAINT fk_beverage_sku_mapping_new_sku
        FOREIGN KEY (new_sku_id) REFERENCES skus(id) ON DELETE RESTRICT,

    CONSTRAINT chk_beverage_sku_mapping_status
        CHECK (status IN ('active', 'deprecated'))
);

-- Indexes for query performance
CREATE INDEX idx_beverage_sku_mapping_new_sku_id
    ON beverage_sku_mapping(new_sku_id);

CREATE INDEX idx_beverage_sku_mapping_status
    ON beverage_sku_mapping(status);

-- Comments for documentation
COMMENT ON TABLE beverage_sku_mapping IS
    'Migration mapping table: old beverage_config.id → new skus.id for backward compatibility';

COMMENT ON COLUMN beverage_sku_mapping.old_beverage_id IS
    'Original beverage ID from beverage_config table (primary key)';

COMMENT ON COLUMN beverage_sku_mapping.new_sku_id IS
    'Migrated SKU ID (must reference finished_product type SKU)';

COMMENT ON COLUMN beverage_sku_mapping.migration_script_version IS
    'Flyway migration version that created this mapping (e.g., V2025_12_31_001)';

COMMENT ON COLUMN beverage_sku_mapping.status IS
    'Mapping status: active (valid) or deprecated (no longer in use)';
