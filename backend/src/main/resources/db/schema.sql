-- ============================================================
-- Cinema Business Center Platform - 建表脚本 (DDL)
-- 生成时间: 2026-01-12
-- 说明: 此脚本包含所有表结构定义，需按顺序执行
-- ============================================================

-- 注意: 使用 PostgreSQL 内置的 gen_random_uuid() 函数，无需额外扩展

-- ============================================================
-- 1. 基础主数据表
-- ============================================================

-- 单位主数据表
CREATE TABLE IF NOT EXISTS units (
                                     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                     code VARCHAR(20) NOT NULL UNIQUE,
                                     name VARCHAR(50) NOT NULL,
                                     category VARCHAR(20) NOT NULL,
                                     decimal_places SMALLINT NOT NULL DEFAULT 2 CHECK (decimal_places >= 0 AND decimal_places <= 6),
                                     is_base_unit BOOLEAN NOT NULL DEFAULT false,
                                     description TEXT,
                                     created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                     updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE units IS '单位主数据表 - Unit master data';

-- 单位换算表
CREATE TABLE IF NOT EXISTS unit_conversions (
                                                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                                from_unit VARCHAR(20) NOT NULL,
                                                to_unit VARCHAR(20) NOT NULL,
                                                conversion_rate NUMERIC(12,6) NOT NULL,
                                                category VARCHAR(20) NOT NULL CHECK (category IN ('volume', 'weight', 'quantity'))
);
COMMENT ON TABLE unit_conversions IS '单位换算表:支持体积、重量、数量单位转换';

-- 分类表
CREATE TABLE IF NOT EXISTS categories (
                                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                          code VARCHAR(50) NOT NULL UNIQUE,
                                          name VARCHAR(100) NOT NULL CHECK (TRIM(name) <> ''),
                                          parent_id UUID REFERENCES categories(id),
                                          level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1 AND level <= 3),
                                          sort_order INTEGER NOT NULL DEFAULT 0,
                                          status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
                                          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                                          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 品牌管理表
CREATE TABLE IF NOT EXISTS brands (
                                      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                      brand_code VARCHAR(50) NOT NULL UNIQUE,
                                      name VARCHAR(100) NOT NULL,
                                      english_name VARCHAR(100),
                                      brand_type VARCHAR(20) NOT NULL DEFAULT 'own' CHECK (brand_type IN ('own', 'agency', 'joint', 'other')),
                                      primary_categories TEXT[] DEFAULT '{}',
                                      company VARCHAR(200),
                                      brand_level VARCHAR(10),
                                      tags TEXT[] DEFAULT '{}',
                                      description TEXT,
                                      logo_url TEXT,
                                      status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'enabled', 'disabled')),
                                      created_at TIMESTAMPTZ DEFAULT now(),
                                      updated_at TIMESTAMPTZ DEFAULT now(),
                                      created_by VARCHAR(100),
                                      updated_by VARCHAR(100)
);
COMMENT ON TABLE brands IS '品牌管理表';

-- 门店信息表
CREATE TABLE IF NOT EXISTS stores (
                                      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                      code VARCHAR(50) NOT NULL UNIQUE,
                                      name VARCHAR(200) NOT NULL,
                                      address TEXT,
                                      phone VARCHAR(50) CHECK (phone IS NULL OR phone ~ '^(1[3-9]\d{9})|(0\d{2,3}-?\d{7,8})|(400-?\d{3}-?\d{4})$'),
                                      business_hours JSONB,
                                      status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
                                      created_at TIMESTAMPTZ DEFAULT now(),
                                      updated_at TIMESTAMPTZ DEFAULT now(),
                                      province VARCHAR(50),
                                      city VARCHAR(50),
                                      district VARCHAR(50),
                                      version BIGINT NOT NULL DEFAULT 0,
                                      opening_date DATE,
                                      area INTEGER CHECK (area IS NULL OR area > 0),
                                      hall_count INTEGER CHECK (hall_count IS NULL OR hall_count > 0),
                                      seat_count INTEGER CHECK (seat_count IS NULL OR seat_count > 0)
);
COMMENT ON TABLE stores IS '门店信息表';

-- 影厅信息表
CREATE TABLE IF NOT EXISTS halls (
                                     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                     store_id UUID NOT NULL REFERENCES stores(id),
                                     code VARCHAR(50),
                                     name VARCHAR(200) NOT NULL,
                                     type VARCHAR(20) NOT NULL CHECK (type IN ('VIP', 'PUBLIC', 'CP', 'PARTY')),
                                     capacity INTEGER NOT NULL CHECK (capacity > 0 AND capacity <= 1000),
                                     tags TEXT[],
                                     status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
                                     created_at TIMESTAMPTZ DEFAULT now(),
                                     updated_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE halls IS '影厅信息表';

-- 供应商表
CREATE TABLE IF NOT EXISTS suppliers (
                                         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                         code VARCHAR(50) NOT NULL UNIQUE,
                                         name VARCHAR(200) NOT NULL,
                                         contact_name VARCHAR(100),
                                         contact_phone VARCHAR(50),
                                         status VARCHAR(20) DEFAULT 'ACTIVE',
                                         created_at TIMESTAMPTZ DEFAULT now(),
                                         updated_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE suppliers IS '供应商表';

-- 用户表
CREATE TABLE IF NOT EXISTS users (
                                     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                     username VARCHAR(100) NOT NULL,
                                     phone VARCHAR(50),
                                     province VARCHAR(100),
                                     city VARCHAR(100),
                                     district VARCHAR(100),
                                     address VARCHAR(500),
                                     created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
                                     updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
);

-- 物料主数据表
CREATE TYPE material_category AS ENUM ('RAW_MATERIAL', 'PACKAGING');
CREATE TABLE IF NOT EXISTS materials (
                                         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                         code VARCHAR(30) NOT NULL UNIQUE,
                                         name VARCHAR(100) NOT NULL,
                                         category material_category NOT NULL,
                                         inventory_unit_id UUID NOT NULL REFERENCES units(id),
                                         purchase_unit_id UUID NOT NULL REFERENCES units(id),
                                         conversion_rate NUMERIC(12,6) CHECK (conversion_rate > 0),
                                         use_global_conversion BOOLEAN NOT NULL DEFAULT true,
                                         specification TEXT,
                                         description TEXT,
                                         status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
                                         created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                         updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                         created_by VARCHAR(100),
                                         updated_by VARCHAR(100),
                                         standard_cost NUMERIC(12,2) DEFAULT 0.00
);
COMMENT ON TABLE materials IS '物料主数据表 - Material master data for raw materials and packaging';

-- ============================================================
-- 2. SPU/SKU 商品表
-- ============================================================

-- SPU主数据表
CREATE TABLE IF NOT EXISTS spus (
                                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                    code VARCHAR(50) NOT NULL UNIQUE,
                                    name VARCHAR(200) NOT NULL,
                                    short_name VARCHAR(100),
                                    description TEXT,
                                    category_id VARCHAR(50),
                                    category_name VARCHAR(100),
                                    brand_id VARCHAR(50),
                                    brand_name VARCHAR(100),
                                    status VARCHAR(20) NOT NULL DEFAULT 'draft',
                                    unit VARCHAR(20),
                                    tags TEXT[],
                                    images JSONB DEFAULT '[]',
                                    specifications JSONB DEFAULT '[]',
                                    attributes JSONB DEFAULT '[]',
                                    created_at TIMESTAMPTZ DEFAULT now(),
                                    updated_at TIMESTAMPTZ DEFAULT now(),
                                    created_by VARCHAR(100),
                                    updated_by VARCHAR(100),
                                    product_type VARCHAR(20) CHECK (product_type IS NULL OR product_type IN ('raw_material', 'packaging', 'finished_product', 'combo'))
);
COMMENT ON TABLE spus IS 'SPU主数据表 - 标准产品单元';

-- SKU主数据表
CREATE TABLE IF NOT EXISTS skus (
                                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                    code VARCHAR(50) NOT NULL UNIQUE,
                                    name VARCHAR(200) NOT NULL,
                                    spu_id UUID NOT NULL,
                                    sku_type VARCHAR(20) NOT NULL CHECK (sku_type IN ('raw_material', 'packaging', 'finished_product', 'combo')),
                                    main_unit VARCHAR(20) NOT NULL,
                                    store_scope TEXT[] DEFAULT '{}',
                                    standard_cost NUMERIC(10,2),
                                    waste_rate NUMERIC(5,2) DEFAULT 0 CHECK (waste_rate >= 0 AND waste_rate <= 100),
                                    status VARCHAR(10) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'enabled', 'disabled')),
                                    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
                                    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
                                    price NUMERIC(10,2) DEFAULT 0,
                                    category_id UUID REFERENCES categories(id),
                                    version BIGINT NOT NULL DEFAULT 0
);
COMMENT ON TABLE skus IS 'SKU主数据表,支持四种类型:原料(raw_material)、包材(packaging)、成品(finished_product)、套餐(combo)';

-- BOM组件表
CREATE TABLE IF NOT EXISTS bom_components (
                                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                              finished_product_id UUID NOT NULL REFERENCES skus(id),
                                              component_id UUID REFERENCES skus(id),
                                              quantity NUMERIC NOT NULL CHECK (quantity > 0),
                                              unit VARCHAR(20) NOT NULL,
                                              unit_cost NUMERIC,
                                              is_optional BOOLEAN DEFAULT false,
                                              sort_order INTEGER DEFAULT 0,
                                              created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
                                              material_id UUID REFERENCES materials(id),
                                              component_type VARCHAR(20) NOT NULL DEFAULT 'SKU' CHECK (component_type IN ('SKU', 'MATERIAL'))
);
COMMENT ON TABLE bom_components IS 'BOM 组件表，记录成品 SKU 的物料清单（支持引用 SKU 或 Material）';

-- 套餐子项表
CREATE TABLE IF NOT EXISTS combo_items (
                                           id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                           combo_id UUID NOT NULL REFERENCES skus(id),
                                           sub_item_id UUID NOT NULL REFERENCES skus(id),
                                           quantity NUMERIC NOT NULL CHECK (quantity > 0),
                                           unit VARCHAR(20) NOT NULL,
                                           unit_cost NUMERIC,
                                           sort_order INTEGER DEFAULT 0,
                                           created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);
COMMENT ON TABLE combo_items IS '套餐子项表:套餐SKU的子项配置';

-- ============================================================
-- 3. 库存管理表
-- ============================================================

-- 门店库存表
CREATE TABLE IF NOT EXISTS store_inventory (
                                               id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                               store_id UUID NOT NULL REFERENCES stores(id),
                                               sku_id UUID REFERENCES skus(id),
                                               on_hand_qty NUMERIC NOT NULL DEFAULT 0,
                                               available_qty NUMERIC NOT NULL DEFAULT 0,
                                               reserved_qty NUMERIC NOT NULL DEFAULT 0,
                                               safety_stock NUMERIC DEFAULT 0,
                                               created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                                               updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                                               version INTEGER NOT NULL DEFAULT 1,
                                               inventory_item_type VARCHAR(20) NOT NULL DEFAULT 'SKU',
                                               material_id UUID REFERENCES materials(id)
);
COMMENT ON TABLE store_inventory IS '门店库存表（支持 SKU 和 Material 两种库存类型）';

-- 库存调整原因字典表
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

-- 库存调整单表
CREATE TABLE IF NOT EXISTS inventory_adjustments (
                                                     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                                     adjustment_number VARCHAR(50) NOT NULL UNIQUE,
                                                     sku_id UUID NOT NULL,
                                                     store_id UUID NOT NULL,
                                                     adjustment_type VARCHAR(20) NOT NULL CHECK (adjustment_type IN ('surplus', 'shortage', 'damage')),
                                                     quantity INTEGER NOT NULL CHECK (quantity > 0),
                                                     unit_price NUMERIC NOT NULL DEFAULT 0,
                                                     adjustment_amount NUMERIC GENERATED ALWAYS AS (quantity::numeric * unit_price) STORED,
                                                     reason_code VARCHAR(50) NOT NULL REFERENCES adjustment_reasons(code),
                                                     reason_text VARCHAR(500),
                                                     remarks VARCHAR(500),
                                                     status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected', 'withdrawn')),
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
                                                     created_at TIMESTAMPTZ DEFAULT now(),
                                                     updated_at TIMESTAMPTZ DEFAULT now(),
                                                     version INTEGER DEFAULT 1
);
COMMENT ON TABLE inventory_adjustments IS '库存调整单表';

-- 库存流水表
CREATE TABLE IF NOT EXISTS inventory_transactions (
                                                      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                                      store_id UUID NOT NULL REFERENCES stores(id),
                                                      sku_id UUID NOT NULL REFERENCES skus(id),
                                                      transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN ('purchase_in', 'sale_out', 'adjustment_in', 'adjustment_out', 'damage_out', 'transfer_in', 'transfer_out', 'return_in', 'return_out', 'safety_stock_update')),
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
                                                      transaction_time TIMESTAMPTZ NOT NULL DEFAULT now(),
                                                      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                                                      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                                                      bom_snapshot_id UUID,
                                                      reference_id UUID,
                                                      related_order_id UUID
);
COMMENT ON TABLE inventory_transactions IS '库存流水表，记录所有库存变动';

-- 库存预占表
CREATE TABLE IF NOT EXISTS inventory_reservations (
                                                      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                                      order_id UUID NOT NULL,
                                                      store_id UUID NOT NULL REFERENCES stores(id),
                                                      sku_id UUID NOT NULL REFERENCES skus(id),
                                                      quantity NUMERIC NOT NULL,
                                                      status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
                                                      created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                                      released_at TIMESTAMP WITHOUT TIME ZONE,
                                                      reserved_quantity NUMERIC NOT NULL CHECK (reserved_quantity > 0),
                                                      expires_at TIMESTAMPTZ,
                                                      fulfilled_at TIMESTAMPTZ,
                                                      cancelled_at TIMESTAMPTZ,
                                                      notes TEXT
);
COMMENT ON TABLE inventory_reservations IS 'Inventory reservation records for pending orders (库存预占记录)';

-- ============================================================
-- 4. 菜单分类与渠道商品表
-- ============================================================

-- 菜单分类表
CREATE TABLE IF NOT EXISTS menu_category (
                                             id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                             code VARCHAR(50) NOT NULL CHECK (code ~ '^[A-Z][A-Z0-9_]*$'),
                                             display_name VARCHAR(50) NOT NULL CHECK (char_length(display_name) >= 1 AND char_length(display_name) <= 50),
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
COMMENT ON TABLE menu_category IS '菜单分类表 - 小程序商品分类配置';

-- 渠道商品配置表
CREATE TABLE IF NOT EXISTS channel_product_config (
                                                      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                                      sku_id UUID NOT NULL REFERENCES skus(id),
                                                      channel_type VARCHAR(20) NOT NULL DEFAULT 'MINI_PROGRAM' CHECK (channel_type IN ('MINI_PROGRAM', 'POS', 'DELIVERY', 'ECOMMERCE')),
                                                      display_name VARCHAR(200),
                                                      channel_category VARCHAR(20) NOT NULL CHECK (channel_category IN ('ALCOHOL', 'COFFEE', 'BEVERAGE', 'SNACK', 'MEAL', 'OTHER')),
                                                      channel_price BIGINT CHECK (channel_price IS NULL OR channel_price > 0),
                                                      main_image TEXT,
                                                      detail_images JSONB DEFAULT '[]',
                                                      description TEXT,
                                                      specs JSONB DEFAULT '[]',
                                                      is_recommended BOOLEAN DEFAULT false,
                                                      status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'OUT_OF_STOCK')),
                                                      sort_order INTEGER DEFAULT 0 CHECK (sort_order >= 0),
                                                      created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
                                                      updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
                                                      deleted_at TIMESTAMP WITHOUT TIME ZONE,
                                                      category_id UUID REFERENCES menu_category(id)
);
COMMENT ON TABLE channel_product_config IS '渠道商品配置表，记录 SKU 成品在特定销售渠道的展示配置';

-- ============================================================
-- 5. 采购管理表
-- ============================================================

-- 采购订单表
CREATE TABLE IF NOT EXISTS purchase_orders (
                                               id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                               order_number VARCHAR(50) NOT NULL UNIQUE,
                                               supplier_id UUID NOT NULL REFERENCES suppliers(id),
                                               store_id UUID NOT NULL REFERENCES stores(id),
                                               status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'PARTIAL_RECEIVED', 'FULLY_RECEIVED', 'CLOSED')),
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

-- 采购订单明细表
CREATE TABLE IF NOT EXISTS purchase_order_items (
                                                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                                    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id),
                                                    sku_id UUID REFERENCES skus(id),
                                                    quantity NUMERIC NOT NULL,
                                                    unit_price NUMERIC NOT NULL,
                                                    line_amount NUMERIC,
                                                    received_qty NUMERIC DEFAULT 0,
                                                    pending_qty NUMERIC,
                                                    created_at TIMESTAMPTZ DEFAULT now(),
                                                    updated_at TIMESTAMPTZ DEFAULT now(),
                                                    material_id UUID REFERENCES materials(id),
                                                    item_type VARCHAR(20) NOT NULL,
                                                    material_name VARCHAR(200)
);
COMMENT ON TABLE purchase_order_items IS '采购订单明细表';

-- 收货入库单表
CREATE TABLE IF NOT EXISTS goods_receipts (
                                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                              receipt_number VARCHAR(50) NOT NULL UNIQUE,
                                              purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id),
                                              store_id UUID NOT NULL REFERENCES stores(id),
                                              status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED')),
                                              received_by UUID,
                                              received_by_name VARCHAR(100),
                                              received_at TIMESTAMPTZ,
                                              remarks VARCHAR(500),
                                              version INTEGER DEFAULT 1,
                                              created_at TIMESTAMPTZ DEFAULT now(),
                                              updated_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE goods_receipts IS '收货入库单表';

-- 收货入库明细表
CREATE TABLE IF NOT EXISTS goods_receipt_items (
                                                   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                                   goods_receipt_id UUID NOT NULL REFERENCES goods_receipts(id),
                                                   sku_id UUID REFERENCES skus(id),
                                                   ordered_qty NUMERIC NOT NULL,
                                                   received_qty NUMERIC NOT NULL,
                                                   quality_status VARCHAR(20) DEFAULT 'QUALIFIED' CHECK (quality_status IN ('QUALIFIED', 'UNQUALIFIED', 'PENDING_CHECK')),
                                                   rejection_reason VARCHAR(500),
                                                   created_at TIMESTAMPTZ DEFAULT now(),
                                                   updated_at TIMESTAMPTZ DEFAULT now(),
                                                   item_type VARCHAR(20) NOT NULL DEFAULT 'SKU',
                                                   material_id UUID REFERENCES materials(id)
);
COMMENT ON TABLE goods_receipt_items IS '收货入库明细表';

-- ============================================================
-- 6. 活动类型表
-- ============================================================

CREATE TABLE IF NOT EXISTS activity_types (
                                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                              name VARCHAR(100) NOT NULL,
                                              description VARCHAR(500),
                                              status VARCHAR(20) NOT NULL DEFAULT 'ENABLED' CHECK (status IN ('ENABLED', 'DISABLED', 'DELETED')),
                                              sort INTEGER NOT NULL DEFAULT 0,
                                              created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                                              updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                                              deleted_at TIMESTAMPTZ,
                                              created_by VARCHAR(255),
                                              updated_by VARCHAR(255)
);
COMMENT ON TABLE activity_types IS '活动类型表，存储预约活动类型配置（如企业团建、订婚、生日Party等）';

-- ============================================================
-- 7. 索引创建
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_stores_code ON stores(code);
CREATE INDEX IF NOT EXISTS idx_stores_status ON stores(status);
CREATE INDEX IF NOT EXISTS idx_halls_store_id ON halls(store_id);
CREATE INDEX IF NOT EXISTS idx_skus_code ON skus(code);
CREATE INDEX IF NOT EXISTS idx_skus_spu_id ON skus(spu_id);
CREATE INDEX IF NOT EXISTS idx_skus_status ON skus(status);
CREATE INDEX IF NOT EXISTS idx_store_inventory_store_sku ON store_inventory(store_id, sku_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_store_sku ON inventory_transactions(store_id, sku_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_store_id ON purchase_orders(store_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
