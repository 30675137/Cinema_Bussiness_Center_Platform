package com.cinema.category.dto;

import jakarta.validation.constraints.*;
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
public class CategoryCreateRequest {

    /**
     * 分类编码（唯一标识，大写字母、数字、下划线）
     * 示例: "ALCOHOL", "COFFEE"
     */
    @NotBlank(message = "分类编码不能为空")
    @Pattern(regexp = "^[A-Z][A-Z0-9_]*$", message = "分类编码必须以大写字母开头，只能包含大写字母、数字和下划线")
    @Size(max = 50, message = "分类编码最多 50 个字符")
    private String code;

    /**
     * 显示名称（中文）
     */
    @NotBlank(message = "显示名称不能为空")
    @Size(min = 1, max = 50, message = "显示名称长度必须在 1-50 个字符之间")
    private String displayName;

    /**
     * 排序序号（数字越小越靠前）
     */
    @NotNull(message = "排序序号不能为空")
    @Min(value = 0, message = "排序序号不能小于 0")
    private Integer sortOrder;

    /**
     * 是否可见
     */
    @NotNull(message = "可见性标识不能为空")
    @Builder.Default
    private Boolean isVisible = true;

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
     * 验证组
     */
    public interface ValidationGroups {
        interface UrlFormat {}
    }
}
