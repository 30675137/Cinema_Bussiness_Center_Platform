package com.cinema.common.dto;

import java.time.Instant;

/**
 * 统一 API 响应包装类
 * <p>
 * 用于包装所有成功的 API 响应，提供一致的响应格式
 * </p>
 *
 * @param <T> 响应数据类型
 * @author Cinema Platform
 * @since 2025-12-19
 */
public class ApiResponse<T> {

    /**
     * 响应数据
     */
    private T data;

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
     * 带数据的构造函数
     *
     * @param data 响应数据
     */
    public ApiResponse(T data) {
        this.data = data;
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
        return new ApiResponse<>(data);
    }

    // Getters and Setters

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
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
