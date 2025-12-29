package com.cinema.scenariopackage.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * 添加服务请求 DTO
 *
 * @author Cinema Platform
 * @since 2025-12-20
 */
public class AddServiceRequest {

  @NotNull(message = "服务ID不能为空")
  private UUID serviceId;

  /**
   * 服务名称快照（添加时的名称）
   */
  @NotBlank(message = "服务名称不能为空")
  private String serviceName;

  /**
   * 服务价格快照（添加时的价格）
   */
  @NotNull(message = "服务价格不能为空")
  private BigDecimal servicePrice;

  /**
   * 排序序号
   */
  private Integer sortOrder;

  // Getters and Setters

  public UUID getServiceId() {
    return serviceId;
  }

  public void setServiceId(UUID serviceId) {
    this.serviceId = serviceId;
  }

  public String getServiceName() {
    return serviceName;
  }

  public void setServiceName(String serviceName) {
    this.serviceName = serviceName;
  }

  public BigDecimal getServicePrice() {
    return servicePrice;
  }

  public void setServicePrice(BigDecimal servicePrice) {
    this.servicePrice = servicePrice;
  }

  public Integer getSortOrder() {
    return sortOrder;
  }

  public void setSortOrder(Integer sortOrder) {
    this.sortOrder = sortOrder;
  }
}
