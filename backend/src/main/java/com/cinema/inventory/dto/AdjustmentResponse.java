package com.cinema.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * 库存调整响应 DTO
 * 
 * P004-inventory-adjustment
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdjustmentResponse {

  /**
   * 调整记录ID
   */
  private String id;

  /**
   * 调整单号
   */
  private String adjustmentNumber;

  /**
   * SKU ID
   */
  private String skuId;

  /**
   * SKU 信息
   */
  private SkuInfo sku;

  /**
   * 门店ID
   */
  private String storeId;

  /**
   * 门店信息
   */
  private StoreInfo store;

  /**
   * 调整类型
   */
  private String adjustmentType;

  /**
   * 调整数量
   */
  private Integer quantity;

  /**
   * 单价
   */
  private BigDecimal unitPrice;

  /**
   * 调整金额
   */
  private BigDecimal adjustmentAmount;

  /**
   * 原因代码
   */
  private String reasonCode;

  /**
   * 原因说明
   */
  private String reasonText;

  /**
   * 备注
   */
  private String remarks;

  /**
   * 状态
   */
  private String status;

  /**
   * 调整前现存数量
   */
  private Integer stockBefore;

  /**
   * 调整后现存数量
   */
  private Integer stockAfter;

  /**
   * 调整前可用数量
   */
  private Integer availableBefore;

  /**
   * 调整后可用数量
   */
  private Integer availableAfter;

  /**
   * 是否需要审批
   */
  private Boolean requiresApproval;

  /**
   * 操作人ID
   */
  private String operatorId;

  /**
   * 操作人姓名
   */
  private String operatorName;

  /**
   * 审批时间
   */
  private OffsetDateTime approvedAt;

  /**
   * 审批人ID
   */
  private String approvedBy;

  /**
   * 关联的流水ID
   */
  private String transactionId;

  /**
   * 创建时间
   */
  private OffsetDateTime createdAt;

  /**
   * 更新时间
   */
  private OffsetDateTime updatedAt;

  /**
   * 版本号
   */
  private Integer version;

  // ========== 嵌套类 ==========

  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public static class SkuInfo {
    private String id;
    private String code;
    private String name;
    private String unit;
    private BigDecimal unitPrice;
  }

  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public static class StoreInfo {
    private String id;
    private String code;
    private String name;
  }
}
