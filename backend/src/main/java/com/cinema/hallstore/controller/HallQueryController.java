package com.cinema.hallstore.controller;

import com.cinema.hallstore.domain.enums.HallStatus;
import com.cinema.hallstore.domain.enums.HallType;
import com.cinema.hallstore.dto.ApiResponse;
import com.cinema.hallstore.dto.HallDTO;
import com.cinema.hallstore.service.HallService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * HallQueryController:
 * - 提供影厅查询接口（按门店查询影厅列表）
 * - 供前端"影厅资源管理"和"排期甘特图"页面使用
 */
@RestController
@RequestMapping("/api/stores/{storeId}/halls")
public class HallQueryController {

    private final HallService hallService;

    public HallQueryController(HallService hallService) {
        this.hallService = hallService;
    }

    /**
     * 按门店查询影厅列表
     * GET /api/stores/{storeId}/halls
     *
     * @param storeId 门店ID
     * @param status  可选筛选：影厅状态（active, inactive, maintenance）
     * @param type    可选筛选：影厅类型（VIP, CP, Party, Public）
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getHallsByStore(
            @PathVariable UUID storeId,
            @RequestParam(required = false) HallStatus status,
            @RequestParam(required = false) HallType type) {

        List<HallDTO> halls = hallService.getHallsByStore(storeId, status, type);

        // 返回结构与 OpenAPI 契约对齐：{ data: [...], total: n }
        Map<String, Object> response = Map.of(
                "data", halls,
                "total", halls.size()
        );

        return ResponseEntity.ok(response);
    }
}
