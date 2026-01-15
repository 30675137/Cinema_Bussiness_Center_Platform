package com.cinema.hallstore.auth.dto;

import java.util.Map;

/**
 * 微信小程序登录响应 DTO
 * <p>
 * 后端返回给客户端的登录结果，包含：
 * - accessToken: 访问令牌（Supabase Auth 签发的 JWT）
 * - refreshToken: 刷新令牌（用于获取新的访问令牌）
 * - expiresIn: 访问令牌有效期（秒）
 * - user: 用户基本信息
 */
public class LoginResponse {

    /**
     * 访问令牌（JWT）
     * 客户端在后续请求中携带此令牌用于身份验证
     */
    private String accessToken;

    /**
     * 刷新令牌
     * 用于在访问令牌过期时获取新的访问令牌
     */
    private String refreshToken;

    /**
     * 访问令牌有效期（秒）
     * 默认 7 天（604800 秒）
     */
    private Integer expiresIn;

    /**
     * 用户基本信息
     * 包含：id, openid, nickname, avatarUrl, phone 等
     */
    private UserInfo user;

    // Constructors

    public LoginResponse() {
    }

    public LoginResponse(String accessToken, String refreshToken, Integer expiresIn, UserInfo user) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
        this.user = user;
    }

    // Getters and Setters

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

    public Integer getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(Integer expiresIn) {
        this.expiresIn = expiresIn;
    }

    public UserInfo getUser() {
        return user;
    }

    public void setUser(UserInfo user) {
        this.user = user;
    }

    /**
     * 用户基本信息内嵌类
     */
    public static class UserInfo {
        private String id;
        private String openid;
        private String nickname;
        private String avatarUrl;
        private String phone;

        public UserInfo() {
        }

        public UserInfo(String id, String openid, String nickname, String avatarUrl, String phone) {
            this.id = id;
            this.openid = openid;
            this.nickname = nickname;
            this.avatarUrl = avatarUrl;
            this.phone = phone;
        }

        /**
         * 从 Supabase Auth 用户数据构建 UserInfo
         *
         * @param user Supabase Auth 用户数据（包含 id 和 user_metadata）
         * @return UserInfo 实例
         */
        public static UserInfo fromSupabaseUser(Map<String, Object> user) {
            String id = (String) user.get("id");
            // Auth Admin API 返回 user_metadata，REST API 返回 raw_user_meta_data
            Map<String, Object> metadata = (Map<String, Object>) user.get("user_metadata");
            if (metadata == null) {
                metadata = (Map<String, Object>) user.get("raw_user_meta_data");
            }

            String openid = metadata != null ? (String) metadata.get("openid") : null;
            String nickname = metadata != null ? (String) metadata.get("nickname") : null;
            String avatarUrl = metadata != null ? (String) metadata.get("avatar_url") : null;
            String phone = metadata != null ? (String) metadata.get("phone") : null;

            return new UserInfo(id, openid, nickname, avatarUrl, phone);
        }

        // Getters and Setters

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getOpenid() {
            return openid;
        }

        public void setOpenid(String openid) {
            this.openid = openid;
        }

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
    }

    @Override
    public String toString() {
        return "LoginResponse{" +
                "accessToken='" + (accessToken != null ? accessToken.substring(0, Math.min(20, accessToken.length())) + "****" : "null") + '\'' +
                ", refreshToken='" + (refreshToken != null ? "****" : "null") + '\'' +
                ", expiresIn=" + expiresIn +
                ", user=" + user +
                '}';
    }
}
