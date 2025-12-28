/**
 * @spec O001-product-order-list
 * 取消原因必填异常
 */
package com.cinema.order.exception;

/**
 * 取消原因必填异常
 *
 * 错误编号: ORD_VAL_001
 * HTTP 状态码: 400 (Bad Request)
 */
public class CancelReasonRequiredException extends RuntimeException {
    private final String orderId;

    public CancelReasonRequiredException(String orderId) {
        super(String.format("取消订单必须提供取消原因 (订单ID: %s)", orderId));
        this.orderId = orderId;
    }

    public String getOrderId() {
        return orderId;
    }
}
