package com.cinema.product.controller;

import com.cinema.product.dto.SKUDetailDTO;
import com.cinema.product.exception.SkuNotFoundException;
import com.cinema.product.service.SKUService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * @spec P006-fix-sku-edit-data
 * SKU管理REST API控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/skus")
@RequiredArgsConstructor
public class SKUController {

    private final SKUService skuService;

    /**
     * 获取SKU详情及关联数据（SPU + BOM）
     *
     * API端点: GET /api/skus/{id}/details
     *
     * 响应格式：
     * {
     *   "success": true,
     *   "data": {
     *     "sku": { ... },
     *     "spu": { ... } | null,
     *     "bom": { ... } | null,
     *     "metadata": {
     *       "spu_load_success": true,
     *       "bom_load_success": false,
     *       "spu_status": "valid",
     *       "bom_status": "not_configured"
     *     }
     *   },
     *   "timestamp": "2025-12-31T10:30:00Z"
     * }
     *
     * @param id SKU的UUID
     * @return 包含SKU、SPU、BOM和加载元数据的响应
     */
    @GetMapping("/{id}/details")
    public ResponseEntity<Map<String, Object>> getSKUDetails(@PathVariable("id") UUID id) {
        log.info("Received request: GET /api/skus/{}/details", id);

        try {
            SKUDetailDTO details = skuService.getSKUWithRelations(id);

            Map<String, Object> response = Map.of(
                "success", true,
                "data", details,
                "timestamp", Instant.now().toString()
            );

            log.info("SKU details request succeeded: skuId={}", id);
            return ResponseEntity.ok(response);

        } catch (SkuNotFoundException e) {
            log.warn("SKU not found: skuId={}", id);

            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "error", "SKU_NTF_001",
                "message", e.getMessage(),
                "details", Map.of("skuId", id.toString()),
                "timestamp", Instant.now().toString()
            );

            return ResponseEntity.status(404).body(errorResponse);

        } catch (Exception e) {
            log.error("Unexpected error while fetching SKU details: skuId={}", id, e);

            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "error", "SKU_SYS_001",
                "message", "服务器内部错误",
                "timestamp", Instant.now().toString()
            );

            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}
