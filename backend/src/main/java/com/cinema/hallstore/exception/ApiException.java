package com.cinema.hallstore.exception;

/**
 * 通用 API 异常
 * <p>
 * 用于处理所有业务逻辑层的异常
 * <p>
 * 常见场景：
 * - 参数验证失败
 * - 资源不存在
 * - 业务规则违反
 * - 外部服务调用失败
 */
public class ApiException extends RuntimeException {

    /**
     * 错误代码（用于客户端识别错误类型）
     */
    private final String errorCode;

    /**
     * HTTP 状态码（用于响应）
     */
    private final int httpStatus;

    /**
     * 构造函数
     *
     * @param message 错误消息
     */
    public ApiException(String message) {
        super(message);
        this.errorCode = "API_ERROR";
        this.httpStatus = 500;
    }

    /**
     * 构造函数
     *
     * @param message    错误消息
     * @param errorCode  错误代码
     * @param httpStatus HTTP 状态码
     */
    public ApiException(String message, String errorCode, int httpStatus) {
        super(message);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }

    /**
     * 构造函数
     *
     * @param message    错误消息
     * @param errorCode  错误代码
     * @param httpStatus HTTP 状态码
     * @param cause      原始异常
     */
    public ApiException(String message, String errorCode, int httpStatus, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public int getHttpStatus() {
        return httpStatus;
    }

    /**
     * 预定义错误代码常量
     */
    public static class ErrorCode {
        public static final String INVALID_PARAMETER = "INVALID_PARAMETER";
        public static final String RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND";
        public static final String DUPLICATE_RESOURCE = "DUPLICATE_RESOURCE";
        public static final String BUSINESS_RULE_VIOLATION = "BUSINESS_RULE_VIOLATION";
        public static final String EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR";
        public static final String INTERNAL_ERROR = "INTERNAL_ERROR";
    }
}
