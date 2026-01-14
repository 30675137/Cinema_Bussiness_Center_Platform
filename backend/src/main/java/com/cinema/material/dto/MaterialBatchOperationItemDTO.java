/**
 * @spec M002-material-filter
 */
package com.cinema.material.dto;

import lombok.Builder;
import lombok.Data;

/**
 * Material batch operation item DTO - 批量操作单项结果
 *
 * <p>User Story: US4 - 批量操作物料
 */
@Data
@Builder
public class MaterialBatchOperationItemDTO {
    
    /** 物料ID */
    private String materialId;
    
    /** 物料编码 */
    private String materialCode;
    
    /** 是否成功 */
    private Boolean success;
    
    /** 错误信息 */
    private String error;
}
