---
description: "Task list for 门店预约设置 feature implementation"
---

# Tasks: 门店预约设置

**Input**: Design documents from `/specs/015-store-reservation-settings/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Tests are REQUIRED per TDD approach and Constitution requirements. All tests must be written FIRST and FAIL before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2], [US3])
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/main/java/com/cinema/hallstore/`
- **Frontend**: `frontend/src/pages/store-reservation-settings/`
- **Tests**: `backend/src/test/java/` and `frontend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and database schema setup

- [x] T001 Create Supabase database table `store_reservation_settings` with schema from data-model.md
- [x] T002 [P] Create database migration script or SQL file in `backend/src/main/resources/db/migration/` (if using Flyway) or document SQL in `docs/database/`
- [x] T003 [P] Verify existing `stores` table structure and foreign key relationship support

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create backend Domain entity `StoreReservationSettings` in `backend/src/main/java/com/cinema/hallstore/domain/StoreReservationSettings.java`
- [x] T005 [P] Create backend DTO `StoreReservationSettingsDTO` in `backend/src/main/java/com/cinema/hallstore/dto/StoreReservationSettingsDTO.java`
- [x] T006 [P] Create backend Request DTO `UpdateStoreReservationSettingsRequest` in `backend/src/main/java/com/cinema/hallstore/dto/UpdateStoreReservationSettingsRequest.java` with Bean Validation annotations
- [x] T007 [P] Create backend Request DTO `BatchUpdateStoreReservationSettingsRequest` in `backend/src/main/java/com/cinema/hallstore/dto/BatchUpdateStoreReservationSettingsRequest.java`
- [x] T008 [P] Create backend Response DTO `BatchUpdateResult` in `backend/src/main/java/com/cinema/hallstore/dto/BatchUpdateResult.java`
- [x] T009 Create backend Repository interface `StoreReservationSettingsRepository` in `backend/src/main/java/com/cinema/hallstore/repository/StoreReservationSettingsRepository.java`
- [x] T010 Create backend Mapper `StoreReservationSettingsMapper` in `backend/src/main/java/com/cinema/hallstore/mapper/StoreReservationSettingsMapper.java` for entity ↔ DTO conversion
- [x] T011 [P] Create frontend TypeScript types in `frontend/src/pages/store-reservation-settings/types/reservation-settings.types.ts` (StoreReservationSettings, UpdateRequest, BatchUpdateRequest, BatchUpdateResult)
- [x] T012 [P] Create frontend Zod validation schema in `frontend/src/pages/store-reservation-settings/types/reservation-settings.schema.ts` for form validation

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 查看门店预约设置 (Priority: P1) 🎯 MVP

**Goal**: 运营人员可以在门店预约设置页面查看所有门店的预约配置信息（是否开放预约、可预约天数）

**Independent Test**: 打开门店预约设置页面，看到所有门店的预约配置列表，包括门店名称、是否开放预约状态、可预约天数等信息，数据与后端存储一致

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T013 [P] [US1] Write backend unit test for `StoreReservationSettingsRepository.findByStoreId()` in `backend/src/test/java/com/cinema/hallstore/repository/StoreReservationSettingsRepositoryTest.java`
- [x] T014 [P] [US1] Write backend integration test for `GET /api/stores/{storeId}/reservation-settings` endpoint in `backend/src/test/java/com/cinema/hallstore/controller/StoreReservationSettingsControllerTest.java`
- [x] T015 [P] [US1] Write frontend unit test for `getStoreReservationSettings` service function in `frontend/tests/pages/store-reservation-settings/services/reservationSettingsService.test.ts`
- [x] T016 [P] [US1] Write frontend MSW mock handler for `GET /api/stores/{storeId}/reservation-settings` in `frontend/src/mocks/handlers/reservationSettingsHandlers.ts`
- [x] T017 [P] [US1] Write frontend E2E test for viewing reservation settings page in `frontend/tests/e2e/store-reservation-settings.spec.ts` (Playwright)

### Implementation for User Story 1

- [x] T018 [US1] Implement backend Service method `getSettings(UUID storeId)` in `backend/src/main/java/com/cinema/hallstore/service/StoreReservationSettingsService.java`
- [x] T019 [US1] Create backend Controller `StoreReservationSettingsController` with `GET /api/stores/{storeId}/reservation-settings` endpoint in `backend/src/main/java/com/cinema/hallstore/controller/StoreReservationSettingsController.java`
- [x] T020 [US1] Implement frontend API service function `getStoreReservationSettings(storeId: string)` in `frontend/src/pages/store-reservation-settings/services/reservationSettingsService.ts`
- [x] T021 [US1] Create frontend TanStack Query hook `useStoreReservationSettings(storeId: string)` in `frontend/src/pages/store-reservation-settings/hooks/useReservationSettingsQuery.ts`
- [x] T022 [US1] Create frontend hook `useAllStoresReservationSettings()` to fetch settings for all stores in `frontend/src/pages/store-reservation-settings/hooks/useReservationSettingsQuery.ts`
- [x] T023 [P] [US1] Create frontend component `ReservationSettingsTable` to display reservation settings in `frontend/src/pages/store-reservation-settings/components/ReservationSettingsTable.tsx`
- [x] T024 [US1] Create frontend page component `StoreReservationSettingsPage` in `frontend/src/pages/store-reservation-settings/index.tsx` that displays all stores with their reservation settings
- [x] T025 [US1] Integrate `ReservationSettingsTable` with `StoreReservationSettingsPage` and connect to TanStack Query hooks
- [x] T026 [US1] Add route configuration for `/store-reservation-settings` in `frontend/src/components/layout/Router.tsx`
- [x] T027 [US1] Add navigation menu item for "门店预约设置" in `frontend/src/components/layout/AppLayout.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can view all store reservation settings.

---

## Phase 4: User Story 2 - 配置门店预约设置 (Priority: P1)

**Goal**: 运营人员可以为每个门店独立配置预约设置（开启/关闭预约功能、设置可预约天数）

**Independent Test**: 选择一个门店，修改其预约设置（开启预约、设置可预约天数为 7 天），保存后该门店的预约配置被更新，其他门店的配置不受影响

### Tests for User Story 2 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T028 [P] [US2] Write backend unit test for `StoreReservationSettingsService.updateSettings()` with validation in `backend/src/test/java/com/cinema/hallstore/service/StoreReservationSettingsServiceTest.java`
- [x] T029 [P] [US2] Write backend integration test for `PUT /api/stores/{storeId}/reservation-settings` endpoint in `backend/src/test/java/com/cinema/hallstore/controller/StoreReservationSettingsControllerTest.java`
- [x] T030 [P] [US2] Write backend validation test for `maxReservationDays` range (1-365) in `backend/src/test/java/com/cinema/hallstore/dto/UpdateStoreReservationSettingsRequestTest.java`
- [x] T031 [P] [US2] Write frontend unit test for `updateStoreReservationSettings` service function in `frontend/tests/pages/store-reservation-settings/services/reservationSettingsService.test.ts`
- [x] T032 [P] [US2] Write frontend MSW mock handler for `PUT /api/stores/{storeId}/reservation-settings` in `frontend/src/mocks/handlers/reservationSettingsHandlers.ts`
- [x] T033 [P] [US2] Write frontend unit test for Zod schema validation in `frontend/tests/pages/store-reservation-settings/types/reservation-settings.schema.test.ts`
- [x] T034 [P] [US2] Write frontend E2E test for editing reservation settings in `frontend/tests/e2e/store-reservation-settings.spec.ts` (Playwright)

### Implementation for User Story 2

- [x] T035 [US2] Implement backend Service method `updateSettings(UUID storeId, UpdateStoreReservationSettingsRequest request)` in `backend/src/main/java/com/cinema/hallstore/service/StoreReservationSettingsService.java` with validation logic
- [x] T036 [US2] Add backend custom validator for `isReservationEnabled=true` → `maxReservationDays > 0` in `backend/src/main/java/com/cinema/hallstore/validation/ReservationSettingsValidator.java` (or use `@AssertTrue` in Request DTO)
- [x] T037 [US2] Add `PUT /api/stores/{storeId}/reservation-settings` endpoint to `StoreReservationSettingsController` in `backend/src/main/java/com/cinema/hallstore/controller/StoreReservationSettingsController.java`
- [x] T038 [US2] Implement frontend API service function `updateStoreReservationSettings(storeId: string, request: UpdateRequest)` in `frontend/src/pages/store-reservation-settings/services/reservationSettingsService.ts`
- [x] T039 [US2] Create frontend TanStack Query mutation hook `useUpdateStoreReservationSettings(storeId: string)` in `frontend/src/pages/store-reservation-settings/hooks/useReservationSettingsMutation.ts`
- [x] T040 [P] [US2] Create frontend component `ReservationSettingsForm` with form fields (Switch for isReservationEnabled, InputNumber for maxReservationDays) in `frontend/src/pages/store-reservation-settings/components/ReservationSettingsForm.tsx`
- [x] T041 [US2] Integrate React Hook Form with Zod schema validation in `ReservationSettingsForm` component
- [x] T042 [US2] Add edit modal/drawer to `ReservationSettingsTable` component that opens `ReservationSettingsForm` when clicking edit button
- [x] T043 [US2] Connect `ReservationSettingsForm` to `useUpdateStoreReservationSettings` mutation hook with success/error handling
- [x] T044 [US2] Add form validation feedback (error messages) for invalid `maxReservationDays` input (negative, 0, >365)
- [x] T045 [US2] Update `StoreReservationSettingsPage` to handle edit action and refresh data after successful update

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users can view and edit individual store reservation settings.

---

## Phase 5: User Story 3 - 批量配置门店预约设置 (Priority: P2)

**Goal**: 运营人员可以批量选择多个门店并统一设置预约配置，提高配置效率

**Independent Test**: 选择多个门店（如 3 个门店），批量设置"开放预约，可预约 7 天"，保存后这 3 个门店的预约配置都被更新为相同值

### Tests for User Story 3 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T046 [P] [US3] Write backend unit test for `StoreReservationSettingsService.batchUpdate()` with partial success handling in `backend/src/test/java/com/cinema/hallstore/service/StoreReservationSettingsServiceTest.java`
- [x] T047 [P] [US3] Write backend integration test for `PUT /api/stores/reservation-settings/batch` endpoint in `backend/src/test/java/com/cinema/hallstore/controller/BatchStoreReservationSettingsControllerTest.java`
- [x] T048 [P] [US3] Write backend test for batch update with partial failures (some stores not found) in `backend/src/test/java/com/cinema/hallstore/service/StoreReservationSettingsServiceTest.java`
- [x] T049 [P] [US3] Write frontend unit test for `batchUpdateStoreReservationSettings` service function in `frontend/tests/pages/store-reservation-settings/services/reservationSettingsService.test.ts`
- [x] T050 [P] [US3] Write frontend MSW mock handler for `PUT /api/stores/reservation-settings/batch` in `frontend/src/mocks/handlers/reservationSettingsHandlers.ts`
- [x] T051 [P] [US3] Write frontend E2E test for batch update operation in `frontend/tests/e2e/store-reservation-settings.spec.ts` (Playwright)

### Implementation for User Story 3

- [x] T052 [US3] Implement backend Service method `batchUpdate(BatchUpdateStoreReservationSettingsRequest request)` in `backend/src/main/java/com/cinema/hallstore/service/StoreReservationSettingsService.java` with partial success strategy
- [x] T053 [US3] Create backend Controller `BatchStoreReservationSettingsController` with `PUT /api/stores/reservation-settings/batch` endpoint in `backend/src/main/java/com/cinema/hallstore/controller/BatchStoreReservationSettingsController.java`
- [x] T054 [US3] Implement frontend API service function `batchUpdateStoreReservationSettings(request: BatchUpdateRequest)` in `frontend/src/pages/store-reservation-settings/services/reservationSettingsService.ts`
- [x] T055 [US3] Create frontend TanStack Query mutation hook `useBatchUpdateStoreReservationSettings()` in `frontend/src/pages/store-reservation-settings/hooks/useReservationSettingsMutation.ts`
- [x] T056 [P] [US3] Add row selection (checkbox) functionality to `ReservationSettingsTable` component
- [x] T057 [US3] Create frontend component `BatchReservationSettingsModal` with form for batch settings in `frontend/src/pages/store-reservation-settings/components/BatchReservationSettingsModal.tsx`
- [x] T058 [US3] Add batch action toolbar to `ReservationSettingsTable` that appears when multiple rows are selected
- [x] T059 [US3] Connect `BatchReservationSettingsModal` to `useBatchUpdateStoreReservationSettings` mutation hook
- [x] T060 [US3] Implement batch update result display (success count, failure count, failure details) in `BatchReservationSettingsModal` or separate result notification
- [x] T061 [US3] Update `StoreReservationSettingsPage` to refresh data after successful batch update and clear selection

**Checkpoint**: All user stories should now be independently functional. Users can view, edit individually, and batch update store reservation settings.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T062 [P] Add search and filter functionality (by store name, reservation status) to `StoreReservationSettingsPage` reusing `StoreSearch` and `StatusFilter` components from `frontend/src/pages/stores/components/`
- [x] T063 [P] Add visual indicators (badges, colors) to distinguish enabled/disabled reservation status in `ReservationSettingsTable` component
- [x] T064 [P] Add loading states and error handling to all API calls in `StoreReservationSettingsPage`
- [x] T065 [P] Add pagination support to `ReservationSettingsTable` if store count exceeds threshold (reuse pagination logic from `StoreTable`)
- [x] T066 [P] Update backend error handling to return proper error responses following API response format standard (see Constitution 1.3.0)
- [x] T067 [P] Add backend logging for reservation settings operations in `StoreReservationSettingsService.java`
- [x] T068 [P] Update API documentation in `specs/015-store-reservation-settings/contracts/reservation-settings-api.yaml` if any changes made during implementation
- [x] T069 [P] Run quickstart.md validation - verify all examples in `specs/015-store-reservation-settings/quickstart.md` work correctly
- [x] T070 [P] Add integration test for end-to-end flow (view → edit → batch update) in `backend/src/test/java/com/cinema/hallstore/integration/StoreReservationSettingsIntegrationTest.java`
- [x] T071 [P] Performance testing: Verify page load time <2s for <100 stores, single update <1s, batch update <3s for 10 stores
- [x] T072 [P] Code cleanup and refactoring: Review and optimize all implemented code
- [x] T073 [P] Update project documentation if needed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - May reuse US1 components but should be independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - May reuse US1/US2 components but should be independently testable

### Within Each User Story

- Tests (REQUIRED) MUST be written and FAIL before implementation
- Backend: Repository → Service → Controller
- Frontend: Types/Schema → Service → Hooks → Components → Page
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Backend and frontend tasks within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: T013 [P] [US1] Write backend unit test for Repository
Task: T014 [P] [US1] Write backend integration test for GET endpoint
Task: T015 [P] [US1] Write frontend unit test for service function
Task: T016 [P] [US1] Write frontend MSW mock handler
Task: T017 [P] [US1] Write frontend E2E test

# Launch backend and frontend implementation in parallel:
Task: T018 [US1] Implement backend Service method
Task: T019 [US1] Create backend Controller
Task: T020 [US1] Implement frontend API service
Task: T021 [US1] Create frontend TanStack Query hook
Task: T022 [US1] Create frontend hook for all stores
Task: T023 [P] [US1] Create frontend ReservationSettingsTable component
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (database table)
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (view reservation settings)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add Polish phase → Final validation → Deploy
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (backend + frontend)
   - Developer B: User Story 2 (backend + frontend)
   - Developer C: User Story 3 (backend + frontend)
3. Stories complete and integrate independently
4. Polish phase: All developers collaborate on cross-cutting concerns

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **CRITICAL**: Verify tests fail before implementing (TDD)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All API responses must follow unified format standard (Constitution 1.3.0)
- Frontend must reuse existing store management components where possible
- Backend must use Spring Boot + Supabase, no direct database connections

---

## Task Summary

- **Total Tasks**: 73
- **Setup Tasks**: 3 (Phase 1)
- **Foundational Tasks**: 9 (Phase 2)
- **User Story 1 Tasks**: 15 (Phase 3) - MVP
- **User Story 2 Tasks**: 18 (Phase 4)
- **User Story 3 Tasks**: 16 (Phase 5)
- **Polish Tasks**: 12 (Phase 6)

### Parallel Opportunities Identified

- **Phase 2**: 6 tasks can run in parallel
- **Phase 3**: 5 test tasks can run in parallel, 1 component task can run in parallel
- **Phase 4**: 7 test tasks can run in parallel, 1 component task can run in parallel
- **Phase 5**: 6 test tasks can run in parallel, 1 component task can run in parallel
- **Phase 6**: All 12 tasks can run in parallel

### Suggested MVP Scope

**MVP = User Story 1 only** (Phase 1 + Phase 2 + Phase 3):
- Database setup
- Core entities and DTOs
- View reservation settings functionality
- Total: 27 tasks (3 + 9 + 15)

This delivers a working feature that allows users to view all store reservation settings, which is the foundation for all other operations.

