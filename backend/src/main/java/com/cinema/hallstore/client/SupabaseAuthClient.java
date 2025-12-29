package com.cinema.hallstore.client;

import com.cinema.hallstore.config.SupabaseAuthConfig;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

/**
 * Supabase Auth 客户端
 * <p>
 * 封装 Supabase Auth SDK 调用，包括：
 * - adminCreateUser: 使用 Admin API 创建用户（存储 openid 在 user_metadata）
 * - getUserByMetadata: 通过 user_metadata 中的 openid 查找用户
 * - generateAuthTokens: 为用户签发 JWT（Access Token + Refresh Token）
 * - refreshSession: 刷新访问令牌
 * - updateUser: 更新用户的 user_metadata
 * <p>
 * ⚠️ 安全注意：所有操作使用 Service Role Key，具有绕过 RLS 的权限
 */
@Component
public class SupabaseAuthClient {

    private static final Logger log = LoggerFactory.getLogger(SupabaseAuthClient.class);

    private final WebClient webClient;
    private final SupabaseAuthConfig config;
    private final ObjectMapper objectMapper;

    public SupabaseAuthClient(SupabaseAuthConfig config, ObjectMapper objectMapper) {
        this.config = config;
        this.objectMapper = objectMapper;
        this.webClient = WebClient.builder()
                .baseUrl(config.getAuthApiUrl())
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader("apikey", config.getServiceRoleKey())
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + config.getServiceRoleKey())
                .build();

        log.info("SupabaseAuthClient initialized with Auth API URL: {}", config.getAuthApiUrl());
    }

    /**
     * 使用 Admin API 创建用户
     * <p>
     * 调用 Supabase Auth 的 POST /admin/users 接口创建新用户
     * 将微信 openid 等信息存储在 user_metadata 中
     *
     * @param userMetadata 用户元数据，包含 openid, provider 等字段
     * @return 创建的用户信息（包含 id, user_metadata 等）
     */
    public Map<String, Object> adminCreateUser(Map<String, Object> userMetadata) {
        log.debug("Creating user with metadata: {}", maskSensitiveData(userMetadata));

        // 生成虚拟邮箱（Supabase 要求必须有 email）
        String virtualEmail = "user_" + System.currentTimeMillis() + "@wechat.internal";

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("email", virtualEmail);
        requestBody.put("user_metadata", userMetadata);
        requestBody.put("email_confirm", true); // 自动确认邮箱（微信登录无需验证）

        try {
            String response = webClient.post()
                    .uri("/admin/users")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode jsonNode = objectMapper.readTree(response);
            Map<String, Object> user = objectMapper.convertValue(jsonNode, Map.class);

            log.info("User created successfully with ID: {}", user.get("id"));
            return user;
        } catch (Exception e) {
            log.error("Failed to create user via Supabase Admin API", e);
            throw new RuntimeException("Failed to create user: " + e.getMessage(), e);
        }
    }

    /**
     * 通过 user_metadata 查找用户
     * <p>
     * 由于 Supabase Auth Admin API 不直接支持通过 metadata 查询，
     * 我们获取所有用户并在内存中过滤。
     * <p>
     * 注意：这在用户量很大时性能不佳，实际生产环境应考虑：
     * 1. 在自定义表中存储 openid → user_id 映射关系
     * 2. 或者使用 Supabase Edge Functions 进行查询
     *
     * @param metadataKey   元数据字段名（如 "openid"）
     * @param metadataValue 元数据字段值
     * @return 用户信息，如果不存在返回 null
     */
    public Map<String, Object> getUserByMetadata(String metadataKey, String metadataValue) {
        log.debug("Searching user by metadata: {}={}", metadataKey, maskValue(metadataValue));

        try {
            // 使用 Auth Admin API 获取用户列表
            // GET /admin/users
            String response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/admin/users")
                            .build())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode jsonNode = objectMapper.readTree(response);

            // 响应格式: { "users": [...] }
            if (jsonNode.has("users")) {
                JsonNode users = jsonNode.get("users");

                // 在内存中过滤：查找 user_metadata 中匹配的用户
                for (JsonNode user : users) {
                    if (user.has("user_metadata")) {
                        JsonNode userMetadata = user.get("user_metadata");
                        if (userMetadata.has(metadataKey)) {
                            String value = userMetadata.get(metadataKey).asText();
                            if (metadataValue.equals(value)) {
                                Map<String, Object> foundUser = objectMapper.convertValue(user, Map.class);
                                log.info("User found with metadata {}={}", metadataKey, maskValue(metadataValue));
                                return foundUser;
                            }
                        }
                    }
                }
            }

            log.info("No user found with metadata {}={}", metadataKey, maskValue(metadataValue));
            return null;

        } catch (Exception e) {
            log.error("Failed to query user by metadata", e);
            throw new RuntimeException("Failed to query user: " + e.getMessage(), e);
        }
    }

    /**
     * 为用户签发 JWT 令牌
     * <p>
     * 使用 jjwt 库手动生成 JWT 令牌，绕过 Supabase Auth API
     * Access Token: 7 天有效期
     * Refresh Token: 30 天有效期
     *
     * @param userId 用户 ID (UUID)
     * @return 包含 access_token, refresh_token, expires_in 的 Map
     */
    public Map<String, Object> generateAuthTokens(String userId) {
        log.debug("Generating auth tokens for user: {}", userId);

        try {
            long now = System.currentTimeMillis();

            // 生成符合 HMAC-SHA256 要求的密钥 (至少 256 位 / 32 字节)
            javax.crypto.SecretKey signingKey = getSecureSigningKey();

            // Access Token: 7 天有效期
            long accessTokenExpiryMs = 7 * 24 * 60 * 60 * 1000L;
            String accessToken = io.jsonwebtoken.Jwts.builder()
                    .setSubject(userId)
                    .claim("role", "authenticated")
                    .claim("iss", "supabase")
                    .claim("ref", "fxhgyxceqrmnpezluaht")
                    .setIssuedAt(new java.util.Date(now))
                    .setExpiration(new java.util.Date(now + accessTokenExpiryMs))
                    .signWith(signingKey)
                    .compact();

            // Refresh Token: 30 天有效期
            long refreshTokenExpiryMs = 30 * 24 * 60 * 60 * 1000L;
            String refreshToken = io.jsonwebtoken.Jwts.builder()
                    .setSubject(userId)
                    .claim("type", "refresh")
                    .claim("iss", "supabase")
                    .claim("ref", "fxhgyxceqrmnpezluaht")
                    .setIssuedAt(new java.util.Date(now))
                    .setExpiration(new java.util.Date(now + refreshTokenExpiryMs))
                    .signWith(signingKey)
                    .compact();

            Map<String, Object> tokens = new HashMap<>();
            tokens.put("access_token", accessToken);
            tokens.put("refresh_token", refreshToken);
            tokens.put("expires_in", (int) (accessTokenExpiryMs / 1000)); // 秒

            log.info("Auth tokens generated successfully for user: {}", userId);
            return tokens;

        } catch (Exception e) {
            log.error("Failed to generate auth tokens for user: {}", userId, e);
            throw new RuntimeException("Failed to generate tokens: " + e.getMessage(), e);
        }
    }

    /**
     * 生成符合 HMAC-SHA256 要求的签名密钥
     * <p>
     * 使用 SHA-256 哈希确保密钥长度至少为 256 位 (32 字节)
     *
     * @return 安全的签名密钥
     */
    private javax.crypto.SecretKey getSecureSigningKey() {
        try {
            // 使用 SHA-256 对 JWT secret 进行哈希,确保得到 256 位密钥
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(config.getJwtSecret().getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return io.jsonwebtoken.security.Keys.hmacShaKeyFor(hash);
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    /**
     * 刷新访问令牌
     * <p>
     * 验证 Refresh Token 并生成新的 Access Token 和 Refresh Token
     *
     * @param refreshToken 刷新令牌
     * @return 包含新的 access_token, refresh_token, expires_in 的 Map
     */
    public Map<String, Object> refreshSession(String refreshToken) {
        log.debug("Refreshing session with refresh token");

        try {
            // 验证并解析 Refresh Token
            io.jsonwebtoken.Claims claims = io.jsonwebtoken.Jwts.parser()
                    .verifyWith(getSecureSigningKey())
                    .build()
                    .parseSignedClaims(refreshToken)
                    .getPayload();

            String userId = claims.getSubject();
            log.debug("Refresh token valid for user: {}", userId);

            // 生成新的 Access Token 和 Refresh Token
            Map<String, Object> newTokens = generateAuthTokens(userId);

            log.info("Session refreshed successfully for user: {}", userId);
            return newTokens;

        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            log.error("Refresh token expired", e);
            throw new RuntimeException("Refresh token expired: " + e.getMessage(), e);
        } catch (io.jsonwebtoken.JwtException e) {
            log.error("Invalid refresh token", e);
            throw new RuntimeException("Invalid refresh token: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Failed to refresh session", e);
            throw new RuntimeException("Failed to refresh session: " + e.getMessage(), e);
        }
    }

    /**
     * 更新用户的 user_metadata
     * <p>
     * 用于更新用户头像、昵称、手机号等信息
     *
     * @param userId       用户 ID (UUID)
     * @param userMetadata 要更新的元数据
     * @return 更新后的用户信息
     */
    public Map<String, Object> updateUser(String userId, Map<String, Object> userMetadata) {
        log.debug("Updating user {} with metadata: {}", userId, maskSensitiveData(userMetadata));

        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("user_metadata", userMetadata);

            String response = webClient.put()
                    .uri("/admin/users/" + userId)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode jsonNode = objectMapper.readTree(response);
            Map<String, Object> user = objectMapper.convertValue(jsonNode, Map.class);

            log.info("User {} updated successfully", userId);
            return user;
        } catch (Exception e) {
            log.error("Failed to update user: {}", userId, e);
            throw new RuntimeException("Failed to update user: " + e.getMessage(), e);
        }
    }

    /**
     * 掩码敏感数据用于日志输出
     */
    private Map<String, Object> maskSensitiveData(Map<String, Object> data) {
        Map<String, Object> masked = new HashMap<>(data);
        if (masked.containsKey("openid")) {
            masked.put("openid", maskValue((String) masked.get("openid")));
        }
        if (masked.containsKey("phone")) {
            masked.put("phone", maskValue((String) masked.get("phone")));
        }
        return masked;
    }

    /**
     * 掩码字符串值
     */
    private String maskValue(String value) {
        if (value == null || value.length() < 8) {
            return "****";
        }
        return value.substring(0, 4) + "****";
    }
}
