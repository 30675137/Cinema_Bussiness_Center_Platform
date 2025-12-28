/**
 * @spec O003-beverage-order
 * 创建饮品配方请求DTO (User Story 3 - FR-035)
 */
package com.cinema.beverage.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

/**
 * 创建饮品配方请求
 *
 * 对应 FR-035 & FR-037: 配置饮品配方(BOM)及SKU校验
 * 包含配方基本信息和原料清单
 */
@Data
public class CreateRecipeRequest {

    /**
     * 配方名称（如"标准配方"、"加强版配方"）
     */
    @NotBlank(message = "配方名称不能为空")
    @Size(max = 100, message = "配方名称不能超过100个字符")
    private String name;

    /**
     * 配方适用的规格组合（可选，JSON格式存储）
     * 例如: {"SIZE": "LARGE", "TEMPERATURE": "HOT"}
     * null 表示适用所有规格组合
     */
    private String applicableSpecs;

    /**
     * 配方描述
     */
    @Size(max = 500, message = "配方描述不能超过500个字符")
    private String description;

    /**
     * 原料清单
     */
    @NotEmpty(message = "原料清单不能为空")
    @Valid
    private List<RecipeIngredientRequest> ingredients;

    /**
     * 原料配方项
     */
    @Data
    public static class RecipeIngredientRequest {

        /**
         * 原料SKU ID（关联P003/P004库存管理模块）
         * UUID 格式字符串
         */
        @NotNull(message = "原料SKU ID不能为空")
        private String skuId;

        /**
         * 原料名称（冗余存储，便于展示）
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
         * 单位（如: g, ml, 个）
         */
        @NotBlank(message = "单位不能为空")
        @Size(max = 20, message = "单位不能超过20个字符")
        private String unit;

        /**
         * 备注（如"室温"、"需加热"等）
         */
        @Size(max = 200, message = "备注不能超过200个字符")
        private String note;
    }
}
