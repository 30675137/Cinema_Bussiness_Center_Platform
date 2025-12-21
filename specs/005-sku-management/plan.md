# Implementation Plan: SKU 管理

**Branch**: `005-sku-management` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-sku-management/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

本功能实现 SKU（Stock Keeping Unit，可计库存/可售的最小商品单元）管理的前端 UI，包括列表查看、检索、新建/编辑、详情查看、状态切换和选择器功能。采用 React 18 + TypeScript 5.0 + Ant Design 6.1.0 技术栈，使用 Zustand 管理 UI 状态，TanStack Query 处理数据获取和缓存，所有数据操作通过 Mock 服务实现。表单采用上下分离布局，顶部为步骤导航和操作按钮区，底部为内容录入区，状态字段统一放在页面顶部作为全局设置区域。

## Technical Context

**Language/Version**: TypeScript 5.0.4  
**Primary Dependencies**: React 18.2.0, Ant Design 6.1.0, Zustand 5.0.9, TanStack Query 5.90.12, React Router 6, React Hook Form 7.68.0, Zod 4.1.13  
**Storage**: 前端 Mock 数据（内存存储），不依赖后端数据库  
**Testing**: Playwright (E2E测试), Vitest (单元测试)  
**Target Platform**: Web浏览器（现代浏览器，支持ES2020+）  
**Project Type**: Web应用（前端单页应用）  
**Performance Goals**: 
- SKU 列表页面加载时间 < 2秒
- 搜索响应时间 < 2秒
- 表单提交成功率 > 95%
- 支持至少 1000 条 SKU 数据的分页展示  
**Constraints**: 
- 仅前端实现，不依赖后端 API
- 所有数据操作通过 Mock 服务实现
- 暂不考虑用户角色和登录验证
- 权限控制通过 Mock 权限标识实现  
**Scale/Scope**: 
- 6个用户场景（User Stories）
- 23个功能需求（Functional Requirements）
- 8个成功标准（Success Criteria）
- 预计代码量：约 5000-8000 行 TypeScript/TSX

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 技术栈合规性 ✅
- **前端框架**: React 18.2.0 ✅ (符合宪章要求)
- **语言**: TypeScript 5.0.4 ✅ (符合宪章要求)
- **UI组件库**: Ant Design 6.1.0 ✅ (符合宪章要求)
- **状态管理**: Zustand ✅ (符合宪章要求)
- **数据获取**: TanStack Query ✅ (符合宪章要求)
- **路由**: React Router 6 ✅ (符合宪章要求)
- **测试**: Playwright (E2E) + Vitest (单元) ✅ (符合宪章要求)

### 架构模式合规性 ✅
- **前端架构**: React 18组件化架构 ✅ (符合宪章要求)
- **项目类型**: Web应用（前端单页应用）✅ (符合宪章要求)
- **后端依赖**: 无后端实现，仅前端Mock ✅ (符合功能范围)

### 开发规范合规性 ✅
- **代码风格**: 遵循TypeScript标准命名约定 ✅
- **注释规范**: 关键业务逻辑添加中文注释 ✅
- **目录结构**: 按功能模块组织（components/sku, pages/product/sku）✅
- **Git工作流**: 使用功能分支 `005-sku-management` ✅

### 质量保证合规性 ✅
- **测试策略**: 根据功能优先级实现E2E和单元测试 ✅
- **代码审查**: 遵循代码审查流程 ✅
- **性能关注**: 满足成功标准中的性能要求（列表加载<2秒）✅

### 文档管理合规性 ✅
- **文档语言**: 所有文档使用中文编写 ✅
- **文档策略**: 根据实际需要编写规范、计划、数据模型等文档 ✅

**结论**: ✅ 所有宪章检查项均通过，无违规情况。

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
frontend/Cinema_Operation_Admin/
├── src/
│   ├── components/
│   │   └── sku/                    # SKU相关组件
│   │       ├── SkuForm/            # SKU表单组件（多步骤表单）
│   │       │   ├── BasicInfoTab.tsx      # 基础信息标签页
│   │       │   ├── UnitBarcodeTab.tsx    # 单位条码标签页
│   │       │   ├── SpecAttrTab.tsx       # 规格属性标签页
│   │       │   ├── OtherConfigTab.tsx    # 其他配置标签页
│   │       │   └── index.tsx              # 表单主组件
│   │       ├── SkuDetail.tsx       # SKU详情组件
│   │       ├── SkuFilters.tsx      # SKU筛选组件
│   │       ├── SkuTable.tsx        # SKU表格组件
│   │       └── SkuSelector.tsx      # SKU选择器组件（可复用）
│   ├── pages/
│   │   └── product/
│   │       └── sku/                # SKU页面
│   │           ├── SkuListPage.tsx        # SKU列表页
│   │           └── index.tsx               # 页面入口
│   ├── services/
│   │   └── mockSkuApi.ts          # SKU Mock API服务
│   ├── stores/
│   │   └── skuStore.ts            # SKU Zustand状态管理
│   ├── hooks/
│   │   └── useSku.ts              # SKU TanStack Query Hooks
│   ├── types/
│   │   └── sku.ts                 # SKU类型定义
│   └── utils/
│       └── errorHandler.ts        # 错误处理工具（已存在）
│
└── tests/
    ├── e2e/
    │   └── sku-management.spec.ts  # SKU管理E2E测试
    └── unit/
        └── sku/                   # SKU单元测试
            ├── SkuForm.test.tsx
            └── skuStore.test.ts
```

**Structure Decision**: 采用 Web 应用结构（Option 2），代码位于 `frontend/Cinema_Operation_Admin/src/` 目录下。按功能模块组织代码：
- **components/sku/**: SKU相关UI组件，包括表单、详情、筛选、表格、选择器
- **pages/product/sku/**: SKU页面组件
- **services/mockSkuApi.ts**: Mock API服务，提供所有数据操作
- **stores/skuStore.ts**: Zustand状态管理，处理UI状态（筛选、分页、排序）
- **hooks/useSku.ts**: TanStack Query Hooks，处理数据获取和缓存
- **types/sku.ts**: TypeScript类型定义，包含SKU实体和相关类型
- **tests/**: E2E和单元测试文件

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

无违规情况，无需填写此表。
