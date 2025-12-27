package com.cinema.inventory.controller;

import com.cinema.inventory.service.ApprovalService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * 审批 API 控制器
 * 提供库存调整审批相关的 REST API。
 * 
 * P004-inventory-adjustment
 * 实现 T052 任务。
 * 
 * @since US4 - 大额库存调整审批
 */
@RestController
@RequestMapping("/api/adjustments")
public class ApprovalController {

  private static final Logger logger = LoggerFactory.getLogger(ApprovalController.class);

  private final ApprovalService approvalService;

  @Autowired
  public ApprovalController(ApprovalService approvalService) {
    this.approvalService = approvalService;
  }

  /**
   * 审批通过
   * 
   * POST /api/adjustments/{id}/approve
   * 
   * @param id      调整记录ID
   * @param request 审批请求（包含comments）
   * @return 审批结果
   */
  @PostMapping("/{id}/approve")
  public ResponseEntity<Map<String, Object>> approve(
      @PathVariable String id,
      @RequestBody(required = false) Map<String, String> request) {

    logger.info("POST /api/adjustments/{}/approve", id);

    String comments = request != null ? request.get("comments") : null;

    // TODO: 从认证上下文获取审批人信息
    UUID approverId = UUID.randomUUID();
    String approverName = "运营总监";

    ApprovalService.ApprovalResult result = approvalService.approve(
        UUID.fromString(id),
        approverId,
        approverName,
        comments);

    Map<String, Object> response = new HashMap<>();
    response.put("success", result.isSuccess());
    response.put("message", result.getMessage());

    if (result.isSuccess()) {
      Map<String, Object> data = new HashMap<>();
      data.put("id", result.getAdjustmentId().toString());
      data.put("status", result.getNewStatus());
      data.put("approvedAt", java.time.OffsetDateTime.now().toString());
      data.put("approvedBy", approverName);
      response.put("data", data);
    } else {
      response.put("error", result.getError());
    }

    return ResponseEntity.ok(response);
  }

  /**
   * 审批拒绝
   * 
   * POST /api/adjustments/{id}/reject
   * 
   * @param id      调整记录ID
   * @param request 拒绝请求（包含comments）
   * @return 审批结果
   */
  @PostMapping("/{id}/reject")
  public ResponseEntity<Map<String, Object>> reject(
      @PathVariable String id,
      @RequestBody(required = false) Map<String, String> request) {

    logger.info("POST /api/adjustments/{}/reject", id);

    String comments = request != null ? request.get("comments") : null;

    // TODO: 从认证上下文获取审批人信息
    UUID approverId = UUID.randomUUID();
    String approverName = "运营总监";

    ApprovalService.ApprovalResult result = approvalService.reject(
        UUID.fromString(id),
        approverId,
        approverName,
        comments);

    Map<String, Object> response = new HashMap<>();
    response.put("success", result.isSuccess());
    response.put("message", result.getMessage());

    if (result.isSuccess()) {
      Map<String, Object> data = new HashMap<>();
      data.put("id", result.getAdjustmentId().toString());
      data.put("status", result.getNewStatus());
      data.put("rejectedAt", java.time.OffsetDateTime.now().toString());
      data.put("rejectedBy", approverName);
      response.put("data", data);
    } else {
      response.put("error", result.getError());
    }

    return ResponseEntity.ok(response);
  }

  /**
   * 撤回调整申请
   * 
   * POST /api/adjustments/{id}/withdraw
   * 
   * @param id 调整记录ID
   * @return 撤回结果
   */
  @PostMapping("/{id}/withdraw")
  public ResponseEntity<Map<String, Object>> withdraw(@PathVariable String id) {

    logger.info("POST /api/adjustments/{}/withdraw", id);

    // TODO: 从认证上下文获取操作人信息
    UUID operatorId = UUID.randomUUID();

    ApprovalService.ApprovalResult result = approvalService.withdraw(
        UUID.fromString(id),
        operatorId);

    Map<String, Object> response = new HashMap<>();
    response.put("success", result.isSuccess());
    response.put("message", result.getMessage());

    if (result.isSuccess()) {
      Map<String, Object> data = new HashMap<>();
      data.put("id", result.getAdjustmentId().toString());
      data.put("status", result.getNewStatus());
      data.put("withdrawnAt", java.time.OffsetDateTime.now().toString());
      response.put("data", data);
    } else {
      response.put("error", result.getError());
    }

    return ResponseEntity.ok(response);
  }
}
