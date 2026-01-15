package com.cinema.hallstore.auth.service;

import com.cinema.hallstore.auth.dto.LoginResponse;
import com.cinema.hallstore.client.SupabaseAuthClient;
import com.cinema.hallstore.client.WechatApiClient;
import com.cinema.hallstore.exception.AuthException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * 认证服务
 * <p>
 * 处理用户认证相关的业务逻辑，包括：
 * - 微信小程序静默登录
 * - 令牌刷新
 * - 手机号解密
 */
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final SupabaseAuthClient supabaseAuthClient;
    private final WechatApiClient wechatApiClient;

    public AuthService(SupabaseAuthClient supabaseAuthClient, WechatApiClient wechatApiClient) {
        this.supabaseAuthClient = supabaseAuthClient;
        this.wechatApiClient = wechatApiClient;
    }

    /**
     * 微信小程序静默登录
     * <p>
     * 流程：
     * 1. 调用微信 code2Session API 获取 openid 和 session_key
     * 2. 通过 openid 查找用户（SupabaseAuthClient.getUserByMetadata）
     * 3. 如果用户不存在，则创建新用户（SupabaseAuthClient.adminCreateUser）
     * 4. 为用户签发 JWT 令牌（SupabaseAuthClient.generateAuthTokens）
     * 5. 返回 LoginResponse（包含 access_token, refresh_token, user 信息）
     * <p>
     * 重试逻辑：微信 API 调用失败时自动重试 1 次
     *
     * @param code 小程序登录凭证（通过 wx.login() 获取）
     * @return 登录响应，包含令牌和用户信息
     * @throws AuthException 如果登录失败
     */
    public LoginResponse wechatLogin(String code) throws AuthException {
        log.info("Processing WeChat miniprogram login with code: {}****", code.substring(0, Math.min(4, code.length())));

        try {
            // Step 1: 调用微信 code2Session API（带重试逻辑）
            WechatApiClient.WechatSessionResponse sessionResponse = callWechatApiWithRetry(code);
            String openid = sessionResponse.getOpenid();
            String sessionKey = sessionResponse.getSessionKey();
            String unionid = sessionResponse.getUnionid();

            log.debug("WeChat code2Session successful, openid: {}****", openid.substring(0, Math.min(8, openid.length())));

            // Step 2: 通过 openid 查找用户
            Map<String, Object> existingUser = supabaseAuthClient.getUserByMetadata("openid", openid);

            Map<String, Object> user;
            if (existingUser == null) {
                // Step 3: 用户不存在，创建新用户
                log.info("User not found with openid, creating new user");

                Map<String, Object> userMetadata = new HashMap<>();
                userMetadata.put("openid", openid);
                userMetadata.put("provider", "wechat");
                if (unionid != null) {
                    userMetadata.put("unionid", unionid);
                }
                userMetadata.put("last_login_at", java.time.Instant.now().toString());

                user = supabaseAuthClient.adminCreateUser(userMetadata);
                log.info("New user created with ID: {}", user.get("id"));
            } else {
                // 用户已存在，更新最后登录时间
                log.info("User found with openid, updating last login time");
                user = existingUser;

                // 更新 user_metadata 中的 last_login_at
                Map<String, Object> existingMetadata = (Map<String, Object>) user.get("raw_user_meta_data");
                Map<String, Object> updatedMetadata = new HashMap<>();

                // 如果已有 metadata，先复制过来
                if (existingMetadata != null) {
                    updatedMetadata.putAll(existingMetadata);
                }

                // 添加最后登录时间
                updatedMetadata.put("last_login_at", java.time.Instant.now().toString());

                user = supabaseAuthClient.updateUser((String) user.get("id"), updatedMetadata);
            }

            // Step 4: 为用户签发 JWT 令牌
            String userId = (String) user.get("id");
            Map<String, Object> tokens = supabaseAuthClient.generateAuthTokens(userId);

            // Step 5: 构建 LoginResponse
            String accessToken = (String) tokens.get("access_token");
            String refreshToken = (String) tokens.get("refresh_token");
            Integer expiresIn = (Integer) tokens.get("expires_in");

            LoginResponse.UserInfo userInfo = LoginResponse.UserInfo.fromSupabaseUser(user);

            LoginResponse response = new LoginResponse(accessToken, refreshToken, expiresIn, userInfo);

            log.info("WeChat login successful for user: {}", userId);
            return response;

        } catch (WechatApiClient.WechatApiException e) {
            log.error("WeChat API error during login", e);
            throw new AuthException("微信登录失败: " + e.getMessage(), AuthException.ErrorCode.WECHAT_API_ERROR, e);
        } catch (Exception e) {
            log.error("Unexpected error during WeChat login", e);
            throw new AuthException("登录失败: " + e.getMessage(), AuthException.ErrorCode.SUPABASE_API_ERROR, e);
        }
    }

    /**
     * 调用微信 API 并实现重试逻辑
     * <p>
     * 失败时自动重试 1 次（共 2 次尝试）
     *
     * @param code 小程序登录凭证
     * @return 微信会话响应
     * @throws WechatApiClient.WechatApiException 如果重试后仍失败
     */
    private WechatApiClient.WechatSessionResponse callWechatApiWithRetry(String code)
            throws WechatApiClient.WechatApiException {
        int maxRetries = 1;
        WechatApiClient.WechatApiException lastException = null;

        for (int attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                if (attempt > 0) {
                    log.warn("Retrying WeChat code2Session API (attempt {}/{})", attempt + 1, maxRetries + 1);
                }
                return wechatApiClient.code2Session(code);
            } catch (WechatApiClient.WechatApiException e) {
                lastException = e;
                log.warn("WeChat code2Session API failed (attempt {}/{}): {}", attempt + 1, maxRetries + 1, e.getMessage());

                if (attempt < maxRetries) {
                    // 等待 500ms 后重试
                    try {
                        Thread.sleep(500);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw e;
                    }
                }
            }
        }

        throw lastException;
    }

    /**
     * 刷新访问令牌
     * <p>
     * 使用 Refresh Token 获取新的 Access Token
     *
     * @param refreshToken 刷新令牌
     * @return 包含新令牌的 Map（access_token, refresh_token, expires_in）
     * @throws AuthException 如果刷新失败
     */
    public Map<String, Object> refreshToken(String refreshToken) throws AuthException {
        log.info("Refreshing access token");

        try {
            Map<String, Object> tokens = supabaseAuthClient.refreshSession(refreshToken);

            log.info("Access token refreshed successfully");
            return tokens;

        } catch (Exception e) {
            log.error("Failed to refresh access token", e);
            throw new AuthException("刷新令牌失败: " + e.getMessage(), AuthException.ErrorCode.REFRESH_TOKEN_INVALID, e);
        }
    }

    /**
     * 解密微信加密数据（如手机号）
     * <p>
     * 使用 session_key 解密微信返回的加密数据
     * <p>
     * 注意：此方法将在 T043 中完整实现
     *
     * @param encryptedData 加密数据（Base64 编码）
     * @param iv            初始向量（Base64 编码）
     * @param sessionKey    会话密钥（Base64 编码）
     * @return 解密后的数据（包含手机号等信息）
     * @throws AuthException 如果解密失败
     */
    public Map<String, Object> decryptPhone(String encryptedData, String iv, String sessionKey) throws AuthException {
        log.info("Decrypting WeChat phone number");

        try {
            // TODO: 调用 WechatApiClient.decryptData() 实现解密（T043）
            Map<String, Object> decryptedData = wechatApiClient.decryptData(encryptedData, iv, sessionKey);

            log.info("Phone number decrypted successfully");
            return decryptedData;

        } catch (WechatApiClient.WechatApiException e) {
            log.error("Failed to decrypt phone number", e);
            throw new AuthException("手机号解密失败: " + e.getMessage(), AuthException.ErrorCode.WECHAT_API_ERROR, e);
        }
    }
}
