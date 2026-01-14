/**
 * @spec M002-material-filter
 */
package com.cinema.material.dto;

import com.cinema.material.entity.Material.MaterialCategory;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Material import data DTO - 导入的单条物料数据
 *
 * <p>User Story: US3 - 批量导入物料数据
 */
@Data
public class MaterialImportDataDTO {
    
    /** 物料编码（可选，留空自动生成） */
    private String code;
    
    /** 物料名称 */
    @NotBlank(message = "物料名称不能为空")
    @Size(max = 100, message = "物料名称长度不能超过100字符")
    private String name;
    
    /** 分类 */
    @NotNull(message = "分类不能为空")
    private MaterialCategory category;
    
    /** 库存单位ID */
    @NotBlank(message = "库存单位ID不能为空")
    private String inventoryUnitId;
    
    /** 采购单位ID */
    @NotBlank(message = "采购单位ID不能为空")
    private String purchaseUnitId;
    
    /** 换算率 */
    @DecimalMin(value = "0.000001", message = "换算率必须大于0")
    private BigDecimal conversionRate;
    
    /** 是否使用全局换算规则 */
    private Boolean useGlobalConversion;
    
    /** 标准成本 */
    @DecimalMin(value = "0", message = "标准成本不能为负数")
    private BigDecimal standardCost;
    
    /** 规格 */
    @Size(max = 500, message = "规格长度不能超过500字符")
    private String specification;
    
    /** 描述 */
    @Size(max = 1000, message = "描述长度不能超过1000字符")
    private String description;
}
