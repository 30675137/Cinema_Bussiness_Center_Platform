package com.cinema.hallstore.service;

import com.cinema.hallstore.domain.BomComponent;
import com.cinema.hallstore.domain.ComboItem;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * CostCalculationService 单元测试
 * 验证成本计算逻辑的准确性
 *
 * @since P001-sku-master-data T014
 */
class CostCalculationServiceTest {

    private CostCalculationService service;

    @BeforeEach
    void setUp() {
        service = new CostCalculationService();
    }

    @Nested
    @DisplayName("成品成本计算测试")
    class FinishedProductCostCalculationTests {

        @Test
        @DisplayName("基本成品成本计算（无损耗率）")
        void shouldCalculateBasicFinishedProductCost() {
            // Given
            List<BomComponent> components = List.of(
                createBomComponent(new BigDecimal("10.00"), new BigDecimal("2.0")),  // 10 × 2 = 20
                createBomComponent(new BigDecimal("5.00"), new BigDecimal("3.0"))    // 5 × 3 = 15
            );
            BigDecimal wasteRate = BigDecimal.ZERO;

            // When
            BigDecimal cost = service.calculateFinishedProductCost(components, wasteRate);

            // Then
            assertEquals(new BigDecimal("35.00"), cost); // 20 + 15 = 35
        }

        @Test
        @DisplayName("成品成本计算（含5%损耗率）")
        void shouldCalculateCostWithWasteRate() {
            // Given
            List<BomComponent> components = List.of(
                createBomComponent(new BigDecimal("10.00"), new BigDecimal("2.0")),  // 20
                createBomComponent(new BigDecimal("5.00"), new BigDecimal("4.0"))    // 20
            );
            BigDecimal wasteRate = new BigDecimal("5.00"); // 5%

            // When
            BigDecimal cost = service.calculateFinishedProductCost(components, wasteRate);

            // Then
            // 组件成本: 20 + 20 = 40
            // 损耗率: 40 × (1 + 5/100) = 40 × 1.05 = 42.00
            assertEquals(new BigDecimal("42.00"), cost);
        }

        @Test
        @DisplayName("成品成本计算（含10%损耗率）")
        void shouldCalculateCostWith10PercentWasteRate() {
            // Given
            List<BomComponent> components = List.of(
                createBomComponent(new BigDecimal("100.00"), new BigDecimal("1.0"))
            );
            BigDecimal wasteRate = new BigDecimal("10.00"); // 10%

            // When
            BigDecimal cost = service.calculateFinishedProductCost(components, wasteRate);

            // Then
            // 组件成本: 100
            // 含损耗: 100 × 1.1 = 110.00
            assertEquals(new BigDecimal("110.00"), cost);
        }

        @Test
        @DisplayName("成品成本计算（含100%损耗率）")
        void shouldCalculateCostWith100PercentWasteRate() {
            // Given
            List<BomComponent> components = List.of(
                createBomComponent(new BigDecimal("50.00"), new BigDecimal("2.0"))  // 100
            );
            BigDecimal wasteRate = new BigDecimal("100.00"); // 100%

            // When
            BigDecimal cost = service.calculateFinishedProductCost(components, wasteRate);

            // Then
            // 组件成本: 100
            // 含损耗: 100 × 2.0 = 200.00
            assertEquals(new BigDecimal("200.00"), cost);
        }

        @Test
        @DisplayName("损耗率为null时视为0")
        void shouldTreatNullWasteRateAsZero() {
            // Given
            List<BomComponent> components = List.of(
                createBomComponent(new BigDecimal("10.00"), new BigDecimal("5.0"))
            );
            BigDecimal wasteRate = null;

            // When
            BigDecimal cost = service.calculateFinishedProductCost(components, wasteRate);

            // Then
            assertEquals(new BigDecimal("50.00"), cost);
        }

        @Test
        @DisplayName("BOM组件为空列表时成本为0")
        void shouldReturnZeroWhenComponentsEmpty() {
            // Given
            List<BomComponent> emptyComponents = new ArrayList<>();
            BigDecimal wasteRate = new BigDecimal("5.00");

            // When
            BigDecimal cost = service.calculateFinishedProductCost(emptyComponents, wasteRate);

            // Then
            assertEquals(BigDecimal.ZERO, cost);
        }

        @Test
        @DisplayName("BOM组件为null时成本为0")
        void shouldReturnZeroWhenComponentsNull() {
            // Given
            List<BomComponent> nullComponents = null;
            BigDecimal wasteRate = new BigDecimal("5.00");

            // When
            BigDecimal cost = service.calculateFinishedProductCost(nullComponents, wasteRate);

            // Then
            assertEquals(BigDecimal.ZERO, cost);
        }

        @Test
        @DisplayName("小数精度测试 - 保留2位小数")
        void shouldRoundToTwoDecimalPlaces() {
            // Given
            List<BomComponent> components = List.of(
                createBomComponent(new BigDecimal("10.333"), new BigDecimal("3.0"))  // 30.999
            );
            BigDecimal wasteRate = new BigDecimal("3.33"); // 3.33%

            // When
            BigDecimal cost = service.calculateFinishedProductCost(components, wasteRate);

            // Then
            // 组件成本: 30.999
            // 含损耗: 30.999 × 1.0333 = 32.03 (四舍五入到2位)
            assertEquals(2, cost.scale());
            assertEquals(new BigDecimal("32.03"), cost);
        }

        @Test
        @DisplayName("复杂成本计算 - 多个组件 + 损耗率")
        void shouldCalculateComplexFinishedProductCost() {
            // Given
            List<BomComponent> components = List.of(
                createBomComponent(new BigDecimal("12.50"), new BigDecimal("2.5")),   // 31.25
                createBomComponent(new BigDecimal("8.30"), new BigDecimal("1.2")),    // 9.96
                createBomComponent(new BigDecimal("15.00"), new BigDecimal("0.5"))    // 7.50
            );
            BigDecimal wasteRate = new BigDecimal("7.5"); // 7.5%

            // When
            BigDecimal cost = service.calculateFinishedProductCost(components, wasteRate);

            // Then
            // 组件成本: 31.25 + 9.96 + 7.50 = 48.71
            // 含损耗: 48.71 × 1.075 = 52.36
            assertEquals(new BigDecimal("52.36"), cost);
        }
    }

    @Nested
    @DisplayName("套餐成本计算测试")
    class ComboCostCalculationTests {

        @Test
        @DisplayName("基本套餐成本计算")
        void shouldCalculateBasicComboCost() {
            // Given
            List<ComboItem> items = List.of(
                createComboItem(new BigDecimal("50.00"), new BigDecimal("1.0")),   // 50
                createComboItem(new BigDecimal("30.00"), new BigDecimal("2.0"))    // 60
            );

            // When
            BigDecimal cost = service.calculateComboCost(items);

            // Then
            assertEquals(new BigDecimal("110.00"), cost); // 50 + 60
        }

        @Test
        @DisplayName("套餐成本计算（多个子项）")
        void shouldCalculateCostWithMultipleItems() {
            // Given
            List<ComboItem> items = List.of(
                createComboItem(new BigDecimal("100.00"), new BigDecimal("1.0")),  // 100
                createComboItem(new BigDecimal("50.00"), new BigDecimal("1.0")),   // 50
                createComboItem(new BigDecimal("25.00"), new BigDecimal("2.0"))    // 50
            );

            // When
            BigDecimal cost = service.calculateComboCost(items);

            // Then
            assertEquals(new BigDecimal("200.00"), cost);
        }

        @Test
        @DisplayName("套餐子项为空列表时成本为0")
        void shouldReturnZeroWhenItemsEmpty() {
            // Given
            List<ComboItem> emptyItems = new ArrayList<>();

            // When
            BigDecimal cost = service.calculateComboCost(emptyItems);

            // Then
            assertEquals(BigDecimal.ZERO, cost);
        }

        @Test
        @DisplayName("套餐子项为null时成本为0")
        void shouldReturnZeroWhenItemsNull() {
            // Given
            List<ComboItem> nullItems = null;

            // When
            BigDecimal cost = service.calculateComboCost(nullItems);

            // Then
            assertEquals(BigDecimal.ZERO, cost);
        }

        @Test
        @DisplayName("小数精度测试 - 保留2位小数")
        void shouldRoundToTwoDecimalPlaces() {
            // Given
            List<ComboItem> items = List.of(
                createComboItem(new BigDecimal("33.333"), new BigDecimal("1.0")),
                createComboItem(new BigDecimal("66.667"), new BigDecimal("1.0"))
            );

            // When
            BigDecimal cost = service.calculateComboCost(items);

            // Then
            assertEquals(2, cost.scale());
            assertEquals(new BigDecimal("100.00"), cost);
        }

        @Test
        @DisplayName("套餐成本不受损耗率影响（套餐无损耗率概念）")
        void shouldNotApplyWasteRateToCombo() {
            // Given
            List<ComboItem> items = List.of(
                createComboItem(new BigDecimal("100.00"), new BigDecimal("1.0"))
            );

            // When
            BigDecimal cost = service.calculateComboCost(items);

            // Then
            // 套餐成本 = 简单汇总，不应用损耗率
            assertEquals(new BigDecimal("100.00"), cost);
        }
    }

    @Nested
    @DisplayName("成本明细计算测试")
    class CostBreakdownCalculationTests {

        @Test
        @DisplayName("计算完整的成本明细")
        void shouldCalculateCostBreakdown() {
            // Given
            List<BomComponent> components = List.of(
                createBomComponent(new BigDecimal("10.00"), new BigDecimal("2.0")),  // 20
                createBomComponent(new BigDecimal("5.00"), new BigDecimal("4.0"))    // 20
            );
            BigDecimal wasteRate = new BigDecimal("10.00"); // 10%

            // When
            CostCalculationService.CostBreakdown breakdown =
                service.calculateCostBreakdown(components, wasteRate);

            // Then
            assertNotNull(breakdown);
            assertEquals(new BigDecimal("40.00"), breakdown.getComponentCost());  // 组件成本
            assertEquals(new BigDecimal("4.00"), breakdown.getWasteCost());       // 损耗成本 = 40 × 10%
            assertEquals(new BigDecimal("10.00"), breakdown.getWasteRate());      // 损耗率
            assertEquals(new BigDecimal("44.00"), breakdown.getStandardCost());   // 标准成本 = 40 + 4
        }

        @Test
        @DisplayName("成本明细（无损耗率）")
        void shouldCalculateBreakdownWithoutWasteRate() {
            // Given
            List<BomComponent> components = List.of(
                createBomComponent(new BigDecimal("50.00"), new BigDecimal("1.0"))
            );
            BigDecimal wasteRate = BigDecimal.ZERO;

            // When
            CostCalculationService.CostBreakdown breakdown =
                service.calculateCostBreakdown(components, wasteRate);

            // Then
            assertEquals(new BigDecimal("50.00"), breakdown.getComponentCost());
            assertEquals(new BigDecimal("0.00"), breakdown.getWasteCost());
            assertEquals(BigDecimal.ZERO, breakdown.getWasteRate());
            assertEquals(new BigDecimal("50.00"), breakdown.getStandardCost());
        }

        @Test
        @DisplayName("成本明细精度验证")
        void shouldCalculateBreakdownWithPrecision() {
            // Given
            List<BomComponent> components = List.of(
                createBomComponent(new BigDecimal("33.33"), new BigDecimal("3.0"))  // 99.99
            );
            BigDecimal wasteRate = new BigDecimal("5.5"); // 5.5%

            // When
            CostCalculationService.CostBreakdown breakdown =
                service.calculateCostBreakdown(components, wasteRate);

            // Then
            assertEquals(new BigDecimal("99.99"), breakdown.getComponentCost());
            // 损耗成本 = 99.99 × 5.5% = 5.50 (保留2位小数)
            assertEquals(new BigDecimal("5.50"), breakdown.getWasteCost());
            assertEquals(new BigDecimal("105.49"), breakdown.getStandardCost());
        }
    }

    @Nested
    @DisplayName("边界条件和异常情况测试")
    class EdgeCasesTests {

        @Test
        @DisplayName("成本计算误差应小于0.01元")
        void shouldHaveAccuracyWithinOneCent() {
            // Given
            List<BomComponent> components = List.of(
                createBomComponent(new BigDecimal("0.01"), new BigDecimal("1.0"))
            );
            BigDecimal wasteRate = new BigDecimal("1.00");

            // When
            BigDecimal cost = service.calculateFinishedProductCost(components, wasteRate);

            // Then
            // 0.01 × 1.01 = 0.0101 → 0.01 (四舍五入)
            BigDecimal expected = new BigDecimal("0.01");
            assertTrue(cost.subtract(expected).abs().compareTo(new BigDecimal("0.01")) <= 0);
        }

        @Test
        @DisplayName("极大数值计算测试")
        void shouldHandleLargeNumbers() {
            // Given
            List<BomComponent> components = List.of(
                createBomComponent(new BigDecimal("999999.99"), new BigDecimal("100.0"))
            );
            BigDecimal wasteRate = new BigDecimal("50.00");

            // When
            BigDecimal cost = service.calculateFinishedProductCost(components, wasteRate);

            // Then
            // 99,999,999 × 1.5 = 149,999,998.50
            assertEquals(new BigDecimal("149999998.50"), cost);
        }

        @Test
        @DisplayName("小数位数验证 - 所有成本结果保留2位小数")
        void shouldAlwaysReturnTwoDecimalPlaces() {
            // Given
            List<BomComponent> components = List.of(
                createBomComponent(new BigDecimal("10"), new BigDecimal("1"))
            );

            // When
            BigDecimal cost1 = service.calculateFinishedProductCost(components, BigDecimal.ZERO);
            BigDecimal cost2 = service.calculateComboCost(
                List.of(createComboItem(new BigDecimal("20"), new BigDecimal("1")))
            );

            // Then
            assertEquals(2, cost1.scale());
            assertEquals(2, cost2.scale());
        }
    }

    // ========== Helper Methods ==========

    private BomComponent createBomComponent(BigDecimal unitCost, BigDecimal quantity) {
        return BomComponent.builder()
                .id(UUID.randomUUID())
                .finishedProductId(UUID.randomUUID())
                .componentId(UUID.randomUUID())
                .quantity(quantity)
                .unit("kg")
                .unitCost(unitCost)
                .build();
    }

    private ComboItem createComboItem(BigDecimal unitCost, BigDecimal quantity) {
        return ComboItem.builder()
                .id(UUID.randomUUID())
                .comboId(UUID.randomUUID())
                .subItemId(UUID.randomUUID())
                .quantity(quantity)
                .unit("份")
                .unitCost(unitCost)
                .build();
    }
}
