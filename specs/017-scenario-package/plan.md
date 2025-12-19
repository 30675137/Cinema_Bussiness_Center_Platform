# Implementation Plan: 场景包管理 (Scenario Package Management)

**Branch**: `017-scenario-package` | **Date**: 2025-12-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/017-scenario-package/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

场景包管理功能允许运营人员创建、配置和管理场景包产品原型。核心功能包括：创建场景包基本信息（名称、描述、背景图片、影厅类型），配置使用规则（时长、人数范围）和内容组合（硬权益-观影购票优惠、软权益-单品组合、服务项目），设置打包定价策略，以及管理场景包状态（草稿、已发布、已下架）。技术实现采用 Spring Boot + Supabase 后端架构，React + TypeScript 前端，背景图片存储在 Supabase Storage 中。

## Technical Context

**Language/Version**: TypeScript 5.9.3 + React 19.2.0 (frontend), Java 21 + Spring Boot 3.x (backend)
**Primary Dependencies**: Ant Design 6.1.0, Zustand 5.0.9, TanStack Query 5.90.12, React Router 7.10.1, MSW 2.12.4, Spring Boot Web, Supabase Java/HTTP client
**Storage**: Supabase (PostgreSQL, Auth, Storage) 作为主要后端数据源，背景图片存储在 Supabase Storage
**Testing**: Vitest (unit tests) + Playwright (e2e tests) + Testing Library (frontend), JUnit 5 + Spring Boot Test (backend)
**Target Platform**: Web browser (Chrome, Firefox, Safari, Edge) + Spring Boot backend API
**Project Type**: Full-stack web application (Spring Boot backend + React frontend)
**Performance Goals**: <3s app startup, <500ms page transitions, 场景包列表加载<2s (1000条数据), 定价计算<1s, 图片上传响应<3s
**Constraints**: Must comply with Feature Branch Binding (specId alignment), Test-Driven Development, Component-Based Architecture, Backend Architecture (Spring Boot + Supabase), API 响应格式标准化
**Scale/Scope**: 场景包管理模块，预计 10+ 页面/组件，支持 1000+ 场景包数据量，图片上传限制 5MB

**Unknowns requiring research**:
- NEEDS CLARIFICATION: Supabase Storage 在 Spring Boot 中的集成方式和最佳实践
- NEEDS CLARIFICATION: 图片上传的前后端流程设计（直接上传 vs 预签名 URL）
- NEEDS CLARIFICATION: 场景包版本管理的数据库设计方案
- NEEDS CLARIFICATION: 乐观锁机制在 Supabase PostgreSQL 中的实现方式
- NEEDS CLARIFICATION: 场景包与影厅类型、单品、服务项目的关联关系设计

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支 `017-scenario-package` 与 active_spec 一致
- [x] **测试驱动开发**: 规划中包含完整的测试策略（单元测试、集成测试、E2E测试）
- [x] **组件化架构**: 采用 Atomic Design，组件分层清晰（atoms/molecules/organisms）
- [x] **数据驱动状态管理**: 使用 Zustand + TanStack Query 管理状态
- [x] **代码质量工程化**: TypeScript 类型检查、ESLint、Java 静态检查、代码注释规范
- [x] **后端技术栈约束**: Spring Boot + Supabase 统一后端栈，Supabase 为主要数据源

### 性能与标准检查：
- [x] **性能标准**: 列表加载<2s，定价计算<1s，符合<3s启动、<500ms切换要求
- [x] **安全标准**: 使用 Zod 验证、图片格式/大小验证、乐观锁防并发冲突
- [x] **可访问性标准**: Ant Design 组件支持 WCAG 2.1 AA，需验证键盘导航

### API 响应格式标准化检查：
- [x] **统一响应格式**: 所有 API 使用 `ApiResponse<T>` 包装，列表响应包含 `{ success, data, total }`
- [x] **错误响应格式**: 使用 `ErrorResponse` 结构，包含 `{ success: false, error, message }`
- [x] **前后端契约对齐**: 将在 Phase 1 生成 `contracts/api.yaml` 定义所有接口

## Project Structure

### Documentation (this feature)

```text
specs/017-scenario-package/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (to be generated)
├── data-model.md        # Phase 1 output (to be generated)
├── quickstart.md        # Phase 1 output (to be generated)
├── contracts/           # Phase 1 output (to be generated)
│   └── api.yaml        # OpenAPI specification
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── features/
│   │   └── scenario-package-management/
│   │       ├── components/
│   │       │   ├── atoms/           # 基础 UI 元素（ImageUpload、StatusBadge）
│   │       │   ├── molecules/       # 组合组件（PackageForm、PricingCalculator）
│   │       │   └── organisms/       # 复杂组件（PackageList、PackageEditor）
│   │       ├── hooks/               # 自定义 hooks（usePackageList、usePricing）
│   │       ├── services/            # API 服务（packageService.ts）
│   │       ├── types/               # TypeScript 类型定义
│   │       ├── stores/              # Zustand stores（packageStore.ts）
│   │       └── utils/               # 工具函数（pricingCalculator.ts）
│   └── pages/
│       └── scenario-packages/       # 场景包管理页面
│           ├── list.tsx            # 列表页
│           ├── create.tsx          # 创建页
│           ├── edit.tsx            # 编辑页
│           └── preview.tsx         # 预览页

backend/
└── src/main/java/com/cinema/
    ├── scenariopackage/
    │   ├── controller/              # REST Controllers
    │   │   └── ScenarioPackageController.java
    │   ├── service/                 # Business logic
    │   │   ├── ScenarioPackageService.java
    │   │   ├── ImageUploadService.java
    │   │   └── PricingService.java
    │   ├── repository/              # Supabase data access
    │   │   └── ScenarioPackageRepository.java
    │   ├── model/                   # Domain models
    │   │   ├── ScenarioPackage.java
    │   │   ├── PackageRule.java
    │   │   ├── PackageContent.java
    │   │   └── PackagePricing.java
    │   └── dto/                     # Data Transfer Objects
    │       ├── ScenarioPackageDTO.java
    │       ├── CreatePackageRequest.java
    │       └── UpdatePackageRequest.java
```

**Structure Decision**: Full-stack application with feature-based frontend architecture and layered backend architecture. Frontend follows Atomic Design for components, backend follows standard Spring Boot layering (Controller → Service → Repository).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

---

## Phase 0: Research & Technical Decisions

*Output: `research.md`*

### Research Tasks

1. **Supabase Storage Integration with Spring Boot**
   - Research: Supabase Storage Java SDK usage and best practices
   - Research: File upload patterns (direct upload vs presigned URLs)
   - Research: Image processing and validation strategies

2. **Version Management for Published Packages**
   - Research: Database schema design for versioning
   - Research: Version creation triggers and data migration strategies
   - Research: Impact on existing orders and data integrity

3. **Optimistic Locking in Supabase PostgreSQL**
   - Research: Version-based optimistic locking implementation
   - Research: Conflict detection and resolution strategies
   - Research: Integration with Spring Data JPA or Supabase SDK

4. **Multi-Entity Relationship Design**
   - Research: Association patterns for Package-Hall, Package-Item, Package-Service
   - Research: Junction table design and indexing strategies
   - Research: Query optimization for complex relationships

5. **Pricing Calculation & Reference Price Logic**
   - Research: Real-time calculation vs cached values
   - Research: Handling price changes in referenced items
   - Research: Discount percentage calculation edge cases

---

## Phase 1: Data Model & API Contracts

*Output: `data-model.md`, `contracts/api.yaml`, `quickstart.md`*

### Data Model (to be generated in `data-model.md`)

**Core Entities** (based on spec.md Key Entities):
- ScenarioPackage（场景包）
- PackageRule（场景包规则）
- PackageContent（场景包内容）
- PackageBenefit（场景包硬权益）
- PackageItem（场景包单品项）
- PackageService（场景包服务项）
- PackagePricing（场景包定价）
- PackageVersion（场景包版本）

**Relationships**:
- ScenarioPackage 1:1 PackageRule
- ScenarioPackage 1:1 PackagePricing
- ScenarioPackage 1:N PackageContent
- ScenarioPackage M:N HallType (via junction table)
- ScenarioPackage 1:N PackageVersion

### API Contracts (to be generated in `contracts/api.yaml`)

**Key Endpoints** (based on Functional Requirements):
- `POST /api/scenario-packages` - Create scenario package (FR-001)
- `GET /api/scenario-packages` - List scenario packages with filters (FR-015)
- `GET /api/scenario-packages/{id}` - Get package details
- `PUT /api/scenario-packages/{id}` - Update package (FR-001, concurrency control FR-017)
- `DELETE /api/scenario-packages/{id}` - Soft delete package (FR-012)
- `POST /api/scenario-packages/{id}/publish` - Publish package (FR-009, FR-010)
- `POST /api/scenario-packages/{id}/unpublish` - Unpublish package (FR-011)
- `POST /api/scenario-packages/{id}/image` - Upload background image (FR-001a)
- `GET /api/scenario-packages/{id}/pricing/reference` - Calculate reference price (FR-005)

---

## Phase 2: Task Breakdown

*NOT generated by this command - use `/speckit.tasks` separately*

Task generation will be triggered by the `/speckit.tasks` command and output to `tasks.md`.

---

## Next Steps

1. ✅ Constitution Check passed - proceeding to Phase 0
2. 🔄 Execute Phase 0: Generate `research.md` to resolve all NEEDS CLARIFICATION items
3. ⏳ Execute Phase 1: Generate `data-model.md`, `contracts/api.yaml`, `quickstart.md`
4. ⏳ Update agent context via `.specify/scripts/bash/update-agent-context.sh`
5. ⏳ Re-validate Constitution Check after Phase 1 design
6. ⏳ Use `/speckit.tasks` to generate implementation tasks in `tasks.md`
