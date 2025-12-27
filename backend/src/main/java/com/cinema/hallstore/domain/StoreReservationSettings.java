package com.cinema.hallstore.domain;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

/**
 * StoreReservationSettings 领域模型
 * 
 * <p>表示门店维度的预约配置，与 Store 实体建立一对一关系。</p>
 * <p>对应 Supabase 中的 store_reservation_settings 表。</p>
 * 
 * @since 015-store-reservation-settings
 * @updated 016-store-reservation-settings 添加时间段、提前量、时长单位、押金字段
 */
public class StoreReservationSettings {

    private UUID id;
    private UUID storeId;
    private Boolean isReservationEnabled = false;
    private Integer maxReservationDays = 0;
    private Instant createdAt;
    private Instant updatedAt;
    private String updatedBy;

    // 016-store-reservation-settings 新增字段
    private List<TimeSlot> timeSlots;        // 可预约时间段
    private Integer minAdvanceHours = 1;     // 最小提前小时数
    private Integer durationUnit = 1;        // 预约时长单位(1/2/4小时)
    private Boolean depositRequired = false; // 是否需要押金
    private BigDecimal depositAmount;        // 押金金额
    private Integer depositPercentage;       // 押金比例
    private Boolean isActive = true;         // 配置是否生效

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

    // 016-store-reservation-settings 新增字段 getter/setter

    public List<TimeSlot> getTimeSlots() {
        return timeSlots;
    }

    public void setTimeSlots(List<TimeSlot> timeSlots) {
        this.timeSlots = timeSlots;
    }

    public Integer getMinAdvanceHours() {
        return minAdvanceHours;
    }

    public void setMinAdvanceHours(Integer minAdvanceHours) {
        this.minAdvanceHours = minAdvanceHours;
    }

    public Integer getDurationUnit() {
        return durationUnit;
    }

    public void setDurationUnit(Integer durationUnit) {
        this.durationUnit = durationUnit;
    }

    public Boolean getDepositRequired() {
        return depositRequired;
    }

    public void setDepositRequired(Boolean depositRequired) {
        this.depositRequired = depositRequired;
    }

    public BigDecimal getDepositAmount() {
        return depositAmount;
    }

    public void setDepositAmount(BigDecimal depositAmount) {
        this.depositAmount = depositAmount;
    }

    public Integer getDepositPercentage() {
        return depositPercentage;
    }

    public void setDepositPercentage(Integer depositPercentage) {
        this.depositPercentage = depositPercentage;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
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

    /**
     * 时间段内部类
     */
    public static class TimeSlot {
        private Integer dayOfWeek;  // 1-7 (周一到周日)
        private String startTime;   // HH:mm
        private String endTime;     // HH:mm

        public TimeSlot() {}

        public TimeSlot(Integer dayOfWeek, String startTime, String endTime) {
            this.dayOfWeek = dayOfWeek;
            this.startTime = startTime;
            this.endTime = endTime;
        }

        public Integer getDayOfWeek() {
            return dayOfWeek;
        }

        public void setDayOfWeek(Integer dayOfWeek) {
            this.dayOfWeek = dayOfWeek;
        }

        public String getStartTime() {
            return startTime;
        }

        public void setStartTime(String startTime) {
            this.startTime = startTime;
        }

        public String getEndTime() {
            return endTime;
        }

        public void setEndTime(String endTime) {
            this.endTime = endTime;
        }
    }
}
