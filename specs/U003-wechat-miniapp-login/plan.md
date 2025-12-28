# Implementation Plan: 微信小程序登录功能

**Branch**: `U003-wechat-miniapp-login` | **Date**: 2025-12-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/U003-wechat-miniapp-login/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

实现影院小程序的微信登录功能，包括静默自动登录获取用户身份、JWT令牌签发与管理、登录态持久化、受保护页面路由守卫，以及用户资料完善（头像昵称手机号）。用户打开小程序时无感知地完成登录，无需手动操作即可使用需要身份认证的功能。

**核心技术方案**：
- 后端: Spring Boot 3.x + Supabase Auth（管理用户身份认证）+ Supabase PostgreSQL（业务数据）
- C端: Taro 3.x + React + TypeScript + Zustand（本地状态）+ Taro.setStorage API（持久化）
- 认证流程: 静默登录(wx.login) → 微信code2Session获取openid → Supabase Auth创建/登录用户（openid存储在user_metadata） → 返回Supabase Auth签发的JWT令牌 → 本地存储
- 登录态管理: 令牌存储、自动刷新（使用Supabase Auth刷新机制）、过期处理、退出登录
- 路由守卫: 页面权限分类、未登录拦截、登录后回调跳转

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**:
- 后端: Java 21 + Spring Boot 3.x
- C端: TypeScript 5.9.3 + React + Taro 3.x

**Primary Dependencies**:
- 后端: Spring Boot Web, Spring Security, Supabase Java Client (用于Auth + PostgreSQL访问), io.jsonwebtoken:jjwt-api (JWT处理), HTTP Client (调用微信API)
- C端: @tarojs/taro, @tarojs/components, @tarojs/plugin-platform-weapp, SCSS/CSS Modules, Zustand 5.x (本地状态管理), TanStack Query (可选，用于服务器状态管理)

**Storage**: Supabase Auth (auth.users表管理用户身份，user_metadata存储openid/nickname/avatarUrl/phone) + Supabase PostgreSQL (业务数据如预约订单)

**Testing**:
- 后端: JUnit 5 (单元测试) + Spring Boot Test (集成测试) + Postman Collection (API测试)
- C端: 微信开发者工具真机预览 + H5浏览器测试

**Target Platform**:
- 后端: Web服务器（Spring Boot应用）
- C端: 微信小程序 + H5 (Taro跨端编译)

**Project Type**:
- 全栈应用（Spring Boot后端 + Taro C端小程序），包含后端认证服务集成Supabase Auth和C端用户认证管理

**Performance Goals**:
- 后端: 静默登录≤2秒（包含微信API调用），Token验证≤50ms，Token刷新≤500ms
- C端: 首屏渲染<1.5秒，主包大小<2MB，列表滚动FPS≥50

**Constraints**:
- 必须遵循功能分支绑定（Feature Branch Binding）: U003-wechat-miniapp-login
- 必须遵循测试驱动开发（Test-Driven Development）: 关键业务流程需先编写测试用例
- 必须遵循C端技术栈规范: 所有C端功能必须使用Taro框架开发
- 必须遵循数据驱动状态管理: 使用Zustand管理本地状态，TanStack Query管理服务器状态
- 必须遵循后端架构约束: 使用Spring Boot + Supabase统一后端，**必须使用Supabase Auth管理用户身份认证**
- 微信AppSecret必须保密: 仅存储在后端环境变量，不暴露给前端

**Scale/Scope**:
- 后端: Supabase Auth用户管理、登录认证接口（POST /api/auth/wechat-login, POST /api/auth/refresh-token）、手机号解密接口（POST /api/auth/decrypt-phone）、用户资料更新接口（PUT /api/users/profile）
- C端: 登录服务（authService）、路由守卫（routeGuard）、状态管理（userStore）、登录拦截组件（LoginModal）、用户资料页（profile）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支`U003-wechat-miniapp-login`与spec路径一致，符合U模块编号规范 ✅
- [x] **测试驱动开发**: 需编写静默登录、登录态管理、路由守卫等关键流程的测试用例，确保测试覆盖率100% ✅
- [x] **组件化架构**: C端使用Taro框架组件化开发，遵循原子设计理念，状态管理使用Zustand ✅
- [x] **前端技术栈分层**: 本功能涉及后端（Spring Boot + Supabase Auth）和C端（Taro），符合前后端分离架构 ✅
- [x] **数据驱动状态管理**: 使用Zustand管理本地状态（登录态、用户信息），符合状态管理规范 ✅
- [x] **后端技术栈约束**: 后端使用Spring Boot + Supabase Auth统一架构，**Supabase Auth管理用户身份认证（auth.users + user_metadata）** ✅
- [x] **代码质量工程化**: 需进行TypeScript类型检查、ESLint/Prettier格式化，遵循Conventional Commits提交规范 ✅

### 性能与标准检查：

- [x] **性能标准**: 静默登录≤2秒，Token验证≤50ms，Token刷新≤500ms，首屏渲染<1.5秒，滚动FPS≥50 ✅
- [x] **安全标准**: 微信AppSecret仅存储后端环境变量，JWT使用HS256算法且密钥≥256位（由Supabase Auth管理），HTTPS通信，code防重放 ✅
- [x] **可访问性标准**: 遵循WCAG 2.1 AA级别，支持键盘导航和屏幕阅读器 ✅

**GATE STATUS**: ✅ PASSED - All applicable constitution principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
hall-reserve-taro/
├── src/
│   ├── components/          # Reusable UI components (Atomic Design)
│   │   ├── atoms/          # Basic UI elements (Button, Input, etc.)
│   │   ├── molecules/      # Component combinations (LoginForm, ProfileCard, etc.)
│   │   ├── organisms/      # Complex components (UserProfile, LoginModal, etc.)
│   │   └── templates/      # Layout templates (PageLayout, etc.)
│   ├── pages/              # Page components (route-level)
│   │   ├── index/          # 首页（公开页面）
│   │   ├── my-reservations/ # 我的预约（受保护页面）
│   │   ├── profile/        # 用户资料（受保护页面）
│   │   └── [login-redirect] # 登录后回调页面
│   ├── services/           # API services
│   │   ├── authService.ts  # 登录认证服务（静默登录、刷新令牌、退出登录）
│   │   └── userService.ts   # 用户资料服务
│   ├── stores/             # Zustand stores
│   │   ├── userStore.ts     # 用户本地状态（登录态、用户信息、跳转前路径）
│   │   └── authStore.ts     # 认证状态（可选，用于服务器状态管理）
│   ├── utils/              # Utility functions
│   │   ├── request.ts       # Taro.request API封装
│   │   └── storage.ts       # Taro.setStorage/getStorage封装
│   ├── types/              # TypeScript types
│   │   ├── user.ts         # 用户类型定义
│   │   └── auth.ts         # 认证类型定义
│   └── config/             # 配置文件
├── project.config.json       # 微信小程序项目配置
└── package.json            # 依赖配置

backend/
├── src/main/java/com/cinema/
│   ├── controller/        # API控制器
│   │   └── AuthController.java  # 认证接口（登录、刷新令牌、解密手机号）
│   ├── service/           # 业务逻辑层
│   │   ├── AuthService.java    # 认证服务（Supabase Auth集成、JWT管理）
│   │   └── UserService.java    # 用户服务（资料更新）
│   ├── dto/               # 数据传输对象
│   │   ├── LoginRequest.java   # 登录请求DTO
│   │   ├── LoginResponse.java  # 登录响应DTO
│   │   └── UserProfileDto.java # 用户资料DTO
│   ├── model/             # 领域模型
│   │   └── User.java         # 用户实体（映射auth.users + user_metadata）
│   ├── config/            # 配置类
│   │   ├── SupabaseAuthConfig.java  # Supabase Auth配置
│   │   └── WechatProperties.java # 微信配置（AppID、AppSecret）
│   ├── exception/          # 异常处理
│   │   ├── AuthException.java  # 认证异常
│   │   └── ApiException.java   # API通用异常
│   ├── security/           # 安全配置
│   │   └── SecurityConfig.java  # Spring Security配置（JWT过滤器）
│   └── client/             # 外部客户端
│       ├── SupabaseAuthClient.java # Supabase Auth客户端
│       └── WechatApiClient.java    # 微信API客户端

tests/
├── unit/               # 单元测试（JUnit 5）
├── integration/          # 集成测试
└── e2e/                # E2E测试（Playwright）

specs/                      # Feature specifications
├── U003-wechat-miniapp-login/
│   ├── spec.md           # Feature specification
│   ├── plan.md           # Implementation plan (this file)
│   ├── research.md       # Research findings
│   ├── data-model.md     # Data model design
│   ├── quickstart.md     # Development quickstart
│   ├── contracts/        # API contracts
│   │   └── api.yaml      # OpenAPI 3.0 specification
│   ├── postman/          # Postman test collection
│   │   └── U003-wechat-miniapp-login.postman_collection.json
│   └── tasks.md        # Development tasks
```

**Structure Decision**: 全栈应用（Spring Boot后端 + Taro C端小程序），包含后端认证服务集成Supabase Auth和C端用户认证管理。后端使用Spring Boot统一业务逻辑，通过Supabase Auth管理用户身份认证（auth.users + user_metadata存储微信openid等字段）；C端使用Taro框架实现多端一致的用户体验。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------| |
| N/A | No violations | All constitution principles satisfied |

---

## Phase 0: Research ✅ COMPLETED (2025-12-24)

**Key Decisions**:
1. **后端认证架构**: 使用Spring Boot 3.x + Supabase Auth集成用户身份认证，**不创建自定义users表**，而是使用Supabase Auth的auth.users表，将微信openid存储在user_metadata中
2. **微信登录流程**: 采用静默登录策略，小程序启动时调用wx.login获取code，后端通过微信code2Session API换取openid和session_key，调用Supabase Auth SDK创建/登录用户（将openid存储在user_metadata），返回Supabase Auth签发的JWT令牌
3. **令牌管理**: 使用Supabase Auth的内置令牌机制（Access Token + Refresh Token），利用Supabase Auth SDK的令牌刷新方法，不自定义JWT签发逻辑
4. **C端技术选型**: 使用Taro 3.x框架开发小程序，确保微信小程序和H5端一致的用户体验，使用Zustand管理本地登录态
5. **存储策略**: 用户身份认证数据存储在Supabase Auth的auth.users表中，业务数据（如预约订单）存储在Supabase PostgreSQL中，通过auth.uid()关联用户，前端使用Taro.setStorage进行本地存储

**Output**: [research.md](./research.md) - 已基于需求和Supabase Auth最佳实践完成技术研究

---

## Phase 1: Design ✅ IN PROGRESS (2025-12-24)

**Key Artifacts**:
- **data-model.md**: 设计Supabase Auth集成方案（auth.users + user_metadata结构，字段定义）
- **contracts/api.yaml**: 生成OpenAPI 3.0规范API契约（登录、刷新令牌、用户资料更新）
- **quickstart.md**: 生成开发快速入门指南（环境配置、Supabase Auth设置、项目结构、开发流程）
- **postman/**: 创建Postman测试集合（U003-wechat-miniapp-login.postman_collection.json）

**Key Design Decisions**:
1. **数据模型**: 使用Supabase Auth的auth.users表管理用户，user_metadata存储微信openid、nickname、avatarUrl、phone等字段，不创建自定义users表
2. **API设计**: RESTful API规范，统一响应格式（success/data/timestamp），POST /api/auth/wechat-login用于静默登录（集成Supabase Auth），POST /api/auth/refresh-token用于令牌刷新（调用Supabase Auth SDK）
3. **JWT配置**: 使用Supabase Auth签发的JWT令牌，不自定义JWT签发逻辑，后端通过Supabase Auth SDK验证令牌
4. **C端状态管理**: 使用Zustand管理userStore（本地登录态、用户信息），可选使用TanStack Query管理服务器状态

**Output Files** (待生成):
- [data-model.md](./data-model.md) - Supabase Auth集成方案和数据结构
- [contracts/api.yaml](./contracts/api.yaml) - 完整API契约定义
- [quickstart.md](./quickstart.md) - 环境配置和开发步骤
- [postman/U003-wechat-miniapp-login.postman_collection.json](./postman/U003-wechat-miniapp-login.postman_collection.json) - Postman测试集合

**Agent Context**: 需更新CLAUDE.md，添加Supabase Auth、Taro等技术栈信息

---

## Phase 2: 任务生成 (待执行)

**说明**: Phase 2任务通过`/speckit.tasks`命令生成，本plan阶段不创建tasks.md文件。

**执行**: 运行 `/speckit.tasks` 生成可执行的任务列表。

**PLANNING STATUS**: ⚠️ PHASE 1 IN PROGRESS (need to generate artifacts, then run `/speckit.tasks`)
