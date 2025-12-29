package com.cinema.hallstore.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * StoreReservationSettingsDTO - 门店预约设置数据传输对象
 *
 * <p>对外 API 返回的预约设置结构，与前端 StoreReservationSettings 类型及 OpenAPI contracts 保持一致</p>
 *
 * @since 015-store-reservation-settings
 * @updated 016-store-reservation-settings 添加时间段、提前量、时长单位、押金字段
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

    // 016-store-reservation-settings 新增字段

    /** 可预约时间段列表 */
    private List<TimeSlotDTO> timeSlots;

    /** 最小提前小时数 */
    private Integer minAdvanceHours;

    /** 预约时长单位 (1/2/4 小时) */
    private Integer durationUnit;

    /** 是否需要押金 */
    private Boolean depositRequired;

    /** 押金金额 */
    private BigDecimal depositAmount;

    /** 押金比例 (0-100) */
    private Integer depositPercentage;

    /** 配置是否生效 */
    private Boolean isActive;

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

    // 016-store-reservation-settings 新增字段 getter/setter

    public List<TimeSlotDTO> getTimeSlots() {
        return timeSlots;
    }

    public void setTimeSlots(List<TimeSlotDTO> timeSlots) {
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

    /**
     * 时间段 DTO
     */
    public static class TimeSlotDTO {
        private Integer dayOfWeek;  // 1-7 (周一到周日)
        private String startTime;   // HH:mm
        private String endTime;     // HH:mm

        public TimeSlotDTO() {}

        public TimeSlotDTO(Integer dayOfWeek, String startTime, String endTime) {
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
