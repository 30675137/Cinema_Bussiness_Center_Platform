package com.cinema.hallstore.domain;

import com.cinema.hallstore.domain.enums.HallStatus;
import com.cinema.hallstore.domain.enums.HallType;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

/**
 * Hall 领域模型：
 * - 对应 Supabase 中的 halls 表
 * - 仅关注影厅主数据，不包含排期事件信息
 *
 * 关键设计点：
 * - 使用 UUID 作为主键，避免暴露自增 ID
 * - 通过 storeId 建立与 Store 的 1:N 关系
 * - tags 表达影厅特性（如“真皮沙发”“KTV设备”）
 */
public class Hall {

    /** 影厅主键，对应表字段 id */
    private UUID id;

    /** 所属门店主键，对应表字段 store_id */
    private UUID storeId;

    /** 影厅编码，在门店内建议唯一，对应表字段 code */
    private String code;

    /** 影厅名称，对应表字段 name */
    private String name;

    /** 影厅类型（VIP/CP/Party/Public 等），对应表字段 type */
    private HallType type;

    /** 可容纳人数，必须为正整数，对应表字段 capacity */
    private int capacity;

    /** 影厅标签列表，例如设备/装修特点，对应表字段 tags */
    private List<String> tags;

    /** 影厅状态（active/inactive/maintenance），对应表字段 status */
    private HallStatus status;

    /** 创建时间戳，对应表字段 created_at */
    private Instant createdAt;

    /** 更新时间戳，对应表字段 updated_at */
    private Instant updatedAt;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getStoreId() {
        return storeId;
    }

    public void setStoreId(UUID storeId) {
        this.storeId = storeId;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public HallType getType() {
        return type;
    }

    public void setType(HallType type) {
        this.type = type;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public HallStatus getStatus() {
        return status;
    }

    public void setStatus(HallStatus status) {
        this.status = status;
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Hall)) return false;
        Hall hall = (Hall) o;
        return Objects.equals(id, hall.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}


