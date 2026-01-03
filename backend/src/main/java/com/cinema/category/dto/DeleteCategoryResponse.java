package com.cinema.category.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * @spec O002-miniapp-menu-config
 * 删除分类响应 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeleteCategoryResponse {

    /**
     * 被删除的分类 ID
     */
    private UUID deletedCategoryId;

    /**
     * 被删除的分类名称
     */
    private String deletedCategoryName;

    /**
     * 受影响的商品数量
     */
    private Integer affectedProductCount;

    /**
     * 商品迁移目标分类 ID
     */
    private UUID targetCategoryId;

    /**
     * 商品迁移目标分类名称
     */
    private String targetCategoryName;

    /**
     * 创建删除响应
     */
    public static DeleteCategoryResponse of(
            UUID deletedCategoryId,
            String deletedCategoryName,
            Integer affectedProductCount,
            UUID targetCategoryId,
            String targetCategoryName
    ) {
        return DeleteCategoryResponse.builder()
                .deletedCategoryId(deletedCategoryId)
                .deletedCategoryName(deletedCategoryName)
                .affectedProductCount(affectedProductCount)
                .targetCategoryId(targetCategoryId)
                .targetCategoryName(targetCategoryName)
                .build();
    }

    /**
     * 创建无需迁移的删除响应（空分类）
     */
    public static DeleteCategoryResponse ofEmpty(UUID deletedCategoryId, String deletedCategoryName) {
        return DeleteCategoryResponse.builder()
                .deletedCategoryId(deletedCategoryId)
                .deletedCategoryName(deletedCategoryName)
                .affectedProductCount(0)
                .build();
    }

    /**
     * 获取删除结果描述
     */
    public String getMessage() {
        if (affectedProductCount == null || affectedProductCount == 0) {
            return String.format("分类「%s」已删除", deletedCategoryName);
        }
        return String.format("分类「%s」已删除，%d 个商品已迁移到「%s」分类",
                deletedCategoryName, affectedProductCount, targetCategoryName);
    }
}
