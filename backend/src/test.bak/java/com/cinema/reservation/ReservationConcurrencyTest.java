package com.cinema.reservation;

import com.cinema.reservation.dto.CreateReservationRequest;
import com.cinema.reservation.dto.ReservationOrderDTO;
import com.cinema.reservation.exception.InsufficientInventoryException;
import com.cinema.reservation.service.ReservationOrderService;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.*;

/**
 * 预约单并发性能测试
 * <p>
 * 测试高并发场景下系统的稳定性和防超售能力。
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-23
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("预约单并发性能测试")
@Disabled("性能测试需要独立运行，避免影响CI/CD流程")
class ReservationConcurrencyTest {

    @Autowired
    private ReservationOrderService reservationOrderService;

    // 需要在测试数据库中存在的测试数据
    private static final UUID TEST_SCENARIO_PACKAGE_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID TEST_PACKAGE_TIER_ID = UUID.fromString("22222222-2222-2222-2222-222222222222");
    private static final UUID TEST_TIME_SLOT_TEMPLATE_ID = UUID.fromString("33333333-3333-3333-3333-333333333333");
    private static final int MAX_CAPACITY = 10; // 时段最大容量

    @Nested
    @DisplayName("并发预约防超售测试")
    class OversellPreventionTest {

        @Test
        @DisplayName("50个并发请求抢10个名额 - 应只成功10个")
        void shouldPreventOverselling() throws Exception {
            // Given
            int concurrentRequests = 50;
            
            ExecutorService executor = Executors.newFixedThreadPool(20);
            AtomicInteger successCount = new AtomicInteger(0);
            AtomicInteger inventoryExceptionCount = new AtomicInteger(0);
            AtomicInteger otherExceptionCount = new AtomicInteger(0);
            List<String> successfulOrderNumbers = new CopyOnWriteArrayList<>();
            
            CountDownLatch startLatch = new CountDownLatch(1);
            CountDownLatch doneLatch = new CountDownLatch(concurrentRequests);
            
            // When
            for (int i = 0; i < concurrentRequests; i++) {
                final int userId = i;
                executor.submit(() -> {
                    try {
                        startLatch.await(); // 等待所有线程准备就绪
                        
                        CreateReservationRequest request = buildCreateRequest();
                        ReservationOrderDTO result = reservationOrderService.createReservation(
                            UUID.randomUUID(), request);
                        
                        successCount.incrementAndGet();
                        successfulOrderNumbers.add(result.getOrderNumber());
                    } catch (InsufficientInventoryException e) {
                        inventoryExceptionCount.incrementAndGet();
                    } catch (Exception e) {
                        otherExceptionCount.incrementAndGet();
                        System.err.println("Unexpected exception: " + e.getMessage());
                    } finally {
                        doneLatch.countDown();
                    }
                });
            }
            
            // 同时释放所有线程
            startLatch.countDown();
            
            // 等待所有请求完成
            boolean completed = doneLatch.await(60, TimeUnit.SECONDS);
            executor.shutdown();
            
            // Then
            assertThat(completed).isTrue().as("所有请求应在60秒内完成");
            assertThat(successCount.get()).isLessThanOrEqualTo(MAX_CAPACITY)
                .as("成功预约数不应超过最大容量");
            assertThat(successCount.get() + inventoryExceptionCount.get() + otherExceptionCount.get())
                .isEqualTo(concurrentRequests).as("所有请求都应有结果");
            assertThat(otherExceptionCount.get()).isZero()
                .as("不应有非库存不足的异常");
            
            // 验证成功的订单号都是唯一的
            assertThat(successfulOrderNumbers).hasSize(successCount.get());
            assertThat(successfulOrderNumbers).doesNotHaveDuplicates();
            
            System.out.println("=== 并发测试结果 ===");
            System.out.println("总请求数: " + concurrentRequests);
            System.out.println("成功预约: " + successCount.get());
            System.out.println("库存不足: " + inventoryExceptionCount.get());
            System.out.println("其他异常: " + otherExceptionCount.get());
        }

        @Test
        @DisplayName("100个并发请求 - 性能基准测试")
        void performanceBenchmark() throws Exception {
            // Given
            int concurrentRequests = 100;
            
            ExecutorService executor = Executors.newFixedThreadPool(50);
            List<Long> responseTimes = new CopyOnWriteArrayList<>();
            CountDownLatch doneLatch = new CountDownLatch(concurrentRequests);
            
            long startTime = System.currentTimeMillis();
            
            // When
            for (int i = 0; i < concurrentRequests; i++) {
                executor.submit(() -> {
                    long requestStart = System.currentTimeMillis();
                    try {
                        CreateReservationRequest request = buildCreateRequest();
                        reservationOrderService.createReservation(UUID.randomUUID(), request);
                    } catch (Exception e) {
                        // Expected: InsufficientInventoryException
                    } finally {
                        responseTimes.add(System.currentTimeMillis() - requestStart);
                        doneLatch.countDown();
                    }
                });
            }
            
            doneLatch.await(120, TimeUnit.SECONDS);
            executor.shutdown();
            
            long totalTime = System.currentTimeMillis() - startTime;
            
            // Then
            double avgResponseTime = responseTimes.stream()
                .mapToLong(Long::longValue)
                .average()
                .orElse(0);
            
            long maxResponseTime = responseTimes.stream()
                .mapToLong(Long::longValue)
                .max()
                .orElse(0);
            
            long minResponseTime = responseTimes.stream()
                .mapToLong(Long::longValue)
                .min()
                .orElse(0);
            
            // P95计算
            List<Long> sortedTimes = new ArrayList<>(responseTimes);
            sortedTimes.sort(Long::compareTo);
            long p95ResponseTime = sortedTimes.isEmpty() ? 0 : 
                sortedTimes.get((int) (sortedTimes.size() * 0.95));
            
            System.out.println("=== 性能基准测试结果 ===");
            System.out.println("总请求数: " + concurrentRequests);
            System.out.println("总耗时: " + totalTime + " ms");
            System.out.println("QPS: " + String.format("%.2f", concurrentRequests * 1000.0 / totalTime));
            System.out.println("平均响应时间: " + String.format("%.2f", avgResponseTime) + " ms");
            System.out.println("最小响应时间: " + minResponseTime + " ms");
            System.out.println("最大响应时间: " + maxResponseTime + " ms");
            System.out.println("P95响应时间: " + p95ResponseTime + " ms");
            
            // 性能断言（可根据实际需求调整）
            assertThat(avgResponseTime).isLessThan(1000)
                .as("平均响应时间应小于1秒");
            assertThat(p95ResponseTime).isLessThan(2000)
                .as("P95响应时间应小于2秒");
        }
    }

    @Nested
    @DisplayName("乐观锁冲突测试")
    class OptimisticLockingTest {

        @Test
        @DisplayName("同时确认同一预约单 - 应只成功一次")
        void shouldHandleOptimisticLockingConflict() throws Exception {
            // Given: 先创建一个预约单
            CreateReservationRequest createRequest = buildCreateRequest();
            ReservationOrderDTO order = reservationOrderService.createReservation(
                UUID.randomUUID(), createRequest);
            
            UUID orderId = order.getId();
            int concurrentConfirmAttempts = 10;
            
            ExecutorService executor = Executors.newFixedThreadPool(10);
            AtomicInteger successCount = new AtomicInteger(0);
            AtomicInteger failureCount = new AtomicInteger(0);
            CountDownLatch startLatch = new CountDownLatch(1);
            CountDownLatch doneLatch = new CountDownLatch(concurrentConfirmAttempts);
            
            // When: 并发尝试确认
            for (int i = 0; i < concurrentConfirmAttempts; i++) {
                executor.submit(() -> {
                    try {
                        startLatch.await();
                        
                        var confirmRequest = new com.cinema.reservation.dto.ConfirmReservationRequest();
                        confirmRequest.setRequiresPayment(true);
                        
                        reservationOrderService.confirmReservation(orderId, confirmRequest, UUID.randomUUID());
                        successCount.incrementAndGet();
                    } catch (Exception e) {
                        failureCount.incrementAndGet();
                    } finally {
                        doneLatch.countDown();
                    }
                });
            }
            
            startLatch.countDown();
            doneLatch.await(30, TimeUnit.SECONDS);
            executor.shutdown();
            
            // Then
            assertThat(successCount.get()).isEqualTo(1)
                .as("只有一个确认请求应成功");
            assertThat(failureCount.get()).isEqualTo(concurrentConfirmAttempts - 1)
                .as("其他请求应失败");
            
            System.out.println("=== 乐观锁测试结果 ===");
            System.out.println("并发确认尝试: " + concurrentConfirmAttempts);
            System.out.println("成功: " + successCount.get());
            System.out.println("失败: " + failureCount.get());
        }
    }

    private CreateReservationRequest buildCreateRequest() {
        CreateReservationRequest request = new CreateReservationRequest();
        request.setScenarioPackageId(TEST_SCENARIO_PACKAGE_ID);
        request.setPackageTierId(TEST_PACKAGE_TIER_ID);
        request.setTimeSlotTemplateId(TEST_TIME_SLOT_TEMPLATE_ID);
        request.setReservationDate(LocalDate.now().plusDays(1).toString());
        request.setContactName("性能测试用户");
        request.setContactPhone("13800138000");
        request.setRemark("并发性能测试");
        return request;
    }
}
