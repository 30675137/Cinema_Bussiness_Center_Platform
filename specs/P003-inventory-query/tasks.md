# Tasks: 门店SKU库存查询

**Input**: Design documents from `/specs/P003-inventory-query/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.yaml

**Tests**: TDD approach - Playwright E2E tests for key scenarios

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/main/java/com/cinema/inventory/`
- **Frontend**: `frontend/src/features/inventory/`
- **Tests**: `frontend/tests/e2e/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create backend inventory module structure in `backend/src/main/java/com/cinema/inventory/` with domain/, repository/, service/, controller/, dto/ subdirectories
- [x] T002 [P] Create frontend inventory feature structure in `frontend/src/features/inventory/` with components/, hooks/, services/, types/ subdirectories
- [x] T003 [P] Create database migration file `backend/src/main/resources/db/migration/V033__create_store_inventory.sql` per data-model.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Backend Foundation

- [x] T004 [P] Create InventoryStatus enum in `backend/src/main/java/com/cinema/inventory/domain/InventoryStatus.java`
- [x] T005 [P] Create Category entity in `backend/src/main/java/com/cinema/inventory/domain/Category.java`
- [x] T006 [P] Create StoreInventory entity in `backend/src/main/java/com/cinema/inventory/domain/StoreInventory.java` with inventory status calculation
- [x] T007 [P] Create CategoryRepository in `backend/src/main/java/com/cinema/inventory/repository/CategoryRepository.java`
- [x] T008 [P] Create StoreInventoryRepository in `backend/src/main/java/com/cinema/inventory/repository/StoreInventoryRepository.java` with custom query methods
- [x] T009 Create InventoryQueryParams DTO in `backend/src/main/java/com/cinema/inventory/dto/InventoryQueryParams.java`
- [x] T010 [P] Create StoreInventoryItemDto in `backend/src/main/java/com/cinema/inventory/dto/StoreInventoryItemDto.java`
- [x] T011 [P] Create InventoryListResponse DTO in `backend/src/main/java/com/cinema/inventory/dto/InventoryListResponse.java`

### Frontend Foundation

- [x] T012 [P] Create inventory types in `frontend/src/features/inventory/types/index.ts` per data-model.md TypeScript types
- [x] T013 [P] Create inventory API service in `frontend/src/features/inventory/services/inventoryService.ts` with listInventory, getInventoryDetail, listCategories, listAccessibleStores methods
- [x] T014 Create inventory hooks in `frontend/src/features/inventory/hooks/useInventory.ts` using TanStack Query
- [x] T015 [P] Create InventoryStatusTag atom component in `frontend/src/features/inventory/components/InventoryStatusTag.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - 查看门店库存列表 (Priority: P0) 🎯 MVP

**Goal**: 店长能够查看门店所有SKU的当前库存数量，包含七列（SKU编码、名称、现存/可用/预占数量、状态、单位）

**Independent Test**: 登录后进入库存页面，能看到当前门店的SKU库存列表，支持分页

### E2E Test for User Story 1

- [x] T016 [US1] Create E2E test for inventory list display in `frontend/tests/e2e/inventory/inventory-list.spec.ts` - verify table columns, pagination, empty state

### Backend Implementation for User Story 1

- [x] T017 [US1] Create InventoryService in `backend/src/main/java/com/cinema/inventory/service/InventoryService.java` with listInventory(params) method
- [x] T018 [US1] Create InventoryController GET /api/inventory endpoint in `backend/src/main/java/com/cinema/inventory/controller/InventoryController.java`

### Frontend Implementation for User Story 1

- [x] T019 [US1] Create InventoryTable organism component in `frontend/src/features/inventory/components/InventoryTable.tsx` with 7 columns per FR-001
- [x] T020 [US1] Create InventoryPage in `frontend/src/pages/inventory/InventoryPage.tsx` with basic list view
- [x] T021 [US1] Add inventory route to `frontend/src/router/index.tsx` path="/inventory"
- [x] T022 [US1] Add MSW handler for GET /api/inventory in `frontend/src/mocks/handlers/inventoryHandlers.ts`

**Checkpoint**: User Story 1 complete - inventory list viewable with pagination

---

## Phase 4: User Story 2 - 搜索库存 (Priority: P0)

**Goal**: 店长能够按SKU名称/编码搜索库存，快速定位商品

**Independent Test**: 输入搜索关键词，列表实时筛选显示匹配的SKU

### E2E Test for User Story 2

- [x] T023 [US2] Create E2E test for search functionality in `frontend/tests/e2e/inventory/inventory-search.spec.ts` - verify search input, debounce, results filtering, empty results

### Backend Implementation for User Story 2

- [x] T024 [US2] Add keyword search to StoreInventoryRepository in `backend/src/main/java/com/cinema/inventory/repository/StoreInventoryRepository.java` with ILIKE query for sku.name/code
- [x] T025 [US2] Update InventoryService to handle keyword parameter with 300ms debounce hint

### Frontend Implementation for User Story 2

- [x] T026 [US2] Create SearchInput component in `frontend/src/features/inventory/components/SearchInput.tsx` with 300ms debounce per FR-005
- [x] T027 [US2] Integrate SearchInput into InventoryPage with query param sync

**Checkpoint**: User Story 2 complete - search functionality working

---

## Phase 5: User Story 3 - 多维度筛选库存 (Priority: P0)

**Goal**: 店长能够按门店、库存状态、商品分类筛选库存

**Independent Test**: 选择筛选条件后，列表自动刷新显示符合条件的库存

### E2E Test for User Story 3

- [x] T028 [US3] Create E2E test for filter functionality in `frontend/tests/e2e/inventory/inventory-filter.spec.ts` - verify store filter, status filter (multi-select), category filter, combined filters, reset button

### Backend Implementation for User Story 3

- [x] T029 [US3] Create CategoryService in `backend/src/main/java/com/cinema/inventory/service/CategoryService.java` with listCategories method
- [x] T030 [US3] Add GET /api/categories endpoint to CategoryController in `backend/src/main/java/com/cinema/inventory/controller/CategoryController.java`
- [x] T031 [US3] Add status and categoryId filter support to StoreInventoryRepository query
- [x] T032 [US3] Add GET /api/stores/accessible endpoint (or reuse existing) for accessible stores list

### Frontend Implementation for User Story 3

- [x] T033 [US3] Create InventoryFilterBar molecule component in `frontend/src/features/inventory/components/InventoryFilterBar.tsx` with store Select, status multi-Select, category Select, reset Button
- [x] T034 [US3] Create inventory filter store in `frontend/src/features/inventory/stores/filterStore.ts` using Zustand for filter state
- [x] T035 [US3] Integrate InventoryFilterBar into InventoryPage with query param sync
- [x] T036 [US3] Add MSW handlers for GET /api/categories and GET /api/stores/accessible

**Checkpoint**: User Story 3 complete - all filters working with combined logic

---

## Phase 6: User Story 4 - 查看库存详情 (Priority: P1)

**Goal**: 店长能够查看单个SKU的库存详情

**Independent Test**: 点击库存列表行，抽屉显示详细库存信息

### E2E Test for User Story 4

- [x] T037 [US4] Create E2E test for detail drawer in `frontend/tests/e2e/inventory/inventory-detail.spec.ts` - verify row click opens drawer, detail fields displayed, close behavior, low stock warning

### Backend Implementation for User Story 4

- [x] T038 [US4] Create StoreInventoryDetailDto in `backend/src/main/java/com/cinema/inventory/dto/StoreInventoryDetailDto.java`
- [x] T039 [US4] Add getInventoryDetail method to InventoryService
- [x] T040 [US4] Add GET /api/inventory/{id} endpoint to InventoryController

### Frontend Implementation for User Story 4

- [x] T041 [US4] Create InventoryDetailDrawer organism component in `frontend/src/features/inventory/components/InventoryDetailDrawer.tsx` with all detail fields per FR-010
- [x] T042 [US4] Add row click handler to InventoryTable to open drawer
- [x] T043 [US4] Add low stock warning display in InventoryDetailDrawer when available < safetyStock
- [x] T044 [US4] Add MSW handler for GET /api/inventory/{id}

**Checkpoint**: User Story 4 complete - detail drawer fully functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T045 [P] Add loading and error states to InventoryPage in `frontend/src/pages/inventory/InventoryPage.tsx`
- [x] T046 [P] Add empty state component for no data / no search results per FR-011
- [x] T047 [P] Add retry button for network errors per Edge Cases
- [ ] T048 Run all E2E tests and fix any failures
- [ ] T049 Verify performance: list load <2s, search <1s, detail <500ms per Success Criteria
- [x] T050 Add inventory menu item to sidebar navigation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 → US2 → US3 → US4 (sequential, priority order)
  - Or US1, US2, US3 in parallel (all P0), then US4
- **Polish (Phase 7)**: Depends on all user stories complete

### User Story Dependencies

| Story | Depends On | Can Start After |
|-------|------------|-----------------|
| US1 | Foundation | Phase 2 complete |
| US2 | US1 (SearchInput builds on list) | T022 complete |
| US3 | US1 (Filters build on list) | T022 complete |
| US4 | US1 (Detail extends list) | T022 complete |

### Within Each User Story

1. E2E test first (TDD - should FAIL initially)
2. Backend implementation
3. Frontend implementation
4. Verify E2E test PASSES

### Parallel Opportunities

**Phase 2 - All [P] tasks can run in parallel:**
- T004, T005, T006, T007, T008 (backend entities/repos)
- T010, T011 (DTOs)
- T012, T013, T015 (frontend types/services/components)

**User Stories - After US1 complete:**
- US2, US3, US4 implementation can proceed in parallel (different components)

---

## Parallel Example: Phase 2 Foundation

```bash
# Launch all backend domain tasks together:
Task: "Create InventoryStatus enum" (T004)
Task: "Create Category entity" (T005)
Task: "Create StoreInventory entity" (T006)

# Launch all frontend foundation tasks together:
Task: "Create inventory types" (T012)
Task: "Create inventory API service" (T013)
Task: "Create InventoryStatusTag component" (T015)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundation (T004-T015)
3. Complete Phase 3: User Story 1 (T016-T022)
4. **STOP and VALIDATE**: Test US1 independently - list displays with pagination
5. Deploy/demo if ready

### Full Feature Delivery

1. Setup + Foundation → Foundation ready
2. Add User Story 1 → Test → Inventory list viewable
3. Add User Story 2 → Test → Search working
4. Add User Story 3 → Test → Filters working
5. Add User Story 4 → Test → Detail drawer working
6. Polish phase → Performance validated

---

## Task Summary

| Phase | Tasks | Parallel Tasks |
|-------|-------|----------------|
| Setup | 3 | 2 |
| Foundational | 12 | 9 |
| US1 (List) | 7 | 0 |
| US2 (Search) | 5 | 0 |
| US3 (Filter) | 9 | 0 |
| US4 (Detail) | 8 | 0 |
| Polish | 6 | 3 |
| **Total** | **50** | **14** |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify E2E tests fail before implementing, pass after
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
