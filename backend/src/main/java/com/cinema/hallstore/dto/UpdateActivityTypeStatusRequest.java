package com.cinema.hallstore.dto;

import com.cinema.hallstore.domain.enums.ActivityTypeStatus;
import jakarta.validation.constraints.NotNull;

/**
 * UpdateActivityTypeStatusRequest - 更新活动类型状态请求DTO
 */
public class UpdateActivityTypeStatusRequest {

    @NotNull(message = "状态不能为空")
    private ActivityTypeStatus status;

    public ActivityTypeStatus getStatus() {
        return status;
    }

    public void setStatus(ActivityTypeStatus status) {
        this.status = status;
    }
}




