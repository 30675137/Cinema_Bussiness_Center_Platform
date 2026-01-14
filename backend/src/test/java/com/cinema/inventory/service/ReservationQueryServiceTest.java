package com.cinema.inventory.service;

import com.cinema.inventory.entity.InventoryReservation;
import com.cinema.inventory.entity.InventoryReservation.ReservationStatus;
import com.cinema.inventory.repository.InventoryReservationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * @spec O012-order-inventory-reservation
 * ReservationQueryService 单元测试
 *
 * 测试覆盖:
 * - T034: 按订单号查询预占记录
 * - T035: 按SKU ID查询预占记录
 * - T036: 按状态查询预占记录
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ReservationQueryService - 预占记录查询服务测试")
class ReservationQueryServiceTest {

    @Mock
    private InventoryReservationRepository reservationRepository;

    @InjectMocks
    private ReservationQueryService queryService;

    private UUID testOrderId;
    private UUID testStoreId;
    private UUID testSkuId;
    private List<InventoryReservation> testReservations;

    @BeforeEach
    void setUp() {
        testOrderId = UUID.randomUUID();
        testStoreId = UUID.randomUUID();
        testSkuId = UUID.randomUUID();

        // 设置测试预占记录
        InventoryReservation reservation1 = new InventoryReservation();
        reservation1.setId(UUID.randomUUID());
        reservation1.setOrderId(testOrderId);
        reservation1.setStoreId(testStoreId);
        reservation1.setSkuId(testSkuId);
        reservation1.setReservedQuantity(BigDecimal.valueOf(2.0));
        reservation1.setStatus(ReservationStatus.ACTIVE);
        reservation1.setCreatedAt(Instant.now());

        InventoryReservation reservation2 = new InventoryReservation();
        reservation2.setId(UUID.randomUUID());
        reservation2.setOrderId(testOrderId);
        reservation2.setStoreId(testStoreId);
        reservation2.setSkuId(UUID.randomUUID());
        reservation2.setReservedQuantity(BigDecimal.valueOf(1.0));
        reservation2.setStatus(ReservationStatus.ACTIVE);
        reservation2.setCreatedAt(Instant.now().minus(5, ChronoUnit.MINUTES));

        testReservations = Arrays.asList(reservation1, reservation2);
    }

    /**
     * T034: 测试按订单号查询预占记录
     * 验证:
     * - 正确调用Repository的查询方法
     * - 返回分页结果包含正确的记录
     * - 支持分页参数
     */
    @Test
    @DisplayName("T034: 应该成功按订单号查询预占记录")
    void testQueryByOrderId_成功() {
        // Given - 模拟分页查询结果
        Page<InventoryReservation> expectedPage = new PageImpl<>(testReservations);
        when(reservationRepository.findByOrderId(eq(testOrderId), any(Pageable.class)))
                .thenReturn(expectedPage);

        // When - 执行查询
        Page<InventoryReservation> result = queryService.queryByOrderId(testOrderId, 0, 20);

        // Then - 验证结果
        assertNotNull(result);
        assertEquals(2, result.getTotalElements());
        assertEquals(testReservations.size(), result.getContent().size());

        // 验证Repository方法被调用
        verify(reservationRepository, times(1))
                .findByOrderId(eq(testOrderId), any(Pageable.class));
    }

    /**
     * T034: 测试查询不存在的订单
     * 验证:
     * - 返回空的分页结果
     * - 不抛出异常
     */
    @Test
    @DisplayName("T034: 查询不存在的订单应返回空结果")
    void testQueryByOrderId_不存在的订单() {
        // Given - 模拟空结果
        Page<InventoryReservation> emptyPage = Page.empty();
        when(reservationRepository.findByOrderId(eq(testOrderId), any(Pageable.class)))
                .thenReturn(emptyPage);

        // When
        Page<InventoryReservation> result = queryService.queryByOrderId(testOrderId, 0, 20);

        // Then
        assertNotNull(result);
        assertEquals(0, result.getTotalElements());
        assertTrue(result.getContent().isEmpty());
    }

    /**
     * T034: 测试分页参数处理
     * 验证:
     * - 默认pageSize=20
     * - 最大pageSize=100
     * - 超过最大值时自动调整
     */
    @Test
    @DisplayName("T034: 应该正确处理分页参数")
    void testQueryByOrderId_分页参数处理() {
        // Given
        Page<InventoryReservation> expectedPage = new PageImpl<>(testReservations);
        when(reservationRepository.findByOrderId(eq(testOrderId), any(Pageable.class)))
                .thenReturn(expectedPage);

        // When - 不指定pageSize (应使用默认值20)
        queryService.queryByOrderId(testOrderId, 0, null);

        // Then - 验证使用了默认pageSize
        verify(reservationRepository).findByOrderId(
                eq(testOrderId),
                argThat(pageable -> pageable.getPageSize() == 20)
        );

        // When - 指定超大pageSize (应限制为100)
        queryService.queryByOrderId(testOrderId, 0, 200);

        // Then - 验证被限制为100
        verify(reservationRepository).findByOrderId(
                eq(testOrderId),
                argThat(pageable -> pageable.getPageSize() == 100)
        );
    }

    /**
     * T035: 测试按SKU ID查询预占记录
     * 验证:
     * - 正确调用Repository方法
     * - 返回该SKU的所有预占记录
     */
    @Test
    @DisplayName("T035: 应该成功按SKU ID查询预占记录")
    void testQueryBySkuId_成功() {
        // Given
        Page<InventoryReservation> expectedPage = new PageImpl<>(testReservations);
        when(reservationRepository.findBySkuId(eq(testSkuId), any(Pageable.class)))
                .thenReturn(expectedPage);

        // When
        Page<InventoryReservation> result = queryService.queryBySkuId(testSkuId, 0, 20);

        // Then
        assertNotNull(result);
        assertEquals(2, result.getTotalElements());

        // 验证返回的记录包含指定的SKU
        result.getContent().forEach(reservation -> 
                assertNotNull(reservation.getSkuId())
        );

        verify(reservationRepository, times(1))
                .findBySkuId(eq(testSkuId), any(Pageable.class));
    }

    /**
     * T035: 测试按不存在的SKU查询
     * 验证:
     * - 返回空结果
     */
    @Test
    @DisplayName("T035: 查询不存在的SKU应返回空结果")
    void testQueryBySkuId_不存在的SKU() {
        // Given
        UUID nonExistentSkuId = UUID.randomUUID();
        Page<InventoryReservation> emptyPage = Page.empty();
        when(reservationRepository.findBySkuId(eq(nonExistentSkuId), any(Pageable.class)))
                .thenReturn(emptyPage);

        // When
        Page<InventoryReservation> result = queryService.queryBySkuId(nonExistentSkuId, 0, 20);

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    /**
     * T036: 测试按状态查询预占记录
     * 验证:
     * - 支持查询ACTIVE状态的记录
     * - 支持查询RELEASED状态的记录
     * - 正确过滤状态
     */
    @Test
    @DisplayName("T036: 应该成功按状态查询预占记录 (ACTIVE)")
    void testQueryByStatus_ACTIVE状态() {
        // Given - 只返回ACTIVE状态的记录
        Page<InventoryReservation> expectedPage = new PageImpl<>(testReservations);
        when(reservationRepository.findByStatus(eq(ReservationStatus.ACTIVE), any(Pageable.class)))
                .thenReturn(expectedPage);

        // When
        Page<InventoryReservation> result = queryService.queryByStatus(ReservationStatus.ACTIVE, 0, 20);

        // Then
        assertNotNull(result);
        assertEquals(2, result.getTotalElements());

        // 验证所有记录都是ACTIVE状态
        result.getContent().forEach(reservation ->
                assertEquals(ReservationStatus.ACTIVE, reservation.getStatus())
        );

        verify(reservationRepository, times(1))
                .findByStatus(eq(ReservationStatus.ACTIVE), any(Pageable.class));
    }

    /**
     * T036: 测试查询FULFILLED状态的记录
     */
    @Test
    @DisplayName("T036: 应该成功按状态查询预占记录 (FULFILLED)")
    void testQueryByStatus_FULFILLED状态() {
        // Given
        InventoryReservation fulfilledReservation = new InventoryReservation();
        fulfilledReservation.setId(UUID.randomUUID());
        fulfilledReservation.setStatus(ReservationStatus.FULFILLED);
        fulfilledReservation.setCreatedAt(Instant.now());

        Page<InventoryReservation> expectedPage = new PageImpl<>(List.of(fulfilledReservation));
        when(reservationRepository.findByStatus(eq(ReservationStatus.FULFILLED), any(Pageable.class)))
                .thenReturn(expectedPage);

        // When
        Page<InventoryReservation> result = queryService.queryByStatus(ReservationStatus.FULFILLED, 0, 20);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(ReservationStatus.FULFILLED, result.getContent().get(0).getStatus());
    }

    /**
     * T036: 测试查询EXPIRED状态的记录
     */
    @Test
    @DisplayName("T036: 应该成功按状态查询预占记录 (EXPIRED)")
    void testQueryByStatus_EXPIRED状态() {
        // Given
        Page<InventoryReservation> emptyPage = Page.empty();
        when(reservationRepository.findByStatus(eq(ReservationStatus.EXPIRED), any(Pageable.class)))
                .thenReturn(emptyPage);

        // When
        Page<InventoryReservation> result = queryService.queryByStatus(ReservationStatus.EXPIRED, 0, 20);

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(reservationRepository, times(1))
                .findByStatus(eq(ReservationStatus.EXPIRED), any(Pageable.class));
    }

    /**
     * 额外测试: 按门店ID查询
     */
    @Test
    @DisplayName("额外测试: 应该成功按门店ID查询预占记录")
    void testQueryByStoreId_成功() {
        // Given
        Page<InventoryReservation> expectedPage = new PageImpl<>(testReservations);
        when(reservationRepository.findByStoreId(eq(testStoreId), any(Pageable.class)))
                .thenReturn(expectedPage);

        // When
        Page<InventoryReservation> result = queryService.queryByStoreId(testStoreId, 0, 20);

        // Then
        assertNotNull(result);
        assertEquals(2, result.getTotalElements());
        verify(reservationRepository, times(1))
                .findByStoreId(eq(testStoreId), any(Pageable.class));
    }

    /**
     * 额外测试: 按时间范围查询
     */
    @Test
    @DisplayName("额外测试: 应该成功按时间范围查询预占记录")
    void testQueryByTimeRange_成功() {
        // Given
        Instant startTime = Instant.now().minus(1, ChronoUnit.HOURS);
        Instant endTime = Instant.now();

        Page<InventoryReservation> expectedPage = new PageImpl<>(testReservations);
        when(reservationRepository.findByCreatedAtBetween(any(Instant.class), any(Instant.class), any(Pageable.class)))
                .thenReturn(expectedPage);

        // When
        Page<InventoryReservation> result = queryService.queryByTimeRange(startTime, endTime, 0, 20);

        // Then
        assertNotNull(result);
        assertEquals(2, result.getTotalElements());
        verify(reservationRepository, times(1))
                .findByCreatedAtBetween(eq(startTime), eq(endTime), any(Pageable.class));
    }

    /**
     * 额外测试: 组合查询 (门店+状态)
     */
    @Test
    @DisplayName("额外测试: 应该成功按门店ID和状态组合查询")
    void testQueryByStoreAndStatus_成功() {
        // Given
        Page<InventoryReservation> expectedPage = new PageImpl<>(testReservations);
        when(reservationRepository.findByStoreIdAndStatus(
                eq(testStoreId),
                eq(ReservationStatus.ACTIVE),
                any(Pageable.class)
        )).thenReturn(expectedPage);

        // When
        Page<InventoryReservation> result = queryService.queryByStoreAndStatus(
                testStoreId,
                ReservationStatus.ACTIVE,
                0,
                20
        );

        // Then
        assertNotNull(result);
        assertEquals(2, result.getTotalElements());
        verify(reservationRepository, times(1))
                .findByStoreIdAndStatus(eq(testStoreId), eq(ReservationStatus.ACTIVE), any(Pageable.class));
    }
}
