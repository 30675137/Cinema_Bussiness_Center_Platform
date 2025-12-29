package com.cinema.hallstore.controller;

import com.cinema.hallstore.dto.ApiResponse;
import com.cinema.hallstore.dto.CreateHallRequest;
import com.cinema.hallstore.dto.HallDTO;
import com.cinema.hallstore.dto.UpdateHallRequest;
import com.cinema.hallstore.service.HallService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * HallAdminController:
 * - 提供影厅管理接口（创建、更新、查看详情）
 * - 供运营后台使用
 */
@RestController
@RequestMapping("/api/admin/halls")
public class HallAdminController {

    private final HallService hallService;

    public HallAdminController(HallService hallService) {
        this.hallService = hallService;
    }

    /**
     * 创建影厅
     * POST /api/admin/halls
     */
    @PostMapping
    public ResponseEntity<ApiResponse<HallDTO>> createHall(@Valid @RequestBody CreateHallRequest request) {
        HallDTO hall = hallService.createHall(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(hall));
    }

    /**
     * 获取影厅详情
     * GET /api/admin/halls/{hallId}
     */
    @GetMapping("/{hallId}")
    public ResponseEntity<ApiResponse<HallDTO>> getHall(@PathVariable UUID hallId) {
        HallDTO hall = hallService.getHallById(hallId);
        return ResponseEntity.ok(ApiResponse.success(hall));
    }

    /**
     * 更新影厅
     * PUT /api/admin/halls/{hallId}
     */
    @PutMapping("/{hallId}")
    public ResponseEntity<ApiResponse<HallDTO>> updateHall(
            @PathVariable UUID hallId,
            @Valid @RequestBody UpdateHallRequest request) {
        HallDTO hall = hallService.updateHall(hallId, request);
        return ResponseEntity.ok(ApiResponse.success(hall));
    }

    /**
     * 停用影厅
     * POST /api/admin/halls/{hallId}/deactivate
     */
    @PostMapping("/{hallId}/deactivate")
    public ResponseEntity<ApiResponse<HallDTO>> deactivateHall(@PathVariable UUID hallId) {
        HallDTO hall = hallService.deactivateHall(hallId);
        return ResponseEntity.ok(ApiResponse.success(hall));
    }

    /**
     * 启用影厅
     * POST /api/admin/halls/{hallId}/activate
     */
    @PostMapping("/{hallId}/activate")
    public ResponseEntity<ApiResponse<HallDTO>> activateHall(@PathVariable UUID hallId) {
        HallDTO hall = hallService.activateHall(hallId);
        return ResponseEntity.ok(ApiResponse.success(hall));
    }
}
