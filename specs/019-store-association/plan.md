# Implementation Plan: 场景包场馆关联配置

**Branch**: `019-store-association` | **Date**: 2025-12-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/019-store-association/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

为B端场景包管理功能新增「场馆关联」配置界面，允许运营人员在场景包编辑页面选择关联的门店（stores）。通过新增独立的多对多关联表 `scenario_package_store_associations` 实现场景包与门店的关联关系，支持多选、搜索筛选和回显功能。技术上复用现有的 Tag.CheckableTag 多选 UI 模式和 stores API 数据源。

## Technical Context

**Language/Version**:
- B端（管理后台）: TypeScript 5.9.3 + React 19.2.0 (frontend), Java 21 + Spring Boot 3.x (backend)
- 本功能为纯 B端 功能，不涉及 C端（无 Taro 开发）

**Primary Dependencies**:
- Frontend: Ant Design 6.1.0 (Tag.CheckableTag), TanStack Query 5.90.12, React Router 7.10.1
- Backend: Spring Boot Web, Supabase Java Client
- 现有依赖: 017-scenario-package（场景包编辑页面）, 014-hall-store-backend（stores 表和 API）

**Storage**:
- Supabase PostgreSQL - 新增 `scenario_package_store_associations` 关联表
- 复用现有 `stores` 表（来自 014-hall-store-backend）
- 复用现有 `scenario_packages` 表（来自 017-scenario-package）

**Testing**:
- B端: Vitest (unit tests) + Playwright (e2e tests) + Testing Library
- 重点测试: 多选交互、数据保存、回显加载、搜索筛选

**Target Platform**:
- B端: Web browser (Chrome, Firefox, Safari, Edge) + Spring Boot backend API

**Project Type**:
- B端功能扩展：在现有场景包编辑页面新增门店关联配置区域

**Performance Goals**:
- 门店列表加载: <2秒（支持100+门店）
- 搜索筛选响应: <500ms
- 保存关联关系: <1秒

**Constraints**:
- 必须使用 Ant Design 组件（B端规范）
- 必须通过 TanStack Query 调用 API
- 必须复用现有 storeService.getStores() 获取门店数据
- 数据库变更需通过 Flyway 迁移脚本

**Scale/Scope**:
- 预期门店数量: 10-100 个
- 预期场景包数量: 50-200 个
- 单个场景包关联门店: 1-20 个

**Existing Patterns to Follow**:
- 多选 UI: 复用 `Tag.CheckableTag` 模式（已在 hallTypeIds 中使用）
- API 服务: 遵循 `ListResponse<T>` 和 `ApiResponse<T>` 响应格式
- 关联表结构: 参考 `package_hall_associations` 表设计

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支 `019-store-association` 与 active_spec 匹配 ✓
- [x] **测试驱动开发**: 计划先编写 E2E 测试（门店选择、保存、回显）再实现功能 ✓
- [x] **组件化架构**: 新增 StoreSelector 组件，复用 Tag.CheckableTag 原子组件 ✓
- [x] **前端技术栈分层**: 本功能为纯 B端，使用 React + Ant Design，不涉及 C端 ✓
- [x] **数据驱动状态管理**: 使用 TanStack Query 获取门店数据，本地 useState 管理选中状态 ✓
- [x] **代码质量工程化**: 遵循 TypeScript 严格模式，ESLint 检查，Prettier 格式化 ✓
- [x] **后端技术栈约束**: 使用 Spring Boot + Supabase，新增迁移脚本创建关联表 ✓

### 性能与标准检查：
- [x] **性能标准**: 门店列表<100个无需虚拟滚动，加载时间<2秒符合要求 ✓
- [x] **安全标准**: 复用现有 API 认证机制，前端使用 Zod 验证（可选） ✓
- [x] **可访问性标准**: 使用 Ant Design 组件自带无障碍支持 ✓

**Gate Status**: ✅ PASSED - 所有宪法原则检查通过，可进入 Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/019-store-association/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── api.yaml         # OpenAPI 3.0 specification
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code Changes (repository root)

```text
frontend/src/
├── pages/scenario-packages/
│   ├── edit.tsx              # [MODIFY] 新增门店关联配置区域
│   └── create.tsx            # [MODIFY] 新增门店关联配置区域
├── features/scenario-package-management/
│   ├── components/
│   │   └── molecules/
│   │       └── StoreSelector.tsx  # [NEW] 门店多选组件
│   ├── types/
│   │   └── index.ts          # [MODIFY] 添加 Store 和关联类型
│   └── services/
│       └── packageService.ts # [MODIFY] 添加门店关联 API 调用
└── pages/stores/
    └── services/
        └── storeService.ts   # [REUSE] 复用现有门店查询服务

backend/src/main/
├── java/com/cinema/scenariopackage/
│   ├── model/
│   │   └── ScenarioPackageStoreAssociation.java  # [NEW] 关联实体
│   ├── repository/
│   │   └── StoreAssociationRepository.java       # [NEW] 关联数据访问
│   ├── service/
│   │   └── ScenarioPackageService.java           # [MODIFY] 添加门店关联逻辑
│   ├── controller/
│   │   └── ScenarioPackageController.java        # [MODIFY] 扩展 API 端点
│   └── dto/
│       └── ScenarioPackageDTO.java               # [MODIFY] 添加 storeIds 字段
└── resources/db/migration/
    └── V5__add_store_associations.sql            # [NEW] 关联表迁移脚本
```

**Structure Decision**: 扩展现有场景包管理模块，复用 stores 服务，新增独立的门店关联组件。遵循现有代码组织模式。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | 无违规 | 所有宪法原则检查通过 |

**复杂度评估**: 低复杂度功能
- 复用现有 UI 模式（Tag.CheckableTag）
- 复用现有 API 服务（storeService）
- 新增独立关联表（标准多对多模式）
- 无新技术引入
