/**
 * @spec O003-beverage-order
 * 登录请求 DTO (T026)
 */
package com.cinema.auth.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * 登录请求参数
 */
public class LoginRequest {

    /**
     * 用户名或手机号
     */
    @NotBlank(message = "用户名不能为空")
    private String username;

    /**
     * 密码
     */
    @NotBlank(message = "密码不能为空")
    private String password;

    // Constructors

    public LoginRequest() {
    }

    public LoginRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }

    // Getters and Setters

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
