# Tasks: 微信小程序登录功能

**Branch**: `U003-wechat-miniapp-login` | **Date**: 2025-12-24 | **Spec**: [spec.md](./spec.md)

**重要**: 本任务列表基于 **Supabase Auth 架构**，使用 auth.users 表 + user_metadata 存储用户信息，不创建自定义 users 表。

---

## Phase 1: Setup (后端基础设施 + Supabase Auth 配置)

### 1.1 Supabase 环境配置

- [ ] T001 在 Supabase Dashboard 启用 Auth 功能并配置 JWT 设置（Access Token 7天，Refresh Token 30天）
- [ ] T002 创建 user_metadata 的 GIN 索引支持 openid 查询 `CREATE INDEX idx_users_metadata_openid ON auth.users USING GIN ((raw_user_meta_data->'openid'))`
- [ ] T003 配置 Supabase RLS 策略允许用户读取和更新自己的 user_metadata

### 1.2 后端依赖配置

- [ ] T004 [P] 添加 Supabase Java Client 依赖到 pom.xml `com.supabase:supabase-java`
- [ ] T005 [P] 添加微信 API HTTP 客户端依赖到 pom.xml（如 OkHttp 或 Spring RestTemplate）
- [ ] T006 [P] 添加 JWT 工具库依赖到 pom.xml `io.jsonwebtoken:jjwt-api`（用于解析Supabase Auth签发的JWT）

### 1.3 配置类

- [ ] T007 创建 SupabaseAuthConfig 配置类 `backend/src/main/java/com/cinema/config/SupabaseAuthConfig.java`（配置 Supabase URL 和 API Key）
- [ ] T008 创建 WechatProperties 配置类 `backend/src/main/java/com/cinema/config/WechatProperties.java`（从环境变量读取 AppID 和 AppSecret）
- [ ] T009 更新 application.yml 添加 Supabase 和微信配置（确保 AppSecret 从环境变量读取）

**Checkpoint**: 后端依赖完整，Supabase 连接配置正确，环境变量已设置

---

## Phase 2: Foundational (后端核心服务)

### 2.1 外部客户端

- [ ] T010 创建 SupabaseAuthClient `backend/src/main/java/com/cinema/client/SupabaseAuthClient.java`（封装 Supabase Auth SDK 调用：adminCreateUser, getUserByMetadata, generateAuthTokens, refreshSession）
- [ ] T011 创建 WechatApiClient `backend/src/main/java/com/cinema/client/WechatApiClient.java`（封装微信 code2Session API 调用）

### 2.2 DTO 定义

- [ ] T012 [P] 创建 LoginRequest DTO `backend/src/main/java/com/cinema/auth/dto/LoginRequest.java`（字段：code）
- [ ] T013 [P] 创建 LoginResponse DTO `backend/src/main/java/com/cinema/auth/dto/LoginResponse.java`（字段：accessToken, refreshToken, expiresIn, user）
- [ ] T014 [P] 创建 RefreshTokenRequest DTO `backend/src/main/java/com/cinema/auth/dto/RefreshTokenRequest.java`（字段：refreshToken）
- [ ] T015 [P] 创建 UserProfileDto DTO `backend/src/main/java/com/cinema/user/dto/UserProfileDto.java`（字段：nickname, avatarUrl, phone）

### 2.3 领域模型

- [ ] T016 创建 User 实体类 `backend/src/main/java/com/cinema/model/User.java`（映射 Supabase Auth 的 auth.users + user_metadata 结构）

### 2.4 异常处理

- [ ] T017 [P] 创建 AuthException `backend/src/main/java/com/cinema/exception/AuthException.java`（认证相关异常）
- [ ] T018 [P] 创建 ApiException `backend/src/main/java/com/cinema/exception/ApiException.java`（通用 API 异常）

**Checkpoint**: 后端基础服务类已创建，DTO 和异常类定义完整

---

## Phase 3: User Story 1 - 静默自动登录获取用户身份 (P1)

**Story Goal**: 用户打开小程序时，系统自动在后台完成登录流程，无需手动操作，获得登录态并存储令牌。

**Independent Test**: 打开小程序并检查本地存储中是否成功获取 access_token，调用受保护的 API 返回 200 而非 401。

### 3.1 后端服务层（US1）

- [ ] T019 [US1] 创建 AuthService `backend/src/main/java/com/cinema/auth/service/AuthService.java`
  - 实现 wechatLogin(String code) 方法：调用 WechatApiClient.code2Session → 通过 openid 查找用户（SupabaseAuthClient.getUserByMetadata） → 如不存在则创建用户（SupabaseAuthClient.adminCreateUser，将 openid 存储在 user_metadata） → 调用 SupabaseAuthClient.generateAuthTokens 签发 JWT → 返回 LoginResponse
  - 实现重试逻辑（微信 API 调用失败重试 1 次）

### 3.2 后端控制器（US1）

- [ ] T020 [US1] 创建 AuthController `backend/src/main/java/com/cinema/auth/controller/AuthController.java`
  - POST /api/auth/wechat-login 接口（调用 AuthService.wechatLogin）
  - 异常处理：捕获 AuthException 返回 400，捕获 Exception 返回 500

### 3.3 C端类型定义（US1）

- [ ] T021 [P] [US1] 创建用户类型定义 `hall-reserve-taro/src/types/user.ts`（User 接口：id, openid, nickname, avatarUrl, phone）
- [ ] T022 [P] [US1] 创建认证类型定义 `hall-reserve-taro/src/types/auth.ts`（LoginResponse, Token 等）

### 3.4 C端存储工具（US1）

- [ ] T023 [US1] 创建 storage 工具 `hall-reserve-taro/src/utils/storage.ts`
  - 封装 Taro.setStorageSync/getStorageSync
  - 提供 setToken, getToken, removeToken, setUser, getUser, clearAuth 方法

### 3.5 C端服务层（US1）

- [ ] T024 [US1] 创建 authService `hall-reserve-taro/src/services/authService.ts`
  - 实现 silentLogin() 方法：调用 Taro.login 获取 code → 调用后端 POST /api/auth/wechat-login → 存储令牌和用户信息到本地（调用 storage.setToken, storage.setUser）
  - 实现错误处理（网络异常提示）

### 3.6 C端状态管理（US1）

- [ ] T025 [US1] 创建 userStore `hall-reserve-taro/src/stores/userStore.ts`
  - 使用 Zustand 管理用户状态：user, isLoggedIn, redirectPath
  - 提供 setUser, setLoggedIn, setRedirectPath, clearUser 方法

### 3.7 C端自动登录（US1）

- [ ] T026 [US1] 更新 app.tsx 在 componentDidMount 中调用 authService.silentLogin()

### 3.8 后端 API 测试（US1）

- [ ] T027 [US1] 创建 Postman Collection `specs/U003-wechat-miniapp-login/postman/U003-wechat-miniapp-login.postman_collection.json`（包含登录接口测试）

**Story 1 Checkpoint**: 小程序启动时自动完成静默登录，Token 正确存储到本地，后端返回 Supabase Auth 签发的 JWT

---

## Phase 4: User Story 2 - 登录态持久化与自动刷新 (P1)

**Story Goal**: 用户关闭小程序再次打开时保持登录态，访问令牌即将过期时自动刷新，刷新失败时清除登录态。

**Independent Test**: 关闭小程序重新打开，检查令牌仍存在且有效；模拟令牌过期，系统自动调用刷新接口获取新令牌。

### 4.1 后端令牌刷新（US2）

- [ ] T028 [US2] 在 AuthService 中实现 refreshToken(String refreshToken) 方法（调用 SupabaseAuthClient.refreshSession 刷新令牌）
- [ ] T029 [US2] 在 AuthController 中添加 POST /api/auth/refresh-token 接口（调用 AuthService.refreshToken）

### 4.2 C端令牌刷新（US2）

- [ ] T030 [US2] 在 authService.ts 中实现 refreshToken() 方法（调用后端 POST /api/auth/refresh-token → 更新本地 access_token）
- [ ] T031 [US2] 在 authService.ts 中实现 checkTokenExpiry() 方法（解析 JWT 的 exp 字段，距离过期仅剩 1 天时调用 refreshToken）

### 4.3 C端请求拦截（US2）

- [ ] T032 [US2] 创建 request.ts 封装 `hall-reserve-taro/src/utils/request.ts`
  - Taro.request 拦截器：自动添加 Authorization 请求头（Bearer {access_token}）
  - 响应拦截器：检测 401 错误 → 调用 authService.refreshToken → 刷新成功后重新发起原请求 → 刷新失败则清除登录态并提示

### 4.4 C端退出登录（US2）

- [ ] T033 [US2] 在 authService.ts 中实现 logout() 方法（调用 storage.clearAuth 清除所有令牌和用户信息 → 更新 userStore → 跳转首页）

### 4.5 C端启动检查（US2）

- [ ] T034 [US2] 更新 app.tsx 启动逻辑：先检查本地是否有有效令牌（getToken + checkTokenExpiry） → 如有效则直接恢复登录态 → 如无效或不存在则调用 silentLogin

**Story 2 Checkpoint**: 关闭小程序重新打开，登录态持续有效；令牌即将过期时自动刷新；刷新失败时清除登录态

---

## Phase 5: User Story 3 - 受保护页面的登录拦截与跳转 (P2)

**Story Goal**: 未登录用户访问受保护页面时，系统拦截并显示登录提示，登录成功后自动跳转回原页面。

**Independent Test**: 未登录状态下点击"我的预约"，弹出登录提示；登录后自动跳转回"我的预约"页面。

### 5.1 登录弹窗组件（US3）

- [ ] T035 [US3] 创建 LoginModal 组件 `hall-reserve-taro/src/components/LoginModal/index.tsx`
  - 显示登录提示："请先登录后再进行操作"
  - 提供"去登录"和"取消"按钮
  - 点击"去登录"调用 authService.silentLogin → 登录成功后触发回调

### 5.2 路由守卫 Hook（US3）

- [ ] T036 [US3] 创建 useAuth Hook `hall-reserve-taro/src/hooks/useAuth.ts`
  - 检查 userStore.isLoggedIn
  - 如未登录则记录当前页面路径到 userStore.redirectPath
  - 返回 isLoggedIn 状态

### 5.3 高阶组件（US3）

- [ ] T037 [US3] 创建 withAuth HOC `hall-reserve-taro/src/components/withAuth/index.tsx`
  - 包装受保护页面组件
  - 使用 useAuth Hook 检查登录态
  - 未登录时显示 LoginModal → 登录成功后跳转到 redirectPath

### 5.4 页面更新（US3）

- [ ] T038 [P] [US3] 更新"我的预约"页面添加 withAuth 包装
- [ ] T039 [P] [US3] 更新预约表单页面添加 withAuth 包装
- [ ] T040 [P] [US3] 更新详情页"立即预约"按钮添加登录检查（点击时检查 isLoggedIn，未登录则弹出 LoginModal）

**Story 3 Checkpoint**: 未登录访问受保护页面时弹出登录提示，登录后自动跳转回原页面

---

## Phase 6: User Story 4 - 完善用户资料（头像昵称手机号） (P3)

**Story Goal**: 用户可以设置头像、昵称、手机号，更新后同步到 Supabase Auth 的 user_metadata。

**Independent Test**: 用户输入昵称并保存，检查 Supabase Auth 中 user_metadata 的 nickname 字段已更新。

### 6.1 后端用户资料更新（US4）

- [ ] T041 [US4] 创建 UserService `backend/src/main/java/com/cinema/user/service/UserService.java`
  - 实现 updateProfile(String userId, UserProfileDto dto) 方法（调用 SupabaseAuthClient.updateUser 更新 user_metadata）
- [ ] T042 [US4] 在 AuthController 或创建 UserController 添加 PUT /api/users/profile 接口（调用 UserService.updateProfile）

### 6.2 后端手机号解密（US4）

- [ ] T043 [US4] 在 AuthService 中实现 decryptPhone(String encryptedData, String iv, String sessionKey) 方法（使用 session_key 解密微信加密数据）
- [ ] T044 [US4] 在 AuthController 中添加 POST /api/auth/decrypt-phone 接口（调用 AuthService.decryptPhone）

### 6.3 C端用户资料页面（US4）

- [ ] T045 [US4] 创建 userService `hall-reserve-taro/src/services/userService.ts`
  - 实现 getProfile() 方法（调用后端 GET /api/users/profile）
  - 实现 updateProfile(data) 方法（调用后端 PUT /api/users/profile）
- [ ] T046 [US4] 更新 profile 页面 `hall-reserve-taro/src/pages/profile/index.tsx`
  - 显示用户头像、昵称、手机号
  - 提供头像选择器（使用微信 chooseAvatar 组件）
  - 提供昵称输入框（使用 input type="nickname"）
  - 提供手机号获取按钮（使用 button open-type="getPhoneNumber"）

**Story 4 Checkpoint**: 用户可以完善头像、昵称、手机号，数据正确同步到 Supabase Auth user_metadata

---

## Phase 7: 集成测试与验收

### 7.1 后端集成测试

- [ ] T047 创建 AuthService 集成测试 `backend/src/test/java/com/cinema/auth/AuthServiceIntegrationTest.java`（测试完整登录流程：code2Session → 用户创建 → JWT 签发）
- [ ] T048 创建 AuthController API 测试 `backend/src/test/java/com/cinema/auth/AuthControllerTest.java`（测试所有认证接口）

### 7.2 C端真机测试

- [ ] T049 小程序真机测试 - 静默登录（验证 User Story 1 的 5 个验收场景）
- [ ] T050 小程序真机测试 - 登录态持久化（验证 User Story 2 的 5 个验收场景）
- [ ] T051 小程序真机测试 - 路由守卫（验证 User Story 3 的 5 个验收场景）
- [ ] T052 小程序真机测试 - 用户资料（验证 User Story 4 的 5 个验收场景）

### 7.3 安全审计

- [ ] T053 验证微信 AppSecret 仅存储在后端环境变量（检查 application.yml 和代码）
- [ ] T054 验证 Supabase Auth JWT 签名算法和密钥长度（≥256 位）
- [ ] T055 验证所有 API 通信使用 HTTPS
- [ ] T056 验证 session_key 不持久化到数据库（仅临时存储在内存或 Redis）

### 7.4 性能测试

- [ ] T057 测试静默登录耗时（目标 ≤2 秒，包含微信 API 调用）
- [ ] T058 测试 Token 验证耗时（目标 ≤50ms）
- [ ] T059 测试 Token 刷新耗时（目标 ≤500ms）

**Final Checkpoint**: 所有 User Story 验收场景通过，安全和性能指标达标

---

## 执行顺序与依赖

```
Phase 1 (T001-T009) → Phase 2 (T010-T018) → Phase 3 (T019-T027, US1) → Phase 4 (T028-T034, US2) → Phase 5 (T035-T040, US3) → Phase 6 (T041-T046, US4) → Phase 7 (T047-T059, 集成测试)
```

**关键依赖**:
- US1 必须完成才能进行 US2（US2 依赖 US1 的登录功能）
- US2 必须完成才能进行 US3（US3 依赖 US2 的登录态管理）
- US4 可与 US3 并行（US4 仅依赖 US1 的登录功能）

**并行机会**:
- Phase 1 内：T004, T005, T006 可并行（不同依赖）
- Phase 2 内：T012-T015 可并行（DTO 定义），T017-T018 可并行（异常类）
- Phase 3 内：T021, T022 可并行（类型定义）
- Phase 5 内：T038, T039, T040 可并行（页面更新）

---

## 实施策略

**MVP 范围**（最小可行产品）:
- **User Story 1** (静默登录) - 必须完成
- **User Story 2** (登录态管理) - 必须完成
- **User Story 3** (路由守卫) - 推荐完成（提升用户体验）
- **User Story 4** (用户资料) - 可延后（非核心功能）

**增量交付顺序**:
1. **Sprint 1**: Phase 1 + Phase 2 + Phase 3 (US1) - 实现静默登录
2. **Sprint 2**: Phase 4 (US2) - 实现登录态持久化和刷新
3. **Sprint 3**: Phase 5 (US3) - 实现路由守卫
4. **Sprint 4**: Phase 6 (US4) - 实现用户资料完善（可选）
5. **Sprint 5**: Phase 7 - 集成测试和验收

---

## 当前进度

**Status**: Phase 1 - 准备开始
**Last Updated**: 2025-12-24
**Architecture**: Supabase Auth (auth.users + user_metadata)，不创建自定义 users 表
