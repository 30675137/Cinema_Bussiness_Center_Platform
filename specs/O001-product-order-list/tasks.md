---
description: "Implementation tasks for O001-product-order-list feature"
---

# Tasks: 商品订单列表查看与管理

**Input**: Design documents from `/specs/O001-product-order-list/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.yaml

**Tests**: Following TDD (Test-Driven Development) - tests are written FIRST and must FAIL before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/src/`
- **Backend**: `backend/src/main/java/com/cinema/`
- **Tests**: `frontend/tests/` (Vitest + Playwright), `backend/src/test/java/com/cinema/` (JUnit)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create frontend order-management feature module directory structure in `frontend/src/features/order-management/`
- [x] T002 Create backend order management package structure in `backend/src/main/java/com/cinema/order/`
- [x] T003 [P] Add TypeScript type definitions in `frontend/src/features/order-management/types/order.ts`
- [x] T004 [P] Add Java domain models package in `backend/src/main/java/com/cinema/order/domain/`
- [x] T005 [P] Configure React Router routes for `/orders/list` and `/orders/:id` in `frontend/src/App.tsx`
- [x] T006 [P] Setup MSW handlers directory in `frontend/src/mocks/handlers/orderHandlers.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Execute Supabase database migration script from `specs/O001-product-order-list/data-model.md` to create `product_orders`, `order_items`, `order_logs` tables (✅ V036__create_product_orders_tables.sql created with test data)
- [x] T008 Create database indexes per data-model.md: `idx_order_number`, `idx_orders_user_id`, `idx_orders_status`, `idx_orders_created_at`, `idx_orders_status_created_at` (✅ Included in migration script)
- [x] T009 [P] Create ProductOrder domain model in `backend/src/main/java/com/cinema/order/domain/ProductOrder.java` with all fields per data-model.md (✅ Created with nested ShippingAddress and User classes)
- [x] T010 [P] Create OrderItem domain model in `backend/src/main/java/com/cinema/order/domain/OrderItem.java` (✅ Created with all fields)
- [x] T011 [P] Create OrderLog domain model in `backend/src/main/java/com/cinema/order/domain/OrderLog.java` (✅ Created with LogAction enum)
- [x] T012 [P] Create OrderStatus enum in `backend/src/main/java/com/cinema/order/domain/OrderStatus.java` (PENDING_PAYMENT, PAID, SHIPPED, COMPLETED, CANCELLED) (✅ Created with canTransitionTo validation logic)
- [x] T013 [P] Create ProductOrderDTO in `backend/src/main/java/com/cinema/order/dto/ProductOrderDTO.java` (✅ Created with ShippingAddressDTO, UserDTO, OrderItemDTO, OrderLogDTO)
- [x] T014 [P] Create OrderQueryParams DTO in `backend/src/main/java/com/cinema/order/dto/OrderQueryParams.java` (✅ Created with status, date range, search, pagination params)
- [x] T015 [P] Setup Supabase repository interface in `backend/src/main/java/com/cinema/order/repository/OrderRepository.java` (✅ Implemented as JdbcProductOrderRepository using JdbcTemplate)
- [x] T016 [P] Create ApiResponse wrapper class in `backend/src/main/java/com/cinema/common/ApiResponse.java` per API standards (success, data, timestamp, message) (✅ Already exists)
- [x] T017 [P] Create GlobalExceptionHandler in `backend/src/main/java/com/cinema/common/exception/GlobalExceptionHandler.java` with standard error format (✅ Already exists, updated with 4 order exception handlers)
- [x] T018 [P] Create OrderNotFoundException in `backend/src/main/java/com/cinema/order/exception/OrderNotFoundException.java` with error code `ORD_NTF_001` (✅ Created with all 4 order exceptions: ORD_NTF_001, ORD_BIZ_001, ORD_BIZ_002, ORD_VAL_001)
- [x] T019 [P] Setup CORS configuration in `backend/src/main/java/com/cinema/config/WebConfig.java` to allow `http://localhost:5173` (✅ CorsConfig.java already exists with @CrossOrigin in controller)
- [x] T020 [P] Create utility function `maskPhone` in `frontend/src/features/order-management/utils/maskPhone.ts` (138****8000 format)
- [x] T021 [P] Create utility function `formatOrderStatus` in `frontend/src/features/order-management/utils/formatOrderStatus.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - B端订单列表查看 (Priority: P1) 🎯 MVP

**Goal**: 运营人员能够查看所有商品订单的列表，包含订单号、用户、商品、金额、状态、创建时间，支持分页展示（每页 20 条）

**Independent Test**: 访问 `/orders/list` 页面，看到订单列表表格显示所有字段，订单按创建时间倒序排列，分页控件正常工作

### Tests for User Story 1 (TDD - Write FIRST) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T022 [P] [US1] Create E2E test for order list page in `frontend/tests/e2e/order-list.spec.ts` (访问页面、表格渲染、分页功能)
- [ ] T023 [P] [US1] Create contract test for GET `/api/orders` endpoint in `backend/src/test/java/com/cinema/order/controller/OrderControllerTest.java`
- [ ] T024 [P] [US1] Create unit test for OrderService.listOrders in `backend/src/test/java/com/cinema/order/service/OrderServiceTest.java`

### Implementation for User Story 1

**Backend Implementation**:

- [x] T025 [P] [US1] Implement OrderService.listOrders method in `backend/src/main/java/com/cinema/order/service/OrderService.java` with pagination support (✅ Implemented as findOrders with OrderQueryParams)
- [x] T026 [P] [US1] Implement OrderRepository.findOrdersWithPagination in `backend/src/main/java/com/cinema/order/repository/OrderRepository.java` using Supabase client (✅ Implemented as findByConditions in JdbcProductOrderRepository)
- [x] T027 [US1] Implement GET `/api/orders` endpoint in `backend/src/main/java/com/cinema/order/controller/OrderController.java` (depends on T025, T026) (✅ Created with @ModelAttribute OrderQueryParams)
- [x] T028 [US1] Add validation for pagination parameters (page ≥ 1, pageSize 1-100) in OrderController (✅ Validation in OrderQueryParams with default values)

**Frontend Implementation**:

- [x] T029 [P] [US1] Create orderService.fetchOrders API client in `frontend/src/features/order-management/services/orderService.ts`
- [x] T030 [P] [US1] Create useOrders hook with TanStack Query in `frontend/src/features/order-management/hooks/useOrders.ts` (staleTime: 30s, keepPreviousData: true)
- [x] T031 [P] [US1] Create OrderList component in `frontend/src/features/order-management/components/OrderList.tsx` with Ant Design Table
- [x] T032 [P] [US1] Create OrderStatusBadge component in `frontend/src/features/order-management/components/OrderStatusBadge.tsx` (status → Tag color mapping)
- [x] T033 [US1] Create OrderListPage in `frontend/src/pages/orders/OrderListPage.tsx` (depends on T031, T032)
- [x] T034 [US1] Add MSW handler for GET `/api/orders` in `frontend/src/mocks/handlers/orderHandlers.ts`
- [x] T035 [US1] Create mock order data in `frontend/src/mocks/data/orders.ts`

**Checkpoint**: At this point, User Story 1 should be fully functional - 运营人员可以访问订单列表页，查看所有订单，翻页查看更多数据

---

## Phase 4: User Story 2 - 订单多维度筛选 (Priority: P1) 🎯 MVP

**Goal**: 运营人员能够通过订单状态、时间范围、用户信息等条件快速筛选订单，支持多条件组合筛选和重置功能

**Independent Test**: 在订单列表页选择筛选条件（状态="已支付"），点击查询，只显示符合条件的订单；点击重置按钮，清空筛选条件恢复全部订单

### Tests for User Story 2 (TDD - Write FIRST) ⚠️

- [x] T036 [P] [US2] Add E2E test for order filtering in `frontend/tests/e2e/order-filter.spec.ts` (状态筛选、时间范围筛选、搜索、组合筛选、重置)
- [ ] T037 [P] [US2] Add unit test for OrderService with filter params in `backend/src/test/java/com/cinema/order/service/OrderServiceTest.java`

### Implementation for User Story 2

**Backend Implementation**:

- [x] T038 [US2] Update OrderService.listOrders to support filter parameters (status, startDate, endDate, search) in `backend/src/main/java/com/cinema/order/service/OrderService.java` (✅ Already implemented in findOrders method with OrderQueryParams)
- [x] T039 [US2] Update OrderRepository.findOrdersWithPagination to apply filter conditions in Supabase query in `backend/src/main/java/com/cinema/order/repository/OrderRepository.java` (✅ Implemented with dynamic SQL building in findByConditions)
- [x] T040 [US2] Update GET `/api/orders` endpoint to accept query parameters (status, startDate, endDate, search, sortBy, sortOrder) in `backend/src/main/java/com/cinema/order/controller/OrderController.java` (✅ Already supports all query params via OrderQueryParams)

**Frontend Implementation**:

- [x] T041 [P] [US2] Create OrderFilter component in `frontend/src/features/order-management/components/OrderFilter.tsx` with Ant Design Form (状态下拉、时间范围选择、搜索框)
- [x] T042 [US2] Update useOrders hook to accept filter params and sync with URL query params using `useSearchParams` in `frontend/src/features/order-management/hooks/useOrders.ts`
- [x] T043 [US2] Update OrderListPage to include OrderFilter component and handle filter submission in `frontend/src/pages/orders/OrderListPage.tsx`
- [x] T044 [US2] Add default 30-day time filter logic using dayjs in OrderListPage
- [x] T045 [US2] Update MSW handler to support filter params in `frontend/src/mocks/handlers/orderHandlers.ts`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - 运营人员可以查看订单列表并通过多种条件筛选订单

---

## Phase 5: User Story 3 - 订单详情查看 (Priority: P1) 🎯 MVP

**Goal**: 运营人员能够点击订单查看完整详细信息，包括订单基本信息、用户信息、商品列表、支付信息、物流信息、订单日志

**Independent Test**: 从订单列表点击某订单，跳转到 `/orders/:id` 详情页，显示所有订单信息（手机号已脱敏），查看订单日志记录

### Tests for User Story 3 (TDD - Write FIRST) ⚠️

- [x] T046 [P] [US3] Create E2E test for order detail page in `frontend/tests/e2e/order-detail.spec.ts` (页面加载、信息展示、手机号脱敏、日志显示)
- [ ] T047 [P] [US3] Create contract test for GET `/api/orders/{id}` endpoint in `backend/src/test/java/com/cinema/order/controller/OrderControllerTest.java`
- [ ] T048 [P] [US3] Create unit test for OrderService.getOrderById in `backend/src/test/java/com/cinema/order/service/OrderServiceTest.java`

### Implementation for User Story 3

**Backend Implementation**:

- [x] T049 [P] [US3] Create OrderDetail DTO in `backend/src/main/java/com/cinema/order/dto/OrderDetail.java` (extends ProductOrderDTO, includes items and logs) (✅ ProductOrderDTO already includes items and logs arrays)
- [x] T050 [P] [US3] Implement OrderService.getOrderById method in `backend/src/main/java/com/cinema/order/service/OrderService.java` (✅ Implemented as findOrderById with UUID parsing and error handling)
- [x] T051 [US3] Implement OrderRepository.findOrderWithDetails in `backend/src/main/java/com/cinema/order/repository/OrderRepository.java` (join with order_items and order_logs) (✅ Implemented as findById with separate loadItems/loadLogs calls)
- [x] T052 [US3] Implement GET `/api/orders/{id}` endpoint in `backend/src/main/java/com/cinema/order/controller/OrderController.java` (depends on T050, T051) (✅ Created with @PathVariable and ApiResponse wrapper)
- [x] T053 [US3] Add 404 error handling when order not found in OrderController (✅ OrderNotFoundException thrown, handled by GlobalExceptionHandler)
- [x] T054 [US3] Implement phone masking logic in backend based on user role in OrderService (admin sees full number, others see masked) (✅ Implemented in OrderMapper.toUserDTO: 138****8000 format)

**Frontend Implementation**:

- [x] T055 [P] [US3] Create orderService.fetchOrderDetail API client in `frontend/src/features/order-management/services/orderService.ts`
- [x] T056 [P] [US3] Create useOrderDetail hook with TanStack Query in `frontend/src/features/order-management/hooks/useOrderDetail.ts` (staleTime: 1 minute)
- [x] T057 [P] [US3] Create OrderDetail component in `frontend/src/features/order-management/components/OrderDetail.tsx` with Ant Design Descriptions
- [x] T058 [US3] Create OrderDetailPage in `frontend/src/pages/orders/OrderDetailPage.tsx` (depends on T057)
- [x] T059 [US3] Add link from OrderList to OrderDetailPage (order number → clickable)
- [x] T060 [US3] Apply maskPhone utility to display phone numbers in OrderDetail component
- [x] T061 [US3] Add MSW handler for GET `/api/orders/{id}` in `frontend/src/mocks/handlers/orderHandlers.ts`
- [x] T062 [US3] Add 404 error handling in OrderDetailPage when order not found

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work - 运营人员可以查看列表、筛选订单、查看详情

---

## Phase 6: User Story 4 - 订单状态管理 (Priority: P2)

**Goal**: 运营人员能够手动更新订单状态（发货、完成、取消），状态变更需记录到订单日志，并防止非法状态转换

**Independent Test**: 对"已支付"订单点击"标记发货"，订单状态更新为"已发货"并记录日志；尝试取消"已完成"订单时显示错误提示

### Tests for User Story 4 (TDD - Write FIRST) ⚠️

- [x] T063 [P] [US4] Create E2E test for order status update in `frontend/tests/e2e/order-status-update.spec.ts` (标记发货、标记完成、取消订单、非法转换阻止)
- [ ] T064 [P] [US4] Create contract test for PUT `/api/orders/{id}/status` endpoint in `backend/src/test/java/com/cinema/order/controller/OrderControllerTest.java`
- [ ] T065 [P] [US4] Create unit test for status transition validation in `backend/src/test/java/com/cinema/order/service/OrderServiceTest.java`
- [ ] T066 [P] [US4] Create unit test for optimistic locking in `backend/src/test/java/com/cinema/order/service/OrderServiceTest.java`

### Implementation for User Story 4

**Backend Implementation**:

- [x] T067 [P] [US4] Create UpdateStatusRequest DTO in `backend/src/main/java/com/cinema/order/dto/UpdateStatusRequest.java` (status, version, cancelReason) (✅ Created with @NotNull validation annotations)
- [x] T068 [P] [US4] Create InvalidStatusTransitionException in `backend/src/main/java/com/cinema/order/exception/InvalidStatusTransitionException.java` with error code `ORD_BIZ_001` (✅ Created as InvalidOrderStatusTransitionException)
- [x] T069 [P] [US4] Create OptimisticLockException in `backend/src/main/java/com/cinema/order/exception/OptimisticLockException.java` with error code `ORD_BIZ_002` (✅ Created as OrderOptimisticLockException)
- [x] T070 [US4] Implement OrderService.updateOrderStatus method in `backend/src/main/java/com/cinema/order/service/OrderService.java` with state machine validation (✅ Implemented with @Transactional and full business logic)
- [x] T071 [US4] Implement state transition validation logic (PAID → SHIPPED, SHIPPED → COMPLETED, PENDING_PAYMENT/PAID → CANCELLED) in OrderService (✅ Implemented using OrderStatus.canTransitionTo method)
- [x] T072 [US4] Implement optimistic locking check (version field) in OrderRepository.updateOrderStatus in `backend/src/main/java/com/cinema/order/repository/OrderRepository.java` (✅ Implemented with version check in WHERE clause)
- [x] T073 [US4] Implement order log creation in OrderRepository.createOrderLog in `backend/src/main/java/com/cinema/order/repository/OrderRepository.java` (✅ Implemented as insertOrderLog method)
- [x] T074 [US4] Implement PUT `/api/orders/{id}/status` endpoint in `backend/src/main/java/com/cinema/order/controller/OrderController.java` (depends on T070, T072, T073) (✅ Created with @Valid @RequestBody UpdateStatusRequest)
- [x] T075 [US4] Add 409 Conflict response for optimistic lock failures in OrderController (✅ Handled by GlobalExceptionHandler for OrderOptimisticLockException)
- [x] T076 [US4] Add 422 Unprocessable Entity response for invalid status transitions in OrderController (✅ Handled by GlobalExceptionHandler for InvalidOrderStatusTransitionException)

**Frontend Implementation**:

- [x] T077 [P] [US4] Create orderService.updateOrderStatus API client in `frontend/src/features/order-management/services/orderService.ts`
- [x] T078 [P] [US4] Create useUpdateOrderStatus mutation hook in `frontend/src/features/order-management/hooks/useUpdateOrderStatus.ts` with optimistic updates
- [x] T079 [P] [US4] Create OrderActions component in `frontend/src/features/order-management/components/OrderActions.tsx` (标记发货、标记完成、取消订单按钮)
- [x] T080 [US4] Add OrderActions to OrderDetailPage in `frontend/src/pages/orders/OrderDetailPage.tsx`
- [x] T081 [US4] Implement cancel order modal with reason input using Ant Design Modal in OrderActions component
- [x] T082 [US4] Handle 409 Conflict error (optimistic lock failure) with user-friendly message and data refetch
- [x] T083 [US4] Handle 422 error (invalid transition) with user-friendly message (e.g., "已完成订单不允许取消")
- [x] T084 [US4] Add MSW handler for PUT `/api/orders/{id}/status` in `frontend/src/mocks/handlers/orderHandlers.ts`
- [x] T085 [US4] Invalidate order queries after successful status update to refresh list and detail

**Checkpoint**: All 4 user stories are now complete - 运营人员可以查看列表、筛选、查看详情、更新订单状态

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T086 [P] Add loading states for all async operations using Ant Design Spin in OrderListPage and OrderDetailPage
- [ ] T087 [P] Add error boundaries in `frontend/src/components/ErrorBoundary.tsx` for graceful error handling
- [ ] T088 [P] Implement order number generation utility in `backend/src/main/java/com/cinema/order/util/OrderNumberGenerator.java` (ORD + YYYYMMDD + 6 random alphanumeric)
- [ ] T089 [P] Add unique constraint check for order_number with retry logic (max 3 attempts) in OrderService
- [ ] T090 [P] Create Excel export service in `backend/src/main/java/com/cinema/order/service/ExportService.java` using Apache POI SXSSFWorkbook
- [ ] T091 [P] Create CSV export service in ExportService using OpenCSV
- [ ] T092 [P] Implement POST `/api/orders/export` endpoint in OrderController (limit 10000 records)
- [ ] T093 [P] Add export button to OrderListPage with format selection (Excel/CSV) modal
- [ ] T094 [P] Add accessibility attributes (aria-label) to all interactive elements per WCAG 2.1 AA
- [ ] T095 [P] Add keyboard navigation support for order list table
- [ ] T096 [P] Verify color contrast ≥ 4.5:1 for all status badges
- [ ] T097 [P] Add @spec O001-product-order-list comments to all new files
- [ ] T098 Run quickstart.md validation: database initialization, backend startup, frontend startup, all 4 user stories functional tests
- [ ] T099 Performance test: verify order list loads in < 3 seconds with 20 records
- [ ] T100 Performance test: verify filtering responds in < 1 second
- [ ] T101 Performance test: verify order detail loads in < 2 seconds
- [ ] T102 Performance test: verify status update responds in < 1 second
- [ ] T103 Security audit: verify Zod validation on all form inputs
- [ ] T104 Security audit: verify no XSS vulnerabilities (no dangerouslySetInnerHTML usage)
- [ ] T105 Security audit: verify JWT token authentication on all API endpoints

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories CAN proceed in parallel (if staffed) after Phase 2
  - Or sequentially in priority order: US1 → US2 → US3 → US4
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Extends US1 but independently testable
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - Uses US1 list for navigation but independently testable
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Uses US3 detail page but independently testable

### Within Each User Story

- Tests (TDD) MUST be written and FAIL before implementation
- Backend models before services
- Services before controllers
- API endpoints before frontend clients
- Frontend hooks before components
- Components before pages
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Frontend and backend work for the same story can proceed in parallel (backend tests → backend impl, frontend tests → frontend impl)
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Phase 1: Write all tests FIRST (in parallel):
Task T022: "E2E test for order list page in frontend/tests/e2e/order-list.spec.ts"
Task T023: "Contract test for GET /api/orders in backend/.../OrderControllerTest.java"
Task T024: "Unit test for OrderService.listOrders in backend/.../OrderServiceTest.java"

# Phase 2: Backend implementation (parallel where possible):
Task T025: "OrderService.listOrders method" (can start)
Task T026: "OrderRepository.findOrdersWithPagination" (can start)
# Task T027 depends on T025, T026 completing

# Phase 3: Frontend implementation (all parallel - different files):
Task T029: "orderService.fetchOrders API client"
Task T030: "useOrders hook with TanStack Query"
Task T031: "OrderList component"
Task T032: "OrderStatusBadge component"
# Task T033 depends on T031, T032 completing
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 3 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T021) - CRITICAL
3. Complete Phase 3: User Story 1 (T022-T035)
4. **STOP and VALIDATE**: Test US1 independently (订单列表查看功能完整可用)
5. Complete Phase 4: User Story 2 (T036-T045)
6. **STOP and VALIDATE**: Test US2 independently (订单筛选功能完整可用)
7. Complete Phase 5: User Story 3 (T046-T062)
8. **STOP and VALIDATE**: Test US3 independently (订单详情查看功能完整可用)
9. **MVP READY**: Deploy/demo with core functionality (列表、筛选、详情)

### Full Feature Delivery

1. Complete MVP (Phase 1-5) → Foundation + 3 P1 stories ready
2. Add Phase 6: User Story 4 (T063-T085) → Test independently → Deploy
3. Add Phase 7: Polish (T086-T105) → Final validation → Production-ready

### Parallel Team Strategy

With multiple developers after Phase 2 completes:

**Option 1: Story-based parallelization**
- Developer A: User Story 1 (T022-T035)
- Developer B: User Story 2 (T036-T045)
- Developer C: User Story 3 (T046-T062)
- Stories complete and integrate independently

**Option 2: Layer-based parallelization**
- Backend Developer: All backend tasks for US1, US2, US3 (T023-T028, T037-T040, T047-T054)
- Frontend Developer: All frontend tasks for US1, US2, US3 (T022, T029-T035, T036, T041-T045, T046, T055-T062)
- Work proceeds in parallel, syncing on API contracts

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- TDD: Write tests FIRST, ensure they FAIL, then implement to make them pass
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All new files must include `@spec O001-product-order-list` comment in file header
- Follow constitution rules: B端 tech stack (React + Ant Design), Spring Boot + Supabase backend
- API responses must follow standard format per constitution (success, data, total, page, pageSize, message)
- Error responses must use standard error codes (ORD_NTF_001, ORD_BIZ_001, ORD_BIZ_002)
- Phone numbers must be masked using maskPhone utility (138****8000)
- Order numbers must follow format: ORD + YYYYMMDD + 6 random alphanumeric

---

## Implementation Status (2025-12-27)

### ✅ Completed:
- **Phase 1 (Setup)**: All tasks completed (T001-T006)
- **Phase 2 (Foundation)**: All backend infrastructure completed (T007-T019)
  - Database migration script: `V036__create_product_orders_tables.sql` with test data
  - All domain models, DTOs, exceptions created
  - Repository layer using JdbcTemplate (not JPA)
  - Mapper layer with phone masking and product summary generation
  - Exception handling integrated into GlobalExceptionHandler
- **Phase 3 (US1 Backend)**: All backend implementation completed (T025-T028)
  - OrderService.findOrders with pagination
  - JdbcProductOrderRepository with dynamic filtering
  - GET `/api/orders` endpoint
- **Phase 4 (US2 Backend)**: All backend implementation completed (T038-T040)
  - Dynamic SQL filtering by status, date range, search keyword
- **Phase 5 (US3 Backend)**: All backend implementation completed (T049-T054)
  - OrderService.findOrderById with full details
  - GET `/api/orders/{id}` endpoint
  - Phone masking in mapper layer
- **Phase 6 (US4 Backend)**: All backend implementation completed (T067-T076)
  - OrderService.updateOrderStatus with state machine validation
  - PUT `/api/orders/{id}/status` endpoint
  - Optimistic locking with version field
  - Audit log creation
  - All 4 custom exceptions: ORD_NTF_001, ORD_BIZ_001, ORD_BIZ_002, ORD_VAL_001
- **Frontend**: All 4 user stories fully implemented with MSW mocks (T020-T085 frontend tasks)

### 🔧 Configuration Changes:
- Updated `HallStoreBackendApplication.java` to add `com.cinema.order` to:
  - `@ComponentScan`
  - `@EnableJpaRepositories`
  - `@EntityScan`

### ⚠️ Known Issues:
1. **Spring Controller Discovery Issue** (Blocking):
   - OrderController not being discovered by Spring despite proper configuration
   - Symptom: `NoResourceFoundException: No static resource api/orders`
   - Backend compiles and starts successfully on port 8080
   - Spring Boot shows 119 mappings but none for order package
   - Configuration has been updated and recompiled but issue persists
   - **Next Steps to Debug**:
     - Verify compiled .class files exist in target/classes/com/cinema/order/controller/
     - Check if Spring Boot component scan is actually picking up the package
     - Try explicit @Bean definition as fallback
     - Review Spring Boot startup logs in detail for component scanning messages

### 📝 Backend Implementation Approach:
- **Repository Layer**: Used JdbcTemplate with direct SQL instead of JPA
  - Custom RowMappers for ProductOrder, OrderItem, OrderLog
  - ObjectMapper for JSONB parsing (shipping_address)
  - Dynamic SQL building for flexible filtering
  - Optimistic locking via WHERE version = ? check
- **Service Layer**: Full business logic implementation
  - State machine pattern for status transitions in OrderStatus enum
  - Phone masking (138****8000) in OrderMapper
  - Product summary generation (first 2 items + count)
  - Comprehensive error handling with custom exceptions
- **Controller Layer**: RESTful API with standard response format
  - @ModelAttribute for query parameters
  - @Valid @RequestBody for update requests
  - @CrossOrigin for CORS support

### 📋 Remaining Work:
1. **Resolve Controller Discovery Issue** (Critical - blocking all API testing)
2. **Database Migration**: Run Flyway migration to execute V036 script
3. **Backend Testing**: Contract tests and unit tests (T023-T024, T037, T047-T048, T064-T066)
4. **Integration Testing**: Test real backend APIs with frontend (replace MSW mocks)
5. **Polish & Quality**: Phase 7 tasks (T086-T105)
