/**
 * @spec O003-beverage-order
 * 刷新令牌请求 DTO (T026)
 */
package com.cinema.auth.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * 刷新令牌请求参数
 */
public class RefreshTokenRequest {

    /**
     * 刷新令牌
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
}
