package com.cinema.reservation.exception;

/**
 * 库存不足异常
 * <p>
 * 当预约时指定时段的库存不足时抛出此异常。
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-23
 */
public class InsufficientInventoryException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    /**
     * 默认构造器
     */
    public InsufficientInventoryException() {
        super("库存不足");
    }

    /**
     * 带消息的构造器
     *
     * @param message 异常消息
     */
    public InsufficientInventoryException(String message) {
        super(message);
    }

    /**
     * 带消息和原因的构造器
     *
     * @param message 异常消息
     * @param cause   原因
     */
    public InsufficientInventoryException(String message, Throwable cause) {
        super(message, cause);
    }
}
