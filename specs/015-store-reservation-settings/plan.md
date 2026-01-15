# Implementation Plan: 门店预约设置

**Branch**: `015-store-reservation-settings` | **Date**: 2025-12-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/015-store-reservation-settings/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

本功能实现门店维度的预约设置管理，包括：
1. **后端数据建模**：在 Supabase 中创建 `store_reservation_settings` 表，与 `stores` 表建立一对一关系，存储每个门店的预约配置（是否开放预约、可预约天数）
2. **后端 API**：提供 REST API（GET/PUT /api/stores/{storeId}/reservation-settings, PUT /api/stores/reservation-settings/batch）用于查询和更新门店预约设置
3. **前端页面**：基于现有门店管理页面，创建独立的"门店预约设置"页面，支持查看、单个编辑、批量设置预约配置
4. **数据验证**：前后端统一验证可预约天数范围（1-365天），确保数据一致性

技术方案采用 Spring Boot + Supabase 作为后端数据源，前端使用 TanStack Query 管理 API 调用，复用现有门店管理页面的组件和模式，确保代码一致性和可维护性。

## Technical Context

**Language/Version**: TypeScript 5.9.3 + React 19.2.0 (frontend), Java 21 + Spring Boot 3.3.5 (backend)

**Primary Dependencies**:
- Frontend: Ant Design 6.1.0, Zustand 5.0.9, TanStack Query 5.90.12, React Router 7.10.1, MSW 2.12.4, React Hook Form 7.68.0, Zod 4.1.13
- Backend: Spring Boot Web 3.3.5, Spring WebFlux WebClient, Jackson, Supabase REST API client, Bean Validation

**Storage**: Supabase PostgreSQL 作为主要数据源，新增 `store_reservation_settings` 表与 `stores` 表建立一对一关系；前端开发时可使用 MSW 模拟 API

**Testing**:
- Backend: JUnit 5 + Spring Boot Test + MockWebServer（模拟 Supabase）
- Frontend: Vitest (unit tests) + Playwright (e2e tests) + Testing Library

**Target Platform**: Web browser (Chrome, Firefox, Safari, Edge) + Spring Boot backend API (port 8080)

**Project Type**: Full-stack web application (Spring Boot backend + React frontend)

**Performance Goals**:
- 预约设置页面加载 <2秒（门店数量 < 100）
- 单个门店设置保存 <1秒
- 批量设置（10个门店）<3秒
- 页面切换 <500ms

**Constraints**:
- 必须遵循 Feature Branch Binding（specId: 015-store-reservation-settings）
- 测试驱动开发（TDD），先写测试再实现
- 后端必须使用 Spring Boot + Supabase，不得直接连接其他数据库
- 前端组件必须遵循原子设计理念，复用现有门店管理页面组件
- 前后端数据结构必须完全一致（字段名、类型、验证规则）
- API 响应格式必须遵循统一规范（见宪章 1.3.0）

**Scale/Scope**:
- 预期门店数量：10-50家
- 每个门店一个预约设置记录
- 并发用户：10-100人（运营人员）
- 数据更新频率：低（配置变更不频繁）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支名 `015-store-reservation-settings` 中的specId与active_spec路径一致
- [x] **测试驱动开发**: 已规划测试策略（JUnit + Spring Boot Test + Vitest + Playwright），关键业务流程（查看、编辑、批量设置）将先编写测试
- [x] **组件化架构**: 前端将复用现有门店管理页面组件（StoreTable、StoreSearch、StatusFilter），遵循原子设计理念
- [x] **数据驱动状态管理**: 使用 TanStack Query 管理服务器状态（预约设置API调用），Zustand 管理客户端状态（表单状态、批量选择）
- [x] **代码质量工程化**: TypeScript类型检查、ESLint、Java静态检查、Bean Validation、单元测试和集成测试
- [x] **后端技术栈约束**: 使用 Spring Boot 3.3.5 + Supabase REST API，Supabase为唯一数据源，新增 `store_reservation_settings` 表

### 性能与标准检查：
- [x] **性能标准**: 预约设置页面加载<2秒，单个设置保存<1秒，批量设置<3秒，页面切换<500ms
- [x] **安全标准**: 使用 Zod 进行前端数据验证，后端使用 Bean Validation，API 认证通过 Supabase Auth
- [x] **可访问性标准**: 使用 Ant Design 组件自带的可访问性支持，遵循 WCAG 2.1 AA

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

**Structure Decision**: Full-stack web application using Spring Boot backend + React frontend. Backend follows layered architecture (Controller → Service → Repository), frontend follows feature-based modular architecture with Atomic Design components. Comprehensive testing at all levels (unit, integration, E2E).

## Phase 0: Research & Decisions ✅

*Output: `research.md` (已完成)*

### Research Tasks Completed

已完成以下技术决策：

1. **数据模型设计** - 独立表设计，与 stores 表建立一对一关系
2. **API 设计模式** - RESTful 嵌套资源模式
3. **数据验证策略** - 前后端统一验证（Zod + Bean Validation）
4. **前端页面架构** - 复用现有组件 + 新增专用组件
5. **批量操作策略** - 部分成功处理策略
6. **默认值策略** - 新建门店时自动创建预约设置
7. **API 响应格式** - 遵循统一规范（宪章 1.3.0）

详见 `research.md`。

## Phase 1: Design & Contracts ✅

*Output: `data-model.md`, `contracts/reservation-settings-api.yaml`, `quickstart.md` (已完成)*

### Data Model Design ✅

已在 `data-model.md` 中定义：

1. **StoreReservationSettings（门店预约设置）实体**
   - 数据库表：`store_reservation_settings`
   - 后端 Domain 模型：`StoreReservationSettings.java`
   - DTO：`StoreReservationSettingsDTO.java`
   - 请求 DTO：`UpdateStoreReservationSettingsRequest.java`, `BatchUpdateStoreReservationSettingsRequest.java`
   - 前端类型：`StoreReservationSettings` interface

2. **关系设计**
   - StoreReservationSettings ↔ Store (One-to-One)
   - 级联删除：门店删除时，预约设置自动删除

3. **验证规则**
   - `maxReservationDays`: 0-365 范围
   - 当 `isReservationEnabled=true` 时，`maxReservationDays` 必须 > 0

### API Contracts ✅

已在 `contracts/reservation-settings-api.yaml` 中定义：

1. **GET /api/stores/{storeId}/reservation-settings** - 获取门店预约设置
2. **PUT /api/stores/{storeId}/reservation-settings** - 更新门店预约设置
3. **PUT /api/stores/reservation-settings/batch** - 批量更新预约设置

所有 API 遵循统一响应格式规范（见宪章 1.3.0）。

### Quickstart Guide ✅

已在 `quickstart.md` 中提供：

1. 环境准备（数据库设置）
2. 后端开发指南（实体、Repository、Service、Controller）
3. 前端开发指南（类型定义、API Service、TanStack Query hooks、页面组件）
4. 开发流程（TDD、开发顺序）
5. API 使用示例
6. 注意事项和常见问题排查

## Phase 2: Task Breakdown

*Output: Generated by `/speckit.tasks` command (not by `/speckit.plan`)*

任务分解将在执行 `/speckit.tasks` 命令时完成，预期包括：

1. **后端任务**
   - 创建 Supabase 数据表（`store_reservation_settings`）
   - 实现 Domain 模型和 DTO
   - 实现 Repository 层
   - 实现 Service 层（含批量更新逻辑）
   - 实现 Controller 层
   - 编写单元测试和集成测试

2. **前端任务**
   - 创建类型定义和 Zod schema
   - 实现 API Service（含 MSW mock）
   - 创建 TanStack Query hooks
   - 实现页面组件（复用现有组件 + 新增专用组件）
   - 实现批量设置功能
   - 编写单元测试和 E2E 测试

3. **集成任务**
   - 前后端 API 契约验证
   - 端到端测试
   - 文档更新

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
