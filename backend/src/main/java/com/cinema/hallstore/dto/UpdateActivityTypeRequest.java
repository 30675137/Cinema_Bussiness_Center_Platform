package com.cinema.hallstore.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * UpdateActivityTypeRequest - 更新活动类型请求DTO
 */
public class UpdateActivityTypeRequest {

    @NotBlank(message = "活动类型名称不能为空")
    @Size(max = 100, message = "活动类型名称长度不能超过100个字符")
    private String name;

    @Size(max = 500, message = "描述长度不能超过500个字符")
    private String description;

    @Size(max = 100, message = "业务分类长度不能超过100个字符")
    private String businessCategory;

    @Size(max = 1000, message = "背景图 URL 长度不能超过1000个字符")
    private String backgroundImageUrl;

    @NotNull(message = "排序号不能为空")
    private Integer sort;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getBusinessCategory() {
        return businessCategory;
    }

    public void setBusinessCategory(String businessCategory) {
        this.businessCategory = businessCategory;
    }

    public String getBackgroundImageUrl() {
        return backgroundImageUrl;
    }

    public void setBackgroundImageUrl(String backgroundImageUrl) {
        this.backgroundImageUrl = backgroundImageUrl;
    }

    public Integer getSort() {
        return sort;
    }

    public void setSort(Integer sort) {
        this.sort = sort;
    }
}

