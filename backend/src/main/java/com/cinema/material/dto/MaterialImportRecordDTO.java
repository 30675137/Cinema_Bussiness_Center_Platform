/**
 * @spec M002-material-filter
 */
package com.cinema.material.dto;

import lombok.Data;

import java.util.List;

/**
 * Material import record DTO - 导入文件中的单条记录及其校验状态
 *
 * <p>User Story: US3 - 批量导入物料数据
 */
@Data
public class MaterialImportRecordDTO {
    
    /** Excel 行号（从1开始） */
    private Integer rowIndex;
    
    /** 导入的物料数据 */
    private MaterialImportDataDTO data;
    
    /** 是否校验通过 */
    private Boolean valid;
    
    /** 错误信息列表 */
    private List<String> errors;
}
