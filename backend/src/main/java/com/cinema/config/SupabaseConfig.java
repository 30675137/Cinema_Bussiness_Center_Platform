package com.cinema.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Supabase 配置类
 * <p>
 * 从 application.yml 中读取 Supabase 相关配置
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-19
 */
@Configuration
@ConfigurationProperties(prefix = "supabase")
public class SupabaseConfig {

    /**
     * Supabase 项目 URL
     */
    private String url;

    /**
     * Supabase Service Role Key（服务端密钥）
     */
    private String serviceRoleKey;

    /**
     * API 请求超时时间（毫秒）
     */
    private int apiTimeout = 60000;

    /**
     * Storage 配置
     */
    private StorageConfig storage = new StorageConfig();

    // Getters and Setters

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getServiceRoleKey() {
        return serviceRoleKey;
    }

    public void setServiceRoleKey(String serviceRoleKey) {
        this.serviceRoleKey = serviceRoleKey;
    }

    public int getApiTimeout() {
        return apiTimeout;
    }

    public void setApiTimeout(int apiTimeout) {
        this.apiTimeout = apiTimeout;
    }

    public StorageConfig getStorage() {
        return storage;
    }

    public void setStorage(StorageConfig storage) {
        this.storage = storage;
    }

    /**
     * Storage 配置子类
     */
    public static class StorageConfig {
        /**
         * Storage Bucket 名称
         */
        private String bucket = "scenario-packages";

        /**
         * Storage API 基础 URL
         */
        private String baseUrl;

        public String getBucket() {
            return bucket;
        }

        public void setBucket(String bucket) {
            this.bucket = bucket;
        }

        public String getBaseUrl() {
            return baseUrl;
        }

        public void setBaseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
        }
    }

    @Override
    public String toString() {
        return "SupabaseConfig{" +
                "url='" + url + '\'' +
                ", apiTimeout=" + apiTimeout +
                ", storage=" + storage.bucket +
                '}';
    }
}
