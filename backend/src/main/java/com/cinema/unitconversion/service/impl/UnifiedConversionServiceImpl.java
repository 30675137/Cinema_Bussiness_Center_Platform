/** @spec M001-material-unit-system */
package com.cinema.unitconversion.service.impl;

import com.cinema.material.entity.Material;
import com.cinema.material.repository.MaterialRepository;
import com.cinema.unitconversion.domain.UnitConversion;
import com.cinema.unitconversion.dto.ConversionRequest;
import com.cinema.unitconversion.dto.ConversionResponse;
import com.cinema.unitconversion.repository.UnitConversionRepository;
import com.cinema.unitconversion.service.UnifiedConversionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * M001: 统一换算服务实现
 * 
 * 实现物料级换算优先逻辑:
 * 1. 物料级换算优先 (material.conversion_rate)
 * 2. 降级到全局换算 (unit_conversions 表)
 * 3. 纯全局换算 (不提供 materialId)
 * 
 * @author Cinema System
 * @since 2026-01-14
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UnifiedConversionServiceImpl implements UnifiedConversionService {

    private final MaterialRepository materialRepository;
    private final UnitConversionRepository unitConversionRepository;

    @Override
    @Transactional(readOnly = true)
    public ConversionResponse convert(ConversionRequest request) {
        log.info("Converting {} {} to {}, materialId: {}", 
                request.getQuantity(), request.getFromUnitCode(), 
                request.getToUnitCode(), request.getMaterialId());

        // 场景1: 提供了 materialId,尝试物料级换算
        if (request.getMaterialId() != null) {
            return convertWithMaterial(request);
        }

        // 场景2: 未提供 materialId,使用纯全局换算
        return convertGlobal(request);
    }

    /**
     * 物料级换算 (优先逻辑)
     * 
     * 换算优先级:
     * 1. 物料配置了 conversion_rate → 使用物料级换算
     * 2. 物料启用 use_global_conversion → 降级到全局换算
     * 3. 物料未配置且未启用全局 → 抛出异常
     */
    private ConversionResponse convertWithMaterial(ConversionRequest request) {
        // 查询物料
        Material material = materialRepository.findById(request.getMaterialId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Material not found: " + request.getMaterialId()));

        log.debug("Material found: {}, conversionRate: {}, useGlobalConversion: {}", 
                material.getCode(), material.getConversionRate(), material.getUseGlobalConversion());

        // 优先级1: 物料级换算 (如果配置了 conversion_rate)
        if (material.getConversionRate() != null && material.getConversionRate().compareTo(BigDecimal.ZERO) > 0) {
            return convertMaterialLevel(request, material);
        }

        // 优先级2: 降级到全局换算 (如果启用了 use_global_conversion)
        if (Boolean.TRUE.equals(material.getUseGlobalConversion())) {
            log.info("Material {} fallback to global conversion", material.getCode());
            return convertGlobal(request);
        }

        // 优先级3: 无法换算
        throw new IllegalArgumentException(
                String.format("Material %s has no conversion rate configured and global conversion is disabled",
                        material.getCode()));
    }

    /**
     * 物料级换算
     */
    private ConversionResponse convertMaterialLevel(ConversionRequest request, Material material) {
        BigDecimal rate = material.getConversionRate();
        BigDecimal result = request.getQuantity().multiply(rate).setScale(6, RoundingMode.HALF_UP);

        String formula = String.format("%s %s × %s = %s %s (material-level)",
                request.getQuantity(), request.getFromUnitCode(),
                rate, result, request.getToUnitCode());

        log.info("Material-level conversion: {}", formula);

        return ConversionResponse.builder()
                .materialId(request.getMaterialId())
                .fromUnitCode(request.getFromUnitCode())
                .toUnitCode(request.getToUnitCode())
                .originalQuantity(request.getQuantity())
                .convertedQuantity(result)
                .conversionRate(rate)
                .source("material")
                .formula(formula)
                .build();
    }

    /**
     * 全局换算
     */
    private ConversionResponse convertGlobal(ConversionRequest request) {
        // 查询全局换算规则
        UnitConversion conversion = unitConversionRepository
                .findByFromUnitAndToUnit(request.getFromUnitCode(), request.getToUnitCode())
                .orElseThrow(() -> new IllegalArgumentException(
                        String.format("Conversion rule not found: %s → %s",
                                request.getFromUnitCode(), request.getToUnitCode())));

        BigDecimal rate = conversion.getConversionRate();
        BigDecimal result = request.getQuantity().multiply(rate).setScale(6, RoundingMode.HALF_UP);

        String formula = String.format("%s %s × %s = %s %s (global)",
                request.getQuantity(), request.getFromUnitCode(),
                rate, result, request.getToUnitCode());

        log.info("Global conversion: {}", formula);

        return ConversionResponse.builder()
                .materialId(request.getMaterialId())
                .fromUnitCode(request.getFromUnitCode())
                .toUnitCode(request.getToUnitCode())
                .originalQuantity(request.getQuantity())
                .convertedQuantity(result)
                .conversionRate(rate)
                .source("global")
                .formula(formula)
                .build();
    }
}
