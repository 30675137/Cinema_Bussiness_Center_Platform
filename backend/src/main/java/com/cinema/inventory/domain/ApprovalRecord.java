package com.cinema.inventory.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * 审批记录实体
 * 
 * P004-inventory-adjustment
 */
@Entity
@Table(name = "approval_records")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalRecord {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private UUID id;

  /**
   * 关联的调整单ID
   */
  @Column(name = "adjustment_id", nullable = false)
  private UUID adjustmentId;

  /**
   * 审批人ID
   */
  @Column(name = "approver_id", nullable = false)
  private UUID approverId;

  /**
   * 审批人姓名
   */
  @Column(name = "approver_name", nullable = false, length = 100)
  private String approverName;

  /**
   * 审批操作：approve/reject/withdraw
   */
  @Column(nullable = false, length = 20)
  private String action;

  /**
   * 操作前状态
   */
  @Column(name = "status_before", nullable = false, length = 20)
  private String statusBefore;

  /**
   * 操作后状态
   */
  @Column(name = "status_after", nullable = false, length = 20)
  private String statusAfter;

  /**
   * 审批意见
   */
  @Column(columnDefinition = "TEXT")
  private String comments;

  /**
   * 操作时间
   */
  @Column(name = "action_time", nullable = false)
  @Builder.Default
  private OffsetDateTime actionTime = OffsetDateTime.now();

  /**
   * 创建时间
   */
  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private OffsetDateTime createdAt;

  // ========== 静态工厂方法 ==========

  /**
   * 创建审批通过记录
   */
  public static ApprovalRecord approve(UUID adjustmentId, UUID approverId, String approverName, String comments) {
    return ApprovalRecord.builder()
        .adjustmentId(adjustmentId)
        .approverId(approverId)
        .approverName(approverName)
        .action("approve")
        .statusBefore("pending_approval")
        .statusAfter("approved")
        .comments(comments)
        .actionTime(OffsetDateTime.now())
        .build();
  }

  /**
   * 创建审批拒绝记录
   */
  public static ApprovalRecord reject(UUID adjustmentId, UUID approverId, String approverName, String comments) {
    return ApprovalRecord.builder()
        .adjustmentId(adjustmentId)
        .approverId(approverId)
        .approverName(approverName)
        .action("reject")
        .statusBefore("pending_approval")
        .statusAfter("rejected")
        .comments(comments)
        .actionTime(OffsetDateTime.now())
        .build();
  }

  /**
   * 创建撤回记录
   */
  public static ApprovalRecord withdraw(UUID adjustmentId, UUID operatorId, String operatorName) {
    return ApprovalRecord.builder()
        .adjustmentId(adjustmentId)
        .approverId(operatorId)
        .approverName(operatorName)
        .action("withdraw")
        .statusBefore("pending_approval")
        .statusAfter("withdrawn")
        .actionTime(OffsetDateTime.now())
        .build();
  }
}
