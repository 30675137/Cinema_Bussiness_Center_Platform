/** @spec M001-material-unit-system */
package com.cinema.unitconversion.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * M001: 换算响应 DTO
 * 
 * 返回换算结果和换算来源信息
 * 
 * @author Cinema System
 * @since 2026-01-14
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversionResponse {
    
    /**
     * 物料ID (如果提供)
     */
    private UUID materialId;
    
    /**
     * 源单位代码
     * 
     * 示例: "bottle"
     */
    private String fromUnitCode;
    
    /**
     * 目标单位代码
     * 
     * 示例: "ml"
     */
    private String toUnitCode;
    
    /**
     * 原始数量
     * 
     * 示例: 2.5 (2.5 瓶)
     */
    private BigDecimal originalQuantity;
    
    /**
     * 换算后的数量
     * 
     * 示例: 1250.0 (1250 ml)
     */
    private BigDecimal convertedQuantity;
    
    /**
     * 使用的换算率
     * 
     * 示例: 500.000000 (1 瓶 = 500 ml)
     */
    private BigDecimal conversionRate;
    
    /**
     * 换算来源
     * 
     * 可选值:
     * - "material": 使用物料级换算
     * - "global": 使用全局换算
     */
    private String source;
    
    /**
     * 换算公式说明
     * 
     * 示例: "2.5 bottle × 500.000000 = 1250.0 ml (material-level)"
     */
    private String formula;
}
