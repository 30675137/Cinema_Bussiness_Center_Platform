package com.cinema.category.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @spec O002-miniapp-menu-config
 * 更新菜单分类请求 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateMenuCategoryRequest {

    /**
     * 显示名称
     */
    @Size(min = 1, max = 50, message = "显示名称长度必须在1-50字符之间")
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
     * 图标 URL
     */
    @Size(max = 500, message = "图标URL长度不能超过500字符")
    private String iconUrl;

    /**
     * 分类描述
     */
    @Size(max = 500, message = "描述长度不能超过500字符")
    private String description;

    /**
     * 应用更新到实体
     */
    public void applyTo(com.cinema.category.entity.MenuCategory entity) {
        if (this.displayName != null) {
            entity.setDisplayName(this.displayName);
        }
        if (this.sortOrder != null) {
            entity.setSortOrder(this.sortOrder);
        }
        if (this.isVisible != null) {
            entity.setIsVisible(this.isVisible);
        }
        if (this.iconUrl != null) {
            entity.setIconUrl(this.iconUrl);
        }
        if (this.description != null) {
            entity.setDescription(this.description);
        }
    }

    /**
     * 检查是否有任何字段需要更新
     */
    public boolean hasUpdates() {
        return displayName != null || sortOrder != null || isVisible != null ||
               iconUrl != null || description != null;
    }
}
