package com.cinema.reservation.controller;

import com.cinema.common.dto.ApiResponse;
import com.cinema.reservation.dto.*;
import com.cinema.reservation.service.ReservationOrderService;
import com.cinema.reservation.repository.ReservationOrderRepository;
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
    private final ReservationOrderRepository reservationRepository;

    public ReservationController(ReservationOrderService reservationService, 
                                  ReservationOrderRepository reservationRepository) {
        this.reservationService = reservationService;
        this.reservationRepository = reservationRepository;
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
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyReservations(
            @RequestHeader(value = "X-User-Id", required = false) UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        if (userId == null) {
            return ResponseEntity.badRequest().body(
                    ApiResponse.failure("用户未登录")
            );
        }
        
        logger.debug("Getting reservations for user: {}", userId);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ReservationListItemDTO> reservations = reservationService.findByUser(userId, pageable);
        
        // 返回符合前端 PageResponse 格式的数据
        Map<String, Object> pageData = Map.of(
                "content", reservations.getContent(),
                "totalElements", reservations.getTotalElements(),
                "totalPages", reservations.getTotalPages(),
                "page", page,
                "size", size,
                "first", reservations.isFirst(),
                "last", reservations.isLast()
        );
        logger.debug("Getting reservations for pageData: {}", pageData);
        
        return ResponseEntity.ok(ApiResponse.success(pageData));
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

    /**
     * 获取待处理订单数量 (C端)
     * GET /api/reservations/pending-count
     *
     * @param userId 用户ID
     * @return 待处理订单数量
     */
    @GetMapping("/pending-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getPendingCount(
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        logger.debug("Getting pending count for user: {}", userId);
        if (userId == null) {
            // 未登录用户返回0
            return ResponseEntity.ok(ApiResponse.success(Map.of("pendingCount", 0L)));
        }
        
        logger.debug("Getting pending count for user: {}", userId);
        
        long count = reservationRepository.countPendingByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("pendingCount", count)));
    }
}
