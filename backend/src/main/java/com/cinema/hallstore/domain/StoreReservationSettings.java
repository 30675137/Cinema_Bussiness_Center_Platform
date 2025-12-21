package com.cinema.hallstore.domain;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * StoreReservationSettings 领域模型
 * 
 * <p>表示门店维度的预约配置，与 Store 实体建立一对一关系。</p>
 * <p>对应 Supabase 中的 store_reservation_settings 表。</p>
 */
public class StoreReservationSettings {

    private UUID id;
    private UUID storeId;
    private Boolean isReservationEnabled = false;
    private Integer maxReservationDays = 0;
    private Instant createdAt;
    private Instant updatedAt;
    private String updatedBy;

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

    public Boolean getIsReservationEnabled() {
        return isReservationEnabled;
    }

    public void setIsReservationEnabled(Boolean isReservationEnabled) {
        this.isReservationEnabled = isReservationEnabled;
    }

    public Integer getMaxReservationDays() {
        return maxReservationDays;
    }

    public void setMaxReservationDays(Integer maxReservationDays) {
        this.maxReservationDays = maxReservationDays;
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

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof StoreReservationSettings)) return false;
        StoreReservationSettings that = (StoreReservationSettings) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

