/**
 * @spec O001-product-order-list
 * 订单乐观锁冲突异常
 */
package com.cinema.order.exception;

/**
 * 订单乐观锁冲突异常
 *
 * 错误编号: ORD_BIZ_002
 * HTTP 状态码: 409 (Conflict)
 */
public class OrderOptimisticLockException extends RuntimeException {
    private final String orderId;
    private final Integer expectedVersion;
    private final Integer currentVersion;

    public OrderOptimisticLockException(String orderId, Integer expectedVersion, Integer currentVersion) {
        super(String.format("订单已被其他操作修改，请刷新后重试 (订单ID: %s, 期望版本: %d, 当前版本: %d)",
            orderId, expectedVersion, currentVersion));
        this.orderId = orderId;
        this.expectedVersion = expectedVersion;
        this.currentVersion = currentVersion;
    }

    public String getOrderId() {
        return orderId;
    }

    public Integer getExpectedVersion() {
        return expectedVersion;
    }

    public Integer getCurrentVersion() {
        return currentVersion;
    }
}
