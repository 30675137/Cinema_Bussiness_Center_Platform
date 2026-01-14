/**
 * @spec M002-material-filter
 */
package com.cinema.material.dto;

import com.cinema.material.entity.MaterialStatus;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

/**
 * Material batch operation request DTO - 批量操作请求
 *
 * <p>User Story: US4 - 批量操作物料
 */
@Data
public class MaterialBatchOperationRequestDTO {
    
    /** 物料ID列表 */
    @NotEmpty(message = "物料ID列表不能为空")
    @Size(max = 100, message = "单次批量操作不能超过100项")
    private List<String> materialIds;
    
    /** 操作类型 */
    @NotNull(message = "操作类型不能为空")
    private BatchOperationType operation;
    
    /** 目标状态（UPDATE_STATUS 时必填） */
    private MaterialStatus targetStatus;
    
    /**
     * 验证修改状态操作必须指定目标状态
     */
    @AssertTrue(message = "修改状态操作必须指定目标状态")
    public boolean isTargetStatusValid() {
        if (operation == BatchOperationType.UPDATE_STATUS) {
            return targetStatus != null;
        }
        return true;
    }
    
    /**
     * Batch operation type enumeration
     */
    public enum BatchOperationType {
        /** 删除 */
        DELETE,
        
        /** 修改状态 */
        UPDATE_STATUS
    }
}
