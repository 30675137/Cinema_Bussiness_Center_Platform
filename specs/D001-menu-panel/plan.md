# Implementation Plan: 菜单面板替换Dashboard页面

**Branch**: `D001-menu-panel` | **Date**: 2026-01-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/D001-menu-panel/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

将现有的Dashboard统计页面替换为模块化菜单面板，展示12个业务模块卡片，按照业务流程顺序排列。用户可通过点击卡片快速访问对应功能模块，提升导航效率和用户体验。

**核心目标**：
- 替换 /dashboard 路径的现有页面为新的菜单面板组件
- 展示12个业务模块的卡片式导航界面
- 支持模块卡片点击跳转、悬停效果、响应式布局
- 根据用户权限过滤模块显示

**技术方案**：
- 纯前端实现，复用现有的 AppLayout 布局结构
- 创建新的 MenuPanel 组件替换现有 Dashboard 组件
- 使用 Ant Design Card 组件构建模块卡片
- 使用 React Router 实现路由跳转
- 通过 Zustand 管理用户权限状态

## Technical Context

**Language/Version**: TypeScript 5.9.3, React 19.2.0  
**Primary Dependencies**: 
- Ant Design 6.1.0 (UI 组件库)
- React Router 7.10.1 (路由管理)
- Zustand 5.0.9 (状态管理)
- Ant Design Icons (图标库)

**Storage**: N/A (纯前端组件，无后端存储)  
**Testing**: Vitest (单元测试), Playwright (可选的E2E测试)  
**Target Platform**: Web 浏览器 (Chrome, Firefox, Safari, Edge)  
**Project Type**: Web 前端 (管理后台)  
**Performance Goals**: 
- 页面加载时间 < 2秒
- 卡片点击响应 < 300毫秒
- 首次渲染 FCP < 1秒

**Constraints**: 
- 必须兼容主流屏幕分辨率 (1920x1080, 1366x768, 2560x1440)
- 必须保持与现有 AppLayout 的一致性
- 无需后端 API，所有数据均为前端静态配置

**Scale/Scope**: 
- 12个模块卡片
- 3-5个功能链接/模块
- 预计 1-2 个新组件 + 1个页面替换

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | 状态 | 说明 |
|------|------|------|
| **一、功能分支绑定** | ✅ PASS | 分支 `D001-menu-panel` 符合命名规范，使用数字编号 001，规格文件位于 `specs/D001-menu-panel/spec.md` |
| **二、代码归属标识** | ✅ PASS | 所有新增组件必须添加 `@spec D001-menu-panel` 注释 |
| **三、测试驱动开发** | ✅ PASS | 必须编写单元测试，E2E 测试可选 |
| **四、组件化架构** | ✅ PASS | 遵循 React 组件化设计，使用 TypeScript 类型注解 |
| **五、前端技术栈分层** | ✅ PASS | B端管理后台使用 React + Ant Design 技术栈 |
| **六、数据驱动与状态管理** | ✅ PASS | 使用 Zustand 管理客户端状态（用户权限） |
| **七、代码质量与工程化** | ✅ PASS | 使用 TypeScript 5.9.3，遵循 ESLint + Prettier 规范 |
| **八、Claude Code Skills 开发规范** | N/A | 非 skill 开发，不适用 |
| **九、认证与权限要求分层** | ✅ PASS | B端管理后台暮不考虑认证逻辑，仅需处理模块权限显示逻辑 |
| **十、Lark PM 项目管理集成** | N/A | 本项目未启用 Lark PM 集成 |
| **Spring Boot + Supabase** | N/A | 纯前端功能，无后端开发 |
| **C端开发技术栈** | N/A | B端管理后台功能，不涉及C端 |
| **API 响应格式标准化** | N/A | 无 API 开发 |
| **API 异常编号规范** | N/A | 无 API 开发 |
| **API 测试规范** | N/A | 无 API 开发 |
| **业务概念澄清文档要求** | ⚠️ OPTIONAL | 功能相对简单，业务概念清晰，可选性创建 `business-clarification.md` |

**结论**: 所有适用的宪法原则均通过检查。可以开始 Phase 0 研究。

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
frontend/
├── src/
│   ├── components/
│   │   ├── common/             # 通用组件
│   │   │   ├── ModuleCard.tsx  # 新增: 模块卡片组件 (@spec D001-menu-panel)
│   │   │   └── ModuleCard.test.tsx
│   │   └── layout/
│   │       └── AppLayout.tsx   # 现有布局，无需修改
│   ├── pages/
│   │   └── Dashboard/
│   │       ├── index.tsx       # 替换: 整体替换为 MenuPanel (@spec D001-menu-panel)
│   │       └── Dashboard.test.tsx
│   ├── types/
│   │   └── module.ts       # 新增: 模块数据类型定义 (@spec D001-menu-panel)
│   ├── constants/
│   │   └── modules.ts      # 新增: 12个模块的静态配置 (@spec D001-menu-panel)
│   └── router/
│       └── index.tsx        # 现有路由，/dashboard 路径保持不变
└── tests/
    ├── unit/
    │   └── components/
    │       └── ModuleCard.test.tsx
    └── e2e/                # 可选的 E2E 测试
        └── menu-panel.spec.ts
```

**Structure Decision**: 选择 Web 应用结构，纯前端开发。所有代码位于 `frontend/` 目录。新增 3 个文件：
1. `ModuleCard.tsx` - 模块卡片组件
2. `modules.ts` - 模块静态数据配置
3. `module.ts` - TypeScript 类型定义

替换 1 个文件：
- `pages/Dashboard/index.tsx` - 从现有统计页面替换为菜单面板

## Phase 0: Research Completion ✅

**Status**: COMPLETED (2026-01-14)

**Generated Artifacts**:
- `research.md` (270 lines) - 8个技术决策，解决所有 NEEDS CLARIFICATION 项

**Key Decisions**:
1. 布局方案：卡片式布局 + Grid 响应式系统 (Ant Design Row/Col)
2. 数据管理：静态配置文件（无后端 API）
3. 权限控制：前端声明式过滤
4. 交互设计：悬停效果 + 点击跳转
5. 性能优化：React.memo 优化
6. 图标方案：Ant Design Icons
7. 测试策略：单元测试必须，E2E 可选

---

## Phase 1: Design & Contracts Completion ✅

**Status**: COMPLETED (2026-01-14)

**Generated Artifacts**:
- `data-model.md` (312 lines) - 3个核心实体定义 (ModuleCard, FunctionLink, UserPermissions)
- `quickstart.md` (510 lines) - 快速上手指南，包含完整开发流程
- `QODER.md` (30 lines) - Agent context 文件已更新
- `/contracts/` - **跳过**（纯前端功能，无需 API 接口定义）

**Core Entities**:
```typescript
interface ModuleCard {
  id: string;
  name: string;
  description: string;
  icon: ComponentType;
  defaultPath: string;
  functionLinks: FunctionLink[];
  order: number;
  status: 'normal' | 'developing';
  requiredPermissions?: string[];
  badge?: number | string;
}

interface FunctionLink {
  name: string;
  path: string;
  enabled?: boolean;
  badge?: number | string;
}

interface UserPermissions {
  userId: string;
  permissions: string[];
}
```

**Agent Context Update**:
- 已运行 `.specify/scripts/bash/update-agent-context.sh qoder`
- 新增技术栈：TypeScript 5.9.3, React 19.2.0
- 数据库：N/A (纯前端组件)
- 项目类型：Web 前端 (管理后台)

---

## Constitution Re-Check (Post-Design) ✅

**Re-evaluation Date**: 2026-01-14

| 原则 | 状态 | 说明 |
|------|------|------|
| **二、代码归属标识** | ✅ PASS | quickstart.md 中明确要求所有文件添加 `@spec D001-menu-panel` |
| **三、测试驱动开发** | ✅ PASS | data-model.md 包含测试数据结构，quickstart.md 包含测试示例 |
| **四、组件化架构** | ✅ PASS | ModuleCard 独立组件 + Dashboard 页面组件，符合 React 组件化设计 |
| **六、数据驱动与状态管理** | ✅ PASS | 使用 Zustand 管理用户权限状态 |

**结论**: 设计阶段无新增宪法违规项。可以继续到 Phase 2 (Tasks)。

---

## Next Steps

**Phase 2**: 执行 `/speckit.tasks` 命令生成任务清单 (`tasks.md`)

**命令**:
```bash
/speckit.tasks
```

**预期输出**:
- `specs/D001-menu-panel/tasks.md` - 详细的任务分解和实施步骤
- 任务优先级排序
- 每个任务的验收标准

---

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | 无宪法违规项 | N/A |
