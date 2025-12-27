# Implementation Tasks: 门店管理 - 增删改功能

**Feature**: 022-store-crud
**Branch**: `022-store-crud`
**Date**: 2025-12-22
**Status**: Phase 1-6 实现完成，Phase 7 测试与优化进行中

## Overview

This document breaks down the implementation of Store Management CRUD operations into executable tasks organized by user story. The feature extends the existing read-only store management page (from 014) with full create, update, status toggle, and delete capabilities, plus comprehensive audit logging.

**User Stories** (in priority order):
1. **US1 (P1)**: 创建新门店 - Create new store functionality
2. **US2 (P1)**: 编辑门店信息 - Edit existing store functionality
3. **US3 (P2)**: 停用/启用门店 - Toggle store status (ACTIVE ↔ INACTIVE)
4. **US4 (P3)**: 删除门店 - Delete store with safety checks

## Task Execution Strategy

### TDD Approach
Per constitution requirement, all tasks follow Test-Driven Development:
1. Write tests first (Playwright E2E + Vitest unit tests)
2. Implement code to pass tests
3. Refactor and optimize

### Parallelization
- Tasks marked with **[P]** can be executed in parallel (different files, no dependencies)
- Sequential tasks must complete in order

### MVP Scope
**Minimum Viable Product** = Phase 3 (User Story 1: Create Store)
- Delivers immediate value: Operators can add new stores
- Independently testable and deployable
- Foundation for subsequent features

---

## Phase 1: Setup & Infrastructure

**Goal**: Initialize database schema, shared types, and foundational utilities.

**Tasks**:

- [x] T001 Run database migration script to extend stores table with status and version fields in `specs/022-store-crud/data-model.md`
- [x] T002 Run database migration script to create store_operation_logs table in `specs/022-store-crud/data-model.md`
- [x] T003 [P] Create StoreStatus enum (ACTIVE, INACTIVE) in `frontend/src/pages/stores/types/store.types.ts`
- [x] T004 [P] Create OperationType enum (CREATE, UPDATE, STATUS_CHANGE, DELETE) in `frontend/src/pages/stores/types/store.types.ts`
- [x] T005 [P] Extend Store interface with status and version fields in `frontend/src/pages/stores/types/store.types.ts`
- [x] T006 [P] Create CreateStoreDTO interface in `frontend/src/pages/stores/types/store.types.ts`
- [x] T007 [P] Create UpdateStoreDTO interface in `frontend/src/pages/stores/types/store.types.ts`
- [x] T008 [P] Create ToggleStatusDTO interface in `frontend/src/pages/stores/types/store.types.ts`
- [x] T009 [P] Create StoreOperationLog interface in `frontend/src/pages/stores/types/operationLog.types.ts`
- [x] T010 [P] Create REGIONS constant (华北, 华东, etc.) in `frontend/src/constants/regions.ts`
- [x] T011 [P] Create CITIES constant (mapped to regions) in `frontend/src/constants/regions.ts`
- [x] T012 [P] Create StoreStatus Java enum in `backend/src/main/java/com/cinema/hallstore/domain/enums/StoreStatus.java`
- [x] T013 [P] Create OperationType Java enum in `backend/src/main/java/com/cinema/hallstore/domain/enums/OperationType.java`
- [x] T014 [P] Extend Store entity with status field (@Enumerated) and version field (@Version) in `backend/src/main/java/com/cinema/hallstore/domain/Store.java`
- [x] T015 [P] Create StoreOperationLog entity with JSONB mapping for before/after values in `backend/src/main/java/com/cinema/hallstore/domain/StoreOperationLog.java`
- [x] T016 [P] Create CreateStoreDTO with Bean Validation annotations in `backend/src/main/java/com/cinema/hallstore/dto/CreateStoreDTO.java`
- [x] T017 [P] Create UpdateStoreDTO with Bean Validation and version field in `backend/src/main/java/com/cinema/hallstore/dto/UpdateStoreDTO.java`
- [x] T018 [P] Create StoreOperationLogDTO in `backend/src/main/java/com/cinema/hallstore/dto/StoreOperationLogDTO.java`
- [x] T019 [P] Create StoreNotFoundException in `backend/src/main/java/com/cinema/hallstore/exception/StoreNotFoundException.java`
- [x] T020 [P] Create StoreNameConflictException in `backend/src/main/java/com/cinema/hallstore/exception/StoreNameConflictException.java`
- [x] T021 [P] Create StoreHasDependenciesException in `backend/src/main/java/com/cinema/hallstore/exception/StoreHasDependenciesException.java`
- [x] T022 [P] Create StoreOperationLogRepository in `backend/src/main/java/com/cinema/hallstore/repository/StoreOperationLogRepository.java`
- [x] T023 Add findByNameIgnoreCase custom query method to StoreRepository in `backend/src/main/java/com/cinema/hallstore/repository/StoreRepository.java`
- [x] T024 Add existsByNameIgnoreCaseAndIdNot query method to StoreRepository for uniqueness check (excluding current store) in `backend/src/main/java/com/cinema/hallstore/repository/StoreRepository.java`

**Completion Criteria**: All database tables created, all shared types defined, all exception classes ready.

---

## Phase 2: Foundational Components

**Goal**: Build shared validation schemas, API service methods, and audit logging service (blocking for all user stories).

**Tasks**:

- [x] T025 [P] Create Zod validation schema for store form (name, region, city, address, phone) in `frontend/src/pages/stores/validations/storeSchema.ts`
- [x] T026 [P] Create phone number regex validator (mobile + landline) in Zod schema in `frontend/src/pages/stores/validations/storeSchema.ts`
- [x] T027 [P] Create StoreFormFields component (shared form fields for create/edit modals) in `frontend/src/pages/stores/components/StoreFormFields.tsx`
- [x] T028 Create StoreOperationLogService with logCreate, logUpdate, logStatusChange, logDelete methods in `backend/src/main/java/com/cinema/hallstore/service/StoreOperationLogService.java`
- [x] T029 Create StoreValidator with validateNameUniqueness and validatePhoneFormat methods in `backend/src/main/java/com/cinema/hallstore/validator/StoreValidator.java`
- [x] T030 Add global exception handler (@ControllerAdvice) for StoreNotFoundException, StoreNameConflictException, StoreHasDependenciesException, OptimisticLockException in `backend/src/main/java/com/cinema/common/exception/GlobalExceptionHandler.java`

**Completion Criteria**: Shared form fields component ready, validation schemas complete, audit logging service functional.

---

## Phase 3: User Story 1 - 创建新门店 (P1)

**Story Goal**: Operators can create new stores by filling out a form with name, region, city, address, and phone.

**Independent Test Criteria**:
- Operator clicks "新建门店" button → CreateStoreModal opens
- Fill all required fields → Submit → New store appears in list with status "启用"
- Leave name empty → Submit → Validation error displayed
- Enter duplicate name → Submit → Backend returns 409 conflict error
- Enter invalid phone → Submit → Client-side Zod validation error

**Tasks**:

### T031-T035: E2E Tests (TDD - Write First)

- [ ] T031 [P] [US1] Write Playwright test for creating store with valid data in `frontend/tests/e2e/stores/create-store.spec.ts`
- [ ] T032 [P] [US1] Write Playwright test for name required validation in `frontend/tests/e2e/stores/create-store.spec.ts`
- [ ] T033 [P] [US1] Write Playwright test for duplicate name error (409) in `frontend/tests/e2e/stores/create-store.spec.ts`
- [ ] T034 [P] [US1] Write Playwright test for phone format validation in `frontend/tests/e2e/stores/create-store.spec.ts`
- [ ] T035 [P] [US1] Write Playwright test for list refresh after successful creation in `frontend/tests/e2e/stores/create-store.spec.ts`

### T036-T040: Unit Tests (TDD - Write First)

- [ ] T036 [P] [US1] Write Vitest test for Zod schema validation (all required fields) in `frontend/src/features/store-management/validations/storeSchema.test.ts`
- [ ] T037 [P] [US1] Write Vitest test for phone regex (mobile and landline formats) in `frontend/src/features/store-management/validations/storeSchema.test.ts`
- [ ] T038 [P] [US1] Write Vitest test for useCreateStore hook (TanStack Query mutation) in `frontend/src/features/store-management/hooks/useCreateStore.test.ts`
- [ ] T039 [P] [US1] Write JUnit test for StoreService.createStore method in `backend/src/test/java/com/cinema/service/StoreServiceTest.java`
- [ ] T040 [P] [US1] Write JUnit test for StoreValidator.validateNameUniqueness in `backend/src/test/java/com/cinema/validator/StoreValidatorTest.java`

### T041-T050: Frontend Implementation

- [x] T041 [US1] Create CreateStoreModal component with Ant Design Modal and Form in `frontend/src/pages/stores/components/CreateStoreModal.tsx`
- [x] T042 [US1] Integrate StoreFormFields component into CreateStoreModal in `frontend/src/pages/stores/components/CreateStoreModal.tsx`
- [x] T043 [US1] Implement React Hook Form + Zod validation in CreateStoreModal in `frontend/src/pages/stores/components/CreateStoreModal.tsx`
- [x] T044 [US1] Create useCreateStore hook (TanStack Query useMutation) with cache invalidation in `frontend/src/pages/stores/hooks/useCreateStore.ts`
- [x] T045 [US1] Add createStore API method (POST /api/stores) in storeService in `frontend/src/pages/stores/services/storeService.ts`
- [x] T046 [US1] Add "新建门店" button to stores page header in `frontend/src/pages/stores/index.tsx`
- [x] T047 [US1] Add modal state management (local useState) in `frontend/src/pages/stores/index.tsx`
- [x] T048 [US1] Connect CreateStoreModal to "新建门店" button click handler in `frontend/src/pages/stores/index.tsx`
- [x] T049 [US1] Handle success/error feedback (Ant Design message) in CreateStoreModal in `frontend/src/pages/stores/components/CreateStoreModal.tsx`
- [ ] T050 [P] [US1] Create MSW handler for POST /api/stores (mock validation, conflict errors) in `frontend/src/mocks/handlers/stores.ts`

### T051-T056: Backend Implementation

- [x] T051 [US1] Implement StoreService.createStore method (validate uniqueness, save, log) in `backend/src/main/java/com/cinema/hallstore/service/StoreService.java`
- [x] T052 [US1] Add POST /api/stores endpoint in StoreQueryController with @Valid CreateStoreDTO in `backend/src/main/java/com/cinema/hallstore/controller/StoreQueryController.java`
- [x] T053 [US1] Implement name uniqueness check in createStore (throw StoreNameConflictException if duplicate) in `backend/src/main/java/com/cinema/hallstore/service/StoreService.java`
- [x] T054 [US1] Call StoreOperationLogService.logCreate after successful creation in `backend/src/main/java/com/cinema/hallstore/service/StoreService.java`
- [x] T055 [US1] Map CreateStoreDTO to Store entity (set default status=ACTIVE, version=0) in `backend/src/main/java/com/cinema/hallstore/service/StoreService.java`
- [x] T056 [US1] Return ApiResponse<StoreDTO> with 201 Created status in `backend/src/main/java/com/cinema/hallstore/controller/StoreQueryController.java`

**Phase 3 Completion Criteria**: All tests pass, create store workflow fully functional, audit log created.

---

## Phase 4: User Story 2 - 编辑门店信息 (P1)

**Story Goal**: Operators can edit existing store information (name, region, city, address, phone) with optimistic locking.

**Independent Test Criteria**:
- Operator clicks "编辑" button on store row → EditStoreModal opens with pre-filled data
- Modify address → Submit → Store info updated, list refreshes
- Clear name field → Submit → Validation error
- Edit name to duplicate → Submit → Backend returns 409 conflict
- Concurrent edit conflict → Backend returns 409 version mismatch → User sees "刷新后重试" message

**Tasks**:

### T057-T061: E2E Tests (TDD - Write First)

- [ ] T057 [P] [US2] Write Playwright test for editing store with valid data in `frontend/tests/e2e/stores/edit-store.spec.ts`
- [ ] T058 [P] [US2] Write Playwright test for pre-filled form fields in EditStoreModal in `frontend/tests/e2e/stores/edit-store.spec.ts`
- [ ] T059 [P] [US2] Write Playwright test for name uniqueness validation on edit in `frontend/tests/e2e/stores/edit-store.spec.ts`
- [ ] T060 [P] [US2] Write Playwright test for optimistic lock conflict (version mismatch) in `frontend/tests/e2e/stores/edit-store.spec.ts`
- [ ] T061 [P] [US2] Write Playwright test for list refresh after successful edit in `frontend/tests/e2e/stores/edit-store.spec.ts`

### T062-T065: Unit Tests (TDD - Write First)

- [ ] T062 [P] [US2] Write Vitest test for useUpdateStore hook (with version field) in `frontend/src/features/store-management/hooks/useUpdateStore.test.ts`
- [ ] T063 [P] [US2] Write JUnit test for StoreService.updateStore method in `backend/src/test/java/com/cinema/service/StoreServiceTest.java`
- [ ] T064 [P] [US2] Write JUnit test for optimistic lock exception handling in `backend/src/test/java/com/cinema/service/StoreServiceTest.java`
- [ ] T065 [P] [US2] Write JUnit test for StoreOperationLogService.logUpdate (before/after values) in `backend/src/test/java/com/cinema/service/StoreOperationLogServiceTest.java`

### T066-T074: Frontend Implementation

- [x] T066 [US2] Create EditStoreModal component with Ant Design Modal and Form in `frontend/src/pages/stores/components/EditStoreModal.tsx`
- [x] T067 [US2] Integrate StoreFormFields component into EditStoreModal (reuse from US1) in `frontend/src/pages/stores/components/EditStoreModal.tsx`
- [x] T068 [US2] Implement form pre-fill with existing store data (useEffect + reset) in `frontend/src/pages/stores/components/EditStoreModal.tsx`
- [x] T069 [US2] Pass version field in UpdateStoreDTO for optimistic locking in `frontend/src/pages/stores/components/EditStoreModal.tsx`
- [x] T070 [US2] Create useUpdateStore hook (TanStack Query useMutation) with cache invalidation in `frontend/src/pages/stores/hooks/useUpdateStore.ts`
- [x] T071 [US2] Add updateStore API method (PUT /api/stores/{id}/full) in storeService in `frontend/src/pages/stores/services/storeService.ts`
- [x] T072 [US2] Add "编辑" button to StoreTable action column in `frontend/src/pages/stores/components/StoreTable.tsx`
- [x] T073 [US2] Handle optimistic lock error (409) with user-friendly message "请刷新后重试" in `frontend/src/pages/stores/components/EditStoreModal.tsx`
- [ ] T074 [P] [US2] Create MSW handler for PUT /api/stores/:id (mock version check, conflict errors) in `frontend/src/mocks/handlers/stores.ts`

### T075-T080: Backend Implementation

- [x] T075 [US2] Implement StoreService.updateStore method (validate uniqueness excluding current, update, log) in `backend/src/main/java/com/cinema/hallstore/service/StoreService.java`
- [x] T076 [US2] Add PUT /api/stores/{id}/full endpoint in StoreQueryController with @Valid UpdateStoreDTO in `backend/src/main/java/com/cinema/hallstore/controller/StoreQueryController.java`
- [x] T077 [US2] Check name uniqueness excluding current store ID (existsByNameIgnoreCaseAndIdNot) in `backend/src/main/java/com/cinema/hallstore/service/StoreService.java`
- [x] T078 [US2] Capture before/after values (clone entity before update) for audit log in `backend/src/main/java/com/cinema/hallstore/service/StoreService.java`
- [x] T079 [US2] Call StoreOperationLogService.logUpdate with before/after JSONB in `backend/src/main/java/com/cinema/hallstore/service/StoreService.java`
- [x] T080 [US2] Handle OptimisticLockException (version mismatch) and return 409 error in `backend/src/main/java/com/cinema/common/exception/GlobalExceptionHandler.java`

**Phase 4 Completion Criteria**: All tests pass, edit store workflow functional with optimistic locking, audit log records before/after values.

---

## Phase 5: User Story 3 - 停用/启用门店 (P2)

**Story Goal**: Operators can toggle store status between ACTIVE and INACTIVE to control C-side visibility.

**Independent Test Criteria**:
- Operator clicks "停用" button on ACTIVE store → Confirmation dialog appears
- Confirm → Store status changes to INACTIVE, button changes to "启用"
- C-side reservation page no longer shows inactive store
- Click "启用" on INACTIVE store → Status changes to ACTIVE

**Tasks**:

### T081-T084: E2E Tests (TDD - Write First)

- [ ] T081 [P] [US3] Write Playwright test for disabling active store (ACTIVE → INACTIVE) in `frontend/tests/e2e/stores/toggle-status.spec.ts`
- [ ] T082 [P] [US3] Write Playwright test for enabling inactive store (INACTIVE → ACTIVE) in `frontend/tests/e2e/stores/toggle-status.spec.ts`
- [ ] T083 [P] [US3] Write Playwright test for confirmation dialog before status change in `frontend/tests/e2e/stores/toggle-status.spec.ts`
- [ ] T084 [P] [US3] Write Playwright test for list refresh and status label update in `frontend/tests/e2e/stores/toggle-status.spec.ts`

### T085-T087: Unit Tests (TDD - Write First)

- [ ] T085 [P] [US3] Write Vitest test for useToggleStoreStatus hook in `frontend/src/features/store-management/hooks/useToggleStoreStatus.test.ts`
- [ ] T086 [P] [US3] Write JUnit test for StoreService.toggleStatus method in `backend/src/test/java/com/cinema/service/StoreServiceTest.java`
- [ ] T087 [P] [US3] Write JUnit test for StoreOperationLogService.logStatusChange in `backend/src/test/java/com/cinema/service/StoreOperationLogServiceTest.java`

### T088-T094: Frontend Implementation

- [x] T088 [US3] Integrated status toggle button in StoreTable action column in `frontend/src/pages/stores/components/StoreTable.tsx`
- [x] T089 [US3] Add confirmation dialog (Ant Design Modal.confirm) before status change in `frontend/src/pages/stores/components/StoreTable.tsx`
- [x] T090 [US3] Create useToggleStoreStatus hook (TanStack Query useMutation) with cache invalidation in `frontend/src/pages/stores/hooks/useToggleStoreStatus.ts`
- [x] T091 [US3] Add toggleStoreStatus API method (PATCH /api/stores/{id}/status) in storeService in `frontend/src/pages/stores/services/storeService.ts`
- [x] T092 [US3] Add StatusToggleButton to StoreTable action column in `frontend/src/pages/stores/components/StoreTable.tsx`
- [x] T093 [US3] Display status label (Tag component) in StoreTable with conditional color (ACTIVE=green, INACTIVE=red) in `frontend/src/pages/stores/components/StoreTable.tsx`
- [ ] T094 [P] [US3] Create MSW handler for PATCH /api/stores/:id/status in `frontend/src/mocks/handlers/stores.ts`

### T095-T098: Backend Implementation

- [x] T095 [US3] Implement StoreService.toggleStatus method (find store, update status, log) in `backend/src/main/java/com/cinema/hallstore/service/StoreService.java`
- [x] T096 [US3] Add PATCH /api/stores/{id}/status endpoint in StoreQueryController in `backend/src/main/java/com/cinema/hallstore/controller/StoreQueryController.java`
- [x] T097 [US3] Capture before/after status values for audit log in `backend/src/main/java/com/cinema/hallstore/service/StoreService.java`
- [x] T098 [US3] Call StoreOperationLogService.logStatusChange with before/after status in `backend/src/main/java/com/cinema/hallstore/service/StoreService.java`

**Phase 5 Completion Criteria**: All tests pass, status toggle functional, audit log records status changes, UI shows correct status labels.

---

## Phase 6: User Story 4 - 删除门店 (P3)

**Story Goal**: System administrators can delete stores that have no dependencies (no halls, reservation settings, or bookings).

**Independent Test Criteria**:
- Admin clicks "删除" button on store without dependencies → Confirmation dialog appears
- Confirm → Store deleted from database, list refreshes, store no longer visible
- Try to delete store with halls → Backend returns 409 error "请先删除影厅"
- Try to delete store with bookings → Backend returns 409 error "建议使用停用功能"

**Tasks**:

### T099-T103: E2E Tests (TDD - Write First)

- [ ] T099 [P] [US4] Write Playwright test for deleting store without dependencies in `frontend/tests/e2e/stores/delete-store.spec.ts`
- [ ] T100 [P] [US4] Write Playwright test for delete confirmation dialog with warning message in `frontend/tests/e2e/stores/delete-store.spec.ts`
- [ ] T101 [P] [US4] Write Playwright test for delete blocked by halls dependency (409 error) in `frontend/tests/e2e/stores/delete-store.spec.ts`
- [ ] T102 [P] [US4] Write Playwright test for delete blocked by reservation settings dependency in `frontend/tests/e2e/stores/delete-store.spec.ts`
- [ ] T103 [P] [US4] Write Playwright test for list refresh after successful deletion in `frontend/tests/e2e/stores/delete-store.spec.ts`

### T104-T107: Unit Tests (TDD - Write First)

- [ ] T104 [P] [US4] Write Vitest test for useDeleteStore hook in `frontend/src/features/store-management/hooks/useDeleteStore.test.ts`
- [ ] T105 [P] [US4] Write JUnit test for StoreService.deleteStore method (no dependencies) in `backend/src/test/java/com/cinema/service/StoreServiceTest.java`
- [ ] T106 [P] [US4] Write JUnit test for delete safety checks (halls, settings, bookings) in `backend/src/test/java/com/cinema/service/StoreServiceTest.java`
- [ ] T107 [P] [US4] Write JUnit test for StoreOperationLogService.logDelete in `backend/src/test/java/com/cinema/service/StoreOperationLogServiceTest.java`

### T108-T114: Frontend Implementation

- [x] T108 [US4] Integrated delete confirm dialog in StoreTable action column in `frontend/src/pages/stores/components/StoreTable.tsx`
- [x] T109 [US4] Create useDeleteStore hook (TanStack Query useMutation) with cache invalidation in `frontend/src/pages/stores/hooks/useDeleteStore.ts`
- [x] T110 [US4] Add deleteStore API method (DELETE /api/stores/{id}) in storeService in `frontend/src/pages/stores/services/storeService.ts`
- [x] T111 [US4] Add "删除" button to StoreTable action column in `frontend/src/pages/stores/components/StoreTable.tsx`
- [x] T112 [US4] Handle dependency error (409) with detailed message showing reason (halls/settings/bookings) in `frontend/src/pages/stores/components/StoreTable.tsx`
- [x] T113 [US4] Display success message "门店删除成功" after deletion in `frontend/src/pages/stores/components/StoreTable.tsx`
- [ ] T114 [P] [US4] Create MSW handler for DELETE /api/stores/:id (mock dependency checks) in `frontend/src/mocks/handlers/stores.ts`

### T115-T121: Backend Implementation

- [x] T115 [US4] Implement StoreService.deleteStore method (safety checks, delete, log) in `backend/src/main/java/com/cinema/hallstore/service/StoreService.java`
- [x] T116 [US4] Add DELETE /api/stores/{id} endpoint in StoreQueryController (return 204 No Content) in `backend/src/main/java/com/cinema/hallstore/controller/StoreQueryController.java`
- [x] T117 [US4] Check for associated halls (count > 0) and throw StoreHasDependenciesException in `backend/src/main/java/com/cinema/hallstore/service/StoreService.java`
- [x] T118 [US4] Check for reservation settings (exists) and throw StoreHasDependenciesException in `backend/src/main/java/com/cinema/hallstore/service/StoreService.java`
- [x] T119 [US4] Check for bookings (count > 0) and throw StoreHasDependenciesException with "建议使用停用功能" in `backend/src/main/java/com/cinema/hallstore/service/StoreService.java`
- [x] T120 [US4] Capture before-delete snapshot for audit log (after-value = null for DELETE) in `backend/src/main/java/com/cinema/hallstore/service/StoreService.java`
- [x] T121 [US4] Call StoreOperationLogService.logDelete before deleting store in `backend/src/main/java/com/cinema/hallstore/service/StoreService.java`

**Phase 6 Completion Criteria**: All tests pass, delete workflow functional with safety checks, audit log records deletion, dependency errors user-friendly.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Goal**: Performance optimization, final integration tests, documentation, and deployment readiness.

**Tasks**:

- [ ] T122 [P] Run all frontend unit tests (Vitest) and ensure 100% pass rate with `npm run test`
- [ ] T123 [P] Run all frontend E2E tests (Playwright) and ensure 100% pass rate with `npm run test:e2e`
- [ ] T124 [P] Run backend unit tests (JUnit) and ensure 100% pass rate with `./mvnw test`
- [ ] T125 [P] Run backend integration tests (Testcontainers) and ensure 100% pass rate with `./mvnw verify`
- [ ] T126 [P] Check frontend code coverage (Vitest) and ensure ≥ 80% for critical paths with `npm run test:coverage`
- [ ] T127 [P] Run ESLint and fix any violations with `npm run lint`
- [ ] T128 [P] Run TypeScript type check and fix any errors with `npm run type-check`
- [ ] T129 [P] Run Prettier and format all code with `npm run format`
- [ ] T130 Performance test: Measure store creation response time (target < 2s) with Playwright performance API
- [ ] T131 Performance test: Measure list refresh after mutation (target < 3s) with TanStack Query devtools
- [ ] T132 Accessibility audit: Run axe-core on store management page and fix violations (WCAG 2.1 AA)
- [ ] T133 Add keyboard navigation test for modals (Tab, Enter, Escape) in Playwright tests
- [ ] T134 Update CLAUDE.md with new Store CRUD feature information (tech stack, database changes)
- [ ] T135 Create Postman collection for all 4 endpoints (POST/PUT/PATCH/DELETE stores) in `specs/022-store-crud/postman/022-store-crud.postman_collection.json`
- [ ] T136 Create local environment file for Postman in `specs/022-store-crud/postman/022-local.postman_environment.json`
- [ ] T137 Verify all API responses follow ApiResponse<T> standardized format (check against contracts/api.yaml)
- [ ] T138 Manual test: Create, edit, toggle status, and delete a store through UI
- [ ] T139 Manual test: Verify audit logs in database (check store_operation_logs table)
- [ ] T140 Commit all changes with message following Conventional Commits format

**Phase 7 Completion Criteria**: All tests pass, code formatted and linted, performance targets met, accessibility compliant, documentation updated.

---

## Dependencies & Execution Order

### User Story Dependency Graph

```
Setup (Phase 1) ────┐
                    │
Foundational (Phase 2) ────┐
                           │
                           ├──> US1 (Create Store) [P1] ────┐
                           │                                 │
                           ├──> US2 (Edit Store) [P1] ──────┤
                           │                                 │
                           ├──> US3 (Toggle Status) [P2] ────┤
                           │                                 │
                           └──> US4 (Delete Store) [P3] ─────┤
                                                             │
                                                             └──> Polish (Phase 7)
```

**Key Observations**:
- **Setup and Foundational phases** are blocking for all user stories
- **US1, US2, US3, US4 are independent** - can be implemented in parallel after foundational tasks complete
- **Recommended sequence for MVP**: Setup → Foundational → US1 → US2 → US3 → US4 → Polish
- **Parallel opportunities**: Within each user story, frontend and backend tasks can run in parallel (marked with [P])

### Parallel Execution Examples

**Phase 1 (Setup) - Maximum Parallelism**:
- Run T003-T011 (frontend types) in parallel
- Run T012-T024 (backend entities, DTOs, exceptions, repos) in parallel
- Database migrations (T001-T002) must run sequentially first

**Phase 3 (US1) - Parallel Opportunities**:
- Write all E2E tests (T031-T035) in parallel
- Write all unit tests (T036-T040) in parallel
- Frontend implementation (T041-T050) and backend implementation (T051-T056) can run in parallel
- MSW handler (T050) can be written anytime after API contract is defined

**Phase 4-6 (US2, US3, US4)**:
- Each user story can be implemented by different developers in parallel
- Within each story, follow the same TDD pattern: Tests → Frontend → Backend

---

## Implementation Strategy

### MVP First (Minimum Viable Product)

**Recommended MVP Scope** = Complete Phase 3 (US1: Create Store)

**Why**:
- Creates immediate value: Operators can add new stores to the system
- Independently testable and deployable
- Foundation for all other CRUD operations (edit/delete/status require stores to exist first)
- Validates tech stack, database schema, and audit logging infrastructure

**MVP Deliverables**:
- Database schema extended (status, version, store_operation_logs)
- CreateStoreModal with full validation (Zod + Bean Validation)
- POST /api/stores endpoint with audit logging
- All tests passing for create workflow
- Operators can create stores and see them in the list

### Incremental Delivery

**Phase-by-Phase Rollout**:
1. **Week 1**: Setup + Foundational + US1 (Create) → Deploy MVP
2. **Week 2**: US2 (Edit) → Deploy edit capability
3. **Week 3**: US3 (Toggle Status) + US4 (Delete) → Deploy full CRUD
4. **Week 4**: Polish + Performance Optimization → Final release

**Benefits**:
- Early feedback from operators on create workflow
- Reduced risk through incremental testing and deployment
- Ability to pause and adjust based on user feedback

---

## Task Summary

| Phase | User Story | Task Count | Parallel Tasks | Key Deliverables |
|-------|-----------|-----------|---------------|------------------|
| 1 | Setup | 24 | 20 | Database schema, types, entities, exceptions |
| 2 | Foundational | 6 | 3 | Validation schemas, shared components, audit service |
| 3 | US1 (Create) | 26 | 16 | CreateStoreModal, POST endpoint, create tests |
| 4 | US2 (Edit) | 24 | 14 | EditStoreModal, PUT endpoint, optimistic locking |
| 5 | US3 (Toggle Status) | 18 | 12 | StatusToggleButton, PATCH endpoint, status labels |
| 6 | US4 (Delete) | 23 | 14 | DeleteConfirm, DELETE endpoint, safety checks |
| 7 | Polish | 19 | 14 | Tests, performance, accessibility, docs |

**Total Tasks**: 140
**Total Parallel Tasks**: 93 (66% parallelizable)
**Estimated Effort**: 4-6 weeks (with 2-3 developers working in parallel)

---

## Validation Checklist

Before marking the feature as complete, verify:

- [ ] All 140 tasks completed and checked off
- [ ] All Playwright E2E tests passing (create, edit, toggle, delete workflows)
- [ ] All Vitest unit tests passing (hooks, validation schemas)
- [ ] All JUnit backend tests passing (services, repositories, validators)
- [ ] Frontend code coverage ≥ 80% for critical paths
- [ ] ESLint, Prettier, TypeScript checks passing
- [ ] Performance targets met (< 2s create/edit, < 3s list refresh)
- [ ] Accessibility audit passing (WCAG 2.1 AA)
- [ ] All 4 API endpoints functional (POST/PUT/PATCH/DELETE)
- [ ] Audit logs recording all operations (CREATE/UPDATE/STATUS_CHANGE/DELETE)
- [ ] Optimistic locking preventing lost updates
- [ ] Delete safety checks blocking invalid deletes
- [ ] API responses following ApiResponse<T> format
- [ ] Postman collection with all endpoints and tests
- [ ] Documentation updated (CLAUDE.md, quickstart.md)

---

## Notes

- **TDD Compliance**: All user story phases follow strict TDD - tests written before implementation
- **Constitution Compliance**: Feature adheres to all宪法 principles (branch binding, TDD, component architecture, tech stack layering, state management, code quality, backend stack)
- **Reuse over Duplication**: Extends existing Store entity (014/020), reuses StoreTable component (014), integrates with ReservationSettingsModal (016)
- **API Standards**: All endpoints follow standardized ApiResponse<T> format (addressing 014-API响应格式不一致问题.md)
- **Security**: Double validation (Zod + Bean Validation), optimistic locking, delete safety checks
- **Audit Trail**: All operations logged to store_operation_logs with before/after JSONB snapshots
