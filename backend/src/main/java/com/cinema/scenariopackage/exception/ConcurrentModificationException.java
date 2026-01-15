package com.cinema.scenariopackage.exception;

/**
 * 并发修改异常
 * <p>
 * 当乐观锁检测到并发修改冲突时抛出此异常
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-19
 */
public class ConcurrentModificationException extends RuntimeException {

    /**
     * 默认构造函数
     */
    public ConcurrentModificationException() {
        super("该场景包已被他人修改，请刷新后重试");
    }

    /**
     * 带自定义消息的构造函数
     *
     * @param message 自定义消息
     */
    public ConcurrentModificationException(String message) {
        super(message);
    }

    /**
     * 带原因的构造函数
     *
     * @param message 自定义消息
     * @param cause   原始异常
     */
    public ConcurrentModificationException(String message, Throwable cause) {
        super(message, cause);
    }
}
