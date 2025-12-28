/**
 * @spec O003-beverage-order
 * 订单状态流转非法异常
 */
package com.cinema.beverage.exception;

import java.util.Map;

/**
 * 订单状态流转非法异常
 */
public class InvalidOrderStatusException extends BeverageException {

    public InvalidOrderStatusException(String fromStatus, String toStatus) {
        super(
            BeverageErrorCode.ORD_BIZ_001,
            String.format("订单状态流转非法: %s -> %s", fromStatus, toStatus),
            Map.of("fromStatus", fromStatus, "toStatus", toStatus)
        );
    }
}
