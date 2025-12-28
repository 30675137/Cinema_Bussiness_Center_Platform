package com.cinema.hallstore.auth.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * 微信小程序登录请求 DTO
 * <p>
 * 客户端调用 POST /api/auth/wechat-login 时传递的请求体
 */
public class LoginRequest {

    /**
     * 微信小程序登录凭证 code
     * <p>
     * 通过小程序端调用 wx.login() 获取
     * 有效期 5 分钟，使用一次后失效
     */
    @NotBlank(message = "登录凭证 code 不能为空")
    private String code;

    // Constructors

    public LoginRequest() {
    }

    public LoginRequest(String code) {
        this.code = code;
    }

    // Getters and Setters

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    @Override
    public String toString() {
        return "LoginRequest{" +
                "code='" + (code != null ? code.substring(0, Math.min(4, code.length())) + "****" : "null") + '\'' +
                '}';
    }
}
