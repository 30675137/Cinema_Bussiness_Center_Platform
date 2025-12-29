package com.cinema.inventory.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * 库存调整实体
 * 
 * P004-inventory-adjustment
 */
@Entity
@Table(name = "inventory_adjustments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryAdjustment {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private UUID id;

  /**
   * 调整单号
   */
  @Column(name = "adjustment_number", unique = true, nullable = false, length = 30)
  private String adjustmentNumber;

  /**
   * SKU ID
   */
  @Column(name = "sku_id", nullable = false)
  private UUID skuId;

  /**
   * 门店ID
   */
  @Column(name = "store_id", nullable = false)
  private UUID storeId;

  /**
   * 调整类型：surplus/shortage/damage
   */
  @Column(name = "adjustment_type", nullable = false, length = 20)
  private String adjustmentType;

  /**
   * 调整数量（始终为正数）
   */
  @Column(nullable = false)
  private Integer quantity;

  /**
   * 单价
   */
  @Column(name = "unit_price", precision = 12, scale = 2, nullable = false)
  private BigDecimal unitPrice;

  /**
   * 调整金额（自动计算：quantity * unit_price）
   */
  @Column(name = "adjustment_amount", precision = 12, scale = 2, insertable = false, updatable = false)
  private BigDecimal adjustmentAmount;

  /**
   * 原因代码
   */
  @Column(name = "reason_code", nullable = false, length = 50)
  private String reasonCode;

  /**
   * 原因说明
   */
  @Column(name = "reason_text", length = 500)
  private String reasonText;

  /**
   * 备注
   */
  @Column(length = 500)
  private String remarks;

  /**
   * 状态：draft/pending_approval/approved/rejected/withdrawn
   */
  @Column(nullable = false, length = 20)
  @Builder.Default
  private String status = "draft";

  /**
   * 调整前现存数量
   */
  @Column(name = "stock_before", nullable = false)
  private Integer stockBefore;

  /**
   * 调整后现存数量
   */
  @Column(name = "stock_after", nullable = false)
  private Integer stockAfter;

  /**
   * 调整前可用数量
   */
  @Column(name = "available_before", nullable = false)
  private Integer availableBefore;

  /**
   * 调整后可用数量
   */
  @Column(name = "available_after", nullable = false)
  private Integer availableAfter;

  /**
   * 是否需要审批
   */
  @Column(name = "requires_approval")
  @Builder.Default
  private Boolean requiresApproval = false;

  /**
   * 操作人ID
   */
  @Column(name = "operator_id", nullable = false)
  private UUID operatorId;

  /**
   * 操作人姓名
   */
  @Column(name = "operator_name", nullable = false, length = 100)
  private String operatorName;

  /**
   * 审批时间
   */
  @Column(name = "approved_at")
  private OffsetDateTime approvedAt;

  /**
   * 审批人ID
   */
  @Column(name = "approved_by")
  private UUID approvedBy;

  /**
   * 关联的流水ID
   */
  @Column(name = "transaction_id")
  private UUID transactionId;

  /**
   * 创建时间
   */
  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private OffsetDateTime createdAt;

  /**
   * 更新时间
   */
  @UpdateTimestamp
  @Column(name = "updated_at", nullable = false)
  private OffsetDateTime updatedAt;

  /**
   * 乐观锁版本号
   */
  @Version
  @Column(nullable = false)
  @Builder.Default
  private Integer version = 1;

  // ========== 业务方法 ==========

  /**
   * 是否可以撤回
   */
  public boolean canWithdraw() {
    return "pending_approval".equals(this.status);
  }

  /**
   * 是否可以审批
   */
  public boolean canApprove() {
    return "pending_approval".equals(this.status);
  }

  /**
   * 是否是入库调整
   */
  public boolean isInbound() {
    return "surplus".equals(this.adjustmentType);
  }

  /**
   * 是否是出库调整
   */
  public boolean isOutbound() {
    return "shortage".equals(this.adjustmentType) || "damage".equals(this.adjustmentType);
  }
}
