package com.cinema.hallstore.controller;

import com.cinema.hallstore.domain.BomComponent;
import com.cinema.hallstore.dto.ApiResponse;
import com.cinema.hallstore.dto.SkuCreateRequest;
import com.cinema.hallstore.dto.UpdateBomRequest;
import com.cinema.hallstore.service.SkuService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * BOM管理控制器
 * - 提供成品SKU的BOM配置管理接口
 *
 * @since P001-sku-master-data
 */
@RestController
@RequestMapping("/api/skus")
public class BomController {

    private final SkuService skuService;

    public BomController(SkuService skuService) {
        this.skuService = skuService;
    }

    /**
     * 获取成品SKU的BOM配置
     * GET /api/skus/{id}/bom
     *
     * @param id 成品SKU ID
     */
    @GetMapping("/{id}/bom")
    public ResponseEntity<ApiResponse<List<BomComponent>>> getBom(@PathVariable UUID id) {
        try {
            List<BomComponent> bom = skuService.getBom(id);
            return ResponseEntity.ok(ApiResponse.success(bom));
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("不存在")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.failure("SKU_NOT_FOUND", e.getMessage(), null));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.failure("INVALID_SKU_TYPE", e.getMessage(), null));
        }
    }

    /**
     * 更新成品SKU的BOM配置
     * PUT /api/skus/{id}/bom
     *
     * @param id      成品SKU ID
     * @param request 更新请求
     */
    @PutMapping("/{id}/bom")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateBom(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateBomRequest request) {
        try {
            // 转换输入格式
            List<SkuCreateRequest.BomComponentInput> componentInputs = request.getComponents().stream()
                    .map(input -> {
                        SkuCreateRequest.BomComponentInput bomInput = new SkuCreateRequest.BomComponentInput();
                        bomInput.setComponentId(input.getComponentId());
                        bomInput.setQuantity(input.getQuantity());
                        bomInput.setUnit(input.getUnit());
                        bomInput.setIsOptional(input.getIsOptional());
                        bomInput.setSortOrder(input.getSortOrder());
                        return bomInput;
                    })
                    .collect(Collectors.toList());

            List<BomComponent> updatedComponents = skuService.updateBom(
                    id,
                    componentInputs,
                    request.getWasteRate()
            );

            // 计算更新后的成本
            BigDecimal calculatedCost = updatedComponents.stream()
                    .map(BomComponent::getTotalCost)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            if (request.getWasteRate() != null) {
                BigDecimal wasteFactor = BigDecimal.ONE.add(
                        request.getWasteRate().divide(new BigDecimal("100"), 4, java.math.RoundingMode.HALF_UP)
                );
                calculatedCost = calculatedCost.multiply(wasteFactor).setScale(2, java.math.RoundingMode.HALF_UP);
            }

            Map<String, Object> response = Map.of(
                    "components", updatedComponents,
                    "calculatedCost", calculatedCost
            );

            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("不存在")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.failure("SKU_NOT_FOUND", e.getMessage(), null));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.failure("VALIDATION_ERROR", e.getMessage(), null));
        }
    }

    /**
     * 删除成品SKU的BOM配置（清空所有配方）
     * DELETE /api/skus/{id}/bom
     * 
     * @spec T009-e2e-postman-flow-test
     * @param id 成品SKU ID
     */
    @DeleteMapping("/{id}/bom")
    public ResponseEntity<ApiResponse<Void>> deleteBom(@PathVariable UUID id) {
        try {
            // 通过更新空列表来清空BOM
            skuService.updateBom(id, java.util.List.of(), null);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("不存在")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.failure("SKU_NOT_FOUND", e.getMessage(), null));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.failure("VALIDATION_ERROR", e.getMessage(), null));
        }
    }
}
