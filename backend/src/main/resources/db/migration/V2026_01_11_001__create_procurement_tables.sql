-- @spec N001-purchase-inbound
-- Migration: N001-purchase-inbound
-- Date: 2026-01-11
-- Description: Create purchase and goods receipt tables

-- 1. Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    contact_name VARCHAR(100),
    contact_phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_code ON suppliers(code);
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);

COMMENT ON TABLE suppliers IS '供应商表';

-- 2. Create purchase_orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(30) NOT NULL UNIQUE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    store_id UUID NOT NULL REFERENCES stores(id),
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    total_amount DECIMAL(12, 2) DEFAULT 0,
    planned_arrival_date DATE,
    remarks VARCHAR(500),
    created_by UUID,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    rejection_reason VARCHAR(500),
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT chk_po_status CHECK (status IN (
        'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED',
        'PARTIAL_RECEIVED', 'FULLY_RECEIVED', 'CLOSED'
    ))
);

CREATE INDEX IF NOT EXISTS idx_po_order_number ON purchase_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_po_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_po_store_id ON purchase_orders(store_id);
CREATE INDEX IF NOT EXISTS idx_po_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_po_created_at ON purchase_orders(created_at DESC);

COMMENT ON TABLE purchase_orders IS '采购订单表';

-- 3. Create purchase_order_items table
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    sku_id UUID NOT NULL REFERENCES skus(id),
    quantity DECIMAL(12, 3) NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    line_amount DECIMAL(12, 2),
    received_qty DECIMAL(12, 3) DEFAULT 0,
    pending_qty DECIMAL(12, 3),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_poi_order_id ON purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_poi_sku_id ON purchase_order_items(sku_id);

COMMENT ON TABLE purchase_order_items IS '采购订单明细表';

-- 4. Create goods_receipts table
CREATE TABLE IF NOT EXISTS goods_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_number VARCHAR(30) NOT NULL UNIQUE,
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id),
    store_id UUID NOT NULL REFERENCES stores(id),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    received_by UUID,
    received_by_name VARCHAR(100),
    received_at TIMESTAMPTZ,
    remarks VARCHAR(500),
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT chk_gr_status CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED'))
);

CREATE INDEX IF NOT EXISTS idx_gr_receipt_number ON goods_receipts(receipt_number);
CREATE INDEX IF NOT EXISTS idx_gr_po_id ON goods_receipts(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_gr_store_id ON goods_receipts(store_id);
CREATE INDEX IF NOT EXISTS idx_gr_status ON goods_receipts(status);

COMMENT ON TABLE goods_receipts IS '收货入库单表';

-- 5. Create goods_receipt_items table
CREATE TABLE IF NOT EXISTS goods_receipt_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goods_receipt_id UUID NOT NULL REFERENCES goods_receipts(id) ON DELETE CASCADE,
    sku_id UUID NOT NULL REFERENCES skus(id),
    ordered_qty DECIMAL(12, 3) NOT NULL,
    received_qty DECIMAL(12, 3) NOT NULL,
    quality_status VARCHAR(20) DEFAULT 'QUALIFIED',
    rejection_reason VARCHAR(200),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT chk_gri_quality CHECK (quality_status IN ('QUALIFIED', 'UNQUALIFIED', 'PENDING_CHECK'))
);

CREATE INDEX IF NOT EXISTS idx_gri_receipt_id ON goods_receipt_items(goods_receipt_id);
CREATE INDEX IF NOT EXISTS idx_gri_sku_id ON goods_receipt_items(sku_id);

COMMENT ON TABLE goods_receipt_items IS '收货入库明细表';

-- 6. Create sequences for order numbers
CREATE SEQUENCE IF NOT EXISTS purchase_order_number_seq START WITH 1;
CREATE SEQUENCE IF NOT EXISTS goods_receipt_number_seq START WITH 1;

-- 7. Create function to generate PO number
CREATE OR REPLACE FUNCTION generate_po_number() RETURNS VARCHAR AS $$
BEGIN
    RETURN 'PO' || to_char(CURRENT_DATE, 'YYYYMMDD')
         || lpad(nextval('purchase_order_number_seq')::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- 8. Create function to generate GR number
CREATE OR REPLACE FUNCTION generate_gr_number() RETURNS VARCHAR AS $$
BEGIN
    RETURN 'GR' || to_char(CURRENT_DATE, 'YYYYMMDD')
         || lpad(nextval('goods_receipt_number_seq')::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- 9. Updated at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;
CREATE TRIGGER update_suppliers_updated_at
    BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_purchase_orders_updated_at ON purchase_orders;
CREATE TRIGGER update_purchase_orders_updated_at
    BEFORE UPDATE ON purchase_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_purchase_order_items_updated_at ON purchase_order_items;
CREATE TRIGGER update_purchase_order_items_updated_at
    BEFORE UPDATE ON purchase_order_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_goods_receipts_updated_at ON goods_receipts;
CREATE TRIGGER update_goods_receipts_updated_at
    BEFORE UPDATE ON goods_receipts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_goods_receipt_items_updated_at ON goods_receipt_items;
CREATE TRIGGER update_goods_receipt_items_updated_at
    BEFORE UPDATE ON goods_receipt_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Add version column to store_inventory if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'store_inventory' AND column_name = 'version'
    ) THEN
        ALTER TABLE store_inventory ADD COLUMN version INTEGER DEFAULT 1;
    END IF;
END $$;

-- 11. Insert test suppliers
INSERT INTO suppliers (code, name, contact_name, contact_phone) VALUES
    ('SUP001', '北京食品供应商', '张三', '13800138001'),
    ('SUP002', '上海饮料批发', '李四', '13900139002'),
    ('SUP003', '广州零食配送', '王五', '13700137003')
ON CONFLICT (code) DO NOTHING;
