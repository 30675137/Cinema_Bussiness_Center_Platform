/**
 * @spec M002-material-filter
 */
package com.cinema.material.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Material export DTO - 导出到 Excel 的物料数据
 *
 * <p>User Story: US2 - 批量导出物料数据
 */
@Data
@Builder
public class MaterialExportDTO {
    
    /** 物料编码 */
    private String code;
    
    /** 物料名称 */
    private String name;
    
    /** 分类（中文标签） */
    private String category;
    
    /** 状态（中文标签） */
    private String status;
    
    /** 库存单位名称 */
    private String inventoryUnitName;
    
    /** 采购单位名称 */
    private String purchaseUnitName;
    
    /** 换算率 */
    private BigDecimal conversionRate;
    
    /** 标准成本 */
    private BigDecimal standardCost;
    
    /** 规格 */
    private String specification;
    
    /** 描述 */
    private String description;
    
    /** 创建时间（格式化） */
    private String createdAt;
}
