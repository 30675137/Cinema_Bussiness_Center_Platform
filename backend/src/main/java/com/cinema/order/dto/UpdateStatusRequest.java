/**
 * @spec O001-product-order-list
 * 更新订单状态请求 DTO
 */
package com.cinema.order.dto;

import com.cinema.order.domain.OrderStatus;

import jakarta.validation.constraints.NotNull;

/**
 * 更新订单状态请求 DTO
 *
 * 用于 User Story 4 - 订单状态管理
 */
public class UpdateStatusRequest {
    @NotNull(message = "状态不能为空")
    private OrderStatus status;

    @NotNull(message = "版本号不能为空")
    private Integer version;

    private String cancelReason;

    public UpdateStatusRequest() {
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    public String getCancelReason() {
        return cancelReason;
    }

    public void setCancelReason(String cancelReason) {
        this.cancelReason = cancelReason;
    }
}
