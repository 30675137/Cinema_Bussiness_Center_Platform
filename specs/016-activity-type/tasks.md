# Tasks: 活动类型管理

**Input**: Design documents from `/specs/016-activity-type/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included as per TDD requirement in Constitution Check.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/main/java/com/cinema/hallstore/`
- **Frontend**: `frontend/src/pages/activity-types/`
- **Database**: `backend/src/main/resources/db/schema.sql`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create database table `activity_types` in `backend/src/main/resources/db/schema.sql`
- [x] T002 [P] Create backend domain entity `ActivityType` in `backend/src/main/java/com/cinema/hallstore/domain/ActivityType.java`
- [x] T003 [P] Create backend enum `ActivityTypeStatus` in `backend/src/main/java/com/cinema/hallstore/domain/enums/ActivityTypeStatus.java`
- [x] T004 [P] Create frontend TypeScript types in `frontend/src/pages/activity-types/types/activity-type.types.ts`
- [x] T005 [P] Create frontend Zod schema in `frontend/src/pages/activity-types/types/activity-type.schema.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create backend DTOs in `backend/src/main/java/com/cinema/hallstore/dto/` (ActivityTypeDTO, CreateActivityTypeRequest, UpdateActivityTypeRequest, ActivityTypeListResponse)
- [x] T007 Create backend Mapper `ActivityTypeMapper` in `backend/src/main/java/com/cinema/hallstore/mapper/ActivityTypeMapper.java`
- [x] T008 Create backend Repository `ActivityTypeRepository` in `backend/src/main/java/com/cinema/hallstore/repository/ActivityTypeRepository.java` (Supabase WebClient integration)
- [x] T009 Create backend Service `ActivityTypeService` in `backend/src/main/java/com/cinema/hallstore/service/ActivityTypeService.java` (business logic)
- [x] T010 Create frontend API service in `frontend/src/pages/activity-types/services/activityTypeService.ts`
- [x] T011 [P] Create frontend TanStack Query hooks in `frontend/src/pages/activity-types/hooks/useActivityTypesQuery.ts`
- [x] T012 [P] Create MSW mock handlers in `frontend/src/mocks/handlers/activityTypeHandlers.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 运营人员查看活动类型列表 (Priority: P1) 🎯 MVP

**Goal**: 运营人员能够查看所有已配置的活动类型列表，包括启用和停用的类型

**Independent Test**: 运营人员登录后台，访问活动类型管理页面，可以看到所有活动类型的列表，包括名称、描述、状态、排序等信息。即使没有其他功能，这个列表也能提供价值。

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T013 [P] [US1] Create backend unit test for `ActivityTypeService.findAll()` in `backend/src/test/java/com/cinema/hallstore/service/ActivityTypeServiceTest.java`
- [x] T014 [P] [US1] Create backend integration test for `GET /api/activity-types` in `backend/src/test/java/com/cinema/hallstore/controller/ActivityTypeControllerTest.java`
- [x] T015 [P] [US1] Create frontend Zod schema test in `frontend/tests/pages/activity-types/activity-type.schema.test.ts`
- [x] T016 [P] [US1] Create frontend E2E test for viewing activity types list in `frontend/tests/e2e/activity-types.spec.ts`

### Implementation for User Story 1

- [x] T017 [US1] Implement `ActivityTypeService.findAll(status)` method in `backend/src/main/java/com/cinema/hallstore/service/ActivityTypeService.java`
- [x] T018 [US1] Implement `ActivityTypeRepository.findAll(status)` method in `backend/src/main/java/com/cinema/hallstore/repository/ActivityTypeRepository.java` (filter by status, exclude DELETED, order by sort ASC, created_at ASC)
- [x] T019 [US1] Create backend Controller `ActivityTypeController` with `GET /api/activity-types` endpoint in `backend/src/main/java/com/cinema/hallstore/controller/ActivityTypeController.java` (with permission check)
- [x] T020 [US1] Create frontend component `ActivityTypeTable` in `frontend/src/pages/activity-types/components/ActivityTypeTable.tsx` (display list with name, description, status, sort, createdAt)
- [x] T021 [US1] Create frontend page `ActivityTypePage` in `frontend/src/pages/activity-types/index.tsx` (integrate table, use TanStack Query)
- [x] T022 [US1] Add route `/activity-types` in `frontend/src/components/layout/Router.tsx`
- [x] T023 [US1] Add menu item "活动类型管理" in `frontend/src/components/layout/AppLayout.tsx`
- [x] T024 [US1] Register MSW handlers in `frontend/src/mocks/handlers/index.ts`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - 运营人员创建新活动类型 (Priority: P1)

**Goal**: 运营人员能够创建新的活动类型（如"企业团建"、"订婚"、"生日Party"等），默认状态为启用

**Independent Test**: 运营人员点击"新建"按钮，填写活动类型信息（名称、描述、排序号），保存后可以在列表中看到新创建的活动类型。即使没有编辑和删除功能，创建功能也能独立提供价值。

### Tests for User Story 2 ⚠️

- [x] T025 [P] [US2] Create backend unit test for `ActivityTypeService.create()` with name uniqueness validation in `backend/src/test/java/com/cinema/hallstore/service/ActivityTypeServiceTest.java`
- [x] T026 [P] [US2] Create backend integration test for `POST /api/activity-types` in `backend/src/test/java/com/cinema/hallstore/controller/ActivityTypeControllerTest.java`
- [x] T027 [P] [US2] Create backend validation test for `CreateActivityTypeRequest` DTO in `backend/src/test/java/com/cinema/hallstore/dto/CreateActivityTypeRequestTest.java`

### Implementation for User Story 2

- [x] T028 [US2] Implement `ActivityTypeService.create(request)` method in `backend/src/main/java/com/cinema/hallstore/service/ActivityTypeService.java` (validate name uniqueness, set default status ENABLED)
- [x] T029 [US2] Implement `ActivityTypeRepository.save(activityType)` method in `backend/src/main/java/com/cinema/hallstore/repository/ActivityTypeRepository.java` (POST to Supabase)
- [x] T030 [US2] Add `POST /api/activity-types` endpoint in `backend/src/main/java/com/cinema/hallstore/controller/ActivityTypeController.java` (with permission check, validation)
- [x] T031 [US2] Create frontend component `ActivityTypeForm` in `frontend/src/pages/activity-types/components/ActivityTypeForm.tsx` (form with name, description, sort fields, React Hook Form + Zod validation)
- [x] T032 [US2] Add create mutation hook `useCreateActivityType()` in `frontend/src/pages/activity-types/hooks/useActivityTypesQuery.ts`
- [x] T033 [US2] Integrate create form modal in `frontend/src/pages/activity-types/index.tsx` (show modal on "新建" button click, handle form submission)
- [x] T034 [US2] Add name uniqueness validation error handling in frontend form
- [x] T035 [US2] Update MSW handlers to support POST request in `frontend/src/mocks/handlers/activityTypeHandlers.ts`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - 运营人员编辑活动类型 (Priority: P2)

**Goal**: 运营人员能够编辑已存在的活动类型信息（名称、描述、排序号）

**Independent Test**: 运营人员在列表中选择一个活动类型，点击"编辑"，修改信息后保存，列表中显示更新后的信息。可以独立测试编辑功能是否正常工作。

### Tests for User Story 3 ⚠️

- [x] T036 [P] [US3] Create backend unit test for `ActivityTypeService.update()` with name uniqueness validation in `backend/src/test/java/com/cinema/hallstore/service/ActivityTypeServiceTest.java`
- [x] T037 [P] [US3] Create backend integration test for `PUT /api/activity-types/{id}` in `backend/src/test/java/com/cinema/hallstore/controller/ActivityTypeControllerTest.java`

### Implementation for User Story 3

- [x] T038 [US3] Implement `ActivityTypeService.update(id, request)` method in `backend/src/main/java/com/cinema/hallstore/service/ActivityTypeService.java` (validate name uniqueness excluding current record)
- [x] T039 [US3] Implement `ActivityTypeRepository.update(id, activityType)` method in `backend/src/main/java/com/cinema/hallstore/repository/ActivityTypeRepository.java` (PATCH to Supabase)
- [x] T040 [US3] Add `PUT /api/activity-types/{id}` endpoint in `backend/src/main/java/com/cinema/hallstore/controller/ActivityTypeController.java` (with permission check, validation)
- [x] T041 [US3] Add update mutation hook `useUpdateActivityType()` in `frontend/src/pages/activity-types/hooks/useActivityTypesQuery.ts`
- [x] T042 [US3] Update `ActivityTypeForm` component to support edit mode in `frontend/src/pages/activity-types/components/ActivityTypeForm.tsx` (pre-fill form with existing data)
- [x] T043 [US3] Add edit button and modal integration in `ActivityTypeTable` component in `frontend/src/pages/activity-types/components/ActivityTypeTable.tsx`
- [x] T044 [US3] Update MSW handlers to support PUT request in `frontend/src/mocks/handlers/activityTypeHandlers.ts`

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - 运营人员启用/停用活动类型 (Priority: P1)

**Goal**: 运营人员能够启用或停用活动类型，控制小程序端用户可以看到哪些活动类型

**Independent Test**: 运营人员在列表中选择一个活动类型，点击"停用"，系统显示确认提示，确认后该活动类型状态变为"停用"，小程序端不再显示。可以独立测试状态切换功能。

### Tests for User Story 4 ⚠️

- [x] T045 [P] [US4] Create backend unit test for `ActivityTypeService.toggleStatus()` in `backend/src/test/java/com/cinema/hallstore/service/ActivityTypeServiceTest.java`
- [x] T046 [P] [US4] Create backend integration test for `PATCH /api/activity-types/{id}/status` in `backend/src/test/java/com/cinema/hallstore/controller/ActivityTypeControllerTest.java`

### Implementation for User Story 4

- [x] T047 [US4] Implement `ActivityTypeService.toggleStatus(id, status)` method in `backend/src/main/java/com/cinema/hallstore/service/ActivityTypeService.java` (switch between ENABLED and DISABLED)
- [x] T048 [US4] Implement `ActivityTypeRepository.updateStatus(id, status)` method in `backend/src/main/java/com/cinema/hallstore/repository/ActivityTypeRepository.java` (PATCH status to Supabase)
- [x] T049 [US4] Add `PATCH /api/activity-types/{id}/status` endpoint in `backend/src/main/java/com/cinema/hallstore/controller/ActivityTypeController.java` (with permission check)
- [x] T050 [US4] Create frontend component `ActivityTypeStatusSwitch` in `frontend/src/pages/activity-types/components/ActivityTypeStatusSwitch.tsx` (switch button with confirmation modal for DISABLED, direct update for ENABLED)
- [x] T051 [US4] Add toggle status mutation hook `useToggleActivityTypeStatus()` in `frontend/src/pages/activity-types/hooks/useActivityTypesQuery.ts`
- [x] T052 [US4] Integrate status switch in `ActivityTypeTable` component in `frontend/src/pages/activity-types/components/ActivityTypeTable.tsx` (add status column with switch)
- [x] T053 [US4] Update MSW handlers to support PATCH status request in `frontend/src/mocks/handlers/activityTypeHandlers.ts`

**Checkpoint**: At this point, User Stories 1, 2, 3, AND 4 should all work independently

---

## Phase 7: User Story 5 - 运营人员删除活动类型 (Priority: P3)

**Goal**: 运营人员能够删除不再需要的活动类型，采用软删除（逻辑删除），数据保留在数据库中

**Independent Test**: 运营人员在列表中选择一个活动类型，点击"删除"，系统显示确认提示，确认后该活动类型状态变为"已删除"，不再在任何列表中显示。可以独立测试删除功能是否正常工作。

### Tests for User Story 5 ⚠️

- [x] T054 [P] [US5] Create backend unit test for `ActivityTypeService.delete()` (soft delete) in `backend/src/test/java/com/cinema/hallstore/service/ActivityTypeServiceTest.java`
- [x] T055 [P] [US5] Create backend integration test for `DELETE /api/activity-types/{id}` in `backend/src/test/java/com/cinema/hallstore/controller/ActivityTypeControllerTest.java`

### Implementation for User Story 5

- [x] T056 [US5] Implement `ActivityTypeService.delete(id)` method in `backend/src/main/java/com/cinema/hallstore/service/ActivityTypeService.java` (set status to DELETED, record deleted_at)
- [x] T057 [US5] Implement `ActivityTypeRepository.delete(id)` method in `backend/src/main/java/com/cinema/hallstore/repository/ActivityTypeRepository.java` (PATCH status to DELETED in Supabase)
- [x] T058 [US5] Add `DELETE /api/activity-types/{id}` endpoint in `backend/src/main/java/com/cinema/hallstore/controller/ActivityTypeController.java` (with permission check)
- [x] T059 [US5] Add delete mutation hook `useDeleteActivityType()` in `frontend/src/pages/activity-types/hooks/useActivityTypesQuery.ts`
- [x] T060 [US5] Add delete button with confirmation modal in `ActivityTypeTable` component in `frontend/src/pages/activity-types/components/ActivityTypeTable.tsx` (show confirmation: "确定要删除此活动类型吗？删除后该类型将不再显示，但历史预约记录仍可正常关联")
- [x] T061 [US5] Update list query to exclude DELETED status in `ActivityTypeRepository.findAll()` and frontend queries
- [x] T062 [US5] Update MSW handlers to support DELETE request in `frontend/src/mocks/handlers/activityTypeHandlers.ts`

**Checkpoint**: At this point, User Stories 1, 2, 3, 4, AND 5 should all work independently

---

## Phase 8: User Story 6 - 小程序端用户选择活动类型 (Priority: P1)

**Goal**: 小程序端用户在预约时能够从可用的活动类型列表中选择合适的类型

**Independent Test**: 小程序端用户打开预约页面，系统从后端获取状态为"启用"的活动类型列表，用户可以从下拉列表或选择器中选择活动类型。可以独立测试小程序端是否正确过滤和显示启用状态的活动类型。

### Tests for User Story 6 ⚠️

- [ ] T063 [P] [US6] Create backend integration test for `GET /api/activity-types/enabled` in `backend/src/test/java/com/cinema/hallstore/controller/ActivityTypeControllerTest.java`
- [ ] T064 [P] [US6] Create frontend E2E test for mini-program activity type selection in `frontend/tests/e2e/activity-types.spec.ts`

### Implementation for User Story 6

- [ ] T065 [US6] Implement `ActivityTypeService.findEnabled()` method in `backend/src/main/java/com/cinema/hallstore/service/ActivityTypeService.java` (filter by status = ENABLED, order by sort ASC)
- [ ] T066 [US6] Add `GET /api/activity-types/enabled` endpoint in `backend/src/main/java/com/cinema/hallstore/controller/ActivityTypeController.java` (public endpoint, no permission check)
- [ ] T067 [US6] Create frontend API service function `getEnabledActivityTypes()` in `frontend/src/pages/activity-types/services/activityTypeService.ts`
- [ ] T068 [US6] Create frontend query hook `useEnabledActivityTypesQuery()` in `frontend/src/pages/activity-types/hooks/useActivityTypesQuery.ts`
- [ ] T069 [US6] Update MSW handlers to support GET /enabled endpoint in `frontend/src/mocks/handlers/activityTypeHandlers.ts`
- [ ] T070 [US6] Integrate activity type selector in mini-program reservation page (if exists) or create placeholder component

**Checkpoint**: At this point, all user stories should be independently functional

---

## Phase 8b: Scenario Editor 扩展字段与资源关联

**Goal**: 在现有活动类型管理基础上，补齐 Scenario Editor 需要的“业务分类、背景图、套餐定价、物理资源关联”等扩展能力，使之成为可视化场景卡片的完整配置入口。

### Database & Backend

- [ ] T083 [P] 更新 `backend/src/main/resources/db/schema.sql` 中的 `activity_types` 表，新增字段 `business_category`（业务分类）和 `background_image_url`（背景图 URL），并补充相应注释。
- [ ] T084 [P] 在 `backend/src/main/resources/db/schema.sql` 中新增表 `activity_type_packages`（活动类型套餐），包含字段：id, activity_type_id, name, current_price, original_price, sort, created_at, updated_at，并创建必要索引和 RLS 策略。
- [ ] T085 [P] 在 `backend/src/main/resources/db/schema.sql` 中新增表 `activity_type_halls`（活动类型与门店/影厅关联），包含字段：id, activity_type_id, store_id, hall_id, created_at, updated_at，并创建必要索引和 RLS 策略。
- [ ] T086 [P] 扩展后端领域实体 `ActivityType`、DTO（`ActivityTypeDTO`, `CreateActivityTypeRequest`, `UpdateActivityTypeRequest`）和 `ActivityTypeMapper`，支持 `business_category`、`background_image_url` 以及套餐列表、资源关联列表的映射。
- [ ] T087 [P] 在 `ActivityTypeRepository` 和 `ActivityTypeService` 中补充对新字段及关联表的读写逻辑（创建/更新活动类型时同时维护套餐和资源关联），并为关键路径添加单元测试与集成测试。

### Frontend & UX

- [ ] T088 [P] 扩展前端类型定义与 Zod schema（`frontend/src/pages/activity-types/types/activity-type.types.ts` 与 `activity-type.schema.ts`），增加 `businessCategory`、`backgroundImageUrl`、`packages`（含 name/currentPrice/originalPrice/sort）、`resources`（storeId/hallId）等字段。
- [ ] T089 [P] 扩展 `ActivityTypeForm` 组件（`frontend/src/pages/activity-types/components/ActivityTypeForm.tsx`），新增业务分类选择（下拉或标签）、背景图输入/预览（URL 或上传）、套餐编辑区域（支持新增/修改/删除套餐行）、物理资源选择（基于门店/影厅下拉或选择器）。
- [ ] T090 [P] 扩展 `ActivityTypeTable` 组件（`frontend/src/pages/activity-types/components/ActivityTypeTable.tsx`），在列表中增加业务分类和背景图缩略图列（如仅显示缩略图或“已配置”标记），必要时提供简单筛选。
- [ ] T091 [P] 更新前端 API 服务与 TanStack Query hooks（`activityTypeService.ts` 与 `useActivityTypesQuery.ts`），以支持带扩展字段的请求与响应类型，并保证与后端 DTO 完全对齐。
- [ ] T092 [P] 为 Scenario Editor 扩展能力新增前端单元测试与 E2E 测试（验证业务分类/背景图/套餐/资源关联的创建与展示），增强现有 `activity-types.spec.ts` 和相关测试文件。

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T071 [P] Add error handling and loading states to all API calls in `frontend/src/pages/activity-types/index.tsx`
- [ ] T072 [P] Add backend logging for all activity type operations in `backend/src/main/java/com/cinema/hallstore/service/ActivityTypeService.java`
- [ ] T073 [P] Verify API response format compliance (ApiResponse<T> for single, ActivityTypeListResponse for list) in all endpoints
- [ ] T074 [P] Add search and filter functionality in `ActivityTypeTable` component (if needed for 50+ items)
- [ ] T075 [P] Add pagination support in backend and frontend (if needed for 50+ items)
- [ ] T076 [P] Verify permission control works correctly (test with different user roles)
- [ ] T077 [P] Add visual indicators for status (ENABLED/DISABLED) in `ActivityTypeTable` component
- [ ] T078 [P] Code cleanup and refactoring (remove unused code, optimize imports)
- [ ] T079 [P] Run quickstart.md validation (verify all steps work correctly)
- [ ] T080 [P] Update API documentation if needed
- [ ] T081 [P] Performance testing (verify SC-003: list query < 1 second, SC-004: support 50+ items)
- [ ] T082 [P] Security testing (verify SC-006: permission control 100% effective, SC-007: name uniqueness validation 100% accurate)

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
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Depends on US1 for list display, but can be independently tested
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for list display, but can be independently tested
- **User Story 4 (P1)**: Can start after Foundational (Phase 2) - Depends on US1 for list display, but can be independently tested
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - Depends on US1 for list display, but can be independently tested
- **User Story 6 (P1)**: Can start after Foundational (Phase 2) - Independent, only needs enabled endpoint

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models/Entities before services
- Services before controllers/endpoints
- Backend before frontend (for API-dependent features)
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T002-T005)
- All Foundational tasks marked [P] can run in parallel (T011-T012)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Backend and frontend tasks within a story can run in parallel (after backend API is ready)
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Create backend unit test for ActivityTypeService.findAll()"
Task: "Create backend integration test for GET /api/activity-types"
Task: "Create frontend Zod schema test"
Task: "Create frontend E2E test for viewing activity types list"

# Launch backend and frontend types in parallel:
Task: "Create backend domain entity ActivityType"
Task: "Create backend enum ActivityTypeStatus"
Task: "Create frontend TypeScript types"
Task: "Create frontend Zod schema"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (View List)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (View List) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (Create) → Test independently → Deploy/Demo
4. Add User Story 4 (Enable/Disable) → Test independently → Deploy/Demo
5. Add User Story 6 (Mini-program selection) → Test independently → Deploy/Demo
6. Add User Story 3 (Edit) → Test independently → Deploy/Demo
7. Add User Story 5 (Delete) → Test independently → Deploy/Demo
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (View List)
   - Developer B: User Story 2 (Create) + User Story 4 (Enable/Disable)
   - Developer C: User Story 6 (Mini-program selection)
3. Then:
   - Developer A: User Story 3 (Edit)
   - Developer B: User Story 5 (Delete)
   - Developer C: Polish phase
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Backend API must be ready before frontend integration tasks
- Permission control must be tested for all admin endpoints
- Soft delete implementation must ensure DELETED records are excluded from all list queries

