/**
 * @spec M002-material-filter
 */
package com.cinema.material.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Material import result DTO - 导入操作的汇总结果
 *
 * <p>User Story: US3 - 批量导入物料数据
 */
@Data
@Builder
public class MaterialImportResultDTO {
    
    /** 总行数 */
    private Integer totalCount;
    
    /** 成功行数 */
    private Integer successCount;
    
    /** 失败行数 */
    private Integer failureCount;
    
    /** 详细记录列表 */
    private List<MaterialImportRecordDTO> records;
}
