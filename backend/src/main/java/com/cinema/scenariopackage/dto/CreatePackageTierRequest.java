package com.cinema.scenariopackage.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;

/**
 * 创建/更新套餐档位请求 DTO
 */
public class CreatePackageTierRequest {

    /**
     * 套餐名称
     */
    @NotBlank(message = "套餐名称不能为空")
    @Size(max = 100, message = "套餐名称最长100字符")
    private String name;

    /**
     * 售价（元）
     */
    @NotNull(message = "售价不能为空")
    @Positive(message = "售价必须大于0")
    private BigDecimal price;

    /**
     * 原价（元）
     */
    private BigDecimal originalPrice;

    /**
     * 标签列表
     */
    private List<String> tags;

    /**
     * 服务内容描述
     */
    @Size(max = 1000, message = "服务描述最长1000字符")
    private String serviceDescription;

    /**
     * 排序顺序
     */
    private Integer sortOrder;

    // Getters and Setters

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getOriginalPrice() {
        return originalPrice;
    }

    public void setOriginalPrice(BigDecimal originalPrice) {
        this.originalPrice = originalPrice;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public String getServiceDescription() {
        return serviceDescription;
    }

    public void setServiceDescription(String serviceDescription) {
        this.serviceDescription = serviceDescription;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
}
