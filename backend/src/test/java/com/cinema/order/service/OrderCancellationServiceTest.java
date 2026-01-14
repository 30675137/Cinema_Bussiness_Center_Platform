package com.cinema.order.service;

import com.cinema.inventory.service.InventoryReservationService;
import com.cinema.order.domain.ProductOrder;
import com.cinema.order.domain.OrderStatus;
import com.cinema.order.exception.OrderNotFoundException;
import com.cinema.order.repository.JdbcProductOrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * @spec O012-order-inventory-reservation
 * OrderCancellationService Unit Tests
 *
 * Test Coverage:
 * - T027: Order cancellation with reservation release
 * - T028: Order cancellation validation (status check)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("OrderCancellationService - Order Cancellation Tests")
class OrderCancellationServiceTest {

    @Mock
    private InventoryReservationService reservationService;

    @Mock
    private JdbcProductOrderRepository orderRepository;

    @InjectMocks
    private OrderCancellationService cancellationService;

    private UUID testOrderId;
    private ProductOrder testOrder;

    @BeforeEach
    void setUp() {
        testOrderId = UUID.randomUUID();

        testOrder = new ProductOrder();
        testOrder.setId(testOrderId);
        testOrder.setOrderNumber("ORD20260114001");
        testOrder.setStatus(OrderStatus.PENDING_PAYMENT);
    }

    /**
     * T027: Test successful order cancellation with reservation release
     * Verifies:
     * - Order status is validated
     * - Reservation is released successfully
     * - Order status is updated to CANCELLED
     */
    @Test
    @DisplayName("T027: Should cancel order and release reservation successfully")
    void testCancelOrder_Success() {
        // Given
        when(orderRepository.findById(testOrderId)).thenReturn(testOrder);
        when(reservationService.releaseReservation(testOrderId)).thenReturn(3); // 3 reservations released
        when(orderRepository.updateOrderStatus(any(ProductOrder.class))).thenReturn(1);

        // When
        cancellationService.cancelOrder(testOrderId, "用户取消");

        // Then
        // Verify order status updated
        assertEquals(OrderStatus.CANCELLED, testOrder.getStatus());

        // Verify reservation release was called
        verify(reservationService, times(1)).releaseReservation(testOrderId);

        // Verify order was updated
        verify(orderRepository, times(1)).updateOrderStatus(testOrder);
    }

    /**
     * T027: Test order cancellation when reservation release fails
     * Verifies:
     * - Cancellation proceeds even if reservation release fails
     * - Error is logged but not thrown
     */
    @Test
    @DisplayName("T027: Should proceed with cancellation even if reservation release fails")
    void testCancelOrder_ReservationReleaseFailure() {
        // Given
        when(orderRepository.findById(testOrderId)).thenReturn(testOrder);
        when(reservationService.releaseReservation(testOrderId))
                .thenThrow(new RuntimeException("Reservation release failed"));
        when(orderRepository.updateOrderStatus(any(ProductOrder.class))).thenReturn(1);

        // When & Then - should not throw exception
        assertDoesNotThrow(() -> cancellationService.cancelOrder(testOrderId, "用户取消"));

        // Verify order status still updated
        assertEquals(OrderStatus.CANCELLED, testOrder.getStatus());

        // Verify order was updated
        verify(orderRepository, times(1)).updateOrderStatus(testOrder);
    }

    /**
     * T028: Test order cancellation with invalid status
     * Verifies:
     * - Only PENDING_PAYMENT and PAID orders can be cancelled
     * - COMPLETED orders cannot be cancelled
     * - CANCELLED orders cannot be cancelled again
     */
    @Test
    @DisplayName("T028: Should throw exception when order status is not cancellable (COMPLETED)")
    void testCancelOrder_InvalidStatus_Completed() {
        // Given
        testOrder.setStatus(OrderStatus.COMPLETED);
        when(orderRepository.findById(testOrderId)).thenReturn(testOrder);

        // When & Then
        IllegalStateException thrown = assertThrows(
                IllegalStateException.class,
                () -> cancellationService.cancelOrder(testOrderId, "用户取消")
        );

        // Verify error message
        assertTrue(thrown.getMessage().contains("not cancellable"));

        // Verify reservation service was never called
        verify(reservationService, never()).releaseReservation(any());

        // Verify order was not updated
        verify(orderRepository, never()).updateOrderStatus(any());
    }

    /**
     * T028: Test order cancellation when order is already cancelled
     */
    @Test
    @DisplayName("T028: Should throw exception when order is already cancelled")
    void testCancelOrder_InvalidStatus_AlreadyCancelled() {
        // Given
        testOrder.setStatus(OrderStatus.CANCELLED);
        when(orderRepository.findById(testOrderId)).thenReturn(testOrder);

        // When & Then
        IllegalStateException thrown = assertThrows(
                IllegalStateException.class,
                () -> cancellationService.cancelOrder(testOrderId, "用户取消")
        );

        assertTrue(thrown.getMessage().contains("not cancellable"));

        // Verify reservation service was never called
        verify(reservationService, never()).releaseReservation(any());
    }

    /**
     * T028: Test order cancellation with PAID status (should succeed)
     */
    @Test
    @DisplayName("T028: Should cancel PAID order successfully")
    void testCancelOrder_PaidStatus_Success() {
        // Given
        testOrder.setStatus(OrderStatus.PAID);
        when(orderRepository.findById(testOrderId)).thenReturn(testOrder);
        when(reservationService.releaseReservation(testOrderId)).thenReturn(2);
        when(orderRepository.updateOrderStatus(any(ProductOrder.class))).thenReturn(1); // Mock successful update

        // When
        cancellationService.cancelOrder(testOrderId, "用户取消");

        // Then
        assertEquals(OrderStatus.CANCELLED, testOrder.getStatus());
        verify(reservationService, times(1)).releaseReservation(testOrderId);
        verify(orderRepository, times(1)).updateOrderStatus(testOrder);
    }

    /**
     * Additional Test: Order not found scenario
     */
    @Test
    @DisplayName("Should throw OrderNotFoundException when order does not exist")
    void testCancelOrder_OrderNotFound() {
        // Given
        when(orderRepository.findById(testOrderId)).thenReturn(null);

        // When & Then
        assertThrows(
                OrderNotFoundException.class,
                () -> cancellationService.cancelOrder(testOrderId, "用户取消")
        );

        // Verify reservation service was never called
        verify(reservationService, never()).releaseReservation(any());
    }
}
