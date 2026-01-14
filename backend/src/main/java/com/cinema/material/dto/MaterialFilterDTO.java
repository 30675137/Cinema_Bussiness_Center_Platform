/**
 * @spec M002-material-filter
 */
package com.cinema.material.dto;

import com.cinema.material.entity.Material.MaterialCategory;
import com.cinema.material.entity.MaterialStatus;
import jakarta.validation.constraints.AssertTrue;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Material filter DTO - 物料筛选条件
 *
 * <p>User Story: US1 - 快速筛选物料
 */
@Data
public class MaterialFilterDTO {
    
    /** 物料分类 */
    private MaterialCategory category;
    
    /** 物料状态 */
    private MaterialStatus status;
    
    /** 最小标准成本 */
    private BigDecimal minCost;
    
    /** 最大标准成本 */
    private BigDecimal maxCost;
    
    /** 关键词（搜索编码或名称） */
    private String keyword;
    
    /**
     * 验证成本范围是否合法
     */
    @AssertTrue(message = "最小成本不能大于最大成本")
    public boolean isCostRangeValid() {
        if (minCost != null && maxCost != null) {
            return minCost.compareTo(maxCost) <= 0;
        }
        return true;
    }
}
