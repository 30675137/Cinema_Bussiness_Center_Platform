package com.cinema.hallstore.controller;

import com.cinema.hallstore.dto.ApiResponse;
import com.cinema.hallstore.dto.BatchUpdateResult;
import com.cinema.hallstore.dto.BatchUpdateStoreReservationSettingsRequest;
import com.cinema.hallstore.service.StoreReservationSettingsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * BatchStoreReservationSettingsController:
 * - 提供批量更新门店预约设置接口
 * - 使用独立端点：/api/stores/reservation-settings/batch
 */
@RestController
@RequestMapping("/api/stores/reservation-settings")
public class BatchStoreReservationSettingsController {

    private final StoreReservationSettingsService service;

    public BatchStoreReservationSettingsController(StoreReservationSettingsService service) {
        this.service = service;
    }

    /**
     * 批量更新门店预约设置
     * PUT /api/stores/reservation-settings/batch
     *
     * @param request 批量更新请求
     * @return 批量更新结果
     */
    @PutMapping("/batch")
    public ResponseEntity<ApiResponse<BatchUpdateResult>> batchUpdate(
            @RequestBody @Valid BatchUpdateStoreReservationSettingsRequest request) {
        BatchUpdateResult result = service.batchUpdate(request);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}

