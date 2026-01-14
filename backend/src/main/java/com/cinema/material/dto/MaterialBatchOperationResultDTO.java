/**
 * @spec M002-material-filter
 */
package com.cinema.material.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Material batch operation result DTO - 批量操作结果
 *
 * <p>User Story: US4 - 批量操作物料
 */
@Data
@Builder
public class MaterialBatchOperationResultDTO {
    
    /** 成功数量 */
    private Integer successCount;
    
    /** 失败数量 */
    private Integer failureCount;
    
    /** 操作结果详情 */
    private List<MaterialBatchOperationItemDTO> items;
}
