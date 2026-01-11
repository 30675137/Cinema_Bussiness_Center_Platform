# Tasks: 供应商编辑功能

**@spec N003-supplier-edit**
**Input**: Design documents from `/specs/N003-supplier-edit/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/api.yaml ✓

**Tests**: 不强制要求，本功能聚焦于实现核心功能。

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: DTO 和基础类创建

- [ ] T001 [P] Create SupplierCreateRequest DTO in `backend/src/main/java/com/cinema/procurement/dto/SupplierCreateRequest.java`
- [ ] T002 [P] Create SupplierUpdateRequest DTO in `backend/src/main/java/com/cinema/procurement/dto/SupplierUpdateRequest.java`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 后端 Service 层方法，为所有 User Story 提供基础

**⚠️ CRITICAL**: 前端无法保存数据，直到后端 API 完成

- [ ] T003 Add `create` method to SupplierService in `backend/src/main/java/com/cinema/procurement/service/SupplierService.java`
- [ ] T004 Add `update` method to SupplierService in `backend/src/main/java/com/cinema/procurement/service/SupplierService.java`
- [ ] T005 Add `findByCode` method to SupplierRepository for uniqueness check in `backend/src/main/java/com/cinema/procurement/repository/SupplierRepository.java`
- [ ] T006 Add POST `/api/suppliers` endpoint to SupplierController in `backend/src/main/java/com/cinema/procurement/controller/SupplierController.java`
- [ ] T007 Add PUT `/api/suppliers/{id}` endpoint to SupplierController in `backend/src/main/java/com/cinema/procurement/controller/SupplierController.java`

**Checkpoint**: Backend API ready - frontend implementation can now begin

---

## Phase 3: User Story 1 - 编辑供应商信息 (Priority: P1) 🎯 MVP

**Goal**: 采购管理员可以编辑现有供应商的名称、联系人、联系电话、状态

**Independent Test**: 编辑一个供应商的联系人姓名，保存后刷新页面，验证联系人姓名已更新

### Implementation for User Story 1

- [ ] T008 [US1] Add `updateSupplier` function to `frontend/src/services/supplierApi.ts`
- [ ] T009 [US1] Implement save logic for edit mode in `handleModalOk` in `frontend/src/pages/procurement/SupplierList.tsx`
- [ ] T010 [US1] Add loading state and disable submit button during save in `frontend/src/pages/procurement/SupplierList.tsx`
- [ ] T011 [US1] Add error handling - show error message and keep modal open on failure in `frontend/src/pages/procurement/SupplierList.tsx`
- [ ] T012 [US1] Call `fetchSuppliers()` after successful save to refresh list in `frontend/src/pages/procurement/SupplierList.tsx`

**Checkpoint**: 编辑供应商功能完整可用

---

## Phase 4: User Story 2 - 新建供应商 (Priority: P1)

**Goal**: 采购管理员可以新建供应商记录，填写编码、名称、联系人、联系电话、状态

**Independent Test**: 新建一个供应商，保存后验证该供应商出现在列表中

### Implementation for User Story 2

- [ ] T013 [US2] Add `createSupplier` function to `frontend/src/services/supplierApi.ts`
- [ ] T014 [US2] Implement save logic for create mode in `handleModalOk` in `frontend/src/pages/procurement/SupplierList.tsx`
- [ ] T015 [US2] Handle 409 conflict error - show "供应商编码已存在" message in `frontend/src/pages/procurement/SupplierList.tsx`

**Checkpoint**: 新建供应商功能完整可用

---

## Phase 5: User Story 3 - 编辑时数据回显 (Priority: P2)

**Goal**: 编辑模态框打开时自动填充当前供应商的所有信息，编码字段只读

**Independent Test**: 点击编辑按钮，验证模态框中的所有字段值与列表中显示的一致

### Implementation for User Story 3

- [ ] T016 [US3] Set code field to readonly in edit mode in `frontend/src/pages/procurement/SupplierList.tsx`
- [ ] T017 [US3] Verify form `setFieldsValue` in `handleEdit` properly echoes all supplier fields in `frontend/src/pages/procurement/SupplierList.tsx`

**Checkpoint**: 数据回显功能完整可用

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 优化和边界情况处理

- [ ] T018 Add `@spec N003-supplier-edit` annotation to all modified files
- [ ] T019 Verify phone validation pattern matches spec requirement (1开头11位数字) in both frontend and backend
- [ ] T020 Run manual test: Create → Edit → Verify → Refresh cycle
- [ ] T021 Update supplierApi.ts file header comment to reflect new functions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all frontend work
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (编辑)**: Can start after Phase 2 - No dependencies on other stories
- **User Story 2 (新建)**: Can start after Phase 2 - Shares API function structure with US1
- **User Story 3 (回显)**: Part of edit flow, but UI already exists - verify and polish

### Within Each User Story

- API function before UI implementation
- Core logic before error handling
- Refresh list after save

### Parallel Opportunities

- T001 and T002 (DTOs) can run in parallel
- T008 and T013 (API functions) can run in parallel (different functions)
- Once backend is ready, all frontend tasks can proceed

---

## Parallel Example: Phase 1 Setup

```bash
# Launch DTO creation in parallel:
Task: "Create SupplierCreateRequest DTO in backend/..."
Task: "Create SupplierUpdateRequest DTO in backend/..."
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (DTOs)
2. Complete Phase 2: Foundational (Backend API)
3. Complete Phase 3: User Story 1 (Edit functionality)
4. **STOP and VALIDATE**: Test editing a supplier
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Backend API ready
2. Add User Story 1 (Edit) → Test independently → MVP!
3. Add User Story 2 (Create) → Test independently
4. Add User Story 3 (Data Echo) → Polish
5. Each story adds value without breaking previous stories

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| Setup | T001-T002 | DTO creation |
| Foundational | T003-T007 | Backend API |
| US1 (Edit) | T008-T012 | Edit supplier functionality |
| US2 (Create) | T013-T015 | Create supplier functionality |
| US3 (Echo) | T016-T017 | Data echo in edit mode |
| Polish | T018-T021 | Annotations, validation, testing |

**Total Tasks**: 21
**MVP Scope**: Phase 1 + Phase 2 + Phase 3 (US1) = 12 tasks

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- 前端字段 `contactPerson` 需要映射到后端 `contactName`
- 编辑模式下 `code` 字段必须设为只读
- 后端使用 Jakarta Validation 进行参数验证
