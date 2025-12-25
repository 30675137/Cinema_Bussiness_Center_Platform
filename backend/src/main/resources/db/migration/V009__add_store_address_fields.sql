-- V6__add_store_address_fields.sql
-- 020-store-address: 为门店表添加地址信息字段
-- Created: 2025-12-22

-- 添加地址相关字段
ALTER TABLE stores
ADD COLUMN IF NOT EXISTS province VARCHAR(50),
ADD COLUMN IF NOT EXISTS city VARCHAR(50),
ADD COLUMN IF NOT EXISTS district VARCHAR(50),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS phone VARCHAR(30);

-- 添加索引以支持按区域筛选
CREATE INDEX IF NOT EXISTS idx_stores_province ON stores(province);
CREATE INDEX IF NOT EXISTS idx_stores_city ON stores(city);
CREATE INDEX IF NOT EXISTS idx_stores_district ON stores(district);

-- 添加约束：phone 格式校验
-- 支持格式：手机号(11位1开头)、座机(区号+号码)、400热线
ALTER TABLE stores
ADD CONSTRAINT chk_phone_format CHECK (
    phone IS NULL OR
    phone ~ '^(1[3-9]\d{9})|(0\d{2,3}-?\d{7,8})|(400-?\d{3}-?\d{4})$'
);

-- 可选：将现有 region 数据迁移到新字段（如果 region 包含城市信息）
-- UPDATE stores SET province = region, city = region WHERE region IS NOT NULL AND province IS NULL;

COMMENT ON COLUMN stores.province IS '省份，如 北京市';
COMMENT ON COLUMN stores.city IS '城市，如 北京市（直辖市与省份相同）';
COMMENT ON COLUMN stores.district IS '区县，如 朝阳区';
COMMENT ON COLUMN stores.address IS '详细地址，如 xx路xx号xx大厦';
COMMENT ON COLUMN stores.phone IS '联系电话，支持手机号、座机、400热线';
