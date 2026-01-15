/** @spec M001-material-unit-system */
package com.cinema.common.conversion;

import com.cinema.common.conversion.CommonConversionService.ConversionResult;
import com.cinema.common.conversion.CommonConversionService.ConversionSource;
import com.cinema.material.entity.Material;
import com.cinema.material.repository.MaterialRepository;
import com.cinema.unit.entity.Unit;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CommonConversionService Tests")
class CommonConversionServiceTest {

    @Mock
    private MaterialRepository materialRepository;

    @Mock
    private GlobalConversionService globalConversionService;

    @InjectMocks
    private CommonConversionServiceImpl conversionService;

    private UUID materialId;
    private Material material;
    private Unit mlUnit;
    private Unit lUnit;

    @BeforeEach
    void setUp() {
        materialId = UUID.randomUUID();

        mlUnit = Unit.builder()
                .id(UUID.randomUUID())
                .code("ml")
                .name("毫升")
                .category(Unit.UnitCategory.VOLUME)
                .build();

        lUnit = Unit.builder()
                .id(UUID.randomUUID())
                .code("L")
                .name("升")
                .category(Unit.UnitCategory.VOLUME)
                .build();

        material = Material.builder()
                .id(materialId)
                .code("MAT-RAW-001")
                .name("糖浆")
                .inventoryUnit(mlUnit)
                .purchaseUnit(lUnit)
                .conversionRate(new BigDecimal("1000.00"))
                .useGlobalConversion(false)
                .build();
    }

    @Test
    @DisplayName("换算 - 使用物料级换算率")
    void testConvert_UseMaterialConversion() {
        when(materialRepository.findById(materialId)).thenReturn(Optional.of(material));

        ConversionResult result = conversionService.convert("L", "ml", new BigDecimal("2.5"), materialId);

        assertThat(result).isNotNull();
        assertThat(result.convertedQuantity()).isEqualByComparingTo(new BigDecimal("2500.00"));
        assertThat(result.source()).isEqualTo(ConversionSource.MATERIAL);
        assertThat(result.conversionPath()).contains("物料级换算");
    }

    @Test
    @DisplayName("换算 - 使用全局换算率")
    void testConvert_UseGlobalConversion() {
        material.setUseGlobalConversion(true);
        when(materialRepository.findById(materialId)).thenReturn(Optional.of(material));
        when(globalConversionService.convert("L", "ml", new BigDecimal("2.5")))
                .thenReturn(new BigDecimal("2500.00"));

        ConversionResult result = conversionService.convert("L", "ml", new BigDecimal("2.5"), materialId);

        assertThat(result).isNotNull();
        assertThat(result.convertedQuantity()).isEqualByComparingTo(new BigDecimal("2500.00"));
        assertThat(result.source()).isEqualTo(ConversionSource.GLOBAL);
        verify(globalConversionService).convert("L", "ml", new BigDecimal("2.5"));
    }

    @Test
    @DisplayName("换算 - 物料不存在时抛出异常")
    void testConvert_MaterialNotFound_ThrowsException() {
        when(materialRepository.findById(materialId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> conversionService.convert("L", "ml", new BigDecimal("2.5"), materialId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Material not found");
    }

    @Test
    @DisplayName("全局换算 - 正常情况")
    void testConvertGlobal_Success() {
        when(globalConversionService.convert("L", "ml", new BigDecimal("3.0")))
                .thenReturn(new BigDecimal("3000.00"));

        ConversionResult result = conversionService.convertGlobal("L", "ml", new BigDecimal("3.0"));

        assertThat(result).isNotNull();
        assertThat(result.convertedQuantity()).isEqualByComparingTo(new BigDecimal("3000.00"));
        assertThat(result.source()).isEqualTo(ConversionSource.GLOBAL);
        verify(globalConversionService).convert("L", "ml", new BigDecimal("3.0"));
    }

    @Test
    @DisplayName("检查能否换算 - 物料级换算可用")
    void testCanConvert_MaterialConversionAvailable() {
        when(materialRepository.findById(materialId)).thenReturn(Optional.of(material));

        boolean canConvert = conversionService.canConvert("L", "ml", materialId);

        assertThat(canConvert).isTrue();
    }

    @Test
    @DisplayName("检查能否换算 - 使用全局换算")
    void testCanConvert_GlobalConversionAvailable() {
        material.setUseGlobalConversion(true);
        when(materialRepository.findById(materialId)).thenReturn(Optional.of(material));
        when(globalConversionService.canConvert("L", "ml")).thenReturn(true);

        boolean canConvert = conversionService.canConvert("L", "ml", materialId);

        assertThat(canConvert).isTrue();
        verify(globalConversionService).canConvert("L", "ml");
    }

    @Test
    @DisplayName("检查能否换算 - 物料不存在返回false")
    void testCanConvert_MaterialNotFound_ReturnsFalse() {
        when(materialRepository.findById(materialId)).thenReturn(Optional.empty());

        boolean canConvert = conversionService.canConvert("L", "ml", materialId);

        assertThat(canConvert).isFalse();
    }
}
