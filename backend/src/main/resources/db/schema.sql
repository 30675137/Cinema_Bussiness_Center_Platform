-- ============================================================================
-- Cinema Hall & Store 数据库表结构
-- 数据库：Supabase PostgreSQL
-- ============================================================================

-- 1. 创建 stores 表（门店）
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    region VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建 halls 表（影厅）
CREATE TABLE IF NOT EXISTS halls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    code VARCHAR(50),
    name VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('VIP', 'PUBLIC', 'CP', 'PARTY')),
    capacity INTEGER NOT NULL CHECK (capacity > 0 AND capacity <= 1000),
    tags TEXT[],
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_id, code)
);

-- 3. 创建索引
CREATE INDEX IF NOT EXISTS idx_stores_code ON stores(code);
CREATE INDEX IF NOT EXISTS idx_stores_status ON stores(status);
CREATE INDEX IF NOT EXISTS idx_halls_store_id ON halls(store_id);
CREATE INDEX IF NOT EXISTS idx_halls_status ON halls(status);
CREATE INDEX IF NOT EXISTS idx_halls_type ON halls(type);

-- 4. 创建 updated_at 自动更新触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. 为 stores 表添加触发器
DROP TRIGGER IF EXISTS update_stores_updated_at ON stores;
CREATE TRIGGER update_stores_updated_at
    BEFORE UPDATE ON stores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. 为 halls 表添加触发器
DROP TRIGGER IF EXISTS update_halls_updated_at ON halls;
CREATE TRIGGER update_halls_updated_at
    BEFORE UPDATE ON halls
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. 启用 Row Level Security (RLS)
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE halls ENABLE ROW LEVEL SECURITY;

-- 8. 创建 RLS 策略（允许所有操作 - 可根据实际需求调整）
CREATE POLICY "Enable all access for stores" ON stores FOR ALL USING (true);
CREATE POLICY "Enable all access for halls" ON halls FOR ALL USING (true);

-- 9. 创建 store_reservation_settings 表（门店预约设置）
CREATE TABLE IF NOT EXISTS store_reservation_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL UNIQUE REFERENCES stores(id) ON DELETE CASCADE,
  is_reservation_enabled BOOLEAN NOT NULL DEFAULT false,
  max_reservation_days INTEGER NOT NULL DEFAULT 0 CHECK (max_reservation_days >= 0 AND max_reservation_days <= 365),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by VARCHAR(255) -- 如果支持用户追踪，记录最后更新人
);

-- 10. 为 store_reservation_settings 表创建索引
CREATE INDEX IF NOT EXISTS idx_store_reservation_settings_store_id ON store_reservation_settings(store_id);
CREATE INDEX IF NOT EXISTS idx_store_reservation_settings_enabled ON store_reservation_settings(is_reservation_enabled);

-- 11. 为 store_reservation_settings 表添加触发器
DROP TRIGGER IF EXISTS trigger_update_store_reservation_settings_updated_at ON store_reservation_settings;
CREATE TRIGGER trigger_update_store_reservation_settings_updated_at
  BEFORE UPDATE ON store_reservation_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 12. 为 store_reservation_settings 表启用 RLS
ALTER TABLE store_reservation_settings ENABLE ROW LEVEL SECURITY;

-- 13. 创建 store_reservation_settings 表的 RLS 策略
CREATE POLICY "Enable all access for store_reservation_settings" ON store_reservation_settings FOR ALL USING (true);

-- 14. 创建 activity_types 表（活动类型）
CREATE TABLE IF NOT EXISTS activity_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description VARCHAR(500),
  status VARCHAR(20) NOT NULL DEFAULT 'ENABLED' CHECK (status IN ('ENABLED', 'DISABLED', 'DELETED')),
  sort INTEGER NOT NULL DEFAULT 0,
  business_category VARCHAR(100),
  background_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  created_by VARCHAR(255),
  updated_by VARCHAR(255)
);

-- 15. 为 activity_types 表创建索引
CREATE INDEX IF NOT EXISTS idx_activity_types_status ON activity_types(status);
CREATE INDEX IF NOT EXISTS idx_activity_types_sort ON activity_types(sort);
CREATE INDEX IF NOT EXISTS idx_activity_types_name ON activity_types(name);

-- 16. 创建 activity_types 表的唯一约束（名称，排除已删除状态）
CREATE UNIQUE INDEX IF NOT EXISTS idx_activity_types_name_unique ON activity_types(name) WHERE status != 'DELETED';

-- 17. 为 activity_types 表添加触发器
DROP TRIGGER IF EXISTS trigger_update_activity_types_updated_at ON activity_types;
CREATE TRIGGER trigger_update_activity_types_updated_at
  BEFORE UPDATE ON activity_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 18. 为 activity_types 表启用 RLS
ALTER TABLE activity_types ENABLE ROW LEVEL SECURITY;

-- 19. 创建 activity_types 表的 RLS 策略
CREATE POLICY "Enable all access for activity_types" ON activity_types FOR ALL USING (true);

-- ============================================================================
-- 注释
-- ============================================================================
COMMENT ON TABLE stores IS '门店信息表';
COMMENT ON COLUMN stores.code IS '门店编码，唯一标识';
COMMENT ON COLUMN stores.name IS '门店名称';
COMMENT ON COLUMN stores.region IS '门店所属区域';
COMMENT ON COLUMN stores.status IS '门店状态：active=营业中, inactive=已停业';

COMMENT ON TABLE halls IS '影厅信息表';
COMMENT ON COLUMN halls.store_id IS '所属门店ID';
COMMENT ON COLUMN halls.code IS '影厅编码，在门店内唯一';
COMMENT ON COLUMN halls.name IS '影厅名称';
COMMENT ON COLUMN halls.type IS '影厅类型：VIP=VIP厅, PUBLIC=普通厅, CP=情侣厅, PARTY=派对厅';
COMMENT ON COLUMN halls.capacity IS '可容纳人数（1-1000）';
COMMENT ON COLUMN halls.tags IS '影厅特性标签数组';
COMMENT ON COLUMN halls.status IS '影厅状态：active=可用, inactive=停用, maintenance=维护中';

COMMENT ON TABLE store_reservation_settings IS '门店预约设置表，存储每个门店的预约配置（是否开放预约、可预约天数）';
COMMENT ON COLUMN store_reservation_settings.store_id IS '门店ID，与stores表一对一关系';
COMMENT ON COLUMN store_reservation_settings.is_reservation_enabled IS '是否开放预约';
COMMENT ON COLUMN store_reservation_settings.max_reservation_days IS '可预约天数（未来N天），范围0-365';
COMMENT ON COLUMN store_reservation_settings.updated_by IS '最后更新人（如果支持用户追踪）';

COMMENT ON TABLE activity_types IS '活动类型表，存储预约活动类型配置（如企业团建、订婚、生日Party等）';
COMMENT ON COLUMN activity_types.name IS '活动类型名称，必填，唯一（在非已删除状态下）';
COMMENT ON COLUMN activity_types.description IS '活动类型描述，可选';
COMMENT ON COLUMN activity_types.status IS '状态：ENABLED=启用, DISABLED=停用, DELETED=已删除（软删除）';
COMMENT ON COLUMN activity_types.sort IS '排序号，用于控制显示顺序';
COMMENT ON COLUMN activity_types.business_category IS '业务分类（如：私人订制、商务团建、派对策划），用于分组和筛选';
COMMENT ON COLUMN activity_types.background_image_url IS '场景背景图 URL，用于后台与小程序端场景卡片展示';
COMMENT ON COLUMN activity_types.deleted_at IS '删除时间（软删除时记录）';
COMMENT ON COLUMN activity_types.created_by IS '创建人（如果支持用户追踪）';
COMMENT ON COLUMN activity_types.updated_by IS '更新人（如果支持用户追踪）';

-- activity_type_packages 表：活动类型下的套餐配置
CREATE TABLE IF NOT EXISTS activity_type_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_type_id UUID NOT NULL REFERENCES activity_types(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  current_price NUMERIC(10, 2) NOT NULL,
  original_price NUMERIC(10, 2),
  sort INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_type_packages_activity_type_id ON activity_type_packages(activity_type_id);
CREATE INDEX IF NOT EXISTS idx_activity_type_packages_sort ON activity_type_packages(sort);

DROP TRIGGER IF EXISTS trigger_update_activity_type_packages_updated_at ON activity_type_packages;
CREATE TRIGGER trigger_update_activity_type_packages_updated_at
  BEFORE UPDATE ON activity_type_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE activity_type_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for activity_type_packages" ON activity_type_packages FOR ALL USING (true);

COMMENT ON TABLE activity_type_packages IS '活动类型套餐表，用于配置每种活动类型下的具体套餐及价格信息';
COMMENT ON COLUMN activity_type_packages.activity_type_id IS '所属活动类型ID';
COMMENT ON COLUMN activity_type_packages.name IS '套餐名称，如基础套餐、豪华套餐';
COMMENT ON COLUMN activity_type_packages.current_price IS '当前售价，单位与业务约定一致';
COMMENT ON COLUMN activity_type_packages.original_price IS '原价（如有优惠时用于展示对比）';
COMMENT ON COLUMN activity_type_packages.sort IS '排序号，用于控制同一活动类型下套餐显示顺序';

-- activity_type_halls 表：活动类型与门店/影厅的资源关联
CREATE TABLE IF NOT EXISTS activity_type_halls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_type_id UUID NOT NULL REFERENCES activity_types(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  hall_id UUID NOT NULL REFERENCES halls(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (activity_type_id, hall_id)
);

CREATE INDEX IF NOT EXISTS idx_activity_type_halls_activity_type_id ON activity_type_halls(activity_type_id);
CREATE INDEX IF NOT EXISTS idx_activity_type_halls_store_id ON activity_type_halls(store_id);
CREATE INDEX IF NOT EXISTS idx_activity_type_halls_hall_id ON activity_type_halls(hall_id);

DROP TRIGGER IF EXISTS trigger_update_activity_type_halls_updated_at ON activity_type_halls;
CREATE TRIGGER trigger_update_activity_type_halls_updated_at
  BEFORE UPDATE ON activity_type_halls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE activity_type_halls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for activity_type_halls" ON activity_type_halls FOR ALL USING (true);

COMMENT ON TABLE activity_type_halls IS '活动类型与门店/影厅资源关联表，用于限定某活动类型适用的物理场地';
COMMENT ON COLUMN activity_type_halls.activity_type_id IS '活动类型ID';
COMMENT ON COLUMN activity_type_halls.store_id IS '门店ID';
COMMENT ON COLUMN activity_type_halls.hall_id IS '影厅ID';
