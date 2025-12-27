package com.cinema.hallstore.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * 微信小程序配置类
 * <p>
 * 从 application.yml 读取微信小程序配置，包括：
 * - AppID：微信小程序的唯一标识符
 * - AppSecret：微信小程序的密钥（用于调用 code2Session API）
 * <p>
 * ⚠️ 安全要求：
 * 1. AppSecret 必须通过环境变量读取，禁止硬编码在代码或配置文件中
 * 2. AppSecret 仅在后端使用，绝不可暴露给前端
 * 3. 在生产环境中，AppSecret 应从密钥管理系统（如 Vault、AWS Secrets Manager）读取
 */
@Configuration
@ConfigurationProperties(prefix = "wechat.miniprogram")
public class WechatProperties {

    /**
     * 微信小程序 AppID
     * 示例：wx1234567890abcdef
     * 可在微信公众平台 > 开发 > 开发设置 中获取
     */
    private String appId;

    /**
     * 微信小程序 AppSecret
     * 示例：abcdef1234567890abcdef1234567890
     * 可在微信公众平台 > 开发 > 开发设置 中获取
     * <p>
     * ⚠️ 安全警告：此密钥用于调用微信服务端 API，绝不可暴露给前端或泄露
     */
    private String appSecret;

    /**
     * 微信 code2Session API 端点
     * 用于将小程序登录凭证 code 换取 openid 和 session_key
     */
    private static final String CODE2SESSION_URL =
            "https://api.weixin.qq.com/sns/jscode2session" +
                    "?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code";

    /**
     * 构建 code2Session API 请求 URL
     *
     * @param code 小程序登录凭证（通过 wx.login() 获取）
     * @return 完整的 code2Session API URL
     */
    public String buildCode2SessionUrl(String code) {
        return String.format(CODE2SESSION_URL, appId, appSecret, code);
    }

    // Getters and Setters

    public String getAppId() {
        return appId;
    }

    public void setAppId(String appId) {
        this.appId = appId;
    }

    public String getAppSecret() {
        return appSecret;
    }

    public void setAppSecret(String appSecret) {
        this.appSecret = appSecret;
    }

    @Override
    public String toString() {
        return "WechatProperties{" +
                "appId='" + appId + '\'' +
                ", appSecret='" + maskSecret(appSecret) + '\'' +
                '}';
    }

    /**
     * 掩码 AppSecret 用于日志输出，仅显示前8个字符
     */
    private String maskSecret(String secret) {
        if (secret == null || secret.length() < 8) {
            return "****";
        }
        return secret.substring(0, 8) + "****";
    }
}
