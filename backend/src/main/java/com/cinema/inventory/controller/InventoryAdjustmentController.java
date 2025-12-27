package com.cinema.inventory.controller;

import com.cinema.inventory.dto.AdjustmentRequest;
import com.cinema.inventory.dto.AdjustmentResponse;
import com.cinema.inventory.service.InventoryAdjustmentService;
import com.cinema.inventory.repository.AdjustmentRepository;
import com.cinema.inventory.domain.InventoryAdjustment;
import com.cinema.hallstore.dto.ApiResponse;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
  private final AdjustmentRepository adjustmentRepository;

  public InventoryAdjustmentController(InventoryAdjustmentService adjustmentService,
      AdjustmentRepository adjustmentRepository) {
    this.adjustmentService = adjustmentService;
    this.adjustmentRepository = adjustmentRepository;
  }

  /**
   * 获取调整列表（分页）
   * 
   * GET /api/adjustments?status=pending_approval&page=1&pageSize=10
   * 
   * @param status   状态筛选
   * @param page     页码（从1开始）
   * @param pageSize 每页数量
   * @return 调整列表
   */
  @GetMapping
  public ResponseEntity<Map<String, Object>> listAdjustments(
      @RequestParam(required = false) String status,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "10") int pageSize) {

    logger.info("GET /api/adjustments - status={}, page={}, pageSize={}", status, page, pageSize);

    // 页码转换（前端从1开始，后端从0开始）
    Pageable pageable = PageRequest.of(Math.max(0, page - 1), pageSize);

    Page<InventoryAdjustment> adjustmentPage;
    if (status != null && !status.isEmpty()) {
      adjustmentPage = adjustmentRepository.findByStatus(status, pageable);
    } else {
      adjustmentPage = adjustmentRepository.findAll(pageable);
    }

    // 转换为响应格式
    List<Map<String, Object>> items = adjustmentPage.getContent().stream()
        .map(this::toListItem)
        .collect(Collectors.toList());

    Map<String, Object> response = new HashMap<>();
    response.put("success", true);
    response.put("data", items);
    response.put("total", adjustmentPage.getTotalElements());
    response.put("page", page);
    response.put("pageSize", pageSize);
    response.put("totalPages", adjustmentPage.getTotalPages());

    return ResponseEntity.ok(response);
  }

  /**
   * 转换为列表项
   */
  private Map<String, Object> toListItem(InventoryAdjustment adjustment) {
    Map<String, Object> item = new HashMap<>();
    item.put("id", adjustment.getId().toString());
    item.put("adjustmentNumber", adjustment.getAdjustmentNumber());
    item.put("skuId", adjustment.getSkuId().toString());
    item.put("storeId", adjustment.getStoreId().toString());
    item.put("adjustmentType", adjustment.getAdjustmentType());
    item.put("quantity", adjustment.getQuantity());
    item.put("unitPrice", adjustment.getUnitPrice());
    item.put("adjustmentAmount", adjustment.getAdjustmentAmount());
    item.put("reasonCode", adjustment.getReasonCode());
    item.put("reasonText", adjustment.getReasonText());
    item.put("remarks", adjustment.getRemarks());
    item.put("status", adjustment.getStatus());
    item.put("stockBefore", adjustment.getStockBefore());
    item.put("stockAfter", adjustment.getStockAfter());
    item.put("operatorId", adjustment.getOperatorId().toString());
    item.put("operatorName", adjustment.getOperatorName());
    item.put("createdAt", adjustment.getCreatedAt() != null ? adjustment.getCreatedAt().toString() : null);
    item.put("updatedAt", adjustment.getUpdatedAt() != null ? adjustment.getUpdatedAt().toString() : null);

    // 添加 SKU 关联信息（TODO: 实际应该关联查询）
    Map<String, Object> sku = new HashMap<>();
    sku.put("id", adjustment.getSkuId().toString());
    sku.put("code", "SKU-" + adjustment.getSkuId().toString().substring(0, 8));
    sku.put("name", "库存商品");
    item.put("sku", sku);

    // 添加 operator 关联信息
    Map<String, Object> operator = new HashMap<>();
    operator.put("id", adjustment.getOperatorId().toString());
    operator.put("name", adjustment.getOperatorName());
    item.put("operator", operator);

    return item;
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
        .body(ApiResponse.success(response));
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

  // 撤回调整申请功能已迁移到 ApprovalController
  // POST /api/adjustments/{id}/withdraw
}
