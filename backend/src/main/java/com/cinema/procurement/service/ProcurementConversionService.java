/** @spec M001-material-unit-system */
package com.cinema.procurement.service;

import com.cinema.common.conversion.CommonConversionService;
import com.cinema.common.conversion.CommonConversionService.ConversionResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * 采购入库换算服务
 * 封装采购入库业务场景下的单位换算逻辑
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProcurementConversionService {

    private final CommonConversionService commonConversionService;

    /**
     * 采购单位 -> 库存单位换算
     *
     * @param materialId       物料ID
     * @param purchaseQuantity 采购数量（采购单位）
     * @param purchaseUnitCode 采购单位代码
     * @param inventoryUnitCode 库存单位代码
     * @return 库存数量
     */
    public BigDecimal convertPurchaseToInventory(
            UUID materialId,
            BigDecimal purchaseQuantity,
            String purchaseUnitCode,
            String inventoryUnitCode) {

        log.info("Converting purchase to inventory: material={}, {} {} -> {}",
                materialId, purchaseQuantity, purchaseUnitCode, inventoryUnitCode);

        ConversionResult result = commonConversionService.convert(
                purchaseUnitCode,
                inventoryUnitCode,
                purchaseQuantity,
                materialId
        );

        log.info("Conversion result: {} {} (source: {})",
                result.convertedQuantity(), inventoryUnitCode, result.source());

        return result.convertedQuantity();
    }

    /**
     * 库存单位 -> 采购单位换算
     *
     * @param materialId        物料ID
     * @param inventoryQuantity 库存数量（库存单位）
     * @param inventoryUnitCode 库存单位代码
     * @param purchaseUnitCode  采购单位代码
     * @return 采购数量
     */
    public BigDecimal convertInventoryToPurchase(
            UUID materialId,
            BigDecimal inventoryQuantity,
            String inventoryUnitCode,
            String purchaseUnitCode) {

        log.info("Converting inventory to purchase: material={}, {} {} -> {}",
                materialId, inventoryQuantity, inventoryUnitCode, purchaseUnitCode);

        ConversionResult result = commonConversionService.convert(
                inventoryUnitCode,
                purchaseUnitCode,
                inventoryQuantity,
                materialId
        );

        log.info("Conversion result: {} {} (source: {})",
                result.convertedQuantity(), purchaseUnitCode, result.source());

        return result.convertedQuantity();
    }

    /**
     * 验证采购入库换算是否可用
     */
    public boolean canConvertPurchaseToInventory(
            UUID materialId,
            String purchaseUnitCode,
            String inventoryUnitCode) {

        return commonConversionService.canConvert(purchaseUnitCode, inventoryUnitCode, materialId);
    }
}
