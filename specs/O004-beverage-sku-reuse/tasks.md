# Implementation Tasks: 饮品模块复用SKU管理能力

**@spec O004-beverage-sku-reuse**

**Branch**: `O004-beverage-sku-reuse` | **Generated**: 2025-12-31

---

## Task Summary

| Phase | User Story | Task Count | Parallelizable | Status |
|-------|-----------|------------|----------------|--------|
| Phase 1: Setup | - | 6 | 4 | Pending |
| Phase 2: Foundational | - | 8 | 6 | Pending |
| Phase 3: US1 (P1) | SKU管理界面配置饮品 | 15 | 10 | Pending |
| Phase 4: US2 (P2) | SKU选择器过滤 | 10 | 6 | Pending |
| Phase 5: US3 (P3) | 移除旧饮品界面 | 8 | 4 | Pending |
| Phase 6: Polish | - | 5 | 3 | Pending |
| **TOTAL** | **3 User Stories** | **52 tasks** | **33 parallel** | **0% Complete** |

---

## MVP Scope Recommendation

**Suggested MVP**: User Story 1 (P1) only - "运营人员通过SKU管理界面配置饮品成品"

**Rationale**:
- ✅ Delivers core value: Eliminates duplicate beverage configuration logic
- ✅ Independently testable: Can create and verify finished_product SKUs without other stories
- ✅ Enables data migration: Foundation for deprecating old beverage interface
- ✅ Lowest risk: Reuses existing SKU management components

**MVP Tasks**: Phase 1 + Phase 2 + Phase 3 (total: 29 tasks)

**Post-MVP**: Add User Story 2 (P2) for enhanced UX, then User Story 3 (P3) for cleanup

---

## Implementation Strategy

### Incremental Delivery Plan

```
Sprint 1 (Week 1): Setup + Foundational
├─ Phase 1: Setup (6 tasks, 2 days)
└─ Phase 2: Foundational (8 tasks, 3 days)

Sprint 2 (Week 2): User Story 1 (MVP)
└─ Phase 3: US1 Implementation (15 tasks, 5 days)

Sprint 3 (Week 3): User Story 2 + User Story 3
├─ Phase 4: US2 Implementation (10 tasks, 3 days)
└─ Phase 5: US3 Implementation (8 tasks, 2 days)

Sprint 4 (Week 4): Polish & Testing
└─ Phase 6: Polish & Cross-cutting (5 tasks, 2 days)
```

### Dependency Graph

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational: Backend Entities + API + Frontend Services)
    ↓
    ├──→ Phase 3 (US1: SKU Management UI) ← MVP Release
    ↓
    ├──→ Phase 4 (US2: SKU Selector Filtering) ← Independent
    ↓
    └──→ Phase 5 (US3: Deprecate Old UI) ← Depends on US1
    ↓
Phase 6 (Polish & Cross-cutting)
```

**Key Insights**:
- Phase 3 (US1) and Phase 4 (US2) are **independent** after Phase 2
- Phase 5 (US3) **depends on** Phase 3 (data migration requires US1 complete)
- All phases **require** Phase 2 foundational tasks to be complete

---

## Phase 1: Setup (Project Initialization)

**Goal**: Initialize project structure, configure development environment, set up testing infrastructure

**Prerequisites**: None (starting point)

**Completion Criteria**:
- ✅ Development environment running (backend + frontend)
- ✅ Database migrations infrastructure ready
- ✅ E2E test infrastructure configured (Playwright + test data fixtures)
- ✅ Code quality tools configured (ESLint, Prettier, TypeScript strict mode)

### Tasks

- [ ] T001 Verify feature branch `O004-beverage-sku-reuse` is checked out and active_spec points to correct spec
- [ ] T002 [P] Create TypeScript type definitions in `frontend/src/types/sku.ts` with SkuType, SkuStatus, SKU, Category, BOM interfaces
- [ ] T003 [P] Create backend entity classes in `backend/src/main/java/com/cinema/entity/`: SKU.java, Category.java, BOM.java, BeverageSkuMapping.java
- [ ] T004 [P] Configure Flyway database migration directory `backend/src/main/resources/db/migration/` and create migration naming convention
- [ ] T005 [P] Configure Playwright test data fixtures directory `frontend/tests/fixtures/testdata/` and verify seed data files exist
- [ ] T006 Update `.gitignore` to exclude test artifacts (`test-results/`, `playwright-report/`, `.env.local`)

**Parallel Opportunities**: T002, T003, T004, T005 can run in parallel (different files, no dependencies)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Goal**: Build core backend APIs, database schema, and frontend service layer that all user stories depend on

**Prerequisites**: Phase 1 complete

**Completion Criteria**:
- ✅ Database schema created (skus, categories, boms, beverage_sku_mapping tables)
- ✅ Backend REST APIs functional (GET/POST/PUT/DELETE for SKUs, Categories, BOMs)
- ✅ Frontend API service layer ready (skuService.ts with TanStack Query hooks)
- ✅ API contracts validated (request/response format matches spec)

### Tasks

- [ ] T007 [P] Create database migration script `V2025_12_31_001__create_skus_table.sql` with schema from data-model.md
- [ ] T008 [P] Create database migration script `V2025_12_31_002__create_categories_table.sql` with hierarchical structure support
- [ ] T009 [P] Create database migration script `V2025_12_31_003__create_boms_table.sql` with foreign key constraints to skus
- [ ] T010 [P] Create database migration script `V2025_12_31_004__create_beverage_sku_mapping_table.sql` for data migration tracking
- [ ] T011 Run Flyway migrations and verify all tables created successfully in Supabase dashboard
- [ ] T012 [P] Implement backend repository interfaces in `backend/src/main/java/com/cinema/repository/`: SKURepository.java, CategoryRepository.java, BOMRepository.java
- [ ] T013 [P] Implement backend service layer in `backend/src/main/java/com/cinema/service/`: SKUService.java, CategoryService.java, BOMService.java with business logic
- [ ] T014 Implement backend REST controllers in `backend/src/main/java/com/cinema/controller/`: SKUController.java (GET/POST/PUT/DELETE /api/skus), CategoryController.java (GET /api/categories), BOMController.java (GET/POST/PUT/DELETE /api/boms) with unified ApiResponse format

**Parallel Opportunities**: T007, T008, T009, T010 (database scripts), T012 (repositories), T013 (services) can run in parallel

**Critical Path**: T011 (run migrations) must complete before any API testing

---

## Phase 3: User Story 1 (P1) - 运营人员通过SKU管理界面配置饮品成品

**Goal**: Enable operators to create and manage finished_product beverage SKUs through unified SKU management interface

**Prerequisites**: Phase 2 complete (backend APIs + frontend service layer ready)

**User Story Reference**: spec.md lines 19-32

**Independent Test Criteria**:
- ✅ Operator can create a new finished_product SKU with type="finished_product" and category="饮品"
- ✅ Created SKU appears in SKU list table with correct attributes (name, price, status, unit)
- ✅ Operator can edit SKU name/price and changes persist after page reload
- ✅ Operator can disable SKU and status updates to "disabled"
- ✅ E2E test E2E-PRODUCT-002 passes (SKU creation flow)

### Tasks

#### Frontend Service Layer

- [ ] T015 [P] [US1] Create frontend API service `frontend/src/services/skuService.ts` with fetchSkus, createSKU, updateSKU, deleteSKU functions using axios
- [ ] T016 [P] [US1] Create TanStack Query hooks in `frontend/src/hooks/useSKUs.ts`: useSkus (query), useCreateSku (mutation), useUpdateSku, useDeleteSku with query key factory pattern
- [ ] T017 [P] [US1] Create Zustand store `frontend/src/stores/skuManagementStore.ts` for client state (modal open/close, selected SKU type filter, search keyword, pagination)

#### Form Validation & Schema

- [ ] T018 [P] [US1] Create Zod validation schema `frontend/src/features/product-management/schemas/skuSchema.ts` with rules from data-model.md (skuCode format, skuName length, price > 0, etc.)
- [ ] T019 [P] [US1] Create React Hook Form configuration in `frontend/src/features/product-management/hooks/useSkuForm.ts` with zodResolver integration

#### UI Components (Atomic Design)

- [ ] T020 [P] [US1] Create SKU list table component `frontend/src/features/product-management/components/SKUListTable.tsx` using Ant Design Table with pagination, sorting, filtering
- [ ] T021 [P] [US1] Create SKU creation modal `frontend/src/features/product-management/components/SKUCreateModal.tsx` using Ant Design Modal + Form with React Hook Form Controller pattern
- [ ] T022 [P] [US1] Create SKU edit modal `frontend/src/features/product-management/components/SKUEditModal.tsx` reusing SKUCreateModal with pre-filled data
- [ ] T023 [P] [US1] Create SKU type select dropdown `frontend/src/features/product-management/components/SKUTypeSelect.tsx` with options (finished_product, packaging, raw_material) using Ant Design Select
- [ ] T024 [P] [US1] Create category cascader `frontend/src/features/product-management/components/CategoryCascader.tsx` for hierarchical category selection using Ant Design Cascader

#### Page Integration

- [ ] T025 [US1] Update SKU management page `frontend/src/pages/ProductManagement/SKUManagementPage.tsx` to integrate SKUListTable, SKUCreateModal, filters, and search functionality
- [ ] T026 [US1] Add route configuration in `frontend/src/App.tsx` for `/products/sku` path mapping to SKUManagementPage

#### Unit Tests (TDD - Red-Green-Refactor)

- [ ] T027 [P] [US1] Write unit tests for skuService.ts in `frontend/src/services/__tests__/skuService.test.ts` using Vitest + MSW to mock API responses (coverage ≥80%)
- [ ] T028 [P] [US1] Write unit tests for useSKUs hooks in `frontend/src/hooks/__tests__/useSKUs.test.ts` using Testing Library + React Query test utils (coverage ≥80%)
- [ ] T029 [US1] Write component tests for SKUCreateModal in `frontend/src/features/product-management/components/__tests__/SKUCreateModal.test.tsx` using Vitest + Testing Library (coverage ≥70%)

**Parallel Opportunities**: T015-T017 (service layer), T018-T019 (validation), T020-T024 (UI components), T027-T028 (unit tests) can run in parallel

**Critical Path**: T025 (page integration) depends on T020-T024 (all components ready)

---

## Phase 4: User Story 2 (P2) - 饮品配方只能关联成品SKU

**Goal**: Ensure BOM configuration SKU selector only shows finished_product type SKUs, filtering out packaging and raw_material types

**Prerequisites**: Phase 2 complete (foundational APIs ready), **Independent of Phase 3**

**User Story Reference**: spec.md lines 35-48

**Independent Test Criteria**:
- ✅ SKU selector dropdown in BOM configuration only displays finished_product SKUs
- ✅ Given 3 finished_product + 5 packaging + 2 raw_material SKUs, selector shows exactly 3 options
- ✅ Search in SKU selector filters only within finished_product SKUs
- ✅ Backend API validation rejects BOM creation if finishedProductSkuId is not finished_product type
- ✅ E2E test E2E-PRODUCT-003 passes (SKU selector filtering)

### Tasks

#### Backend Validation

- [ ] T030 [P] [US2] Add validation logic in `backend/src/main/java/com/cinema/service/BOMService.java` createBOM method to check finishedProductSkuId type must be finished_product, throw BOM_VAL_001 error if not
- [ ] T031 [P] [US2] Add database CHECK constraint in migration `V2025_12_31_005__add_bom_type_constraint.sql` to enforce finished_product type on boms.finished_product_sku_id

#### Frontend SKU Selector Component

- [ ] T032 [P] [US2] Create reusable SKU selector component `frontend/src/components/molecules/SKUSelectorModal.tsx` with props: skuType filter (default: finished_product), onSelect callback, searchable dropdown using Ant Design Select
- [ ] T033 [P] [US2] Implement client-side type guard in SKUSelectorModal to filter options by skuType even if API returns mixed types (defense in depth)
- [ ] T034 [P] [US2] Add search functionality in SKUSelectorModal using useQuery with dynamic filters (keyword + type) for real-time search

#### BOM Configuration Integration

- [ ] T035 [US2] Create BOM configuration page `frontend/src/pages/ProductManagement/BOMConfigurationPage.tsx` with finished product selection + component list + SKUSelectorModal integration
- [ ] T036 [US2] Integrate SKUSelectorModal into BOMConfigurationPage with skuType="finished_product" parameter to enforce filtering

#### Unit Tests

- [ ] T037 [P] [US2] Write unit tests for SKUSelectorModal in `frontend/src/components/molecules/__tests__/SKUSelectorModal.test.tsx` verifying type filtering logic (coverage ≥70%)
- [ ] T038 [P] [US2] Write backend integration tests for BOMService in `backend/src/test/java/com/cinema/service/BOMServiceTest.java` verifying type validation throws correct error codes
- [ ] T039 [US2] Write E2E test validation in `scenarios/product/E2E-PRODUCT-003.spec.ts` to verify selector options count matches expected finished_product count from seed data

**Parallel Opportunities**: T030-T031 (backend validation), T032-T034 (frontend component), T037-T038 (unit tests) can run in parallel

**Critical Path**: T035 (BOM page) depends on T032 (SKUSelectorModal component ready)

---

## Phase 5: User Story 3 (P3) - 移除旧饮品管理界面的冗余功能

**Goal**: Deprecate old beverage management interface, migrate historical data to SKU system, redirect users to new SKU management flow

**Prerequisites**: Phase 3 complete (US1 SKU management functional) - **Depends on US1**

**User Story Reference**: spec.md lines 51-64

**Independent Test Criteria**:
- ✅ Accessing `/beverage/list` shows migration notice + redirect link to `/products/sku`
- ✅ Historical beverage data migrated to skus table with correct mapping in beverage_sku_mapping
- ✅ "New Beverage" button in old interface redirects to SKU creation page
- ✅ Data migration script is idempotent (can re-run without duplicating data)
- ✅ Migration success rate ≥95% (at least 95% of historical beverages correctly converted)

### Tasks

#### Data Migration Script

- [ ] T040 [US3] Create idempotent data migration script `backend/src/main/resources/db/migration/V2025_12_31_006__migrate_beverages_to_skus.sql` with INSERT...ON CONFLICT DO NOTHING pattern from research.md
- [ ] T041 [US3] Add mapping table population logic in migration script to record old_beverage_id → new_sku_id relationships
- [ ] T042 [US3] Create rollback script `backend/src/main/resources/db/migration/V2025_12_31_007__rollback_beverage_migration.sql` for data migration cleanup if needed

#### UI Migration Notice

- [ ] T043 [P] [US3] Create migration notice component `frontend/src/features/beverage-management/components/MigrationNotice.tsx` using Ant Design Alert with redirect link to /products/sku
- [ ] T044 [P] [US3] Update old beverage list page `frontend/src/pages/BeverageManagement/BeverageListPage.tsx` to display MigrationNotice at top, disable create/edit buttons
- [ ] T045 [US3] Add redirect logic in BeverageListPage "New Beverage" button to navigate to `/products/sku?type=finished_product&category=beverage`

#### Migration Verification

- [ ] T046 [US3] Run migration script in staging environment and verify beverage_sku_mapping table populated correctly
- [ ] T047 [US3] Write SQL validation queries in `specs/O004-beverage-sku-reuse/quickstart.md` to check migration success rate (COUNT mismatches, data integrity)

**Parallel Opportunities**: T043-T044 (UI components) can run in parallel with T040-T042 (migration scripts)

**Critical Path**: T046 (run migration) depends on T040 (migration script ready)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Goal**: Finalize documentation, performance optimization, error handling, accessibility, and code quality

**Prerequisites**: All user stories (Phase 3, 4, 5) complete

**Completion Criteria**:
- ✅ All ESLint/Prettier checks pass
- ✅ TypeScript strict mode has zero errors
- ✅ E2E test suite passes (E2E-PRODUCT-002, E2E-PRODUCT-003)
- ✅ Performance goals met (SKU list <2s, selector ≤1s, filter accuracy 100%)
- ✅ Accessibility audit passes (WCAG 2.1 AA level)

### Tasks

- [ ] T048 [P] Add `@spec O004-beverage-sku-reuse` attribution to all new/modified files (frontend + backend)
- [ ] T049 [P] Run ESLint + Prettier across all modified files and fix formatting issues: `npm run lint:fix && npm run format`
- [ ] T050 [P] Run TypeScript type checking in strict mode: `npx tsc --noEmit` and resolve all type errors
- [ ] T051 Optimize SKU list rendering with React.memo, useMemo for filtered data, and implement virtual scrolling if SKU count >1000 using react-window library
- [ ] T052 Run full E2E test suite and generate Playwright HTML report: `npm run test:e2e && npx playwright show-report`

**Parallel Opportunities**: T048, T049, T050 can run in parallel

**Critical Path**: T052 (E2E tests) should run last to validate all changes

---

## Parallel Execution Examples

### Example 1: Phase 2 Foundational Tasks (Maximum Parallelization)

**Scenario**: 3 developers working on Phase 2

**Developer A** (Backend - Database):
```bash
# Terminal 1
git checkout O004-beverage-sku-reuse
- [ ] T007 Create V2025_12_31_001__create_skus_table.sql
- [ ] T008 Create V2025_12_31_002__create_categories_table.sql
- [ ] T009 Create V2025_12_31_003__create_boms_table.sql
- [ ] T010 Create V2025_12_31_004__create_beverage_sku_mapping_table.sql
```

**Developer B** (Backend - Service Layer):
```bash
# Terminal 2 (parallel to Developer A)
- [ ] T012 Implement SKURepository, CategoryRepository, BOMRepository
- [ ] T013 Implement SKUService, CategoryService, BOMService
```

**Developer C** (Backend - API Layer):
```bash
# Terminal 3 (waits for Developer A T011 + Developer B T013)
- [ ] T011 Run Flyway migrations (depends on T007-T010)
- [ ] T014 Implement REST controllers (depends on T013)
```

**Timeline**: T007-T010 + T012-T013 run in parallel (2 days) → T011 + T014 run sequentially (1 day) = **3 days total**

---

### Example 2: Phase 3 US1 Component Development

**Scenario**: 2 developers working on US1 components

**Developer A** (Service Layer + Validation):
```bash
- [ ] T015 Create skuService.ts
- [ ] T016 Create useSKUs hooks
- [ ] T017 Create skuManagementStore.ts
- [ ] T018 Create skuSchema.ts (Zod)
- [ ] T019 Create useSkuForm.ts
```

**Developer B** (UI Components):
```bash
# Parallel to Developer A
- [ ] T020 Create SKUListTable.tsx
- [ ] T021 Create SKUCreateModal.tsx
- [ ] T022 Create SKUEditModal.tsx
- [ ] T023 Create SKUTypeSelect.tsx
- [ ] T024 Create CategoryCascader.tsx
```

**Timeline**: Both developers work in parallel for 2 days → Integrate on T025 (1 day) = **3 days total**

---

### Example 3: Cross-Story Parallelization (US1 + US2)

**Scenario**: After Phase 2 complete, US1 and US2 can proceed in parallel

**Team A** (3 developers on US1):
```bash
# Week 2: Implement all of Phase 3 (US1)
- [ ] T015-T029 (SKU management interface)
```

**Team B** (2 developers on US2):
```bash
# Week 2: Implement Phase 4 (US2) in parallel
- [ ] T030-T039 (SKU selector filtering)
```

**Benefit**: **50% faster delivery** - US1 and US2 complete in 1 week instead of 2 sequential weeks

**Note**: US3 (Phase 5) must wait for US1 to complete due to data migration dependency

---

## Validation Checklist

Before marking tasks.md as complete, verify:

- [x] **All tasks follow checklist format**: `- [ ] [TaskID] [P?] [Story?] Description with file path`
- [x] **Task IDs are sequential**: T001, T002, T003... (no gaps)
- [x] **Story labels match spec.md**: [US1], [US2], [US3]
- [x] **Parallel markers ([P]) are accurate**: Different files, no dependencies
- [x] **File paths are absolute or clearly specified**: e.g., `frontend/src/services/skuService.ts`
- [x] **Each user story has independent test criteria**: Defined in phase headers
- [x] **Dependency graph shows story relationships**: US1 → US3 dependency documented
- [x] **MVP scope is clearly identified**: Phase 1 + Phase 2 + Phase 3
- [x] **Parallel execution examples provided**: Demonstrates task parallelization opportunities

---

## Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Task Completion Rate** | 100% | All 52 tasks marked complete |
| **MVP Delivery Time** | ≤2 weeks | Phase 1-3 complete within 10 business days |
| **Parallel Task Efficiency** | ≥60% | At least 33/52 tasks executed in parallel |
| **Code Coverage** | ≥70% | Vitest coverage report for components, ≥80% for services |
| **E2E Test Pass Rate** | 100% | Both E2E-PRODUCT-002 and E2E-PRODUCT-003 pass |
| **Performance Goals** | All met | SKU list <2s, selector ≤1s, filter accuracy 100% |
| **Zero Defects** | 0 P1 bugs | No critical bugs in production after MVP release |

---

**Generated**: 2025-12-31 | **Total Tasks**: 52 | **Estimated Effort**: 4 weeks (with parallelization)

**Next Step**: Begin Phase 1 (Setup) tasks T001-T006
