package com.cinema.material.dto;

import com.cinema.material.domain.MaterialCategory;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * M001: 物料创建/更新请求 DTO
 * 
 * @author Cinema System
 * @since 2026-01-14
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaterialRequest {
    
    /**
     * 物料编码 (可选,为空时自动生成)
     */
    @Size(max = 50, message = "Material code must not exceed 50 characters")
    private String code;
    
    /**
     * 物料名称 (必填)
     */
    @NotBlank(message = "Material name is required")
    @Size(max = 100, message = "Material name must not exceed 100 characters")
    private String name;
    
    /**
     * 物料类别 (必填)
     */
    @NotNull(message = "Material category is required")
    private MaterialCategory category;
    
    /**
     * 库存单位ID (必填)
     */
    @NotNull(message = "Inventory unit is required")
    private UUID inventoryUnitId;
    
    /**
     * 采购单位ID (必填)
     */
    @NotNull(message = "Purchase unit is required")
    private UUID purchaseUnitId;
    
    /**
     * 换算率 (1采购单位 = conversionRate 库存单位)
     * 当 useGlobalConversion=false 时必填
     */
    @DecimalMin(value = "0.000001", message = "Conversion rate must be greater than 0")
    @Digits(integer = 10, fraction = 6, message = "Conversion rate must have at most 10 integer digits and 6 decimal digits")
    private BigDecimal conversionRate;
    
    /**
     * 是否使用全局换算规则
     */
    @Builder.Default
    private Boolean useGlobalConversion = true;
    
    /**
     * 规格说明
     */
    @Size(max = 500, message = "Specification must not exceed 500 characters")
    private String specification;
    
    /**
     * 物料描述
     */
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    
    /**
     * 标准成本
     */
    @DecimalMin(value = "0.00", message = "Standard cost must be greater than or equal to 0")
    @Digits(integer = 10, fraction = 2, message = "Standard cost must have at most 10 integer digits and 2 decimal digits")
    private BigDecimal standardCost;
    
    /**
     * 状态
     */
    @Builder.Default
    private String status = "ACTIVE";
}
