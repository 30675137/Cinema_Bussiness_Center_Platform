/**
 * @spec O003-beverage-order
 * 饮品配方响应DTO (User Story 3)
 */
package com.cinema.beverage.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 饮品配方响应DTO
 *
 * 用于返回配方信息，包含原料清单
 */
@Data
public class BeverageRecipeDTO {

    /**
     * 配方ID
     */
    private String id;

    /**
     * 饮品ID
     */
    private String beverageId;

    /**
     * 配方名称
     */
    private String name;

    /**
     * 配方适用的规格组合
     */
    private String applicableSpecs;

    /**
     * 配方描述
     */
    private String description;

    /**
     * 原料清单
     */
    private List<RecipeIngredientDTO> ingredients;

    /**
     * 创建时间
     */
    private String createdAt;

    /**
     * 更新时间
     */
    private String updatedAt;

    /**
     * 原料配方项响应DTO
     */
    @Data
    public static class RecipeIngredientDTO {

        /**
         * 配方项ID
         */
        private String id;

        /**
         * 原料SKU ID (UUID 字符串)
         */
        private String skuId;

        /**
         * 原料名称
         */
        private String ingredientName;

        /**
         * 用量
         */
        private Double quantity;

        /**
         * 单位
         */
        private String unit;

        /**
         * 备注
         */
        private String note;

        /**
         * SKU当前库存状态（从P003库存模块查询）
         */
        private SkuStockStatus stockStatus;
    }

    /**
     * SKU库存状态
     */
    @Data
    public static class SkuStockStatus {

        /**
         * 是否有库存
         */
        private Boolean inStock;

        /**
         * 当前库存数量
         */
        private Double availableQuantity;

        /**
         * 单位
         */
        private String unit;

        /**
         * 库存状态文本（如"充足"、"紧张"、"缺货"）
         */
        private String statusText;
    }
}
