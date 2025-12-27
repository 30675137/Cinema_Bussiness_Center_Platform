/**
 * @spec O001-product-order-list
 * 订单日志领域模型
 */
package com.cinema.order.domain;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 订单日志领域模型
 *
 * 对应数据库表: order_logs
 */
public class OrderLog {
    private UUID id;
    private UUID orderId;
    private LogAction action;
    private OrderStatus statusBefore;
    private OrderStatus statusAfter;
    private UUID operatorId;
    private String operatorName;
    private String comments;
    private LocalDateTime createdAt;

    // Constructors
    public OrderLog() {
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getOrderId() {
        return orderId;
    }

    public void setOrderId(UUID orderId) {
        this.orderId = orderId;
    }

    public LogAction getAction() {
        return action;
    }

    public void setAction(LogAction action) {
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

    public UUID getOperatorId() {
        return operatorId;
    }

    public void setOperatorId(UUID operatorId) {
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

    /**
     * 订单日志操作类型枚举
     */
    public enum LogAction {
        CREATE_ORDER("创建订单"),
        PAYMENT("支付"),
        SHIP("发货"),
        COMPLETE("完成"),
        CANCEL("取消"),
        SYSTEM_AUTO("系统自动");

        private final String displayName;

        LogAction(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}
