package com.cinema.inventory.service;

import com.cinema.inventory.domain.InventoryAdjustment;
import com.cinema.inventory.domain.StoreInventory;
import com.cinema.inventory.domain.enums.AdjustmentStatus;
import com.cinema.inventory.domain.enums.AdjustmentType;
import com.cinema.inventory.dto.AdjustmentRequest;
import com.cinema.inventory.dto.AdjustmentResponse;
import com.cinema.inventory.exception.InsufficientInventoryException;
import com.cinema.inventory.exception.ResourceNotFoundException;
import com.cinema.inventory.repository.AdjustmentRepository;
import com.cinema.inventory.repository.StoreInventoryRepository;
import com.cinema.inventory.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * @spec P004-inventory-adjustment
 * T017 [US1] Backend service test for InventoryAdjustmentService
 *
 * Tests the inventory adjustment service layer logic:
 * 1. Create adjustment with automatic approval (amount < threshold)
 * 2. Create adjustment requiring approval (amount >= threshold)
 * 3. Calculate adjustment amount correctly
 * 4. Update inventory immediately for small adjustments
 * 5. Do NOT update inventory for large adjustments pending approval
 * 6. Handle insufficient inventory for shortage adjustments
 * 7. Generate transaction records for approved adjustments
 */
@ExtendWith(MockitoExtension.class)
class InventoryAdjustmentServiceTest {

    @Mock
    private AdjustmentRepository adjustmentRepository;

    @Mock
    private StoreInventoryRepository inventoryRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private InventoryAdjustmentService service;

    private UUID testSkuId;
    private UUID testStoreId;
    private UUID testInventoryId;
    private StoreInventory testInventory;
    private static final BigDecimal APPROVAL_THRESHOLD = new BigDecimal("1000.00");

    @BeforeEach
    void setUp() {
        testSkuId = UUID.randomUUID();
        testStoreId = UUID.randomUUID();
        testInventoryId = UUID.randomUUID();

        testInventory = createMockInventory(
            testInventoryId,
            testSkuId,
            testStoreId,
            100, // on hand quantity
            80,  // available quantity
            20,  // reserved quantity
            new BigDecimal("50.00") // unit price
        );
    }

    @Nested
    @DisplayName("创建调整测试")
    class CreateAdjustmentTests {

        @Test
        @DisplayName("成功创建小额调整（自动审批）")
        void shouldCreateSmallAdjustmentWithAutoApproval() {
            // Given - small adjustment (50 * 10 = 500 < 1000)
            AdjustmentRequest request = createAdjustmentRequest(
                testSkuId,
                testStoreId,
                AdjustmentType.SURPLUS,
                10,
                "STOCK_DIFF",
                "盘点发现多余"
            );

            when(inventoryRepository.findBySkuIdAndStoreId(testSkuId, testStoreId))
                .thenReturn(Optional.of(testInventory));
            when(adjustmentRepository.save(any(InventoryAdjustment.class)))
                .thenAnswer(invocation -> {
                    InventoryAdjustment adj = invocation.getArgument(0);
                    adj.setId(UUID.randomUUID());
                    adj.setAdjustmentNumber(generateAdjustmentNumber());
                    return adj;
                });

            // When
            AdjustmentResponse response = service.createAdjustment(request, "user-001", "测试用户");

            // Then
            assertNotNull(response);
            assertEquals(AdjustmentStatus.APPROVED, response.getStatus());
            assertFalse(response.getRequiresApproval());
            assertEquals(10, response.getQuantity());
            assertEquals(100, response.getStockBefore());
            assertEquals(110, response.getStockAfter());
            assertEquals(new BigDecimal("500.00"), response.getAdjustmentAmount());

            // Verify inventory was updated
            ArgumentCaptor<StoreInventory> inventoryCaptor = ArgumentCaptor.forClass(StoreInventory.class);
            verify(inventoryRepository).save(inventoryCaptor.capture());
            assertEquals(110, inventoryCaptor.getValue().getOnHandQty());
            assertEquals(90, inventoryCaptor.getValue().getAvailableQty());

            // Verify transaction was created
            verify(transactionRepository).save(any());
        }

        @Test
        @DisplayName("创建大额调整（需要审批）")
        void shouldCreateLargeAdjustmentRequiringApproval() {
            // Given - large adjustment (50 * 20 = 1000 >= threshold)
            AdjustmentRequest request = createAdjustmentRequest(
                testSkuId,
                testStoreId,
                AdjustmentType.SURPLUS,
                20,
                "STOCK_DIFF",
                "盘点发现多余"
            );

            when(inventoryRepository.findBySkuIdAndStoreId(testSkuId, testStoreId))
                .thenReturn(Optional.of(testInventory));
            when(adjustmentRepository.save(any(InventoryAdjustment.class)))
                .thenAnswer(invocation -> {
                    InventoryAdjustment adj = invocation.getArgument(0);
                    adj.setId(UUID.randomUUID());
                    adj.setAdjustmentNumber(generateAdjustmentNumber());
                    return adj;
                });

            // When
            AdjustmentResponse response = service.createAdjustment(request, "user-001", "测试用户");

            // Then
            assertNotNull(response);
            assertEquals(AdjustmentStatus.PENDING_APPROVAL, response.getStatus());
            assertTrue(response.getRequiresApproval());
            assertEquals(new BigDecimal("1000.00"), response.getAdjustmentAmount());

            // Verify inventory was NOT updated
            verify(inventoryRepository, never()).save(any(StoreInventory.class));

            // Verify transaction was NOT created
            verify(transactionRepository, never()).save(any());
        }

        @Test
        @DisplayName("盘亏调整应减少库存")
        void shouldDecreaseInventoryForShortageAdjustment() {
            // Given - shortage adjustment
            AdjustmentRequest request = createAdjustmentRequest(
                testSkuId,
                testStoreId,
                AdjustmentType.SHORTAGE,
                10,
                "STOCK_DIFF",
                "盘点发现缺失"
            );

            when(inventoryRepository.findBySkuIdAndStoreId(testSkuId, testStoreId))
                .thenReturn(Optional.of(testInventory));
            when(adjustmentRepository.save(any(InventoryAdjustment.class)))
                .thenAnswer(invocation -> {
                    InventoryAdjustment adj = invocation.getArgument(0);
                    adj.setId(UUID.randomUUID());
                    adj.setAdjustmentNumber(generateAdjustmentNumber());
                    return adj;
                });

            // When
            AdjustmentResponse response = service.createAdjustment(request, "user-001", "测试用户");

            // Then
            assertEquals(100, response.getStockBefore());
            assertEquals(90, response.getStockAfter());

            // Verify inventory was decreased
            ArgumentCaptor<StoreInventory> inventoryCaptor = ArgumentCaptor.forClass(StoreInventory.class);
            verify(inventoryRepository).save(inventoryCaptor.capture());
            assertEquals(90, inventoryCaptor.getValue().getOnHandQty());
            assertEquals(70, inventoryCaptor.getValue().getAvailableQty());
        }

        @Test
        @DisplayName("报损调整应减少库存并标记为损坏")
        void shouldDecreaseInventoryForDamageAdjustment() {
            // Given - damage adjustment
            AdjustmentRequest request = createAdjustmentRequest(
                testSkuId,
                testStoreId,
                AdjustmentType.DAMAGE,
                5,
                "GOODS_DAMAGE",
                "货物损坏"
            );

            when(inventoryRepository.findBySkuIdAndStoreId(testSkuId, testStoreId))
                .thenReturn(Optional.of(testInventory));
            when(adjustmentRepository.save(any(InventoryAdjustment.class)))
                .thenAnswer(invocation -> {
                    InventoryAdjustment adj = invocation.getArgument(0);
                    adj.setId(UUID.randomUUID());
                    adj.setAdjustmentNumber(generateAdjustmentNumber());
                    return adj;
                });

            // When
            AdjustmentResponse response = service.createAdjustment(request, "user-001", "测试用户");

            // Then
            assertEquals(AdjustmentType.DAMAGE, response.getAdjustmentType());
            assertEquals(95, response.getStockAfter());

            // Verify inventory was decreased
            verify(inventoryRepository).save(any(StoreInventory.class));
        }

        @Test
        @DisplayName("库存不足时抛出异常")
        void shouldThrowExceptionWhenInsufficientInventory() {
            // Given - shortage exceeds available inventory
            AdjustmentRequest request = createAdjustmentRequest(
                testSkuId,
                testStoreId,
                AdjustmentType.SHORTAGE,
                200, // exceeds on hand quantity (100)
                "STOCK_DIFF",
                "盘点发现缺失"
            );

            when(inventoryRepository.findBySkuIdAndStoreId(testSkuId, testStoreId))
                .thenReturn(Optional.of(testInventory));

            // When & Then
            assertThrows(InsufficientInventoryException.class, () -> {
                service.createAdjustment(request, "user-001", "测试用户");
            });

            // Verify inventory was NOT updated
            verify(inventoryRepository, never()).save(any(StoreInventory.class));
        }

        @Test
        @DisplayName("SKU不存在时抛出异常")
        void shouldThrowExceptionWhenSkuNotFound() {
            // Given
            AdjustmentRequest request = createAdjustmentRequest(
                testSkuId,
                testStoreId,
                AdjustmentType.SURPLUS,
                10,
                "STOCK_DIFF",
                "盘点发现多余"
            );

            when(inventoryRepository.findBySkuIdAndStoreId(testSkuId, testStoreId))
                .thenReturn(Optional.empty());

            // When & Then
            assertThrows(ResourceNotFoundException.class, () -> {
                service.createAdjustment(request, "user-001", "测试用户");
            });
        }
    }

    @Nested
    @DisplayName("调整金额计算测试")
    class AdjustmentAmountCalculationTests {

        @Test
        @DisplayName("正确计算调整金额（数量 × 单价）")
        void shouldCalculateAdjustmentAmountCorrectly() {
            // Given
            AdjustmentRequest request = createAdjustmentRequest(
                testSkuId,
                testStoreId,
                AdjustmentType.SURPLUS,
                15,
                "STOCK_DIFF",
                "盘点发现多余"
            );

            when(inventoryRepository.findBySkuIdAndStoreId(testSkuId, testStoreId))
                .thenReturn(Optional.of(testInventory));
            when(adjustmentRepository.save(any(InventoryAdjustment.class)))
                .thenAnswer(invocation -> {
                    InventoryAdjustment adj = invocation.getArgument(0);
                    adj.setId(UUID.randomUUID());
                    adj.setAdjustmentNumber(generateAdjustmentNumber());
                    return adj;
                });

            // When
            AdjustmentResponse response = service.createAdjustment(request, "user-001", "测试用户");

            // Then
            // 15 * 50.00 = 750.00
            assertEquals(new BigDecimal("750.00"), response.getAdjustmentAmount());
        }

        @Test
        @DisplayName("调整金额等于阈值时触发审批")
        void shouldRequireApprovalWhenAmountEqualsThreshold() {
            // Given - exactly at threshold (50 * 20 = 1000)
            AdjustmentRequest request = createAdjustmentRequest(
                testSkuId,
                testStoreId,
                AdjustmentType.SURPLUS,
                20,
                "STOCK_DIFF",
                "盘点发现多余"
            );

            when(inventoryRepository.findBySkuIdAndStoreId(testSkuId, testStoreId))
                .thenReturn(Optional.of(testInventory));
            when(adjustmentRepository.save(any(InventoryAdjustment.class)))
                .thenAnswer(invocation -> {
                    InventoryAdjustment adj = invocation.getArgument(0);
                    adj.setId(UUID.randomUUID());
                    adj.setAdjustmentNumber(generateAdjustmentNumber());
                    return adj;
                });

            // When
            AdjustmentResponse response = service.createAdjustment(request, "user-001", "测试用户");

            // Then
            assertEquals(new BigDecimal("1000.00"), response.getAdjustmentAmount());
            assertTrue(response.getRequiresApproval());
            assertEquals(AdjustmentStatus.PENDING_APPROVAL, response.getStatus());
        }
    }

    @Nested
    @DisplayName("查询调整记录测试")
    class FindAdjustmentTests {

        @Test
        @DisplayName("成功根据ID查询调整记录")
        void shouldFindAdjustmentById() {
            // Given
            UUID adjustmentId = UUID.randomUUID();
            InventoryAdjustment adjustment = createMockAdjustment(
                adjustmentId,
                testSkuId,
                testStoreId,
                AdjustmentType.SURPLUS,
                10,
                AdjustmentStatus.APPROVED
            );

            when(adjustmentRepository.findById(adjustmentId))
                .thenReturn(Optional.of(adjustment));

            // When
            AdjustmentResponse response = service.findById(adjustmentId);

            // Then
            assertNotNull(response);
            assertEquals(adjustmentId, response.getId());
            assertEquals(AdjustmentStatus.APPROVED, response.getStatus());
        }

        @Test
        @DisplayName("调整记录不存在时抛出异常")
        void shouldThrowExceptionWhenAdjustmentNotFound() {
            // Given
            UUID adjustmentId = UUID.randomUUID();
            when(adjustmentRepository.findById(adjustmentId))
                .thenReturn(Optional.empty());

            // When & Then
            assertThrows(ResourceNotFoundException.class, () -> {
                service.findById(adjustmentId);
            });
        }
    }

    // Helper methods
    private AdjustmentRequest createAdjustmentRequest(
        UUID skuId,
        UUID storeId,
        AdjustmentType type,
        int quantity,
        String reasonCode,
        String reasonText
    ) {
        AdjustmentRequest request = new AdjustmentRequest();
        request.setSkuId(skuId);
        request.setStoreId(storeId);
        request.setAdjustmentType(type);
        request.setQuantity(quantity);
        request.setReasonCode(reasonCode);
        request.setReasonText(reasonText);
        return request;
    }

    private StoreInventory createMockInventory(
        UUID id,
        UUID skuId,
        UUID storeId,
        int onHandQty,
        int availableQty,
        int reservedQty,
        BigDecimal unitPrice
    ) {
        StoreInventory inventory = new StoreInventory();
        inventory.setId(id);
        inventory.setSkuId(skuId);
        inventory.setStoreId(storeId);
        inventory.setOnHandQty(onHandQty);
        inventory.setAvailableQty(availableQty);
        inventory.setReservedQty(reservedQty);
        inventory.setUnitPrice(unitPrice);
        inventory.setSafetyStock(50);
        inventory.setVersion(1);
        inventory.setUpdatedAt(Instant.now());
        return inventory;
    }

    private InventoryAdjustment createMockAdjustment(
        UUID id,
        UUID skuId,
        UUID storeId,
        AdjustmentType type,
        int quantity,
        AdjustmentStatus status
    ) {
        InventoryAdjustment adjustment = new InventoryAdjustment();
        adjustment.setId(id);
        adjustment.setAdjustmentNumber(generateAdjustmentNumber());
        adjustment.setSkuId(skuId);
        adjustment.setStoreId(storeId);
        adjustment.setAdjustmentType(type);
        adjustment.setQuantity(quantity);
        adjustment.setUnitPrice(new BigDecimal("50.00"));
        adjustment.setStatus(status);
        adjustment.setStockBefore(100);
        adjustment.setStockAfter(100 + quantity);
        adjustment.setRequiresApproval(false);
        adjustment.setOperatorId(UUID.randomUUID());
        adjustment.setOperatorName("测试用户");
        adjustment.setCreatedAt(Instant.now());
        adjustment.setVersion(1);
        return adjustment;
    }

    private String generateAdjustmentNumber() {
        return "ADJ" + System.currentTimeMillis();
    }
}
