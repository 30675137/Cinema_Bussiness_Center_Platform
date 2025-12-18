package com.cinema.hallstore.controller;

import com.cinema.hallstore.domain.enums.HallStatus;
import com.cinema.hallstore.domain.enums.HallType;
import com.cinema.hallstore.dto.HallDTO;
import com.cinema.hallstore.service.HallService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * HallListController:
 * - 提供获取所有影厅列表的接口
 * - 供前端"排期甘特图"等需要查看所有影厅的页面使用
 */
@RestController
@RequestMapping("/api/halls")
public class HallListController {

    private final HallService hallService;

    public HallListController(HallService hallService) {
        this.hallService = hallService;
    }

    /**
     * 获取所有影厅列表
     * GET /api/halls
     *
     * @param status 可选筛选：影厅状态（active, inactive, maintenance）
     * @param type   可选筛选：影厅类型（VIP, CP, Party, Public）
     * @return 影厅列表
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllHalls(
            @RequestParam(required = false) HallStatus status,
            @RequestParam(required = false) HallType type) {

        List<HallDTO> halls = hallService.getAllHalls(status, type);

        // 返回结构与前端期望一致：{ success: true, data: [...], message: "...", code: 200 }
        Map<String, Object> response = Map.of(
                "success", true,
                "data", halls,
                "total", halls.size(),
                "message", "获取影厅列表成功",
                "code", 200
        );

        return ResponseEntity.ok(response);
    }
}
