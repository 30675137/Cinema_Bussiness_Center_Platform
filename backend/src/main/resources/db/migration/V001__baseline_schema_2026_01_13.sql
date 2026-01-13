-- ============================================
-- V001__baseline_schema_2026_01_13.sql
-- Cinema Business Center Platform - 完整基础表结构
-- 用途: 初始化新数据库的完整表结构（从 Supabase 生产环境导出）
-- 表数量: 62 个表 (包含 unified_orders 视图)
-- 注意: 此脚本包含所有表结构，需要在空数据库上执行
-- 创建时间: 2026-01-13
-- ============================================

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 枚举类型（幂等性处理）
-- ============================================

DO $$ BEGIN
    CREATE TYPE inventory_item_type AS ENUM ('SKU', 'MATERIAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE material_category AS ENUM ('RAW_MATERIAL', 'PACKAGING');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE unit_category AS ENUM ('VOLUME', 'WEIGHT', 'COUNT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- 第 1 部分: 基础配置表（无外键依赖）
-- ============================================

-- 1.1 门店信息表
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    business_hours JSONB,
    status VARCHAR(20) DEFAULT 'active',
    province VARCHAR(50),
    city VARCHAR(50),
    district VARCHAR(50),
    version BIGINT NOT NULL DEFAULT 0,
    opening_date DATE,
    area INTEGER,
    hall_count INTEGER,
    seat_count INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT stores_code_key UNIQUE (code)
);

-- 1.2 供应商表
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    contact_name VARCHAR(100),
    contact_phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT suppliers_code_key UNIQUE (code)
);

-- 1.3 品牌表
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_code VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    english_name VARCHAR(200),
    brand_type VARCHAR(20) NOT NULL DEFAULT 'own',
    primary_categories TEXT[] DEFAULT '{}',
    company VARCHAR(200),
    brand_level VARCHAR(20),
    tags TEXT[] DEFAULT '{}',
    description TEXT,
    logo_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CONSTRAINT brands_brand_code_key UNIQUE (brand_code)
);

-- 1.4 分类表
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    parent_id UUID,
    level INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT categories_code_key UNIQUE (code),
    CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id)
);

-- 1.5 计量单位表
CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL,
    name VARCHAR(50) NOT NULL,
    category VARCHAR(20) NOT NULL,
    decimal_places SMALLINT NOT NULL DEFAULT 2,
    is_base_unit BOOLEAN NOT NULL DEFAULT false,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT units_code_key UNIQUE (code)
);

-- 1.6 单位换算表
CREATE TABLE IF NOT EXISTS unit_conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_unit VARCHAR(20) NOT NULL,
    to_unit VARCHAR(20) NOT NULL,
    conversion_rate NUMERIC(10,6) NOT NULL,
    category VARCHAR(20) NOT NULL,
    CONSTRAINT uk_conversion_from_to UNIQUE (from_unit, to_unit)
);

-- 1.7 活动类型表
CREATE TABLE IF NOT EXISTS activity_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'ENABLED',
    sort INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 1.8 调整原因表
CREATE TABLE IF NOT EXISTS adjustment_reasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT adjustment_reasons_code_key UNIQUE (code)
);

-- 1.9 用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    province VARCHAR(50),
    city VARCHAR(50),
    district VARCHAR(50),
    address VARCHAR(200),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 1.10 菜单分类表
CREATE TABLE IF NOT EXISTS menu_category (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL,
    display_name VARCHAR(50) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    is_default BOOLEAN NOT NULL DEFAULT false,
    icon_url TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    version BIGINT NOT NULL DEFAULT 0
);

-- 菜单分类 code 唯一索引（支持软删除，用于 ON CONFLICT）
CREATE UNIQUE INDEX IF NOT EXISTS idx_menu_category_code_active 
    ON menu_category(code) WHERE deleted_at IS NULL;

-- 1.11 加购项表
CREATE TABLE IF NOT EXISTS addon_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    image_url TEXT,
    inventory INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.12 饮品表
CREATE TABLE IF NOT EXISTS beverages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    image_url TEXT,
    detail_images JSONB DEFAULT '[]',
    base_price NUMERIC(10,2) NOT NULL,
    nutrition_info JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    is_recommended BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    created_by UUID,
    updated_by UUID
);

-- ============================================
-- 第 2 部分: 依赖基础表的表
-- ============================================

-- 2.1 物料表
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) NOT NULL,
    name VARCHAR(100) NOT NULL,
    category material_category NOT NULL,
    inventory_unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
    purchase_unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
    conversion_rate NUMERIC(12,6),
    use_global_conversion BOOLEAN NOT NULL DEFAULT true,
    specification TEXT,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    standard_cost NUMERIC(12,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CONSTRAINT materials_code_key UNIQUE (code)
);

-- 2.2 影厅表
CREATE TABLE IF NOT EXISTS halls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    code VARCHAR(50),
    name VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL,
    capacity INTEGER NOT NULL,
    tags TEXT[],
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT halls_store_id_code_key UNIQUE (store_id, code)
);

-- 2.3 门店预约设置表
CREATE TABLE IF NOT EXISTS store_reservation_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    is_reservation_enabled BOOLEAN NOT NULL DEFAULT false,
    max_reservation_days INTEGER NOT NULL DEFAULT 0,
    min_advance_hours INTEGER NOT NULL DEFAULT 1,
    duration_unit INTEGER NOT NULL DEFAULT 1,
    deposit_required BOOLEAN NOT NULL DEFAULT false,
    deposit_amount NUMERIC(10,2),
    deposit_percentage INTEGER,
    time_slots JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by VARCHAR(255),
    CONSTRAINT store_reservation_settings_store_id_key UNIQUE (store_id)
);

-- 2.4 门店操作日志表
CREATE TABLE IF NOT EXISTS store_operation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    operation_type VARCHAR(20) NOT NULL,
    operator_id UUID,
    operator_name VARCHAR(100),
    before_value JSONB,
    after_value JSONB,
    operation_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    ip_address VARCHAR(45),
    remark TEXT
);

-- 2.5 SPU表（标准产品单元）
CREATE TABLE IF NOT EXISTS spus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    short_name VARCHAR(100),
    description TEXT,
    category_id VARCHAR(100),
    category_name VARCHAR(200),
    brand_id VARCHAR(100),
    brand_name VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    unit VARCHAR(20),
    tags TEXT[],
    images JSONB DEFAULT '[]',
    specifications JSONB DEFAULT '[]',
    attributes JSONB DEFAULT '[]',
    product_type VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CONSTRAINT spus_code_key UNIQUE (code)
);

-- 2.6 SKU表（库存单位）
CREATE TABLE IF NOT EXISTS skus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    spu_id UUID NOT NULL,
    sku_type VARCHAR(20) NOT NULL,
    main_unit VARCHAR(20) NOT NULL,
    store_scope TEXT[] DEFAULT '{}',
    standard_cost NUMERIC(10,2),
    waste_rate NUMERIC(5,2) DEFAULT 0,
    status VARCHAR(10) NOT NULL DEFAULT 'draft',
    price NUMERIC(10,2) DEFAULT 0,
    category_id UUID REFERENCES categories(id),
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    CONSTRAINT skus_code_key UNIQUE (code)
);

-- 2.7 饮品规格表
CREATE TABLE IF NOT EXISTS beverage_specs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    beverage_id UUID NOT NULL REFERENCES beverages(id) ON DELETE CASCADE,
    spec_type VARCHAR(50) NOT NULL,
    spec_name VARCHAR(50) NOT NULL,
    spec_code VARCHAR(50),
    price_adjustment NUMERIC(10,2) DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT unique_beverage_spec UNIQUE (beverage_id, spec_type, spec_name)
);

-- 2.8 饮品配方表
CREATE TABLE IF NOT EXISTS beverage_recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    beverage_id UUID NOT NULL REFERENCES beverages(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    applicable_specs TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 2.9 饮品订单表
CREATE TABLE IF NOT EXISTS beverage_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) NOT NULL,
    user_id UUID NOT NULL,
    store_id UUID NOT NULL,
    total_price NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING_PAYMENT',
    order_type VARCHAR(20) NOT NULL DEFAULT 'BEVERAGE',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    paid_at TIMESTAMP,
    production_start_time TIMESTAMP,
    completed_at TIMESTAMP,
    delivered_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    customer_note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT beverage_orders_order_number_key UNIQUE (order_number)
);

-- 2.10 场景套餐表
CREATE TABLE IF NOT EXISTS scenario_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_package_id UUID,
    version INTEGER NOT NULL DEFAULT 1,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image TEXT,
    category VARCHAR(50),
    rating NUMERIC(3,2),
    tags JSONB DEFAULT '[]',
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    is_latest BOOLEAN NOT NULL DEFAULT true,
    version_lock INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_by VARCHAR(100)
);

-- 自引用外键（场景套餐版本）
DO $$ BEGIN
    ALTER TABLE scenario_packages ADD CONSTRAINT fk_base_package 
        FOREIGN KEY (base_package_id) REFERENCES scenario_packages(id) ON DELETE RESTRICT;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2.11 采购订单表
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(30) NOT NULL,
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    store_id UUID NOT NULL REFERENCES stores(id),
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    total_amount NUMERIC(12,2) DEFAULT 0,
    planned_arrival_date DATE,
    remarks VARCHAR(500),
    created_by UUID,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    rejection_reason VARCHAR(500),
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT purchase_orders_order_number_key UNIQUE (order_number)
);

-- 2.12 商品订单表
CREATE TABLE IF NOT EXISTS product_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(20) NOT NULL,
    user_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING_PAYMENT',
    order_type VARCHAR(20) NOT NULL DEFAULT 'PRODUCT',
    product_total NUMERIC(10,2) NOT NULL,
    shipping_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(10,2) NOT NULL,
    shipping_address JSONB,
    payment_method VARCHAR(20),
    payment_time TIMESTAMP,
    shipped_time TIMESTAMP,
    completed_time TIMESTAMP,
    cancelled_time TIMESTAMP,
    cancel_reason TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT product_orders_order_number_key UNIQUE (order_number)
);

-- ============================================
-- 第 3 部分: 二级依赖表
-- ============================================

-- 3.1 渠道商品配置表
CREATE TABLE IF NOT EXISTS channel_product_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
    channel_type VARCHAR(50) NOT NULL DEFAULT 'MINI_PROGRAM',
    display_name VARCHAR(100),
    channel_category VARCHAR(50) NOT NULL,
    channel_price BIGINT,
    main_image TEXT,
    detail_images JSONB DEFAULT '[]',
    description TEXT,
    specs JSONB DEFAULT '[]',
    is_recommended BOOLEAN DEFAULT false,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    sort_order INTEGER DEFAULT 0,
    category_id UUID REFERENCES menu_category(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    deleted_at TIMESTAMP
);

-- 3.2 组合商品明细表
CREATE TABLE IF NOT EXISTS combo_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    combo_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
    sub_item_id UUID NOT NULL REFERENCES skus(id) ON DELETE RESTRICT,
    quantity NUMERIC(10,3) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    unit_cost NUMERIC(10,2),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT now(),
    CONSTRAINT uk_combo_sub_item UNIQUE (combo_id, sub_item_id)
);

-- 3.3 BOM组件表
CREATE TABLE IF NOT EXISTS bom_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    finished_product_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
    component_id UUID REFERENCES skus(id) ON DELETE RESTRICT,
    material_id UUID REFERENCES materials(id) ON DELETE RESTRICT,
    component_type VARCHAR(20) NOT NULL DEFAULT 'SKU',
    quantity NUMERIC(10,3) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    unit_cost NUMERIC(10,2),
    is_optional BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT now()
);

-- 3.4 门店库存表
CREATE TABLE IF NOT EXISTS store_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    sku_id UUID REFERENCES skus(id) ON DELETE CASCADE,
    material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
    inventory_item_type VARCHAR(20) NOT NULL DEFAULT 'SKU',
    on_hand_qty NUMERIC(12,3) NOT NULL DEFAULT 0,
    available_qty NUMERIC(12,3) NOT NULL DEFAULT 0,
    reserved_qty NUMERIC(12,3) NOT NULL DEFAULT 0,
    safety_stock NUMERIC(12,3) DEFAULT 0,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.5 库存调整表
CREATE TABLE IF NOT EXISTS inventory_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adjustment_number VARCHAR(30) NOT NULL,
    sku_id UUID NOT NULL,
    store_id UUID NOT NULL,
    adjustment_type VARCHAR(20) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    adjustment_amount NUMERIC(12,2),
    reason_code VARCHAR(50) NOT NULL REFERENCES adjustment_reasons(code),
    reason_text VARCHAR(500),
    remarks VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    stock_before INTEGER NOT NULL DEFAULT 0,
    stock_after INTEGER NOT NULL DEFAULT 0,
    available_before INTEGER NOT NULL DEFAULT 0,
    available_after INTEGER NOT NULL DEFAULT 0,
    requires_approval BOOLEAN DEFAULT false,
    operator_id UUID NOT NULL,
    operator_name VARCHAR(100) NOT NULL,
    approved_at TIMESTAMPTZ,
    approved_by UUID,
    transaction_id UUID,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT inventory_adjustments_adjustment_number_key UNIQUE (adjustment_number)
);

-- 3.6 库存事务表
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id),
    sku_id UUID NOT NULL REFERENCES skus(id),
    transaction_type VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL,
    stock_before INTEGER NOT NULL DEFAULT 0,
    stock_after INTEGER NOT NULL DEFAULT 0,
    available_before INTEGER NOT NULL DEFAULT 0,
    available_after INTEGER NOT NULL DEFAULT 0,
    source_type VARCHAR(50),
    source_document VARCHAR(100),
    operator_id UUID,
    operator_name VARCHAR(100),
    remarks TEXT,
    bom_snapshot_id UUID,
    reference_id UUID,
    related_order_id UUID,
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.7 库存预留表
CREATE TABLE IF NOT EXISTS inventory_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    store_id UUID NOT NULL REFERENCES stores(id),
    sku_id UUID NOT NULL REFERENCES skus(id),
    quantity NUMERIC(19,4) NOT NULL,
    reserved_quantity NUMERIC(15,4) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    expires_at TIMESTAMPTZ,
    fulfilled_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    released_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3.8 饮品订单项表
CREATE TABLE IF NOT EXISTS beverage_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES beverage_orders(id) ON DELETE CASCADE,
    beverage_id UUID NOT NULL REFERENCES beverages(id) ON DELETE RESTRICT,
    beverage_name VARCHAR(100) NOT NULL,
    beverage_image_url TEXT,
    selected_specs JSONB NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    customer_note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 3.9 饮品订单状态日志表
CREATE TABLE IF NOT EXISTS beverage_order_status_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES beverage_orders(id) ON DELETE CASCADE,
    from_status VARCHAR(20),
    to_status VARCHAR(20) NOT NULL,
    changed_by UUID,
    change_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 3.10 取餐号表
CREATE TABLE IF NOT EXISTS queue_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    queue_number VARCHAR(10) NOT NULL,
    order_id UUID NOT NULL REFERENCES beverage_orders(id) ON DELETE CASCADE,
    store_id UUID NOT NULL,
    date DATE NOT NULL,
    sequence INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    called_at TIMESTAMP,
    picked_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT unique_order UNIQUE (order_id),
    CONSTRAINT unique_store_date_sequence UNIQUE (store_id, date, sequence)
);

-- 3.11 配方原料表
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES beverage_recipes(id) ON DELETE CASCADE,
    sku_id UUID NOT NULL REFERENCES skus(id) ON DELETE RESTRICT,
    ingredient_name VARCHAR(100) NOT NULL,
    quantity NUMERIC(10,3) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    note VARCHAR(200),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT unique_recipe_sku UNIQUE (recipe_id, sku_id)
);

-- 3.12 饮品-SKU映射表
CREATE TABLE IF NOT EXISTS beverage_sku_mapping (
    old_beverage_id UUID NOT NULL,
    new_sku_id UUID NOT NULL REFERENCES skus(id) ON DELETE RESTRICT,
    migrated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    migration_script_version VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active'
);

-- 3.13 套餐层级表
CREATE TABLE IF NOT EXISTS package_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    original_price NUMERIC(10,2),
    tags JSONB,
    service_description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.14 时间段模板表
CREATE TABLE IF NOT EXISTS time_slot_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    capacity INTEGER,
    price_adjustment JSONB,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.15 时间段覆盖表
CREATE TABLE IF NOT EXISTS time_slot_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE CASCADE,
    override_date DATE NOT NULL,
    override_type VARCHAR(20) NOT NULL,
    start_time TIME,
    end_time TIME,
    capacity INTEGER,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.16 套餐定价表
CREATE TABLE IF NOT EXISTS package_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE CASCADE,
    package_price NUMERIC(10,2) NOT NULL,
    reference_price_snapshot NUMERIC(10,2),
    discount_percentage NUMERIC(5,2),
    discount_amount NUMERIC(10,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT package_pricing_package_id_key UNIQUE (package_id)
);

-- 3.17 套餐规则表
CREATE TABLE IF NOT EXISTS package_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE CASCADE,
    duration_hours NUMERIC(5,2) NOT NULL,
    min_people INTEGER,
    max_people INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT package_rules_package_id_key UNIQUE (package_id)
);

-- 3.18 套餐商品表
CREATE TABLE IF NOT EXISTS package_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE CASCADE,
    item_id UUID NOT NULL,
    quantity INTEGER NOT NULL,
    item_name_snapshot VARCHAR(255) NOT NULL,
    item_price_snapshot NUMERIC(10,2) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.19 套餐服务表
CREATE TABLE IF NOT EXISTS package_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE CASCADE,
    service_id UUID NOT NULL,
    service_name_snapshot VARCHAR(255) NOT NULL,
    service_price_snapshot NUMERIC(10,2) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.20 套餐权益表
CREATE TABLE IF NOT EXISTS package_benefits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE CASCADE,
    benefit_type VARCHAR(50) NOT NULL,
    discount_rate NUMERIC(5,2),
    free_count INTEGER,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.21 套餐加购表
CREATE TABLE IF NOT EXISTS package_addons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE CASCADE,
    addon_item_id UUID NOT NULL REFERENCES addon_items(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_required BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT package_addons_package_id_addon_item_id_key UNIQUE (package_id, addon_item_id)
);

-- 3.22 套餐影厅关联表
CREATE TABLE IF NOT EXISTS package_hall_associations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE CASCADE,
    hall_type_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT package_hall_associations_package_id_hall_type_id_key UNIQUE (package_id, hall_type_id)
);

-- 3.23 套餐门店关联表
CREATE TABLE IF NOT EXISTS scenario_package_store_associations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by VARCHAR(100),
    CONSTRAINT unique_package_store UNIQUE (package_id, store_id)
);

-- 3.24 采购订单明细表
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    sku_id UUID REFERENCES skus(id),
    material_id UUID REFERENCES materials(id) ON DELETE RESTRICT,
    item_type VARCHAR(20) NOT NULL,
    material_name VARCHAR(200),
    quantity NUMERIC(12,3) NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL,
    line_amount NUMERIC(12,2),
    received_qty NUMERIC(12,3) DEFAULT 0,
    pending_qty NUMERIC(12,3),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3.25 采购订单状态历史表
CREATE TABLE IF NOT EXISTS purchase_order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    from_status VARCHAR(30),
    to_status VARCHAR(30) NOT NULL,
    changed_by UUID,
    changed_by_name VARCHAR(100),
    remarks VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3.26 收货单表
CREATE TABLE IF NOT EXISTS goods_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_number VARCHAR(30) NOT NULL,
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
    CONSTRAINT goods_receipts_receipt_number_key UNIQUE (receipt_number)
);

-- 3.27 订单项表
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES product_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    product_spec VARCHAR(100),
    product_image VARCHAR(500),
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 3.28 订单日志表
CREATE TABLE IF NOT EXISTS order_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES product_orders(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    status_before VARCHAR(20),
    status_after VARCHAR(20),
    operator_id UUID NOT NULL,
    operator_name VARCHAR(100) NOT NULL,
    comments TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- ============================================
-- 第 4 部分: 三级依赖表
-- ============================================

-- 4.1 审批记录表
CREATE TABLE IF NOT EXISTS approval_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adjustment_id UUID NOT NULL REFERENCES inventory_adjustments(id) ON DELETE CASCADE,
    approver_id UUID NOT NULL,
    approver_name VARCHAR(100) NOT NULL,
    action VARCHAR(20) NOT NULL,
    status_before VARCHAR(20) NOT NULL,
    status_after VARCHAR(20) NOT NULL,
    comments TEXT,
    action_time TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4.2 收货单明细表
CREATE TABLE IF NOT EXISTS goods_receipt_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goods_receipt_id UUID NOT NULL REFERENCES goods_receipts(id) ON DELETE CASCADE,
    sku_id UUID REFERENCES skus(id),
    material_id UUID REFERENCES materials(id),
    item_type VARCHAR(20) NOT NULL DEFAULT 'SKU',
    ordered_qty NUMERIC(12,3) NOT NULL,
    received_qty NUMERIC(12,3) NOT NULL,
    quality_status VARCHAR(20) DEFAULT 'QUALIFIED',
    rejection_reason VARCHAR(200),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4.3 预约订单表
CREATE TABLE IF NOT EXISTS reservation_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(20) NOT NULL,
    user_id UUID NOT NULL,
    scenario_package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE RESTRICT,
    package_tier_id UUID NOT NULL REFERENCES package_tiers(id) ON DELETE RESTRICT,
    time_slot_template_id UUID NOT NULL REFERENCES time_slot_templates(id) ON DELETE RESTRICT,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    remark TEXT,
    total_amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    requires_payment BOOLEAN NOT NULL DEFAULT false,
    payment_id VARCHAR(100),
    payment_time TIMESTAMPTZ,
    version BIGINT NOT NULL DEFAULT 0,
    cancelled_at TIMESTAMPTZ,
    cancel_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4.4 BOM快照表
CREATE TABLE IF NOT EXISTS bom_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    finished_sku_id UUID NOT NULL REFERENCES skus(id),
    raw_material_sku_id UUID NOT NULL REFERENCES skus(id),
    quantity NUMERIC(19,4) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    wastage_rate NUMERIC(5,4) DEFAULT 0,
    bom_level INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4.5 分类审计日志表
CREATE TABLE IF NOT EXISTS category_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL,
    before_data JSONB,
    after_data JSONB,
    change_description TEXT,
    affected_product_count INTEGER DEFAULT 0,
    operator_id UUID,
    operator_name VARCHAR(100),
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 第 5 部分: 四级依赖表
-- ============================================

-- 5.1 预约项目表
CREATE TABLE IF NOT EXISTS reservation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_order_id UUID NOT NULL REFERENCES reservation_orders(id) ON DELETE CASCADE,
    addon_item_id UUID NOT NULL REFERENCES addon_items(id) ON DELETE RESTRICT,
    addon_name_snapshot VARCHAR(100) NOT NULL,
    addon_price_snapshot NUMERIC(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5.2 预约操作日志表
CREATE TABLE IF NOT EXISTS reservation_operation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_order_id UUID NOT NULL REFERENCES reservation_orders(id) ON DELETE CASCADE,
    operation_type VARCHAR(20) NOT NULL,
    operator_id UUID,
    operator_name VARCHAR(100),
    before_value JSONB,
    after_value JSONB NOT NULL,
    operation_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    ip_address VARCHAR(45),
    remark TEXT
);

-- 5.3 时间段库存快照表
CREATE TABLE IF NOT EXISTS slot_inventory_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_order_id UUID NOT NULL REFERENCES reservation_orders(id) ON DELETE CASCADE,
    time_slot_template_id UUID NOT NULL REFERENCES time_slot_templates(id) ON DELETE RESTRICT,
    reservation_date DATE NOT NULL,
    total_capacity INTEGER NOT NULL,
    booked_count INTEGER NOT NULL,
    remaining_capacity INTEGER NOT NULL,
    snapshot_time TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 第 6 部分: 视图
-- ============================================

-- 6.1 统一订单视图
CREATE OR REPLACE VIEW unified_orders AS
SELECT 
    id,
    order_number,
    user_id,
    status,
    total_price,
    payment_method,
    paid_at,
    created_at,
    updated_at,
    order_type
FROM beverage_orders
UNION ALL
SELECT 
    id,
    order_number,
    user_id,
    status,
    total_amount as total_price,
    payment_method,
    payment_time as paid_at,
    created_at,
    updated_at,
    order_type
FROM product_orders;

-- ============================================
-- 第 7 部分: 索引
-- ============================================

-- 门店相关索引
CREATE INDEX IF NOT EXISTS idx_halls_store_id ON halls(store_id);
CREATE INDEX IF NOT EXISTS idx_store_inventory_store_id ON store_inventory(store_id);
CREATE INDEX IF NOT EXISTS idx_store_inventory_sku_id ON store_inventory(sku_id);
CREATE INDEX IF NOT EXISTS idx_store_inventory_material_id ON store_inventory(material_id);

-- 库存相关索引
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_store_sku ON inventory_transactions(store_id, sku_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_time ON inventory_transactions(transaction_time);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_store_sku ON inventory_adjustments(store_id, sku_id);
CREATE INDEX IF NOT EXISTS idx_inventory_reservations_order ON inventory_reservations(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_reservations_store_sku ON inventory_reservations(store_id, sku_id);

-- 订单相关索引
CREATE INDEX IF NOT EXISTS idx_beverage_orders_user_id ON beverage_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_beverage_orders_store_id ON beverage_orders(store_id);
CREATE INDEX IF NOT EXISTS idx_beverage_orders_status ON beverage_orders(status);
CREATE INDEX IF NOT EXISTS idx_beverage_order_items_order_id ON beverage_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_product_orders_user_id ON product_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_product_orders_status ON product_orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- 采购相关索引
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_store_id ON purchase_orders(store_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_po_id ON purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipts_po_id ON goods_receipts(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipt_items_gr_id ON goods_receipt_items(goods_receipt_id);

-- 商品相关索引
CREATE INDEX IF NOT EXISTS idx_skus_spu_id ON skus(spu_id);
CREATE INDEX IF NOT EXISTS idx_skus_category_id ON skus(category_id);
CREATE INDEX IF NOT EXISTS idx_skus_status ON skus(status);
CREATE INDEX IF NOT EXISTS idx_channel_product_config_sku_id ON channel_product_config(sku_id);
CREATE INDEX IF NOT EXISTS idx_channel_product_config_category_id ON channel_product_config(category_id);
CREATE INDEX IF NOT EXISTS idx_bom_components_finished_product ON bom_components(finished_product_id);

-- 预约相关索引
CREATE INDEX IF NOT EXISTS idx_reservation_orders_user_id ON reservation_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_reservation_orders_package_id ON reservation_orders(scenario_package_id);
CREATE INDEX IF NOT EXISTS idx_reservation_orders_date ON reservation_orders(reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservation_orders_status ON reservation_orders(status);
CREATE INDEX IF NOT EXISTS idx_time_slot_templates_package_id ON time_slot_templates(package_id);
CREATE INDEX IF NOT EXISTS idx_package_tiers_package_id ON package_tiers(package_id);

-- 场景套餐相关索引
CREATE INDEX IF NOT EXISTS idx_scenario_packages_status ON scenario_packages(status);
CREATE INDEX IF NOT EXISTS idx_scenario_packages_is_latest ON scenario_packages(is_latest);
CREATE INDEX IF NOT EXISTS idx_scenario_package_store_package_id ON scenario_package_store_associations(package_id);
CREATE INDEX IF NOT EXISTS idx_scenario_package_store_store_id ON scenario_package_store_associations(store_id);

-- 物料相关索引
CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category);
CREATE INDEX IF NOT EXISTS idx_materials_status ON materials(status);
