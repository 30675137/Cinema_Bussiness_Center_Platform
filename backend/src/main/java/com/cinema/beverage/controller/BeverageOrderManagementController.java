/**
 * @spec O003-beverage-order
 * 饮品订单管理控制器 (B端)
 */
package com.cinema.beverage.controller;

import java.util.List;
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
import com.cinema.beverage.dto.UpdateOrderStatusRequest;
import com.cinema.beverage.entity.BeverageOrder;
import com.cinema.beverage.service.BeverageOrderManagementService;
import com.cinema.common.dto.ApiResponse;

import lombok.RequiredArgsConstructor;

/**
 * 饮品订单管理控制器 - B端API
 *
 * 对应 spec: O003-beverage-order
 * 提供B端订单管理、状态更新、叫号等功能
 */
@RestController
@RequestMapping("/api/admin/beverage-orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BeverageOrderManagementController {

    private static final Logger logger = LoggerFactory.getLogger(BeverageOrderManagementController.class);

    private final BeverageOrderManagementService orderManagementService;

    /**
     * 查询订单列表（支持状态筛选）
     *
     * GET /api/admin/beverage-orders
     *
     * @param storeId 门店ID（可选）
     * @param status 订单状态（可选）
     * @param page 页码（从0开始）
     * @param pageSize 每页数量
     * @return 订单列表（分页）
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<BeverageOrderDTO>>> getOrders(
            @RequestParam(required = false) String storeId,
            @RequestParam(required = false) BeverageOrder.OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize
    ) {
        logger.info("B端查询订单列表: storeId={}, status={}, page={}, pageSize={}",
                storeId, status, page, pageSize);

        UUID storeIdParsed = storeId != null ? UUID.fromString(storeId) : null;
        Pageable pageable = PageRequest.of(page, pageSize);

        Page<BeverageOrderDTO> orders = orderManagementService.findOrders(
                storeIdParsed, status, pageable);

        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    /**
     * 查询待处理订单（待制作 + 制作中）
     *
     * GET /api/admin/beverage-orders/pending
     *
     * @param storeId 门店ID
     * @return 待处理订单列表
     */
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<BeverageOrderDTO>>> getPendingOrders(
            @RequestParam String storeId
    ) {
        logger.info("B端查询待处理订单: storeId={}", storeId);

        UUID storeIdParsed = UUID.fromString(storeId);
        List<BeverageOrderDTO> orders = orderManagementService.findPendingOrders(storeIdParsed);

        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    /**
     * 更新订单状态
     *
     * PUT /api/admin/beverage-orders/{id}/status
     *
     * @param id 订单ID
     * @param request 状态更新请求
     * @return 更新后的订单详情
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<BeverageOrderDTO>> updateOrderStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        logger.info("B端更新订单状态: orderId={}, targetStatus={}", id, request.getTargetStatus());

        UUID orderId = UUID.fromString(id);
        BeverageOrderDTO order = orderManagementService.updateOrderStatus(
                orderId, request.getTargetStatus());

        return ResponseEntity.ok(ApiResponse.success(order));
    }

    /**
     * 开始制作订单（待制作 -> 制作中）
     *
     * POST /api/admin/beverage-orders/{id}/start-production
     *
     * @param id 订单ID
     * @return 更新后的订单详情
     */
    @PostMapping("/{id}/start-production")
    public ResponseEntity<ApiResponse<BeverageOrderDTO>> startProduction(@PathVariable String id) {
        logger.info("B端开始制作订单: orderId={}", id);

        UUID orderId = UUID.fromString(id);
        BeverageOrderDTO order = orderManagementService.updateOrderStatus(
                orderId, BeverageOrder.OrderStatus.PRODUCING);

        return ResponseEntity.ok(ApiResponse.success(order));
    }

    /**
     * 完成制作（制作中 -> 已完成）
     *
     * POST /api/admin/beverage-orders/{id}/complete
     *
     * @param id 订单ID
     * @return 更新后的订单详情
     */
    @PostMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<BeverageOrderDTO>> completeOrder(@PathVariable String id) {
        logger.info("B端完成订单制作: orderId={}", id);

        UUID orderId = UUID.fromString(id);
        BeverageOrderDTO order = orderManagementService.updateOrderStatus(
                orderId, BeverageOrder.OrderStatus.COMPLETED);

        return ResponseEntity.ok(ApiResponse.success(order));
    }

    /**
     * 交付订单（已完成 -> 已交付）
     *
     * POST /api/admin/beverage-orders/{id}/deliver
     *
     * @param id 订单ID
     * @return 更新后的订单详情
     */
    @PostMapping("/{id}/deliver")
    public ResponseEntity<ApiResponse<BeverageOrderDTO>> deliverOrder(@PathVariable String id) {
        logger.info("B端交付订单: orderId={}", id);

        UUID orderId = UUID.fromString(id);
        BeverageOrderDTO order = orderManagementService.updateOrderStatus(
                orderId, BeverageOrder.OrderStatus.DELIVERED);

        return ResponseEntity.ok(ApiResponse.success(order));
    }

    /**
     * 取消订单
     *
     * POST /api/admin/beverage-orders/{id}/cancel
     *
     * @param id 订单ID
     * @return 更新后的订单详情
     */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BeverageOrderDTO>> cancelOrder(@PathVariable String id) {
        logger.info("B端取消订单: orderId={}", id);

        UUID orderId = UUID.fromString(id);
        BeverageOrderDTO order = orderManagementService.updateOrderStatus(
                orderId, BeverageOrder.OrderStatus.CANCELLED);

        return ResponseEntity.ok(ApiResponse.success(order));
    }
}
