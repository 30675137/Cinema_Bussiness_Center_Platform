package com.cinema.reservation;

import com.cinema.reservation.domain.enums.OperationType;
import com.cinema.reservation.domain.enums.ReservationStatus;
import com.cinema.reservation.dto.*;
import com.cinema.reservation.exception.InsufficientInventoryException;
import com.cinema.reservation.exception.InvalidStatusTransitionException;
import com.cinema.reservation.service.ReservationOrderService;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.*;

/**
 * 预约单管理集成测试
 * <p>
 * 测试完整的预约创建到完成流程，包括：
 * - 创建预约（含库存扣减）
 * - 确认预约（支付可选）
 * - 取消预约（库存释放）
 * - 操作日志记录
 * - 并发预约防超售
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-23
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("预约单管理集成测试")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@Disabled("需要完整测试环境配置：数据库、场景包、套餐、时段模板等测试数据")
class ReservationOrderIntegrationTest {

    @Autowired
    private ReservationOrderService reservationOrderService;

    // Test data - 这些ID需要在测试数据库中存在
    private static final UUID TEST_USER_ID = UUID.randomUUID();
    private static final UUID TEST_SCENARIO_PACKAGE_ID = UUID.randomUUID();
    private static final UUID TEST_PACKAGE_TIER_ID = UUID.randomUUID();
    private static final UUID TEST_TIME_SLOT_TEMPLATE_ID = UUID.randomUUID();
    private static final String TEST_CONTACT_NAME = "测试用户";
    private static final String TEST_CONTACT_PHONE = "13800138000";

    @Nested
    @DisplayName("场景1: 完整预约创建流程")
    class CreateReservationScenario {

        @Test
        @Order(1)
        @DisplayName("成功创建预约单")
        @Transactional
        void shouldCreateReservationSuccessfully() {
            // Given
            CreateReservationRequest request = buildCreateRequest();

            // When
            ReservationOrderDTO result = reservationOrderService.createReservation(TEST_USER_ID, request);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getOrderNumber()).startsWith("R");
            assertThat(result.getOrderNumber()).hasSize(19);
            assertThat(result.getStatus()).isEqualTo(ReservationStatus.PENDING);
            assertThat(result.getContactName()).isEqualTo(TEST_CONTACT_NAME);
            assertThat(result.getContactPhone()).isEqualTo(TEST_CONTACT_PHONE);
            assertThat(result.getTotalAmount()).isGreaterThan(BigDecimal.ZERO);
        }

        @Test
        @Order(2)
        @DisplayName("创建预约时记录操作日志")
        @Transactional
        void shouldRecordOperationLogOnCreate() {
            // Given
            CreateReservationRequest request = buildCreateRequest();

            // When
            ReservationOrderDTO result = reservationOrderService.createReservation(TEST_USER_ID, request);
            
            // Fetch with logs
            ReservationOrderDTO fullResult = reservationOrderService.findByOrderNumber(result.getOrderNumber());

            // Then
            List<OperationLogDTO> logs = fullResult.getOperationLogs();
            assertThat(logs).isNotEmpty();
            boolean hasCreateLog = logs.stream()
                .anyMatch(log -> log.getOperationType() == OperationType.CREATE);
            assertThat(hasCreateLog).isTrue();
        }
    }

    @Nested
    @DisplayName("场景2: 确认预约（要求支付）")
    class ConfirmWithPaymentScenario {

        @Test
        @Order(1)
        @DisplayName("确认预约并要求支付 - 状态变为CONFIRMED")
        @Transactional
        void shouldConfirmWithPaymentRequired() {
            // Given
            CreateReservationRequest createRequest = buildCreateRequest();
            ReservationOrderDTO order = reservationOrderService.createReservation(TEST_USER_ID, createRequest);
            
            ConfirmReservationRequest confirmRequest = new ConfirmReservationRequest();
            confirmRequest.setRequiresPayment(true);
            confirmRequest.setRemark("确认备注");

            // When
            ReservationOrderDTO result = reservationOrderService.confirmReservation(
                order.getId(), 
                confirmRequest,
                TEST_USER_ID
            );

            // Then
            assertThat(result.getStatus()).isEqualTo(ReservationStatus.CONFIRMED);
            assertThat(result.getRequiresPayment()).isTrue();
        }

        @Test
        @Order(2)
        @DisplayName("确认预约时记录操作日志")
        @Transactional
        void shouldRecordOperationLogOnConfirm() {
            // Given
            CreateReservationRequest createRequest = buildCreateRequest();
            ReservationOrderDTO order = reservationOrderService.createReservation(TEST_USER_ID, createRequest);
            
            ConfirmReservationRequest confirmRequest = new ConfirmReservationRequest();
            confirmRequest.setRequiresPayment(true);

            // When
            ReservationOrderDTO result = reservationOrderService.confirmReservation(
                order.getId(), confirmRequest, TEST_USER_ID);

            // Then
            List<OperationLogDTO> logs = result.getOperationLogs();
            boolean hasConfirmLog = logs != null && logs.stream()
                .anyMatch(log -> log.getOperationType() == OperationType.CONFIRM);
            assertThat(hasConfirmLog).isTrue();
        }
    }

    @Nested
    @DisplayName("场景3: 确认预约（直接完成）")
    class ConfirmDirectCompleteScenario {

        @Test
        @Order(1)
        @DisplayName("确认预约不要求支付 - 状态直接变为COMPLETED")
        @Transactional
        void shouldDirectlyCompleteWithoutPayment() {
            // Given
            CreateReservationRequest createRequest = buildCreateRequest();
            ReservationOrderDTO order = reservationOrderService.createReservation(TEST_USER_ID, createRequest);
            
            ConfirmReservationRequest confirmRequest = new ConfirmReservationRequest();
            confirmRequest.setRequiresPayment(false);

            // When
            ReservationOrderDTO result = reservationOrderService.confirmReservation(
                order.getId(), 
                confirmRequest,
                TEST_USER_ID
            );

            // Then
            assertThat(result.getStatus()).isEqualTo(ReservationStatus.COMPLETED);
            assertThat(result.getRequiresPayment()).isFalse();
        }
    }

    @Nested
    @DisplayName("场景4: 取消预约")
    class CancelReservationScenario {

        @Test
        @Order(1)
        @DisplayName("取消待确认的预约单")
        @Transactional
        void shouldCancelPendingOrder() {
            // Given
            CreateReservationRequest createRequest = buildCreateRequest();
            ReservationOrderDTO order = reservationOrderService.createReservation(TEST_USER_ID, createRequest);
            
            CancelReservationRequest cancelRequest = new CancelReservationRequest();
            cancelRequest.setCancelReason("客户要求取消");
            cancelRequest.setCancelReasonType("CUSTOMER_REQUEST");

            // When
            ReservationOrderDTO result = reservationOrderService.cancelReservation(
                order.getId(), 
                cancelRequest,
                TEST_USER_ID
            );

            // Then
            assertThat(result.getStatus()).isEqualTo(ReservationStatus.CANCELLED);
            assertThat(result.getCancelReason()).isEqualTo("客户要求取消");
            assertThat(result.getCancelledAt()).isNotNull();
        }

        @Test
        @Order(2)
        @DisplayName("取消已确认的预约单")
        @Transactional
        void shouldCancelConfirmedOrder() {
            // Given
            CreateReservationRequest createRequest = buildCreateRequest();
            ReservationOrderDTO order = reservationOrderService.createReservation(TEST_USER_ID, createRequest);
            
            ConfirmReservationRequest confirmRequest = new ConfirmReservationRequest();
            confirmRequest.setRequiresPayment(true);
            reservationOrderService.confirmReservation(order.getId(), confirmRequest, TEST_USER_ID);
            
            CancelReservationRequest cancelRequest = new CancelReservationRequest();
            cancelRequest.setCancelReason("资源冲突");
            cancelRequest.setCancelReasonType("RESOURCE_CONFLICT");

            // When
            ReservationOrderDTO result = reservationOrderService.cancelReservation(
                order.getId(), 
                cancelRequest,
                TEST_USER_ID
            );

            // Then
            assertThat(result.getStatus()).isEqualTo(ReservationStatus.CANCELLED);
        }

        @Test
        @Order(3)
        @DisplayName("取消已完成的预约单应抛出异常")
        @Transactional
        void shouldThrowExceptionWhenCancelCompletedOrder() {
            // Given
            CreateReservationRequest createRequest = buildCreateRequest();
            ReservationOrderDTO order = reservationOrderService.createReservation(TEST_USER_ID, createRequest);
            
            ConfirmReservationRequest confirmRequest = new ConfirmReservationRequest();
            confirmRequest.setRequiresPayment(false); // Direct complete
            reservationOrderService.confirmReservation(order.getId(), confirmRequest, TEST_USER_ID);
            
            CancelReservationRequest cancelRequest = new CancelReservationRequest();
            cancelRequest.setCancelReason("想取消");

            // When & Then
            assertThatThrownBy(() -> 
                reservationOrderService.cancelReservation(order.getId(), cancelRequest, TEST_USER_ID)
            ).isInstanceOf(InvalidStatusTransitionException.class);
        }
    }

    @Nested
    @DisplayName("场景5: 状态转换验证")
    class StatusTransitionScenario {

        @Test
        @DisplayName("PENDING状态可以转换为CONFIRMED")
        @Transactional
        void pendingCanTransitionToConfirmed() {
            // Given
            CreateReservationRequest createRequest = buildCreateRequest();
            ReservationOrderDTO order = reservationOrderService.createReservation(TEST_USER_ID, createRequest);
            
            ConfirmReservationRequest confirmRequest = new ConfirmReservationRequest();
            confirmRequest.setRequiresPayment(true);

            // When
            ReservationOrderDTO result = reservationOrderService.confirmReservation(
                order.getId(), 
                confirmRequest,
                TEST_USER_ID
            );

            // Then
            assertThat(result.getStatus()).isEqualTo(ReservationStatus.CONFIRMED);
        }

        @Test
        @DisplayName("PENDING状态可以转换为CANCELLED")
        @Transactional
        void pendingCanTransitionToCancelled() {
            // Given
            CreateReservationRequest createRequest = buildCreateRequest();
            ReservationOrderDTO order = reservationOrderService.createReservation(TEST_USER_ID, createRequest);
            
            CancelReservationRequest cancelRequest = new CancelReservationRequest();
            cancelRequest.setCancelReason("测试");

            // When
            ReservationOrderDTO result = reservationOrderService.cancelReservation(
                order.getId(), 
                cancelRequest,
                TEST_USER_ID
            );

            // Then
            assertThat(result.getStatus()).isEqualTo(ReservationStatus.CANCELLED);
        }

        @Test
        @DisplayName("非PENDING状态不能再次确认")
        @Transactional
        void confirmedCannotBeConfirmedAgain() {
            // Given
            CreateReservationRequest createRequest = buildCreateRequest();
            ReservationOrderDTO order = reservationOrderService.createReservation(TEST_USER_ID, createRequest);
            
            ConfirmReservationRequest confirmRequest = new ConfirmReservationRequest();
            confirmRequest.setRequiresPayment(true);
            reservationOrderService.confirmReservation(order.getId(), confirmRequest, TEST_USER_ID);

            // When & Then
            assertThatThrownBy(() -> 
                reservationOrderService.confirmReservation(order.getId(), confirmRequest, TEST_USER_ID)
            ).isInstanceOf(InvalidStatusTransitionException.class);
        }
    }

    @Nested
    @DisplayName("场景6: 并发预约防超售")
    @Disabled("需要配置测试数据库和库存服务")
    class ConcurrencyScenario {

        @Test
        @DisplayName("并发预约不应超售")
        void shouldPreventOverselling() throws Exception {
            // Given
            int concurrentRequests = 50;
            int availableSlots = 10;
            
            ExecutorService executor = Executors.newFixedThreadPool(10);
            AtomicInteger successCount = new AtomicInteger(0);
            AtomicInteger failureCount = new AtomicInteger(0);
            
            // When
            List<CompletableFuture<Void>> futures = new java.util.ArrayList<>();
            for (int i = 0; i < concurrentRequests; i++) {
                CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
                    try {
                        CreateReservationRequest request = buildCreateRequest();
                        reservationOrderService.createReservation(UUID.randomUUID(), request);
                        successCount.incrementAndGet();
                    } catch (InsufficientInventoryException e) {
                        failureCount.incrementAndGet();
                    } catch (Exception e) {
                        failureCount.incrementAndGet();
                    }
                }, executor);
                futures.add(future);
            }
            
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
            executor.shutdown();
            
            // Then
            assertThat(successCount.get()).isLessThanOrEqualTo(availableSlots);
            assertThat(successCount.get() + failureCount.get()).isEqualTo(concurrentRequests);
        }
    }

    // Helper methods
    
    private CreateReservationRequest buildCreateRequest() {
        CreateReservationRequest request = new CreateReservationRequest();
        request.setScenarioPackageId(TEST_SCENARIO_PACKAGE_ID);
        request.setPackageTierId(TEST_PACKAGE_TIER_ID);
        request.setTimeSlotTemplateId(TEST_TIME_SLOT_TEMPLATE_ID);
        request.setReservationDate(LocalDate.now().plusDays(1).toString());
        request.setContactName(TEST_CONTACT_NAME);
        request.setContactPhone(TEST_CONTACT_PHONE);
        request.setRemark("集成测试预约");
        return request;
    }
}
