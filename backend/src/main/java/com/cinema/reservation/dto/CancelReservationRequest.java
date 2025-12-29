package com.cinema.reservation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 取消预约请求 DTO (B端)
 * <p>
 * 用于 B 端运营人员取消预约单时提交的请求数据。
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-23
 */
public class CancelReservationRequest {

    /**
     * 取消原因类型
     * <p>
     * 可选值: RESOURCE_CONFLICT(资源冲突), CUSTOMER_REQUEST(客户要求取消), 
     * TIME_ADJUSTMENT(时段调整), OTHER(其他)
     * </p>
     */
    private String cancelReasonType;

    /**
     * 取消原因详情 (必填)
     */
    @NotBlank(message = "取消原因不能为空")
    @Size(max = 200, message = "取消原因不能超过200个字符")
    private String cancelReason;

    // Getters and Setters

    public String getCancelReasonType() {
        return cancelReasonType;
    }

    public void setCancelReasonType(String cancelReasonType) {
        this.cancelReasonType = cancelReasonType;
    }

    public String getCancelReason() {
        return cancelReason;
    }

    public void setCancelReason(String cancelReason) {
        this.cancelReason = cancelReason;
    }
}
