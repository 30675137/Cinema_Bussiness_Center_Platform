package com.cinema.hallstore.controller;

import com.cinema.hallstore.domain.enums.StoreStatus;
import com.cinema.hallstore.dto.ApiResponse;
import com.cinema.hallstore.dto.StoreDTO;
import com.cinema.hallstore.service.StoreService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * StoreQueryController:
 * - 提供门店查询接口
 * - 供前端选择门店和按门店筛选影厅使用
 */
@RestController
@RequestMapping("/api/stores")
public class StoreQueryController {

    private final StoreService storeService;

    public StoreQueryController(StoreService storeService) {
        this.storeService = storeService;
    }

    /**
     * 查询门店列表
     * GET /api/stores
     *
     * @param status 可选筛选：门店状态（active, disabled）
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getStores(
            @RequestParam(required = false) StoreStatus status) {

        List<StoreDTO> stores = storeService.getAllStores(status);

        // 返回结构与 OpenAPI 契约对齐：{ data: [...], total: n }
        Map<String, Object> response = Map.of(
                "data", stores,
                "total", stores.size()
        );

        return ResponseEntity.ok(response);
    }

    /**
     * 获取门店详情
     * GET /api/stores/{storeId}
     *
     * @param storeId 门店ID
     */
    @GetMapping("/{storeId}")
    public ResponseEntity<ApiResponse<StoreDTO>> getStore(@PathVariable UUID storeId) {
        StoreDTO store = storeService.getStoreById(storeId);
        return ResponseEntity.ok(ApiResponse.success(store));
    }
}
