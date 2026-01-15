package com.cinema.category.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * @spec O002-miniapp-menu-config
 * 批量排序请求 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchSortRequest {

    /**
     * 分类排序项列表
     */
    @NotEmpty(message = "排序项列表不能为空")
    @Valid
    private List<CategorySortItem> items;

    /**
     * 分类排序项（内部类）
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategorySortItem {

        /**
         * 分类 ID
         */
        @NotNull(message = "分类 ID 不能为空")
        private UUID categoryId;

        /**
         * 排序序号（数字越小越靠前）
         */
        @NotNull(message = "排序序号不能为空")
        @Min(value = 0, message = "排序序号不能小于 0")
        private Integer sortOrder;
    }
}
