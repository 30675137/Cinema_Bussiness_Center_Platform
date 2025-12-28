package com.cinema.hallstore.exception;

/**
 * 认证相关异常
 * <p>
 * 用于处理登录、令牌验证、令牌刷新等认证流程中的异常
 * <p>
 * 常见场景：
 * - 微信 code 无效或过期
 * - Supabase Auth API 调用失败
 * - JWT 令牌验证失败
 * - 刷新令牌无效或过期
 */
public class AuthException extends RuntimeException {

    /**
     * 错误代码（用于客户端识别错误类型）
     */
    private final String errorCode;

    /**
     * 构造函数
     *
     * @param message 错误消息
     */
    public AuthException(String message) {
        super(message);
        this.errorCode = "AUTH_ERROR";
    }

    /**
     * 构造函数
     *
     * @param message   错误消息
     * @param errorCode 错误代码
     */
    public AuthException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    /**
     * 构造函数
     *
     * @param message   错误消息
     * @param errorCode 错误代码
     * @param cause     原始异常
     */
    public AuthException(String message, String errorCode, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }

    /**
     * 预定义错误代码常量
     */
    public static class ErrorCode {
        public static final String INVALID_CODE = "INVALID_WECHAT_CODE";
        public static final String CODE_EXPIRED = "WECHAT_CODE_EXPIRED";
        public static final String USER_NOT_FOUND = "USER_NOT_FOUND";
        public static final String TOKEN_INVALID = "TOKEN_INVALID";
        public static final String TOKEN_EXPIRED = "TOKEN_EXPIRED";
        public static final String REFRESH_TOKEN_INVALID = "REFRESH_TOKEN_INVALID";
        public static final String SUPABASE_API_ERROR = "SUPABASE_API_ERROR";
        public static final String WECHAT_API_ERROR = "WECHAT_API_ERROR";
    }
}
