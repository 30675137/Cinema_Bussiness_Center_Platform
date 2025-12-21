package com.cinema.hallstore.dto;

import java.time.Instant;

/**
 * StoreReservationSettingsDTO - 门店预约设置数据传输对象
 *
 * <p>对外 API 返回的预约设置结构，与前端 StoreReservationSettings 类型及 OpenAPI contracts 保持一致</p>
 *
 * <p>API 返回示例：</p>
 * <pre>
 * {
 *   "id": "uuid-string",                    // 预约设置ID (UUID字符串)
 *   "storeId": "uuid-string",               // 门店ID (UUID字符串)
 *   "isReservationEnabled": true,           // 是否开放预约
 *   "maxReservationDays": 7,                // 可预约天数
 *   "createdAt": "2025-12-17T...",          // 创建时间 (ISO 8601格式)
 *   "updatedAt": "2025-12-17T...",          // 更新时间 (ISO 8601格式)
 *   "updatedBy": "user@example.com"         // 最后更新人（可选）
 * }
 * </pre>
 */
public class StoreReservationSettingsDTO {

    /** 预约设置ID - UUID字符串 */
    private String id;

    /** 门店ID - UUID字符串 */
    private String storeId;

    /** 是否开放预约 */
    private Boolean isReservationEnabled;

    /** 可预约天数（未来N天） */
    private Integer maxReservationDays;

    /** 创建时间 - 序列化为 ISO 8601 格式 */
    private Instant createdAt;

    /** 更新时间 - 序列化为 ISO 8601 格式 */
    private Instant updatedAt;

    /** 最后更新人（可选） */
    private String updatedBy;

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
}

