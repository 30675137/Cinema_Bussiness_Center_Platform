package com.cinema.scenariopackage.dto;

import com.cinema.scenariopackage.model.PackageBenefit.BenefitType;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

/**
 * 添加硬权益请求 DTO
 *
 * @author Cinema Platform
 * @since 2025-12-20
 */
public class AddBenefitRequest {

  @NotNull(message = "权益类型不能为空")
  private BenefitType benefitType;

  /**
   * 折扣率（0.01-1.00），仅 DISCOUNT_TICKET 类型使用
   */
  @DecimalMin(value = "0.01", message = "折扣率不能低于1%")
  @DecimalMax(value = "1.00", message = "折扣率不能超过100%")
  private BigDecimal discountRate;

  /**
   * 免费场次数量，仅 FREE_SCREENING 类型使用
   */
  @Min(value = 1, message = "免费场次数量至少为1")
  private Integer freeCount;

  /**
   * 权益描述
   */
  private String description;

  /**
   * 排序序号
   */
  private Integer sortOrder;

  // Getters and Setters

  public BenefitType getBenefitType() {
    return benefitType;
  }

  public void setBenefitType(BenefitType benefitType) {
    this.benefitType = benefitType;
  }

  public BigDecimal getDiscountRate() {
    return discountRate;
  }

  public void setDiscountRate(BigDecimal discountRate) {
    this.discountRate = discountRate;
  }

  public Integer getFreeCount() {
    return freeCount;
  }

  public void setFreeCount(Integer freeCount) {
    this.freeCount = freeCount;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public Integer getSortOrder() {
    return sortOrder;
  }

  public void setSortOrder(Integer sortOrder) {
    this.sortOrder = sortOrder;
  }
}
