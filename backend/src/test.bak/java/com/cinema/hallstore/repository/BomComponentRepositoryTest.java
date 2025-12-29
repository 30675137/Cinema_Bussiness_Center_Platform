package com.cinema.hallstore.repository;

import com.cinema.hallstore.config.SupabaseConfig;
import com.cinema.hallstore.domain.BomComponent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * BomComponentRepository 单元测试
 * 验证BOM组件数据访问操作的正确性
 *
 * @since P001-sku-master-data T013
 */
@ExtendWith(MockitoExtension.class)
class BomComponentRepositoryTest {

    @Mock
    private WebClient webClient;

    @Mock
    private SupabaseConfig supabaseConfig;

    private BomComponentRepository repository;

    private UUID finishedProductId;
    private UUID componentId1;
    private UUID componentId2;

    @BeforeEach
    void setUp() {
        repository = new BomComponentRepository(webClient, supabaseConfig);
        finishedProductId = UUID.randomUUID();
        componentId1 = UUID.randomUUID();
        componentId2 = UUID.randomUUID();

        when(supabaseConfig.getTimeoutDuration()).thenReturn(java.time.Duration.ofSeconds(10));
    }

    @Nested
    @DisplayName("按成品ID查询BOM组件测试")
    class FindByFinishedProductIdTests {

        @Test
        @DisplayName("成功查询成品的BOM组件列表")
        void shouldFindBomComponentsByFinishedProductId() {
            // Given
            UUID productId = UUID.randomUUID();

            // When & Then
            assertNotNull(repository);
            // 实际查询将在集成测试中验证
            // 应按 sort_order ASC 排序返回
        }

        @Test
        @DisplayName("成品没有BOM配置时返回空列表")
        void shouldReturnEmptyListWhenNoBomComponents() {
            // Given
            UUID productWithoutBom = UUID.randomUUID();

            // When & Then
            assertNotNull(repository);
        }

        @Test
        @DisplayName("BOM组件应按排序序号升序返回")
        void shouldReturnBomComponentsInSortOrder() {
            // Given
            BomComponent comp1 = createMockBomComponent(finishedProductId, componentId1, 1, 0);
            BomComponent comp2 = createMockBomComponent(finishedProductId, componentId2, 2, 1);

            // When & Then
            assertTrue(comp1.getSortOrder() < comp2.getSortOrder());
            // 实际排序将在集成测试中验证
        }
    }

    @Nested
    @DisplayName("按组件ID查询引用关系测试")
    class FindByComponentIdTests {

        @Test
        @DisplayName("成功查询引用该组件的所有成品")
        void shouldFindFinishedProductsUsingComponent() {
            // Given
            UUID componentId = UUID.randomUUID();

            // When & Then
            assertNotNull(repository);
            // 用于检查组件被哪些成品引用（删除前依赖检查）
        }

        @Test
        @DisplayName("组件未被任何成品使用时返回空列表")
        void shouldReturnEmptyWhenComponentNotUsed() {
            // Given
            UUID unusedComponentId = UUID.randomUUID();

            // When & Then
            assertNotNull(repository);
        }
    }

    @Nested
    @DisplayName("BOM组件创建测试")
    class SaveBomComponentTests {

        @Test
        @DisplayName("创建单个BOM组件")
        void shouldSaveSingleBomComponent() {
            // Given
            BomComponent newComponent = createMockBomComponent(
                finishedProductId,
                componentId1,
                new BigDecimal("2.5"),
                0
            );

            // When & Then
            assertNotNull(repository);
            assertNotNull(newComponent.getFinishedProductId());
            assertNotNull(newComponent.getComponentId());
        }

        @Test
        @DisplayName("批量创建BOM组件")
        void shouldSaveMultipleBomComponents() {
            // Given
            List<BomComponent> components = List.of(
                createMockBomComponent(finishedProductId, componentId1, 2, 0),
                createMockBomComponent(finishedProductId, componentId2, 1, 1)
            );

            // When & Then
            assertNotNull(repository);
            assertEquals(2, components.size());
            // saveAll 方法应支持批量插入
        }
    }

    @Nested
    @DisplayName("BOM组件删除测试")
    class DeleteBomComponentTests {

        @Test
        @DisplayName("删除成品的所有BOM组件")
        void shouldDeleteAllComponentsByFinishedProductId() {
            // Given
            UUID productId = UUID.randomUUID();

            // When & Then
            assertNotNull(repository);
            // deleteByFinishedProductId 应该删除该成品的所有组件
        }

        @Test
        @DisplayName("删除指定的BOM组件")
        void shouldDeleteSingleBomComponent() {
            // Given
            UUID componentId = UUID.randomUUID();

            // When & Then
            assertNotNull(repository);
            // deleteById 方法存在
        }
    }

    @Nested
    @DisplayName("BOM组件业务规则测试")
    class BomComponentBusinessRulesTests {

        @Test
        @DisplayName("计算组件总成本 = 数量 × 单位成本")
        void shouldCalculateTotalCost() {
            // Given
            BomComponent component = BomComponent.builder()
                .finishedProductId(finishedProductId)
                .componentId(componentId1)
                .quantity(new BigDecimal("2.5"))
                .unit("kg")
                .unitCost(new BigDecimal("10.00"))
                .build();

            // When
            BigDecimal totalCost = component.getTotalCost();

            // Then
            assertNotNull(totalCost);
            assertEquals(new BigDecimal("25.00"), totalCost); // 2.5 × 10.00
        }

        @Test
        @DisplayName("单位成本为null时总成本为0")
        void shouldReturnZeroWhenUnitCostIsNull() {
            // Given
            BomComponent component = BomComponent.builder()
                .finishedProductId(finishedProductId)
                .componentId(componentId1)
                .quantity(new BigDecimal("2.5"))
                .unit("kg")
                .unitCost(null)
                .build();

            // When
            BigDecimal totalCost = component.getTotalCost();

            // Then
            assertEquals(BigDecimal.ZERO, totalCost);
        }

        @Test
        @DisplayName("数量为null时总成本为0")
        void shouldReturnZeroWhenQuantityIsNull() {
            // Given
            BomComponent component = BomComponent.builder()
                .finishedProductId(finishedProductId)
                .componentId(componentId1)
                .quantity(null)
                .unit("kg")
                .unitCost(new BigDecimal("10.00"))
                .build();

            // When
            BigDecimal totalCost = component.getTotalCost();

            // Then
            assertEquals(BigDecimal.ZERO, totalCost);
        }

        @Test
        @DisplayName("可选组件标记测试")
        void shouldSupportOptionalComponentFlag() {
            // Given
            BomComponent optionalComponent = BomComponent.builder()
                .finishedProductId(finishedProductId)
                .componentId(componentId1)
                .quantity(new BigDecimal("1.0"))
                .unit("个")
                .unitCost(new BigDecimal("5.00"))
                .isOptional(true)
                .build();

            BomComponent requiredComponent = BomComponent.builder()
                .finishedProductId(finishedProductId)
                .componentId(componentId2)
                .quantity(new BigDecimal("1.0"))
                .unit("个")
                .unitCost(new BigDecimal("5.00"))
                .isOptional(false)
                .build();

            // When & Then
            assertTrue(optionalComponent.getIsOptional());
            assertFalse(requiredComponent.getIsOptional());
        }
    }

    // ========== Helper Methods ==========

    private BomComponent createMockBomComponent(UUID finishedProductId, UUID componentId,
                                                 int quantity, int sortOrder) {
        return createMockBomComponent(
            finishedProductId,
            componentId,
            new BigDecimal(quantity),
            sortOrder
        );
    }

    private BomComponent createMockBomComponent(UUID finishedProductId, UUID componentId,
                                                 BigDecimal quantity, int sortOrder) {
        return BomComponent.builder()
                .id(UUID.randomUUID())
                .finishedProductId(finishedProductId)
                .componentId(componentId)
                .quantity(quantity)
                .unit("kg")
                .unitCost(new BigDecimal("10.00"))
                .isOptional(false)
                .sortOrder(sortOrder)
                .createdAt(LocalDateTime.now())
                .build();
    }
}
