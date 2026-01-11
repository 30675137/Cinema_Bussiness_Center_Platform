-- @spec export-menu-category-inserts
-- 导出菜单分类表(menu_category)数据为INSERT语句
-- 用于备份或迁移menu_category表中的现有数据

-- ============================================
-- 生成menu_category表的INSERT语句
-- ============================================

-- 生成INSERT语句（适用于未软删除的记录）
SELECT 
    'INSERT INTO menu_category (id, code, display_name, sort_order, is_visible, is_default, icon_url, description, version, created_by, updated_by, created_at, updated_at, deleted_at) VALUES (' ||
    '''' || id || ''', ' ||
    '''' || code || ''', ' ||
    '''' || display_name || ''', ' ||
    sort_order || ', ' ||
    is_visible || ', ' ||
    is_default || ', ' ||
    CASE WHEN icon_url IS NULL THEN 'NULL' ELSE '''' || replace(icon_url, '''', '''''') || '''' END || ', ' ||
    CASE WHEN description IS NULL THEN 'NULL' ELSE '''' || replace(description, '''', '''''') || '''' END || ', ' ||
    version || ', ' ||
    CASE WHEN created_by IS NULL THEN 'NULL' ELSE '''' || created_by || '''' END || ', ' ||
    CASE WHEN updated_by IS NULL THEN 'NULL' ELSE '''' || updated_by || '''' END || ', ' ||
    '''' || created_at || ''', ' ||
    '''' || updated_at || ''', ' ||
    CASE WHEN deleted_at IS NULL THEN 'NULL' ELSE '''' || deleted_at || '''' END ||
    ');' AS insert_statement
FROM menu_category
WHERE deleted_at IS NULL
ORDER BY sort_order;

-- 如果表中没有数据，这里提供一个示例INSERT语句
/*
-- 示例INSERT语句格式：
INSERT INTO menu_category (id, code, display_name, sort_order, is_visible, is_default, icon_url, description, version, created_by, updated_by, created_at, updated_at, deleted_at) VALUES 
('123e4567-e89b-12d3-a456-426614174000', 'BEVERAGE', '饮品', 1, true, false, NULL, '各类饮品，包括咖啡、奶茶、果汁等', 0, NULL, NULL, '2025-12-01 10:00:00+08', '2025-12-01 10:00:00+08', NULL),
('123e4567-e89b-12d3-a456-426614174001', 'SNACK', '小食', 2, true, false, NULL, '零食小吃，包括爆米花、薯片等', 0, NULL, NULL, '2025-12-01 10:00:00+08', '2025-12-01 10:00:00+08', NULL);
ON CONFLICT (code) WHERE deleted_at IS NULL DO NOTHING;
*/