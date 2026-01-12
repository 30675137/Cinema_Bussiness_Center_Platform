-- ============================================
-- V0001__create_baseline_schema.sql
-- Cinema Business Center Platform - 基础表结构
-- 用途: 初始化新数据库的完整表结构
-- 注意: 此脚本包含所有基础表，需要在空数据库上执行
-- 创建时间: 2026-01-12
-- ============================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. 基础配置表
-- ============================================

-- 1.1 门店信息表
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    business_hours JSONB,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    province VARCHAR(50),
    city VARCHAR(50),
    district VARCHAR(50),
    version BIGINT DEFAULT 0,
    opening_date DATE,
    area INTEGER CHECK (area IS NULL OR area > 0),
    hall_count INTEGER CHECK (hall_count IS NULL OR hall_count > 0),
    seat_count INTEGER CHECK (seat_count IS NULL OR seat_count > 0),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE stores IS '门店信息表';

-- 1.2 影厅信息表
CREATE TABLE IF NOT EXISTS halls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id),
    code VARCHAR(50),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('VIP', 'PUBLIC', 'CP', 'PARTY')),
    capacity INTEGER NOT NULL CHECK (capacity > 0 AND capacity <= 1000),
    tags TEXT[],
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uk_halls_store_code UNIQUE (store_id, code)
);
COMMENT ON TABLE halls IS '影厅信息表';

-- 1.3 门店预约设置表
CREATE TABLE IF NOT EXISTS store_reservation_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    enabled BOOLEAN DEFAULT true,
    max_days_ahead INTEGER DEFAULT 30,
    time_slots JSONB NOT NULL DEFAULT '[]'::jsonb,
    min_advance_hours INTEGER NOT NULL DEFAULT 1 CHECK (min_advance_hours > 0),
    duration_unit INTEGER NOT NULL DEFAULT 1 CHECK (duration_unit IN (1, 2, 4)),
    deposit_required BOOLEAN NOT NULL DEFAULT FALSE,
    deposit_amount DECIMAL(10, 2) CHECK (deposit_amount IS NULL OR deposit_amount >= 0),
    deposit_percentage INTEGER CHECK (deposit_percentage IS NULL OR (deposit_percentage >= 0 AND deposit_percentage <= 100)),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uk_store_reservation_settings_store UNIQUE (store_id)
);
COMMENT ON TABLE store_reservation_settings IS '门店预约设置表';

-- ============================================
-- 2. 商品主数据表
-- ============================================

-- 2.1 分类表
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL CHECK (TRIM(name) <> ''),
    parent_id UUID REFERENCES categories(id),
    level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 3),
    sort_order INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE categories IS '商品分类表，支持三级分类';

-- 2.2 品牌表
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    english_name VARCHAR(100),
    brand_type VARCHAR(20) DEFAULT 'own' CHECK (brand_type IN ('own', 'agency', 'joint', 'other')),
    primary_categories TEXT[] DEFAULT '{}',
    company VARCHAR(100),
    brand_level VARCHAR(10),
    tags TEXT[] DEFAULT '{}',
    description TEXT,
    logo_url TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'enabled', 'disabled')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);
COMMENT ON TABLE brands IS '品牌管理表';

-- 2.3 单位表
CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    category VARCHAR(20) NOT NULL,
    decimal_places SMALLINT DEFAULT 2 CHECK (decimal_places >= 0 AND decimal_places <= 6),
    is_base_unit BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE units IS '单位主数据表';

-- 2.4 单位换算表
CREATE TABLE IF NOT EXISTS unit_conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_unit VARCHAR(20) NOT NULL,
    to_unit VARCHAR(20) NOT NULL,
    conversion_rate NUMERIC NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('volume', 'weight', 'quantity')),
    CONSTRAINT uk_conversion_from_to UNIQUE (from_unit, to_unit)
);
COMMENT ON TABLE unit_conversions IS '单位换算表';

-- 2.5 供应商表
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    contact_name VARCHAR(50),
    contact_phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE suppliers IS '供应商表';

-- 2.6 物料表
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(20) NOT NULL,
    inventory_unit_id UUID NOT NULL REFERENCES units(id),
    purchase_unit_id UUID NOT NULL REFERENCES units(id),
    conversion_rate NUMERIC CHECK (conversion_rate > 0),
    use_global_conversion BOOLEAN DEFAULT true,
    specification TEXT,
    description TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    standard_cost NUMERIC DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);
COMMENT ON TABLE materials IS '物料主数据表';

-- 2.7 SPU 表
CREATE TABLE IF NOT EXISTS spus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(50),
    description TEXT,
    category_id VARCHAR(50),
    category_name VARCHAR(100),
    brand_id VARCHAR(50),
    brand_name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'draft',
    unit VARCHAR(20),
    tags TEXT[],
    images JSONB DEFAULT '[]',
    specifications JSONB DEFAULT '[]',
    attributes JSONB DEFAULT '[]',
    product_type VARCHAR(30) CHECK (product_type IS NULL OR product_type IN ('raw_material', 'packaging', 'finished_product', 'combo')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);
COMMENT ON TABLE spus IS 'SPU主数据表';

-- 2.8 SKU 表
CREATE TABLE IF NOT EXISTS skus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    spu_id UUID NOT NULL,
    sku_type VARCHAR(30) NOT NULL CHECK (sku_type IN ('raw_material', 'packaging', 'finished_product', 'combo')),
    main_unit VARCHAR(20) NOT NULL,
    store_scope TEXT[] DEFAULT '{}',
    standard_cost NUMERIC,
    waste_rate NUMERIC DEFAULT 0 CHECK (waste_rate >= 0 AND waste_rate <= 100),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'enabled', 'disabled')),
    price NUMERIC DEFAULT 0,
    category_id UUID REFERENCES categories(id),
    version BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
COMMENT ON TABLE skus IS 'SKU主数据表';

-- ============================================
-- 3. 菜单与渠道配置表
-- ============================================

-- 3.1 菜单分类表
CREATE TABLE IF NOT EXISTS menu_category (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL CHECK (code ~ '^[A-Z][A-Z0-9_]*$'),
    display_name VARCHAR(50) NOT NULL CHECK (char_length(display_name) >= 1 AND char_length(display_name) <= 50),
    sort_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    icon_url TEXT,
    description TEXT,
    version BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMPTZ
);
COMMENT ON TABLE menu_category IS '菜单分类表';

-- 3.2 渠道商品配置表
CREATE TABLE IF NOT EXISTS channel_product_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku_id UUID NOT NULL REFERENCES skus(id),
    channel_type VARCHAR(20) DEFAULT 'MINI_PROGRAM' CHECK (channel_type IN ('MINI_PROGRAM', 'POS', 'DELIVERY', 'ECOMMERCE')),
    display_name VARCHAR(100),
    channel_category VARCHAR(20) CHECK (channel_category IN ('ALCOHOL', 'COFFEE', 'BEVERAGE', 'SNACK', 'MEAL', 'OTHER')),
    channel_price BIGINT CHECK (channel_price IS NULL OR channel_price > 0),
    main_image TEXT,
    detail_images JSONB DEFAULT '[]',
    description TEXT,
    specs JSONB DEFAULT '[]',
    is_recommended BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'OUT_OF_STOCK')),
    sort_order INTEGER DEFAULT 0 CHECK (sort_order >= 0),
    category_id UUID REFERENCES menu_category(id),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    deleted_at TIMESTAMP
);
COMMENT ON TABLE channel_product_config IS '渠道商品配置表';

-- ============================================
-- 4. BOM 配方表
-- ============================================

-- 4.1 BOM 组件表
CREATE TABLE IF NOT EXISTS bom_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    finished_product_id UUID NOT NULL REFERENCES skus(id),
    component_id UUID REFERENCES skus(id),
    material_id UUID REFERENCES materials(id),
    component_type VARCHAR(20) DEFAULT 'SKU' CHECK (component_type IN ('SKU', 'MATERIAL')),
    quantity NUMERIC NOT NULL CHECK (quantity > 0),
    unit VARCHAR(20) NOT NULL,
    unit_cost NUMERIC,
    is_optional BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT now(),
    CONSTRAINT chk_bom_component_reference CHECK (
        (component_id IS NOT NULL AND material_id IS NULL) OR 
        (component_id IS NULL AND material_id IS NOT NULL)
    )
);
COMMENT ON TABLE bom_components IS 'BOM组件表';

-- 4.2 套餐子项表
CREATE TABLE IF NOT EXISTS combo_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    combo_id UUID NOT NULL REFERENCES skus(id),
    sub_item_id UUID NOT NULL REFERENCES skus(id),
    quantity NUMERIC NOT NULL CHECK (quantity > 0),
    unit VARCHAR(20) NOT NULL,
    unit_cost NUMERIC,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT now()
);
COMMENT ON TABLE combo_items IS '套餐子项表';

-- ============================================
-- 5. 库存管理表
-- ============================================

-- 5.1 门店库存表
CREATE TABLE IF NOT EXISTS store_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id),
    sku_id UUID REFERENCES skus(id),
    material_id UUID REFERENCES materials(id),
    inventory_item_type VARCHAR(20) DEFAULT 'SKU',
    on_hand_qty NUMERIC DEFAULT 0,
    available_qty NUMERIC DEFAULT 0,
    reserved_qty NUMERIC DEFAULT 0,
    safety_stock NUMERIC DEFAULT 0,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE store_inventory IS '门店库存表';

-- 5.2 库存调整原因表
CREATE TABLE IF NOT EXISTS adjustment_reasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('surplus', 'shortage', 'damage')),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE adjustment_reasons IS '库存调整原因字典表';

-- 5.3 库存调整单表
CREATE TABLE IF NOT EXISTS inventory_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adjustment_number VARCHAR(50) NOT NULL UNIQUE,
    sku_id UUID NOT NULL,
    store_id UUID NOT NULL,
    adjustment_type VARCHAR(20) NOT NULL CHECK (adjustment_type IN ('surplus', 'shortage', 'damage')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC DEFAULT 0,
    adjustment_amount NUMERIC GENERATED ALWAYS AS (quantity::numeric * unit_price) STORED,
    reason_code VARCHAR(50) NOT NULL REFERENCES adjustment_reasons(code),
    reason_text VARCHAR(200),
    remarks VARCHAR(500),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected', 'withdrawn')),
    stock_before INTEGER DEFAULT 0,
    stock_after INTEGER DEFAULT 0,
    available_before INTEGER DEFAULT 0,
    available_after INTEGER DEFAULT 0,
    requires_approval BOOLEAN DEFAULT false,
    operator_id UUID NOT NULL,
    operator_name VARCHAR(100) NOT NULL,
    approved_at TIMESTAMPTZ,
    approved_by UUID,
    transaction_id UUID,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE inventory_adjustments IS '库存调整单表';

-- 5.4 库存流水表
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id),
    sku_id UUID NOT NULL REFERENCES skus(id),
    transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN ('purchase_in', 'sale_out', 'adjustment_in', 'adjustment_out', 'damage_out', 'transfer_in', 'transfer_out', 'return_in', 'return_out', 'safety_stock_update')),
    quantity INTEGER NOT NULL,
    stock_before INTEGER DEFAULT 0,
    stock_after INTEGER DEFAULT 0,
    available_before INTEGER DEFAULT 0,
    available_after INTEGER DEFAULT 0,
    source_type VARCHAR(50),
    source_document VARCHAR(100),
    operator_id UUID,
    operator_name VARCHAR(100),
    remarks TEXT,
    bom_snapshot_id UUID,
    reference_id UUID,
    related_order_id UUID,
    transaction_time TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE inventory_transactions IS '库存流水表';

-- ============================================
-- 6. 采购管理表
-- ============================================

-- 6.1 采购订单表
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    store_id UUID NOT NULL REFERENCES stores(id),
    status VARCHAR(30) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'PARTIAL_RECEIVED', 'FULLY_RECEIVED', 'CLOSED')),
    total_amount NUMERIC DEFAULT 0,
    planned_arrival_date DATE,
    remarks VARCHAR(500),
    created_by UUID,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    rejection_reason VARCHAR(500),
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE purchase_orders IS '采购订单表';

-- 6.2 采购订单明细表
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id),
    sku_id UUID REFERENCES skus(id),
    material_id UUID REFERENCES materials(id),
    item_type VARCHAR(20) NOT NULL,
    material_name VARCHAR(100),
    quantity NUMERIC NOT NULL,
    unit_price NUMERIC NOT NULL,
    line_amount NUMERIC,
    received_qty NUMERIC DEFAULT 0,
    pending_qty NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE purchase_order_items IS '采购订单明细表';

-- 6.3 收货入库单表
CREATE TABLE IF NOT EXISTS goods_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_number VARCHAR(50) NOT NULL UNIQUE,
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id),
    store_id UUID NOT NULL REFERENCES stores(id),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED')),
    received_by UUID,
    received_by_name VARCHAR(100),
    received_at TIMESTAMPTZ,
    remarks VARCHAR(500),
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE goods_receipts IS '收货入库单表';

-- 6.4 收货入库明细表
CREATE TABLE IF NOT EXISTS goods_receipt_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goods_receipt_id UUID NOT NULL REFERENCES goods_receipts(id),
    sku_id UUID REFERENCES skus(id),
    material_id UUID REFERENCES materials(id),
    item_type VARCHAR(20) DEFAULT 'SKU',
    ordered_qty NUMERIC NOT NULL,
    received_qty NUMERIC NOT NULL,
    quality_status VARCHAR(20) DEFAULT 'QUALIFIED' CHECK (quality_status IN ('QUALIFIED', 'UNQUALIFIED', 'PENDING_CHECK')),
    rejection_reason VARCHAR(200),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE goods_receipt_items IS '收货入库明细表';

-- ============================================
-- 7. 订单管理表
-- ============================================

-- 7.1 用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    province VARCHAR(50),
    city VARCHAR(50),
    district VARCHAR(50),
    address VARCHAR(200),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- 7.2 商品订单表
CREATE TABLE IF NOT EXISTS product_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    user_id UUID NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING_PAYMENT',
    order_type VARCHAR(20) DEFAULT 'PRODUCT' CHECK (order_type = 'PRODUCT'),
    product_total NUMERIC NOT NULL,
    shipping_fee NUMERIC DEFAULT 0,
    discount_amount NUMERIC DEFAULT 0,
    total_amount NUMERIC NOT NULL,
    shipping_address JSONB,
    payment_method VARCHAR(50),
    payment_time TIMESTAMP,
    shipped_time TIMESTAMP,
    completed_time TIMESTAMP,
    cancelled_time TIMESTAMP,
    cancel_reason TEXT,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- 7.3 订单商品项表
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES product_orders(id),
    product_id UUID NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    product_spec VARCHAR(100),
    product_image VARCHAR(500),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC NOT NULL,
    subtotal NUMERIC NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

-- 7.4 饮品订单表
CREATE TABLE IF NOT EXISTS beverage_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    user_id UUID NOT NULL,
    store_id UUID NOT NULL,
    order_type VARCHAR(20) DEFAULT 'BEVERAGE' CHECK (order_type = 'BEVERAGE'),
    total_price NUMERIC NOT NULL CHECK (total_price >= 0),
    status VARCHAR(30) DEFAULT 'PENDING_PAYMENT' CHECK (status IN ('PENDING_PAYMENT', 'PENDING_PRODUCTION', 'PRODUCING', 'COMPLETED', 'DELIVERED', 'CANCELLED')),
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    paid_at TIMESTAMP,
    production_start_time TIMESTAMP,
    completed_at TIMESTAMP,
    delivered_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    customer_note TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
COMMENT ON TABLE beverage_orders IS '饮品订单主表';

-- ============================================
-- 8. 创建索引
-- ============================================

CREATE INDEX IF NOT EXISTS idx_stores_status ON stores(status);
CREATE INDEX IF NOT EXISTS idx_halls_store_id ON halls(store_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_skus_spu_id ON skus(spu_id);
CREATE INDEX IF NOT EXISTS idx_skus_status ON skus(status);
CREATE INDEX IF NOT EXISTS idx_store_inventory_store_sku ON store_inventory(store_id, sku_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_store_sku ON inventory_transactions(store_id, sku_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_store ON purchase_orders(store_id);
CREATE INDEX IF NOT EXISTS idx_beverage_orders_store ON beverage_orders(store_id);
CREATE INDEX IF NOT EXISTS idx_beverage_orders_status ON beverage_orders(status);
CREATE INDEX IF NOT EXISTS idx_store_reservation_settings_time_slots ON store_reservation_settings USING GIN (time_slots);
CREATE INDEX IF NOT EXISTS idx_store_reservation_settings_is_active ON store_reservation_settings(is_active);

-- ============================================
-- 9. 创建 Flyway 版本表
-- ============================================

CREATE TABLE IF NOT EXISTS flyway_schema_history (
    installed_rank INTEGER NOT NULL PRIMARY KEY,
    version VARCHAR(50),
    description VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL,
    script VARCHAR(1000) NOT NULL,
    checksum INTEGER,
    installed_by VARCHAR(100) NOT NULL,
    installed_on TIMESTAMP NOT NULL DEFAULT now(),
    execution_time INTEGER NOT NULL,
    success BOOLEAN NOT NULL
);
