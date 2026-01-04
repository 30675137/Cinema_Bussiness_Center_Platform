package com.cinema.category.dto;

import jakarta.validation.constraints.*;
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
public class CategoryUpdateRequest {

    /**
     * 显示名称（中文）
     */
    @Size(min = 1, max = 50, message = "显示名称长度必须在 1-50 个字符之间")
    private String displayName;

    /**
     * 排序序号（数字越小越靠前）
     */
    @Min(value = 0, message = "排序序号不能小于 0")
    private Integer sortOrder;

    /**
     * 是否可见
     */
    private Boolean isVisible;

    /**
     * 图标 URL（可选）
     */
    @Size(max = 500, message = "图标 URL 最多 500 个字符")
    @Pattern(
        regexp = "^(https?://)?[\\w.-]+(:[0-9]+)?(/.*)?$",
        message = "图标 URL 格式不正确",
        groups = ValidationGroups.UrlFormat.class
    )
    private String iconUrl;

    /**
     * 分类描述（可选）
     */
    @Size(max = 1000, message = "分类描述最多 1000 个字符")
    private String description;

    /**
     * 乐观锁版本号（必需，用于并发控制）
     */
    @NotNull(message = "版本号不能为空，用于检测并发编辑冲突")
    private Long version;

    /**
     * 验证组
     */
    public interface ValidationGroups {
        interface UrlFormat {}
    }
}
