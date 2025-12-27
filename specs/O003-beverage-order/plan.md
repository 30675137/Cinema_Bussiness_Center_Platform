# Implementation Plan: 饮品订单创建与出品管理

**Branch**: `O003-beverage-order` | **Date**: 2025-12-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/O003-beverage-order/spec.md`

**Note**: This plan provides technical context and implementation guidance for the beverage order feature.

## Summary

实现影院吧台饮品订单系统，支持 C端小程序下单、B端管理后台出品管理、BOM自动扣料、取餐号叫号通知。系统包含 3 个独立用户故事：US1 (C端饮品下单，P1 MVP)、US2 (B端订单接收与出品，P1 MVP)、US3 (订单历史与统计，P2)。技术方案采用 Taro 多端框架(C端)、React+AntD(B端)、Spring Boot+Supabase(后端)，使用 Mock 支付和 Mock 叫号简化 MVP 实现，通过 8秒轮询实现订单状态实时更新，集成 P003/P004 库存模块实现 BOM 扣料。

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

*GATE: Must pass before implementation. Re-checked after /speckit.analyze.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支名中的specId必须等于active_spec指向路径中的specId
  - ✅ specId O003 已对齐 (branch: O003-beverage-order, active_spec: specs/O003-beverage-order)
- [x] **测试驱动开发**: 关键业务流程必须先编写测试，确保测试覆盖率100%
  - ✅ tasks.md 包含 E2E 和单元测试任务 (Playwright + Vitest)
- [x] **组件化架构**: 必须遵循原子设计理念，组件必须清晰分层和可复用
  - ✅ tasks.md T027-T033 定义共享组件 (Atoms: LoadingSpinner, ErrorState, EmptyState)
- [x] **前端技术栈分层**: B端必须使用React+Ant Design，C端必须使用Taro框架，不得混用
  - ✅ B端: React 19.2.0 + Ant Design 6.1.0 (T103-T117)
  - ✅ C端: Taro 4.1.9 + Taro UI (T064-T081)
- [x] **数据驱动状态管理**: 必须使用Zustand + TanStack Query，状态变更可预测
  - ✅ C端: T064-T065 (Zustand stores), T066-T069 (TanStack Query hooks)
  - ✅ B端: T103 (Zustand store), T104-T107 (TanStack Query hooks with 8s polling)
- [x] **代码质量工程化**: 必须通过TypeScript/Java类型检查、ESLint/后端静态检查、所有质量门禁
  - ✅ T009-T010 (ESLint/Prettier setup), TypeScript 5.9.3, Java 21
- [x] **后端技术栈约束**: 后端必须使用Spring Boot集成Supabase，Supabase为主要数据源与认证/存储提供方
  - ✅ Spring Boot 3.x + Supabase (T034 SupabaseClientConfig, T011-T020 database migrations)

### 性能与标准检查：
- [x] **性能标准**: 应用启动<3秒，页面切换<500ms，大数据列表使用虚拟滚动
  - ✅ SC-007: 菜单页面首屏加载 ≤ 2秒
  - ⚠️ 需要 Phase 6 性能测试任务验证 (T145.1)
- [x] **安全标准**: 使用Zod数据验证，防止XSS，适当的认证授权机制
  - ✅ T026 JWT authentication filter, Zod validation in React Hook Form
- [x] **可访问性标准**: 遵循WCAG 2.1 AA级别，支持键盘导航和屏幕阅读器
  - ✅ Ant Design 内置 WCAG 支持，Taro UI 符合小程序无障碍规范

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

**Status**: No violations - all constitution principles satisfied.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

## Implementation Notes

### Key Technical Decisions (from research.md)

1. **Mock Payment (Decision 1)**:
   - 500ms fixed delay to simulate payment gateway
   - 100% success rate in MVP (no failure scenarios)
   - Phase 2: Integrate real WeChat Pay JSAPI

2. **Polling Notifications (Decision 2)**:
   - 8-second interval polling via TanStack Query `refetchInterval`
   - Simpler than WebSocket for MVP low-concurrency scenario
   - Phase 2: Replace with WebSocket for real-time push

3. **BOM Deduction Integration (Decision 3)**:
   - Real integration with P003 (inventory query) and P004 (inventory adjustment) APIs
   - Pessimistic locking (`SELECT FOR UPDATE`) to prevent concurrent conflicts
   - Triggered when order status changes from PENDING_PRODUCTION → PRODUCING

4. **Queue Number Generation (Decision 4)**:
   - Format: D001-D999 (D prefix + 3-digit sequence)
   - Daily reset at midnight (00:00)
   - PostgreSQL Advisory Lock (`pg_advisory_xact_lock`) for concurrency safety
   - Cycle back to D001 if exceeding 999 orders per day

5. **Taro Multi-Platform (Decision 5)**:
   - Use Taro UI official component library for cross-platform compatibility
   - Custom business components when Taro UI insufficient
   - Target platforms: WeChat Mini-Program + H5 (MVP)

6. **Backend Beverage Module (Decision 6)**:
   - API-only backend (no B端 UI for beverage CRUD in MVP)
   - Beverage data seeded via Supabase Studio or SQL scripts
   - Phase 2: Add B端 beverage management UI

### Critical Dependencies

- **P001 SKU Module**: Required for recipe_ingredients.sku_id foreign key
- **P003 Inventory Query**: Required for BOM deduction inventory validation
- **P004 Inventory Adjustment**: Required for executing BOM deduction
- **Supabase Instance**: Must be configured with connection credentials in application.yml

### MVP Scope Boundaries

**Included in MVP**:
- US1: C端饮品下单 (45 tasks, P1)
- US2: B端订单接收与出品 (36 tasks, P1)
- Mock payment + Mock calling notification
- 8s polling for order status updates
- BOM automatic deduction with P003/P004 integration

**Excluded from MVP** (Phase 2+):
- US3: 订单历史与统计 (19 tasks, P2)
- Real WeChat Pay integration
- Real TTS voice calling system
- WebSocket real-time notifications
- Order auto-cancellation (30min timeout)
- Beverage management UI in B端
- Refund functionality
