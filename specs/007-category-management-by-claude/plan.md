# Implementation Plan: 类目管理 (Category Management) - 纯前端实现

**Branch**: `007-category-management` | **Date**: 2025-01-27 | **Spec**: [./spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-category-management/spec.md`
**Scope**: 纯前端UI实现，通过Mock数据模拟后端API，不考虑权限控制与后端开发

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

基于用户需求澄清，实现影院商品管理中台的类目管理功能纯前端UI。系统需要支持三级类目树结构展示、类目基本信息管理、属性模板配置等功能，作为SPU前置主数据管理。采用React 18 + TypeScript + Ant Design 6.1.0前端技术栈，使用Mock数据服务模拟后端API，不考虑权限控制与后端开发。

## Technical Context

**Language/Version**: TypeScript 5.0.4 + React 18.2.0
**Primary Dependencies**: React 18.2.0, Ant Design 6.1.0, Zustand 5.0.9, TanStack Query 5.90.12, React Router 7.10.1, MSW 2.12.4
**Storage**: Mock data (in-memory state + MSW handlers + localStorage for persistence)
**Testing**: Vitest + React Testing Library + Playwright (可选)
**Target Platform**: Web application (desktop browser)
**Project Type**: Web application (frontend-only with mock backend)
**Performance Goals**: 类目树加载<3秒(500节点)，搜索响应<2秒(1000节点)，操作响应<1秒
**Constraints**: 必须使用项目宪章指定的技术栈，严格遵循TanStack Query v5使用规范，不考虑权限控制
**Scale/Scope**: 支持最多1000个类目节点，三层结构，纯前端UI实现

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

[Gates determined based on constitution file]

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
# Web application structure for Category Management feature
frontend/
├── src/
│   ├── pages/
│   │   └── category-management/
│   │       ├── CategoryManagement.tsx      # Main category management page
│   │       ├── components/
│   │       │   ├── CategoryTree.tsx       # Left side category tree component
│   │       │   ├── CategoryDetail.tsx     # Right side category detail panel
│   │       │   ├── CategoryForm.tsx       # Category create/edit modal
│   │       │   └── AttributeTemplate.tsx  # Attribute template configuration
│   │       └── types/
│   │           └── category.types.ts      # TypeScript type definitions
│   ├── services/
│   │   ├── category/
│   │   │   ├── categoryService.ts         # API service functions
│   │   │   ├── categoryQueries.ts         # TanStack Query hooks
│   │   │   └── categoryMutations.ts       # TanStack Query mutations
│   │   └── queryKeys.ts                   # Centralized query keys management
│   ├── stores/
│   │   └── categoryStore.ts               # Zustand store for UI state
│   ├── mocks/
│   │   └── handlers/
│   │       └── categoryHandlers.ts        # MSW handlers for category API
│   └── utils/
│       └── categoryUtils.ts               # Utility functions
└── tests/
    ├── category-management/
    │   ├── CategoryManagement.test.tsx
    │   └── components/
    └── services/
        └── category/
            └── categoryService.test.ts
```

**Structure Decision**: 采用Web应用结构，因为类目管理是纯前端功能，使用Mock数据模拟后端API。目录结构遵循功能模块化原则，将类目管理相关的所有代码组织在`pages/category-management/`目录下，包含页面组件、业务逻辑、类型定义、测试等完整模块。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
