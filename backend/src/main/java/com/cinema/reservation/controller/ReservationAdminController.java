package com.cinema.reservation.controller;

import com.cinema.common.dto.ApiResponse;
import com.cinema.reservation.dto.*;
import com.cinema.reservation.service.ReservationOrderService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * B端预约单管理控制器
 * <p>
 * 提供 B 端运营平台预约单管理接口，包括查询列表、查看详情、确认、取消、修改等。
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-23
 */
@RestController
@RequestMapping("/api/admin/reservations")
public class ReservationAdminController {

    private static final Logger logger = LoggerFactory.getLogger(ReservationAdminController.class);

    private final ReservationOrderService reservationService;

    public ReservationAdminController(ReservationOrderService reservationService) {
        this.reservationService = reservationService;
    }

    /**
     * 查询预约单列表 (B端)
     * GET /api/admin/reservations
     *
     * @param query 查询条件
     * @return 分页结果
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getReservations(
            @ModelAttribute ReservationListQueryRequest query) {
        
        logger.debug("Getting reservations with query: {}", query);
        
        Page<ReservationListItemDTO> reservations = reservationService.findByConditions(query);
        
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", reservations.getContent(),
                "total", reservations.getTotalElements(),
                "page", query.getPage(),
                "size", query.getSize(),
                "totalPages", reservations.getTotalPages()
        ));
    }

    /**
     * 查询预约单详情 (B端)
     * GET /api/admin/reservations/{id}
     *
     * @param id 预约单ID
     * @return 预约单详情
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReservationOrderDTO>> getReservation(
            @PathVariable UUID id) {
        
        logger.debug("Getting reservation by id: {}", id);
        
        ReservationOrderDTO result = reservationService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * 确认预约单 (B端)
     * POST /api/admin/reservations/{id}/confirm
     *
     * @param id         预约单ID
     * @param operatorId 操作人ID (从请求头或认证上下文获取)
     * @param request    确认请求
     * @return 更新后的预约单详情
     */
    @PostMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<ReservationOrderDTO>> confirmReservation(
            @PathVariable UUID id,
            @RequestHeader(value = "X-Operator-Id", required = false) UUID operatorId,
            @Valid @RequestBody ConfirmReservationRequest request) {
        
        logger.info("Confirming reservation: {}, operatorId: {}", id, operatorId);
        
        // 如果未提供操作人ID，使用临时ID（实际应从认证上下文获取）
        if (operatorId == null) {
            operatorId = UUID.randomUUID();
            logger.warn("No operator ID provided, using temporary ID: {}", operatorId);
        }
        
        ReservationOrderDTO result = reservationService.confirmReservation(id, request, operatorId);
        
        logger.info("Reservation confirmed: {}", result.getOrderNumber());
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * 取消预约单 (B端)
     * POST /api/admin/reservations/{id}/cancel
     *
     * @param id         预约单ID
     * @param operatorId 操作人ID
     * @param request    取消请求
     * @return 更新后的预约单详情
     */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<ReservationOrderDTO>> cancelReservation(
            @PathVariable UUID id,
            @RequestHeader(value = "X-Operator-Id", required = false) UUID operatorId,
            @Valid @RequestBody CancelReservationRequest request) {
        
        logger.info("Cancelling reservation: {}, operatorId: {}", id, operatorId);
        
        if (operatorId == null) {
            operatorId = UUID.randomUUID();
            logger.warn("No operator ID provided, using temporary ID: {}", operatorId);
        }
        
        ReservationOrderDTO result = reservationService.cancelReservation(id, request, operatorId);
        
        logger.info("Reservation cancelled: {}", result.getOrderNumber());
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * 修改预约单 (B端)
     * PUT /api/admin/reservations/{id}
     *
     * @param id         预约单ID
     * @param operatorId 操作人ID
     * @param request    修改请求
     * @return 更新后的预约单详情
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ReservationOrderDTO>> updateReservation(
            @PathVariable UUID id,
            @RequestHeader(value = "X-Operator-Id", required = false) UUID operatorId,
            @Valid @RequestBody UpdateReservationRequest request) {
        
        logger.info("Updating reservation: {}, operatorId: {}", id, operatorId);
        
        if (operatorId == null) {
            operatorId = UUID.randomUUID();
            logger.warn("No operator ID provided, using temporary ID: {}", operatorId);
        }
        
        ReservationOrderDTO result = reservationService.updateReservation(id, request, operatorId);
        
        logger.info("Reservation updated: {}", result.getOrderNumber());
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
