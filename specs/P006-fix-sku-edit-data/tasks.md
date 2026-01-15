# Tasks: SKU编辑页面数据加载修复

**@spec P006-fix-sku-edit-data**

**Input**: Design documents from `/specs/P006-fix-sku-edit-data/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: E2E tests will be generated using e2e-test-generator skill per TR-001 requirement.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app structure**: `backend/src/`, `frontend/src/`
- **Frontend paths**: `frontend/src/pages/`, `frontend/src/components/`, `frontend/src/services/`, `frontend/src/hooks/`, `frontend/src/types/`
- **Backend paths**: `backend/src/main/java/com/cinema/`, `backend/src/main/resources/`, `backend/src/test/java/`
- **Test paths**: `frontend/tests/e2e/`, `scenarios/product/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and environment preparation

- [ ] T001 Verify project dependencies installed (Node.js 18+, Java 21, Maven 3.8+)
- [ ] T002 [P] Install frontend dependencies in `frontend/` with `npm install`
- [ ] T003 [P] Verify backend builds successfully with `./mvnw clean compile` in `backend/`
- [ ] T004 [P] Create `.env.local` in `frontend/` with `VITE_API_BASE_URL=http://localhost:8080`
- [ ] T005 [P] Verify Supabase connection in `backend/src/main/resources/application.yml` (check SUPABASE_URL, SUPABASE_ANON_KEY)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Create TypeScript type definitions in `frontend/src/types/product.ts` (SKU, SPU, BOM, BOMComponent, SKUDetailResponse per data-model.md)
- [ ] T007 [P] Create Java DTOs in `backend/src/main/java/com/cinema/product/dto/` (SKUDetailResponse.java, LoadMetadata.java per data-model.md)
- [ ] T008 [P] Add `version` field to SKU entity in `backend/src/main/java/com/cinema/product/entity/Sku.java` with `@Version` annotation for optimistic locking (FR-011)
- [ ] T009 Create database migration script `backend/src/main/resources/db/migration/V00X__add_sku_version_field.sql` to add `version INTEGER NOT NULL DEFAULT 0` to `skus` table
- [ ] T010 [P] Configure logging infrastructure in `backend/src/main/java/com/cinema/common/logging/DataLoadingLogger.java` for NFR-001 requirements
- [ ] T011 [P] Setup MSW handlers in `frontend/src/mocks/handlers/productHandlers.ts` for SKU/SPU/BOM API mocking

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 查看完整的SKU信息 (Priority: P1) 🎯 MVP

**Goal**: 运营人员在SKU编辑页面能够查看SKU关联的SPU完整信息（产品名称、分类、品牌、描述等），实现FR-001、FR-003、FR-009、FR-010

**Independent Test**: 打开任意已关联SPU的SKU编辑页面，验证SPU信息正确显示且为只读状态

### E2E Tests for User Story 1 (TR-001: API动态创建测试数据)

> **NOTE: Generate E2E tests using e2e-test-generator skill, write tests FIRST, ensure they FAIL before implementation**

- [ ] T012 [P] [US1] Create E2E scenario YAML in `scenarios/product/E2E-PRODUCT-001.yaml` defining "SKU编辑页面加载SPU数据" test scenario (use test-scenario-author skill)
- [ ] T013 [US1] Generate E2E test script `frontend/tests/e2e/sku-edit-spu-loading.spec.ts` from scenario YAML (use e2e-test-generator skill with `--testdata-api` flag per TR-001)
- [ ] T014 [US1] Run E2E test to verify it FAILS (Red phase) - SPU data not loading yet

### Implementation for User Story 1

**Backend Tasks**:

- [ ] T015 [P] [US1] Implement `getSKUWithRelations(String id)` method in `backend/src/main/java/com/cinema/product/service/SKUService.java` to query SKU+SPU+BOM from Supabase with LEFT JOINs
- [ ] T016 [P] [US1] Add `GET /api/skus/{id}/details` endpoint in `backend/src/main/java/com/cinema/product/controller/SKUController.java` returning `SKUDetailResponse`
- [ ] T017 [US1] Implement Caffeine cache for SPU data in `SKUService` with 5-minute TTL (research decision #1)
- [ ] T018 [US1] Add error handling for partial failure scenarios (SPU load failed but SKU success) using `metadata.spuLoadSuccess` field
- [ ] T019 [US1] Add logging in `getSKUWithRelations()` for NFR-001: log SKU ID, SPU ID, load success/failure, HTTP status, timestamp, user ID

**Frontend Tasks**:

- [ ] T020 [P] [US1] Create `useSKUEditData` custom hook in `frontend/src/hooks/useSKUEditData.ts` using TanStack Query with single `useQuery` (research decision #2)
- [ ] T021 [P] [US1] Implement `getSKUDetails(id)` API service in `frontend/src/services/skuService.ts` calling `GET /api/skus/{id}/details`
- [ ] T022 [P] [US1] Create `SPUInfoDisplay` component in `frontend/src/components/ProductManagement/SPUInfoDisplay.tsx` showing SPU info as read-only (FR-003)
- [ ] T023 [P] [US1] Create loading skeleton component `DataLoadingSkeleton.tsx` in `frontend/src/components/ProductManagement/` for FR-010
- [ ] T024 [US1] Modify `SKUEdit` page in `frontend/src/pages/ProductManagement/SKUEdit.tsx` to use `useSKUEditData` hook and render `SPUInfoDisplay` component
- [ ] T025 [US1] Add visual grouping/sections in `SKUEdit.tsx` to distinguish SKU基本信息 and SPU关联信息 (FR-009)
- [ ] T026 [US1] Handle "未关联SPU" scenario: display `<Alert type="info">未关联SPU</Alert>` when `spu` is null (US1 Acceptance Scenario 3)
- [ ] T027 [US1] Add TanStack Query error handling in `useSKUEditData` to log errors with SKU ID, failure type, timestamp (NFR-001 frontend logging)

**Testing Tasks**:

- [ ] T028 [P] [US1] Write unit test for `useSKUEditData` hook in `frontend/src/hooks/useSKUEditData.test.tsx` using Vitest + React Testing Library
- [ ] T029 [P] [US1] Write unit test for `SKUService.getSKUWithRelations()` in `backend/src/test/java/com/cinema/product/service/SKUServiceTest.java` using JUnit 5 + Mockito
- [ ] T030 [US1] Run E2E test again to verify it PASSES (Green phase) - SPU data now loading

**Checkpoint**: At this point, User Story 1 should be fully functional - SKU edit page displays SPU info

---

## Phase 4: User Story 2 - 查看完整的BOM配方数据 (Priority: P1)

**Goal**: 运营人员在SKU编辑页面能够查看BOM配方详细信息（原料清单、用量、单位、损耗率），实现FR-002、FR-004、NFR-003（虚拟滚动）

**Independent Test**: 打开任意配置了BOM的成品SKU编辑页面，验证BOM配方列表正确显示包含原料名称、数量、单位、损耗率

### E2E Tests for User Story 2

- [ ] T031 [P] [US2] Create E2E scenario YAML in `scenarios/product/E2E-PRODUCT-002.yaml` defining "SKU编辑页面加载BOM配方数据" test scenario (including 10+ ingredients for virtual scrolling test per NFR-003)
- [ ] T032 [US2] Generate E2E test script `frontend/tests/e2e/sku-edit-bom-loading.spec.ts` from scenario YAML (use e2e-test-generator skill)
- [ ] T033 [US2] Run E2E test to verify it FAILS (Red phase) - BOM data not loading yet

### Implementation for User Story 2

**Backend Tasks** (BOM loading already included in T015-T016, add edge case handling):

- [ ] T034 [P] [US2] Enhance `getSKUWithRelations()` in `SKUService.java` to handle BOM component status (mark `BOMComponent.status='invalid'` if ingredient SKU deleted per FR-008)
- [ ] T035 [US2] Add logging for BOM load failures in `getSKUWithRelations()` (NFR-001)

**Frontend Tasks**:

- [ ] T036 [P] [US2] Create `BOMListDisplay` component in `frontend/src/components/ProductManagement/BOMListDisplay.tsx` using Ant Design Table with `virtual` prop (research decision #3: Ant Design built-in virtual scrolling)
- [ ] T037 [US2] Implement virtual scrolling logic in `BOMListDisplay.tsx`: enable `virtual={bom.components.length > 10}` and `scroll={{ y: 400 }}` per NFR-003
- [ ] T038 [US2] Add BOM table columns in `BOMListDisplay.tsx`: 原料编码, 原料名称, 用量, 单位, 标准成本, 状态 (per US2 Acceptance Scenario 2)
- [ ] T039 [US2] Display 损耗率 (waste rate) above BOM table in `BOMListDisplay.tsx` (FR-004, US2 Acceptance Scenario 4)
- [ ] T040 [US2] Modify `SKUEdit.tsx` to integrate `BOMListDisplay` component and add visual section for BOM配方信息 (FR-009)
- [ ] T041 [US2] Handle "未配置配方" scenario: display `<Alert type="info">未配置配方</Alert>` when `bom` is null (US2 Acceptance Scenario 3)
- [ ] T042 [US2] Mark invalid BOM components with `<Tag color="red">原料已失效</Tag>` in table when `component.status === 'invalid'` (FR-008 edge case)

**Testing Tasks**:

- [ ] T043 [P] [US2] Write unit test for `BOMListDisplay` component in `frontend/src/components/ProductManagement/BOMListDisplay.test.tsx` (test virtual scrolling activation with 10+ items)
- [ ] T044 [P] [US2] Write unit test for BOM component status handling in `SKUServiceTest.java`
- [ ] T045 [US2] Run E2E test again to verify it PASSES (Green phase) - BOM data now loading with virtual scrolling

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - SKU edit page displays SPU info + BOM recipe

---

## Phase 5: User Story 3 - 编辑SKU时保持数据完整性 (Priority: P2)

**Goal**: 运营人员修改SKU信息时，确保SPU和BOM数据保持一致，处理并发编辑冲突，优雅处理加载失败场景，实现FR-005、FR-006、FR-007、FR-011

**Independent Test**: 编辑SKU价格并保存，验证SPU关联和BOM配方数据未改变；模拟SPU加载失败，验证错误提示清晰且SKU基本信息仍可查看

### E2E Tests for User Story 3

- [ ] T046 [P] [US3] Create E2E scenario YAML in `scenarios/product/E2E-PRODUCT-003.yaml` defining "SKU编辑保存后数据完整性验证" + "并发编辑冲突检测" scenarios
- [ ] T047 [US3] Generate E2E test script `frontend/tests/e2e/sku-edit-data-integrity.spec.ts` from scenario YAML
- [ ] T048 [US3] Run E2E test to verify it FAILS (Red phase) - data integrity not yet implemented

### Implementation for User Story 3

**Backend Tasks**:

- [ ] T049 [P] [US3] Implement optimistic locking in `PUT /api/skus/{id}` endpoint in `SKUController.java`: check `version` field in request matches DB version (research decision #4: JPA @Version)
- [ ] T050 [US3] Add 409 Conflict response when version mismatch detected with error code `SKU_BIZ_001` and message "数据已被其他用户修改，请刷新后重试" (FR-011)
- [ ] T051 [US3] Ensure `updateSKU()` in `SKUService.java` does NOT modify `spuId` or BOM data, only update SKU basic fields (price, stock, status) per FR-007
- [ ] T052 [US3] Add logging for conflict detection: log expected version, actual version, user ID, timestamp (NFR-001)

**Frontend Tasks**:

- [ ] T053 [P] [US3] Create `DataLoadingError` component in `frontend/src/components/ProductManagement/DataLoadingError.tsx` showing error message + retry button (FR-005)
- [ ] T054 [US3] Handle partial load failure in `SKUEdit.tsx`: when `metadata.spuLoadSuccess === false`, display `<Alert type="warning">SPU信息加载失败</Alert>` + retry button but still show SKU基本信息 (FR-006, US3 Acceptance Scenario 3)
- [ ] T055 [US3] Handle partial load failure for BOM: when `metadata.bomLoadSuccess === false`, display `<Alert type="error">BOM配方加载失败</Alert>` + retry button (FR-006)
- [ ] T056 [US3] Implement conflict detection modal in `SKUEdit.tsx`: when `updateSKU` API returns 409, show Modal with title "数据已被其他用户修改，您确认要覆盖吗？" with "取消" and "覆盖保存" buttons (FR-011)
- [ ] T057 [US3] Add retry logic in `useSKUEditData` hook: provide `refetch()` function to retry failed SPU/BOM loads (FR-006)
- [ ] T058 [US3] Implement "覆盖保存" action: fetch latest `version` from API, then resubmit with new version (FR-011 clarification: last writer wins)
- [ ] T059 [US3] Add frontend logging for data load failures using `console.error()` + TanStack Query `onError` callback (NFR-001)

**Testing Tasks**:

- [ ] T060 [P] [US3] Write unit test for optimistic locking in `SKUControllerTest.java` (test version mismatch returns 409)
- [ ] T061 [P] [US3] Write unit test for partial load failure rendering in `SKUEdit.test.tsx` (mock `metadata.spuLoadSuccess=false`)
- [ ] T062 [P] [US3] Write unit test for conflict modal in `SKUEdit.test.tsx` (mock 409 response)
- [ ] T063 [US3] Run E2E test again to verify it PASSES (Green phase) - data integrity + conflict detection working

**Checkpoint**: All user stories should now be independently functional - complete SKU edit experience with SPU, BOM, conflict handling, error recovery

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, code quality, performance optimization

- [ ] T064 [P] Verify all files have `@spec P006-fix-sku-edit-data` annotation per code quality rule
- [ ] T065 [P] Run TypeScript strict mode check: `cd frontend && npx tsc --noEmit`
- [ ] T066 [P] Run ESLint check: `cd frontend && npm run lint`
- [ ] T067 [P] Run Prettier format: `cd frontend && npm run format`
- [ ] T068 [P] Run frontend unit tests: `cd frontend && npm run test:unit`
- [ ] T069 [P] Run backend unit tests: `cd backend && ./mvnw test`
- [ ] T070 Verify performance goals: measure SKU edit page load time (target <2s per SC-001) using Playwright trace
- [ ] T071 Verify first screen render time <1.5s per SC-007 using Lighthouse or WebPageTest
- [ ] T072 Verify BOM virtual scrolling achieves ≥60 FPS with 10+ ingredients per NFR-003 (use Chrome DevTools Performance profiling)
- [ ] T073 [P] Add code comments explaining complex logic (BOM virtual scrolling threshold, conflict detection)
- [ ] T074 [P] Update `frontend/README.md` with new `useSKUEditData` hook documentation
- [ ] T075 Run final E2E test suite: `cd frontend && npm run test:e2e` - all tests should PASS
- [ ] T076 Run quickstart.md validation: manually follow quickstart.md steps to verify instructions work
- [ ] T077 Create `.gitignore` entries for test artifacts (`test-results/`, `playwright-report/`, `coverage/`)
- [ ] T078 Create `.eslintignore` entries for generated files (`*.spec.ts` in scenarios/, `mocks/`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational (Phase 2) - No dependencies on other stories
  - User Story 2 (P1): Can start after Foundational (Phase 2) - Technically independent but benefits from US1 `useSKUEditData` hook (reuses hook for BOM)
  - User Story 3 (P2): Can start after Foundational (Phase 2) - Depends on US1+US2 being complete for integration testing
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: ✅ Independently testable - only needs SPU data loading
- **User Story 2 (P1)**: ✅ Independently testable - only needs BOM data loading (but shares `useSKUEditData` hook with US1)
- **User Story 3 (P2)**: ⚠️ Integrates with US1+US2 - requires both SPU and BOM to test data integrity preservation

### Within Each User Story

- E2E tests (if included) MUST be written and FAIL before implementation
- Backend API before frontend hooks
- Hooks/services before components
- Components before page integration
- Core implementation before edge case handling
- Story complete before moving to next priority

### Parallel Opportunities

**Setup Phase (Phase 1)**:
- T002, T003, T004, T005 can run in parallel

**Foundational Phase (Phase 2)**:
- T007, T008, T010, T011 can run in parallel (different files)

**User Story 1 Implementation**:
- T015, T016 can run in parallel (backend Controller + Service if carefully coordinated)
- T020, T021, T022, T023 can run in parallel (different frontend files)
- T028, T029 can run in parallel (frontend + backend tests)

**User Story 2 Implementation**:
- T034, T035 can run in parallel (backend enhancements)
- T036, T037, T038, T039 can run in parallel (BOM component development if split into sub-tasks)
- T043, T044 can run in parallel (frontend + backend tests)

**User Story 3 Implementation**:
- T049, T050, T051 can run in parallel (backend conflict detection logic)
- T053, T054, T055 can run in parallel (error handling components)
- T060, T061, T062 can run in parallel (test files)

**Polish Phase (Phase 6)**:
- T064, T065, T066, T067, T068, T069, T073, T074, T077, T078 can all run in parallel

---

## Parallel Example: User Story 1 Implementation

```bash
# Backend team:
Task T015: Implement getSKUWithRelations() in SKUService.java
Task T016: Add GET /api/skus/{id}/details endpoint in SKUController.java

# Frontend team (in parallel with backend):
Task T020: Create useSKUEditData hook
Task T021: Implement getSKUDetails() in skuService.ts
Task T022: Create SPUInfoDisplay component
Task T023: Create DataLoadingSkeleton component

# Testing team (after implementation):
Task T028: Unit test useSKUEditData
Task T029: Unit test SKUService.getSKUWithRelations()
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T011) - CRITICAL
3. Complete Phase 3: User Story 1 (T012-T030)
4. **STOP and VALIDATE**: Run E2E test E2E-PRODUCT-001 - verify SPU data loads
5. Deploy/demo if ready - **this is a working MVP**

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (SPU loading) → Test independently → **Deploy/Demo (MVP!)**
3. Add User Story 2 (BOM loading) → Test independently → **Deploy/Demo (Feature complete!)**
4. Add User Story 3 (Data integrity) → Test independently → **Deploy/Demo (Production ready!)**
5. Polish (Phase 6) → Final quality checks → **Production deployment**

### Parallel Team Strategy

With 2-3 developers:

1. **All team**: Complete Setup + Foundational together (T001-T011)
2. Once Foundational is done:
   - **Developer A**: User Story 1 backend (T015-T019)
   - **Developer B**: User Story 1 frontend (T020-T027)
   - **Developer C (if available)**: Start User Story 2 E2E tests (T031-T033)
3. After US1 complete, split US2 and US3:
   - **Developer A**: User Story 2 backend (T034-T035)
   - **Developer B**: User Story 2 frontend (T036-T042)
   - **Developer C**: User Story 3 backend (T049-T052)
4. Final integration and polish together

---

## Notes

- **[P] tasks** = different files, no dependencies, can run in parallel
- **[Story] label** maps task to specific user story for traceability
- **E2E test generation**: Use `/e2e create-scenario` and `/e2e generate` skills per TR-001
- **Optimistic locking**: Research decision #4 - use JPA `@Version` annotation
- **Virtual scrolling**: Research decision #3 - use Ant Design Table built-in `virtual` prop
- **Data aggregation**: Research decision #1 - single API endpoint `GET /api/skus/{id}/details`
- **TanStack Query**: Research decision #2 - single `useQuery` hook, no parallel requests
- **Logging**: NFR-001 - frontend console.error + backend SLF4J structured JSON logs
- **Performance targets**: SC-001 (<2s load), SC-007 (<1.5s first screen), NFR-003 (≥60 FPS scrolling)
- Verify tests fail (Red) before implementing (Green)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **Constitution compliance**: All code must include `@spec P006-fix-sku-edit-data` annotation

---

## Task Summary

**Total Tasks**: 78
- Setup (Phase 1): 5 tasks
- Foundational (Phase 2): 6 tasks
- User Story 1 (Phase 3): 19 tasks (3 E2E + 12 implementation + 4 testing)
- User Story 2 (Phase 4): 15 tasks (3 E2E + 10 implementation + 2 testing)
- User Story 3 (Phase 5): 18 tasks (3 E2E + 12 implementation + 3 testing)
- Polish (Phase 6): 15 tasks

**Parallel Opportunities**: 35 tasks marked [P] (44.9% of tasks can run in parallel within phases)

**Independent Test Criteria**:
- **US1**: Open SKU edit page → SPU info displays correctly (name, category, brand) + read-only
- **US2**: Open SKU edit page → BOM recipe displays with 4 ingredients + waste rate + virtual scroll if >10
- **US3**: Edit SKU price → save → SPU+BOM unchanged + conflict modal on version mismatch

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1 only) = 30 tasks → Delivers SPU data loading

**Production Scope**: All phases (78 tasks) → Complete bugfix with SPU, BOM, conflict detection, error handling
