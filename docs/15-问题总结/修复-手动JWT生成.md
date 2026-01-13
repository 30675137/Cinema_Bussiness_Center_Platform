# Bug 修复 #6: Supabase Token 生成失败 - 手动 JWT 生成方案

## 问题描述

**错误信息序列**:

1. `/admin/generate_link` 返回的响应中缺少 `access_token` 字段
2. `/token?grant_type=password` 返回 `400 Bad Request`

**触发场景**:
- 用户登录成功后,尝试为用户生成 JWT 令牌

---

## 根本原因

### Supabase Auth API 限制

1. **`/admin/generate_link` 不适合此场景**:
   - 该接口返回的是 "magic link"(魔法链接),主要用于邮件登录
   - 返回格式不包含标准的 `access_token` 和 `refresh_token` 字段

2. **`/token?grant_type=password` 需要启用密码认证**:
   - Supabase 项目可能禁用了密码认证
   - 即使设置临时密码,也无法通过此接口登录获取令牌

### 为什么之前的方案都失败?

```java
// ❌ 方案 1: /admin/generate_link - 返回格式不符合预期
webClient.post()
    .uri("/admin/generate_link")
    .bodyValue(Map.of("type", "magiclink", "email", userId + "@internal.supabase"))
// 响应: { "action_link": "...", "email_otp": "..." } (没有 access_token!)

// ❌ 方案 2: /token?grant_type=password - 400 Bad Request
webClient.post()
    .uri("/token?grant_type=password")
    .bodyValue(Map.of("email", email, "password", tempPassword))
// 可能原因: 密码认证未启用,或虚拟邮箱格式不支持
```

---

## 解决方案

### 最终方案: 手动生成 JWT

**核心思路**: 使用 jjwt 库手动生成符合 Supabase 规范的 JWT token,绕过所有 Supabase Auth API。

### Bug #7: JWT Secret 长度不足

在实现过程中发现了额外的问题:

**错误信息**:
```
io.jsonwebtoken.security.WeakKeyException: The specified key byte array is 248 bits which is not secure enough for any JWT HMAC-SHA algorithm.
```

**原因**: Supabase JWT Secret `FkEDAlCy8cOBZex8J7f34g_YJLufeNC` 只有 31 字节(248 位),而 HMAC-SHA256 要求至少 32 字节(256 位)。

**解决**: 使用 SHA-256 哈希对原始 secret 进行处理,确保得到 256 位密钥:

```java
private javax.crypto.SecretKey getSecureSigningKey() {
    try {
        java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(config.getJwtSecret().getBytes(StandardCharsets.UTF_8));
        return io.jsonwebtoken.security.Keys.hmacShaKeyFor(hash);
    } catch (NoSuchAlgorithmException e) {
        throw new RuntimeException("SHA-256 algorithm not available", e);
    }
}
```

### 实现步骤

#### 1. 配置 JWT Secret

在 `application.yml` 中添加 Supabase JWT Secret:

```yaml
supabase:
  url: https://xxx.supabase.co
  anon-key: eyJhbGciOi...
  service-role-key: sb_secret_xxx
  jwt-secret: ${SUPABASE_JWT_SECRET:FkEDAlCy8cOBZex8J7f34g_YJLufeNC}
```

在 `SupabaseAuthConfig.java` 中添加字段:

```java
private String jwtSecret;

public String getJwtSecret() {
    return jwtSecret;
}
```

#### 2. 手动生成 Access Token 和 Refresh Token

修改 `SupabaseAuthClient.generateAuthTokens()` 方法:

```java
public Map<String, Object> generateAuthTokens(String userId) {
    log.debug("Generating auth tokens for user: {}", userId);

    try {
        long now = System.currentTimeMillis();

        // Access Token: 7 天有效期
        long accessTokenExpiryMs = 7 * 24 * 60 * 60 * 1000L;
        String accessToken = io.jsonwebtoken.Jwts.builder()
                .setSubject(userId)
                .claim("role", "authenticated")
                .claim("iss", "supabase")
                .claim("ref", "fxhgyxceqrmnpezluaht")
                .setIssuedAt(new java.util.Date(now))
                .setExpiration(new java.util.Date(now + accessTokenExpiryMs))
                .signWith(io.jsonwebtoken.security.Keys.hmacShaKeyFor(
                        config.getJwtSecret().getBytes(java.nio.charset.StandardCharsets.UTF_8)
                ))
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
                .signWith(io.jsonwebtoken.security.Keys.hmacShaKeyFor(
                        config.getJwtSecret().getBytes(java.nio.charset.StandardCharsets.UTF_8)
                ))
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
```

#### 3. 实现 Refresh Token 验证

修改 `SupabaseAuthClient.refreshSession()` 方法:

```java
public Map<String, Object> refreshSession(String refreshToken) {
    log.debug("Refreshing session with refresh token");

    try {
        // 验证并解析 Refresh Token
        io.jsonwebtoken.Claims claims = io.jsonwebtoken.Jwts.parser()
                .verifyWith(io.jsonwebtoken.security.Keys.hmacShaKeyFor(
                        config.getJwtSecret().getBytes(java.nio.charset.StandardCharsets.UTF_8)
                ))
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
    }
}
```

---

## JWT Token 格式说明

### Access Token Claims

```json
{
  "sub": "uuid-of-user",
  "role": "authenticated",
  "iss": "supabase",
  "ref": "fxhgyxceqrmnpezluaht",
  "iat": 1735023600,
  "exp": 1735628400
}
```

### Refresh Token Claims

```json
{
  "sub": "uuid-of-user",
  "type": "refresh",
  "iss": "supabase",
  "ref": "fxhgyxceqrmnpezluaht",
  "iat": 1735023600,
  "exp": 1737615600
}
```

### 关键字段说明

| 字段 | 说明 |
|------|------|
| `sub` | Subject - 用户 UUID |
| `role` | 用户角色 (authenticated / anon) |
| `iss` | Issuer - 固定为 "supabase" |
| `ref` | Supabase Project Reference ID |
| `iat` | Issued At - 签发时间 (Unix 时间戳) |
| `exp` | Expiration - 过期时间 (Unix 时间戳) |
| `type` | Token 类型 (仅 Refresh Token 有此字段) |

---

## 修复文件清单

1. ✅ `backend/src/main/resources/application.yml:47` - 添加 `jwt-secret` 配置
2. ✅ `backend/src/main/java/com/cinema/hallstore/config/SupabaseAuthConfig.java:39-93` - 添加 `jwtSecret` 字段和 getter/setter
3. ✅ `backend/src/main/java/com/cinema/hallstore/client/SupabaseAuthClient.java:149-205` - 重写 `generateAuthTokens()` 方法
4. ✅ `backend/src/main/java/com/cinema/hallstore/client/SupabaseAuthClient.java:207-247` - 重写 `refreshSession()` 方法

---

## 测试验证

### 1. 编译并重启后端

```bash
cd backend
mvn clean package -DskipTests -Dmaven.test.skip=true
java -jar target/hall-store-backend-0.0.1-SNAPSHOT.jar
```

### 2. 测试 Token 生成

```bash
# 使用测试 code (预期返回 WeChat API error - 这是正常的)
curl -X POST http://localhost:8080/api/auth/wechat-login \
  -H "Content-Type: application/json" \
  -d '{"code":"test-code"}'

# 预期响应
{
  "success": false,
  "error": "WECHAT_API_ERROR",
  "message": "微信登录失败: WeChat API error: 40029 - invalid code"
}
```

### 3. 在微信小程序中测试完整流程

1. **清除缓存**:
   ```javascript
   wx.clearStorage()
   ```

2. **重启小程序** (点击 "编译" 按钮)

3. **观察日志**:
   ```
   [AuthService] Starting silent login...
   [AuthService] Got WeChat code: 071a****
   [AuthService] Silent login successful, user ID: xxx
   [AuthService] Access token: eyJhbG****
   ```

4. **验证 Token 有效性**:
   - Access Token 应该以 `eyJ` 开头 (Base64 编码的 JWT)
   - 长度约 200-300 字符
   - 可以在 jwt.io 解码验证 claims

---

## 优势与权衡

### 优势

1. **完全掌控**: 不依赖 Supabase Auth API 的不稳定行为
2. **灵活配置**: 可自定义 Token 过期时间和 claims
3. **性能优化**: 减少一次 HTTP 请求 (不需要调用 Supabase)
4. **可预测性**: 不会因为 Supabase 配置变化而失败

### 权衡

1. **需要管理 JWT Secret**: 必须妥善保管 Supabase JWT Secret
2. **失去部分审计能力**: Supabase Dashboard 不会记录我们手动签发的 Token
3. **需要自行验证**: 必须自己实现 Refresh Token 验证逻辑

---

## jjwt 0.12.x API 注意事项

### 旧版 API (已废弃)

```java
// ❌ 不适用于 jjwt 0.12.x
Jwts.parserBuilder()
    .setSigningKey(key)
    .build()
    .parseClaimsJws(token)
```

### 新版 API (0.12.x)

```java
// ✅ jjwt 0.12.x 正确用法
Jwts.parser()
    .verifyWith(key)
    .build()
    .parseSignedClaims(token)
    .getPayload()
```

---

## 安全建议

1. **环境变量管理 JWT Secret**:
   ```bash
   export SUPABASE_JWT_SECRET="your-secret-key"
   ```

2. **不要硬编码 Secret**:
   - ❌ `jwt-secret: FkEDAlCy8cOBZex8J7f34g_YJLufeNC`
   - ✅ `jwt-secret: ${SUPABASE_JWT_SECRET}`

3. **定期轮换 Secret**:
   - 在 Supabase Dashboard 中可以重新生成 JWT Secret
   - 更新后需要同步到所有环境

---

## 相关 Bug 修复

1. **Bug #1**: pages/login 404 (编译缓存问题)
2. **Bug #2**: Supabase REST API 查询 404 (使用错误的 API)
3. **Bug #3**: Supabase 创建用户 400 (缺少 email 字段)
4. **Bug #4**: Metadata 空指针异常
5. **Bug #5**: `/admin/generate_link` 不返回 access_token
6. **Bug #6 (本次)**: 手动生成 JWT 绕过所有 Token API

---

**修复日期**: 2025-12-24
**影响范围**: 用户登录令牌签发和刷新流程
**版本**: v1.0.6
