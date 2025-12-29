package com.cinema.inventory.service;

import com.cinema.inventory.domain.ApprovalRecord;
import com.cinema.inventory.domain.InventoryAdjustment;
import com.cinema.inventory.domain.StoreInventory;
import com.cinema.inventory.domain.enums.AdjustmentStatus;
import com.cinema.inventory.domain.enums.AdjustmentType;
import com.cinema.inventory.domain.enums.ApprovalAction;
import com.cinema.inventory.dto.ApprovalRequest;
import com.cinema.inventory.dto.ApprovalResponse;
import com.cinema.inventory.exception.InvalidOperationException;
import com.cinema.inventory.exception.ResourceNotFoundException;
import com.cinema.inventory.repository.AdjustmentRepository;
import com.cinema.inventory.repository.ApprovalRepository;
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
 * T044 [US4] Backend service test for ApprovalService
 *
 * Tests the approval service layer logic:
 * 1. Approve pending adjustment
 * 2. Reject pending adjustment
 * 3. Withdraw pending adjustment (by applicant)
 * 4. Update inventory after approval
 * 5. Create approval records
 * 6. Validate state transitions
 * 7. Prevent duplicate approvals
 */
@ExtendWith(MockitoExtension.class)
class ApprovalServiceTest {

    @Mock
    private AdjustmentRepository adjustmentRepository;

    @Mock
    private ApprovalRepository approvalRepository;

    @Mock
    private StoreInventoryRepository inventoryRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private ApprovalService service;

    private UUID testAdjustmentId;
    private UUID testInventoryId;
    private InventoryAdjustment pendingAdjustment;
    private StoreInventory testInventory;

    @BeforeEach
    void setUp() {
        testAdjustmentId = UUID.randomUUID();
        testInventoryId = UUID.randomUUID();

        pendingAdjustment = createMockAdjustment(
            testAdjustmentId,
            UUID.randomUUID(),
            UUID.randomUUID(),
            AdjustmentType.SURPLUS,
            20,
            AdjustmentStatus.PENDING_APPROVAL,
            true
        );

        testInventory = createMockInventory(
            testInventoryId,
            pendingAdjustment.getSkuId(),
            pendingAdjustment.getStoreId(),
            100,
            80,
            20
        );
    }

    @Nested
    @DisplayName("审批通过测试")
    class ApproveTests {

        @Test
        @DisplayName("成功审批通过待审批调整")
        void shouldApproveAdjustment() {
            // Given
            ApprovalRequest request = createApprovalRequest("通过审批，盘点数据准确");

            when(adjustmentRepository.findById(testAdjustmentId))
                .thenReturn(Optional.of(pendingAdjustment));
            when(inventoryRepository.findBySkuIdAndStoreId(
                pendingAdjustment.getSkuId(),
                pendingAdjustment.getStoreId()
            )).thenReturn(Optional.of(testInventory));
            when(adjustmentRepository.save(any(InventoryAdjustment.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
            when(approvalRepository.save(any(ApprovalRecord.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

            // When
            ApprovalResponse response = service.approve(
                testAdjustmentId,
                request,
                "director-001",
                "运营总监"
            );

            // Then
            assertNotNull(response);
            assertEquals(AdjustmentStatus.APPROVED, response.getStatus());
            assertEquals("director-001", response.getApprovedBy());
            assertNotNull(response.getApprovedAt());

            // Verify adjustment status updated
            ArgumentCaptor<InventoryAdjustment> adjustmentCaptor =
                ArgumentCaptor.forClass(InventoryAdjustment.class);
            verify(adjustmentRepository).save(adjustmentCaptor.capture());
            assertEquals(AdjustmentStatus.APPROVED, adjustmentCaptor.getValue().getStatus());

            // Verify inventory was updated
            ArgumentCaptor<StoreInventory> inventoryCaptor =
                ArgumentCaptor.forClass(StoreInventory.class);
            verify(inventoryRepository).save(inventoryCaptor.capture());
            assertEquals(120, inventoryCaptor.getValue().getOnHandQty());
            assertEquals(100, inventoryCaptor.getValue().getAvailableQty());

            // Verify transaction was created
            verify(transactionRepository).save(any());

            // Verify approval record was created
            ArgumentCaptor<ApprovalRecord> recordCaptor =
                ArgumentCaptor.forClass(ApprovalRecord.class);
            verify(approvalRepository).save(recordCaptor.capture());
            assertEquals(ApprovalAction.APPROVE, recordCaptor.getValue().getAction());
            assertEquals(AdjustmentStatus.PENDING_APPROVAL, recordCaptor.getValue().getStatusBefore());
            assertEquals(AdjustmentStatus.APPROVED, recordCaptor.getValue().getStatusAfter());
        }

        @Test
        @DisplayName("调整不存在时抛出异常")
        void shouldThrowExceptionWhenAdjustmentNotFound() {
            // Given
            ApprovalRequest request = createApprovalRequest("通过审批");
            when(adjustmentRepository.findById(testAdjustmentId))
                .thenReturn(Optional.empty());

            // When & Then
            assertThrows(ResourceNotFoundException.class, () -> {
                service.approve(testAdjustmentId, request, "director-001", "运营总监");
            });

            // Verify no inventory update
            verify(inventoryRepository, never()).save(any());
        }

        @Test
        @DisplayName("调整不在待审批状态时抛出异常")
        void shouldThrowExceptionWhenNotPendingApproval() {
            // Given
            ApprovalRequest request = createApprovalRequest("通过审批");
            InventoryAdjustment approvedAdjustment = createMockAdjustment(
                testAdjustmentId,
                UUID.randomUUID(),
                UUID.randomUUID(),
                AdjustmentType.SURPLUS,
                20,
                AdjustmentStatus.APPROVED,
                true
            );

            when(adjustmentRepository.findById(testAdjustmentId))
                .thenReturn(Optional.of(approvedAdjustment));

            // When & Then
            assertThrows(InvalidOperationException.class, () -> {
                service.approve(testAdjustmentId, request, "director-001", "运营总监");
            });

            // Verify no changes made
            verify(adjustmentRepository, never()).save(any());
            verify(inventoryRepository, never()).save(any());
        }

        @Test
        @DisplayName("审批通过盘亏调整应正确减少库存")
        void shouldDecreaseInventoryWhenApprovingShortageAdjustment() {
            // Given
            InventoryAdjustment shortageAdjustment = createMockAdjustment(
                testAdjustmentId,
                testInventory.getSkuId(),
                testInventory.getStoreId(),
                AdjustmentType.SHORTAGE,
                15,
                AdjustmentStatus.PENDING_APPROVAL,
                true
            );
            ApprovalRequest request = createApprovalRequest("同意盘亏调整");

            when(adjustmentRepository.findById(testAdjustmentId))
                .thenReturn(Optional.of(shortageAdjustment));
            when(inventoryRepository.findBySkuIdAndStoreId(
                shortageAdjustment.getSkuId(),
                shortageAdjustment.getStoreId()
            )).thenReturn(Optional.of(testInventory));
            when(adjustmentRepository.save(any(InventoryAdjustment.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
            when(approvalRepository.save(any(ApprovalRecord.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

            // When
            service.approve(testAdjustmentId, request, "director-001", "运营总监");

            // Then
            ArgumentCaptor<StoreInventory> inventoryCaptor =
                ArgumentCaptor.forClass(StoreInventory.class);
            verify(inventoryRepository).save(inventoryCaptor.capture());
            assertEquals(85, inventoryCaptor.getValue().getOnHandQty());
            assertEquals(65, inventoryCaptor.getValue().getAvailableQty());
        }
    }

    @Nested
    @DisplayName("审批拒绝测试")
    class RejectTests {

        @Test
        @DisplayName("成功拒绝待审批调整")
        void shouldRejectAdjustment() {
            // Given
            ApprovalRequest request = createApprovalRequest("盘点数据存疑，需重新核对");

            when(adjustmentRepository.findById(testAdjustmentId))
                .thenReturn(Optional.of(pendingAdjustment));
            when(adjustmentRepository.save(any(InventoryAdjustment.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
            when(approvalRepository.save(any(ApprovalRecord.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

            // When
            ApprovalResponse response = service.reject(
                testAdjustmentId,
                request,
                "director-001",
                "运营总监"
            );

            // Then
            assertNotNull(response);
            assertEquals(AdjustmentStatus.REJECTED, response.getStatus());

            // Verify adjustment status updated
            ArgumentCaptor<InventoryAdjustment> adjustmentCaptor =
                ArgumentCaptor.forClass(InventoryAdjustment.class);
            verify(adjustmentRepository).save(adjustmentCaptor.capture());
            assertEquals(AdjustmentStatus.REJECTED, adjustmentCaptor.getValue().getStatus());

            // Verify inventory was NOT updated
            verify(inventoryRepository, never()).save(any());

            // Verify transaction was NOT created
            verify(transactionRepository, never()).save(any());

            // Verify approval record was created
            ArgumentCaptor<ApprovalRecord> recordCaptor =
                ArgumentCaptor.forClass(ApprovalRecord.class);
            verify(approvalRepository).save(recordCaptor.capture());
            assertEquals(ApprovalAction.REJECT, recordCaptor.getValue().getAction());
            assertEquals(AdjustmentStatus.REJECTED, recordCaptor.getValue().getStatusAfter());
        }

        @Test
        @DisplayName("拒绝理由为必填项")
        void shouldRequireCommentsWhenRejecting() {
            // Given
            ApprovalRequest request = new ApprovalRequest();
            request.setComments(null);

            when(adjustmentRepository.findById(testAdjustmentId))
                .thenReturn(Optional.of(pendingAdjustment));

            // When & Then
            assertThrows(IllegalArgumentException.class, () -> {
                service.reject(testAdjustmentId, request, "director-001", "运营总监");
            });
        }
    }

    @Nested
    @DisplayName("撤回申请测试")
    class WithdrawTests {

        @Test
        @DisplayName("申请人成功撤回待审批调整")
        void shouldWithdrawAdjustment() {
            // Given
            String applicantId = pendingAdjustment.getOperatorId().toString();

            when(adjustmentRepository.findById(testAdjustmentId))
                .thenReturn(Optional.of(pendingAdjustment));
            when(adjustmentRepository.save(any(InventoryAdjustment.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
            when(approvalRepository.save(any(ApprovalRecord.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

            // When
            ApprovalResponse response = service.withdraw(
                testAdjustmentId,
                applicantId,
                "申请人"
            );

            // Then
            assertNotNull(response);
            assertEquals(AdjustmentStatus.WITHDRAWN, response.getStatus());

            // Verify adjustment status updated
            ArgumentCaptor<InventoryAdjustment> adjustmentCaptor =
                ArgumentCaptor.forClass(InventoryAdjustment.class);
            verify(adjustmentRepository).save(adjustmentCaptor.capture());
            assertEquals(AdjustmentStatus.WITHDRAWN, adjustmentCaptor.getValue().getStatus());

            // Verify inventory was NOT updated
            verify(inventoryRepository, never()).save(any());

            // Verify approval record was created
            ArgumentCaptor<ApprovalRecord> recordCaptor =
                ArgumentCaptor.forClass(ApprovalRecord.class);
            verify(approvalRepository).save(recordCaptor.capture());
            assertEquals(ApprovalAction.WITHDRAW, recordCaptor.getValue().getAction());
        }

        @Test
        @DisplayName("非申请人撤回时抛出异常")
        void shouldThrowExceptionWhenNotApplicant() {
            // Given
            String differentUserId = UUID.randomUUID().toString();

            when(adjustmentRepository.findById(testAdjustmentId))
                .thenReturn(Optional.of(pendingAdjustment));

            // When & Then
            assertThrows(InvalidOperationException.class, () -> {
                service.withdraw(testAdjustmentId, differentUserId, "其他用户");
            });

            // Verify no changes made
            verify(adjustmentRepository, never()).save(any());
        }

        @Test
        @DisplayName("已审批的调整不能撤回")
        void shouldNotWithdrawApprovedAdjustment() {
            // Given
            InventoryAdjustment approvedAdjustment = createMockAdjustment(
                testAdjustmentId,
                UUID.randomUUID(),
                UUID.randomUUID(),
                AdjustmentType.SURPLUS,
                20,
                AdjustmentStatus.APPROVED,
                true
            );
            String applicantId = approvedAdjustment.getOperatorId().toString();

            when(adjustmentRepository.findById(testAdjustmentId))
                .thenReturn(Optional.of(approvedAdjustment));

            // When & Then
            assertThrows(InvalidOperationException.class, () -> {
                service.withdraw(testAdjustmentId, applicantId, "申请人");
            });
        }
    }

    @Nested
    @DisplayName("查询待审批列表测试")
    class FindPendingApprovalsTests {

        @Test
        @DisplayName("成功查询所有待审批调整")
        void shouldFindAllPendingApprovals() {
            // Given
            InventoryAdjustment adjustment1 = createMockAdjustment(
                UUID.randomUUID(),
                UUID.randomUUID(),
                UUID.randomUUID(),
                AdjustmentType.SURPLUS,
                20,
                AdjustmentStatus.PENDING_APPROVAL,
                true
            );
            InventoryAdjustment adjustment2 = createMockAdjustment(
                UUID.randomUUID(),
                UUID.randomUUID(),
                UUID.randomUUID(),
                AdjustmentType.SHORTAGE,
                15,
                AdjustmentStatus.PENDING_APPROVAL,
                true
            );

            when(adjustmentRepository.findByStatus(AdjustmentStatus.PENDING_APPROVAL))
                .thenReturn(java.util.List.of(adjustment1, adjustment2));

            // When
            java.util.List<ApprovalResponse> results = service.findPendingApprovals();

            // Then
            assertNotNull(results);
            assertEquals(2, results.size());
            assertTrue(results.stream().allMatch(r ->
                r.getStatus() == AdjustmentStatus.PENDING_APPROVAL
            ));
        }

        @Test
        @DisplayName("无待审批时返回空列表")
        void shouldReturnEmptyListWhenNoPendingApprovals() {
            // Given
            when(adjustmentRepository.findByStatus(AdjustmentStatus.PENDING_APPROVAL))
                .thenReturn(java.util.List.of());

            // When
            java.util.List<ApprovalResponse> results = service.findPendingApprovals();

            // Then
            assertNotNull(results);
            assertTrue(results.isEmpty());
        }
    }

    // Helper methods
    private ApprovalRequest createApprovalRequest(String comments) {
        ApprovalRequest request = new ApprovalRequest();
        request.setComments(comments);
        return request;
    }

    private InventoryAdjustment createMockAdjustment(
        UUID id,
        UUID skuId,
        UUID storeId,
        AdjustmentType type,
        int quantity,
        AdjustmentStatus status,
        boolean requiresApproval
    ) {
        InventoryAdjustment adjustment = new InventoryAdjustment();
        adjustment.setId(id);
        adjustment.setAdjustmentNumber("ADJ" + System.currentTimeMillis());
        adjustment.setSkuId(skuId);
        adjustment.setStoreId(storeId);
        adjustment.setAdjustmentType(type);
        adjustment.setQuantity(quantity);
        adjustment.setUnitPrice(new BigDecimal("200.00"));
        adjustment.setStatus(status);
        adjustment.setStockBefore(100);
        adjustment.setStockAfter(type == AdjustmentType.SURPLUS ? 100 + quantity : 100 - quantity);
        adjustment.setRequiresApproval(requiresApproval);
        adjustment.setOperatorId(UUID.randomUUID());
        adjustment.setOperatorName("测试用户");
        adjustment.setReasonCode("STOCK_DIFF");
        adjustment.setReasonText("盘点差异");
        adjustment.setCreatedAt(Instant.now());
        adjustment.setVersion(1);
        return adjustment;
    }

    private StoreInventory createMockInventory(
        UUID id,
        UUID skuId,
        UUID storeId,
        int onHandQty,
        int availableQty,
        int reservedQty
    ) {
        StoreInventory inventory = new StoreInventory();
        inventory.setId(id);
        inventory.setSkuId(skuId);
        inventory.setStoreId(storeId);
        inventory.setOnHandQty(onHandQty);
        inventory.setAvailableQty(availableQty);
        inventory.setReservedQty(reservedQty);
        inventory.setUnitPrice(new BigDecimal("200.00"));
        inventory.setSafetyStock(50);
        inventory.setVersion(1);
        inventory.setUpdatedAt(Instant.now());
        return inventory;
    }
}
