/**
 * @spec O003-beverage-order
 * JWT Token 生成与验证工具类 (T026)
 */
package com.cinema.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

/**
 * JWT Token 提供者
 *
 * 功能:
 * 1. 生成 Access Token (有效期 1 小时)
 * 2. 生成 Refresh Token (有效期 7 天)
 * 3. 验证 Token 合法性
 * 4. 从 Token 中提取用户信息 (userId)
 */
@Component
public class JwtTokenProvider {

    private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);

    // JWT 密钥 (从配置文件读取)
    @Value("${jwt.secret:cinema-beverage-order-secret-key-change-in-production}")
    private String jwtSecret;

    // Access Token 有效期 (1小时 = 3600000 毫秒)
    @Value("${jwt.access-token-expiration:3600000}")
    private long accessTokenExpiration;

    // Refresh Token 有效期 (7天 = 604800000 毫秒)
    @Value("${jwt.refresh-token-expiration:604800000}")
    private long refreshTokenExpiration;

    /**
     * 生成 Access Token
     *
     * @param userId 用户ID
     * @return JWT Token 字符串
     */
    public String generateAccessToken(UUID userId) {
        return generateToken(userId, accessTokenExpiration);
    }

    /**
     * 生成 Refresh Token
     *
     * @param userId 用户ID
     * @return JWT Token 字符串
     */
    public String generateRefreshToken(UUID userId) {
        return generateToken(userId, refreshTokenExpiration);
    }

    /**
     * 通用 Token 生成方法
     *
     * @param userId 用户ID
     * @param expiration 有效期 (毫秒)
     * @return JWT Token 字符串
     */
    private String generateToken(UUID userId, long expiration) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .setSubject(userId.toString())  // 主体 (用户ID)
                .setIssuedAt(now)               // 签发时间
                .setExpiration(expiryDate)      // 过期时间
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)  // 签名算法
                .compact();
    }

    /**
     * 从 Token 中提取用户ID
     *
     * @param token JWT Token
     * @return 用户ID (UUID)
     */
    public UUID getUserIdFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return UUID.fromString(claims.getSubject());
    }

    /**
     * 验证 Token 是否有效
     *
     * @param token JWT Token
     * @return true 有效, false 无效
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (SignatureException ex) {
            log.error("Invalid JWT signature: {}", ex.getMessage());
        } catch (MalformedJwtException ex) {
            log.error("Invalid JWT token: {}", ex.getMessage());
        } catch (ExpiredJwtException ex) {
            log.error("Expired JWT token: {}", ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            log.error("Unsupported JWT token: {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            log.error("JWT claims string is empty: {}", ex.getMessage());
        }
        return false;
    }

    /**
     * 获取签名密钥
     *
     * @return SecretKey
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
