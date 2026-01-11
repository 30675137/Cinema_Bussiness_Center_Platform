/** @spec M001-material-unit-system */
package com.cinema.bom.service;

import com.cinema.common.conversion.CommonConversionService;
import com.cinema.common.conversion.CommonConversionService.ConversionResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * BOM配方用量换算服务
 * 负责BOM配方中组件用量的单位换算
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BomConversionService {

    private final CommonConversionService commonConversionService;

    /**
     * 换算BOM组件用量
     * 将配方单位换算为目标单位（通常是库存单位）
     *
     * @param componentId    组件ID（SKU或Material）
     * @param bomQuantity    BOM配方数量
     * @param bomUnitCode    BOM配方单位
     * @param targetUnitCode 目标单位（通常是库存单位）
     * @return 换算后的数量
     */
    public BigDecimal convertBomQuantity(
            UUID componentId,
            BigDecimal bomQuantity,
            String bomUnitCode,
            String targetUnitCode) {

        log.info("Converting BOM quantity: component={}, {} {} -> {}",
                componentId, bomQuantity, bomUnitCode, targetUnitCode);

        ConversionResult result = commonConversionService.convert(
                bomUnitCode,
                targetUnitCode,
                bomQuantity,
                componentId
        );

        log.info("BOM conversion result: {} {} (source: {})",
                result.convertedQuantity(), targetUnitCode, result.source());

        return result.convertedQuantity();
    }

    /**
     * 计算成品生产所需的原料用量
     *
     * @param componentId     组件ID
     * @param bomQuantity     单位成品BOM用量
     * @param bomUnitCode     BOM配方单位
     * @param targetUnitCode  目标单位
     * @param productQuantity 成品生产数量
     * @return 所需原料总量
     */
    public BigDecimal calculateRequiredQuantity(
            UUID componentId,
            BigDecimal bomQuantity,
            String bomUnitCode,
            String targetUnitCode,
            BigDecimal productQuantity) {

        log.info("Calculating required quantity for product quantity: {}", productQuantity);

        // 换算单位成品的BOM用量到目标单位
        BigDecimal convertedBomQty = convertBomQuantity(
                componentId,
                bomQuantity,
                bomUnitCode,
                targetUnitCode
        );

        // 计算总用量 = 单位用量 × 成品数量
        BigDecimal totalRequired = convertedBomQty.multiply(productQuantity);

        log.info("Required quantity: {} {} (per unit: {} {}, product qty: {})",
                totalRequired, targetUnitCode, convertedBomQty, targetUnitCode, productQuantity);

        return totalRequired;
    }

    /**
     * 验证BOM组件单位是否可以换算
     */
    public boolean canConvertBomQuantity(
            UUID componentId,
            String bomUnitCode,
            String targetUnitCode) {

        return commonConversionService.canConvert(bomUnitCode, targetUnitCode, componentId);
    }
}
