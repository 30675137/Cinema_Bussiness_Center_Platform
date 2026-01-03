-- @spec O002-miniapp-menu-config
-- 菜单分类表：将硬编码的 ChannelCategory 枚举迁移到数据库表
--
-- 变更说明：
-- 1. 创建 menu_category 表，替代 ChannelCategory 枚举
-- 2. 创建 category_audit_log 表，记录分类操作日志
-- 3. 为 channel_product_config 添加 category_id 外键
-- 4. 创建必要的索引和触发器

-- ============================================
-- T007: 创建 menu_category 表
-- ============================================

CREATE TABLE IF NOT EXISTS menu_category (
    -- 主键
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 分类编码（唯一，用于 API 查询和向后兼容）
    code VARCHAR(50) NOT NULL,

    -- 显示名称（中文）
    display_name VARCHAR(50) NOT NULL,

    -- 排序序号（数字越小越靠前）
    sort_order INTEGER NOT NULL DEFAULT 0,

    -- 是否可见（false 则小程序不显示）
    is_visible BOOLEAN NOT NULL DEFAULT true,

    -- 是否为默认分类（"其他"分类，不可删除）
    is_default BOOLEAN NOT NULL DEFAULT false,

    -- 图标 URL（可选）
    icon_url TEXT,

    -- 分类描述（可选）
    description TEXT,

    -- 审计字段
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,

    -- 软删除
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- 约束
    CONSTRAINT chk_display_name_length CHECK (char_length(display_name) BETWEEN 1 AND 50),
    CONSTRAINT chk_code_format CHECK (code ~ '^[A-Z][A-Z0-9_]*$')
);

-- 添加表注释
COMMENT ON TABLE menu_category IS '菜单分类表 - 小程序商品分类配置';
COMMENT ON COLUMN menu_category.id IS '分类唯一标识';
COMMENT ON COLUMN menu_category.code IS '分类编码，用于向后兼容旧 API';
COMMENT ON COLUMN menu_category.display_name IS '显示名称（中文）';
COMMENT ON COLUMN menu_category.sort_order IS '排序序号，越小越靠前';
COMMENT ON COLUMN menu_category.is_visible IS '是否在小程序中可见';
COMMENT ON COLUMN menu_category.is_default IS '是否为默认分类（不可删除）';

-- ============================================
-- T08: 创建 category_audit_log 表
-- ============================================

CREATE TABLE IF NOT EXISTS category_audit_log (
    -- 主键
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 操作的分类 ID
    category_id UUID NOT NULL,

    -- 操作类型
    action VARCHAR(20) NOT NULL,

    -- 操作前数据快照（JSON）
    before_data JSONB,

    -- 操作后数据快照（JSON）
    after_data JSONB,

    -- 变更详情描述
    change_description TEXT,

    -- 受影响的商品数量（删除分类时）
    affected_product_count INTEGER DEFAULT 0,

    -- 操作人
    operator_id UUID,
    operator_name VARCHAR(100),

    -- 操作时间
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- IP 地址
    ip_address VARCHAR(45)
);

-- 添加表注释
COMMENT ON TABLE category_audit_log IS '分类操作审计日志表';
COMMENT ON COLUMN category_audit_log.action IS '操作类型: CREATE, UPDATE, DELETE, REORDER';
COMMENT ON COLUMN category_audit_log.before_data IS '操作前的分类数据快照';
COMMENT ON COLUMN category_audit_log.after_data IS '操作后的分类数据快照';

-- ============================================
-- T09: 为 channel_product_config 添加 category_id 列
-- ============================================

-- 添加 category_id 外键字段（先允许为空，迁移数据后设置非空）
ALTER TABLE channel_product_config
ADD COLUMN IF NOT EXISTS category_id UUID;

-- 添加列注释
COMMENT ON COLUMN channel_product_config.category_id IS '关联的菜单分类ID，替代原 channel_category 枚举';

-- ============================================
-- T10: 创建 menu_category 表索引
-- ============================================

-- 排序索引
CREATE INDEX IF NOT EXISTS idx_menu_category_sort_order
ON menu_category(sort_order);

-- 可见性索引（只对未删除的记录）
CREATE INDEX IF NOT EXISTS idx_menu_category_is_visible
ON menu_category(is_visible)
WHERE deleted_at IS NULL;

-- 编码索引（只对未删除的记录）
CREATE INDEX IF NOT EXISTS idx_menu_category_code
ON menu_category(code)
WHERE deleted_at IS NULL;

-- ============================================
-- T11: 创建唯一约束（确保只有一个默认分类）
-- ============================================

-- 确保只有一个 is_default=true 的分类（排除已删除）
CREATE UNIQUE INDEX IF NOT EXISTS idx_menu_category_default_unique
ON menu_category(is_default)
WHERE is_default = true AND deleted_at IS NULL;

-- code 唯一约束（排除已删除）
CREATE UNIQUE INDEX IF NOT EXISTS idx_menu_category_code_unique
ON menu_category(code)
WHERE deleted_at IS NULL;

-- ============================================
-- T12: 创建自动更新 updated_at 的触发器
-- ============================================

-- 创建或替换触发器函数
CREATE OR REPLACE FUNCTION update_menu_category_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 如果触发器已存在，先删除
DROP TRIGGER IF EXISTS trg_menu_category_updated_at ON menu_category;

-- 创建触发器
CREATE TRIGGER trg_menu_category_updated_at
    BEFORE UPDATE ON menu_category
    FOR EACH ROW
    EXECUTE FUNCTION update_menu_category_timestamp();

-- ============================================
-- 创建 category_audit_log 表索引
-- ============================================

CREATE INDEX IF NOT EXISTS idx_category_audit_log_category_id
ON category_audit_log(category_id);

CREATE INDEX IF NOT EXISTS idx_category_audit_log_action
ON category_audit_log(action);

CREATE INDEX IF NOT EXISTS idx_category_audit_log_created_at
ON category_audit_log(created_at);

-- ============================================
-- 创建 channel_product_config.category_id 索引
-- ============================================

CREATE INDEX IF NOT EXISTS idx_channel_product_category_id
ON channel_product_config(category_id);

-- ============================================
-- 完成
-- ============================================
-- 注意：外键约束将在数据迁移脚本（V2026_01_03_002）执行后添加
-- 以确保所有商品都有有效的 category_id 后再设置非空约束
