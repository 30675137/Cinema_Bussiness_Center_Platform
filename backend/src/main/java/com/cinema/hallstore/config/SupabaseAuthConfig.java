package com.cinema.hallstore.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Supabase Auth 配置类
 * <p>
 * 从 application.yml 读取 Supabase 配置，包括：
 * - Supabase Project URL
 * - Anon Key (公开密钥，用于前端请求)
 * - Service Role Key (管理员密钥，用于后端 Admin API 调用，如 adminCreateUser)
 * <p>
 * 注意：Service Role Key 具有绕过 RLS 的能力，必须仅在后端使用，绝不暴露给前端。
 */
@Configuration
@ConfigurationProperties(prefix = "supabase")
public class SupabaseAuthConfig {

    /**
     * Supabase 项目 URL，格式：https://your-project-id.supabase.co
     */
    private String url;

    /**
     * Supabase Anon Key（公开密钥）
     * 用于前端请求和非管理员操作
     */
    private String anonKey;

    /**
     * Supabase Service Role Key（管理员密钥）
     * 用于后端 Admin API 调用（如创建用户、更新 user_metadata）
     * <p>
     * ⚠️ 安全警告：此密钥具有完全访问权限，绝不可暴露给前端或客户端
     */
    private String serviceRoleKey;

    /**
     * Supabase JWT Secret（用于签名JWT token）
     * 从环境变量或配置文件中读取
     */
    private String jwtSecret;

    /**
     * 获取 Supabase REST API 基础 URL
     * 格式：https://your-project-id.supabase.co/rest/v1
     */
    public String getRestApiUrl() {
        return url + "/rest/v1";
    }

    /**
     * 获取 Supabase Auth API 基础 URL
     * 格式：https://your-project-id.supabase.co/auth/v1
     */
    public String getAuthApiUrl() {
        return url + "/auth/v1";
    }

    // Getters and Setters

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getAnonKey() {
        return anonKey;
    }

    public void setAnonKey(String anonKey) {
        this.anonKey = anonKey;
    }

    public String getServiceRoleKey() {
        return serviceRoleKey;
    }

    public void setServiceRoleKey(String serviceRoleKey) {
        this.serviceRoleKey = serviceRoleKey;
    }

    public String getJwtSecret() {
        return jwtSecret;
    }

    public void setJwtSecret(String jwtSecret) {
        this.jwtSecret = jwtSecret;
    }

    @Override
    public String toString() {
        return "SupabaseAuthConfig{" +
                "url='" + url + '\'' +
                ", anonKey='" + maskKey(anonKey) + '\'' +
                ", serviceRoleKey='" + maskKey(serviceRoleKey) + '\'' +
                '}';
    }

    /**
     * 掩码密钥用于日志输出，仅显示前8个字符
     */
    private String maskKey(String key) {
        if (key == null || key.length() < 8) {
            return "****";
        }
        return key.substring(0, 8) + "****";
    }
}
