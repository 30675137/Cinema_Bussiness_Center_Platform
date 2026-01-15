/** @spec M001-material-unit-system */
package com.cinema.common.conversion;

import com.cinema.unitconversion.domain.UnitConversion;
import com.cinema.unitconversion.repository.UnitConversionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("GlobalConversionService Tests")
class GlobalConversionServiceTest {

    @Mock
    private UnitConversionRepository unitConversionRepository;

    @InjectMocks
    private GlobalConversionServiceImpl conversionService;

    private UnitConversion lToMlConversion;

    @BeforeEach
    void setUp() {
        lToMlConversion = UnitConversion.builder()
                .fromUnit("L")
                .toUnit("ml")
                .conversionRate(new BigDecimal("1000.00"))
                .build();
    }

    @Test
    @DisplayName("全局换算 - 直接换算规则存在")
    void testConvert_DirectRuleExists() {
        when(unitConversionRepository.findByFromUnitAndToUnit("L", "ml"))
                .thenReturn(Optional.of(lToMlConversion));

        BigDecimal result = conversionService.convert("L", "ml", new BigDecimal("2.5"));

        assertThat(result).isEqualByComparingTo(new BigDecimal("2500.00"));
    }

    @Test
    @DisplayName("全局换算 - 反向换算规则存在")
    void testConvert_ReverseRuleExists() {
        when(unitConversionRepository.findByFromUnitAndToUnit("ml", "L")).thenReturn(Optional.empty());
        when(unitConversionRepository.findByFromUnitAndToUnit("L", "ml"))
                .thenReturn(Optional.of(lToMlConversion));

        BigDecimal result = conversionService.convert("ml", "L", new BigDecimal("5000.00"));

        assertThat(result).isEqualByComparingTo(new BigDecimal("5.00"));
    }

    @Test
    @DisplayName("全局换算 - 相同单位直接返回")
    void testConvert_SameUnit_ReturnsSameValue() {
        BigDecimal result = conversionService.convert("ml", "ml", new BigDecimal("123.45"));

        assertThat(result).isEqualByComparingTo(new BigDecimal("123.45"));
        verify(unitConversionRepository, never()).findByFromUnitAndToUnit(anyString(), anyString());
    }

    @Test
    @DisplayName("全局换算 - 换算规则不存在时抛出异常")
    void testConvert_NoRuleExists_ThrowsException() {
        when(unitConversionRepository.findByFromUnitAndToUnit("kg", "L")).thenReturn(Optional.empty());
        when(unitConversionRepository.findByFromUnitAndToUnit("L", "kg")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> conversionService.convert("kg", "L", new BigDecimal("1.0")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("No conversion rule found");
    }

    @Test
    @DisplayName("检查能否换算 - 相同单位返回true")
    void testCanConvert_SameUnit_ReturnsTrue() {
        boolean canConvert = conversionService.canConvert("ml", "ml");

        assertThat(canConvert).isTrue();
    }

    @Test
    @DisplayName("检查能否换算 - 直接规则存在返回true")
    void testCanConvert_DirectRuleExists_ReturnsTrue() {
        when(unitConversionRepository.findByFromUnitAndToUnit("L", "ml"))
                .thenReturn(Optional.of(lToMlConversion));

        boolean canConvert = conversionService.canConvert("L", "ml");

        assertThat(canConvert).isTrue();
    }

    @Test
    @DisplayName("检查能否换算 - 反向规则存在返回true")
    void testCanConvert_ReverseRuleExists_ReturnsTrue() {
        when(unitConversionRepository.findByFromUnitAndToUnit("ml", "L")).thenReturn(Optional.empty());
        when(unitConversionRepository.findByFromUnitAndToUnit("L", "ml"))
                .thenReturn(Optional.of(lToMlConversion));

        boolean canConvert = conversionService.canConvert("ml", "L");

        assertThat(canConvert).isTrue();
    }

    @Test
    @DisplayName("检查能否换算 - 规则不存在返回false")
    void testCanConvert_NoRuleExists_ReturnsFalse() {
        when(unitConversionRepository.findByFromUnitAndToUnit("kg", "L")).thenReturn(Optional.empty());
        when(unitConversionRepository.findByFromUnitAndToUnit("L", "kg")).thenReturn(Optional.empty());

        boolean canConvert = conversionService.canConvert("kg", "L");

        assertThat(canConvert).isFalse();
    }
}
