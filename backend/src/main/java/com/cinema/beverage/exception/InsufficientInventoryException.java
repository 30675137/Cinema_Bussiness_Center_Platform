/**
 * @spec O003-beverage-order
 * 库存不足异常 (T088)
 */
package com.cinema.beverage.exception;

/**
 * 库存不足异常
 *
 * 当BOM扣料时发现库存不足，抛出此异常以触发事务回滚
 */
public class InsufficientInventoryException extends RuntimeException {

    public InsufficientInventoryException(String message) {
        super(message);
    }

    public InsufficientInventoryException(String message, Throwable cause) {
        super(message, cause);
    }
}
