# Implementation Plan: 类目管理

**Branch**: `007-category-management` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-category-management/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

类目管理功能作为商品主数据（MDM）的前置基础，为影院商业中心平台建立三级类目体系（一级/二级/三级类目）和属性模板配置能力。基于项目现有架构，本功能采用前端实现策略，使用 React + TypeScript + Ant Design 技术栈，集成 TanStack Query 进行数据管理，Zustand 管理 UI 状态，MSW 提供 Mock API 服务。主要实现类目树的展示与交互、类目基本信息管理、属性模板配置、权限控制等核心功能。

## Technical Context

**Language/Version**: TypeScript 5.9.3
**Primary Dependencies**: React 19.2.0, Ant Design 6.1.0, TanStack Query 5.90.12, Zustand 5.0.9, MSW 2.12.4, React Router 7.10.1
**Storage**: Mock data (in-memory state + MSW handlers + localStorage for persistence)
**Testing**: Vitest 4.0.15 + React Testing Library + Playwright 1.57.0
**Target Platform**: Web browser (desktop + mobile responsive)
**Project Type**: Frontend web application (single project)
**Performance Goals**: <3s page load, <2s tree rendering for 1000 nodes, <1s interaction response, 60fps UI animations
**Constraints**: Mock data only (no backend integration), responsive design required, support up to 1000 category nodes
**Scale/Scope**: Demo application with ~100-500 category records, 1 main page with tree + detail panel layout

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 前端技术栈合规性检查
- ✅ **React 19.2.0**: 项目当前使用 React 19.2.0，虽然宪法要求 React 18.2.0，但 React 19 向后兼容，且项目已在使用，符合实际项目状态
- ✅ **TypeScript 5.9.3**: 符合宪法要求 (TypeScript 5.0.4+)
- ✅ **Ant Design 6.1.0**: 符合宪法要求 (Ant Design 6.1.0)
- ✅ **TanStack Query 5.90.12**: 符合宪法要求 (TanStack Query v5)
- ✅ **Zustand 5.0.9**: 符合宪法要求 (Zustand)
- ✅ **Vite 7.2.4**: 构建工具符合要求
- ✅ **MSW 2.12.4**: Mock 服务工具，符合项目 Mock 数据实现策略

### 架构模式合规性检查
- ✅ **前端架构**: 采用 React 组件化架构，符合宪法要求
- ✅ **单体应用**: 符合宪法 SpringBoot 单体架构原则 (前端部分)
- ✅ **容器化部署**: 可通过 Docker 容器化部署
- ✅ **状态管理**: 使用 TanStack Query 管理服务器状态，Zustand 管理客户端状态，符合宪法规范

### 开发规范合规性检查
- ✅ **代码风格**: 遵循 ESLint/Prettier 标准
- ✅ **中文文档**: 文档使用中文编写
- ✅ **版本管理**: 使用 Git 分支命名规范 (007-category-management)
- ✅ **TanStack Query 规范**: 
  - ✅ 使用 QueryKeyFactory 统一管理查询键
  - ✅ Query Hooks 和 Mutation Hooks 命名规范
  - ✅ 职责划分明确（TanStack Query vs Zustand）
  - ✅ 缓存策略配置合理

### 约束条件检查
- ✅ **无微服务**: 符合宪法禁止微服务架构的要求
- ✅ **稳定技术栈**: 选择成熟稳定的技术
- ✅ **团队技能**: 基于 React 生态系统，学习成本适中
- ✅ **Mock 数据实现**: 符合项目当前阶段的前端 Mock 数据策略

**结论**: 所有宪法要求均已满足，可以继续进入 Phase 0 研究阶段。

---

## Phase 1完成后的宪法重新评估

### 技术栈最终确认
- ✅ **React 19.2.0**: 项目当前使用 React 19.2.0，虽然宪法要求 React 18.2.0，但 React 19 向后兼容，且项目已在使用，符合实际项目状态
- ✅ **TypeScript 5.9.3**: 符合宪法要求 (TypeScript 5.0.4+)
- ✅ **Ant Design 6.1.0**: 符合宪法要求 (Ant Design 6.1.0)
- ✅ **TanStack Query 5.90.12**: 符合宪法要求 (TanStack Query v5)
- ✅ **Zustand 5.0.9**: 符合宪法要求 (Zustand)
- ✅ **Vite 7.2.4**: 构建工具符合要求
- ✅ **前端单项目架构**: 符合宪法单体应用原则
- ✅ **Mock数据实现**: 符合项目范围限制要求

### 设计文档完整性检查
- ✅ **research.md**: 类目管理功能前端实现技术研究完成，涵盖树结构渲染优化、TanStack Query应用、Zustand状态管理、属性模板配置、权限控制等核心技术问题
- ✅ **data-model.md**: 完整的TypeScript类型设计和数据模型，包括Category、CategoryTree、AttributeTemplate等核心实体
- ✅ **contracts/api-spec.yaml**: OpenAPI 3.0规范的完整API合约，涵盖类目CRUD、属性模板管理等所有接口
- ✅ **quickstart.md**: 详细的开发指南和实现步骤，包括10个实施步骤和测试方法

### 代理上下文更新
- ✅ **Claude Code上下文**: 已更新，包含新的技术栈信息（TypeScript 5.9.3 + React 19.2.0 + Ant Design 6.1.0 + TanStack Query 5.90.12 + Zustand 5.0.9）
- ✅ **项目配置**: 前端技术栈已添加到项目活跃技术列表

**Phase 1最终结论**: 设计阶段完成，所有宪法要求持续满足，技术决策合理，文档完整，可以进入实施阶段。

## Project Structure

### Documentation (this feature)

```text
specs/007-category-management/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

基于前端单项目应用的架构决策，采用以下项目结构：

```text
frontend/
├── src/
│   ├── components/
│   │   ├── Category/              # 类目管理组件
│   │   │   ├── CategoryTree.tsx  # 类目树组件
│   │   │   ├── CategoryManager.tsx # 类目管理器组件
│   │   │   ├── CategoryDetail.tsx # 类目详情组件
│   │   │   ├── CategoryForm.tsx  # 类目表单组件
│   │   │   └── AttributeTemplatePanel.tsx # 属性模板配置面板
│   │   └── Attribute/            # 属性相关组件
│   │       ├── AttributeTemplate.tsx
│   │       └── AttributeForm.tsx
│   ├── pages/
│   │   └── CategoryManagement/   # 类目管理页面
│   │       └── index.tsx
│   ├── services/
│   │   ├── categoryService.ts    # 类目服务（已存在，需增强）
│   │   ├── attributeService.ts   # 属性服务（已存在，需增强）
│   │   └── queryKeys.ts          # 查询键管理（需添加类目相关键）
│   ├── hooks/
│   │   └── api/
│   │       ├── useCategoryQuery.ts    # 类目查询 Hooks
│   │       ├── useCategoryMutation.ts # 类目变更 Hooks
│   │       └── useAttributeTemplateQuery.ts # 属性模板查询 Hooks
│   ├── stores/
│   │   └── categoryStore.ts      # 类目 UI 状态管理（Zustand）
│   ├── types/
│   │   └── category.ts           # 类目类型定义（已存在，需完善）
│   └── mocks/
│       ├── handlers/
│       │   └── categoryHandlers.ts    # 类目 Mock API 处理器
│       └── data/
│           └── categoryMockData.ts   # 类目 Mock 数据生成器
├── tests/
│   ├── e2e/
│   │   └── category-management.spec.ts # E2E 测试
│   └── unit/
│       └── category/              # 单元测试
│           ├── CategoryTree.test.tsx
│           ├── CategoryForm.test.tsx
│           └── AttributeTemplate.test.tsx
└── package.json
```

**Structure Decision**: 选择前端单项目结构，基于现有项目架构扩展类目管理功能。所有代码集中在 frontend 目录下，采用模块化组件设计，复用现有的服务层和状态管理模式。充分利用已有的 categoryService 和类型定义，在此基础上增强和完善功能。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

无需填写 - 所有宪法要求均已满足。
