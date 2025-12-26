# Tasks: 库存调整管理 (P004-inventory-adjustment)

**Input**: Design documents from `/specs/P004-inventory-adjustment/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api.yaml

**Tests**: Tests are generated following TDD approach as specified in the constitution check.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/src/`
- **Backend**: `backend/src/main/java/com/cinema/`
- **Tests**: `frontend/src/__tests__/` and `backend/src/test/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, database schema, shared types

- [x] T001 Execute database migration script from data-model.md in Supabase
- [x] T002 [P] Create adjustment type definitions in frontend/src/features/inventory/types/adjustment.ts
- [x] T003 [P] Create Zod validation schemas in frontend/src/features/inventory/types/adjustmentSchemas.ts
- [x] T004 [P] Create MSW adjustment handlers skeleton in frontend/src/mocks/handlers/adjustmentHandlers.ts
- [x] T005 [P] Configure frontend routing for approval page in frontend/src/routes/inventory.tsx

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create adjustmentService base in frontend/src/features/inventory/services/adjustmentService.ts with API client setup
- [x] T007 [P] Create approvalService base in frontend/src/features/inventory/services/approvalService.ts with API client setup
- [x] T008 Create useAdjustmentReasons hook in frontend/src/features/inventory/hooks/useAdjustmentReasons.ts (fetch reason dictionary)
- [x] T009 [P] Create backend AdjustmentRequest DTO in backend/src/main/java/com/cinema/dto/AdjustmentRequest.java
- [x] T010 [P] Create backend AdjustmentResponse DTO in backend/src/main/java/com/cinema/dto/AdjustmentResponse.java
- [x] T011 [P] Create backend ApprovalRequest DTO in backend/src/main/java/com/cinema/dto/ApprovalRequest.java
- [x] T012 Create AdjustmentRepository interface in backend/src/main/java/com/cinema/repository/AdjustmentRepository.java
- [x] T013 [P] Create ApprovalRepository interface in backend/src/main/java/com/cinema/repository/ApprovalRepository.java

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - 录入库存调整 (Priority: P1) 🎯 MVP

**Goal**: 库存管理员能够录入盘盈/盘亏/报损调整，系统立即更新库存（小额调整）

**Independent Test**: 创建一条盘盈调整记录，验证库存数量正确增加，流水记录已生成

### Tests for User Story 1

- [x] T014 [P] [US1] Unit test for AdjustmentForm validation in frontend/src/features/inventory/components/__tests__/AdjustmentForm.test.tsx
- [x] T015 [P] [US1] Unit test for ConfirmAdjustmentModal display in frontend/src/features/inventory/components/__tests__/ConfirmAdjustmentModal.test.tsx
- [ ] T016 [P] [US1] Integration test for adjustment creation flow in frontend/src/__tests__/integration/adjustmentCreation.test.tsx
- [ ] T017 [P] [US1] Backend service test for InventoryAdjustmentService in backend/src/test/java/com/cinema/service/InventoryAdjustmentServiceTest.java

### Implementation for User Story 1

- [x] T018 [P] [US1] Implement AdjustmentForm component (type, quantity, reason select) in frontend/src/features/inventory/components/AdjustmentForm.tsx
- [x] T019 [P] [US1] Implement ConfirmAdjustmentModal component (before/after comparison) in frontend/src/features/inventory/components/ConfirmAdjustmentModal.tsx
- [x] T020 [US1] Implement AdjustmentModal wrapper (combines form + confirm) in frontend/src/features/inventory/components/AdjustmentModal.tsx
- [x] T021 [US1] Implement useCreateAdjustment mutation hook in frontend/src/features/inventory/hooks/useInventoryAdjustment.ts
- [x] T022 [US1] Complete MSW handlers for POST /adjustments in frontend/src/mocks/handlers/adjustmentHandlers.ts
- [x] T023 [US1] Implement InventoryAdjustmentService.createAdjustment in backend/src/main/java/com/cinema/inventory/service/InventoryAdjustmentService.java
- [x] T024 [US1] Implement InventoryAdjustmentController.createAdjustment in backend/src/main/java/com/cinema/inventory/controller/InventoryAdjustmentController.java
- [x] T025 [US1] Integrate AdjustmentModal into InventoryTable (add "调整" button) in frontend/src/features/inventory/components/InventoryTable.tsx
- [x] T026 [US1] Add validation error handling and user feedback (messages) in frontend/src/features/inventory/components/AdjustmentForm.tsx

**Checkpoint**: User Story 1 完成 - 库存管理员可以录入调整，小额调整立即生效

---

## Phase 4: User Story 2 - 查看库存流水记录 (Priority: P2)

**Goal**: 库存管理员能够查看SKU的流水记录，支持时间筛选，入库绿色+/出库红色-

**Independent Test**: 进入某SKU详情页，点击流水标签，显示该SKU历史变动记录列表

### Tests for User Story 2

- [x] T027 [P] [US2] Unit test for TransactionList component in frontend/src/features/inventory/components/__tests__/TransactionList.test.tsx
- [x] T028 [P] [US2] Unit test for TransactionQuantityTag color display in frontend/src/features/inventory/components/__tests__/TransactionQuantityTag.test.tsx
- [ ] T029 [P] [US2] Integration test for transaction query with date filter in frontend/src/__tests__/integration/transactionQuery.test.tsx

### Implementation for User Story 2

- [x] T030 [P] [US2] Create TransactionQuantityTag component (green+/red-) in frontend/src/features/inventory/components/TransactionQuantityTag.tsx
- [x] T031 [US2] Create TransactionList component with date range filter in frontend/src/features/inventory/components/TransactionList.tsx
- [x] T032 [US2] Implement useTransactions query hook in frontend/src/features/inventory/hooks/useTransactions.ts
- [x] T033 [US2] Add MSW handlers for GET /transactions in frontend/src/mocks/handlers/adjustmentHandlers.ts
- [x] T034 [US2] Extend InventoryDetailDrawer with "流水记录" tab in frontend/src/features/inventory/components/InventoryDetailDrawer.tsx
- [x] T035 [US2] Implement backend TransactionController.listTransactions in backend/src/main/java/com/cinema/inventory/controller/TransactionController.java

**Checkpoint**: User Story 2 完成 - 库存管理员可以查看流水，入库绿色/出库红色

---

## Phase 5: User Story 3 - 填写调整原因（必填） (Priority: P2)

**Goal**: 库存调整必须填写原因，原因来自预设字典，可选填备注

**Independent Test**: 尝试提交无原因的调整，系统阻止并提示"请选择调整原因"

**Note**: US3 与 US1 高度关联，大部分实现已在 US1 中完成。此阶段确保原因验证完整性。

### Tests for User Story 3

- [x] T036 [P] [US3] Unit test for reason required validation in frontend/src/features/inventory/components/__tests__/AdjustmentForm.test.tsx
- [x] T037 [P] [US3] Unit test for reason dropdown options loading in frontend/src/features/inventory/hooks/__tests__/useAdjustmentReasons.test.tsx

### Implementation for User Story 3

- [x] T038 [US3] Add MSW handlers for GET /adjustment-reasons in frontend/src/mocks/handlers/adjustmentHandlers.ts
- [x] T039 [US3] Implement backend ReasonController.listReasons in backend/src/main/java/com/cinema/inventory/controller/ReasonController.java
- [x] T040 [US3] Enhance AdjustmentForm reason select with loading state in frontend/src/features/inventory/components/AdjustmentForm.tsx

**Checkpoint**: User Story 3 完成 - 调整原因必填，预设字典可选，备注可选

---

## Phase 6: User Story 4 - 大额库存调整审批 (Priority: P3)

**Goal**: 调整金额>=1000元时进入待审批状态，运营总监可审批通过/拒绝，申请人可撤回

**Independent Test**: 录入金额超过1000元的调整，验证进入待审批状态，审批通过后库存更新

### Tests for User Story 4

- [x] T041 [P] [US4] Unit test for approval threshold calculation in frontend/src/features/inventory/utils/__tests__/approvalUtils.test.ts
- [x] T042 [P] [US4] Unit test for ApprovalList component in frontend/src/features/inventory/components/__tests__/ApprovalList.test.tsx
- [ ] T043 [P] [US4] Integration test for approval workflow in frontend/src/__tests__/integration/approvalWorkflow.test.tsx
- [ ] T044 [P] [US4] Backend service test for ApprovalService in backend/src/test/java/com/cinema/service/ApprovalServiceTest.java

### Implementation for User Story 4

- [x] T045 [P] [US4] Create approvalUtils with requiresApproval function in frontend/src/features/inventory/utils/approvalUtils.ts
- [x] T046 [US4] Modify useCreateAdjustment to handle pending_approval status in frontend/src/features/inventory/hooks/useInventoryAdjustment.ts
- [x] T047 [US4] Create ApprovalList component with approve/reject buttons in frontend/src/features/inventory/components/ApprovalList.tsx
- [x] T048 [US4] Create useApproval hooks (usePendingApprovals, useProcessApproval) in frontend/src/features/inventory/hooks/useApproval.ts
- [x] T049 [US4] Create ApprovalPage for operations director in frontend/src/pages/inventory/ApprovalPage.tsx
- [x] T050 [US4] Add MSW handlers for approval endpoints in frontend/src/mocks/handlers/adjustmentHandlers.ts
- [x] T051 [US4] Implement ApprovalService with approve/reject/withdraw logic in backend/src/main/java/com/cinema/inventory/service/ApprovalService.java
- [x] T052 [US4] Implement ApprovalController endpoints in backend/src/main/java/com/cinema/inventory/controller/ApprovalController.java
- [x] T053 [US4] Add withdraw functionality to adjustment detail view in frontend/src/features/inventory/components/AdjustmentDetailDrawer.tsx
- [x] T054 [US4] Add status badge display in adjustment list/detail in frontend/src/features/inventory/components/AdjustmentStatusTag.tsx

**Checkpoint**: User Story 4 完成 - 大额调整需审批，运营总监可审批，申请人可撤回

---

## Phase 7: User Story 5 - 设置安全库存阈值 (Priority: P3)

**Goal**: 库存管理员可在库存详情中编辑安全库存值，保存后库存状态立即更新

**Independent Test**: 编辑某SKU安全库存从5改为15，验证库存状态标识重新计算

### Tests for User Story 5

- [x] T055 [P] [US5] Unit test for SafetyStockEditor component in frontend/src/features/inventory/components/__tests__/SafetyStockEditor.test.tsx
- [x] T056 [P] [US5] Unit test for optimistic lock conflict handling in frontend/src/features/inventory/hooks/__tests__/useSafetyStock.test.tsx

### Implementation for User Story 5

- [x] T057 [US5] Create SafetyStockEditor component with edit mode in frontend/src/features/inventory/components/SafetyStockEditor.tsx
- [x] T058 [US5] Create useSafetyStock hook with optimistic lock handling in frontend/src/features/inventory/hooks/useSafetyStock.ts
- [x] T059 [US5] Add MSW handlers for PUT /inventory/{id}/safety-stock in frontend/src/mocks/handlers/adjustmentHandlers.ts
- [x] T060 [US5] Integrate SafetyStockEditor into InventoryDetailDrawer in frontend/src/features/inventory/components/InventoryDetailDrawer.tsx
- [x] T061 [US5] Implement backend SafetyStockController.updateSafetyStock with optimistic lock in backend/src/main/java/com/cinema/inventory/controller/SafetyStockController.java
- [x] T062 [US5] Add conflict error handling (409) in SafetyStockEditor in frontend/src/features/inventory/components/SafetyStockEditor.tsx

**Checkpoint**: User Story 5 完成 - 安全库存可编辑，支持乐观锁冲突处理

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T063 [P] Ensure consistent error handling across all adjustment operations in frontend/src/features/inventory/utils/errorHandling.ts
- [x] T064 [P] Add loading states and skeleton screens for all lists in frontend/src/features/inventory/components/SkeletonScreens.tsx
- [x] T065 Code cleanup and TypeScript strict mode compliance
- [x] T066 Performance optimization: pagination for large lists in frontend/src/features/inventory/utils/pagination.ts
- [x] T067 [P] Accessibility improvements: ARIA labels, keyboard navigation in frontend/src/features/inventory/utils/accessibility.ts
- [x] T068 Run quickstart.md validation to verify all flows work end-to-end in specs/P004-inventory-adjustment/quickstart.md
- [x] T069 Update CLAUDE.md with new storage and API information (already included)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 can start first (MVP)
  - US2 can run in parallel with US1 (different components)
  - US3 is closely tied to US1, should follow US1
  - US4 depends on US1 (needs adjustment records to approve)
  - US5 can run in parallel with US4 (independent feature)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational - May display US1 records but independently testable
- **User Story 3 (P2)**: Closely tied to US1 - Should complete after US1 for integration
- **User Story 4 (P3)**: Depends on US1 - Needs adjustment records to test approval flow
- **User Story 5 (P3)**: Can start after Foundational - Independent feature

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Types/schemas before services
- Services before hooks
- Hooks before components
- Components before page integration
- Backend API before frontend integration (or use MSW mocks)

### Parallel Opportunities

**Phase 1 (Setup)**:
- T002, T003, T004, T005 can all run in parallel

**Phase 2 (Foundational)**:
- T007, T009, T010, T011, T013 can run in parallel

**User Story 1**:
- T014, T015, T016, T017 (tests) can run in parallel
- T018, T019 (form components) can run in parallel

**User Story 2**:
- T027, T028, T029 (tests) can run in parallel
- T030 can run in parallel with US1 implementation

**User Story 4**:
- T041, T042, T043, T044 (tests) can run in parallel
- T045 can run in parallel with other US4 implementation

**User Story 5**:
- T055, T056 (tests) can run in parallel
- Entire US5 can run in parallel with US4

---

## Parallel Example: Phase 2 + User Story 1 Start

```bash
# After Phase 1 completes, launch Foundational tasks in parallel:
Task: T006 "Create adjustmentService base"
Task: T007 "Create approvalService base" [P]
Task: T009 "Create AdjustmentRequest DTO" [P]
Task: T010 "Create AdjustmentResponse DTO" [P]
Task: T011 "Create ApprovalRequest DTO" [P]

# Once Foundational completes, launch US1 tests in parallel:
Task: T014 "[US1] Unit test for AdjustmentForm"
Task: T015 "[US1] Unit test for ConfirmAdjustmentModal"
Task: T016 "[US1] Integration test for adjustment creation"
Task: T017 "[US1] Backend service test"

# Then launch US1 component implementations in parallel:
Task: T018 "[US1] Implement AdjustmentForm"
Task: T019 "[US1] Implement ConfirmAdjustmentModal"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test adjustment creation end-to-end
5. Deploy/demo if ready - 库存管理员可以录入调整

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test → Deploy (MVP: 基础调整录入)
3. Add User Story 2 → Test → Deploy (增强: 流水查看)
4. Add User Story 3 → Test → Deploy (增强: 原因完善)
5. Add User Story 4 → Test → Deploy (风控: 审批机制)
6. Add User Story 5 → Test → Deploy (运营: 安全库存)
7. Polish → Final release

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (MVP, highest priority)
   - Developer B: User Story 2 (can start in parallel, different components)
3. After US1 completes:
   - Developer A: User Story 3 (ties into US1)
   - Developer B: User Story 4 (needs US1 records)
   - Developer C: User Story 5 (independent)

---

## Summary

| Phase | User Story | Tasks | Parallel Tasks |
|-------|------------|-------|----------------|
| Phase 1 | Setup | 5 | 4 |
| Phase 2 | Foundational | 8 | 6 |
| Phase 3 | US1 - 录入调整 (P1) | 13 | 6 |
| Phase 4 | US2 - 流水查看 (P2) | 9 | 4 |
| Phase 5 | US3 - 调整原因 (P2) | 5 | 2 |
| Phase 6 | US4 - 审批流程 (P3) | 14 | 5 |
| Phase 7 | US5 - 安全库存 (P3) | 8 | 2 |
| Phase 8 | Polish | 7 | 3 |
| **Total** | | **69** | **32** |

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story is independently testable after completion
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- US3 is integrated with US1 (reason field), tasks focus on validation completeness
