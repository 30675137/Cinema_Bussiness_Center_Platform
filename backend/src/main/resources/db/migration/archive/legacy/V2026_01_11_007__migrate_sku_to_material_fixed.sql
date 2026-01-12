/** @spec M001-material-unit-system */

-- ============================================================
-- Phase 9: 数据清理与迁移（修复版 v2）
-- T097-T102: 清理 SKU 中的原料/包装数据并迁移到 Material 表
-- 注意：如果 SKU 表不存在或无数据，脚本会自动跳过
-- ============================================================

DO $$
DECLARE
    sku_table_exists BOOLEAN;
    sku_count INT;
    raw_material_count INT;
    packaging_count INT;
    migration_start TIMESTAMP;
    migration_end TIMESTAMP;
BEGIN
    -- 检查 SKU 表是否存在
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'skus'
    ) INTO sku_table_exists;

    IF NOT sku_table_exists THEN
        RAISE NOTICE '========================================';
        RAISE NOTICE 'SKU 表不存在，跳过 SKU → Material 数据迁移';
        RAISE NOTICE '这是正常的（全新部署无历史数据）';
        RAISE NOTICE '========================================';
        RETURN;
    END IF;

    -- 检查是否有需要迁移的数据
    EXECUTE 'SELECT COUNT(*) FROM skus WHERE sku_type IN ($1, $2)'
    INTO sku_count
    USING 'RAW_MATERIAL', 'PACKAGING';

    IF sku_count = 0 THEN
        RAISE NOTICE '========================================';
        RAISE NOTICE 'SKU 表中无原料/包装数据，跳过迁移';
        RAISE NOTICE '========================================';
        RETURN;
    END IF;

    migration_start := current_timestamp;

    RAISE NOTICE '========================================';
    RAISE NOTICE '开始 SKU → Material 数据迁移';
    RAISE NOTICE '待迁移记录数: %', sku_count;
    RAISE NOTICE '========================================';

    -- T097: 记录迁移前的统计信息
    CREATE TEMP TABLE IF NOT EXISTS migration_stats (
        source_table VARCHAR(50),
        record_count INT,
        snapshot_time TIMESTAMP
    );

    INSERT INTO migration_stats
    SELECT 'SKU_RAW_MATERIAL', COUNT(*), current_timestamp FROM skus WHERE sku_type = 'RAW_MATERIAL'
    UNION ALL
    SELECT 'SKU_PACKAGING', COUNT(*), current_timestamp FROM skus WHERE sku_type = 'PACKAGING';

    SELECT record_count INTO raw_material_count FROM migration_stats WHERE source_table = 'SKU_RAW_MATERIAL';
    SELECT record_count INTO packaging_count FROM migration_stats WHERE source_table = 'SKU_PACKAGING';

    RAISE NOTICE 'RAW_MATERIAL 记录数: %', raw_material_count;
    RAISE NOTICE 'PACKAGING 记录数: %', packaging_count;

    -- T098: 创建临时映射表
    CREATE TEMP TABLE IF NOT EXISTS temp_sku_material_mapping (
        old_sku_id UUID PRIMARY KEY,
        new_material_id UUID NOT NULL,
        material_code VARCHAR(50) NOT NULL,
        sku_code VARCHAR(100) NOT NULL
    );

    -- 迁移 RAW_MATERIAL（使用动态 SQL）
    IF raw_material_count > 0 THEN
        RAISE NOTICE '正在迁移 RAW_MATERIAL...';

        -- 插入 Material 记录并通过临时表捕获映射
        WITH inserted_materials AS (
            INSERT INTO material (
                id, code, name, category, specification,
                inventory_unit_id, purchase_unit_id, conversion_rate,
                use_global_conversion, created_at, updated_at
            )
            SELECT
                gen_random_uuid(),
                'MAT-RAW-' || LPAD(ROW_NUMBER() OVER (ORDER BY s.id)::TEXT, 3, '0'),
                s.name,
                'RAW_MATERIAL'::material_category,
                s.specification,
                s.inventory_unit_id,
                s.purchase_unit_id,
                COALESCE(s.conversion_rate, 1.0),
                COALESCE(s.use_global_conversion, true),
                s.created_at,
                s.updated_at
            FROM skus s
            WHERE s.sku_type = 'RAW_MATERIAL'
            ORDER BY s.id
            RETURNING id, code, name, created_at
        ),
        sku_ordered AS (
            SELECT
                s.id AS sku_id,
                s.code AS sku_code,
                ROW_NUMBER() OVER (ORDER BY s.id) AS rn
            FROM skus s
            WHERE s.sku_type = 'RAW_MATERIAL'
        ),
        material_ordered AS (
            SELECT
                m.id AS material_id,
                m.code AS material_code,
                ROW_NUMBER() OVER (ORDER BY m.code) AS rn
            FROM inserted_materials m
        )
        INSERT INTO temp_sku_material_mapping
        SELECT s.sku_id, m.material_id, m.material_code, s.sku_code
        FROM sku_ordered s
        JOIN material_ordered m ON s.rn = m.rn;

        RAISE NOTICE '✅ RAW_MATERIAL 迁移完成: % 条', raw_material_count;
    END IF;

    -- 迁移 PACKAGING
    IF packaging_count > 0 THEN
        RAISE NOTICE '正在迁移 PACKAGING...';

        WITH inserted_materials AS (
            INSERT INTO material (
                id, code, name, category, specification,
                inventory_unit_id, purchase_unit_id, conversion_rate,
                use_global_conversion, created_at, updated_at
            )
            SELECT
                gen_random_uuid(),
                'MAT-PKG-' || LPAD(ROW_NUMBER() OVER (ORDER BY s.id)::TEXT, 3, '0'),
                s.name,
                'PACKAGING'::material_category,
                s.specification,
                s.inventory_unit_id,
                s.purchase_unit_id,
                COALESCE(s.conversion_rate, 1.0),
                COALESCE(s.use_global_conversion, true),
                s.created_at,
                s.updated_at
            FROM skus s
            WHERE s.sku_type = 'PACKAGING'
            ORDER BY s.id
            RETURNING id, code, name, created_at
        ),
        sku_ordered AS (
            SELECT
                s.id AS sku_id,
                s.code AS sku_code,
                ROW_NUMBER() OVER (ORDER BY s.id) AS rn
            FROM skus s
            WHERE s.sku_type = 'PACKAGING'
        ),
        material_ordered AS (
            SELECT
                m.id AS material_id,
                m.code AS material_code,
                ROW_NUMBER() OVER (ORDER BY m.code) AS rn
            FROM inserted_materials m
        )
        INSERT INTO temp_sku_material_mapping
        SELECT s.sku_id, m.material_id, m.material_code, s.sku_code
        FROM sku_ordered s
        JOIN material_ordered m ON s.rn = m.rn;

        RAISE NOTICE '✅ PACKAGING 迁移完成: % 条', packaging_count;
    END IF;

    -- T099: 更新 Inventory 引用（如果表存在）
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory') THEN
        RAISE NOTICE '正在更新 Inventory 引用...';

        UPDATE inventory inv
        SET
            item_type = 'MATERIAL',
            item_id = map.new_material_id,
            updated_at = current_timestamp
        FROM temp_sku_material_mapping map
        WHERE inv.item_type = 'SKU' AND inv.item_id = map.old_sku_id;

        RAISE NOTICE '✅ Inventory 更新完成';
    END IF;

    -- T100: 更新 BOM 引用（如果表存在）
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bom_component') THEN
        RAISE NOTICE '正在更新 BOM Component 引用...';

        UPDATE bom_component bc
        SET
            component_type = 'MATERIAL',
            material_id = map.new_material_id,
            component_id = NULL,
            updated_at = current_timestamp
        FROM temp_sku_material_mapping map
        WHERE bc.component_type = 'SKU' AND bc.component_id = map.old_sku_id;

        RAISE NOTICE '✅ BOM Component 更新完成';
    END IF;

    -- T101: 数据完整性验证
    DECLARE
        unmigrated_count INT;
        inventory_orphan_count INT := 0;
        bom_orphan_count INT := 0;
        mapping_count INT;
    BEGIN
        SELECT COUNT(*) INTO mapping_count FROM temp_sku_material_mapping;

        SELECT COUNT(*) INTO unmigrated_count
        FROM skus s
        WHERE s.sku_type IN ('RAW_MATERIAL', 'PACKAGING')
        AND NOT EXISTS (SELECT 1 FROM temp_sku_material_mapping WHERE old_sku_id = s.id);

        IF unmigrated_count > 0 THEN
            RAISE EXCEPTION '数据迁移失败：% 条 SKU 记录未迁移', unmigrated_count;
        END IF;

        -- 检查 Inventory 孤儿记录
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory') THEN
            SELECT COUNT(*) INTO inventory_orphan_count
            FROM inventory
            WHERE item_type = 'SKU' AND item_id IN (SELECT old_sku_id FROM temp_sku_material_mapping);

            IF inventory_orphan_count > 0 THEN
                RAISE EXCEPTION 'Inventory 更新失败：% 条记录仍引用旧 SKU', inventory_orphan_count;
            END IF;
        END IF;

        -- 检查 BOM 孤儿记录
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bom_component') THEN
            SELECT COUNT(*) INTO bom_orphan_count
            FROM bom_component
            WHERE component_type = 'SKU' AND component_id IN (SELECT old_sku_id FROM temp_sku_material_mapping);

            IF bom_orphan_count > 0 THEN
                RAISE EXCEPTION 'BOM 更新失败：% 条记录仍引用旧 SKU', bom_orphan_count;
            END IF;
        END IF;

        RAISE NOTICE '========================================';
        RAISE NOTICE '✅ 数据完整性验证通过';
        RAISE NOTICE '   - 迁移记录数: %', mapping_count;
        RAISE NOTICE '   - 未迁移记录: %', unmigrated_count;
        RAISE NOTICE '   - Inventory 孤儿记录: %', inventory_orphan_count;
        RAISE NOTICE '   - BOM 孤儿记录: %', bom_orphan_count;
        RAISE NOTICE '========================================';
    END;

    -- T102: 记录迁移日志
    migration_end := current_timestamp;

    CREATE TABLE IF NOT EXISTS migration_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        migration_name VARCHAR(200) NOT NULL,
        migration_type VARCHAR(50) NOT NULL,
        records_migrated INT NOT NULL,
        records_updated INT NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        duration_seconds NUMERIC(10, 2),
        status VARCHAR(20) NOT NULL,
        details JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT current_timestamp
    );

    INSERT INTO migration_log (
        migration_name, migration_type, records_migrated, records_updated,
        start_time, end_time, duration_seconds, status, details
    )
    VALUES (
        'SKU to Material Migration (Fixed v2)',
        'DATA_MIGRATION',
        sku_count,
        (SELECT COUNT(*) FROM inventory WHERE item_type = 'MATERIAL') +
        (SELECT COUNT(*) FROM bom_component WHERE component_type = 'MATERIAL'),
        migration_start,
        migration_end,
        EXTRACT(EPOCH FROM (migration_end - migration_start)),
        'SUCCESS',
        jsonb_build_object(
            'raw_material_count', raw_material_count,
            'packaging_count', packaging_count,
            'total_materials', (SELECT COUNT(*) FROM material),
            'inventory_updated', (SELECT COUNT(*) FROM inventory WHERE item_type = 'MATERIAL'),
            'bom_updated', (SELECT COUNT(*) FROM bom_component WHERE component_type = 'MATERIAL'),
            'mapping_records', (SELECT COUNT(*) FROM temp_sku_material_mapping)
        )
    );

    RAISE NOTICE '========================================';
    RAISE NOTICE 'SKU → Material 迁移完成（修复版 v2）';
    RAISE NOTICE '迁移记录数: %', sku_count;
    RAISE NOTICE '耗时: % 秒', EXTRACT(EPOCH FROM (migration_end - migration_start));
    RAISE NOTICE '========================================';

    -- 清理临时表
    DROP TABLE IF EXISTS migration_stats;
    DROP TABLE IF EXISTS temp_sku_material_mapping;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION '迁移失败: %', SQLERRM;
END $$;

-- Add comment only if migration_log table exists
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'migration_log') THEN
        COMMENT ON TABLE migration_log IS 'M001-material-unit-system: 数据迁移日志表';
    END IF;
END $$;
