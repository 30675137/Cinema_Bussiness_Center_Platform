package com.cinema.hallstore.domain;

import com.cinema.hallstore.domain.enums.ActivityTypeStatus;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * ActivityType 领域模型
 * 
 * <p>表示一种预约活动类型，如"企业团建"、"订婚"、"生日Party"等。</p>
 * <p>对应 Supabase 中的 activity_types 表。</p>
 */
public class ActivityType {

    private UUID id;
    private String name;
    private String description;
    /** 业务分类，例如：私人订制、商务团建、派对策划 */
    private String businessCategory;
    /** 场景背景图 URL，用于后台与小程序端场景卡片展示 */
    private String backgroundImageUrl;
    private ActivityTypeStatus status = ActivityTypeStatus.ENABLED;
    private Integer sort = 0;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant deletedAt;
    private String createdBy;
    private String updatedBy;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ActivityType)) return false;
        ActivityType that = (ActivityType) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

