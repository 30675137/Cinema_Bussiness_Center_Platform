/** @spec M001-material-unit-system */

-- ============================================================
-- Phase 9: 数据清理 - 删除已迁移的 RAW_MATERIAL 和 PACKAGING 类型 SKU
-- T098-T100: 清理 SKU 表中的原料/包装数据（已迁移到 Material 表）
-- 注意：此脚本必须在 V2026_01_11_007 数据迁移脚本之后运行
-- ============================================================

DO $$
DECLARE
    sku_table_exists BOOLEAN;
    raw_material_count INT := 0;
    packaging_count INT := 0;
    deleted_count INT := 0;
BEGIN
    -- 检查 SKU 表是否存在
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'skus'
    ) INTO sku_table_exists;

    IF NOT sku_table_exists THEN
        RAISE NOTICE '========================================';
        RAISE NOTICE 'SKU 表不存在，跳过清理操作';
        RAISE NOTICE '========================================';
        RETURN;
    END IF;

    -- 统计待删除记录
    SELECT COUNT(*) INTO raw_material_count FROM skus WHERE sku_type = 'RAW_MATERIAL';
    SELECT COUNT(*) INTO packaging_count FROM skus WHERE sku_type = 'PACKAGING';
    deleted_count := raw_material_count + packaging_count;

    IF deleted_count = 0 THEN
        RAISE NOTICE '========================================';
        RAISE NOTICE 'SKU 表中无原料/包装数据，跳过清理';
        RAISE NOTICE '========================================';
        RETURN;
    END IF;

    RAISE NOTICE '========================================';
    RAISE NOTICE '开始清理 SKU 表中的原料/包装数据';
    RAISE NOTICE 'RAW_MATERIAL 记录数: %', raw_material_count;
    RAISE NOTICE 'PACKAGING 记录数: %', packaging_count;
    RAISE NOTICE '待删除总数: %', deleted_count;
    RAISE NOTICE '========================================';

    -- T098: 检查是否有外键引用（安全检查）
    DECLARE
        bom_reference_count INT := 0;
        combo_reference_count INT := 0;
        inventory_reference_count INT := 0;
    BEGIN
        -- 检查 BOM 引用
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bom_component') THEN
            SELECT COUNT(*) INTO bom_reference_count
            FROM bom_component bc
            WHERE bc.component_type = 'SKU'
            AND bc.component_id IN (
                SELECT id FROM skus WHERE sku_type IN ('RAW_MATERIAL', 'PACKAGING')
            );

            IF bom_reference_count > 0 THEN
                RAISE EXCEPTION '清理失败：% 条 BOM 记录仍引用原料/包装 SKU，请先运行迁移脚本', bom_reference_count;
            END IF;
        END IF;

        -- 检查 Inventory 引用
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory') THEN
            SELECT COUNT(*) INTO inventory_reference_count
            FROM inventory inv
            WHERE inv.item_type = 'SKU'
            AND inv.item_id IN (
                SELECT id FROM skus WHERE sku_type IN ('RAW_MATERIAL', 'PACKAGING')
            );

            IF inventory_reference_count > 0 THEN
                RAISE EXCEPTION '清理失败：% 条 Inventory 记录仍引用原料/包装 SKU，请先运行迁移脚本', inventory_reference_count;
            END IF;
        END IF;

        -- 检查 Combo 引用
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'combo_item') THEN
            SELECT COUNT(*) INTO combo_reference_count
            FROM combo_item ci
            WHERE ci.sub_item_id IN (
                SELECT id FROM skus WHERE sku_type IN ('RAW_MATERIAL', 'PACKAGING')
            );

            IF combo_reference_count > 0 THEN
                RAISE EXCEPTION '清理失败：% 条 Combo 记录仍引用原料/包装 SKU', combo_reference_count;
            END IF;
        END IF;

        RAISE NOTICE '✅ 外键引用检查通过，无遗留引用';
    END;

    -- T099: 执行删除操作
    DELETE FROM skus WHERE sku_type IN ('RAW_MATERIAL', 'PACKAGING');

    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ SKU 表清理完成';
    RAISE NOTICE '已删除记录数: %', deleted_count;
    RAISE NOTICE '========================================';

    -- T100: 验证清理结果
    DECLARE
        remaining_count INT;
        finished_product_count INT;
        combo_count INT;
    BEGIN
        SELECT COUNT(*) INTO remaining_count
        FROM skus
        WHERE sku_type IN ('RAW_MATERIAL', 'PACKAGING');

        IF remaining_count > 0 THEN
            RAISE EXCEPTION '清理失败：仍有 % 条原料/包装 SKU 未删除', remaining_count;
        END IF;

        SELECT COUNT(*) INTO finished_product_count FROM skus WHERE sku_type = 'FINISHED_PRODUCT';
        SELECT COUNT(*) INTO combo_count FROM skus WHERE sku_type = 'COMBO';

        RAISE NOTICE '========================================';
        RAISE NOTICE '✅ 清理验证通过';
        RAISE NOTICE '   - RAW_MATERIAL/PACKAGING 剩余: %', remaining_count;
        RAISE NOTICE '   - FINISHED_PRODUCT 剩余: %', finished_product_count;
        RAISE NOTICE '   - COMBO 剩余: %', combo_count;
        RAISE NOTICE '========================================';
        RAISE NOTICE 'SKU 表现在仅包含成品和套餐类型';
        RAISE NOTICE 'M001 架构调整完成！';
        RAISE NOTICE '========================================';
    END;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION '清理失败: %', SQLERRM;
END $$;
