# Tasks: 库存与仓店库存管理系统

**Input**: Design documents from `/specs/003-inventory-management/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included as the feature specification requires comprehensive test coverage (80% unit tests + 100% E2E coverage).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `src/`, `tests/` at repository root
- Paths below assume web application structure as defined in plan.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create inventory management module structure per implementation plan
- [ ] T002 Initialize React 18.2.0 + TypeScript 5.0 project with Vite 6.0.7
- [ ] T003 [P] Install Ant Design 6.1.0 and configure theme system
- [ ] T004 [P] Install Zustand for state management and setup store structure
- [ ] T005 [P] Install TanStack Query for data fetching and caching
- [ ] T006 [P] Install Tailwind CSS 4.1.17 for styling
- [ ] T007 [P] Install Vitest for unit testing and configure test environment
- [ ] T008 [P] Install Playwright for E2E testing and configure test environment
- [ ] T009 [P] Configure ESLint and Prettier with TypeScript rules
- [ ] T010 [P] Setup React Router 6 for navigation
- [ ] T011 Create basic folder structure: src/components/Inventory/, src/pages/inventory/, src/hooks/, src/stores/, src/services/, src/types/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T012 Setup TypeScript type definitions for inventory system in src/types/inventory.ts
- [ ] T013 Create base mock data service structure in src/services/inventoryMockData.ts
- [ ] T014 [P] Implement permission system base in src/hooks/usePermissions.ts
- [ ] T015 [P] Setup responsive design hooks in src/hooks/useResponsive.ts
- [ ] T016 [P] Create base Zustand store structure in src/stores/inventoryStore.ts
- [ ] T017 [P] Setup error handling and loading states infrastructure
- [ ] T018 [P] Configure Ant Design theme and global styles in src/styles/inventory.css
- [ ] T019 Create utility functions for inventory data processing in src/utils/inventoryHelpers.ts
- [ ] T020 [P] Setup test utilities and mock data generators in tests/unit/helpers/

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 库存台账查看与筛选 (Priority: P1) 🎯 MVP

**Goal**: 实现库存台账的查看、筛选、排序功能，提供完整的库存状态概览

**Independent Test**: 可以通过访问库存台账页面，验证筛选功能和数据显示是否正常工作，提供完整的库存状态概览

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T021 [P] [US1] Unit test for inventory data fetching hook in tests/unit/hooks/useInventoryData.test.ts
- [ ] T022 [P] [US1] Unit test for inventory filters component in tests/unit/components/Inventory/InventoryFilters.test.tsx
- [ ] T023 [P] [US1] Unit test for inventory table component in tests/unit/components/Inventory/InventoryTable.test.tsx
- [ ] T024 [P] [US1] Unit test for permission guard component in tests/unit/components/Inventory/PermissionGuard.test.tsx
- [ ] T025 [P] [US1] E2E test for inventory ledger page functionality in tests/e2e/inventory-ledger.spec.ts

### Implementation for User Story 1

- [ ] T026 [P] [US1] Create InventoryLedger TypeScript interface in src/types/inventory.ts
- [ ] T027 [P] [US1] Create inventory filters component in src/components/Inventory/InventoryFilters.tsx
- [ ] T028 [P] [US1] Create inventory table component with sorting in src/components/Inventory/InventoryTable.tsx
- [ ] T029 [P] [US1] Create permission guard component in src/components/Inventory/PermissionGuard.tsx
- [ ] T030 [P] [US1] Create user role selector component in src/components/Inventory/UserRoleSelector.tsx
- [ ] T031 [P] [US1] Implement inventory data hook in src/hooks/useInventoryData.ts
- [ ] T032 [P] [US1] Implement permission hook in src/hooks/usePermissions.ts
- [ ] T033 [US1] Create responsive layout component in src/components/Inventory/ResponsiveLayout.tsx
- [ ] T034 [P] [US1] Implement mock data generator for inventory ledger in src/services/inventoryMockData.ts
- [ ] T035 [P] [US1] Create inventory ledger store in src/stores/inventoryStore.ts
- [ ] T036 [P] [US1] Create inventory ledger page in src/pages/inventory/InventoryLedger.tsx
- [ ] T037 [P] [US1] Add routing configuration for /inventory/ledger
- [ ] T038 [P] [US1] Implement virtual scrolling for large data sets in inventory table
- [ ] T039 [P] [US1] Add stock status visualization with color tags
- [ ] T040 [P] [US1] Implement export functionality for inventory data
- [ ] T041 [P] [US1] Add loading and error states to inventory components
- [ ] T042 [P] [US1] Add accessibility features to inventory table and filters

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - 库存流水追踪与对账 (Priority: P1)

**Goal**: 实现库存流水查询功能，支持时间范围筛选、单据类型筛选，提供完整的库存变动历史

**Independent Test**: 可以通过从台账页跳转或直接访问流水页，验证流水记录的完整性和查询功能

### Tests for User Story 2 ⚠️

- [ ] T043 [P] [US2] Unit test for inventory movements hook in tests/unit/hooks/useInventoryMovements.test.ts
- [ ] T044 [P] [US2] Unit test for movements table component in tests/unit/components/Inventory/MovementsTable.test.tsx
- [ ] T045 [P] [US2] Unit test for movements filters component in tests/unit/components/Inventory/MovementsFilters.test.tsx
- [ ] T046 [P] [US2] E2E test for inventory movements page functionality in tests/e2e/inventory-movements.spec.ts
- [ ] T047 [P] [US2] Integration test for ledger to movements navigation in tests/integration/inventory-navigation.test.ts

### Implementation for User Story 2

- [ ] T048 [P] [US2] Create InventoryMovement TypeScript interface in src/types/inventory.ts
- [ ] T049 [P] [US2] Create movements filters component with date range picker in src/components/Inventory/MovementsFilters.tsx
- [ ] T050 [P] [US2] Create movements table component with transaction type tags in src/components/Inventory/MovementsTable.tsx
- [ ] T051 [P] [US2] Implement inventory movements data hook in src/hooks/useInventoryMovements.ts
- [ ] T052 [P] [US2] Implement mock data generator for inventory movements in src/services/inventoryMockData.ts
- [ ] T053 [P] [US2] Create movements store in src/stores/inventoryMovementsStore.ts
- [ ] T054 [P] [US2] Create inventory movements page in src/pages/inventory/InventoryMovements.tsx
- [ ] T055 [P] [US2] Add routing configuration for /inventory/movements
- [ ] T056 [P] [US2] Implement navigation from ledger to movements with SKU/location parameters
- [ ] T057 [P] [US2] Add movement type color coding and visual indicators
- [ ] T058 [P] [US2] Implement reference number links for business documents
- [ ] T059 [P] [US2] Add export functionality for movements data
- [ ] T060 [P] [US2] Integrate movements page with existing permission system
- [ ] T061 [P] [US2] Add responsive design to movements components

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - 库存调整与异常处理 (Priority: P2)

**Goal**: 实现库存调整功能，支持盘盈、盘亏、报损等调整类型，包含权限控制和操作记录

**Independent Test**: 可以通过执行完整的库存调整流程，验证权限控制和操作记录的正确性

### Tests for User Story 3 ⚠️

- [ ] T062 [P] [US3] Unit test for inventory adjustment hook in tests/unit/hooks/useInventoryAdjustment.test.ts
- [ ] T063 [P] [US3] Unit test for adjustment modal component in tests/unit/components/Inventory/AdjustmentModal.test.tsx
- [ ] T064 [P] [US3] Unit test for adjustment form validation in tests/unit/components/Inventory/AdjustmentForm.test.tsx
- [ ] T065 [P] [US3] E2E test for inventory adjustment workflow in tests/e2e/inventory-adjustment.spec.ts
- [ ] T066 [P] [US3] Integration test for permission-based adjustment access in tests/integration/inventory-permissions.test.ts

### Implementation for User Story 3

- [ ] T067 [P] [US3] Create InventoryAdjustment TypeScript interface in src/types/inventory.ts
- [ ] T068 [P] [US3] Create adjustment modal component with form validation in src/components/Inventory/AdjustmentModal.tsx
- [ ] T069 [P] [US3] Create adjustment form component with type selection in src/components/Inventory/AdjustmentForm.tsx
- [ ] T070 [P] [US3] Implement inventory adjustment data hook in src/hooks/useInventoryAdjustment.ts
- [ ] T071 [P] [US3] Implement mock adjustment API in src/services/inventoryMockData.ts
- [ ] T072 [P] [US3] Create adjustment store with optimistic updates in src/stores/inventoryAdjustmentStore.ts
- [ ] T073 [P] [US3] Add adjustment functionality to inventory table actions
- [ ] T074 [P] [US3] Implement confirmation dialog for adjustment operations
- [ ] T075 [P] [US3] Add success/failure notifications for adjustment operations
- [ ] T076 [P] [US3] Integrate adjustment modal with permission system
- [ ] T077 [P] [US3] Add adjustment history tracking in inventory details
- [ ] T078 [P] [US3] Implement adjustment type validation and business rules
- [ ] T079 [P] [US3] Add responsive design to adjustment components

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: User Story 4 - 库存详情查看与快速操作 (Priority: P3)

**Goal**: 实现库存详情抽屉，显示完整库存信息、近期流水摘要和快捷操作

**Independent Test**: 可以通过打开详情抽屉，验证信息展示的完整性和操作入口的可用性

### Tests for User Story 4 ⚠️

- [ ] T080 [P] [US4] Unit test for inventory details drawer in tests/unit/components/Inventory/InventoryDetails.test.tsx
- [ ] T081 [P] [US4] Unit test for details statistics section in tests/unit/components/Inventory/DetailsStatistics.test.tsx
- [ ] T082 [P] [US4] Unit test for recent movements display in tests/unit/components/Inventory/RecentMovements.test.tsx
- [ ] T083 [P] [US4] E2E test for inventory details drawer functionality in tests/e2e/inventory-details.spec.ts

### Implementation for User Story 4

- [ ] T084 [P] [US4] Create inventory details drawer component in src/components/Inventory/InventoryDetails.tsx
- [ ] T085 [P] [US4] Create details statistics section component in src/components/Inventory/DetailsStatistics.tsx
- [ ] T086 [P] [US4] Create recent movements summary component in src/components/Inventory/RecentMovements.tsx
- [ ] T087 [P] [US4] Create quick actions component in src/components/Inventory/QuickActions.tsx
- [ ] T088 [P] [US4] Implement inventory details hook in src/hooks/useInventoryDetails.ts
- [ ] T089 [P] [US4] Add details drawer trigger to inventory table
- [ ] T090 [P] [US4] Implement data aggregation for statistics display
- [ ] T091 [P] [US4] Add navigation from details to full movements page
- [ ] T092 [P] [US4] Add product details linking from details drawer
- [ ] T093 [P] [US4] Implement responsive design for details drawer
- [ ] T094 [P] [US4] Add loading states and error handling to details components

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T095 [P] Performance optimization for large data sets and virtual scrolling
- [ ] T096 [P] Accessibility audit and improvements across all components
- [ ] T097 [P] Browser compatibility testing and fixes
- [ ] T098 [P] Mobile responsiveness optimization and touch interaction improvements
- [ ] T099 [P] Add comprehensive error boundaries and error handling
- [ ] T100 [P] Implement comprehensive logging and debugging tools
- [ ] T101 [P] Add component documentation with Storybook integration
- [ ] T102 [P] Code cleanup and TypeScript strict mode compliance
- [ ] T103 [P] Security audit and input validation improvements
- [ ] T104 [P] Bundle size optimization and code splitting implementation
- [ ] T105 [P] Internationalization preparation (i18n hooks and structure)
- [ ] T106 [P] Update project documentation in README.md
- [ ] T107 [P] Run quickstart.md validation and update deployment guide
- [ ] T108 [P] Final integration testing across all user stories
- [ ] T109 [P] Performance testing and optimization verification

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in priority order (US1 → US2 → US3 → US4)
  - Or in parallel if team capacity allows
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for integration but should be independently testable
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - Depends on US1 and US2 for data integration

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Type definitions before components
- Mock services before hooks
- Hooks before components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, User Stories 1 & 2 (both P1) can start in parallel
- Tests for each story marked [P] can run in parallel
- Components within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit test for inventory data fetching hook in tests/unit/hooks/useInventoryData.test.ts"
Task: "Unit test for inventory filters component in tests/unit/components/Inventory/InventoryFilters.test.tsx"
Task: "Unit test for inventory table component in tests/unit/components/Inventory/InventoryTable.test.tsx"

# Launch all type definitions and services for User Story 1 together:
Task: "Create InventoryLedger TypeScript interface in src/types/inventory.ts"
Task: "Implement mock data generator for inventory ledger in src/services/inventoryMockData.ts"
Task: "Implement inventory data hook in src/hooks/useInventoryData.ts"

# Launch all components for User Story 1 together:
Task: "Create inventory filters component in src/components/Inventory/InventoryFilters.tsx"
Task: "Create inventory table component with sorting in src/components/Inventory/InventoryTable.tsx"
Task: "Create permission guard component in src/components/Inventory/PermissionGuard.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (库存台账)
4. Complete Phase 4: User Story 2 (库存流水)
5. **STOP and VALIDATE**: Test User Stories 1 & 2 independently
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (Core MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (库存台账)
   - Developer B: User Story 2 (库存流水)
3. After US1 & US2 complete:
   - Developer A: User Story 3 (库存调整)
   - Developer B: User Story 4 (库存详情)
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Mock data strategy: minimal data for UI demonstration only
- Permission system: hardcoded roles with selector for testing
- State management: Zustand with no persistence (page refresh resets data)
- Performance: virtual scrolling for >100 records, responsive design for all screen sizes