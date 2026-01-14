/** @spec M001-material-unit-system */
package com.cinema.unitconversion.service;

import com.cinema.material.entity.Material;
import com.cinema.material.domain.MaterialCategory;
import com.cinema.material.repository.MaterialRepository;
import com.cinema.unit.domain.Unit;
import com.cinema.unit.domain.UnitCategory;
import com.cinema.unitconversion.domain.UnitConversion;
import com.cinema.unitconversion.dto.ConversionRequest;
import com.cinema.unitconversion.dto.ConversionResponse;
import com.cinema.unitconversion.repository.UnitConversionRepository;
import com.cinema.unitconversion.service.impl.UnifiedConversionServiceImpl;
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

/**
 * M001: 统一换算服务测试类
 * 
 * 测试物料级换算优先级逻辑:
 * 1. 物料配置了物料级换算 → 使用物料级换算
 * 2. 物料启用了全局换算 → 使用全局换算
 * 3. 物料未配置换算且禁用全局 → 无法换算
 * 
 * @author Cinema System
 * @since 2026-01-14
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("统一换算服务测试")
class UnifiedConversionServiceTest {

    @Mock
    private MaterialRepository materialRepository;

    @Mock
    private UnitConversionRepository unitConversionRepository;

    @InjectMocks
    private UnifiedConversionServiceImpl unifiedConversionService;

    private Material testMaterial;
    private Unit inventoryUnit;
    private Unit purchaseUnit;
    private UnitConversion globalConversion;
    private UUID testMaterialId;

    @BeforeEach
    void setUp() {
        testMaterialId = UUID.randomUUID();

        // 准备库存单位 (ml)
        inventoryUnit = Unit.builder()
                .id(UUID.randomUUID())
                .code("ml")
                .name("毫升")
                .category(UnitCategory.VOLUME)
                .decimalPlaces(1)
                .isBaseUnit(true)
                .build();

        // 准备采购单位 (bottle)
        purchaseUnit = Unit.builder()
                .id(UUID.randomUUID())
                .code("bottle")
                .name("瓶")
                .category(UnitCategory.VOLUME)
                .decimalPlaces(2)
                .isBaseUnit(false)
                .build();

        // 准备全局换算规则 (bottle → ml, 1000ml)
        globalConversion = UnitConversion.builder()
                .id(UUID.randomUUID())
                .fromUnit("bottle")
                .toUnit("ml")
                .conversionRate(new BigDecimal("1000.000000"))
                .category(com.cinema.unitconversion.domain.UnitCategory.volume)
                .build();

        // 准备测试物料 (物料级换算: 1瓶 = 500ml)
        testMaterial = Material.builder()
                .id(testMaterialId)
                .code("MAT-RAW-001")
                .name("朗姆酒")
                .category(MaterialCategory.RAW_MATERIAL)
                .inventoryUnit(inventoryUnit)
                .purchaseUnit(purchaseUnit)
                .conversionRate(new BigDecimal("500.000000")) // 物料级换算率
                .useGlobalConversion(false) // 优先使用物料级换算
                .build();
    }

    @Test
    @DisplayName("T060: 物料级换算优先 - 使用物料配置的换算率")
    void testMaterialLevelConversionPriority() {
        // Given: 物料配置了物料级换算 (1瓶 = 500ml)
        ConversionRequest request = ConversionRequest.builder()
                .materialId(testMaterialId)
                .fromUnitCode("bottle")
                .toUnitCode("ml")
                .quantity(new BigDecimal("2.0"))
                .build();

        when(materialRepository.findById(testMaterialId)).thenReturn(Optional.of(testMaterial));

        // When: 执行换算
        ConversionResponse response = unifiedConversionService.convert(request);

        // Then: 使用物料级换算率 (2瓶 * 500ml = 1000ml)
        assertThat(response).isNotNull();
        assertThat(response.getConvertedQuantity()).isEqualByComparingTo(new BigDecimal("1000.0"));
        assertThat(response.getSource()).isEqualTo("material");
        assertThat(response.getConversionRate()).isEqualByComparingTo(new BigDecimal("500.000000"));

        verify(materialRepository).findById(testMaterialId);
        verify(unitConversionRepository, never()).findByFromUnitAndToUnit(anyString(), anyString());
    }

    @Test
    @DisplayName("T061: 降级到全局换算 - 物料启用全局换算标志")
    void testFallbackToGlobalConversion() {
        // Given: 物料启用全局换算
        testMaterial.setUseGlobalConversion(true);
        testMaterial.setConversionRate(null); // 未配置物料级换算率

        ConversionRequest request = ConversionRequest.builder()
                .materialId(testMaterialId)
                .fromUnitCode("bottle")
                .toUnitCode("ml")
                .quantity(new BigDecimal("1.0"))
                .build();

        when(materialRepository.findById(testMaterialId)).thenReturn(Optional.of(testMaterial));
        when(unitConversionRepository.findByFromUnitAndToUnit("bottle", "ml"))
                .thenReturn(Optional.of(globalConversion));

        // When: 执行换算
        ConversionResponse response = unifiedConversionService.convert(request);

        // Then: 使用全局换算率 (1瓶 * 1000ml = 1000ml)
        assertThat(response).isNotNull();
        assertThat(response.getConvertedQuantity()).isEqualByComparingTo(new BigDecimal("1000.0"));
        assertThat(response.getSource()).isEqualTo("global");
        assertThat(response.getConversionRate()).isEqualByComparingTo(new BigDecimal("1000.000000"));

        verify(materialRepository).findById(testMaterialId);
        verify(unitConversionRepository).findByFromUnitAndToUnit("bottle", "ml");
    }

    @Test
    @DisplayName("T062: use_global_conversion 标志控制换算来源")
    void testUseGlobalConversionFlag() {
        // Given: 物料同时配置了物料级换算和全局换算标志
        testMaterial.setUseGlobalConversion(true);
        testMaterial.setConversionRate(new BigDecimal("500.000000"));

        ConversionRequest request = ConversionRequest.builder()
                .materialId(testMaterialId)
                .fromUnitCode("bottle")
                .toUnitCode("ml")
                .quantity(new BigDecimal("1.0"))
                .build();

        when(materialRepository.findById(testMaterialId)).thenReturn(Optional.of(testMaterial));
        // 注意: 不 stub unitConversionRepository,因为物料级换算优先

        // When: 执行换算
        ConversionResponse response = unifiedConversionService.convert(request);

        // Then: use_global_conversion=true 时，优先使用物料级换算（如果配置了）
        assertThat(response).isNotNull();
        assertThat(response.getConvertedQuantity()).isEqualByComparingTo(new BigDecimal("500.0"));
        assertThat(response.getSource()).isEqualTo("material");

        verify(materialRepository).findById(testMaterialId);
        verify(unitConversionRepository, never()).findByFromUnitAndToUnit(anyString(), anyString());
    }

    @Test
    @DisplayName("T063: source 字段正确标识换算来源")
    void testSourceFieldIndicatesConversionSource() {
        // Given: 两种场景
        
        // 场景1: 物料级换算
        ConversionRequest materialRequest = ConversionRequest.builder()
                .materialId(testMaterialId)
                .fromUnitCode("bottle")
                .toUnitCode("ml")
                .quantity(new BigDecimal("1.0"))
                .build();

        when(materialRepository.findById(testMaterialId)).thenReturn(Optional.of(testMaterial));

        // When & Then: 验证 source = "material"
        ConversionResponse materialResponse = unifiedConversionService.convert(materialRequest);
        assertThat(materialResponse.getSource()).isEqualTo("material");

        // 场景2: 全局换算
        testMaterial.setUseGlobalConversion(true);
        testMaterial.setConversionRate(null);

        ConversionRequest globalRequest = ConversionRequest.builder()
                .materialId(testMaterialId)
                .fromUnitCode("bottle")
                .toUnitCode("ml")
                .quantity(new BigDecimal("1.0"))
                .build();

        when(materialRepository.findById(testMaterialId)).thenReturn(Optional.of(testMaterial));
        when(unitConversionRepository.findByFromUnitAndToUnit("bottle", "ml"))
                .thenReturn(Optional.of(globalConversion));

        // When & Then: 验证 source = "global"
        ConversionResponse globalResponse = unifiedConversionService.convert(globalRequest);
        assertThat(globalResponse.getSource()).isEqualTo("global");
    }

    @Test
    @DisplayName("物料不存在 - 抛出异常")
    void testMaterialNotFound() {
        // Given: 物料不存在
        UUID nonExistentId = UUID.randomUUID();
        ConversionRequest request = ConversionRequest.builder()
                .materialId(nonExistentId)
                .fromUnitCode("bottle")
                .toUnitCode("ml")
                .quantity(new BigDecimal("1.0"))
                .build();

        when(materialRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        // When & Then: 抛出异常
        assertThatThrownBy(() -> unifiedConversionService.convert(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Material not found");

        verify(materialRepository).findById(nonExistentId);
    }

    @Test
    @DisplayName("无法找到换算规则 - 抛出异常")
    void testConversionRuleNotFound() {
        // Given: 物料启用全局换算,但全局换算规则不存在
        testMaterial.setUseGlobalConversion(true);
        testMaterial.setConversionRate(null);

        ConversionRequest request = ConversionRequest.builder()
                .materialId(testMaterialId)
                .fromUnitCode("bottle")
                .toUnitCode("ml")
                .quantity(new BigDecimal("1.0"))
                .build();

        when(materialRepository.findById(testMaterialId)).thenReturn(Optional.of(testMaterial));
        when(unitConversionRepository.findByFromUnitAndToUnit("bottle", "ml"))
                .thenReturn(Optional.empty());

        // When & Then: 抛出异常
        assertThatThrownBy(() -> unifiedConversionService.convert(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Conversion rule not found");

        verify(unitConversionRepository).findByFromUnitAndToUnit("bottle", "ml");
    }

    @Test
    @DisplayName("不提供物料ID - 使用纯全局换算")
    void testPureGlobalConversionWithoutMaterialId() {
        // Given: 不提供 materialId
        ConversionRequest request = ConversionRequest.builder()
                .fromUnitCode("bottle")
                .toUnitCode("ml")
                .quantity(new BigDecimal("3.0"))
                .build();

        when(unitConversionRepository.findByFromUnitAndToUnit("bottle", "ml"))
                .thenReturn(Optional.of(globalConversion));

        // When: 执行换算
        ConversionResponse response = unifiedConversionService.convert(request);

        // Then: 使用全局换算率 (3瓶 * 1000ml = 3000ml)
        assertThat(response).isNotNull();
        assertThat(response.getConvertedQuantity()).isEqualByComparingTo(new BigDecimal("3000.0"));
        assertThat(response.getSource()).isEqualTo("global");
        assertThat(response.getConversionRate()).isEqualByComparingTo(new BigDecimal("1000.000000"));

        verify(materialRepository, never()).findById(any());
        verify(unitConversionRepository).findByFromUnitAndToUnit("bottle", "ml");
    }
}
