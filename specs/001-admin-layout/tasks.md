---

description: "Task list for 管理后台基础框架 implementation"
---

# Tasks: 管理后台基础框架

**Input**: Design documents from `/specs/001-admin-layout/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include E2E tests. Tests are included based on Playwright E2E testing requirements in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/src/`, `frontend/tests/`
- Paths reflect the React frontend project structure from plan.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create React project structure per implementation plan in frontend/
- [X] T002 Initialize React 18 + TypeScript project with Vite build tool
- [X] T003 [P] Install and configure core dependencies: Ant Design 6.1.0 + Tailwind CSS 4.1.17 + React Router 6
- [X] T004 [P] Install and configure state management: Zustand + TanStack Query
- [X] T005 [P] Configure development tools: ESLint, Prettier, TypeScript configuration
- [X] T006 [P] Setup Playwright E2E testing framework configuration
- [X] T007 Configure Vite build configuration with Tailwind CSS PostCSS integration

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T008 Create basic project folder structure (components, pages, hooks, stores, types, utils, styles)
- [X] T009 [P] Create TypeScript type definitions for layout components in frontend/src/types/layout.ts
- [X] T010 [P] Create TypeScript type definitions for mock data in frontend/src/types/mock.ts
- [X] T011 [P] Setup Zustand layout store in frontend/src/stores/layoutStore.ts
- [X] T012 [P] Create basic routing configuration in frontend/src/router/index.tsx
- [X] T013 [P] Setup mock data structure in frontend/src/mock/index.ts
- [X] T014 [P] Create custom hooks for layout state management in frontend/src/hooks/useLayoutState.ts
- [X] T015 [P] Configure Ant Design theme provider in frontend/src/styles/theme.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 统一布局框架访问 (Priority: P1) 🎯 MVP

**Goal**: 实现统一的管理后台布局框架，包含左侧导航、顶部面包屑和内容区域

**Independent Test**: 访问任何管理后台页面，验证布局正确显示三个核心组件（左侧导航、顶部面包屑、内容区域）

### Tests for User Story 1 (E2E测试) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T016 [P] [US1] E2E test for basic layout structure in frontend/tests/e2e/layout-basic.spec.ts
- [ ] T017 [P] [US1] E2E test for layout responsiveness in frontend/tests/e2e/layout-responsive.spec.ts

### Implementation for User Story 1

- [X] T018 [P] [US1] Create AppLayout main component in frontend/src/components/layout/AppLayout/index.tsx
- [X] T019 [P] [US1] Create LayoutHeader component in frontend/src/components/layout/LayoutHeader/index.tsx
- [X] T020 [P] [US1] Create LayoutContent component in frontend/src/components/layout/LayoutContent/index.tsx
- [X] T021 [US1] Integrate layout components in AppLayout (depends on T018, T019, T020)
- [X] T022 [US1] Update root App.tsx to use AppLayout wrapper
- [X] T023 [US1] Add responsive layout styles using Tailwind CSS classes
- [X] T024 [US1] Create placeholder Dashboard page for testing layout in frontend/src/pages/Dashboard/index.tsx
- [X] T025 [US1] Configure basic routing to display Dashboard with layout

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - 面包屑导航 (Priority: P1)

**Goal**: 实现动态面包屑导航，支持路由变化自动更新和点击导航功能

**Independent Test**: 在不同页面间导航，验证面包屑正确显示当前路径并支持点击返回上级页面

### Tests for User Story 2 (E2E测试) ⚠️

- [X] T026 [P] [US2] E2E test for breadcrumb navigation in frontend/tests/e2e/breadcrumb-navigation.spec.ts
- [X] T027 [P] [US2] E2E test for breadcrumb click functionality in frontend/tests/e2e/breadcrumb-click.spec.ts

### Implementation for User Story 2

- [X] T028 [P] [US2] Create Breadcrumb component in frontend/src/components/layout/Breadcrumb/index.tsx
- [X] T029 [P] [US2] Create BreadcrumbItem component in frontend/src/components/layout/Breadcrumb/BreadcrumbItem.tsx
- [X] T030 [P] [US2] Create breadcrumb utilities in frontend/src/utils/breadcrumb.ts
- [X] T031 [P] [US2] Update useLayoutState hook with breadcrumb logic in frontend/src/hooks/useLayoutState.ts
- [X] T032 [P] [US2] Integrate Breadcrumb component into AppLayout with proper positioning
- [X] T033 [US2] Update LayoutHeader to remove duplicate breadcrumb (depends on T019, T028)
- [X] T034 [US2] Add route-to-breadcrumb mapping logic in useLayoutState hook

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - 左侧导航菜单 (Priority: P1)

**Goal**: 实现左侧导航菜单，支持菜单项高亮、子菜单展开和点击导航功能

**Independent Test**: 点击不同菜单项，验证页面跳转和菜单高亮状态正确

### Tests for User Story 3 (E2E测试) ⚠️

- [X] T035 [P] [US3] E2E test for sidebar menu navigation in frontend/tests/e2e/sidebar-navigation.spec.ts
- [X] T036 [P] [US3] E2E test for menu highlight functionality in frontend/tests/e2e/menu-highlight.spec.ts
- [X] T037 [P] [US3] E2E test for submenu expand/collapse in frontend/tests/e2e/submenu-toggle.spec.ts

### Implementation for User Story 3

- [X] T038 [P] [US3] Create Sidebar component in frontend/src/components/layout/Sidebar/index.tsx
- [X] T039 [P] [US3] Create comprehensive menu mock data in frontend/src/mock/menu.ts
- [X] T040 [P] [US3] Create placeholder pages for all menu items in frontend/src/pages/
  - T040-1 [P] [US3] Create product management pages in frontend/src/pages/product/ProductList/index.tsx
  - T040-2 [P] [US3] Create pricing pages in frontend/src/pages/pricing/PricingList/index.tsx
  - T040-3 [P] [US3] Create review pages in frontend/src/pages/review/ReviewList/index.tsx
  - T040-4 [P] [US3] Create inventory pages in frontend/src/pages/inventory/InventoryList/index.tsx
- [X] T041 [P] [US3] Update useLayoutState hook with menu selection logic
- [X] T042 [P] [US3] Create breadcrumb utilities in frontend/src/utils/breadcrumb.ts
- [X] T043 [P] [US3] Integrate Sidebar component into AppLayout (depends on T018, T038)
- [X] T044 [US3] Add menu item highlighting logic based on current route
- [X] T045 [US3] Implement sidebar collapse/expand functionality in Sidebar component
- [X] T046 [US3] Update routing configuration with all menu routes (depends on T040)
- [X] T047 [US3] Create useLayoutState hook with comprehensive layout state management

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: User Story 4 - 响应式布局适配 (Priority: P2)

**Goal**: 实现响应式布局，支持不同屏幕尺寸的自动适配和侧边栏折叠功能

**Independent Test**: 调整浏览器窗口大小，验证布局自动适配和侧边栏正确收起展开

### Tests for User Story 4 (E2E测试) ⚠️

- [ ] T049 [P] [US4] E2E test for responsive breakpoints in frontend/tests/e2e/responsive-breakpoints.spec.ts
- [ ] T050 [P] [US4] E2E test for sidebar responsive behavior in frontend/tests/e2e/sidebar-responsive.spec.ts

### Implementation for User Story 4

- [ ] T051 [P] [US4] Create useResponsive custom hook in frontend/src/hooks/useResponsive.ts
- [ ] T052 [P] [US4] Update Sidebar component with responsive behavior in frontend/src/components/layout/Sidebar/index.tsx
- [ ] T053 [P] [US4] Add responsive breakpoints configuration in frontend/src/styles/responsive.ts
- [ ] T054 [US4] Implement sidebar auto-collapse on small screens
- [ ] T055 [US4] Add responsive menu behavior (mobile drawer mode)
- [ ] T056 [US4] Update Tailwind CSS configuration for custom breakpoints

**Checkpoint**: All user stories including responsive features should now be functional

---

## Phase 7: Mock数据和业务页面 (Priority: P1)

**Goal**: 实现各功能模块的基础数据表格展示，使用Mock数据

**Independent Test**: 访问各功能模块页面，验证数据表格正常显示Mock数据

### Tests for User Story Business Data (E2E测试) ⚠️

- [ ] T057 [P] [Data] E2E test for product list table in frontend/tests/e2e/product-table.spec.ts
- [ ] T058 [P] [Data] E2E test for pricing list table in frontend/tests/e2e/pricing-table.spec.ts
- [ ] T059 [P] [Data] E2E test for review list table in frontend/tests/e2e/review-table.spec.ts
- [ ] T060 [P] [Data] E2E test for inventory list table in frontend/tests/e2e/inventory-table.spec.ts

### Implementation for Mock Data and Business Pages

- [ ] T061 [P] [Data] Create mock business data in frontend/src/mock/business/
  - T061-1 [P] [Data] Create product mock data in frontend/src/mock/business/products.ts
  - T061-2 [P] [Data] Create pricing mock data in frontend/src/mock/business/pricing.ts
  - T061-3 [P] [Data] Create review mock data in frontend/src/mock/business/reviews.ts
  - T061-4 [P] [Data] Create inventory mock data in frontend/src/mock/business/inventory.ts
- [ ] T062 [P] [Data] Create useMockData custom hook in frontend/src/hooks/useMockData.ts
- [ ] T063 [P] [Data] Create DataTable component in frontend/src/components/common/DataTable/index.tsx
- [ ] T064 [P] [Data] Implement product list page with table in frontend/src/pages/product/ProductList/index.tsx
- [ ] T065 [P] [Data] Implement pricing list page with table in frontend/src/pages/pricing/PricingList/index.tsx
- [ ] T066 [P] [Data] Implement review list page with table in frontend/src/pages/review/ReviewList/index.tsx
- [ ] T067 [P] [Data] Implement inventory list page with table in frontend/src/pages/inventory/InventoryList/index.tsx
- [ ] T068 [Data] Add mock API service layer in frontend/src/services/mockApi.ts

**Checkpoint**: All business pages with mock data should now be functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T069 [P] 中文文档更新和优化 - 确保所有代码注释使用简体中文
- [ ] T070 [P] 确保所有文档使用简体中文编写
- [ ] T071 [P] Code cleanup and refactoring across all components
- [ ] T072 [P] Add loading states and error handling for mock data loading
- [ ] T073 [P] Add accessibility improvements (ARIA labels, keyboard navigation)
- [ ] T074 [P] Optimize component re-renders with React.memo where applicable
- [ ] T075 [P] Add comprehensive TypeScript type coverage for all components
- [ ] T076 [P] Run quickstart.md validation and update documentation
- [ ] T077 [P] 检查所有中文文档的规范性和一致性
- [ ] T078 [P] Create comprehensive README in frontend/ with setup and usage instructions
- [ ] T079 [P] Final cross-browser compatibility testing and fixes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User Stories 1-3 can proceed in parallel after Phase 2
  - User Story 4 can proceed after User Stories 1-3
  - Business Data (Phase 7) can proceed after Phase 3
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - Foundation for layout
- **User Story 2 (P1)**: Can start after User Story 1 - Depends on AppLayout structure
- **User Story 3 (P1)**: Can start after User Story 1 - Depends on AppLayout structure
- **User Story 4 (P2)**: Can start after User Stories 1-3 - Extends existing layout components
- **Business Data**: Can start after User Story 3 - Depends on routing structure

### Within Each User Story

- E2E tests MUST be written and FAIL before implementation
- Component structure before styling
- Mock data before page components
- Core implementation before responsive features
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T001-T007)
- All Foundational tasks marked [P] can run in parallel (T009-T015)
- User Story 1 component creation (T018-T020) can run in parallel
- User Story 2 E2E tests (T026-T027) can run in parallel
- User Story 3 E2E tests (T035-T037) can run in parallel
- User Story 3 page creation (T044-1 to T044-4) can run in parallel
- Business data mock creation (T061-1 to T061-4) can run in parallel
- Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1 (MVP)

```bash
# Launch E2E tests for User Story 1 together:
Task: "E2E test for basic layout structure in frontend/tests/e2e/layout-basic.spec.ts"
Task: "E2E test for layout responsiveness in frontend/tests/e2e/layout-responsive.spec.ts"

# Launch layout components together:
Task: "Create AppLayout main component in frontend/src/components/layout/AppLayout/index.tsx"
Task: "Create LayoutHeader component in frontend/src/components/layout/LayoutHeader/index.tsx"
Task: "Create LayoutContent component in frontend/src/components/layout/LayoutContent/index.tsx"
```

---

## Parallel Example: User Story 3 (Navigation)

```bash
# Launch E2E tests for User Story 3 together:
Task: "E2E test for sidebar menu navigation in frontend/tests/e2e/sidebar-navigation.spec.ts"
Task: "E2E test for menu highlight functionality in frontend/tests/e2e/menu-highlight.spec.ts"
Task: "E2E test for submenu expand/collapse in frontend/tests/e2e/submenu-toggle.spec.ts"

# Launch page creation together:
Task: "Create product management pages in frontend/src/pages/product/"
Task: "Create pricing pages in frontend/src/pages/pricing/"
Task: "Create review pages in frontend/src/pages/review/"
Task: "Create inventory pages in frontend/src/pages/inventory/"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T007)
2. Complete Phase 2: Foundational (T008-T015) - CRITICAL
3. Complete Phase 3: User Story 1 (T016-T025)
4. **STOP and VALIDATE**: Test User Story 1 independently with E2E tests
5. Demo basic layout framework

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (T001-T015)
2. Add User Story 1 → Test independently → Demo (T016-T025) - MVP!
3. Add User Story 2 + 3 → Test independently → Demo (T026-T048)
4. Add User Story 4 → Test independently → Demo (T049-T056)
5. Add Business Data → Test independently → Demo (T057-T068)
6. Polish → Final Demo (T069-T079)

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T015)
2. Once Foundational is done:
   - Developer A: User Story 1 (T016-T025) + Navigation Stories (T026-T048)
   - Developer B: User Story 4 (T049-T056) + Business Data (T057-T068)
3. Stories complete and integrate independently
4. Team works together on Polish phase (T069-T079)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify E2E tests fail before implementing features
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- **Notion Integration**: During task execution, update Notion需求管理数据库 status field: "tasking" for this phase
- **中文文档要求**: 确保所有任务产出物（代码注释、README、技术文档等）都使用简体中文编写，遵循中国大陆地区中文表达习惯
- **Total Task Count**: 79 tasks across all phases
- **MVP Scope**: Tasks T001-T025 (Phase 1-3, User Story 1) - 25 tasks for basic layout framework