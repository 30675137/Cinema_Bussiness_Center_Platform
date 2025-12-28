/**
 * @spec O003-beverage-order
 * 订单不存在异常
 */
package com.cinema.beverage.exception;

import java.util.Map;

/**
 * 订单不存在异常
 */
public class OrderNotFoundException extends BeverageException {

    public OrderNotFoundException(String orderId) {
        super(
            BeverageErrorCode.ORD_NTF_001,
            "订单不存在: " + orderId,
            Map.of("orderId", orderId)
        );
    }

    public OrderNotFoundException(String orderNumber, boolean byOrderNumber) {
        super(
            BeverageErrorCode.ORD_NTF_001,
            "订单不存在: " + orderNumber,
            Map.of("orderNumber", orderNumber)
        );
    }
}
