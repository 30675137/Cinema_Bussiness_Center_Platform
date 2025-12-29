package com.cinema.hallstore.model;

import java.time.Instant;
import java.util.Map;

/**
 * 用户实体类
 * <p>
 * 映射 Supabase Auth 的 auth.users 表 + user_metadata 结构
 * <p>
 * 注意：此类不使用 JPA 注解，因为 auth.users 表由 Supabase Auth 管理，
 * 后端通过 Supabase Auth Admin API 进行操作，而非直接 SQL 查询
 * <p>
 * user_metadata 结构：
 * {
 *   "openid": "o6_bmjrPTlm6_2sxx...",
 *   "unionid": "oGgWj7kK...",  // 可选
 *   "nickname": "张三",
 *   "avatar_url": "https://wx.qlogo.cn/...",
 *   "phone": "13800138000",
 *   "provider": "wechat",
 *   "last_login_at": "2025-12-24T10:30:00Z"
 * }
 */
public class User {

    /**
     * 用户唯一标识（UUID）
     * 由 Supabase Auth 自动生成
     */
    private String id;

    /**
     * 邮箱（可选）
     * 微信登录场景下可能为空或使用虚拟邮箱
     */
    private String email;

    /**
     * 手机号（可选）
     * 从 user_metadata 中提取
     */
    private String phone;

    /**
     * 邮箱确认时间
     * 微信登录场景下自动设置为创建时间
     */
    private Instant emailConfirmedAt;

    /**
     * 手机号确认时间
     */
    private Instant phoneConfirmedAt;

    /**
     * 创建时间
     */
    private Instant createdAt;

    /**
     * 更新时间
     */
    private Instant updatedAt;

    /**
     * 最后登录时间
     */
    private Instant lastSignInAt;

    /**
     * 用户元数据（user_metadata）
     * 存储微信相关字段：openid, unionid, nickname, avatar_url, phone, provider
     */
    private Map<String, Object> rawUserMetaData;

    /**
     * 应用元数据（app_metadata）
     * 预留用于存储应用级别的元数据（如角色、权限）
     */
    private Map<String, Object> rawAppMetaData;

    // Constructors

    public User() {
    }

    /**
     * 从 Supabase Auth 用户数据构建 User 实体
     *
     * @param supabaseUser Supabase Auth API 返回的用户数据
     * @return User 实体实例
     */
    public static User fromSupabaseUser(Map<String, Object> supabaseUser) {
        User user = new User();
        user.setId((String) supabaseUser.get("id"));
        user.setEmail((String) supabaseUser.get("email"));
        user.setPhone((String) supabaseUser.get("phone"));

        // 解析时间字段
        if (supabaseUser.get("email_confirmed_at") != null) {
            user.setEmailConfirmedAt(Instant.parse((String) supabaseUser.get("email_confirmed_at")));
        }
        if (supabaseUser.get("phone_confirmed_at") != null) {
            user.setPhoneConfirmedAt(Instant.parse((String) supabaseUser.get("phone_confirmed_at")));
        }
        if (supabaseUser.get("created_at") != null) {
            user.setCreatedAt(Instant.parse((String) supabaseUser.get("created_at")));
        }
        if (supabaseUser.get("updated_at") != null) {
            user.setUpdatedAt(Instant.parse((String) supabaseUser.get("updated_at")));
        }
        if (supabaseUser.get("last_sign_in_at") != null) {
            user.setLastSignInAt(Instant.parse((String) supabaseUser.get("last_sign_in_at")));
        }

        // 解析 metadata
        user.setRawUserMetaData((Map<String, Object>) supabaseUser.get("raw_user_meta_data"));
        user.setRawAppMetaData((Map<String, Object>) supabaseUser.get("raw_app_meta_data"));

        return user;
    }

    // Convenience methods to access user_metadata fields

    /**
     * 获取微信 OpenID
     */
    public String getOpenid() {
        return rawUserMetaData != null ? (String) rawUserMetaData.get("openid") : null;
    }

    /**
     * 获取微信 UnionID（可选）
     */
    public String getUnionid() {
        return rawUserMetaData != null ? (String) rawUserMetaData.get("unionid") : null;
    }

    /**
     * 获取昵称
     */
    public String getNickname() {
        return rawUserMetaData != null ? (String) rawUserMetaData.get("nickname") : null;
    }

    /**
     * 获取头像 URL
     */
    public String getAvatarUrl() {
        return rawUserMetaData != null ? (String) rawUserMetaData.get("avatar_url") : null;
    }

    /**
     * 获取登录提供商标识（如 "wechat"）
     */
    public String getProvider() {
        return rawUserMetaData != null ? (String) rawUserMetaData.get("provider") : null;
    }

    // Getters and Setters

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Instant getEmailConfirmedAt() {
        return emailConfirmedAt;
    }

    public void setEmailConfirmedAt(Instant emailConfirmedAt) {
        this.emailConfirmedAt = emailConfirmedAt;
    }

    public Instant getPhoneConfirmedAt() {
        return phoneConfirmedAt;
    }

    public void setPhoneConfirmedAt(Instant phoneConfirmedAt) {
        this.phoneConfirmedAt = phoneConfirmedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Instant getLastSignInAt() {
        return lastSignInAt;
    }

    public void setLastSignInAt(Instant lastSignInAt) {
        this.lastSignInAt = lastSignInAt;
    }

    public Map<String, Object> getRawUserMetaData() {
        return rawUserMetaData;
    }

    public void setRawUserMetaData(Map<String, Object> rawUserMetaData) {
        this.rawUserMetaData = rawUserMetaData;
    }

    public Map<String, Object> getRawAppMetaData() {
        return rawAppMetaData;
    }

    public void setRawAppMetaData(Map<String, Object> rawAppMetaData) {
        this.rawAppMetaData = rawAppMetaData;
    }

    @Override
    public String toString() {
        return "User{" +
                "id='" + id + '\'' +
                ", email='" + email + '\'' +
                ", phone='" + (phone != null ? phone.substring(0, 3) + "****" + phone.substring(7) : "null") + '\'' +
                ", openid='" + (getOpenid() != null ? getOpenid().substring(0, 8) + "****" : "null") + '\'' +
                ", nickname='" + getNickname() + '\'' +
                ", createdAt=" + createdAt +
                ", lastSignInAt=" + lastSignInAt +
                '}';
    }
}
