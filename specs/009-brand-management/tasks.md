# Tasks: 品牌管理

**Input**: Design documents from `/specs/009-brand-management/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/brand-api.md
**Tests**: Included as feature specification requires TDD approach (宪法要求测试驱动开发)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## 🎯 项目进度概览

- ✅ **Phase 1: Setup** - 项目初始化 (100% 完成)
- ✅ **Phase 2: Foundational** - 基础设施 (100% 完成)
- ✅ **Phase 3: User Story 1** - 品牌列表浏览与搜索 (100% 完成)
- ✅ **Phase 4: User Story 2** - 品牌创建与信息维护 (100% 完成)
- 🔄 **Phase 5: User Story 3** - 品牌状态管理 (待开始)
- 🔄 **Phase 6: User Story 4** - 品牌详情查看与编辑 (待开始)
- 🔄 **Phase 7: Polish & Cross-Cutting** - 优化与完善 (待开始)

**总体进度**: 4/7 Phases 已完成 (57.1%)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/src/`, `tests/` at repository root
- **Feature modules**: `frontend/src/features/brand-management/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create brand-management feature directory structure per implementation plan
- [x] T002 [P] Initialize TypeScript configuration for React 19.2.0 project
- [x] T003 [P] Configure ESLint + Prettier for code quality standards
- [x] T004 [P] Setup Vitest and Playwright testing infrastructure
- [x] T005 [P] Initialize MSW for API mocking in development

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 [P] Setup Zustand store structure for brand state management
- [x] T007 [P] Configure TanStack Query for server state management and caching
- [x] T008 [P] Setup React Router for navigation and route handling
- [x] T009 [P] Create MSW handlers for brand API endpoints
- [x] T010 [P] Configure Ant Design theme and component library setup
- [x] T011 Create core Brand types and enums in frontend/src/features/brand-management/types/brand.types.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 品牌列表浏览与搜索 (Priority: P1) 🎯 MVP

**Goal**: 用户能够浏览品牌列表、使用搜索筛选功能、查看品牌基本信息

**Independent Test**: 验证用户能够打开品牌列表页面、使用各种筛选条件、查看品牌信息，测试数据展示的完整性和交互的流畅性

### Tests for User Story 1 (TDD Approach) ⚠️

> **NOTE**: Write these tests FIRST, ensure they FAIL before implementation

- [x] T012 [P] [US1] E2E test for brand list page loading in tests/e2e/brand-list.spec.ts
- [x] T013 [P] [US1] E2E test for brand search functionality in tests/e2e/brand-search.spec.ts
- [x] T014 [P] [US1] E2E test for brand filtering by type and status in tests/e2e/brand-filter.spec.ts
- [x] T015 [P] [US1] Unit test for BrandList component in tests/unit/components/BrandList.test.tsx

### Implementation for User Story 1

- [x] T016 [P] [US1] Create BrandStatusTag atom component in frontend/src/features/brand-management/components/atoms/BrandStatusTag.tsx
- [x] T017 [P] [US1] Create BrandTypeTag atom component in frontend/src/features/brand-management/components/atoms/BrandTypeTag.tsx
- [x] T018 [P] [US1] Create BrandLogo atom component in frontend/src/features/brand-management/components/atoms/BrandLogo.tsx
- [x] T019 [P] [US1] Create BrandSearchForm molecule component in frontend/src/features/brand-management/components/molecules/BrandSearchForm.tsx
- [x] T020 [P] [US1] Create BrandFilters molecule component in frontend/src/features/brand-management/components/molecules/BrandFilters.tsx
- [x] T021 [P] [US1] Create BrandTable molecule component in frontend/src/features/brand-management/components/molecules/BrandTable.tsx
- [x] T022 [US1] Create BrandList organism component in frontend/src/features/brand-management/components/organisms/BrandList.tsx
- [x] T023 [US1] Create useBrandList hook in frontend/src/features/brand-management/hooks/useBrandList.ts
- [x] T024 [US1] Create BrandList page component in frontend/src/features/brand-management/components/BrandListPage.tsx
- [x] T025 [US1] Setup brand list route in frontend/src/App.tsx or routing configuration

**Checkpoint**: ✅ **COMPLETED** - At this point, User Story 1 should be fully functional and testable independently

**Status**: Phase 3 completed - 品牌列表浏览与搜索功能已完全实现，包括：
- ✅ 品牌列表展示（分页、筛选、搜索）
- ✅ 品牌状态和类型标签
- ✅ 品牌LOGO显示
- ✅ 完整的E2E测试覆盖
- ✅ 响应式设计

---

## Phase 4: User Story 2 - 品牌创建与信息维护 (Priority: P1)

**Goal**: 主数据管理员能够创建新品牌、维护品牌信息、上传LOGO、表单验证

**Independent Test**: 验证管理员能够成功创建新品牌、填写所有必要信息并保存，测试品牌数据的完整性和表单验证的有效性

### Tests for User Story 2 (TDD Approach) ⚠️

- [x] T026 [P] [US2] E2E test for brand creation flow in tests/e2e/brand-creation.spec.ts
- [x] T027 [P] [US2] E2E test for brand validation in tests/e2e/brand-validation.spec.ts
- [x] T028 [P] [US2] E2E test for logo upload functionality in tests/e2e/brand-logo-upload.spec.ts
- [x] T029 [P] [US2] Unit test for BrandForm component in tests/unit/components/BrandForm.test.tsx

### Implementation for User Story 2

- [x] T030 [P] [US2] Create BrandForm molecule component in frontend/src/features/brand-management/components/molecules/BrandForm.tsx
- [x] T031 [P] [US2] Create BrandDrawer organism component in frontend/src/features/brand-management/components/organisms/BrandDrawer.tsx
- [x] T032 [P] [US2] Create BrandLogoUpload molecule component in frontend/src/features/brand-management/components/molecules/BrandLogoUpload.tsx
- [x] T033 [P] [US2] Create brand validation schema in frontend/src/features/brand-management/utils/brandValidation.ts
- [x] T034 [US2] Create useBrandActions hook in frontend/src/features/brand-management/hooks/useBrandActions.ts
- [x] T035 [US2] Create brand service in frontend/src/features/brand-management/services/brandService.ts
- [x] T036 [US2] Integrate brand creation in BrandList component (add "新建品牌" button functionality)
- [x] T037 [US2] Add brand creation MSW handler in frontend/src/mocks/handlers/brandHandlers.ts

**Checkpoint**: ✅ **COMPLETED** - At this point, User Stories 1 AND 2 should both work independently

**Status**: Phase 4 completed - 品牌创建与信息维护功能已完全实现，包括：
- ✅ 品牌创建流程（表单验证、LOGO上传、数据提交）
- ✅ 品牌信息维护（编辑模式、字段验证、状态管理）
- ✅ 完整的E2E测试覆盖
- ✅ MSW API模拟支持
- ✅ 组件间集成（BrandDrawer集成到BrandList）

---

## Phase 5: User Story 3 - 品牌状态管理与启用停用控制 (Priority: P1)

**Goal**: 管理员能够管理品牌状态、控制品牌可用性、处理状态变更确认

**Independent Test**: 验证管理员能够切换品牌状态、系统正确处理状态变更的影响范围，测试状态管理的业务逻辑完整性

### Tests for User Story 3 (TDD Approach) ⚠️

- [ ] T038 [P] [US3] E2E test for brand status change flow in tests/e2e/brand-status-change.spec.ts
- [ ] T039 [P] [US3] E2E test for brand disable confirmation in tests/e2e/brand-disable-confirmation.spec.ts
- [ ] T040 [P] [US3] Unit test for status change logic in tests/unit/services/brandService.test.ts

### Implementation for User Story 3

- [ ] T041 [P] [US3] Create BrandStatusActions molecule component in frontend/src/features/brand-management/components/molecules/BrandStatusActions.tsx
- [ ] T042 [P] [US3] Create BrandStatusConfirm modal component in frontend/src/features/brand-management/components/molecules/BrandStatusConfirm.tsx
- [ ] T043 [US3] Implement brand status change logic in brandService.ts
- [ ] T044 [US3] Add status management to BrandTable component (status action buttons)
- [ ] T045 [US3] Add status management to BrandDetail component (edit mode status controls)
- [ ] T046 [US3] Create status change confirmation flow in useBrandActions hook
- [ ] T047 [US3] Add status filtering logic to BrandFilters component
- [ ] T048 [US3] Add status change MSW handlers in brandHandlers.ts

**Checkpoint**: User Stories 1, 2, AND 3 should now be independently functional

---

## Phase 6: User Story 4 - 品牌详情查看与编辑 (Priority: P2)

**Goal**: 用户能够查看品牌详情、编辑品牌信息、查看关联统计信息

**Independent Test**: 验证用户能够查看品牌完整详情、编辑品牌信息并保存，测试详情展示的完整性和编辑功能的正确性

### Tests for User Story 4 (TDD Approach) ⚠️

- [ ] T049 [P] [US4] E2E test for brand detail view in tests/e2e/brand-detail.spec.ts
- [ ] T050 [P] [US4] E2E test for brand edit functionality in tests/e2e/brand-edit.spec.ts
- [ ] T051 [P] [US4] Unit test for BrandDetail component in tests/unit/components/BrandDetail.test.tsx

### Implementation for User Story 4

- [ ] T052 [P] [US4] Create BrandDetail organism component in frontend/src/features/brand-management/components/organisms/BrandDetail.tsx
- [ ] T053 [P] [US4] Create BrandInfo molecule component in frontend/src/features/brand-management/components/molecules/BrandInfo.tsx
- [ ] T054 [P] [US4] Create BrandUsageStats molecule component in frontend/src/features/brand-management/components/molecules/BrandUsageStats.tsx
- [ ] T055 [P] [US4] Implement brand detail view mode in BrandDrawer (read-only state)
- [ ] T056 [P] [US4] Implement brand edit mode in BrandDrawer (edit state toggle)
- [ ] T057 [P] [US4] Add brand name link navigation in BrandTable component
- [ ] T058 [P] [US4] Create brand usage statistics API integration in brandService.ts
- [ ] T059 [P] [US4] Add SPU/SKU count navigation links in BrandUsageStats component

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T060 [P] Performance optimization for large brand lists (virtual scrolling)
- [ ] T061 [P] Implement accessibility improvements (keyboard navigation, ARIA labels)
- [ ] T062 [P] Add error boundaries and comprehensive error handling
- [ ] T063 [P] Add loading states and skeleton components
- [ ] T064 [P] Implement responsive design for mobile devices
- [ ] T065 [P] Add comprehensive unit tests for all components
- [ ] T066 [P] Add integration tests for complete user flows
- [ ] T067 Documentation updates in README.md and component docs
- [ ] T068 Code cleanup and refactoring for maintainability
- [ ] T069 Security hardening (input sanitization, XSS prevention)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P1 → P1 → P2)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Integrates with US1 components but independently testable
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - Uses components from US1/US2 but independently testable
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Integrates with all P1 stories but independently testable

### Within Each User Story

- Tests (TDD) MUST be written and FAIL before implementation
- Atom components before molecule components
- Molecule components before organism components
- Hooks and services before UI components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Components within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (TDD approach):
Task: "E2E test for brand list page loading in tests/e2e/brand-list.spec.ts"
Task: "E2E test for brand search functionality in tests/e2e/brand-search.spec.ts"
Task: "Unit test for BrandList component in tests/unit/components/BrandList.test.tsx"

# Launch all atom components for User Story 1 together:
Task: "Create BrandStatusTag atom component in frontend/src/features/brand-management/components/atoms/BrandStatusTag.tsx"
Task: "Create BrandTypeTag atom component in frontend/src/features/brand-management/components/atoms/BrandTypeTag.tsx"
Task: "Create BrandLogo atom component in frontend/src/features/brand-management/components/atoms/BrandLogo.tsx"

# Launch all molecule components for User Story 1 together:
Task: "Create BrandSearchForm molecule component in frontend/src/features/brand-management/components/molecules/BrandSearchForm.tsx"
Task: "Create BrandFilters molecule component in frontend/src/features/brand-management/components/molecules/BrandFilters.tsx"
Task: "Create BrandTable molecule component in frontend/src/features/brand-management/components/molecules/BrandTable.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (P1)
   - Developer B: User Story 2 (P1)
   - Developer C: User Story 3 (P1)
   - Developer D: User Story 4 (P2) (after P1 stories start)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD approach required by 宪法)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Total tasks: 69 (including tests)
- Tasks per user story: US1 (15), US2 (12), US3 (12), US4 (10)
- Test coverage: E2E tests for critical flows, unit tests for components
- MVP scope: Phase 1-3 (User Story 1) - 22 tasks total