# Implementation Plan: 场景包小程序首页活动 API 集成

**Branch**: `018-hall-reserve-homepage` | **Date**: 2025-12-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/018-hall-reserve-homepage/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

实现 hall-reserve-taro 小程序首页的场景包列表数据从后端 API 加载，替换现有的硬编码 Mock 数据。小程序调用 `GET /api/scenario-packages` 端点获取已发布状态的场景包列表摘要（包含 id、title、category、backgroundImageUrl、packagePrice、rating、tags），并通过 TanStack Query 实现 5 分钟缓存策略。技术栈：Taro 3.x + React + TypeScript，后端为 Spring Boot + Supabase。核心目标是确保用户在首页看到真实的场景包数据，支持网络错误处理和降级方案。

## Technical Context

**Language/Version**:
- C端（小程序）: TypeScript + Taro 3.x + React
- 后端: Java 21 + Spring Boot 3.x

**Primary Dependencies**:
- 小程序前端: Taro 3.x, TanStack Query (React Query), Zod 4.1.13（数据验证）, Taro.request（网络请求封装）
- 后端: Spring Boot Web, Supabase Java SDK（数据库访问）

**Storage**:
- 后端数据源: Supabase PostgreSQL（存储场景包数据）
- 前端缓存: TanStack Query 内存缓存（5分钟TTL）

**Testing**:
- 前端: 微信开发者工具 Network 面板验证 API 调用，H5 浏览器测试
- 后端: Spring Boot 集成测试（验证 API 端点和 Supabase 查询）

**Target Platform**:
- 微信小程序（主要）+ H5（次要），使用 Taro 框架确保跨端兼容

**Project Type**:
- C端多端应用（Taro 框架）- 小程序首页 API 集成功能

**Performance Goals**:
- 首屏加载时间 <2 秒（正常网络环境）
- 缓存命中时页面加载 <500 毫秒
- 弱网环境（3G）下 5 秒内完成或超时提示

**Constraints**:
- 必须使用 Taro 框架（C端技术栈要求）
- 必须使用 Spring Boot + Supabase 后端架构
- API 必须服务端过滤（仅返回 PUBLISHED 状态）
- 需要与 017-scenario-package 后端数据模型对齐

**Scale/Scope**:
- 单一功能：小程序首页场景包列表 API 集成
- 预计场景包数量：< 100 个（初期）
- 并发用户：小程序端用户量级

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: ✅ 当前分支 `018-hall-reserve-homepage`，specId 为 `018`，符合分支绑定要求
- [x] **测试驱动开发**: ✅ 通过微信开发者工具 Network 面板和 H5 浏览器验证 API 调用，后端需编写集成测试
- [x] **组件化架构**: ✅ 小程序使用 Taro 组件化开发，复用现有首页组件架构
- [x] **前端技术栈分层**: ✅ 本功能为 C端 小程序，严格使用 Taro 框架，不涉及 B端 技术栈
- [x] **数据驱动状态管理**: ✅ 使用 TanStack Query 管理服务器状态和缓存策略
- [x] **代码质量工程化**: ✅ TypeScript 类型检查（前端），Java 类型检查和注释规范（后端 API）
- [x] **后端技术栈约束**: ✅ 后端使用 Spring Boot + Supabase（场景包数据存储在 Supabase PostgreSQL）

### 性能与标准检查：
- [x] **性能标准**: ✅ 首屏加载 <2秒，缓存命中 <500ms，符合 C端 性能要求
- [x] **安全标准**: ✅ 使用 Zod 对 API 返回数据进行运行时验证，防止数据格式错误
- [x] **可访问性标准**: ⚠️ 小程序端可访问性标准相对宽松，主要关注用户体验和跨端兼容性

## Project Structure

### Documentation (this feature)

```text
specs/018-hall-reserve-homepage/
├── spec.md              # Feature specification
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── api.yaml        # OpenAPI 规范（场景包列表 API）
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
hall-reserve-taro/       # Taro 小程序项目（C端）
├── src/
│   ├── pages/          # 页面组件
│   │   └── index/     # 首页
│   │       ├── index.tsx          # 首页主组件
│   │       ├── index.config.ts    # 页面配置
│   │       └── index.scss         # 页面样式
│   ├── components/     # 可复用组件
│   ├── services/       # API 服务封装
│   │   └── scenarioService.ts    # 场景包 API 服务（本次新增/修改）
│   ├── types/          # TypeScript 类型定义
│   │   └── scenario.ts           # 场景包类型定义（本次新增/修改）
│   ├── utils/          # 工具函数
│   │   └── request.ts            # Taro.request 封装
│   ├── constants/      # 常量定义
│   ├── hooks/          # 自定义 Hooks
│   └── app.config.ts   # 应用配置
├── config/             # Taro 编译配置
├── project.config.json # 微信小程序配置
└── package.json

backend/                 # Spring Boot 后端（需要同步开发）
├── src/main/java/
│   └── com/cinema/
│       ├── controller/
│       │   └── ScenarioPackageController.java  # 场景包 API 控制器（新增）
│       ├── service/
│       │   └── ScenarioPackageService.java     # 场景包业务服务（新增）
│       ├── repository/
│       │   └── ScenarioPackageRepository.java  # Supabase 数据访问（新增）
│       ├── dto/
│       │   └── ScenarioPackageListItemDTO.java # 列表摘要 DTO（新增）
│       └── config/
│           └── SupabaseConfig.java             # Supabase 配置
└── src/test/java/      # 集成测试
```

**Structure Decision**: Taro 多端小程序应用（C端）+ Spring Boot 后端 API。小程序使用 Taro 框架确保跨端兼容（微信小程序 + H5），后端使用 Spring Boot 集成 Supabase 提供数据服务。前后端通过 RESTful API 交互，使用 OpenAPI 规范定义契约。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
