/** @spec M001-material-unit-system */
package com.cinema.bom.service;

import com.cinema.common.conversion.CommonConversionService;
import com.cinema.common.conversion.CommonConversionService.ConversionResult;
import com.cinema.common.conversion.CommonConversionService.ConversionSource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("BomConversionService Tests")
class BomConversionServiceTest {

    @Mock
    private CommonConversionService commonConversionService;

    @InjectMocks
    private BomConversionService bomConversionService;

    private UUID componentId;

    @BeforeEach
    void setUp() {
        componentId = UUID.randomUUID();
    }

    @Test
    @DisplayName("换算BOM组件用量 - 正常情况")
    void testConvertBomQuantity_Success() {
        ConversionResult mockResult = new ConversionResult(
                new BigDecimal("500.00"),
                ConversionSource.MATERIAL,
                "物料级换算"
        );

        when(commonConversionService.convert("L", "ml", new BigDecimal("0.5"), componentId))
                .thenReturn(mockResult);

        BigDecimal result = bomConversionService.convertBomQuantity(
                componentId,
                new BigDecimal("0.5"),
                "L",
                "ml"
        );

        assertThat(result).isEqualByComparingTo(new BigDecimal("500.00"));
        verify(commonConversionService).convert("L", "ml", new BigDecimal("0.5"), componentId);
    }

    @Test
    @DisplayName("计算成品生产所需原料用量 - 正常情况")
    void testCalculateRequiredQuantity_Success() {
        // BOM: 每份成品需要0.5L糖浆
        // 目标: 生产10份成品，需要多少ml糖浆
        ConversionResult mockResult = new ConversionResult(
                new BigDecimal("500.00"), // 0.5L = 500ml
                ConversionSource.MATERIAL,
                "物料级换算"
        );

        when(commonConversionService.convert("L", "ml", new BigDecimal("0.5"), componentId))
                .thenReturn(mockResult);

        BigDecimal result = bomConversionService.calculateRequiredQuantity(
                componentId,
                new BigDecimal("0.5"),  // BOM用量: 0.5L/份
                "L",                    // BOM单位
                "ml",                   // 目标单位
                new BigDecimal("10")    // 生产数量: 10份
        );

        // 预期: 500ml/份 × 10份 = 5000ml
        assertThat(result).isEqualByComparingTo(new BigDecimal("5000.00"));
        verify(commonConversionService).convert("L", "ml", new BigDecimal("0.5"), componentId);
    }

    @Test
    @DisplayName("验证BOM组件单位可换算 - 返回true")
    void testCanConvertBomQuantity_ReturnsTrue() {
        when(commonConversionService.canConvert("L", "ml", componentId)).thenReturn(true);

        boolean canConvert = bomConversionService.canConvertBomQuantity(
                componentId,
                "L",
                "ml"
        );

        assertThat(canConvert).isTrue();
        verify(commonConversionService).canConvert("L", "ml", componentId);
    }

    @Test
    @DisplayName("验证BOM组件单位可换算 - 返回false")
    void testCanConvertBomQuantity_ReturnsFalse() {
        when(commonConversionService.canConvert("kg", "ml", componentId)).thenReturn(false);

        boolean canConvert = bomConversionService.canConvertBomQuantity(
                componentId,
                "kg",
                "ml"
        );

        assertThat(canConvert).isFalse();
    }
}
