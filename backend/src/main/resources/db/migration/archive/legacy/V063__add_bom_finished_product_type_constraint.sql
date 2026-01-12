-- BOM 成品类型约束迁移脚本
-- 功能: O004-beverage-sku-reuse
-- 描述: 添加 BOM 表的 finished_product_id 类型验证，确保只有成品类型 SKU 可以创建 BOM 配方
-- 作者: Claude Code
-- 日期: 2025-12-31
--
-- 注意: 此功能不包含权限与认证逻辑(详见宪法"认证与权限要求分层"原则)

-- ============================================================
-- 业务规则触发器：验证成品 SKU 类型必须是 finished_product
-- ============================================================
--
-- 规则说明:
-- - BOM 配方只能为成品类型(finished_product)的 SKU 创建
-- - 原料(raw_material)、包材(packaging)、套餐(combo)不允许创建 BOM
-- - 对应后端异常: BOM_VAL_001
--
-- 触发时机:
-- - INSERT: 创建新 BOM 组件时
-- - UPDATE: 更新 BOM 组件的 finished_product_id 时
--
-- 错误处理:
-- - 如果 finished_product_id 指向的 SKU 类型不是 'finished_product'，抛出异常
-- - 异常消息包含实际 SKU 类型，便于调试

CREATE OR REPLACE FUNCTION check_bom_finished_product_type()
RETURNS TRIGGER AS $$
DECLARE
    v_sku_type VARCHAR(20);
    v_sku_name VARCHAR(255);
BEGIN
    -- 查询成品 SKU 的类型
    SELECT sku_type, name INTO v_sku_type, v_sku_name
    FROM skus
    WHERE id = NEW.finished_product_id;

    -- 验证 SKU 类型必须是 'finished_product'
    IF v_sku_type IS NULL THEN
        RAISE EXCEPTION 'SKU 不存在: finished_product_id = %', NEW.finished_product_id
            USING ERRCODE = 'foreign_key_violation',
                  HINT = '请确认 finished_product_id 引用的 SKU 存在于 skus 表中';
    END IF;

    IF v_sku_type != 'finished_product' THEN
        RAISE EXCEPTION 'BOM 配方只能为成品类型 SKU 创建，当前 SKU 类型为: % (SKU: %)',
            CASE v_sku_type
                WHEN 'raw_material' THEN '原料'
                WHEN 'packaging' THEN '包材'
                WHEN 'combo' THEN '套餐'
                ELSE v_sku_type
            END,
            v_sku_name
            USING ERRCODE = 'check_violation',
                  HINT = '请使用成品类型(finished_product)的 SKU 创建 BOM 配方',
                  DETAIL = format('finished_product_id: %s, sku_type: %s, sku_name: %s',
                                 NEW.finished_product_id, v_sku_type, v_sku_name);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER trigger_bom_finished_product_type
BEFORE INSERT OR UPDATE ON bom_components
FOR EACH ROW
EXECUTE FUNCTION check_bom_finished_product_type();

-- 添加触发器注释
COMMENT ON FUNCTION check_bom_finished_product_type() IS
'验证 BOM 配方的成品 SKU 类型必须是 finished_product。对应后端异常: BOM_VAL_001';

COMMENT ON TRIGGER trigger_bom_finished_product_type ON bom_components IS
'BOM 成品类型验证触发器：确保 finished_product_id 引用的 SKU 类型为 finished_product';

-- ============================================================
-- 数据完整性验证（可选）
-- ============================================================
--
-- 如果数据库中已存在不符合规则的 BOM 数据，以下查询可以检测出来：
--
-- SELECT
--     bc.id AS bom_component_id,
--     bc.finished_product_id,
--     s.sku_type,
--     s.name AS sku_name
-- FROM bom_components bc
-- JOIN skus s ON bc.finished_product_id = s.id
-- WHERE s.sku_type != 'finished_product';
--
-- 如果查询返回结果，说明有不符合规则的数据需要清理
