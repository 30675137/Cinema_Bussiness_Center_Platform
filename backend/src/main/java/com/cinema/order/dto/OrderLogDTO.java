/**
 * @spec O001-product-order-list
 * 订单日志数据传输对象
 */
package com.cinema.order.dto;

import com.cinema.order.domain.OrderLog;
import com.cinema.order.domain.OrderStatus;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;

/**
 * 订单日志 DTO
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OrderLogDTO {
    private String id;
    private String orderId;
    private OrderLog.LogAction action;
    private OrderStatus statusBefore;
    private OrderStatus statusAfter;
    private String operatorId;
    private String operatorName;
    private String comments;
    private LocalDateTime createdAt;

    public OrderLogDTO() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public OrderLog.LogAction getAction() {
        return action;
    }

    public void setAction(OrderLog.LogAction action) {
        this.action = action;
    }

    public OrderStatus getStatusBefore() {
        return statusBefore;
    }

    public void setStatusBefore(OrderStatus statusBefore) {
        this.statusBefore = statusBefore;
    }

    public OrderStatus getStatusAfter() {
        return statusAfter;
    }

    public void setStatusAfter(OrderStatus statusAfter) {
        this.statusAfter = statusAfter;
    }

    public String getOperatorId() {
        return operatorId;
    }

    public void setOperatorId(String operatorId) {
        this.operatorId = operatorId;
    }

    public String getOperatorName() {
        return operatorName;
    }

    public void setOperatorName(String operatorName) {
        this.operatorName = operatorName;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
