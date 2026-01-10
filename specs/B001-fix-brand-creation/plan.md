# Implementation Plan: 品牌创建问题修复

**Branch**: `feat/B001-fix-brand-creation` | **Date**: 2026-01-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/B001-fix-brand-creation/spec.md`

## Summary

修复品牌管理模块中的两个关键缺陷：
1. **数据同步问题**：成功创建品牌后，新品牌不会出现在品牌列表中
2. **UI 重复问题**：品牌创建抽屉中包含两个相同的"新建品牌"按钮

技术方案：
- 调查并修复 TanStack Query 缓存失效逻辑
- 检查 MSW mock handler 是否正确更新内存存储
- 审查组件代码，移除重复的按钮渲染

## Technical Context

**Language/Version**:
- B端（管理后台）: TypeScript 5.9.3 + React 19.2.0 (frontend)

**Primary Dependencies**:
- B端: Ant Design 6.1.0, Zustand 5.0.9, TanStack Query 5.90.12, React Hook Form 7.68.0, Zod 4.1.13, MSW 2.12.4

**Storage**: MSW mock data (in-memory state + MSW handlers + localStorage) 进行开发模拟

**Testing**:
- B端: Vitest (unit tests) + Playwright (e2e tests - 可选) + Testing Library

**Target Platform**:
- B端: Web browser (Chrome, Firefox, Safari, Edge)

**Project Type**:
- Frontend bug fix (React frontend for B端 admin interface)

**Performance Goals**:
- 品牌创建成功后 2 秒内列表刷新显示新品牌
- 无 UI 重复元素

**Constraints**:
- 必须保持现有 API 契约（无破坏性变更）
- 必须与当前 MSW mock 设置兼容
- 不得引入新的依赖项
- 变更应限制在品牌创建和列表刷新逻辑范围内

**Scale/Scope**:
- B端品牌管理模块的局部修复
- 涉及组件：品牌列表页、品牌创建抽屉、相关 hooks 和 MSW handlers

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支 `feat/B001-fix-brand-creation` 与 spec 目录 `specs/B001-fix-brand-creation` 匹配
- [x] **测试驱动开发**: 将为品牌创建成功处理程序和列表失效逻辑编写单元测试
- [x] **组件化架构**: 修复将遵循现有的组件结构，不改变架构
- [x] **前端技术栈分层**: 仅涉及 B端 React + Ant Design，不涉及 C端
- [x] **数据驱动状态管理**: 使用 TanStack Query 管理服务器状态，修复缓存失效逻辑
- [x] **代码质量工程化**: 修复后将通过 TypeScript 类型检查和 ESLint
- [ ] **后端技术栈约束**: N/A - 本次修复仅涉及前端代码

### 性能与标准检查：
- [x] **性能标准**: 品牌创建后 2 秒内列表刷新
- [x] **安全标准**: B端暂不实现认证授权，使用 Zod 进行数据验证
- [x] **可访问性标准**: 保持现有组件的可访问性

## Project Structure

### Documentation (this feature)

```text
specs/B001-fix-brand-creation/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output - 根因分析研究
├── data-model.md        # Phase 1 output - 品牌数据模型（已存在，无需大改）
├── quickstart.md        # Phase 1 output - 开发快速入门
├── contracts/           # Phase 1 output - API 契约（已存在，无需大改）
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
frontend/src/
├── pages/brand/         # 品牌管理页面
│   └── BrandManagementPage.tsx
├── components/          # 品牌相关组件
│   └── brand/
│       ├── BrandCreateDrawer.tsx  # 品牌创建抽屉 - 需检查重复按钮
│       └── BrandList.tsx          # 品牌列表 - 需检查刷新逻辑
├── hooks/               # 品牌相关 hooks
│   └── useBrands.ts     # TanStack Query hooks - 需检查缓存失效
├── services/            # API 服务
│   └── brandService.ts  # 品牌 API 服务
└── mocks/               # MSW mock handlers
    └── handlers/
        └── brandHandlers.ts  # 品牌 mock handlers - 需检查内存更新
```

**Structure Decision**: 本次修复仅涉及现有代码的调整，不改变项目结构。

## Complexity Tracking

> 本次修复为 bug fix，无宪法违规需要说明。

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
