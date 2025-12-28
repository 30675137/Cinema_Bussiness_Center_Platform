# Implementation Plan: [FEATURE]

**Branch**: `[X###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[X###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**:
- B端（管理后台）: TypeScript 5.9.3 + React 19.2.0 (frontend), Java 21 + Spring Boot 3.x (backend)
- C端（客户端/小程序）: TypeScript 5.9.3 + Taro 3.x + React (multi-platform mini-program/H5)

**Primary Dependencies**:
- B端: Ant Design 6.1.0, Zustand 5.0.9, TanStack Query 5.90.12, React Router 7.10.1, MSW 2.12.4, Spring Boot Web, Supabase Java/HTTP client
- C端: Taro 3.x, Taro UI / NutUI, Zustand / Redux, Taro.request wrapper, Supabase client SDK

**Storage**: Supabase (PostgreSQL, Auth, Storage) 作为主要后端数据源，必要时前端使用 Mock data（in-memory state + MSW handlers + localStorage for B端 / Taro.setStorage for C端）进行开发模拟

**Testing**:
- B端: Vitest (unit tests) + Playwright (e2e tests) + Testing Library
- C端: Taro 官方测试工具 + 微信开发者工具 / H5 浏览器测试

**Target Platform**:
- B端: Web browser (Chrome, Firefox, Safari, Edge) + Spring Boot backend API
- C端: 微信小程序 + 支付宝小程序 + H5 + React Native (Taro 支持的多端平台)

**Project Type**:
- Full-stack web application (Spring Boot backend + React frontend for B端 admin interface)
- Multi-platform client application (Taro framework for C端 user-facing apps)

**Performance Goals**:
- B端: <3s app startup, <500ms page transitions, support 1000+ list items with virtual scrolling
- C端: <1.5s first screen render, <2MB main package size, FPS ≥ 50 for list scrolling

**Constraints**: Must comply with Feature Branch Binding (specId alignment), Test-Driven Development, Component-Based Architecture, Frontend Tech Stack Layering (B端 vs C端 separation), and Backend Architecture (Spring Boot + Supabase as unified backend stack)

**Scale/Scope**:
- B端: Enterprise admin interface, 50+ screens, complex data management workflows
- C端: User-facing mini-program/H5, booking flows, product browsing, user profile management

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [ ] **功能分支绑定**: 当前分支名中的specId必须等于active_spec指向路径中的specId
- [ ] **测试驱动开发**: 关键业务流程必须先编写测试，确保测试覆盖率100%
- [ ] **组件化架构**: 必须遵循原子设计理念，组件必须清晰分层和可复用
- [ ] **前端技术栈分层**: B端必须使用React+Ant Design，C端必须使用Taro框架，不得混用
- [ ] **数据驱动状态管理**: 必须使用Zustand + TanStack Query，状态变更可预测
- [ ] **代码质量工程化**: 必须通过TypeScript/Java类型检查、ESLint/后端静态检查、所有质量门禁
- [ ] **后端技术栈约束**: 后端必须使用Spring Boot集成Supabase，Supabase为主要数据源与认证/存储提供方

### 性能与标准检查：
- [ ] **性能标准**: 应用启动<3秒，页面切换<500ms，大数据列表使用虚拟滚动
- [ ] **安全标准**: 使用Zod数据验证，防止XSS，适当的认证授权机制
- [ ] **可访问性标准**: 遵循WCAG 2.1 AA级别，支持键盘导航和屏幕阅读器

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
