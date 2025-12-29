/**
 * @spec O003-beverage-order
 * 更新饮品配方请求DTO (User Story 3 - FR-036)
 */
package com.cinema.beverage.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

/**
 * 更新饮品配方请求
 *
 * 对应 FR-036 & FR-037: 编辑配方及SKU校验
 * 所有字段均为可选，仅更新传入的字段
 */
@Data
public class UpdateRecipeRequest {

    /**
     * 配方名称
     */
    @Size(max = 100, message = "配方名称不能超过100个字符")
    private String name;

    /**
     * 配方适用的规格组合
     */
    private String applicableSpecs;

    /**
     * 配方描述
     */
    @Size(max = 500, message = "配方描述不能超过500个字符")
    private String description;

    /**
     * 原料清单（如果传入，则完全替换原有配方）
     */
    @Valid
    private List<RecipeIngredientRequest> ingredients;

    /**
     * 原料配方项
     */
    @Data
    public static class RecipeIngredientRequest {

        /**
         * 原料SKU ID
         * UUID 格式字符串
         */
        @NotNull(message = "原料SKU ID不能为空")
        private String skuId;

        /**
         * 原料名称
         */
        @NotBlank(message = "原料名称不能为空")
        private String ingredientName;

        /**
         * 用量
         */
        @NotNull(message = "用量不能为空")
        @DecimalMin(value = "0.01", message = "用量必须大于0")
        private Double quantity;

        /**
         * 单位
         */
        @NotBlank(message = "单位不能为空")
        @Size(max = 20, message = "单位不能超过20个字符")
        private String unit;

        /**
         * 备注
         */
        @Size(max = 200, message = "备注不能超过200个字符")
        private String note;
    }
}
