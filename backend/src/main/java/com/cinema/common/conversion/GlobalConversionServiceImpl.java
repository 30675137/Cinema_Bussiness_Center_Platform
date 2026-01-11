/** @spec M001-material-unit-system */
package com.cinema.common.conversion;

import com.cinema.unitconversion.domain.UnitConversion;
import com.cinema.unitconversion.dto.ConversionPathResponse;
import com.cinema.unitconversion.repository.UnitConversionRepository;
import com.cinema.unitconversion.service.ConversionPathService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class GlobalConversionServiceImpl implements GlobalConversionService {

    private final UnitConversionRepository unitConversionRepository;
    private final ConversionPathService conversionPathService;

    @Override
    public BigDecimal convert(String fromUnitCode, String toUnitCode, BigDecimal quantity) {
        // 统一转换为小写进行匹配
        String fromLower = fromUnitCode.toLowerCase();
        String toLower = toUnitCode.toLowerCase();
        
        // 相同单位直接返回
        if (fromLower.equals(toLower)) {
            return quantity;
        }

        // 先尝试直接换算规则（大小写不敏感）
        Optional<UnitConversion> directRule = unitConversionRepository.findByFromUnitIgnoreCaseAndToUnitIgnoreCase(fromUnitCode, toUnitCode);
        if (directRule.isPresent()) {
            BigDecimal rate = directRule.get().getConversionRate();
            BigDecimal result = quantity.multiply(rate);
            log.debug("Direct conversion: {} {} -> {} {} (rate: {})", quantity, fromUnitCode, result, toUnitCode, rate);
            return result;
        }

        // 查找反向换算规则
        Optional<UnitConversion> reverseRule = unitConversionRepository.findByFromUnitIgnoreCaseAndToUnitIgnoreCase(toUnitCode, fromUnitCode);
        if (reverseRule.isPresent()) {
            BigDecimal rate = reverseRule.get().getConversionRate();
            BigDecimal result = quantity.divide(rate, 6, RoundingMode.HALF_UP);
            log.debug("Reverse conversion: {} {} -> {} {} (reverse rate: {})", quantity, fromUnitCode, result, toUnitCode, rate);
            return result;
        }

        // 尝试链式换算（通过中间单位）
        ConversionPathResponse pathResult = conversionPathService.calculatePath(fromUnitCode, toUnitCode);
        if (pathResult.isFound()) {
            BigDecimal totalRate = pathResult.getTotalRate();
            BigDecimal result = quantity.multiply(totalRate).setScale(6, RoundingMode.HALF_UP);
            log.debug("Chain conversion: {} {} -> {} {} (path: {}, rate: {})", 
                    quantity, fromUnitCode, result, toUnitCode, pathResult.getPath(), totalRate);
            return result;
        }

        throw new IllegalArgumentException(
                String.format("No conversion rule found for %s -> %s", fromUnitCode, toUnitCode));
    }

    @Override
    public boolean canConvert(String fromUnitCode, String toUnitCode) {
        String fromLower = fromUnitCode.toLowerCase();
        String toLower = toUnitCode.toLowerCase();
        
        if (fromLower.equals(toLower)) {
            return true;
        }

        // 检查直接规则
        if (unitConversionRepository.findByFromUnitIgnoreCaseAndToUnitIgnoreCase(fromUnitCode, toUnitCode).isPresent()
                || unitConversionRepository.findByFromUnitIgnoreCaseAndToUnitIgnoreCase(toUnitCode, fromUnitCode).isPresent()) {
            return true;
        }

        // 检查链式换算路径
        ConversionPathResponse pathResult = conversionPathService.calculatePath(fromUnitCode, toUnitCode);
        return pathResult.isFound();
    }
}
