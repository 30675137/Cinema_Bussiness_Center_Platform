package com.cinema.inventory.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 审批请求 DTO
 * 
 * P004-inventory-adjustment
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalRequest {

  /**
   * 审批操作：approve(通过)/reject(拒绝)
   */
  @NotBlank(message = "审批操作不能为空")
  @Pattern(regexp = "^(approve|reject)$", message = "审批操作无效")
  private String action;

  /**
   * 审批意见（可选）
   */
  @Size(max = 1000, message = "审批意见不能超过1000字符")
  private String comments;
}
