/**
 * @spec O001-product-order-list
 * 订单状态枚举
 */
package com.cinema.order.domain;

/**
 * 订单状态枚举
 *
 * 状态流转规则:
 * PENDING_PAYMENT → PAID → SHIPPED → COMPLETED
 * PENDING_PAYMENT → CANCELLED
 * PAID → CANCELLED
 */
public enum OrderStatus {
    /**
     * 待支付 - 订单已创建但未支付
     */
    PENDING_PAYMENT("待支付"),

    /**
     * 已支付 - 订单已完成支付
     */
    PAID("已支付"),

    /**
     * 已发货 - 订单已发货
     */
    SHIPPED("已发货"),

    /**
     * 已完成 - 订单已完成
     */
    COMPLETED("已完成"),

    /**
     * 已取消 - 订单已取消
     */
    CANCELLED("已取消");

    private final String displayName;

    OrderStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    /**
     * 检查是否允许从当前状态转换到目标状态
     *
     * @param targetStatus 目标状态
     * @return 是否允许转换
     */
    public boolean canTransitionTo(OrderStatus targetStatus) {
        return switch (this) {
            case PENDING_PAYMENT -> targetStatus == CANCELLED;
            case PAID -> targetStatus == SHIPPED || targetStatus == CANCELLED;
            case SHIPPED -> targetStatus == COMPLETED;
            case COMPLETED, CANCELLED -> false;
        };
    }
}
