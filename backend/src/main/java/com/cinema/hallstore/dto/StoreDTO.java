package com.cinema.hallstore.dto;

import com.cinema.hallstore.domain.enums.StoreStatus;

import java.time.Instant;

/**
 * StoreDTO:
 * - 对外 API 返回的门店结构
 * - 字段命名需与前端 Store 类型及 OpenAPI contracts/api.yaml 保持一致
 */
public class StoreDTO {

    private String id;
    private String code;
    private String name;
    private String region;
    private StoreStatus status;
    private Instant createdAt;
    private Instant updatedAt;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public StoreStatus getStatus() {
        return status;
    }

    public void setStatus(StoreStatus status) {
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


