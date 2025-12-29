/**
 * @spec O001-product-order-list
 * 订单未找到异常
 */
package com.cinema.order.exception;

/**
 * 订单未找到异常
 *
 * 错误编号: ORD_NTF_001
 * HTTP 状态码: 404
 */
public class OrderNotFoundException extends RuntimeException {
    private final String orderId;

    public OrderNotFoundException(String orderId) {
        super(String.format("订单不存在: %s", orderId));
        this.orderId = orderId;
    }

    public String getOrderId() {
        return orderId;
    }
}
