package com.cinema.hallstore.controller;

import com.cinema.hallstore.domain.enums.StoreStatus;
import com.cinema.hallstore.dto.ApiResponse;
import com.cinema.hallstore.dto.CreateStoreDTO;
import com.cinema.hallstore.dto.StoreDTO;
import com.cinema.hallstore.dto.UpdateStoreAddressRequest;
import com.cinema.hallstore.dto.UpdateStoreDTO;
import com.cinema.hallstore.service.StoreService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * StoreQueryController:
 * - 提供门店查询接口
 * - 供前端选择门店和按门店筛选影厅使用
 * - 020-store-address: 添加门店地址更新接口
 * - 022-store-crud: 添加CRUD接口
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
     * 获取可访问的门店列表
     * GET /api/stores/accessible
     * 
     * 注意：此端点必须放在 /{storeId} 之前，避免 "accessible" 被当作 UUID 解析
     *
     * @return 当前用户可访问的门店列表
     * @since P003-inventory-query
     */
    @GetMapping("/accessible")
    public ResponseEntity<Map<String, Object>> getAccessibleStores() {
        // 返回所有活跃门店（后续可增加权限过滤逻辑）
        List<StoreDTO> stores = storeService.getAllStores(StoreStatus.ACTIVE);

        Map<String, Object> response = Map.of(
                "success", true,
                "data", stores
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

    /**
     * 更新门店地址信息
     * PUT /api/stores/{storeId}
     *
     * @param storeId 门店ID
     * @param request 更新请求
     * @since 020-store-address
     */
    @PutMapping("/{storeId}")
    public ResponseEntity<ApiResponse<StoreDTO>> updateStore(
            @PathVariable UUID storeId,
            @Valid @RequestBody UpdateStoreAddressRequest request) {
        StoreDTO updatedStore = storeService.updateStoreAddress(storeId, request);
        return ResponseEntity.ok(ApiResponse.success(updatedStore));
    }

    // ========== 022-store-crud: CRUD 接口 ==========

    /**
     * 创建新门店
     * POST /api/stores
     *
     * @param dto 创建门店请求
     * @param request HTTP请求（用于获取操作人IP）
     * @return 创建后的门店信息
     * @since 022-store-crud
     */
    @PostMapping
    public ResponseEntity<ApiResponse<StoreDTO>> createStore(
            @Valid @RequestBody CreateStoreDTO dto,
            HttpServletRequest request) {
        // 获取操作人IP地址
        String ipAddress = getClientIpAddress(request);
        // TODO: 从安全上下文获取操作人名称
        String operatorName = "system";  // 临时默认值

        StoreDTO createdStore = storeService.createStore(dto, operatorName, ipAddress);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(createdStore));
    }

    /**
     * 获取客户端IP地址
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }

    /**
     * 更新门店信息（完整更新）
     * PUT /api/stores/{storeId}/full
     *
     * @param storeId 门店ID
     * @param dto 更新请求
     * @param request HTTP请求
     * @return 更新后的门店信息
     * @since 022-store-crud
     */
    @PutMapping("/{storeId}/full")
    public ResponseEntity<ApiResponse<StoreDTO>> updateStoreFull(
            @PathVariable UUID storeId,
            @Valid @RequestBody UpdateStoreDTO dto,
            HttpServletRequest request) {
        String ipAddress = getClientIpAddress(request);
        String operatorName = "system";  // TODO: 从安全上下文获取

        StoreDTO updatedStore = storeService.updateStore(storeId, dto, operatorName, ipAddress);
        return ResponseEntity.ok(ApiResponse.success(updatedStore));
    }

    /**
     * 切换门店状态
     * PATCH /api/stores/{storeId}/status
     *
     * @param storeId 门店ID
     * @param body 状态请求体 {"status": "active" | "inactive"}
     * @param request HTTP请求
     * @return 更新后的门店信息
     * @since 022-store-crud
     */
    @PatchMapping("/{storeId}/status")
    public ResponseEntity<ApiResponse<StoreDTO>> toggleStoreStatus(
            @PathVariable UUID storeId,
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        String statusValue = body.get("status");
        if (statusValue == null || statusValue.isBlank()) {
            throw new IllegalArgumentException("状态值不能为空");
        }

        StoreStatus newStatus;
        try {
            newStatus = StoreStatus.valueOf(statusValue.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("无效的状态值: " + statusValue);
        }

        String ipAddress = getClientIpAddress(request);
        String operatorName = "system";  // TODO: 从安全上下文获取

        StoreDTO updatedStore = storeService.toggleStatus(storeId, newStatus, operatorName, ipAddress);
        return ResponseEntity.ok(ApiResponse.success(updatedStore));
    }

    /**
     * 删除门店
     * DELETE /api/stores/{storeId}
     *
     * @param storeId 门店ID
     * @param request HTTP请求
     * @return 204 No Content
     * @since 022-store-crud
     */
    @DeleteMapping("/{storeId}")
    public ResponseEntity<Void> deleteStore(
            @PathVariable UUID storeId,
            HttpServletRequest request) {
        String ipAddress = getClientIpAddress(request);
        String operatorName = "system";  // TODO: 从安全上下文获取

        storeService.deleteStore(storeId, operatorName, ipAddress);
        return ResponseEntity.noContent().build();
    }
}
