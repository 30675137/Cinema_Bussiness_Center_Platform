# Implementation Plan: 小程序渠道商品订单适配

**Branch**: `O006-miniapp-channel-order` | **Date**: 2026-01-01 | **Spec**: [specs/O006-miniapp-channel-order/spec.md](./spec.md)
**Input**: Feature specification from `/specs/O006-miniapp-channel-order/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

将小程序(hall-reserve-taro)的商品订单功能从饮品表(`beverages`)迁移到渠道商品配置表(`channel_product_config`),支持更广泛的商品类型(酒/咖啡/饮料/小食/餐品/其他)和规格类型(7种规格),同时保持 O003 的订单流程不变(浏览商品 → 选择规格 → 加入购物车 → 提交订单 → Mock 支付 → 查看状态 → 取餐)。核心技术调整包括:调整 API 端点、扩展类型定义、修改状态管理、适配新的商品分类和规格体系。

## Technical Context

**Language/Version**:
- C端（小程序）: TypeScript 5.4.0 + Taro 4.1.9 + React 18.3.1 (微信小程序 + H5)
- 后端 API: Java 17 + Spring Boot 3.3.5 (依赖 O005 已实现的端点)

**Primary Dependencies**:
- C端核心: Taro 4.1.9, React 18.3.1, Zustand 4.5.5 (状态管理), TanStack Query 5.90.12 (数据查询)
- UI 组件: Taro UI / @tarojs/components (Taro 原生组件)
- 工具库: dayjs (日期处理), lodash-es (工具函数)
- 现有依赖: `hall-reserve-taro/src/utils/request.ts` (统一请求封装), `hall-reserve-taro/src/services/authService.ts` (认证服务)

**Storage**:
- 后端数据源: Supabase PostgreSQL (`channel_product_config` 表,由 O005 提供)
- 前端存储: Taro.setStorageSync/getStorageSync (认证 Token, 用户偏好), Zustand 内存状态 (购物车数据,临时选中商品)
- 数据持久化: 购物车数据仅存在于内存中,刷新页面后清空

**Testing**:
- 单元测试: Vitest (测试工具函数、服务层、状态管理逻辑)
- E2E 测试: 可选,建议测试关键流程(下单、支付、订单状态查询)
- 平台测试: 微信开发者工具 (小程序真机预览), 浏览器 (H5 测试)

**Target Platform**:
- 微信小程序 (主要平台,优先适配)
- H5 移动端 (辅助平台,确保基本功能可用)
- 设计基准: iPhone 移动端 UI 尺寸,使用 rpx 单位适配

**Project Type**:
- Multi-platform client application (Taro 框架,仅涉及 C端 小程序前端代码变更)
- 纯前端适配任务 (后端 API 由 O005 提供,无需修改后端代码)

**Performance Goals**:
- 商品列表首屏加载: ≤2秒 (20条商品含图片)
- 商品详情页加载: ≤1秒
- 订单状态更新延迟: ≤5秒 (轮询间隔 5-10秒)
- 完整下单流程: 用户可在2分钟内完成

**Constraints**:
- 必须遵循功能分支绑定 (O006-miniapp-channel-order)
- 必须遵循测试驱动开发 (关键逻辑100%覆盖)
- 必须使用 Taro 框架 (C端 技术栈强制要求)
- 必须使用 Zustand + TanStack Query 状态管理
- 必须包含代码归属标识 (`@spec O006-miniapp-channel-order`)
- 依赖 O005 后端 API 可用性 (API 端点已实现并正常工作)

**Scale/Scope**:
- 功能范围: 小程序端商品浏览、规格选择、购物车管理、订单提交、状态查询
- 代码变更: 约10个文件 (类型定义3个、服务层2个、状态管理2个、页面组件3个)
- 复杂度: 中等 (参考 O003 实现模式,主要工作是数据源切换和类型扩展)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支 `O006-miniapp-channel-order`,active_spec 指向 `specs/O006-miniapp-channel-order/spec.md`,specId 一致 ✅
- [x] **代码归属标识**: 所有新增/修改文件必须包含 `@spec O006-miniapp-channel-order` 标识 ✅
- [x] **测试驱动开发**: 规格选择、价格计算、订单提交等关键业务逻辑必须先编写测试(覆盖率100%) ✅
- [x] **组件化架构**: 页面组件遵循 Taro 组件规范,可复用组件单独提取 ✅
- [x] **前端技术栈分层**: 本项目为 C端 小程序开发,强制使用 Taro 4.1.9 框架,不涉及 B端 代码 ✅
- [x] **数据驱动状态管理**: 使用 Zustand 4.5.5 管理客户端状态,TanStack Query 5.90.12 管理服务器状态 ✅
- [x] **代码质量工程化**: 必须通过 TypeScript 5.4.0 类型检查、ESLint 检查、Prettier 格式化 ✅
- [x] **后端技术栈约束**: 后端 API 由 O005 提供,使用 Spring Boot 3.3.5 + Supabase,本项目无需修改后端 ✅

### C端 特定要求检查：

- [x] **Taro 多端适配**: 必须至少支持微信小程序和 H5 两端 ✅ (已在 spec 中明确)
- [x] **Taro API 使用**: 必须使用 Taro.request/Taro.setStorageSync 等统一 API,不得直接使用浏览器 API ✅
- [x] **样式规范**: 使用 rpx 单位适配,避免不兼容 CSS 特性 ✅
- [x] **认证要求**: C端 必须实现用户认证(静默登录、Token 管理、Token 刷新),已在 spec 依赖中说明 ✅

### 性能与标准检查：

- [x] **性能标准**: 商品列表首屏加载≤2s,详情页加载≤1s,订单状态更新延迟≤5s ✅ (已在 spec 成功标准中定义)
- [x] **安全标准**: API 请求包含 Token 认证,Token 过期自动刷新,关键操作日志记录 ✅ (已在 spec FR-028/FR-029 中要求)
- [x] **可访问性标准**: Taro 小程序默认支持无障碍访问,关键操作按钮提供明确的文本标签 ✅

### 特殊说明：

**本项目不适用的宪法原则** (明确标注 N/A):
- N/A **B端 管理后台技术栈**: 本项目为纯 C端 小程序开发,不涉及 B端 代码
- N/A **Spring Boot 后端开发**: 本项目为纯前端适配,后端 API 由 O005 提供
- N/A **Supabase 直接集成**: 小程序通过后端 API 间接访问 Supabase,不直接集成
- N/A **Claude Code Skills 开发规范**: 本项目为业务功能开发,非工具开发

**无违规情况**: 所有适用的宪法原则均已满足,无需填写 Complexity Tracking 表格 ✅

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
frontend/
├── src/
│   ├── components/          # Reusable UI components (Atomic Design)
│   │   ├── atoms/          # Basic UI elements (Button, Input, etc.)
│   │   ├── molecules/      # Component combinations (SearchForm, etc.)
│   │   ├── organisms/      # Complex components (ProductList, etc.)
│   │   └── templates/      # Layout templates (MainLayout, etc.)
│   ├── features/           # Feature-specific modules
│   │   ├── product-management/
│   │   │   ├── components/ # Feature-specific components
│   │   │   ├── hooks/      # Custom hooks
│   │   │   ├── services/   # API services
│   │   │   ├── types/      # TypeScript types
│   │   │   └── utils/      # Utility functions
│   │   └── [other-features]/
│   ├── pages/              # Page components (route-level)
│   ├── hooks/              # Global custom hooks
│   ├── services/           # Global API services
│   ├── stores/             # Zustand stores
│   ├── types/              # Global TypeScript types
│   ├── utils/              # Global utility functions
│   ├── constants/          # Application constants
│   └── assets/             # Static assets
├── public/                 # Public assets and MSW worker
├── tests/                  # Test files
│   ├── __mocks__/         # Mock files
│   ├── fixtures/          # Test data
│   └── utils/             # Test utilities
└── docs/                  # Feature documentation

specs/                      # Feature specifications
├── [###-feature-name]/
│   ├── spec.md           # Feature specification
│   ├── plan.md           # Implementation plan (this file)
│   ├── research.md       # Research findings
│   ├── data-model.md     # Data model design
│   ├── quickstart.md     # Development quickstart
│   └── tasks.md          # Development tasks
└── [other-features]/
```

**Structure Decision**: Frontend-only web application using React with feature-based modular architecture. Components follow Atomic Design principles, business logic is organized by feature modules, and comprehensive testing is maintained at all levels.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
