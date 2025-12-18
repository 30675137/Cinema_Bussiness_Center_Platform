package com.cinema.hallstore.dto;

import com.cinema.hallstore.domain.enums.ActivityTypeStatus;
import java.time.Instant;

/**
 * ActivityTypeDTO - 活动类型数据传输对象
 *
 * <p>对外 API 返回的活动类型结构，与前端 ActivityType 类型及 OpenAPI contracts 保持一致</p>
 */
public class ActivityTypeDTO {

    /** 活动类型ID - UUID字符串 */
    private String id;

    /** 活动类型名称 */
    private String name;

    /** 活动类型描述（可选） */
    private String description;

    /** 业务分类，例如：私人订制、商务团建、派对策划（可选） */
    private String businessCategory;

    /** 场景背景图 URL，用于后台与小程序端场景卡片展示（可选） */
    private String backgroundImageUrl;

    /** 状态 */
    private ActivityTypeStatus status;

    /** 排序号 */
    private Integer sort;

    /** 创建时间 - 序列化为 ISO 8601 格式 */
    private Instant createdAt;

    /** 更新时间 - 序列化为 ISO 8601 格式 */
    private Instant updatedAt;

    /** 删除时间（可选） */
    private Instant deletedAt;

    /** 创建人（可选） */
    private String createdBy;

    /** 更新人（可选） */
    private String updatedBy;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

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

    public ActivityTypeStatus getStatus() {
        return status;
    }

    public void setStatus(ActivityTypeStatus status) {
        this.status = status;
    }

    public Integer getSort() {
        return sort;
    }

    public void setSort(Integer sort) {
        this.sort = sort;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Instant getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(Instant deletedAt) {
        this.deletedAt = deletedAt;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }
}

