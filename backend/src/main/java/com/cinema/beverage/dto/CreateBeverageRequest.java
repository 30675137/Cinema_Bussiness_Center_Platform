/**
 * @spec O003-beverage-order
 * 创建饮品请求DTO (User Story 3 - FR-029)
 */
package com.cinema.beverage.dto;

import com.cinema.beverage.entity.Beverage;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * 创建饮品请求
 *
 * 对应 FR-029: 新增饮品功能
 */
@Data
public class CreateBeverageRequest {

    /**
     * 饮品名称
     */
    @NotBlank(message = "饮品名称不能为空")
    @Size(max = 100, message = "饮品名称不能超过100个字符")
    private String name;

    /**
     * 饮品分类
     */
    @NotNull(message = "饮品分类不能为空")
    private Beverage.BeverageCategory category;

    /**
     * 基础价格(单位:分)
     */
    @NotNull(message = "基础价格不能为空")
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
    @NotBlank(message = "主图不能为空")
    private String mainImage;

    /**
     * 详情图URL列表
     */
    private List<String> detailImages;

    /**
     * 是否推荐
     */
    private Boolean isRecommended = false;

    /**
     * 初始状态(默认下架)
     */
    private Beverage.BeverageStatus status = Beverage.BeverageStatus.INACTIVE;
}
