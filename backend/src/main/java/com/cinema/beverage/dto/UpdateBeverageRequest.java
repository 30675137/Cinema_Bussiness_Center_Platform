/**
 * @spec O003-beverage-order
 * 更新饮品请求DTO (User Story 3 - FR-030)
 */
package com.cinema.beverage.dto;

import com.cinema.beverage.entity.Beverage;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * 更新饮品请求
 *
 * 对应 FR-030: 编辑饮品功能
 */
@Data
public class UpdateBeverageRequest {

    /**
     * 饮品名称
     */
    @Size(max = 100, message = "饮品名称不能超过100个字符")
    private String name;

    /**
     * 饮品分类
     */
    private Beverage.BeverageCategory category;

    /**
     * 基础价格(单位:分)
     */
    @Min(value = 0, message = "基础价格不能为负数")
    private Long basePrice;

    /**
     * 饮品描述
     */
    @Size(max = 500, message = "描述不能超过500个字符")
    private String description;

    /**
     * 主图URL
     */
    private String mainImage;

    /**
     * 详情图URL列表
     */
    private List<String> detailImages;

    /**
     * 是否推荐
     */
    private Boolean isRecommended;

    /**
     * 状态
     */
    private Beverage.BeverageStatus status;
}
