/**
 * @spec N004-procurement-material-selector
 * PurchaseOrderItemEntity unit tests
 */
package com.cinema.procurement.entity;

import com.cinema.hallstore.domain.Sku;
import com.cinema.material.entity.Material;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for PurchaseOrderItemEntity validation logic.
 *
 * <p>Tests the N004 requirement: mutual exclusivity of material_id and sku_id.
 */
@DisplayName("PurchaseOrderItemEntity")
class PurchaseOrderItemEntityTest {

    private PurchaseOrderItemEntity item;
    private Material testMaterial;
    private Sku testSku;

    @BeforeEach
    void setUp() {
        item = new PurchaseOrderItemEntity();
        item.setQuantity(BigDecimal.TEN);
        item.setUnitPrice(BigDecimal.valueOf(50));

        // Create test Material
        testMaterial = new Material();
        testMaterial.setId(UUID.randomUUID());
        testMaterial.setCode("MAT-RAW-001");
        testMaterial.setName("可乐糖浆");

        // Create test SKU
        testSku = new Sku();
        testSku.setId(UUID.randomUUID());
        testSku.setName("可口可乐中杯");
    }

    @Nested
    @DisplayName("Mutual Exclusivity Validation")
    class MutualExclusivityTests {

        @Test
        @DisplayName("Should allow Material item (itemType=MATERIAL, material set, sku null)")
        void shouldAllowMaterialItem() {
            // Given
            item.setItemType(ItemType.MATERIAL);
            item.setMaterial(testMaterial);
            item.setSku(null);

            // When & Then - No exception thrown
            assertDoesNotThrow(() -> {
                // Simulate @PrePersist
                invokeOnCreate(item);
            });

            // Verify material_name is auto-populated
            assertEquals("可乐糖浆", item.getMaterialName());
        }

        @Test
        @DisplayName("Should allow SKU item (itemType=SKU, sku set, material null)")
        void shouldAllowSkuItem() {
            // Given
            item.setItemType(ItemType.SKU);
            item.setSku(testSku);
            item.setMaterial(null);

            // When & Then - No exception thrown
            assertDoesNotThrow(() -> {
                invokeOnCreate(item);
            });

            // Verify material_name is NOT set for SKU items
            assertNull(item.getMaterialName());
        }

        @Test
        @DisplayName("Should reject when both material and sku are set")
        void shouldRejectBothMaterialAndSku() {
            // Given
            item.setItemType(ItemType.MATERIAL);
            item.setMaterial(testMaterial);
            item.setSku(testSku);

            // When & Then
            IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
                invokeOnCreate(item);
            });

            assertTrue(exception.getMessage().contains("mutually exclusive"));
        }

        @Test
        @DisplayName("Should reject when neither material nor sku is set")
        void shouldRejectNeitherMaterialNorSku() {
            // Given
            item.setItemType(ItemType.MATERIAL);
            item.setMaterial(null);
            item.setSku(null);

            // When & Then
            IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
                invokeOnCreate(item);
            });

            assertTrue(exception.getMessage().contains("both are null"));
        }

        @Test
        @DisplayName("Should reject MATERIAL type with only sku set")
        void shouldRejectMaterialTypeWithSkuOnly() {
            // Given
            item.setItemType(ItemType.MATERIAL);
            item.setMaterial(null);
            item.setSku(testSku);

            // When & Then
            IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
                invokeOnCreate(item);
            });

            // Expect type mismatch error (MATERIAL type but material_id is null)
            assertTrue(exception.getMessage().contains("material_id is null"));
        }

        @Test
        @DisplayName("Should reject SKU type with only material set")
        void shouldRejectSkuTypeWithMaterialOnly() {
            // Given
            item.setItemType(ItemType.SKU);
            item.setMaterial(testMaterial);
            item.setSku(null);

            // When & Then
            IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
                invokeOnCreate(item);
            });

            // Expect type mismatch error (SKU type but sku_id is null)
            assertTrue(exception.getMessage().contains("sku_id is null"));
        }
    }

    @Nested
    @DisplayName("Material Name Auto-Population")
    class MaterialNameAutoPopulationTests {

        @Test
        @DisplayName("Should auto-populate material_name on create for Material items")
        void shouldAutoPopulateMaterialNameOnCreate() {
            // Given
            item.setItemType(ItemType.MATERIAL);
            item.setMaterial(testMaterial);

            // When
            invokeOnCreate(item);

            // Then
            assertEquals("可乐糖浆", item.getMaterialName());
        }

        @Test
        @DisplayName("Should update material_name on update if material changed")
        void shouldUpdateMaterialNameOnUpdate() {
            // Given - Initial state
            item.setItemType(ItemType.MATERIAL);
            item.setMaterial(testMaterial);
            invokeOnCreate(item);
            assertEquals("可乐糖浆", item.getMaterialName());

            // When - Change material
            Material newMaterial = new Material();
            newMaterial.setId(UUID.randomUUID());
            newMaterial.setName("冰淇淋浆料");
            item.setMaterial(newMaterial);
            invokeOnUpdate(item);

            // Then
            assertEquals("冰淇淋浆料", item.getMaterialName());
        }

        @Test
        @DisplayName("Should NOT populate material_name for SKU items")
        void shouldNotPopulateMaterialNameForSkuItems() {
            // Given
            item.setItemType(ItemType.SKU);
            item.setSku(testSku);

            // When
            invokeOnCreate(item);

            // Then
            assertNull(item.getMaterialName());
        }
    }

    @Nested
    @DisplayName("Line Amount Calculation")
    class LineAmountCalculationTests {

        @Test
        @DisplayName("Should calculate line amount = quantity * unitPrice")
        void shouldCalculateLineAmount() {
            // Given
            item.setItemType(ItemType.SKU);
            item.setSku(testSku);
            item.setQuantity(BigDecimal.valueOf(10));
            item.setUnitPrice(BigDecimal.valueOf(50));

            // When
            invokeOnCreate(item);

            // Then
            assertEquals(BigDecimal.valueOf(500), item.getLineAmount());
        }
    }

    /**
     * Helper method to invoke the @PrePersist callback.
     * Uses reflection to call the protected method.
     */
    private void invokeOnCreate(PurchaseOrderItemEntity entity) {
        try {
            var method = PurchaseOrderItemEntity.class.getDeclaredMethod("onCreate");
            method.setAccessible(true);
            method.invoke(entity);
        } catch (Exception e) {
            if (e.getCause() instanceof IllegalStateException) {
                throw (IllegalStateException) e.getCause();
            }
            throw new RuntimeException(e);
        }
    }

    /**
     * Helper method to invoke the @PreUpdate callback.
     * Uses reflection to call the protected method.
     */
    private void invokeOnUpdate(PurchaseOrderItemEntity entity) {
        try {
            var method = PurchaseOrderItemEntity.class.getDeclaredMethod("onUpdate");
            method.setAccessible(true);
            method.invoke(entity);
        } catch (Exception e) {
            if (e.getCause() instanceof IllegalStateException) {
                throw (IllegalStateException) e.getCause();
            }
            throw new RuntimeException(e);
        }
    }
}
