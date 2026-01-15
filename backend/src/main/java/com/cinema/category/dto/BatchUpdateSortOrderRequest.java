package com.cinema.category.dto;

import jakarta.validation.Valid;
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
 * 批量更新排序请求 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchUpdateSortOrderRequest {

    /**
     * 排序项列表
     */
    @NotEmpty(message = "排序项列表不能为空")
    @Valid
    private List<SortOrderItem> items;

    /**
     * 排序项
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SortOrderItem {

        /**
         * 分类 ID
         */
        @NotNull(message = "分类ID不能为空")
        private UUID id;

        /**
         * 新的排序序号
         */
        @NotNull(message = "排序序号不能为空")
        private Integer sortOrder;
    }
}
