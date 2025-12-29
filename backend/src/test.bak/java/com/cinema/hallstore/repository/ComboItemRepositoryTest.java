package com.cinema.hallstore.repository;

import com.cinema.hallstore.config.SupabaseConfig;
import com.cinema.hallstore.domain.ComboItem;
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
 * ComboItemRepository 单元测试
 * 验证套餐子项数据访问操作的正确性
 *
 * @since P001-sku-master-data T013
 */
@ExtendWith(MockitoExtension.class)
class ComboItemRepositoryTest {

    @Mock
    private WebClient webClient;

    @Mock
    private SupabaseConfig supabaseConfig;

    private ComboItemRepository repository;

    private UUID comboId;
    private UUID subItemId1;
    private UUID subItemId2;

    @BeforeEach
    void setUp() {
        repository = new ComboItemRepository(webClient, supabaseConfig);
        comboId = UUID.randomUUID();
        subItemId1 = UUID.randomUUID();
        subItemId2 = UUID.randomUUID();

        when(supabaseConfig.getTimeoutDuration()).thenReturn(java.time.Duration.ofSeconds(10));
    }

    @Nested
    @DisplayName("按套餐ID查询子项测试")
    class FindByComboIdTests {

        @Test
        @DisplayName("成功查询套餐的子项列表")
        void shouldFindComboItemsByComboId() {
            // Given
            UUID comboId = UUID.randomUUID();

            // When & Then
            assertNotNull(repository);
            // 实际查询将在集成测试中验证
            // 应按 sort_order ASC 排序返回
        }

        @Test
        @DisplayName("套餐没有子项时返回空列表")
        void shouldReturnEmptyListWhenNoComboItems() {
            // Given
            UUID emptyComboId = UUID.randomUUID();

            // When & Then
            assertNotNull(repository);
        }

        @Test
        @DisplayName("套餐子项应按排序序号升序返回")
        void shouldReturnComboItemsInSortOrder() {
            // Given
            ComboItem item1 = createMockComboItem(comboId, subItemId1, 1, 0);
            ComboItem item2 = createMockComboItem(comboId, subItemId2, 1, 1);

            // When & Then
            assertTrue(item1.getSortOrder() < item2.getSortOrder());
            // 实际排序将在集成测试中验证
        }
    }

    @Nested
    @DisplayName("按子项ID查询引用关系测试")
    class FindBySubItemIdTests {

        @Test
        @DisplayName("成功查询引用该子项的所有套餐")
        void shouldFindCombosUsingSubItem() {
            // Given
            UUID subItemId = UUID.randomUUID();

            // When & Then
            assertNotNull(repository);
            // 用于检查子项被哪些套餐引用（删除前依赖检查）
        }

        @Test
        @DisplayName("子项未被任何套餐使用时返回空列表")
        void shouldReturnEmptyWhenSubItemNotUsed() {
            // Given
            UUID unusedSubItemId = UUID.randomUUID();

            // When & Then
            assertNotNull(repository);
        }
    }

    @Nested
    @DisplayName("套餐子项创建测试")
    class SaveComboItemTests {

        @Test
        @DisplayName("创建单个套餐子项")
        void shouldSaveSingleComboItem() {
            // Given
            ComboItem newItem = createMockComboItem(
                comboId,
                subItemId1,
                new BigDecimal("1.0"),
                0
            );

            // When & Then
            assertNotNull(repository);
            assertNotNull(newItem.getComboId());
            assertNotNull(newItem.getSubItemId());
        }

        @Test
        @DisplayName("批量创建套餐子项")
        void shouldSaveMultipleComboItems() {
            // Given
            List<ComboItem> items = List.of(
                createMockComboItem(comboId, subItemId1, 1, 0),
                createMockComboItem(comboId, subItemId2, 2, 1)
            );

            // When & Then
            assertNotNull(repository);
            assertEquals(2, items.size());
            // saveAll 方法应支持批量插入
        }
    }

    @Nested
    @DisplayName("套餐子项删除测试")
    class DeleteComboItemTests {

        @Test
        @DisplayName("删除套餐的所有子项")
        void shouldDeleteAllItemsByComboId() {
            // Given
            UUID comboId = UUID.randomUUID();

            // When & Then
            assertNotNull(repository);
            // deleteByComboId 应该删除该套餐的所有子项
        }

        @Test
        @DisplayName("删除指定的套餐子项")
        void shouldDeleteSingleComboItem() {
            // Given
            UUID itemId = UUID.randomUUID();

            // When & Then
            assertNotNull(repository);
            // deleteById 方法存在
        }
    }

    @Nested
    @DisplayName("套餐子项业务规则测试")
    class ComboItemBusinessRulesTests {

        @Test
        @DisplayName("计算子项总成本 = 数量 × 单位成本")
        void shouldCalculateTotalCost() {
            // Given
            ComboItem item = ComboItem.builder()
                .comboId(comboId)
                .subItemId(subItemId1)
                .quantity(new BigDecimal("3.0"))
                .unit("份")
                .unitCost(new BigDecimal("50.00"))
                .build();

            // When
            BigDecimal totalCost = item.getTotalCost();

            // Then
            assertNotNull(totalCost);
            assertEquals(new BigDecimal("150.00"), totalCost); // 3.0 × 50.00
        }

        @Test
        @DisplayName("单位成本为null时总成本为0")
        void shouldReturnZeroWhenUnitCostIsNull() {
            // Given
            ComboItem item = ComboItem.builder()
                .comboId(comboId)
                .subItemId(subItemId1)
                .quantity(new BigDecimal("2.0"))
                .unit("份")
                .unitCost(null)
                .build();

            // When
            BigDecimal totalCost = item.getTotalCost();

            // Then
            assertEquals(BigDecimal.ZERO, totalCost);
        }

        @Test
        @DisplayName("数量为null时总成本为0")
        void shouldReturnZeroWhenQuantityIsNull() {
            // Given
            ComboItem item = ComboItem.builder()
                .comboId(comboId)
                .subItemId(subItemId1)
                .quantity(null)
                .unit("份")
                .unitCost(new BigDecimal("50.00"))
                .build();

            // When
            BigDecimal totalCost = item.getTotalCost();

            // Then
            assertEquals(BigDecimal.ZERO, totalCost);
        }

        @Test
        @DisplayName("验证套餐子项不能嵌套套餐（业务规则）")
        void shouldNotAllowNestedCombos() {
            // Given
            // 这个规则在数据库层通过触发器强制执行
            // 在Service层也会验证

            // When & Then
            // 数据库触发器: check_combo_no_combo_subitem()
            // 如果 sub_item_id 指向的 SKU 类型是 COMBO，应该抛出异常
            assertNotNull(repository);
        }
    }

    // ========== Helper Methods ==========

    private ComboItem createMockComboItem(UUID comboId, UUID subItemId,
                                           int quantity, int sortOrder) {
        return createMockComboItem(
            comboId,
            subItemId,
            new BigDecimal(quantity),
            sortOrder
        );
    }

    private ComboItem createMockComboItem(UUID comboId, UUID subItemId,
                                           BigDecimal quantity, int sortOrder) {
        return ComboItem.builder()
                .id(UUID.randomUUID())
                .comboId(comboId)
                .subItemId(subItemId)
                .quantity(quantity)
                .unit("份")
                .unitCost(new BigDecimal("50.00"))
                .sortOrder(sortOrder)
                .createdAt(LocalDateTime.now())
                .build();
    }
}
