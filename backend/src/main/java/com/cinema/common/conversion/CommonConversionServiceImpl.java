/** @spec M001-material-unit-system */
package com.cinema.common.conversion;

import com.cinema.material.entity.Material;
import com.cinema.material.repository.MaterialRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CommonConversionServiceImpl implements CommonConversionService {

    private final MaterialRepository materialRepository;
    private final GlobalConversionService globalConversionService;

    @Override
    public ConversionResult convert(String fromUnitCode, String toUnitCode, BigDecimal quantity, UUID materialId) {
        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new IllegalArgumentException("Material not found: " + materialId));

        if (material.getUseGlobalConversion()) {
            log.debug("Using global conversion for material {}: {} {} -> {}",
                    material.getCode(), quantity, fromUnitCode, toUnitCode);
            BigDecimal converted = globalConversionService.convert(fromUnitCode, toUnitCode, quantity);
            return new ConversionResult(
                    converted,
                    ConversionSource.GLOBAL,
                    String.format("全局换算: %s -> %s", fromUnitCode, toUnitCode)
            );
        }

        // 使用物料级换算率
        String inventoryUnitCode = material.getInventoryUnit().getCode();
        String purchaseUnitCode = material.getPurchaseUnit().getCode();
        BigDecimal conversionRate = material.getConversionRate();

        if (conversionRate == null || conversionRate.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException("Material conversion rate is not configured: " + material.getCode());
        }

        BigDecimal converted;
        if (fromUnitCode.equals(purchaseUnitCode) && toUnitCode.equals(inventoryUnitCode)) {
            // 采购单位 -> 库存单位
            converted = quantity.multiply(conversionRate);
        } else if (fromUnitCode.equals(inventoryUnitCode) && toUnitCode.equals(purchaseUnitCode)) {
            // 库存单位 -> 采购单位
            converted = quantity.divide(conversionRate, 6, BigDecimal.ROUND_HALF_UP);
        } else {
            throw new IllegalArgumentException(
                    String.format("Unsupported conversion: %s -> %s for material %s",
                            fromUnitCode, toUnitCode, material.getCode()));
        }

        log.debug("Using material-level conversion for {}: {} {} -> {} {} (rate: {})",
                material.getCode(), quantity, fromUnitCode, converted, toUnitCode, conversionRate);

        return new ConversionResult(
                converted,
                ConversionSource.MATERIAL,
                String.format("物料级换算 (%s): %s -> %s (率: %s)",
                        material.getCode(), fromUnitCode, toUnitCode, conversionRate)
        );
    }

    @Override
    public ConversionResult convertGlobal(String fromUnitCode, String toUnitCode, BigDecimal quantity) {
        log.debug("Using global conversion: {} {} -> {}", quantity, fromUnitCode, toUnitCode);
        BigDecimal converted = globalConversionService.convert(fromUnitCode, toUnitCode, quantity);
        return new ConversionResult(
                converted,
                ConversionSource.GLOBAL,
                String.format("全局换算: %s -> %s", fromUnitCode, toUnitCode)
        );
    }

    @Override
    public boolean canConvert(String fromUnitCode, String toUnitCode, UUID materialId) {
        Material material = materialRepository.findById(materialId).orElse(null);
        if (material == null) {
            return false;
        }

        if (material.getUseGlobalConversion()) {
            return globalConversionService.canConvert(fromUnitCode, toUnitCode);
        }

        String inventoryUnitCode = material.getInventoryUnit().getCode();
        String purchaseUnitCode = material.getPurchaseUnit().getCode();

        return (fromUnitCode.equals(purchaseUnitCode) && toUnitCode.equals(inventoryUnitCode))
                || (fromUnitCode.equals(inventoryUnitCode) && toUnitCode.equals(purchaseUnitCode));
    }
}
