package com.cinema.category.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * @spec O002-miniapp-menu-config
 * 客户端菜单分类 DTO（小程序端精简版）
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientMenuCategoryDTO {

    /**
     * 分类 ID
     */
    private UUID id;

    /**
     * 分类编码
     */
    private String code;

    /**
     * 显示名称
     */
    private String displayName;

    /**
     * 图标 URL
     */
    private String iconUrl;

    /**
     * 商品数量
     */
    private Integer productCount;

    /**
     * 从实体转换为客户端 DTO
     */
    public static ClientMenuCategoryDTO fromEntity(com.cinema.category.entity.MenuCategory entity) {
        if (entity == null) {
            return null;
        }
        return ClientMenuCategoryDTO.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .displayName(entity.getDisplayName())
                .iconUrl(entity.getIconUrl())
                .productCount(entity.getProductCount())
                .build();
    }

    /**
     * 从实体转换为客户端 DTO（附带商品数量）
     */
    public static ClientMenuCategoryDTO fromEntity(com.cinema.category.entity.MenuCategory entity, Integer productCount) {
        ClientMenuCategoryDTO dto = fromEntity(entity);
        if (dto != null) {
            dto.setProductCount(productCount);
        }
        return dto;
    }
}
