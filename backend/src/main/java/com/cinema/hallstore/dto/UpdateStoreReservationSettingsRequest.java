package com.cinema.hallstore.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

/**
 * UpdateStoreReservationSettingsRequest - 更新门店预约设置请求
 *
 * <p>用于 PUT /api/stores/{storeId}/reservation-settings 端点</p>
 * 
 * @since 015-store-reservation-settings
 * @updated 016-store-reservation-settings 添加时间段、提前量、时长单位、押金字段
 */
public class UpdateStoreReservationSettingsRequest {

    @NotNull(message = "是否开放预约不能为空")
    private Boolean isReservationEnabled;

    @Min(value = 1, message = "可预约天数必须大于0")
    @Max(value = 365, message = "可预约天数不能超过365")
    private Integer maxReservationDays;

    // 016-store-reservation-settings 新增字段

    /** 可预约时间段列表 */
    private List<TimeSlotRequest> timeSlots;

    /** 最小提前小时数 */
    @Min(value = 1, message = "最小提前小时数必须大于0")
    private Integer minAdvanceHours;

    /** 预约时长单位 (1/2/4 小时) */
    private Integer durationUnit;

    /** 是否需要押金 */
    private Boolean depositRequired;

    /** 押金金额 */
    @Min(value = 0, message = "押金金额不能为负数")
    private BigDecimal depositAmount;

    /** 押金比例 (0-100) */
    @Min(value = 0, message = "押金比例不能小于0")
    @Max(value = 100, message = "押金比例不能超过100")
    private Integer depositPercentage;

    /** 配置是否生效 */
    private Boolean isActive;

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

    // 016-store-reservation-settings 新增字段 getter/setter

    public List<TimeSlotRequest> getTimeSlots() {
        return timeSlots;
    }

    public void setTimeSlots(List<TimeSlotRequest> timeSlots) {
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
     * 自定义验证：如果开启预约，可预约天数必须大于0
     */
    @AssertTrue(message = "开启预约时必须设置可预约天数（1-365天）")
    public boolean isValidMaxReservationDays() {
        if (isReservationEnabled == null) {
            return true; // 由 @NotNull 验证处理
        }
        if (!isReservationEnabled) {
            return true; // 未开启预约时，maxReservationDays 可以为 0
        }
        // 开启预约时，maxReservationDays 必须 > 0
        return maxReservationDays != null && maxReservationDays > 0;
    }

    /**
     * 自定义验证：时长单位必须是 1、2 或 4
     */
    @AssertTrue(message = "时长单位必须是 1、2 或 4 小时")
    public boolean isValidDurationUnit() {
        if (durationUnit == null) {
            return true; // 可选字段
        }
        return durationUnit == 1 || durationUnit == 2 || durationUnit == 4;
    }

    /**
     * 自定义验证：开启押金时必须设置押金金额或比例
     */
    @AssertTrue(message = "开启押金时必须设置押金金额或比例")
    public boolean isValidDepositSettings() {
        if (depositRequired == null || !depositRequired) {
            return true; // 未开启押金，无需验证
        }
        // 开启押金时，必须设置金额或比例
        return depositAmount != null || depositPercentage != null;
    }

    /**
     * 时间段请求 DTO
     */
    public static class TimeSlotRequest {
        @Min(value = 1, message = "星期必须在 1-7 范围内")
        @Max(value = 7, message = "星期必须在 1-7 范围内")
        private Integer dayOfWeek;

        @NotNull(message = "开始时间不能为空")
        private String startTime;  // HH:mm

        @NotNull(message = "结束时间不能为空")
        private String endTime;    // HH:mm

        public TimeSlotRequest() {}

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
