-- ==============================================
-- Supabase Public Schema DDL Export
-- Fixed: IF NOT EXISTS for indexes, FK at end
-- ==============================================

-- ==============================================
-- Supabase Public Schema DDL Export
-- Generated: 2026-01-06 14:55:36
-- Tables: 53
-- ==============================================


-- ----------------------------------------------
-- Table: activity_types
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "activity_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "status" VARCHAR(20) NOT NULL DEFAULT 'ENABLED'::character varying,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "deleted_at" TIMESTAMP WITH TIME ZONE,
    "created_by" VARCHAR(255),
    "updated_by" VARCHAR(255),
    PRIMARY KEY ("id")
);

ALTER TABLE "activity_types" ADD CONSTRAINT "activity_types_status_check" CHECK (((status)::text = ANY ((ARRAY['ENABLED'::character varying, 'DISABLED'::character varying, 'DELETED'::character varying])::text[])));

CREATE INDEX IF NOT EXISTS idx_activity_types_status ON public.activity_types USING btree (status);

CREATE INDEX IF NOT EXISTS idx_activity_types_sort ON public.activity_types USING btree (sort);

CREATE INDEX IF NOT EXISTS idx_activity_types_name ON public.activity_types USING btree (name);

CREATE UNIQUE INDEX IF NOT EXISTS idx_activity_types_name_unique ON public.activity_types USING btree (name) WHERE ((status)::text <> 'DELETED'::text);


-- ----------------------------------------------
-- Table: addon_items
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "addon_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "price" NUMERIC(10,2) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "image_url" TEXT,
    "inventory" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);

ALTER TABLE "addon_items" ADD CONSTRAINT "addon_items_category_check" CHECK (((category)::text = ANY ((ARRAY['CATERING'::character varying, 'BEVERAGE'::character varying, 'DECORATION'::character varying, 'SERVICE'::character varying, 'OTHER'::character varying])::text[])));

ALTER TABLE "addon_items" ADD CONSTRAINT "addon_items_price_check" CHECK ((price > (0)::numeric));

CREATE INDEX IF NOT EXISTS idx_addon_category ON public.addon_items USING btree (category);

CREATE INDEX IF NOT EXISTS idx_addon_active ON public.addon_items USING btree (is_active) WHERE (is_active = true);


-- ----------------------------------------------
-- Table: adjustment_reasons
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "adjustment_reasons" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "category" VARCHAR(20) NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "sort_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    PRIMARY KEY ("id"),
    CONSTRAINT "adjustment_reasons_code_key" UNIQUE ("code")
);

ALTER TABLE "adjustment_reasons" ADD CONSTRAINT "adjustment_reasons_category_check" CHECK (((category)::text = ANY ((ARRAY['surplus'::character varying, 'shortage'::character varying, 'damage'::character varying])::text[])));

CREATE UNIQUE INDEX IF NOT EXISTS adjustment_reasons_code_key ON public.adjustment_reasons USING btree (code);


-- ----------------------------------------------
-- Table: approval_records
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "approval_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "adjustment_id" UUID NOT NULL,
    "approver_id" UUID NOT NULL,
    "approver_name" VARCHAR(100) NOT NULL,
    "action" VARCHAR(20) NOT NULL,
    "status_before" VARCHAR(20) NOT NULL,
    "status_after" VARCHAR(20) NOT NULL,
    "comments" TEXT,
    "action_time" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    PRIMARY KEY ("id")
);


ALTER TABLE "approval_records" ADD CONSTRAINT "approval_records_action_check" CHECK (((action)::text = ANY ((ARRAY['approve'::character varying, 'reject'::character varying, 'withdraw'::character varying])::text[])));

CREATE INDEX IF NOT EXISTS idx_approval_adjustment ON public.approval_records USING btree (adjustment_id);

CREATE INDEX IF NOT EXISTS idx_approval_approver ON public.approval_records USING btree (approver_id);

CREATE INDEX IF NOT EXISTS idx_approval_action_time ON public.approval_records USING btree (action_time DESC);


-- ----------------------------------------------
-- Table: beverage_order_items
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "beverage_order_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "beverage_id" UUID NOT NULL,
    "beverage_name" VARCHAR(100) NOT NULL,
    "beverage_image_url" TEXT,
    "selected_specs" JSONB NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" NUMERIC(10,2) NOT NULL,
    "subtotal" NUMERIC(10,2) NOT NULL,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "customer_note" TEXT,
    PRIMARY KEY ("id")
);



ALTER TABLE "beverage_order_items" ADD CONSTRAINT "check_quantity" CHECK ((quantity > 0));


ALTER TABLE "beverage_order_items" ADD CONSTRAINT "check_subtotal" CHECK ((subtotal >= (0)::numeric));

ALTER TABLE "beverage_order_items" ADD CONSTRAINT "check_subtotal_calculation" CHECK ((subtotal = (unit_price * (quantity)::numeric)));

ALTER TABLE "beverage_order_items" ADD CONSTRAINT "check_unit_price" CHECK ((unit_price >= (0)::numeric));

CREATE INDEX IF NOT EXISTS idx_order_item_order ON public.beverage_order_items USING btree (order_id);

CREATE INDEX IF NOT EXISTS idx_order_item_beverage ON public.beverage_order_items USING btree (beverage_id);


-- ----------------------------------------------
-- Table: beverage_order_status_logs
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "beverage_order_status_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "from_status" VARCHAR(20),
    "to_status" VARCHAR(20) NOT NULL,
    "changed_by" UUID,
    "change_reason" TEXT,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);


ALTER TABLE "beverage_order_status_logs" ADD CONSTRAINT "check_from_status" CHECK (((from_status)::text = ANY ((ARRAY['PENDING_PAYMENT'::character varying, 'PENDING_PRODUCTION'::character varying, 'PRODUCING'::character varying, 'COMPLETED'::character varying, 'DELIVERED'::character varying, 'CANCELLED'::character varying])::text[])));

ALTER TABLE "beverage_order_status_logs" ADD CONSTRAINT "check_to_status" CHECK (((to_status)::text = ANY ((ARRAY['PENDING_PAYMENT'::character varying, 'PENDING_PRODUCTION'::character varying, 'PRODUCING'::character varying, 'COMPLETED'::character varying, 'DELIVERED'::character varying, 'CANCELLED'::character varying])::text[])));

CREATE INDEX IF NOT EXISTS idx_status_log_order ON public.beverage_order_status_logs USING btree (order_id, created_at DESC);


-- ----------------------------------------------
-- Table: beverage_orders
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "beverage_orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_number" VARCHAR(50) NOT NULL,
    "user_id" UUID NOT NULL,
    "store_id" UUID NOT NULL,
    "total_price" NUMERIC(10,2) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING_PAYMENT'::character varying,
    "payment_method" VARCHAR(50),
    "transaction_id" VARCHAR(100),
    "paid_at" TIMESTAMP WITHOUT TIME ZONE,
    "production_start_time" TIMESTAMP WITHOUT TIME ZONE,
    "completed_at" TIMESTAMP WITHOUT TIME ZONE,
    "delivered_at" TIMESTAMP WITHOUT TIME ZONE,
    "cancelled_at" TIMESTAMP WITHOUT TIME ZONE,
    "customer_note" TEXT,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "order_type" VARCHAR(20) NOT NULL DEFAULT 'BEVERAGE'::character varying,
    PRIMARY KEY ("id"),
    CONSTRAINT "beverage_orders_order_number_key" UNIQUE ("order_number")
);

ALTER TABLE "beverage_orders" ADD CONSTRAINT "check_beverage_order_type" CHECK (((order_type)::text = 'BEVERAGE'::text));

ALTER TABLE "beverage_orders" ADD CONSTRAINT "check_status" CHECK (((status)::text = ANY ((ARRAY['PENDING_PAYMENT'::character varying, 'PENDING_PRODUCTION'::character varying, 'PRODUCING'::character varying, 'COMPLETED'::character varying, 'DELIVERED'::character varying, 'CANCELLED'::character varying])::text[])));



ALTER TABLE "beverage_orders" ADD CONSTRAINT "check_total_price" CHECK ((total_price >= (0)::numeric));

CREATE UNIQUE INDEX IF NOT EXISTS beverage_orders_order_number_key ON public.beverage_orders USING btree (order_number);

CREATE INDEX IF NOT EXISTS idx_beverage_order_user ON public.beverage_orders USING btree (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_beverage_order_store_status ON public.beverage_orders USING btree (store_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_beverage_order_number ON public.beverage_orders USING btree (order_number);

CREATE INDEX IF NOT EXISTS idx_beverage_order_created_at ON public.beverage_orders USING btree (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_beverage_orders_type ON public.beverage_orders USING btree (order_type);


-- ----------------------------------------------
-- Table: beverage_recipes
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "beverage_recipes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "beverage_id" UUID NOT NULL,
    "applicable_specs" TEXT,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    PRIMARY KEY ("id")
);


CREATE INDEX IF NOT EXISTS idx_recipe_beverage ON public.beverage_recipes USING btree (beverage_id);


-- ----------------------------------------------
-- Table: beverage_sku_mapping
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "beverage_sku_mapping" (
    "old_beverage_id" UUID NOT NULL,
    "new_sku_id" UUID NOT NULL,
    "migrated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "migration_script_version" VARCHAR(50) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active'::character varying,
    PRIMARY KEY ("old_beverage_id")
);


ALTER TABLE "beverage_sku_mapping" ADD CONSTRAINT "chk_beverage_sku_mapping_status" CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'deprecated'::character varying])::text[])));

CREATE INDEX IF NOT EXISTS idx_beverage_sku_mapping_new_sku_id ON public.beverage_sku_mapping USING btree (new_sku_id);

CREATE INDEX IF NOT EXISTS idx_beverage_sku_mapping_status ON public.beverage_sku_mapping USING btree (status);


-- ----------------------------------------------
-- Table: beverage_specs
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "beverage_specs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "beverage_id" UUID NOT NULL,
    "spec_type" VARCHAR(50) NOT NULL,
    "spec_name" VARCHAR(50) NOT NULL,
    "spec_code" VARCHAR(50),
    "price_adjustment" NUMERIC(10,2) DEFAULT 0,
    "sort_order" INTEGER DEFAULT 0,
    "is_default" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    PRIMARY KEY ("id"),
    CONSTRAINT "unique_beverage_spec" UNIQUE ("beverage_id", "spec_type", "spec_name")
);


ALTER TABLE "beverage_specs" ADD CONSTRAINT "check_spec_type" CHECK (((spec_type)::text = ANY ((ARRAY['SIZE'::character varying, 'TEMPERATURE'::character varying, 'SWEETNESS'::character varying, 'TOPPING'::character varying])::text[])));

CREATE UNIQUE INDEX IF NOT EXISTS unique_beverage_spec ON public.beverage_specs USING btree (beverage_id, spec_type, spec_name);

CREATE INDEX IF NOT EXISTS idx_spec_beverage ON public.beverage_specs USING btree (beverage_id, spec_type);


-- ----------------------------------------------
-- Table: beverages
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "beverages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(50) NOT NULL,
    "image_url" TEXT,
    "detail_images" JSONB DEFAULT '[]'::jsonb,
    "base_price" NUMERIC(10,2) NOT NULL,
    "nutrition_info" JSONB,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'::character varying,
    "is_recommended" BOOLEAN DEFAULT false,
    "sort_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "created_by" UUID,
    "updated_by" UUID,
    PRIMARY KEY ("id")
);

ALTER TABLE "beverages" ADD CONSTRAINT "check_base_price" CHECK ((base_price >= (0)::numeric));

ALTER TABLE "beverages" ADD CONSTRAINT "check_category" CHECK (((category)::text = ANY ((ARRAY['COFFEE'::character varying, 'TEA'::character varying, 'JUICE'::character varying, 'SMOOTHIE'::character varying, 'MILK_TEA'::character varying, 'OTHER'::character varying])::text[])));

ALTER TABLE "beverages" ADD CONSTRAINT "check_status" CHECK (((status)::text = ANY ((ARRAY['PENDING_PAYMENT'::character varying, 'PENDING_PRODUCTION'::character varying, 'PRODUCING'::character varying, 'COMPLETED'::character varying, 'DELIVERED'::character varying, 'CANCELLED'::character varying])::text[])));



CREATE INDEX IF NOT EXISTS idx_beverage_category_status ON public.beverages USING btree (category, status) WHERE ((status)::text = 'ACTIVE'::text);

CREATE INDEX IF NOT EXISTS idx_beverage_sort ON public.beverages USING btree (sort_order DESC, created_at DESC);


-- ----------------------------------------------
-- Table: bom_components
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "bom_components" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "finished_product_id" UUID NOT NULL,
    "component_id" UUID NOT NULL,
    "quantity" NUMERIC(10,3) NOT NULL,
    "unit" VARCHAR(20) NOT NULL,
    "unit_cost" NUMERIC(10,2),
    "is_optional" BOOLEAN DEFAULT false,
    "sort_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    PRIMARY KEY ("id"),
    CONSTRAINT "uk_bom_component" UNIQUE ("finished_product_id", "component_id")
);



ALTER TABLE "bom_components" ADD CONSTRAINT "bom_components_quantity_check" CHECK ((quantity > (0)::numeric));

CREATE UNIQUE INDEX IF NOT EXISTS uk_bom_component ON public.bom_components USING btree (finished_product_id, component_id);

CREATE INDEX IF NOT EXISTS idx_bom_finished_product ON public.bom_components USING btree (finished_product_id);

CREATE INDEX IF NOT EXISTS idx_bom_component ON public.bom_components USING btree (component_id);


-- ----------------------------------------------
-- Table: bom_snapshots
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "bom_snapshots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "finished_sku_id" UUID NOT NULL,
    "raw_material_sku_id" UUID NOT NULL,
    "quantity" NUMERIC(19,4) NOT NULL,
    "unit" VARCHAR(20) NOT NULL,
    "wastage_rate" NUMERIC(5,4) DEFAULT 0,
    "bom_level" INTEGER NOT NULL,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);



CREATE INDEX IF NOT EXISTS idx_bom_snapshots_order_id ON public.bom_snapshots USING btree (order_id);

CREATE INDEX IF NOT EXISTS idx_bom_snapshots_finished_sku ON public.bom_snapshots USING btree (finished_sku_id);

CREATE INDEX IF NOT EXISTS idx_snapshots_order ON public.bom_snapshots USING btree (order_id);

CREATE INDEX IF NOT EXISTS idx_snapshots_finished_sku ON public.bom_snapshots USING btree (finished_sku_id);


-- ----------------------------------------------
-- Table: brands
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "brands" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "brand_code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "english_name" VARCHAR(200),
    "brand_type" VARCHAR(20) NOT NULL DEFAULT 'own'::character varying,
    "primary_categories" text[] DEFAULT '{}',
    "company" VARCHAR(200),
    "brand_level" VARCHAR(20),
    "tags" text[] DEFAULT '{}',
    "description" TEXT,
    "logo_url" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft'::character varying,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "created_by" VARCHAR(100),
    "updated_by" VARCHAR(100),
    PRIMARY KEY ("id"),
    CONSTRAINT "brands_brand_code_key" UNIQUE ("brand_code")
);

ALTER TABLE "brands" ADD CONSTRAINT "brands_brand_type_check" CHECK (((brand_type)::text = ANY ((ARRAY['own'::character varying, 'agency'::character varying, 'joint'::character varying, 'other'::character varying])::text[])));

ALTER TABLE "brands" ADD CONSTRAINT "brands_status_check" CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'enabled'::character varying, 'disabled'::character varying])::text[])));

CREATE UNIQUE INDEX IF NOT EXISTS brands_brand_code_key ON public.brands USING btree (brand_code);

CREATE INDEX IF NOT EXISTS idx_brands_code ON public.brands USING btree (brand_code);

CREATE INDEX IF NOT EXISTS idx_brands_name ON public.brands USING btree (name);

CREATE INDEX IF NOT EXISTS idx_brands_status ON public.brands USING btree (status);

CREATE INDEX IF NOT EXISTS idx_brands_type ON public.brands USING btree (brand_type);


-- ----------------------------------------------
-- Table: categories
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "categories" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "parent_id" UUID,
    "level" INTEGER NOT NULL DEFAULT 1,
    "sort_order" INTEGER DEFAULT 0,
    "status" VARCHAR(20) DEFAULT 'ACTIVE'::character varying,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    PRIMARY KEY ("id"),
    CONSTRAINT "categories_code_key" UNIQUE ("code")
);


CREATE UNIQUE INDEX IF NOT EXISTS categories_code_key ON public.categories USING btree (code);

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories USING btree (parent_id);

CREATE INDEX IF NOT EXISTS idx_categories_status ON public.categories USING btree (status);


-- ----------------------------------------------
-- Table: category_audit_log
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "category_audit_log" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "category_id" UUID NOT NULL,
    "action" VARCHAR(20) NOT NULL,
    "before_data" JSONB,
    "after_data" JSONB,
    "change_description" TEXT,
    "affected_product_count" INTEGER DEFAULT 0,
    "operator_id" UUID,
    "operator_name" VARCHAR(100),
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "ip_address" VARCHAR(45),
    PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS idx_category_audit_log_category_id ON public.category_audit_log USING btree (category_id);

CREATE INDEX IF NOT EXISTS idx_category_audit_log_action ON public.category_audit_log USING btree (action);

CREATE INDEX IF NOT EXISTS idx_category_audit_log_created_at ON public.category_audit_log USING btree (created_at);


-- ----------------------------------------------
-- Table: channel_product_config
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "channel_product_config" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sku_id" UUID NOT NULL,
    "channel_type" VARCHAR(50) NOT NULL DEFAULT 'MINI_PROGRAM'::character varying,
    "display_name" VARCHAR(100),
    "channel_category" VARCHAR(50) NOT NULL,
    "channel_price" BIGINT,
    "main_image" TEXT,
    "detail_images" JSONB DEFAULT '[]'::jsonb,
    "description" TEXT,
    "specs" JSONB DEFAULT '[]'::jsonb,
    "is_recommended" BOOLEAN DEFAULT false,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'::character varying,
    "sort_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "deleted_at" TIMESTAMP WITHOUT TIME ZONE,
    "category_id" UUID,
    PRIMARY KEY ("id")
);



ALTER TABLE "channel_product_config" ADD CONSTRAINT "chk_channel_category" CHECK (((channel_category)::text = ANY ((ARRAY['ALCOHOL'::character varying, 'COFFEE'::character varying, 'BEVERAGE'::character varying, 'SNACK'::character varying, 'MEAL'::character varying, 'OTHER'::character varying])::text[])));

ALTER TABLE "channel_product_config" ADD CONSTRAINT "chk_channel_price" CHECK (((channel_price IS NULL) OR (channel_price > 0)));

ALTER TABLE "channel_product_config" ADD CONSTRAINT "chk_channel_type" CHECK (((channel_type)::text = ANY ((ARRAY['MINI_PROGRAM'::character varying, 'POS'::character varying, 'DELIVERY'::character varying, 'ECOMMERCE'::character varying])::text[])));

ALTER TABLE "channel_product_config" ADD CONSTRAINT "chk_sort_order" CHECK ((sort_order >= 0));

ALTER TABLE "channel_product_config" ADD CONSTRAINT "chk_status" CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'INACTIVE'::character varying, 'OUT_OF_STOCK'::character varying])::text[])));

CREATE INDEX IF NOT EXISTS idx_channel_product_category_id ON public.channel_product_config USING btree (category_id);

CREATE INDEX IF NOT EXISTS idx_channel_product_channel_type ON public.channel_product_config USING btree (channel_type);

CREATE INDEX IF NOT EXISTS idx_channel_product_category ON public.channel_product_config USING btree (channel_category);

CREATE INDEX IF NOT EXISTS idx_channel_product_status ON public.channel_product_config USING btree (status);

CREATE INDEX IF NOT EXISTS idx_channel_product_sku_id ON public.channel_product_config USING btree (sku_id);

CREATE INDEX IF NOT EXISTS idx_channel_product_created_at ON public.channel_product_config USING btree (created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS uq_sku_channel_active ON public.channel_product_config USING btree (sku_id, channel_type) WHERE (deleted_at IS NULL);


-- ----------------------------------------------
-- Table: combo_items
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "combo_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "combo_id" UUID NOT NULL,
    "sub_item_id" UUID NOT NULL,
    "quantity" NUMERIC(10,3) NOT NULL,
    "unit" VARCHAR(20) NOT NULL,
    "unit_cost" NUMERIC(10,2),
    "sort_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    PRIMARY KEY ("id"),
    CONSTRAINT "uk_combo_sub_item" UNIQUE ("combo_id", "sub_item_id")
);



ALTER TABLE "combo_items" ADD CONSTRAINT "combo_items_quantity_check" CHECK ((quantity > (0)::numeric));

CREATE UNIQUE INDEX IF NOT EXISTS uk_combo_sub_item ON public.combo_items USING btree (combo_id, sub_item_id);

CREATE INDEX IF NOT EXISTS idx_combo_combo_id ON public.combo_items USING btree (combo_id);

CREATE INDEX IF NOT EXISTS idx_combo_sub_item ON public.combo_items USING btree (sub_item_id);


-- ----------------------------------------------
-- Table: flyway_schema_history
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "flyway_schema_history" (
    "installed_rank" INTEGER NOT NULL,
    "version" VARCHAR(50),
    "description" VARCHAR(200) NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "script" VARCHAR(1000) NOT NULL,
    "checksum" INTEGER,
    "installed_by" VARCHAR(100) NOT NULL,
    "installed_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "execution_time" INTEGER NOT NULL,
    "success" BOOLEAN NOT NULL,
    PRIMARY KEY ("installed_rank")
);

CREATE UNIQUE INDEX IF NOT EXISTS flyway_schema_history_pk ON public.flyway_schema_history USING btree (installed_rank);

CREATE INDEX IF NOT EXISTS flyway_schema_history_s_idx ON public.flyway_schema_history USING btree (success);


-- ----------------------------------------------
-- Table: halls
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "halls" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "store_id" UUID NOT NULL,
    "code" VARCHAR(50),
    "name" VARCHAR(200) NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "tags" text[],
    "status" VARCHAR(20) DEFAULT 'active'::character varying,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    PRIMARY KEY ("id"),
    CONSTRAINT "halls_store_id_code_key" UNIQUE ("store_id", "code")
);


ALTER TABLE "halls" ADD CONSTRAINT "halls_capacity_check" CHECK (((capacity > 0) AND (capacity <= 1000)));

ALTER TABLE "halls" ADD CONSTRAINT "halls_status_check" CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'maintenance'::character varying])::text[])));

ALTER TABLE "halls" ADD CONSTRAINT "halls_type_check" CHECK (((type)::text = ANY ((ARRAY['VIP'::character varying, 'PUBLIC'::character varying, 'CP'::character varying, 'PARTY'::character varying])::text[])));

CREATE UNIQUE INDEX IF NOT EXISTS halls_store_id_code_key ON public.halls USING btree (store_id, code);

CREATE INDEX IF NOT EXISTS idx_halls_store_id ON public.halls USING btree (store_id);

CREATE INDEX IF NOT EXISTS idx_halls_status ON public.halls USING btree (status);

CREATE INDEX IF NOT EXISTS idx_halls_type ON public.halls USING btree (type);


-- ----------------------------------------------
-- Table: inventory_adjustments
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "inventory_adjustments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "adjustment_number" VARCHAR(30) NOT NULL,
    "sku_id" UUID NOT NULL,
    "store_id" UUID NOT NULL,
    "adjustment_type" VARCHAR(20) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" NUMERIC(12,2) NOT NULL DEFAULT 0,
    "adjustment_amount" NUMERIC(12,2),
    "reason_code" VARCHAR(50) NOT NULL,
    "reason_text" VARCHAR(500),
    "remarks" VARCHAR(500),
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft'::character varying,
    "stock_before" INTEGER NOT NULL DEFAULT 0,
    "stock_after" INTEGER NOT NULL DEFAULT 0,
    "available_before" INTEGER NOT NULL DEFAULT 0,
    "available_after" INTEGER NOT NULL DEFAULT 0,
    "requires_approval" BOOLEAN DEFAULT false,
    "operator_id" UUID NOT NULL,
    "operator_name" VARCHAR(100) NOT NULL,
    "approved_at" TIMESTAMP WITH TIME ZONE,
    "approved_by" UUID,
    "transaction_id" UUID,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "version" INTEGER DEFAULT 1,
    PRIMARY KEY ("id"),
    CONSTRAINT "inventory_adjustments_adjustment_number_key" UNIQUE ("adjustment_number")
);


ALTER TABLE "inventory_adjustments" ADD CONSTRAINT "inventory_adjustments_adjustment_type_check" CHECK (((adjustment_type)::text = ANY ((ARRAY['surplus'::character varying, 'shortage'::character varying, 'damage'::character varying])::text[])));

ALTER TABLE "inventory_adjustments" ADD CONSTRAINT "inventory_adjustments_quantity_check" CHECK ((quantity > 0));

ALTER TABLE "inventory_adjustments" ADD CONSTRAINT "inventory_adjustments_status_check" CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'pending_approval'::character varying, 'approved'::character varying, 'rejected'::character varying, 'withdrawn'::character varying])::text[])));

CREATE UNIQUE INDEX IF NOT EXISTS inventory_adjustments_adjustment_number_key ON public.inventory_adjustments USING btree (adjustment_number);

CREATE INDEX IF NOT EXISTS idx_adjustments_sku_store ON public.inventory_adjustments USING btree (sku_id, store_id);

CREATE INDEX IF NOT EXISTS idx_adjustments_status ON public.inventory_adjustments USING btree (status);

CREATE INDEX IF NOT EXISTS idx_adjustments_created_at ON public.inventory_adjustments USING btree (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_adjustments_operator ON public.inventory_adjustments USING btree (operator_id);

CREATE INDEX IF NOT EXISTS idx_adjustments_requires_approval ON public.inventory_adjustments USING btree (requires_approval) WHERE (requires_approval = true);


-- ----------------------------------------------
-- Table: inventory_reservations
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "inventory_reservations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "store_id" UUID NOT NULL,
    "sku_id" UUID NOT NULL,
    "quantity" NUMERIC(19,4) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'::character varying,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "released_at" TIMESTAMP WITHOUT TIME ZONE,
    "reserved_quantity" NUMERIC(15,4) NOT NULL,
    "expires_at" TIMESTAMP WITH TIME ZONE,
    "fulfilled_at" TIMESTAMP WITH TIME ZONE,
    "cancelled_at" TIMESTAMP WITH TIME ZONE,
    "notes" TEXT,
    PRIMARY KEY ("id")
);



ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_reserved_quantity_check" CHECK ((reserved_quantity > (0)::numeric));

CREATE INDEX IF NOT EXISTS idx_inventory_reservations_order_id ON public.inventory_reservations USING btree (order_id);

CREATE INDEX IF NOT EXISTS idx_inventory_reservations_status ON public.inventory_reservations USING btree (status);

CREATE INDEX IF NOT EXISTS idx_reservations_order ON public.inventory_reservations USING btree (order_id);

CREATE INDEX IF NOT EXISTS idx_reservations_status_expires ON public.inventory_reservations USING btree (status, expires_at) WHERE (((status)::text = 'ACTIVE'::text) AND (expires_at IS NOT NULL));

CREATE INDEX IF NOT EXISTS idx_reservations_sku ON public.inventory_reservations USING btree (store_id, sku_id);


-- ----------------------------------------------
-- Table: inventory_transactions
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "inventory_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "store_id" UUID NOT NULL,
    "sku_id" UUID NOT NULL,
    "transaction_type" VARCHAR(50) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "stock_before" INTEGER NOT NULL DEFAULT 0,
    "stock_after" INTEGER NOT NULL DEFAULT 0,
    "available_before" INTEGER NOT NULL DEFAULT 0,
    "available_after" INTEGER NOT NULL DEFAULT 0,
    "source_type" VARCHAR(50),
    "source_document" VARCHAR(100),
    "operator_id" UUID,
    "operator_name" VARCHAR(100),
    "remarks" TEXT,
    "transaction_time" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "bom_snapshot_id" UUID,
    "reference_id" UUID,
    "related_order_id" UUID,
    PRIMARY KEY ("id")
);



ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_transaction_type_check" CHECK (((transaction_type)::text = ANY ((ARRAY['purchase_in'::character varying, 'sale_out'::character varying, 'adjustment_in'::character varying, 'adjustment_out'::character varying, 'damage_out'::character varying, 'transfer_in'::character varying, 'transfer_out'::character varying, 'return_in'::character varying, 'return_out'::character varying, 'safety_stock_update'::character varying])::text[])));

CREATE INDEX IF NOT EXISTS idx_inventory_transactions_store_id ON public.inventory_transactions USING btree (store_id);

CREATE INDEX IF NOT EXISTS idx_inventory_transactions_sku_id ON public.inventory_transactions USING btree (sku_id);

CREATE INDEX IF NOT EXISTS idx_inventory_transactions_time ON public.inventory_transactions USING btree (transaction_time DESC);

CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type ON public.inventory_transactions USING btree (transaction_type);

CREATE INDEX IF NOT EXISTS idx_transactions_order ON public.inventory_transactions USING btree (related_order_id);

CREATE INDEX IF NOT EXISTS idx_transactions_store_type ON public.inventory_transactions USING btree (store_id, transaction_type);


-- ----------------------------------------------
-- Table: menu_category
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "menu_category" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(50) NOT NULL,
    "display_name" VARCHAR(50) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "icon_url" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP WITH TIME ZONE,
    "version" BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY ("id")
);

ALTER TABLE "menu_category" ADD CONSTRAINT "chk_code_format" CHECK (((code)::text ~ '^[A-Z][A-Z0-9_]*$'::text));

ALTER TABLE "menu_category" ADD CONSTRAINT "chk_display_name_length" CHECK (((char_length((display_name)::text) >= 1) AND (char_length((display_name)::text) <= 50)));

CREATE INDEX IF NOT EXISTS idx_menu_category_sort_order ON public.menu_category USING btree (sort_order);

CREATE INDEX IF NOT EXISTS idx_menu_category_is_visible ON public.menu_category USING btree (is_visible) WHERE (deleted_at IS NULL);

CREATE INDEX IF NOT EXISTS idx_menu_category_code ON public.menu_category USING btree (code) WHERE (deleted_at IS NULL);

CREATE UNIQUE INDEX IF NOT EXISTS idx_menu_category_default_unique ON public.menu_category USING btree (is_default) WHERE ((is_default = true) AND (deleted_at IS NULL));

CREATE UNIQUE INDEX IF NOT EXISTS idx_menu_category_code_unique ON public.menu_category USING btree (code) WHERE (deleted_at IS NULL);


-- ----------------------------------------------
-- Table: order_items
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "order_items" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "order_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "product_name" VARCHAR(200) NOT NULL,
    "product_spec" VARCHAR(100),
    "product_image" VARCHAR(500),
    "quantity" INTEGER NOT NULL,
    "unit_price" NUMERIC(10,2) NOT NULL,
    "subtotal" NUMERIC(10,2) NOT NULL,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);


ALTER TABLE "order_items" ADD CONSTRAINT "order_items_check" CHECK ((subtotal = ((quantity)::numeric * unit_price)));

ALTER TABLE "order_items" ADD CONSTRAINT "order_items_quantity_check" CHECK ((quantity > 0));

CREATE INDEX IF NOT EXISTS idx_items_order_id ON public.order_items USING btree (order_id);

CREATE INDEX IF NOT EXISTS idx_items_product_id ON public.order_items USING btree (product_id);


-- ----------------------------------------------
-- Table: order_logs
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "order_logs" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "order_id" UUID NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "status_before" VARCHAR(20),
    "status_after" VARCHAR(20),
    "operator_id" UUID NOT NULL,
    "operator_name" VARCHAR(100) NOT NULL,
    "comments" TEXT,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);


CREATE INDEX IF NOT EXISTS idx_logs_order_id ON public.order_logs USING btree (order_id);

CREATE INDEX IF NOT EXISTS idx_logs_created_at ON public.order_logs USING btree (created_at DESC);


-- ----------------------------------------------
-- Table: package_addons
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "package_addons" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "package_id" UUID NOT NULL,
    "addon_item_id" UUID NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    PRIMARY KEY ("id"),
    CONSTRAINT "package_addons_package_id_addon_item_id_key" UNIQUE ("package_id", "addon_item_id")
);



CREATE UNIQUE INDEX IF NOT EXISTS package_addons_package_id_addon_item_id_key ON public.package_addons USING btree (package_id, addon_item_id);

CREATE INDEX IF NOT EXISTS idx_pkg_addon_package ON public.package_addons USING btree (package_id, sort_order);


-- ----------------------------------------------
-- Table: package_benefits
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "package_benefits" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "package_id" UUID NOT NULL,
    "benefit_type" VARCHAR(50) NOT NULL,
    "discount_rate" NUMERIC(5,2),
    "free_count" INTEGER,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);


ALTER TABLE "package_benefits" ADD CONSTRAINT "package_benefits_benefit_type_check" CHECK (((benefit_type)::text = ANY ((ARRAY['DISCOUNT_TICKET'::character varying, 'FREE_SCREENING'::character varying])::text[])));

ALTER TABLE "package_benefits" ADD CONSTRAINT "package_benefits_discount_rate_check" CHECK (((discount_rate IS NULL) OR ((discount_rate > (0)::numeric) AND (discount_rate <= (1)::numeric))));

ALTER TABLE "package_benefits" ADD CONSTRAINT "package_benefits_free_count_check" CHECK (((free_count IS NULL) OR (free_count >= 0)));

CREATE INDEX IF NOT EXISTS idx_benefit_package ON public.package_benefits USING btree (package_id, sort_order);


-- ----------------------------------------------
-- Table: package_hall_associations
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "package_hall_associations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "package_id" UUID NOT NULL,
    "hall_type_id" UUID NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    PRIMARY KEY ("id"),
    CONSTRAINT "package_hall_associations_package_id_hall_type_id_key" UNIQUE ("package_id", "hall_type_id")
);


CREATE UNIQUE INDEX IF NOT EXISTS package_hall_associations_package_id_hall_type_id_key ON public.package_hall_associations USING btree (package_id, hall_type_id);

CREATE INDEX IF NOT EXISTS idx_pkg_hall_package ON public.package_hall_associations USING btree (package_id);

CREATE INDEX IF NOT EXISTS idx_pkg_hall_hall ON public.package_hall_associations USING btree (hall_type_id);


-- ----------------------------------------------
-- Table: package_items
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "package_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "package_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "item_name_snapshot" VARCHAR(255) NOT NULL,
    "item_price_snapshot" NUMERIC(10,2) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);


ALTER TABLE "package_items" ADD CONSTRAINT "package_items_quantity_check" CHECK ((quantity > 0));

CREATE INDEX IF NOT EXISTS idx_item_package ON public.package_items USING btree (package_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_item_item_id ON public.package_items USING btree (item_id);


-- ----------------------------------------------
-- Table: package_pricing
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "package_pricing" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "package_id" UUID NOT NULL,
    "package_price" NUMERIC(10,2) NOT NULL,
    "reference_price_snapshot" NUMERIC(10,2),
    "discount_percentage" NUMERIC(5,2),
    "discount_amount" NUMERIC(10,2),
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    PRIMARY KEY ("id"),
    CONSTRAINT "package_pricing_package_id_key" UNIQUE ("package_id")
);


ALTER TABLE "package_pricing" ADD CONSTRAINT "package_pricing_package_price_check" CHECK ((package_price > (0)::numeric));

CREATE UNIQUE INDEX IF NOT EXISTS package_pricing_package_id_key ON public.package_pricing USING btree (package_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pricing_package ON public.package_pricing USING btree (package_id);


-- ----------------------------------------------
-- Table: package_rules
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "package_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "package_id" UUID NOT NULL,
    "duration_hours" NUMERIC(5,2) NOT NULL,
    "min_people" INTEGER,
    "max_people" INTEGER,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    PRIMARY KEY ("id"),
    CONSTRAINT "package_rules_package_id_key" UNIQUE ("package_id")
);


ALTER TABLE "package_rules" ADD CONSTRAINT "package_rules_check" CHECK (((max_people IS NULL) OR ((min_people IS NULL) OR (max_people >= min_people))));

ALTER TABLE "package_rules" ADD CONSTRAINT "package_rules_duration_hours_check" CHECK ((duration_hours > (0)::numeric));

ALTER TABLE "package_rules" ADD CONSTRAINT "package_rules_min_people_check" CHECK (((min_people IS NULL) OR (min_people >= 0)));

CREATE UNIQUE INDEX IF NOT EXISTS package_rules_package_id_key ON public.package_rules USING btree (package_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_rule_package ON public.package_rules USING btree (package_id);


-- ----------------------------------------------
-- Table: package_services
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "package_services" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "package_id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "service_name_snapshot" VARCHAR(255) NOT NULL,
    "service_price_snapshot" NUMERIC(10,2) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);


CREATE INDEX IF NOT EXISTS idx_service_package ON public.package_services USING btree (package_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_service_service_id ON public.package_services USING btree (service_id);


-- ----------------------------------------------
-- Table: package_tiers
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "package_tiers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "package_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "price" NUMERIC(10,2) NOT NULL,
    "original_price" NUMERIC(10,2),
    "tags" JSONB,
    "service_description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);


ALTER TABLE "package_tiers" ADD CONSTRAINT "package_tiers_price_check" CHECK ((price > (0)::numeric));

CREATE INDEX IF NOT EXISTS idx_tier_package ON public.package_tiers USING btree (package_id, sort_order);


-- ----------------------------------------------
-- Table: product_orders
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "product_orders" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "order_number" VARCHAR(20) NOT NULL,
    "user_id" UUID NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING_PAYMENT'::character varying,
    "product_total" NUMERIC(10,2) NOT NULL,
    "shipping_fee" NUMERIC(10,2) NOT NULL DEFAULT 0,
    "discount_amount" NUMERIC(10,2) NOT NULL DEFAULT 0,
    "total_amount" NUMERIC(10,2) NOT NULL,
    "shipping_address" JSONB,
    "payment_method" VARCHAR(20),
    "payment_time" TIMESTAMP WITHOUT TIME ZONE,
    "shipped_time" TIMESTAMP WITHOUT TIME ZONE,
    "completed_time" TIMESTAMP WITHOUT TIME ZONE,
    "cancelled_time" TIMESTAMP WITHOUT TIME ZONE,
    "cancel_reason" TEXT,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "version" INTEGER NOT NULL DEFAULT 1,
    "order_type" VARCHAR(20) NOT NULL DEFAULT 'PRODUCT'::character varying,
    PRIMARY KEY ("id"),
    CONSTRAINT "product_orders_order_number_key" UNIQUE ("order_number")
);

ALTER TABLE "product_orders" ADD CONSTRAINT "check_product_order_type" CHECK (((order_type)::text = 'PRODUCT'::text));

ALTER TABLE "product_orders" ADD CONSTRAINT "product_orders_check" CHECK ((total_amount = ((product_total + shipping_fee) - discount_amount)));

CREATE UNIQUE INDEX IF NOT EXISTS product_orders_order_number_key ON public.product_orders USING btree (order_number);

CREATE UNIQUE INDEX IF NOT EXISTS idx_order_number ON public.product_orders USING btree (order_number);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.product_orders USING btree (user_id);

CREATE INDEX IF NOT EXISTS idx_orders_status ON public.product_orders USING btree (status);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.product_orders USING btree (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON public.product_orders USING btree (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_product_orders_type ON public.product_orders USING btree (order_type);


-- ----------------------------------------------
-- Table: queue_numbers
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "queue_numbers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "queue_number" VARCHAR(10) NOT NULL,
    "order_id" UUID NOT NULL,
    "store_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "sequence" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING'::character varying,
    "called_at" TIMESTAMP WITHOUT TIME ZONE,
    "picked_at" TIMESTAMP WITHOUT TIME ZONE,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    PRIMARY KEY ("id"),
    CONSTRAINT "unique_order" UNIQUE ("order_id"),
    CONSTRAINT "unique_store_date_sequence" UNIQUE ("store_id", "date", "sequence")
);


ALTER TABLE "queue_numbers" ADD CONSTRAINT "check_sequence" CHECK (((sequence >= 1) AND (sequence <= 999)));

ALTER TABLE "queue_numbers" ADD CONSTRAINT "check_status" CHECK (((status)::text = ANY ((ARRAY['PENDING_PAYMENT'::character varying, 'PENDING_PRODUCTION'::character varying, 'PRODUCING'::character varying, 'COMPLETED'::character varying, 'DELIVERED'::character varying, 'CANCELLED'::character varying])::text[])));



CREATE UNIQUE INDEX IF NOT EXISTS unique_store_date_sequence ON public.queue_numbers USING btree (store_id, date, sequence);

CREATE UNIQUE INDEX IF NOT EXISTS unique_order ON public.queue_numbers USING btree (order_id);

CREATE INDEX IF NOT EXISTS idx_queue_number ON public.queue_numbers USING btree (store_id, date, status);

CREATE INDEX IF NOT EXISTS idx_queue_order ON public.queue_numbers USING btree (order_id);


-- ----------------------------------------------
-- Table: recipe_ingredients
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "recipe_ingredients" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "recipe_id" UUID NOT NULL,
    "sku_id" UUID NOT NULL,
    "quantity" NUMERIC(10,3) NOT NULL,
    "unit" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "ingredient_name" VARCHAR(100) NOT NULL,
    "note" VARCHAR(200),
    PRIMARY KEY ("id"),
    CONSTRAINT "unique_recipe_sku" UNIQUE ("recipe_id", "sku_id")
);



ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "check_quantity" CHECK ((quantity > 0));


CREATE INDEX IF NOT EXISTS idx_recipe_ingredient ON public.recipe_ingredients USING btree (recipe_id);

CREATE UNIQUE INDEX IF NOT EXISTS unique_recipe_sku ON public.recipe_ingredients USING btree (recipe_id, sku_id);

CREATE INDEX IF NOT EXISTS idx_ingredient_sku ON public.recipe_ingredients USING btree (sku_id);


-- ----------------------------------------------
-- Table: reservation_items
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "reservation_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "reservation_order_id" UUID NOT NULL,
    "addon_item_id" UUID NOT NULL,
    "addon_name_snapshot" VARCHAR(100) NOT NULL,
    "addon_price_snapshot" NUMERIC(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "subtotal" NUMERIC(10,2) NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);



ALTER TABLE "reservation_items" ADD CONSTRAINT "chk_item_quantity" CHECK ((quantity > 0));

ALTER TABLE "reservation_items" ADD CONSTRAINT "chk_item_subtotal" CHECK ((subtotal >= (0)::numeric));

CREATE INDEX IF NOT EXISTS idx_item_reservation ON public.reservation_items USING btree (reservation_order_id);


-- ----------------------------------------------
-- Table: reservation_operation_logs
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "reservation_operation_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "reservation_order_id" UUID NOT NULL,
    "operation_type" VARCHAR(20) NOT NULL,
    "operator_id" UUID,
    "operator_name" VARCHAR(100),
    "before_value" JSONB,
    "after_value" JSONB NOT NULL,
    "operation_time" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "ip_address" VARCHAR(45),
    "remark" TEXT,
    PRIMARY KEY ("id")
);


ALTER TABLE "reservation_operation_logs" ADD CONSTRAINT "chk_log_operation_type" CHECK (((operation_type)::text = ANY ((ARRAY['CREATE'::character varying, 'CONFIRM'::character varying, 'CANCEL'::character varying, 'UPDATE'::character varying, 'PAYMENT'::character varying])::text[])));

CREATE INDEX IF NOT EXISTS idx_log_reservation ON public.reservation_operation_logs USING btree (reservation_order_id, operation_time DESC);

CREATE INDEX IF NOT EXISTS idx_log_operator ON public.reservation_operation_logs USING btree (operator_id, operation_time DESC);


-- ----------------------------------------------
-- Table: reservation_orders
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "reservation_orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_number" VARCHAR(20) NOT NULL,
    "user_id" UUID NOT NULL,
    "scenario_package_id" UUID NOT NULL,
    "package_tier_id" UUID NOT NULL,
    "time_slot_template_id" UUID NOT NULL,
    "reservation_date" DATE NOT NULL,
    "reservation_time" TIME WITHOUT TIME ZONE NOT NULL,
    "contact_name" VARCHAR(100) NOT NULL,
    "contact_phone" VARCHAR(20) NOT NULL,
    "remark" TEXT,
    "total_amount" NUMERIC(10,2) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING'::character varying,
    "requires_payment" BOOLEAN NOT NULL DEFAULT false,
    "payment_id" VARCHAR(100),
    "payment_time" TIMESTAMP WITH TIME ZONE,
    "version" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "cancelled_at" TIMESTAMP WITH TIME ZONE,
    "cancel_reason" TEXT,
    PRIMARY KEY ("id")
);




ALTER TABLE "reservation_orders" ADD CONSTRAINT "chk_reservation_amount" CHECK ((total_amount > (0)::numeric));

ALTER TABLE "reservation_orders" ADD CONSTRAINT "chk_reservation_phone" CHECK (((contact_phone)::text ~ '^1[3-9][0-9]{9}$'::text));

ALTER TABLE "reservation_orders" ADD CONSTRAINT "chk_reservation_status" CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'CONFIRMED'::character varying, 'CANCELLED'::character varying, 'COMPLETED'::character varying])::text[])));

CREATE UNIQUE INDEX IF NOT EXISTS idx_reservation_order_number ON public.reservation_orders USING btree (order_number);

CREATE INDEX IF NOT EXISTS idx_reservation_user ON public.reservation_orders USING btree (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reservation_status ON public.reservation_orders USING btree (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reservation_date ON public.reservation_orders USING btree (reservation_date, reservation_time);

CREATE INDEX IF NOT EXISTS idx_reservation_package ON public.reservation_orders USING btree (scenario_package_id, created_at DESC);


-- ----------------------------------------------
-- Table: scenario_package_store_associations
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "scenario_package_store_associations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "package_id" UUID NOT NULL,
    "store_id" UUID NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "created_by" VARCHAR(100),
    PRIMARY KEY ("id"),
    CONSTRAINT "unique_package_store" UNIQUE ("package_id", "store_id")
);



CREATE UNIQUE INDEX IF NOT EXISTS unique_package_store ON public.scenario_package_store_associations USING btree (package_id, store_id);

CREATE INDEX IF NOT EXISTS idx_pkg_store_package ON public.scenario_package_store_associations USING btree (package_id);

CREATE INDEX IF NOT EXISTS idx_pkg_store_store ON public.scenario_package_store_associations USING btree (store_id);


-- ----------------------------------------------
-- Table: scenario_packages
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "scenario_packages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "base_package_id" UUID,
    "version" INTEGER NOT NULL DEFAULT 1,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT'::character varying,
    "is_latest" BOOLEAN NOT NULL DEFAULT true,
    "version_lock" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "deleted_at" TIMESTAMP WITH TIME ZONE,
    "created_by" VARCHAR(100),
    "category" VARCHAR(50),
    "rating" NUMERIC(3,2),
    "tags" JSONB DEFAULT '[]'::jsonb,
    PRIMARY KEY ("id")
);


ALTER TABLE "scenario_packages" ADD CONSTRAINT "scenario_packages_category_check" CHECK (((category)::text = ANY ((ARRAY['MOVIE'::character varying, 'TEAM'::character varying, 'PARTY'::character varying])::text[])));

ALTER TABLE "scenario_packages" ADD CONSTRAINT "scenario_packages_rating_check" CHECK (((rating IS NULL) OR ((rating >= (0)::numeric) AND (rating <= (5)::numeric))));

ALTER TABLE "scenario_packages" ADD CONSTRAINT "scenario_packages_status_check" CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'PUBLISHED'::character varying, 'UNPUBLISHED'::character varying])::text[])));

CREATE UNIQUE INDEX IF NOT EXISTS idx_pkg_base_version ON public.scenario_packages USING btree (base_package_id, version) WHERE (deleted_at IS NULL);

CREATE INDEX IF NOT EXISTS idx_pkg_latest ON public.scenario_packages USING btree (base_package_id, is_latest) WHERE ((is_latest = true) AND (deleted_at IS NULL));

CREATE INDEX IF NOT EXISTS idx_pkg_status ON public.scenario_packages USING btree (status) WHERE (deleted_at IS NULL);

CREATE INDEX IF NOT EXISTS idx_pkg_created_at ON public.scenario_packages USING btree (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pkg_category ON public.scenario_packages USING btree (category) WHERE (deleted_at IS NULL);

CREATE INDEX IF NOT EXISTS idx_pkg_tags ON public.scenario_packages USING gin (tags);


-- ----------------------------------------------
-- Table: skus
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "skus" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "spu_id" UUID NOT NULL,
    "sku_type" VARCHAR(20) NOT NULL,
    "main_unit" VARCHAR(20) NOT NULL,
    "store_scope" text[] DEFAULT '{}',
    "standard_cost" NUMERIC(10,2),
    "waste_rate" NUMERIC(5,2) DEFAULT 0,
    "status" VARCHAR(10) NOT NULL DEFAULT 'draft'::character varying,
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    "price" NUMERIC(10,2) DEFAULT 0,
    "category_id" UUID,
    "version" BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY ("id"),
    CONSTRAINT "skus_code_key" UNIQUE ("code")
);


ALTER TABLE "skus" ADD CONSTRAINT "skus_sku_type_check" CHECK (((sku_type)::text = ANY ((ARRAY['raw_material'::character varying, 'packaging'::character varying, 'finished_product'::character varying, 'combo'::character varying])::text[])));

ALTER TABLE "skus" ADD CONSTRAINT "skus_status_check" CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'enabled'::character varying, 'disabled'::character varying])::text[])));

ALTER TABLE "skus" ADD CONSTRAINT "skus_waste_rate_check" CHECK (((waste_rate >= (0)::numeric) AND (waste_rate <= (100)::numeric)));

CREATE UNIQUE INDEX IF NOT EXISTS skus_code_key ON public.skus USING btree (code);

CREATE INDEX IF NOT EXISTS idx_skus_code ON public.skus USING btree (code);

CREATE INDEX IF NOT EXISTS idx_skus_spu_id ON public.skus USING btree (spu_id);

CREATE INDEX IF NOT EXISTS idx_skus_type ON public.skus USING btree (sku_type);

CREATE INDEX IF NOT EXISTS idx_skus_status ON public.skus USING btree (status);

CREATE INDEX IF NOT EXISTS idx_skus_store_scope ON public.skus USING gin (store_scope);

CREATE INDEX IF NOT EXISTS idx_skus_category_id ON public.skus USING btree (category_id);

CREATE INDEX IF NOT EXISTS idx_skus_version ON public.skus USING btree (version);


-- ----------------------------------------------
-- Table: slot_inventory_snapshots
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "slot_inventory_snapshots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "reservation_order_id" UUID NOT NULL,
    "time_slot_template_id" UUID NOT NULL,
    "reservation_date" DATE NOT NULL,
    "total_capacity" INTEGER NOT NULL,
    "booked_count" INTEGER NOT NULL,
    "remaining_capacity" INTEGER NOT NULL,
    "snapshot_time" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);



ALTER TABLE "slot_inventory_snapshots" ADD CONSTRAINT "chk_snapshot_booked" CHECK ((booked_count >= 0));

ALTER TABLE "slot_inventory_snapshots" ADD CONSTRAINT "chk_snapshot_capacity" CHECK ((total_capacity > 0));

CREATE UNIQUE INDEX IF NOT EXISTS idx_snapshot_reservation ON public.slot_inventory_snapshots USING btree (reservation_order_id);

CREATE INDEX IF NOT EXISTS idx_snapshot_slot_date ON public.slot_inventory_snapshots USING btree (time_slot_template_id, reservation_date);


-- ----------------------------------------------
-- Table: spus
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "spus" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "short_name" VARCHAR(100),
    "description" TEXT,
    "category_id" VARCHAR(100),
    "category_name" VARCHAR(200),
    "brand_id" VARCHAR(100),
    "brand_name" VARCHAR(100),
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft'::character varying,
    "unit" VARCHAR(20),
    "tags" text[],
    "images" JSONB DEFAULT '[]'::jsonb,
    "specifications" JSONB DEFAULT '[]'::jsonb,
    "attributes" JSONB DEFAULT '[]'::jsonb,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "created_by" VARCHAR(100),
    "updated_by" VARCHAR(100),
    "product_type" VARCHAR(20),
    PRIMARY KEY ("id"),
    CONSTRAINT "spus_code_key" UNIQUE ("code")
);

ALTER TABLE "spus" ADD CONSTRAINT "chk_spus_product_type" CHECK (((product_type IS NULL) OR ((product_type)::text = ANY ((ARRAY['raw_material'::character varying, 'packaging'::character varying, 'finished_product'::character varying, 'combo'::character varying])::text[]))));

CREATE UNIQUE INDEX IF NOT EXISTS spus_code_key ON public.spus USING btree (code);

CREATE INDEX IF NOT EXISTS idx_spus_code ON public.spus USING btree (code);

CREATE INDEX IF NOT EXISTS idx_spus_name ON public.spus USING btree (name);

CREATE INDEX IF NOT EXISTS idx_spus_status ON public.spus USING btree (status);

CREATE INDEX IF NOT EXISTS idx_spus_category_id ON public.spus USING btree (category_id);

CREATE INDEX IF NOT EXISTS idx_spus_brand_id ON public.spus USING btree (brand_id);

CREATE INDEX IF NOT EXISTS idx_spus_created_at ON public.spus USING btree (created_at);


-- ----------------------------------------------
-- Table: store_inventory
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "store_inventory" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "store_id" UUID NOT NULL,
    "sku_id" UUID NOT NULL,
    "on_hand_qty" NUMERIC(12,3) NOT NULL DEFAULT 0,
    "available_qty" NUMERIC(12,3) NOT NULL DEFAULT 0,
    "reserved_qty" NUMERIC(12,3) NOT NULL DEFAULT 0,
    "safety_stock" NUMERIC(12,3) DEFAULT 0,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "version" INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY ("id"),
    CONSTRAINT "store_inventory_store_id_sku_id_key" UNIQUE ("store_id", "sku_id")
);



ALTER TABLE "store_inventory" ADD CONSTRAINT "chk_store_inventory_reserved_lte_on_hand" CHECK ((on_hand_qty >= reserved_qty));

CREATE UNIQUE INDEX IF NOT EXISTS store_inventory_store_id_sku_id_key ON public.store_inventory USING btree (store_id, sku_id);

CREATE INDEX IF NOT EXISTS idx_store_inventory_store_id ON public.store_inventory USING btree (store_id);

CREATE INDEX IF NOT EXISTS idx_store_inventory_sku_id ON public.store_inventory USING btree (sku_id);

CREATE INDEX IF NOT EXISTS idx_store_inventory_available_qty ON public.store_inventory USING btree (available_qty);

CREATE INDEX IF NOT EXISTS idx_store_inventory_lock ON public.store_inventory USING btree (store_id, sku_id);


-- ----------------------------------------------
-- Table: store_operation_logs
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "store_operation_logs" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "store_id" UUID NOT NULL,
    "operation_type" VARCHAR(20) NOT NULL,
    "operator_id" UUID,
    "operator_name" VARCHAR(100),
    "before_value" JSONB,
    "after_value" JSONB,
    "operation_time" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "ip_address" VARCHAR(45),
    "remark" TEXT,
    PRIMARY KEY ("id")
);


ALTER TABLE "store_operation_logs" ADD CONSTRAINT "store_operation_logs_operation_type_check" CHECK (((operation_type)::text = ANY ((ARRAY['CREATE'::character varying, 'UPDATE'::character varying, 'STATUS_CHANGE'::character varying, 'DELETE'::character varying])::text[])));

CREATE INDEX IF NOT EXISTS idx_store_operation_logs_store_id ON public.store_operation_logs USING btree (store_id);

CREATE INDEX IF NOT EXISTS idx_store_operation_logs_operation_time ON public.store_operation_logs USING btree (operation_time DESC);


-- ----------------------------------------------
-- Table: store_reservation_settings
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "store_reservation_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "store_id" UUID NOT NULL,
    "is_reservation_enabled" BOOLEAN NOT NULL DEFAULT false,
    "max_reservation_days" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_by" VARCHAR(255),
    "time_slots" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "min_advance_hours" INTEGER NOT NULL DEFAULT 1,
    "duration_unit" INTEGER NOT NULL DEFAULT 1,
    "deposit_required" BOOLEAN NOT NULL DEFAULT false,
    "deposit_amount" NUMERIC(10,2),
    "deposit_percentage" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    PRIMARY KEY ("id"),
    CONSTRAINT "store_reservation_settings_store_id_key" UNIQUE ("store_id")
);


ALTER TABLE "store_reservation_settings" ADD CONSTRAINT "store_reservation_settings_deposit_amount_check" CHECK (((deposit_amount IS NULL) OR (deposit_amount >= (0)::numeric)));

ALTER TABLE "store_reservation_settings" ADD CONSTRAINT "store_reservation_settings_deposit_percentage_check" CHECK (((deposit_percentage IS NULL) OR ((deposit_percentage >= 0) AND (deposit_percentage <= 100))));

ALTER TABLE "store_reservation_settings" ADD CONSTRAINT "store_reservation_settings_duration_unit_check" CHECK ((duration_unit = ANY (ARRAY[1, 2, 4])));

ALTER TABLE "store_reservation_settings" ADD CONSTRAINT "store_reservation_settings_max_reservation_days_check" CHECK (((max_reservation_days >= 0) AND (max_reservation_days <= 365)));

ALTER TABLE "store_reservation_settings" ADD CONSTRAINT "store_reservation_settings_min_advance_hours_check" CHECK ((min_advance_hours > 0));

CREATE INDEX IF NOT EXISTS idx_store_reservation_settings_store_id ON public.store_reservation_settings USING btree (store_id);

CREATE INDEX IF NOT EXISTS idx_store_reservation_settings_enabled ON public.store_reservation_settings USING btree (is_reservation_enabled);

CREATE UNIQUE INDEX IF NOT EXISTS store_reservation_settings_store_id_key ON public.store_reservation_settings USING btree (store_id);

CREATE INDEX IF NOT EXISTS idx_store_reservation_settings_time_slots ON public.store_reservation_settings USING gin (time_slots);

CREATE INDEX IF NOT EXISTS idx_store_reservation_settings_is_active ON public.store_reservation_settings USING btree (is_active);


-- ----------------------------------------------
-- Table: stores
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "stores" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "address" TEXT,
    "phone" VARCHAR(50),
    "business_hours" JSONB,
    "status" VARCHAR(20) DEFAULT 'active'::character varying,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "province" VARCHAR(50),
    "city" VARCHAR(50),
    "district" VARCHAR(50),
    "version" BIGINT NOT NULL DEFAULT 0,
    "opening_date" DATE,
    "area" INTEGER,
    "hall_count" INTEGER,
    "seat_count" INTEGER,
    PRIMARY KEY ("id"),
    CONSTRAINT "stores_code_key" UNIQUE ("code")
);

ALTER TABLE "stores" ADD CONSTRAINT "chk_phone_format" CHECK (((phone IS NULL) OR ((phone)::text ~ '^(1[3-9]\d{9})|(0\d{2,3}-?\d{7,8})|(400-?\d{3}-?\d{4})$'::text)));

ALTER TABLE "stores" ADD CONSTRAINT "ck_stores_area_positive" CHECK (((area IS NULL) OR (area > 0)));

ALTER TABLE "stores" ADD CONSTRAINT "ck_stores_hall_count_positive" CHECK (((hall_count IS NULL) OR (hall_count > 0)));

ALTER TABLE "stores" ADD CONSTRAINT "ck_stores_seat_count_positive" CHECK (((seat_count IS NULL) OR (seat_count > 0)));

ALTER TABLE "stores" ADD CONSTRAINT "stores_status_check" CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[])));

CREATE UNIQUE INDEX IF NOT EXISTS stores_code_key ON public.stores USING btree (code);

CREATE INDEX IF NOT EXISTS idx_stores_code ON public.stores USING btree (code);

CREATE INDEX IF NOT EXISTS idx_stores_status ON public.stores USING btree (status);

CREATE INDEX IF NOT EXISTS idx_stores_province ON public.stores USING btree (province);

CREATE INDEX IF NOT EXISTS idx_stores_city ON public.stores USING btree (city);

CREATE INDEX IF NOT EXISTS idx_stores_district ON public.stores USING btree (district);


-- ----------------------------------------------
-- Table: time_slot_overrides
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "time_slot_overrides" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "package_id" UUID NOT NULL,
    "override_date" DATE NOT NULL,
    "override_type" VARCHAR(20) NOT NULL,
    "start_time" TIME WITHOUT TIME ZONE,
    "end_time" TIME WITHOUT TIME ZONE,
    "capacity" INTEGER,
    "reason" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);


ALTER TABLE "time_slot_overrides" ADD CONSTRAINT "time_slot_overrides_override_type_check" CHECK (((override_type)::text = ANY ((ARRAY['CANCEL'::character varying, 'MODIFY'::character varying, 'ADD'::character varying])::text[])));

CREATE INDEX IF NOT EXISTS idx_tso_package_date ON public.time_slot_overrides USING btree (package_id, override_date);


-- ----------------------------------------------
-- Table: time_slot_templates
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "time_slot_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "package_id" UUID NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TIME WITHOUT TIME ZONE NOT NULL,
    "end_time" TIME WITHOUT TIME ZONE NOT NULL,
    "capacity" INTEGER,
    "price_adjustment" JSONB,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);


ALTER TABLE "time_slot_templates" ADD CONSTRAINT "time_slot_templates_day_of_week_check" CHECK (((day_of_week >= 0) AND (day_of_week <= 6)));

ALTER TABLE "time_slot_templates" ADD CONSTRAINT "valid_time_range" CHECK ((end_time > start_time));

CREATE INDEX IF NOT EXISTS idx_tst_package ON public.time_slot_templates USING btree (package_id);

CREATE INDEX IF NOT EXISTS idx_tst_enabled ON public.time_slot_templates USING btree (package_id, is_enabled) WHERE (is_enabled = true);


-- ----------------------------------------------
-- Table: unit_conversions
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "unit_conversions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "from_unit" VARCHAR(20) NOT NULL,
    "to_unit" VARCHAR(20) NOT NULL,
    "conversion_rate" NUMERIC(10,6) NOT NULL,
    "category" VARCHAR(20) NOT NULL,
    PRIMARY KEY ("id"),
    CONSTRAINT "uk_conversion_from_to" UNIQUE ("from_unit", "to_unit")
);

ALTER TABLE "unit_conversions" ADD CONSTRAINT "unit_conversions_category_check" CHECK (((category)::text = ANY ((ARRAY['volume'::character varying, 'weight'::character varying, 'quantity'::character varying])::text[])));

CREATE UNIQUE INDEX IF NOT EXISTS uk_conversion_from_to ON public.unit_conversions USING btree (from_unit, to_unit);


-- ----------------------------------------------
-- Table: users
-- ----------------------------------------------
CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "username" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "province" VARCHAR(50),
    "city" VARCHAR(50),
    "district" VARCHAR(50),
    "address" VARCHAR(200),
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);


-- =========================================
-- Foreign Key Constraints (moved to end)
-- =========================================
ALTER TABLE "approval_records" ADD CONSTRAINT "approval_records_adjustment_id_fkey" FOREIGN KEY ("adjustment_id") REFERENCES "inventory_adjustments" ("id");
ALTER TABLE "beverage_order_items" ADD CONSTRAINT "beverage_order_items_beverage_id_fkey" FOREIGN KEY ("beverage_id") REFERENCES "beverages" ("id");
ALTER TABLE "beverage_order_items" ADD CONSTRAINT "beverage_order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "beverage_orders" ("id");
ALTER TABLE "beverage_order_status_logs" ADD CONSTRAINT "beverage_order_status_logs_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "beverage_orders" ("id");
ALTER TABLE "beverage_recipes" ADD CONSTRAINT "beverage_recipes_beverage_id_fkey" FOREIGN KEY ("beverage_id") REFERENCES "beverages" ("id");
ALTER TABLE "beverage_sku_mapping" ADD CONSTRAINT "fk_beverage_sku_mapping_new_sku" FOREIGN KEY ("new_sku_id") REFERENCES "skus" ("id");
ALTER TABLE "beverage_specs" ADD CONSTRAINT "beverage_specs_beverage_id_fkey" FOREIGN KEY ("beverage_id") REFERENCES "beverages" ("id");
ALTER TABLE "bom_components" ADD CONSTRAINT "bom_components_component_id_fkey" FOREIGN KEY ("component_id") REFERENCES "skus" ("id");
ALTER TABLE "bom_components" ADD CONSTRAINT "bom_components_finished_product_id_fkey" FOREIGN KEY ("finished_product_id") REFERENCES "skus" ("id");
ALTER TABLE "bom_snapshots" ADD CONSTRAINT "fk_snapshot_finished_sku" FOREIGN KEY ("finished_sku_id") REFERENCES "skus" ("id");
ALTER TABLE "bom_snapshots" ADD CONSTRAINT "fk_snapshot_raw_sku" FOREIGN KEY ("raw_material_sku_id") REFERENCES "skus" ("id");
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories" ("id");
ALTER TABLE "channel_product_config" ADD CONSTRAINT "channel_product_config_sku_id_fkey" FOREIGN KEY ("sku_id") REFERENCES "skus" ("id");
ALTER TABLE "channel_product_config" ADD CONSTRAINT "fk_channel_product_category" FOREIGN KEY ("category_id") REFERENCES "menu_category" ("id");
ALTER TABLE "combo_items" ADD CONSTRAINT "combo_items_combo_id_fkey" FOREIGN KEY ("combo_id") REFERENCES "skus" ("id");
ALTER TABLE "combo_items" ADD CONSTRAINT "combo_items_sub_item_id_fkey" FOREIGN KEY ("sub_item_id") REFERENCES "skus" ("id");
ALTER TABLE "halls" ADD CONSTRAINT "halls_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores" ("id");
ALTER TABLE "inventory_adjustments" ADD CONSTRAINT "fk_adjustments_reason" FOREIGN KEY ("reason_code") REFERENCES "adjustment_reasons" ("code");
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "fk_reservation_sku" FOREIGN KEY ("sku_id") REFERENCES "skus" ("id");
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "fk_reservation_store" FOREIGN KEY ("store_id") REFERENCES "stores" ("id");
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_sku_id_fkey" FOREIGN KEY ("sku_id") REFERENCES "skus" ("id");
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores" ("id");
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "product_orders" ("id");
ALTER TABLE "order_logs" ADD CONSTRAINT "order_logs_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "product_orders" ("id");
ALTER TABLE "package_addons" ADD CONSTRAINT "package_addons_addon_item_id_fkey" FOREIGN KEY ("addon_item_id") REFERENCES "addon_items" ("id");
ALTER TABLE "package_addons" ADD CONSTRAINT "package_addons_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "scenario_packages" ("id");
ALTER TABLE "package_benefits" ADD CONSTRAINT "package_benefits_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "scenario_packages" ("id");
ALTER TABLE "package_hall_associations" ADD CONSTRAINT "package_hall_associations_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "scenario_packages" ("id");
ALTER TABLE "package_items" ADD CONSTRAINT "package_items_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "scenario_packages" ("id");
ALTER TABLE "package_pricing" ADD CONSTRAINT "package_pricing_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "scenario_packages" ("id");
ALTER TABLE "package_rules" ADD CONSTRAINT "package_rules_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "scenario_packages" ("id");
ALTER TABLE "package_services" ADD CONSTRAINT "package_services_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "scenario_packages" ("id");
ALTER TABLE "package_tiers" ADD CONSTRAINT "package_tiers_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "scenario_packages" ("id");
ALTER TABLE "queue_numbers" ADD CONSTRAINT "queue_numbers_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "beverage_orders" ("id");
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "beverage_recipes" ("id");
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_sku_id_fkey" FOREIGN KEY ("sku_id") REFERENCES "skus" ("id");
ALTER TABLE "reservation_items" ADD CONSTRAINT "reservation_items_addon_item_id_fkey" FOREIGN KEY ("addon_item_id") REFERENCES "addon_items" ("id");
ALTER TABLE "reservation_items" ADD CONSTRAINT "reservation_items_reservation_order_id_fkey" FOREIGN KEY ("reservation_order_id") REFERENCES "reservation_orders" ("id");
ALTER TABLE "reservation_operation_logs" ADD CONSTRAINT "reservation_operation_logs_reservation_order_id_fkey" FOREIGN KEY ("reservation_order_id") REFERENCES "reservation_orders" ("id");
ALTER TABLE "reservation_orders" ADD CONSTRAINT "reservation_orders_package_tier_id_fkey" FOREIGN KEY ("package_tier_id") REFERENCES "package_tiers" ("id");
ALTER TABLE "reservation_orders" ADD CONSTRAINT "reservation_orders_scenario_package_id_fkey" FOREIGN KEY ("scenario_package_id") REFERENCES "scenario_packages" ("id");
ALTER TABLE "reservation_orders" ADD CONSTRAINT "reservation_orders_time_slot_template_id_fkey" FOREIGN KEY ("time_slot_template_id") REFERENCES "time_slot_templates" ("id");
ALTER TABLE "scenario_package_store_associations" ADD CONSTRAINT "scenario_package_store_associations_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "scenario_packages" ("id");
ALTER TABLE "scenario_package_store_associations" ADD CONSTRAINT "scenario_package_store_associations_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores" ("id");
ALTER TABLE "scenario_packages" ADD CONSTRAINT "scenario_packages_base_package_id_fkey" FOREIGN KEY ("base_package_id") REFERENCES "scenario_packages" ("id");
ALTER TABLE "skus" ADD CONSTRAINT "skus_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories" ("id");
ALTER TABLE "slot_inventory_snapshots" ADD CONSTRAINT "slot_inventory_snapshots_reservation_order_id_fkey" FOREIGN KEY ("reservation_order_id") REFERENCES "reservation_orders" ("id");
ALTER TABLE "slot_inventory_snapshots" ADD CONSTRAINT "slot_inventory_snapshots_time_slot_template_id_fkey" FOREIGN KEY ("time_slot_template_id") REFERENCES "time_slot_templates" ("id");
ALTER TABLE "store_inventory" ADD CONSTRAINT "store_inventory_sku_id_fkey" FOREIGN KEY ("sku_id") REFERENCES "skus" ("id");
ALTER TABLE "store_inventory" ADD CONSTRAINT "store_inventory_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores" ("id");
ALTER TABLE "store_operation_logs" ADD CONSTRAINT "store_operation_logs_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores" ("id");
ALTER TABLE "store_reservation_settings" ADD CONSTRAINT "store_reservation_settings_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores" ("id");
ALTER TABLE "time_slot_overrides" ADD CONSTRAINT "time_slot_overrides_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "scenario_packages" ("id");
ALTER TABLE "time_slot_templates" ADD CONSTRAINT "time_slot_templates_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "scenario_packages" ("id");