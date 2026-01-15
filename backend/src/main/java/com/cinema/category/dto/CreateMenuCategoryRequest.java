package com.cinema.category.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @spec O002-miniapp-menu-config
 * 创建菜单分类请求 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateMenuCategoryRequest {

    /**
     * 分类编码（唯一，大写字母开头）
     */
    @NotBlank(message = "分类编码不能为空")
    @Size(min = 1, max = 50, message = "分类编码长度必须在1-50字符之间")
    @Pattern(regexp = "^[A-Z][A-Z0-9_]*$", message = "分类编码必须以大写字母开头，只能包含大写字母、数字和下划线")
    private String code;

    /**
     * 显示名称
     */
    @NotBlank(message = "显示名称不能为空")
    @Size(min = 1, max = 50, message = "显示名称长度必须在1-50字符之间")
    private String displayName;

    /**
     * 排序序号（默认为最后）
     */
    private Integer sortOrder;

    /**
     * 是否可见（默认 true）
     */
    @Builder.Default
    private Boolean isVisible = true;

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
     * 转换为实体
     */
    public com.cinema.category.entity.MenuCategory toEntity() {
        return com.cinema.category.entity.MenuCategory.builder()
                .code(this.code)
                .displayName(this.displayName)
                .sortOrder(this.sortOrder != null ? this.sortOrder : 0)
                .isVisible(this.isVisible != null ? this.isVisible : true)
                .isDefault(false)
                .iconUrl(this.iconUrl)
                .description(this.description)
                .build();
    }
}
