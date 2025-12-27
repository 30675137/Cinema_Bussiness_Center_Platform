/**
 * @spec O001-product-order-list
 * 无效的订单状态转换异常
 */
package com.cinema.order.exception;

import com.cinema.order.domain.OrderStatus;

/**
 * 无效的订单状态转换异常
 *
 * 错误编号: ORD_BIZ_001
 * HTTP 状态码: 422 (Unprocessable Entity)
 */
public class InvalidOrderStatusTransitionException extends RuntimeException {
    private final String orderId;
    private final OrderStatus currentStatus;
    private final OrderStatus targetStatus;

    public InvalidOrderStatusTransitionException(String orderId, OrderStatus currentStatus, OrderStatus targetStatus) {
        super(String.format("非法的状态转换：%s → %s (订单ID: %s)", currentStatus, targetStatus, orderId));
        this.orderId = orderId;
        this.currentStatus = currentStatus;
        this.targetStatus = targetStatus;
    }

    public String getOrderId() {
        return orderId;
    }

    public OrderStatus getCurrentStatus() {
        return currentStatus;
    }

    public OrderStatus getTargetStatus() {
        return targetStatus;
    }
}
