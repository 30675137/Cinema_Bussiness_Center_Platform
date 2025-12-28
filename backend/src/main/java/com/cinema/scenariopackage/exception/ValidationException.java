package com.cinema.scenariopackage.exception;

/**
 * 验证异常
 * <p>
 * 当业务验证失败时抛出此异常（如文件大小超限、价格验证失败等）
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-19
 */
public class ValidationException extends RuntimeException {

    /**
     * 验证错误详情（可选）
     */
    private Object details;

    /**
     * 带消息的构造函数
     *
     * @param message 错误消息
     */
    public ValidationException(String message) {
        super(message);
    }

    /**
     * 带消息和详情的构造函数
     *
     * @param message 错误消息
     * @param details 错误详情
     */
    public ValidationException(String message, Object details) {
        super(message);
        this.details = details;
    }

    /**
     * 带原因的构造函数
     *
     * @param message 错误消息
     * @param cause   原始异常
     */
    public ValidationException(String message, Throwable cause) {
        super(message, cause);
    }

    public Object getDetails() {
        return details;
    }

    public void setDetails(Object details) {
        this.details = details;
    }
}
