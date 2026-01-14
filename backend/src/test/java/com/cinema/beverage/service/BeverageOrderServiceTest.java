package com.cinema.beverage.service;

import com.cinema.beverage.dto.BeverageOrderDTO;
import com.cinema.beverage.dto.CreateBeverageOrderRequest;
import com.cinema.beverage.entity.Beverage;
import com.cinema.beverage.entity.BeverageOrder;
import com.cinema.beverage.exception.BeverageNotFoundException;
import com.cinema.beverage.repository.BeverageOrderRepository;
import com.cinema.beverage.repository.BeverageRepository;
import com.cinema.beverage.repository.BeverageSpecRepository;
import com.cinema.inventory.entity.InventoryReservation;
import com.cinema.inventory.exception.InsufficientInventoryException;
import com.cinema.inventory.service.InventoryReservationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * @spec O012-order-inventory-reservation
 * BeverageOrderService Unit Tests
 *
 * Test Coverage:
 * - T013: Sufficient inventory scenario
 * - T014: Insufficient inventory scenario
 * - T015: Concurrent order scenario (transaction + row lock)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("BeverageOrderService - Inventory Reservation Integration Tests")
class BeverageOrderServiceTest {

    @Mock
    private BeverageOrderRepository orderRepository;

    @Mock
    private BeverageRepository beverageRepository;

    @Mock
    private BeverageSpecRepository beverageSpecRepository;

    @Mock
    private OrderNumberGenerator orderNumberGenerator;

    @Mock
    private QueueNumberGenerator queueNumberGenerator;

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private InventoryReservationService inventoryReservationService;

    @InjectMocks
    private BeverageOrderService orderService;

    private UUID testUserId;
    private UUID testStoreId;
    private UUID testBeverageId;
    private Beverage testBeverage;
    private CreateBeverageOrderRequest testRequest;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        testStoreId = UUID.randomUUID();
        testBeverageId = UUID.randomUUID();

        // Setup test beverage
        testBeverage = new Beverage();
        testBeverage.setId(testBeverageId);
        testBeverage.setName("Test Latte");
        testBeverage.setBasePrice(BigDecimal.valueOf(30.00));

        // Setup test request
        CreateBeverageOrderRequest.OrderItemRequest item = new CreateBeverageOrderRequest.OrderItemRequest();
        item.setBeverageId(testBeverageId);
        item.setQuantity(2);
        item.setSelectedSpecs(new HashMap<>());

        testRequest = new CreateBeverageOrderRequest();
        testRequest.setStoreId(testStoreId);
        testRequest.setItems(List.of(item));
    }

    /**
     * T013: Test successful order creation with sufficient inventory
     * Verifies:
     * - Inventory reservation is called with correct parameters
     * - Order is created successfully
     * - Reservation order_id is updated
     */
    @Test
    @DisplayName("T013: Should create order successfully when inventory is sufficient")
    void testCreateOrder_SufficientInventory_Success() {
        // Given
        String testOrderNumber = "ORD20260114001";
        when(orderNumberGenerator.generate()).thenReturn(testOrderNumber);
        when(beverageRepository.findById(testBeverageId)).thenReturn(Optional.of(testBeverage));
        when(beverageSpecRepository.findByBeverageIdOrderBySpecTypeAscSortOrderAsc(testBeverageId))
                .thenReturn(Collections.emptyList());

        // Mock inventory reservation success
        InventoryReservation reservation1 = new InventoryReservation();
        reservation1.setId(UUID.randomUUID());
        reservation1.setSkuId(testBeverageId);
        reservation1.setReservedQuantity(BigDecimal.valueOf(2));

        List<InventoryReservation> reservations = List.of(reservation1);
        when(inventoryReservationService.reserveInventory(isNull(), eq(testStoreId), anyMap()))
                .thenReturn(reservations);

        // Mock order save
        BeverageOrder savedOrder = new BeverageOrder();
        savedOrder.setId(UUID.randomUUID());
        savedOrder.setOrderNumber(testOrderNumber);
        savedOrder.setUserId(testUserId);
        savedOrder.setStoreId(testStoreId);
        savedOrder.setTotalPrice(BigDecimal.valueOf(60.00));
        savedOrder.setStatus(BeverageOrder.OrderStatus.PENDING_PAYMENT);

        when(orderRepository.save(any(BeverageOrder.class))).thenReturn(savedOrder);

        // When
        BeverageOrderDTO result = orderService.createOrder(testRequest, testUserId);

        // Then
        assertNotNull(result);
        assertEquals(testOrderNumber, result.getOrderNumber());

        // Verify inventory reservation was called
        verify(inventoryReservationService, times(1))
                .reserveInventory(isNull(), eq(testStoreId), anyMap());

        // Verify order was saved
        verify(orderRepository, times(1)).save(any(BeverageOrder.class));

        // Verify reservation order_id was updated
        assertEquals(savedOrder.getId(), reservation1.getOrderId());
    }

    /**
     * T014: Test order creation failure with insufficient inventory
     * Verifies:
     * - InsufficientInventoryException is thrown
     * - Exception contains correct shortage details
     * - Transaction rolls back (order not created)
     */
    @Test
    @DisplayName("T014: Should throw exception when inventory is insufficient")
    void testCreateOrder_InsufficientInventory_ThrowsException() {
        // Given
        String testOrderNumber = "ORD20260114002";
        when(orderNumberGenerator.generate()).thenReturn(testOrderNumber);
        when(beverageRepository.findById(testBeverageId)).thenReturn(Optional.of(testBeverage));
        when(beverageSpecRepository.findByBeverageIdOrderBySpecTypeAscSortOrderAsc(testBeverageId))
                .thenReturn(Collections.emptyList());

        // Mock inventory reservation failure
        InsufficientInventoryException.InventoryShortage shortage =
                new InsufficientInventoryException.InventoryShortage(
                        testBeverageId,
                        "Test Latte",
                        BigDecimal.valueOf(1.0),  // available
                        BigDecimal.valueOf(2.0),  // required
                        BigDecimal.valueOf(1.0),  // shortage
                        "杯"
                );

        InsufficientInventoryException expectedException =
                new InsufficientInventoryException(List.of(shortage));

        when(inventoryReservationService.reserveInventory(isNull(), eq(testStoreId), anyMap()))
                .thenThrow(expectedException);

        // When & Then
        InsufficientInventoryException thrown = assertThrows(
                InsufficientInventoryException.class,
                () -> orderService.createOrder(testRequest, testUserId)
        );

        // Verify exception details
        assertNotNull(thrown.getShortages());
        assertEquals(1, thrown.getShortages().size());

        InsufficientInventoryException.InventoryShortage resultShortage = thrown.getShortages().get(0);
        assertEquals(testBeverageId, resultShortage.skuId());
        assertEquals("Test Latte", resultShortage.skuName());
        assertEquals(BigDecimal.valueOf(1.0), resultShortage.available());
        assertEquals(BigDecimal.valueOf(2.0), resultShortage.required());
        assertEquals(BigDecimal.valueOf(1.0), resultShortage.shortage());

        // Verify order was NOT saved (transaction rollback)
        verify(orderRepository, never()).save(any(BeverageOrder.class));
    }

    /**
     * T015: Test concurrent order scenario
     * Verifies:
     * - Service relies on P005's pessimistic locking (SELECT FOR UPDATE)
     * - Transaction isolation prevents overselling
     * - Only successful orders complete
     *
     * Note: This is a unit test demonstrating the expected behavior.
     * Actual concurrency testing requires integration tests with real database.
     */
    @Test
    @DisplayName("T015: Should handle concurrent orders safely with row-level locking")
    void testCreateOrder_ConcurrentScenario_PreventOverselling() {
        // Given: Simulate two concurrent orders for the same SKU
        String orderNumber1 = "ORD20260114003";
        String orderNumber2 = "ORD20260114004";

        when(orderNumberGenerator.generate())
                .thenReturn(orderNumber1)
                .thenReturn(orderNumber2);

        when(beverageRepository.findById(testBeverageId))
                .thenReturn(Optional.of(testBeverage));

        when(beverageSpecRepository.findByBeverageIdOrderBySpecTypeAscSortOrderAsc(testBeverageId))
                .thenReturn(Collections.emptyList());

        // Mock successful reservation for first order
        InventoryReservation reservation1 = new InventoryReservation();
        reservation1.setId(UUID.randomUUID());
        reservation1.setSkuId(testBeverageId);
        reservation1.setReservedQuantity(BigDecimal.valueOf(2));

        when(inventoryReservationService.reserveInventory(isNull(), eq(testStoreId), anyMap()))
                .thenReturn(List.of(reservation1))
                .thenThrow(new InsufficientInventoryException(
                        new InsufficientInventoryException.InventoryShortage(
                                testBeverageId,
                                "Test Latte",
                                BigDecimal.ZERO,  // no inventory left
                                BigDecimal.valueOf(2.0),
                                BigDecimal.valueOf(2.0),
                                "杯"
                        )
                ));

        BeverageOrder savedOrder1 = new BeverageOrder();
        savedOrder1.setId(UUID.randomUUID());
        savedOrder1.setOrderNumber(orderNumber1);

        when(orderRepository.save(any(BeverageOrder.class))).thenReturn(savedOrder1);

        // When: First order succeeds
        BeverageOrderDTO result1 = orderService.createOrder(testRequest, testUserId);
        assertNotNull(result1);
        assertEquals(orderNumber1, result1.getOrderNumber());

        // When: Second order fails due to insufficient inventory
        assertThrows(
                InsufficientInventoryException.class,
                () -> orderService.createOrder(testRequest, testUserId)
        );

        // Then: Verify inventory service was called twice (once for each order)
        verify(inventoryReservationService, times(2))
                .reserveInventory(isNull(), eq(testStoreId), anyMap());

        // Verify only first order was saved (second rolled back)
        verify(orderRepository, times(1)).save(any(BeverageOrder.class));
    }

    /**
     * Additional Test: Order creation with invalid beverage ID
     * Verifies exception handling for non-existent beverages
     */
    @Test
    @DisplayName("Should throw BeverageNotFoundException when beverage does not exist")
    void testCreateOrder_BeverageNotFound_ThrowsException() {
        // Given
        when(beverageRepository.findById(testBeverageId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(
                BeverageNotFoundException.class,
                () -> orderService.createOrder(testRequest, testUserId)
        );

        // Verify reservation service was never called
        verify(inventoryReservationService, never())
                .reserveInventory(any(), any(), anyMap());
    }
}
