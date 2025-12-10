# Implementation Plan: 管理后台基础框架

**Branch**: `001-admin-layout` | **Date**: 2025-12-10 | **Spec**: [管理后台基础框架](spec.md)
**Input**: Feature specification from `/specs/001-admin-layout/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

管理后台基础框架将实现统一的后台布局系统，包含左侧导航菜单、顶部面包屑导航和主内容区域。该框架为耀莱影城商品管理中台提供一致的用户界面体验，支持商品管理、定价中心、审核管理和库存追溯等核心功能模块。基于React 18 + TypeScript 5.0 + Ant Design 6.x + Tailwind CSS 4技术栈，采用现代化前端架构模式。

## Technical Context

**Language/Version**: TypeScript 5.0 + React 18.2.0
**Primary Dependencies**: Ant Design 6.1.0 + Tailwind CSS 4.1.17 + React Router 6 + Zustand + TanStack Query
**Storage**: 浏览器LocalStorage (导航状态) + 内存状态管理
**Testing**: Playwright E2E测试框架
**Target Platform**: Web浏览器 (Chrome, Firefox, Safari, Edge)
**Project Type**: Web应用程序 (前端)
**Performance Goals**: 页面加载<3s，导航响应<300ms，布局切换流畅
**Constraints**: 仅支持简体中文，无需国际化，专注功能实现
**Scale/Scope**: 支持4个主要功能模块，响应式布局适配桌面端

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Required Compliance Gates

- **统一用户体验**: 界面设计必须遵循左侧导航+顶部面包屑布局，状态颜色必须使用标准系统
- **数据驱动决策**: 所有主数据操作必须支持审核流程和高亮对比，库存必须支持完整追溯
- **配置化业务管理**: 价格和业务规则必须支持配置化管理，不能硬编码业务逻辑
- **高效操作流程**: 必须优化高频操作场景，支持批量操作和智能筛选
- **渠道覆写能力**: PIM内容必须支持渠道特定的覆写机制
- **项目状态集成管理**: 项目执行必须与Notion需求管理数据库实时同步，各阶段状态自动更新
- **中文文档编写规范**: 所有项目文档必须使用简体中文编写，遵循中国大陆地区中文表达习惯

### Technical Architecture Validation

- **微服务架构**: 商品管理、库存管理、定价中心必须为独立服务
- **性能要求**: 页面加载<3s，API响应<500ms，支持1000+并发用户
- **数据一致性**: 跨服务操作必须通过事件驱动保证最终一致性
- **权限控制**: 必须实现基于角色的细粒度权限控制(RBAC)
- **前端技术栈**: 必须使用React 18 + TypeScript 5.0 + Ant Design 6.x + Tailwind CSS 4技术栈
- **前端测试**: 前端开发完成后必须使用Playwright实现E2E测试，覆盖关键用户流程

### Development Process Validation

- **测试覆盖**: 单元测试覆盖率≥80%，集成测试覆盖核心业务流程
- **代码审查**: 所有代码必须经过至少一人审查
- **文档完整性**: API文档、用户手册、技术文档必须齐全，且全部使用中文编写

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
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout/
│   │   │   ├── Sidebar/
│   │   │   └── Breadcrumb/
│   │   └── common/
│   ├── pages/
│   │   ├── Dashboard/
│   │   ├── product/
│   │   ├── pricing/
│   │   ├── review/
│   │   └── inventory/
│   ├── hooks/
│   ├── stores/
│   ├── types/
│   ├── utils/
│   ├── styles/
│   └── App.tsx
├── public/
└── tests/
    ├── e2e/
    └── __snapshots__/
```

**Structure Decision**: 采用标准的React前端项目结构，使用features模块化架构。布局组件位于components/layout目录下，各业务模块页面分别组织在pages目录的子目录中。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
