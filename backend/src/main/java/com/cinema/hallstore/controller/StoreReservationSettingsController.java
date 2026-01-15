package com.cinema.hallstore.controller;

import com.cinema.hallstore.dto.ApiResponse;
import com.cinema.hallstore.dto.StoreReservationSettingsDTO;
import com.cinema.hallstore.dto.UpdateStoreReservationSettingsRequest;
import com.cinema.hallstore.service.StoreReservationSettingsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * StoreReservationSettingsController:
 * - 提供门店预约设置查询和更新接口
 * - 使用嵌套资源模式：/api/stores/{storeId}/reservation-settings
 */
@RestController
@RequestMapping("/api/stores/{storeId}/reservation-settings")
public class StoreReservationSettingsController {

    private final StoreReservationSettingsService service;

    public StoreReservationSettingsController(StoreReservationSettingsService service) {
        this.service = service;
    }

    /**
     * 获取门店预约设置
     * GET /api/stores/{storeId}/reservation-settings
     *
     * @param storeId 门店ID
     * @return 预约设置信息
     */
    @GetMapping
    public ResponseEntity<ApiResponse<StoreReservationSettingsDTO>> getSettings(@PathVariable UUID storeId) {
        StoreReservationSettingsDTO settings = service.getSettings(storeId);
        return ResponseEntity.ok(ApiResponse.success(settings));
    }

    /**
     * 更新门店预约设置
     * PUT /api/stores/{storeId}/reservation-settings
     *
     * @param storeId 门店ID
     * @param request 更新请求
     * @return 更新后的预约设置信息
     */
    @PutMapping
    public ResponseEntity<ApiResponse<StoreReservationSettingsDTO>> updateSettings(
            @PathVariable UUID storeId,
            @RequestBody @Valid UpdateStoreReservationSettingsRequest request) {
        StoreReservationSettingsDTO settings = service.updateSettings(storeId, request);
        return ResponseEntity.ok(ApiResponse.success(settings));
    }
}
