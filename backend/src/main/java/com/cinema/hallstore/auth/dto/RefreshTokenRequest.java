package com.cinema.hallstore.auth.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * 令牌刷新请求 DTO
 * <p>
 * 客户端调用 POST /api/auth/refresh-token 时传递的请求体
 */
public class RefreshTokenRequest {

    /**
     * 刷新令牌
     * <p>
     * 在用户登录成功后返回，用于在访问令牌过期时获取新的访问令牌
     * 有效期默认 30 天
     */
    @NotBlank(message = "刷新令牌不能为空")
    private String refreshToken;

    // Constructors

    public RefreshTokenRequest() {
    }

    public RefreshTokenRequest(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    // Getters and Setters

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    @Override
    public String toString() {
        return "RefreshTokenRequest{" +
                "refreshToken='" + (refreshToken != null ? "****" : "null") + '\'' +
                '}';
    }
}
