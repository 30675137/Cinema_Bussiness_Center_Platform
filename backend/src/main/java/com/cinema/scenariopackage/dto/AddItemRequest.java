package com.cinema.scenariopackage.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * 添加单品请求 DTO
 *
 * @author Cinema Platform
 * @since 2025-12-20
 */
public class AddItemRequest {

  @NotNull(message = "单品ID不能为空")
  private UUID itemId;

  @NotNull(message = "数量不能为空")
  @Min(value = 1, message = "数量至少为1")
  private Integer quantity;

  /**
   * 单品名称快照（添加时的名称）
   */
  @NotBlank(message = "单品名称不能为空")
  private String itemName;

  /**
   * 单品价格快照（添加时的价格）
   */
  @NotNull(message = "单品价格不能为空")
  private BigDecimal itemPrice;

  /**
   * 排序序号
   */
  private Integer sortOrder;

  // Getters and Setters

  public UUID getItemId() {
    return itemId;
  }

  public void setItemId(UUID itemId) {
    this.itemId = itemId;
  }

  public Integer getQuantity() {
    return quantity;
  }

  public void setQuantity(Integer quantity) {
    this.quantity = quantity;
  }

  public String getItemName() {
    return itemName;
  }

  public void setItemName(String itemName) {
    this.itemName = itemName;
  }

  public BigDecimal getItemPrice() {
    return itemPrice;
  }

  public void setItemPrice(BigDecimal itemPrice) {
    this.itemPrice = itemPrice;
  }

  public Integer getSortOrder() {
    return sortOrder;
  }

  public void setSortOrder(Integer sortOrder) {
    this.sortOrder = sortOrder;
  }
}
