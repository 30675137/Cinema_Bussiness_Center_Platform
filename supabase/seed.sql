-- Cinema Business Center Platform - Seed Data
-- 影院商品管理中台 - 种子数据
-- 环境：测试环境 (Test)

-- ============================================
-- 注意：种子数据会在初始化时自动执行
-- 已有的迁移脚本中包含测试数据，此文件可用于额外的初始数据
-- ============================================

-- 确保扩展已启用
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 插入测试用户 (如果不存在)
-- 注意：实际用户应通过 Supabase Auth 管理
INSERT INTO auth.users (id, email, encrypted_password, created_at, updated_at)
SELECT
    '00000000-0000-0000-0000-000000000001'::uuid,
    'admin@cinema.test',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000001'::uuid
);

-- 输出初始化完成信息
DO $$
BEGIN
    RAISE NOTICE 'Seed data initialized successfully for test environment';
END $$;
