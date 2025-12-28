/**
 * @spec O003-beverage-order
 * 认证控制器 (T026)
 */
package com.cinema.auth.controller;

import com.cinema.auth.dto.AuthResponse;
import com.cinema.auth.dto.LoginRequest;
import com.cinema.auth.dto.RefreshTokenRequest;
import com.cinema.common.dto.ApiResponse;
import com.cinema.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * 认证 API 控制器 (B端管理人员登录)
 *
 * 提供以下端点:
 * - POST /api/beverage-auth/login - B端用户登录
 * - POST /api/beverage-auth/refresh - 刷新访问令牌
 *
 * 注意: 此实现为简化版本，使用固定的测试用户
 * 生产环境应连接实际用户数据库 (Supabase Auth)
 */
@RestController
@RequestMapping("/api/beverage-auth")
public class BeverageAuthController {

    private static final Logger log = LoggerFactory.getLogger(BeverageAuthController.class);

    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    // 测试用户配置 (生产环境应从数据库读取)
    @Value("${auth.test.username:admin}")
    private String testUsername;

    @Value("${auth.test.password:admin123}")
    private String testPassword;

    @Value("${auth.test.userId:00000000-0000-0000-0000-000000000001}")
    private String testUserId;

    @Value("${jwt.access-token-expiration:3600000}")
    private long accessTokenExpiration;

    public BeverageAuthController(JwtTokenProvider jwtTokenProvider, PasswordEncoder passwordEncoder) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * 用户登录
     *
     * @param request 登录请求参数
     * @return 认证响应 (包含 access token 和 refresh token)
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        log.info("登录请求: username={}", request.getUsername());

        // 简化版本: 验证测试用户
        if (!testUsername.equals(request.getUsername())) {
            log.warn("用户不存在: username={}", request.getUsername());
            return ResponseEntity.status(401)
                    .body(ApiResponse.failure("用户名或密码错误"));
        }

        // 验证密码 (生产环境应使用加密存储的密码)
        if (!testPassword.equals(request.getPassword())) {
            log.warn("密码错误: username={}", request.getUsername());
            return ResponseEntity.status(401)
                    .body(ApiResponse.failure("用户名或密码错误"));
        }

        // 生成 JWT Token
        UUID userId = UUID.fromString(testUserId);
        String accessToken = jwtTokenProvider.generateAccessToken(userId);
        String refreshToken = jwtTokenProvider.generateRefreshToken(userId);

        // 构建响应
        AuthResponse authResponse = new AuthResponse(
                userId,
                accessToken,
                refreshToken,
                accessTokenExpiration / 1000  // 转换为秒
        );

        log.info("登录成功: userId={}", userId);
        return ResponseEntity.ok(ApiResponse.success(authResponse, "登录成功"));
    }

    /**
     * 刷新访问令牌
     *
     * @param request 刷新令牌请求参数
     * @return 新的认证响应
     */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        log.info("刷新令牌请求");

        try {
            // 验证 Refresh Token
            if (!jwtTokenProvider.validateToken(request.getRefreshToken())) {
                log.warn("无效的刷新令牌");
                return ResponseEntity.status(401)
                        .body(ApiResponse.failure("无效的刷新令牌"));
            }

            // 从 Refresh Token 中提取用户ID
            UUID userId = jwtTokenProvider.getUserIdFromToken(request.getRefreshToken());

            // 生成新的 Access Token 和 Refresh Token
            String newAccessToken = jwtTokenProvider.generateAccessToken(userId);
            String newRefreshToken = jwtTokenProvider.generateRefreshToken(userId);

            // 构建响应
            AuthResponse authResponse = new AuthResponse(
                    userId,
                    newAccessToken,
                    newRefreshToken,
                    accessTokenExpiration / 1000
            );

            log.info("令牌刷新成功: userId={}", userId);
            return ResponseEntity.ok(ApiResponse.success(authResponse, "令牌刷新成功"));

        } catch (Exception e) {
            log.error("刷新令牌失败: {}", e.getMessage());
            return ResponseEntity.status(401)
                    .body(ApiResponse.failure("刷新令牌失败"));
        }
    }

    /**
     * 获取当前认证用户信息 (用于测试)
     *
     * @return 当前用户ID
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UUID>> getCurrentUser() {
        // 从 Spring Security 上下文获取当前用户
        org.springframework.security.core.Authentication authentication =
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.failure("未认证"));
        }

        UUID userId = (UUID) authentication.getPrincipal();
        log.info("获取当前用户: userId={}", userId);

        return ResponseEntity.ok(ApiResponse.success(userId));
    }
}
