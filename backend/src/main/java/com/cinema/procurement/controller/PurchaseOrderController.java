/**
 * @spec N001-purchase-inbound
 * 采购订单控制器
 */
package com.cinema.procurement.controller;

import com.cinema.procurement.dto.CreatePurchaseOrderRequest;
import com.cinema.procurement.dto.PurchaseOrderDTO;
import com.cinema.procurement.dto.PurchaseOrderStatusHistoryDTO;
import com.cinema.procurement.entity.PurchaseOrderStatus;
import com.cinema.procurement.service.PurchaseOrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/purchase-orders")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    public PurchaseOrderController(PurchaseOrderService purchaseOrderService) {
        this.purchaseOrderService = purchaseOrderService;
    }

    /**
     * 获取采购订单列表
     * GET /api/purchase-orders?storeId=xxx&supplierId=xxx&status=DRAFT&page=1&pageSize=20
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> list(
            @RequestParam(required = false) UUID storeId,
            @RequestParam(required = false) UUID supplierId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {

        PurchaseOrderStatus orderStatus = null;
        if (status != null && !status.isEmpty()) {
            try {
                orderStatus = PurchaseOrderStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                // 忽略无效状态
            }
        }

        Page<PurchaseOrderDTO> result = purchaseOrderService.findByFilters(storeId, supplierId, orderStatus, page, pageSize);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", result.getContent());
        response.put("total", result.getTotalElements());
        response.put("page", page);
        response.put("pageSize", pageSize);
        response.put("timestamp", Instant.now().toString());

        return ResponseEntity.ok(response);
    }

    /**
     * 获取采购订单详情
     * GET /api/purchase-orders/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable UUID id) {
        PurchaseOrderDTO order = purchaseOrderService.findById(id);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", order);
        response.put("timestamp", Instant.now().toString());

        return ResponseEntity.ok(response);
    }

    /**
     * 创建采购订单
     * POST /api/purchase-orders
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody CreatePurchaseOrderRequest request) {
        PurchaseOrderDTO created = purchaseOrderService.create(request);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", created);
        response.put("timestamp", Instant.now().toString());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 删除采购订单
     * DELETE /api/purchase-orders/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        purchaseOrderService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * 提交审核
     * POST /api/purchase-orders/{id}/submit
     */
    @PostMapping("/{id}/submit")
    public ResponseEntity<Map<String, Object>> submit(@PathVariable UUID id) {
        PurchaseOrderDTO order = purchaseOrderService.submit(id);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", order);
        response.put("message", "提交审核成功");
        response.put("timestamp", Instant.now().toString());

        return ResponseEntity.ok(response);
    }

    /**
     * 审批通过
     * POST /api/purchase-orders/{id}/approve
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<Map<String, Object>> approve(@PathVariable UUID id) {
        // TODO: 从认证上下文获取当前用户ID
        UUID approvedBy = UUID.randomUUID(); // 临时使用随机UUID
        PurchaseOrderDTO order = purchaseOrderService.approve(id, approvedBy);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", order);
        response.put("message", "审批通过");
        response.put("timestamp", Instant.now().toString());

        return ResponseEntity.ok(response);
    }

    /**
     * 审批拒绝
     * POST /api/purchase-orders/{id}/reject
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<Map<String, Object>> reject(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        String reason = body.get("reason");
        if (reason == null || reason.trim().isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "PO_VAL_001");
            error.put("message", "拒绝原因不能为空");
            error.put("timestamp", Instant.now().toString());
            return ResponseEntity.badRequest().body(error);
        }

        // TODO: 从认证上下文获取当前用户ID
        UUID approvedBy = UUID.randomUUID(); // 临时使用随机UUID
        PurchaseOrderDTO order = purchaseOrderService.reject(id, approvedBy, reason);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", order);
        response.put("message", "已拒绝");
        response.put("timestamp", Instant.now().toString());

        return ResponseEntity.ok(response);
    }

    /**
     * 获取采购订单状态变更历史
     * GET /api/purchase-orders/{id}/history
     */
    @GetMapping("/{id}/history")
    public ResponseEntity<Map<String, Object>> getStatusHistory(@PathVariable UUID id) {
        List<PurchaseOrderStatusHistoryDTO> histories = purchaseOrderService.getStatusHistory(id);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", histories);
        response.put("timestamp", Instant.now().toString());

        return ResponseEntity.ok(response);
    }

    /**
     * 获取订单统计摘要
     * GET /api/purchase-orders/summary?storeId=xxx
     */
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getOrderSummary(
            @RequestParam(required = false) UUID storeId) {
        PurchaseOrderService.OrderSummary summary = purchaseOrderService.getOrderSummary(storeId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", Map.of(
            "draftCount", summary.draftCount(),
            "pendingApprovalCount", summary.pendingApprovalCount(),
            "approvedCount", summary.approvedCount(),
            "partialReceivedCount", summary.partialReceivedCount()
        ));
        response.put("timestamp", Instant.now().toString());

        return ResponseEntity.ok(response);
    }

    /**
     * 获取待审批订单列表
     * GET /api/purchase-orders/pending-approval?page=1&pageSize=20
     */
    @GetMapping("/pending-approval")
    public ResponseEntity<Map<String, Object>> getPendingApproval(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        Page<PurchaseOrderDTO> result = purchaseOrderService.findPendingApproval(page, pageSize);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", result.getContent());
        response.put("total", result.getTotalElements());
        response.put("page", page);
        response.put("pageSize", pageSize);
        response.put("timestamp", Instant.now().toString());

        return ResponseEntity.ok(response);
    }
}
