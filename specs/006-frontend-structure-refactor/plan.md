# Implementation Plan: 前端路径结构优化

**Branch**: `006-frontend-structure-refactor` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-frontend-structure-refactor/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

本功能专注于前端项目路径结构的优化和整合，将分散在根目录的 `src/` 和 `tests/` 目录以及 `frontend/Cinema_Operation_Admin/` 目录下的源代码和测试文件统一合并到 `frontend/src/` 和 `frontend/tests/` 目录下，消除路径混乱，简化项目结构。重构涉及文件移动、路径合并、导入路径更新、配置文件调整等操作，确保重构后所有功能正常工作。

## Technical Context

**Language/Version**: TypeScript 5.0.4, React 18.2.0  
**Primary Dependencies**: Vite 6.0.7, Ant Design 6.1.0, Zustand 5.0.9, TanStack Query 5.90.12, React Router 6, React Hook Form 7.68.0, Zod 4.1.13  
**Storage**: N/A (前端文件系统重构，不涉及数据存储)  
**Testing**: Vitest (单元测试), Playwright (E2E测试)  
**Target Platform**: Web Browser (现代浏览器，支持ES2022)  
**Project Type**: web (前端Web应用)  
**Performance Goals**: N/A (重构任务，不涉及性能优化)  
**Constraints**: 
- 必须确保重构后所有功能正常工作，不破坏现有功能
- 不能丢失任何源代码文件
- 必须处理同名文件冲突
- 必须更新所有导入路径和配置文件
- 必须确保构建和测试流程正常工作  
**Scale/Scope**: 
- 根目录 `src/` 约 20+ 文件
- 根目录 `tests/` 约 10+ 文件
- `frontend/Cinema_Operation_Admin/src/` 约 150+ 文件
- `frontend/Cinema_Operation_Admin/tests/` 约 30+ 文件
- 需要更新所有导入路径引用 `@admin/*` 的文件

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 技术栈合规性检查
- ✅ **前端框架**: React 18.2.0 (符合要求)
- ✅ **编程语言**: TypeScript 5.0.4 (符合要求)
- ✅ **UI 库**: Ant Design 6.1.0 (符合要求)
- ✅ **构建工具**: Vite 6.0.7 (符合要求)
- ✅ **状态管理**: Zustand (符合要求)
- ✅ **数据获取**: TanStack Query (符合要求)
- ✅ **路由**: React Router 6 (符合要求)
- ✅ **测试框架**: Vitest (单元测试), Playwright (E2E测试) (符合要求)

### 开发规范合规性检查
- ✅ **代码风格**: 使用 TypeScript 和 ESLint/Prettier (符合要求)
- ✅ **Git 工作流**: 使用功能分支 `006-frontend-structure-refactor` (符合要求)
- ✅ **提交规范**: 遵循 `type(scope): description` 格式 (符合要求)
- ✅ **文档语言**: 使用中文编写文档 (符合要求)

### 架构原则合规性检查
- ✅ **前端架构**: React 18 组件化架构 (符合要求)
- ✅ **项目结构**: 按功能模块组织代码结构 (符合要求)

### 结论
**PASS**: 本重构任务完全符合项目宪章要求，无需特殊处理。

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

#### 当前目录结构（重构前）

```text
项目根目录/
├── src/                          # 根目录源代码 (需要合并)
│   ├── App.tsx
│   ├── main.tsx
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── router/
│   ├── services/
│   ├── stores/
│   ├── styles/
│   ├── types/
│   └── utils/
│
├── tests/                        # 根目录测试文件 (需要合并)
│   ├── setup.ts
│   ├── e2e/
│   └── unit/
│
└── frontend/
    ├── src/                      # 现有前端源代码
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── stores/
    │   ├── types/
    │   └── ...
    │
    ├── tests/                    # 现有测试文件
    │   ├── e2e/
    │   └── ...
    │
    ├── Cinema_Operation_Admin/   # 嵌套目录 (需要合并后删除)
    │   ├── src/                  # 需要合并到 frontend/src/
    │   │   ├── App.tsx
    │   │   ├── main.tsx
    │   │   ├── components/
    │   │   ├── pages/
    │   │   ├── stores/
    │   │   ├── types/
    │   │   └── ...
    │   │
    │   └── tests/                # 需要合并到 frontend/tests/
    │       └── ...
    │
    ├── vite.config.ts            # 需要更新路径别名配置
    ├── tsconfig.app.json         # 需要更新路径映射
    └── package.json              # 可能需要合并依赖
```

#### 目标目录结构（重构后）

```text
项目根目录/
└── frontend/
    ├── src/                      # 统一的前端源代码目录
    │   ├── App.tsx               # 合并后的应用入口
    │   ├── main.tsx              # 合并后的入口文件
    │   ├── components/           # 合并所有组件
    │   ├── pages/                # 合并所有页面
    │   ├── hooks/                # 合并所有钩子
    │   ├── services/             # 合并所有服务
    │   ├── stores/               # 合并所有状态管理
    │   ├── types/                # 合并所有类型定义
    │   ├── utils/                # 合并所有工具函数
    │   ├── router/               # 合并后的路由配置
    │   ├── styles/               # 合并后的样式文件
    │   └── ...                   # 其他目录
    │
    ├── tests/                    # 统一的测试目录
    │   ├── setup.ts              # 合并后的测试配置
    │   ├── e2e/                  # E2E 测试
    │   └── unit/                 # 单元测试
    │
    ├── vite.config.ts            # 更新后的构建配置（移除 @admin 别名）
    ├── tsconfig.app.json         # 更新后的 TypeScript 配置（移除 @admin/* 映射）
    └── package.json              # 合并后的依赖配置
```

**Structure Decision**: 
- 采用 Option 2 (Web application) 结构，保持 `frontend/` 作为前端项目根目录
- 将根目录的 `src/` 和 `tests/` 合并到 `frontend/src/` 和 `frontend/tests/`
- 将 `frontend/Cinema_Operation_Admin/` 下的 `src/` 和 `tests/` 合并到 `frontend/src/` 和 `frontend/tests/`
- 删除 `frontend/Cinema_Operation_Admin/` 目录
- 统一使用 `@/` 路径别名，移除 `@admin/` 别名

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

无违反项目宪章的情况，本重构任务完全符合规范要求。

## Implementation Phases

### Phase 0: Outline & Research ✅

**状态**: 已完成  
**完成日期**: 2025-01-27

**输出文档**:
- ✅ [research.md](./research.md) - 技术调研文档，包含：
  - 文件合并策略决策
  - 路径别名更新策略
  - package.json 依赖合并策略
  - 测试配置文件合并策略
  - 构建和类型检查验证策略

**关键决策**:
- 采用分层合并策略，优先级：frontend/src/ > Cinema_Operation_Admin/src/ > 根目录 src/
- 使用批量替换更新 @admin 导入路径
- 合并依赖时保留高版本
- 分阶段验证确保重构质量

### Phase 1: Design & Contracts ✅

**状态**: 已完成  
**完成日期**: 2025-01-27

**输出文档**:
- ✅ [data-model.md](./data-model.md) - 数据模型文档，描述：
  - 文件结构实体模型
  - 路径别名映射关系
  - 文件导入关系
  - 文件冲突处理模型
  - 验证模型
- ✅ [quickstart.md](./quickstart.md) - 快速开始指南，包含：
  - 前置条件检查
  - 详细执行步骤
  - 常见问题解答
  - 验证清单
- ✅ [contracts/](./contracts/) - 合约目录（本功能不涉及 API，目录保留）

**Constitution Check (Post-Design)**:
- ✅ 重新检查：所有技术决策符合项目宪章要求
- ✅ 无新增违反项

**Agent Context Update**:
- ✅ 已完成：已运行 `.specify/scripts/bash/update-agent-context.sh claude` 更新 AI 代理上下文
- ✅ CLAUDE.md 已更新，添加了 TypeScript 5.0.4, React 18.2.0 等技术栈信息

### Phase 2: Task Planning

**状态**: 待执行  
**说明**: 使用 `/speckit.tasks` 命令生成详细任务列表

---

## Next Steps

1. ✅ Phase 0 和 Phase 1 已完成
2. ✅ Agent context 已更新
3. ⏳ 执行 Phase 2：生成详细任务列表 (`/speckit.tasks`)
4. ⏳ 开始实施重构任务

## Summary

**计划完成状态**: Phase 0 和 Phase 1 已完成

**生成的文档**:
- ✅ `plan.md` - 实现计划（本文档）
- ✅ `research.md` - 技术调研文档
- ✅ `data-model.md` - 数据模型文档
- ✅ `quickstart.md` - 快速开始指南
- ✅ `contracts/README.md` - 合约目录说明

**已完成的检查**:
- ✅ Constitution Check 通过
- ✅ Agent context 已更新

**下一步**: 运行 `/speckit.tasks` 命令生成详细的任务列表，然后开始实施重构。
