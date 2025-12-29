# Tasks: 影厅资源后端建模（Store-Hall 一致性）

**Input**: Design documents from `/specs/014-hall-store-backend/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/store-api.yaml, contracts/hall-api.yaml

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- Backend: `backend/src/main/java/com/cinema/hallstore/`
- Frontend: `frontend/src/`
- Tests: `backend/src/test/java/` and `frontend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for backend Spring Boot application

- [x] T001 Create Supabase tables `stores` and `halls` with fields per data-model.md
- [x] T002 Add Spring Boot WebFlux dependency to backend/pom.xml for WebClient support
- [x] T003 [P] Configure Supabase connection in backend/src/main/java/com/cinema/hallstore/config/SupabaseConfig.java
- [x] T004 [P] Configure CORS and web settings in backend/src/main/java/com/cinema/hallstore/config/WebConfig.java

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 [P] Create StoreStatus enum in backend/src/main/java/com/cinema/hallstore/domain/enums/StoreStatus.java (active, disabled)
- [x] T006 [P] Create HallStatus enum in backend/src/main/java/com/cinema/hallstore/domain/enums/HallStatus.java (active, inactive, maintenance)
- [x] T007 [P] Create HallType enum in backend/src/main/java/com/cinema/hallstore/domain/enums/HallType.java (VIP, Public, CP, Party)
- [x] T008 [P] Create Store domain model in backend/src/main/java/com/cinema/hallstore/domain/Store.java
- [x] T009 [P] Create Hall domain model in backend/src/main/java/com/cinema/hallstore/domain/Hall.java
- [x] T010 [P] Create StoreDTO in backend/src/main/java/com/cinema/hallstore/dto/StoreDTO.java matching store-api.yaml
- [x] T011 [P] Create HallDTO in backend/src/main/java/com/cinema/hallstore/dto/HallDTO.java matching hall-api.yaml
- [x] T012 [P] Create ApiResponse wrapper in backend/src/main/java/com/cinema/hallstore/dto/ApiResponse.java
- [x] T013 [P] Create StoreMapper in backend/src/main/java/com/cinema/hallstore/mapper/StoreMapper.java (domain <-> DTO)
- [x] T014 [P] Create HallMapper in backend/src/main/java/com/cinema/hallstore/mapper/HallMapper.java (domain <-> DTO)
- [x] T015 [P] Create ResourceNotFoundException in backend/src/main/java/com/cinema/hallstore/exception/ResourceNotFoundException.java
- [x] T016 [P] Create GlobalExceptionHandler in backend/src/main/java/com/cinema/hallstore/exception/GlobalExceptionHandler.java

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 运营配置影厅主数据 (Priority: P1)

**Goal**: 实现后端 Hall CRUD API，支持按门店查询影厅列表，前端可获取和展示影厅数据

**Independent Test**: 运营可通过 POST /api/halls 创建影厅（管理后台），前端通过 GET /api/stores/{storeId}/halls 拉取门店影厅列表并展示

### Backend Implementation for User Story 1

- [x] T017 [P] [US1] Create HallRepository in backend/src/main/java/com/cinema/hallstore/repository/HallRepository.java (Supabase REST API calls: findAll, findByStoreId, findById, save, update, delete)
- [x] T018 [US1] Create HallService in backend/src/main/java/com/cinema/hallstore/service/HallService.java (business logic: validation, status filtering, type filtering)
- [x] T019 [US1] Create HallListController in backend/src/main/java/com/cinema/hallstore/controller/HallListController.java (GET /api/halls endpoint per hall-api.yaml)
- [x] T020 [US1] Create HallQueryController in backend/src/main/java/com/cinema/hallstore/controller/HallQueryController.java (GET /api/stores/{storeId}/halls endpoint per hall-api.yaml)
- [x] T021 [US1] Create HallAdminController in backend/src/main/java/com/cinema/hallstore/controller/HallAdminController.java (POST/PUT/DELETE /api/halls endpoints for admin operations)

**Checkpoint**: At this point, Hall CRUD APIs should be fully functional and testable independently via Postman/curl

---

## Phase 4: User Story 2 - 建模门店-影厅关系 (Priority: P1)

**Goal**: 实现后端 Store API，支持查询门店列表，建立清晰的 Store-Hall 关系

**Independent Test**: 可通过 GET /api/stores 查询所有门店，通过 GET /api/stores/{storeId}/halls 准确查询某门店下的所有影厅

### Backend Implementation for User Story 2

- [x] T022 [P] [US2] Create StoreRepository in backend/src/main/java/com/cinema/hallstore/repository/StoreRepository.java (Supabase REST API calls: findAll, findById, findByStatus, save, update, delete)
- [x] T023 [US2] Create StoreService in backend/src/main/java/com/cinema/hallstore/service/StoreService.java (business logic: validation, status filtering, store-hall relationship queries)
- [x] T024 [US2] Create StoreQueryController in backend/src/main/java/com/cinema/hallstore/controller/StoreQueryController.java (GET /api/stores endpoint per store-api.yaml)
- [x] T025 [US2] Update HallService to validate storeId existence before creating/updating halls (integrate with StoreService)
- [x] T026 [US2] Add cascade handling in HallService for when store status changes to disabled (filter out disabled stores' halls in new schedule creation)

**Checkpoint**: At this point, Store APIs and Store-Hall relationship queries should be fully functional

---

## Phase 5: User Story 3 - 前后端 API 与模型一致性 (Priority: P2)

**Goal**: 确保后端 DTOs 与前端 TypeScript 类型完全一致，统一字段命名和枚举值

**Independent Test**: 前端 Hall 和 Store 类型可直接映射后端 API 响应，无需额外字段转换

### Frontend Type Definitions for User Story 3

- [x] T027 [P] [US3] Create Store interface in frontend/src/pages/stores/types/store.types.ts (id, code, name, region, status, createdAt, updatedAt)
- [x] T028 [P] [US3] Create StoreStatus type in frontend/src/pages/stores/types/store.types.ts (active | disabled)
- [x] T029 [P] [US3] Update Hall interface in frontend/src/pages/schedule/types/schedule.types.ts to add storeId and code fields if missing
- [x] T030 [P] [US3] Verify HallType and HallStatus enums in frontend/src/pages/schedule/types/schedule.types.ts match backend (VIP/Public/CP/Party, active/inactive/maintenance)

### Frontend API Services for User Story 3

- [x] T031 [P] [US3] Create storeService.ts in frontend/src/pages/stores/services/storeService.ts (getStores API call)
- [x] T032 [P] [US3] Update scheduleService.ts in frontend/src/pages/schedule/services/scheduleService.ts to add getHallsByStore and getAllHalls calls
- [x] T033 [US3] Create useStoresQuery hook in frontend/src/pages/stores/hooks/useStoresQuery.ts (TanStack Query for stores data)
- [x] T034 [US3] Update useScheduleQueries hook in frontend/src/pages/schedule/hooks/useScheduleQueries.ts to add useHallsByStoreQuery and useAllHallsQuery

**Checkpoint**: Frontend types and API services should match backend contracts exactly, enabling type-safe API calls

---

## Phase 6: User Story 4 - 前端门店管理页面 (Priority: P2)

**Goal**: 创建独立的门店管理页面，支持门店列表展示、名称搜索、状态筛选和前端分页

**Independent Test**: 用户可访问 /stores 路由，查看所有门店列表，使用搜索和筛选功能，并进行前端分页导航

### Frontend Store Management Page for User Story 4

- [x] T035 [P] [US4] Create StoreTable component in frontend/src/pages/stores/components/StoreTable.tsx (Ant Design Table with columns: name, region, status)
- [x] T036 [P] [US4] Create StoreSearch component in frontend/src/pages/stores/components/StoreSearch.tsx (search input for name filtering)
- [x] T037 [P] [US4] Create StatusFilter component in frontend/src/pages/stores/components/StatusFilter.tsx (dropdown for status filtering: all/active/disabled)
- [x] T038 [US4] Create stores page index in frontend/src/pages/stores/index.tsx (integrate StoreTable, StoreSearch, StatusFilter with useStoresQuery)
- [x] T039 [US4] Add /stores route to frontend/src/components/layout/Router.tsx
- [x] T040 [US4] Add "门店管理" menu item to frontend/src/components/layout/AppLayout.tsx

### Frontend Hall Resources Page Enhancement for User Story 4

- [x] T041 [P] [US4] Create StoreSelector component in frontend/src/pages/schedule/components/StoreSelector.tsx (dropdown for store selection: all stores + individual stores)
- [x] T042 [US4] Update HallResources page in frontend/src/pages/schedule/HallResources.tsx to integrate StoreSelector and filter halls by selected store

**Checkpoint**: At this point, Store management page should be accessible, functional, and independently testable; Hall resources page should support store-based filtering

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and overall quality

- [x] T043 [P] Add comprehensive error messages and validation in backend controllers (400/404/500 responses per contracts)
- [x] T044 [P] Add request/response logging in backend using Spring Boot logging (info level for API calls)
- [x] T045 [P] Add loading states and error handling in frontend components (using TanStack Query isLoading, isError states)
- [x] T046 [P] Add empty state handling in StoreTable and HallResources when no data returned
- [x] T047 [P] Verify CORS configuration allows frontend origin in backend WebConfig
- [x] T048 Update CLAUDE.md to add backend/frontend technologies for 014-hall-store-backend
- [x] T049 Update quickstart.md with backend/frontend startup instructions and API testing examples
- [ ] T050 Run manual E2E test: create store → create halls → view in store management page → filter halls by store in hall resources page

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2)
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) - Can run in parallel with US1
- **User Story 3 (Phase 5)**: Depends on US1 and US2 completion (needs backend APIs)
- **User Story 4 (Phase 6)**: Depends on US2 and US3 completion (needs Store API and types)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Can run in parallel with US1
- **User Story 3 (P2)**: Must start after US1 and US2 (needs backend APIs to define types)
- **User Story 4 (P2)**: Must start after US2 and US3 (needs Store API and frontend types)

### Within Each User Story

- Models/Enums before Repositories
- Repositories before Services
- Services before Controllers
- Backend APIs before Frontend types/services
- Frontend services before Frontend components
- Frontend components before Page integration

### Parallel Opportunities

- All Setup tasks (T001-T004) can run in parallel
- All Foundational enum tasks (T005-T007) can run in parallel
- All Foundational domain models (T008-T009) can run in parallel
- All Foundational DTOs (T010-T012) can run in parallel
- All Foundational mappers/exceptions (T013-T016) can run in parallel
- US1 and US2 can be developed in parallel (different entities, no blocking dependencies)
- Within US3: Frontend types (T027-T030) can run in parallel, Frontend services (T031-T032) can run in parallel
- Within US4: Components (T035-T037, T041) can run in parallel
- All Polish tasks (T043-T047) can run in parallel

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only - P1)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3 & 4 in parallel: User Story 1 + User Story 2
4. **STOP and VALIDATE**: Test both Hall and Store APIs independently via Postman
5. Deploy backend and validate Store-Hall relationship queries

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 + 2 (P1) → Test independently → Deploy/Demo (MVP - backend APIs ready)
3. Add User Story 3 (P2) → Test independently → Frontend types aligned
4. Add User Story 4 (P2) → Test independently → Deploy/Demo (Full feature complete)
5. Polish phase → Final quality improvements

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Hall APIs)
   - Developer B: User Story 2 (Store APIs)
3. After US1 + US2 complete:
   - Developer A: User Story 3 (Frontend types and services)
   - Developer B: User Story 4 (Frontend pages and components)
4. Team completes Polish together

---

## Notes

- [P] tasks = different files, no dependencies within same phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Backend follows layered architecture: Domain → Repository → Service → Controller
- Frontend follows feature-based architecture: Types → Services → Hooks → Components → Pages
- All backend DTOs use camelCase to match frontend TypeScript conventions
- All enums must match exactly between backend and frontend (case-sensitive)
