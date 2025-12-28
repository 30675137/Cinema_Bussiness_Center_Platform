/**
 * @spec O003-beverage-order
 * 创建饮品规格请求DTO (User Story 3 - FR-032)
 */
package com.cinema.beverage.dto;

import com.cinema.beverage.entity.BeverageSpec;
import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * 创建饮品规格请求
 *
 * 对应 FR-032: 配置饮品规格功能
 * 支持配置规格类型（SIZE/TEMPERATURE/SWEETNESS/TOPPING）及价格调整
 */
@Data
public class CreateSpecRequest {

    /**
     * 规格类型
     */
    @NotNull(message = "规格类型不能为空")
    private BeverageSpec.SpecType specType;

    /**
     * 规格名称
     */
    @NotBlank(message = "规格名称不能为空")
    @Size(max = 50, message = "规格名称不能超过50个字符")
    private String name;

    /**
     * 价格调整(单位:分)
     * 正数表示加价，负数表示减价，0表示无调整
     */
    @NotNull(message = "价格调整不能为空")
    private Long priceAdjustment;

    /**
     * 是否为默认选项
     */
    private Boolean isDefault = false;

    /**
     * 排序序号(用于前端展示顺序)
     */
    @Min(value = 0, message = "排序序号不能为负数")
    private Integer sortOrder = 0;

    /**
     * 规格描述
     */
    @Size(max = 200, message = "规格描述不能超过200个字符")
    private String description;
}
