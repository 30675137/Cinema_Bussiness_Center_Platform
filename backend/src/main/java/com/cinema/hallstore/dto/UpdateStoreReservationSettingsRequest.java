package com.cinema.hallstore.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * UpdateStoreReservationSettingsRequest - 更新门店预约设置请求
 *
 * <p>用于 PUT /api/stores/{storeId}/reservation-settings 端点</p>
 */
public class UpdateStoreReservationSettingsRequest {

    @NotNull(message = "是否开放预约不能为空")
    private Boolean isReservationEnabled;

    @Min(value = 1, message = "可预约天数必须大于0")
    @Max(value = 365, message = "可预约天数不能超过365")
    private Integer maxReservationDays;

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
}

