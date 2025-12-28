# Tasks: 订单列表与状态查看 (Order List & Status View)

**Feature**: U004-order-list-view
**Input**: Design documents from `/specs/U004-order-list-view/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.yaml, contracts/types.ts, quickstart.md

**Tests**: Test tasks included as per Test-Driven Development (TDD) requirement in constitution

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

This is a web application with separate frontend and backend:
- Frontend: `frontend/src/`
- Backend: `backend/src/main/java/com/cinema/`
- Tests: `frontend/src/__tests__/`, `tests/e2e/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and feature module structure

- [ ] T001 Create feature module directory structure at `frontend/src/features/orders/` with subdirectories: components/, hooks/, services/, types/, utils/, __tests__/
- [ ] T002 [P] Create contracts directory and copy type definitions from `specs/U004-order-list-view/contracts/types.ts` to `frontend/src/features/orders/types/index.ts`
- [ ] T003 [P] Create Zustand store file `frontend/src/stores/orderFiltersStore.ts` with basic store structure
- [ ] T004 [P] Create MSW handlers file `frontend/src/mocks/handlers/orderHandlers.ts` for order list API mocking
- [ ] T005 [P] Add route configuration for OrderListPage in `frontend/src/App.tsx` or routing config (`/orders/list` or `/reservation-orders`)

**Checkpoint**: Feature module structure ready for implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core reusable components and utilities that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Verify U001 types exist at `frontend/src/types/reservationOrder.ts` (ReservationOrder, ReservationStatus, OperationLog, etc.)
- [ ] T007 [P] Create OrderStatusTag atom component in `frontend/src/features/orders/components/OrderStatusTag.tsx` (reuses RESERVATION_STATUS_CONFIG from U001)
- [ ] T008 [P] Create utility functions in `frontend/src/features/orders/utils/orderHelpers.ts` (phone sanitization, date formatting)
- [ ] T009 [P] Create Zod validation schemas in `frontend/src/features/orders/utils/validation.ts` (phoneSearchSchema, timeRangeSchema)
- [ ] T010 [P] Create custom debounce hook `frontend/src/hooks/useDebouncedValue.ts` (500ms delay for phone search)
- [ ] T011 Implement Zustand store in `frontend/src/stores/orderFiltersStore.ts` with full OrderListFilterState interface

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 查看订单列表(全量订单) (Priority: P1) 🎯 MVP

**Goal**: Display all reservation orders in a paginated table with basic information (order number, customer, scenario package, status, amount, time)

**Independent Test**: Login to backend platform, navigate to `/orders/list`, verify order list loads with all fields displayed, pagination works correctly

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T012 [P] [US1] E2E test for order list page load in `tests/e2e/order-list.spec.ts` - verify page navigation and table rendering
- [ ] T013 [P] [US1] E2E test for pagination in `tests/e2e/order-list.spec.ts` - verify page size options (10/20/50/100) and page navigation
- [ ] T014 [P] [US1] Component test for OrderList in `frontend/src/features/orders/components/__tests__/OrderList.test.tsx` - verify table columns, loading states, empty states
- [ ] T015 [P] [US1] Hook test for useOrders in `frontend/src/features/orders/hooks/__tests__/useOrders.test.ts` - verify TanStack Query integration

### Implementation for User Story 1

- [ ] T016 [P] [US1] Create TanStack Query hook `useOrders` in `frontend/src/features/orders/hooks/useOrders.ts` with pagination support
- [ ] T017 [P] [US1] Create API service function `getReservationList` in `frontend/src/features/orders/services/orderService.ts` (reuses U001 endpoint `/api/admin/reservations`)
- [ ] T018 [US1] Implement OrderList table component in `frontend/src/features/orders/components/OrderList.tsx` with Ant Design Table, columns definition, pagination
- [ ] T019 [US1] Create OrderListPage in `frontend/src/pages/OrderListPage.tsx` - integrates OrderList component with layout
- [ ] T020 [US1] Add loading state handling (Ant Design Spin) in OrderList component
- [ ] T021 [US1] Add empty state handling ("暂无订单数据" message) in OrderList component
- [ ] T022 [US1] Add error state handling ("加载失败,请稍后重试" with retry button) in OrderList component
- [ ] T023 [US1] Implement MSW handler for `GET /api/admin/reservations` in `frontend/src/mocks/handlers/orderHandlers.ts` with mock data generation

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - order list displays with pagination

---

## Phase 4: User Story 2 - 订单状态筛选与展示 (Priority: P1)

**Goal**: Filter orders by status (PENDING, CONFIRMED, COMPLETED, CANCELLED) using tabs, display status with color-coded tags

**Independent Test**: On order list page, click status filter tabs (全部/待确认/已确认/已完成/已取消), verify list filters correctly and status tags display with correct colors

### Tests for User Story 2

- [ ] T024 [P] [US2] E2E test for status filtering in `tests/e2e/order-list.spec.ts` - verify tab clicks filter orders correctly
- [ ] T025 [P] [US2] Component test for FilterBar in `frontend/src/features/orders/components/__tests__/FilterBar.test.tsx` - verify tab selection logic
- [ ] T026 [P] [US2] Hook test for useOrderFilters in `frontend/src/features/orders/hooks/__tests__/useOrderFilters.test.ts` - verify Zustand store state updates

### Implementation for User Story 2

- [ ] T027 [P] [US2] Create FilterBar component in `frontend/src/features/orders/components/FilterBar.tsx` with Ant Design Tabs for status selection
- [ ] T028 [P] [US2] Create useOrderFilters hook in `frontend/src/features/orders/hooks/useOrderFilters.ts` - wraps Zustand store with selectors
- [ ] T029 [US2] Integrate FilterBar into OrderListPage above the OrderList table
- [ ] T030 [US2] Connect status filter state to useOrders hook query parameters (statuses array)
- [ ] T031 [US2] Add status tag rendering in OrderList table columns using OrderStatusTag component
- [ ] T032 [US2] Add empty state for filtered results ("暂无[状态名]订单") in OrderList component
- [ ] T033 [US2] Update MSW handler to support statuses query parameter in `frontend/src/mocks/handlers/orderHandlers.ts`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - order list with status filtering and color-coded tags

---

## Phase 5: User Story 3 - 时间范围筛选 (Priority: P2)

**Goal**: Filter orders by creation time using quick options (今天/最近7天/最近30天) or custom date range

**Independent Test**: On order list page, select time range filter (today/last 7 days/last 30 days/custom), verify list filters by createdAt field correctly

### Tests for User Story 3

- [ ] T034 [P] [US3] E2E test for time range filtering in `tests/e2e/order-list.spec.ts` - verify quick options and custom date picker
- [ ] T035 [P] [US3] Component test for TimeRangeFilter in `frontend/src/features/orders/components/__tests__/TimeRangeFilter.test.tsx` - verify date calculation logic

### Implementation for User Story 3

- [ ] T036 [P] [US3] Create TimeRangeFilter component in `frontend/src/features/orders/components/TimeRangeFilter.tsx` with Ant Design DatePicker.RangePicker
- [ ] T037 [US3] Add time range state to orderFiltersStore (timeRangeType, customTimeRange)
- [ ] T038 [US3] Implement quick option buttons (今天/最近7天/最近30天) in TimeRangeFilter component
- [ ] T039 [US3] Add custom date range validation (end >= start, end <= today) using Zod schema
- [ ] T040 [US3] Integrate TimeRangeFilter into FilterBar component
- [ ] T041 [US3] Connect time range filter to useOrders query parameters (createdAtStart, createdAtEnd)
- [ ] T042 [US3] Add "清空筛选" button to reset time range filter
- [ ] T043 [US3] Update MSW handler to support time range query parameters in `frontend/src/mocks/handlers/orderHandlers.ts`

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently - order list with status and time range filtering

---

## Phase 6: User Story 4 - 客户手机号搜索 (Priority: P2)

**Goal**: Search orders by customer phone number with real-time debounced filtering, partial match support

**Independent Test**: On order list page, type phone number in search box, verify list filters to show matching orders, clear button resets search

### Tests for User Story 4

- [ ] T044 [P] [US4] E2E test for phone search in `tests/e2e/order-list.spec.ts` - verify search input, debouncing, clear button
- [ ] T045 [P] [US4] Component test for SearchBar in `frontend/src/features/orders/components/__tests__/SearchBar.test.tsx` - verify input sanitization and debouncing
- [ ] T046 [P] [US4] Unit test for phone sanitization utility in `frontend/src/features/orders/utils/__tests__/orderHelpers.test.ts`

### Implementation for User Story 4

- [ ] T047 [P] [US4] Create SearchBar component in `frontend/src/features/orders/components/SearchBar.tsx` with Ant Design Input.Search
- [ ] T048 [US4] Add phoneSearch state to orderFiltersStore
- [ ] T049 [US4] Implement phone sanitization function (strip non-digits) in orderHelpers.ts
- [ ] T050 [US4] Integrate SearchBar into OrderListPage (top-right of filter area)
- [ ] T051 [US4] Apply useDebouncedValue hook (500ms) to phone search input
- [ ] T052 [US4] Connect debounced phone search to useOrders query parameter (contactPhone)
- [ ] T053 [US4] Add input validation (digits only, max 11 characters) using Zod schema
- [ ] T054 [US4] Add empty state for no search results ("未找到匹配的订单")
- [ ] T055 [US4] Update MSW handler to support contactPhone query parameter in `frontend/src/mocks/handlers/orderHandlers.ts`

**Checkpoint**: At this point, User Stories 1-4 should all work independently - order list with status, time, and phone search filtering

---

## Phase 7: User Story 5 - 查看订单详情 (Priority: P1)

**Goal**: Display complete order details in a slide-out drawer (customer info, scenario package, items, amount breakdown, operation logs)

**Independent Test**: On order list page, click "查看详情" button on any order, verify drawer opens from right side with complete order information displayed in sections

### Tests for User Story 5

- [ ] T056 [P] [US5] E2E test for order detail drawer in `tests/e2e/order-list.spec.ts` - verify drawer open/close, content display
- [ ] T057 [P] [US5] Component test for OrderDetailDrawer in `frontend/src/features/orders/components/__tests__/OrderDetailDrawer.test.tsx` - verify section rendering, loading/error states

### Implementation for User Story 5

- [ ] T058 [P] [US5] Create API service function `getReservationDetail` in `frontend/src/features/orders/services/orderService.ts` (reuses U001 endpoint `/api/admin/reservations/:id`)
- [ ] T059 [P] [US5] Create TanStack Query hook `useOrderDetail` in `frontend/src/features/orders/hooks/useOrderDetail.ts`
- [ ] T060 [US5] Create OrderDetailDrawer component in `frontend/src/features/orders/components/OrderDetailDrawer.tsx` with Ant Design Drawer (720px width, right placement)
- [ ] T061 [US5] Add order detail sections: Basic Info (order number, status, timestamps)
- [ ] T062 [US5] Add customer info section (name, phone, notes) in OrderDetailDrawer
- [ ] T063 [US5] Add scenario package info section (package name, reservation date/time, tier name, price) in OrderDetailDrawer
- [ ] T064 [US5] Add items table section (addon items with quantity, unit price, total) using Ant Design Table in OrderDetailDrawer
- [ ] T065 [US5] Add amount breakdown section (package amount, addons total, grand total highlighted) in OrderDetailDrawer
- [ ] T066 [US5] Add operation logs section (timeline format, descending by time) using Ant Design Timeline in OrderDetailDrawer
- [ ] T067 [US5] Integrate drawer state management (visible, orderId) in OrderListPage using useState
- [ ] T068 [US5] Add "查看详情" action button in OrderList table columns
- [ ] T069 [US5] Add drawer loading state, error state, and close button in OrderDetailDrawer
- [ ] T070 [US5] Update MSW handler for `GET /api/admin/reservations/:id` in `frontend/src/mocks/handlers/orderHandlers.ts`

**Checkpoint**: At this point, User Stories 1, 2, and 5 should work independently - order list with detail viewing capability

---

## Phase 8: User Story 6 - 订单状态变更操作(集成U001功能) (Priority: P1)

**Goal**: Confirm or cancel orders directly from list/detail view with modals, integrate U001 confirmation/cancellation APIs, refresh list after status change

**Independent Test**: On order list or detail drawer, click "确认订单" or "取消订单" on a PENDING order, fill in required info in modal, verify order status updates and list refreshes

### Tests for User Story 6

- [ ] T071 [P] [US6] E2E test for order confirmation in `tests/e2e/order-list.spec.ts` - verify confirm modal, two options (require payment / direct complete), status update
- [ ] T072 [P] [US6] E2E test for order cancellation in `tests/e2e/order-list.spec.ts` - verify cancel modal, reason input, status update
- [ ] T073 [P] [US6] Component test for order action buttons in `frontend/src/features/orders/components/__tests__/OrderActionButtons.test.tsx` - verify conditional rendering based on status
- [ ] T074 [P] [US6] Hook test for useOrderActions in `frontend/src/features/orders/hooks/__tests__/useOrderActions.test.ts` - verify mutation logic and cache invalidation

### Implementation for User Story 6

- [ ] T075 [P] [US6] Create API service functions in `frontend/src/features/orders/services/orderActionService.ts`: confirmReservation, cancelReservation (reuses U001 endpoints)
- [ ] T076 [P] [US6] Create TanStack Mutation hooks in `frontend/src/features/orders/hooks/useOrderActions.ts`: useConfirmOrder, useCancelOrder with cache invalidation
- [ ] T077 [US6] Create ConfirmOrderModal component in `frontend/src/features/orders/components/ConfirmOrderModal.tsx` with Ant Design Modal
- [ ] T078 [US6] Add confirm options (requiresPayment radio buttons: "要求客户支付" / "直接完成") in ConfirmOrderModal
- [ ] T079 [US6] Create CancelOrderModal component in `frontend/src/features/orders/components/CancelOrderModal.tsx` with Ant Design Modal
- [ ] T080 [US6] Add cancel reason form (reason type select, reason textarea) in CancelOrderModal using React Hook Form + Zod validation
- [ ] T081 [US6] Create OrderActionButtons component in `frontend/src/features/orders/components/OrderActionButtons.tsx` - conditionally renders Confirm/Cancel buttons based on order status
- [ ] T082 [US6] Add quick action buttons ("确认" / "取消" icon buttons) in OrderList table action column for PENDING orders
- [ ] T083 [US6] Add action buttons in OrderDetailDrawer footer (Confirm/Cancel/Close based on order status)
- [ ] T084 [US6] Implement confirm action handler: open modal → submit → invalidate queries → show success message → close modal/drawer
- [ ] T085 [US6] Implement cancel action handler: open modal → validate reason → submit → invalidate queries → show success message → close modal/drawer
- [ ] T086 [US6] Add optimistic error handling for concurrent status changes ("订单状态已变更,请刷新页面")
- [ ] T087 [US6] Add network error handling ("操作失败,请重试") with retry capability
- [ ] T088 [US6] Update MSW handlers for `POST /api/admin/reservations/:id/confirm` and `POST /api/admin/reservations/:id/cancel` in `frontend/src/mocks/handlers/orderHandlers.ts`

**Checkpoint**: All P1 user stories (1, 2, 5, 6) should now be fully functional - MVP complete!

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, code quality, and final touches

- [ ] T089 [P] Add `@spec U004-order-list-view` attribution comments to all new code files
- [ ] T090 [P] Run ESLint and fix all linting errors in `frontend/src/features/orders/`
- [ ] T091 [P] Run Prettier to format all code files
- [ ] T092 [P] Add TypeScript strict mode checks and fix any type errors
- [ ] T093 Add keyboard navigation support for order list table (arrow keys, enter to open detail)
- [ ] T094 Add accessibility attributes (aria-labels) to all interactive elements
- [ ] T095 Test color contrast for status tags (WCAG 2.1 AA compliance)
- [ ] T096 [P] Add database indexes as documented in data-model.md (create migration script in `backend/src/main/resources/db/migration/`)
- [ ] T097 Performance testing: Verify order list loads < 2s with 100 mock orders
- [ ] T098 Performance testing: Verify status filter responds < 1s
- [ ] T099 Performance testing: Verify phone search responds < 3s with debouncing
- [ ] T100 Run full E2E test suite with Playwright (all user stories)
- [ ] T101 Run unit test coverage report (aim for 100% on critical paths)
- [ ] T102 Manual testing: Test with real backend (disable MSW, use U001 APIs)
- [ ] T103 Manual testing: Test concurrent operations (multiple browser tabs)
- [ ] T104 Update README.md or quickstart.md with final setup instructions
- [ ] T105 Create demo video or screenshots for documentation
- [ ] T106 Code review: Verify all components follow Atomic Design principles
- [ ] T107 Code review: Verify no duplicate code between U004 and U001
- [ ] T108 Final validation: Run through all acceptance scenarios from spec.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order: US1 → US2 → US5 → US6 → US3 → US4
  - **MVP = US1 + US2 + US5 + US6** (all P1 stories)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories ✅
- **User Story 2 (P1)**: Depends on US1 (reuses OrderList component, adds FilterBar)
- **User Story 3 (P2)**: Depends on US2 (extends FilterBar with time range filter)
- **User Story 4 (P2)**: Depends on US1 (adds SearchBar to OrderListPage) - Can run parallel with US2/US3
- **User Story 5 (P1)**: Depends on US1 (adds detail drawer triggered from OrderList) - Can run parallel with US2/US3/US4
- **User Story 6 (P1)**: Depends on US1 + US5 (adds action buttons to OrderList and OrderDetailDrawer)

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD requirement)
- Components before integration
- Story complete before moving to next priority

### Parallel Opportunities

- **Setup (Phase 1)**: T002, T003, T004, T005 can run in parallel
- **Foundational (Phase 2)**: T007, T008, T009, T010 can run in parallel
- **Within each story**: Tests can run in parallel, multiple components can run in parallel if in different files
- **Across stories**: US4 can run parallel with US2/US3 after US1 completes; US5 can run parallel with US2/US3/US4 after US1 completes

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (TDD - write these FIRST):
Task T012: "E2E test for order list page load in tests/e2e/order-list.spec.ts"
Task T013: "E2E test for pagination in tests/e2e/order-list.spec.ts"
Task T014: "Component test for OrderList in frontend/src/features/orders/components/__tests__/OrderList.test.tsx"
Task T015: "Hook test for useOrders in frontend/src/features/orders/hooks/__tests__/useOrders.test.ts"

# Launch all foundational implementations for User Story 1 together:
Task T016: "Create useOrders hook in frontend/src/features/orders/hooks/useOrders.ts"
Task T017: "Create orderService.ts in frontend/src/features/orders/services/orderService.ts"
```

---

## Parallel Example: User Story 6

```bash
# Launch all tests for User Story 6 together:
Task T071: "E2E test for order confirmation in tests/e2e/order-list.spec.ts"
Task T072: "E2E test for order cancellation in tests/e2e/order-list.spec.ts"
Task T073: "Component test for OrderActionButtons in frontend/src/features/orders/components/__tests__/OrderActionButtons.test.tsx"
Task T074: "Hook test for useOrderActions in frontend/src/features/orders/hooks/__tests__/useOrderActions.test.ts"

# Launch all modal components in parallel:
Task T077: "Create ConfirmOrderModal in frontend/src/features/orders/components/ConfirmOrderModal.tsx"
Task T079: "Create CancelOrderModal in frontend/src/features/orders/components/CancelOrderModal.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 5, 6 - All P1)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T011) - **CRITICAL - blocks all stories**
3. Complete Phase 3: User Story 1 (T012-T023) - **Foundation: Order List**
4. **STOP and VALIDATE**: Test US1 independently ✅
5. Complete Phase 4: User Story 2 (T024-T033) - **Add: Status Filtering**
6. **STOP and VALIDATE**: Test US1+US2 together ✅
7. Complete Phase 7: User Story 5 (T056-T070) - **Add: Order Detail View**
8. **STOP and VALIDATE**: Test US1+US2+US5 together ✅
9. Complete Phase 8: User Story 6 (T071-T088) - **Add: Status Change Operations**
10. **STOP and VALIDATE**: Test all P1 stories (US1+US2+US5+US6) ✅ **MVP COMPLETE!**
11. Deploy/demo MVP

### Incremental Delivery (Add P2 Features After MVP)

1. Complete MVP (Phase 1-4, 7-8)
2. Add Phase 5: User Story 3 (T034-T043) - **Add: Time Range Filter**
3. **STOP and VALIDATE**: Test US3 independently ✅
4. Add Phase 6: User Story 4 (T044-T055) - **Add: Phone Search**
5. **STOP and VALIDATE**: Test US4 independently ✅
6. Complete Phase 9: Polish (T089-T108)
7. Deploy full feature

### Parallel Team Strategy

With multiple developers after Foundational phase (Phase 2) completes:

- **Developer A**: Phase 3 (US1) → Wait for US1 → Phase 4 (US2)
- **Developer B**: Wait for US1 → Phase 7 (US5) in parallel with Developer A's US2
- **Developer C**: Wait for US1 → Phase 6 (US4) in parallel with A and B
- **After US1+US2+US5 complete**: Developer A tackles Phase 8 (US6)
- **After US1+US2 complete**: Developer D can tackle Phase 5 (US3) in parallel

---

## Notes

- **[P] tasks** = different files, no dependencies, can run in parallel
- **[Story] label** maps task to specific user story for traceability
- **Each user story** should be independently completable and testable
- **TDD Requirement**: Write tests FIRST, verify they FAIL, then implement
- **Code Attribution**: All files must include `@spec U004-order-list-view` comment
- **Zero Backend Changes**: All APIs reused from U001, no backend implementation tasks needed
- **Type Reuse**: Maximize reuse of U001 types via re-exports, avoid duplication
- **Component Isolation**: Follow Atomic Design (atoms → molecules → organisms → pages)
- **Commit Strategy**: Commit after each task or logical group
- **Stop at checkpoints** to validate story independently before proceeding

---

## Task Summary

| Phase | Task Range | Count | Can Parallelize |
|-------|-----------|-------|-----------------|
| Phase 1: Setup | T001-T005 | 5 | 4 tasks (80%) |
| Phase 2: Foundational | T006-T011 | 6 | 5 tasks (83%) |
| Phase 3: US1 (P1) | T012-T023 | 12 | 5 tasks (42%) |
| Phase 4: US2 (P1) | T024-T033 | 10 | 3 tasks (30%) |
| Phase 5: US3 (P2) | T034-T043 | 10 | 2 tasks (20%) |
| Phase 6: US4 (P2) | T044-T055 | 12 | 4 tasks (33%) |
| Phase 7: US5 (P1) | T056-T070 | 15 | 3 tasks (20%) |
| Phase 8: US6 (P1) | T071-T088 | 18 | 4 tasks (22%) |
| Phase 9: Polish | T089-T108 | 20 | 5 tasks (25%) |
| **TOTAL** | T001-T108 | **108 tasks** | **35 parallel (32%)** |

**MVP Scope** (P1 stories only):
- Phase 1 (Setup): 5 tasks
- Phase 2 (Foundational): 6 tasks
- Phase 3 (US1): 12 tasks
- Phase 4 (US2): 10 tasks
- Phase 7 (US5): 15 tasks
- Phase 8 (US6): 18 tasks
- **MVP Total**: 66 tasks (61% of full feature)

**Estimated Effort**:
- MVP (66 tasks): ~2-3 weeks with TDD approach
- Full Feature (108 tasks): ~3-4 weeks with TDD approach
- With 2-3 developers in parallel: ~1.5-2 weeks for MVP

**Independent Test Criteria Met**:
- ✅ US1: Navigate to `/orders/list`, verify table loads with pagination
- ✅ US2: Click status tabs, verify filtering and color-coded tags
- ✅ US3: Select time range, verify date filtering
- ✅ US4: Type phone number, verify debounced search
- ✅ US5: Click "查看详情", verify drawer opens with complete info
- ✅ US6: Click "确认订单" or "取消订单", verify status updates and list refreshes

**Format Validation**: ✅ All 108 tasks follow strict checklist format (checkbox, ID, labels, file paths)
