/** @spec M001-material-unit-system */

-- ============================================================
-- SKU → Material 迁移验证脚本
-- 用于手动验证迁移结果的完整性和正确性
-- ============================================================

-- 验证 1: Material 表数据统计
SELECT
    '1. Material 表数据统计' AS verification_step,
    category,
    COUNT(*) AS count,
    MIN(code) AS first_code,
    MAX(code) AS last_code,
    MIN(created_at) AS earliest_created,
    MAX(created_at) AS latest_created
FROM material
GROUP BY category
ORDER BY category;

-- 验证 2: 检查 Material 编码唯一性
SELECT
    '2. Material 编码唯一性检查' AS verification_step,
    CASE
        WHEN COUNT(*) = COUNT(DISTINCT code) THEN '✅ 通过'
        ELSE '❌ 失败：存在重复编码'
    END AS result,
    COUNT(*) AS total_records,
    COUNT(DISTINCT code) AS unique_codes
FROM material;

-- 验证 3: Inventory 引用更新检查
SELECT
    '3. Inventory 引用更新检查' AS verification_step,
    item_type,
    COUNT(*) AS count,
    MIN(updated_at) AS first_update,
    MAX(updated_at) AS last_update
FROM inventory
WHERE item_id IN (SELECT id FROM material)
GROUP BY item_type
ORDER BY item_type;

-- 验证 4: BOM 引用更新检查
SELECT
    '4. BOM 引用更新检查' AS verification_step,
    component_type,
    COUNT(*) AS count,
    COUNT(DISTINCT material_id) AS unique_materials,
    MIN(updated_at) AS first_update,
    MAX(updated_at) AS last_update
FROM bom_component
WHERE component_type = 'MATERIAL'
GROUP BY component_type;

-- 验证 5: 检查是否有孤儿 SKU 引用（应该为 0）
SELECT
    '5. 孤儿 SKU 引用检查' AS verification_step,
    'Inventory' AS table_name,
    COUNT(*) AS orphan_count,
    CASE
        WHEN COUNT(*) = 0 THEN '✅ 通过'
        ELSE '❌ 失败：存在孤儿引用'
    END AS result
FROM inventory inv
WHERE inv.item_type = 'SKU'
  AND EXISTS (
      SELECT 1 FROM sku s
      WHERE s.id = inv.item_id
        AND s.sku_type IN ('RAW_MATERIAL', 'PACKAGING')
  )
UNION ALL
SELECT
    '5. 孤儿 SKU 引用检查',
    'BOM Component',
    COUNT(*),
    CASE
        WHEN COUNT(*) = 0 THEN '✅ 通过'
        ELSE '❌ 失败：存在孤儿引用'
    END
FROM bom_component bc
WHERE bc.component_type = 'SKU'
  AND EXISTS (
      SELECT 1 FROM sku s
      WHERE s.id = bc.component_id
        AND s.sku_type IN ('RAW_MATERIAL', 'PACKAGING')
  );

-- 验证 6: Material 外键完整性检查
SELECT
    '6. Material 外键完整性检查' AS verification_step,
    'inventory_unit_id' AS foreign_key_field,
    COUNT(*) AS total_records,
    COUNT(m.inventory_unit_id) AS non_null_count,
    COUNT(u.id) AS valid_reference_count,
    CASE
        WHEN COUNT(m.inventory_unit_id) = COUNT(u.id) THEN '✅ 通过'
        ELSE '❌ 失败：存在无效引用'
    END AS result
FROM material m
LEFT JOIN unit u ON m.inventory_unit_id = u.id
UNION ALL
SELECT
    '6. Material 外键完整性检查',
    'purchase_unit_id',
    COUNT(*),
    COUNT(m.purchase_unit_id),
    COUNT(u.id),
    CASE
        WHEN COUNT(m.purchase_unit_id) = COUNT(u.id) THEN '✅ 通过'
        ELSE '❌ 失败：存在无效引用'
    END
FROM material m
LEFT JOIN unit u ON m.purchase_unit_id = u.id;

-- 验证 7: Material 数据质量检查
SELECT
    '7. Material 数据质量检查' AS verification_step,
    CASE
        WHEN COUNT(*) FILTER (WHERE code IS NULL OR code = '') > 0
            THEN '❌ 失败：存在空编码'
        WHEN COUNT(*) FILTER (WHERE name IS NULL OR name = '') > 0
            THEN '❌ 失败：存在空名称'
        WHEN COUNT(*) FILTER (WHERE category IS NULL) > 0
            THEN '❌ 失败：存在空分类'
        WHEN COUNT(*) FILTER (WHERE conversion_rate IS NULL OR conversion_rate <= 0) > 0
            THEN '❌ 失败：存在无效换算率'
        ELSE '✅ 通过'
    END AS result,
    COUNT(*) AS total_records,
    COUNT(*) FILTER (WHERE code IS NULL OR code = '') AS empty_code_count,
    COUNT(*) FILTER (WHERE name IS NULL OR name = '') AS empty_name_count,
    COUNT(*) FILTER (WHERE conversion_rate IS NULL OR conversion_rate <= 0) AS invalid_rate_count
FROM material;

-- 验证 8: 迁移日志检查
SELECT
    '8. 迁移日志检查' AS verification_step,
    migration_name,
    migration_type,
    status,
    records_migrated,
    records_updated,
    duration_seconds,
    details,
    created_at
FROM migration_log
WHERE migration_name = 'SKU to Material Migration'
ORDER BY created_at DESC
LIMIT 1;

-- 验证 9: 对比迁移前后数据量
SELECT
    '9. 迁移前后数据量对比' AS verification_step,
    (SELECT details->>'sku_raw_material_count' FROM migration_log WHERE migration_name = 'SKU to Material Migration' ORDER BY created_at DESC LIMIT 1)::INT +
    (SELECT details->>'sku_packaging_count' FROM migration_log WHERE migration_name = 'SKU to Material Migration' ORDER BY created_at DESC LIMIT 1)::INT AS sku_total_before,
    (SELECT COUNT(*) FROM material) AS material_total_after,
    CASE
        WHEN (
            (SELECT details->>'sku_raw_material_count' FROM migration_log WHERE migration_name = 'SKU to Material Migration' ORDER BY created_at DESC LIMIT 1)::INT +
            (SELECT details->>'sku_packaging_count' FROM migration_log WHERE migration_name = 'SKU to Material Migration' ORDER BY created_at DESC LIMIT 1)::INT
        ) = (SELECT COUNT(*) FROM material)
            THEN '✅ 通过：数据量一致'
        ELSE '❌ 失败：数据量不一致'
    END AS result;

-- 验证 10: BOM Component 双重引用互斥检查
SELECT
    '10. BOM Component 双重引用互斥检查' AS verification_step,
    COUNT(*) AS total_material_components,
    COUNT(*) FILTER (WHERE component_id IS NULL) AS component_id_null_count,
    COUNT(*) FILTER (WHERE material_id IS NOT NULL) AS material_id_not_null_count,
    CASE
        WHEN COUNT(*) FILTER (WHERE component_id IS NOT NULL AND material_id IS NOT NULL) > 0
            THEN '❌ 失败：存在双重引用'
        WHEN COUNT(*) FILTER (WHERE component_id IS NULL) = COUNT(*) FILTER (WHERE material_id IS NOT NULL)
            THEN '✅ 通过：互斥约束正常'
        ELSE '❌ 失败：互斥约束异常'
    END AS result
FROM bom_component
WHERE component_type = 'MATERIAL';

-- 汇总验证结果
SELECT
    '========================================' AS summary,
    '迁移验证汇总' AS title,
    current_timestamp AS verification_time;

SELECT
    CASE
        WHEN (
            SELECT COUNT(*) FROM (
                SELECT '❌' AS status
                FROM (
                    -- 编码唯一性
                    SELECT CASE WHEN COUNT(*) = COUNT(DISTINCT code) THEN '✅' ELSE '❌' END AS status FROM material
                    UNION ALL
                    -- 孤儿引用
                    SELECT CASE WHEN COUNT(*) = 0 THEN '✅' ELSE '❌' END FROM inventory WHERE item_type = 'SKU' AND EXISTS (SELECT 1 FROM sku WHERE id = inventory.item_id AND sku_type IN ('RAW_MATERIAL', 'PACKAGING'))
                    UNION ALL
                    SELECT CASE WHEN COUNT(*) = 0 THEN '✅' ELSE '❌' END FROM bom_component WHERE component_type = 'SKU' AND EXISTS (SELECT 1 FROM sku WHERE id = bom_component.component_id AND sku_type IN ('RAW_MATERIAL', 'PACKAGING'))
                    UNION ALL
                    -- 数据质量
                    SELECT CASE WHEN COUNT(*) FILTER (WHERE code IS NULL OR name IS NULL OR conversion_rate <= 0) = 0 THEN '✅' ELSE '❌' END FROM material
                    UNION ALL
                    -- 数据量一致性
                    SELECT CASE WHEN (SELECT COUNT(*) FROM material) = (SELECT (details->>'sku_raw_material_count')::INT + (details->>'sku_packaging_count')::INT FROM migration_log WHERE migration_name = 'SKU to Material Migration' ORDER BY created_at DESC LIMIT 1) THEN '✅' ELSE '❌' END
                ) AS checks
                WHERE status = '❌'
            ) AS failed_checks
        ) = 0
            THEN '✅✅✅ 所有验证通过，迁移成功 ✅✅✅'
        ELSE '❌❌❌ 部分验证失败，请检查详细结果 ❌❌❌'
    END AS final_result;
