/** @spec M001-material-unit-system */
package com.cinema.unitconversion.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * M001: 换算请求 DTO
 * 
 * 支持物料级换算优先逻辑:
 * - 如果提供 materialId,优先使用物料级换算
 * - 如果未提供 materialId 或物料启用全局换算,使用全局换算
 * 
 * @author Cinema System
 * @since 2026-01-14
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversionRequest {
    
    /**
     * 物料ID (可选)
     * - 如果提供,则启用物料级换算优先逻辑
     * - 如果不提供,则使用纯全局换算
     */
    private UUID materialId;
    
    /**
     * 源单位代码 (必填)
     * 
     * 示例: "bottle", "g", "piece"
     */
    @NotBlank(message = "Source unit code is required")
    private String fromUnitCode;
    
    /**
     * 目标单位代码 (必填)
     * 
     * 示例: "ml", "kg", "box"
     */
    @NotBlank(message = "Target unit code is required")
    private String toUnitCode;
    
    /**
     * 待换算的数量 (必填)
     * 
     * 约束:
     * - 必须 > 0
     * - 最多 10 位整数 + 6 位小数
     * 
     * 示例: 2.5 (表示 2.5 瓶)
     */
    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.000001", message = "Quantity must be greater than 0")
    @Digits(integer = 10, fraction = 6, message = "Quantity must have at most 10 integer digits and 6 decimal digits")
    private BigDecimal quantity;
}
