package com.cinema.inventory.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 库存调整创建请求 DTO
 * 
 * P004-inventory-adjustment
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdjustmentRequest {

  /**
   * SKU ID
   */
  @NotNull(message = "SKU ID不能为空")
  private String skuId;

  /**
   * 门店ID
   */
  @NotNull(message = "门店ID不能为空")
  private String storeId;

  /**
   * 调整类型：surplus(盘盈)/shortage(盘亏)/damage(报损)
   */
  @NotBlank(message = "调整类型不能为空")
  @Pattern(regexp = "^(surplus|shortage|damage)$", message = "调整类型无效")
  private String adjustmentType;

  /**
   * 调整数量（始终为正数）
   */
  @NotNull(message = "调整数量不能为空")
  @Min(value = 1, message = "调整数量必须大于0")
  private Integer quantity;

  /**
   * 原因代码
   */
  @NotBlank(message = "请选择调整原因")
  private String reasonCode;

  /**
   * 原因补充说明（可选）
   */
  @Size(max = 500, message = "原因说明不能超过500字符")
  private String reasonText;

  /**
   * 备注（可选）
   */
  @Size(max = 500, message = "备注不能超过500字符")
  private String remarks;
}
