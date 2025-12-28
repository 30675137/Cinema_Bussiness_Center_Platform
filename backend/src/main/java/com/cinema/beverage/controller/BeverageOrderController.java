/**
 * @spec O003-beverage-order
 * 饮品订单控制器
 */
package com.cinema.beverage.controller;

import java.util.UUID;

import jakarta.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.cinema.beverage.dto.BeverageOrderDTO;
import com.cinema.beverage.dto.CreateBeverageOrderRequest;
import com.cinema.beverage.service.BeverageOrderService;
import com.cinema.common.dto.ApiResponse;

import lombok.RequiredArgsConstructor;

/**
 * 饮品订单控制器 - C端API
 *
 * 对应 spec: O003-beverage-order
 * 提供C端订单创建、支付、查询接口
 */
@RestController
@RequestMapping("/api/client/beverage-orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BeverageOrderController {

    private static final Logger logger = LoggerFactory.getLogger(BeverageOrderController.class);

    private final BeverageOrderService orderService;

    /**
     * 创建订单
     *
     * POST /api/client/beverage-orders
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
        logger.info("创建订单: userId={}, storeId={}", userId, request.getStoreId());

        // TODO: 从认证上下文获取userId，暂时使用mock值
        UUID userIdParsed = userId != null ? UUID.fromString(userId) : UUID.randomUUID();

        BeverageOrderDTO order = orderService.createOrder(request, userIdParsed);

        return ResponseEntity.ok(ApiResponse.success(order));
    }

    /**
     * 支付订单 (Mock)
     *
     * POST /api/client/beverage-orders/{id}/pay
     *
     * @param id 订单ID
     * @return 订单详情（包含取餐号）
     */
    @PostMapping("/{id}/pay")
    public ResponseEntity<ApiResponse<BeverageOrderDTO>> payOrder(@PathVariable String id) {
        logger.info("支付订单: orderId={}", id);

        UUID orderId = UUID.fromString(id);
        BeverageOrderDTO order = orderService.mockPay(orderId);

        return ResponseEntity.ok(ApiResponse.success(order));
    }

    /**
     * 获取订单详情
     *
     * GET /api/client/beverage-orders/{id}
     *
     * @param id 订单ID
     * @return 订单详情
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BeverageOrderDTO>> getOrderById(@PathVariable String id) {
        logger.info("查询订单详情: orderId={}", id);

        UUID orderId = UUID.fromString(id);
        BeverageOrderDTO order = orderService.findById(orderId);

        return ResponseEntity.ok(ApiResponse.success(order));
    }

    /**
     * 获取订单详情（通过订单号）
     *
     * GET /api/client/beverage-orders/by-number/{orderNumber}
     *
     * @param orderNumber 订单号
     * @return 订单详情
     */
    @GetMapping("/by-number/{orderNumber}")
    public ResponseEntity<ApiResponse<BeverageOrderDTO>> getOrderByNumber(@PathVariable String orderNumber) {
        logger.info("查询订单详情: orderNumber={}", orderNumber);

        BeverageOrderDTO order = orderService.findByOrderNumber(orderNumber);

        return ResponseEntity.ok(ApiResponse.success(order));
    }

    /**
     * 获取我的订单列表
     *
     * GET /api/client/beverage-orders/my
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
        logger.info("查询我的订单列表: userId={}, page={}, pageSize={}", userId, page, pageSize);

        // TODO: 从认证上下文获取userId，暂时使用mock值
        UUID userIdParsed = userId != null ? UUID.fromString(userId) : UUID.randomUUID();

        Pageable pageable = PageRequest.of(page, pageSize);
        Page<BeverageOrderDTO> orders = orderService.findByUserId(userIdParsed, pageable);

        return ResponseEntity.ok(ApiResponse.success(orders));
    }
}
