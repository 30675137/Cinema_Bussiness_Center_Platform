/**
 * @spec O013-order-channel-migration
 * 消费订单控制器 - 新 API 路径
 */
package com.cinema.beverage.controller;

import java.util.UUID;

import jakarta.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.cinema.beverage.dto.BeverageOrderDTO;
import com.cinema.beverage.dto.CreateBeverageOrderRequest;
import com.cinema.beverage.service.BeverageOrderService;
import com.cinema.common.dto.ApiResponse;
import com.cinema.order.service.OrderCancellationService;

import lombok.RequiredArgsConstructor;

/**
 * 消费订单控制器 - C端 API
 *
 * @spec O013-order-channel-migration
 * 新的 API 路径: /api/client/orders
 * 
 * 替代 BeverageOrderController (/api/client/beverage-orders)
 * - 支持通过 channelProductId 下单
 * - 保持与旧 API 相同的接口语义
 * 
 * 注意: BeverageOrderController 保留用于向后兼容，标记为 @Deprecated
 */
@RestController
@RequestMapping("/api/client/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ConsumerOrderController {

    private static final Logger logger = LoggerFactory.getLogger(ConsumerOrderController.class);

    private final BeverageOrderService orderService;
    private final OrderCancellationService cancellationService;

    /**
     * 创建订单
     *
     * POST /api/client/orders
     * 
     * @spec O013-order-channel-migration
     * 请求体变更:
     * - 使用 channelProductId 替代 skuId
     * - selectedSpecs 格式: {"SIZE": {"optionId": "xxx", "optionName": "大杯", "priceAdjust": 300}}
     *
     * @param request 创建订单请求
     * @param userId 用户ID（从认证上下文获取，暂时mock）
     * @return 订单详情
     */
    @PostMapping
    public ResponseEntity<ApiResponse<BeverageOrderDTO>> createOrder(
            @Valid @RequestBody CreateBeverageOrderRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userId
    ) {
        logger.info("ConsumerOrder - CREATE: userId={}, storeId={}, itemCount={}",
                userId, request.getStoreId(), request.getItems().size());

        // TODO: 从认证上下文获取userId，暂时使用mock值
        UUID userIdParsed = userId != null ? UUID.fromString(userId) : UUID.randomUUID();

        BeverageOrderDTO order = orderService.createOrder(request, userIdParsed);
        
        logger.info("ConsumerOrder - CREATED: orderId={}, orderNumber={}", 
                order.getId(), order.getOrderNumber());

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(order));
    }

    /**
     * 支付订单 (Mock)
     *
     * POST /api/client/orders/{id}/pay
     *
     * @param id 订单ID
     * @return 订单详情（包含取餐号）
     */
    @PostMapping("/{id}/pay")
    public ResponseEntity<ApiResponse<BeverageOrderDTO>> payOrder(@PathVariable String id) {
        logger.info("ConsumerOrder - PAY: orderId={}", id);

        UUID orderId = UUID.fromString(id);
        BeverageOrderDTO order = orderService.mockPay(orderId);

        return ResponseEntity.ok(ApiResponse.success(order));
    }

    /**
     * 获取订单详情
     *
     * GET /api/client/orders/{id}
     *
     * @param id 订单ID
     * @return 订单详情
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BeverageOrderDTO>> getOrderById(@PathVariable String id) {
        logger.debug("ConsumerOrder - GET: orderId={}", id);

        UUID orderId = UUID.fromString(id);
        BeverageOrderDTO order = orderService.findById(orderId);

        return ResponseEntity.ok(ApiResponse.success(order));
    }

    /**
     * 获取订单详情（通过订单号）
     *
     * GET /api/client/orders/by-number/{orderNumber}
     *
     * @param orderNumber 订单号
     * @return 订单详情
     */
    @GetMapping("/by-number/{orderNumber}")
    public ResponseEntity<ApiResponse<BeverageOrderDTO>> getOrderByNumber(@PathVariable String orderNumber) {
        logger.debug("ConsumerOrder - GET BY NUMBER: orderNumber={}", orderNumber);

        BeverageOrderDTO order = orderService.findByOrderNumber(orderNumber);

        return ResponseEntity.ok(ApiResponse.success(order));
    }

    /**
     * 获取我的订单列表
     *
     * GET /api/client/orders/my
     *
     * @param userId 用户ID（从认证上下文获取，暂时mock）
     * @param page 页码（从0开始）
     * @param pageSize 每页数量
     * @return 订单列表（分页）
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Page<BeverageOrderDTO>>> getMyOrders(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize
    ) {
        logger.debug("ConsumerOrder - GET MY ORDERS: userId={}, page={}, pageSize={}", userId, page, pageSize);

        // TODO: 从认证上下文获取userId，暂时使用mock值
        UUID userIdParsed = userId != null ? UUID.fromString(userId) : UUID.randomUUID();

        Pageable pageable = PageRequest.of(page, pageSize);
        Page<BeverageOrderDTO> orders = orderService.findByUserId(userIdParsed, pageable);

        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    /**
     * 取消订单
     * 
     * POST /api/client/orders/{id}/cancel
     *
     * @param id 订单ID
     * @param cancelReason 取消原因（可选）
     * @return 订单详情
     */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BeverageOrderDTO>> cancelOrder(
            @PathVariable String id,
            @RequestParam(value = "reason", required = false, defaultValue = "用户取消") String cancelReason
    ) {
        logger.info("ConsumerOrder - CANCEL: orderId={}, reason={}", id, cancelReason);

        UUID orderId = UUID.fromString(id);
        cancellationService.cancelOrder(orderId, cancelReason);

        // 重新查询订单详情返回
        BeverageOrderDTO order = orderService.findById(orderId);

        return ResponseEntity.ok(ApiResponse.success(order));
    }
}
