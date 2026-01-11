/** @spec M001-material-unit-system */
package com.cinema.bom.integration;

import com.cinema.bom.service.BomConversionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * BOM计算集成点
 * 集成统一换算服务到BOM配方计算业务流程
 *
 * 使用场景：
 * 1. BOM配方展示：换算为统一单位展示
 * 2. 生产计划：计算原料需求量
 * 3. 成本核算：换算为成本核算单位
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BomCalculationIntegration {

    private final BomConversionService bomConversionService;

    /**
     * 计算生产所需原料总量
     *
     * @param materialId      原料/包材ID
     * @param bomQuantity     BOM单位用量
     * @param bomUnitCode     BOM配方单位
     * @param inventoryUnitCode 库存单位（扣减单位）
     * @param productQuantity 成品生产数量
     * @return 所需库存数量
     */
    public BigDecimal calculateMaterialRequirement(
            UUID materialId,
            BigDecimal bomQuantity,
            String bomUnitCode,
            String inventoryUnitCode,
            BigDecimal productQuantity) {

        log.info("Calculating material requirement: materialId={}, productQty={}",
                materialId, productQuantity);

        // 验证是否可以换算
        if (!bomConversionService.canConvertBomQuantity(materialId, bomUnitCode, inventoryUnitCode)) {
            throw new IllegalStateException(
                    String.format("Cannot convert BOM unit %s to inventory unit %s for material %s",
                            bomUnitCode, inventoryUnitCode, materialId));
        }

        // 计算所需总量
        BigDecimal requiredQty = bomConversionService.calculateRequiredQuantity(
                materialId,
                bomQuantity,
                bomUnitCode,
                inventoryUnitCode,
                productQuantity
        );

        log.info("Material requirement calculated: {} {} required for {} units of product",
                requiredQty, inventoryUnitCode, productQuantity);

        return requiredQty;
    }

    /**
     * 换算BOM组件用量到指定单位（用于展示）
     */
    public BigDecimal convertBomQuantityForDisplay(
            UUID componentId,
            BigDecimal bomQuantity,
            String bomUnitCode,
            String displayUnitCode) {

        log.info("Converting BOM quantity for display: component={}, {} {} -> {}",
                componentId, bomQuantity, bomUnitCode, displayUnitCode);

        return bomConversionService.convertBomQuantity(
                componentId,
                bomQuantity,
                bomUnitCode,
                displayUnitCode
        );
    }

    /**
     * 验证BOM配方单位的有效性
     * 确保所有组件都可以换算为库存单位
     */
    public boolean validateBomUnits(
            UUID componentId,
            String bomUnitCode,
            String inventoryUnitCode) {

        boolean canConvert = bomConversionService.canConvertBomQuantity(
                componentId,
                bomUnitCode,
                inventoryUnitCode
        );

        if (!canConvert) {
            log.warn("BOM unit validation failed: component={}, {} -> {} not convertible",
                    componentId, bomUnitCode, inventoryUnitCode);
        }

        return canConvert;
    }
}
