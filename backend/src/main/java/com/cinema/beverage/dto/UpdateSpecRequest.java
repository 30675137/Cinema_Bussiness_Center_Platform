/**
 * @spec O003-beverage-order
 * 更新饮品规格请求DTO (User Story 3 - FR-033)
 */
package com.cinema.beverage.dto;

import com.cinema.beverage.entity.BeverageSpec;
import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * 更新饮品规格请求
 *
 * 对应 FR-033: 编辑/删除规格功能
 * 所有字段均为可选，仅更新传入的字段
 */
@Data
public class UpdateSpecRequest {

    /**
     * 规格类型
     */
    private BeverageSpec.SpecType specType;

    /**
     * 规格名称
     */
    @Size(max = 50, message = "规格名称不能超过50个字符")
    private String name;

    /**
     * 价格调整(单位:分)
     */
    private Long priceAdjustment;

    /**
     * 是否为默认选项
     */
    private Boolean isDefault;

    /**
     * 排序序号
     */
    @Min(value = 0, message = "排序序号不能为负数")
    private Integer sortOrder;

    /**
     * 规格描述
     */
    @Size(max = 200, message = "规格描述不能超过200个字符")
    private String description;
}
