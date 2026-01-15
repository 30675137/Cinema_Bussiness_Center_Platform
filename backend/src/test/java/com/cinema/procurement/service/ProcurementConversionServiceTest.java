/** @spec M001-material-unit-system */
package com.cinema.procurement.service;

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
@DisplayName("ProcurementConversionService Tests")
class ProcurementConversionServiceTest {

    @Mock
    private CommonConversionService commonConversionService;

    @InjectMocks
    private ProcurementConversionService procurementConversionService;

    private UUID materialId;

    @BeforeEach
    void setUp() {
        materialId = UUID.randomUUID();
    }

    @Test
    @DisplayName("采购单位转库存单位 - 正常情况")
    void testConvertPurchaseToInventory_Success() {
        ConversionResult mockResult = new ConversionResult(
                new BigDecimal("2500.00"),
                ConversionSource.MATERIAL,
                "物料级换算"
        );

        when(commonConversionService.convert("L", "ml", new BigDecimal("2.5"), materialId))
                .thenReturn(mockResult);

        BigDecimal result = procurementConversionService.convertPurchaseToInventory(
                materialId,
                new BigDecimal("2.5"),
                "L",
                "ml"
        );

        assertThat(result).isEqualByComparingTo(new BigDecimal("2500.00"));
        verify(commonConversionService).convert("L", "ml", new BigDecimal("2.5"), materialId);
    }

    @Test
    @DisplayName("库存单位转采购单位 - 正常情况")
    void testConvertInventoryToPurchase_Success() {
        ConversionResult mockResult = new ConversionResult(
                new BigDecimal("2.5"),
                ConversionSource.MATERIAL,
                "物料级换算"
        );

        when(commonConversionService.convert("ml", "L", new BigDecimal("2500.00"), materialId))
                .thenReturn(mockResult);

        BigDecimal result = procurementConversionService.convertInventoryToPurchase(
                materialId,
                new BigDecimal("2500.00"),
                "ml",
                "L"
        );

        assertThat(result).isEqualByComparingTo(new BigDecimal("2.5"));
        verify(commonConversionService).convert("ml", "L", new BigDecimal("2500.00"), materialId);
    }

    @Test
    @DisplayName("验证是否可以换算 - 返回true")
    void testCanConvertPurchaseToInventory_ReturnsTrue() {
        when(commonConversionService.canConvert("L", "ml", materialId)).thenReturn(true);

        boolean canConvert = procurementConversionService.canConvertPurchaseToInventory(
                materialId,
                "L",
                "ml"
        );

        assertThat(canConvert).isTrue();
        verify(commonConversionService).canConvert("L", "ml", materialId);
    }

    @Test
    @DisplayName("验证是否可以换算 - 返回false")
    void testCanConvertPurchaseToInventory_ReturnsFalse() {
        when(commonConversionService.canConvert("kg", "L", materialId)).thenReturn(false);

        boolean canConvert = procurementConversionService.canConvertPurchaseToInventory(
                materialId,
                "kg",
                "L"
        );

        assertThat(canConvert).isFalse();
    }
}
