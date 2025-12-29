package com.cinema.hallstore.client;

import com.cinema.hallstore.config.WechatProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * 微信 API 客户端
 * <p>
 * 封装微信服务端 API 调用，包括：
 * - code2Session: 将小程序登录凭证 code 换取 openid 和 session_key
 * <p>
 * API 文档：https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/login/auth.code2Session.html
 */
@Component
public class WechatApiClient {

    private static final Logger log = LoggerFactory.getLogger(WechatApiClient.class);

    private final WechatProperties wechatProperties;
    private final ObjectMapper objectMapper;
    private final OkHttpClient httpClient;

    public WechatApiClient(WechatProperties wechatProperties, ObjectMapper objectMapper) {
        this.wechatProperties = wechatProperties;
        this.objectMapper = objectMapper;
        this.httpClient = new OkHttpClient.Builder()
                .connectTimeout(10, TimeUnit.SECONDS)
                .readTimeout(10, TimeUnit.SECONDS)
                .writeTimeout(10, TimeUnit.SECONDS)
                .build();

        log.info("WechatApiClient initialized with AppID: {}", wechatProperties.getAppId());
    }

    /**
     * 调用微信 code2Session API
     * <p>
     * 将小程序登录凭证 code 换取用户唯一标识 openid 和会话密钥 session_key
     *
     * @param code 小程序登录凭证（通过 wx.login() 获取）
     * @return 包含 openid, session_key, unionid（可选）的 Map
     * @throws WechatApiException 如果调用失败或微信返回错误
     */
    public WechatSessionResponse code2Session(String code) throws WechatApiException {
        log.debug("Calling WeChat code2Session API with code: {}****", code.substring(0, Math.min(4, code.length())));

        String url = wechatProperties.buildCode2SessionUrl(code);

        Request request = new Request.Builder()
                .url(url)
                .get()
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                log.error("WeChat API HTTP error: {}", response.code());
                throw new WechatApiException("WeChat API HTTP error: " + response.code());
            }

            String responseBody = response.body().string();
            log.debug("WeChat code2Session response: {}", maskSensitiveFields(responseBody));

            JsonNode jsonNode = objectMapper.readTree(responseBody);

            // 检查微信 API 错误
            if (jsonNode.has("errcode")) {
                int errcode = jsonNode.get("errcode").asInt();
                String errmsg = jsonNode.get("errmsg").asText();

                log.error("WeChat API error: errcode={}, errmsg={}", errcode, errmsg);
                throw new WechatApiException(String.format("WeChat API error: %d - %s", errcode, errmsg));
            }

            // 提取返回数据
            String openid = jsonNode.get("openid").asText();
            String sessionKey = jsonNode.get("session_key").asText();
            String unionid = jsonNode.has("unionid") ? jsonNode.get("unionid").asText() : null;

            log.info("WeChat code2Session successful, openid: {}****", openid.substring(0, Math.min(8, openid.length())));

            return new WechatSessionResponse(openid, sessionKey, unionid);

        } catch (IOException e) {
            log.error("Failed to call WeChat code2Session API", e);
            throw new WechatApiException("Network error calling WeChat API: " + e.getMessage(), e);
        }
    }

    /**
     * 使用 session_key 解密微信加密数据（如手机号）
     * <p>
     * 解密算法：AES-128-CBC，数据格式：Base64
     * <p>
     * 注意：此方法需要实现 AES 解密逻辑，暂时返回占位符
     *
     * @param encryptedData 加密数据（Base64 编码）
     * @param iv            初始向量（Base64 编码）
     * @param sessionKey    会话密钥（Base64 编码）
     * @return 解密后的数据（JSON 格式）
     * @throws WechatApiException 如果解密失败
     */
    public Map<String, Object> decryptData(String encryptedData, String iv, String sessionKey) throws WechatApiException {
        log.debug("Decrypting WeChat encrypted data");

        // TODO: 实现 AES-128-CBC 解密逻辑
        // 参考：https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/signature.html

        throw new UnsupportedOperationException("WeChat data decryption not yet implemented (T043)");
    }

    /**
     * 掩码响应中的敏感字段用于日志输出
     */
    private String maskSensitiveFields(String responseBody) {
        try {
            JsonNode jsonNode = objectMapper.readTree(responseBody);
            if (jsonNode.has("session_key")) {
                ((com.fasterxml.jackson.databind.node.ObjectNode) jsonNode).put("session_key", "****");
            }
            if (jsonNode.has("openid")) {
                String openid = jsonNode.get("openid").asText();
                ((com.fasterxml.jackson.databind.node.ObjectNode) jsonNode).put("openid",
                    openid.substring(0, Math.min(8, openid.length())) + "****");
            }
            return objectMapper.writeValueAsString(jsonNode);
        } catch (Exception e) {
            return responseBody;
        }
    }

    /**
     * 微信 code2Session API 响应
     */
    public static class WechatSessionResponse {
        private final String openid;
        private final String sessionKey;
        private final String unionid;

        public WechatSessionResponse(String openid, String sessionKey, String unionid) {
            this.openid = openid;
            this.sessionKey = sessionKey;
            this.unionid = unionid;
        }

        public String getOpenid() {
            return openid;
        }

        public String getSessionKey() {
            return sessionKey;
        }

        public String getUnionid() {
            return unionid;
        }
    }

    /**
     * 微信 API 异常
     */
    public static class WechatApiException extends Exception {
        public WechatApiException(String message) {
            super(message);
        }

        public WechatApiException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
