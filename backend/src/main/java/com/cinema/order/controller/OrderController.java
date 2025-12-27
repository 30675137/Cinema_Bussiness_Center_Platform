/**
 * @spec O001-product-order-list
 * 订单管理 REST API 控制器
 */
package com.cinema.order.controller;

import com.cinema.common.dto.ApiResponse;
import com.cinema.order.dto.*;
import com.cinema.order.service.OrderService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 订单管理 REST API 控制器
 *
 * 提供订单查询、详情、状态更新等接口
 */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * GET /api/orders - 订单列表查询 (US1, US2)
     *
     * 支持筛选条件：
     * - status: 订单状态
     * - startDate: 开始日期 (YYYY-MM-DD)
     * - endDate: 结束日期 (YYYY-MM-DD)
     * - search: 搜索关键字（订单号、用户名、手机号）
     * - page: 页码（默认1）
     * - pageSize: 每页数量（默认20）
     *
     * @param params 查询参数
     * @return 订单列表响应
     */
    @GetMapping
    public ResponseEntity<OrderListResponse> getOrders(
        @ModelAttribute OrderQueryParams params
    ) {
        logger.info("GET /api/orders - status={}, page={}, pageSize={}",
            params.getStatus(), params.getPage(), params.getPageSize());

        OrderListResponse response = orderService.findOrders(params);

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/orders/:id - 订单详情查询 (US3)
     *
     * @param id 订单ID
     * @return 订单详情响应
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductOrderDTO>> getOrderById(
        @PathVariable String id
    ) {
        logger.info("GET /api/orders/{}", id);

        ProductOrderDTO order = orderService.findOrderById(id);

        return ResponseEntity.ok(ApiResponse.success(order, "查询成功"));
    }

    /**
     * PUT /api/orders/:id/status - 更新订单状态 (US4)
     *
     * 支持的状态转换:
     * - PENDING_PAYMENT → CANCELLED
     * - PAID → SHIPPED, CANCELLED
     * - SHIPPED → COMPLETED
     *
     * @param id      订单ID
     * @param request 更新请求
     * @return 更新后的订单
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ProductOrderDTO>> updateOrderStatus(
        @PathVariable String id,
        @Valid @RequestBody UpdateStatusRequest request
    ) {
        logger.info("PUT /api/orders/{}/status - newStatus={}, version={}",
            id, request.getStatus(), request.getVersion());

        ProductOrderDTO updatedOrder = orderService.updateOrderStatus(id, request);

        return ResponseEntity.ok(ApiResponse.success(updatedOrder, "订单状态更新成功"));
    }
}
