--
-- PostgreSQL database dump
--

\restrict zpUb8bVofzMqze9GSuNwggs4wdcYhwD0p2pRJNs9tVMbXnHR4vMpseX0HIjvg4t

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: calculate_inventory_status(numeric, numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_inventory_status(available_qty numeric, safety_stock numeric) RETURNS character varying
    LANGUAGE plpgsql IMMUTABLE
    AS $$
BEGIN
    IF available_qty = 0 THEN
        RETURN 'OUT_OF_STOCK';
    ELSIF available_qty < safety_stock * 0.5 THEN
        RETURN 'LOW';
    ELSIF available_qty < safety_stock THEN
        RETURN 'BELOW_THRESHOLD';
    ELSIF available_qty < safety_stock * 2 THEN
        RETURN 'NORMAL';
    ELSE
        RETURN 'SUFFICIENT';
    END IF;
END;
$$;


--
-- Name: check_bom_finished_product_type(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_bom_finished_product_type() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_sku_type VARCHAR(20);
    v_sku_name VARCHAR(255);
BEGIN
    -- 查询成品 SKU 的类型
    SELECT sku_type, name INTO v_sku_type, v_sku_name
    FROM skus
    WHERE id = NEW.finished_product_id;

    -- 验证 SKU 类型必须是 'finished_product'
    IF v_sku_type IS NULL THEN
        RAISE EXCEPTION 'SKU 不存在: finished_product_id = %', NEW.finished_product_id
            USING ERRCODE = 'foreign_key_violation',
                  HINT = '请确认 finished_product_id 引用的 SKU 存在于 skus 表中';
    END IF;

    IF v_sku_type != 'finished_product' THEN
        RAISE EXCEPTION 'BOM 配方只能为成品类型 SKU 创建，当前 SKU 类型为: % (SKU: %)',
            CASE v_sku_type
                WHEN 'raw_material' THEN '原料'
                WHEN 'packaging' THEN '包材'
                WHEN 'combo' THEN '套餐'
                ELSE v_sku_type
            END,
            v_sku_name
            USING ERRCODE = 'check_violation',
                  HINT = '请使用成品类型(finished_product)的 SKU 创建 BOM 配方',
                  DETAIL = format('finished_product_id: %s, sku_type: %s, sku_name: %s',
                                 NEW.finished_product_id, v_sku_type, v_sku_name);
    END IF;

    RETURN NEW;
END;
$$;


--
-- Name: FUNCTION check_bom_finished_product_type(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.check_bom_finished_product_type() IS '验证 BOM 配方的成品 SKU 类型必须是 finished_product。对应后端异常: BOM_VAL_001';


--
-- Name: generate_adjustment_number(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_adjustment_number() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
  new_number varchar;
  today_str varchar;
  seq_val integer;
BEGIN
  today_str := to_char(CURRENT_DATE, 'YYYYMMDD');
  seq_val := nextval('adjustment_number_seq');
  new_number := 'ADJ' || today_str || lpad(seq_val::text, 4, '0');
  RETURN new_number;
END;
$$;


--
-- Name: update_channel_product_config_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_channel_product_config_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


--
-- Name: update_menu_category_timestamp(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_menu_category_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


--
-- Name: update_reservation_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_reservation_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


--
-- Name: update_store_inventory_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_store_inventory_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(500),
    status character varying(20) DEFAULT 'ENABLED'::character varying NOT NULL,
    sort integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    created_by character varying(255),
    updated_by character varying(255),
    CONSTRAINT activity_types_status_check CHECK (((status)::text = ANY ((ARRAY['ENABLED'::character varying, 'DISABLED'::character varying, 'DELETED'::character varying])::text[])))
);


--
-- Name: TABLE activity_types; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.activity_types IS '活动类型表，存储预约活动类型配置（如企业团建、订婚、生日Party等）';


--
-- Name: COLUMN activity_types.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.activity_types.name IS '活动类型名称，必填，唯一（在非已删除状态下）';


--
-- Name: COLUMN activity_types.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.activity_types.description IS '活动类型描述，可选';


--
-- Name: COLUMN activity_types.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.activity_types.status IS '状态：ENABLED=启用, DISABLED=停用, DELETED=已删除（软删除）';


--
-- Name: COLUMN activity_types.sort; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.activity_types.sort IS '排序号，用于控制显示顺序';


--
-- Name: COLUMN activity_types.deleted_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.activity_types.deleted_at IS '删除时间（软删除时记录）';


--
-- Name: COLUMN activity_types.created_by; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.activity_types.created_by IS '创建人（如果支持用户追踪）';


--
-- Name: COLUMN activity_types.updated_by; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.activity_types.updated_by IS '更新人（如果支持用户追踪）';


--
-- Name: addon_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.addon_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    price numeric(10,2) NOT NULL,
    category character varying(50) NOT NULL,
    image_url text,
    inventory integer,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT addon_items_category_check CHECK (((category)::text = ANY ((ARRAY['CATERING'::character varying, 'BEVERAGE'::character varying, 'DECORATION'::character varying, 'SERVICE'::character varying, 'OTHER'::character varying])::text[]))),
    CONSTRAINT addon_items_price_check CHECK ((price > (0)::numeric))
);


--
-- Name: adjustment_number_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.adjustment_number_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: adjustment_reasons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.adjustment_reasons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    category character varying(20) NOT NULL,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT adjustment_reasons_category_check CHECK (((category)::text = ANY ((ARRAY['surplus'::character varying, 'shortage'::character varying, 'damage'::character varying])::text[])))
);


--
-- Name: TABLE adjustment_reasons; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.adjustment_reasons IS '库存调整原因字典表';


--
-- Name: COLUMN adjustment_reasons.code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.adjustment_reasons.code IS '原因代码';


--
-- Name: COLUMN adjustment_reasons.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.adjustment_reasons.name IS '原因名称';


--
-- Name: COLUMN adjustment_reasons.category; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.adjustment_reasons.category IS '分类：surplus(盘盈)/shortage(盘亏)/damage(报损)';


--
-- Name: COLUMN adjustment_reasons.is_active; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.adjustment_reasons.is_active IS '是否启用';


--
-- Name: COLUMN adjustment_reasons.sort_order; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.adjustment_reasons.sort_order IS '排序序号';


--
-- Name: approval_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.approval_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    adjustment_id uuid NOT NULL,
    approver_id uuid NOT NULL,
    approver_name character varying(100) NOT NULL,
    action character varying(20) NOT NULL,
    status_before character varying(20) NOT NULL,
    status_after character varying(20) NOT NULL,
    comments text,
    action_time timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT approval_records_action_check CHECK (((action)::text = ANY ((ARRAY['approve'::character varying, 'reject'::character varying, 'withdraw'::character varying])::text[])))
);


--
-- Name: TABLE approval_records; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.approval_records IS '库存调整审批记录表';


--
-- Name: COLUMN approval_records.action; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.approval_records.action IS '操作类型：approve/reject/withdraw';


--
-- Name: COLUMN approval_records.status_before; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.approval_records.status_before IS '操作前状态';


--
-- Name: COLUMN approval_records.status_after; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.approval_records.status_after IS '操作后状态';


--
-- Name: beverage_order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.beverage_order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    beverage_id uuid NOT NULL,
    beverage_name character varying(100) NOT NULL,
    beverage_image_url text,
    selected_specs jsonb NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    customer_note text,
    CONSTRAINT check_quantity CHECK ((quantity > 0)),
    CONSTRAINT check_subtotal CHECK ((subtotal >= (0)::numeric)),
    CONSTRAINT check_subtotal_calculation CHECK ((subtotal = (unit_price * (quantity)::numeric))),
    CONSTRAINT check_unit_price CHECK ((unit_price >= (0)::numeric))
);


--
-- Name: TABLE beverage_order_items; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.beverage_order_items IS '订单商品项表 - 订单中的具体饮品项及快照';


--
-- Name: COLUMN beverage_order_items.order_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_order_items.order_id IS '关联的订单 ID';


--
-- Name: COLUMN beverage_order_items.beverage_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_order_items.beverage_id IS '关联的饮品 ID';


--
-- Name: COLUMN beverage_order_items.beverage_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_order_items.beverage_name IS '饮品名称快照（下单时的名称）';


--
-- Name: COLUMN beverage_order_items.beverage_image_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_order_items.beverage_image_url IS '饮品图片 URL 快照';


--
-- Name: COLUMN beverage_order_items.selected_specs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_order_items.selected_specs IS '选中的规格快照 JSON，包含 size/temperature/sweetness/topping';


--
-- Name: COLUMN beverage_order_items.quantity; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_order_items.quantity IS '购买数量';


--
-- Name: COLUMN beverage_order_items.unit_price; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_order_items.unit_price IS '单价快照（含规格调整后的价格）';


--
-- Name: COLUMN beverage_order_items.subtotal; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_order_items.subtotal IS '小计 = unit_price × quantity';


--
-- Name: COLUMN beverage_order_items.customer_note; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_order_items.customer_note IS '顾客对单个饮品的备注（如"少冰"、"多糖"等）';


--
-- Name: beverage_order_status_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.beverage_order_status_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    from_status character varying(20),
    to_status character varying(20) NOT NULL,
    changed_by uuid,
    change_reason text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT check_from_status CHECK (((from_status)::text = ANY ((ARRAY['PENDING_PAYMENT'::character varying, 'PENDING_PRODUCTION'::character varying, 'PRODUCING'::character varying, 'COMPLETED'::character varying, 'DELIVERED'::character varying, 'CANCELLED'::character varying])::text[]))),
    CONSTRAINT check_to_status CHECK (((to_status)::text = ANY ((ARRAY['PENDING_PAYMENT'::character varying, 'PENDING_PRODUCTION'::character varying, 'PRODUCING'::character varying, 'COMPLETED'::character varying, 'DELIVERED'::character varying, 'CANCELLED'::character varying])::text[])))
);


--
-- Name: TABLE beverage_order_status_logs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.beverage_order_status_logs IS '订单状态变更日志表 - 用于审计和问题排查';


--
-- Name: COLUMN beverage_order_status_logs.order_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_order_status_logs.order_id IS '关联的订单 ID';


--
-- Name: COLUMN beverage_order_status_logs.from_status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_order_status_logs.from_status IS '变更前状态';


--
-- Name: COLUMN beverage_order_status_logs.to_status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_order_status_logs.to_status IS '变更后状态';


--
-- Name: COLUMN beverage_order_status_logs.changed_by; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_order_status_logs.changed_by IS '操作人 UUID，NULL 表示系统自动变更';


--
-- Name: COLUMN beverage_order_status_logs.change_reason; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_order_status_logs.change_reason IS '变更原因说明';


--
-- Name: beverage_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.beverage_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_number character varying(50) NOT NULL,
    user_id uuid NOT NULL,
    store_id uuid NOT NULL,
    total_price numeric(10,2) NOT NULL,
    status character varying(20) DEFAULT 'PENDING_PAYMENT'::character varying NOT NULL,
    payment_method character varying(50),
    transaction_id character varying(100),
    paid_at timestamp without time zone,
    production_start_time timestamp without time zone,
    completed_at timestamp without time zone,
    delivered_at timestamp without time zone,
    cancelled_at timestamp without time zone,
    customer_note text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    order_type character varying(20) DEFAULT 'BEVERAGE'::character varying NOT NULL,
    CONSTRAINT check_beverage_order_type CHECK (((order_type)::text = 'BEVERAGE'::text)),
    CONSTRAINT check_status CHECK (((status)::text = ANY ((ARRAY['PENDING_PAYMENT'::character varying, 'PENDING_PRODUCTION'::character varying, 'PRODUCING'::character varying, 'COMPLETED'::character varying, 'DELIVERED'::character varying, 'CANCELLED'::character varying])::text[]))),
    CONSTRAINT check_total_price CHECK ((total_price >= (0)::numeric))
);


--
-- Name: TABLE beverage_orders; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.beverage_orders IS '饮品订单主表 - 顾客的饮品订单';


--
-- Name: COLUMN beverage_orders.order_number; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_orders.order_number IS '订单号（业务主键）: BORDT + yyyyMMddHHmmss + 4位随机数';


--
-- Name: COLUMN beverage_orders.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_orders.user_id IS '下单用户 ID';


--
-- Name: COLUMN beverage_orders.store_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_orders.store_id IS '门店 ID';


--
-- Name: COLUMN beverage_orders.total_price; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_orders.total_price IS '订单总价';


--
-- Name: COLUMN beverage_orders.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_orders.status IS '订单状态: PENDING_PAYMENT(待支付), PENDING_PRODUCTION(待制作), PRODUCING(制作中), COMPLETED(已完成), DELIVERED(已交付), CANCELLED(已取消)';


--
-- Name: COLUMN beverage_orders.payment_method; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_orders.payment_method IS '支付方式（MVP 阶段为 MOCK_WECHAT_PAY）';


--
-- Name: COLUMN beverage_orders.transaction_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_orders.transaction_id IS '支付流水号';


--
-- Name: COLUMN beverage_orders.paid_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_orders.paid_at IS '支付时间';


--
-- Name: COLUMN beverage_orders.production_start_time; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_orders.production_start_time IS '开始制作时间';


--
-- Name: COLUMN beverage_orders.completed_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_orders.completed_at IS '完成时间';


--
-- Name: COLUMN beverage_orders.delivered_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_orders.delivered_at IS '交付时间';


--
-- Name: COLUMN beverage_orders.cancelled_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_orders.cancelled_at IS '取消时间';


--
-- Name: COLUMN beverage_orders.customer_note; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_orders.customer_note IS '顾客备注';


--
-- Name: COLUMN beverage_orders.order_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_orders.order_type IS '订单类型: BEVERAGE(饮品订单)';


--
-- Name: beverage_recipes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.beverage_recipes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    beverage_id uuid NOT NULL,
    applicable_specs text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    name character varying(100) NOT NULL,
    description text
);


--
-- Name: TABLE beverage_recipes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.beverage_recipes IS '饮品配方表 - BOM 制作配方';


--
-- Name: COLUMN beverage_recipes.beverage_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_recipes.beverage_id IS '关联的饮品 ID';


--
-- Name: COLUMN beverage_recipes.applicable_specs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_recipes.applicable_specs IS '适用规格组合 JSON 字符串，NULL 表示适用所有规格';


--
-- Name: COLUMN beverage_recipes.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_recipes.name IS '配方名称';


--
-- Name: COLUMN beverage_recipes.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_recipes.description IS '配方描述';


--
-- Name: beverage_sku_mapping; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.beverage_sku_mapping (
    old_beverage_id uuid NOT NULL,
    new_sku_id uuid NOT NULL,
    migrated_at timestamp with time zone DEFAULT now() NOT NULL,
    migration_script_version character varying(50) NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    CONSTRAINT chk_beverage_sku_mapping_status CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'deprecated'::character varying])::text[])))
);


--
-- Name: TABLE beverage_sku_mapping; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.beverage_sku_mapping IS 'Migration mapping table: old beverage_config.id → new skus.id for backward compatibility';


--
-- Name: COLUMN beverage_sku_mapping.old_beverage_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_sku_mapping.old_beverage_id IS 'Original beverage ID from beverage_config table (primary key)';


--
-- Name: COLUMN beverage_sku_mapping.new_sku_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_sku_mapping.new_sku_id IS 'Migrated SKU ID (must reference finished_product type SKU)';


--
-- Name: COLUMN beverage_sku_mapping.migration_script_version; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_sku_mapping.migration_script_version IS 'Flyway migration version that created this mapping (e.g., V2025_12_31_001)';


--
-- Name: COLUMN beverage_sku_mapping.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_sku_mapping.status IS 'Mapping status: active (valid) or deprecated (no longer in use)';


--
-- Name: beverage_specs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.beverage_specs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    beverage_id uuid NOT NULL,
    spec_type character varying(50) NOT NULL,
    spec_name character varying(50) NOT NULL,
    spec_code character varying(50),
    price_adjustment numeric(10,2) DEFAULT 0,
    sort_order integer DEFAULT 0,
    is_default boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT check_spec_type CHECK (((spec_type)::text = ANY ((ARRAY['SIZE'::character varying, 'TEMPERATURE'::character varying, 'SWEETNESS'::character varying, 'TOPPING'::character varying])::text[])))
);


--
-- Name: TABLE beverage_specs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.beverage_specs IS '饮品规格表 - 饮品的可选规格及价格调整';


--
-- Name: COLUMN beverage_specs.spec_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_specs.spec_type IS '规格类型: SIZE(容量), TEMPERATURE(温度), SWEETNESS(甜度), TOPPING(配料)';


--
-- Name: COLUMN beverage_specs.spec_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_specs.spec_name IS '规格名称，如：小杯, 中杯, 大杯';


--
-- Name: COLUMN beverage_specs.spec_code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_specs.spec_code IS '规格代码，用于配方匹配';


--
-- Name: COLUMN beverage_specs.price_adjustment; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_specs.price_adjustment IS '价格调整（可正可负），0表示无调整';


--
-- Name: COLUMN beverage_specs.is_default; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverage_specs.is_default IS '是否默认选中该规格';


--
-- Name: beverages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.beverages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    category character varying(50) NOT NULL,
    image_url text,
    detail_images jsonb DEFAULT '[]'::jsonb,
    base_price numeric(10,2) NOT NULL,
    nutrition_info jsonb,
    status character varying(20) DEFAULT 'ACTIVE'::character varying NOT NULL,
    is_recommended boolean DEFAULT false,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    CONSTRAINT check_base_price CHECK ((base_price >= (0)::numeric)),
    CONSTRAINT check_category CHECK (((category)::text = ANY ((ARRAY['COFFEE'::character varying, 'TEA'::character varying, 'JUICE'::character varying, 'SMOOTHIE'::character varying, 'MILK_TEA'::character varying, 'OTHER'::character varying])::text[]))),
    CONSTRAINT check_status CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'INACTIVE'::character varying, 'OUT_OF_STOCK'::character varying])::text[])))
);


--
-- Name: TABLE beverages; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.beverages IS '⚠️  DEPRECATED (2025-12-31): Migrated to skus table (sku_type=finished_product).
    See beverage_sku_mapping for old_beverage_id → new_sku_id mapping.
    DO NOT DELETE - Kept for rollback and historical reference.';


--
-- Name: COLUMN beverages.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverages.id IS '主键 UUID';


--
-- Name: COLUMN beverages.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverages.name IS '饮品名称';


--
-- Name: COLUMN beverages.category; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverages.category IS '分类: COFFEE(咖啡), TEA(茶饮), JUICE(果汁), SMOOTHIE(奶昔), MILK_TEA(奶茶), OTHER(其他)';


--
-- Name: COLUMN beverages.base_price; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverages.base_price IS '基础价格（小杯/标准规格）';


--
-- Name: COLUMN beverages.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverages.status IS '状态: ACTIVE(上架), INACTIVE(下架), OUT_OF_STOCK(缺货)';


--
-- Name: COLUMN beverages.is_recommended; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverages.is_recommended IS '是否推荐商品';


--
-- Name: COLUMN beverages.sort_order; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.beverages.sort_order IS '排序权重（数值越大越靠前）';


--
-- Name: bom_components; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bom_components (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    finished_product_id uuid NOT NULL,
    component_id uuid NOT NULL,
    quantity numeric(10,3) NOT NULL,
    unit character varying(20) NOT NULL,
    unit_cost numeric(10,2),
    is_optional boolean DEFAULT false,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT bom_components_quantity_check CHECK ((quantity > (0)::numeric))
);


--
-- Name: TABLE bom_components; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.bom_components IS 'BOM组件表:成品SKU的物料清单配置';


--
-- Name: COLUMN bom_components.finished_product_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.bom_components.finished_product_id IS '成品SKU ID';


--
-- Name: COLUMN bom_components.component_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.bom_components.component_id IS '组件SKU ID(必须是原料或包材类型)';


--
-- Name: COLUMN bom_components.quantity; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.bom_components.quantity IS '组件数量';


--
-- Name: COLUMN bom_components.unit; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.bom_components.unit IS '组件单位';


--
-- Name: COLUMN bom_components.unit_cost; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.bom_components.unit_cost IS '单位成本快照(保存时记录)';


--
-- Name: COLUMN bom_components.is_optional; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.bom_components.is_optional IS '是否可选组件';


--
-- Name: COLUMN bom_components.sort_order; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.bom_components.sort_order IS '排序序号';


--
-- Name: bom_snapshots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bom_snapshots (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    finished_sku_id uuid NOT NULL,
    raw_material_sku_id uuid NOT NULL,
    quantity numeric(19,4) NOT NULL,
    unit character varying(20) NOT NULL,
    wastage_rate numeric(5,4) DEFAULT 0,
    bom_level integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: TABLE bom_snapshots; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.bom_snapshots IS 'BOM formula snapshots for order version locking (BOM配方快照)';


--
-- Name: COLUMN bom_snapshots.finished_sku_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.bom_snapshots.finished_sku_id IS 'Finished product SKU (成品SKU)';


--
-- Name: brands; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brands (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    brand_code character varying(50) NOT NULL,
    name character varying(200) NOT NULL,
    english_name character varying(200),
    brand_type character varying(20) DEFAULT 'own'::character varying NOT NULL,
    primary_categories text[] DEFAULT '{}'::text[],
    company character varying(200),
    brand_level character varying(20),
    tags text[] DEFAULT '{}'::text[],
    description text,
    logo_url text,
    status character varying(20) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by character varying(100),
    updated_by character varying(100),
    CONSTRAINT brands_brand_type_check CHECK (((brand_type)::text = ANY ((ARRAY['own'::character varying, 'agency'::character varying, 'joint'::character varying, 'other'::character varying])::text[]))),
    CONSTRAINT brands_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'enabled'::character varying, 'disabled'::character varying])::text[])))
);


--
-- Name: TABLE brands; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.brands IS '品牌管理表';


--
-- Name: COLUMN brands.brand_code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.brands.brand_code IS '品牌编码，唯一标识';


--
-- Name: COLUMN brands.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.brands.name IS '品牌名称（中文）';


--
-- Name: COLUMN brands.english_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.brands.english_name IS '品牌英文名';


--
-- Name: COLUMN brands.brand_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.brands.brand_type IS '品牌类型: own(自有), agency(代理), joint(联营), other(其他)';


--
-- Name: COLUMN brands.primary_categories; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.brands.primary_categories IS '主营类目数组';


--
-- Name: COLUMN brands.company; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.brands.company IS '所属公司/供应商';


--
-- Name: COLUMN brands.brand_level; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.brands.brand_level IS '品牌等级(A/B/C)';


--
-- Name: COLUMN brands.tags; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.brands.tags IS '品牌标签数组';


--
-- Name: COLUMN brands.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.brands.description IS '品牌介绍';


--
-- Name: COLUMN brands.logo_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.brands.logo_url IS '品牌LOGO URL';


--
-- Name: COLUMN brands.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.brands.status IS '状态: draft(草稿), enabled(启用), disabled(停用)';


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    parent_id uuid,
    level integer DEFAULT 1 NOT NULL,
    sort_order integer DEFAULT 0,
    status character varying(20) DEFAULT 'ACTIVE'::character varying,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: category_audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.category_audit_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category_id uuid NOT NULL,
    action character varying(20) NOT NULL,
    before_data jsonb,
    after_data jsonb,
    change_description text,
    affected_product_count integer DEFAULT 0,
    operator_id uuid,
    operator_name character varying(100),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    ip_address character varying(45)
);


--
-- Name: TABLE category_audit_log; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.category_audit_log IS '分类操作审计日志表';


--
-- Name: COLUMN category_audit_log.action; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.category_audit_log.action IS '操作类型: CREATE, UPDATE, DELETE, REORDER';


--
-- Name: COLUMN category_audit_log.before_data; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.category_audit_log.before_data IS '操作前的分类数据快照';


--
-- Name: COLUMN category_audit_log.after_data; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.category_audit_log.after_data IS '操作后的分类数据快照';


--
-- Name: channel_product_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.channel_product_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sku_id uuid NOT NULL,
    channel_type character varying(50) DEFAULT 'MINI_PROGRAM'::character varying NOT NULL,
    display_name character varying(100),
    channel_category character varying(50) NOT NULL,
    channel_price bigint,
    main_image text,
    detail_images jsonb DEFAULT '[]'::jsonb,
    description text,
    specs jsonb DEFAULT '[]'::jsonb,
    is_recommended boolean DEFAULT false,
    status character varying(20) DEFAULT 'ACTIVE'::character varying NOT NULL,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    category_id uuid,
    CONSTRAINT chk_channel_category CHECK (((channel_category)::text = ANY ((ARRAY['ALCOHOL'::character varying, 'COFFEE'::character varying, 'BEVERAGE'::character varying, 'SNACK'::character varying, 'MEAL'::character varying, 'OTHER'::character varying])::text[]))),
    CONSTRAINT chk_channel_price CHECK (((channel_price IS NULL) OR (channel_price > 0))),
    CONSTRAINT chk_channel_type CHECK (((channel_type)::text = ANY ((ARRAY['MINI_PROGRAM'::character varying, 'POS'::character varying, 'DELIVERY'::character varying, 'ECOMMERCE'::character varying])::text[]))),
    CONSTRAINT chk_sort_order CHECK ((sort_order >= 0)),
    CONSTRAINT chk_status CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'INACTIVE'::character varying, 'OUT_OF_STOCK'::character varying])::text[])))
);


--
-- Name: TABLE channel_product_config; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.channel_product_config IS '渠道商品配置表，记录 SKU 成品在特定销售渠道的展示配置';


--
-- Name: COLUMN channel_product_config.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.channel_product_config.id IS '配置唯一标识符';


--
-- Name: COLUMN channel_product_config.sku_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.channel_product_config.sku_id IS '关联的 SKU 成品 ID';


--
-- Name: COLUMN channel_product_config.channel_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.channel_product_config.channel_type IS '渠道类型：MINI_PROGRAM/POS/DELIVERY/ECOMMERCE';


--
-- Name: COLUMN channel_product_config.display_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.channel_product_config.display_name IS '渠道展示名称（空则使用 SKU 名称）';


--
-- Name: COLUMN channel_product_config.channel_category; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.channel_product_config.channel_category IS '渠道分类：ALCOHOL/COFFEE/BEVERAGE/SNACK/MEAL/OTHER';


--
-- Name: COLUMN channel_product_config.channel_price; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.channel_product_config.channel_price IS '渠道价格（分），空则使用 SKU 价格';


--
-- Name: COLUMN channel_product_config.main_image; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.channel_product_config.main_image IS '主图 URL（空则使用 SKU 主图）';


--
-- Name: COLUMN channel_product_config.detail_images; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.channel_product_config.detail_images IS '详情图 URL 数组（JSONB）';


--
-- Name: COLUMN channel_product_config.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.channel_product_config.description IS '渠道商品描述';


--
-- Name: COLUMN channel_product_config.specs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.channel_product_config.specs IS '规格配置 JSONB，结构见 data-model.md';


--
-- Name: COLUMN channel_product_config.is_recommended; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.channel_product_config.is_recommended IS '是否推荐';


--
-- Name: COLUMN channel_product_config.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.channel_product_config.status IS '状态：ACTIVE/INACTIVE/OUT_OF_STOCK';


--
-- Name: COLUMN channel_product_config.sort_order; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.channel_product_config.sort_order IS '排序序号';


--
-- Name: COLUMN channel_product_config.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.channel_product_config.created_at IS '创建时间';


--
-- Name: COLUMN channel_product_config.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.channel_product_config.updated_at IS '更新时间';


--
-- Name: COLUMN channel_product_config.deleted_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.channel_product_config.deleted_at IS '软删除时间';


--
-- Name: COLUMN channel_product_config.category_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.channel_product_config.category_id IS '关联的菜单分类ID，替代原 channel_category 枚举';


--
-- Name: combo_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.combo_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    combo_id uuid NOT NULL,
    sub_item_id uuid NOT NULL,
    quantity numeric(10,3) NOT NULL,
    unit character varying(20) NOT NULL,
    unit_cost numeric(10,2),
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT combo_items_quantity_check CHECK ((quantity > (0)::numeric))
);


--
-- Name: TABLE combo_items; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.combo_items IS '套餐子项表:套餐SKU的子项配置';


--
-- Name: COLUMN combo_items.combo_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.combo_items.combo_id IS '套餐SKU ID';


--
-- Name: COLUMN combo_items.sub_item_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.combo_items.sub_item_id IS '子项SKU ID(不能是套餐类型,避免嵌套)';


--
-- Name: COLUMN combo_items.quantity; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.combo_items.quantity IS '子项数量';


--
-- Name: COLUMN combo_items.unit; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.combo_items.unit IS '子项单位';


--
-- Name: COLUMN combo_items.unit_cost; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.combo_items.unit_cost IS '单位成本快照(保存时记录)';


--
-- Name: COLUMN combo_items.sort_order; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.combo_items.sort_order IS '排序序号';


--
-- Name: flyway_schema_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.flyway_schema_history (
    installed_rank integer NOT NULL,
    version character varying(50),
    description character varying(200) NOT NULL,
    type character varying(20) NOT NULL,
    script character varying(1000) NOT NULL,
    checksum integer,
    installed_by character varying(100) NOT NULL,
    installed_on timestamp without time zone DEFAULT now() NOT NULL,
    execution_time integer NOT NULL,
    success boolean NOT NULL
);


--
-- Name: halls; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.halls (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    store_id uuid NOT NULL,
    code character varying(50),
    name character varying(200) NOT NULL,
    type character varying(20) NOT NULL,
    capacity integer NOT NULL,
    tags text[],
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT halls_capacity_check CHECK (((capacity > 0) AND (capacity <= 1000))),
    CONSTRAINT halls_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'maintenance'::character varying])::text[]))),
    CONSTRAINT halls_type_check CHECK (((type)::text = ANY ((ARRAY['VIP'::character varying, 'PUBLIC'::character varying, 'CP'::character varying, 'PARTY'::character varying])::text[])))
);


--
-- Name: TABLE halls; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.halls IS '影厅信息表';


--
-- Name: COLUMN halls.store_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.halls.store_id IS '所属门店ID';


--
-- Name: COLUMN halls.code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.halls.code IS '影厅编码，在门店内唯一';


--
-- Name: COLUMN halls.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.halls.name IS '影厅名称';


--
-- Name: COLUMN halls.type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.halls.type IS '影厅类型：VIP=VIP厅, PUBLIC=普通厅, CP=情侣厅, PARTY=派对厅';


--
-- Name: COLUMN halls.capacity; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.halls.capacity IS '可容纳人数（1-1000）';


--
-- Name: COLUMN halls.tags; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.halls.tags IS '影厅特性标签数组';


--
-- Name: COLUMN halls.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.halls.status IS '影厅状态：active=可用, inactive=停用, maintenance=维护中';


--
-- Name: inventory_adjustments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_adjustments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    adjustment_number character varying(30) NOT NULL,
    sku_id uuid NOT NULL,
    store_id uuid NOT NULL,
    adjustment_type character varying(20) NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(12,2) DEFAULT 0 NOT NULL,
    adjustment_amount numeric(12,2) GENERATED ALWAYS AS (((quantity)::numeric * unit_price)) STORED,
    reason_code character varying(50) NOT NULL,
    reason_text character varying(500),
    remarks character varying(500),
    status character varying(20) DEFAULT 'draft'::character varying NOT NULL,
    stock_before integer DEFAULT 0 NOT NULL,
    stock_after integer DEFAULT 0 NOT NULL,
    available_before integer DEFAULT 0 NOT NULL,
    available_after integer DEFAULT 0 NOT NULL,
    requires_approval boolean DEFAULT false,
    operator_id uuid NOT NULL,
    operator_name character varying(100) NOT NULL,
    approved_at timestamp with time zone,
    approved_by uuid,
    transaction_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    version integer DEFAULT 1,
    CONSTRAINT inventory_adjustments_adjustment_type_check CHECK (((adjustment_type)::text = ANY ((ARRAY['surplus'::character varying, 'shortage'::character varying, 'damage'::character varying])::text[]))),
    CONSTRAINT inventory_adjustments_quantity_check CHECK ((quantity > 0)),
    CONSTRAINT inventory_adjustments_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'pending_approval'::character varying, 'approved'::character varying, 'rejected'::character varying, 'withdrawn'::character varying])::text[])))
);


--
-- Name: TABLE inventory_adjustments; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.inventory_adjustments IS '库存调整单表';


--
-- Name: COLUMN inventory_adjustments.adjustment_number; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inventory_adjustments.adjustment_number IS '调整单号，如 ADJ20251226001';


--
-- Name: COLUMN inventory_adjustments.adjustment_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inventory_adjustments.adjustment_type IS '调整类型：surplus(盘盈)/shortage(盘亏)/damage(报损)';


--
-- Name: COLUMN inventory_adjustments.quantity; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inventory_adjustments.quantity IS '调整数量（始终为正数）';


--
-- Name: COLUMN inventory_adjustments.unit_price; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inventory_adjustments.unit_price IS 'SKU单价';


--
-- Name: COLUMN inventory_adjustments.adjustment_amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inventory_adjustments.adjustment_amount IS '调整金额 = quantity × unit_price（自动计算）';


--
-- Name: COLUMN inventory_adjustments.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inventory_adjustments.status IS '状态：draft/pending_approval/approved/rejected/withdrawn';


--
-- Name: COLUMN inventory_adjustments.requires_approval; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inventory_adjustments.requires_approval IS '是否需要审批（金额>=阈值）';


--
-- Name: COLUMN inventory_adjustments.version; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inventory_adjustments.version IS '乐观锁版本号';


--
-- Name: inventory_reservations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_reservations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    store_id uuid NOT NULL,
    sku_id uuid NOT NULL,
    quantity numeric(19,4) NOT NULL,
    status character varying(20) DEFAULT 'ACTIVE'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    released_at timestamp without time zone,
    reserved_quantity numeric(15,4) NOT NULL,
    expires_at timestamp with time zone,
    fulfilled_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    notes text,
    CONSTRAINT inventory_reservations_reserved_quantity_check CHECK ((reserved_quantity > (0)::numeric))
);


--
-- Name: TABLE inventory_reservations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.inventory_reservations IS 'Inventory reservation records for pending orders (库存预占记录)';


--
-- Name: COLUMN inventory_reservations.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inventory_reservations.status IS 'Reservation state: ACTIVE | FULFILLED | CANCELLED | EXPIRED';


--
-- Name: COLUMN inventory_reservations.reserved_quantity; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inventory_reservations.reserved_quantity IS 'Quantity locked for this reservation';


--
-- Name: COLUMN inventory_reservations.expires_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inventory_reservations.expires_at IS 'Auto-release timestamp (NULL = no expiry)';


--
-- Name: inventory_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    store_id uuid NOT NULL,
    sku_id uuid NOT NULL,
    transaction_type character varying(50) NOT NULL,
    quantity integer NOT NULL,
    stock_before integer DEFAULT 0 NOT NULL,
    stock_after integer DEFAULT 0 NOT NULL,
    available_before integer DEFAULT 0 NOT NULL,
    available_after integer DEFAULT 0 NOT NULL,
    source_type character varying(50),
    source_document character varying(100),
    operator_id uuid,
    operator_name character varying(100),
    remarks text,
    transaction_time timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    bom_snapshot_id uuid,
    reference_id uuid,
    related_order_id uuid,
    CONSTRAINT inventory_transactions_transaction_type_check CHECK (((transaction_type)::text = ANY ((ARRAY['purchase_in'::character varying, 'sale_out'::character varying, 'adjustment_in'::character varying, 'adjustment_out'::character varying, 'damage_out'::character varying, 'transfer_in'::character varying, 'transfer_out'::character varying, 'return_in'::character varying, 'return_out'::character varying, 'safety_stock_update'::character varying])::text[])))
);


--
-- Name: TABLE inventory_transactions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.inventory_transactions IS '库存流水表，记录所有库存变动';


--
-- Name: COLUMN inventory_transactions.transaction_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inventory_transactions.transaction_type IS '流水类型：purchase_in(采购入库)、sale_out(销售出库)、adjustment_in(盘盈)、adjustment_out(盘亏)、damage_out(报损)等';


--
-- Name: COLUMN inventory_transactions.bom_snapshot_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inventory_transactions.bom_snapshot_id IS 'BOM snapshot ID for audit trail (shows which formula version was used)';


--
-- Name: COLUMN inventory_transactions.related_order_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inventory_transactions.related_order_id IS 'Order ID for BOM-related transactions';


--
-- Name: CONSTRAINT inventory_transactions_transaction_type_check ON inventory_transactions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON CONSTRAINT inventory_transactions_transaction_type_check ON public.inventory_transactions IS '库存流水类型约束：purchase_in=采购入库, sale_out=销售出库, adjustment_in/out=调整, damage_out=损耗, transfer_in/out=调拨, return_in/out=退货, safety_stock_update=安全库存更新';


--
-- Name: menu_category; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.menu_category (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(50) NOT NULL,
    display_name character varying(50) NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_visible boolean DEFAULT true NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    icon_url text,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    version bigint DEFAULT 0 NOT NULL,
    CONSTRAINT chk_code_format CHECK (((code)::text ~ '^[A-Z][A-Z0-9_]*$'::text)),
    CONSTRAINT chk_display_name_length CHECK (((char_length((display_name)::text) >= 1) AND (char_length((display_name)::text) <= 50)))
);


--
-- Name: TABLE menu_category; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.menu_category IS '菜单分类表 - 小程序商品分类配置';


--
-- Name: COLUMN menu_category.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menu_category.id IS '分类唯一标识';


--
-- Name: COLUMN menu_category.code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menu_category.code IS '分类编码，用于向后兼容旧 API';


--
-- Name: COLUMN menu_category.display_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menu_category.display_name IS '显示名称（中文）';


--
-- Name: COLUMN menu_category.sort_order; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menu_category.sort_order IS '排序序号，越小越靠前';


--
-- Name: COLUMN menu_category.is_visible; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menu_category.is_visible IS '是否在小程序中可见';


--
-- Name: COLUMN menu_category.is_default; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menu_category.is_default IS '是否为默认分类（不可删除）';


--
-- Name: COLUMN menu_category.version; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menu_category.version IS '乐观锁版本号，用于并发控制（JPA @Version）';


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    order_id uuid NOT NULL,
    product_id uuid NOT NULL,
    product_name character varying(200) NOT NULL,
    product_spec character varying(100),
    product_image character varying(500),
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT order_items_check CHECK ((subtotal = ((quantity)::numeric * unit_price))),
    CONSTRAINT order_items_quantity_check CHECK ((quantity > 0))
);


--
-- Name: order_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_logs (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    order_id uuid NOT NULL,
    action character varying(50) NOT NULL,
    status_before character varying(20),
    status_after character varying(20),
    operator_id uuid NOT NULL,
    operator_name character varying(100) NOT NULL,
    comments text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: package_addons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.package_addons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    package_id uuid NOT NULL,
    addon_item_id uuid NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_required boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: package_benefits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.package_benefits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    package_id uuid NOT NULL,
    benefit_type character varying(50) NOT NULL,
    discount_rate numeric(5,2),
    free_count integer,
    description text,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT package_benefits_benefit_type_check CHECK (((benefit_type)::text = ANY ((ARRAY['DISCOUNT_TICKET'::character varying, 'FREE_SCREENING'::character varying])::text[]))),
    CONSTRAINT package_benefits_discount_rate_check CHECK (((discount_rate IS NULL) OR ((discount_rate > (0)::numeric) AND (discount_rate <= (1)::numeric)))),
    CONSTRAINT package_benefits_free_count_check CHECK (((free_count IS NULL) OR (free_count >= 0)))
);


--
-- Name: package_hall_associations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.package_hall_associations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    package_id uuid NOT NULL,
    hall_type_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: package_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.package_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    package_id uuid NOT NULL,
    item_id uuid NOT NULL,
    quantity integer NOT NULL,
    item_name_snapshot character varying(255) NOT NULL,
    item_price_snapshot numeric(10,2) NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT package_items_quantity_check CHECK ((quantity > 0))
);


--
-- Name: package_pricing; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.package_pricing (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    package_id uuid NOT NULL,
    package_price numeric(10,2) NOT NULL,
    reference_price_snapshot numeric(10,2),
    discount_percentage numeric(5,2),
    discount_amount numeric(10,2),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT package_pricing_package_price_check CHECK ((package_price > (0)::numeric))
);


--
-- Name: package_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.package_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    package_id uuid NOT NULL,
    duration_hours numeric(5,2) NOT NULL,
    min_people integer,
    max_people integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT package_rules_check CHECK (((max_people IS NULL) OR ((min_people IS NULL) OR (max_people >= min_people)))),
    CONSTRAINT package_rules_duration_hours_check CHECK ((duration_hours > (0)::numeric)),
    CONSTRAINT package_rules_min_people_check CHECK (((min_people IS NULL) OR (min_people >= 0)))
);


--
-- Name: package_services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.package_services (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    package_id uuid NOT NULL,
    service_id uuid NOT NULL,
    service_name_snapshot character varying(255) NOT NULL,
    service_price_snapshot numeric(10,2) NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: package_tiers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.package_tiers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    package_id uuid NOT NULL,
    name character varying(100) NOT NULL,
    price numeric(10,2) NOT NULL,
    original_price numeric(10,2),
    tags jsonb,
    service_description text,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT package_tiers_price_check CHECK ((price > (0)::numeric))
);


--
-- Name: product_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_orders (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    order_number character varying(20) NOT NULL,
    user_id uuid NOT NULL,
    status character varying(20) DEFAULT 'PENDING_PAYMENT'::character varying NOT NULL,
    product_total numeric(10,2) NOT NULL,
    shipping_fee numeric(10,2) DEFAULT 0 NOT NULL,
    discount_amount numeric(10,2) DEFAULT 0 NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    shipping_address jsonb,
    payment_method character varying(20),
    payment_time timestamp without time zone,
    shipped_time timestamp without time zone,
    completed_time timestamp without time zone,
    cancelled_time timestamp without time zone,
    cancel_reason text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    order_type character varying(20) DEFAULT 'PRODUCT'::character varying NOT NULL,
    CONSTRAINT check_product_order_type CHECK (((order_type)::text = 'PRODUCT'::text)),
    CONSTRAINT product_orders_check CHECK ((total_amount = ((product_total + shipping_fee) - discount_amount)))
);


--
-- Name: COLUMN product_orders.order_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.product_orders.order_type IS '订单类型: PRODUCT(商品订单)';


--
-- Name: queue_numbers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.queue_numbers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    queue_number character varying(10) NOT NULL,
    order_id uuid NOT NULL,
    store_id uuid NOT NULL,
    date date NOT NULL,
    sequence integer NOT NULL,
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    called_at timestamp without time zone,
    picked_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT check_sequence CHECK (((sequence >= 1) AND (sequence <= 999))),
    CONSTRAINT check_status CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'CALLED'::character varying, 'COMPLETED'::character varying])::text[])))
);


--
-- Name: TABLE queue_numbers; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.queue_numbers IS '取餐号表 - 叫号系统的取餐号，每日重置';


--
-- Name: COLUMN queue_numbers.queue_number; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.queue_numbers.queue_number IS '取餐号格式: D001-D999';


--
-- Name: COLUMN queue_numbers.order_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.queue_numbers.order_id IS '关联的订单 ID（一个订单只有一个取餐号）';


--
-- Name: COLUMN queue_numbers.store_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.queue_numbers.store_id IS '门店 ID';


--
-- Name: COLUMN queue_numbers.date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.queue_numbers.date IS '生成日期（每日重置序号）';


--
-- Name: COLUMN queue_numbers.sequence; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.queue_numbers.sequence IS '当日序号 (1-999)';


--
-- Name: COLUMN queue_numbers.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.queue_numbers.status IS '取餐号状态: ACTIVE(激活/等待叫号), CALLED(已叫号), COMPLETED(已完成/已取餐)';


--
-- Name: COLUMN queue_numbers.called_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.queue_numbers.called_at IS '叫号时间';


--
-- Name: COLUMN queue_numbers.picked_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.queue_numbers.picked_at IS '取餐时间';


--
-- Name: recipe_ingredients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recipe_ingredients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recipe_id uuid NOT NULL,
    sku_id uuid NOT NULL,
    quantity numeric(10,3) NOT NULL,
    unit character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    ingredient_name character varying(100) NOT NULL,
    note character varying(200),
    CONSTRAINT check_quantity CHECK ((quantity > (0)::numeric))
);


--
-- Name: TABLE recipe_ingredients; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.recipe_ingredients IS '配方原料关联表 - 定义配方所需的原料及用量';


--
-- Name: COLUMN recipe_ingredients.recipe_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.recipe_ingredients.recipe_id IS '关联的配方 ID';


--
-- Name: COLUMN recipe_ingredients.sku_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.recipe_ingredients.sku_id IS '关联的 SKU ID (原料)，外键引用 P001 skus 表';


--
-- Name: COLUMN recipe_ingredients.quantity; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.recipe_ingredients.quantity IS '原料用量（支持小数）';


--
-- Name: COLUMN recipe_ingredients.unit; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.recipe_ingredients.unit IS '用量单位: g(克), ml(毫升), piece(个)';


--
-- Name: COLUMN recipe_ingredients.ingredient_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.recipe_ingredients.ingredient_name IS '原料名称（冗余存储，便于展示）';


--
-- Name: COLUMN recipe_ingredients.note; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.recipe_ingredients.note IS '备注（如"室温"、"需加热"等）';


--
-- Name: reservation_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reservation_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reservation_order_id uuid NOT NULL,
    addon_item_id uuid NOT NULL,
    addon_name_snapshot character varying(100) NOT NULL,
    addon_price_snapshot numeric(10,2) NOT NULL,
    quantity integer NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_item_quantity CHECK ((quantity > 0)),
    CONSTRAINT chk_item_subtotal CHECK ((subtotal >= (0)::numeric))
);


--
-- Name: TABLE reservation_items; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.reservation_items IS '预约单加购项明细表';


--
-- Name: COLUMN reservation_items.addon_name_snapshot; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reservation_items.addon_name_snapshot IS '加购项名称快照（创建时保存）';


--
-- Name: COLUMN reservation_items.addon_price_snapshot; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reservation_items.addon_price_snapshot IS '加购项单价快照（创建时保存）';


--
-- Name: reservation_operation_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reservation_operation_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reservation_order_id uuid NOT NULL,
    operation_type character varying(20) NOT NULL,
    operator_id uuid,
    operator_name character varying(100),
    before_value jsonb,
    after_value jsonb NOT NULL,
    operation_time timestamp with time zone DEFAULT now() NOT NULL,
    ip_address character varying(45),
    remark text,
    CONSTRAINT chk_log_operation_type CHECK (((operation_type)::text = ANY ((ARRAY['CREATE'::character varying, 'CONFIRM'::character varying, 'CANCEL'::character varying, 'UPDATE'::character varying, 'PAYMENT'::character varying])::text[])))
);


--
-- Name: TABLE reservation_operation_logs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.reservation_operation_logs IS '预约单操作日志表（审计追踪）';


--
-- Name: COLUMN reservation_operation_logs.operation_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reservation_operation_logs.operation_type IS '操作类型：CREATE/CONFIRM/CANCEL/UPDATE/PAYMENT';


--
-- Name: COLUMN reservation_operation_logs.before_value; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reservation_operation_logs.before_value IS '操作前数据快照（JSONB）';


--
-- Name: COLUMN reservation_operation_logs.after_value; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reservation_operation_logs.after_value IS '操作后数据快照（JSONB）';


--
-- Name: reservation_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reservation_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_number character varying(20) NOT NULL,
    user_id uuid NOT NULL,
    scenario_package_id uuid NOT NULL,
    package_tier_id uuid NOT NULL,
    time_slot_template_id uuid NOT NULL,
    reservation_date date NOT NULL,
    reservation_time time without time zone NOT NULL,
    contact_name character varying(100) NOT NULL,
    contact_phone character varying(20) NOT NULL,
    remark text,
    total_amount numeric(10,2) NOT NULL,
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    requires_payment boolean DEFAULT false NOT NULL,
    payment_id character varying(100),
    payment_time timestamp with time zone,
    version bigint DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    cancelled_at timestamp with time zone,
    cancel_reason text,
    CONSTRAINT chk_reservation_amount CHECK ((total_amount > (0)::numeric)),
    CONSTRAINT chk_reservation_phone CHECK (((contact_phone)::text ~ '^1[3-9][0-9]{9}$'::text)),
    CONSTRAINT chk_reservation_status CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'CONFIRMED'::character varying, 'CANCELLED'::character varying, 'COMPLETED'::character varying])::text[])))
);


--
-- Name: TABLE reservation_orders; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.reservation_orders IS '预约单主表（U001-reservation-order-management）';


--
-- Name: COLUMN reservation_orders.order_number; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reservation_orders.order_number IS '预约单号，格式：R+yyyyMMddHHmmss+4位随机数';


--
-- Name: COLUMN reservation_orders.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reservation_orders.status IS '状态：PENDING(待确认)、CONFIRMED(已确认)、CANCELLED(已取消)、COMPLETED(已完成)';


--
-- Name: COLUMN reservation_orders.requires_payment; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reservation_orders.requires_payment IS '是否要求支付，运营人员确认时设置';


--
-- Name: COLUMN reservation_orders.version; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reservation_orders.version IS '乐观锁版本号';


--
-- Name: scenario_package_store_associations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.scenario_package_store_associations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    package_id uuid NOT NULL,
    store_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by character varying(100)
);


--
-- Name: TABLE scenario_package_store_associations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.scenario_package_store_associations IS '场景包-门店关联表，实现场景包与门店的多对多关系';


--
-- Name: COLUMN scenario_package_store_associations.package_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.scenario_package_store_associations.package_id IS '场景包ID，关联 scenario_packages 表';


--
-- Name: COLUMN scenario_package_store_associations.store_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.scenario_package_store_associations.store_id IS '门店ID，关联 stores 表';


--
-- Name: COLUMN scenario_package_store_associations.created_by; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.scenario_package_store_associations.created_by IS '创建人（用户ID或用户名）';


--
-- Name: scenario_packages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.scenario_packages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    base_package_id uuid,
    version integer DEFAULT 1 NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    image text,
    status character varying(20) DEFAULT 'DRAFT'::character varying NOT NULL,
    is_latest boolean DEFAULT true NOT NULL,
    version_lock integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    created_by character varying(100),
    category character varying(50),
    rating numeric(3,2),
    tags jsonb DEFAULT '[]'::jsonb,
    CONSTRAINT scenario_packages_category_check CHECK (((category)::text = ANY ((ARRAY['MOVIE'::character varying, 'TEAM'::character varying, 'PARTY'::character varying])::text[]))),
    CONSTRAINT scenario_packages_rating_check CHECK (((rating IS NULL) OR ((rating >= (0)::numeric) AND (rating <= (5)::numeric)))),
    CONSTRAINT scenario_packages_status_check CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'PUBLISHED'::character varying, 'UNPUBLISHED'::character varying])::text[])))
);


--
-- Name: COLUMN scenario_packages.image; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.scenario_packages.image IS 'Scenario package background image URL (renamed from background_image_url for frontend compatibility)';


--
-- Name: COLUMN scenario_packages.category; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.scenario_packages.category IS 'Scenario package category for frontend grouping (MOVIE=私人订制, TEAM=商务团建, PARTY=派对策划)';


--
-- Name: COLUMN scenario_packages.rating; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.scenario_packages.rating IS 'Fixed rating score (0-5) configured by operations team, displayed on C端小程序首页';


--
-- Name: COLUMN scenario_packages.tags; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.scenario_packages.tags IS 'Business tags for frontend display (e.g., ["浪漫", "惊喜", "求婚"])';


--
-- Name: skus; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.skus (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(200) NOT NULL,
    spu_id uuid NOT NULL,
    sku_type character varying(20) NOT NULL,
    main_unit character varying(20) NOT NULL,
    store_scope text[] DEFAULT '{}'::text[],
    standard_cost numeric(10,2),
    waste_rate numeric(5,2) DEFAULT 0,
    status character varying(10) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    price numeric(10,2) DEFAULT 0,
    category_id uuid,
    version bigint DEFAULT 0 NOT NULL,
    CONSTRAINT skus_sku_type_check CHECK (((sku_type)::text = ANY ((ARRAY['raw_material'::character varying, 'packaging'::character varying, 'finished_product'::character varying, 'combo'::character varying])::text[]))),
    CONSTRAINT skus_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'enabled'::character varying, 'disabled'::character varying])::text[]))),
    CONSTRAINT skus_waste_rate_check CHECK (((waste_rate >= (0)::numeric) AND (waste_rate <= (100)::numeric)))
);


--
-- Name: TABLE skus; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.skus IS 'SKU主数据表,支持四种类型:原料(raw_material)、包材(packaging)、成品(finished_product)、套餐(combo)';


--
-- Name: COLUMN skus.sku_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.skus.sku_type IS 'SKU类型:raw_material(原料)|packaging(包材)|finished_product(成品)|combo(套餐)';


--
-- Name: COLUMN skus.store_scope; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.skus.store_scope IS '门店范围:空数组表示全门店可用,非空数组表示特定门店列表';


--
-- Name: COLUMN skus.standard_cost; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.skus.standard_cost IS '标准成本(元):原料/包材手动输入,成品/套餐自动计算';


--
-- Name: COLUMN skus.waste_rate; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.skus.waste_rate IS '损耗率(%):仅成品类型有效,范围0-100';


--
-- Name: COLUMN skus.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.skus.status IS 'SKU状态:draft(草稿)|enabled(启用)|disabled(停用)';


--
-- Name: COLUMN skus.version; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.skus.version IS '乐观锁版本号，用于并发冲突检测 (@spec P006-fix-sku-edit-data)';


--
-- Name: slot_inventory_snapshots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.slot_inventory_snapshots (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reservation_order_id uuid NOT NULL,
    time_slot_template_id uuid NOT NULL,
    reservation_date date NOT NULL,
    total_capacity integer NOT NULL,
    booked_count integer NOT NULL,
    remaining_capacity integer NOT NULL,
    snapshot_time timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_snapshot_booked CHECK ((booked_count >= 0)),
    CONSTRAINT chk_snapshot_capacity CHECK ((total_capacity > 0))
);


--
-- Name: TABLE slot_inventory_snapshots; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.slot_inventory_snapshots IS '时段库存快照表（预约创建时记录）';


--
-- Name: COLUMN slot_inventory_snapshots.remaining_capacity; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.slot_inventory_snapshots.remaining_capacity IS '预约时的剩余容量';


--
-- Name: spus; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.spus (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(200) NOT NULL,
    short_name character varying(100),
    description text,
    category_id character varying(100),
    category_name character varying(200),
    brand_id character varying(100),
    brand_name character varying(100),
    status character varying(20) DEFAULT 'draft'::character varying NOT NULL,
    unit character varying(20),
    tags text[],
    images jsonb DEFAULT '[]'::jsonb,
    specifications jsonb DEFAULT '[]'::jsonb,
    attributes jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by character varying(100),
    updated_by character varying(100),
    product_type character varying(20),
    CONSTRAINT chk_spus_product_type CHECK (((product_type IS NULL) OR ((product_type)::text = ANY ((ARRAY['raw_material'::character varying, 'packaging'::character varying, 'finished_product'::character varying, 'combo'::character varying])::text[]))))
);


--
-- Name: TABLE spus; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.spus IS 'SPU主数据表 - 标准产品单元';


--
-- Name: COLUMN spus.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.spus.id IS '主键UUID';


--
-- Name: COLUMN spus.code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.spus.code IS 'SPU编码，唯一标识';


--
-- Name: COLUMN spus.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.spus.name IS 'SPU名称';


--
-- Name: COLUMN spus.short_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.spus.short_name IS 'SPU简称';


--
-- Name: COLUMN spus.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.spus.description IS 'SPU描述';


--
-- Name: COLUMN spus.category_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.spus.category_id IS '所属类目ID';


--
-- Name: COLUMN spus.category_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.spus.category_name IS '所属类目名称';


--
-- Name: COLUMN spus.brand_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.spus.brand_id IS '所属品牌ID';


--
-- Name: COLUMN spus.brand_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.spus.brand_name IS '所属品牌名称';


--
-- Name: COLUMN spus.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.spus.status IS '状态: draft-草稿, active-启用, inactive-停用, archived-归档';


--
-- Name: COLUMN spus.unit; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.spus.unit IS '基本单位';


--
-- Name: COLUMN spus.tags; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.spus.tags IS '标签数组';


--
-- Name: COLUMN spus.images; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.spus.images IS '图片列表JSON';


--
-- Name: COLUMN spus.specifications; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.spus.specifications IS '规格列表JSON';


--
-- Name: COLUMN spus.attributes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.spus.attributes IS '属性列表JSON';


--
-- Name: COLUMN spus.product_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.spus.product_type IS 'SPU产品类型：raw_material(原料)、packaging(包材)、finished_product(成品)、combo(套餐)，SKU创建时继承此类型';


--
-- Name: store_inventory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.store_inventory (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    store_id uuid NOT NULL,
    sku_id uuid NOT NULL,
    on_hand_qty numeric(12,3) DEFAULT 0 NOT NULL,
    available_qty numeric(12,3) DEFAULT 0 NOT NULL,
    reserved_qty numeric(12,3) DEFAULT 0 NOT NULL,
    safety_stock numeric(12,3) DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    CONSTRAINT chk_store_inventory_reserved_lte_on_hand CHECK ((on_hand_qty >= reserved_qty))
);


--
-- Name: COLUMN store_inventory.available_qty; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.store_inventory.available_qty IS 'Computed: on_hand_qty - reserved_qty (可用库存). Auto-updated by triggers.';


--
-- Name: COLUMN store_inventory.reserved_qty; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.store_inventory.reserved_qty IS 'Quantity locked for pending orders (预占库存). Used by P005 BOM reservation system.';


--
-- Name: COLUMN store_inventory.version; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.store_inventory.version IS '乐观锁版本号';


--
-- Name: CONSTRAINT chk_store_inventory_reserved_lte_on_hand ON store_inventory; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON CONSTRAINT chk_store_inventory_reserved_lte_on_hand ON public.store_inventory IS 'P005: Ensures reserved quantity never exceeds on-hand quantity';


--
-- Name: store_operation_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.store_operation_logs (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    store_id uuid NOT NULL,
    operation_type character varying(20) NOT NULL,
    operator_id uuid,
    operator_name character varying(100),
    before_value jsonb,
    after_value jsonb,
    operation_time timestamp with time zone DEFAULT now() NOT NULL,
    ip_address character varying(45),
    remark text,
    CONSTRAINT store_operation_logs_operation_type_check CHECK (((operation_type)::text = ANY ((ARRAY['CREATE'::character varying, 'UPDATE'::character varying, 'STATUS_CHANGE'::character varying, 'DELETE'::character varying])::text[])))
);


--
-- Name: TABLE store_operation_logs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.store_operation_logs IS '门店操作审计日志';


--
-- Name: COLUMN store_operation_logs.operation_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.store_operation_logs.operation_type IS '操作类型: CREATE | UPDATE | STATUS_CHANGE | DELETE';


--
-- Name: COLUMN store_operation_logs.before_value; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.store_operation_logs.before_value IS 'JSON格式的修改前快照(UPDATE/STATUS_CHANGE时有值)';


--
-- Name: COLUMN store_operation_logs.after_value; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.store_operation_logs.after_value IS 'JSON格式的修改后快照';


--
-- Name: store_reservation_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.store_reservation_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    store_id uuid NOT NULL,
    is_reservation_enabled boolean DEFAULT false NOT NULL,
    max_reservation_days integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by character varying(255),
    time_slots jsonb DEFAULT '[]'::jsonb NOT NULL,
    min_advance_hours integer DEFAULT 1 NOT NULL,
    duration_unit integer DEFAULT 1 NOT NULL,
    deposit_required boolean DEFAULT false NOT NULL,
    deposit_amount numeric(10,2),
    deposit_percentage integer,
    is_active boolean DEFAULT true NOT NULL,
    CONSTRAINT store_reservation_settings_deposit_amount_check CHECK (((deposit_amount IS NULL) OR (deposit_amount >= (0)::numeric))),
    CONSTRAINT store_reservation_settings_deposit_percentage_check CHECK (((deposit_percentage IS NULL) OR ((deposit_percentage >= 0) AND (deposit_percentage <= 100)))),
    CONSTRAINT store_reservation_settings_duration_unit_check CHECK ((duration_unit = ANY (ARRAY[1, 2, 4]))),
    CONSTRAINT store_reservation_settings_max_reservation_days_check CHECK (((max_reservation_days >= 0) AND (max_reservation_days <= 365))),
    CONSTRAINT store_reservation_settings_min_advance_hours_check CHECK ((min_advance_hours > 0))
);


--
-- Name: TABLE store_reservation_settings; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.store_reservation_settings IS '门店预约设置表，存储每个门店的预约配置（是否开放预约、可预约天数）';


--
-- Name: COLUMN store_reservation_settings.store_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.store_reservation_settings.store_id IS '门店ID，与stores表一对一关系';


--
-- Name: COLUMN store_reservation_settings.is_reservation_enabled; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.store_reservation_settings.is_reservation_enabled IS '是否开放预约';


--
-- Name: COLUMN store_reservation_settings.max_reservation_days; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.store_reservation_settings.max_reservation_days IS '可预约天数（未来N天），范围0-365';


--
-- Name: COLUMN store_reservation_settings.updated_by; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.store_reservation_settings.updated_by IS '最后更新人（如果支持用户追踪）';


--
-- Name: COLUMN store_reservation_settings.time_slots; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.store_reservation_settings.time_slots IS '可预约时间段列表，JSONB格式，每个元素包含dayOfWeek(1-7)、startTime、endTime';


--
-- Name: COLUMN store_reservation_settings.min_advance_hours; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.store_reservation_settings.min_advance_hours IS '最小提前小时数，如2表示至少提前2小时预约';


--
-- Name: COLUMN store_reservation_settings.duration_unit; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.store_reservation_settings.duration_unit IS '预约单位时长（小时），仅允许1、2、4';


--
-- Name: COLUMN store_reservation_settings.deposit_required; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.store_reservation_settings.deposit_required IS '是否需要押金';


--
-- Name: COLUMN store_reservation_settings.deposit_amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.store_reservation_settings.deposit_amount IS '押金金额（元）';


--
-- Name: COLUMN store_reservation_settings.deposit_percentage; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.store_reservation_settings.deposit_percentage IS '押金比例（百分比，0-100）';


--
-- Name: COLUMN store_reservation_settings.is_active; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.store_reservation_settings.is_active IS '配置是否生效，门店停用时设为false';


--
-- Name: stores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stores (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(200) NOT NULL,
    address text,
    phone character varying(50),
    business_hours jsonb,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    province character varying(50),
    city character varying(50),
    district character varying(50),
    version bigint DEFAULT 0 NOT NULL,
    opening_date date,
    area integer,
    hall_count integer,
    seat_count integer,
    CONSTRAINT chk_phone_format CHECK (((phone IS NULL) OR ((phone)::text ~ '^(1[3-9]\d{9})|(0\d{2,3}-?\d{7,8})|(400-?\d{3}-?\d{4})$'::text))),
    CONSTRAINT ck_stores_area_positive CHECK (((area IS NULL) OR (area > 0))),
    CONSTRAINT ck_stores_hall_count_positive CHECK (((hall_count IS NULL) OR (hall_count > 0))),
    CONSTRAINT ck_stores_seat_count_positive CHECK (((seat_count IS NULL) OR (seat_count > 0))),
    CONSTRAINT stores_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[])))
);


--
-- Name: TABLE stores; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.stores IS '门店信息表';


--
-- Name: COLUMN stores.code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.stores.code IS '门店编码，唯一标识';


--
-- Name: COLUMN stores.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.stores.name IS '门店名称';


--
-- Name: COLUMN stores.address; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.stores.address IS '详细地址，如 xx路xx号xx大厦';


--
-- Name: COLUMN stores.phone; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.stores.phone IS '联系电话，支持手机号、座机、400热线';


--
-- Name: COLUMN stores.business_hours; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.stores.business_hours IS '营业时间（JSON格式）';


--
-- Name: COLUMN stores.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.stores.status IS '门店状态：active=营业中, inactive=已停业';


--
-- Name: COLUMN stores.province; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.stores.province IS '省份，如 北京市';


--
-- Name: COLUMN stores.city; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.stores.city IS '城市，如 北京市（直辖市与省份相同）';


--
-- Name: COLUMN stores.district; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.stores.district IS '区县，如 朝阳区';


--
-- Name: COLUMN stores.version; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.stores.version IS '乐观锁版本号,每次UPDATE自动递增';


--
-- Name: COLUMN stores.opening_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.stores.opening_date IS '开业时间';


--
-- Name: COLUMN stores.area; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.stores.area IS '门店面积（平方米）';


--
-- Name: COLUMN stores.hall_count; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.stores.hall_count IS '影厅数量';


--
-- Name: COLUMN stores.seat_count; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.stores.seat_count IS '总座位数';


--
-- Name: time_slot_overrides; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.time_slot_overrides (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    package_id uuid NOT NULL,
    override_date date NOT NULL,
    override_type character varying(20) NOT NULL,
    start_time time without time zone,
    end_time time without time zone,
    capacity integer,
    reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT time_slot_overrides_override_type_check CHECK (((override_type)::text = ANY ((ARRAY['CANCEL'::character varying, 'MODIFY'::character varying, 'ADD'::character varying])::text[])))
);


--
-- Name: time_slot_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.time_slot_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    package_id uuid NOT NULL,
    day_of_week integer NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    capacity integer,
    price_adjustment jsonb,
    is_enabled boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT time_slot_templates_day_of_week_check CHECK (((day_of_week >= 0) AND (day_of_week <= 6))),
    CONSTRAINT valid_time_range CHECK ((end_time > start_time))
);


--
-- Name: unified_orders; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.unified_orders AS
 SELECT product_orders.id,
    product_orders.order_number,
    product_orders.user_id,
    product_orders.status,
    product_orders.total_amount AS total_price,
    product_orders.payment_method,
    product_orders.payment_time AS paid_at,
    product_orders.created_at,
    product_orders.updated_at,
    'PRODUCT'::text AS order_type
   FROM public.product_orders
UNION ALL
 SELECT beverage_orders.id,
    beverage_orders.order_number,
    beverage_orders.user_id,
    beverage_orders.status,
    beverage_orders.total_price,
    beverage_orders.payment_method,
    beverage_orders.paid_at,
    beverage_orders.created_at,
    beverage_orders.updated_at,
    'BEVERAGE'::text AS order_type
   FROM public.beverage_orders;


--
-- Name: VIEW unified_orders; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON VIEW public.unified_orders IS '统一订单视图 - 合并商品订单和饮品订单';


--
-- Name: unit_conversions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.unit_conversions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    from_unit character varying(20) NOT NULL,
    to_unit character varying(20) NOT NULL,
    conversion_rate numeric(10,6) NOT NULL,
    category character varying(20) NOT NULL,
    CONSTRAINT unit_conversions_category_check CHECK (((category)::text = ANY ((ARRAY['volume'::character varying, 'weight'::character varying, 'quantity'::character varying])::text[])))
);


--
-- Name: TABLE unit_conversions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.unit_conversions IS '单位换算表:支持体积、重量、数量单位转换';


--
-- Name: COLUMN unit_conversions.from_unit; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.unit_conversions.from_unit IS '源单位';


--
-- Name: COLUMN unit_conversions.to_unit; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.unit_conversions.to_unit IS '目标单位';


--
-- Name: COLUMN unit_conversions.conversion_rate; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.unit_conversions.conversion_rate IS '换算率(1 from_unit = ? to_unit)';


--
-- Name: COLUMN unit_conversions.category; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.unit_conversions.category IS '单位类别:volume(体积)|weight(重量)|quantity(数量)';


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    username character varying(100) NOT NULL,
    phone character varying(20),
    province character varying(50),
    city character varying(50),
    district character varying(50),
    address character varying(200),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Data for Name: activity_types; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.activity_types VALUES ('79df1080-eeee-4f08-afa9-d110604d60b7', '企业团建', NULL, 'ENABLED', 0, '2025-12-18 06:25:57.942285+00', '2025-12-18 06:25:57.942285+00', NULL, NULL, NULL);
INSERT INTO public.activity_types VALUES ('8e0cb17f-7c5b-4527-9f66-734835b5539c', '生日派对', NULL, 'ENABLED', 1, '2025-12-18 06:34:46.996251+00', '2025-12-18 06:34:46.996251+00', NULL, NULL, NULL);
INSERT INTO public.activity_types VALUES ('f668dc19-16ab-4f09-82c7-591ecdfc2950', '订婚Party', NULL, 'ENABLED', 2, '2025-12-18 06:35:36.310387+00', '2025-12-18 06:35:36.310387+00', NULL, NULL, NULL);
INSERT INTO public.activity_types VALUES ('631b0c56-9279-40f9-a998-82373a7ce56c', '公司年会', NULL, 'ENABLED', 4, '2025-12-18 06:37:26.571313+00', '2025-12-18 06:37:26.571313+00', NULL, NULL, NULL);
INSERT INTO public.activity_types VALUES ('3d8b19b3-4fa6-4ed5-9b27-f546ce7839e1', 'TESt', NULL, 'ENABLED', 5, '2025-12-18 06:52:01.622279+00', '2025-12-18 06:52:01.622279+00', NULL, NULL, NULL);


--
-- Data for Name: addon_items; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.addon_items VALUES ('00000000-0003-0001-0000-000000000001', '精美茶歇', 299.00, 'CATERING', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200', 50, true, '2025-12-23 06:52:25.119305+00', '2025-12-23 06:52:25.119305+00');
INSERT INTO public.addon_items VALUES ('00000000-0003-0001-0000-000000000002', '红酒拼盘', 599.00, 'BEVERAGE', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=200', 20, true, '2025-12-23 06:52:25.119305+00', '2025-12-23 06:52:25.119305+00');
INSERT INTO public.addon_items VALUES ('00000000-0003-0001-0000-000000000003', '气球布置', 199.00, 'DECORATION', 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=200', NULL, true, '2025-12-23 06:52:25.119305+00', '2025-12-23 06:52:25.119305+00');
INSERT INTO public.addon_items VALUES ('00000000-0003-0001-0000-000000000004', '专属摄影', 999.00, 'SERVICE', 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=200', 5, true, '2025-12-23 06:52:25.119305+00', '2025-12-23 06:52:25.119305+00');
INSERT INTO public.addon_items VALUES ('00000000-0003-0001-0000-000000000005', '鲜花装饰', 388.00, 'DECORATION', 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=200', 30, true, '2025-12-23 06:52:25.119305+00', '2025-12-23 06:52:25.119305+00');
INSERT INTO public.addon_items VALUES ('00000000-0003-0001-0000-000000000006', '求婚灯牌', 158.00, 'DECORATION', 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=200', 10, true, '2025-12-23 06:52:25.119305+00', '2025-12-23 06:52:25.119305+00');


--
-- Data for Name: adjustment_reasons; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.adjustment_reasons VALUES ('ac7eb694-47b0-4a95-8d0b-c42db9bfae42', 'STOCK_DIFF', '盘点差异', 'surplus', true, 1, '2025-12-26 09:42:37.681172+00', '2025-12-26 09:42:37.681172+00');
INSERT INTO public.adjustment_reasons VALUES ('834a232c-4512-40cc-af62-108e292bd3b3', 'STOCK_DIFF_SHORTAGE', '盘点差异', 'shortage', true, 2, '2025-12-26 09:42:37.681172+00', '2025-12-26 09:42:37.681172+00');
INSERT INTO public.adjustment_reasons VALUES ('f3821450-af05-4033-a153-4ea38dc2c8b1', 'GOODS_DAMAGE', '货物损坏', 'damage', true, 3, '2025-12-26 09:42:37.681172+00', '2025-12-26 09:42:37.681172+00');
INSERT INTO public.adjustment_reasons VALUES ('f288d955-af28-4d2e-8df1-6ff23f585a8c', 'EXPIRED_WRITE_OFF', '过期报废', 'damage', true, 4, '2025-12-26 09:42:37.681172+00', '2025-12-26 09:42:37.681172+00');
INSERT INTO public.adjustment_reasons VALUES ('91464c53-f077-4551-8c00-6ad2c7d035e5', 'INBOUND_ERROR', '入库错误', 'shortage', true, 5, '2025-12-26 09:42:37.681172+00', '2025-12-26 09:42:37.681172+00');
INSERT INTO public.adjustment_reasons VALUES ('5d343f4d-5e6f-4068-8b5d-4dbea1baec59', 'OTHER_SURPLUS', '其他(盘盈)', 'surplus', true, 6, '2025-12-26 09:42:37.681172+00', '2025-12-26 09:42:37.681172+00');
INSERT INTO public.adjustment_reasons VALUES ('2c690b6d-a31c-49cf-b712-ed3e5afaea3e', 'OTHER_SHORTAGE', '其他(盘亏)', 'shortage', true, 7, '2025-12-26 09:42:37.681172+00', '2025-12-26 09:42:37.681172+00');
INSERT INTO public.adjustment_reasons VALUES ('82409fcb-e21e-4f04-9a2b-3abd77ded4f4', 'OTHER_DAMAGE', '其他(报损)', 'damage', true, 8, '2025-12-26 09:42:37.681172+00', '2025-12-26 09:42:37.681172+00');
INSERT INTO public.adjustment_reasons VALUES ('a143771f-c43c-452f-843b-9fb98d499067', 'SHORTAGE_SALE', '销售损耗', 'shortage', true, 9, '2025-12-27 02:00:06.114579+00', '2025-12-27 02:00:06.114579+00');


--
-- Data for Name: approval_records; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: beverage_order_items; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.beverage_order_items VALUES ('8b7c7992-df2a-4289-9512-8e650eed082c', '42ccde07-1d09-4ab3-92e4-dd67d3d7eb5f', '1c1672f1-b5d7-49c7-b5d6-05fcff68d014', '美式咖啡', 'https://fxhgyxceqrmnpezluaht.supabase.co/storage/v1/object/public/beverage-images/beverages/ba9183e9-42f6-4aed-9602-4ee0245e4494.jpg', '{}', 1, 0.25, 0.25, '2025-12-28 11:14:41.380844', NULL);
INSERT INTO public.beverage_order_items VALUES ('799f063e-f12c-4f67-a4ac-0dd5a7165008', 'fdc2422c-d4ce-43bb-8986-bb6df58df004', '1c1672f1-b5d7-49c7-b5d6-05fcff68d014', '美式咖啡', 'https://fxhgyxceqrmnpezluaht.supabase.co/storage/v1/object/public/beverage-images/beverages/ba9183e9-42f6-4aed-9602-4ee0245e4494.jpg', '{}', 1, 0.25, 0.25, '2025-12-28 11:18:25.128079', NULL);
INSERT INTO public.beverage_order_items VALUES ('e8da7893-4241-42ee-9663-530d671b0118', '4e34b38d-b605-4cac-86a2-b35eed8983de', '1c1672f1-b5d7-49c7-b5d6-05fcff68d014', '美式咖啡', 'https://fxhgyxceqrmnpezluaht.supabase.co/storage/v1/object/public/beverage-images/beverages/ba9183e9-42f6-4aed-9602-4ee0245e4494.jpg', '{}', 1, 0.25, 0.25, '2025-12-28 12:04:20.700628', NULL);
INSERT INTO public.beverage_order_items VALUES ('3c147744-99ae-4828-bfc1-29dfbfe1c867', '2f5ca2be-049e-4496-9102-26ffe88960d9', '1c1672f1-b5d7-49c7-b5d6-05fcff68d014', '美式咖啡', 'https://fxhgyxceqrmnpezluaht.supabase.co/storage/v1/object/public/beverage-images/beverages/ba9183e9-42f6-4aed-9602-4ee0245e4494.jpg', '{}', 1, 0.25, 0.25, '2025-12-28 12:08:03.524282', NULL);
INSERT INTO public.beverage_order_items VALUES ('74a3e390-381b-4a8a-850f-e7643b049442', '44688c3b-93b8-4ac6-9d2d-3ebd42151e5c', '1c1672f1-b5d7-49c7-b5d6-05fcff68d014', '美式咖啡', 'https://fxhgyxceqrmnpezluaht.supabase.co/storage/v1/object/public/beverage-images/beverages/ba9183e9-42f6-4aed-9602-4ee0245e4494.jpg', '{}', 1, 0.25, 0.25, '2025-12-28 12:14:58.220827', NULL);


--
-- Data for Name: beverage_order_status_logs; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: beverage_orders; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.beverage_orders VALUES ('42ccde07-1d09-4ab3-92e4-dd67d3d7eb5f', 'BORDT202512281914412722', '6d4abfe1-83a0-499a-8bcc-4df323a3c804', '00000000-0000-0000-0000-000000000001', 0.25, 'PENDING_PAYMENT', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-28 19:14:42.145825', '2025-12-28 19:14:42.145859', 'BEVERAGE');
INSERT INTO public.beverage_orders VALUES ('fdc2422c-d4ce-43bb-8986-bb6df58df004', 'BORDT202512281918246123', 'bbdffff8-f0b3-4962-b438-bd643836104a', '00000000-0000-0000-0000-000000000001', 0.25, 'PENDING_PRODUCTION', 'MOCK_PAYMENT', 'MOCK_TXN_1766923428760', '2025-12-28 20:03:48.760663', NULL, NULL, NULL, NULL, NULL, '2025-12-28 19:18:25.8287', '2025-12-28 20:03:48.801041', 'BEVERAGE');
INSERT INTO public.beverage_orders VALUES ('4e34b38d-b605-4cac-86a2-b35eed8983de', 'BORDT202512282004209208', '59097ed8-a291-43d1-b6b5-ec4c9fc1ce2b', '00000000-0000-0000-0000-000000000001', 0.25, 'PENDING_PRODUCTION', 'MOCK_PAYMENT', 'MOCK_TXN_1766923462805', '2025-12-28 20:04:22.805534', NULL, NULL, NULL, NULL, NULL, '2025-12-28 20:04:21.326651', '2025-12-28 20:04:22.806979', 'BEVERAGE');
INSERT INTO public.beverage_orders VALUES ('2f5ca2be-049e-4496-9102-26ffe88960d9', 'BORDT202512282008036601', '3fe8f478-bf7b-49d1-8525-07bdcd5cb211', '00000000-0000-0000-0000-000000000001', 0.25, 'PENDING_PRODUCTION', 'MOCK_PAYMENT', 'MOCK_TXN_1766923685635', '2025-12-28 20:08:05.635395', NULL, NULL, NULL, NULL, NULL, '2025-12-28 20:08:04.140976', '2025-12-28 20:08:05.637163', 'BEVERAGE');
INSERT INTO public.beverage_orders VALUES ('44688c3b-93b8-4ac6-9d2d-3ebd42151e5c', 'BORDT202512282014570451', 'e92900bc-9d90-48f4-8971-8aef873721f4', '00000000-0000-0000-0000-000000000001', 0.25, 'PENDING_PRODUCTION', 'MOCK_PAYMENT', 'MOCK_TXN_1766924100579', '2025-12-28 20:15:00.579289', NULL, NULL, NULL, NULL, NULL, '2025-12-28 20:14:58.842049', '2025-12-28 20:15:00.58122', 'BEVERAGE');


--
-- Data for Name: beverage_recipes; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.beverage_recipes VALUES ('2232a1c8-e20c-4309-a855-73c8c9012791', '1c1672f1-b5d7-49c7-b5d6-05fcff68d014', 'ALL', '2025-12-28 13:54:32.27048', '2025-12-28 13:54:32.270504', '美式咖啡-测试配方', '测试配方描述');


--
-- Data for Name: beverage_sku_mapping; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.beverage_sku_mapping VALUES ('7c94b884-5fd4-4ecb-8a74-5008423eaa1f', '079dbcb1-7f8b-45b0-afac-110abcd40603', '2025-12-31 09:46:20.708726+00', 'V064', 'active');
INSERT INTO public.beverage_sku_mapping VALUES ('9a2f00c7-8125-451f-9760-a623eb206fd1', '4fb0d962-21d6-47d3-b29b-61d09569eae9', '2025-12-31 09:46:20.708726+00', 'V064', 'active');
INSERT INTO public.beverage_sku_mapping VALUES ('1c1672f1-b5d7-49c7-b5d6-05fcff68d014', '636bb162-2df3-42b6-bf29-7ca4c5867ccc', '2025-12-31 09:46:20.708726+00', 'V064', 'active');
INSERT INTO public.beverage_sku_mapping VALUES ('eed983f0-5c53-4877-be07-e74e8aeaecef', 'd89b55a7-c6bf-4633-b13b-38549338a2f5', '2025-12-31 09:46:20.708726+00', 'V064', 'active');


--
-- Data for Name: beverage_specs; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.beverage_specs VALUES ('e7524b76-21a3-45a2-ad98-95087008c2cd', '7c94b884-5fd4-4ecb-8a74-5008423eaa1f', 'SIZE', '330ml罐装', NULL, 0.00, 1, true, '2025-12-28 01:35:33.173741');
INSERT INTO public.beverage_specs VALUES ('0c0bdd2a-b0d6-4726-8796-99b0091e9503', '7c94b884-5fd4-4ecb-8a74-5008423eaa1f', 'SIZE', '500ml瓶装', NULL, 3.00, 2, false, '2025-12-28 01:35:33.173741');
INSERT INTO public.beverage_specs VALUES ('fa4eb82e-7a07-435d-bb77-1223ea04158f', '7c94b884-5fd4-4ecb-8a74-5008423eaa1f', 'TEMPERATURE', '冰', NULL, 0.00, 1, true, '2025-12-28 01:35:33.173741');
INSERT INTO public.beverage_specs VALUES ('d39548c2-74c8-49a1-bfe8-d976401d6634', '7c94b884-5fd4-4ecb-8a74-5008423eaa1f', 'TEMPERATURE', '常温', NULL, 0.00, 2, false, '2025-12-28 01:35:33.173741');
INSERT INTO public.beverage_specs VALUES ('418adea8-47c8-40f1-a077-2974ff858fad', '9a2f00c7-8125-451f-9760-a623eb206fd1', 'SIZE', '大杯', NULL, 25.00, 0, false, '2025-12-28 04:27:17.773185');
INSERT INTO public.beverage_specs VALUES ('8aa36ebd-7cbe-4b9a-bf00-0b4f599fcdc0', '9a2f00c7-8125-451f-9760-a623eb206fd1', 'SIZE', '小杯', NULL, 23.00, 0, false, '2025-12-28 04:27:38.683964');


--
-- Data for Name: beverages; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.beverages VALUES ('7c94b884-5fd4-4ecb-8a74-5008423eaa1f', '可口可乐', '经典可乐，冰爽畅快', 'OTHER', NULL, '[]', 8.00, NULL, 'ACTIVE', false, 50, '2025-12-28 01:33:37.07211', '2025-12-28 01:33:37.07211', NULL, NULL);
INSERT INTO public.beverages VALUES ('9a2f00c7-8125-451f-9760-a623eb206fd1', '美式咖啡', '经典美式咖啡，香浓醇厚', 'COFFEE', 'https://fxhgyxceqrmnpezluaht.supabase.co/storage/v1/object/public/beverage-images/beverages/8ce998f8-e5f6-4f02-8d84-df533f5d5449.png', '[]', 0.25, NULL, 'ACTIVE', false, 0, '2025-12-28 12:23:53.481524', '2025-12-28 12:23:53.481547', NULL, NULL);
INSERT INTO public.beverages VALUES ('1c1672f1-b5d7-49c7-b5d6-05fcff68d014', '美式咖啡', '经典美式咖啡，香浓醇厚', 'COFFEE', 'https://fxhgyxceqrmnpezluaht.supabase.co/storage/v1/object/public/beverage-images/beverages/ba9183e9-42f6-4aed-9602-4ee0245e4494.jpg', '[]', 0.25, NULL, 'ACTIVE', false, 0, '2025-12-28 12:23:46.002054', '2025-12-28 12:25:39.262666', NULL, NULL);
INSERT INTO public.beverages VALUES ('eed983f0-5c53-4877-be07-e74e8aeaecef', '鸡尾酒', NULL, 'OTHER', 'https://fxhgyxceqrmnpezluaht.supabase.co/storage/v1/object/public/beverage-images/beverages/f0fe3be7-5f17-421b-b7ad-ad602682b148.png', '[]', 40.00, NULL, 'ACTIVE', false, 0, '2025-12-31 11:26:28.40623', '2025-12-31 11:26:28.406261', NULL, NULL);


--
-- Data for Name: bom_components; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.bom_components VALUES ('a4a15973-668e-4f68-b9e9-d39fb728247c', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440001', 50.000, 'ml', 0.50, false, 1, '2025-12-24 14:21:32.899938');
INSERT INTO public.bom_components VALUES ('6203dc23-d495-4051-8478-821ca2426316', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440002', 100.000, 'ml', 0.02, false, 2, '2025-12-24 14:21:32.899938');
INSERT INTO public.bom_components VALUES ('47419c39-b3f1-4b2e-b03e-188c4dc46114', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440011', 1.000, '个', 1.00, false, 3, '2025-12-24 14:21:32.899938');
INSERT INTO public.bom_components VALUES ('ab1d4185-7efc-4de9-967f-7c66ce71545e', '550e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440004', 100.000, 'g', 0.01, false, 1, '2025-12-24 14:21:32.899938');
INSERT INTO public.bom_components VALUES ('93d5f6f1-d972-4db2-9a68-ebfc6993f4f9', '550e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440005', 30.000, 'g', 0.05, false, 2, '2025-12-24 14:21:32.899938');
INSERT INTO public.bom_components VALUES ('e7a6adeb-03b2-4bf8-86ee-541f7c12f7f5', '550e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440014', 1.000, '个', 1.50, false, 3, '2025-12-24 14:21:32.899938');
INSERT INTO public.bom_components VALUES ('6a8829c6-2991-4868-a716-deef7aab63a7', '550e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440004', 100.000, 'g', 0.01, false, 1, '2025-12-24 14:21:32.899938');
INSERT INTO public.bom_components VALUES ('1f3ab29b-1752-480b-8761-668b210ec5a3', '550e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440005', 25.000, 'g', 0.05, false, 2, '2025-12-24 14:21:32.899938');
INSERT INTO public.bom_components VALUES ('acf91774-caa4-408c-a180-8dc492ce827a', '550e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440014', 1.000, '个', 1.50, false, 3, '2025-12-24 14:21:32.899938');
INSERT INTO public.bom_components VALUES ('b1411dff-bab6-400f-b03e-389218ff12d9', '550e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440004', 50.000, 'g', 0.01, false, 1, '2025-12-24 14:21:32.899938');
INSERT INTO public.bom_components VALUES ('c48cce70-e46c-42de-9057-84b29bbbf166', '550e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440005', 15.000, 'g', 0.05, false, 2, '2025-12-24 14:21:32.899938');
INSERT INTO public.bom_components VALUES ('beb738e8-ad83-40f6-a1d0-0257c32115dd', '550e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440015', 1.000, '个', 0.50, false, 3, '2025-12-24 14:21:32.899938');
INSERT INTO public.bom_components VALUES ('75f06bca-1209-4fc9-834c-b8d4e4ba9fde', '550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440002', 200.000, 'ml', 0.02, false, 0, '2025-12-25 04:27:56.509081');
INSERT INTO public.bom_components VALUES ('e51bf034-be8a-4594-ad46-61197054941f', '550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440012', 1.000, '个', 0.30, false, 1, '2025-12-25 04:27:57.116343');
INSERT INTO public.bom_components VALUES ('a14498d6-dd75-4d6a-b97e-1d99f90e0709', '550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440013', 1.000, '根', 0.10, false, 2, '2025-12-25 04:27:57.736932');
INSERT INTO public.bom_components VALUES ('48fdbfee-e8c3-4897-a1dc-e6b404ef1a62', '550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440011', 1.000, '个', 1.00, false, 3, '2025-12-25 04:27:58.355602');
INSERT INTO public.bom_components VALUES ('bbd6d7ce-8986-48fc-b538-6c108dd883a5', '2f7882fa-1975-48f4-b79b-8a3355bdb7c7', '21a1052b-a15c-466e-b573-01c24e63e87b', 1.000, '份', 1.50, false, 0, '2025-12-25 05:56:50.829555');
INSERT INTO public.bom_components VALUES ('dbf1aadb-7db9-4eaf-8e9d-50137a21a78c', '2f7882fa-1975-48f4-b79b-8a3355bdb7c7', '550e8400-e29b-41d4-a716-446655440001', 10.000, 'ml', 0.50, false, 1, '2025-12-25 05:56:51.477674');
INSERT INTO public.bom_components VALUES ('e8281159-cee4-4422-b4b9-a9f7232990ce', '2f7882fa-1975-48f4-b79b-8a3355bdb7c7', '550e8400-e29b-41d4-a716-446655440003', 1.000, '片', 0.50, false, 2, '2025-12-25 05:56:52.075215');
INSERT INTO public.bom_components VALUES ('11355658-760c-416b-976a-0a6b9648a3ce', '2f7882fa-1975-48f4-b79b-8a3355bdb7c7', '550e8400-e29b-41d4-a716-446655440002', 10.000, 'ml', 0.02, false, 3, '2025-12-25 05:56:52.69518');
INSERT INTO public.bom_components VALUES ('6a14f838-1cce-4340-a7f5-4a91dfa788b8', '23ba9c9b-58a7-4b19-86b4-b4c65a21c189', '550e8400-e29b-41d4-a716-446655440001', 45.000, 'ml', 0.50, false, 0, '2025-12-25 06:04:47.445013');
INSERT INTO public.bom_components VALUES ('f676ccc3-0b7c-49ad-ae93-8f967ef1f184', '23ba9c9b-58a7-4b19-86b4-b4c65a21c189', '550e8400-e29b-41d4-a716-446655440002', 150.000, 'ml', 0.02, false, 1, '2025-12-25 06:04:48.065553');
INSERT INTO public.bom_components VALUES ('b05103b0-be76-4e04-bb34-6b315e3daed0', '23ba9c9b-58a7-4b19-86b4-b4c65a21c189', '21a1052b-a15c-466e-b573-01c24e63e87b', 1.000, '份', 1.50, false, 2, '2025-12-25 06:04:48.689879');
INSERT INTO public.bom_components VALUES ('af6913ee-7c1e-4f43-a3de-04c2b6f53b59', '23ba9c9b-58a7-4b19-86b4-b4c65a21c189', '550e8400-e29b-41d4-a716-446655440013', 1.000, '根', 0.10, false, 3, '2025-12-25 06:04:49.300719');
INSERT INTO public.bom_components VALUES ('bdc9b5b5-82ed-44ae-ba69-158f812b14d7', '22222222-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000001', 1.000, '杯', NULL, false, 0, '2025-12-29 12:14:09.234575');
INSERT INTO public.bom_components VALUES ('886f9e7e-79f4-4c34-b6e7-50b434a9afdc', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 45.000, 'ml', NULL, false, 0, '2025-12-31 03:19:52.491969');
INSERT INTO public.bom_components VALUES ('3576210f-163d-46a3-8794-de9a75191cf2', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002', 150.000, 'ml', NULL, false, 1, '2025-12-31 03:19:53.136595');
INSERT INTO public.bom_components VALUES ('05f9782a-3d37-4bd4-99c2-7b6c61278e6b', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000003', 1.000, '个', NULL, false, 2, '2025-12-31 03:19:53.770144');
INSERT INTO public.bom_components VALUES ('6618a75c-90f9-43e8-b3f1-1466107ea671', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000004', 1.000, '根', NULL, false, 3, '2025-12-31 03:19:54.378208');


--
-- Data for Name: bom_snapshots; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.bom_snapshots VALUES ('a5590d96-9e0f-4707-968e-dc26706eb1cf', '33333333-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 45.0000, 'ml', 0.0000, 0, '2025-12-29 13:32:18.413929');
INSERT INTO public.bom_snapshots VALUES ('587ab6ed-6e90-4c02-a64b-020e98a847d6', '33333333-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002', 150.0000, 'ml', 0.0000, 0, '2025-12-29 13:32:18.414062');
INSERT INTO public.bom_snapshots VALUES ('dcf80eb5-ee02-4719-8d80-5d55ddcc2b90', '33333333-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000003', 1.0000, '个', 0.0000, 0, '2025-12-29 13:32:18.41413');
INSERT INTO public.bom_snapshots VALUES ('1c53e6bd-5c31-4ac2-b2da-b9dd0f5ed6e4', '33333333-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000004', 1.0000, '根', 0.0000, 0, '2025-12-29 13:32:18.414187');
INSERT INTO public.bom_snapshots VALUES ('6c1eeb2d-f901-416e-839b-a5fcbe78a62d', '33333333-0000-0000-0000-000000000009', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 45.0000, 'ml', 0.0000, 0, '2025-12-29 13:32:58.458423');
INSERT INTO public.bom_snapshots VALUES ('3f04b137-e339-4b87-8906-60dc0162c368', '33333333-0000-0000-0000-000000000009', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002', 150.0000, 'ml', 0.0000, 0, '2025-12-29 13:32:58.458478');
INSERT INTO public.bom_snapshots VALUES ('3d7b491a-8685-4ce1-a5f0-1943f7e5225b', '33333333-0000-0000-0000-000000000009', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000003', 1.0000, '个', 0.0000, 0, '2025-12-29 13:32:58.458525');
INSERT INTO public.bom_snapshots VALUES ('4a696a9e-3977-45e9-abd5-1d5aa151bdfb', '33333333-0000-0000-0000-000000000009', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000004', 1.0000, '根', 0.0000, 0, '2025-12-29 13:32:58.45857');
INSERT INTO public.bom_snapshots VALUES ('c4903cc1-3547-456b-af9e-632e79d69813', '33333333-0000-0000-0000-000000000012', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 45.0000, 'ml', 0.0000, 0, '2025-12-29 13:33:02.707525');
INSERT INTO public.bom_snapshots VALUES ('6d0c2467-1d86-4d94-89eb-fe965b453124', '33333333-0000-0000-0000-000000000012', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002', 150.0000, 'ml', 0.0000, 0, '2025-12-29 13:33:02.70766');
INSERT INTO public.bom_snapshots VALUES ('c714ff59-0631-4de9-bf6e-268930d9f3f0', '33333333-0000-0000-0000-000000000012', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000003', 1.0000, '个', 0.0000, 0, '2025-12-29 13:33:02.707758');
INSERT INTO public.bom_snapshots VALUES ('2ae6e454-1848-4aec-897d-8be1c8763da7', '33333333-0000-0000-0000-000000000012', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000004', 1.0000, '根', 0.0000, 0, '2025-12-29 13:33:02.707848');
INSERT INTO public.bom_snapshots VALUES ('ae1c7737-78d6-4be2-b07e-7f4788e2b654', '33333333-0000-0000-0000-000000000016', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 45.0000, 'ml', 0.0000, 0, '2025-12-29 13:33:40.663995');
INSERT INTO public.bom_snapshots VALUES ('219bb119-b96f-4cff-b35b-44cf084582fc', '33333333-0000-0000-0000-000000000016', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002', 150.0000, 'ml', 0.0000, 0, '2025-12-29 13:33:40.664039');
INSERT INTO public.bom_snapshots VALUES ('de92ceef-42d5-4437-8c66-ff6147c47f59', '33333333-0000-0000-0000-000000000016', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000003', 1.0000, '个', 0.0000, 0, '2025-12-29 13:33:40.664074');
INSERT INTO public.bom_snapshots VALUES ('79b57006-aaa4-4f2a-ba20-2f6620f8d9bc', '33333333-0000-0000-0000-000000000016', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000004', 1.0000, '根', 0.0000, 0, '2025-12-29 13:33:40.664142');
INSERT INTO public.bom_snapshots VALUES ('39fd3668-23d5-414c-a11e-84a80c03d8b0', '33333333-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 45.0000, 'ml', 0.0000, 0, '2025-12-29 13:33:54.791958');
INSERT INTO public.bom_snapshots VALUES ('e1c95ea3-eafa-43cc-969d-35607ecf6a2f', '33333333-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002', 150.0000, 'ml', 0.0000, 0, '2025-12-29 13:33:54.792052');
INSERT INTO public.bom_snapshots VALUES ('0b5f1487-8b0b-4135-8b46-dd643d1a77f6', '33333333-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000003', 1.0000, '个', 0.0000, 0, '2025-12-29 13:33:54.79211');
INSERT INTO public.bom_snapshots VALUES ('468f7ec6-589f-4154-be2d-c7d5cb1984c9', '33333333-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000004', 1.0000, '根', 0.0000, 0, '2025-12-29 13:33:54.792193');
INSERT INTO public.bom_snapshots VALUES ('91f4b0a3-2bec-46d3-89c9-9f03079e23bf', '33333333-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 45.0000, 'ml', 0.0000, 0, '2025-12-29 13:32:22.771615');
INSERT INTO public.bom_snapshots VALUES ('b10d3541-787d-437f-a69f-9d9d9ccfcef7', '33333333-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002', 150.0000, 'ml', 0.0000, 0, '2025-12-29 13:32:22.771689');
INSERT INTO public.bom_snapshots VALUES ('c39dd2c1-5c60-4b99-923d-172154f11843', '33333333-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000003', 1.0000, '个', 0.0000, 0, '2025-12-29 13:32:22.771757');
INSERT INTO public.bom_snapshots VALUES ('2cb7619d-922f-4e17-8194-efbce05a3ab5', '33333333-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000004', 1.0000, '根', 0.0000, 0, '2025-12-29 13:32:22.771911');
INSERT INTO public.bom_snapshots VALUES ('ad228839-f8f6-406c-9e82-6385fa5ca239', '33333333-0000-0000-0000-000000000011', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 45.0000, 'ml', 0.0000, 0, '2025-12-29 13:32:54.193292');
INSERT INTO public.bom_snapshots VALUES ('3518483d-2412-47e6-b67e-00d41febeeff', '33333333-0000-0000-0000-000000000011', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002', 150.0000, 'ml', 0.0000, 0, '2025-12-29 13:32:54.19335');
INSERT INTO public.bom_snapshots VALUES ('0b4997ff-9f1f-40fa-a46a-aac639ad1a1d', '33333333-0000-0000-0000-000000000011', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000003', 1.0000, '个', 0.0000, 0, '2025-12-29 13:32:54.193401');
INSERT INTO public.bom_snapshots VALUES ('4e27cec5-5e9d-45d6-8693-e792fb1943de', '33333333-0000-0000-0000-000000000011', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000004', 1.0000, '根', 0.0000, 0, '2025-12-29 13:32:54.19345');
INSERT INTO public.bom_snapshots VALUES ('626a9073-39fe-41f8-839b-42ce3ec9a86a', '33333333-0000-0000-0000-000000000017', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 45.0000, 'ml', 0.0000, 0, '2025-12-29 13:33:31.201877');
INSERT INTO public.bom_snapshots VALUES ('b33a208e-ad3d-431b-aaaa-526c8bb575bd', '33333333-0000-0000-0000-000000000017', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002', 150.0000, 'ml', 0.0000, 0, '2025-12-29 13:33:31.20193');
INSERT INTO public.bom_snapshots VALUES ('1ae4f568-102c-4246-8038-428bd09f51a2', '33333333-0000-0000-0000-000000000017', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000003', 1.0000, '个', 0.0000, 0, '2025-12-29 13:33:31.201968');
INSERT INTO public.bom_snapshots VALUES ('0ffa6499-dea1-4bf1-96ff-ae9bda1fc2af', '33333333-0000-0000-0000-000000000017', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000004', 1.0000, '根', 0.0000, 0, '2025-12-29 13:33:31.202449');
INSERT INTO public.bom_snapshots VALUES ('172c2fa4-076d-486c-9846-b1882500bfec', '33333333-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 45.0000, 'ml', 0.0000, 0, '2025-12-29 13:32:29.741705');
INSERT INTO public.bom_snapshots VALUES ('791e98d6-91ca-4e9f-b092-cf90a4c2fcd6', '33333333-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002', 150.0000, 'ml', 0.0000, 0, '2025-12-29 13:32:29.741763');
INSERT INTO public.bom_snapshots VALUES ('a4268869-6c19-4470-a556-3669764e97d7', '33333333-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000003', 1.0000, '个', 0.0000, 0, '2025-12-29 13:32:29.741816');
INSERT INTO public.bom_snapshots VALUES ('51ada1d3-8fca-4594-93b0-a51d02f11d7a', '33333333-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000004', 1.0000, '根', 0.0000, 0, '2025-12-29 13:32:29.7419');
INSERT INTO public.bom_snapshots VALUES ('b71d138e-fe15-44c1-b078-6239cad92f84', '33333333-0000-0000-0000-000000000008', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 45.0000, 'ml', 0.0000, 0, '2025-12-29 13:32:45.855782');
INSERT INTO public.bom_snapshots VALUES ('fcf0dd3f-8ed7-43c8-9111-d27edc4f8be2', '33333333-0000-0000-0000-000000000008', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002', 150.0000, 'ml', 0.0000, 0, '2025-12-29 13:32:45.855893');
INSERT INTO public.bom_snapshots VALUES ('7ac29f14-cc1b-4019-84e6-226fc6640527', '33333333-0000-0000-0000-000000000008', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000003', 1.0000, '个', 0.0000, 0, '2025-12-29 13:32:45.855983');
INSERT INTO public.bom_snapshots VALUES ('389158ef-20f3-4e06-98e2-c4fe50583bc5', '33333333-0000-0000-0000-000000000008', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000004', 1.0000, '根', 0.0000, 0, '2025-12-29 13:32:45.856064');
INSERT INTO public.bom_snapshots VALUES ('0d8ecd4e-e73c-4a22-af4f-1cb957646d9c', '33333333-0000-0000-0000-000000000013', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 45.0000, 'ml', 0.0000, 0, '2025-12-29 13:33:07.087105');
INSERT INTO public.bom_snapshots VALUES ('5f1d5f27-1791-48ae-b9d6-3d4521ce9a3e', '33333333-0000-0000-0000-000000000013', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002', 150.0000, 'ml', 0.0000, 0, '2025-12-29 13:33:07.087156');
INSERT INTO public.bom_snapshots VALUES ('4f2a100b-63ab-4f4b-be66-7a1866334fc4', '33333333-0000-0000-0000-000000000013', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000003', 1.0000, '个', 0.0000, 0, '2025-12-29 13:33:07.087205');
INSERT INTO public.bom_snapshots VALUES ('4d54cf1c-c672-46a0-b7c8-8857b1e5798a', '33333333-0000-0000-0000-000000000013', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000004', 1.0000, '根', 0.0000, 0, '2025-12-29 13:33:07.08725');
INSERT INTO public.bom_snapshots VALUES ('10079db8-eeb4-474a-9d8c-b04cd0ea5493', '33333333-0000-0000-0000-000000000015', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 45.0000, 'ml', 0.0000, 0, '2025-12-29 13:33:35.645397');
INSERT INTO public.bom_snapshots VALUES ('0b84932f-cee0-4883-b197-33bb8ca85219', '33333333-0000-0000-0000-000000000015', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002', 150.0000, 'ml', 0.0000, 0, '2025-12-29 13:33:35.645436');
INSERT INTO public.bom_snapshots VALUES ('e2e6a8e4-ddfa-4baa-9e3d-7a63ec3ba8a1', '33333333-0000-0000-0000-000000000015', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000003', 1.0000, '个', 0.0000, 0, '2025-12-29 13:33:35.645469');
INSERT INTO public.bom_snapshots VALUES ('24751dcd-fe93-4628-b06e-3db56caeb835', '33333333-0000-0000-0000-000000000015', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000004', 1.0000, '根', 0.0000, 0, '2025-12-29 13:33:35.6455');
INSERT INTO public.bom_snapshots VALUES ('1c210103-0ff0-4653-a1af-7249b0aa11ab', '33333333-0000-0000-0000-000000000007', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 45.0000, 'ml', 0.0000, 0, '2025-12-29 13:32:34.298865');
INSERT INTO public.bom_snapshots VALUES ('c8b75276-5023-4c0b-9d5d-f201e4fc5c84', '33333333-0000-0000-0000-000000000007', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002', 150.0000, 'ml', 0.0000, 0, '2025-12-29 13:32:34.298982');
INSERT INTO public.bom_snapshots VALUES ('885e0791-0d45-4466-b403-23c8245967b8', '33333333-0000-0000-0000-000000000007', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000003', 1.0000, '个', 0.0000, 0, '2025-12-29 13:32:34.299075');
INSERT INTO public.bom_snapshots VALUES ('ab14225c-d08d-4942-a58b-91f02c4afce4', '33333333-0000-0000-0000-000000000007', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000004', 1.0000, '根', 0.0000, 0, '2025-12-29 13:32:34.299242');
INSERT INTO public.bom_snapshots VALUES ('2913db0c-bcab-40ea-8470-a3b65be39744', '33333333-0000-0000-0000-000000000010', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 45.0000, 'ml', 0.0000, 0, '2025-12-29 13:32:50.028022');
INSERT INTO public.bom_snapshots VALUES ('62b3d94e-c4f2-4801-aac8-81e7fcf01966', '33333333-0000-0000-0000-000000000010', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002', 150.0000, 'ml', 0.0000, 0, '2025-12-29 13:32:50.028235');
INSERT INTO public.bom_snapshots VALUES ('6a36d11b-abcb-4587-9fbd-b9a7f291ae7f', '33333333-0000-0000-0000-000000000010', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000003', 1.0000, '个', 0.0000, 0, '2025-12-29 13:32:50.02836');
INSERT INTO public.bom_snapshots VALUES ('a7a93a98-445c-4482-bf5b-71023546aa8a', '33333333-0000-0000-0000-000000000010', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000004', 1.0000, '根', 0.0000, 0, '2025-12-29 13:32:50.028451');
INSERT INTO public.bom_snapshots VALUES ('2317446d-57a3-43ce-bd7e-a9dc9045bbe4', '33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 45.0000, 'ml', 0.0000, 1, '2025-12-29 12:14:09.234575');
INSERT INTO public.bom_snapshots VALUES ('c1a42aa7-32e4-497d-b4ff-2f4bee4543ec', '33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002', 150.0000, 'ml', 0.0000, 1, '2025-12-29 12:14:09.234575');
INSERT INTO public.bom_snapshots VALUES ('401137a2-f117-4c45-975f-35210345dfdb', '33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000003', 1.0000, '个', 0.0000, 1, '2025-12-29 12:14:09.234575');
INSERT INTO public.bom_snapshots VALUES ('71e88125-3242-45f5-9d52-c0fbdf51b15e', '33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000004', 1.0000, '根', 0.0000, 1, '2025-12-29 12:14:09.234575');
INSERT INTO public.bom_snapshots VALUES ('3b9e02b3-994f-4993-b44c-a2a4b9658bf5', '33333333-0000-0000-0000-000000000014', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 45.0000, 'ml', 0.0000, 0, '2025-12-29 13:33:27.037482');
INSERT INTO public.bom_snapshots VALUES ('4e984157-34d5-4d29-9f28-0f2005dae544', '33333333-0000-0000-0000-000000000014', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002', 150.0000, 'ml', 0.0000, 0, '2025-12-29 13:33:27.037576');
INSERT INTO public.bom_snapshots VALUES ('e3e7175c-a7eb-4259-9ac5-bf5171aa54f7', '33333333-0000-0000-0000-000000000014', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000003', 1.0000, '个', 0.0000, 0, '2025-12-29 13:33:27.037657');
INSERT INTO public.bom_snapshots VALUES ('13683810-455c-4d46-8953-a5dd1bbfd41f', '33333333-0000-0000-0000-000000000014', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000004', 1.0000, '根', 0.0000, 0, '2025-12-29 13:33:27.037734');


--
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.brands VALUES ('942e396b-8375-4ee4-bbc3-227490833839', 'BRAND001', '耀莱影院', 'Yaolai Cinema', 'own', '{影院,娱乐}', '耀莱文化', 'A', '{自营,高端}', '耀莱集团旗下高端影院品牌', NULL, 'enabled', '2025-12-25 01:16:10.657792+00', '2025-12-25 01:16:10.657792+00', 'system', 'system');
INSERT INTO public.brands VALUES ('bd5e176a-040f-4d35-87d0-541d65684116', 'BRAND002', '可口可乐', 'Coca-Cola', 'agency', '{饮料,碳酸饮品}', '可口可乐公司', 'A', '{代理,饮料}', '全球知名饮料品牌', NULL, 'enabled', '2025-12-25 01:16:10.657792+00', '2025-12-25 01:16:10.657792+00', 'system', 'system');
INSERT INTO public.brands VALUES ('348c0dcd-f070-4e14-8182-0e89602aec42', 'BRAND003', '百事可乐', 'Pepsi', 'agency', '{饮料,碳酸饮品}', '百事公司', 'A', '{代理,饮料}', '全球知名饮料品牌', NULL, 'enabled', '2025-12-25 01:16:10.657792+00', '2025-12-25 01:16:10.657792+00', 'system', 'system');
INSERT INTO public.brands VALUES ('017b1dcd-8794-4e21-83d4-0790513b91ba', 'BRAND004', '自制爆米花', 'Homemade Popcorn', 'own', '{零食,爆米花}', '耀莱影院', 'B', '{自营,零食}', '影院自制特色爆米花', NULL, 'enabled', '2025-12-25 01:16:10.657792+00', '2025-12-25 01:16:10.657792+00', 'system', 'system');
INSERT INTO public.brands VALUES ('9b9e718d-01a3-4c24-9b9a-2dd03a16a5c0', 'BRAND005', '星巴克', 'Starbucks', 'joint', '{咖啡,饮品}', '星巴克中国', 'A', '{联营,咖啡}', '全球知名咖啡连锁品牌', NULL, 'enabled', '2025-12-25 01:16:10.657792+00', '2025-12-25 01:16:10.657792+00', 'system', 'system');
INSERT INTO public.brands VALUES ('a5305db9-026d-4993-83c9-a9363fa22b8b', 'BRAND006', '通用原料', 'General Ingredients', 'own', '{原料,基础材料}', '耀莱文化', 'B', '{自营,原料}', '影院通用调酒原料品牌', NULL, 'enabled', '2025-12-25 01:34:42.591549+00', '2025-12-25 01:34:42.591549+00', NULL, NULL);
INSERT INTO public.brands VALUES ('d7026962-c0ef-47e2-9b15-275ef1c98784', 'BRAND007', '通用包材', 'General Packaging', 'own', '{包材,容器}', '耀莱文化', 'B', '{自营,包材}', '影院通用杯具包材品牌', NULL, 'enabled', '2025-12-25 01:34:42.591549+00', '2025-12-25 01:34:42.591549+00', NULL, NULL);
INSERT INTO public.brands VALUES ('485841cd-decc-402c-a081-01c6bfac30df', 'BRAND008', '自制饮品', 'Homemade Drinks', 'own', '{饮品,特调}', '耀莱文化', 'B', '{自营,饮品}', '影院自制特调饮品品牌', NULL, 'enabled', '2025-12-25 01:34:42.591549+00', '2025-12-25 01:34:42.591549+00', NULL, NULL);
INSERT INTO public.brands VALUES ('ca26d881-4663-4626-96b1-9cda00b0855d', 'BRAND009', '影院套餐', 'Cinema Combo', 'own', '{套餐,观影}', '耀莱文化', 'A', '{自营,套餐}', '影院观影套餐品牌', NULL, 'enabled', '2025-12-25 01:34:42.591549+00', '2025-12-25 01:34:42.591549+00', NULL, NULL);


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.categories VALUES ('11111111-1111-1111-1111-111111111111', 'CAT001', '酒水饮料', NULL, 1, 1, 'ACTIVE', '2025-12-26 05:28:32.919142+00', '2025-12-26 05:28:32.919142+00');
INSERT INTO public.categories VALUES ('22222222-2222-2222-2222-222222222222', 'CAT002', '零食小吃', NULL, 1, 2, 'ACTIVE', '2025-12-26 05:28:32.919142+00', '2025-12-26 05:28:32.919142+00');
INSERT INTO public.categories VALUES ('33333333-3333-3333-3333-333333333333', 'CAT003', '餐饮正餐', NULL, 1, 3, 'ACTIVE', '2025-12-26 05:28:32.919142+00', '2025-12-26 05:28:32.919142+00');
INSERT INTO public.categories VALUES ('11111111-1111-1111-1111-111111111112', 'CAT001-01', '威士忌', '11111111-1111-1111-1111-111111111111', 2, 1, 'ACTIVE', '2025-12-26 05:28:32.919142+00', '2025-12-26 05:28:32.919142+00');
INSERT INTO public.categories VALUES ('11111111-1111-1111-1111-111111111113', 'CAT001-02', '啤酒', '11111111-1111-1111-1111-111111111111', 2, 2, 'ACTIVE', '2025-12-26 05:28:32.919142+00', '2025-12-26 05:28:32.919142+00');
INSERT INTO public.categories VALUES ('11111111-1111-1111-1111-111111111114', 'CAT001-03', '软饮料', '11111111-1111-1111-1111-111111111111', 2, 3, 'ACTIVE', '2025-12-26 05:28:32.919142+00', '2025-12-26 05:28:32.919142+00');
INSERT INTO public.categories VALUES ('22222222-2222-2222-2222-222222222223', 'CAT002-01', '薯片', '22222222-2222-2222-2222-222222222222', 2, 1, 'ACTIVE', '2025-12-26 05:28:32.919142+00', '2025-12-26 05:28:32.919142+00');
INSERT INTO public.categories VALUES ('22222222-2222-2222-2222-222222222224', 'CAT002-02', '坚果', '22222222-2222-2222-2222-222222222222', 2, 2, 'ACTIVE', '2025-12-26 05:28:32.919142+00', '2025-12-26 05:28:32.919142+00');


--
-- Data for Name: category_audit_log; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: channel_product_config; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.channel_product_config VALUES ('469ab3c1-f61d-4e9a-944a-8243348d81a0', '550e8400-e29b-41d4-a716-446655440028', 'MINI_PROGRAM', '焦糖爆米花(小)', 'OTHER', 1500, NULL, NULL, '焦糖裹衣，香甜酥脆，小份更方便', '[]', false, 'ACTIVE', 90, '2026-01-05 15:11:48.37692', '2026-01-05 15:11:48.37692', NULL, '8ebd798c-f90e-4498-974f-d6bb0a8dc6e4');
INSERT INTO public.channel_product_config VALUES ('be90d12e-ba3c-47ed-8285-752aacd4ac72', '23ba9c9b-58a7-4b19-86b4-b4c65a21c189', 'MINI_PROGRAM', '威士忌可乐鸡尾酒', 'OTHER', 27, 'https://fxhgyxceqrmnpezluaht.supabase.co/storage/v1/object/public/beverage-images/channel-products/b0faf382-f14e-4b90-a114-ea832c22a5c1.jpg', NULL, NULL, '[{"name": "中杯", "type": "SIZE", "options": [{"name": "默认", "is_default": false, "sort_order": 0, "price_adjust": 0}], "required": true, "multi_select": false}]', false, 'ACTIVE', 0, '2026-01-01 22:34:40.629036', '2026-01-04 01:32:44.690722', NULL, '4c781206-054c-4df9-9b52-ea1b6a992c4f');
INSERT INTO public.channel_product_config VALUES ('1235180d-72d2-4816-8596-7efd01a4cbd5', '22222222-0000-0000-0000-000000000001', 'MINI_PROGRAM', '威士忌可乐鸡尾酒', 'OTHER', 40, NULL, NULL, NULL, '[]', false, 'ACTIVE', 0, '2026-01-05 10:23:38.344231', '2026-01-05 02:25:26.690749', '2026-01-05 10:25:26.871645', 'ca6c4f0b-eb49-4c21-b6d3-7f8893a942b7');
INSERT INTO public.channel_product_config VALUES ('00546525-43ba-4a60-8b38-b39eb9b02183', 'd89b55a7-c6bf-4633-b13b-38549338a2f5', 'MINI_PROGRAM', '鸡尾酒', 'OTHER', NULL, NULL, NULL, NULL, '[]', NULL, 'ACTIVE', NULL, '2026-01-05 10:22:49.855367', '2026-01-05 02:25:34.145125', '2026-01-05 10:25:34.229729', 'ca6c4f0b-eb49-4c21-b6d3-7f8893a942b7');
INSERT INTO public.channel_product_config VALUES ('ef064e1c-32a1-43ca-bdc8-68b5f95c2de7', '550e8400-e29b-41d4-a716-446655440024', 'MINI_PROGRAM', '听装可乐', 'OTHER', 3, NULL, NULL, NULL, '[]', false, 'ACTIVE', 0, '2026-01-05 10:55:07.813993', '2026-01-05 10:55:07.813993', NULL, 'fd02eba4-28f3-4db9-b944-c2e4421f493d');
INSERT INTO public.channel_product_config VALUES ('ca5c779a-e6b5-4db9-953d-4c59d5a43bcf', '550e8400-e29b-41d4-a716-446655440025', 'MINI_PROGRAM', '青岛啤酒', 'OTHER', 1800, NULL, NULL, '青岛经典，观影必备', '[]', false, 'ACTIVE', 85, '2026-01-05 13:30:46.906376', '2026-01-05 13:30:46.906376', NULL, 'fd02eba4-28f3-4db9-b944-c2e4421f493d');
INSERT INTO public.channel_product_config VALUES ('d8adc3b5-b8c9-4a72-9a0a-45157e8983c4', '4fb0d962-21d6-47d3-b29b-61d09569eae9', 'MINI_PROGRAM', '美式咖啡', 'OTHER', 1800, NULL, NULL, '精选阿拉比卡咖啡豆，现磨现煮，口感醇厚', '[]', true, 'ACTIVE', 100, '2026-01-05 15:10:53.470543', '2026-01-05 15:10:53.470543', NULL, 'fe36efc2-e7a0-418a-9c33-0003c7db7eea');
INSERT INTO public.channel_product_config VALUES ('8f5b60f7-7cc8-49dd-a5f4-b0997b8d9526', '550e8400-e29b-41d4-a716-446655440021', 'MINI_PROGRAM', '威士忌可乐', 'OTHER', 3800, NULL, NULL, '芥华士12年威士忌调配冰可乐，经典组合', '[]', true, 'ACTIVE', 100, '2026-01-05 15:10:59.1004', '2026-01-05 15:10:59.1004', NULL, '7dd4a9d2-544d-4648-b901-a1e797e62075');
INSERT INTO public.channel_product_config VALUES ('eb5ba0e4-b532-46aa-b0aa-1d1b04579d63', '550e8400-e29b-41d4-a716-446655440022', 'MINI_PROGRAM', '薄荷威士忌', 'OTHER', 4200, NULL, NULL, '新鲜薄荷叶点缀，清凉爽口', '[]', true, 'ACTIVE', 95, '2026-01-05 15:11:04.907309', '2026-01-05 15:11:04.907309', NULL, '7dd4a9d2-544d-4648-b901-a1e797e62075');
INSERT INTO public.channel_product_config VALUES ('9200aaab-a7db-4326-b2a0-57c2fdf1382d', '550e8400-e29b-41d4-a716-446655440023', 'MINI_PROGRAM', '冰镇可乐', 'OTHER', 1200, NULL, NULL, '现调可乐糖浆，加冰爽口', '[]', false, 'ACTIVE', 70, '2026-01-05 15:11:11.38533', '2026-01-05 15:11:11.38533', NULL, '7dd4a9d2-544d-4648-b901-a1e797e62075');
INSERT INTO public.channel_product_config VALUES ('b84dc276-01d7-4e0c-976c-5be8afafcc20', '550e8400-e29b-41d4-a716-446655440026', 'MINI_PROGRAM', '奶油爆米花(大)', 'OTHER', 2500, NULL, NULL, '现爆香脆，黄油飘香，观影经典搭配', '[]', true, 'ACTIVE', 100, '2026-01-05 15:11:41.946267', '2026-01-05 15:11:41.946267', NULL, '8ebd798c-f90e-4498-974f-d6bb0a8dc6e4');


--
-- Data for Name: combo_items; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.combo_items VALUES ('bffa85d3-24e6-4614-8c6c-beabfd148753', '550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440021', 1.000, '杯', 29.93, 1, '2025-12-24 14:21:32.899938');
INSERT INTO public.combo_items VALUES ('b0918dc3-78a3-4828-a926-b4a1be1fba46', '550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440026', 1.000, '桶', 15.86, 2, '2025-12-24 14:21:32.899938');
INSERT INTO public.combo_items VALUES ('2d92ab8f-6d54-451e-a846-e1daf1812039', '550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440023', 1.000, '杯', 2.73, 3, '2025-12-24 14:21:32.899938');
INSERT INTO public.combo_items VALUES ('5fcfbddf-b87f-4009-aa12-61fb06edfab7', '550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440021', 2.000, '杯', 29.93, 1, '2025-12-24 14:21:32.899938');
INSERT INTO public.combo_items VALUES ('e4b71d34-b1ee-482c-8f49-949a81dd6a85', '550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440026', 1.000, '桶', 15.86, 2, '2025-12-24 14:21:32.899938');
INSERT INTO public.combo_items VALUES ('359c4921-67c3-44cf-b8eb-95c5811616b9', '550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440027', 1.000, '桶', 15.75, 3, '2025-12-24 14:21:32.899938');
INSERT INTO public.combo_items VALUES ('4bf44f81-b13d-44bc-9e16-41bfee2c3ba9', '550e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440021', 1.000, '杯', 29.93, 1, '2025-12-24 14:21:32.899938');
INSERT INTO public.combo_items VALUES ('55b629a6-77e4-43a7-b7d5-083fab475442', '550e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440022', 1.000, '杯', 27.72, 2, '2025-12-24 14:21:32.899938');
INSERT INTO public.combo_items VALUES ('03c057b4-516e-44dd-b6a9-abd0f1804fff', '550e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440023', 1.000, '杯', 2.73, 3, '2025-12-24 14:21:32.899938');
INSERT INTO public.combo_items VALUES ('1fe207f3-3f43-4a3d-9532-85a9122ca4cb', 'ee27ec31-0b25-4f13-8173-6a6707c8275d', '23ba9c9b-58a7-4b19-86b4-b4c65a21c189', 2.000, '份', 27.10, 0, '2025-12-25 08:14:38.254709');
INSERT INTO public.combo_items VALUES ('905ed67c-e683-4729-a465-1225263436fa', 'ee27ec31-0b25-4f13-8173-6a6707c8275d', '95667979-e926-471c-9935-7624ae91a661', 1.000, '份', 0.00, 1, '2025-12-25 08:14:38.86017');


--
-- Data for Name: flyway_schema_history; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.flyway_schema_history VALUES (1, '0', '<< Flyway Baseline >>', 'BASELINE', '<< Flyway Baseline >>', NULL, 'postgres', '2025-12-21 07:52:32.114636', 0, true);
INSERT INTO public.flyway_schema_history VALUES (8, '016.001', 'create reservation settings', 'SQL', 'V016_001__create_reservation_settings.sql', -1067595472, 'postgres', '2025-12-22 10:41:50.061324', 5454, true);
INSERT INTO public.flyway_schema_history VALUES (9, '022.001', 'store crud extension', 'SQL', 'V022_001__store_crud_extension.sql', 291202387, 'postgres', '2025-12-22 14:20:54.711192', 3919, true);
INSERT INTO public.flyway_schema_history VALUES (10, '023.001', 'store add cinema fields', 'SQL', 'V023_001__store_add_cinema_fields.sql', 1929692501, 'postgres', '2025-12-23 07:04:24.255446', 3366, true);
INSERT INTO public.flyway_schema_history VALUES (11, '024.001', 'import yaolai cinema data', 'SQL', 'V024_001__import_yaolai_cinema_data.sql', 1189587144, 'postgres', '2025-12-23 07:04:31.064509', 21182, true);
INSERT INTO public.flyway_schema_history VALUES (12, '025', 'create reservation tables', 'SQL', 'V025__create_reservation_tables.sql', -329318032, 'postgres', '2025-12-23 10:32:29.922659', 9174, true);
INSERT INTO public.flyway_schema_history VALUES (13, '026', 'create skus table', 'SQL', 'V026__create_skus_table.sql', 1181485818, 'postgres', '2025-12-24 14:21:08.026034', 4207, true);
INSERT INTO public.flyway_schema_history VALUES (14, '027', 'create bom combo tables', 'SQL', 'V027__create_bom_combo_tables.sql', -344393142, 'postgres', '2025-12-24 14:21:15.592691', 6521, true);
INSERT INTO public.flyway_schema_history VALUES (15, '028', 'create unit conversions', 'SQL', 'V028__create_unit_conversions.sql', -528776197, 'postgres', '2025-12-24 14:21:25.324415', 3473, true);
INSERT INTO public.flyway_schema_history VALUES (16, '029', 'insert test data', 'SQL', 'V029__insert_test_data.sql', -694862417, 'postgres', '2025-12-24 14:21:31.904726', 4414, true);
INSERT INTO public.flyway_schema_history VALUES (17, '030', 'create spus table', 'SQL', 'V030__create_spus_table.sql', -311926538, 'postgres', '2025-12-25 00:50:53.046153', 6497, true);
INSERT INTO public.flyway_schema_history VALUES (18, '031', 'update spu specifications', 'SQL', 'V031__update_spu_specifications.sql', 1379008129, 'postgres', '2025-12-25 01:04:53.424883', 2187, true);
INSERT INTO public.flyway_schema_history VALUES (19, '032', 'create brands table', 'SQL', 'V032__create_brands_table.sql', -314764095, 'postgres', '2025-12-25 01:16:09.701712', 5361, true);
INSERT INTO public.flyway_schema_history VALUES (20, '033', 'create store inventory', 'SQL', 'V033__create_store_inventory.sql', 1800755238, 'postgres', '2025-12-26 05:28:31.838434', 5055, true);
INSERT INTO public.flyway_schema_history VALUES (21, '034', 'insert test inventory data', 'SQL', 'V034__insert_test_inventory_data.sql', -1599714968, 'postgres', '2025-12-26 09:42:29.990516', 3349, true);
INSERT INTO public.flyway_schema_history VALUES (22, '035', 'create inventory adjustment tables', 'SQL', 'V035__create_inventory_adjustment_tables.sql', 1429932323, 'postgres', '2025-12-26 09:42:36.681355', 13582, true);
INSERT INTO public.flyway_schema_history VALUES (23, '038', 'create product orders tables', 'SQL', 'V038__create_product_orders_tables.sql', 236010777, 'postgres', '2025-12-27 08:56:03.903643', 5696, true);
INSERT INTO public.flyway_schema_history VALUES (24, '039', 'create beverages', 'SQL', 'V039__create_beverages.sql', -2107567430, 'postgres', '2025-12-27 12:54:38.686612', 3857, true);
INSERT INTO public.flyway_schema_history VALUES (25, '040', 'create beverage specs', 'SQL', 'V040__create_beverage_specs.sql', 400937586, 'postgres', '2025-12-27 12:54:45.776322', 2914, true);
INSERT INTO public.flyway_schema_history VALUES (26, '041', 'create beverage recipes', 'SQL', 'V041__create_beverage_recipes.sql', -346548446, 'postgres', '2025-12-27 12:54:51.574322', 2585, true);
INSERT INTO public.flyway_schema_history VALUES (27, '042', 'create recipe ingredients', 'SQL', 'V042__create_recipe_ingredients.sql', -746527326, 'postgres', '2025-12-27 12:54:57.041415', 2818, true);
INSERT INTO public.flyway_schema_history VALUES (28, '043', 'create beverage orders', 'SQL', 'V043__create_beverage_orders.sql', -1135033914, 'postgres', '2025-12-27 12:58:03.507991', 5401, true);
INSERT INTO public.flyway_schema_history VALUES (29, '044', 'create beverage order items', 'SQL', 'V044__create_beverage_order_items.sql', 2145218386, 'postgres', '2025-12-27 12:58:12.049955', 3761, true);
INSERT INTO public.flyway_schema_history VALUES (30, '045', 'create queue numbers', 'SQL', 'V045__create_queue_numbers.sql', -1572128940, 'postgres', '2025-12-27 12:58:18.658124', 3762, true);
INSERT INTO public.flyway_schema_history VALUES (31, '046', 'create order status logs', 'SQL', 'V046__create_order_status_logs.sql', -1973754658, 'postgres', '2025-12-27 12:58:25.268994', 2828, true);
INSERT INTO public.flyway_schema_history VALUES (32, '047', 'create indexes', 'SQL', 'V047__create_indexes.sql', -844195884, 'postgres', '2025-12-27 12:58:30.945942', 937, true);
INSERT INTO public.flyway_schema_history VALUES (33, '048', 'alter beverage recipes columns', 'SQL', 'V048__alter_beverage_recipes_columns.sql', -664132380, 'postgres', '2025-12-28 04:44:55.933024', 3438, true);
INSERT INTO public.flyway_schema_history VALUES (34, '049', 'alter recipe ingredients sku id type', 'SQL', 'V049__alter_recipe_ingredients_sku_id_type.sql', -1993556968, 'postgres', '2025-12-28 05:14:52.759735', 1521, true);
INSERT INTO public.flyway_schema_history VALUES (35, '050', 'add missing columns to recipe ingredients', 'SQL', 'V050__add_missing_columns_to_recipe_ingredients.sql', -1912434025, 'postgres', '2025-12-28 05:52:37.461014', 2297, true);
INSERT INTO public.flyway_schema_history VALUES (36, '051', 'add customer note to order items', 'SQL', 'V051__add_customer_note_to_order_items.sql', 435786591, 'postgres', '2025-12-28 11:04:46.559907', 1635, true);
INSERT INTO public.flyway_schema_history VALUES (37, '052', 'fix queue numbers status constraint', 'SQL', 'V052__fix_queue_numbers_status_constraint.sql', -1611000380, 'postgres', '2025-12-28 12:00:51.095245', 1751, true);
INSERT INTO public.flyway_schema_history VALUES (38, '053', 'add order type discriminator', 'SQL', 'V053__add_order_type_discriminator.sql', -567677787, 'postgres', '2025-12-28 12:24:27.946879', 3523, true);
INSERT INTO public.flyway_schema_history VALUES (39, '007', 'rename background image url to image', 'SQL', 'V007__rename_background_image_url_to_image.sql', -253333352, 'postgres', '2025-12-29 05:02:09.352516', 1553, true);
INSERT INTO public.flyway_schema_history VALUES (2, '1', 'create skus table', 'SQL', 'V1__create_scenario_packages.sql', -1089562550, 'postgres', '2025-12-21 07:52:37.34929', 7597, true);
INSERT INTO public.flyway_schema_history VALUES (3, '2', 'create bom combo tables', 'SQL', 'V2__add_taro_frontend_fields.sql', -1629251614, 'postgres', '2025-12-21 07:52:48.122476', 3138, true);
INSERT INTO public.flyway_schema_history VALUES (4, '3', 'create unit test data', 'SQL', 'V3__insert_test_scenario_packages.sql', -1855316699, 'postgres', '2025-12-21 07:52:54.406695', 2340, true);
INSERT INTO public.flyway_schema_history VALUES (5, '4', 'create scenario packages', 'SQL', 'V4__rename_background_image_url_to_image.sql', -850420922, 'postgres', '2025-12-21 08:45:25.59747', 1594, true);
INSERT INTO public.flyway_schema_history VALUES (6, '5', 'add taro frontend fields', 'SQL', 'V5__add_store_associations.sql', 1867322405, 'postgres', '2025-12-21 11:55:36.691012', 3656, true);
INSERT INTO public.flyway_schema_history VALUES (7, '6', 'insert test scenario packages', 'SQL', 'V6__add_store_address_fields.sql', -678255572, 'postgres', '2025-12-22 01:24:41.658632', 3632, true);
INSERT INTO public.flyway_schema_history VALUES (40, '007', 'rename background image url to image', 'SQL', 'V007__rename_background_image_url_to_image.sql', 0, 'postgres', '2025-12-29 05:04:14.926765', 0, true);
INSERT INTO public.flyway_schema_history VALUES (41, '008', 'add store associations', 'SQL', 'V008__add_store_associations.sql', 0, 'postgres', '2025-12-29 05:04:14.926765', 0, true);
INSERT INTO public.flyway_schema_history VALUES (42, '009', 'add store address fields', 'SQL', 'V009__add_store_address_fields.sql', 0, 'postgres', '2025-12-29 05:04:14.926765', 0, true);
INSERT INTO public.flyway_schema_history VALUES (43, '010', 'create package tiers and addons', 'SQL', 'V010__create_package_tiers_and_addons.sql', 0, 'postgres', '2025-12-29 05:04:14.926765', 0, true);
INSERT INTO public.flyway_schema_history VALUES (44, '011', 'insert proposal package data', 'SQL', 'V011__insert_proposal_package_data.sql', 0, 'postgres', '2025-12-29 05:04:14.926765', 0, true);
INSERT INTO public.flyway_schema_history VALUES (45, '012', 'create time slot overrides', 'SQL', 'V012__create_time_slot_overrides.sql', 0, 'postgres', '2025-12-29 05:04:14.926765', 0, true);
INSERT INTO public.flyway_schema_history VALUES (46, '054', 'p005 manual setup', 'SQL', 'V054__p005_manual_setup.sql', -797420939, 'postgres', '2025-12-29 05:05:59.411354', 3996, true);
INSERT INTO public.flyway_schema_history VALUES (47, '055', 'add inventory reserved quantity', 'SQL', 'V055__add_inventory_reserved_quantity.sql', 368271413, 'postgres', '2025-12-29 05:06:33.607895', 2671, true);
INSERT INTO public.flyway_schema_history VALUES (48, '058', 'create inventory reservations', 'SQL', 'V058__create_inventory_reservations.sql', 2095762086, 'postgres', '2025-12-29 05:07:57.908702', 3084, true);
INSERT INTO public.flyway_schema_history VALUES (49, '059', 'create bom snapshots', 'SQL', 'V059__create_bom_snapshots.sql', 1712209969, 'postgres', '2025-12-29 05:09:55.759795', 2333, true);
INSERT INTO public.flyway_schema_history VALUES (50, '060', 'extend inventory transactions', 'SQL', 'V060__extend_inventory_transactions.sql', -500800055, 'postgres', '2025-12-29 05:10:34.168596', 2086, true);
INSERT INTO public.flyway_schema_history VALUES (51, '061', 'add version to skus', 'SQL', 'V061__add_version_to_skus.sql', 1909094550, 'postgres', '2025-12-31 02:15:30.702399', 2305, true);
INSERT INTO public.flyway_schema_history VALUES (52, '062', 'create beverage sku mapping table', 'SQL', 'V062__create_beverage_sku_mapping_table.sql', -1798353819, 'postgres', '2025-12-31 09:43:53.754011', 4646, true);
INSERT INTO public.flyway_schema_history VALUES (53, '063', 'add bom finished product type constraint', 'SQL', 'V063__add_bom_finished_product_type_constraint.sql', -1330955919, 'postgres', '2025-12-31 09:44:03.221777', 2976, true);
INSERT INTO public.flyway_schema_history VALUES (54, '064', 'migrate beverages to skus', 'SQL', 'V064__migrate_beverages_to_skus.sql', -908029262, 'postgres', '2025-12-31 09:46:19.137712', 2842, true);
INSERT INTO public.flyway_schema_history VALUES (55, '2026.01.01.001', 'create channel product config', 'SQL', 'V2026_01_01_001__create_channel_product_config.sql', -732212357, 'postgres', '2026-01-01 11:10:28.245027', 11007, true);
INSERT INTO public.flyway_schema_history VALUES (56, '2026.01.01.002', 'fix soft delete unique constraint', 'SQL', 'V2026_01_01_002__fix_soft_delete_unique_constraint.sql', -957495673, 'postgres', '2026-01-01 14:00:13.617479', 2520, true);
INSERT INTO public.flyway_schema_history VALUES (57, '2026.01.03.001', 'add menu category', 'SQL', 'V2026_01_03_001__add_menu_category.sql', -2144991082, 'postgres', '2026-01-04 01:32:25.259119', 12577, true);
INSERT INTO public.flyway_schema_history VALUES (58, '2026.01.03.002', 'migrate category data', 'SQL', 'V2026_01_03_002__migrate_category_data.sql', -1472419175, 'postgres', '2026-01-04 01:32:43.110219', 6310, true);
INSERT INTO public.flyway_schema_history VALUES (59, '2026.01.04.001', 'add version column to menu category', 'SQL', 'V2026_01_04_001__add_version_column_to_menu_category.sql', -1915785821, 'postgres', '2026-01-04 07:56:03.622912', 8695, true);


--
-- Data for Name: halls; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.halls VALUES ('569cdeae-5c28-4a4d-82e6-92eba281c2f9', '11111111-1111-1111-1111-111111111111', 'HALL-A01', 'VIP豪华厅A', 'VIP', 80, '{真皮沙发,4K投影,杜比音响}', 'active', '2025-12-17 13:15:53.749629+00', '2025-12-17 13:15:53.749629+00');
INSERT INTO public.halls VALUES ('ea5fbdee-8050-48d5-9a3b-e54d7402216a', '11111111-1111-1111-1111-111111111111', 'HALL-B01', '情侣专属厅B', 'CP', 40, '{双人沙发,玫瑰装饰}', 'active', '2025-12-17 13:15:53.749629+00', '2025-12-17 13:15:53.749629+00');
INSERT INTO public.halls VALUES ('05c96e5b-6bed-4cd8-a677-e8ee0b836225', '11111111-1111-1111-1111-111111111111', 'HALL-C01', '派对狂欢厅C', 'PARTY', 60, '{KTV设备,酒吧台,彩灯}', 'active', '2025-12-17 13:15:53.749629+00', '2025-12-17 13:15:53.749629+00');
INSERT INTO public.halls VALUES ('4b79cbfd-db93-4d52-9699-cf50cd72d2b2', '11111111-1111-1111-1111-111111111111', 'HALL-D01', '普通观影厅D', 'PUBLIC', 150, '{标准座椅}', 'active', '2025-12-17 13:15:53.749629+00', '2025-12-17 13:15:53.749629+00');
INSERT INTO public.halls VALUES ('89852383-cf47-4d44-8319-a7380c8c6b81', '22222222-2222-2222-2222-222222222222', 'HALL-A01', 'VIP至尊厅', 'VIP', 100, '{按摩座椅,IMAX屏幕}', 'active', '2025-12-17 13:15:53.749629+00', '2025-12-17 13:15:53.749629+00');
INSERT INTO public.halls VALUES ('fbf0fc92-7812-4836-93e0-11ccda601680', '22222222-2222-2222-2222-222222222222', 'HALL-B01', '普通厅B', 'PUBLIC', 200, '{标准座椅}', 'active', '2025-12-17 13:15:53.749629+00', '2025-12-17 13:15:53.749629+00');
INSERT INTO public.halls VALUES ('fa7364f0-91b6-4f9c-970c-8038003db9ea', '22222222-2222-2222-2222-222222222222', 'HALL-C01', '维护中厅C', 'PUBLIC', 180, '{}', 'maintenance', '2025-12-17 13:15:53.749629+00', '2025-12-17 13:15:53.749629+00');
INSERT INTO public.halls VALUES ('3042ca88-0a74-4d91-8ccc-6bc940e3de8e', '33333333-3333-3333-3333-333333333333', 'HALL-A01', '停业影厅A', 'PUBLIC', 120, '{}', 'inactive', '2025-12-17 13:15:53.749629+00', '2025-12-17 13:15:53.749629+00');
INSERT INTO public.halls VALUES ('326c8768-ed3f-4e00-a9ed-89f6365afbe4', 'b6684b23-3587-4602-9f54-695cb9527424', 'HALL-WKS-01', '杜比影院', 'VIP', 200, '{"Dolby Cinema",杜比全景声,杜比视界,激光放映}', 'active', '2025-12-23 00:54:32.209006+00', '2025-12-23 00:54:32.209006+00');
INSERT INTO public.halls VALUES ('ec9746f7-9db5-480c-b78b-31660bd600f6', 'b6684b23-3587-4602-9f54-695cb9527424', 'HALL-WKS-02', '4DX动感厅', 'VIP', 120, '{4DX,动感座椅,特效影厅,沉浸式}', 'active', '2025-12-23 00:54:32.209006+00', '2025-12-23 00:54:32.209006+00');
INSERT INTO public.halls VALUES ('c0eb0e68-21c5-4e2d-878d-4b602112331f', 'b6684b23-3587-4602-9f54-695cb9527424', 'HALL-WKS-03', '120帧4K巨幕厅', 'VIP', 350, '{120帧,4K,巨幕,高帧率}', 'active', '2025-12-23 00:54:32.209006+00', '2025-12-23 00:54:32.209006+00');
INSERT INTO public.halls VALUES ('b91e8624-1a6d-47d4-9ea1-d9b08ad9ee83', 'b6684b23-3587-4602-9f54-695cb9527424', 'HALL-WKS-04', '激光厅1号', 'PUBLIC', 250, '{激光放映,高亮度,超清}', 'active', '2025-12-23 00:54:32.209006+00', '2025-12-23 00:54:32.209006+00');
INSERT INTO public.halls VALUES ('ea0a962e-6f8f-44e4-8381-f441ebc8db34', 'b6684b23-3587-4602-9f54-695cb9527424', 'HALL-WKS-05', '激光厅2号', 'PUBLIC', 230, '{激光放映,高亮度}', 'active', '2025-12-23 00:54:32.209006+00', '2025-12-23 00:54:32.209006+00');
INSERT INTO public.halls VALUES ('7e49131c-df89-4c0d-a5f6-e27b33d51de5', 'b6684b23-3587-4602-9f54-695cb9527424', 'HALL-WKS-06', '激光厅3号', 'PUBLIC', 220, '{激光放映}', 'active', '2025-12-23 00:54:32.209006+00', '2025-12-23 00:54:32.209006+00');
INSERT INTO public.halls VALUES ('970e3808-5577-4a46-8baa-b9b7849e52c1', 'b6684b23-3587-4602-9f54-695cb9527424', 'HALL-WKS-07', 'VIP贵宾厅1号', 'VIP', 30, '{VIP尊享,真皮沙发,私密空间}', 'active', '2025-12-23 00:54:32.209006+00', '2025-12-23 00:54:32.209006+00');
INSERT INTO public.halls VALUES ('020eb610-c9eb-4aa2-b4e7-0edad0d25e82', 'b6684b23-3587-4602-9f54-695cb9527424', 'HALL-WKS-08', 'VIP贵宾厅2号', 'VIP', 28, '{VIP尊享,真皮沙发}', 'active', '2025-12-23 00:54:32.209006+00', '2025-12-23 00:54:32.209006+00');
INSERT INTO public.halls VALUES ('cecb3cae-530d-40f7-87d4-905081ce1b63', 'b6684b23-3587-4602-9f54-695cb9527424', 'HALL-WKS-09', '情侣厅', 'CP', 24, '{情侣座,浪漫氛围}', 'active', '2025-12-23 00:54:32.209006+00', '2025-12-23 00:54:32.209006+00');
INSERT INTO public.halls VALUES ('cdddc66f-f001-45a7-b334-de45c88d3ee9', 'b6684b23-3587-4602-9f54-695cb9527424', 'HALL-WKS-10', '派对厅', 'PARTY', 60, '{团建,KTV,游戏设备}', 'active', '2025-12-23 00:54:32.209006+00', '2025-12-23 00:54:32.209006+00');
INSERT INTO public.halls VALUES ('2ae113a8-7d5c-4bde-9438-a89b6020f51b', 'b6684b23-3587-4602-9f54-695cb9527424', 'HALL-WKS-11', '多功能厅', 'PARTY', 100, '{会议,路演,发布会}', 'active', '2025-12-23 00:54:32.209006+00', '2025-12-23 00:54:32.209006+00');
INSERT INTO public.halls VALUES ('f47900d6-636b-484a-8ca5-57d059d78b1a', 'b6684b23-3587-4602-9f54-695cb9527424', 'HALL-WKS-12', '普通厅1号', 'PUBLIC', 200, '{数字放映,标准影厅}', 'active', '2025-12-23 00:54:32.209006+00', '2025-12-23 00:54:32.209006+00');
INSERT INTO public.halls VALUES ('5f02f435-94de-4a5c-a156-e010cfe9b787', 'b6684b23-3587-4602-9f54-695cb9527424', 'HALL-WKS-13', '普通厅2号', 'PUBLIC', 190, '{数字放映,标准影厅}', 'active', '2025-12-23 00:54:32.209006+00', '2025-12-23 00:54:32.209006+00');
INSERT INTO public.halls VALUES ('390c2187-714f-4adf-ae74-d1f3ec14a18d', 'b6684b23-3587-4602-9f54-695cb9527424', 'HALL-WKS-14', '普通厅3号', 'PUBLIC', 180, '{数字放映,标准影厅}', 'active', '2025-12-23 00:54:32.209006+00', '2025-12-23 00:54:32.209006+00');
INSERT INTO public.halls VALUES ('5610e4b1-6de6-4696-bf32-f2c8e297635e', 'b6684b23-3587-4602-9f54-695cb9527424', 'HALL-WKS-15', '普通厅4号', 'PUBLIC', 170, '{数字放映,标准影厅}', 'active', '2025-12-23 00:54:32.209006+00', '2025-12-23 00:54:32.209006+00');
INSERT INTO public.halls VALUES ('a71289b1-46e7-49f2-a912-7295dd73bf9b', 'b6684b23-3587-4602-9f54-695cb9527424', 'HALL-WKS-16', '普通厅5号', 'PUBLIC', 160, '{数字放映,标准影厅}', 'active', '2025-12-23 00:54:32.209006+00', '2025-12-23 00:54:32.209006+00');
INSERT INTO public.halls VALUES ('706aa721-44cf-4c17-a5a1-5b6c3b3f3d10', 'b6684b23-3587-4602-9f54-695cb9527424', 'HALL-WKS-17', '普通厅6号', 'PUBLIC', 158, '{数字放映,标准影厅}', 'active', '2025-12-23 00:54:32.209006+00', '2025-12-23 00:54:32.209006+00');
INSERT INTO public.halls VALUES ('e10fdb9f-8c49-4782-9190-b0d5cbf9e392', '70e95860-fb84-487b-96a3-a12de8f6aca6', 'HALL-CYS-01', '4DX动感厅', 'VIP', 100, '{4DX,动感座椅,特效影厅}', 'active', '2025-12-23 00:55:06.895408+00', '2025-12-23 00:55:06.895408+00');
INSERT INTO public.halls VALUES ('2ffdefd2-19f2-4e33-b737-cde4b804cd9a', '70e95860-fb84-487b-96a3-a12de8f6aca6', 'HALL-CYS-02', 'VIP贵宾厅', 'VIP', 25, '{VIP尊享,真皮沙发}', 'active', '2025-12-23 00:55:06.895408+00', '2025-12-23 00:55:06.895408+00');
INSERT INTO public.halls VALUES ('1a6cf879-4986-4442-9069-646c096570a4', '70e95860-fb84-487b-96a3-a12de8f6aca6', 'HALL-CYS-03', '普通厅1号', 'PUBLIC', 170, '{数字放映,标准影厅}', 'active', '2025-12-23 00:55:06.895408+00', '2025-12-23 00:55:06.895408+00');
INSERT INTO public.halls VALUES ('b3f613e9-95c1-45f1-b184-28e0a65c755f', '70e95860-fb84-487b-96a3-a12de8f6aca6', 'HALL-CYS-04', '普通厅2号', 'PUBLIC', 160, '{数字放映,标准影厅}', 'active', '2025-12-23 00:55:06.895408+00', '2025-12-23 00:55:06.895408+00');
INSERT INTO public.halls VALUES ('22614ea6-5d24-4123-ae3f-29d9e5bb1169', '70e95860-fb84-487b-96a3-a12de8f6aca6', 'HALL-CYS-05', '普通厅3号', 'PUBLIC', 156, '{数字放映,标准影厅}', 'active', '2025-12-23 00:55:06.895408+00', '2025-12-23 00:55:06.895408+00');
INSERT INTO public.halls VALUES ('30a4b206-fe71-49d8-992e-3f5980d80449', '300a4f9b-e1f7-4edf-a5e2-4b52d005ab84', 'HALL-XHM-01', '4DX动感厅', 'VIP', 95, '{4DX,动感座椅,特效影厅}', 'active', '2025-12-23 00:55:06.895408+00', '2025-12-23 00:55:06.895408+00');
INSERT INTO public.halls VALUES ('fb28231e-4791-44dc-a658-031d5c4524dc', '300a4f9b-e1f7-4edf-a5e2-4b52d005ab84', 'HALL-XHM-02', '60帧高帧率厅', 'VIP', 180, '{60帧,高帧率,超清}', 'active', '2025-12-23 00:55:06.895408+00', '2025-12-23 00:55:06.895408+00');
INSERT INTO public.halls VALUES ('2ed79c7f-b2ab-48b4-9a67-d66fd04d831d', '300a4f9b-e1f7-4edf-a5e2-4b52d005ab84', 'HALL-XHM-03', 'VIP贵宾厅', 'VIP', 28, '{VIP尊享,真皮沙发}', 'active', '2025-12-23 00:55:06.895408+00', '2025-12-23 00:55:06.895408+00');
INSERT INTO public.halls VALUES ('972cb063-fb9d-4ab0-a98e-b5f4e7d9c98f', '300a4f9b-e1f7-4edf-a5e2-4b52d005ab84', 'HALL-XHM-04', '普通厅1号', 'PUBLIC', 180, '{数字放映,标准影厅}', 'active', '2025-12-23 00:55:06.895408+00', '2025-12-23 00:55:06.895408+00');
INSERT INTO public.halls VALUES ('20c1607b-f2d7-4276-b82d-a8474603a17c', '300a4f9b-e1f7-4edf-a5e2-4b52d005ab84', 'HALL-XHM-05', '普通厅2号', 'PUBLIC', 175, '{数字放映,标准影厅}', 'active', '2025-12-23 00:55:06.895408+00', '2025-12-23 00:55:06.895408+00');
INSERT INTO public.halls VALUES ('ffe6273b-22f9-4687-a223-29b6769ca681', '300a4f9b-e1f7-4edf-a5e2-4b52d005ab84', 'HALL-XHM-06', '普通厅3号', 'PUBLIC', 168, '{数字放映,标准影厅}', 'active', '2025-12-23 00:55:06.895408+00', '2025-12-23 00:55:06.895408+00');
INSERT INTO public.halls VALUES ('2914084f-cec1-4cf3-9582-3ad66277c6ab', '300a4f9b-e1f7-4edf-a5e2-4b52d005ab84', 'HALL-XHM-07', '普通厅4号', 'PUBLIC', 160, '{数字放映,标准影厅}', 'active', '2025-12-23 00:55:06.895408+00', '2025-12-23 00:55:06.895408+00');
INSERT INTO public.halls VALUES ('0ea6b848-2e05-46c4-8b85-4280897df2ee', '300a4f9b-e1f7-4edf-a5e2-4b52d005ab84', 'HALL-XHM-08', '普通厅5号', 'PUBLIC', 155, '{数字放映,标准影厅}', 'active', '2025-12-23 00:55:06.895408+00', '2025-12-23 00:55:06.895408+00');
INSERT INTO public.halls VALUES ('4d8d5f33-4d99-4614-82f0-b1e64cc84573', '300a4f9b-e1f7-4edf-a5e2-4b52d005ab84', 'HALL-XHM-09', '普通厅6号', 'PUBLIC', 150, '{数字放映,标准影厅}', 'active', '2025-12-23 00:55:06.895408+00', '2025-12-23 00:55:06.895408+00');
INSERT INTO public.halls VALUES ('b4897448-cedb-4426-8840-19ed702cc5ff', '300a4f9b-e1f7-4edf-a5e2-4b52d005ab84', 'HALL-XHM-10', '情侣厅', 'CP', 20, '{情侣座,浪漫氛围}', 'active', '2025-12-23 00:55:06.895408+00', '2025-12-23 00:55:06.895408+00');
INSERT INTO public.halls VALUES ('e2fbbeee-7cbd-4431-ab94-aef727847fc7', '470e05da-aeae-4d29-9157-254efe83e5e2', 'HALL-MLD-01', 'VIP贵宾厅', 'VIP', 28, '{VIP尊享,真皮沙发}', 'active', '2025-12-23 00:55:06.895408+00', '2025-12-23 00:55:06.895408+00');
INSERT INTO public.halls VALUES ('8f708507-b621-4fee-b6b7-94aec24d51be', '470e05da-aeae-4d29-9157-254efe83e5e2', 'HALL-MLD-02', '普通厅1号', 'PUBLIC', 130, '{数字放映,标准影厅}', 'active', '2025-12-23 00:55:06.895408+00', '2025-12-23 00:55:06.895408+00');
INSERT INTO public.halls VALUES ('d939e92d-8c75-4039-9b5c-b7e07f4ae24f', '470e05da-aeae-4d29-9157-254efe83e5e2', 'HALL-MLD-03', '普通厅2号', 'PUBLIC', 125, '{数字放映,标准影厅}', 'active', '2025-12-23 00:55:06.895408+00', '2025-12-23 00:55:06.895408+00');
INSERT INTO public.halls VALUES ('a8683740-33e1-4eb3-b2f3-f9087a8fd060', '470e05da-aeae-4d29-9157-254efe83e5e2', 'HALL-MLD-04', '普通厅3号', 'PUBLIC', 120, '{数字放映,标准影厅}', 'active', '2025-12-23 00:55:06.895408+00', '2025-12-23 00:55:06.895408+00');
INSERT INTO public.halls VALUES ('7da0a586-8072-43d0-bfe6-2eb4b874c0ee', '470e05da-aeae-4d29-9157-254efe83e5e2', 'HALL-MLD-05', '普通厅4号', 'PUBLIC', 115, '{数字放映,标准影厅}', 'active', '2025-12-23 00:55:06.895408+00', '2025-12-23 00:55:06.895408+00');
INSERT INTO public.halls VALUES ('a4512dbc-84c5-4c4d-8af8-2803e7efa8fc', '470e05da-aeae-4d29-9157-254efe83e5e2', 'HALL-MLD-06', '普通厅5号', 'PUBLIC', 110, '{数字放映,标准影厅}', 'active', '2025-12-23 00:55:06.895408+00', '2025-12-23 00:55:06.895408+00');
INSERT INTO public.halls VALUES ('65d7de99-8bf4-4173-a408-c0e8ef61eb14', '470e05da-aeae-4d29-9157-254efe83e5e2', 'HALL-MLD-07', '情侣厅', 'CP', 20, '{情侣座,浪漫氛围}', 'active', '2025-12-23 00:55:06.895408+00', '2025-12-23 00:55:06.895408+00');
INSERT INTO public.halls VALUES ('e95a44da-f3ad-46a4-91fc-8e6130abb198', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', 'HALL-FSTJ-01', '4DX动感厅', 'VIP', 90, '{4DX,动感座椅,特效影厅}', 'active', '2025-12-23 00:55:32.475411+00', '2025-12-23 00:55:32.475411+00');
INSERT INTO public.halls VALUES ('181695c8-82fc-4c5e-b830-23374d54cf0c', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', 'HALL-FSTJ-02', 'VIP贵宾厅1号', 'VIP', 25, '{VIP尊享,真皮沙发}', 'active', '2025-12-23 00:55:32.475411+00', '2025-12-23 00:55:32.475411+00');
INSERT INTO public.halls VALUES ('0a88042d-edfe-476a-b941-f9c6a8e34372', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', 'HALL-FSTJ-03', 'VIP贵宾厅2号', 'VIP', 22, '{VIP尊享,真皮沙发}', 'active', '2025-12-23 00:55:32.475411+00', '2025-12-23 00:55:32.475411+00');
INSERT INTO public.halls VALUES ('a128c053-2fb4-4d92-bf41-0c661f7031df', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', 'HALL-FSTJ-04', '情侣厅', 'CP', 20, '{情侣座,浪漫氛围}', 'active', '2025-12-23 00:55:32.475411+00', '2025-12-23 00:55:32.475411+00');
INSERT INTO public.halls VALUES ('ec9fabb9-cba6-47fe-90bd-8d5a45a218d9', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', 'HALL-FSTJ-05', '普通厅1号', 'PUBLIC', 100, '{数字放映,标准影厅}', 'active', '2025-12-23 00:55:32.475411+00', '2025-12-23 00:55:32.475411+00');
INSERT INTO public.halls VALUES ('f95f28e1-d5e6-4703-98ac-18756df8adf6', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', 'HALL-FSTJ-06', '普通厅2号', 'PUBLIC', 95, '{数字放映,标准影厅}', 'active', '2025-12-23 00:55:32.475411+00', '2025-12-23 00:55:32.475411+00');
INSERT INTO public.halls VALUES ('ce6b5e36-ba07-4235-b016-c2d761b4d84c', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', 'HALL-FSTJ-07', '普通厅3号', 'PUBLIC', 92, '{数字放映,标准影厅}', 'active', '2025-12-23 00:55:32.475411+00', '2025-12-23 00:55:32.475411+00');
INSERT INTO public.halls VALUES ('8c924a47-be46-4d68-99c9-01a330550b6c', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', 'HALL-FSTJ-08', '普通厅4号', 'PUBLIC', 90, '{数字放映,标准影厅}', 'active', '2025-12-23 00:55:32.475411+00', '2025-12-23 00:55:32.475411+00');
INSERT INTO public.halls VALUES ('91af27dc-6301-4385-bcbf-1e1361ad79b6', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', 'HALL-FSTJ-09', '普通厅5号', 'PUBLIC', 88, '{数字放映,标准影厅}', 'active', '2025-12-23 00:55:32.475411+00', '2025-12-23 00:55:32.475411+00');
INSERT INTO public.halls VALUES ('98aeb3e6-fe0f-4e7f-8e01-8ed8b33ad34b', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', 'HALL-FSTJ-10', '普通厅6号', 'PUBLIC', 85, '{数字放映,标准影厅}', 'active', '2025-12-23 00:55:32.475411+00', '2025-12-23 00:55:32.475411+00');
INSERT INTO public.halls VALUES ('694a0175-e9fa-4201-80a0-3d48c4517aa0', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', 'HALL-FSTJ-11', '普通厅7号', 'PUBLIC', 82, '{数字放映,标准影厅}', 'active', '2025-12-23 00:55:32.475411+00', '2025-12-23 00:55:32.475411+00');
INSERT INTO public.halls VALUES ('b9e69309-1135-413d-94f9-36b576aeb99a', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', 'HALL-FSTJ-12', '普通厅8号', 'PUBLIC', 80, '{数字放映,标准影厅}', 'active', '2025-12-23 00:55:32.475411+00', '2025-12-23 00:55:32.475411+00');
INSERT INTO public.halls VALUES ('d59a91b6-ef02-491b-98dd-b0572603fc22', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', 'HALL-FSTJ-13', '普通厅9号', 'PUBLIC', 78, '{数字放映,标准影厅}', 'active', '2025-12-23 00:55:32.475411+00', '2025-12-23 00:55:32.475411+00');
INSERT INTO public.halls VALUES ('85cbf530-a0db-4d4c-96a2-2421af82ba62', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', 'HALL-FSTJ-14', '普通厅10号', 'PUBLIC', 76, '{数字放映,标准影厅}', 'active', '2025-12-23 00:55:32.475411+00', '2025-12-23 00:55:32.475411+00');
INSERT INTO public.halls VALUES ('cfae4bee-69b3-449f-894d-a341c0260fc3', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', 'HALL-FSTJ-15', '普通厅11号', 'PUBLIC', 75, '{数字放映,标准影厅}', 'active', '2025-12-23 00:55:32.475411+00', '2025-12-23 00:55:32.475411+00');


--
-- Data for Name: inventory_adjustments; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.inventory_adjustments VALUES ('6403cff8-6f36-491c-b6c8-a9ae8849a1f3', 'ADJ202512260001', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'surplus', 100, 50.00, DEFAULT, 'STOCK_DIFF', '实物盘点发现多余', '测试审批流程', 'approved', 100, 200, 90, 190, true, '3ac08f3b-bcec-4939-8369-9fd2b5bfbbfe', '库存管理员', '2025-12-26 11:32:28.338172+00', '3f63ef6f-e86e-480d-8192-59280cbcb3b2', NULL, '2025-12-26 11:24:13.285728+00', '2025-12-26 11:32:28.325133+00', 2);
INSERT INTO public.inventory_adjustments VALUES ('ceb4f6a3-8879-4a8f-9455-82892baba788', 'ADJ202512260002', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'surplus', 50, 50.00, DEFAULT, 'STOCK_DIFF', '年终盘点发现多余库存', 'FAQ文档演示用审批记录', 'approved', 100, 150, 90, 140, true, '8b65f37f-37b4-42c8-a989-57456b77d5d8', '库存管理员', '2025-12-26 11:35:37.444996+00', 'b3797d4b-47b0-48af-a252-41ea993d552f', NULL, '2025-12-26 11:27:55.568017+00', '2025-12-26 11:35:37.431402+00', 2);
INSERT INTO public.inventory_adjustments VALUES ('80526376-1c64-45b6-8c87-197a36b11724', 'ADJ202512270001', '550e8400-e29b-41d4-a716-446655440026', 'b6684b23-3587-4602-9f54-695cb9527424', 'shortage', 10, 50.00, DEFAULT, 'SHORTAGE_SALE', NULL, NULL, 'approved', 1290, 1280, 1240, 1230, false, 'ae236654-8027-48ce-a6d8-198d4e612b6f', '库存管理员', NULL, NULL, NULL, '2025-12-27 02:03:11.0913+00', '2025-12-27 02:03:11.09133+00', 1);
INSERT INTO public.inventory_adjustments VALUES ('3004c3b7-9b37-4cb3-bce9-f8ecd5cda5f0', 'ADJ202512270002', '550e8400-e29b-41d4-a716-446655440026', 'b6684b23-3587-4602-9f54-695cb9527424', 'shortage', 10, 50.00, DEFAULT, 'SHORTAGE_SALE', NULL, NULL, 'approved', 1290, 1280, 1240, 1230, false, '6b864c1f-097c-43a6-8785-b43ff5022a7b', '库存管理员', NULL, NULL, NULL, '2025-12-27 02:03:13.214177+00', '2025-12-27 02:03:13.214201+00', 1);
INSERT INTO public.inventory_adjustments VALUES ('a51a6be2-50b1-47c5-9ba8-74458aa4b026', 'ADJ202512270003', '550e8400-e29b-41d4-a716-446655440026', 'b6684b23-3587-4602-9f54-695cb9527424', 'shortage', 5, 50.00, DEFAULT, 'SHORTAGE_SALE', NULL, NULL, 'approved', 1290, 1285, 1240, 1235, false, '7011c2ab-47ca-4c52-a532-97111fe16cf3', '库存管理员', NULL, NULL, NULL, '2025-12-27 02:13:22.334349+00', '2025-12-27 02:13:22.334384+00', 1);
INSERT INTO public.inventory_adjustments VALUES ('8db75443-4433-4b01-b9c3-51a7f51a0e67', 'ADJ202512270004', '550e8400-e29b-41d4-a716-446655440026', 'b6684b23-3587-4602-9f54-695cb9527424', 'shortage', 5, 50.00, DEFAULT, 'SHORTAGE_SALE', NULL, NULL, 'approved', 1290, 1285, 1240, 1235, false, '8fcd35d7-8242-40bf-967d-c9aa47569fb5', '库存管理员', NULL, NULL, NULL, '2025-12-27 02:13:24.764688+00', '2025-12-27 02:13:24.764696+00', 1);
INSERT INTO public.inventory_adjustments VALUES ('36b05fe3-9b73-4ac7-8316-3054c9986bb6', 'ADJ202512270005', '550e8400-e29b-41d4-a716-446655440026', 'b6684b23-3587-4602-9f54-695cb9527424', 'shortage', 10, 50.00, DEFAULT, 'SHORTAGE_SALE', NULL, NULL, 'approved', 1290, 1280, 1240, 1230, false, 'ab3fea0c-c02c-4d26-a5de-703f7e458a2f', '库存管理员', NULL, NULL, NULL, '2025-12-27 02:18:04.917483+00', '2025-12-27 02:18:04.91777+00', 1);
INSERT INTO public.inventory_adjustments VALUES ('3d7a87a4-1f0c-4c6c-a109-0052716e36ad', 'ADJ202512270006', '550e8400-e29b-41d4-a716-446655440026', 'b6684b23-3587-4602-9f54-695cb9527424', 'shortage', 5, 50.00, DEFAULT, 'SHORTAGE_SALE', NULL, NULL, 'approved', 1290, 1285, 1240, 1235, false, '6e2cf959-eed2-4197-af86-94c29bafd099', '库存管理员', NULL, NULL, NULL, '2025-12-27 02:22:04.249704+00', '2025-12-27 02:22:04.249761+00', 1);
INSERT INTO public.inventory_adjustments VALUES ('3b511a9f-e0da-4158-a8b4-5867bfdbf32a', 'ADJ202512270007', '550e8400-e29b-41d4-a716-446655440005', 'b6684b23-3587-4602-9f54-695cb9527424', 'shortage', 3, 50.00, DEFAULT, 'SHORTAGE_SALE', NULL, NULL, 'approved', 6718, 6715, 4666, 4663, false, 'd5688176-f0ce-444b-b931-5b947af8abb0', '库存管理员', NULL, NULL, NULL, '2025-12-27 02:24:02.598375+00', '2025-12-27 02:24:02.598406+00', 1);


--
-- Data for Name: inventory_reservations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.inventory_reservations VALUES ('18173acc-1690-49eb-aa8d-22342f714ad5', '33333333-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000001', 45.0000, 'ACTIVE', '2025-12-29 13:32:18.021239', NULL, 45.0000, NULL, NULL, NULL, 'Reserved 45.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('3bcc9837-8d9e-48b3-b38d-f9ef25661377', '33333333-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000002', 150.0000, 'ACTIVE', '2025-12-29 13:32:18.021438', NULL, 150.0000, NULL, NULL, NULL, 'Reserved 150.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('228f9898-d76a-4e0b-b292-867a37e53a18', '33333333-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000003', 1.0000, 'ACTIVE', '2025-12-29 13:32:18.021735', NULL, 1.0000, NULL, NULL, NULL, 'Reserved 1.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('ad7016c2-ecd2-48bb-a539-ddc3c5cf45d3', '33333333-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000004', 1.0000, 'ACTIVE', '2025-12-29 13:32:18.021967', NULL, 1.0000, NULL, NULL, NULL, 'Reserved 1.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('74e1480b-1b1e-47dc-9aae-b37768b033f9', '33333333-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000001', 45.0000, 'ACTIVE', '2025-12-29 13:33:02.706453', NULL, 45.0000, NULL, NULL, NULL, 'Reserved 45.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('5815d7ea-1d52-4ae6-a79b-10287fc39139', '33333333-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000002', 150.0000, 'ACTIVE', '2025-12-29 13:33:02.706773', NULL, 150.0000, NULL, NULL, NULL, 'Reserved 150.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('9c6c6380-5610-4a43-afd2-67f8fecc6324', '33333333-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000003', 1.0000, 'ACTIVE', '2025-12-29 13:33:02.70699', NULL, 1.0000, NULL, NULL, NULL, 'Reserved 1.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('3d25ac57-9dac-4c9e-96ec-6f6c2fa3d9b4', '33333333-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000004', 1.0000, 'ACTIVE', '2025-12-29 13:33:02.707189', NULL, 1.0000, NULL, NULL, NULL, 'Reserved 1.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('61a41357-f97b-45ba-a0a2-82a36954caf4', '33333333-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000001', 45.0000, 'FULFILLED', '2025-12-29 13:32:58.457934', NULL, 45.0000, NULL, '2025-12-29 13:33:23.635368+00', NULL, 'Reserved 45.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('6db84a36-144d-4182-9d5f-c020d4b62579', '33333333-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000002', 150.0000, 'FULFILLED', '2025-12-29 13:32:58.458057', NULL, 150.0000, NULL, '2025-12-29 13:33:23.635369+00', NULL, 'Reserved 150.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('85a07708-47d1-40ad-a72b-3335f39cad92', '33333333-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000003', 1.0000, 'FULFILLED', '2025-12-29 13:32:58.458141', NULL, 1.0000, NULL, '2025-12-29 13:33:23.635369+00', NULL, 'Reserved 1.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('5058e330-3625-457b-a2a6-e48c5cb8dbcc', '33333333-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000004', 1.0000, 'FULFILLED', '2025-12-29 13:32:58.458227', NULL, 1.0000, NULL, '2025-12-29 13:33:23.635369+00', NULL, 'Reserved 1.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('5874902d-aa65-4dd3-982f-c59e3e0555aa', '33333333-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000001', 225.0000, 'ACTIVE', '2025-12-29 13:33:40.66362', NULL, 225.0000, NULL, NULL, NULL, 'Reserved 225.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('40b1c540-4ab7-4714-a60d-0a3d1bf8e795', '33333333-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000002', 750.0000, 'ACTIVE', '2025-12-29 13:33:40.663703', NULL, 750.0000, NULL, NULL, NULL, 'Reserved 750.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('4aeeb197-3634-4866-9c65-0f7b56b87e6b', '33333333-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000003', 5.0000, 'ACTIVE', '2025-12-29 13:33:40.663758', NULL, 5.0000, NULL, NULL, NULL, 'Reserved 5.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('b3ed1b46-de17-47c3-8d7e-9824c7b59395', '33333333-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000004', 5.0000, 'ACTIVE', '2025-12-29 13:33:40.663827', NULL, 5.0000, NULL, NULL, NULL, 'Reserved 5.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('80e5f5e7-6584-4d83-8b61-f1448488cf7b', '33333333-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000001', 45.0000, 'ACTIVE', '2025-12-29 13:33:54.790768', NULL, 45.0000, NULL, NULL, NULL, 'Reserved 45.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('d5f3e1df-d244-4b30-91ba-c3b66f494761', '33333333-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000002', 150.0000, 'ACTIVE', '2025-12-29 13:33:54.791085', NULL, 150.0000, NULL, NULL, NULL, 'Reserved 150.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('a63e02fc-8402-4248-b097-24aec721adda', '33333333-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000003', 1.0000, 'ACTIVE', '2025-12-29 13:33:54.791226', NULL, 1.0000, NULL, NULL, NULL, 'Reserved 1.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('8cdee660-8150-4426-9fec-6e8e64ed857a', '33333333-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000004', 1.0000, 'ACTIVE', '2025-12-29 13:33:54.791359', NULL, 1.0000, NULL, NULL, NULL, 'Reserved 1.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('cd9d731d-5db3-4009-8237-5fbc502c372c', '33333333-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000001', 45.0000, 'ACTIVE', '2025-12-29 13:32:22.770726', NULL, 45.0000, NULL, NULL, NULL, 'Reserved 45.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('a744f41a-2df5-458e-9320-442d3543b04a', '33333333-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000002', 150.0000, 'ACTIVE', '2025-12-29 13:32:22.77087', NULL, 150.0000, NULL, NULL, NULL, 'Reserved 150.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('fc010b7b-daef-44cc-9b46-867767e9b714', '33333333-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000003', 1.0000, 'ACTIVE', '2025-12-29 13:32:22.770988', NULL, 1.0000, NULL, NULL, NULL, 'Reserved 1.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('22804e97-6440-4431-b70f-1e4222e6c250', '33333333-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000004', 1.0000, 'ACTIVE', '2025-12-29 13:32:22.771084', NULL, 1.0000, NULL, NULL, NULL, 'Reserved 1.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('8518dc30-6711-4e9e-89e1-7e80117e7885', '33333333-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000001', 45.0000, 'FULFILLED', '2025-12-29 13:32:54.192839', NULL, 45.0000, NULL, '2025-12-29 13:33:18.373165+00', NULL, 'Reserved 45.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('222045ba-f5b3-4c09-8548-5b2d11e81278', '33333333-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000002', 150.0000, 'FULFILLED', '2025-12-29 13:32:54.192944', NULL, 150.0000, NULL, '2025-12-29 13:33:18.373166+00', NULL, 'Reserved 150.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('8a959f99-9566-4f86-a329-7786c0d7896c', '33333333-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000003', 1.0000, 'FULFILLED', '2025-12-29 13:32:54.193036', NULL, 1.0000, NULL, '2025-12-29 13:33:18.373166+00', NULL, 'Reserved 1.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('cd892a25-a01d-4d86-aedc-32413c4e463d', '33333333-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000004', 1.0000, 'FULFILLED', '2025-12-29 13:32:54.193121', NULL, 1.0000, NULL, '2025-12-29 13:33:18.373166+00', NULL, 'Reserved 1.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('46f36825-cc11-4101-b9eb-09213914fca9', '33333333-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000001', 45.0000, 'ACTIVE', '2025-12-29 13:33:31.201341', NULL, 45.0000, NULL, NULL, NULL, 'Reserved 45.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('a13fe5a8-ec1a-4b5a-b794-cd9ad28b5bde', '33333333-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000002', 150.0000, 'ACTIVE', '2025-12-29 13:33:31.201457', NULL, 150.0000, NULL, NULL, NULL, 'Reserved 150.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('39b558c4-a9dc-4cf7-abbf-4fb7c97ddbca', '33333333-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000003', 1.0000, 'ACTIVE', '2025-12-29 13:33:31.20152', NULL, 1.0000, NULL, NULL, NULL, 'Reserved 1.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('864787e5-4c8b-417b-83f2-c066c11f7029', '33333333-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000004', 1.0000, 'ACTIVE', '2025-12-29 13:33:31.201578', NULL, 1.0000, NULL, NULL, NULL, 'Reserved 1.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('118b92c4-a8c3-405a-bb2f-8d5338aead82', '33333333-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000001', 45.0000, 'ACTIVE', '2025-12-29 13:32:29.74115', NULL, 45.0000, NULL, NULL, NULL, 'Reserved 45.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('963c4a09-91fa-4b2c-bd7a-34f146b11f97', '33333333-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000002', 150.0000, 'ACTIVE', '2025-12-29 13:32:29.741269', NULL, 150.0000, NULL, NULL, NULL, 'Reserved 150.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('bff69d4b-10a1-493a-9bc3-4a73e3edb8b5', '33333333-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000003', 1.0000, 'ACTIVE', '2025-12-29 13:32:29.74136', NULL, 1.0000, NULL, NULL, NULL, 'Reserved 1.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('c695bf6b-778a-4239-b39d-c59986f5420e', '33333333-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000004', 1.0000, 'ACTIVE', '2025-12-29 13:32:29.741558', NULL, 1.0000, NULL, NULL, NULL, 'Reserved 1.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('57757a72-1008-4aab-b9cf-da3523b952d4', '33333333-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000001', 45.0000, 'ACTIVE', '2025-12-29 13:33:07.086609', NULL, 45.0000, NULL, NULL, NULL, 'Reserved 45.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('e916e4d1-01ab-4ce3-a852-98a09eb43bb1', '33333333-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000002', 150.0000, 'ACTIVE', '2025-12-29 13:33:07.086712', NULL, 150.0000, NULL, NULL, NULL, 'Reserved 150.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('d8a34c54-e8bb-45e2-a388-a392a134993d', '33333333-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000003', 1.0000, 'ACTIVE', '2025-12-29 13:33:07.086861', NULL, 1.0000, NULL, NULL, NULL, 'Reserved 1.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('40424dca-0104-461f-a73c-9163375f1d20', '33333333-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000004', 1.0000, 'ACTIVE', '2025-12-29 13:33:07.08695', NULL, 1.0000, NULL, NULL, NULL, 'Reserved 1.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('826a9047-4773-4ca8-abfd-3a65acefe4eb', '33333333-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000001', 45.0000, 'FULFILLED', '2025-12-29 13:32:45.855', NULL, 45.0000, NULL, '2025-12-29 13:33:13.110321+00', NULL, 'Reserved 45.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('952cc158-40fd-43cb-ba6a-ae412d3ba60f', '33333333-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000002', 150.0000, 'FULFILLED', '2025-12-29 13:32:45.855161', NULL, 150.0000, NULL, '2025-12-29 13:33:13.110322+00', NULL, 'Reserved 150.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('af10330d-cdee-40e9-bab9-5153bc3689b0', '33333333-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000003', 1.0000, 'FULFILLED', '2025-12-29 13:32:45.855349', NULL, 1.0000, NULL, '2025-12-29 13:33:13.110322+00', NULL, 'Reserved 1.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('8d93a665-4115-4668-949b-1fb6552716af', '33333333-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000004', 1.0000, 'FULFILLED', '2025-12-29 13:32:45.855479', NULL, 1.0000, NULL, '2025-12-29 13:33:13.110322+00', NULL, 'Reserved 1.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('1be4029a-237c-4d46-8d85-396c21884c61', '33333333-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000001', 45.0000, 'ACTIVE', '2025-12-29 13:33:35.645079', NULL, 45.0000, NULL, NULL, NULL, 'Reserved 45.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('6eb5eb4d-1871-4284-b290-f529271ca55e', '33333333-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000002', 150.0000, 'ACTIVE', '2025-12-29 13:33:35.645162', NULL, 150.0000, NULL, NULL, NULL, 'Reserved 150.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('11084264-c4d9-460e-a91e-8bb249273fac', '33333333-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000003', 1.0000, 'ACTIVE', '2025-12-29 13:33:35.645218', NULL, 1.0000, NULL, NULL, NULL, 'Reserved 1.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('cbc1feae-e4e7-4073-93fc-063338a855f8', '33333333-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000004', 1.0000, 'ACTIVE', '2025-12-29 13:33:35.645268', NULL, 1.0000, NULL, NULL, NULL, 'Reserved 1.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('2a88319c-e667-4f17-a00e-4d95a7d7bb33', '33333333-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000099', '22222222-0000-0000-0000-000000000001', 1.0000, 'FULFILLED', '2025-12-29 12:14:09.234575', NULL, 1.0000, '2025-12-29 12:44:09.234575+00', '2025-12-29 12:30:18.390043+00', NULL, NULL);
INSERT INTO public.inventory_reservations VALUES ('45d29acc-d668-4d33-8469-e8cb8272405b', '33333333-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000001', 45.0000, 'ACTIVE', '2025-12-29 13:32:34.298037', NULL, 45.0000, NULL, NULL, NULL, 'Reserved 45.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('52ba4e33-190b-4fc8-84c0-93239bff54e0', '33333333-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000002', 150.0000, 'ACTIVE', '2025-12-29 13:32:34.298149', NULL, 150.0000, NULL, NULL, NULL, 'Reserved 150.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('c0492128-323c-401d-b968-7e0b0fe8d1b1', '33333333-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000003', 1.0000, 'ACTIVE', '2025-12-29 13:32:34.298243', NULL, 1.0000, NULL, NULL, NULL, 'Reserved 1.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('45624c2d-460c-4978-a375-89e8a768e5d4', '33333333-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000004', 1.0000, 'ACTIVE', '2025-12-29 13:32:34.29845', NULL, 1.0000, NULL, NULL, NULL, 'Reserved 1.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('ad05edba-5177-409e-844d-3441cca0e73e', '33333333-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000001', 135.0000, 'ACTIVE', '2025-12-29 13:32:50.026923', NULL, 135.0000, NULL, NULL, NULL, 'Reserved 135.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('f96b2ca2-548c-4380-a452-d28b1f4c520a', '33333333-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000002', 450.0000, 'ACTIVE', '2025-12-29 13:32:50.027286', NULL, 450.0000, NULL, NULL, NULL, 'Reserved 450.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('8493862e-37bd-4f47-ae8d-060941a7d270', '33333333-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000003', 3.0000, 'ACTIVE', '2025-12-29 13:32:50.027488', NULL, 3.0000, NULL, NULL, NULL, 'Reserved 3.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('24f0fb61-6b6e-480c-a52d-ffa74f19d9bc', '33333333-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000004', 3.0000, 'ACTIVE', '2025-12-29 13:32:50.027687', NULL, 3.0000, NULL, NULL, NULL, 'Reserved 3.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('bc20e984-b42a-4760-9c71-5a621c2dce10', '33333333-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000001', 45.0000, 'ACTIVE', '2025-12-29 13:33:27.036775', NULL, 45.0000, NULL, NULL, NULL, 'Reserved 45.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('84889d75-a880-49ed-a0d0-89e9047428a9', '33333333-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000002', 150.0000, 'ACTIVE', '2025-12-29 13:33:27.036958', NULL, 150.0000, NULL, NULL, NULL, 'Reserved 150.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('464bec8c-5739-4758-bb76-adae58e8102b', '33333333-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000003', 1.0000, 'ACTIVE', '2025-12-29 13:33:27.037094', NULL, 1.0000, NULL, NULL, NULL, 'Reserved 1.000 unit of Raw Material');
INSERT INTO public.inventory_reservations VALUES ('9e2882b9-f62b-4680-8416-09affa67989a', '33333333-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000004', 1.0000, 'ACTIVE', '2025-12-29 13:33:27.037217', NULL, 1.0000, NULL, NULL, NULL, 'Reserved 1.000 unit of Raw Material');


--
-- Data for Name: inventory_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.inventory_transactions VALUES ('63410d1f-0cf8-4ae1-8870-90541c3deb94', 'b6684b23-3587-4602-9f54-695cb9527424', '550e8400-e29b-41d4-a716-446655440005', 'adjustment_in', 10, 6696, 6706, 4644, 4654, 'adjustment_order', NULL, NULL, '系统', '测试调整', '2025-12-26 10:43:39.976443+00', '2025-12-26 10:43:40.292212+00', '2025-12-26 10:43:40.292212+00', NULL, NULL, NULL);
INSERT INTO public.inventory_transactions VALUES ('4d47d969-1b8b-4440-aafc-caba53b05dd3', 'b6684b23-3587-4602-9f54-695cb9527424', '550e8400-e29b-41d4-a716-446655440005', 'adjustment_in', 12, 6706, 6718, 4654, 4666, 'adjustment_order', 'ADJ-1766746897310', NULL, '系统', '盘盈: 实物盘点发现多余', '2025-12-26 11:01:38.205441+00', '2025-12-26 11:01:38.479376+00', '2025-12-26 11:01:38.479376+00', NULL, NULL, NULL);
INSERT INTO public.inventory_transactions VALUES ('afe2d9a2-a928-40e4-96d2-723a92cd5b35', 'b6684b23-3587-4602-9f54-695cb9527424', '550e8400-e29b-41d4-a716-446655440026', 'adjustment_in', 1000, 290, 1290, 240, 1240, 'adjustment_order', 'ADJ-1766747687709', NULL, '系统', '盘盈: 实物盘点发现多余', '2025-12-26 11:14:49.202972+00', '2025-12-26 11:14:49.491184+00', '2025-12-26 11:14:49.491184+00', NULL, NULL, NULL);
INSERT INTO public.inventory_transactions VALUES ('b7b199c7-a035-45f1-96cd-1fc9c5dd4b50', 'b6684b23-3587-4602-9f54-695cb9527424', '550e8400-e29b-41d4-a716-446655440026', 'safety_stock_update', 0, 150, 150, 100, 100, 'safety_stock_config', 'SAFETY-TEST-001', NULL, '系统', '安全库存从 70 调整为 75（测试）', '2025-12-26 11:59:22.478658+00', '2025-12-26 11:59:22.478658+00', '2025-12-26 11:59:22.478658+00', NULL, NULL, NULL);
INSERT INTO public.inventory_transactions VALUES ('84834fd7-c995-47e1-a6c0-597ac58d3f09', 'b6684b23-3587-4602-9f54-695cb9527424', '550e8400-e29b-41d4-a716-446655440005', 'safety_stock_update', 0, 6715, 6715, 4663, 4663, 'safety_stock_config', 'SAFETY-8C643B31', NULL, '系统', '安全库存从 1000 调整为 800', '2025-12-27 02:33:18.875674+00', '2025-12-27 02:33:19.124617+00', '2025-12-27 02:33:19.124617+00', NULL, NULL, NULL);
INSERT INTO public.inventory_transactions VALUES ('3e608eb7-bf6d-425c-8658-6523c72eab53', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000001', 'sale_out', -45, 1000, 955, 0, 0, NULL, NULL, '0fcdb8fb-f9f6-4024-9c62-fcee82a4a1d3', NULL, 'BOM deduction for order 33333333-0000-0000-0000-000000000001', '2025-12-29 12:30:18.387753+00', '2025-12-29 12:30:18.387751+00', '2025-12-29 12:30:15.116706+00', NULL, NULL, '33333333-0000-0000-0000-000000000001');
INSERT INTO public.inventory_transactions VALUES ('9cc29e52-6752-4e86-b3d8-85d64d697450', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000002', 'sale_out', -150, 5000, 4850, 0, 0, NULL, NULL, 'b565ab81-b53c-47d0-87af-e106d1cf3170', NULL, 'BOM deduction for order 33333333-0000-0000-0000-000000000001', '2025-12-29 12:30:18.389561+00', '2025-12-29 12:30:18.389561+00', '2025-12-29 12:30:15.116706+00', NULL, NULL, '33333333-0000-0000-0000-000000000001');
INSERT INTO public.inventory_transactions VALUES ('c931cabb-5fd0-4819-b26f-69ad8a6749ab', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000003', 'sale_out', -1, 100, 99, 0, 0, NULL, NULL, 'd139b2e4-817c-43d3-b285-85c90fc8e409', NULL, 'BOM deduction for order 33333333-0000-0000-0000-000000000001', '2025-12-29 12:30:18.389694+00', '2025-12-29 12:30:18.389694+00', '2025-12-29 12:30:15.116706+00', NULL, NULL, '33333333-0000-0000-0000-000000000001');
INSERT INTO public.inventory_transactions VALUES ('17f8136b-872c-4c5f-acef-fbdf171f42eb', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000004', 'sale_out', -1, 200, 199, 0, 0, NULL, NULL, '8ed3da13-98a8-44b9-b3fb-6eda97f1dc4d', NULL, 'BOM deduction for order 33333333-0000-0000-0000-000000000001', '2025-12-29 12:30:18.389804+00', '2025-12-29 12:30:18.389803+00', '2025-12-29 12:30:15.116706+00', NULL, NULL, '33333333-0000-0000-0000-000000000001');
INSERT INTO public.inventory_transactions VALUES ('f47bc804-30a5-413d-90f9-5f5f7c14b3a4', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000001', 'sale_out', -45, 955, 910, 0, 0, NULL, NULL, '0aa3f5b3-a903-4760-9b56-8cf7b0df0d73', NULL, 'BOM deduction for order 33333333-0000-0000-0000-000000000008', '2025-12-29 13:33:13.110165+00', '2025-12-29 13:33:13.110165+00', '2025-12-29 13:32:54.160079+00', NULL, NULL, '33333333-0000-0000-0000-000000000008');
INSERT INTO public.inventory_transactions VALUES ('8136fba4-78c8-4657-9252-7ca92590cbb0', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000002', 'sale_out', -150, 4850, 4700, 0, 0, NULL, NULL, '7df17812-5d37-4488-aa58-14ba757a0375', NULL, 'BOM deduction for order 33333333-0000-0000-0000-000000000008', '2025-12-29 13:33:13.110238+00', '2025-12-29 13:33:13.110238+00', '2025-12-29 13:32:54.160079+00', NULL, NULL, '33333333-0000-0000-0000-000000000008');
INSERT INTO public.inventory_transactions VALUES ('3c939039-6d3e-4513-b7ff-e11886409d78', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000003', 'sale_out', -1, 99, 98, 0, 0, NULL, NULL, '049d47c4-30c7-494a-9e50-5df11d59ba7d', NULL, 'BOM deduction for order 33333333-0000-0000-0000-000000000008', '2025-12-29 13:33:13.110268+00', '2025-12-29 13:33:13.110268+00', '2025-12-29 13:32:54.160079+00', NULL, NULL, '33333333-0000-0000-0000-000000000008');
INSERT INTO public.inventory_transactions VALUES ('1f293529-1cfc-4338-b4ce-71c6a49c3023', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000004', 'sale_out', -1, 199, 198, 0, 0, NULL, NULL, '00ed77d2-c0e9-40ad-8547-c7f451a77227', NULL, 'BOM deduction for order 33333333-0000-0000-0000-000000000008', '2025-12-29 13:33:13.110291+00', '2025-12-29 13:33:13.110291+00', '2025-12-29 13:32:54.160079+00', NULL, NULL, '33333333-0000-0000-0000-000000000008');
INSERT INTO public.inventory_transactions VALUES ('4792c888-1a21-4dfc-bb71-c58baa78bef0', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000001', 'sale_out', -45, 910, 865, 0, 0, NULL, NULL, 'e2533fbe-fdc0-4592-a855-9ce8a0f7a1ba', NULL, 'BOM deduction for order 33333333-0000-0000-0000-000000000011', '2025-12-29 13:33:18.373013+00', '2025-12-29 13:33:18.373013+00', '2025-12-29 13:32:58.419381+00', NULL, NULL, '33333333-0000-0000-0000-000000000011');
INSERT INTO public.inventory_transactions VALUES ('8752f89e-85ca-4252-8310-5c40b054150c', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000002', 'sale_out', -150, 4700, 4550, 0, 0, NULL, NULL, '3863f05f-d6c7-44ed-9793-8374fba967d7', NULL, 'BOM deduction for order 33333333-0000-0000-0000-000000000011', '2025-12-29 13:33:18.373087+00', '2025-12-29 13:33:18.373087+00', '2025-12-29 13:32:58.419381+00', NULL, NULL, '33333333-0000-0000-0000-000000000011');
INSERT INTO public.inventory_transactions VALUES ('8aae9aff-17e8-4da7-87a3-6eaafda84ee9', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000003', 'sale_out', -1, 98, 97, 0, 0, NULL, NULL, '60bb4e66-10ed-4ed6-b438-ad90dd80ec40', NULL, 'BOM deduction for order 33333333-0000-0000-0000-000000000011', '2025-12-29 13:33:18.373116+00', '2025-12-29 13:33:18.373116+00', '2025-12-29 13:32:58.419381+00', NULL, NULL, '33333333-0000-0000-0000-000000000011');
INSERT INTO public.inventory_transactions VALUES ('5775a292-2bc6-4604-be8a-b426456ebf62', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000004', 'sale_out', -1, 198, 197, 0, 0, NULL, NULL, 'db8896a7-9ec8-46f3-8dbc-2f1003dfd40b', NULL, 'BOM deduction for order 33333333-0000-0000-0000-000000000011', '2025-12-29 13:33:18.37314+00', '2025-12-29 13:33:18.37314+00', '2025-12-29 13:32:58.419381+00', NULL, NULL, '33333333-0000-0000-0000-000000000011');
INSERT INTO public.inventory_transactions VALUES ('6461938e-509a-4cd1-a1fc-2a6ddb345686', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000001', 'sale_out', -45, 865, 820, 0, 0, NULL, NULL, '12dfffe6-f133-4a30-bc71-7338d573743d', NULL, 'BOM deduction for order 33333333-0000-0000-0000-000000000009', '2025-12-29 13:33:23.634793+00', '2025-12-29 13:33:23.634793+00', '2025-12-29 13:33:02.652529+00', NULL, NULL, '33333333-0000-0000-0000-000000000009');
INSERT INTO public.inventory_transactions VALUES ('30eb51ef-adcb-443e-8fc6-770bad7aeb0c', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000002', 'sale_out', -150, 4550, 4400, 0, 0, NULL, NULL, 'f8cf975b-1909-4843-8e88-53527abb3f85', NULL, 'BOM deduction for order 33333333-0000-0000-0000-000000000009', '2025-12-29 13:33:23.63492+00', '2025-12-29 13:33:23.63492+00', '2025-12-29 13:33:02.652529+00', NULL, NULL, '33333333-0000-0000-0000-000000000009');
INSERT INTO public.inventory_transactions VALUES ('2b41fd38-0677-414a-a8ab-7fb20b6c82d2', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000003', 'sale_out', -1, 97, 96, 0, 0, NULL, NULL, 'e39185d1-7114-4dec-8bfe-15c233bd547a', NULL, 'BOM deduction for order 33333333-0000-0000-0000-000000000009', '2025-12-29 13:33:23.63498+00', '2025-12-29 13:33:23.63498+00', '2025-12-29 13:33:02.652529+00', NULL, NULL, '33333333-0000-0000-0000-000000000009');
INSERT INTO public.inventory_transactions VALUES ('70c5deaa-4f0c-4d2b-8be6-f05c1ae6dad0', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000004', 'sale_out', -1, 197, 196, 0, 0, NULL, NULL, 'd9db8afb-690b-4f18-99b8-109080ea484b', NULL, 'BOM deduction for order 33333333-0000-0000-0000-000000000009', '2025-12-29 13:33:23.635291+00', '2025-12-29 13:33:23.635291+00', '2025-12-29 13:33:02.652529+00', NULL, NULL, '33333333-0000-0000-0000-000000000009');


--
-- Data for Name: menu_category; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.menu_category VALUES ('fe36efc2-e7a0-418a-9c33-0003c7db7eea', 'COFFEE', '精品咖啡', 2, true, false, NULL, NULL, '2026-01-04 01:32:44.690722+00', '2026-01-04 01:32:44.690722+00', NULL, NULL, NULL, 0);
INSERT INTO public.menu_category VALUES ('fd02eba4-28f3-4db9-b944-c2e4421f493d', 'BEVERAGE', '经典饮品', 3, true, false, NULL, NULL, '2026-01-04 01:32:44.690722+00', '2026-01-04 01:32:44.690722+00', NULL, NULL, NULL, 0);
INSERT INTO public.menu_category VALUES ('8ebd798c-f90e-4498-974f-d6bb0a8dc6e4', 'SNACK', '主厨小食', 4, true, false, NULL, NULL, '2026-01-04 01:32:44.690722+00', '2026-01-04 01:32:44.690722+00', NULL, NULL, NULL, 0);
INSERT INTO public.menu_category VALUES ('4c781206-054c-4df9-9b52-ea1b6a992c4f', 'OTHER', '其他商品', 99, true, true, NULL, NULL, '2026-01-04 01:32:44.690722+00', '2026-01-04 01:32:44.690722+00', NULL, NULL, NULL, 0);
INSERT INTO public.menu_category VALUES ('ca6c4f0b-eb49-4c21-b6d3-7f8893a942b7', 'ALCOHOL', '经典特调', 1, true, false, NULL, NULL, '2026-01-04 01:32:44.690722+00', '2026-01-04 07:58:37.279611+00', NULL, NULL, NULL, 2);
INSERT INTO public.menu_category VALUES ('516e7766-862a-4060-a13b-99b3c98f6631', 'MEAL', '精品餐食', 5, false, false, NULL, NULL, '2026-01-04 01:32:44.690722+00', '2026-01-05 02:58:29.030042+00', NULL, NULL, NULL, 1);
INSERT INTO public.menu_category VALUES ('7dd4a9d2-544d-4648-b901-a1e797e62075', 'COCKTAIL', '特调饮品', 2, true, false, NULL, NULL, '2026-01-05 07:08:53.632525+00', '2026-01-05 07:08:53.632525+00', NULL, NULL, NULL, 0);
INSERT INTO public.menu_category VALUES ('148c9b75-ca17-476e-8e78-d52416da0dbf', 'DESSERT', '甜点蛋糕', 5, true, false, NULL, NULL, '2026-01-05 07:09:00.414857+00', '2026-01-05 07:09:00.414857+00', NULL, NULL, NULL, 0);


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.order_items VALUES ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '可口可乐', '500ml', NULL, 2, 5.00, 10.00, '2025-12-27 10:00:00');
INSERT INTO public.order_items VALUES ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440002', '薯片', '大包装', NULL, 3, 12.00, 36.00, '2025-12-27 10:00:00');
INSERT INTO public.order_items VALUES ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440003', '矿泉水', '550ml', NULL, 6, 3.00, 18.00, '2025-12-26 14:00:00');
INSERT INTO public.order_items VALUES ('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440004', '爆米花', '大桶', NULL, 1, 80.00, 80.00, '2025-12-25 10:45:00');


--
-- Data for Name: order_logs; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.order_logs VALUES ('850e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'CREATE_ORDER', NULL, 'PENDING_PAYMENT', '550e8400-e29b-41d4-a716-446655440100', '张三', '创建订单', '2025-12-27 10:00:00');
INSERT INTO public.order_logs VALUES ('850e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'PAYMENT', 'PENDING_PAYMENT', 'PAID', '550e8400-e29b-41d4-a716-446655440100', '张三', '微信支付成功', '2025-12-27 10:30:00');
INSERT INTO public.order_logs VALUES ('850e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'CREATE_ORDER', NULL, 'PENDING_PAYMENT', '550e8400-e29b-41d4-a716-446655440101', '李四', '创建订单', '2025-12-26 14:00:00');
INSERT INTO public.order_logs VALUES ('850e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'PAYMENT', 'PENDING_PAYMENT', 'PAID', '550e8400-e29b-41d4-a716-446655440101', '李四', '支付宝支付成功', '2025-12-26 14:20:00');
INSERT INTO public.order_logs VALUES ('850e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'SHIP', 'PAID', 'SHIPPED', '950e8400-e29b-41d4-a716-446655440001', '运营管理员', '订单已发货，快递单号: SF1234567890', '2025-12-27 09:00:00');
INSERT INTO public.order_logs VALUES ('058dd46d-3ce7-454f-b9b0-b262e6404412', '550e8400-e29b-41d4-a716-446655440001', 'SHIP', 'PAID', 'SHIPPED', '950e8400-e29b-41d4-a716-446655440001', '运营管理员', '订单状态更新: PAID → SHIPPED', '2025-12-27 17:05:50.235914');
INSERT INTO public.order_logs VALUES ('f1fbfdd7-d52e-4c50-a8ec-6830c71a5d46', '550e8400-e29b-41d4-a716-446655440002', 'COMPLETE', 'SHIPPED', 'COMPLETED', '950e8400-e29b-41d4-a716-446655440001', '运营管理员', '订单状态更新: SHIPPED → COMPLETED', '2025-12-27 17:06:18.396259');
INSERT INTO public.order_logs VALUES ('889e5bbb-5add-43a6-95c8-2910b91bb071', '550e8400-e29b-41d4-a716-446655440001', 'COMPLETE', 'SHIPPED', 'COMPLETED', '950e8400-e29b-41d4-a716-446655440001', '运营管理员', '订单状态更新: SHIPPED → COMPLETED', '2025-12-27 17:11:14.032873');


--
-- Data for Name: package_addons; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.package_addons VALUES ('00000000-0003-0003-0000-000000000001', '00000000-0003-0000-0000-000000000003', '00000000-0003-0001-0000-000000000005', 0, false, '2025-12-23 06:52:25.119305+00');
INSERT INTO public.package_addons VALUES ('00000000-0003-0003-0000-000000000002', '00000000-0003-0000-0000-000000000003', '00000000-0003-0001-0000-000000000006', 1, false, '2025-12-23 06:52:25.119305+00');
INSERT INTO public.package_addons VALUES ('00000000-0003-0003-0000-000000000003', '00000000-0003-0000-0000-000000000003', '00000000-0003-0001-0000-000000000004', 2, false, '2025-12-23 06:52:25.119305+00');
INSERT INTO public.package_addons VALUES ('00000000-0003-0003-0000-000000000004', '00000000-0003-0000-0000-000000000003', '00000000-0003-0001-0000-000000000002', 3, false, '2025-12-23 06:52:25.119305+00');


--
-- Data for Name: package_benefits; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: package_hall_associations; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: package_items; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: package_pricing; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.package_pricing VALUES ('588019c6-6f7e-4b1c-9d18-0a09f480b350', '00000000-0001-0000-0000-000000000001', 1888.00, 2500.00, 24.48, 612.00, '2025-12-21 07:52:55.457732+00', '2025-12-21 07:52:55.457732+00');
INSERT INTO public.package_pricing VALUES ('52842349-e80a-4bd1-9e09-96f2a2983688', '00000000-0002-0000-0000-000000000002', 5888.00, 7500.00, 21.49, 1612.00, '2025-12-21 07:52:55.457732+00', '2025-12-21 07:52:55.457732+00');
INSERT INTO public.package_pricing VALUES ('f3dcab5d-e97b-4908-b940-6fd8ebffb4e6', '00000000-0003-0000-0000-000000000003', 3888.00, 4999.00, 22.22, 1111.00, '2025-12-21 07:52:55.457732+00', '2025-12-21 07:52:55.457732+00');


--
-- Data for Name: package_rules; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.package_rules VALUES ('c19ebcec-01f5-4b22-83f2-5e6c0e86130e', '00000000-0001-0000-0000-000000000001', 2.00, 10, 50, '2025-12-21 07:52:55.457732+00');
INSERT INTO public.package_rules VALUES ('3bade408-a84f-49ca-8dc4-70573f9cfafb', '00000000-0002-0000-0000-000000000002', 4.00, 20, 100, '2025-12-21 07:52:55.457732+00');
INSERT INTO public.package_rules VALUES ('30a165c3-5d00-40c9-9682-057f37c8c8fb', '00000000-0003-0000-0000-000000000003', 3.00, 2, 20, '2025-12-21 07:52:55.457732+00');
INSERT INTO public.package_rules VALUES ('4a5275b6-a32b-4722-ad91-5aeb3d387a92', '5c9e44fc-7973-4e1e-bc81-824b345733fc', 2.00, 2, 10, '2025-12-21 11:46:06.091069+00');
INSERT INTO public.package_rules VALUES ('c501841d-a459-4a49-a9e6-dab9ad9f6cbe', '88f0546b-fd0e-458f-9bc7-389d672912f8', 2.00, NULL, NULL, '2025-12-21 11:46:13.868391+00');


--
-- Data for Name: package_services; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: package_tiers; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.package_tiers VALUES ('00000000-0003-0002-0000-000000000002', '00000000-0003-0000-0000-000000000003', '豪华套餐', 4999.00, 5999.00, '["VIP专享", "含摄影"]', '包含：
- 4小时VIP影厅包场
- 精美鲜花布置
- 浪漫灯光效果
- 求婚背景LED屏
- 专业音响设备
- 专属摄影师跟拍
- 香槟气球布置', 1, '2025-12-23 06:52:25.119305+00', '2025-12-23 06:52:25.119305+00');
INSERT INTO public.package_tiers VALUES ('00000000-0003-0002-0000-000000000003', '00000000-0003-0000-0000-000000000003', '至尊套餐', 8888.00, 10888.00, '["限量特惠", "全程定制", "含婚礼策划"]', '包含：
- 5小时VIP影厅包场
- 奢华定制鲜花布置
- 浪漫灯光+烟雾效果
- 求婚背景LED屏+定制视频
- 专业音响设备
- 专属摄影师+摄像师全程跟拍
- 香槟+红酒+精美茶歇
- 专业求婚策划师全程跟踪
- 精美求婚道具租赁', 2, '2025-12-23 06:52:25.119305+00', '2025-12-23 06:52:25.119305+00');
INSERT INTO public.package_tiers VALUES ('00000000-0003-0002-0000-000000000001', '00000000-0003-0000-0000-000000000003', '浪漫套餐', 2999.00, 3888.00, '["人气推荐", "性价比"]', '包含：
- 3小时VIP影厅包场
- 基础鲜花布置
- 浪漫灯光效果
- 求婚背景LED屏
- 专业音响设备', 0, '2025-12-23 06:52:25.119305+00', '2025-12-23 08:29:23.666408+00');


--
-- Data for Name: product_orders; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.product_orders VALUES ('550e8400-e29b-41d4-a716-446655440003', 'ORD20251226IJ56KL', '550e8400-e29b-41d4-a716-446655440102', 'COMPLETED', 80.00, 10.00, 0.00, 90.00, '{"city": "上海市", "detail": "陆家嘴环路1000号", "district": "浦东新区", "province": "上海市"}', 'WECHAT_PAY', '2025-12-25 11:00:00', NULL, NULL, NULL, NULL, '2025-12-25 10:45:00', '2025-12-27 15:00:00', 4, 'PRODUCT');
INSERT INTO public.product_orders VALUES ('550e8400-e29b-41d4-a716-446655440002', 'ORD20251227EF34GH', '550e8400-e29b-41d4-a716-446655440101', 'COMPLETED', 200.00, 0.00, 20.00, 180.00, '{"city": "北京市", "detail": "三里屯SOHO 5号楼", "district": "朝阳区", "province": "北京市"}', 'ALIPAY', '2025-12-26 14:20:00', NULL, '2025-12-27 17:06:18.396259', NULL, NULL, '2025-12-26 14:00:00', '2025-12-27 09:06:18.103966', 4, 'PRODUCT');
INSERT INTO public.product_orders VALUES ('550e8400-e29b-41d4-a716-446655440001', 'ORD20251227AB12CD', '550e8400-e29b-41d4-a716-446655440100', 'COMPLETED', 150.00, 10.00, 5.00, 155.00, '{"city": "深圳市", "detail": "科技园南区18号楼", "district": "南山区", "province": "广东省"}', 'WECHAT_PAY', '2025-12-27 10:30:00', '2025-12-27 17:05:50.235914', '2025-12-27 17:11:14.032873', NULL, NULL, '2025-12-27 10:00:00', '2025-12-27 09:11:13.722091', 4, 'PRODUCT');


--
-- Data for Name: queue_numbers; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.queue_numbers VALUES ('d37e14f6-c9cc-4ebe-8f3f-bf3464c4dac5', 'D001', 'fdc2422c-d4ce-43bb-8986-bb6df58df004', '00000000-0000-0000-0000-000000000001', '2025-12-28', 1, 'ACTIVE', NULL, NULL, '2025-12-28 20:03:50.036657');
INSERT INTO public.queue_numbers VALUES ('6ef36fcf-6418-4217-a1e5-30f80c4f742a', 'D002', '4e34b38d-b605-4cac-86a2-b35eed8983de', '00000000-0000-0000-0000-000000000001', '2025-12-28', 2, 'ACTIVE', NULL, NULL, '2025-12-28 20:04:23.520567');
INSERT INTO public.queue_numbers VALUES ('8096863b-9547-4648-b2b2-4edaaa12f209', 'D003', '2f5ca2be-049e-4496-9102-26ffe88960d9', '00000000-0000-0000-0000-000000000001', '2025-12-28', 3, 'ACTIVE', NULL, NULL, '2025-12-28 20:08:06.347208');
INSERT INTO public.queue_numbers VALUES ('7330cb00-2e85-498e-9ec9-16d2a5a770f6', 'D004', '44688c3b-93b8-4ac6-9d2d-3ebd42151e5c', '00000000-0000-0000-0000-000000000001', '2025-12-28', 4, 'ACTIVE', NULL, NULL, '2025-12-28 20:15:01.808318');


--
-- Data for Name: recipe_ingredients; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.recipe_ingredients VALUES ('e7bb9d71-e49f-4352-995e-86e6603a02f1', '2232a1c8-e20c-4309-a855-73c8c9012791', '550e8400-e29b-41d4-a716-446655440001', 30.000, 'ml', '2025-12-28 05:54:32.264264', '威士忌', '室温');


--
-- Data for Name: reservation_items; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: reservation_operation_logs; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.reservation_operation_logs VALUES ('5c84dd61-175c-494c-8e9c-09b3cbe4d8bd', 'e28af496-4512-4f05-868c-05617a5dcf93', 'CREATE', '79e267ab-bf16-4964-a3fd-324edddfc72e', NULL, NULL, '{"status": "PENDING"}', '2025-12-24 08:54:40.01277+00', NULL, '用户创建预约单');


--
-- Data for Name: reservation_orders; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.reservation_orders VALUES ('e28af496-4512-4f05-868c-05617a5dcf93', 'R202512241654391165', '79e267ab-bf16-4964-a3fd-324edddfc72e', '00000000-0003-0000-0000-000000000003', '00000000-0003-0002-0000-000000000001', '00000000-0003-0004-0000-000000000011', '2025-12-27', '15:00:00', '李宁', '15801491881', NULL, 2999.00, 'PENDING', false, NULL, NULL, 0, '2025-12-24 08:54:40.003803+00', '2025-12-24 08:54:40.003805+00', NULL, NULL);


--
-- Data for Name: scenario_package_store_associations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.scenario_package_store_associations VALUES ('da64aec0-a71f-46d2-9052-3df9787da763', '88f0546b-fd0e-458f-9bc7-389d672912f8', '11111111-1111-1111-1111-111111111111', '2025-12-21 11:58:55.448376+00', NULL);


--
-- Data for Name: scenario_packages; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.scenario_packages VALUES ('00000000-0003-0000-0000-000000000003', '00000000-0003-0000-0000-000000000003', 1, '求婚惊喜专场', '打造最浪漫的求婚时刻，提供灯光布置、鲜花装饰和专业摄影服务', 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800', 'PUBLISHED', true, 0, '2025-12-21 07:52:55.457732+00', '2025-12-21 07:52:55.457732+00', NULL, 'system', 'MOVIE', 5.00, '["求婚", "惊喜", "浪漫"]');
INSERT INTO public.scenario_packages VALUES ('00000000-0001-0000-0000-000000000001', '00000000-0001-0000-0000-000000000001', 1, 'Data Base VIP 生日派对专场', '为您打造独一无二的生日派对体验，包含豪华影厅、精美布置和定制服务', 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800', 'PUBLISHED', true, 0, '2025-12-21 07:52:55.457732+00', '2025-12-21 08:57:44.90636+00', NULL, 'system', 'PARTY', 4.60, '["生日", "派对", "VIP", "浪漫"]');
INSERT INTO public.scenario_packages VALUES ('00000000-0002-0000-0000-000000000002', '00000000-0002-0000-0000-000000000002', 1, 'DataBase 企业年会包场', '专业的企业活动场地，配备先进的音响和投影设备，适合年会、团建等商务活动', 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800', 'PUBLISHED', true, 0, '2025-12-21 07:52:55.457732+00', '2025-12-21 08:58:00.935905+00', NULL, 'system', 'TEAM', 4.80, '["年会", "团建", "商务"]');
INSERT INTO public.scenario_packages VALUES ('88f0546b-fd0e-458f-9bc7-389d672912f8', NULL, 1, 'Package Without Stores', 'This should fail validation', NULL, 'DRAFT', true, 0, '2025-12-21 11:46:13.868115+00', '2025-12-21 11:46:13.868115+00', NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.scenario_packages VALUES ('5c9e44fc-7973-4e1e-bc81-824b345733fc', NULL, 1, 'Postman Test Package 1766317565801 - Updated', 'Test package created by Postman for API testing', NULL, 'DRAFT', true, 2, '2025-12-21 11:46:06.0851+00', '2025-12-21 11:46:16.247852+00', '2025-12-21 11:46:16.200328+00', NULL, NULL, NULL, NULL);


--
-- Data for Name: skus; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.skus VALUES ('079dbcb1-7f8b-45b0-afac-110abcd40603', 'FIN-可口可乐-001', '可口可乐', '3c5ab743-7f3f-43e1-b758-06d5270c7d18', 'finished_product', '份', '{}', 8.00, 0.00, 'enabled', '2025-12-28 01:33:37.07211', '2025-12-28 01:33:37.07211', 0.00, NULL, 0);
INSERT INTO public.skus VALUES ('636bb162-2df3-42b6-bf29-7ca4c5867ccc', 'FIN-美式咖啡-002', '美式咖啡', 'ae3e91f0-b99e-43c8-8afa-97b27382b247', 'finished_product', '份', '{}', 0.25, 0.00, 'enabled', '2025-12-28 12:23:46.002054', '2025-12-28 12:25:39.262666', 0.00, NULL, 0);
INSERT INTO public.skus VALUES ('4fb0d962-21d6-47d3-b29b-61d09569eae9', 'FIN-美式咖啡-003', '美式咖啡', 'c235f8c8-0849-4f68-8dfe-31e5c7d704f0', 'finished_product', '份', '{}', 0.25, 0.00, 'enabled', '2025-12-28 12:23:53.481524', '2025-12-28 12:23:53.481547', 0.00, NULL, 0);
INSERT INTO public.skus VALUES ('d89b55a7-c6bf-4633-b13b-38549338a2f5', 'FIN-鸡尾酒-004', '鸡尾酒', '713bb7e6-211f-46d3-b652-edf46b915e22', 'finished_product', '份', '{}', 40.00, 0.00, 'enabled', '2025-12-31 11:26:28.40623', '2025-12-31 11:26:28.406261', 0.00, NULL, 0);
INSERT INTO public.skus VALUES ('2f7882fa-1975-48f4-b79b-8a3355bdb7c7', 'SKU1766640751597', '经典马提尼', '00000000-0000-0000-0000-000000000003', 'finished_product', '份', '{}', 7.20, 0.00, 'enabled', '2025-12-25 05:32:32.773041', '2025-12-25 05:32:32.773041', 28.00, NULL, 1);
INSERT INTO public.skus VALUES ('95667979-e926-471c-9935-7624ae91a661', 'SKU1766632319745', '芝士爆米花(中)', '00000000-0000-0000-0000-000000000004', 'finished_product', '份', '{}', 0.00, 0.00, 'enabled', '2025-12-25 03:12:01.161414', '2025-12-25 03:12:01.161414', 0.00, NULL, 1);
INSERT INTO public.skus VALUES ('dc2a168f-884c-49c8-aa81-1b708e54a80e', 'SKU1766632207661', '测试饮品', '00000000-0000-0000-0000-000000000003', 'finished_product', '份', '{}', 0.00, 0.00, 'enabled', '2025-12-25 03:10:08.699656', '2025-12-25 03:10:08.699656', 0.00, NULL, 1);
INSERT INTO public.skus VALUES ('c09f3a0f-e8e0-40d8-804c-5cec09142f4f', 'SKU_CURL_TEST4', '测试饮品CURL4', '00000000-0000-0000-0000-000000000003', 'finished_product', '份', '{}', 1.00, 0.00, 'enabled', '2025-12-25 03:09:56.411101', '2025-12-25 03:09:56.411101', 0.00, NULL, 1);
INSERT INTO public.skus VALUES ('68a96dac-4280-4ec9-b6b9-9e21c10bb002', 'SKU_CURL_TEST3', '测试饮品CURL3', '00000000-0000-0000-0000-000000000003', 'finished_product', '份', '{}', 0.00, 0.00, 'enabled', '2025-12-25 03:08:34.179714', '2025-12-25 03:08:34.179714', 0.00, NULL, 1);
INSERT INTO public.skus VALUES ('563d6e19-9752-4de3-9990-cb8185ae9faa', 'SKU_TEST_123', '测试饮品', '00000000-0000-0000-0000-000000000003', 'finished_product', '份', '{}', 0.00, 0.00, 'enabled', '2025-12-25 03:03:50.590169', '2025-12-25 03:03:50.590169', 0.00, NULL, 1);
INSERT INTO public.skus VALUES ('550e8400-e29b-41d4-a716-446655440004', '6901234567004', '玉米粒', '00000000-0000-0000-0000-000000000001', 'raw_material', 'g', '{}', 0.01, 0.00, 'enabled', '2025-12-24 14:21:32.899938', '2025-12-24 14:21:32.899938', 0.00, NULL, 1);
INSERT INTO public.skus VALUES ('550e8400-e29b-41d4-a716-446655440005', '6901234567005', '黄油', '00000000-0000-0000-0000-000000000001', 'raw_material', 'g', '{}', 0.05, 0.00, 'enabled', '2025-12-24 14:21:32.899938', '2025-12-24 14:21:32.899938', 0.00, NULL, 1);
INSERT INTO public.skus VALUES ('550e8400-e29b-41d4-a716-446655440031', '6901234567031', '经典观影套餐', '00000000-0000-0000-0000-000000000005', 'combo', '份', '{}', 47.86, 0.00, 'enabled', '2025-12-24 14:21:32.899938', '2025-12-24 14:21:32.899938', 0.00, NULL, 1);
INSERT INTO public.skus VALUES ('550e8400-e29b-41d4-a716-446655440032', '6901234567032', '豪华观影套餐', '00000000-0000-0000-0000-000000000005', 'combo', '份', '{}', 91.47, 0.00, 'enabled', '2025-12-24 14:21:32.899938', '2025-12-24 14:21:32.899938', 0.00, NULL, 1);
INSERT INTO public.skus VALUES ('550e8400-e29b-41d4-a716-446655440033', '6901234567033', '情侣畅饮套餐', '00000000-0000-0000-0000-000000000005', 'combo', '份', '{}', 60.38, 0.00, 'enabled', '2025-12-24 14:21:32.899938', '2025-12-24 14:21:32.899938', 0.00, NULL, 1);
INSERT INTO public.skus VALUES ('550e8400-e29b-41d4-a716-446655440026', '6901234567026', '奶油爆米花(大)', '00000000-0000-0000-0000-000000000004', 'finished_product', '桶', '{}', 15.86, 8.00, 'enabled', '2025-12-24 14:21:32.899938', '2025-12-24 14:21:32.899938', 0.00, '22222222-2222-2222-2222-222222222222', 1);
INSERT INTO public.skus VALUES ('ee27ec31-0b25-4f13-8173-6a6707c8275d', 'SKU1766645006984', '测试套餐-Chrome验证', '00000000-0000-0000-0000-000000000005', 'combo', '份', '{b617e3f0-ef09-4810-8ddf-8877a73b06f4,c0afa7d7-4fcf-4740-8fad-0f8b4a1aceba,c32577e7-05b8-4c9f-901b-5f4275ecacba}', 54.20, 0.00, 'enabled', '2025-12-25 06:43:28.504472', '2025-12-25 06:43:28.504472', 80.00, NULL, 1);
INSERT INTO public.skus VALUES ('21a1052b-a15c-466e-b573-01c24e63e87b', 'SKU1766637455635', '高脚杯', '00000000-0000-0000-0000-000000000002', 'packaging', '份', '{}', 1.50, 0.00, 'enabled', '2025-12-25 04:37:37.490212', '2025-12-25 04:37:37.490212', 0.00, NULL, 1);
INSERT INTO public.skus VALUES ('550e8400-e29b-41d4-a716-446655440027', '6901234567027', '黄油爆米花(大)', '00000000-0000-0000-0000-000000000004', 'finished_product', '桶', '{}', 15.75, 8.00, 'enabled', '2025-12-24 14:21:32.899938', '2025-12-24 14:21:32.899938', 0.00, '22222222-2222-2222-2222-222222222222', 1);
INSERT INTO public.skus VALUES ('550e8400-e29b-41d4-a716-446655440028', '6901234567028', '焦糖爆米花(小)', '00000000-0000-0000-0000-000000000004', 'finished_product', '袋', '{}', 8.10, 5.00, 'enabled', '2025-12-24 14:21:32.899938', '2025-12-24 14:21:32.899938', 0.00, '22222222-2222-2222-2222-222222222222', 1);
INSERT INTO public.skus VALUES ('550e8400-e29b-41d4-a716-446655440011', '6901234567011', '玻璃杯', '00000000-0000-0000-0000-000000000002', 'packaging', '个', '{}', 1.00, 0.00, 'enabled', '2025-12-24 14:21:32.899938', '2025-12-24 14:21:32.899938', 0.00, '11111111-1111-1111-1111-111111111114', 1);
INSERT INTO public.skus VALUES ('550e8400-e29b-41d4-a716-446655440012', '6901234567012', '纸杯', '00000000-0000-0000-0000-000000000002', 'packaging', '个', '{}', 0.30, 0.00, 'enabled', '2025-12-24 14:21:32.899938', '2025-12-24 14:21:32.899938', 0.00, '11111111-1111-1111-1111-111111111114', 1);
INSERT INTO public.skus VALUES ('23ba9c9b-58a7-4b19-86b4-b4c65a21c189', 'SKU1766642685681', '威士忌可乐鸡尾酒', '00000000-0000-0000-0000-000000000003', 'finished_product', '份', '{}', 27.10, 0.00, 'enabled', '2025-12-25 06:04:46.804812', '2025-12-25 06:04:46.804812', 0.00, NULL, 1);
INSERT INTO public.skus VALUES ('550e8400-e29b-41d4-a716-446655440001', '6901234567001', '威士忌', '00000000-0000-0000-0000-000000000001', 'raw_material', 'ml', '{}', 0.50, 0.00, 'enabled', '2025-12-24 14:21:32.899938', '2025-12-24 14:21:32.899938', 0.00, '11111111-1111-1111-1111-111111111111', 1);
INSERT INTO public.skus VALUES ('550e8400-e29b-41d4-a716-446655440002', '6901234567002', '可乐糖浆', '00000000-0000-0000-0000-000000000001', 'raw_material', 'ml', '{}', 0.02, 0.00, 'enabled', '2025-12-24 14:21:32.899938', '2025-12-24 14:21:32.899938', 0.00, '11111111-1111-1111-1111-111111111111', 1);
INSERT INTO public.skus VALUES ('550e8400-e29b-41d4-a716-446655440013', '6901234567013', '吸管', '00000000-0000-0000-0000-000000000002', 'packaging', '根', '{}', 0.10, 0.00, 'enabled', '2025-12-24 14:21:32.899938', '2025-12-24 14:21:32.899938', 0.00, '11111111-1111-1111-1111-111111111114', 1);
INSERT INTO public.skus VALUES ('550e8400-e29b-41d4-a716-446655440003', '6901234567003', '薄荷叶', '00000000-0000-0000-0000-000000000001', 'raw_material', '片', '{}', 0.50, 0.00, 'enabled', '2025-12-24 14:21:32.899938', '2025-12-24 14:21:32.899938', 0.00, '11111111-1111-1111-1111-111111111111', 1);
INSERT INTO public.skus VALUES ('550e8400-e29b-41d4-a716-446655440024', '6901234567024', '听装可乐', '00000000-0000-0000-0000-000000000003', 'finished_product', '听', '{}', 3.00, 0.00, 'enabled', '2025-12-24 14:21:32.899938', '2025-12-24 14:21:32.899938', 0.00, '11111111-1111-1111-1111-111111111111', 1);
INSERT INTO public.skus VALUES ('550e8400-e29b-41d4-a716-446655440025', '6901234567025', '瓶装啤酒', '00000000-0000-0000-0000-000000000003', 'finished_product', '瓶', '{}', 8.00, 0.00, 'enabled', '2025-12-24 14:21:32.899938', '2025-12-24 14:21:32.899938', 0.00, '11111111-1111-1111-1111-111111111111', 1);
INSERT INTO public.skus VALUES ('550e8400-e29b-41d4-a716-446655440021', '6901234567021', '威士忌可乐', '00000000-0000-0000-0000-000000000003', 'finished_product', '份', '{}', 29.93, 5.00, 'enabled', '2025-12-24 14:21:32.899938', '2025-12-25 11:54:24.588384', 0.00, '11111111-1111-1111-1111-111111111111', 1);
INSERT INTO public.skus VALUES ('550e8400-e29b-41d4-a716-446655440014', '6901234567014', '爆米花桶(大)', '00000000-0000-0000-0000-000000000002', 'packaging', '个', '{}', 1.50, 0.00, 'enabled', '2025-12-24 14:21:32.899938', '2025-12-24 14:21:32.899938', 0.00, '11111111-1111-1111-1111-111111111114', 1);
INSERT INTO public.skus VALUES ('550e8400-e29b-41d4-a716-446655440015', '6901234567015', '爆米花袋(小)', '00000000-0000-0000-0000-000000000002', 'packaging', '个', '{}', 0.50, 0.00, 'enabled', '2025-12-24 14:21:32.899938', '2025-12-24 14:21:32.899938', 0.00, '11111111-1111-1111-1111-111111111114', 1);
INSERT INTO public.skus VALUES ('550e8400-e29b-41d4-a716-446655440022', '6901234567022', '薄荷威士忌', '00000000-0000-0000-0000-000000000003', 'finished_product', '份', '{}', 27.72, 5.00, 'enabled', '2025-12-24 14:21:32.899938', '2025-12-24 14:21:32.899938', 0.00, '11111111-1111-1111-1111-111111111111', 1);
INSERT INTO public.skus VALUES ('550e8400-e29b-41d4-a716-446655440023', '6901234567023', '冰镇可乐', '00000000-0000-0000-0000-000000000003', 'finished_product', '份', '{}', 5.40, 0.00, 'enabled', '2025-12-24 14:21:32.899938', '2025-12-24 14:21:32.899938', 0.00, '11111111-1111-1111-1111-111111111111', 1);
INSERT INTO public.skus VALUES ('11111111-0000-0000-0000-000000000001', 'RAW-WHISKEY', '威士忌', '99999999-0000-0000-0000-000000000001', 'raw_material', 'ml', '{}', NULL, 0.00, 'enabled', '2025-12-29 12:14:09.234575', '2025-12-29 12:14:09.234575', 0.00, NULL, 1);
INSERT INTO public.skus VALUES ('11111111-0000-0000-0000-000000000002', 'RAW-COLA', '可乐', '99999999-0000-0000-0000-000000000001', 'raw_material', 'ml', '{}', NULL, 0.00, 'enabled', '2025-12-29 12:14:09.234575', '2025-12-29 12:14:09.234575', 0.00, NULL, 1);
INSERT INTO public.skus VALUES ('11111111-0000-0000-0000-000000000003', 'RAW-CUP', '杯子', '99999999-0000-0000-0000-000000000001', 'raw_material', '个', '{}', NULL, 0.00, 'enabled', '2025-12-29 12:14:09.234575', '2025-12-29 12:14:09.234575', 0.00, NULL, 1);
INSERT INTO public.skus VALUES ('11111111-0000-0000-0000-000000000004', 'RAW-STRAW', '吸管', '99999999-0000-0000-0000-000000000001', 'raw_material', '根', '{}', NULL, 0.00, 'enabled', '2025-12-29 12:14:09.234575', '2025-12-29 12:14:09.234575', 0.00, NULL, 1);
INSERT INTO public.skus VALUES ('22222222-0000-0000-0000-000000000002', 'FIN-COMBO', '观影套餐', '99999999-0000-0000-0000-000000000002', 'finished_product', '份', '{}', NULL, 0.00, 'enabled', '2025-12-29 12:14:09.234575', '2025-12-29 12:14:09.234575', 0.00, NULL, 1);
INSERT INTO public.skus VALUES ('22222222-0000-0000-0000-000000000001', 'FIN-COCKTAIL', '威士忌可乐鸡尾酒', '99999999-0000-0000-0000-000000000002', 'finished_product', '份', '{}', 0.00, 0.00, 'enabled', '2025-12-29 12:14:09.234575', '2025-12-29 12:14:09.234575', 0.00, NULL, 1);


--
-- Data for Name: slot_inventory_snapshots; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.slot_inventory_snapshots VALUES ('b1e02199-37b9-4ab7-8b3a-c0e3b16f6f8a', 'e28af496-4512-4f05-868c-05617a5dcf93', '00000000-0003-0004-0000-000000000011', '2025-12-27', 3, 1, 2, '2025-12-24 08:54:40.790434+00');


--
-- Data for Name: spus; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.spus VALUES ('00000000-0000-0000-0000-000000000001', 'SPU000001', '调酒原料', '调酒原料', '用于调制各类鸡尾酒的基础原料', 'cat_raw', '原料 > 基础原料', 'a5305db9-026d-4993-83c9-a9363fa22b8b', '通用原料', 'active', '份', '{原料,调酒,基础}', '[]', '[{"name": "容量", "value": "标准"}, {"name": "类型", "value": "基础原料"}]', '[]', '2025-12-25 00:50:54.047786+00', '2025-12-25 00:50:54.047786+00', 'system', 'system', 'raw_material');
INSERT INTO public.spus VALUES ('00000000-0000-0000-0000-000000000002', 'SPU000002', '杯具包材', '杯具包材', '各类杯具和包装材料', 'cat_pack', '包材 > 容器包装', 'd7026962-c0ef-47e2-9b15-275ef1c98784', '通用包材', 'active', '个', '{包材,杯具,容器}', '[]', '[{"name": "材质", "value": "食品级"}, {"name": "规格", "value": "通用"}]', '[]', '2025-12-25 00:50:54.047786+00', '2025-12-25 00:50:54.047786+00', 'system', 'system', 'packaging');
INSERT INTO public.spus VALUES ('00000000-0000-0000-0000-000000000003', 'SPU000003', '特调饮品', '特调饮品', '影院自制特调饮品系列', 'cat_drink', '成品 > 饮品', '485841cd-decc-402c-a081-01c6bfac30df', '自制饮品', 'active', '杯', '{饮品,特调,成品}', '[]', '[{"name": "容量", "value": "中杯/大杯"}, {"name": "温度", "value": "冰/常温"}]', '[]', '2025-12-25 00:50:54.047786+00', '2025-12-25 00:50:54.047786+00', 'system', 'system', 'finished_product');
INSERT INTO public.spus VALUES ('00000000-0000-0000-0000-000000000004', 'SPU000004', '爆米花', '爆米花', '影院自制爆米花系列', 'cat_snack', '成品 > 零食', '017b1dcd-8794-4e21-83d4-0790513b91ba', '自制爆米花', 'active', '份', '{爆米花,零食,成品}', '[]', '[{"name": "口味", "value": "原味/焦糖/奶油"}, {"name": "份量", "value": "小/中/大"}]', '[]', '2025-12-25 00:50:54.047786+00', '2025-12-25 00:50:54.047786+00', 'system', 'system', 'finished_product');
INSERT INTO public.spus VALUES ('00000000-0000-0000-0000-000000000005', 'SPU000005', '观影套餐', '观影套餐', '影院观影套餐组合', 'cat_combo', '套餐 > 观影套餐', 'ca26d881-4663-4626-96b1-9cda00b0855d', '影院套餐', 'active', '份', '{套餐,观影,组合}', '[]', '[{"name": "人数", "value": "单人/双人"}, {"name": "类型", "value": "经典/豪华"}]', '[]', '2025-12-25 00:50:54.047786+00', '2025-12-25 00:50:54.047786+00', 'system', 'system', 'combo');
INSERT INTO public.spus VALUES ('99999999-0000-0000-0000-000000000001', 'SPU-RAW-MATERIALS', 'P005测试原料SPU', NULL, NULL, NULL, NULL, NULL, NULL, 'enabled', NULL, NULL, '[]', '[]', '[]', '2025-12-29 12:14:09.234575+00', '2025-12-29 12:14:09.234575+00', NULL, NULL, NULL);
INSERT INTO public.spus VALUES ('99999999-0000-0000-0000-000000000002', 'SPU-FINISHED-PRODUCTS', 'P005测试成品SPU', NULL, NULL, NULL, NULL, NULL, NULL, 'enabled', NULL, NULL, '[]', '[]', '[]', '2025-12-29 12:14:09.234575+00', '2025-12-29 12:14:09.234575+00', NULL, NULL, NULL);


--
-- Data for Name: store_inventory; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.store_inventory VALUES ('08db89c7-1757-41ff-9dff-dfae0b928b81', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', '550e8400-e29b-41d4-a716-446655440024', 0.000, 0.000, 0.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('62d4e4df-f234-4f68-a979-dfa9706fe3f3', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000001', 820.000, 775.000, 810.000, 0.000, '2025-12-29 12:14:09.234575+00', '2025-12-29 13:33:54.129324+00', 1);
INSERT INTO public.store_inventory VALUES ('613b85f3-5dc2-4346-a058-712bcf0f8d20', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', '550e8400-e29b-41d4-a716-446655440028', 5.000, 3.000, 2.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-26 09:42:31.062733+00', 1);
INSERT INTO public.store_inventory VALUES ('0882ed60-6c03-4dda-bc54-7b2cbb7de555', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000002', 4400.000, 4250.000, 2700.000, 0.000, '2025-12-29 12:14:09.234575+00', '2025-12-29 13:33:54.129324+00', 1);
INSERT INTO public.store_inventory VALUES ('d263a3f0-9d2a-4cd5-aa6f-d7ac24e11924', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000003', 96.000, 95.000, 18.000, 0.000, '2025-12-29 12:14:09.234575+00', '2025-12-29 13:33:54.129324+00', 1);
INSERT INTO public.store_inventory VALUES ('f7a7b7ed-9cb9-4c6a-829d-89555dece947', '00000000-0000-0000-0000-000000000099', '11111111-0000-0000-0000-000000000004', 196.000, 195.000, 18.000, 0.000, '2025-12-29 12:14:09.234575+00', '2025-12-29 13:33:54.129324+00', 1);
INSERT INTO public.store_inventory VALUES ('c7e6d82a-7de3-46ed-8e8f-ddfc470a8dbe', 'b6684b23-3587-4602-9f54-695cb9527424', '550e8400-e29b-41d4-a716-446655440004', 3003.000, 2872.000, 131.000, 1000.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('620027e0-6b56-4604-85ba-c68b8dee2b48', 'b6684b23-3587-4602-9f54-695cb9527424', '563d6e19-9752-4de3-9990-cb8185ae9faa', 296.000, 276.000, 20.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('b06c7d4b-d112-431c-b96c-400ec42f6982', 'b6684b23-3587-4602-9f54-695cb9527424', '68a96dac-4280-4ec9-b6b9-9e21c10bb002', 126.000, 110.000, 16.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('a8a6c797-3931-42fd-a22b-1de68bfa22e3', 'b6684b23-3587-4602-9f54-695cb9527424', 'c09f3a0f-e8e0-40d8-804c-5cec09142f4f', 125.000, 105.000, 20.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('332af73c-908d-4b76-897b-045ca9481c8b', 'b6684b23-3587-4602-9f54-695cb9527424', 'dc2a168f-884c-49c8-aa81-1b708e54a80e', 219.000, 207.000, 12.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('7d71149e-06d4-4e27-86c0-ca42190ae5dd', 'b6684b23-3587-4602-9f54-695cb9527424', '95667979-e926-471c-9935-7624ae91a661', 117.000, 97.000, 20.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('9a071c2f-3d57-4797-9369-104beb3885b3', 'b6684b23-3587-4602-9f54-695cb9527424', '550e8400-e29b-41d4-a716-446655440027', 195.000, 184.000, 11.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('c61d8294-9542-4f89-a1c8-1cfa3167572f', 'b6684b23-3587-4602-9f54-695cb9527424', '550e8400-e29b-41d4-a716-446655440028', 297.000, 288.000, 9.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('dc7f2306-3b6e-4c94-947c-d2370901c831', 'b6684b23-3587-4602-9f54-695cb9527424', '21a1052b-a15c-466e-b573-01c24e63e87b', 1099.000, 1059.000, 40.000, 200.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('810b4a79-2ae1-4daa-adb1-48520733d407', 'b6684b23-3587-4602-9f54-695cb9527424', '550e8400-e29b-41d4-a716-446655440011', 1215.000, 1181.000, 34.000, 200.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('097f80be-a1d1-4414-95e8-cf71aef59343', 'b6684b23-3587-4602-9f54-695cb9527424', '550e8400-e29b-41d4-a716-446655440012', 799.000, 787.000, 12.000, 200.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('dabbbeaa-bd5d-40b8-b9be-9df3035450a1', 'b6684b23-3587-4602-9f54-695cb9527424', '23ba9c9b-58a7-4b19-86b4-b4c65a21c189', 225.000, 207.000, 18.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('33ee7fb2-49c2-4dc4-8571-966b9cb3db4a', 'b6684b23-3587-4602-9f54-695cb9527424', '2f7882fa-1975-48f4-b79b-8a3355bdb7c7', 239.000, 220.000, 19.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('eadd292b-7c9f-4689-9ddf-f04d5a722128', 'b6684b23-3587-4602-9f54-695cb9527424', '550e8400-e29b-41d4-a716-446655440001', 3075.000, 2853.000, 222.000, 1000.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('c79ba4e2-fb29-4964-800d-a42f6fd565c2', 'b6684b23-3587-4602-9f54-695cb9527424', '550e8400-e29b-41d4-a716-446655440002', 6736.000, 6557.000, 179.000, 1000.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('3c661638-8e16-46ff-aa2d-6eecc35a7446', 'b6684b23-3587-4602-9f54-695cb9527424', '550e8400-e29b-41d4-a716-446655440013', 1330.000, 1281.000, 49.000, 200.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('35be523f-dbcc-48d8-a095-eed9931d80b9', 'b6684b23-3587-4602-9f54-695cb9527424', '550e8400-e29b-41d4-a716-446655440003', 3379.000, 3271.000, 108.000, 1000.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('3597b98e-cc2f-49e5-b5f5-42b5a9d7a846', 'b6684b23-3587-4602-9f54-695cb9527424', '550e8400-e29b-41d4-a716-446655440024', 154.000, 149.000, 5.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('3b6a22d4-65c1-4a57-b734-f8dfc8110296', 'b6684b23-3587-4602-9f54-695cb9527424', '550e8400-e29b-41d4-a716-446655440025', 205.000, 195.000, 10.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('8f865bad-fc41-4080-863a-e8cdfb7222e2', 'b6684b23-3587-4602-9f54-695cb9527424', '550e8400-e29b-41d4-a716-446655440021', 166.000, 143.000, 23.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('7dfdcf4a-a443-4a8b-8e96-a72075731eac', 'b6684b23-3587-4602-9f54-695cb9527424', '550e8400-e29b-41d4-a716-446655440014', 945.000, 896.000, 49.000, 200.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('44451dee-4fbb-4475-9a2e-804820b6f291', 'b6684b23-3587-4602-9f54-695cb9527424', '550e8400-e29b-41d4-a716-446655440015', 660.000, 615.000, 45.000, 200.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('ab811172-9d45-4e2e-b178-67df1a17d214', 'b6684b23-3587-4602-9f54-695cb9527424', '550e8400-e29b-41d4-a716-446655440022', 119.000, 108.000, 11.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('efda1722-6fff-42c9-8d65-36f9bdd9a148', 'b6684b23-3587-4602-9f54-695cb9527424', '550e8400-e29b-41d4-a716-446655440023', 220.000, 209.000, 11.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('6aa90c9e-b645-4492-9b49-0c42e5b711e0', '70e95860-fb84-487b-96a3-a12de8f6aca6', '550e8400-e29b-41d4-a716-446655440004', 1183.000, 1100.000, 83.000, 1000.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('50f22de7-a3b2-46c6-b24f-4611272acd72', '70e95860-fb84-487b-96a3-a12de8f6aca6', '550e8400-e29b-41d4-a716-446655440005', 516.000, 428.000, 88.000, 1000.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('1d1b7d4a-05e5-4295-a4bb-b9193814629b', '70e95860-fb84-487b-96a3-a12de8f6aca6', '550e8400-e29b-41d4-a716-446655440026', 68.000, 65.000, 3.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('6f3b0683-2273-49f0-b124-6720402334fb', '70e95860-fb84-487b-96a3-a12de8f6aca6', '563d6e19-9752-4de3-9990-cb8185ae9faa', 60.000, 58.000, 2.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('cea03416-3aab-4ab1-80a6-e48f2133ad21', '70e95860-fb84-487b-96a3-a12de8f6aca6', '68a96dac-4280-4ec9-b6b9-9e21c10bb002', 25.000, 15.000, 10.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('d9dd267c-759d-4596-8f7a-7d5b9068420e', '70e95860-fb84-487b-96a3-a12de8f6aca6', 'c09f3a0f-e8e0-40d8-804c-5cec09142f4f', 57.000, 49.000, 8.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('f86f2c34-fd83-461c-9e8f-a2d19d0b442a', '70e95860-fb84-487b-96a3-a12de8f6aca6', 'dc2a168f-884c-49c8-aa81-1b708e54a80e', 57.000, 51.000, 6.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('d7fedc80-8ce0-40b5-ade0-9b731124cbfb', '70e95860-fb84-487b-96a3-a12de8f6aca6', '95667979-e926-471c-9935-7624ae91a661', 64.000, 53.000, 11.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('70318ac4-d8e3-4659-ab15-9dc84da7d81a', '70e95860-fb84-487b-96a3-a12de8f6aca6', '550e8400-e29b-41d4-a716-446655440027', 51.000, 42.000, 9.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('0efe029d-f463-482f-95f4-b9edc24228ba', '70e95860-fb84-487b-96a3-a12de8f6aca6', '550e8400-e29b-41d4-a716-446655440028', 59.000, 50.000, 9.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('774f78ab-c218-4e9a-a381-cd3e24d25829', '70e95860-fb84-487b-96a3-a12de8f6aca6', '21a1052b-a15c-466e-b573-01c24e63e87b', 371.000, 338.000, 33.000, 200.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('ea32eeb8-b064-4735-af7d-69232e898417', '70e95860-fb84-487b-96a3-a12de8f6aca6', '550e8400-e29b-41d4-a716-446655440011', 252.000, 237.000, 15.000, 200.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('59902714-c04d-4025-8628-d152f0d32cf1', '70e95860-fb84-487b-96a3-a12de8f6aca6', '550e8400-e29b-41d4-a716-446655440012', 180.000, 167.000, 13.000, 200.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('6b019589-3e06-4cfd-9b94-90b4b5715a43', '70e95860-fb84-487b-96a3-a12de8f6aca6', '23ba9c9b-58a7-4b19-86b4-b4c65a21c189', 58.000, 48.000, 10.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('961d4e59-9613-4cf1-a529-8f81eafdcc04', '70e95860-fb84-487b-96a3-a12de8f6aca6', '2f7882fa-1975-48f4-b79b-8a3355bdb7c7', 62.000, 57.000, 5.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('a92a7e97-41e0-4ac8-837c-d62879bd2d3e', '70e95860-fb84-487b-96a3-a12de8f6aca6', '550e8400-e29b-41d4-a716-446655440001', 401.000, 329.000, 72.000, 1000.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('fd61c21e-3950-4ef8-a5f5-a72bb7d9dc92', '70e95860-fb84-487b-96a3-a12de8f6aca6', '550e8400-e29b-41d4-a716-446655440002', 323.000, 216.000, 107.000, 1000.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('8a4355ea-7ad7-4e4a-83cb-8afad2e2acee', '70e95860-fb84-487b-96a3-a12de8f6aca6', '550e8400-e29b-41d4-a716-446655440013', 300.000, 288.000, 12.000, 200.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('8b532bf9-0abc-423e-a170-09c275c5328e', '70e95860-fb84-487b-96a3-a12de8f6aca6', '550e8400-e29b-41d4-a716-446655440003', 650.000, 620.000, 30.000, 1000.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('7af2f26f-a88d-49f5-a3a5-55a50f0347ac', '70e95860-fb84-487b-96a3-a12de8f6aca6', '550e8400-e29b-41d4-a716-446655440024', 33.000, 26.000, 7.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('aa40db95-6be2-4d40-b19f-292c18a33195', '70e95860-fb84-487b-96a3-a12de8f6aca6', '550e8400-e29b-41d4-a716-446655440025', 32.000, 28.000, 4.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('45585210-7441-422d-b122-ac21aa37edb6', '70e95860-fb84-487b-96a3-a12de8f6aca6', '550e8400-e29b-41d4-a716-446655440021', 50.000, 43.000, 7.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('8e569344-8787-4f4f-90d3-1c2025f35fef', '70e95860-fb84-487b-96a3-a12de8f6aca6', '550e8400-e29b-41d4-a716-446655440014', 247.000, 233.000, 14.000, 200.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('41341414-64b4-49e1-9be6-f5e08b71d270', '70e95860-fb84-487b-96a3-a12de8f6aca6', '550e8400-e29b-41d4-a716-446655440015', 390.000, 365.000, 25.000, 200.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('bea5fc61-e397-4407-80fa-3f3079f64949', '70e95860-fb84-487b-96a3-a12de8f6aca6', '550e8400-e29b-41d4-a716-446655440022', 41.000, 36.000, 5.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('5af720af-f7ac-4004-9ff3-56b5a2b5a30e', '70e95860-fb84-487b-96a3-a12de8f6aca6', '550e8400-e29b-41d4-a716-446655440023', 31.000, 21.000, 10.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('a3df4445-3575-4552-86db-65d7fa06c247', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', '550e8400-e29b-41d4-a716-446655440004', 390.000, 379.000, 11.000, 1000.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('521c3f41-c72a-4f02-adb0-b8a3e0063705', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', '550e8400-e29b-41d4-a716-446655440005', 223.000, 188.000, 35.000, 1000.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('9aacc004-9503-4ee6-a3f0-ab89e89fde91', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', '550e8400-e29b-41d4-a716-446655440026', 39.000, 34.000, 5.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('19f3704b-6689-4ce3-a072-00a5c4bc65fd', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', '563d6e19-9752-4de3-9990-cb8185ae9faa', 16.000, 15.000, 1.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('9bb4ce0f-6d7f-4ddf-a197-65ae7aa633f7', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', '68a96dac-4280-4ec9-b6b9-9e21c10bb002', 11.000, 9.000, 2.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('9be1ad21-6a15-407d-8cd1-c8ffb8dcb733', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', 'c09f3a0f-e8e0-40d8-804c-5cec09142f4f', 14.000, 9.000, 5.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('4b2636a1-750b-4955-984d-035960d1aff6', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', 'dc2a168f-884c-49c8-aa81-1b708e54a80e', 12.000, 9.000, 3.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('61324b5a-410e-463d-992c-c234dcf49b81', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', '95667979-e926-471c-9935-7624ae91a661', 23.000, 20.000, 3.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('6caba758-bb68-4c26-8169-365ed54b9530', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', '550e8400-e29b-41d4-a716-446655440027', 32.000, 28.000, 4.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('91081b96-427f-4bdd-a6cd-88510703b112', 'b6684b23-3587-4602-9f54-695cb9527424', '550e8400-e29b-41d4-a716-446655440026', 1285.000, 1261.000, 24.000, 70.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('8cc2c4ea-561e-4d70-a9d6-3152dd1e4043', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', '21a1052b-a15c-466e-b573-01c24e63e87b', 87.000, 73.000, 14.000, 200.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('db44c643-e778-4db2-84f8-3628ad7037db', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', '550e8400-e29b-41d4-a716-446655440011', 126.000, 115.000, 11.000, 200.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('1dded835-33a7-4dc3-9d31-2188a5e5b46f', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', '550e8400-e29b-41d4-a716-446655440012', 144.000, 132.000, 12.000, 200.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('bcebdef5-83bf-4c2a-9e07-b0378faea958', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', '23ba9c9b-58a7-4b19-86b4-b4c65a21c189', 24.000, 22.000, 2.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('4b87fa4b-c4ff-4585-a857-fc15ae386ff5', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', '2f7882fa-1975-48f4-b79b-8a3355bdb7c7', 20.000, 17.000, 3.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('40de028e-9c8e-4f36-8ad2-052ba1d0ca29', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', '550e8400-e29b-41d4-a716-446655440001', 167.000, 138.000, 29.000, 1000.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('d289feee-082a-4387-8c83-0594f4df631b', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', '550e8400-e29b-41d4-a716-446655440002', 423.000, 371.000, 52.000, 1000.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('c866f0a8-a9ce-4b82-b7f8-bfb817040ef9', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', '550e8400-e29b-41d4-a716-446655440013', 67.000, 49.000, 18.000, 200.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('3f3df8cf-4f09-44bb-b1f5-eea0e0a990b2', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', '550e8400-e29b-41d4-a716-446655440003', 296.000, 281.000, 15.000, 1000.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('2cdf7190-82c3-4291-8a76-d1996d9d2dda', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', '550e8400-e29b-41d4-a716-446655440025', 33.000, 29.000, 4.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('06bfe0e4-99c4-4bdd-960e-0ada33ef3258', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', '550e8400-e29b-41d4-a716-446655440021', 22.000, 19.000, 3.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('16459e71-a195-43e9-9c42-d1ffe7f8bb12', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', '550e8400-e29b-41d4-a716-446655440014', 121.000, 112.000, 9.000, 200.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('b49c0934-aabb-49fc-a200-fa1cb46cd33d', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', '550e8400-e29b-41d4-a716-446655440015', 75.000, 61.000, 14.000, 200.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('a177c897-f122-49df-8d6a-9c6d818b672e', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', '550e8400-e29b-41d4-a716-446655440022', 23.000, 20.000, 3.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('092c0da7-8bb5-4419-9745-3e80793ed2b8', '62a7e272-acfb-4ed4-8f4b-7adc49d963b3', '550e8400-e29b-41d4-a716-446655440023', 21.000, 18.000, 3.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('e7973ff5-99a9-4418-a348-29ad4a3cc64c', 'f89af6db-3968-4780-9c2e-c23ecc7aa43f', '550e8400-e29b-41d4-a716-446655440004', 3370.000, 3231.000, 139.000, 1000.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('25f80192-9cf2-47a7-827f-6ba8eb95d9ff', 'f89af6db-3968-4780-9c2e-c23ecc7aa43f', '550e8400-e29b-41d4-a716-446655440005', 4289.000, 4233.000, 56.000, 1000.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('68c487aa-c9b4-4a95-ae37-3031d04b9d03', 'f89af6db-3968-4780-9c2e-c23ecc7aa43f', '550e8400-e29b-41d4-a716-446655440026', 158.000, 148.000, 10.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('467276da-7a53-428c-a25e-a607ddcdd012', 'f89af6db-3968-4780-9c2e-c23ecc7aa43f', '563d6e19-9752-4de3-9990-cb8185ae9faa', 119.000, 108.000, 11.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('f78c013c-3ff7-4aaf-ad76-8d5a88cd483d', 'f89af6db-3968-4780-9c2e-c23ecc7aa43f', '68a96dac-4280-4ec9-b6b9-9e21c10bb002', 197.000, 188.000, 9.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('3a8b3828-c6a8-4d0f-b5b2-3cbb9db8d411', 'f89af6db-3968-4780-9c2e-c23ecc7aa43f', 'c09f3a0f-e8e0-40d8-804c-5cec09142f4f', 168.000, 152.000, 16.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('89a25a3f-db38-490c-8620-2ef5dc12fefb', 'f89af6db-3968-4780-9c2e-c23ecc7aa43f', 'dc2a168f-884c-49c8-aa81-1b708e54a80e', 108.000, 105.000, 3.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('3b714757-33c3-4d2b-aba6-7eac369c78d3', 'f89af6db-3968-4780-9c2e-c23ecc7aa43f', '95667979-e926-471c-9935-7624ae91a661', 199.000, 186.000, 13.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('9ce75d19-a42b-47f6-b0cd-7c028c24bc02', 'f89af6db-3968-4780-9c2e-c23ecc7aa43f', '550e8400-e29b-41d4-a716-446655440027', 83.000, 71.000, 12.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('59b8852c-0083-448f-8aa1-c60a505b14c6', 'f89af6db-3968-4780-9c2e-c23ecc7aa43f', '550e8400-e29b-41d4-a716-446655440028', 107.000, 100.000, 7.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('65538671-adaa-4fdd-b1dd-99776ffab73a', 'f89af6db-3968-4780-9c2e-c23ecc7aa43f', '21a1052b-a15c-466e-b573-01c24e63e87b', 876.000, 840.000, 36.000, 200.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('ae072f1f-7ad0-457f-88e1-827d77856249', 'f89af6db-3968-4780-9c2e-c23ecc7aa43f', '550e8400-e29b-41d4-a716-446655440011', 873.000, 845.000, 28.000, 200.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('502eafd1-e3cd-40f6-8a30-7c0ad5f69ef3', 'f89af6db-3968-4780-9c2e-c23ecc7aa43f', '550e8400-e29b-41d4-a716-446655440012', 764.000, 718.000, 46.000, 200.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('3a954b9d-9d8e-4b85-b9ed-7d242c04c9eb', 'f89af6db-3968-4780-9c2e-c23ecc7aa43f', '23ba9c9b-58a7-4b19-86b4-b4c65a21c189', 225.000, 212.000, 13.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('bd7fc7de-92a7-498c-aec8-3e9f52f77e0a', 'f89af6db-3968-4780-9c2e-c23ecc7aa43f', '2f7882fa-1975-48f4-b79b-8a3355bdb7c7', 150.000, 147.000, 3.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('427b6eb3-1a10-44a0-a474-222a0ebc2add', 'f89af6db-3968-4780-9c2e-c23ecc7aa43f', '550e8400-e29b-41d4-a716-446655440001', 5124.000, 5094.000, 30.000, 1000.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('0bfc37d2-0f3d-4a4a-b40b-29e149cb76a0', 'f89af6db-3968-4780-9c2e-c23ecc7aa43f', '550e8400-e29b-41d4-a716-446655440002', 3367.000, 3311.000, 56.000, 1000.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('29ef961c-6d44-4b51-aaf4-f5f7a3f6e015', 'f89af6db-3968-4780-9c2e-c23ecc7aa43f', '550e8400-e29b-41d4-a716-446655440013', 610.000, 583.000, 27.000, 200.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('1015c8d7-7c5f-4643-b6a9-788095e92204', 'f89af6db-3968-4780-9c2e-c23ecc7aa43f', '550e8400-e29b-41d4-a716-446655440003', 2674.000, 2555.000, 119.000, 1000.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('1114d6fb-a02a-4c23-abdf-013d3e1fcc31', 'f89af6db-3968-4780-9c2e-c23ecc7aa43f', '550e8400-e29b-41d4-a716-446655440024', 113.000, 96.000, 17.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('a04123d0-5e67-435c-a122-ddd85df07338', 'f89af6db-3968-4780-9c2e-c23ecc7aa43f', '550e8400-e29b-41d4-a716-446655440025', 125.000, 121.000, 4.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('345edc12-84a2-4246-b4b7-0010662c8a3a', 'f89af6db-3968-4780-9c2e-c23ecc7aa43f', '550e8400-e29b-41d4-a716-446655440021', 91.000, 81.000, 10.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('f22a49cf-ba27-4a47-8b35-ddb3106fcf84', 'f89af6db-3968-4780-9c2e-c23ecc7aa43f', '550e8400-e29b-41d4-a716-446655440014', 970.000, 935.000, 35.000, 200.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('b6ea840c-026c-4b29-9320-2859d4aa3e74', 'f89af6db-3968-4780-9c2e-c23ecc7aa43f', '550e8400-e29b-41d4-a716-446655440015', 766.000, 723.000, 43.000, 200.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('d0915051-1f0b-4982-9a3c-accdcd1dce07', 'f89af6db-3968-4780-9c2e-c23ecc7aa43f', '550e8400-e29b-41d4-a716-446655440022', 142.000, 139.000, 3.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('faa883d5-e125-40b3-9bd1-027683191898', 'f89af6db-3968-4780-9c2e-c23ecc7aa43f', '550e8400-e29b-41d4-a716-446655440023', 103.000, 97.000, 6.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('123b9cab-8e1c-45e4-8538-9ea088dbae70', '2721afaa-483f-46a2-9b22-7a74cccebcc8', '550e8400-e29b-41d4-a716-446655440004', 278.000, 228.000, 50.000, 1000.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('b5db98ee-b6a2-4379-aaaf-ba1fee181205', '2721afaa-483f-46a2-9b22-7a74cccebcc8', '550e8400-e29b-41d4-a716-446655440005', 867.000, 841.000, 26.000, 1000.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('38f58976-a39b-46c8-b934-6f5d8b1cafd7', '2721afaa-483f-46a2-9b22-7a74cccebcc8', '550e8400-e29b-41d4-a716-446655440026', 33.000, 31.000, 2.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('edd06c60-56f9-4b58-9fc7-c52bbd7f0fca', '2721afaa-483f-46a2-9b22-7a74cccebcc8', '563d6e19-9752-4de3-9990-cb8185ae9faa', 30.000, 21.000, 9.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('b2fec130-6635-4179-906a-47864c860a05', '2721afaa-483f-46a2-9b22-7a74cccebcc8', '68a96dac-4280-4ec9-b6b9-9e21c10bb002', 24.000, 20.000, 4.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('3cb4a227-3f9d-4664-998e-c77619a4fbfa', '2721afaa-483f-46a2-9b22-7a74cccebcc8', 'c09f3a0f-e8e0-40d8-804c-5cec09142f4f', 20.000, 15.000, 5.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('08e1b14c-011d-4b09-890e-9a51824df613', '2721afaa-483f-46a2-9b22-7a74cccebcc8', 'dc2a168f-884c-49c8-aa81-1b708e54a80e', 31.000, 23.000, 8.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('9af924ac-5c54-4c9a-b05c-ced828359ec4', '2721afaa-483f-46a2-9b22-7a74cccebcc8', '95667979-e926-471c-9935-7624ae91a661', 38.000, 31.000, 7.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('6f1b2161-f903-4b3a-af96-8940983cbd97', '2721afaa-483f-46a2-9b22-7a74cccebcc8', '550e8400-e29b-41d4-a716-446655440027', 52.000, 50.000, 2.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('5faed6fd-268a-4f26-9393-8623ae52c3e7', '2721afaa-483f-46a2-9b22-7a74cccebcc8', '550e8400-e29b-41d4-a716-446655440028', 46.000, 40.000, 6.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('fbf1eb0c-718f-4765-9ee8-3a3a5fc524a3', '2721afaa-483f-46a2-9b22-7a74cccebcc8', '21a1052b-a15c-466e-b573-01c24e63e87b', 120.000, 99.000, 21.000, 200.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('762c86b8-2b41-40d8-923d-b567704abb48', '2721afaa-483f-46a2-9b22-7a74cccebcc8', '550e8400-e29b-41d4-a716-446655440011', 173.000, 166.000, 7.000, 200.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('41f750d1-a2fe-40c4-b00b-6f62a58a59b4', '2721afaa-483f-46a2-9b22-7a74cccebcc8', '550e8400-e29b-41d4-a716-446655440012', 88.000, 66.000, 22.000, 200.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('8f6bf76f-e9d2-462f-b9c6-4b3667c0d329', '2721afaa-483f-46a2-9b22-7a74cccebcc8', '23ba9c9b-58a7-4b19-86b4-b4c65a21c189', 20.000, 15.000, 5.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('2b3cb5cb-4155-4186-9994-db5a2fd7678e', '2721afaa-483f-46a2-9b22-7a74cccebcc8', '2f7882fa-1975-48f4-b79b-8a3355bdb7c7', 29.000, 23.000, 6.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('bdac8971-f5e6-4bfb-916a-3db0b768bc0a', '2721afaa-483f-46a2-9b22-7a74cccebcc8', '550e8400-e29b-41d4-a716-446655440001', 820.000, 793.000, 27.000, 1000.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('fcb1e9f0-c5bd-456a-9ab8-162f86833954', '2721afaa-483f-46a2-9b22-7a74cccebcc8', '550e8400-e29b-41d4-a716-446655440002', 584.000, 523.000, 61.000, 1000.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('41466fc6-541e-4c6e-ab48-8ec755e90ae9', '2721afaa-483f-46a2-9b22-7a74cccebcc8', '550e8400-e29b-41d4-a716-446655440013', 200.000, 182.000, 18.000, 200.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('139c8881-6879-4dd0-8247-864b2097c143', '2721afaa-483f-46a2-9b22-7a74cccebcc8', '550e8400-e29b-41d4-a716-446655440003', 410.000, 363.000, 47.000, 1000.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('e5e3e448-cf10-4d1d-8437-741e6f2b5240', '2721afaa-483f-46a2-9b22-7a74cccebcc8', '550e8400-e29b-41d4-a716-446655440024', 30.000, 21.000, 9.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('27d5c99e-9619-4d65-895b-db3bf547e185', '2721afaa-483f-46a2-9b22-7a74cccebcc8', '550e8400-e29b-41d4-a716-446655440025', 34.000, 25.000, 9.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('fa9d3652-0353-48ab-af71-fd742aeb3972', '2721afaa-483f-46a2-9b22-7a74cccebcc8', '550e8400-e29b-41d4-a716-446655440021', 22.000, 17.000, 5.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('a571e17c-01a2-4d2b-a184-197fc1f87f56', '2721afaa-483f-46a2-9b22-7a74cccebcc8', '550e8400-e29b-41d4-a716-446655440014', 203.000, 191.000, 12.000, 200.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('f0bc7a57-cae6-46b7-8d22-39b04df027b0', '2721afaa-483f-46a2-9b22-7a74cccebcc8', '550e8400-e29b-41d4-a716-446655440015', 85.000, 65.000, 20.000, 200.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('7a92bcef-5056-49fa-ac23-5bb1c8c1d1a9', '2721afaa-483f-46a2-9b22-7a74cccebcc8', '550e8400-e29b-41d4-a716-446655440022', 20.000, 15.000, 5.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('0fec9e1f-43be-4a8c-9f23-16d38328de66', '2721afaa-483f-46a2-9b22-7a74cccebcc8', '550e8400-e29b-41d4-a716-446655440023', 44.000, 36.000, 8.000, 50.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);
INSERT INTO public.store_inventory VALUES ('8c643b31-a5fc-4d1f-97f4-8ca47e1213e9', 'b6684b23-3587-4602-9f54-695cb9527424', '550e8400-e29b-41d4-a716-446655440005', 6715.000, 6478.000, 237.000, 800.000, '2025-12-26 09:42:31.062733+00', '2025-12-29 05:06:00.406168+00', 1);


--
-- Data for Name: store_operation_logs; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: store_reservation_settings; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.store_reservation_settings VALUES ('a54700f8-8d2f-4506-a836-582f8cc1357f', '22222222-2222-2222-2222-222222222222', true, 10, '2025-12-18 02:32:02.587263+00', '2025-12-22 10:41:51.126828+00', NULL, '[{"endTime": "21:00", "dayOfWeek": 1, "startTime": "09:00"}, {"endTime": "21:00", "dayOfWeek": 2, "startTime": "09:00"}, {"endTime": "21:00", "dayOfWeek": 3, "startTime": "09:00"}, {"endTime": "21:00", "dayOfWeek": 4, "startTime": "09:00"}, {"endTime": "21:00", "dayOfWeek": 5, "startTime": "09:00"}, {"endTime": "21:00", "dayOfWeek": 6, "startTime": "09:00"}, {"endTime": "21:00", "dayOfWeek": 7, "startTime": "09:00"}]', 1, 1, false, NULL, NULL, true);
INSERT INTO public.store_reservation_settings VALUES ('f7096147-c50d-4671-9649-2b75c0a07f43', '11111111-1111-1111-1111-111111111111', true, 7, '2025-12-18 02:14:35.594348+00', '2025-12-22 13:18:46.12727+00', NULL, '[{"endTime": "22:00", "dayOfWeek": 1, "startTime": "08:00"}, {"endTime": "22:00", "dayOfWeek": 2, "startTime": "08:00"}, {"endTime": "22:00", "dayOfWeek": 3, "startTime": "08:00"}, {"endTime": "22:00", "dayOfWeek": 4, "startTime": "08:00"}, {"endTime": "22:00", "dayOfWeek": 5, "startTime": "08:00"}, {"endTime": "22:00", "dayOfWeek": 6, "startTime": "08:00"}, {"endTime": "22:00", "dayOfWeek": 7, "startTime": "08:00"}]', 1, 1, false, NULL, NULL, true);
INSERT INTO public.store_reservation_settings VALUES ('67ac03e7-c7e1-4897-80cd-6752762d108f', '33333333-3333-3333-3333-333333333333', true, 7, '2025-12-22 13:19:36.867218+00', '2025-12-22 13:19:38.62562+00', NULL, '[{"endTime": "22:00", "dayOfWeek": 1, "startTime": "08:00"}, {"endTime": "22:00", "dayOfWeek": 2, "startTime": "08:00"}, {"endTime": "22:00", "dayOfWeek": 3, "startTime": "08:00"}, {"endTime": "22:00", "dayOfWeek": 4, "startTime": "08:00"}, {"endTime": "22:00", "dayOfWeek": 5, "startTime": "08:00"}, {"endTime": "22:00", "dayOfWeek": 6, "startTime": "08:00"}, {"endTime": "22:00", "dayOfWeek": 7, "startTime": "08:00"}]', 1, 1, false, NULL, NULL, true);
INSERT INTO public.store_reservation_settings VALUES ('438aad69-bd98-401c-be50-c9a152bf575a', 'eaed3164-5f95-43ee-bcef-76a6629c62f1', true, 7, '2025-12-23 00:20:27.451058+00', '2025-12-23 00:20:29.108507+00', NULL, '[{"endTime": "22:00", "dayOfWeek": 1, "startTime": "08:00"}, {"endTime": "22:00", "dayOfWeek": 2, "startTime": "08:00"}, {"endTime": "22:00", "dayOfWeek": 3, "startTime": "08:00"}, {"endTime": "22:00", "dayOfWeek": 4, "startTime": "08:00"}, {"endTime": "22:00", "dayOfWeek": 5, "startTime": "08:00"}, {"endTime": "22:00", "dayOfWeek": 6, "startTime": "08:00"}, {"endTime": "22:00", "dayOfWeek": 7, "startTime": "08:00"}]', 1, 1, false, NULL, NULL, true);


--
-- Data for Name: stores; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.stores VALUES ('eaed3164-5f95-43ee-bcef-76a6629c62f1', 'STORE-YLCL-HG', '耀莱成龙国际影城(黄冈店)', '黄州区银河广场3楼', '0713-8679900', NULL, 'active', '2025-12-23 00:19:01.796894+00', '2025-12-23 00:19:01.796894+00', '湖北省', '黄冈市', '黄州区', 0, '2017-06-01', 2200, 6, 520);
INSERT INTO public.stores VALUES ('082e4015-0107-4843-979c-606f7a8db196', 'STORE-YLCL-ZZJY', '耀莱成龙国际影城(郑州锦艺城店)', '棉纺西路锦艺城购物中心4楼', '0371-88888877', NULL, 'inactive', '2025-12-23 00:19:01.796894+00', '2025-12-23 00:19:01.796894+00', '河南省', '郑州市', '中原区', 0, '2015-01-01', 3000, 8, 780);
INSERT INTO public.stores VALUES ('11111111-1111-1111-1111-111111111111', 'STORE-001', '北京朝阳店', NULL, '010-12345678', NULL, 'active', '2025-12-17 13:15:36.583437+00', '2025-12-22 02:06:02.906324+00', '北京市', '北京市', '朝阳区', 0, NULL, NULL, NULL, NULL);
INSERT INTO public.stores VALUES ('22222222-2222-2222-2222-222222222222', 'STORE-002', '上海浦东店', NULL, '400-123-4567', NULL, 'active', '2025-12-17 13:15:36.583437+00', '2025-12-22 02:30:04.604047+00', '上海市', '上海市', '浦东新区', 0, NULL, NULL, NULL, NULL);
INSERT INTO public.stores VALUES ('33333333-3333-3333-3333-333333333333', 'STORE-003', '深圳南山店', '建国路88号', '13800138000', NULL, 'inactive', '2025-12-17 13:15:36.583437+00', '2025-12-22 02:30:13.897902+00', '北京市', '北京市', '朝阳区', 0, NULL, NULL, NULL, NULL);
INSERT INTO public.stores VALUES ('123e4567-e89b-12d3-a456-426614174000', 'TEST-001', '测试门店', '测试地址', '13800138000', NULL, 'active', '2025-12-22 14:38:02.951232+00', '2025-12-22 14:38:02.951232+00', NULL, '杭州', NULL, 0, NULL, NULL, NULL, NULL);
INSERT INTO public.stores VALUES ('5b794db7-f193-41ff-b104-c4452f724221', 'STORE-YLCL-WFJ', '耀莱成龙国际影城(王府井店)', '王府井大街新燕莎购物中心地下一层', '010-65001234', NULL, 'active', '2025-12-23 00:17:40.477856+00', '2025-12-23 00:17:40.477856+00', '北京市', '北京市', '东城区', 0, '2014-06-01', 3500, 9, 622);
INSERT INTO public.stores VALUES ('60842e31-2be9-4a74-b260-06667853c4ae', 'STORE-YLCL-SHZB', '耀莱成龙国际影城(上海真北路店)', '真北路818号近铁城市广场北座4楼', '021-62156677', NULL, 'active', '2025-12-23 00:18:04.03942+00', '2025-12-23 00:18:04.03942+00', '上海市', '上海市', '普陀区', 0, '2016-01-01', 3000, 8, 832);
INSERT INTO public.stores VALUES ('c75a48d4-64be-4c90-a720-b11f6e51be09', 'STORE-YLCL-SHCY', '耀莱成龙国际影城(上海曹杨路店)', '曹杨路2033号天汇广场3楼', '021-62662699', NULL, 'active', '2025-12-23 00:18:04.03942+00', '2025-12-23 00:18:04.03942+00', '上海市', '上海市', '普陀区', 0, '2015-06-01', 2500, 6, 650);
INSERT INTO public.stores VALUES ('faf75f20-515d-4718-958c-236cfe9b0adb', 'STORE-YLCL-TJYY', '耀莱成龙国际影城(天津友谊路店)', '友谊路与平江道交口友谊新天地广场4楼', '022-88888877', NULL, 'active', '2025-12-23 00:18:04.03942+00', '2025-12-23 00:18:04.03942+00', '天津市', '天津市', '河西区', 0, '2013-05-01', 4000, 10, 1200);
INSERT INTO public.stores VALUES ('70dfcb81-f1e7-4aae-abb7-fef5e8a1bff4', 'STORE-YLCL-CCHX', '耀莱成龙国际影城(长春湖西路店)', '湖西路与自由大路交汇处欧亚卖场4楼', '0431-88888877', NULL, 'active', '2025-12-23 00:18:04.03942+00', '2025-12-23 00:18:04.03942+00', '吉林省', '长春市', '南关区', 0, '2015-02-05', 4500, 8, 1100);
INSERT INTO public.stores VALUES ('b91eabfb-7c2a-427a-a6de-095e62212855', 'STORE-YLCL-DQYL', '耀莱成龙国际影城(大庆银浪店)', '银浪新城银河广场3层', '0459-13555548796', NULL, 'active', '2025-12-23 00:18:04.03942+00', '2025-12-23 00:18:04.03942+00', '黑龙江省', '大庆市', '红岗区', 0, '2018-01-01', 2000, 6, 580);
INSERT INTO public.stores VALUES ('cf09103f-6f55-4504-910f-c0262c164e87', 'STORE-YLCL-WHBD', '耀莱成龙国际影城(武汉八大家店)', '八大家路凯德1818购物中心4楼', '027-88888877', NULL, 'active', '2025-12-23 00:19:01.796894+00', '2025-12-23 00:19:01.796894+00', '湖北省', '武汉市', '武昌区', 0, '2016-08-01', 3500, 9, 950);
INSERT INTO public.stores VALUES ('b6684b23-3587-4602-9f54-695cb9527424', 'STORE-YLCL-WKS', '耀莱成龙国际影城(五棵松店)', '复兴路69号万达广场5层耀莱成龙影城', '010-68188877', NULL, 'active', '2025-12-23 00:17:40.477856+00', '2025-12-23 07:04:32.133145+00', '北京市', '北京市', '海淀区', 0, '2010-02-08', 15000, 17, 3520);
INSERT INTO public.stores VALUES ('70e95860-fb84-487b-96a3-a12de8f6aca6', 'STORE-YLCL-CYS', '耀莱成龙国际影城(慈云寺店)', '慈云寺北里209号楼未来汇三层', '010-85993456', NULL, 'active', '2025-12-23 00:53:25.052375+00', '2025-12-23 07:04:32.133145+00', '北京市', '北京市', '朝阳区', 0, NULL, NULL, 5, 611);
INSERT INTO public.stores VALUES ('62a7e272-acfb-4ed4-8f4b-7adc49d963b3', 'STORE-YLCL-FSTJ', '耀莱成龙国际影城(房山天街店)', '良乡镇政通南路龙湖天街五层', '010-81388877', NULL, 'active', '2025-12-23 00:53:25.052375+00', '2025-12-23 07:04:32.133145+00', '北京市', '北京市', '房山区', 0, NULL, NULL, 15, 1338);
INSERT INTO public.stores VALUES ('470e05da-aeae-4d29-9157-254efe83e5e2', 'STORE-YLCL-MLD', '耀莱成龙国际影城(马连道店)', '马连道路25号新年华购物中心5楼', '010-63252722', NULL, 'active', '2025-12-23 00:17:40.477856+00', '2025-12-23 07:04:32.133145+00', '北京市', '北京市', '西城区', 0, '2012-01-01', 4147, 7, 787);
INSERT INTO public.stores VALUES ('300a4f9b-e1f7-4edf-a5e2-4b52d005ab84', 'STORE-YLCL-XHM', '耀莱成龙国际影城(西红门店)', '欣旺北大街8号鸿坤购物中心F6-01', '010-60298877', NULL, 'active', '2025-12-23 00:53:25.052375+00', '2025-12-23 07:04:32.133145+00', '北京市', '北京市', '大兴区', 0, NULL, NULL, 10, 1581);
INSERT INTO public.stores VALUES ('c0afa7d7-4fcf-4740-8fad-0f8b4a1aceba', 'STORE-YLCL-BDWD', '耀莱成龙国际影城(保定望都店)', '庆都西路8号易购广场四楼', NULL, NULL, 'active', '2025-12-23 00:54:01.293809+00', '2025-12-23 07:04:32.133145+00', '河北省', '保定市', '望都县', 0, NULL, NULL, 6, 356);
INSERT INTO public.stores VALUES ('c32577e7-05b8-4c9f-901b-5f4275ecacba', 'STORE-YLCL-SJZ', '耀莱成龙国际影城(石家庄店)', '中山东路188号北国商城9层', NULL, NULL, 'active', '2025-12-23 00:54:01.293809+00', '2025-12-23 07:04:32.133145+00', '河北省', '石家庄市', '桥西区', 0, NULL, NULL, 9, 1191);
INSERT INTO public.stores VALUES ('f695a420-68a8-4a36-91d2-09abb23e0cc6', 'STORE-YLCL-XL', '耀莱成龙国际影城(新乐店)', '新华路与礼堂街交口东北角新华广场3楼', NULL, NULL, 'active', '2025-12-23 00:54:01.293809+00', '2025-12-23 07:04:32.133145+00', '河北省', '石家庄市', '新乐市', 0, NULL, NULL, 5, 715);
INSERT INTO public.stores VALUES ('13cdc7c3-b235-4095-8aba-ddd4980cbda1', 'STORE-YLCL-YJ', '耀莱成龙国际影城(燕郊店)', '燕郊高新区迎宾北路富地广场A座四层', NULL, NULL, 'active', '2025-12-23 00:54:01.293809+00', '2025-12-23 07:04:32.133145+00', '河北省', '廊坊市', '三河市', 0, NULL, NULL, 7, 969);
INSERT INTO public.stores VALUES ('0562ae66-43d6-4561-8657-9c1bde7fe90e', 'STORE-YLCL-LYWD', '耀莱成龙国际影城(洛阳万达店)', '中州中路中州万达广场七层', NULL, NULL, 'active', '2025-12-23 00:54:01.293809+00', '2025-12-23 07:04:32.133145+00', '河南省', '洛阳市', '西工区', 0, NULL, NULL, 10, 1533);
INSERT INTO public.stores VALUES ('f89af6db-3968-4780-9c2e-c23ecc7aa43f', 'STORE-YLCL-GZZC', '耀莱成龙国际影城(广州增城店)', '新塘镇港口大道北332号金海岸城市广场4楼', NULL, NULL, 'active', '2025-12-23 00:54:01.293809+00', '2025-12-23 07:04:32.133145+00', '广东省', '广州市', '增城区', 0, NULL, NULL, 7, 1340);
INSERT INTO public.stores VALUES ('8f495443-bea3-43a5-9621-2d0ffabea3e7', 'STORE-YLCL-HN', '耀莱成龙国际影城(淮南店)', '朝阳中路金地环球港4层西侧', NULL, NULL, 'active', '2025-12-23 00:54:01.293809+00', '2025-12-23 07:04:32.133145+00', '安徽省', '淮南市', '田家庵区', 0, NULL, NULL, 7, 987);
INSERT INTO public.stores VALUES ('ca4e43f6-bb73-41a0-b102-c8301705aedf', 'STORE-YLCL-XC', '耀莱成龙国际影城(孝昌店)', '孟宗大道特888号金上海广场主力店四楼', NULL, NULL, 'active', '2025-12-23 00:54:01.293809+00', '2025-12-23 07:04:32.133145+00', '湖北省', '孝感市', '孝昌县', 0, NULL, NULL, 6, 989);
INSERT INTO public.stores VALUES ('2721afaa-483f-46a2-9b22-7a74cccebcc8', 'STORE-YLCL-CDXJ', '耀莱成龙国际影城(成都新津店)', '新悦广场4楼', '028-82888877', NULL, 'active', '2025-12-23 00:19:01.796894+00', '2025-12-23 07:04:32.133145+00', '四川省', '成都市', '新津区', 0, '2019-05-01', 2800, 6, 877);
INSERT INTO public.stores VALUES ('a0b50e7a-70af-4a19-94d7-289cb4c8b5af', 'STORE-YLCL-FZMH', '耀莱成龙国际影城(福州闽侯店)', '上街镇国宾大道268号东百永嘉天地4楼', NULL, NULL, 'active', '2025-12-23 00:54:01.293809+00', '2025-12-23 07:04:32.133145+00', '福建省', '福州市', '闽侯县', 0, NULL, NULL, 6, 868);
INSERT INTO public.stores VALUES ('1c5ff529-9c73-4389-9bce-6779a3486fde', 'STORE-YLCL-FZCL', '耀莱成龙国际影城(福州长乐店)', '十洋商务广场', NULL, NULL, 'active', '2025-12-23 00:54:01.293809+00', '2025-12-23 07:04:32.133145+00', '福建省', '福州市', '长乐区', 0, NULL, NULL, 5, 467);
INSERT INTO public.stores VALUES ('4112ed3a-cc08-4c73-a358-1845091a19bb', 'STORE-YLCL-NPPC', '耀莱成龙国际影城(南平浦城店)', '兴华路888号永晖商业中心3楼', NULL, NULL, 'active', '2025-12-23 00:54:01.293809+00', '2025-12-23 07:04:32.133145+00', '福建省', '南平市', '浦城县', 0, NULL, NULL, 6, 792);
INSERT INTO public.stores VALUES ('a800f575-51ed-473b-bf00-7176216b5c5d', 'STORE-YLCL-QZQG', '耀莱成龙国际影城(泉州泉港店)', '福永辉城市商业广场永嘉天地', NULL, NULL, 'active', '2025-12-23 00:54:01.293809+00', '2025-12-23 07:04:32.133145+00', '福建省', '泉州市', '泉港区', 0, NULL, NULL, 6, 788);
INSERT INTO public.stores VALUES ('e157654c-a307-4f15-bd3f-e9eb52af3589', 'STORE-YLCL-JNLX', '耀莱成龙国际影城(济南领秀城店)', '二环南路2688号领秀城购物中心F4', '0531-88888877', NULL, 'active', '2025-12-23 00:19:01.796894+00', '2025-12-23 07:04:32.133145+00', '山东省', '济南市', '市中区', 0, '2017-01-01', 3200, 11, 1964);
INSERT INTO public.stores VALUES ('b886bafa-8dde-4841-b11d-e62b50b40c17', 'STORE-YLCL-YC', '耀莱成龙国际影城(银川店)', '北京中路711号新华联购物中心四层', NULL, NULL, 'active', '2025-12-23 00:54:01.293809+00', '2025-12-23 07:04:32.133145+00', '宁夏回族自治区', '银川市', '金凤区', 0, NULL, NULL, 8, 1363);
INSERT INTO public.stores VALUES ('20ab9a36-1e8f-4e9b-8bcf-a490a361b3bc', 'STORE-YLCL-CCKC', '耀莱成龙国际影城(长春宽城店)', '凯旋街道九台北路中东奥特莱斯三层', NULL, NULL, 'active', '2025-12-23 00:54:01.293809+00', '2025-12-23 07:04:32.133145+00', '吉林省', '长春市', '宽城区', 0, NULL, NULL, 8, 1593);
INSERT INTO public.stores VALUES ('4ec41acd-8dc2-4461-abf6-5e278bbda592', 'STORE-YLCL-GYQZ', '耀莱成龙国际影城(贵阳清镇店)', '云岭东路中央公园11栋2、3楼', NULL, NULL, 'active', '2025-12-23 00:54:01.293809+00', '2025-12-23 07:04:32.133145+00', '贵州省', '贵阳市', '清镇市', 0, NULL, NULL, 10, 1104);
INSERT INTO public.stores VALUES ('b617e3f0-ef09-4810-8ddf-8877a73b06f4', 'STORE-YLCL-ZYMT', '耀莱成龙国际影城(遵义湄潭店)', '湄江街道象山路名城外滩一号楼一层', NULL, NULL, 'active', '2025-12-23 00:54:01.293809+00', '2025-12-23 07:04:32.133145+00', '贵州省', '遵义市', '湄潭县', 0, NULL, NULL, 6, 481);
INSERT INTO public.stores VALUES ('00000000-0000-0000-0000-000000000099', 'STORE-P005-TEST', 'Test Store P005', '测试地址123号', '13800138000', NULL, 'active', '2025-12-29 12:14:09.234575+00', '2025-12-29 12:14:09.234575+00', '北京市', '北京市', '朝阳区', 0, NULL, NULL, NULL, NULL);


--
-- Data for Name: time_slot_overrides; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.time_slot_overrides VALUES ('00000000-0003-0005-0000-000000000001', '00000000-0003-0000-0000-000000000003', '2025-02-14', 'MODIFY', '10:00:00', '23:30:00', 5, '情人节特别场次，容量扩大', '2025-12-23 06:52:25.119305+00', '2025-12-23 06:52:25.119305+00');
INSERT INTO public.time_slot_overrides VALUES ('00000000-0003-0005-0000-000000000002', '00000000-0003-0000-0000-000000000003', '2025-01-28', 'CANCEL', NULL, NULL, NULL, '春节假期休息', '2025-12-23 06:52:25.119305+00', '2025-12-23 06:52:25.119305+00');
INSERT INTO public.time_slot_overrides VALUES ('00000000-0003-0005-0000-000000000003', '00000000-0003-0000-0000-000000000003', '2025-05-20', 'MODIFY', '10:00:00', '23:30:00', 6, '520特别活动日，容量扩大', '2025-12-23 06:52:25.119305+00', '2025-12-23 06:52:25.119305+00');


--
-- Data for Name: time_slot_templates; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.time_slot_templates VALUES ('00000000-0003-0004-0000-000000000001', '00000000-0003-0000-0000-000000000003', 1, '10:00:00', '14:00:00', 2, NULL, true, '2025-12-23 06:52:25.119305+00', '2025-12-23 06:52:25.119305+00');
INSERT INTO public.time_slot_templates VALUES ('00000000-0003-0004-0000-000000000002', '00000000-0003-0000-0000-000000000003', 1, '15:00:00', '19:00:00', 2, NULL, true, '2025-12-23 06:52:25.119305+00', '2025-12-23 06:52:25.119305+00');
INSERT INTO public.time_slot_templates VALUES ('00000000-0003-0004-0000-000000000003', '00000000-0003-0000-0000-000000000003', 1, '19:30:00', '23:00:00', 2, '{"type": "PERCENTAGE", "value": 10}', true, '2025-12-23 06:52:25.119305+00', '2025-12-23 06:52:25.119305+00');
INSERT INTO public.time_slot_templates VALUES ('00000000-0003-0004-0000-000000000010', '00000000-0003-0000-0000-000000000003', 6, '10:00:00', '14:00:00', 3, '{"type": "PERCENTAGE", "value": 20}', true, '2025-12-23 06:52:25.119305+00', '2025-12-23 06:52:25.119305+00');
INSERT INTO public.time_slot_templates VALUES ('00000000-0003-0004-0000-000000000011', '00000000-0003-0000-0000-000000000003', 6, '15:00:00', '19:00:00', 3, '{"type": "PERCENTAGE", "value": 20}', true, '2025-12-23 06:52:25.119305+00', '2025-12-23 06:52:25.119305+00');
INSERT INTO public.time_slot_templates VALUES ('00000000-0003-0004-0000-000000000012', '00000000-0003-0000-0000-000000000003', 6, '19:30:00', '23:30:00', 3, '{"type": "PERCENTAGE", "value": 30}', true, '2025-12-23 06:52:25.119305+00', '2025-12-23 06:52:25.119305+00');
INSERT INTO public.time_slot_templates VALUES ('00000000-0003-0004-0000-000000000020', '00000000-0003-0000-0000-000000000003', 0, '10:00:00', '14:00:00', 2, '{"type": "PERCENTAGE", "value": 15}', true, '2025-12-23 06:52:25.119305+00', '2025-12-23 06:52:25.119305+00');
INSERT INTO public.time_slot_templates VALUES ('00000000-0003-0004-0000-000000000021', '00000000-0003-0000-0000-000000000003', 0, '15:00:00', '19:00:00', 2, '{"type": "PERCENTAGE", "value": 15}', true, '2025-12-23 06:52:25.119305+00', '2025-12-23 06:52:25.119305+00');
INSERT INTO public.time_slot_templates VALUES ('690402ac-4a0f-4b2e-851e-af4e6e3cb619', '00000000-0003-0000-0000-000000000003', 2, '16:00:00', '18:00:00', 2, NULL, true, '2025-12-23 07:37:23.766846+00', '2025-12-23 07:37:23.766875+00');
INSERT INTO public.time_slot_templates VALUES ('12baba23-19a9-487b-89ed-cd20d2ee92d0', '00000000-0003-0000-0000-000000000003', 2, '18:30:00', '20:30:00', 2, NULL, true, '2025-12-23 07:37:49.725496+00', '2025-12-23 07:37:49.725533+00');
INSERT INTO public.time_slot_templates VALUES ('ec360792-94c4-4a90-b385-4b6a5634c589', '00000000-0003-0000-0000-000000000003', 3, '10:00:00', '13:00:00', 2, NULL, true, '2025-12-23 07:45:45.781224+00', '2025-12-23 07:45:45.781256+00');


--
-- Data for Name: unit_conversions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.unit_conversions VALUES ('46b4af8a-9ad1-4121-b672-86e743f797cb', 'ml', 'l', 0.001000, 'volume');
INSERT INTO public.unit_conversions VALUES ('66761653-122b-44bc-9db2-009caab7d8a4', 'l', 'ml', 1000.000000, 'volume');
INSERT INTO public.unit_conversions VALUES ('696ef5ab-b42b-4725-82cc-2b8431e71b7b', 'ml', '升', 0.001000, 'volume');
INSERT INTO public.unit_conversions VALUES ('7e07f49d-8014-4ca8-a868-abc6f6ef71ed', '升', 'ml', 1000.000000, 'volume');
INSERT INTO public.unit_conversions VALUES ('40e63888-0bc0-48ac-b75d-858cabdf4c92', 'l', '升', 1.000000, 'volume');
INSERT INTO public.unit_conversions VALUES ('2c01fe26-fe58-4c72-8baf-f443b0664fb5', '升', 'l', 1.000000, 'volume');
INSERT INTO public.unit_conversions VALUES ('9bef79bd-20e3-4eaf-aeb7-8a226c32ba8f', 'g', 'kg', 0.001000, 'weight');
INSERT INTO public.unit_conversions VALUES ('1b798092-d604-412e-8bbb-91ad2f487f91', 'kg', 'g', 1000.000000, 'weight');
INSERT INTO public.unit_conversions VALUES ('2599778b-f0f4-411c-8f44-bf35537d8f98', 'g', '克', 1.000000, 'weight');
INSERT INTO public.unit_conversions VALUES ('321cfdad-8888-4572-a340-030f7648654a', '克', 'g', 1.000000, 'weight');
INSERT INTO public.unit_conversions VALUES ('2eba0c67-645c-43bb-8320-e7fba8343026', 'kg', '千克', 1.000000, 'weight');
INSERT INTO public.unit_conversions VALUES ('bb5a4f12-bcd2-4abe-8988-ea84d4b68790', '千克', 'kg', 1.000000, 'weight');
INSERT INTO public.unit_conversions VALUES ('c436e43d-534a-4d5a-aba4-d45fd11433e7', '千克', 'g', 1000.000000, 'weight');
INSERT INTO public.unit_conversions VALUES ('a46f4ce5-c66a-4765-ab59-3c95fa82ef4a', 'g', '千克', 0.001000, 'weight');
INSERT INTO public.unit_conversions VALUES ('1fecc759-1c57-4827-ae49-ea0f51ed2109', '个', '打', 0.083333, 'quantity');
INSERT INTO public.unit_conversions VALUES ('50c9dd22-ecb5-40dc-8dd3-48f3ed88c079', '打', '个', 12.000000, 'quantity');
INSERT INTO public.unit_conversions VALUES ('f376fe0f-0a9d-4195-abdd-dac524fd5346', '瓶', '箱', 0.083333, 'quantity');
INSERT INTO public.unit_conversions VALUES ('17b91919-ecef-4a29-849e-34bce6b936ac', '箱', '瓶', 12.000000, 'quantity');
INSERT INTO public.unit_conversions VALUES ('8b46ed02-6fa6-4cc2-a7e5-c910b50423a6', '片', '包', 0.100000, 'quantity');
INSERT INTO public.unit_conversions VALUES ('105a836e-4d23-4fbe-a9e4-a5a5992984f8', '包', '片', 10.000000, 'quantity');
INSERT INTO public.unit_conversions VALUES ('6961e383-08e0-428a-a9ba-f5a96a983f80', '根', '包', 0.100000, 'quantity');
INSERT INTO public.unit_conversions VALUES ('686fddf3-4ad8-4195-924b-cbbb0516fdbe', '包', '根', 10.000000, 'quantity');
INSERT INTO public.unit_conversions VALUES ('62b30f55-a08d-4079-9f94-e3884e15cf94', '个', '件', 1.000000, 'quantity');
INSERT INTO public.unit_conversions VALUES ('fa0d1a84-43f8-4e3b-934a-3f2a0d3093dc', '件', '个', 1.000000, 'quantity');
INSERT INTO public.unit_conversions VALUES ('528a54ae-2a86-4a13-92ad-ef87ad2538ed', '杯', '个', 1.000000, 'quantity');
INSERT INTO public.unit_conversions VALUES ('30728401-5c64-4146-a20a-6dcc9cca813a', '个', '杯', 1.000000, 'quantity');
INSERT INTO public.unit_conversions VALUES ('cdd110e0-75d0-4b6e-b40f-607dc9110d6c', '桶', '个', 1.000000, 'quantity');
INSERT INTO public.unit_conversions VALUES ('4a16579f-d598-4067-85be-b8ab2a8f16a0', '个', '桶', 1.000000, 'quantity');
INSERT INTO public.unit_conversions VALUES ('d0f11769-10db-4aa0-94e2-b6ad13b0e0b4', '瓶', 'ml', 500.000000, 'volume');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users VALUES ('550e8400-e29b-41d4-a716-446655440100', '张三', '13800138000', '广东省', '深圳市', '南山区', '科技园南区18号楼', '2025-12-27 08:56:04.92834', '2025-12-27 08:56:04.92834');
INSERT INTO public.users VALUES ('550e8400-e29b-41d4-a716-446655440101', '李四', '13900139000', '北京市', '北京市', '朝阳区', '三里屯SOHO 5号楼', '2025-12-27 08:56:04.92834', '2025-12-27 08:56:04.92834');
INSERT INTO public.users VALUES ('550e8400-e29b-41d4-a716-446655440102', '王五', '13700137000', '上海市', '上海市', '浦东新区', '陆家嘴环路1000号', '2025-12-27 08:56:04.92834', '2025-12-27 08:56:04.92834');


--
-- Name: adjustment_number_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.adjustment_number_seq', 1, false);


--
-- Name: activity_types activity_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_types
    ADD CONSTRAINT activity_types_pkey PRIMARY KEY (id);


--
-- Name: addon_items addon_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.addon_items
    ADD CONSTRAINT addon_items_pkey PRIMARY KEY (id);


--
-- Name: adjustment_reasons adjustment_reasons_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.adjustment_reasons
    ADD CONSTRAINT adjustment_reasons_code_key UNIQUE (code);


--
-- Name: adjustment_reasons adjustment_reasons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.adjustment_reasons
    ADD CONSTRAINT adjustment_reasons_pkey PRIMARY KEY (id);


--
-- Name: approval_records approval_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approval_records
    ADD CONSTRAINT approval_records_pkey PRIMARY KEY (id);


--
-- Name: beverage_order_items beverage_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beverage_order_items
    ADD CONSTRAINT beverage_order_items_pkey PRIMARY KEY (id);


--
-- Name: beverage_order_status_logs beverage_order_status_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beverage_order_status_logs
    ADD CONSTRAINT beverage_order_status_logs_pkey PRIMARY KEY (id);


--
-- Name: beverage_orders beverage_orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beverage_orders
    ADD CONSTRAINT beverage_orders_order_number_key UNIQUE (order_number);


--
-- Name: beverage_orders beverage_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beverage_orders
    ADD CONSTRAINT beverage_orders_pkey PRIMARY KEY (id);


--
-- Name: beverage_recipes beverage_recipes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beverage_recipes
    ADD CONSTRAINT beverage_recipes_pkey PRIMARY KEY (id);


--
-- Name: beverage_sku_mapping beverage_sku_mapping_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beverage_sku_mapping
    ADD CONSTRAINT beverage_sku_mapping_pkey PRIMARY KEY (old_beverage_id);


--
-- Name: beverage_specs beverage_specs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beverage_specs
    ADD CONSTRAINT beverage_specs_pkey PRIMARY KEY (id);


--
-- Name: beverages beverages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beverages
    ADD CONSTRAINT beverages_pkey PRIMARY KEY (id);


--
-- Name: bom_components bom_components_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bom_components
    ADD CONSTRAINT bom_components_pkey PRIMARY KEY (id);


--
-- Name: bom_snapshots bom_snapshots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bom_snapshots
    ADD CONSTRAINT bom_snapshots_pkey PRIMARY KEY (id);


--
-- Name: brands brands_brand_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_brand_code_key UNIQUE (brand_code);


--
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- Name: categories categories_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_code_key UNIQUE (code);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: category_audit_log category_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.category_audit_log
    ADD CONSTRAINT category_audit_log_pkey PRIMARY KEY (id);


--
-- Name: channel_product_config channel_product_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.channel_product_config
    ADD CONSTRAINT channel_product_config_pkey PRIMARY KEY (id);


--
-- Name: combo_items combo_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.combo_items
    ADD CONSTRAINT combo_items_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history flyway_schema_history_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flyway_schema_history
    ADD CONSTRAINT flyway_schema_history_pk PRIMARY KEY (installed_rank);


--
-- Name: halls halls_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.halls
    ADD CONSTRAINT halls_pkey PRIMARY KEY (id);


--
-- Name: halls halls_store_id_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.halls
    ADD CONSTRAINT halls_store_id_code_key UNIQUE (store_id, code);


--
-- Name: inventory_adjustments inventory_adjustments_adjustment_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_adjustments
    ADD CONSTRAINT inventory_adjustments_adjustment_number_key UNIQUE (adjustment_number);


--
-- Name: inventory_adjustments inventory_adjustments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_adjustments
    ADD CONSTRAINT inventory_adjustments_pkey PRIMARY KEY (id);


--
-- Name: inventory_reservations inventory_reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_reservations
    ADD CONSTRAINT inventory_reservations_pkey PRIMARY KEY (id);


--
-- Name: inventory_transactions inventory_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_pkey PRIMARY KEY (id);


--
-- Name: menu_category menu_category_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_category
    ADD CONSTRAINT menu_category_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: order_logs order_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_logs
    ADD CONSTRAINT order_logs_pkey PRIMARY KEY (id);


--
-- Name: package_addons package_addons_package_id_addon_item_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_addons
    ADD CONSTRAINT package_addons_package_id_addon_item_id_key UNIQUE (package_id, addon_item_id);


--
-- Name: package_addons package_addons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_addons
    ADD CONSTRAINT package_addons_pkey PRIMARY KEY (id);


--
-- Name: package_benefits package_benefits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_benefits
    ADD CONSTRAINT package_benefits_pkey PRIMARY KEY (id);


--
-- Name: package_hall_associations package_hall_associations_package_id_hall_type_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_hall_associations
    ADD CONSTRAINT package_hall_associations_package_id_hall_type_id_key UNIQUE (package_id, hall_type_id);


--
-- Name: package_hall_associations package_hall_associations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_hall_associations
    ADD CONSTRAINT package_hall_associations_pkey PRIMARY KEY (id);


--
-- Name: package_items package_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_items
    ADD CONSTRAINT package_items_pkey PRIMARY KEY (id);


--
-- Name: package_pricing package_pricing_package_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_pricing
    ADD CONSTRAINT package_pricing_package_id_key UNIQUE (package_id);


--
-- Name: package_pricing package_pricing_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_pricing
    ADD CONSTRAINT package_pricing_pkey PRIMARY KEY (id);


--
-- Name: package_rules package_rules_package_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_rules
    ADD CONSTRAINT package_rules_package_id_key UNIQUE (package_id);


--
-- Name: package_rules package_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_rules
    ADD CONSTRAINT package_rules_pkey PRIMARY KEY (id);


--
-- Name: package_services package_services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_services
    ADD CONSTRAINT package_services_pkey PRIMARY KEY (id);


--
-- Name: package_tiers package_tiers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_tiers
    ADD CONSTRAINT package_tiers_pkey PRIMARY KEY (id);


--
-- Name: product_orders product_orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_orders
    ADD CONSTRAINT product_orders_order_number_key UNIQUE (order_number);


--
-- Name: product_orders product_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_orders
    ADD CONSTRAINT product_orders_pkey PRIMARY KEY (id);


--
-- Name: queue_numbers queue_numbers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.queue_numbers
    ADD CONSTRAINT queue_numbers_pkey PRIMARY KEY (id);


--
-- Name: recipe_ingredients recipe_ingredients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_ingredients
    ADD CONSTRAINT recipe_ingredients_pkey PRIMARY KEY (id);


--
-- Name: reservation_items reservation_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservation_items
    ADD CONSTRAINT reservation_items_pkey PRIMARY KEY (id);


--
-- Name: reservation_operation_logs reservation_operation_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservation_operation_logs
    ADD CONSTRAINT reservation_operation_logs_pkey PRIMARY KEY (id);


--
-- Name: reservation_orders reservation_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservation_orders
    ADD CONSTRAINT reservation_orders_pkey PRIMARY KEY (id);


--
-- Name: scenario_package_store_associations scenario_package_store_associations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scenario_package_store_associations
    ADD CONSTRAINT scenario_package_store_associations_pkey PRIMARY KEY (id);


--
-- Name: scenario_packages scenario_packages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scenario_packages
    ADD CONSTRAINT scenario_packages_pkey PRIMARY KEY (id);


--
-- Name: skus skus_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skus
    ADD CONSTRAINT skus_code_key UNIQUE (code);


--
-- Name: skus skus_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skus
    ADD CONSTRAINT skus_pkey PRIMARY KEY (id);


--
-- Name: slot_inventory_snapshots slot_inventory_snapshots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slot_inventory_snapshots
    ADD CONSTRAINT slot_inventory_snapshots_pkey PRIMARY KEY (id);


--
-- Name: spus spus_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spus
    ADD CONSTRAINT spus_code_key UNIQUE (code);


--
-- Name: spus spus_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spus
    ADD CONSTRAINT spus_pkey PRIMARY KEY (id);


--
-- Name: store_inventory store_inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_inventory
    ADD CONSTRAINT store_inventory_pkey PRIMARY KEY (id);


--
-- Name: store_inventory store_inventory_store_id_sku_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_inventory
    ADD CONSTRAINT store_inventory_store_id_sku_id_key UNIQUE (store_id, sku_id);


--
-- Name: store_operation_logs store_operation_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_operation_logs
    ADD CONSTRAINT store_operation_logs_pkey PRIMARY KEY (id);


--
-- Name: store_reservation_settings store_reservation_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_reservation_settings
    ADD CONSTRAINT store_reservation_settings_pkey PRIMARY KEY (id);


--
-- Name: store_reservation_settings store_reservation_settings_store_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_reservation_settings
    ADD CONSTRAINT store_reservation_settings_store_id_key UNIQUE (store_id);


--
-- Name: stores stores_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT stores_code_key UNIQUE (code);


--
-- Name: stores stores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT stores_pkey PRIMARY KEY (id);


--
-- Name: time_slot_overrides time_slot_overrides_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_slot_overrides
    ADD CONSTRAINT time_slot_overrides_pkey PRIMARY KEY (id);


--
-- Name: time_slot_templates time_slot_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_slot_templates
    ADD CONSTRAINT time_slot_templates_pkey PRIMARY KEY (id);


--
-- Name: bom_components uk_bom_component; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bom_components
    ADD CONSTRAINT uk_bom_component UNIQUE (finished_product_id, component_id);


--
-- Name: combo_items uk_combo_sub_item; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.combo_items
    ADD CONSTRAINT uk_combo_sub_item UNIQUE (combo_id, sub_item_id);


--
-- Name: unit_conversions uk_conversion_from_to; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unit_conversions
    ADD CONSTRAINT uk_conversion_from_to UNIQUE (from_unit, to_unit);


--
-- Name: beverage_specs unique_beverage_spec; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beverage_specs
    ADD CONSTRAINT unique_beverage_spec UNIQUE (beverage_id, spec_type, spec_name);


--
-- Name: queue_numbers unique_order; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.queue_numbers
    ADD CONSTRAINT unique_order UNIQUE (order_id);


--
-- Name: scenario_package_store_associations unique_package_store; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scenario_package_store_associations
    ADD CONSTRAINT unique_package_store UNIQUE (package_id, store_id);


--
-- Name: recipe_ingredients unique_recipe_sku; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_ingredients
    ADD CONSTRAINT unique_recipe_sku UNIQUE (recipe_id, sku_id);


--
-- Name: queue_numbers unique_store_date_sequence; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.queue_numbers
    ADD CONSTRAINT unique_store_date_sequence UNIQUE (store_id, date, sequence);


--
-- Name: unit_conversions unit_conversions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unit_conversions
    ADD CONSTRAINT unit_conversions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history_s_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX flyway_schema_history_s_idx ON public.flyway_schema_history USING btree (success);


--
-- Name: idx_activity_types_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_types_name ON public.activity_types USING btree (name);


--
-- Name: idx_activity_types_name_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_activity_types_name_unique ON public.activity_types USING btree (name) WHERE ((status)::text <> 'DELETED'::text);


--
-- Name: idx_activity_types_sort; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_types_sort ON public.activity_types USING btree (sort);


--
-- Name: idx_activity_types_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_types_status ON public.activity_types USING btree (status);


--
-- Name: idx_addon_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_addon_active ON public.addon_items USING btree (is_active) WHERE (is_active = true);


--
-- Name: idx_addon_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_addon_category ON public.addon_items USING btree (category);


--
-- Name: idx_adjustments_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_adjustments_created_at ON public.inventory_adjustments USING btree (created_at DESC);


--
-- Name: idx_adjustments_operator; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_adjustments_operator ON public.inventory_adjustments USING btree (operator_id);


--
-- Name: idx_adjustments_requires_approval; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_adjustments_requires_approval ON public.inventory_adjustments USING btree (requires_approval) WHERE (requires_approval = true);


--
-- Name: idx_adjustments_sku_store; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_adjustments_sku_store ON public.inventory_adjustments USING btree (sku_id, store_id);


--
-- Name: idx_adjustments_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_adjustments_status ON public.inventory_adjustments USING btree (status);


--
-- Name: idx_approval_action_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_approval_action_time ON public.approval_records USING btree (action_time DESC);


--
-- Name: idx_approval_adjustment; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_approval_adjustment ON public.approval_records USING btree (adjustment_id);


--
-- Name: idx_approval_approver; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_approval_approver ON public.approval_records USING btree (approver_id);


--
-- Name: idx_benefit_package; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_benefit_package ON public.package_benefits USING btree (package_id, sort_order);


--
-- Name: idx_beverage_category_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_beverage_category_status ON public.beverages USING btree (category, status) WHERE ((status)::text = 'ACTIVE'::text);


--
-- Name: idx_beverage_order_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_beverage_order_created_at ON public.beverage_orders USING btree (created_at DESC);


--
-- Name: idx_beverage_order_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_beverage_order_number ON public.beverage_orders USING btree (order_number);


--
-- Name: idx_beverage_order_store_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_beverage_order_store_status ON public.beverage_orders USING btree (store_id, status, created_at DESC);


--
-- Name: idx_beverage_order_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_beverage_order_user ON public.beverage_orders USING btree (user_id, created_at DESC);


--
-- Name: idx_beverage_orders_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_beverage_orders_type ON public.beverage_orders USING btree (order_type);


--
-- Name: idx_beverage_sku_mapping_new_sku_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_beverage_sku_mapping_new_sku_id ON public.beverage_sku_mapping USING btree (new_sku_id);


--
-- Name: idx_beverage_sku_mapping_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_beverage_sku_mapping_status ON public.beverage_sku_mapping USING btree (status);


--
-- Name: idx_beverage_sort; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_beverage_sort ON public.beverages USING btree (sort_order DESC, created_at DESC);


--
-- Name: idx_bom_component; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bom_component ON public.bom_components USING btree (component_id);


--
-- Name: idx_bom_finished_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bom_finished_product ON public.bom_components USING btree (finished_product_id);


--
-- Name: idx_bom_snapshots_finished_sku; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bom_snapshots_finished_sku ON public.bom_snapshots USING btree (finished_sku_id);


--
-- Name: idx_bom_snapshots_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bom_snapshots_order_id ON public.bom_snapshots USING btree (order_id);


--
-- Name: idx_brands_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brands_code ON public.brands USING btree (brand_code);


--
-- Name: idx_brands_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brands_name ON public.brands USING btree (name);


--
-- Name: idx_brands_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brands_status ON public.brands USING btree (status);


--
-- Name: idx_brands_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brands_type ON public.brands USING btree (brand_type);


--
-- Name: idx_categories_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_categories_parent_id ON public.categories USING btree (parent_id);


--
-- Name: idx_categories_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_categories_status ON public.categories USING btree (status);


--
-- Name: idx_category_audit_log_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_category_audit_log_action ON public.category_audit_log USING btree (action);


--
-- Name: idx_category_audit_log_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_category_audit_log_category_id ON public.category_audit_log USING btree (category_id);


--
-- Name: idx_category_audit_log_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_category_audit_log_created_at ON public.category_audit_log USING btree (created_at);


--
-- Name: idx_channel_product_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_channel_product_category ON public.channel_product_config USING btree (channel_category);


--
-- Name: idx_channel_product_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_channel_product_category_id ON public.channel_product_config USING btree (category_id);


--
-- Name: idx_channel_product_channel_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_channel_product_channel_type ON public.channel_product_config USING btree (channel_type);


--
-- Name: idx_channel_product_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_channel_product_created_at ON public.channel_product_config USING btree (created_at DESC);


--
-- Name: idx_channel_product_sku_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_channel_product_sku_id ON public.channel_product_config USING btree (sku_id);


--
-- Name: idx_channel_product_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_channel_product_status ON public.channel_product_config USING btree (status);


--
-- Name: idx_combo_combo_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_combo_combo_id ON public.combo_items USING btree (combo_id);


--
-- Name: idx_combo_sub_item; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_combo_sub_item ON public.combo_items USING btree (sub_item_id);


--
-- Name: idx_halls_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_halls_status ON public.halls USING btree (status);


--
-- Name: idx_halls_store_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_halls_store_id ON public.halls USING btree (store_id);


--
-- Name: idx_halls_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_halls_type ON public.halls USING btree (type);


--
-- Name: idx_ingredient_sku; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ingredient_sku ON public.recipe_ingredients USING btree (sku_id);


--
-- Name: idx_inventory_reservations_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_reservations_order_id ON public.inventory_reservations USING btree (order_id);


--
-- Name: idx_inventory_reservations_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_reservations_status ON public.inventory_reservations USING btree (status);


--
-- Name: idx_inventory_transactions_sku_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_transactions_sku_id ON public.inventory_transactions USING btree (sku_id);


--
-- Name: idx_inventory_transactions_store_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_transactions_store_id ON public.inventory_transactions USING btree (store_id);


--
-- Name: idx_inventory_transactions_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_transactions_time ON public.inventory_transactions USING btree (transaction_time DESC);


--
-- Name: idx_inventory_transactions_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_transactions_type ON public.inventory_transactions USING btree (transaction_type);


--
-- Name: idx_item_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_item_item_id ON public.package_items USING btree (item_id);


--
-- Name: idx_item_package; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_item_package ON public.package_items USING btree (package_id, sort_order);


--
-- Name: idx_item_reservation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_item_reservation ON public.reservation_items USING btree (reservation_order_id);


--
-- Name: idx_items_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_items_order_id ON public.order_items USING btree (order_id);


--
-- Name: idx_items_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_items_product_id ON public.order_items USING btree (product_id);


--
-- Name: idx_log_operator; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_log_operator ON public.reservation_operation_logs USING btree (operator_id, operation_time DESC);


--
-- Name: idx_log_reservation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_log_reservation ON public.reservation_operation_logs USING btree (reservation_order_id, operation_time DESC);


--
-- Name: idx_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_logs_created_at ON public.order_logs USING btree (created_at DESC);


--
-- Name: idx_logs_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_logs_order_id ON public.order_logs USING btree (order_id);


--
-- Name: idx_menu_category_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_menu_category_code ON public.menu_category USING btree (code) WHERE (deleted_at IS NULL);


--
-- Name: idx_menu_category_code_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_menu_category_code_unique ON public.menu_category USING btree (code) WHERE (deleted_at IS NULL);


--
-- Name: idx_menu_category_default_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_menu_category_default_unique ON public.menu_category USING btree (is_default) WHERE ((is_default = true) AND (deleted_at IS NULL));


--
-- Name: idx_menu_category_is_visible; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_menu_category_is_visible ON public.menu_category USING btree (is_visible) WHERE (deleted_at IS NULL);


--
-- Name: idx_menu_category_sort_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_menu_category_sort_order ON public.menu_category USING btree (sort_order);


--
-- Name: idx_order_item_beverage; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_item_beverage ON public.beverage_order_items USING btree (beverage_id);


--
-- Name: idx_order_item_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_item_order ON public.beverage_order_items USING btree (order_id);


--
-- Name: idx_order_number; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_order_number ON public.product_orders USING btree (order_number);


--
-- Name: idx_orders_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_created_at ON public.product_orders USING btree (created_at DESC);


--
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_status ON public.product_orders USING btree (status);


--
-- Name: idx_orders_status_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_status_created_at ON public.product_orders USING btree (status, created_at DESC);


--
-- Name: idx_orders_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_user_id ON public.product_orders USING btree (user_id);


--
-- Name: idx_pkg_addon_package; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pkg_addon_package ON public.package_addons USING btree (package_id, sort_order);


--
-- Name: idx_pkg_base_version; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_pkg_base_version ON public.scenario_packages USING btree (base_package_id, version) WHERE (deleted_at IS NULL);


--
-- Name: idx_pkg_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pkg_category ON public.scenario_packages USING btree (category) WHERE (deleted_at IS NULL);


--
-- Name: idx_pkg_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pkg_created_at ON public.scenario_packages USING btree (created_at DESC);


--
-- Name: idx_pkg_hall_hall; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pkg_hall_hall ON public.package_hall_associations USING btree (hall_type_id);


--
-- Name: idx_pkg_hall_package; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pkg_hall_package ON public.package_hall_associations USING btree (package_id);


--
-- Name: idx_pkg_latest; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pkg_latest ON public.scenario_packages USING btree (base_package_id, is_latest) WHERE ((is_latest = true) AND (deleted_at IS NULL));


--
-- Name: idx_pkg_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pkg_status ON public.scenario_packages USING btree (status) WHERE (deleted_at IS NULL);


--
-- Name: idx_pkg_store_package; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pkg_store_package ON public.scenario_package_store_associations USING btree (package_id);


--
-- Name: idx_pkg_store_store; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pkg_store_store ON public.scenario_package_store_associations USING btree (store_id);


--
-- Name: idx_pkg_tags; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pkg_tags ON public.scenario_packages USING gin (tags);


--
-- Name: idx_pricing_package; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_pricing_package ON public.package_pricing USING btree (package_id);


--
-- Name: idx_product_orders_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_orders_type ON public.product_orders USING btree (order_type);


--
-- Name: idx_queue_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_queue_number ON public.queue_numbers USING btree (store_id, date, status);


--
-- Name: idx_queue_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_queue_order ON public.queue_numbers USING btree (order_id);


--
-- Name: idx_recipe_beverage; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recipe_beverage ON public.beverage_recipes USING btree (beverage_id);


--
-- Name: idx_recipe_ingredient; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recipe_ingredient ON public.recipe_ingredients USING btree (recipe_id);


--
-- Name: idx_reservation_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reservation_date ON public.reservation_orders USING btree (reservation_date, reservation_time);


--
-- Name: idx_reservation_order_number; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_reservation_order_number ON public.reservation_orders USING btree (order_number);


--
-- Name: idx_reservation_package; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reservation_package ON public.reservation_orders USING btree (scenario_package_id, created_at DESC);


--
-- Name: idx_reservation_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reservation_status ON public.reservation_orders USING btree (status, created_at DESC);


--
-- Name: idx_reservation_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reservation_user ON public.reservation_orders USING btree (user_id, created_at DESC);


--
-- Name: idx_reservations_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reservations_order ON public.inventory_reservations USING btree (order_id);


--
-- Name: idx_reservations_sku; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reservations_sku ON public.inventory_reservations USING btree (store_id, sku_id);


--
-- Name: idx_reservations_status_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reservations_status_expires ON public.inventory_reservations USING btree (status, expires_at) WHERE (((status)::text = 'ACTIVE'::text) AND (expires_at IS NOT NULL));


--
-- Name: idx_rule_package; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_rule_package ON public.package_rules USING btree (package_id);


--
-- Name: idx_service_package; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_service_package ON public.package_services USING btree (package_id, sort_order);


--
-- Name: idx_service_service_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_service_service_id ON public.package_services USING btree (service_id);


--
-- Name: idx_skus_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_skus_category_id ON public.skus USING btree (category_id);


--
-- Name: idx_skus_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_skus_code ON public.skus USING btree (code);


--
-- Name: idx_skus_spu_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_skus_spu_id ON public.skus USING btree (spu_id);


--
-- Name: idx_skus_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_skus_status ON public.skus USING btree (status);


--
-- Name: idx_skus_store_scope; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_skus_store_scope ON public.skus USING gin (store_scope);


--
-- Name: idx_skus_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_skus_type ON public.skus USING btree (sku_type);


--
-- Name: idx_skus_version; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_skus_version ON public.skus USING btree (version);


--
-- Name: idx_snapshot_reservation; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_snapshot_reservation ON public.slot_inventory_snapshots USING btree (reservation_order_id);


--
-- Name: idx_snapshot_slot_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_snapshot_slot_date ON public.slot_inventory_snapshots USING btree (time_slot_template_id, reservation_date);


--
-- Name: idx_snapshots_finished_sku; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_snapshots_finished_sku ON public.bom_snapshots USING btree (finished_sku_id);


--
-- Name: idx_snapshots_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_snapshots_order ON public.bom_snapshots USING btree (order_id);


--
-- Name: idx_spec_beverage; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_spec_beverage ON public.beverage_specs USING btree (beverage_id, spec_type);


--
-- Name: idx_spus_brand_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_spus_brand_id ON public.spus USING btree (brand_id);


--
-- Name: idx_spus_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_spus_category_id ON public.spus USING btree (category_id);


--
-- Name: idx_spus_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_spus_code ON public.spus USING btree (code);


--
-- Name: idx_spus_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_spus_created_at ON public.spus USING btree (created_at);


--
-- Name: idx_spus_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_spus_name ON public.spus USING btree (name);


--
-- Name: idx_spus_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_spus_status ON public.spus USING btree (status);


--
-- Name: idx_status_log_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_status_log_order ON public.beverage_order_status_logs USING btree (order_id, created_at DESC);


--
-- Name: idx_store_inventory_available_qty; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_store_inventory_available_qty ON public.store_inventory USING btree (available_qty);


--
-- Name: idx_store_inventory_lock; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_store_inventory_lock ON public.store_inventory USING btree (store_id, sku_id);


--
-- Name: idx_store_inventory_sku_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_store_inventory_sku_id ON public.store_inventory USING btree (sku_id);


--
-- Name: idx_store_inventory_store_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_store_inventory_store_id ON public.store_inventory USING btree (store_id);


--
-- Name: idx_store_operation_logs_operation_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_store_operation_logs_operation_time ON public.store_operation_logs USING btree (operation_time DESC);


--
-- Name: idx_store_operation_logs_store_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_store_operation_logs_store_id ON public.store_operation_logs USING btree (store_id);


--
-- Name: idx_store_reservation_settings_enabled; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_store_reservation_settings_enabled ON public.store_reservation_settings USING btree (is_reservation_enabled);


--
-- Name: idx_store_reservation_settings_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_store_reservation_settings_is_active ON public.store_reservation_settings USING btree (is_active);


--
-- Name: idx_store_reservation_settings_store_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_store_reservation_settings_store_id ON public.store_reservation_settings USING btree (store_id);


--
-- Name: idx_store_reservation_settings_time_slots; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_store_reservation_settings_time_slots ON public.store_reservation_settings USING gin (time_slots);


--
-- Name: idx_stores_city; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stores_city ON public.stores USING btree (city);


--
-- Name: idx_stores_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stores_code ON public.stores USING btree (code);


--
-- Name: idx_stores_district; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stores_district ON public.stores USING btree (district);


--
-- Name: idx_stores_province; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stores_province ON public.stores USING btree (province);


--
-- Name: idx_stores_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stores_status ON public.stores USING btree (status);


--
-- Name: idx_tier_package; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tier_package ON public.package_tiers USING btree (package_id, sort_order);


--
-- Name: idx_transactions_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transactions_order ON public.inventory_transactions USING btree (related_order_id);


--
-- Name: idx_transactions_store_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transactions_store_type ON public.inventory_transactions USING btree (store_id, transaction_type);


--
-- Name: idx_tso_package_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tso_package_date ON public.time_slot_overrides USING btree (package_id, override_date);


--
-- Name: idx_tst_enabled; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tst_enabled ON public.time_slot_templates USING btree (package_id, is_enabled) WHERE (is_enabled = true);


--
-- Name: idx_tst_package; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tst_package ON public.time_slot_templates USING btree (package_id);


--
-- Name: uq_sku_channel_active; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_sku_channel_active ON public.channel_product_config USING btree (sku_id, channel_type) WHERE (deleted_at IS NULL);


--
-- Name: INDEX uq_sku_channel_active; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.uq_sku_channel_active IS '唯一索引：同一 SKU 在同一渠道只能有一条有效配置（排除已删除记录）';


--
-- Name: menu_category trg_menu_category_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_menu_category_updated_at BEFORE UPDATE ON public.menu_category FOR EACH ROW EXECUTE FUNCTION public.update_menu_category_timestamp();


--
-- Name: reservation_orders trg_reservation_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_reservation_updated_at BEFORE UPDATE ON public.reservation_orders FOR EACH ROW EXECUTE FUNCTION public.update_reservation_updated_at();


--
-- Name: bom_components trigger_bom_finished_product_type; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_bom_finished_product_type BEFORE INSERT OR UPDATE ON public.bom_components FOR EACH ROW EXECUTE FUNCTION public.check_bom_finished_product_type();


--
-- Name: TRIGGER trigger_bom_finished_product_type ON bom_components; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TRIGGER trigger_bom_finished_product_type ON public.bom_components IS 'BOM 成品类型验证触发器：确保 finished_product_id 引用的 SKU 类型为 finished_product';


--
-- Name: activity_types trigger_update_activity_types_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_activity_types_updated_at BEFORE UPDATE ON public.activity_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: channel_product_config trigger_update_channel_product_config_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_channel_product_config_updated_at BEFORE UPDATE ON public.channel_product_config FOR EACH ROW EXECUTE FUNCTION public.update_channel_product_config_updated_at();


--
-- Name: store_inventory trigger_update_store_inventory_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_store_inventory_updated_at BEFORE UPDATE ON public.store_inventory FOR EACH ROW EXECUTE FUNCTION public.update_store_inventory_updated_at();


--
-- Name: store_reservation_settings trigger_update_store_reservation_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_store_reservation_settings_updated_at BEFORE UPDATE ON public.store_reservation_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: addon_items update_addon_items_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_addon_items_updated_at BEFORE UPDATE ON public.addon_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: adjustment_reasons update_adjustment_reasons_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_adjustment_reasons_updated_at BEFORE UPDATE ON public.adjustment_reasons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: halls update_halls_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_halls_updated_at BEFORE UPDATE ON public.halls FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: inventory_adjustments update_inventory_adjustments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_inventory_adjustments_updated_at BEFORE UPDATE ON public.inventory_adjustments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: package_pricing update_package_pricing_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_package_pricing_updated_at BEFORE UPDATE ON public.package_pricing FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: package_tiers update_package_tiers_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_package_tiers_updated_at BEFORE UPDATE ON public.package_tiers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: product_orders update_product_orders_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_product_orders_updated_at BEFORE UPDATE ON public.product_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: scenario_packages update_scenario_packages_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_scenario_packages_updated_at BEFORE UPDATE ON public.scenario_packages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: stores update_stores_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON public.stores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: time_slot_overrides update_time_slot_overrides_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_time_slot_overrides_updated_at BEFORE UPDATE ON public.time_slot_overrides FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: time_slot_templates update_time_slot_templates_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_time_slot_templates_updated_at BEFORE UPDATE ON public.time_slot_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: approval_records approval_records_adjustment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approval_records
    ADD CONSTRAINT approval_records_adjustment_id_fkey FOREIGN KEY (adjustment_id) REFERENCES public.inventory_adjustments(id) ON DELETE CASCADE;


--
-- Name: beverage_order_items beverage_order_items_beverage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beverage_order_items
    ADD CONSTRAINT beverage_order_items_beverage_id_fkey FOREIGN KEY (beverage_id) REFERENCES public.beverages(id) ON DELETE RESTRICT;


--
-- Name: beverage_order_items beverage_order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beverage_order_items
    ADD CONSTRAINT beverage_order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.beverage_orders(id) ON DELETE CASCADE;


--
-- Name: beverage_order_status_logs beverage_order_status_logs_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beverage_order_status_logs
    ADD CONSTRAINT beverage_order_status_logs_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.beverage_orders(id) ON DELETE CASCADE;


--
-- Name: beverage_recipes beverage_recipes_beverage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beverage_recipes
    ADD CONSTRAINT beverage_recipes_beverage_id_fkey FOREIGN KEY (beverage_id) REFERENCES public.beverages(id) ON DELETE CASCADE;


--
-- Name: beverage_specs beverage_specs_beverage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beverage_specs
    ADD CONSTRAINT beverage_specs_beverage_id_fkey FOREIGN KEY (beverage_id) REFERENCES public.beverages(id) ON DELETE CASCADE;


--
-- Name: bom_components bom_components_component_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bom_components
    ADD CONSTRAINT bom_components_component_id_fkey FOREIGN KEY (component_id) REFERENCES public.skus(id) ON DELETE RESTRICT;


--
-- Name: bom_components bom_components_finished_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bom_components
    ADD CONSTRAINT bom_components_finished_product_id_fkey FOREIGN KEY (finished_product_id) REFERENCES public.skus(id) ON DELETE CASCADE;


--
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id);


--
-- Name: channel_product_config channel_product_config_sku_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.channel_product_config
    ADD CONSTRAINT channel_product_config_sku_id_fkey FOREIGN KEY (sku_id) REFERENCES public.skus(id) ON DELETE CASCADE;


--
-- Name: combo_items combo_items_combo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.combo_items
    ADD CONSTRAINT combo_items_combo_id_fkey FOREIGN KEY (combo_id) REFERENCES public.skus(id) ON DELETE CASCADE;


--
-- Name: combo_items combo_items_sub_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.combo_items
    ADD CONSTRAINT combo_items_sub_item_id_fkey FOREIGN KEY (sub_item_id) REFERENCES public.skus(id) ON DELETE RESTRICT;


--
-- Name: inventory_adjustments fk_adjustments_reason; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_adjustments
    ADD CONSTRAINT fk_adjustments_reason FOREIGN KEY (reason_code) REFERENCES public.adjustment_reasons(code);


--
-- Name: beverage_sku_mapping fk_beverage_sku_mapping_new_sku; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beverage_sku_mapping
    ADD CONSTRAINT fk_beverage_sku_mapping_new_sku FOREIGN KEY (new_sku_id) REFERENCES public.skus(id) ON DELETE RESTRICT;


--
-- Name: channel_product_config fk_channel_product_category; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.channel_product_config
    ADD CONSTRAINT fk_channel_product_category FOREIGN KEY (category_id) REFERENCES public.menu_category(id) ON DELETE SET NULL;


--
-- Name: inventory_reservations fk_reservation_sku; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_reservations
    ADD CONSTRAINT fk_reservation_sku FOREIGN KEY (sku_id) REFERENCES public.skus(id);


--
-- Name: inventory_reservations fk_reservation_store; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_reservations
    ADD CONSTRAINT fk_reservation_store FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- Name: bom_snapshots fk_snapshot_finished_sku; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bom_snapshots
    ADD CONSTRAINT fk_snapshot_finished_sku FOREIGN KEY (finished_sku_id) REFERENCES public.skus(id);


--
-- Name: bom_snapshots fk_snapshot_raw_sku; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bom_snapshots
    ADD CONSTRAINT fk_snapshot_raw_sku FOREIGN KEY (raw_material_sku_id) REFERENCES public.skus(id);


--
-- Name: halls halls_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.halls
    ADD CONSTRAINT halls_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;


--
-- Name: inventory_transactions inventory_transactions_sku_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_sku_id_fkey FOREIGN KEY (sku_id) REFERENCES public.skus(id);


--
-- Name: inventory_transactions inventory_transactions_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.product_orders(id) ON DELETE CASCADE;


--
-- Name: order_logs order_logs_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_logs
    ADD CONSTRAINT order_logs_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.product_orders(id) ON DELETE CASCADE;


--
-- Name: package_addons package_addons_addon_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_addons
    ADD CONSTRAINT package_addons_addon_item_id_fkey FOREIGN KEY (addon_item_id) REFERENCES public.addon_items(id) ON DELETE CASCADE;


--
-- Name: package_addons package_addons_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_addons
    ADD CONSTRAINT package_addons_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.scenario_packages(id) ON DELETE CASCADE;


--
-- Name: package_benefits package_benefits_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_benefits
    ADD CONSTRAINT package_benefits_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.scenario_packages(id) ON DELETE CASCADE;


--
-- Name: package_hall_associations package_hall_associations_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_hall_associations
    ADD CONSTRAINT package_hall_associations_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.scenario_packages(id) ON DELETE CASCADE;


--
-- Name: package_items package_items_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_items
    ADD CONSTRAINT package_items_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.scenario_packages(id) ON DELETE CASCADE;


--
-- Name: package_pricing package_pricing_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_pricing
    ADD CONSTRAINT package_pricing_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.scenario_packages(id) ON DELETE CASCADE;


--
-- Name: package_rules package_rules_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_rules
    ADD CONSTRAINT package_rules_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.scenario_packages(id) ON DELETE CASCADE;


--
-- Name: package_services package_services_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_services
    ADD CONSTRAINT package_services_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.scenario_packages(id) ON DELETE CASCADE;


--
-- Name: package_tiers package_tiers_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_tiers
    ADD CONSTRAINT package_tiers_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.scenario_packages(id) ON DELETE CASCADE;


--
-- Name: queue_numbers queue_numbers_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.queue_numbers
    ADD CONSTRAINT queue_numbers_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.beverage_orders(id) ON DELETE CASCADE;


--
-- Name: recipe_ingredients recipe_ingredients_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_ingredients
    ADD CONSTRAINT recipe_ingredients_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.beverage_recipes(id) ON DELETE CASCADE;


--
-- Name: recipe_ingredients recipe_ingredients_sku_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_ingredients
    ADD CONSTRAINT recipe_ingredients_sku_id_fkey FOREIGN KEY (sku_id) REFERENCES public.skus(id) ON DELETE RESTRICT;


--
-- Name: reservation_items reservation_items_addon_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservation_items
    ADD CONSTRAINT reservation_items_addon_item_id_fkey FOREIGN KEY (addon_item_id) REFERENCES public.addon_items(id) ON DELETE RESTRICT;


--
-- Name: reservation_items reservation_items_reservation_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservation_items
    ADD CONSTRAINT reservation_items_reservation_order_id_fkey FOREIGN KEY (reservation_order_id) REFERENCES public.reservation_orders(id) ON DELETE CASCADE;


--
-- Name: reservation_operation_logs reservation_operation_logs_reservation_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservation_operation_logs
    ADD CONSTRAINT reservation_operation_logs_reservation_order_id_fkey FOREIGN KEY (reservation_order_id) REFERENCES public.reservation_orders(id) ON DELETE CASCADE;


--
-- Name: reservation_orders reservation_orders_package_tier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservation_orders
    ADD CONSTRAINT reservation_orders_package_tier_id_fkey FOREIGN KEY (package_tier_id) REFERENCES public.package_tiers(id) ON DELETE RESTRICT;


--
-- Name: reservation_orders reservation_orders_scenario_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservation_orders
    ADD CONSTRAINT reservation_orders_scenario_package_id_fkey FOREIGN KEY (scenario_package_id) REFERENCES public.scenario_packages(id) ON DELETE RESTRICT;


--
-- Name: reservation_orders reservation_orders_time_slot_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservation_orders
    ADD CONSTRAINT reservation_orders_time_slot_template_id_fkey FOREIGN KEY (time_slot_template_id) REFERENCES public.time_slot_templates(id) ON DELETE RESTRICT;


--
-- Name: scenario_package_store_associations scenario_package_store_associations_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scenario_package_store_associations
    ADD CONSTRAINT scenario_package_store_associations_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.scenario_packages(id) ON DELETE CASCADE;


--
-- Name: scenario_package_store_associations scenario_package_store_associations_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scenario_package_store_associations
    ADD CONSTRAINT scenario_package_store_associations_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE RESTRICT;


--
-- Name: scenario_packages scenario_packages_base_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scenario_packages
    ADD CONSTRAINT scenario_packages_base_package_id_fkey FOREIGN KEY (base_package_id) REFERENCES public.scenario_packages(id) ON DELETE RESTRICT;


--
-- Name: skus skus_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skus
    ADD CONSTRAINT skus_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: slot_inventory_snapshots slot_inventory_snapshots_reservation_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slot_inventory_snapshots
    ADD CONSTRAINT slot_inventory_snapshots_reservation_order_id_fkey FOREIGN KEY (reservation_order_id) REFERENCES public.reservation_orders(id) ON DELETE CASCADE;


--
-- Name: slot_inventory_snapshots slot_inventory_snapshots_time_slot_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slot_inventory_snapshots
    ADD CONSTRAINT slot_inventory_snapshots_time_slot_template_id_fkey FOREIGN KEY (time_slot_template_id) REFERENCES public.time_slot_templates(id) ON DELETE RESTRICT;


--
-- Name: store_inventory store_inventory_sku_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_inventory
    ADD CONSTRAINT store_inventory_sku_id_fkey FOREIGN KEY (sku_id) REFERENCES public.skus(id) ON DELETE CASCADE;


--
-- Name: store_inventory store_inventory_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_inventory
    ADD CONSTRAINT store_inventory_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;


--
-- Name: store_operation_logs store_operation_logs_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_operation_logs
    ADD CONSTRAINT store_operation_logs_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;


--
-- Name: store_reservation_settings store_reservation_settings_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_reservation_settings
    ADD CONSTRAINT store_reservation_settings_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;


--
-- Name: time_slot_overrides time_slot_overrides_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_slot_overrides
    ADD CONSTRAINT time_slot_overrides_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.scenario_packages(id) ON DELETE CASCADE;


--
-- Name: time_slot_templates time_slot_templates_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_slot_templates
    ADD CONSTRAINT time_slot_templates_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.scenario_packages(id) ON DELETE CASCADE;


--
-- Name: activity_types Enable all access for activity_types; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable all access for activity_types" ON public.activity_types USING (true);


--
-- Name: halls Enable all access for halls; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable all access for halls" ON public.halls USING (true);


--
-- Name: scenario_package_store_associations Enable all access for scenario_package_store_associations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable all access for scenario_package_store_associations" ON public.scenario_package_store_associations USING (true);


--
-- Name: store_reservation_settings Enable all access for store_reservation_settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable all access for store_reservation_settings" ON public.store_reservation_settings USING (true);


--
-- Name: stores Enable all access for stores; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable all access for stores" ON public.stores USING (true);


--
-- Name: activity_types; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.activity_types ENABLE ROW LEVEL SECURITY;

--
-- Name: adjustment_reasons; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.adjustment_reasons ENABLE ROW LEVEL SECURITY;

--
-- Name: adjustment_reasons adjustment_reasons_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY adjustment_reasons_read ON public.adjustment_reasons FOR SELECT USING (true);


--
-- Name: inventory_adjustments adjustments_authenticated_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY adjustments_authenticated_all ON public.inventory_adjustments USING (true);


--
-- Name: approval_records; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.approval_records ENABLE ROW LEVEL SECURITY;

--
-- Name: approval_records approval_records_authenticated_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY approval_records_authenticated_all ON public.approval_records USING (true);


--
-- Name: inventory_adjustments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.inventory_adjustments ENABLE ROW LEVEL SECURITY;

--
-- Name: scenario_package_store_associations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.scenario_package_store_associations ENABLE ROW LEVEL SECURITY;

--
-- Name: store_reservation_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.store_reservation_settings ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

\unrestrict zpUb8bVofzMqze9GSuNwggs4wdcYhwD0p2pRJNs9tVMbXnHR4vMpseX0HIjvg4t

