# Implementation Plan: 订单列表与状态查看 (Order List & Status View)

**Branch**: `U004-order-list-view` | **Date**: 2025-12-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/U004-order-list-view/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Develop a comprehensive order list and status view feature for cinema operations staff in the backend management platform. The feature extends existing U001-reservation-order-management by providing list view, advanced filtering (by status, time range, phone number), detailed order information display, and integrated order status management operations (confirm/cancel). Primary technical approach leverages React 19.2.0 + Ant Design 6.1.0 for B端 UI, Zustand for client state, TanStack Query for server data management, and integrates with existing Spring Boot backend + Supabase database infrastructure.

## Technical Context

**Language/Version**:
- B端（管理后台）: TypeScript 5.9.3 + React 19.2.0 (frontend), Java 21 + Spring Boot 3.x (backend)
- This feature is **B端 only** - no C端 (Taro) implementation required

**Primary Dependencies**:
- Frontend: Ant Design 6.1.0, Zustand 5.0.9, TanStack Query 5.90.12, React Router 7.10.1, React Hook Form 7.68.0, Zod 4.1.13, dayjs 1.11.19
- Backend: Spring Boot Web, Supabase Java/HTTP client (reusing existing U001 APIs)
- Mock/Testing: MSW 2.12.4 (for development), Vitest (unit tests), Playwright (e2e tests)

**Storage**:
- Supabase PostgreSQL as primary data source
- Reuses existing `reservation_orders` table from U001-reservation-order-management
- Frontend uses TanStack Query for server state caching
- Local filters/search state managed by Zustand

**Testing**:
- Unit tests: Vitest + Testing Library for components and hooks
- E2E tests: Playwright for critical user flows (list view, filtering, status change)
- Integration tests: MSW handlers for API mocking during development
- Target coverage: 100% for critical business flows (status filtering, status change operations)

**Target Platform**:
- B端 Web browser (Chrome, Firefox, Safari, Edge) - desktop only
- Responsive design not required (backend admin interface)
- Spring Boot REST API backend

**Project Type**:
- Full-stack feature within existing B端 management platform
- Extends U001-reservation-order-management with list/filter/search capabilities
- Integrates existing order confirmation/cancellation APIs

**Performance Goals**:
- Order list load time: < 2 seconds (for 100 orders)
- Status filter response: < 1 second
- Phone search response: < 3 seconds
- Order detail drawer open: < 1 second
- Support pagination for 10,000+ orders without performance degradation
- Virtual scrolling if needed for large datasets (optional optimization)

**Constraints**:
- Must comply with Feature Branch Binding (specId U004 alignment with active_spec)
- Must follow Test-Driven Development (tests before implementation)
- Must use Component-Based Architecture (Atomic Design)
- Must use B端 tech stack only (React + Ant Design, no Taro mixing)
- Must integrate with existing U001 APIs (no duplicate order management logic)
- Must use unified API response format from constitution
- Must include `@spec U004-order-list-view` attribution in all code files

**Scale/Scope**:
- B端 admin interface feature module
- 1 main page (`/orders/list` or `/reservation-orders`)
- 4-6 reusable components (OrderList, OrderListItem, OrderDetailDrawer, FilterBar, SearchBar, OrderStatusTag)
- 8-10 API endpoints (reused from U001 + 2-3 new list/filter endpoints)
- Estimated 800-1200 lines of frontend code
- Estimated 200-400 lines of backend code (if new endpoints needed)
- 15-20 test files (unit + e2e)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: ✅ Branch `U004-order-list-view` matches active_spec path `specs/U004-order-list-view`
- [x] **测试驱动开发**: ✅ Plan includes comprehensive testing strategy (Vitest unit tests, Playwright e2e, MSW mocking, 100% coverage for critical flows)
- [x] **组件化架构**: ✅ Component architecture defined (OrderList, OrderListItem, OrderDetailDrawer, FilterBar, SearchBar, OrderStatusTag following Atomic Design)
- [x] **前端技术栈分层**: ✅ B端 only feature using React 19.2.0 + Ant Design 6.1.0 (no Taro mixing)
- [x] **数据驱动状态管理**: ✅ Zustand for client state (filters, UI), TanStack Query for server state (order data, caching)
- [x] **代码质量工程化**: ✅ TypeScript strict mode, ESLint, Prettier, code attribution (`@spec U004-order-list-view`), Git conventional commits
- [x] **后端技术栈约束**: ✅ Reuses existing Spring Boot + Supabase backend from U001 (no new database layer needed)

### 性能与标准检查：
- [x] **性能标准**: ✅ List load < 2s, filter < 1s, pagination for 10k+ orders, virtual scrolling if needed
- [x] **安全标准**: ✅ Zod validation for search inputs, prevents XSS, uses existing auth tokens from U001
- [x] **可访问性标准**: ✅ Ant Design components support WCAG 2.1 AA (keyboard navigation, screen readers, color contrast)

### Post-Phase 1 Design Validation (2025-12-27):

**Architecture Review**:
- ✅ **No new backend APIs**: All endpoints reused from U001, zero backend code changes required
- ✅ **Type reuse strategy**: Maximizes U001 type reuse via re-exports in `contracts/types.ts`, avoids duplication
- ✅ **Database performance**: Recommended indexes documented in `data-model.md` (status, created_at, contact_phone)
- ✅ **Component isolation**: Feature module structure under `frontend/src/features/orders/` follows Atomic Design
- ✅ **State management separation**: Zustand for filters (OrderListFilterState), TanStack Query for server data (caching, invalidation)

**Testing Coverage**:
- ✅ **Unit tests**: Component tests (OrderList, OrderDetailDrawer), hook tests (useOrderFilters, useOrderActions)
- ✅ **E2E tests**: Critical flows (list view, filtering, phone search, status change) via Playwright
- ✅ **Mock data**: MSW handlers defined in `quickstart.md` for development without backend dependency

**Integration Design**:
- ✅ **U001 API contract**: Documented in `contracts/api.yaml` with exact request/response formats
- ✅ **Authentication**: JWT Bearer token pattern reused from U001 (localStorage + Authorization header)
- ✅ **Error handling**: Standard error response format aligned with R8.1 API Standards rule

**Conclusion**: ✅ **All constitution principles satisfied post-Phase 1 design**. Ready to proceed to Phase 2 task generation.

## Project Structure

### Documentation (this feature)

```text
specs/U004-order-list-view/
├── spec.md                     # Feature specification (completed)
├── plan.md                     # This file (implementation plan)
├── research.md                 # Phase 0: Technical research findings
├── data-model.md               # Phase 1: Data model & entity definitions
├── quickstart.md               # Phase 1: Development setup guide
├── contracts/                  # Phase 1: API contracts
│   ├── api.yaml               # OpenAPI specification for endpoints
│   └── types.ts               # Shared TypeScript types
├── checklists/                 # Quality validation
│   └── requirements.md        # Completed requirements checklist
└── tasks.md                    # Phase 2: NOT created by /speckit.plan (created by /speckit.tasks)
```

### Source Code (repository root)

```text
frontend/src/
├── features/
│   └── orders/                             # U004 feature module (NEW)
│       ├── components/                     # Feature components
│       │   ├── OrderList.tsx              # Main list view component
│       │   ├── OrderListItem.tsx          # Individual order row
│       │   ├── OrderDetailDrawer.tsx      # Order detail slide-out
│       │   ├── FilterBar.tsx              # Status/time filter controls
│       │   ├── SearchBar.tsx              # Phone number search
│       │   └── OrderStatusTag.tsx         # Color-coded status display
│       ├── hooks/                         # Custom hooks
│       │   ├── useOrders.ts              # TanStack Query for order list
│       │   ├── useOrderFilters.ts        # Zustand filter state management
│       │   └── useOrderActions.ts        # Integration with U001 confirm/cancel
│       ├── services/                      # API services
│       │   ├── orderService.ts           # Order list/filter API calls
│       │   └── orderActionService.ts     # Reuses U001 confirm/cancel APIs
│       ├── types/                         # TypeScript types
│       │   ├── index.ts                  # Order, OrderStatus, FilterState types
│       │   └── api.ts                    # API request/response types
│       ├── utils/                         # Utility functions
│       │   ├── orderHelpers.ts           # Status formatting, date helpers
│       │   └── validation.ts             # Zod schemas for search inputs
│       └── __tests__/                     # Feature tests
│           ├── OrderList.test.tsx
│           ├── OrderDetailDrawer.test.tsx
│           └── useOrderFilters.test.ts
├── pages/
│   └── OrderListPage.tsx                  # Route-level page component (NEW)
├── stores/
│   └── orderFiltersStore.ts               # Zustand store for filters (NEW)
└── mocks/
    └── handlers/
        └── orderHandlers.ts               # MSW handlers for development (NEW)

backend/src/main/java/com/cinema/
└── reservation/
    ├── controller/
    │   └── ReservationOrderController.java  # EXTEND: Add list/filter endpoints
    ├── service/
    │   └── ReservationOrderService.java     # EXTEND: Add filtering logic
    ├── dto/
    │   ├── OrderListRequest.java            # NEW: Filter/search params
    │   └── OrderListResponse.java           # NEW: Paginated list response
    └── repository/
        └── ReservationOrderRepository.java  # EXTEND: Add filter queries

tests/
└── e2e/
    └── order-list.spec.ts                   # Playwright e2e tests (NEW)
```

**Structure Decision**:
- Frontend uses feature-based modular architecture under `frontend/src/features/orders/`
- Backend extends existing U001 `reservation/` package (no new package needed)
- Components follow Atomic Design: OrderStatusTag (atom), SearchBar/FilterBar (molecules), OrderList/OrderDetailDrawer (organisms), OrderListPage (page)
- Co-locates tests with feature code (`__tests__/` folders)
- Shares types between frontend and backend via `contracts/types.ts`

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | No violations | All constitution principles satisfied ✅ |

**Notes**: This feature fully complies with all constitution principles. No exceptions or complexity justifications required.

---

## Phase 0: Research & Technical Decisions

**Status**: Ready to generate `research.md`

**Research Tasks Identified**:

1. **U001 API Integration Points**
   - Research existing U001 endpoints for order confirmation/cancellation
   - Understand U001 request/response formats for status change operations
   - Identify authentication/authorization requirements

2. **Ant Design List Components Best Practices**
   - Research optimal Table vs List component choice for order display
   - Investigate Drawer component for order details (width, positioning, animations)
   - Study Tag component for status color coding (Ant Design theme colors)

3. **TanStack Query Pagination Patterns**
   - Research cursor-based vs offset-based pagination for large datasets
   - Investigate caching strategies for filtered lists
   - Study invalidation patterns after status change operations

4. **Supabase PostgreSQL Query Optimization**
   - Research indexing strategies for `reservation_orders` table (status, created_at, customer_phone)
   - Investigate full-text search options for phone number search
   - Study Supabase RLS policies for order access control

5. **Phone Number Search Implementation**
   - Research real-time vs debounced search UX
   - Investigate partial match vs exact match strategies
   - Study input sanitization for phone number formats (dashes, spaces)

**Unknowns to Resolve**:

- [ ] What is the exact structure of U001's order confirmation API? (Request body, response format, error codes)
- [ ] What is the exact structure of U001's order cancellation API? (Cancellation reason required? Enum values?)
- [ ] Does U001 already provide a list endpoint with filtering? Or do we need to create a new one?
- [ ] What are the existing database indexes on `reservation_orders` table? (Need to add indexes for filtering?)
- [ ] What is the expected order volume per cinema? (Determines pagination size, virtual scrolling necessity)
- [ ] Are there any existing Ant Design customizations/theme overrides we should follow?
- [ ] What authentication/authorization mechanism does U001 use? (JWT? Session? Supabase Auth?)

**Next Step**: Generate `research.md` with findings from investigating U001 codebase and answering unknowns.

---

## Phase 1: Design & Contracts

**Status**: ✅ **Completed** (2025-12-27)

**Phase 1 Deliverables**:

1. ✅ **data-model.md**: Entity definitions completed
   - Reuses U001 core entities (ReservationOrder, ReservationItem, OperationLog)
   - Defines U004-specific filter state (OrderListFilterState)
   - Includes database index recommendations for performance

2. ✅ **contracts/api.yaml**: OpenAPI spec completed
   - Documents U001 API integration points (no new backend APIs needed)
   - Defines all request/response schemas
   - Includes error handling patterns

3. ✅ **contracts/types.ts**: Shared TypeScript types completed
   - Re-exports U001 types to avoid duplication
   - Defines U004-specific frontend state types
   - Includes validation schemas and type guards

4. ✅ **quickstart.md**: Development setup guide completed
   - Environment setup instructions
   - Mock data configuration (MSW)
   - Testing workflows
   - Troubleshooting guide

**Design Decisions Finalized**:

- ✅ **API endpoint structure**: Reuse U001 `/api/admin/reservations` (no new endpoints)
- ✅ **Pagination strategy**: Offset-based (simpler, supports page jumping, U001 already implements it)
- ✅ **Search strategy**: Backend partial match search (LIKE query with index)
- ✅ **Status change integration**: Direct API calls to U001 (no wrapper needed)

---

## Phase 2: Task Breakdown

**Status**: Not created by `/speckit.plan` (use `/speckit.tasks` command after Phase 1 completion)

**Note**: Task generation happens in a separate command (`/speckit.tasks`) after design artifacts are completed. Tasks will follow Test-Driven Development workflow (write test → implement → refactor).

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| U001 API changes breaking integration | High | Low | Document API contract in `contracts/api.yaml`, use integration tests to detect breaking changes |
| Large order datasets causing performance issues | Medium | Medium | Implement pagination from start, add virtual scrolling if needed, optimize database queries with proper indexes |
| Inconsistent status definitions between U001 and U004 | High | Low | Reuse U001's OrderStatus enum exactly, no custom status definitions |
| Filter/search state management complexity | Low | Medium | Use Zustand for simple state management, clear separation from TanStack Query server state |
| Concurrent status changes (user A changes order while user B viewing) | Medium | Low | Use TanStack Query's cache invalidation, show stale data warning, optimistic updates with rollback |

---

## Implementation Notes

1. **Code Attribution**: All new files must include `@spec U004-order-list-view` header comment
2. **Testing Strategy**: Write Playwright e2e test first for main user flow, then unit tests for components
3. **Mock Data**: Create realistic mock order data in MSW handlers for development (no backend dependency initially)
4. **Incremental Development**: Build components bottom-up (OrderStatusTag → OrderListItem → OrderList → OrderListPage)
5. **U001 Integration Last**: Develop with mocks first, integrate real U001 APIs in final phase after core UI is stable

---

## Success Criteria Mapping

All success criteria from spec.md must be verifiable in implementation:

- **SC-001** (List load < 2s): Performance test in Playwright with 100 mock orders
- **SC-002** (Filter < 1s): Unit test for filter state update + TanStack Query cache hit
- **SC-003** (Phone search < 3s): E2E test with mock API delay
- **SC-004** (Detail drawer < 1s): Unit test for drawer component render time
- **SC-005** (Status change < 5s): E2E test for confirm/cancel flow with U001 integration
- **SC-006** (List refresh < 1s): Unit test for TanStack Query invalidation
- **SC-007** (10k orders support): Performance test with large mock dataset
- **SC-008** (95% usability): Manual UAT testing with operations staff
- **SC-009** (100% filter accuracy): Unit tests for all filter combinations
- **SC-010** (100% concurrency detection): Integration test for optimistic lock handling

---

**Plan Version**: 1.0.0
**Last Updated**: 2025-12-27
**Next Command**: `/speckit.plan` will continue to Phase 0 research generation
