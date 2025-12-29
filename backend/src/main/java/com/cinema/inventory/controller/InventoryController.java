package com.cinema.inventory.controller;

import com.cinema.inventory.domain.InventoryStatus;
import com.cinema.inventory.dto.InventoryQueryParams;
import com.cinema.inventory.dto.InventoryListResponse;
import com.cinema.inventory.dto.StoreInventoryDetailDto;
import com.cinema.inventory.service.InventoryService;
import com.cinema.hallstore.dto.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 库存查询 API 控制器
 * 提供库存列表查询和详情获取接口。
 * 
 * @since P003-inventory-query
 */
@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private static final Logger logger = LoggerFactory.getLogger(InventoryController.class);

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    /**
     * 查询库存列表
     * 
     * GET /api/inventory?storeId=xxx&keyword=xxx&categoryId=xxx&statuses=LOW,OUT_OF_STOCK&page=1&pageSize=20
     */
    @GetMapping
    public ResponseEntity<InventoryListResponse> listInventory(
            @RequestParam(required = false) String storeId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String statuses,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer pageSize) {

        logger.info("GET /api/inventory - storeId={}, keyword={}, categoryId={}, statuses={}, page={}, pageSize={}",
                storeId, keyword, categoryId, statuses, page, pageSize);

        // 构建查询参数
        InventoryQueryParams params = InventoryQueryParams.builder()
                .storeId(parseUUID(storeId))
                .keyword(keyword)
                .categoryId(parseUUID(categoryId))
                .statuses(parseStatuses(statuses))
                .page(page)
                .pageSize(pageSize)
                .build();

        InventoryListResponse response = inventoryService.listInventory(params);
        return ResponseEntity.ok(response);
    }

    /**
     * 查询当前库存列表（别名接口）
     * 
     * GET /api/inventory/current?page=1&pageSize=20
     * 
     * 前端可能使用此端点获取库存列表
     */
    @GetMapping("/current")
    public ResponseEntity<InventoryListResponse> listCurrentInventory(
            @RequestParam(required = false) String storeId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String statuses,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer pageSize,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortOrder) {

        logger.info("GET /api/inventory/current - storeId={}, page={}, pageSize={}",
                storeId, page, pageSize);

        // 复用 listInventory 逻辑
        InventoryQueryParams params = InventoryQueryParams.builder()
                .storeId(parseUUID(storeId))
                .keyword(keyword)
                .categoryId(parseUUID(categoryId))
                .statuses(parseStatuses(statuses))
                .page(page)
                .pageSize(pageSize)
                .build();

        InventoryListResponse response = inventoryService.listInventory(params);
        return ResponseEntity.ok(response);
    }

    /**
     * 获取库存详情
     * 
     * GET /api/inventory/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StoreInventoryDetailDto>> getInventoryDetail(
            @PathVariable String id) {

        logger.info("GET /api/inventory/{} - Getting inventory detail", id);

        UUID inventoryId = UUID.fromString(id);
        StoreInventoryDetailDto detail = inventoryService.getInventoryDetail(inventoryId);

        return ResponseEntity.ok(ApiResponse.success(detail));
    }

    // ========== 辅助方法 ==========

    private UUID parseUUID(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid UUID format: {}", value);
            return null;
        }
    }

    private List<InventoryStatus> parseStatuses(String statuses) {
        if (statuses == null || statuses.isBlank()) {
            return null;
        }
        try {
            return Arrays.stream(statuses.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(InventoryStatus::valueOf)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid inventory status: {}", statuses);
            return null;
        }
    }
}
