/** @spec M001-material-unit-system */
package com.cinema.procurement.integration;

import com.cinema.procurement.service.ProcurementConversionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * 采购入库集成点
 * 集成统一换算服务到采购入库业务流程
 *
 * 使用场景：
 * 1. 采购订单创建时：预估库存数量
 * 2. 收货入库时：自动换算采购数量到库存数量
 * 3. 库存查询时：显示对应的采购单位数量
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ProcurementInboundIntegration {

    private final ProcurementConversionService procurementConversionService;

    /**
     * 采购订单入库时的换算逻辑
     *
     * @param materialId       物料ID
     * @param purchaseQuantity 采购数量
     * @param purchaseUnitCode 采购单位
     * @param inventoryUnitCode 库存单位
     * @return 入库数量（库存单位）
     */
    public BigDecimal calculateInboundQuantity(
            UUID materialId,
            BigDecimal purchaseQuantity,
            String purchaseUnitCode,
            String inventoryUnitCode) {

        log.info("Calculating inbound quantity for material: {}", materialId);

        // 验证是否可以换算
        if (!procurementConversionService.canConvertPurchaseToInventory(
                materialId, purchaseUnitCode, inventoryUnitCode)) {
            throw new IllegalStateException(
                    String.format("Cannot convert from %s to %s for material %s",
                            purchaseUnitCode, inventoryUnitCode, materialId));
        }

        // 执行换算
        BigDecimal inboundQuantity = procurementConversionService.convertPurchaseToInventory(
                materialId,
                purchaseQuantity,
                purchaseUnitCode,
                inventoryUnitCode
        );

        log.info("Inbound quantity calculated: {} {} -> {} {}",
                purchaseQuantity, purchaseUnitCode, inboundQuantity, inventoryUnitCode);

        return inboundQuantity;
    }

    /**
     * 库存数量转采购数量（用于报表展示）
     */
    public BigDecimal convertInventoryToPurchaseUnit(
            UUID materialId,
            BigDecimal inventoryQuantity,
            String inventoryUnitCode,
            String purchaseUnitCode) {

        log.info("Converting inventory to purchase unit for reporting: material={}", materialId);

        return procurementConversionService.convertInventoryToPurchase(
                materialId,
                inventoryQuantity,
                inventoryUnitCode,
                purchaseUnitCode
        );
    }
}
