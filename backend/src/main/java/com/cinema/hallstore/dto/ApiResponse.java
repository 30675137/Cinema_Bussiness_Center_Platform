package com.cinema.hallstore.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;

/**
 * 统一 API 响应结构：
 * - 与 OpenAPI 中的 ErrorResponse / data 包装结构保持一致
 * - 业务成功时仅关注 data 字段，失败时使用 error + message + details
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private final T data;
    private final String error;
    private final String message;
    private final Object details;
    private final Instant timestamp = Instant.now();

    private ApiResponse(T data, String error, String message, Object details) {
        this.data = data;
        this.error = error;
        this.message = message;
        this.details = details;
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(data, null, null, null);
    }

    public static <T> ApiResponse<T> failure(String error, String message, Object details) {
        return new ApiResponse<>(null, error, message, details);
    }

    public T getData() {
        return data;
    }

    public String getError() {
        return error;
    }

    public String getMessage() {
        return message;
    }

    public Object getDetails() {
        return details;
    }

    public Instant getTimestamp() {
        return timestamp;
    }
}



