-- @spec M002-material-filter
-- 为物料筛选功能创建性能优化索引

-- 筛选查询索引：支持按分类、状态、创建时间筛选
CREATE INDEX IF NOT EXISTS idx_materials_filter 
ON materials(category, status, created_at DESC);

-- 关键词搜索索引：支持按物料编码或名称全文搜索
CREATE INDEX IF NOT EXISTS idx_materials_search 
ON materials USING GIN(to_tsvector('simple', code || ' ' || name));

-- 批量查询索引：优化批量操作时的 ID 查询（通常主键已有索引，此处确保）
-- materials 表的 id 列已有主键索引，无需额外创建
