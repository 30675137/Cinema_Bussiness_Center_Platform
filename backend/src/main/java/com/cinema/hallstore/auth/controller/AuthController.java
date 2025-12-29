package com.cinema.hallstore.auth.controller;

import com.cinema.hallstore.auth.dto.LoginRequest;
import com.cinema.hallstore.auth.dto.LoginResponse;
import com.cinema.hallstore.auth.dto.RefreshTokenRequest;
import com.cinema.hallstore.auth.service.AuthService;
import com.cinema.hallstore.exception.AuthException;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 认证控制器
 * <p>
 * 提供用户认证相关的 REST API 接口：
 * - POST /api/auth/wechat-login: 微信小程序静默登录
 * - POST /api/auth/refresh-token: 刷新访问令牌
 * - POST /api/auth/decrypt-phone: 解密微信手机号（将在 T044 实现）
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * 微信小程序静默登录
     * <p>
     * POST /api/auth/wechat-login
     * <p>
     * 请求体：
     * {
     *   "code": "071abc123def456"
     * }
     * <p>
     * 响应体（成功）：
     * {
     *   "success": true,
     *   "data": {
     *     "accessToken": "eyJhbGc...",
     *     "refreshToken": "v1.MRjNjk...",
     *     "expiresIn": 604800,
     *     "user": {
     *       "id": "550e8400-e29b-41d4-a716-446655440000",
     *       "openid": "o6_bmjrP****",
     *       "nickname": null,
     *       "avatarUrl": null,
     *       "phone": null
     *     }
     *   },
     *   "timestamp": "2025-12-24T10:30:00Z"
     * }
     * <p>
     * 响应体（失败）：
     * {
     *   "success": false,
     *   "error": "WECHAT_API_ERROR",
     *   "message": "微信登录失败: invalid code",
     *   "timestamp": "2025-12-24T10:30:00Z"
     * }
     *
     * @param request 登录请求（包含微信 code）
     * @return 登录响应（包含令牌和用户信息）
     */
    @PostMapping("/wechat-login")
    public ResponseEntity<Map<String, Object>> wechatLogin(@Valid @RequestBody LoginRequest request) {
        log.info("Received WeChat login request");

        try {
            LoginResponse loginResponse = authService.wechatLogin(request.getCode());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", loginResponse);
            response.put("timestamp", java.time.Instant.now().toString());

            log.info("WeChat login successful");
            return ResponseEntity.ok(response);

        } catch (AuthException e) {
            log.warn("WeChat login failed: {}", e.getMessage());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getErrorCode());
            errorResponse.put("message", e.getMessage());
            errorResponse.put("timestamp", java.time.Instant.now().toString());

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(errorResponse);

        } catch (Exception e) {
            log.error("Unexpected error during WeChat login", e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "INTERNAL_ERROR");
            errorResponse.put("message", "服务器内部错误");
            errorResponse.put("timestamp", java.time.Instant.now().toString());

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorResponse);
        }
    }

    /**
     * 刷新访问令牌
     * <p>
     * POST /api/auth/refresh-token
     * <p>
     * 请求体：
     * {
     *   "refreshToken": "v1.MRjNjk..."
     * }
     * <p>
     * 响应体（成功）：
     * {
     *   "success": true,
     *   "data": {
     *     "accessToken": "eyJhbGc...",
     *     "refreshToken": "v1.MRjNjk...",
     *     "expiresIn": 604800
     *   },
     *   "timestamp": "2025-12-24T10:30:00Z"
     * }
     * <p>
     * 注意：此接口将在 T029 (User Story 2) 中实现完整功能
     *
     * @param request 刷新令牌请求
     * @return 新的访问令牌
     */
    @PostMapping("/refresh-token")
    public ResponseEntity<Map<String, Object>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        log.info("Received refresh token request");

        try {
            Map<String, Object> tokens = authService.refreshToken(request.getRefreshToken());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", tokens);
            response.put("timestamp", java.time.Instant.now().toString());

            log.info("Token refreshed successfully");
            return ResponseEntity.ok(response);

        } catch (AuthException e) {
            log.warn("Token refresh failed: {}", e.getMessage());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getErrorCode());
            errorResponse.put("message", e.getMessage());
            errorResponse.put("timestamp", java.time.Instant.now().toString());

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(errorResponse);

        } catch (Exception e) {
            log.error("Unexpected error during token refresh", e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "INTERNAL_ERROR");
            errorResponse.put("message", "服务器内部错误");
            errorResponse.put("timestamp", java.time.Instant.now().toString());

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorResponse);
        }
    }

    /**
     * 解密微信手机号
     * <p>
     * POST /api/auth/decrypt-phone
     * <p>
     * 请求体：
     * {
     *   "encryptedData": "CiyLU1Aw2KjvrjMdj8YKliAjtP43uA...",
     *   "iv": "r7BXXKkLb8qrSNn05n0qiA==",
     *   "sessionKey": "tiihtNczf5v6AKRyjwEUhQ=="
     * }
     * <p>
     * 响应体（成功）：
     * {
     *   "success": true,
     *   "data": {
     *     "phoneNumber": "13800138000",
     *     "purePhoneNumber": "13800138000",
     *     "countryCode": "86"
     *   },
     *   "timestamp": "2025-12-24T10:30:00Z"
     * }
     * <p>
     * 注意：此接口将在 T044 (User Story 4) 中实现
     *
     * @param requestBody 包含 encryptedData, iv, sessionKey 的请求体
     * @return 解密后的手机号信息
     */
    @PostMapping("/decrypt-phone")
    public ResponseEntity<Map<String, Object>> decryptPhone(@RequestBody Map<String, String> requestBody) {
        log.info("Received decrypt phone request");

        // TODO: T044 将实现完整的手机号解密逻辑

        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("success", false);
        errorResponse.put("error", "NOT_IMPLEMENTED");
        errorResponse.put("message", "手机号解密功能将在 T044 中实现");
        errorResponse.put("timestamp", java.time.Instant.now().toString());

        return ResponseEntity
                .status(HttpStatus.NOT_IMPLEMENTED)
                .body(errorResponse);
    }
}
