-- ============================================
-- V001__baseline_schema_2026_01_11.sql
-- Cinema Business Center Platform - 完整基础表结构
-- 用途: 初始化新数据库的完整表结构（从生产环境导出）
-- 表数量: 61 个表
-- 注意: 此脚本包含所有表结构，需要在空数据库上执行
-- 创建时间: 2026-01-11
-- ============================================

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 第 1 部分: 基础配置表（无外键依赖）
-- ============================================

-- 1.1 门店信息表
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    business_hours JSONB,
    status VARCHAR(20) DEFAULT 'active',
    province VARCHAR(50),
    city VARCHAR(50),
    district VARCHAR(50),
    version BIGINT DEFAULT 0,
    opening_date DATE,
    area INTEGER,
    hall_count INTEGER,
    seat_count INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT stores_code_key UNIQUE (code)
);
COMMENT ON TABLE stores IS '门店信息表';

-- 1.2 供应商表
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    contact_name VARCHAR(50),
    contact_phone VARCHAR(20),
    address VARCHAR(500),
    payment_terms VARCHAR(50) DEFAULT 'MONTHLY',
    bank_name VARCHAR(100),
    bank_account VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    remarks VARCHAR(500),
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT suppliers_code_key UNIQUE (code)
);
COMMENT ON TABLE suppliers IS '供应商主数据表';

-- 1.3 计量单位表
CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL,
    name VARCHAR(50) NOT NULL,
    name_en VARCHAR(50),
    category VARCHAR(30),
    is_base_unit BOOLEAN DEFAULT false,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT units_code_key UNIQUE (code)
);
COMMENT ON TABLE units IS '计量单位主数据表';
COMMENT ON COLUMN units.code IS '单位编码（如：g, kg, ml, L）';
COMMENT ON COLUMN units.name IS '单位名称（如：克, 千克, 毫升, 升）';
COMMENT ON COLUMN units.category IS '单位类别（WEIGHT=重量, VOLUME=容量, COUNT=计数, LENGTH=长度）';
COMMENT ON COLUMN units.is_base_unit IS '是否基础单位（同类别下只有一个基础单位）';

-- 1.4 单位换算规则表
CREATE TABLE IF NOT EXISTS unit_conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_unit VARCHAR(20) NOT NULL,
    to_unit VARCHAR(20) NOT NULL,
    conversion_rate NUMERIC(15,6) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_conversion_from_to UNIQUE (from_unit, to_unit)
);
COMMENT ON TABLE unit_conversions IS '单位换算规则表';
COMMENT ON COLUMN unit_conversions.from_unit IS '源单位编码';
COMMENT ON COLUMN unit_conversions.to_unit IS '目标单位编码';
COMMENT ON COLUMN unit_conversions.conversion_rate IS '换算率（1 from_unit = conversion_rate to_unit）';

-- 1.5 分类表
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    parent_id UUID REFERENCES categories(id),
    level INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT categories_code_key UNIQUE (code)
);
COMMENT ON TABLE categories IS '商品分类表，支持三级分类';
COMMENT ON COLUMN categories.id IS '分类唯一标识（主键，不能为空）';
COMMENT ON COLUMN categories.code IS '分类编码';
COMMENT ON COLUMN categories.name IS '分类名称（不能为空，不能是空字符串）';
COMMENT ON COLUMN categories.parent_id IS '父分类ID（顶级分类为NULL）';
COMMENT ON COLUMN categories.level IS '分类层级（1-3级，不能为空）';
COMMENT ON COLUMN categories.sort_order IS '排序号（不能为空，默认0）';
COMMENT ON COLUMN categories.status IS '状态（ACTIVE/INACTIVE/ARCHIVED，不能为空，默认ACTIVE）';

-- 1.6 品牌表
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
COMMENT ON TABLE brands IS '品牌主数据表';
COMMENT ON COLUMN brands.brand_code IS '品牌编码，唯一标识';
COMMENT ON COLUMN brands.name IS '品牌名称（中文）';
COMMENT ON COLUMN brands.english_name IS '品牌英文名';
COMMENT ON COLUMN brands.brand_type IS '品牌类型: own(自有), agency(代理), joint(联营), other(其他)';
COMMENT ON COLUMN brands.primary_categories IS '主营类目数组';
COMMENT ON COLUMN brands.company IS '所属公司/供应商';
COMMENT ON COLUMN brands.brand_level IS '品牌等级(A/B/C)';
COMMENT ON COLUMN brands.tags IS '品牌标签数组';
COMMENT ON COLUMN brands.status IS '状态: draft(草稿), enabled(启用), disabled(停用)';

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
COMMENT ON TABLE activity_types IS '活动类型配置表';
COMMENT ON COLUMN activity_types.name IS '活动类型名称，必填，唯一（在非已删除状态下）';
COMMENT ON COLUMN activity_types.description IS '活动类型描述，可选';
COMMENT ON COLUMN activity_types.status IS '状态：ENABLED=启用, DISABLED=停用, DELETED=已删除（软删除）';
COMMENT ON COLUMN activity_types.sort IS '排序号，用于控制显示顺序';
COMMENT ON COLUMN activity_types.deleted_at IS '删除时间（软删除时记录）';

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
COMMENT ON TABLE adjustment_reasons IS '库存调整原因配置表';
COMMENT ON COLUMN adjustment_reasons.code IS '原因代码';
COMMENT ON COLUMN adjustment_reasons.name IS '原因名称';
COMMENT ON COLUMN adjustment_reasons.category IS '分类：surplus(盘盈)/shortage(盘亏)/damage(报损)';
COMMENT ON COLUMN adjustment_reasons.is_active IS '是否启用';
COMMENT ON COLUMN adjustment_reasons.sort_order IS '排序序号';

-- 1.9 加购商品表
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
COMMENT ON TABLE addon_items IS '加购商品/小食表';

-- 1.10 用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(50),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE users IS '用户信息表';

-- ============================================
-- 第 2 部分: 一级依赖表
-- ============================================

-- 2.1 影厅表
CREATE TABLE IF NOT EXISTS halls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id),
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
COMMENT ON TABLE halls IS '影厅信息表';
COMMENT ON COLUMN halls.store_id IS '所属门店ID';
COMMENT ON COLUMN halls.code IS '影厅编码，在门店内唯一';
COMMENT ON COLUMN halls.name IS '影厅名称';
COMMENT ON COLUMN halls.type IS '影厅类型：VIP=VIP厅, PUBLIC=普通厅, CP=情侣厅, PARTY=派对厅';
COMMENT ON COLUMN halls.capacity IS '可容纳人数（1-1000）';
COMMENT ON COLUMN halls.tags IS '影厅特性标签数组';
COMMENT ON COLUMN halls.status IS '影厅状态：active=可用, inactive=停用, maintenance=维护中';

-- 2.2 物料表
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) NOT NULL,
    name VARCHAR(100) NOT NULL,
    category material_category NOT NULL,
    inventory_unit_id UUID NOT NULL REFERENCES units(id),
    purchase_unit_id UUID NOT NULL REFERENCES units(id),
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
COMMENT ON TABLE materials IS '物料主数据表';
COMMENT ON COLUMN materials.code IS '物料编码（格式：MAT-{RAW|PKG}-{001-999}）';
COMMENT ON COLUMN materials.name IS '物料名称';
COMMENT ON COLUMN materials.category IS '物料类别（RAW_MATERIAL=原料, PACKAGING=包材）';
COMMENT ON COLUMN materials.inventory_unit_id IS '库存单位（外键到 units 表）';
COMMENT ON COLUMN materials.purchase_unit_id IS '采购单位（外键到 units 表）';
COMMENT ON COLUMN materials.conversion_rate IS '换算率（1 采购单位 = conversion_rate 库存单位）';
COMMENT ON COLUMN materials.use_global_conversion IS '是否使用全局换算规则（false 时使用物料级换算率）';
COMMENT ON COLUMN materials.specification IS '规格说明（如：750ml/瓶，500g/袋）';
COMMENT ON COLUMN materials.standard_cost IS '标准成本（元/库存单位），用于 BOM 成本计算';
COMMENT ON COLUMN materials.status IS '状态（ACTIVE=启用, INACTIVE=停用）';

-- 2.3 SPU 表（标准产品单元）
CREATE TABLE IF NOT EXISTS spus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    category_id UUID REFERENCES categories(id),
    brand_id UUID REFERENCES brands(id),
    description TEXT,
    main_image TEXT,
    detail_images JSONB DEFAULT '[]'::jsonb,
    specifications JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CONSTRAINT spus_code_key UNIQUE (code)
);
COMMENT ON TABLE spus IS 'SPU 标准产品单元表';

-- 2.4 SKU 表（库存单元）
CREATE TABLE IF NOT EXISTS skus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    spu_id UUID REFERENCES spus(id),
    category_id UUID REFERENCES categories(id),
    sku_type VARCHAR(30) DEFAULT 'finished_product',
    barcode VARCHAR(50),
    unit VARCHAR(20) NOT NULL,
    cost_price BIGINT,
    selling_price BIGINT,
    main_image TEXT,
    weight NUMERIC(10,3),
    volume NUMERIC(10,3),
    shelf_life INTEGER,
    storage_conditions TEXT,
    spec_values JSONB DEFAULT '[]'::jsonb,
    store_scope JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    version INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT skus_code_key UNIQUE (code)
);
COMMENT ON TABLE skus IS 'SKU 库存单元表';

-- 2.5 饮品表
CREATE TABLE IF NOT EXISTS beverages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    image_url TEXT,
    detail_images JSONB DEFAULT '[]'::jsonb,
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
COMMENT ON TABLE beverages IS '饮品配置表';
COMMENT ON COLUMN beverages.id IS '主键 UUID';
COMMENT ON COLUMN beverages.name IS '饮品名称';
COMMENT ON COLUMN beverages.category IS '分类: COFFEE(咖啡), TEA(茶饮), JUICE(果汁), SMOOTHIE(奶昔), MILK_TEA(奶茶), OTHER(其他)';
COMMENT ON COLUMN beverages.base_price IS '基础价格（小杯/标准规格）';
COMMENT ON COLUMN beverages.status IS '状态: ACTIVE(上架), INACTIVE(下架), OUT_OF_STOCK(缺货)';
COMMENT ON COLUMN beverages.is_recommended IS '是否推荐商品';
COMMENT ON COLUMN beverages.sort_order IS '排序权重（数值越大越靠前）';

-- 2.6 菜单分类表
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
COMMENT ON TABLE menu_category IS '小程序菜单分类表';
COMMENT ON COLUMN menu_category.id IS '分类唯一标识';
COMMENT ON COLUMN menu_category.code IS '分类编码，用于向后兼容旧 API';
COMMENT ON COLUMN menu_category.display_name IS '显示名称（中文）';
COMMENT ON COLUMN menu_category.sort_order IS '排序序号，越小越靠前';
COMMENT ON COLUMN menu_category.is_visible IS '是否在小程序中可见';
COMMENT ON COLUMN menu_category.is_default IS '是否为默认分类（不可删除）';
COMMENT ON COLUMN menu_category.version IS '乐观锁版本号，用于并发控制（JPA @Version）';

-- 2.7 场景套餐表
CREATE TABLE IF NOT EXISTS scenario_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    image TEXT,
    category VARCHAR(50) NOT NULL,
    target_audience VARCHAR(100),
    applicable_events TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    base_package_id UUID REFERENCES scenario_packages(id),
    version INTEGER NOT NULL DEFAULT 1,
    is_latest BOOLEAN NOT NULL DEFAULT true,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE scenario_packages IS '场景套餐主表';

-- ============================================
-- 第 3 部分: 二级依赖表
-- ============================================

-- 3.1 门店预约设置表
CREATE TABLE IF NOT EXISTS store_reservation_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    is_reservation_enabled BOOLEAN DEFAULT true,
    max_days_ahead INTEGER DEFAULT 30,
    time_slots JSONB NOT NULL DEFAULT '[]'::jsonb,
    min_advance_hours INTEGER NOT NULL DEFAULT 1,
    duration_unit INTEGER NOT NULL DEFAULT 1,
    deposit_required BOOLEAN NOT NULL DEFAULT FALSE,
    deposit_amount DECIMAL(10,2),
    deposit_percentage INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT store_reservation_settings_store_id_key UNIQUE (store_id)
);
COMMENT ON TABLE store_reservation_settings IS '门店预约设置表';

-- 3.2 门店操作日志表
CREATE TABLE IF NOT EXISTS store_operation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id),
    operation_type VARCHAR(50) NOT NULL,
    operation_detail JSONB,
    operator_id UUID,
    operator_name VARCHAR(100),
    operation_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE store_operation_logs IS '门店操作日志表';

-- 3.3 渠道商品配置表
CREATE TABLE IF NOT EXISTS channel_product_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku_id UUID NOT NULL REFERENCES skus(id),
    channel_type VARCHAR(50) NOT NULL DEFAULT 'MINI_PROGRAM',
    display_name VARCHAR(100),
    channel_category VARCHAR(50) NOT NULL,
    category_id UUID REFERENCES menu_category(id),
    channel_price BIGINT,
    main_image TEXT,
    detail_images JSONB DEFAULT '[]'::jsonb,
    description TEXT,
    specs JSONB DEFAULT '[]'::jsonb,
    is_recommended BOOLEAN DEFAULT false,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    deleted_at TIMESTAMP
);
COMMENT ON TABLE channel_product_config IS '渠道商品配置表';
COMMENT ON COLUMN channel_product_config.sku_id IS '关联的 SKU 成品 ID';
COMMENT ON COLUMN channel_product_config.channel_type IS '渠道类型：MINI_PROGRAM/POS/DELIVERY/ECOMMERCE';
COMMENT ON COLUMN channel_product_config.channel_category IS '渠道分类：ALCOHOL/COFFEE/BEVERAGE/SNACK/MEAL/OTHER';
COMMENT ON COLUMN channel_product_config.category_id IS '关联的菜单分类ID，替代原 channel_category 枚举';
COMMENT ON COLUMN channel_product_config.channel_price IS '渠道价格（分），空则使用 SKU 价格';
COMMENT ON COLUMN channel_product_config.specs IS '规格配置 JSONB';
COMMENT ON COLUMN channel_product_config.status IS '状态：ACTIVE/INACTIVE/OUT_OF_STOCK';

-- 3.4 门店库存表
CREATE TABLE IF NOT EXISTS store_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id),
    sku_id UUID REFERENCES skus(id),
    material_id UUID REFERENCES materials(id),
    inventory_item_type VARCHAR(20) NOT NULL DEFAULT 'SKU',
    stock_qty INTEGER NOT NULL DEFAULT 0,
    available_qty INTEGER NOT NULL DEFAULT 0,
    reserved_qty INTEGER DEFAULT 0,
    safety_stock INTEGER DEFAULT 0,
    max_stock INTEGER,
    unit VARCHAR(20),
    last_inbound_at TIMESTAMPTZ,
    last_outbound_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE store_inventory IS '门店库存表';

-- 3.5 BOM 组件表
CREATE TABLE IF NOT EXISTS bom_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    finished_product_id UUID NOT NULL REFERENCES skus(id),
    component_id UUID REFERENCES skus(id),
    material_id UUID REFERENCES materials(id),
    component_type VARCHAR(20) NOT NULL DEFAULT 'SKU',
    quantity NUMERIC(10,3) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    unit_cost NUMERIC(10,2),
    is_optional BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT now()
);
COMMENT ON TABLE bom_components IS 'BOM 配方组件表';
COMMENT ON COLUMN bom_components.finished_product_id IS '成品SKU ID';
COMMENT ON COLUMN bom_components.component_id IS '组件SKU ID(必须是原料或包材类型)';
COMMENT ON COLUMN bom_components.material_id IS '物料 ID（外键到 materials 表），与 component_id 互斥';
COMMENT ON COLUMN bom_components.component_type IS '组件类型: MATERIAL(物料) 或 SKU';
COMMENT ON COLUMN bom_components.quantity IS '组件数量';
COMMENT ON COLUMN bom_components.unit IS '组件单位';
COMMENT ON COLUMN bom_components.unit_cost IS '单位成本快照(保存时记录)';
COMMENT ON COLUMN bom_components.is_optional IS '是否可选组件';

-- 3.6 套餐子项表
CREATE TABLE IF NOT EXISTS combo_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    combo_id UUID NOT NULL REFERENCES skus(id),
    sub_item_id UUID NOT NULL REFERENCES skus(id),
    quantity NUMERIC(10,3) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    unit_cost NUMERIC(10,2),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT now()
);
COMMENT ON TABLE combo_items IS '套餐子项表';
COMMENT ON COLUMN combo_items.combo_id IS '套餐SKU ID';
COMMENT ON COLUMN combo_items.sub_item_id IS '子项SKU ID(不能是套餐类型,避免嵌套)';
COMMENT ON COLUMN combo_items.quantity IS '子项数量';
COMMENT ON COLUMN combo_items.unit IS '子项单位';
COMMENT ON COLUMN combo_items.unit_cost IS '单位成本快照(保存时记录)';

-- 3.7 饮品规格表
CREATE TABLE IF NOT EXISTS beverage_specs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    beverage_id UUID NOT NULL REFERENCES beverages(id),
    spec_type VARCHAR(50) NOT NULL,
    spec_name VARCHAR(50) NOT NULL,
    spec_code VARCHAR(50),
    price_adjustment NUMERIC(10,2) DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE beverage_specs IS '饮品规格配置表';
COMMENT ON COLUMN beverage_specs.spec_type IS '规格类型: SIZE(容量), TEMPERATURE(温度), SWEETNESS(甜度), TOPPING(配料)';
COMMENT ON COLUMN beverage_specs.spec_name IS '规格名称，如：小杯, 中杯, 大杯';
COMMENT ON COLUMN beverage_specs.spec_code IS '规格代码，用于配方匹配';
COMMENT ON COLUMN beverage_specs.price_adjustment IS '价格调整（可正可负），0表示无调整';
COMMENT ON COLUMN beverage_specs.is_default IS '是否默认选中该规格';

-- 3.8 饮品配方表
CREATE TABLE IF NOT EXISTS beverage_recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    beverage_id UUID NOT NULL REFERENCES beverages(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    applicable_specs TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE beverage_recipes IS '饮品配方表';
COMMENT ON COLUMN beverage_recipes.beverage_id IS '关联的饮品 ID';
COMMENT ON COLUMN beverage_recipes.name IS '配方名称';
COMMENT ON COLUMN beverage_recipes.description IS '配方描述';
COMMENT ON COLUMN beverage_recipes.applicable_specs IS '适用规格组合 JSON 字符串，NULL 表示适用所有规格';

-- 3.9 配方原料表
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES beverage_recipes(id),
    sku_id UUID NOT NULL REFERENCES skus(id),
    ingredient_name VARCHAR(100) NOT NULL,
    quantity NUMERIC(10,3) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    note VARCHAR(200),
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE recipe_ingredients IS '配方原料表';
COMMENT ON COLUMN recipe_ingredients.recipe_id IS '关联的配方 ID';
COMMENT ON COLUMN recipe_ingredients.sku_id IS '关联的 SKU ID (原料)';
COMMENT ON COLUMN recipe_ingredients.ingredient_name IS '原料名称（冗余存储，便于展示）';
COMMENT ON COLUMN recipe_ingredients.quantity IS '原料用量（支持小数）';
COMMENT ON COLUMN recipe_ingredients.unit IS '用量单位: g(克), ml(毫升), piece(个)';
COMMENT ON COLUMN recipe_ingredients.note IS '备注（如"室温"、"需加热"等）';

-- 3.10 饮品-SKU 映射表
CREATE TABLE IF NOT EXISTS beverage_sku_mapping (
    old_beverage_id UUID NOT NULL PRIMARY KEY,
    new_sku_id UUID NOT NULL REFERENCES skus(id),
    migrated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    migration_script_version VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active'
);
COMMENT ON TABLE beverage_sku_mapping IS '饮品迁移到SKU的映射表';
COMMENT ON COLUMN beverage_sku_mapping.old_beverage_id IS 'Original beverage ID from beverage_config table (primary key)';
COMMENT ON COLUMN beverage_sku_mapping.new_sku_id IS 'Migrated SKU ID (must reference finished_product type SKU)';
COMMENT ON COLUMN beverage_sku_mapping.migration_script_version IS 'Flyway migration version that created this mapping (e.g., V2025_12_31_001)';
COMMENT ON COLUMN beverage_sku_mapping.status IS 'Mapping status: active (valid) or deprecated (no longer in use)';

-- 3.11 时段模板表
CREATE TABLE IF NOT EXISTS time_slot_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    available_inventory INTEGER NOT NULL DEFAULT 1,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE time_slot_templates IS '时段模板表';

-- 3.12 时段覆盖表
CREATE TABLE IF NOT EXISTS time_slot_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id),
    override_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    available_inventory INTEGER,
    is_closed BOOLEAN NOT NULL DEFAULT false,
    reason VARCHAR(200),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE time_slot_overrides IS '时段覆盖表（特殊日期设置）';

-- ============================================
-- 第 4 部分: 采购管理表
-- ============================================

-- 4.1 采购订单表
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
COMMENT ON TABLE purchase_orders IS '采购订单主表';

-- 4.2 采购订单明细表
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id),
    sku_id UUID REFERENCES skus(id),
    material_id UUID REFERENCES materials(id),
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
COMMENT ON TABLE purchase_order_items IS '采购订单明细表';
COMMENT ON COLUMN purchase_order_items.item_type IS 'Item type: MATERIAL (raw material/packaging) or SKU (finished product)';
COMMENT ON COLUMN purchase_order_items.material_id IS 'Reference to materials table for raw material/packaging procurement';
COMMENT ON COLUMN purchase_order_items.material_name IS 'Material name redundancy for soft-delete scenarios';

-- 4.3 采购订单状态历史表
CREATE TABLE IF NOT EXISTS purchase_order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id),
    from_status VARCHAR(30),
    to_status VARCHAR(30) NOT NULL,
    changed_by UUID,
    changed_by_name VARCHAR(100),
    remarks VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE purchase_order_status_history IS '采购订单状态变更历史表';
COMMENT ON COLUMN purchase_order_status_history.from_status IS '变更前状态（首次创建时为NULL）';
COMMENT ON COLUMN purchase_order_status_history.to_status IS '变更后状态';
COMMENT ON COLUMN purchase_order_status_history.changed_by IS '操作人ID';
COMMENT ON COLUMN purchase_order_status_history.changed_by_name IS '操作人姓名';
COMMENT ON COLUMN purchase_order_status_history.remarks IS '备注说明';

-- 4.4 收货单表
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
COMMENT ON TABLE goods_receipts IS '收货单主表';

-- 4.5 收货单明细表
CREATE TABLE IF NOT EXISTS goods_receipt_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goods_receipt_id UUID NOT NULL REFERENCES goods_receipts(id),
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
COMMENT ON TABLE goods_receipt_items IS '收货单明细表';
COMMENT ON COLUMN goods_receipt_items.item_type IS 'N004: Item type - MATERIAL or SKU';
COMMENT ON COLUMN goods_receipt_items.sku_id IS 'N004: SKU reference (when item_type = SKU, nullable)';
COMMENT ON COLUMN goods_receipt_items.material_id IS 'N004: Material reference (when item_type = MATERIAL)';

-- ============================================
-- 第 5 部分: 库存管理表
-- ============================================

-- 5.1 库存调整单表
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
COMMENT ON TABLE inventory_adjustments IS '库存调整单表';
COMMENT ON COLUMN inventory_adjustments.adjustment_number IS '调整单号，如 ADJ20251226001';
COMMENT ON COLUMN inventory_adjustments.adjustment_type IS '调整类型：surplus(盘盈)/shortage(盘亏)/damage(报损)';
COMMENT ON COLUMN inventory_adjustments.quantity IS '调整数量（始终为正数）';
COMMENT ON COLUMN inventory_adjustments.unit_price IS 'SKU单价';
COMMENT ON COLUMN inventory_adjustments.adjustment_amount IS '调整金额 = quantity × unit_price（自动计算）';
COMMENT ON COLUMN inventory_adjustments.status IS '状态：draft/pending_approval/approved/rejected/withdrawn';
COMMENT ON COLUMN inventory_adjustments.requires_approval IS '是否需要审批（金额>=阈值）';
COMMENT ON COLUMN inventory_adjustments.version IS '乐观锁版本号';

-- 5.2 审批记录表
CREATE TABLE IF NOT EXISTS approval_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adjustment_id UUID NOT NULL REFERENCES inventory_adjustments(id),
    approver_id UUID NOT NULL,
    approver_name VARCHAR(100) NOT NULL,
    action VARCHAR(20) NOT NULL,
    status_before VARCHAR(20) NOT NULL,
    status_after VARCHAR(20) NOT NULL,
    comments TEXT,
    action_time TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE approval_records IS '调整单审批记录表';
COMMENT ON COLUMN approval_records.action IS '操作类型：approve/reject/withdraw';
COMMENT ON COLUMN approval_records.status_before IS '操作前状态';
COMMENT ON COLUMN approval_records.status_after IS '操作后状态';

-- 5.3 库存流水表
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
    reference_id UUID,
    related_order_id UUID,
    bom_snapshot_id UUID,
    operator_id UUID,
    operator_name VARCHAR(100),
    remarks TEXT,
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE inventory_transactions IS '库存流水表';
COMMENT ON COLUMN inventory_transactions.transaction_type IS '流水类型：purchase_in(采购入库)、sale_out(销售出库)、adjustment_in(盘盈)、adjustment_out(盘亏)、damage_out(报损)等';
COMMENT ON COLUMN inventory_transactions.bom_snapshot_id IS 'BOM snapshot ID for audit trail (shows which formula version was used)';
COMMENT ON COLUMN inventory_transactions.related_order_id IS 'Order ID for BOM-related transactions';

-- 5.4 库存预留表
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
COMMENT ON TABLE inventory_reservations IS '库存预留表';
COMMENT ON COLUMN inventory_reservations.status IS 'Reservation state: ACTIVE | FULFILLED | CANCELLED | EXPIRED';
COMMENT ON COLUMN inventory_reservations.reserved_quantity IS 'Quantity locked for this reservation';
COMMENT ON COLUMN inventory_reservations.expires_at IS 'Auto-release timestamp (NULL = no expiry)';

-- 5.5 BOM 快照表
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
COMMENT ON TABLE bom_snapshots IS 'BOM 快照表（订单生成时保存的配方版本）';
COMMENT ON COLUMN bom_snapshots.finished_sku_id IS 'Finished product SKU (成品SKU)';

-- ============================================
-- 第 6 部分: 订单管理表
-- ============================================

-- 6.1 商品订单表
CREATE TABLE IF NOT EXISTS product_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(20) NOT NULL,
    user_id UUID NOT NULL,
    order_type VARCHAR(20) NOT NULL DEFAULT 'PRODUCT',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING_PAYMENT',
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
COMMENT ON TABLE product_orders IS '商品订单表';
COMMENT ON COLUMN product_orders.order_type IS '订单类型: PRODUCT(商品订单)';

-- 6.2 订单明细表
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES product_orders(id),
    product_id UUID NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    product_spec VARCHAR(100),
    product_image VARCHAR(500),
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE order_items IS '商品订单明细表';

-- 6.3 订单操作日志表
CREATE TABLE IF NOT EXISTS order_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES product_orders(id),
    action VARCHAR(50) NOT NULL,
    status_before VARCHAR(20),
    status_after VARCHAR(20),
    operator_id UUID NOT NULL,
    operator_name VARCHAR(100) NOT NULL,
    comments TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE order_logs IS '订单操作日志表';

-- 6.4 饮品订单表
CREATE TABLE IF NOT EXISTS beverage_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) NOT NULL,
    user_id UUID NOT NULL,
    store_id UUID NOT NULL,
    order_type VARCHAR(20) NOT NULL DEFAULT 'BEVERAGE',
    total_price NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING_PAYMENT',
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
COMMENT ON TABLE beverage_orders IS '饮品订单表';
COMMENT ON COLUMN beverage_orders.order_number IS '订单号（业务主键）: BORDT + yyyyMMddHHmmss + 4位随机数';
COMMENT ON COLUMN beverage_orders.status IS '订单状态: PENDING_PAYMENT(待支付), PENDING_PRODUCTION(待制作), PRODUCING(制作中), COMPLETED(已完成), DELIVERED(已交付), CANCELLED(已取消)';
COMMENT ON COLUMN beverage_orders.order_type IS '订单类型: BEVERAGE(饮品订单)';

-- 6.5 饮品订单明细表
CREATE TABLE IF NOT EXISTS beverage_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES beverage_orders(id),
    beverage_id UUID NOT NULL REFERENCES beverages(id),
    beverage_name VARCHAR(100) NOT NULL,
    beverage_image_url TEXT,
    selected_specs JSONB NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    customer_note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE beverage_order_items IS '饮品订单明细表';
COMMENT ON COLUMN beverage_order_items.order_id IS '关联的订单 ID';
COMMENT ON COLUMN beverage_order_items.beverage_id IS '关联的饮品 ID';
COMMENT ON COLUMN beverage_order_items.beverage_name IS '饮品名称快照（下单时的名称）';
COMMENT ON COLUMN beverage_order_items.selected_specs IS '选中的规格快照 JSON，包含 size/temperature/sweetness/topping';
COMMENT ON COLUMN beverage_order_items.quantity IS '购买数量';
COMMENT ON COLUMN beverage_order_items.unit_price IS '单价快照（含规格调整后的价格）';
COMMENT ON COLUMN beverage_order_items.subtotal IS '小计 = unit_price × quantity';
COMMENT ON COLUMN beverage_order_items.customer_note IS '顾客对单个饮品的备注（如"少冰"、"多糖"等）';

-- 6.6 饮品订单状态日志表
CREATE TABLE IF NOT EXISTS beverage_order_status_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES beverage_orders(id),
    from_status VARCHAR(20),
    to_status VARCHAR(20) NOT NULL,
    changed_by UUID,
    change_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE beverage_order_status_logs IS '饮品订单状态变更日志';
COMMENT ON COLUMN beverage_order_status_logs.order_id IS '关联的订单 ID';
COMMENT ON COLUMN beverage_order_status_logs.from_status IS '变更前状态';
COMMENT ON COLUMN beverage_order_status_logs.to_status IS '变更后状态';
COMMENT ON COLUMN beverage_order_status_logs.changed_by IS '操作人 UUID，NULL 表示系统自动变更';
COMMENT ON COLUMN beverage_order_status_logs.change_reason IS '变更原因说明';

-- 6.7 取餐号表
CREATE TABLE IF NOT EXISTS queue_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    queue_number VARCHAR(10) NOT NULL,
    order_id UUID NOT NULL REFERENCES beverage_orders(id),
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
COMMENT ON TABLE queue_numbers IS '取餐号表';
COMMENT ON COLUMN queue_numbers.queue_number IS '取餐号格式: D001-D999';
COMMENT ON COLUMN queue_numbers.order_id IS '关联的订单 ID（一个订单只有一个取餐号）';
COMMENT ON COLUMN queue_numbers.store_id IS '门店 ID';
COMMENT ON COLUMN queue_numbers.date IS '生成日期（每日重置序号）';
COMMENT ON COLUMN queue_numbers.sequence IS '当日序号 (1-999)';
COMMENT ON COLUMN queue_numbers.status IS '取餐号状态: ACTIVE(激活/等待叫号), CALLED(已叫号), COMPLETED(已完成/已取餐)';

-- ============================================
-- 第 7 部分: 预约管理表
-- ============================================

-- 7.1 预约订单表
CREATE TABLE IF NOT EXISTS reservation_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(30) NOT NULL,
    user_id UUID NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    user_phone VARCHAR(20) NOT NULL,
    scenario_package_id UUID NOT NULL REFERENCES scenario_packages(id),
    package_tier_id UUID,
    time_slot_template_id UUID,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    duration_hours NUMERIC(5,2) NOT NULL,
    guest_count INTEGER NOT NULL,
    total_price NUMERIC(10,2) NOT NULL,
    deposit_amount NUMERIC(10,2) DEFAULT 0,
    final_amount NUMERIC(10,2) DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    payment_method VARCHAR(50),
    payment_time TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancel_reason TEXT,
    completed_at TIMESTAMPTZ,
    special_requests TEXT,
    internal_notes TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT idx_reservation_order_number UNIQUE (order_number)
);
COMMENT ON TABLE reservation_orders IS '预约订单表';

-- 7.2 预约订单明细表
CREATE TABLE IF NOT EXISTS reservation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_order_id UUID NOT NULL REFERENCES reservation_orders(id),
    item_type VARCHAR(20) NOT NULL,
    item_id UUID,
    addon_item_id UUID REFERENCES addon_items(id),
    item_name VARCHAR(200) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE reservation_items IS '预约订单明细表';

-- 7.3 预约操作日志表
CREATE TABLE IF NOT EXISTS reservation_operation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_order_id UUID NOT NULL REFERENCES reservation_orders(id),
    operation_type VARCHAR(50) NOT NULL,
    status_before VARCHAR(20),
    status_after VARCHAR(20),
    operator_id UUID,
    operator_name VARCHAR(100),
    operation_detail JSONB,
    operation_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE reservation_operation_logs IS '预约操作日志表';

-- 7.4 时段库存快照表
CREATE TABLE IF NOT EXISTS slot_inventory_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    time_slot_template_id UUID NOT NULL REFERENCES time_slot_templates(id),
    reservation_date DATE NOT NULL,
    reservation_order_id UUID REFERENCES reservation_orders(id),
    inventory_before INTEGER NOT NULL,
    inventory_after INTEGER NOT NULL,
    operation_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT idx_snapshot_reservation UNIQUE (reservation_order_id)
);
COMMENT ON TABLE slot_inventory_snapshots IS '时段库存变更快照表';

-- ============================================
-- 第 8 部分: 场景套餐关联表
-- ============================================

-- 8.1 套餐门店关联表
CREATE TABLE IF NOT EXISTS scenario_package_store_associations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id),
    store_id UUID NOT NULL REFERENCES stores(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_package_store UNIQUE (package_id, store_id)
);
COMMENT ON TABLE scenario_package_store_associations IS '套餐门店关联表';

-- 8.2 套餐影厅类型关联表
CREATE TABLE IF NOT EXISTS package_hall_associations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id),
    hall_type_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT package_hall_associations_package_id_hall_type_id_key UNIQUE (package_id, hall_type_id)
);
COMMENT ON TABLE package_hall_associations IS '套餐影厅类型关联表';

-- 8.3 套餐定价表
CREATE TABLE IF NOT EXISTS package_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id),
    package_price NUMERIC(10,2) NOT NULL,
    reference_price_snapshot NUMERIC(10,2),
    discount_percentage NUMERIC(5,2),
    discount_amount NUMERIC(10,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT package_pricing_package_id_key UNIQUE (package_id)
);
COMMENT ON TABLE package_pricing IS '套餐定价表';

-- 8.4 套餐规则表
CREATE TABLE IF NOT EXISTS package_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id),
    duration_hours NUMERIC(5,2) NOT NULL,
    min_people INTEGER,
    max_people INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT package_rules_package_id_key UNIQUE (package_id)
);
COMMENT ON TABLE package_rules IS '套餐规则表';

-- 8.5 套餐商品表
CREATE TABLE IF NOT EXISTS package_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id),
    item_id UUID NOT NULL,
    quantity INTEGER NOT NULL,
    item_name_snapshot VARCHAR(255) NOT NULL,
    item_price_snapshot NUMERIC(10,2) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE package_items IS '套餐商品表';

-- 8.6 套餐服务表
CREATE TABLE IF NOT EXISTS package_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id),
    service_id UUID NOT NULL,
    service_name_snapshot VARCHAR(255) NOT NULL,
    service_price_snapshot NUMERIC(10,2) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE package_services IS '套餐服务表';

-- 8.7 套餐权益表
CREATE TABLE IF NOT EXISTS package_benefits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id),
    benefit_type VARCHAR(50) NOT NULL,
    discount_rate NUMERIC(5,2),
    free_count INTEGER,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE package_benefits IS '套餐权益表';

-- 8.8 套餐档位表
CREATE TABLE IF NOT EXISTS package_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id),
    name VARCHAR(100) NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    original_price NUMERIC(10,2),
    tags JSONB,
    service_description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE package_tiers IS '套餐档位表';

-- 8.9 套餐加购商品表
CREATE TABLE IF NOT EXISTS package_addons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id),
    addon_item_id UUID NOT NULL REFERENCES addon_items(id),
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_required BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT package_addons_package_id_addon_item_id_key UNIQUE (package_id, addon_item_id)
);
COMMENT ON TABLE package_addons IS '套餐加购商品关联表';

-- ============================================
-- 第 9 部分: 审计与日志表
-- ============================================

-- 9.1 分类审计日志表
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
COMMENT ON TABLE category_audit_log IS '分类操作审计日志表';
COMMENT ON COLUMN category_audit_log.action IS '操作类型: CREATE, UPDATE, DELETE, REORDER';
COMMENT ON COLUMN category_audit_log.before_data IS '操作前的分类数据快照';
COMMENT ON COLUMN category_audit_log.after_data IS '操作后的分类数据快照';

-- ============================================
-- 第 10 部分: 创建枚举类型
-- ============================================

-- 物料类别枚举
DO $$ BEGIN
    CREATE TYPE material_category AS ENUM ('RAW_MATERIAL', 'PACKAGING');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- 第 11 部分: 创建索引
-- ============================================

-- stores 表索引
CREATE INDEX IF NOT EXISTS idx_stores_code ON stores(code);
CREATE INDEX IF NOT EXISTS idx_stores_status ON stores(status);
CREATE INDEX IF NOT EXISTS idx_stores_province ON stores(province);
CREATE INDEX IF NOT EXISTS idx_stores_city ON stores(city);
CREATE INDEX IF NOT EXISTS idx_stores_district ON stores(district);

-- suppliers 表索引
CREATE INDEX IF NOT EXISTS idx_suppliers_code ON suppliers(code);
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);

-- units 表索引
CREATE INDEX IF NOT EXISTS idx_units_code ON units(code);
CREATE INDEX IF NOT EXISTS idx_units_category ON units(category);
CREATE INDEX IF NOT EXISTS idx_units_is_base_unit ON units(is_base_unit);

-- categories 表索引
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_level ON categories(level);
CREATE INDEX IF NOT EXISTS idx_categories_status ON categories(status);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- brands 表索引
CREATE INDEX IF NOT EXISTS idx_brands_code ON brands(brand_code);
CREATE INDEX IF NOT EXISTS idx_brands_name ON brands(name);
CREATE INDEX IF NOT EXISTS idx_brands_type ON brands(brand_type);
CREATE INDEX IF NOT EXISTS idx_brands_status ON brands(status);

-- activity_types 表索引
CREATE INDEX IF NOT EXISTS idx_activity_types_name ON activity_types(name);
CREATE INDEX IF NOT EXISTS idx_activity_types_status ON activity_types(status);
CREATE INDEX IF NOT EXISTS idx_activity_types_sort ON activity_types(sort);
CREATE UNIQUE INDEX IF NOT EXISTS idx_activity_types_name_unique ON activity_types(name) WHERE status <> 'DELETED';

-- halls 表索引
CREATE INDEX IF NOT EXISTS idx_halls_store_id ON halls(store_id);
CREATE INDEX IF NOT EXISTS idx_halls_type ON halls(type);
CREATE INDEX IF NOT EXISTS idx_halls_status ON halls(status);

-- materials 表索引
CREATE INDEX IF NOT EXISTS idx_materials_code ON materials(code);
CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category);
CREATE INDEX IF NOT EXISTS idx_materials_status ON materials(status);
CREATE INDEX IF NOT EXISTS idx_materials_inventory_unit_id ON materials(inventory_unit_id);
CREATE INDEX IF NOT EXISTS idx_materials_purchase_unit_id ON materials(purchase_unit_id);

-- spus 表索引
CREATE INDEX IF NOT EXISTS idx_spus_code ON spus(code);
CREATE INDEX IF NOT EXISTS idx_spus_name ON spus(name);
CREATE INDEX IF NOT EXISTS idx_spus_category_id ON spus(category_id);
CREATE INDEX IF NOT EXISTS idx_spus_brand_id ON spus(brand_id);
CREATE INDEX IF NOT EXISTS idx_spus_status ON spus(status);
CREATE INDEX IF NOT EXISTS idx_spus_created_at ON spus(created_at);

-- skus 表索引
CREATE INDEX IF NOT EXISTS idx_skus_code ON skus(code);
CREATE INDEX IF NOT EXISTS idx_skus_spu_id ON skus(spu_id);
CREATE INDEX IF NOT EXISTS idx_skus_category_id ON skus(category_id);
CREATE INDEX IF NOT EXISTS idx_skus_type ON skus(sku_type);
CREATE INDEX IF NOT EXISTS idx_skus_status ON skus(status);
CREATE INDEX IF NOT EXISTS idx_skus_version ON skus(version);
CREATE INDEX IF NOT EXISTS idx_skus_store_scope ON skus USING gin(store_scope);

-- beverages 表索引
CREATE INDEX IF NOT EXISTS idx_beverage_category_status ON beverages(category, status) WHERE status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_beverage_sort ON beverages(sort_order DESC, created_at DESC);

-- menu_category 表索引
CREATE INDEX IF NOT EXISTS idx_menu_category_sort_order ON menu_category(sort_order);
CREATE INDEX IF NOT EXISTS idx_menu_category_code ON menu_category(code) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_menu_category_is_visible ON menu_category(is_visible) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_menu_category_code_unique ON menu_category(code) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_menu_category_default_unique ON menu_category(is_default) WHERE is_default = true AND deleted_at IS NULL;

-- scenario_packages 表索引
CREATE INDEX IF NOT EXISTS idx_pkg_status ON scenario_packages(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pkg_category ON scenario_packages(category) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pkg_created_at ON scenario_packages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pkg_tags ON scenario_packages USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_pkg_latest ON scenario_packages(base_package_id, is_latest) WHERE is_latest = true AND deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_pkg_base_version ON scenario_packages(base_package_id, version) WHERE deleted_at IS NULL;

-- store_reservation_settings 表索引
CREATE INDEX IF NOT EXISTS idx_store_reservation_settings_store_id ON store_reservation_settings(store_id);
CREATE INDEX IF NOT EXISTS idx_store_reservation_settings_enabled ON store_reservation_settings(is_reservation_enabled);
CREATE INDEX IF NOT EXISTS idx_store_reservation_settings_is_active ON store_reservation_settings(is_active);
CREATE INDEX IF NOT EXISTS idx_store_reservation_settings_time_slots ON store_reservation_settings USING gin(time_slots);

-- store_operation_logs 表索引
CREATE INDEX IF NOT EXISTS idx_store_operation_logs_store_id ON store_operation_logs(store_id);
CREATE INDEX IF NOT EXISTS idx_store_operation_logs_operation_time ON store_operation_logs(operation_time DESC);

-- channel_product_config 表索引
CREATE INDEX IF NOT EXISTS idx_channel_product_sku_id ON channel_product_config(sku_id);
CREATE INDEX IF NOT EXISTS idx_channel_product_channel_type ON channel_product_config(channel_type);
CREATE INDEX IF NOT EXISTS idx_channel_product_category ON channel_product_config(channel_category);
CREATE INDEX IF NOT EXISTS idx_channel_product_category_id ON channel_product_config(category_id);
CREATE INDEX IF NOT EXISTS idx_channel_product_status ON channel_product_config(status);
CREATE INDEX IF NOT EXISTS idx_channel_product_created_at ON channel_product_config(created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uq_sku_channel_active ON channel_product_config(sku_id, channel_type) WHERE deleted_at IS NULL;

-- store_inventory 表索引
CREATE INDEX IF NOT EXISTS idx_store_inventory_store_id ON store_inventory(store_id);
CREATE INDEX IF NOT EXISTS idx_store_inventory_sku_id ON store_inventory(sku_id);
CREATE INDEX IF NOT EXISTS idx_store_inventory_material_id ON store_inventory(material_id);
CREATE INDEX IF NOT EXISTS idx_store_inventory_item_type ON store_inventory(inventory_item_type);
CREATE INDEX IF NOT EXISTS idx_store_inventory_available_qty ON store_inventory(available_qty);
CREATE INDEX IF NOT EXISTS idx_store_inventory_lock ON store_inventory(store_id, sku_id);
CREATE INDEX IF NOT EXISTS idx_store_inventory_store_material ON store_inventory(store_id, material_id) WHERE material_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uk_store_inventory_sku ON store_inventory(store_id, sku_id) WHERE sku_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uk_store_inventory_material ON store_inventory(store_id, material_id) WHERE material_id IS NOT NULL;

-- bom_components 表索引
CREATE INDEX IF NOT EXISTS idx_bom_finished_product ON bom_components(finished_product_id);
CREATE INDEX IF NOT EXISTS idx_bom_component ON bom_components(component_id);
CREATE INDEX IF NOT EXISTS idx_bom_material_id ON bom_components(material_id);
CREATE INDEX IF NOT EXISTS idx_bom_component_type ON bom_components(component_type);
CREATE UNIQUE INDEX IF NOT EXISTS uk_bom_component_sku ON bom_components(finished_product_id, component_id) WHERE component_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uk_bom_component_material ON bom_components(finished_product_id, material_id) WHERE material_id IS NOT NULL;

-- combo_items 表索引
CREATE INDEX IF NOT EXISTS idx_combo_combo_id ON combo_items(combo_id);
CREATE INDEX IF NOT EXISTS idx_combo_sub_item ON combo_items(sub_item_id);
CREATE UNIQUE INDEX IF NOT EXISTS uk_combo_sub_item ON combo_items(combo_id, sub_item_id);

-- beverage_specs 表索引
CREATE INDEX IF NOT EXISTS idx_spec_beverage ON beverage_specs(beverage_id, spec_type);
CREATE UNIQUE INDEX IF NOT EXISTS unique_beverage_spec ON beverage_specs(beverage_id, spec_type, spec_name);

-- beverage_recipes 表索引
CREATE INDEX IF NOT EXISTS idx_recipe_beverage ON beverage_recipes(beverage_id);

-- recipe_ingredients 表索引
CREATE INDEX IF NOT EXISTS idx_recipe_ingredient ON recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_ingredient_sku ON recipe_ingredients(sku_id);
CREATE UNIQUE INDEX IF NOT EXISTS unique_recipe_sku ON recipe_ingredients(recipe_id, sku_id);

-- beverage_sku_mapping 表索引
CREATE INDEX IF NOT EXISTS idx_beverage_sku_mapping_new_sku_id ON beverage_sku_mapping(new_sku_id);
CREATE INDEX IF NOT EXISTS idx_beverage_sku_mapping_status ON beverage_sku_mapping(status);

-- time_slot_templates 表索引
CREATE INDEX IF NOT EXISTS idx_tst_package ON time_slot_templates(package_id);
CREATE INDEX IF NOT EXISTS idx_tst_enabled ON time_slot_templates(package_id, is_enabled) WHERE is_enabled = true;

-- time_slot_overrides 表索引
CREATE INDEX IF NOT EXISTS idx_tso_package_date ON time_slot_overrides(package_id, override_date);

-- purchase_orders 表索引
CREATE INDEX IF NOT EXISTS idx_po_order_number ON purchase_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_po_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_po_store_id ON purchase_orders(store_id);
CREATE INDEX IF NOT EXISTS idx_po_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_po_created_at ON purchase_orders(created_at DESC);

-- purchase_order_items 表索引
CREATE INDEX IF NOT EXISTS idx_poi_order_id ON purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_poi_sku_id ON purchase_order_items(sku_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_item_type ON purchase_order_items(item_type);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_material_id ON purchase_order_items(material_id) WHERE material_id IS NOT NULL;

-- purchase_order_status_history 表索引
CREATE INDEX IF NOT EXISTS idx_posh_po_id ON purchase_order_status_history(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_posh_created_at ON purchase_order_status_history(created_at DESC);

-- goods_receipts 表索引
CREATE INDEX IF NOT EXISTS idx_gr_receipt_number ON goods_receipts(receipt_number);
CREATE INDEX IF NOT EXISTS idx_gr_po_id ON goods_receipts(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_gr_store_id ON goods_receipts(store_id);
CREATE INDEX IF NOT EXISTS idx_gr_status ON goods_receipts(status);

-- goods_receipt_items 表索引
CREATE INDEX IF NOT EXISTS idx_gri_receipt_id ON goods_receipt_items(goods_receipt_id);
CREATE INDEX IF NOT EXISTS idx_gri_sku_id ON goods_receipt_items(sku_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipt_items_item_type ON goods_receipt_items(item_type);
CREATE INDEX IF NOT EXISTS idx_goods_receipt_items_material_id ON goods_receipt_items(material_id) WHERE material_id IS NOT NULL;

-- inventory_adjustments 表索引
CREATE INDEX IF NOT EXISTS idx_adjustments_sku_store ON inventory_adjustments(sku_id, store_id);
CREATE INDEX IF NOT EXISTS idx_adjustments_status ON inventory_adjustments(status);
CREATE INDEX IF NOT EXISTS idx_adjustments_created_at ON inventory_adjustments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_adjustments_operator ON inventory_adjustments(operator_id);
CREATE INDEX IF NOT EXISTS idx_adjustments_requires_approval ON inventory_adjustments(requires_approval) WHERE requires_approval = true;

-- approval_records 表索引
CREATE INDEX IF NOT EXISTS idx_approval_adjustment ON approval_records(adjustment_id);
CREATE INDEX IF NOT EXISTS idx_approval_approver ON approval_records(approver_id);
CREATE INDEX IF NOT EXISTS idx_approval_action_time ON approval_records(action_time DESC);

-- inventory_transactions 表索引
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_store_id ON inventory_transactions(store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_sku_id ON inventory_transactions(sku_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type ON inventory_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_time ON inventory_transactions(transaction_time DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_store_type ON inventory_transactions(store_id, transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_order ON inventory_transactions(related_order_id);

-- inventory_reservations 表索引
CREATE INDEX IF NOT EXISTS idx_reservations_sku ON inventory_reservations(store_id, sku_id);
CREATE INDEX IF NOT EXISTS idx_reservations_order ON inventory_reservations(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_reservations_order_id ON inventory_reservations(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_reservations_status ON inventory_reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_status_expires ON inventory_reservations(status, expires_at) WHERE status = 'ACTIVE' AND expires_at IS NOT NULL;

-- bom_snapshots 表索引
CREATE INDEX IF NOT EXISTS idx_bom_snapshots_order_id ON bom_snapshots(order_id);
CREATE INDEX IF NOT EXISTS idx_bom_snapshots_finished_sku ON bom_snapshots(finished_sku_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_order ON bom_snapshots(order_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_finished_sku ON bom_snapshots(finished_sku_id);

-- product_orders 表索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_order_number ON product_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON product_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON product_orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON product_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON product_orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_orders_type ON product_orders(order_type);

-- order_items 表索引
CREATE INDEX IF NOT EXISTS idx_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_items_product_id ON order_items(product_id);

-- order_logs 表索引
CREATE INDEX IF NOT EXISTS idx_logs_order_id ON order_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON order_logs(created_at DESC);

-- beverage_orders 表索引
CREATE INDEX IF NOT EXISTS idx_beverage_order_number ON beverage_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_beverage_order_user ON beverage_orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_beverage_order_store_status ON beverage_orders(store_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_beverage_order_created_at ON beverage_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_beverage_orders_type ON beverage_orders(order_type);

-- beverage_order_items 表索引
CREATE INDEX IF NOT EXISTS idx_order_item_order ON beverage_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_item_beverage ON beverage_order_items(beverage_id);

-- beverage_order_status_logs 表索引
CREATE INDEX IF NOT EXISTS idx_status_log_order ON beverage_order_status_logs(order_id, created_at DESC);

-- queue_numbers 表索引
CREATE INDEX IF NOT EXISTS idx_queue_number ON queue_numbers(store_id, date, status);
CREATE INDEX IF NOT EXISTS idx_queue_order ON queue_numbers(order_id);

-- reservation_orders 表索引
CREATE INDEX IF NOT EXISTS idx_reservation_user ON reservation_orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reservation_package ON reservation_orders(scenario_package_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reservation_status ON reservation_orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reservation_date ON reservation_orders(reservation_date, reservation_time);

-- reservation_items 表索引
CREATE INDEX IF NOT EXISTS idx_item_reservation ON reservation_items(reservation_order_id);

-- reservation_operation_logs 表索引
CREATE INDEX IF NOT EXISTS idx_log_reservation ON reservation_operation_logs(reservation_order_id, operation_time DESC);
CREATE INDEX IF NOT EXISTS idx_log_operator ON reservation_operation_logs(operator_id, operation_time DESC);

-- slot_inventory_snapshots 表索引
CREATE INDEX IF NOT EXISTS idx_snapshot_slot_date ON slot_inventory_snapshots(time_slot_template_id, reservation_date);

-- scenario_package_store_associations 表索引
CREATE INDEX IF NOT EXISTS idx_pkg_store_package ON scenario_package_store_associations(package_id);
CREATE INDEX IF NOT EXISTS idx_pkg_store_store ON scenario_package_store_associations(store_id);

-- package_hall_associations 表索引
CREATE INDEX IF NOT EXISTS idx_pkg_hall_package ON package_hall_associations(package_id);
CREATE INDEX IF NOT EXISTS idx_pkg_hall_hall ON package_hall_associations(hall_type_id);

-- package_pricing 表索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_pricing_package ON package_pricing(package_id);

-- package_rules 表索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_rule_package ON package_rules(package_id);

-- package_items 表索引
CREATE INDEX IF NOT EXISTS idx_item_package ON package_items(package_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_item_item_id ON package_items(item_id);

-- package_services 表索引
CREATE INDEX IF NOT EXISTS idx_service_package ON package_services(package_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_service_service_id ON package_services(service_id);

-- package_benefits 表索引
CREATE INDEX IF NOT EXISTS idx_benefit_package ON package_benefits(package_id, sort_order);

-- package_tiers 表索引
CREATE INDEX IF NOT EXISTS idx_tier_package ON package_tiers(package_id, sort_order);

-- package_addons 表索引
CREATE INDEX IF NOT EXISTS idx_pkg_addon_package ON package_addons(package_id, sort_order);

-- category_audit_log 表索引
CREATE INDEX IF NOT EXISTS idx_category_audit_log_category_id ON category_audit_log(category_id);
CREATE INDEX IF NOT EXISTS idx_category_audit_log_action ON category_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_category_audit_log_created_at ON category_audit_log(created_at);

-- addon_items 表索引
CREATE INDEX IF NOT EXISTS idx_addon_category ON addon_items(category);
CREATE INDEX IF NOT EXISTS idx_addon_active ON addon_items(is_active) WHERE is_active = true;

-- ============================================
-- 完成
-- ============================================
-- 基线 schema 创建完成
-- 表数量: 61
-- 创建时间: 2026-01-11