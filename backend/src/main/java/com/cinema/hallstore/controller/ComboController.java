package com.cinema.hallstore.controller;

import com.cinema.hallstore.domain.ComboItem;
import com.cinema.hallstore.dto.ApiResponse;
import com.cinema.hallstore.dto.SkuCreateRequest;
import com.cinema.hallstore.dto.UpdateComboItemsRequest;
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
 * 套餐管理控制器
 * - 提供套餐SKU的子项配置管理接口
 *
 * @since P001-sku-master-data
 */
@RestController
@RequestMapping("/api/skus")
public class ComboController {

    private final SkuService skuService;

    public ComboController(SkuService skuService) {
        this.skuService = skuService;
    }

    /**
     * 获取套餐SKU的子项配置
     * GET /api/skus/{id}/combo-items
     *
     * @param id 套餐SKU ID
     */
    @GetMapping("/{id}/combo-items")
    public ResponseEntity<ApiResponse<List<ComboItem>>> getComboItems(@PathVariable UUID id) {
        try {
            List<ComboItem> comboItems = skuService.getComboItems(id);
            return ResponseEntity.ok(ApiResponse.success(comboItems));
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
     * 更新套餐SKU的子项配置
     * PUT /api/skus/{id}/combo-items
     *
     * @param id      套餐SKU ID
     * @param request 更新请求
     */
    @PutMapping("/{id}/combo-items")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateComboItems(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateComboItemsRequest request) {
        try {
            // 转换输入格式
            List<SkuCreateRequest.ComboItemInput> itemInputs = request.getItems().stream()
                    .map(input -> {
                        SkuCreateRequest.ComboItemInput comboInput = new SkuCreateRequest.ComboItemInput();
                        comboInput.setSubItemId(input.getSubItemId());
                        comboInput.setQuantity(input.getQuantity());
                        comboInput.setUnit(input.getUnit());
                        comboInput.setSortOrder(input.getSortOrder());
                        return comboInput;
                    })
                    .collect(Collectors.toList());

            List<ComboItem> updatedItems = skuService.updateComboItems(id, itemInputs);

            // 计算更新后的成本
            BigDecimal calculatedCost = updatedItems.stream()
                    .map(ComboItem::getTotalCost)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            Map<String, Object> response = Map.of(
                    "items", updatedItems,
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
}
