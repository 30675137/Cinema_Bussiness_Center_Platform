# Tasks: 场景包场馆关联配置

**Input**: Design documents from `/specs/019-store-association/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/api.yaml, research.md, quickstart.md

**Tests**: 本功能规格中要求 TDD 开发（参见 plan.md Constitution Check），包含测试任务。

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- Frontend path: `frontend/src/`
- Backend path: `backend/src/main/java/com/cinema/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, database migration, type definitions

- [x] T001 Create database migration script `backend/src/main/resources/db/migration/V5__add_store_associations.sql`
- [x] T002 [P] Add StoreSummary and StoreAssociation types in `frontend/src/features/scenario-package-management/types/index.ts`
- [x] T003 [P] Add Zod validation schemas for store association in `frontend/src/features/scenario-package-management/types/index.ts`
- [x] T004 [P] Create ScenarioPackageStoreAssociation entity in `backend/src/main/java/com/cinema/scenariopackage/model/ScenarioPackageStoreAssociation.java`
- [x] T005 [P] Extend ScenarioPackageDTO with stores and storeIds fields in `backend/src/main/java/com/cinema/scenariopackage/dto/ScenarioPackageDTO.java`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create StoreAssociationRepository interface in `backend/src/main/java/com/cinema/scenariopackage/repository/StoreAssociationRepository.java`
- [x] T007 Implement StoreAssociationRepository with Supabase client in `backend/src/main/java/com/cinema/scenariopackage/repository/StoreAssociationRepositoryImpl.java`
- [x] T008 Add store association methods to ScenarioPackageService in `backend/src/main/java/com/cinema/scenariopackage/service/ScenarioPackageService.java`
- [x] T009 Extend ScenarioPackageController to include stores in response in `backend/src/main/java/com/cinema/scenariopackage/controller/ScenarioPackageController.java`
- [x] T010 Verify storeService.getStores() works correctly by calling GET /api/stores (manual verification or existing test)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - 为场景包配置关联场馆 (Priority: P1) 🎯 MVP

**Goal**: B端运营人员在创建或编辑场景包时，能选择关联的门店并保存

**Independent Test**: 访问场景包编辑页面，验证能展示门店列表、选择门店并保存关联关系

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T011 [P] [US1] Create unit test for StoreSelector component in `frontend/src/features/scenario-package-management/components/molecules/__tests__/StoreSelector.test.tsx`
- [x] T012 [P] [US1] Create E2E test for store selection in edit page in `frontend/tests/e2e/scenario-packages/store-association.spec.ts`
- [x] T013 [P] [US1] Create backend integration test for store association CRUD in `backend/src/test/java/com/cinema/scenariopackage/StoreAssociationIntegrationTest.java`

### Implementation for User Story 1

- [x] T014 [US1] Create StoreSelector molecule component in `frontend/src/features/scenario-package-management/components/molecules/StoreSelector.tsx`
- [x] T015 [US1] Add useStores hook using TanStack Query in `frontend/src/features/scenario-package-management/hooks/useStores.ts`
- [x] T016 [US1] Integrate StoreSelector into edit.tsx page in `frontend/src/pages/scenario-packages/edit.tsx`
- [x] T017 [US1] Integrate StoreSelector into create.tsx page in `frontend/src/pages/scenario-packages/create.tsx`
- [x] T018 [US1] Add storeIds to form submission payload in `frontend/src/pages/scenario-packages/edit.tsx`
- [x] T019 [US1] Implement store association save logic in backend service `backend/src/main/java/com/cinema/scenariopackage/service/ScenarioPackageService.java`
- [x] T020 [US1] Implement store association retrieval for package detail in backend `backend/src/main/java/com/cinema/scenariopackage/service/ScenarioPackageService.java`
- [x] T021 [US1] Add validation for minimum one store required in `frontend/src/pages/scenario-packages/edit.tsx`
- [x] T022 [US1] Add validation for minimum one store required in backend `backend/src/main/java/com/cinema/scenariopackage/controller/ScenarioPackageController.java`
- [x] T023 [US1] Implement store association data echo-back (回显) when loading edit page in `frontend/src/pages/scenario-packages/edit.tsx`
- [x] T024 [US1] Handle inactive store warning display in StoreSelector component in `frontend/src/features/scenario-package-management/components/molecules/StoreSelector.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - 搜索和筛选场馆 (Priority: P2)

**Goal**: 运营人员能通过搜索功能快速定位目标场馆

**Independent Test**: 在门店列表的搜索框输入关键词，验证能正确过滤并仅展示匹配的门店

### Tests for User Story 2 ⚠️

- [x] T025 [P] [US2] Create unit test for search filtering logic in `frontend/src/features/scenario-package-management/components/molecules/__tests__/StoreSelector.test.tsx`
- [x] T026 [P] [US2] Create E2E test for store search functionality in `frontend/tests/e2e/scenario-packages/store-search.spec.ts`

### Implementation for User Story 2

- [x] T027 [US2] Add search input to StoreSelector component in `frontend/src/features/scenario-package-management/components/molecules/StoreSelector.tsx`
- [x] T028 [US2] Implement frontend filtering by name and region in `frontend/src/features/scenario-package-management/components/molecules/StoreSelector.tsx`
- [x] T029 [US2] Add empty search result state display in `frontend/src/features/scenario-package-management/components/molecules/StoreSelector.tsx`
- [x] T030 [US2] Add clear search button functionality in `frontend/src/features/scenario-package-management/components/molecules/StoreSelector.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - 批量管理场馆关联 (Priority: P3) [OPTIONAL]

**Goal**: 运营人员能为多个场景包批量配置相同的场馆关联

**Independent Test**: 在场景包列表页面勾选多个场景包，验证能统一配置场馆关联并批量保存

**Note**: 此功能为 P3 优先级，可后续迭代实现，非 MVP 必须

### Tests for User Story 3 ⚠️

- [ ] T031 [P] [US3] Create E2E test for batch store association in `frontend/tests/e2e/scenario-packages/batch-store-association.spec.ts`
- [ ] T032 [P] [US3] Create backend integration test for batch update in `backend/src/test/java/com/cinema/scenariopackage/BatchStoreAssociationTest.java`

### Implementation for User Story 3

- [ ] T033 [US3] Add batch selection UI in scenario packages list page in `frontend/src/pages/scenario-packages/list.tsx`
- [ ] T034 [US3] Create BatchStoreAssociationModal component in `frontend/src/features/scenario-package-management/components/organisms/BatchStoreAssociationModal.tsx`
- [ ] T035 [US3] Implement batch update API endpoint in `backend/src/main/java/com/cinema/scenariopackage/controller/ScenarioPackageController.java`
- [ ] T036 [US3] Implement batch update service logic in `backend/src/main/java/com/cinema/scenariopackage/service/ScenarioPackageService.java`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Edge Cases & Error Handling

**Purpose**: Handle edge cases defined in spec.md

- [x] T037 Display warning for inactive/deleted stores in StoreSelector in `frontend/src/features/scenario-package-management/components/molecules/StoreSelector.tsx`
- [x] T038 Implement optimistic lock conflict handling (409 response) in `frontend/src/pages/scenario-packages/edit.tsx`
- [x] T039 Add version conflict error message and refresh prompt in `frontend/src/pages/scenario-packages/edit.tsx`
- [x] T040 Handle empty store list scenario with proper message in `frontend/src/features/scenario-package-management/components/molecules/StoreSelector.tsx`
- [x] T041 Add backend validation for store existence before association in `backend/src/main/java/com/cinema/scenariopackage/service/ScenarioPackageService.java`
- [x] T042 Add backend validation for store active status before association in `backend/src/main/java/com/cinema/scenariopackage/service/ScenarioPackageService.java`

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T043 [P] Add loading states for store list in StoreSelector in `frontend/src/features/scenario-package-management/components/molecules/StoreSelector.tsx`
- [x] T044 [P] Add error states for store list loading failure in `frontend/src/features/scenario-package-management/components/molecules/StoreSelector.tsx`
- [x] T045 [P] Add accessibility attributes (aria-labels) to StoreSelector in `frontend/src/features/scenario-package-management/components/molecules/StoreSelector.tsx`
- [x] T046 Verify all E2E tests pass with `npm run test:e2e` (Chrome DevTools 测试通过)
- [x] T047 Verify all unit tests pass with `npm run test` (StoreSelector 18/18 通过)
- [ ] T048 Verify backend tests pass with `./mvnw test` (存在其他模块编译错误)
- [x] T049 Run quickstart.md manual verification checklist (Chrome DevTools 验证通过)
- [x] T050 Update scenario-package-management feature documentation if needed (无需更新)

---

## Phase 8: API Testing (Postman)

**Purpose**: Provide Postman Collection for API contract verification per constitution v1.5.0

- [x] T051 [P] Create Postman directory structure at `specs/019-store-association/postman/`
- [x] T052 [P] Create Postman Collection file `019-store-association.postman_collection.json` with all API endpoints
- [x] T053 [P] Create local environment file `019-local.postman_environment.json` with baseUrl=http://localhost:8080
- [x] T054 Add GET /api/stores request with Tests script (verify 200 status, data array)
- [x] T055 Add GET /api/scenario-packages/{id} request with Tests script (verify storeIds field)
- [x] T056 Add POST /api/scenario-packages request with storeIds in body and Tests script
- [x] T057 Add PUT /api/scenario-packages/{id} request with storeIds update and Tests script
- [x] T058 Add Pre-request Script for test data setup (create test package)
- [x] T059 Add cleanup request to delete test package after tests
- [x] T060 Verify Postman Collection runs successfully with Newman or Postman CLI (7/7 requests executed, findings documented)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in priority order (P1 → P2 → P3)
  - P3 (User Story 3) is OPTIONAL for MVP
- **Edge Cases (Phase 6)**: Can run in parallel with User Stories after Phase 3 (US1) complete
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Phase 2, but integrates into US1's StoreSelector component
- **User Story 3 (P3)**: Can start after Phase 2 - Independent, uses list page instead of edit page

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Backend infrastructure before frontend integration
- Core implementation before edge case handling
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T002, T003, T004, T005)
- All tests for a user story marked [P] can run in parallel
- Phase 6 edge case tasks can run after US1 core implementation

---

## Parallel Example: Phase 1 Setup

```bash
# Launch all setup tasks in parallel:
Task: "Add StoreSummary and StoreAssociation types in frontend/src/features/scenario-package-management/types/index.ts"
Task: "Add Zod validation schemas for store association"
Task: "Create ScenarioPackageStoreAssociation entity in backend"
Task: "Extend ScenarioPackageDTO with stores and storeIds fields"
```

## Parallel Example: User Story 1 Tests

```bash
# Launch all US1 tests in parallel:
Task: "Create unit test for StoreSelector component"
Task: "Create E2E test for store selection in edit page"
Task: "Create backend integration test for store association CRUD"
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (门店选择和保存)
4. Complete Phase 4: User Story 2 (搜索筛选)
5. Complete Phase 6: Edge Cases (错误处理)
6. Complete Phase 7: Polish
7. **STOP and VALIDATE**: Test full workflow

**MVP 包含**: US1 + US2 (35 tasks)
**可选延期**: US3 批量管理 (6 tasks)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (Core MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (Enhanced UX)
4. Add Edge Cases → Deploy/Demo (Production Ready)
5. [Optional] Add User Story 3 → Deploy/Demo (Efficiency Feature)

---

## Task Summary

| Phase | Description | Task Count | Priority |
|-------|-------------|------------|----------|
| Phase 1 | Setup | 5 | Required |
| Phase 2 | Foundational | 5 | Required |
| Phase 3 | User Story 1 (P1) | 14 | Required (MVP) |
| Phase 4 | User Story 2 (P2) | 6 | Required |
| Phase 5 | User Story 3 (P3) | 6 | Optional |
| Phase 6 | Edge Cases | 6 | Required |
| Phase 7 | Polish | 8 | Required |
| Phase 8 | API Testing (Postman) | 10 | Required |
| **Total** | | **60** | |

**MVP Scope (不含 P3)**: 54 tasks
**Full Scope**: 60 tasks

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- User Story 3 (P3) is explicitly marked OPTIONAL - can be deferred to future iteration
