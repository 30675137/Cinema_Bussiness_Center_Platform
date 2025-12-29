/**
 * @spec O003-beverage-order
 * 认证响应 DTO (T026)
 */
package com.cinema.auth.dto;

import java.util.UUID;

/**
 * 认证响应数据
 */
public class AuthResponse {

    /**
     * 用户ID
     */
    private UUID userId;

    /**
     * 访问令牌 (Access Token)
     */
    private String accessToken;

    /**
     * 刷新令牌 (Refresh Token)
     */
    private String refreshToken;

    /**
     * 令牌类型 (固定为 "Bearer")
     */
    private String tokenType = "Bearer";

    /**
     * Access Token 有效期 (秒)
     */
    private long expiresIn;

    // Constructors

    public AuthResponse() {
    }

    public AuthResponse(UUID userId, String accessToken, String refreshToken, long expiresIn) {
        this.userId = userId;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
    }

    // Getters and Setters

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public long getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
    }
}
