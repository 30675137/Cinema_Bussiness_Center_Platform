/**
 * @spec O003-beverage-order
 * @spec O012-order-inventory-reservation
 * 饮品订单业务逻辑层
 */
package com.cinema.beverage.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinema.beverage.dto.BeverageOrderDTO;
import com.cinema.beverage.dto.CreateBeverageOrderRequest;
import com.cinema.beverage.entity.BeverageOrder;
import com.cinema.beverage.entity.BeverageOrderItem;
import com.cinema.beverage.entity.QueueNumber;
import com.cinema.beverage.exception.OrderNotFoundException;
import com.cinema.beverage.repository.BeverageOrderRepository;
import com.cinema.hallstore.domain.Sku;
import com.cinema.hallstore.domain.enums.SkuType;
import com.cinema.hallstore.repository.SkuJpaRepository;
import com.cinema.inventory.entity.InventoryReservation;
import com.cinema.inventory.exception.InsufficientInventoryException;
import com.cinema.inventory.service.InventoryReservationService;
import com.cinema.product.exception.SkuNotFoundException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

/**
 * 饮品订单服务类
 *
 * 对应 spec: O003-beverage-order, O012-order-inventory-reservation
 * 提供订单创建、支付、查询等业务逻辑
 * 
 * O012 集成:
 * - 订单创建时自动调用库存预占服务
 * - 处理库存不足异常
 * - 预占失败时回滚订单创建
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BeverageOrderService {

    private static final Logger logger = LoggerFactory.getLogger(BeverageOrderService.class);

    private final BeverageOrderRepository orderRepository;
    private final SkuJpaRepository skuRepository; // @clarification 2026-01-14: 使用SKU表替代Beverage表
    private final OrderNumberGenerator orderNumberGenerator;
    private final QueueNumberGenerator queueNumberGenerator;
    private final ObjectMapper objectMapper;
    private final InventoryReservationService inventoryReservationService; // O012 integration

    /**
     * Mock支付延迟(毫秒)
     */
    @Value("${beverage.payment.mock-delay-ms:500}")
    private long mockPaymentDelayMs;

    /**
     * 创建订单
     *
     * O012 集成:
     * 1. 计算订单总价
     * 2. 调用库存预占服务(BOM展开 + 库存检查 + 预占)
     * 3. 创建订单记录
     * 4. 更新预占记录的order_id
     *
     * @param request 创建订单请求
     * @param userId 用户ID
     * @return 订单DTO
     * @throws InsufficientInventoryException 库存不足时抛出
     */
    @Transactional(timeout = 30) // O012: 预占需要更长超时时间
    public BeverageOrderDTO createOrder(CreateBeverageOrderRequest request, UUID userId) {
        // Structured logging for order creation (FR-027)
        logger.info("OrderCreation - START: userId={}, storeId={}, itemCount={}, operation=CREATE_ORDER",
                userId, request.getStoreId(), request.getItems().size());

        // 1. 生成订单号
        String orderNumber = orderNumberGenerator.generate();

        // 2. 计算订单总价
        BigDecimal totalPrice = calculateOrderTotal(request);

        // 3. O012: 调用库存预占服务
        Map<UUID, BigDecimal> skuQuantities = extractSkuQuantities(request);
        List<InventoryReservation> reservations;
        
        try {
            // 注意: orderId 此时为null，稍后更新
            reservations = inventoryReservationService.reserveInventory(
                null, 
                request.getStoreId(), 
                skuQuantities
            );
            
            logger.info("OrderCreation - INVENTORY_RESERVED: orderNumber={}, reservationCount={}",
                    orderNumber, reservations.size());
                    
        } catch (InsufficientInventoryException e) {
            // 库存不足,记录日志并抛出异常(事务会自动回滚)
            logger.warn("OrderCreation - FAILED: orderNumber={}, reason=INSUFFICIENT_INVENTORY, shortageCount={}",
                    orderNumber, e.getShortages().size());
            throw e; // 传递给Controller层处理
        }

        // 4. 创建订单
        BeverageOrder order = BeverageOrder.builder()
                .orderNumber(orderNumber)
                .userId(userId)
                .storeId(request.getStoreId())
                .totalPrice(totalPrice)
                .status(BeverageOrder.OrderStatus.PENDING_PAYMENT)
                .customerNote(request.getCustomerNote())
                .build();

        // 5. 创建订单项
        for (CreateBeverageOrderRequest.OrderItemRequest itemRequest : request.getItems()) {
            BeverageOrderItem orderItem = createOrderItem(order, itemRequest);
            order.addItem(orderItem);
        }

        // 6. 保存订单
        BeverageOrder savedOrder = orderRepository.save(order);
        
        // 7. O012: 更新预占记录的order_id
        for (InventoryReservation reservation : reservations) {
            reservation.setOrderId(savedOrder.getId());
        }

        // Structured logging for order creation success (FR-027)
        logger.info("OrderCreation - SUCCESS: orderNumber={}, totalPrice={}, orderId={}, itemCount={}, reservationCount={}, operation=CREATE_ORDER, status=PENDING_PAYMENT",
                orderNumber, totalPrice, savedOrder.getId(), savedOrder.getItems().size(), reservations.size());

        return BeverageOrderDTO.fromEntity(savedOrder);
    }

    /**
     * 计算订单总价
     * @clarification 2026-01-14: 使用SKU ID查询SKU表获取价格
     * @clarification 2026-01-14: 验证SKU类型，仅成品和套餐可下单
     *
     * @param request 创建订单请求
     * @return 订单总价
     */
    public BigDecimal calculateOrderTotal(CreateBeverageOrderRequest request) {
        BigDecimal total = BigDecimal.ZERO;

        for (CreateBeverageOrderRequest.OrderItemRequest item : request.getItems()) {
            // 查询SKU
            Sku sku = skuRepository.findById(item.getSkuId())
                    .orElseThrow(() -> new SkuNotFoundException(item.getSkuId()));

            // 验证SKU类型：只有成品(FINISHED_PRODUCT)和套餐(COMBO)可以下单
            if (sku.getSkuType() != SkuType.FINISHED_PRODUCT && sku.getSkuType() != SkuType.COMBO) {
                String errorMsg = String.format(
                    "SKU [%s] 类型为 [%s]，不能用于创建订单。只有成品(FINISHED_PRODUCT)和套餐(COMBO)可以下单",
                    sku.getName(),
                    sku.getSkuType()
                );
                logger.error("OrderCreation - VALIDATION_FAILED: skuId={}, skuType={}, reason=INVALID_SKU_TYPE",
                        sku.getId(), sku.getSkuType());
                throw new IllegalArgumentException(errorMsg);
            }

            // SKU价格 (SKU已包含规格价格，无需额外计算)
            BigDecimal itemPrice = sku.getPrice();

            // 乘以数量
            BigDecimal itemTotal = itemPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
            total = total.add(itemTotal);
        }

        return total;
    }

    /**
     * 创建订单项
     * @clarification 2026-01-14: 使用SKU ID查询SKU表
     */
    private BeverageOrderItem createOrderItem(BeverageOrder order, CreateBeverageOrderRequest.OrderItemRequest itemRequest) {
        // 查询SKU
        Sku sku = skuRepository.findById(itemRequest.getSkuId())
                .orElseThrow(() -> new SkuNotFoundException(itemRequest.getSkuId()));

        // SKU价格
        BigDecimal unitPrice = sku.getPrice();

        // 计算小计
        BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(itemRequest.getQuantity()));

        // 序列化规格
        String selectedSpecsJson;
        try {
            selectedSpecsJson = objectMapper.writeValueAsString(itemRequest.getSelectedSpecs());
        } catch (JsonProcessingException e) {
            logger.error("序列化规格失败", e);
            selectedSpecsJson = "{}";
        }

        return BeverageOrderItem.builder()
                .beverageId(sku.getId()) // @clarification: 存储SKU ID
                .beverageName(sku.getName())
                .beverageImageUrl(null) // SKU无图片字段，后续可从关联表获取
                .selectedSpecs(selectedSpecsJson)
                .quantity(itemRequest.getQuantity())
                .unitPrice(unitPrice)
                .subtotal(subtotal)
                .customerNote(itemRequest.getCustomerNote())
                .build();
    }

    /**
     * Mock支付
     *
     * @param orderId 订单ID
     * @return 订单DTO（包含取餐号）
     */
    @Transactional
    public BeverageOrderDTO mockPay(UUID orderId) {
        // Structured logging for payment start (FR-027)
        logger.info("Payment - START: orderId={}, operation=PAY_ORDER",
                orderId);

        // 1. 查询订单
        BeverageOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId.toString()));

        // 2. 检查订单状态
        if (order.getStatus() != BeverageOrder.OrderStatus.PENDING_PAYMENT) {
            // Structured error logging (FR-027)
            logger.error("Payment - FAILED: orderId={}, orderNumber={}, currentStatus={}, expectedStatus=PENDING_PAYMENT, operation=PAY_ORDER, reason=INVALID_STATUS",
                    orderId, order.getOrderNumber(), order.getStatus());
            throw new IllegalStateException("订单状态不正确，无法支付: " + order.getStatus());
        }

        // 3. Mock支付延迟
        try {
            Thread.sleep(mockPaymentDelayMs);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            logger.warn("Mock支付延迟被中断", e);
        }

        // 4. 更新订单状态
        order.setStatus(BeverageOrder.OrderStatus.PENDING_PRODUCTION);
        order.setPaymentMethod("MOCK_PAYMENT");
        order.setTransactionId("MOCK_TXN_" + System.currentTimeMillis());
        order.setPaidAt(LocalDateTime.now());

        // 5. 生成取餐号
        QueueNumber queueNumber = queueNumberGenerator.generate(order.getStoreId(), order.getId());

        // 6. 保存订单
        BeverageOrder savedOrder = orderRepository.save(order);

        // Structured logging for payment success (FR-027 audit requirements)
        logger.info("Payment - SUCCESS: orderId={}, orderNumber={}, userId={}, storeId={}, amount={}, method={}, txnId={}, queueNumber={}, operation=PAY_ORDER, newStatus=PENDING_PRODUCTION",
                orderId, order.getOrderNumber(), order.getUserId(), order.getStoreId(),
                order.getTotalPrice(), order.getPaymentMethod(), order.getTransactionId(),
                queueNumber.getQueueNumber());

        return BeverageOrderDTO.fromEntity(savedOrder, queueNumber.getQueueNumber());
    }

    /**
     * 根据ID查询订单
     */
    public BeverageOrderDTO findById(UUID orderId) {
        logger.debug("查询订单: orderId={}", orderId);

        BeverageOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId.toString()));

        return BeverageOrderDTO.fromEntity(order);
    }

    /**
     * 根据订单号查询订单
     */
    public BeverageOrderDTO findByOrderNumber(String orderNumber) {
        logger.debug("查询订单: orderNumber={}", orderNumber);

        BeverageOrder order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new OrderNotFoundException(orderNumber, true));

        return BeverageOrderDTO.fromEntity(order);
    }

    /**
     * 查询用户订单列表
     */
    public Page<BeverageOrderDTO> findByUserId(UUID userId, Pageable pageable) {
        logger.debug("查询用户订单列表: userId={}", userId);

        Page<BeverageOrder> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);

        return orders.map(BeverageOrderDTO::fromEntity);
    }

    /**
     * 查询订单历史（支持筛选）
     *
     * US3: FR-019
     * 用户能够查看历史订单列表，按时间倒序排列
     *
     * @param userId 用户ID（可选，C端用，B端可为null查询全部）
     * @param storeId 门店ID（可选）
     * @param status 订单状态（可选）
     * @param startDate 起始日期（可选）
     * @param endDate 截止日期（可选）
     * @param pageable 分页参数
     * @return 订单历史列表（分页）
     */
    public Page<BeverageOrderDTO> findOrderHistory(
            UUID userId,
            UUID storeId,
            BeverageOrder.OrderStatus status,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable) {

        logger.debug("查询订单历史: userId={}, storeId={}, status={}, startDate={}, endDate={}",
                userId, storeId, status, startDate, endDate);

        Page<BeverageOrder> orders;

        // 根据过滤条件组合查询
        if (userId != null && status != null) {
            // 用户 + 状态筛选
            orders = orderRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status, pageable);
        } else if (userId != null && startDate != null && endDate != null) {
            // 用户 + 时间范围
            orders = orderRepository.findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(
                    userId, startDate, endDate, pageable);
        } else if (userId != null) {
            // 仅用户筛选
            orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        } else if (storeId != null && status != null) {
            // 门店 + 状态
            orders = orderRepository.findByStoreIdAndStatusOrderByCreatedAtDesc(storeId, status, pageable);
        } else if (storeId != null && startDate != null && endDate != null) {
            // 门店 + 时间范围
            orders = orderRepository.findByStoreIdAndCreatedAtBetweenOrderByCreatedAtDesc(
                    storeId, startDate, endDate, pageable);
        } else if (storeId != null) {
            // 仅门店筛选
            orders = orderRepository.findByStoreIdOrderByCreatedAtDesc(storeId, pageable);
        } else if (status != null && startDate != null && endDate != null) {
            // 状态 + 时间范围
            orders = orderRepository.findByStatusAndCreatedAtBetweenOrderByCreatedAtDesc(
                    status, startDate, endDate, pageable);
        } else {
            // 无筛选条件，查询全部（B端场景）
            orders = orderRepository.findAllByOrderByCreatedAtDesc(pageable);
        }

        return orders.map(BeverageOrderDTO::fromEntity);
    }

    /**
     * O012: 提取SKU数量映射表
     * @clarification 2026-01-14: 前端直接传入SKU ID，无需再查询转换
     *
     * @param request 订单创建请求
     * @return SKU ID到数量的映射
     */
    private Map<UUID, BigDecimal> extractSkuQuantities(CreateBeverageOrderRequest request) {
        Map<UUID, BigDecimal> skuQuantities = new HashMap<>();
        
        for (CreateBeverageOrderRequest.OrderItemRequest item : request.getItems()) {
            // 直接使用传入的SKU ID
            UUID skuId = item.getSkuId();
            BigDecimal quantity = BigDecimal.valueOf(item.getQuantity());
            
            // 如果同SKU多次出现,累加数量
            skuQuantities.merge(skuId, quantity, BigDecimal::add);
        }
        
        return skuQuantities;
    }
}
