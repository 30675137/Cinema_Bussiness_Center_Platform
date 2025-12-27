package com.cinema.hallstore.user.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * 用户资料 DTO
 * <p>
 * 用于更新用户头像、昵称、手机号等信息
 * 客户端调用 PUT /api/users/profile 时传递的请求体
 */
public class UserProfileDto {

    /**
     * 昵称
     * 最大长度 100 字符
     */
    @Size(max = 100, message = "昵称不能超过100字符")
    private String nickname;

    /**
     * 头像 URL
     * 必须是有效的 HTTP/HTTPS URL
     */
    @Pattern(regexp = "^https?://.*", message = "头像URL格式不正确")
    private String avatarUrl;

    /**
     * 手机号
     * 11 位数字，1 开头
     */
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;

    // Constructors

    public UserProfileDto() {
    }

    public UserProfileDto(String nickname, String avatarUrl, String phone) {
        this.nickname = nickname;
        this.avatarUrl = avatarUrl;
        this.phone = phone;
    }

    // Getters and Setters

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    @Override
    public String toString() {
        return "UserProfileDto{" +
                "nickname='" + nickname + '\'' +
                ", avatarUrl='" + avatarUrl + '\'' +
                ", phone='" + (phone != null ? phone.substring(0, 3) + "****" + phone.substring(7) : "null") + '\'' +
                '}';
    }
}
