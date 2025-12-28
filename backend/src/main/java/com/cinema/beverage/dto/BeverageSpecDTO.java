/**
 * @spec O003-beverage-order
 * 饮品规格响应DTO (User Story 3)
 */
package com.cinema.beverage.dto;

import com.cinema.beverage.entity.BeverageSpec;
import lombok.Data;

/**
 * 饮品规格响应DTO
 *
 * 用于返回规格信息
 */
@Data
public class BeverageSpecDTO {

    /**
     * 规格ID (UUID字符串)
     */
    private String id;

    /**
     * 饮品ID (UUID字符串)
     */
    private String beverageId;

    /**
     * 规格类型
     */
    private BeverageSpec.SpecType specType;

    /**
     * 规格名称
     */
    private String name;

    /**
     * 价格调整（单位：分）
     */
    private Long priceAdjustment;

    /**
     * 是否为默认选项
     */
    private Boolean isDefault;

    /**
     * 排序顺序
     */
    private Integer sortOrder;

    /**
     * 创建时间
     */
    private String createdAt;

    /**
     * 更新时间
     */
    private String updatedAt;
}
