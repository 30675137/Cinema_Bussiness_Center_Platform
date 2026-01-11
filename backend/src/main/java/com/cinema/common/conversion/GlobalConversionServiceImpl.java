/** @spec M001-material-unit-system */
package com.cinema.common.conversion;

import com.cinema.unitconversion.domain.UnitConversion;
import com.cinema.unitconversion.repository.UnitConversionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class GlobalConversionServiceImpl implements GlobalConversionService {

    private final UnitConversionRepository unitConversionRepository;

    @Override
    public BigDecimal convert(String fromUnitCode, String toUnitCode, BigDecimal quantity) {
        // 相同单位直接返回
        if (fromUnitCode.equals(toUnitCode)) {
            return quantity;
        }

        // 查找直接换算规则
        Optional<UnitConversion> directRule = unitConversionRepository.findByFromUnitAndToUnit(fromUnitCode, toUnitCode);
        if (directRule.isPresent()) {
            BigDecimal rate = directRule.get().getConversionRate();
            BigDecimal result = quantity.multiply(rate);
            log.debug("Direct conversion: {} {} -> {} {} (rate: {})", quantity, fromUnitCode, result, toUnitCode, rate);
            return result;
        }

        // 查找反向换算规则
        Optional<UnitConversion> reverseRule = unitConversionRepository.findByFromUnitAndToUnit(toUnitCode, fromUnitCode);
        if (reverseRule.isPresent()) {
            BigDecimal rate = reverseRule.get().getConversionRate();
            BigDecimal result = quantity.divide(rate, 6, BigDecimal.ROUND_HALF_UP);
            log.debug("Reverse conversion: {} {} -> {} {} (reverse rate: {})", quantity, fromUnitCode, result, toUnitCode, rate);
            return result;
        }

        throw new IllegalArgumentException(
                String.format("No conversion rule found for %s -> %s", fromUnitCode, toUnitCode));
    }

    @Override
    public boolean canConvert(String fromUnitCode, String toUnitCode) {
        if (fromUnitCode.equals(toUnitCode)) {
            return true;
        }

        return unitConversionRepository.findByFromUnitAndToUnit(fromUnitCode, toUnitCode).isPresent()
                || unitConversionRepository.findByFromUnitAndToUnit(toUnitCode, fromUnitCode).isPresent();
    }
}
