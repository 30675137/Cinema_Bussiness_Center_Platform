package com.cinema.reservation.controller;

import com.cinema.common.dto.ApiResponse;
import com.cinema.reservation.dto.*;
import com.cinema.reservation.service.ReservationOrderService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * C端预约单控制器
 * <p>
 * 提供 C 端用户预约单相关接口，包括创建预约、查询预约列表、查询详情等。
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-23
 */
@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private static final Logger logger = LoggerFactory.getLogger(ReservationController.class);

    private final ReservationOrderService reservationService;

    public ReservationController(ReservationOrderService reservationService) {
        this.reservationService = reservationService;
    }

    /**
     * 创建预约单 (C端)
     * POST /api/reservations
     *
     * @param userId  用户ID (从请求头或认证上下文获取，这里暂用 header 模拟)
     * @param request 创建请求
     * @return 预约单详情
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ReservationOrderDTO>> createReservation(
            @RequestHeader(value = "X-User-Id", required = false) UUID userId,
            @Valid @RequestBody CreateReservationRequest request) {
        
        logger.info("Creating reservation for user: {}", userId);
        
        // 如果未提供用户ID，使用临时ID（实际应从认证上下文获取）
        if (userId == null) {
            userId = UUID.randomUUID();
            logger.warn("No user ID provided, using temporary ID: {}", userId);
        }
        
        ReservationOrderDTO result = reservationService.createReservation(userId, request);
        
        logger.info("Reservation created successfully: {}", result.getOrderNumber());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(result));
    }

    /**
     * 查询当前用户的预约单列表 (C端)
     * GET /api/reservations/my
     *
     * @param userId 用户ID
     * @param page   页码
     * @param size   每页条数
     * @return 预约单列表
     */
    @GetMapping("/my")
    public ResponseEntity<Map<String, Object>> getMyReservations(
            @RequestHeader(value = "X-User-Id", required = false) UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        if (userId == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "用户未登录"
            ));
        }
        
        logger.debug("Getting reservations for user: {}", userId);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ReservationListItemDTO> reservations = reservationService.findByUser(userId, pageable);
        
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", reservations.getContent(),
                "total", reservations.getTotalElements(),
                "page", page,
                "size", size,
                "totalPages", reservations.getTotalPages()
        ));
    }

    /**
     * 查询预约单详情 (C端)
     * GET /api/reservations/{orderNumber}
     *
     * @param orderNumber 预约单号
     * @return 预约单详情
     */
    @GetMapping("/{orderNumber}")
    public ResponseEntity<ApiResponse<ReservationOrderDTO>> getReservation(
            @PathVariable String orderNumber) {
        
        logger.debug("Getting reservation by orderNumber: {}", orderNumber);
        
        ReservationOrderDTO result = reservationService.findByOrderNumber(orderNumber);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * 支付回调接口 (C端/支付系统调用)
     * POST /api/reservations/{orderNumber}/payment-callback
     *
     * @param orderNumber 预约单号
     * @param paymentId   支付流水号
     * @return 更新后的预约单详情
     */
    @PostMapping("/{orderNumber}/payment-callback")
    public ResponseEntity<ApiResponse<ReservationOrderDTO>> paymentCallback(
            @PathVariable String orderNumber,
            @RequestParam String paymentId) {
        
        logger.info("Payment callback for reservation: {}, paymentId: {}", orderNumber, paymentId);
        
        ReservationOrderDTO result = reservationService.completePayment(orderNumber, paymentId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
