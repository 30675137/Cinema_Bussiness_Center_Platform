package com.cinema.hallstore.service;

import com.cinema.hallstore.domain.Sku;
import com.cinema.hallstore.domain.enums.SkuStatus;
import com.cinema.hallstore.domain.enums.SkuType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * StoreScopeValidationService 单元测试
 * 验证门店范围验证逻辑的正确性
 *
 * @since P001-sku-master-data T014
 */
class StoreScopeValidationServiceTest {

    private StoreScopeValidationService service;

    @BeforeEach
    void setUp() {
        service = new StoreScopeValidationService();
    }

    @Nested
    @DisplayName("成品门店范围验证测试")
    class FinishedProductValidationTests {

        @Test
        @DisplayName("场景1: 全门店成品 + 全门店组件 = 验证通过")
        void shouldPassWhenAllStoresProductAndAllStoresComponents() {
            // Given
            Sku finishedProduct = createSku(SkuType.FINISHED_PRODUCT, new String[0]); // 全门店
            List<Sku> components = List.of(
                createSku(SkuType.RAW_MATERIAL, new String[0]),    // 全门店组件1
                createSku(SkuType.PACKAGING, new String[0])        // 全门店组件2
            );

            // When
            StoreScopeValidationService.ValidationResult result =
                service.validateForFinishedProduct(finishedProduct, components);

            // Then
            assertTrue(result.isValid());
            assertTrue(result.getErrors().isEmpty());
            assertTrue(result.getWarnings().isEmpty());
        }

        @Test
        @DisplayName("场景2: 全门店成品 + 部分门店组件 = 验证失败")
        void shouldFailWhenAllStoresProductHasLimitedStoreComponent() {
            // Given
            Sku finishedProduct = createSku(SkuType.FINISHED_PRODUCT, new String[0]); // 全门店
            Sku limitedComponent = createSku(SkuType.RAW_MATERIAL, new String[]{"store-1", "store-2"});
            limitedComponent.setName("限定组件A");
            List<Sku> components = List.of(limitedComponent);

            // When
            StoreScopeValidationService.ValidationResult result =
                service.validateForFinishedProduct(finishedProduct, components);

            // Then
            assertFalse(result.isValid());
            assertEquals(1, result.getErrors().size());
            assertTrue(result.getErrors().get(0).contains("限定组件A"));
            assertTrue(result.getErrors().get(0).contains("仅在部分门店可用"));
        }

        @Test
        @DisplayName("场景3: 特定门店成品 + 全门店组件 = 验证通过")
        void shouldPassWhenLimitedStoreProductHasAllStoresComponent() {
            // Given
            Sku finishedProduct = createSku(SkuType.FINISHED_PRODUCT, new String[]{"store-1"});
            List<Sku> components = List.of(
                createSku(SkuType.RAW_MATERIAL, new String[0])  // 全门店组件
            );

            // When
            StoreScopeValidationService.ValidationResult result =
                service.validateForFinishedProduct(finishedProduct, components);

            // Then
            assertTrue(result.isValid());
        }

        @Test
        @DisplayName("场景4: 特定门店成品 + 完全匹配门店的组件 = 验证通过")
        void shouldPassWhenStoresCompletelyMatch() {
            // Given
            Sku finishedProduct = createSku(SkuType.FINISHED_PRODUCT, new String[]{"store-1", "store-2"});
            List<Sku> components = List.of(
                createSku(SkuType.RAW_MATERIAL, new String[]{"store-1", "store-2"}),
                createSku(SkuType.PACKAGING, new String[]{"store-1", "store-2"})
            );

            // When
            StoreScopeValidationService.ValidationResult result =
                service.validateForFinishedProduct(finishedProduct, components);

            // Then
            assertTrue(result.isValid());
            assertTrue(result.getWarnings().isEmpty());
        }

        @Test
        @DisplayName("场景5: 特定门店成品 + 门店无交集的组件 = 验证失败")
        void shouldFailWhenNoStoreIntersection() {
            // Given
            Sku finishedProduct = createSku(SkuType.FINISHED_PRODUCT, new String[]{"store-1", "store-2"});
            Sku component = createSku(SkuType.RAW_MATERIAL, new String[]{"store-3", "store-4"});
            component.setName("不兼容组件");
            List<Sku> components = List.of(component);

            // When
            StoreScopeValidationService.ValidationResult result =
                service.validateForFinishedProduct(finishedProduct, components);

            // Then
            assertFalse(result.isValid());
            assertEquals(1, result.getErrors().size());
            assertTrue(result.getErrors().get(0).contains("不兼容组件"));
            assertTrue(result.getErrors().get(0).contains("不可用"));
        }

        @Test
        @DisplayName("场景6: 特定门店成品 + 部分门店有交集的组件 = 验证通过但有警告")
        void shouldPassWithWarningWhenPartialIntersection() {
            // Given
            Sku finishedProduct = createSku(SkuType.FINISHED_PRODUCT, new String[]{"store-1", "store-2", "store-3"});
            Sku component = createSku(SkuType.RAW_MATERIAL, new String[]{"store-1", "store-2"}); // 缺少 store-3
            component.setName("部分可用组件");
            List<Sku> components = List.of(component);

            // When
            StoreScopeValidationService.ValidationResult result =
                service.validateForFinishedProduct(finishedProduct, components);

            // Then
            assertTrue(result.isValid());  // 有交集，验证通过
            assertTrue(result.hasWarnings());
            assertEquals(1, result.getWarnings().size());
            assertTrue(result.getWarnings().get(0).contains("部分可用组件"));
            assertTrue(result.getWarnings().get(0).contains("store-3")); // 应该提示 store-3 不可用
        }

        @Test
        @DisplayName("场景7: 成品没有BOM配置 = 验证失败")
        void shouldFailWhenNoBomComponents() {
            // Given
            Sku finishedProduct = createSku(SkuType.FINISHED_PRODUCT, new String[0]);
            List<Sku> emptyComponents = List.of();

            // When
            StoreScopeValidationService.ValidationResult result =
                service.validateForFinishedProduct(finishedProduct, emptyComponents);

            // Then
            assertFalse(result.isValid());
            assertEquals(1, result.getErrors().size());
            assertTrue(result.getErrors().get(0).contains("必须配置BOM组件"));
        }

        @Test
        @DisplayName("场景8: 多个组件混合验证")
        void shouldValidateMultipleComponentsCorrectly() {
            // Given
            Sku finishedProduct = createSku(SkuType.FINISHED_PRODUCT, new String[]{"store-1", "store-2"});

            Sku allStoreComponent = createSku(SkuType.RAW_MATERIAL, new String[0]);
            allStoreComponent.setName("全门店组件");

            Sku matchingComponent = createSku(SkuType.PACKAGING, new String[]{"store-1", "store-2"});
            matchingComponent.setName("匹配组件");

            Sku partialComponent = createSku(SkuType.RAW_MATERIAL, new String[]{"store-1"});
            partialComponent.setName("部分匹配组件");

            List<Sku> components = List.of(allStoreComponent, matchingComponent, partialComponent);

            // When
            StoreScopeValidationService.ValidationResult result =
                service.validateForFinishedProduct(finishedProduct, components);

            // Then
            assertTrue(result.isValid());
            assertTrue(result.hasWarnings());
            // 应该只对 partialComponent 有警告
            assertEquals(1, result.getWarnings().size());
            assertTrue(result.getWarnings().get(0).contains("部分匹配组件"));
        }
    }

    @Nested
    @DisplayName("套餐门店范围验证测试")
    class ComboValidationTests {

        @Test
        @DisplayName("套餐验证逻辑与成品相同")
        void shouldValidateComboLikeFinishedProduct() {
            // Given
            Sku combo = createSku(SkuType.COMBO, new String[]{"store-1"});
            List<Sku> subItems = List.of(
                createSku(SkuType.FINISHED_PRODUCT, new String[]{"store-1"})
            );

            // When
            StoreScopeValidationService.ValidationResult result =
                service.validateForCombo(combo, subItems);

            // Then
            assertTrue(result.isValid());
        }

        @Test
        @DisplayName("全门店套餐 + 部分门店子项 = 验证失败")
        void shouldFailWhenAllStoresComboHasLimitedSubItem() {
            // Given
            Sku combo = createSku(SkuType.COMBO, new String[0]);
            Sku limitedSubItem = createSku(SkuType.FINISHED_PRODUCT, new String[]{"store-1"});
            limitedSubItem.setName("限定子项");
            List<Sku> subItems = List.of(limitedSubItem);

            // When
            StoreScopeValidationService.ValidationResult result =
                service.validateForCombo(combo, subItems);

            // Then
            assertFalse(result.isValid());
            assertTrue(result.getErrors().get(0).contains("限定子项"));
        }

        @Test
        @DisplayName("特定门店套餐 + 门店完全匹配的子项 = 验证通过")
        void shouldPassWhenComboAndSubItemStoresMatch() {
            // Given
            Sku combo = createSku(SkuType.COMBO, new String[]{"store-1", "store-2"});
            List<Sku> subItems = List.of(
                createSku(SkuType.FINISHED_PRODUCT, new String[]{"store-1", "store-2"}),
                createSku(SkuType.RAW_MATERIAL, new String[]{"store-1", "store-2"})
            );

            // When
            StoreScopeValidationService.ValidationResult result =
                service.validateForCombo(combo, subItems);

            // Then
            assertTrue(result.isValid());
            assertFalse(result.hasWarnings());
        }
    }

    @Nested
    @DisplayName("ValidationResult 行为测试")
    class ValidationResultTests {

        @Test
        @DisplayName("ValidationResult 初始状态")
        void shouldHaveCorrectInitialState() {
            // Given & When
            StoreScopeValidationService.ValidationResult result =
                new StoreScopeValidationService.ValidationResult();

            // Then
            assertTrue(result.isValid());
            assertTrue(result.getErrors().isEmpty());
            assertTrue(result.getWarnings().isEmpty());
            assertFalse(result.hasWarnings());
        }

        @Test
        @DisplayName("添加错误后 isValid 返回 false")
        void shouldBeInvalidAfterAddingError() {
            // Given
            StoreScopeValidationService.ValidationResult result =
                new StoreScopeValidationService.ValidationResult();

            // When
            result.addError("测试错误");

            // Then
            assertFalse(result.isValid());
            assertEquals(1, result.getErrors().size());
        }

        @Test
        @DisplayName("添加警告不影响 isValid")
        void shouldStayValidAfterAddingWarning() {
            // Given
            StoreScopeValidationService.ValidationResult result =
                new StoreScopeValidationService.ValidationResult();

            // When
            result.addWarning("测试警告");

            // Then
            assertTrue(result.isValid());
            assertTrue(result.hasWarnings());
            assertEquals(1, result.getWarnings().size());
        }

        @Test
        @DisplayName("支持多个错误和警告")
        void shouldSupportMultipleErrorsAndWarnings() {
            // Given
            StoreScopeValidationService.ValidationResult result =
                new StoreScopeValidationService.ValidationResult();

            // When
            result.addError("错误1");
            result.addError("错误2");
            result.addWarning("警告1");
            result.addWarning("警告2");

            // Then
            assertFalse(result.isValid());
            assertEquals(2, result.getErrors().size());
            assertEquals(2, result.getWarnings().size());
        }
    }

    @Nested
    @DisplayName("边界条件测试")
    class EdgeCasesTests {

        @Test
        @DisplayName("null 组件列表应该被验证为错误")
        void shouldHandleNullComponentsList() {
            // Given
            Sku finishedProduct = createSku(SkuType.FINISHED_PRODUCT, new String[0]);
            List<Sku> nullComponents = null;

            // When
            StoreScopeValidationService.ValidationResult result =
                service.validateForFinishedProduct(finishedProduct, nullComponents);

            // Then
            assertFalse(result.isValid());
        }

        @Test
        @DisplayName("大量门店范围验证性能测试")
        void shouldHandleLargeStoreScope() {
            // Given
            String[] largeStoreScope = new String[100];
            for (int i = 0; i < 100; i++) {
                largeStoreScope[i] = "store-" + i;
            }

            Sku finishedProduct = createSku(SkuType.FINISHED_PRODUCT, largeStoreScope);
            List<Sku> components = List.of(
                createSku(SkuType.RAW_MATERIAL, largeStoreScope)
            );

            // When
            long startTime = System.currentTimeMillis();
            StoreScopeValidationService.ValidationResult result =
                service.validateForFinishedProduct(finishedProduct, components);
            long endTime = System.currentTimeMillis();

            // Then
            assertTrue(result.isValid());
            assertTrue((endTime - startTime) < 1000); // 应该在1秒内完成
        }

        @Test
        @DisplayName("门店ID包含特殊字符")
        void shouldHandleSpecialCharactersInStoreId() {
            // Given
            Sku finishedProduct = createSku(SkuType.FINISHED_PRODUCT,
                new String[]{"store-北京-1", "store_上海_2"});
            List<Sku> components = List.of(
                createSku(SkuType.RAW_MATERIAL, new String[]{"store-北京-1", "store_上海_2"})
            );

            // When
            StoreScopeValidationService.ValidationResult result =
                service.validateForFinishedProduct(finishedProduct, components);

            // Then
            assertTrue(result.isValid());
        }
    }

    // ========== Helper Methods ==========

    private Sku createSku(SkuType type, String[] storeScope) {
        return Sku.builder()
                .id(UUID.randomUUID())
                .code("SKU-" + UUID.randomUUID().toString().substring(0, 8))
                .name("测试SKU")
                .spuId(UUID.randomUUID())
                .skuType(type)
                .mainUnit("个")
                .storeScope(storeScope)
                .standardCost(new BigDecimal("100.00"))
                .status(SkuStatus.ENABLED)
                .build();
    }
}
