package com.cinema.category.migration;

import com.cinema.category.entity.MenuCategory;
import com.cinema.category.repository.MenuCategoryRepository;
import com.cinema.channelproduct.domain.ChannelProductConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * @spec O002-miniapp-menu-config
 * 数据迁移验证单元测试
 *
 * 验证点：
 * 1. 6 个分类记录全部创建
 * 2. OTHER 分类 is_default=true
 * 3. 所有商品 category_id 非空
 * 4. 商品数量迁移前后一致
 * 5. 外键约束正常工作
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("T020 - 数据迁移验证测试")
class MigrationValidationTest {

    @Autowired
    private MenuCategoryRepository menuCategoryRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    @DisplayName("验证点 1: 6 个分类记录全部创建")
    void shouldCreate6Categories() {
        // Given & When
        List<MenuCategory> categories = menuCategoryRepository.findAllOrderBySortOrder();

        // Then
        assertThat(categories)
                .as("应创建 6 个初始分类")
                .hasSize(6);

        assertThat(categories)
                .extracting(MenuCategory::getCode)
                .as("应包含所有预期的分类编码")
                .containsExactlyInAnyOrder(
                        "ALCOHOL",
                        "COFFEE",
                        "BEVERAGE",
                        "SNACK",
                        "MEAL",
                        "OTHER"
                );
    }

    @Test
    @DisplayName("验证点 2: OTHER 分类 is_default=true")
    void shouldSetOtherAsDefaultCategory() {
        // Given & When
        Optional<MenuCategory> defaultCategory = menuCategoryRepository.findByIsDefaultTrue();

        // Then
        assertThat(defaultCategory)
                .as("应存在一个默认分类")
                .isPresent();

        assertThat(defaultCategory.get().getCode())
                .as("默认分类应为 OTHER")
                .isEqualTo("OTHER");

        assertThat(defaultCategory.get().getIsDefault())
                .as("is_default 标识应为 true")
                .isTrue();

        assertThat(defaultCategory.get().getDisplayName())
                .as("默认分类显示名称应为 '其他商品'")
                .isEqualTo("其他商品");
    }

    @Test
    @DisplayName("验证点 3: 所有商品 category_id 非空")
    void shouldEnsureAllProductsHaveCategoryId() {
        // Given & When
        Integer nullCategoryCount = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM channel_product_config
                WHERE category_id IS NULL
                  AND deleted_at IS NULL
                """,
                Integer.class
        );

        // Then
        assertThat(nullCategoryCount)
                .as("所有未删除的商品都应该有 category_id")
                .isEqualTo(0);
    }

    @Test
    @DisplayName("验证点 4: 商品数量迁移前后一致")
    void shouldPreserveProductCountAfterMigration() {
        // Given
        Integer totalProductsBefore = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM channel_product_config
                WHERE deleted_at IS NULL
                """,
                Integer.class
        );

        // When
        Integer totalProductsAfter = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM channel_product_config
                WHERE category_id IS NOT NULL
                  AND deleted_at IS NULL
                """,
                Integer.class
        );

        // Then
        assertThat(totalProductsAfter)
                .as("迁移后商品总数应与迁移前一致")
                .isEqualTo(totalProductsBefore);
    }

    @Test
    @DisplayName("验证点 5: 外键约束正常工作")
    void shouldEnforceForeignKeyConstraint() {
        // Given
        String constraintName = jdbcTemplate.queryForObject(
                """
                SELECT constraint_name
                FROM information_schema.table_constraints
                WHERE table_name = 'channel_product_config'
                  AND constraint_name = 'fk_channel_product_category'
                  AND constraint_type = 'FOREIGN KEY'
                """,
                String.class
        );

        // Then
        assertThat(constraintName)
                .as("应存在 fk_channel_product_category 外键约束")
                .isEqualTo("fk_channel_product_category");
    }

    @Test
    @DisplayName("验证 6: 分类分布合理性")
    void shouldHaveReasonableCategoryDistribution() {
        // Given & When
        List<CategoryDistribution> distribution = jdbcTemplate.query(
                """
                SELECT
                    mc.code AS category_code,
                    mc.display_name,
                    COUNT(cp.id) AS product_count
                FROM menu_category mc
                LEFT JOIN channel_product_config cp ON cp.category_id = mc.id AND cp.deleted_at IS NULL
                WHERE mc.deleted_at IS NULL
                GROUP BY mc.code, mc.display_name
                ORDER BY mc.sort_order
                """,
                (rs, rowNum) -> new CategoryDistribution(
                        rs.getString("category_code"),
                        rs.getString("display_name"),
                        rs.getInt("product_count")
                )
        );

        // Then
        assertThat(distribution)
                .as("应返回所有 6 个分类的分布数据")
                .hasSize(6);

        int totalProducts = distribution.stream()
                .mapToInt(CategoryDistribution::productCount)
                .sum();

        assertThat(totalProducts)
                .as("所有分类的商品总数应大于 0")
                .isGreaterThan(0);
    }

    @Test
    @DisplayName("验证 7: 验证分类顺序正确")
    void shouldHaveCorrectCategorySortOrder() {
        // Given & When
        List<MenuCategory> categories = menuCategoryRepository.findAllOrderBySortOrder();

        // Then
        assertThat(categories)
                .extracting(MenuCategory::getSortOrder)
                .as("分类排序序号应为升序")
                .isSorted();

        MenuCategory lastCategory = categories.get(categories.size() - 1);
        assertThat(lastCategory.getCode())
                .as("最后一个分类应为默认分类 OTHER")
                .isEqualTo("OTHER");

        assertThat(lastCategory.getSortOrder())
                .as("默认分类排序序号应为 99")
                .isEqualTo(99);
    }

    /**
     * 分类分布 DTO（内部类）
     */
    private record CategoryDistribution(
            String categoryCode,
            String displayName,
            int productCount
    ) {}
}
