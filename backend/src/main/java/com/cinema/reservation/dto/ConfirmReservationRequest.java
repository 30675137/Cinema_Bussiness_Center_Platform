package com.cinema.reservation.dto;

import jakarta.validation.constraints.NotNull;

/**
 * 确认预约请求 DTO (B端)
 * <p>
 * 用于 B 端运营人员确认预约单时提交的请求数据。
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-23
 */
public class ConfirmReservationRequest {

    /**
     * 是否要求支付
     * <p>
     * true - 要求客户支付，状态变更为 CONFIRMED
     * false - 直接完成，无需支付，状态变更为 COMPLETED
     * </p>
     */
    @NotNull(message = "请选择是否要求支付")
    private Boolean requiresPayment;

    /**
     * 操作备注 (可选)
     */
    private String remark;

    // Getters and Setters

    public Boolean getRequiresPayment() {
        return requiresPayment;
    }

    public void setRequiresPayment(Boolean requiresPayment) {
        this.requiresPayment = requiresPayment;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }
}
