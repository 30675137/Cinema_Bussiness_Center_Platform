package com.cinema.common.dto;

import java.time.Instant;

/**
 * @spec O003-beverage-order
 * 统一 API 响应包装类
 * <p>
 * 用于包装所有 API 响应，提供一致的响应格式
 * 符合 018-hall-reserve-homepage API 契约
 * </p>
 *
 * @param <T> 响应数据类型
 * @author Cinema Platform
 * @since 2025-12-19
 */
public class ApiResponse<T> {

    /**
     * 请求是否成功
     */
    private boolean success;

    /**
     * 响应数据
     */
    private T data;

    /**
     * 错误或提示信息（可选）
     */
    private String message;

    /**
     * 响应时间戳（ISO 8601 格式）
     */
    private String timestamp;

    /**
     * 默认构造函数
     */
    public ApiResponse() {
        this.timestamp = Instant.now().toString();
    }

    /**
     * 完整构造函数
     *
     * @param success 是否成功
     * @param data 响应数据
     * @param message 消息
     */
    public ApiResponse(boolean success, T data, String message) {
        this.success = success;
        this.data = data;
        this.message = message;
        this.timestamp = Instant.now().toString();
    }

    /**
     * 静态工厂方法：创建成功响应
     *
     * @param data 响应数据
     * @param <T>  数据类型
     * @return ApiResponse 实例
     */
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, "");
    }

    /**
     * 静态工厂方法：创建成功响应（带消息）
     *
     * @param data 响应数据
     * @param message 成功消息
     * @param <T>  数据类型
     * @return ApiResponse 实例
     */
    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(true, data, message);
    }

    /**
     * 静态工厂方法：创建失败响应
     *
     * @param message 错误消息
     * @param <T>  数据类型
     * @return ApiResponse 实例
     */
    public static <T> ApiResponse<T> failure(String message) {
        return new ApiResponse<>(false, null, message);
    }

    // Getters and Setters

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    @Override
    public String toString() {
        return "ApiResponse{" +
                "data=" + data +
                ", timestamp='" + timestamp + '\'' +
                '}';
    }
}
