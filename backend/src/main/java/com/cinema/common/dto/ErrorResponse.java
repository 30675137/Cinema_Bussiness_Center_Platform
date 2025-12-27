package com.cinema.common.dto;

import java.time.Instant;

/**
 * 错误响应类
 * <p>
 * 用于包装所有错误的 API 响应，提供一致的错误格式
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-19
 */
public class ErrorResponse {

    /**
     * 是否成功（始终为 false）
     */
    private boolean success = false;

    /**
     * 错误代码（如 "NOT_FOUND", "VALIDATION_ERROR", "CONCURRENT_MODIFICATION"）
     */
    private String error;

    /**
     * 错误消息（人类可读）
     */
    private String message;

    /**
     * 错误详情（可选，用于调试）
     */
    private Object details;

    /**
     * 响应时间戳（ISO 8601 格式）
     */
    private String timestamp;

    /**
     * 默认构造函数
     */
    public ErrorResponse() {
        this.timestamp = Instant.now().toString();
    }

    /**
     * 带错误信息的构造函数
     *
     * @param error   错误代码
     * @param message 错误消息
     */
    public ErrorResponse(String error, String message) {
        this.error = error;
        this.message = message;
        this.timestamp = Instant.now().toString();
    }

    /**
     * 完整构造函数
     *
     * @param error   错误代码
     * @param message 错误消息
     * @param details 错误详情
     */
    public ErrorResponse(String error, String message, Object details) {
        this.error = error;
        this.message = message;
        this.details = details;
        this.timestamp = Instant.now().toString();
    }

    /**
     * 静态工厂方法：创建错误响应
     *
     * @param error   错误代码
     * @param message 错误消息
     * @return ErrorResponse 实例
     */
    public static ErrorResponse of(String error, String message) {
        return new ErrorResponse(error, message);
    }

    /**
     * 静态工厂方法：创建带详情的错误响应
     *
     * @param error   错误代码
     * @param message 错误消息
     * @param details 错误详情
     * @return ErrorResponse 实例
     */
    public static ErrorResponse of(String error, String message, Object details) {
        return new ErrorResponse(error, message, details);
    }

    // Getters and Setters

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Object getDetails() {
        return details;
    }

    public void setDetails(Object details) {
        this.details = details;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    @Override
    public String toString() {
        return "ErrorResponse{" +
                "success=" + success +
                ", error='" + error + '\'' +
                ", message='" + message + '\'' +
                ", details=" + details +
                ", timestamp='" + timestamp + '\'' +
                '}';
    }
}
