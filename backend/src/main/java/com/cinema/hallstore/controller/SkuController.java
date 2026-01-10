package com.cinema.hallstore.controller;

import com.cinema.hallstore.domain.Sku;
import com.cinema.hallstore.domain.enums.SkuStatus;
import com.cinema.hallstore.domain.enums.SkuType;
import com.cinema.hallstore.dto.ApiResponse;
import com.cinema.hallstore.dto.SkuCreateRequest;
import com.cinema.hallstore.dto.SkuDetailDTO;
import com.cinema.hallstore.dto.SkuUpdateRequest;
import com.cinema.hallstore.service.SkuService;
import com.cinema.hallstore.service.StoreScopeValidationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.dao.DataAccessException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * SKU管理控制器
 * - 提供SKU CRUD接口
 * - 支持四种SKU类型: 原料、包材、成品、套餐
 *
 * @since P001-sku-master-data
 */
@RestController
@RequestMapping("/api/skus")
public class SkuController {

    private final SkuService skuService;

    public SkuController(SkuService skuService) {
        this.skuService = skuService;
    }

    /**
     * 查询SKU列表
     * GET /api/skus
     *
     * @param skuType  SKU类型筛选
     * @param status   状态筛选
     * @param storeId  门店ID筛选(返回该门店可用的SKU)
     * @param keyword  关键词搜索(名称/条码)
     * @param page     页码
     * @param pageSize 每页大小
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getSkus(
            @RequestParam(required = false) SkuType skuType,
            @RequestParam(required = false) SkuStatus status,
            @RequestParam(required = false) String storeId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {

        List<Sku> skus = skuService.findAll(skuType, status, storeId, keyword);

        // 返回格式与 OpenAPI 契约对齐
        Map<String, Object> response = Map.of(
                "success", true,
                "data", skus,
                "total", skus.size(),
                "page", page,
                "pageSize", pageSize,
                "message", "查询成功"
        );

        return ResponseEntity.ok(response);
    }

    /**
     * 获取SKU详情
     * GET /api/skus/{id}
     *
     * @param id SKU ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SkuDetailDTO>> getSku(@PathVariable UUID id) {
        try {
            Sku sku = skuService.findById(id);
            SkuDetailDTO detail = SkuDetailDTO.from(sku);

            // 根据类型加载BOM或套餐子项
            if (sku.getSkuType() == SkuType.FINISHED_PRODUCT) {
                detail.setBom(skuService.getBom(id));
            } else if (sku.getSkuType() == SkuType.COMBO) {
                detail.setComboItems(skuService.getComboItems(id));
            }

            return ResponseEntity.ok(ApiResponse.success(detail));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.failure("SKU_NOT_FOUND", e.getMessage(), null));
        }
    }

    /**
     * 创建SKU
     * POST /api/skus
     *
     * @param request 创建请求
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Sku>> createSku(@Valid @RequestBody SkuCreateRequest request) {
        try {
            Sku createdSku = skuService.create(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(createdSku));
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("已存在")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(ApiResponse.failure("CODE_ALREADY_EXISTS", e.getMessage(), null));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.failure("VALIDATION_ERROR", e.getMessage(), null));
        }
    }

    /**
     * 更新SKU
     * PUT /api/skus/{id}
     *
     * @param id      SKU ID
     * @param request 更新请求
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Sku>> updateSku(
            @PathVariable UUID id,
            @Valid @RequestBody SkuUpdateRequest request) {
        try {
            Sku updatedSku = skuService.update(
                    id,
                    request.getName(),
                    request.getMainUnit(),
                    request.getStoreScope(),
                    request.getStandardCost(),
                    request.getWasteRate(),
                    request.getPrice(),
                    request.getStatus()
            );
            return ResponseEntity.ok(ApiResponse.success(updatedSku));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.failure("SKU_NOT_FOUND", e.getMessage(), null));
        }
    }

    /**
     * 删除SKU
     * DELETE /api/skus/{id}
     *
     * @param id SKU ID
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSku(@PathVariable UUID id) {
        try {
            skuService.delete(id);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.failure("SKU_NOT_FOUND", e.getMessage(), null));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.failure("SKU_IN_USE", e.getMessage(), null));
        }
    }

    /**
     * 手动重新计算标准成本
     * POST /api/skus/{id}/recalculate-cost
     *
     * @param id SKU ID
     */
    @PostMapping("/{id}/recalculate-cost")
    public ResponseEntity<ApiResponse<Map<String, Object>>> recalculateCost(@PathVariable UUID id) {
        try {
            Sku sku = skuService.findById(id);
            java.math.BigDecimal oldCost = sku.getStandardCost();

            java.math.BigDecimal newCost = skuService.recalculateCost(id);

            Map<String, Object> result = Map.of(
                    "oldCost", oldCost != null ? oldCost : 0,
                    "newCost", newCost,
                    "changedAt", java.time.Instant.now()
            );

            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.failure("INVALID_OPERATION", e.getMessage(), null));
        }
    }

    /**
     * 验证门店范围可用性
     * POST /api/skus/{id}/validate-store-scope
     *
     * @param id      SKU ID
     * @param request 验证请求(包含目标门店范围)
     */
    @PostMapping("/{id}/validate-store-scope")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validateStoreScope(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> request) {
        try {
            // 提取目标门店范围
            @SuppressWarnings("unchecked")
            List<String> storeScopeList = (List<String>) request.get("storeScope");
            String[] targetStoreScope = storeScopeList != null
                    ? storeScopeList.toArray(new String[0])
                    : new String[0];

            StoreScopeValidationService.ValidationResult validationResult =
                    skuService.validateStoreScope(id, targetStoreScope);

            Map<String, Object> result = Map.of(
                    "valid", validationResult.isValid(),
                    "errors", validationResult.getErrors(),
                    "warnings", validationResult.getWarnings()
            );

            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.failure("INVALID_OPERATION", e.getMessage(), null));
        }
    }

    /**
     * 批量操作SKU
     * POST /api/skus/batch
     *
     * @spec B001-fix-brand-creation
     * @param request 批量操作请求 {operation: "delete", ids: [...]}
     */
    @PostMapping("/batch")
    public ResponseEntity<Map<String, Object>> batchOperation(@RequestBody Map<String, Object> request) {
        String operation = (String) request.get("operation");
        @SuppressWarnings("unchecked")
        List<String> ids = (List<String>) request.get("ids");

        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "未提供要操作的SKU ID"
            ));
        }

        if ("delete".equals(operation)) {
            int successCount = 0;
            int failedCount = 0;
            List<String> failedIds = new java.util.ArrayList<>();

            for (String idStr : ids) {
                try {
                    UUID id = UUID.fromString(idStr);
                    skuService.delete(id);
                    successCount++;
                } catch (IllegalArgumentException | IllegalStateException e) {
                    failedCount++;
                    failedIds.add(idStr);
                } catch (DataAccessException e) {
                    // 数据库约束异常（如外键约束）
                    failedCount++;
                    failedIds.add(idStr);
                }
            }

            String message = failedCount > 0
                    ? String.format("成功删除 %d 个 SKU，失败 %d 个（可能被其他数据引用）", successCount, failedCount)
                    : String.format("成功删除 %d 个 SKU", successCount);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", Map.of(
                            "processedCount", successCount,
                            "failedCount", failedCount,
                            "failedIds", failedIds
                    ),
                    "message", message
            ));
        }

        return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "不支持的操作类型: " + operation
        ));
    }
}
