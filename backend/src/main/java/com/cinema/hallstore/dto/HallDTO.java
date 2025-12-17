package com.cinema.hallstore.dto;

import com.cinema.hallstore.domain.enums.HallStatus;
import com.cinema.hallstore.domain.enums.HallType;

import java.time.Instant;
import java.util.List;

/**
 * HallDTO:
 * - 对外 API 返回的影厅结构
 * - 与前端 Hall 类型字段保持一致（见 frontend/src/pages/schedule/types/schedule.types.ts）
 */
public class HallDTO {

    private String id;
    private String storeId;
    private String code;
    private String name;
    private HallType type;
    private int capacity;
    private List<String> tags;
    private HallStatus status;
    private Instant createdAt;
    private Instant updatedAt;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getStoreId() {
        return storeId;
    }

    public void setStoreId(String storeId) {
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
}


