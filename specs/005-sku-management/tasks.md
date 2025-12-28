# Tasks: SKU 管理

**Input**: Design documents from `/specs/005-sku-management/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Tests are OPTIONAL for this feature. E2E tests will be added in Polish phase if needed.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2], [US3])
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/Cinema_Operation_Admin/src/`
- All paths are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure verification

- [x] T001 Verify project structure exists: `frontend/Cinema_Operation_Admin/src/`
- [x] T002 [P] Verify TypeScript configuration in `frontend/Cinema_Operation_Admin/tsconfig.json`
- [x] T003 [P] Verify React 18.2.0 and dependencies in `frontend/Cinema_Operation_Admin/package.json`
- [x] T004 [P] Verify Ant Design 6.1.0 is installed
- [ ] T005 [P] Verify Zustand 5.0.9 is installed (currently 4.4.0, may need upgrade)
- [ ] T006 [P] Verify TanStack Query 5.90.12 is installed (currently 5.0.0, may need upgrade)
- [x] T007 [P] Verify React Hook Form 7.68.0 is installed
- [x] T008 [P] Verify Zod 4.1.13 is installed
- [x] T009 Verify routing structure in `frontend/Cinema_Operation_Admin/src/router/index.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T010 [P] Create SKU type definitions in `frontend/Cinema_Operation_Admin/src/types/sku.ts` (SKU, Barcode, SalesUnit, SkuQueryParams, SkuListResponse, SkuCreateRequest, SkuUpdateRequest)
- [x] T011 [P] Create SKU Zustand store in `frontend/Cinema_Operation_Admin/src/stores/skuStore.ts` (filters, pagination, sorting state management)
- [x] T012 Create SKU Mock API service in `frontend/Cinema_Operation_Admin/src/services/mockSkuApi.ts` (generate 1000+ mock SKUs, implement all API endpoints: list, get, create, update, toggleStatus, checkBarcode)
- [x] T013 Create SKU TanStack Query hooks in `frontend/Cinema_Operation_Admin/src/hooks/useSku.ts` (useSkuListQuery, useSkuQuery, useCreateSkuMutation, useUpdateSkuMutation, useToggleSkuStatusMutation, useCheckBarcodeMutation)
- [x] T014 Verify SKU route exists in `frontend/Cinema_Operation_Admin/src/router/index.tsx` (path: '/product/sku')

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 查看和搜索 SKU 列表 (Priority: P1) 🎯 MVP

**Goal**: 实现SKU列表页面，支持关键字搜索、多条件筛选、分页和排序功能，用户可以快速浏览和查找SKU信息。

**Independent Test**: 可以独立测试通过访问 `/product/sku` 页面，使用筛选和搜索功能查找特定SKU，验证列表展示和筛选功能是否正常工作。

### Implementation for User Story 1

- [x] T015 [P] [US1] Create SkuFilters component in `frontend/Cinema_Operation_Admin/src/components/sku/SkuFilters.tsx` (keyword search, SPU, brand, category, status, manageInventory filters)
- [x] T016 [P] [US1] Create SkuTable component in `frontend/Cinema_Operation_Admin/src/components/sku/SkuTable.tsx` (table columns: code, name, spuName, brand, category, status, actions)
- [x] T017 [US1] Create SkuListPage component in `frontend/Cinema_Operation_Admin/src/pages/product/sku/SkuListPage.tsx` (integrate SkuFilters, SkuTable, pagination, connect to useSkuListQuery)
- [x] T018 [US1] Implement keyword search logic in `frontend/Cinema_Operation_Admin/src/services/mockSkuApi.ts` (match code, name, mainBarcode)
- [x] T019 [US1] Implement filter logic in `frontend/Cinema_Operation_Admin/src/services/mockSkuApi.ts` (SPU, brand, category, status, manageInventory)
- [x] T020 [US1] Implement pagination logic in `frontend/Cinema_Operation_Admin/src/services/mockSkuApi.ts` (page, pageSize)
- [x] T021 [US1] Implement sorting logic in `frontend/Cinema_Operation_Admin/src/services/mockSkuApi.ts` (sortField, sortOrder)
- [x] T022 [US1] Connect filters to Zustand store in `frontend/Cinema_Operation_Admin/src/pages/product/sku/SkuListPage.tsx` (sync filter state)
- [x] T023 [US1] Implement reset filters functionality in `frontend/Cinema_Operation_Admin/src/components/sku/SkuFilters.tsx`
- [x] T024 [US1] Add empty state display in `frontend/Cinema_Operation_Admin/src/pages/product/sku/SkuListPage.tsx` (no data, no search results)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - 创建新 SKU (Priority: P1)

**Goal**: 实现SKU创建功能，包括多步骤表单（基础信息、单位条码、规格属性、其他配置），采用上下分离布局，支持表单验证和条码唯一性检查。

**Independent Test**: 可以独立测试通过点击"新建 SKU"按钮，填写SKU表单信息，提交后验证新SKU是否成功创建并在列表中显示。

### Implementation for User Story 2

- [x] T025 [P] [US2] Create BasicInfoTab component in `frontend/Cinema_Operation_Admin/src/components/sku/SkuForm/BasicInfoTab.tsx` (name, spuId with auto-fill brand/category, spec fields)
- [x] T026 [P] [US2] Create UnitBarcodeTab component in `frontend/Cinema_Operation_Admin/src/components/sku/SkuForm/UnitBarcodeTab.tsx` (mainUnit, mainBarcode, otherBarcodes list, salesUnits list with conversionRate)
- [x] T027 [P] [US2] Create SpecAttrTab component in `frontend/Cinema_Operation_Admin/src/components/sku/SkuForm/SpecAttrTab.tsx` (category attributes, spec fields)
- [x] T028 [P] [US2] Create OtherConfigTab component in `frontend/Cinema_Operation_Admin/src/components/sku/SkuForm/OtherConfigTab.tsx` (manageInventory, allowNegativeStock, minOrderQty, minSaleQty)
- [x] T029 [US2] Create SkuForm main component in `frontend/Cinema_Operation_Admin/src/components/sku/SkuForm/index.tsx` (multi-step form with Steps navigation, top section: steps + buttons, bottom section: form fields, status field at top)
- [x] T030 [US2] Implement form validation schema in `frontend/Cinema_Operation_Admin/src/components/sku/SkuForm/index.tsx` (using Zod, required fields: name, spuId, mainUnit, mainBarcode)
- [x] T031 [US2] Implement step navigation logic in `frontend/Cinema_Operation_Admin/src/components/sku/SkuForm/index.tsx` (next, previous, clickable steps)
- [x] T032 [US2] Implement status field in top section in `frontend/Cinema_Operation_Admin/src/components/sku/SkuForm/index.tsx` (below steps, above content area)
- [x] T033 [US2] Implement SPU selection with auto-fill in `frontend/Cinema_Operation_Admin/src/components/sku/SkuForm/BasicInfoTab.tsx` (select SPU, auto-fill brand and category)
- [x] T034 [US2] Implement barcode uniqueness check in `frontend/Cinema_Operation_Admin/src/components/sku/SkuForm/UnitBarcodeTab.tsx` (call useCheckBarcodeMutation on blur)
- [x] T035 [US2] Implement form submission in `frontend/Cinema_Operation_Admin/src/components/sku/SkuForm/index.tsx` (call useCreateSkuMutation, close drawer, refresh list)
- [x] T036 [US2] Implement unsaved changes warning in `frontend/Cinema_Operation_Admin/src/components/sku/SkuForm/index.tsx` (detect changes, show confirm dialog on close)
- [x] T037 [US2] Implement auto-scroll to invalid field in `frontend/Cinema_Operation_Admin/src/components/sku/SkuForm/index.tsx` (on validation error)
- [x] T038 [US2] Add "新建 SKU" button in `frontend/Cinema_Operation_Admin/src/pages/product/sku/SkuListPage.tsx` (open SkuForm drawer)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - 编辑现有 SKU (Priority: P2)

**Goal**: 实现SKU编辑功能，复用创建表单组件，支持数据预填充和更新操作。

**Independent Test**: 可以独立测试通过在SKU列表中找到目标SKU，点击"编辑"按钮，修改表单信息后保存，验证修改是否成功应用。

### Implementation for User Story 3

- [x] T039 [US3] Add edit mode support to SkuForm in `frontend/Cinema_Operation_Admin/src/components/sku/SkuForm/index.tsx` (accept skuId prop, fetch SKU data, pre-fill form)
- [x] T040 [US3] Implement form pre-fill logic in `frontend/Cinema_Operation_Admin/src/components/sku/SkuForm/index.tsx` (use useSkuQuery to load data, populate all form fields)
- [x] T041 [US3] Update form submission to handle edit mode in `frontend/Cinema_Operation_Admin/src/components/sku/SkuForm/index.tsx` (call useUpdateSkuMutation instead of useCreateSkuMutation)
- [x] T042 [US3] Update barcode check to exclude current SKU in `frontend/Cinema_Operation_Admin/src/components/sku/SkuForm/UnitBarcodeTab.tsx` (pass excludeSkuId to checkBarcode API)
- [x] T043 [US3] Add "编辑" button in SkuTable in `frontend/Cinema_Operation_Admin/src/components/sku/SkuTable.tsx` (open SkuForm drawer with skuId)
- [x] T044 [US3] Implement step click navigation in `frontend/Cinema_Operation_Admin/src/components/sku/SkuForm/index.tsx` (allow clicking steps to jump between tabs)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - 查看 SKU 详情 (Priority: P2)

**Goal**: 实现SKU详情查看功能，显示完整信息包括所有字段和关联信息入口。

**Independent Test**: 可以独立测试通过在SKU列表中点击"查看"按钮，验证详情信息是否正确展示，包括所有字段和关联信息入口。

### Implementation for User Story 4

- [x] T045 [P] [US4] Create SkuDetail component in `frontend/Cinema_Operation_Admin/src/components/sku/SkuDetail.tsx` (display all SKU fields in sections: basic info, unit/barcode, spec/attributes, other config)
- [x] T046 [US4] Implement detail data fetching in `frontend/Cinema_Operation_Admin/src/components/sku/SkuDetail.tsx` (use useSkuQuery to load SKU data)
- [x] T047 [US4] Add association info display in `frontend/Cinema_Operation_Admin/src/components/sku/SkuDetail.tsx` (BOM count, price rules count, inventory count, scene package count - display as links if applicable)
- [x] T048 [US4] Add "编辑" button in SkuDetail in `frontend/Cinema_Operation_Admin/src/components/sku/SkuDetail.tsx` (if user has edit permission, open SkuForm in edit mode)
- [x] T049 [US4] Add "查看" button in SkuTable in `frontend/Cinema_Operation_Admin/src/components/sku/SkuTable.tsx` (open SkuDetail drawer)

**Checkpoint**: At this point, User Stories 1, 2, 3, AND 4 should all work independently

---

## Phase 7: User Story 5 - 启用/停用 SKU 状态 (Priority: P3)

**Goal**: 实现SKU状态切换功能，支持启用/停用操作，显示确认对话框。

**Independent Test**: 可以独立测试通过在SKU列表中点击"停用"或"启用"按钮，验证SKU状态是否正确切换，并在列表中正确显示新状态。

### Implementation for User Story 5

- [x] T050 [US5] Implement status toggle mutation in `frontend/Cinema_Operation_Admin/src/hooks/useSku.ts` (useToggleSkuStatusMutation already exists, verify implementation)
- [x] T051 [US5] Add status toggle buttons in SkuTable in `frontend/Cinema_Operation_Admin/src/components/sku/SkuTable.tsx` (显示"启用"/"停用"按钮，根据当前状态)
- [x] T052 [US5] Implement confirm dialog for status toggle in `frontend/Cinema_Operation_Admin/src/components/sku/SkuTable.tsx` (use Modal.confirm before calling mutation)
- [x] T053 [US5] Update status display in SkuTable in `frontend/Cinema_Operation_Admin/src/components/sku/SkuTable.tsx` (show status tags with colors: draft=gray, enabled=green, disabled=red)
- [x] T054 [US5] Implement button visibility logic in `frontend/Cinema_Operation_Admin/src/components/sku/SkuTable.tsx` (hide/disable buttons based on current status and permissions)

**Checkpoint**: At this point, User Stories 1, 2, 3, 4, AND 5 should all work independently

---

## Phase 8: User Story 6 - 在其他模块中选择 SKU (Priority: P3)

**Goal**: 实现可复用的SKU选择器组件，支持单选和多选模式，供其他模块使用。

**Independent Test**: 可以独立测试通过在其他模块中触发SKU选择功能，验证选择器是否正常打开，支持搜索和筛选，并能正确返回选中的SKU信息。

### Implementation for User Story 6

- [x] T055 [P] [US6] Create SkuSelector component in `frontend/Cinema_Operation_Admin/src/components/sku/SkuSelector.tsx` (Modal with SkuFilters and SkuTable, support single/multiple selection)
- [x] T056 [US6] Implement selection mode in `frontend/Cinema_Operation_Admin/src/components/sku/SkuSelector.tsx` (accept mode prop: 'single' | 'multiple')
- [x] T057 [US6] Implement selection state management in `frontend/Cinema_Operation_Admin/src/components/sku/SkuSelector.tsx` (track selected SKU IDs)
- [x] T058 [US6] Implement onSelect callback in `frontend/Cinema_Operation_Admin/src/components/sku/SkuSelector.tsx` (return selected SKU(s) to caller)
- [x] T059 [US6] Add filters support in `frontend/Cinema_Operation_Admin/src/components/sku/SkuSelector.tsx` (accept optional filters prop to pre-filter)
- [x] T060 [US6] Add excludeIds support in `frontend/Cinema_Operation_Admin/src/components/sku/SkuSelector.tsx` (exclude specific SKU IDs from selection)
- [x] T061 [US6] Export SkuSelector component in `frontend/Cinema_Operation_Admin/src/components/sku/index.ts` (for easy import by other modules)

**Checkpoint**: At this point, all user stories should be independently functional

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T062 [P] Implement error handling and error messages display (use errorHandler utility, show user-friendly messages)
- [x] T063 [P] Add loading states to all async operations (use TanStack Query isLoading states, show Spin components)
- [x] T064 [P] Implement empty states for list and search results (no data, no search results, friendly messages)
- [x] T065 [P] Add data-testid attributes to all interactive elements for E2E testing (buttons, inputs, tables, forms)
- [ ] T066 [P] Add accessibility features (ARIA labels, keyboard navigation)
- [ ] T067 [P] Optimize performance (memoization, lazy loading, virtual scrolling if needed)
- [ ] T068 [P] Add unit tests for skuStore in `frontend/Cinema_Operation_Admin/tests/unit/sku/skuStore.test.ts`
- [ ] T069 [P] Add unit tests for SkuForm component in `frontend/Cinema_Operation_Admin/tests/unit/sku/SkuForm.test.tsx`
- [ ] T070 [P] Add E2E tests for SKU management in `frontend/Cinema_Operation_Admin/tests/e2e/sku-management.spec.ts` (cover all user stories)
- [ ] T071 Code cleanup and refactoring (remove unused code, optimize imports, improve code organization)
- [ ] T072 Update component documentation (add JSDoc comments, update README if needed)
- [ ] T073 Run quickstart.md validation (verify all steps work, update if needed)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Depends on US1 for list display after creation
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Reuses US2 form components
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Independent, but uses same data structure
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - Depends on US1 for table display
- **User Story 6 (P3)**: Can start after Foundational (Phase 2) - Reuses US1 filters and table components

### Within Each User Story

- Components can be created in parallel if they don't depend on each other
- Form tabs can be created in parallel
- Services and hooks should be created before components that use them
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, user stories can start in parallel (if team capacity allows)
- Form tabs (T025-T028) can be created in parallel
- Components marked [P] within a story can be created in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 2

```bash
# Launch all form tabs in parallel:
Task: "Create BasicInfoTab component in frontend/Cinema_Operation_Admin/src/components/sku/SkuForm/BasicInfoTab.tsx"
Task: "Create UnitBarcodeTab component in frontend/Cinema_Operation_Admin/src/components/sku/SkuForm/UnitBarcodeTab.tsx"
Task: "Create SpecAttrTab component in frontend/Cinema_Operation_Admin/src/components/sku/SkuForm/SpecAttrTab.tsx"
Task: "Create OtherConfigTab component in frontend/Cinema_Operation_Admin/src/components/sku/SkuForm/OtherConfigTab.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (List View)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Add User Story 6 → Test independently → Deploy/Demo
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (List)
   - Developer B: User Story 2 (Create) - can start after T010-T014
   - Developer C: User Story 4 (Detail) - can start after T010-T014
3. After US1 and US2 complete:
   - Developer A: User Story 3 (Edit) - reuses US2 components
   - Developer B: User Story 5 (Status Toggle) - uses US1 table
   - Developer C: User Story 6 (Selector) - reuses US1 components
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All file paths are relative to repository root
- Mock API service should generate 1000+ SKU records for realistic testing
- Form uses React Hook Form + Zod for validation
- State management: Zustand for UI state, TanStack Query for server state
- UI layout: Top section (steps + buttons + status), Bottom section (form fields)

---

## Task Summary

- **Total Tasks**: 73
- **Phase 1 (Setup)**: 9 tasks
- **Phase 2 (Foundational)**: 5 tasks
- **Phase 3 (US1 - List)**: 10 tasks
- **Phase 4 (US2 - Create)**: 14 tasks
- **Phase 5 (US3 - Edit)**: 6 tasks
- **Phase 6 (US4 - Detail)**: 5 tasks
- **Phase 7 (US5 - Status)**: 5 tasks
- **Phase 8 (US6 - Selector)**: 7 tasks
- **Phase 9 (Polish)**: 12 tasks

### Parallel Opportunities

- **Phase 1**: 8 parallel tasks (T002-T008)
- **Phase 2**: 1 parallel task (T010, T011)
- **Phase 3**: 2 parallel tasks (T015, T016)
- **Phase 4**: 4 parallel tasks (T025-T028 for form tabs)
- **Phase 6**: 1 parallel task (T045)
- **Phase 8**: 1 parallel task (T055)
- **Phase 9**: 10 parallel tasks (T062-T072)

### Independent Test Criteria

- **US1**: Access `/product/sku`, use search/filter, verify list displays correctly
- **US2**: Click "新建 SKU", fill form, submit, verify SKU appears in list
- **US3**: Click "编辑" on a SKU, modify fields, save, verify changes in list
- **US4**: Click "查看" on a SKU, verify all details display correctly
- **US5**: Click "启用"/"停用", confirm, verify status changes in list
- **US6**: Open SKU selector from another module, search/select, verify callback

### Suggested MVP Scope

**MVP = Phase 1 + Phase 2 + Phase 3 (User Story 1 only)**

This delivers a working SKU list page with search, filter, pagination, and sort - the foundation for all other features.
