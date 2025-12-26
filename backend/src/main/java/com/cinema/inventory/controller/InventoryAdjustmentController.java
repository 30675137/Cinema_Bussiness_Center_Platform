package com.cinema.inventory.controller;

import com.cinema.inventory.dto.AdjustmentRequest;
import com.cinema.inventory.dto.AdjustmentResponse;
import com.cinema.inventory.service.InventoryAdjustmentService;
import com.cinema.hallstore.dto.ApiResponse;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * 库存调整 API 控制器
 * 提供库存调整创建、查询、撤回等接口。
 * 
 * P004-inventory-adjustment
 * 
 * @since US1 - 录入库存调整
 */
@RestController
@RequestMapping("/api/adjustments")
public class InventoryAdjustmentController {

    private static final Logger logger = LoggerFactory.getLogger(InventoryAdjustmentController.class);

    private final InventoryAdjustmentService adjustmentService;

    public InventoryAdjustmentController(InventoryAdjustmentService adjustmentService) {
        this.adjustmentService = adjustmentService;
    }

    /**
     * 创建库存调整
     * 
     * POST /api/adjustments
     * 
     * 业务规则：
     * - 调整金额 < 1000元：立即生效，库存更新
     * - 调整金额 >= 1000元：进入待审批状态
     * 
     * @param request 调整请求
     * @return 创建的调整记录
     */
    @PostMapping
    public ResponseEntity<ApiResponse<AdjustmentResponse>> createAdjustment(
            @Valid @RequestBody AdjustmentRequest request) {

        logger.info("POST /api/adjustments - Creating adjustment: skuId={}, storeId={}, type={}, quantity={}",
                request.getSkuId(), request.getStoreId(),
                request.getAdjustmentType(), request.getQuantity());

        // TODO: 从 JWT Token 获取当前用户信息
        // 这里暂用模拟数据
        UUID operatorId = UUID.randomUUID();
        String operatorName = "库存管理员";

        AdjustmentResponse response = adjustmentService.createAdjustment(
                request, operatorId, operatorName);

        String message = response.getRequiresApproval()
                ? "调整已提交审批"
                : "调整成功，库存已更新";

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, message));
    }

    /**
     * 获取调整详情
     * 
     * GET /api/adjustments/{id}
     * 
     * @param id 调整记录ID
     * @return 调整详情
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdjustmentResponse>> getAdjustment(
            @PathVariable String id) {

        logger.info("GET /api/adjustments/{} - Getting adjustment detail", id);

        UUID adjustmentId = UUID.fromString(id);
        AdjustmentResponse response = adjustmentService.getAdjustmentById(adjustmentId);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 撤回调整申请
     * 
     * POST /api/adjustments/{id}/withdraw
     * 
     * 业务规则：
     * - 仅允许撤回待审批状态的记录
     * - 仅允许操作人本人撤回
     * 
     * @param id 调整记录ID
     * @return 更新后的调整记录
     */
    @PostMapping("/{id}/withdraw")
    public ResponseEntity<ApiResponse<AdjustmentResponse>> withdrawAdjustment(
            @PathVariable String id) {

        logger.info("POST /api/adjustments/{}/withdraw - Withdrawing adjustment", id);

        // TODO: 从 JWT Token 获取当前用户ID
        UUID operatorId = UUID.randomUUID();

        UUID adjustmentId = UUID.fromString(id);
        AdjustmentResponse response = adjustmentService.withdrawAdjustment(adjustmentId, operatorId);

        return ResponseEntity.ok(ApiResponse.success(response, "调整申请已撤回"));
    }
}
