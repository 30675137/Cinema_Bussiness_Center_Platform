/**
 * @spec O004-beverage-sku-reuse
 * BOMService 集成测试
 *
 * 测试目标：验证 BOM 配方管理服务的业务逻辑，特别是类型验证规则
 *
 * 注意: 此功能不包含权限与认证逻辑(详见宪法"认证与权限要求分层"原则)
 */
package com.cinema.product.service;

import com.cinema.hallstore.domain.BomComponent;
import com.cinema.hallstore.domain.Sku;
import com.cinema.hallstore.domain.enums.SkuType;
import com.cinema.hallstore.repository.BomComponentRepository;
import com.cinema.hallstore.repository.SkuRepository;
import com.cinema.product.dto.BOMComponentDTO;
import com.cinema.product.exception.BomErrorCode;
import com.cinema.product.exception.BomException;
import com.cinema.product.exception.SkuNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("BOMService 集成测试")
class BOMServiceTest {

    @Mock
    private BomComponentRepository bomComponentRepository;

    @Mock
    private SkuRepository skuRepository;

    @InjectMocks
    private BOMService bomService;

    private UUID finishedProductId;
    private UUID rawMaterialId;
    private Sku finishedProductSku;
    private Sku rawMaterialSku;
    private Sku packagingSku;
    private List<BOMComponentDTO> validComponents;

    @BeforeEach
    void setUp() {
        finishedProductId = UUID.randomUUID();
        rawMaterialId = UUID.randomUUID();
        UUID packagingId = UUID.randomUUID();

        // 创建成品 SKU (finished_product)
        finishedProductSku = new Sku();
        finishedProductSku.setId(finishedProductId);
        finishedProductSku.setCode("FP-001");
        finishedProductSku.setName("威士忌可乐鸡尾酒");
        finishedProductSku.setSkuType(SkuType.FINISHED_PRODUCT);
        finishedProductSku.setStandardCost(new BigDecimal("1500"));
        finishedProductSku.setWasteRate(BigDecimal.ZERO);

        // 创建原料 SKU (raw_material)
        rawMaterialSku = new Sku();
        rawMaterialSku.setId(rawMaterialId);
        rawMaterialSku.setCode("RM-001");
        rawMaterialSku.setName("威士忌");
        rawMaterialSku.setSkuType(SkuType.RAW_MATERIAL);
        rawMaterialSku.setStandardCost(new BigDecimal("800"));

        // 创建包材 SKU (packaging)
        packagingSku = new Sku();
        packagingSku.setId(packagingId);
        packagingSku.setCode("PKG-001");
        packagingSku.setName("玻璃杯");
        packagingSku.setSkuType(SkuType.PACKAGING);
        packagingSku.setStandardCost(new BigDecimal("50"));

        // 创建有效的组件列表
        validComponents = new ArrayList<>();
        validComponents.add(BOMComponentDTO.builder()
                .ingredientSkuId(rawMaterialId.toString())
                .quantity(new BigDecimal("50"))
                .unit("ml")
                .build());
        validComponents.add(BOMComponentDTO.builder()
                .ingredientSkuId(packagingId.toString())
                .quantity(new BigDecimal("1"))
                .unit("个")
                .build());
    }

    // ========== T030 核心测试：BOM 类型验证 ==========

    @Test
    @DisplayName("T030 - 成功：为成品类型 SKU 创建 BOM 配方")
    void createOrUpdateBOM_WithFinishedProductSku_ShouldSucceed() {
        // Given: 成品 SKU 和有效组件
        when(skuRepository.findById(finishedProductId)).thenReturn(Optional.of(finishedProductSku));
        when(skuRepository.findById(rawMaterialId)).thenReturn(Optional.of(rawMaterialSku));
        when(skuRepository.findById(any(UUID.class))).thenAnswer(invocation -> {
            UUID id = invocation.getArgument(0);
            if (id.equals(finishedProductId)) return Optional.of(finishedProductSku);
            if (id.equals(rawMaterialId)) return Optional.of(rawMaterialSku);
            return Optional.of(packagingSku);
        });
        when(bomComponentRepository.findByFinishedProductId(finishedProductId)).thenReturn(new ArrayList<>());
        when(bomComponentRepository.save(any(BomComponent.class))).thenAnswer(i -> i.getArgument(0));

        // When: 创建 BOM 配方
        Map<String, Object> result = bomService.createOrUpdateBOM(
                finishedProductId,
                validComponents,
                new BigDecimal("0.05")
        );

        // Then: 应该成功创建
        assertThat(result).isNotNull();
        assertThat(result).containsKeys("calculatedCost", "rawCost", "wasteRate", "componentsCount");
        assertThat(result.get("componentsCount")).isEqualTo(2);
        assertThat(result.get("wasteRate")).isEqualTo(new BigDecimal("0.05"));

        // 验证保存了组件
        verify(bomComponentRepository, times(2)).save(any(BomComponent.class));
        verify(skuRepository).save(finishedProductSku);
    }

    @Test
    @DisplayName("T030 - 失败：尝试为原料类型 SKU 创建 BOM - 抛出 BOM_VAL_001")
    void createOrUpdateBOM_WithRawMaterialSku_ShouldThrowBOM_VAL_001() {
        // Given: 原料 SKU (不是 finished_product)
        when(skuRepository.findById(rawMaterialId)).thenReturn(Optional.of(rawMaterialSku));

        // When & Then: 应该抛出 BOM_VAL_001 异常
        assertThatThrownBy(() -> bomService.createOrUpdateBOM(
                rawMaterialId,
                validComponents,
                new BigDecimal("0.05")
        ))
                .isInstanceOf(BomException.class)
                .satisfies(ex -> {
                    BomException bomEx = (BomException) ex;
                    assertThat(bomEx.getErrorCode()).isEqualTo(BomErrorCode.BOM_VAL_001);
                    assertThat(bomEx.getMessage()).contains("原料");
                    assertThat(bomEx.getDetails())
                            .containsKeys("finishedProductSkuId", "actualSkuType", "skuName")
                            .containsEntry("actualSkuType", "raw_material")
                            .containsEntry("skuName", "威士忌");
                });

        // 验证没有保存任何组件
        verify(bomComponentRepository, never()).save(any(BomComponent.class));
        verify(skuRepository, never()).save(any(Sku.class));
    }

    @Test
    @DisplayName("T030 - 失败：尝试为包材类型 SKU 创建 BOM - 抛出 BOM_VAL_001")
    void createOrUpdateBOM_WithPackagingSku_ShouldThrowBOM_VAL_001() {
        // Given: 包材 SKU
        UUID packagingId = UUID.randomUUID();
        Sku packagingSku = new Sku();
        packagingSku.setId(packagingId);
        packagingSku.setName("玻璃杯");
        packagingSku.setSkuType(SkuType.PACKAGING);

        when(skuRepository.findById(packagingId)).thenReturn(Optional.of(packagingSku));

        // When & Then: 应该抛出 BOM_VAL_001 异常
        assertThatThrownBy(() -> bomService.createOrUpdateBOM(
                packagingId,
                validComponents,
                BigDecimal.ZERO
        ))
                .isInstanceOf(BomException.class)
                .satisfies(ex -> {
                    BomException bomEx = (BomException) ex;
                    assertThat(bomEx.getErrorCode()).isEqualTo(BomErrorCode.BOM_VAL_001);
                    assertThat(bomEx.getMessage()).contains("包材");
                    assertThat(bomEx.getDetails())
                            .containsEntry("actualSkuType", "packaging");
                });
    }

    @Test
    @DisplayName("T030 - 失败：尝试为套餐类型 SKU 创建 BOM - 抛出 BOM_VAL_001")
    void createOrUpdateBOM_WithComboSku_ShouldThrowBOM_VAL_001() {
        // Given: 套餐 SKU
        UUID comboId = UUID.randomUUID();
        Sku comboSku = new Sku();
        comboSku.setId(comboId);
        comboSku.setName("三人套餐");
        comboSku.setSkuType(SkuType.COMBO);

        when(skuRepository.findById(comboId)).thenReturn(Optional.of(comboSku));

        // When & Then: 应该抛出 BOM_VAL_001 异常
        assertThatThrownBy(() -> bomService.createOrUpdateBOM(
                comboId,
                validComponents,
                BigDecimal.ZERO
        ))
                .isInstanceOf(BomException.class)
                .satisfies(ex -> {
                    BomException bomEx = (BomException) ex;
                    assertThat(bomEx.getErrorCode()).isEqualTo(BomErrorCode.BOM_VAL_001);
                    assertThat(bomEx.getMessage()).contains("套餐");
                });
    }

    // ========== 其他验证规则测试 ==========

    @Test
    @DisplayName("失败：SKU 不存在 - 抛出 SkuNotFoundException")
    void createOrUpdateBOM_WithNonExistentSku_ShouldThrowSkuNotFoundException() {
        // Given: SKU 不存在
        UUID nonExistentId = UUID.randomUUID();
        when(skuRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        // When & Then: 应该抛出 SkuNotFoundException
        assertThatThrownBy(() -> bomService.createOrUpdateBOM(
                nonExistentId,
                validComponents,
                BigDecimal.ZERO
        ))
                .isInstanceOf(SkuNotFoundException.class);
    }

    @Test
    @DisplayName("失败：组件列表为空 - 抛出 BOM_VAL_002")
    void createOrUpdateBOM_WithEmptyComponents_ShouldThrowBOM_VAL_002() {
        // Given: 成品 SKU 但组件为空
        when(skuRepository.findById(finishedProductId)).thenReturn(Optional.of(finishedProductSku));

        // When & Then: 应该抛出 BOM_VAL_002 异常
        assertThatThrownBy(() -> bomService.createOrUpdateBOM(
                finishedProductId,
                new ArrayList<>(),
                BigDecimal.ZERO
        ))
                .isInstanceOf(BomException.class)
                .satisfies(ex -> {
                    BomException bomEx = (BomException) ex;
                    assertThat(bomEx.getErrorCode()).isEqualTo(BomErrorCode.BOM_VAL_002);
                });
    }

    @Test
    @DisplayName("失败：组件列表为 null - 抛出 BOM_VAL_002")
    void createOrUpdateBOM_WithNullComponents_ShouldThrowBOM_VAL_002() {
        // Given: 成品 SKU 但组件为 null
        when(skuRepository.findById(finishedProductId)).thenReturn(Optional.of(finishedProductSku));

        // When & Then: 应该抛出 BOM_VAL_002 异常
        assertThatThrownBy(() -> bomService.createOrUpdateBOM(
                finishedProductId,
                null,
                BigDecimal.ZERO
        ))
                .isInstanceOf(BomException.class)
                .satisfies(ex -> {
                    BomException bomEx = (BomException) ex;
                    assertThat(bomEx.getErrorCode()).isEqualTo(BomErrorCode.BOM_VAL_002);
                });
    }

    @Test
    @DisplayName("失败：损耗率小于 0 - 抛出 BOM_VAL_004")
    void createOrUpdateBOM_WithNegativeWasteRate_ShouldThrowBOM_VAL_004() {
        // Given: 损耗率 < 0
        when(skuRepository.findById(finishedProductId)).thenReturn(Optional.of(finishedProductSku));

        // When & Then: 应该抛出 BOM_VAL_004 异常
        assertThatThrownBy(() -> bomService.createOrUpdateBOM(
                finishedProductId,
                validComponents,
                new BigDecimal("-0.05")
        ))
                .isInstanceOf(BomException.class)
                .satisfies(ex -> {
                    BomException bomEx = (BomException) ex;
                    assertThat(bomEx.getErrorCode()).isEqualTo(BomErrorCode.BOM_VAL_004);
                });
    }

    @Test
    @DisplayName("失败：损耗率大于 1 - 抛出 BOM_VAL_004")
    void createOrUpdateBOM_WithWasteRateGreaterThanOne_ShouldThrowBOM_VAL_004() {
        // Given: 损耗率 > 1
        when(skuRepository.findById(finishedProductId)).thenReturn(Optional.of(finishedProductSku));

        // When & Then: 应该抛出 BOM_VAL_004 异常
        assertThatThrownBy(() -> bomService.createOrUpdateBOM(
                finishedProductId,
                validComponents,
                new BigDecimal("1.5")
        ))
                .isInstanceOf(BomException.class)
                .satisfies(ex -> {
                    BomException bomEx = (BomException) ex;
                    assertThat(bomEx.getErrorCode()).isEqualTo(BomErrorCode.BOM_VAL_004);
                });
    }

    @Test
    @DisplayName("失败：组件数量小于等于 0 - 抛出 BOM_VAL_003")
    void createOrUpdateBOM_WithZeroQuantityComponent_ShouldThrowBOM_VAL_003() {
        // Given: 组件数量为 0
        List<BOMComponentDTO> invalidComponents = new ArrayList<>();
        invalidComponents.add(BOMComponentDTO.builder()
                .ingredientSkuId(rawMaterialId.toString())
                .quantity(BigDecimal.ZERO)
                .unit("ml")
                .build());

        when(skuRepository.findById(finishedProductId)).thenReturn(Optional.of(finishedProductSku));
        when(skuRepository.findById(rawMaterialId)).thenReturn(Optional.of(rawMaterialSku));
        when(bomComponentRepository.findByFinishedProductId(finishedProductId)).thenReturn(new ArrayList<>());

        // When & Then: 应该抛出 BOM_VAL_003 异常
        assertThatThrownBy(() -> bomService.createOrUpdateBOM(
                finishedProductId,
                invalidComponents,
                BigDecimal.ZERO
        ))
                .isInstanceOf(BomException.class)
                .satisfies(ex -> {
                    BomException bomEx = (BomException) ex;
                    assertThat(bomEx.getErrorCode()).isEqualTo(BomErrorCode.BOM_VAL_003);
                });
    }

    @Test
    @DisplayName("失败：组件 SKU 不存在 - 抛出 BOM_NTF_002")
    void createOrUpdateBOM_WithNonExistentComponentSku_ShouldThrowBOM_NTF_002() {
        // Given: 组件 SKU 不存在
        UUID nonExistentComponentId = UUID.randomUUID();
        List<BOMComponentDTO> componentsWithInvalidSku = new ArrayList<>();
        componentsWithInvalidSku.add(BOMComponentDTO.builder()
                .ingredientSkuId(nonExistentComponentId.toString())
                .quantity(new BigDecimal("50"))
                .unit("ml")
                .build());

        when(skuRepository.findById(finishedProductId)).thenReturn(Optional.of(finishedProductSku));
        when(skuRepository.findById(nonExistentComponentId)).thenReturn(Optional.empty());
        when(bomComponentRepository.findByFinishedProductId(finishedProductId)).thenReturn(new ArrayList<>());

        // When & Then: 应该抛出 BOM_NTF_002 异常
        assertThatThrownBy(() -> bomService.createOrUpdateBOM(
                finishedProductId,
                componentsWithInvalidSku,
                BigDecimal.ZERO
        ))
                .isInstanceOf(BomException.class)
                .satisfies(ex -> {
                    BomException bomEx = (BomException) ex;
                    assertThat(bomEx.getErrorCode()).isEqualTo(BomErrorCode.BOM_NTF_002);
                    assertThat(bomEx.getDetails()).containsKey("componentId");
                });
    }

    @Test
    @DisplayName("成功：更新已存在的 BOM 配方（删除旧组件并创建新组件）")
    void createOrUpdateBOM_WithExistingBom_ShouldDeleteOldAndCreateNew() {
        // Given: 已存在的 BOM 组件
        BomComponent existingComponent = BomComponent.builder()
                .finishedProductId(finishedProductId)
                .componentId(rawMaterialId)
                .quantity(new BigDecimal("30"))
                .unit("ml")
                .unitCost(new BigDecimal("800"))
                .build();
        List<BomComponent> existingComponents = List.of(existingComponent);

        when(skuRepository.findById(finishedProductId)).thenReturn(Optional.of(finishedProductSku));
        when(skuRepository.findById(any(UUID.class))).thenAnswer(invocation -> {
            UUID id = invocation.getArgument(0);
            if (id.equals(finishedProductId)) return Optional.of(finishedProductSku);
            if (id.equals(rawMaterialId)) return Optional.of(rawMaterialSku);
            return Optional.of(packagingSku);
        });
        when(bomComponentRepository.findByFinishedProductId(finishedProductId)).thenReturn(existingComponents);
        when(bomComponentRepository.save(any(BomComponent.class))).thenAnswer(i -> i.getArgument(0));

        // When: 更新 BOM
        Map<String, Object> result = bomService.createOrUpdateBOM(
                finishedProductId,
                validComponents,
                new BigDecimal("0.1")
        );

        // Then: 应该删除旧组件并创建新组件
        verify(bomComponentRepository).deleteAll(existingComponents);
        verify(bomComponentRepository, times(2)).save(any(BomComponent.class));
        assertThat(result.get("componentsCount")).isEqualTo(2);
    }

    @Test
    @DisplayName("成功：正确计算含损耗的总成本")
    void createOrUpdateBOM_ShouldCalculateCostWithWaste() {
        // Given: 成本配置
        // 原料: 50ml * 800分/单位 = 40000分
        // 包材: 1个 * 50分/单位 = 50分
        // 总成本 = 40050分
        // 损耗率 = 5% (0.05)
        // 含损耗成本 = 40050 * 1.05 = 42052.5分 ≈ 42053分

        when(skuRepository.findById(finishedProductId)).thenReturn(Optional.of(finishedProductSku));
        when(skuRepository.findById(any(UUID.class))).thenAnswer(invocation -> {
            UUID id = invocation.getArgument(0);
            if (id.equals(finishedProductId)) return Optional.of(finishedProductSku);
            if (id.equals(rawMaterialId)) return Optional.of(rawMaterialSku);
            return Optional.of(packagingSku);
        });
        when(bomComponentRepository.findByFinishedProductId(finishedProductId)).thenReturn(new ArrayList<>());
        when(bomComponentRepository.save(any(BomComponent.class))).thenAnswer(i -> i.getArgument(0));

        // When: 创建 BOM
        Map<String, Object> result = bomService.createOrUpdateBOM(
                finishedProductId,
                validComponents,
                new BigDecimal("0.05")
        );

        // Then: 验证成本计算
        long rawCost = (long) result.get("rawCost");
        long calculatedCost = (long) result.get("calculatedCost");

        // 原料成本: 50 * 800 = 40000
        // 包材成本: 1 * 50 = 50
        // 总原料成本 = 40050
        assertThat(rawCost).isEqualTo(40050L);

        // 含损耗成本 = 40050 * 1.05 = 42052.5 ≈ 42052 或 42053（取决于舍入）
        assertThat(calculatedCost).isBetween(42052L, 42053L);
    }
}
