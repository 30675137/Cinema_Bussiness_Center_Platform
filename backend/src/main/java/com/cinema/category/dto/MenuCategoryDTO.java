package com.cinema.category.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * @spec O002-miniapp-menu-config
 * 菜单分类 DTO（管理端）
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuCategoryDTO {

    /**
     * 分类 ID
     */
    private UUID id;

    /**
     * 分类编码（如 "ALCOHOL", "COFFEE"）
     */
    private String code;

    /**
     * 显示名称（如 "经典特调"）
     */
    private String displayName;

    /**
     * 排序序号
     */
    private Integer sortOrder;

    /**
     * 是否可见
     */
    private Boolean isVisible;

    /**
     * 是否为默认分类
     */
    private Boolean isDefault;

    /**
     * 图标 URL
     */
    private String iconUrl;

    /**
     * 分类描述
     */
    private String description;

    /**
     * 关联商品数量
     */
    private Integer productCount;

    /**
     * 乐观锁版本号
     */
    private Long version;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;

    /**
     * 从实体转换为 DTO
     */
    public static MenuCategoryDTO fromEntity(com.cinema.category.entity.MenuCategory entity) {
        if (entity == null) {
            return null;
        }
        return MenuCategoryDTO.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .displayName(entity.getDisplayName())
                .sortOrder(entity.getSortOrder())
                .isVisible(entity.getIsVisible())
                .isDefault(entity.getIsDefault())
                .iconUrl(entity.getIconUrl())
                .description(entity.getDescription())
                .productCount(entity.getProductCount())
                .version(entity.getVersion())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    /**
     * 从实体转换为 DTO（附带商品数量）
     */
    public static MenuCategoryDTO fromEntity(com.cinema.category.entity.MenuCategory entity, Integer productCount) {
        MenuCategoryDTO dto = fromEntity(entity);
        if (dto != null) {
            dto.setProductCount(productCount);
        }
        return dto;
    }
}
