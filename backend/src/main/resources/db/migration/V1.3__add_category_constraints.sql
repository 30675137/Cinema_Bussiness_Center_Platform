-- =====================================================
-- 分类表数据清理和约束加强
-- 作者: AI Assistant
-- 日期: 2026-01-10
-- 说明: 
--   1. 清理无效的分类记录（id 或 name 为空）
--   2. 为 categories 表添加 NOT NULL 约束
--   3. 确保数据完整性
-- =====================================================

-- 步骤 1: 数据清理 - 删除或修复无效记录
-- 注意：请先备份数据再执行！

-- 1.1 查看有多少无效记录（仅查询，不执行删除）
-- SELECT COUNT(*) as invalid_count 
-- FROM categories 
-- WHERE id IS NULL OR name IS NULL OR TRIM(name) = '';

-- 1.2 如果确认要删除这些无效记录，取消下面的注释
-- DELETE FROM categories 
-- WHERE id IS NULL OR name IS NULL OR TRIM(name) = '';

-- 步骤 2: 添加 NOT NULL 约束
-- 注意：只有在清理完无效数据后才能添加约束

-- 2.1 确保 id 字段不为空（通常主键已经是 NOT NULL）
ALTER TABLE categories 
ALTER COLUMN id SET NOT NULL;

-- 2.2 确保 name 字段不为空
ALTER TABLE categories 
ALTER COLUMN name SET NOT NULL;

-- 2.3 添加检查约束：name 不能是空字符串
ALTER TABLE categories 
ADD CONSTRAINT chk_category_name_not_empty 
CHECK (TRIM(name) <> '');

-- 步骤 3: 为其他重要字段添加约束（可选）

-- 3.1 确保 status 字段不为空
ALTER TABLE categories 
ALTER COLUMN status SET NOT NULL;

-- 3.2 为 status 添加默认值
ALTER TABLE categories 
ALTER COLUMN status SET DEFAULT 'ACTIVE';

-- 3.3 添加 status 枚举检查
ALTER TABLE categories 
ADD CONSTRAINT chk_category_status 
CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED'));

-- 3.4 确保 level 字段不为空且在有效范围内
ALTER TABLE categories 
ALTER COLUMN level SET NOT NULL;

ALTER TABLE categories 
ADD CONSTRAINT chk_category_level 
CHECK (level BETWEEN 1 AND 3);

-- 3.5 确保 sort_order 不为空
ALTER TABLE categories 
ALTER COLUMN sort_order SET NOT NULL;

ALTER TABLE categories 
ALTER COLUMN sort_order SET DEFAULT 0;

-- 步骤 4: 添加索引以提高查询性能

-- 4.1 为 name 字段添加索引（如果还没有）
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- 4.2 为 status 字段添加索引
CREATE INDEX IF NOT EXISTS idx_categories_status ON categories(status);

-- 4.3 为 parent_id 字段添加索引
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

-- 4.4 为 level 字段添加索引
CREATE INDEX IF NOT EXISTS idx_categories_level ON categories(level);

-- 步骤 5: 添加注释

COMMENT ON COLUMN categories.id IS '分类唯一标识（主键，不能为空）';
COMMENT ON COLUMN categories.name IS '分类名称（不能为空，不能是空字符串）';
COMMENT ON COLUMN categories.code IS '分类编码';
COMMENT ON COLUMN categories.parent_id IS '父分类ID（顶级分类为NULL）';
COMMENT ON COLUMN categories.level IS '分类层级（1-3级，不能为空）';
COMMENT ON COLUMN categories.sort_order IS '排序号（不能为空，默认0）';
COMMENT ON COLUMN categories.status IS '状态（ACTIVE/INACTIVE/ARCHIVED，不能为空，默认ACTIVE）';
COMMENT ON COLUMN categories.created_at IS '创建时间';
COMMENT ON COLUMN categories.updated_at IS '更新时间';

-- 完成！
