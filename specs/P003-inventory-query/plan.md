# Implementation Plan: 门店SKU库存查询

**Branch**: `P003-inventory-query` | **Date**: 2025-12-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/P003-inventory-query/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

实现门店SKU库存查询功能，支持店长查看门店库存列表（含现存/可用/预占数量和五级状态标签）、按SKU名称/编码搜索、按门店/库存状态/商品分类多维筛选、查看SKU库存详情。技术方案采用B端React+Ant Design前端 + Spring Boot后端 + Supabase数据库。

## Technical Context

**Language/Version**:
- B端（管理后台）: TypeScript 5.9.3 + React 19.2.0 (frontend), Java 21 + Spring Boot 3.x (backend)

**Primary Dependencies**:
- 前端: Ant Design 6.1.0 (Table/Select/Tag/Drawer), Zustand 5.0.9, TanStack Query 5.90.12, React Router 7.10.1, MSW 2.12.4
- 后端: Spring Boot Web, Supabase Java/HTTP client

**Storage**: Supabase (PostgreSQL) - 使用现有 `inventory` 表，关联 `skus`、`stores`、`categories` 表

**Testing**: Vitest (unit tests) + Playwright (e2e tests) + Testing Library

**Target Platform**: B端 Web browser + Spring Boot backend API

**Project Type**: Full-stack web application (B端管理后台库存查询模块)

**Performance Goals**:
- 列表加载 <2s (FR-003)
- 搜索响应 <1s (SC-002)
- 详情展开 <500ms (SC-006)
- 支持1000+ SKU流畅浏览 (SC-004)

**Constraints**:
- 必须遵循功能分支绑定、测试驱动开发、组件化架构
- 必须使用 React + Ant Design (B端技术栈)
- 必须使用 Spring Boot + Supabase (后端技术栈)

**Scale/Scope**:
- 前端: 1个列表页面 + 筛选组件 + 详情抽屉
- 后端: 1个查询API端点(支持分页/搜索/筛选)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支 `P003-inventory-query` = active_spec `specs/P003-inventory-query` ✅
- [x] **测试驱动开发**: 计划先编写E2E测试(列表/搜索/筛选场景)，再实现功能
- [x] **组件化架构**: 采用原子设计 - InventoryTable(organism) + FilterBar(molecule) + StatusTag(atom)
- [x] **前端技术栈分层**: 本功能为B端管理后台，使用 React + Ant Design
- [x] **数据驱动状态管理**: 使用 TanStack Query 管理库存数据查询，Zustand 管理筛选状态
- [x] **代码质量工程化**: TypeScript 严格模式 + ESLint + Prettier + 质量门禁
- [x] **后端技术栈约束**: Spring Boot + Supabase PostgreSQL

### 性能与标准检查：
- [x] **性能标准**: 列表加载<2s，1000+ SKU 使用 Ant Design Table 内置分页
- [x] **安全标准**: Zod 验证筛选参数，后端权限校验门店访问范围
- [x] **可访问性标准**: Ant Design 内置 ARIA 支持，Table 支持键盘导航

## Project Structure

### Documentation (this feature)

```text
specs/P003-inventory-query/
├── spec.md              # 功能规格
├── plan.md              # 实现计划 (本文件)
├── research.md          # Phase 0 研究输出 ✅
├── data-model.md        # Phase 1 数据模型 ✅
├── quickstart.md        # Phase 1 快速开始指南 ✅
├── contracts/
│   └── api.yaml         # Phase 1 API契约 ✅
└── tasks.md             # Phase 2 任务列表 (待 /speckit.tasks 生成)
```

### Source Code (this feature)

```text
backend/src/main/java/com/cinema/inventory/
├── domain/
│   ├── StoreInventory.java      # 门店库存实体
│   ├── Category.java            # 商品分类实体
│   └── InventoryStatus.java     # 库存状态枚举
├── repository/
│   ├── StoreInventoryRepository.java
│   └── CategoryRepository.java
├── service/
│   └── InventoryService.java    # 库存查询服务
├── controller/
│   └── InventoryController.java # 库存API控制器
└── dto/
    ├── InventoryQueryParams.java
    ├── InventoryListResponse.java
    └── InventoryDetailResponse.java

backend/src/main/resources/db/migration/
└── V029__create_store_inventory.sql  # 数据库迁移

frontend/src/
├── features/inventory/
│   ├── components/
│   │   ├── InventoryFilterBar.tsx     # 筛选栏组件
│   │   ├── InventoryTable.tsx         # 库存列表表格
│   │   ├── InventoryStatusTag.tsx     # 状态标签组件
│   │   └── InventoryDetailDrawer.tsx  # 详情抽屉组件
│   ├── hooks/
│   │   └── useInventory.ts            # 库存查询hooks
│   ├── services/
│   │   └── inventoryService.ts        # API服务
│   └── types/
│       └── index.ts                   # 类型定义
├── pages/inventory/
│   └── InventoryPage.tsx              # 库存查询页面
└── types/
    └── inventory.ts                   # 复用现有类型定义
```

**Structure Decision**: Full-stack B端管理后台模块，采用 Spring Boot 后端 + React 前端的分层架构。前端遵循 feature-based 模块化设计，后端遵循 DDD 分层架构。

## Complexity Tracking

> **No violations detected - Constitution Check passed**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

## Generated Artifacts

| Artifact | Path | Status |
|----------|------|--------|
| Research | `specs/P003-inventory-query/research.md` | ✅ Complete |
| Data Model | `specs/P003-inventory-query/data-model.md` | ✅ Complete |
| API Contract | `specs/P003-inventory-query/contracts/api.yaml` | ✅ Complete |
| Quickstart | `specs/P003-inventory-query/quickstart.md` | ✅ Complete |

## Next Steps

运行 `/speckit.tasks` 生成任务列表，然后运行 `/speckit.implement` 开始实现。
