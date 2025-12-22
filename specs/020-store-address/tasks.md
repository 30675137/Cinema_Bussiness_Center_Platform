# Tasks: 门店地址信息管理

**Input**: Design documents from `/specs/020-store-address/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/api.yaml, research.md, quickstart.md

**Tests**: 本功能规格中要求 TDD 开发（参见 plan.md Constitution Check），包含测试任务。

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/main/java/com/cinema/hallstore/`
- **B端 Frontend**: `frontend/src/`
- **C端 Taro**: `hall-reserve-taro/src/`

---

## Phase 1: Setup (Database Migration)

**Purpose**: Database schema changes and type definitions

- [x] T001 Create database migration script `backend/src/main/resources/db/migration/V6__add_store_address_fields.sql`
- [x] T002 [P] Add address fields to Store domain model in `backend/src/main/java/com/cinema/hallstore/domain/Store.java`
- [x] T003 [P] Add address fields to StoreDTO in `backend/src/main/java/com/cinema/hallstore/dto/StoreDTO.java`
- [x] T004 [P] Add getAddressSummary() method to StoreDTO in `backend/src/main/java/com/cinema/hallstore/dto/StoreDTO.java`
- [x] T005 [P] Update B端 Store TypeScript types in `frontend/src/pages/stores/types/store.types.ts`
- [x] T006 [P] Create C端 Store TypeScript types in `hall-reserve-taro/src/types/store.ts`

---

## Phase 2: Foundational (Backend Infrastructure)

**Purpose**: Backend changes that support all user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Update SupabaseStoreRow to include new address fields in `backend/src/main/java/com/cinema/hallstore/repository/StoreRepository.java`
- [x] T008 Update toDomain() mapping in StoreRepository to handle address fields in `backend/src/main/java/com/cinema/hallstore/repository/StoreRepository.java`
- [x] T009 Update StoreMapper to map address fields between domain and DTO in `backend/src/main/java/com/cinema/hallstore/mapper/StoreMapper.java`
- [x] T010 Create UpdateStoreAddressRequest DTO in `backend/src/main/java/com/cinema/hallstore/dto/UpdateStoreAddressRequest.java`
- [x] T011 Add phone format validation utility in `backend/src/main/java/com/cinema/hallstore/util/PhoneValidator.java`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - 配置门店地址信息 (Priority: P1) 🎯 MVP

**Goal**: B端运营人员能在门店编辑页面配置完整的地址信息

**Independent Test**: 运营可以为指定门店添加/编辑完整的地址信息；前端通过门店详情 API 能获取并展示门店的地址信息

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T012 [P] [US1] Create unit test for AddressForm component in `frontend/src/features/store-management/components/__tests__/AddressForm.test.tsx`
- [ ] T013 [P] [US1] Create backend integration test for store address update in `backend/src/test/java/com/cinema/hallstore/controller/StoreAddressUpdateIntegrationTest.java`
- [ ] T014 [P] [US1] Create phone format validation unit test in `backend/src/test/java/com/cinema/hallstore/util/PhoneValidatorTest.java`

### Implementation for User Story 1

- [ ] T015 [US1] Implement updateStoreAddress() method in StoreService `backend/src/main/java/com/cinema/hallstore/service/StoreService.java`
- [ ] T016 [US1] Add PUT /api/stores/{id} endpoint for address update in `backend/src/main/java/com/cinema/hallstore/controller/StoreController.java`
- [ ] T017 [US1] Add address validation (province/city/district required, phone format) in `backend/src/main/java/com/cinema/hallstore/service/StoreService.java`
- [ ] T018 [US1] Create AddressForm component in `frontend/src/features/store-management/components/AddressForm.tsx`
- [ ] T019 [US1] Create useUpdateStore hook with TanStack Query in `frontend/src/features/store-management/hooks/useUpdateStore.ts`
- [ ] T020 [US1] Integrate AddressForm into store edit page in `frontend/src/pages/stores/edit.tsx`
- [ ] T021 [US1] Add Zod schema for phone validation in `frontend/src/features/store-management/types/validation.ts`
- [ ] T022 [US1] Add form validation error display in AddressForm component `frontend/src/features/store-management/components/AddressForm.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - 门店列表展示地址摘要 (Priority: P2)

**Goal**: 门店列表中展示每个门店的地址摘要（城市+区县）

**Independent Test**: 门店列表 API 返回每个门店的 addressSummary 字段，B端列表展示地址摘要列

### Tests for User Story 2 ⚠️

- [ ] T023 [P] [US2] Create unit test for addressSummary display in store list `frontend/src/pages/stores/__tests__/list.test.tsx`

### Implementation for User Story 2

- [ ] T024 [US2] Verify GET /api/stores returns addressSummary field (已在 StoreDTO.getAddressSummary 实现)
- [ ] T025 [US2] Add addressSummary column to store list table in `frontend/src/pages/stores/list.tsx`
- [ ] T026 [US2] Handle empty addressSummary display (show "未配置") in `frontend/src/pages/stores/list.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - C端展示门店地址与导航 (Priority: P2)

**Goal**: C端用户能在门店详情页看到完整地址，并能复制地址和拨打电话

**Independent Test**: C端门店详情页展示地址信息，用户可以长按复制地址、点击电话号码直接拨打

### Tests for User Story 3 ⚠️

- [ ] T027 [P] [US3] Create unit test for phone utility functions in `hall-reserve-taro/src/utils/__tests__/phone.test.ts`

### Implementation for User Story 3

- [ ] T028 [US3] Create phone utility (makePhoneCall with H5 fallback) in `hall-reserve-taro/src/utils/phone.ts`
- [ ] T029 [US3] Create clipboard utility (copyToClipboard) in `hall-reserve-taro/src/utils/clipboard.ts`
- [ ] T030 [US3] Create formatFullAddress utility function in `hall-reserve-taro/src/types/store.ts`
- [ ] T031 [US3] Create StoreDetail page in `hall-reserve-taro/src/pages/store-detail/index.tsx`
- [ ] T032 [US3] Create StoreDetail page styles in `hall-reserve-taro/src/pages/store-detail/index.scss`
- [ ] T033 [US3] Add store-detail page to app config in `hall-reserve-taro/src/app.config.ts`
- [ ] T034 [US3] Implement address display with copy functionality in `hall-reserve-taro/src/pages/store-detail/index.tsx`
- [ ] T035 [US3] Implement phone display with call functionality in `hall-reserve-taro/src/pages/store-detail/index.tsx`
- [ ] T036 [US3] Add loading and error states to StoreDetail page `hall-reserve-taro/src/pages/store-detail/index.tsx`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Edge Cases & Error Handling

**Purpose**: Handle edge cases defined in spec.md

- [ ] T037 Handle partial address display (only some fields filled) in B端 `frontend/src/pages/stores/edit.tsx`
- [ ] T038 Handle partial address display in C端 `hall-reserve-taro/src/pages/store-detail/index.tsx`
- [ ] T039 Add inactive store handling in C端 (redirect or show message) `hall-reserve-taro/src/pages/store-detail/index.tsx`
- [ ] T040 Add phone validation error message in B端 AddressForm `frontend/src/features/store-management/components/AddressForm.tsx`

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T041 [P] Add accessibility attributes (aria-labels) to AddressForm in `frontend/src/features/store-management/components/AddressForm.tsx`
- [ ] T042 [P] Add loading states for address update operation in `frontend/src/pages/stores/edit.tsx`
- [ ] T043 Verify all E2E tests pass with `npm run test:e2e`
- [ ] T044 Verify all unit tests pass with `npm run test`
- [ ] T045 Verify backend tests pass with `./mvnw test`
- [ ] T046 Run quickstart.md manual verification checklist
- [ ] T047 Test C端 on H5 browser and verify address/phone functions

---

## Phase 8: API Testing (Postman)

**Purpose**: Provide Postman Collection for API contract verification per constitution v1.5.0

- [ ] T048 [P] Create Postman directory structure at `specs/020-store-address/postman/`
- [ ] T049 [P] Create Postman Collection file `020-store-address.postman_collection.json`
- [ ] T050 [P] Create local environment file `020-local.postman_environment.json`
- [ ] T051 Add GET /api/stores request with Tests script (verify addressSummary field)
- [ ] T052 Add GET /api/stores/{id} request with Tests script (verify all address fields)
- [ ] T053 Add PUT /api/stores/{id} request with address update and Tests script
- [ ] T054 Add validation test for invalid phone format (expect 400)
- [ ] T055 Add Postman README documentation `specs/020-store-address/postman/README.md`
- [ ] T056 Verify Postman Collection runs successfully with Newman

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001-T006) completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can proceed in priority order (P1 → P2)
  - US2 and US3 are both P2, can be done in parallel
- **Edge Cases (Phase 6)**: Can run after US1 complete
- **Polish (Phase 7)**: Depends on all user stories being complete
- **Postman (Phase 8)**: Can run in parallel with Phase 6-7

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational - Depends on addressSummary from T004
- **User Story 3 (P2)**: Can start after Foundational - Independent of US1/US2

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Backend changes before frontend integration
- Core implementation before error handling
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T002-T006)
- All Foundational tasks can run sequentially (T007-T011)
- Tests within each story marked [P] can run in parallel
- US2 and US3 can proceed in parallel after Foundational
- Phase 8 Postman tasks can run in parallel with Phase 6-7

---

## Parallel Example: Phase 1 Setup

```bash
# Launch all type definition tasks in parallel:
Task: "Add address fields to Store domain model in backend/.../Store.java"
Task: "Add address fields to StoreDTO in backend/.../StoreDTO.java"
Task: "Update B端 Store TypeScript types in frontend/src/types/store.ts"
Task: "Create C端 Store TypeScript types in hall-reserve-taro/src/types/store.ts"
```

## Parallel Example: User Stories 2 & 3

```bash
# After Foundational phase, launch US2 and US3 in parallel:
# Developer A: User Story 2
Task: "Add addressSummary column to store list table"
Task: "Handle empty addressSummary display"

# Developer B: User Story 3
Task: "Create phone utility in hall-reserve-taro"
Task: "Create StoreDetail page in hall-reserve-taro"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (B端地址配置)
4. **STOP and VALIDATE**: Test address update independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (列表增强)
4. Add User Story 3 → Test independently → Deploy/Demo (C端体验)
5. Each story adds value without breaking previous stories

---

## Task Summary

| Phase | Description | Task Count | Priority |
|-------|-------------|------------|----------|
| Phase 1 | Setup | 6 | Required |
| Phase 2 | Foundational | 5 | Required |
| Phase 3 | User Story 1 (P1) | 11 | Required (MVP) |
| Phase 4 | User Story 2 (P2) | 4 | Required |
| Phase 5 | User Story 3 (P2) | 10 | Required |
| Phase 6 | Edge Cases | 4 | Required |
| Phase 7 | Polish | 7 | Required |
| Phase 8 | Postman | 9 | Required |
| **Total** | | **56** | |

**MVP Scope (US1 only)**: 22 tasks (Phase 1 + 2 + 3)
**Full Scope**: 56 tasks

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
