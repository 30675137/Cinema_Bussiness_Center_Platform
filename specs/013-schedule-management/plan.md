# Implementation Plan: 排期管理甘特图视图

**Branch**: `013-schedule-management` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-schedule-management/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

实现影院排期管理的甘特图视图功能，支持多影厅资源的时间轴排期展示、日期切换、创建/编辑排期事件、锁座和维护时段管理。技术实现采用自定义甘特图组件（基于 React + CSS Grid/Flexbox + 绝对定位），复用项目现有的 Zustand + TanStack Query + MSW 架构模式，实现高性能的时间轴渲染和交互体验。所有技术决策已在 research.md 中明确，数据模型和 API 契约已设计完成，符合项目宪法要求。

## Technical Context

**Language/Version**: TypeScript 5.9.3 + React 19.2.0
**Primary Dependencies**: Ant Design 6.1.0, Zustand 5.0.9, TanStack Query 5.90.12, React Router 7.10.1, MSW 2.12.4, React Hook Form 7.68.0, Zod 4.1.13, dayjs 1.11.19
**Storage**: Mock data (in-memory state + MSW handlers + localStorage for persistence)
**Testing**: Vitest (unit tests) + Playwright (e2e tests) + Testing Library
**Target Platform**: Web browser (Chrome, Firefox, Safari, Edge)
**Project Type**: Web application (frontend-only with mock backend)
**Performance Goals**: <3s page load, <500ms date switch, support 20+ halls and 100+ events per day without performance degradation
**Constraints**: Must comply with Feature Branch Binding (specId alignment), Test-Driven Development, Component-Based Architecture
**Scale/Scope**: Enterprise admin interface, gantt chart visualization with real-time updates

### Existing Patterns to Follow

**State Management**:
- Server state via TanStack Query (schedule queries, mutations with cache invalidation)
- UI state via Zustand (selected date, selected event, filters, viewport scroll position)
- Persistence with localStorage for user preferences (default date, time range)

**Service Layer**:
- Class-based service pattern (like `brandService.ts`, `categoryService.ts`)
- MSW handlers for mock API endpoints (like `brandHandlers.ts`, `categoryHandlers.ts`)
- Query key factory pattern (like `categoryKeys`, `brandKeys`)

**Component Structure**:
- Atomic Design: atoms (EventBlock, TimeSlot, HallCard), molecules (GanttRow, TimelineHeader, EventForm), organisms (GanttChart, ScheduleManagement)
- Feature-scoped components in `pages/schedule/components/`
- Reusable hooks in `hooks/` subfolder

**Form Validation**:
- Zod schemas with `.refine()` for cross-field validation (time range, conflict detection)
- React Hook Form integration with zodResolver

**Date/Time Handling**:
- dayjs for date manipulation and formatting
- Ant Design DatePicker for date selection

### Dependencies on Existing Features

1. **Hall Management (Future)**: Hall resources must be available. For now, use mock hall data.
2. **Category Management (007)**: May need category tree for filtering halls by category (if applicable).

### Technology Decisions Needed (Phase 0 Research)

1. **Gantt Chart Implementation**: 
   - Option A: Custom React component with CSS Grid/Flexbox (lightweight, full control)
   - Option B: Third-party library (e.g., dhtmlx-gantt, react-gantt-chart) (faster development, less control)
   - **NEEDS CLARIFICATION**: Which approach balances performance, maintainability, and customization needs?

2. **Time Axis Rendering**:
   - Option A: Virtual scrolling for time axis (better performance for long time ranges)
   - Option B: Full rendering with CSS positioning (simpler, sufficient for 14-hour range)
   - **NEEDS CLARIFICATION**: Is virtual scrolling needed for 14-hour range, or is full rendering acceptable?

3. **Event Block Positioning**:
   - Option A: Absolute positioning with calculated left/width percentages (from demo)
   - Option B: CSS Grid with grid-column placement (more semantic, better responsive behavior)
   - **NEEDS CLARIFICATION**: Which approach provides better performance and maintainability?

4. **Conflict Detection**:
   - Option A: Client-side validation before submission (immediate feedback)
   - Option B: Server-side validation only (consistent with backend rules)
   - **NEEDS CLARIFICATION**: Should conflict detection be client-side, server-side, or both?

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支名中的specId (013) 等于active_spec指向路径中的specId (013-schedule-management)
- [x] **测试驱动开发**: 关键业务流程必须先编写测试，确保测试覆盖率100% (计划阶段，将在实施时执行)
- [x] **组件化架构**: 必须遵循原子设计理念，组件必须清晰分层和可复用 (已设计：atoms/molecules/organisms)
- [x] **数据驱动状态管理**: 必须使用Zustand + TanStack Query，状态变更可预测 (已设计：scheduleStore + useScheduleQueries)
- [x] **代码质量工程化**: 必须通过TypeScript类型检查、ESLint规范、所有质量门禁 (计划阶段，将在实施时执行)

### 性能与标准检查：

- [x] **性能标准**: 应用启动<3秒，页面切换<500ms，大数据列表使用虚拟滚动 (已设计：CSS Grid + 性能优化策略)
- [x] **安全标准**: 使用Zod数据验证，防止XSS，适当的认证授权机制 (已设计：Zod schemas + React Hook Form)
- [x] **可访问性标准**: 遵循WCAG 2.1 AA级别，支持键盘导航和屏幕阅读器 (已设计：ARIA标签 + 键盘导航)

## Project Structure

### Documentation (this feature)

```text
specs/013-schedule-management/
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
│   ├── pages/
│   │   └── schedule/
│   │       ├── index.tsx                    # Main schedule management page
│   │       ├── components/
│   │       │   ├── atoms/
│   │       │   │   ├── EventBlock.tsx      # Event block component
│   │       │   │   ├── TimeSlot.tsx        # Time slot marker
│   │       │   │   ├── HallCard.tsx        # Hall info card
│   │       │   │   └── EventTypeTag.tsx    # Event type badge
│   │       │   ├── molecules/
│   │       │   │   ├── GanttRow.tsx        # Single hall row in gantt
│   │       │   │   ├── TimelineHeader.tsx  # Time axis header
│   │       │   │   ├── EventForm.tsx        # Create/edit event form
│   │       │   │   └── DateNavigator.tsx   # Date navigation controls
│   │       │   └── organisms/
│   │       │       ├── GanttChart.tsx      # Main gantt chart component
│   │       │       └── ScheduleManagement.tsx # Top-level container
│   │       ├── hooks/
│   │       │   ├── useScheduleQueries.ts   # TanStack Query hooks
│   │       │   ├── useScheduleMutations.ts # Mutation hooks
│   │       │   └── useGanttViewport.ts     # Viewport scroll management
│   │       ├── services/
│   │       │   └── scheduleService.ts      # API service class
│   │       └── types/
│   │           └── schedule.types.ts       # TypeScript types
│   ├── features/
│   │   └── schedule-management/
│   │       ├── stores/
│   │       │   └── scheduleStore.ts       # Zustand store
│   │       └── utils/
│   │           ├── timeCalculations.ts    # Time positioning utilities
│   │           └── conflictDetection.ts   # Conflict validation
│   └── mocks/
│       ├── data/
│       │   └── scheduleMockData.ts        # Mock schedule data
│       └── handlers/
│           └── scheduleHandlers.ts        # MSW handlers
```

**Structure Decision**: Feature-based modular architecture with Atomic Design component hierarchy. Gantt chart implemented as custom React component for full control over rendering and interactions.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
