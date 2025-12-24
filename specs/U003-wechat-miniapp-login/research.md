# Research: 微信小程序登录功能

**Feature**: U003-wechat-miniapp-login
**Date**: 2025-12-24
**Status**: Completed

## 研究目标

本研究旨在确定影院小程序微信登录功能的最佳技术实现方案，重点解决以下问题：

1. 如何集成Supabase Auth管理用户身份认证
2. 如何将微信登录流程适配到Supabase Auth
3. JWT令牌管理策略（使用Supabase Auth内置机制 vs 自定义）
4. C端Taro框架与后端Supabase Auth的集成方式

## 关键技术决策

### 1. 后端认证架构：Supabase Auth + Spring Boot

**决策**: 使用Supabase Auth的auth.users表管理用户身份，而非创建自定义users表

**理由**:
- **安全性**: Supabase Auth提供内置的密码哈希、会话管理、JWT签发和验证功能，减少自定义认证代码的安全风险
- **标准化**: 遵循Supabase生态的标准认证模式，便于集成RLS（Row Level Security）策略，使用auth.uid()进行权限控制
- **减少代码**: 无需自己实现JWT签发、刷新、验证逻辑，直接使用Supabase Auth SDK提供的方法
- **可扩展性**: 未来如需支持其他登录方式（手机号、邮箱），可复用Supabase Auth的多Provider机制

**实现方式**:
1. 后端使用Supabase Java Client集成Supabase Auth SDK
2. 微信登录流程：wx.login → code2Session获取openid → 调用Supabase Auth的signUp()创建用户 → 将openid存储在user_metadata中
3. 返回Supabase Auth签发的JWT令牌（Access Token + Refresh Token）
4. 业务表（如预约订单）通过auth.uid()关联用户，使用RLS策略控制数据访问

**替代方案不被采纳的原因**:
- **自定义users表 + 自定义JWT**: 需要自己实现所有认证逻辑，增加开发复杂度和安全风险，无法使用Supabase的RLS策略
- **混合方案（Supabase Auth + user_profiles扩展表）**: 数据分散在两个表，查询需要JOIN，初期架构复杂度较高

### 2. 微信登录流程适配Supabase Auth

**决策**: 使用Supabase Auth的匿名登录或自定义Provider方式，将微信openid作为唯一标识

**技术方案**:

**方案A（推荐）: 使用Supabase Auth的Admin API创建用户**
```java
// 后端实现
public LoginResponse wechatLogin(String code) {
    // 1. 调用微信code2Session获取openid
    WechatSessionResponse session = wechatApiClient.code2Session(code);
    String openid = session.getOpenid();

    // 2. 通过openid查找用户（在user_metadata中搜索）
    User existingUser = supabaseAuthClient.getUserByMetadata("openid", openid);

    if (existingUser == null) {
        // 3. 创建新用户（使用Admin API）
        User newUser = supabaseAuthClient.adminCreateUser(
            Map.of(
                "user_metadata", Map.of(
                    "openid", openid,
                    "provider", "wechat"
                )
            )
        );
    }

    // 4. 签发JWT令牌（使用Supabase Auth的signInWithPassword或自定义方法）
    AuthResponse authResponse = supabaseAuthClient.generateAuthTokens(existingUser.getId());

    // 5. 返回令牌
    return new LoginResponse(
        authResponse.getAccessToken(),
        authResponse.getRefreshToken(),
        existingUser
    );
}
```

**方案B（备选）: 使用唯一邮箱模拟（openid@wechat.local）**
```java
// 为每个openid生成唯一邮箱
String email = openid + "@wechat.local";
String password = generateSecurePassword(openid); // 服务端生成随机密码

// 使用Supabase Auth的signUp
AuthResponse = supabaseAuthClient.signUp(email, password, Map.of(
    "user_metadata", Map.of(
        "openid", openid,
        "provider", "wechat"
    )
));
```

**最终选择**: 方案A（Admin API），因为更符合Supabase Auth的设计理念，避免生成虚假邮箱

### 3. JWT令牌管理：使用Supabase Auth内置机制

**决策**: 完全使用Supabase Auth的JWT签发和刷新机制，不自定义JWT逻辑

**Supabase Auth JWT特性**:
- **Access Token**: 默认有效期1小时，可配置延长至7天
- **Refresh Token**: 默认有效期30天
- **自动刷新**: Supabase Auth SDK提供`refreshSession()`方法，自动使用Refresh Token获取新Access Token
- **Token格式**: 标准JWT（Header.Payload.Signature），使用HS256算法签名
- **Payload内容**: 包含user_id、email、user_metadata等字段

**后端实现**:
```java
// 令牌刷新接口
@PostMapping("/api/auth/refresh-token")
public ResponseEntity<RefreshTokenResponse> refreshToken(@RequestBody RefreshTokenRequest request) {
    // 调用Supabase Auth SDK刷新令牌
    AuthResponse authResponse = supabaseAuthClient.refreshSession(request.getRefreshToken());

    return ResponseEntity.ok(new RefreshTokenResponse(
        authResponse.getAccessToken(),
        authResponse.getExpiresIn()
    ));
}
```

**C端实现（Taro）**:
```typescript
// 自动检测令牌过期并刷新
const checkTokenExpiry = async () => {
  const token = Taro.getStorageSync('access_token');
  const decodedToken = jwt_decode(token); // 解析JWT
  const expiryTime = decodedToken.exp * 1000; // 转换为毫秒
  const now = Date.now();

  // 距离过期仅剩1天时刷新
  if (expiryTime - now < 24 * 60 * 60 * 1000) {
    await authService.refreshToken();
  }
};
```

### 4. C端Taro框架集成

**决策**: 使用Taro 3.x框架开发小程序，Zustand管理本地状态，Taro.setStorage持久化令牌

**技术栈**:
- Taro 3.x + React + TypeScript
- Zustand 5.x（本地状态管理）
- Taro.request（API请求封装，自动携带Token）
- Taro.setStorage/getStorage（本地存储）

**登录流程**:
```typescript
// authService.ts
export const silentLogin = async () => {
  // 1. 调用wx.login获取code
  const { code } = await Taro.login();

  // 2. 调用后端登录接口
  const response = await Taro.request({
    url: `${API_BASE_URL}/api/auth/wechat-login`,
    method: 'POST',
    data: { code }
  });

  // 3. 存储令牌
  Taro.setStorageSync('access_token', response.data.accessToken);
  Taro.setStorageSync('refresh_token', response.data.refreshToken);
  Taro.setStorageSync('user_info', response.data.user);

  // 4. 更新Zustand状态
  useUserStore.getState().setUser(response.data.user);
  useUserStore.getState().setLoggedIn(true);
};
```

**路由守卫**:
```typescript
// withAuth HOC
export const withAuth = (Component) => {
  return (props) => {
    const isLoggedIn = useUserStore(state => state.isLoggedIn);
    const [showLoginModal, setShowLoginModal] = useState(false);

    useEffect(() => {
      if (!isLoggedIn) {
        setShowLoginModal(true);
      }
    }, [isLoggedIn]);

    if (!isLoggedIn) {
      return <LoginModal visible={showLoginModal} />;
    }

    return <Component {...props} />;
  };
};
```

### 5. 存储策略

**决策**: 分层存储策略

**用户身份认证数据**（Supabase Auth）:
- 存储位置: Supabase Auth的auth.users表
- 字段: id（UUID）、email（可选）、created_at、updated_at
- user_metadata: `{ "openid": "xxx", "nickname": "张三", "avatarUrl": "https://...", "phone": "138..." }`
- app_metadata: 预留用于存储应用级别的元数据（如角色、权限）

**业务数据**（Supabase PostgreSQL）:
- 预约订单表: `reservations` (字段user_id关联auth.uid())
- RLS策略: `auth.uid() = user_id` 确保用户只能访问自己的数据

**C端本地存储**（Taro.setStorage）:
- `access_token`: Supabase Auth签发的访问令牌
- `refresh_token`: Supabase Auth签发的刷新令牌
- `user_info`: 用户基本信息缓存（从user_metadata读取）

## 技术选型总结

| 技术选项 | 选择方案 | 理由 |
|---------|---------|------|
| 用户身份管理 | Supabase Auth (auth.users + user_metadata) | 安全、标准化、减少代码、支持RLS |
| 微信登录适配 | Admin API创建用户 | 符合Supabase Auth设计理念 |
| JWT令牌管理 | Supabase Auth内置机制 | 自动签发和刷新，无需自定义逻辑 |
| C端框架 | Taro 3.x + React + TypeScript | 多端统一开发，符合宪法要求 |
| 本地状态管理 | Zustand 5.x | 轻量级、易用、符合宪法要求 |
| 本地存储 | Taro.setStorage API | Taro统一API，跨端兼容 |

## 风险与缓解措施

| 风险 | 影响 | 缓解措施 |
|-----|------|---------|
| Supabase Auth不支持微信Provider | 无法直接集成 | 使用Admin API自定义创建用户，在user_metadata中存储openid |
| JWT令牌过期导致用户被踢出 | 用户体验差 | 实现自动刷新机制（距离过期1天时刷新），C端监听401错误自动刷新 |
| session_key过期导致手机号解密失败 | 无法获取手机号 | 提示用户重新授权，重新调用wx.login |
| 微信API调用失败（网络异常） | 登录失败 | 重试1次，失败则提示用户"网络异常，请重试" |
| Supabase Auth与Spring Boot集成复杂 | 开发周期延长 | 使用Supabase Java Client官方SDK，参考文档示例 |

## 参考文档

- [Supabase Auth文档](https://supabase.com/docs/guides/auth)
- [Supabase Java Client](https://github.com/supabase-community/supabase-java)
- [微信小程序登录文档](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/login.html)
- [Taro框架文档](https://taro-docs.jd.com/docs/)
- [Zustand状态管理](https://github.com/pmndrs/zustand)

## 下一步

Phase 1设计阶段需要生成：
1. **data-model.md**: Supabase Auth user_metadata结构定义
2. **contracts/api.yaml**: API契约（登录、刷新令牌、用户资料更新）
3. **quickstart.md**: 开发环境配置指南
4. **postman/**: Postman测试集合
