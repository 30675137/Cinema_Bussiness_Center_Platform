-- @spec export-menu-category-data
-- 导出菜单分类表(menu_category)数据的脚本
-- 用于备份或迁移menu_category表中的现有数据

-- ============================================
-- 导出menu_category表数据
-- ============================================

-- 注意：此脚本适用于PostgreSQL数据库
-- 如果需要实际导出数据，需要使用COPY命令或psql工具

-- 1. 使用SELECT语句生成INSERT语句（可用于查看数据结构）
/*
SELECT 
    'INSERT INTO menu_category (id, code, display_name, sort_order, is_visible, is_default, icon_url, description, version, created_by, updated_by, created_at, updated_at, deleted_at) VALUES (' ||
    '''' || id || ''', ' ||
    '''' || code || ''', ' ||
    '''' || display_name || ''', ' ||
    sort_order || ', ' ||
    is_visible || ', ' ||
    is_default || ', ' ||
    CASE WHEN icon_url IS NULL THEN 'NULL' ELSE '''' || icon_url || '''' END || ', ' ||
    CASE WHEN description IS NULL THEN 'NULL' ELSE '''' || description || '''' END || ', ' ||
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
*/

-- 2. 直接查询所有有效数据（未软删除）
SELECT 
    id,
    code,
    display_name,
    sort_order,
    is_visible,
    is_default,
    icon_url,
    description,
    version,
    created_by,
    updated_by,
    created_at,
    updated_at,
    deleted_at
FROM menu_category
WHERE deleted_at IS NULL
ORDER BY sort_order;

-- 3. 如果需要使用COPY命令导出到CSV文件（需要在psql中执行）
/*
COPY (
    SELECT 
        id,
        code,
        display_name,
        sort_order,
        is_visible,
        is_default,
        icon_url,
        description,
        version,
        created_by,
        updated_by,
        created_at,
        updated_at,
        deleted_at
    FROM menu_category
    WHERE deleted_at IS NULL
    ORDER BY sort_order
) TO '/tmp/menu_category_data.csv' WITH CSV HEADER;
*/

-- 4. 统计信息
SELECT 
    COUNT(*) AS total_categories,
    COUNT(*) FILTER (WHERE is_visible = true) AS visible_categories,
    COUNT(*) FILTER (WHERE is_default = true) AS default_categories,
    MIN(sort_order) AS min_sort_order,
    MAX(sort_order) AS max_sort_order
FROM menu_category
WHERE deleted_at IS NULL;

-- 5. 按可见性分组统计
SELECT 
    is_visible,
    COUNT(*) AS count
FROM menu_category
WHERE deleted_at IS NULL
GROUP BY is_visible
ORDER BY is_visible;

-- 6. 按默认分类分组统计
SELECT 
    is_default,
    COUNT(*) AS count
FROM menu_category
WHERE deleted_at IS NULL
GROUP BY is_default
ORDER BY is_default;