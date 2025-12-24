# Implementation Plan: 预约单管理系统

**Branch**: `U001-reservation-order-management` | **Date**: 2025-12-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/U001-reservation-order-management/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

实现影院场景包预约订单管理系统,将C端"立即支付"流程改为"立即预约",支持用户先预约后支付的灵活业务模式。核心功能包括:

**C端(Taro多端)**:
- 场景包详情页"立即预约"按钮与预约信息填写表单
- 预约单创建与提交(时段库存校验)
- "我的预约"订单列表与详情查看
- "我的"(profile)页面集成预约入口

**B端(React管理后台)**:
- 预约单列表查询与多维度筛选(状态/日期/场景包/搜索)
- 预约单详情查看与状态管理
- 确认预约(支持"要求支付"或"直接完成"两种模式)
- 取消预约(含原因记录与库存释放)
- 修改预约联系信息(限非核心字段)
- 预约单批量导出

**后端(Spring Boot + Supabase)**:
- 预约单CURD API与并发控制(乐观锁)
- 时段库存实时校验与更新
- 预约单状态流转与操作日志
- 通知集成(状态变更通知)

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

- [x] **功能分支绑定**: 当前分支 `U001-reservation-order-management` 与 spec 路径一致,符合规范
- [x] **测试驱动开发**: 需为关键预约流程(创建/确认/取消)编写E2E测试(Playwright for B端, Taro测试工具 for C端)和单元测试(Vitest)
- [x] **组件化架构**: B端使用原子设计(预约单列表表格/筛选器/详情卡片等),C端使用Taro组件拆分(预约表单/订单卡片/状态标签等)
- [x] **前端技术栈分层**: B端使用React 19.2.0+Ant Design 6.1.0,C端使用Taro 3.x多端框架,严格分离
- [x] **数据驱动状态管理**: B端使用Zustand(UI状态)+TanStack Query(API数据),C端使用Zustand或Redux+Taro.request封装
- [x] **代码质量工程化**: TypeScript 5.9.3严格模式,ESLint+Prettier,Java 21+Spring Boot 3.x规范,关键业务逻辑需注释
- [x] **后端技术栈约束**: Spring Boot 3.x后端,Supabase作为PostgreSQL数据源(预约单表/操作日志表),集成Auth和Storage

### 性能与标准检查：
- [x] **性能标准**:
  - B端预约单列表支持虚拟滚动或分页(20条/页),筛选响应<500ms
  - C端Taro项目首屏渲染<1.5s,小程序主包<2MB,列表滚动FPS≥50
  - API响应时间P95<1秒(参考SC-002/SC-003)
- [x] **安全标准**:
  - 前端使用Zod验证预约表单输入(手机号格式/必填字段)
  - API请求需Token认证,处理过期刷新
  - 敏感信息(用户手机号)不明文存储在C端本地
- [x] **可访问性标准**: B端管理后台遵循WCAG 2.1 AA,支持键盘导航,表单有明确的aria-label和错误提示

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
| N/A | 无宪法原则违反 | N/A |

---

## Phase 2 Gate: Post-Design Constitution Re-Check

所有宪法原则在设计阶段验证通过:

- [x] **功能分支绑定**: 分支`U001-reservation-order-management`与spec路径一致 ✅
- [x] **测试驱动开发**: 已规划E2E测试(Playwright/Taro)和单元测试(Vitest)覆盖关键预约流程 ✅
- [x] **组件化架构**: 已设计原子组件拆分(B端表格/筛选器/详情卡片,C端预约表单/订单卡片) ✅
- [x] **前端技术栈分层**: B端React+AntD,C端Taro,技术栈分离明确 ✅
- [x] **数据驱动状态管理**: B端Zustand+TanStack Query,C端Zustand+Taro.request封装 ✅
- [x] **代码质量工程化**: TypeScript严格模式,ESLint+Prettier,Java注释规范 ✅
- [x] **后端技术栈约束**: Spring Boot 3.x + Supabase PostgreSQL,乐观锁并发控制 ✅
- [x] **API响应格式标准**: 统一使用ApiResponse<T>包装,错误码规范化 ✅
- [x] **性能标准**: B端虚拟滚动/分页,C端首屏<1.5s,主包<2MB,API响应P95<1s ✅
- [x] **安全标准**: Zod表单验证,JWT Token认证,敏感信息不存本地 ✅
- [x] **可访问性标准**: B端WCAG 2.1 AA,键盘导航,表单aria-label ✅

**GATE STATUS**: ✅ PASSED - All constitution principles satisfied

---

## Planning Outputs

### Phase 0: Research (Complete ✅)

**研究文档**: [research.md](./research.md)

**关键决策**:
1. Spring Boot三层架构 + Supabase PostgreSQL数据源
2. 乐观锁并发控制(@Version注解) + 数据库层原子性UPDATE
3. 事件驱动通知集成(Spring Application Events) + 独立日志表审计
4. Taro官方组件 + Zustand状态管理 + 封装request工具函数
5. TanStack Query分层Key结构([reservations, list, filters])
6. F001 profile页面集成"我的预约"入口

### Phase 1: Design (Complete ✅)

**数据模型**: [data-model.md](./data-model.md)

**核心实体**:
- reservation_orders (预约单主表,含version字段乐观锁)
- reservation_addon_items (预约单加购项明细表)
- reservation_operation_logs (操作日志表,JSONB存储变更快照)

**API契约**: [contracts/api.yaml](./contracts/api.yaml)

**关键端点**:
- C端: `POST /api/client/reservations` (创建预约)
- C端: `GET /api/client/reservations` (我的预约列表)
- C端: `GET /api/client/reservations/pending-count` (待处理数量)
- B端: `GET /api/admin/reservations` (管理列表,多维筛选)
- B端: `POST /api/admin/reservations/{id}/confirm` (确认预约)
- B端: `POST /api/admin/reservations/{id}/cancel` (取消预约)
- B端: `PATCH /api/admin/reservations/{id}/update-contact` (修改联系信息)
- B端: `POST /api/admin/reservations/export` (批量导出)

**开发指南**: [quickstart.md](./quickstart.md)

**环境要求**: Java 21, Spring Boot 3.x, Node.js 20+, Taro CLI 3.x

---

## Next Steps

**Phase 2**: 任务分解 (`/speckit.tasks` command)

准备使用`/speckit.tasks`命令生成`tasks.md`,将设计转化为可执行的开发任务,按依赖关系排序。

**当前规划完成日期**: 2025-12-24
**分支**: `U001-reservation-order-management`
**文档路径**: `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/specs/U001-reservation-order-management/`
