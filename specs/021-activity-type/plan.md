# Implementation Plan: 活动类型管理

**Branch**: `016-activity-type` | **Date**: 2025-12-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/016-activity-type/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

活动类型管理功能允许运营人员在后台配置预约活动类型（如"企业团建"、"订婚"、"生日Party"等），小程序端用户在预约时可以选择这些类型。功能包括活动类型的CRUD操作、启用/停用控制、软删除支持，以及权限控制（仅运营人员/管理员可维护）。技术实现采用Spring Boot + Supabase后端栈，React前端，遵循项目的组件化架构和数据驱动状态管理原则。

## Technical Context

**Language/Version**: TypeScript 5.9.3 + React 19.2.0 (frontend), Java 17 + Spring Boot 3.3.5 (backend)
**Primary Dependencies**: Ant Design 6.1.0, Zustand 5.0.9, TanStack Query 5.90.12, React Router 7.10.1, MSW 2.12.4, Spring Boot Web, Spring WebFlux, Supabase Java/HTTP client (WebClient)
**Storage**: Supabase (PostgreSQL) 作为主要后端数据源，前端使用 MSW handlers + localStorage 进行开发模拟
**Testing**: Vitest (unit tests) + Playwright (e2e tests) + Testing Library (frontend), JUnit 5 + Mockito (backend)
**Target Platform**: Web browser (Chrome, Firefox, Safari, Edge) + Spring Boot backend API
**Project Type**: Full-stack web application (Spring Boot backend + React frontend)
**Performance Goals**: <3s app startup, <500ms page transitions, 列表查询响应时间<1秒，支持50+活动类型无延迟
**Constraints**: Must comply with Feature Branch Binding (specId alignment), Test-Driven Development, Component-Based Architecture, Backend Architecture (Spring Boot + Supabase as unified backend stack), API Response Format Standardization
**Scale/Scope**: 简单的字典数据管理功能，预计50个以内的活动类型，低复杂度CRUD操作

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支名 `016-activity-type` 中的specId `016` 等于active_spec指向路径中的specId
- [x] **测试驱动开发**: 关键业务流程（CRUD操作、启用/停用、权限控制）必须先编写测试，确保测试覆盖率100%
- [x] **组件化架构**: 必须遵循原子设计理念，活动类型管理页面使用原子组件（Button, Input）、分子组件（ActivityTypeForm）、有机体（ActivityTypeTable）、页面组件（ActivityTypePage）
- [x] **数据驱动状态管理**: 必须使用Zustand管理本地状态，TanStack Query管理服务器状态（活动类型列表、CRUD操作）
- [x] **代码质量工程化**: 必须通过TypeScript/Java类型检查、ESLint/后端静态检查、所有质量门禁
- [x] **后端技术栈约束**: 后端必须使用Spring Boot集成Supabase，通过WebClient调用Supabase REST API，Supabase为主要数据源

### 性能与标准检查：

- [x] **性能标准**: 应用启动<3秒，页面切换<500ms，活动类型列表查询<1秒（SC-003要求）
- [x] **安全标准**: 使用Zod数据验证（前端），Jakarta Bean Validation（后端），防止XSS，权限控制（仅运营人员/管理员可维护）
- [x] **可访问性标准**: 遵循WCAG 2.1 AA级别，支持键盘导航和屏幕阅读器
- [x] **API响应格式标准化**: 所有接口必须遵循统一的API响应格式（ApiResponse<T>），列表查询包含success、data、total字段

## Project Structure

### Documentation (this feature)

```text
specs/016-activity-type/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── activity-type-api.yaml
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/main/java/com/cinema/hallstore/
│   ├── domain/
│   │   ├── ActivityType.java              # 活动类型领域实体
│   │   └── enums/
│   │       └── ActivityTypeStatus.java    # 活动类型状态枚举（启用/停用/已删除）
│   ├── dto/
│   │   ├── ActivityTypeDTO.java           # 活动类型DTO
│   │   ├── CreateActivityTypeRequest.java # 创建请求DTO
│   │   ├── UpdateActivityTypeRequest.java # 更新请求DTO
│   │   └── ActivityTypeListResponse.java  # 列表响应DTO
│   ├── repository/
│   │   └── ActivityTypeRepository.java   # Supabase Repository
│   ├── service/
│   │   └── ActivityTypeService.java       # 业务逻辑服务
│   ├── controller/
│   │   └── ActivityTypeController.java   # REST API控制器
│   └── mapper/
│       └── ActivityTypeMapper.java        # DTO映射器
├── src/main/resources/
│   └── db/
│       └── schema.sql                    # 数据库表定义（activity_types）
└── src/test/java/com/cinema/hallstore/
    ├── controller/
    │   └── ActivityTypeControllerTest.java
    ├── service/
    │   └── ActivityTypeServiceTest.java
    └── repository/
        └── ActivityTypeRepositoryTest.java

frontend/
├── src/pages/activity-types/
│   ├── index.tsx                          # 活动类型管理页面
│   ├── components/
│   │   ├── ActivityTypeTable.tsx          # 活动类型表格组件
│   │   ├── ActivityTypeForm.tsx           # 活动类型表单组件（新建/编辑）
│   │   └── ActivityTypeStatusSwitch.tsx   # 启用/停用开关组件
│   ├── hooks/
│   │   └── useActivityTypesQuery.ts      # TanStack Query hooks
│   ├── services/
│   │   └── activityTypeService.ts        # API服务
│   └── types/
│       ├── activity-type.types.ts         # TypeScript类型定义
│       └── activity-type.schema.ts       # Zod验证schema
├── src/mocks/handlers/
│   └── activityTypeHandlers.ts            # MSW mock handlers
└── tests/
    ├── e2e/
    │   └── activity-types.spec.ts        # Playwright E2E测试
    └── pages/
        └── activity-types/
            └── activity-type.schema.test.ts # Zod schema测试
```

**Structure Decision**: Full-stack web application using Spring Boot + Supabase backend and React frontend. Backend follows domain-driven design with Repository pattern for Supabase integration. Frontend follows Atomic Design principles with feature-based modular architecture. Components are organized by feature modules, and comprehensive testing is maintained at all levels.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
