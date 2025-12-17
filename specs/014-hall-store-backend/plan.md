# Implementation Plan: 影厅资源后端建模（Store-Hall 一致性）

**Branch**: `014-hall-store-backend` | **Date**: 2025-12-16 | **Spec**: `specs/014-hall-store-backend/spec.md`
**Input**: Feature specification from `/specs/014-hall-store-backend/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

本特性在现有“影厅资源管理”和“档期甘特图”前端基础上，为后端构建统一的
Store（门店）与 Hall（影厅）数据模型和门店-影厅关系建模，并提供与前端类
型一致的查询 API。通过 Spring Boot + Supabase 建立影厅主数据表和门店主数据
表，确保按门店查询影厅、按门店选择影厅等场景在所有前端页面中使用统一实体
与标识，避免字段不一致导致的重复映射和数据错误。

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.9.3 + React 19.2.0 (frontend), Java 21 + Spring Boot 3.x (backend)
**Primary Dependencies**: Ant Design 6.1.0, Zustand 5.0.9, TanStack Query 5.90.12, React Router 7.10.1, MSW 2.12.4, Spring Boot Web, Supabase Java/HTTP client
**Storage**: Supabase (PostgreSQL, Auth, Storage) 作为主要后端数据源，必要时前端使用 Mock data（in-memory state + MSW handlers + localStorage）进行开发模拟
**Testing**: Vitest (unit tests) + Playwright (e2e tests) + Testing Library
**Target Platform**: Web browser (Chrome, Firefox, Safari, Edge) + Spring Boot backend API
**Project Type**: Full-stack web application (Spring Boot backend + React frontend)
**Performance Goals**: <3s app startup, <500ms page transitions, support 1000+ list items with virtual scrolling
**Constraints**: Must comply with Feature Branch Binding (specId alignment), Test-Driven Development, Component-Based Architecture, and Backend Architecture (Spring Boot + Supabase as unified backend stack)
**Scale/Scope**: 影院商品/资源管理中台的子域（影厅资源与排期），后端本次变更
范围限定在门店/影厅主数据与相关只读查询 API；暂不涉及多租户、跨门店共享和
复杂报表。

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支名中的specId必须等于active_spec指向路径中的specId
  - ✅ 分支名 `014-hall-store-backend` 与 spec 路径 `specs/014-hall-store-backend/spec.md` 一致
- [x] **测试驱动开发**: 关键业务流程必须先编写测试，确保测试覆盖率100%
  - ✅ 计划中包含 Repository、Service、Controller 层的单元测试和集成测试
- [x] **组件化架构**: 必须遵循原子设计理念，组件必须清晰分层和可复用
  - ✅ 本特性为后端特性，前端复用现有组件，不涉及新组件开发
- [x] **数据驱动状态管理**: 必须使用Zustand + TanStack Query，状态变更可预测
  - ✅ 前端继续使用现有状态管理方案，后端通过 Supabase 提供数据源
- [x] **代码质量工程化**: 必须通过TypeScript/Java类型检查、ESLint/后端静态检查、所有质量门禁
  - ✅ 后端使用 Java 21 + Spring Boot 3.x，遵循标准编码规范
- [x] **后端技术栈约束**: 后端必须使用Spring Boot集成Supabase，Supabase为主要数据源与认证/存储提供方
  - ✅ 设计采用 Spring Boot + Supabase REST API 集成，符合宪法要求

### 性能与标准检查：
- [x] **性能标准**: 应用启动<3秒，页面切换<500ms，大数据列表使用虚拟滚动
  - ✅ 后端 API 设计支持分页和筛选，前端已有虚拟滚动支持
- [x] **安全标准**: 使用Zod数据验证，防止XSS，适当的认证授权机制
  - ✅ 后端使用 Spring Boot Validation，前端继续使用 Zod，Supabase 提供认证
- [x] **可访问性标准**: 遵循WCAG 2.1 AA级别，支持键盘导航和屏幕阅读器
  - ✅ 前端复用现有可访问性实现，后端 API 遵循 RESTful 标准

**检查结果**: ✅ **所有宪法要求均已满足**，设计阶段完成，可以进入实现阶段。

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

**Structure Decision**: 全局仍采用“前端 React + 后端 Spring Boot”的特性化模块
架构。本特性新增的 Store/Hall 相关代码集中在后端的领域/数据访问层与 API 控
制器中，并通过 Supabase 作为统一数据源；前端继续复用现有排期与影厅资源管
理页面，仅适配新的标准化 API。测试将覆盖后端领域逻辑与 API 契约，以及前端
对新 API 的基本集成验证。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
