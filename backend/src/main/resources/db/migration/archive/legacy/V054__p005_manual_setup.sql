/**
 * @spec P005-bom-inventory-deduction
 * Manual Database Setup - Bypass Flyway Issues
 *
 * Purpose: Manually create all necessary tables for P005 testing
 * This script uses IF NOT EXISTS to avoid conflicts with existing tables
 *
 * Author: Generated for E2E testing
 * Date: 2025-12-29
 */

-- Step 1: Fix store_inventory reserved_qty constraint
-- First reset any bad data
UPDATE store_inventory
SET reserved_qty = 0
WHERE reserved_qty > on_hand_qty;

UPDATE store_inventory
SET available_qty = on_hand_qty - reserved_qty
WHERE available_qty != (on_hand_qty - reserved_qty);

-- Add constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_store_inventory_reserved_lte_on_hand'
    ) THEN
        ALTER TABLE store_inventory
        ADD CONSTRAINT chk_store_inventory_reserved_lte_on_hand
        CHECK (on_hand_qty >= reserved_qty);
    END IF;
END$$;

-- Step 2: Create inventory_reservations table
CREATE TABLE IF NOT EXISTS inventory_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    store_id UUID NOT NULL,
    sku_id UUID NOT NULL,
    quantity NUMERIC(19,4) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    released_at TIMESTAMP,
    CONSTRAINT fk_reservation_sku FOREIGN KEY (sku_id) REFERENCES skus(id),
    CONSTRAINT fk_reservation_store FOREIGN KEY (store_id) REFERENCES stores(id)
);

CREATE INDEX IF NOT EXISTS idx_inventory_reservations_order_id ON inventory_reservations(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_reservations_status ON inventory_reservations(status);

-- Step 3: Create bom_snapshots table
CREATE TABLE IF NOT EXISTS bom_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    finished_sku_id UUID NOT NULL,
    raw_material_sku_id UUID NOT NULL,
    quantity NUMERIC(19,4) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    wastage_rate NUMERIC(5,4) DEFAULT 0,
    bom_level INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_snapshot_finished_sku FOREIGN KEY (finished_sku_id) REFERENCES skus(id),
    CONSTRAINT fk_snapshot_raw_sku FOREIGN KEY (raw_material_sku_id) REFERENCES skus(id)
);

CREATE INDEX IF NOT EXISTS idx_bom_snapshots_order_id ON bom_snapshots(order_id);
CREATE INDEX IF NOT EXISTS idx_bom_snapshots_finished_sku ON bom_snapshots(finished_sku_id);

-- Step 4: Extend inventory_transactions table if needed
DO $$
BEGIN
    -- Add bom_snapshot_id if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'inventory_transactions' AND column_name = 'bom_snapshot_id'
    ) THEN
        ALTER TABLE inventory_transactions ADD COLUMN bom_snapshot_id UUID;
    END IF;

    -- Add transaction_type if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'inventory_transactions' AND column_name = 'transaction_type'
    ) THEN
        ALTER TABLE inventory_transactions ADD COLUMN transaction_type VARCHAR(50);
    END IF;

    -- Add reference_id if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'inventory_transactions' AND column_name = 'reference_id'
    ) THEN
        ALTER TABLE inventory_transactions ADD COLUMN reference_id UUID;
    END IF;
END$$;

-- Step 5: Add comments
COMMENT ON TABLE inventory_reservations IS 'P005: 库存预占记录表，记录每笔订单的库存锁定情况';
COMMENT ON TABLE bom_snapshots IS 'P005: BOM配方快照表，版本锁定用于订单执行';
COMMENT ON COLUMN store_inventory.reserved_qty IS 'P005: 预占库存数量，用于订单库存锁定';
