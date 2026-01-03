# Tasks: 小程序菜单分类动态配置

**@spec O002-miniapp-menu-config**
**Input**: Design documents from `/specs/O002-miniapp-menu-config/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.yaml

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## User Story Summary

| Priority | Story | Description | Phase |
|----------|-------|-------------|-------|
| P1 | US1 | Admin Configures Menu Categories (CRUD) | 3 |
| P1 | US2 | Mini-Program Fetches Dynamic Categories | 4 |
| P1 | US5 | System Migrates ChannelCategory Data | 5 |
| P1 | US6 | Products Filtered by Dynamic Category | 6 |
| P2 | US3 | Admin Reorders Menu Categories | 7 |
| P2 | US4 | Admin Sets Category Visibility | 8 |
| P3 | US7 | Admin Sets Category Icons and Descriptions | 9 |

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Branch creation, environment setup, and project initialization

- [x] T001 Create feature branch `O002-miniapp-menu-config` from `dev`
- [x] T002 Update `.specify/active_spec.txt` to point to `specs/O002-miniapp-menu-config/spec.md`
- [x] T003 [P] Verify backend development environment (Java 17.0.9, Maven, Supabase connection)
- [x] T004 [P] Verify frontend B端 environment (React 19.2.0, Ant Design 6.1.0, TypeScript 5.9.3)
- [x] T005 [P] Verify frontend C端 environment (Taro 4.1.9, React 18.3.1)

**Estimated Time**: 1.5 hours

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core database schema and migration infrastructure that MUST be complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Schema

- [x] T006 Create database migration script `V202601030001__add_menu_category.sql` in `backend/src/main/resources/db/migration/`
- [x] T007 Create `menu_category` table with all fields per data-model.md in migration script
- [x] T008 Create `category_audit_log` table in migration script
- [x] T009 Add `category_id` column to `channel_product_config` table in migration script
- [x] T010 Create indexes for `menu_category` table (sort_order, is_visible, code)
- [x] T011 Create unique partial index for `is_default=true` constraint
- [x] T012 Create trigger for automatic `updated_at` timestamp update

### Backend Entity Layer

- [x] T013 [P] Create `MenuCategory` JPA entity in `backend/src/main/java/com/cinema/category/entity/MenuCategory.java`
- [x] T014 [P] Create `CategoryAuditLog` JPA entity in `backend/src/main/java/com/cinema/category/entity/CategoryAuditLog.java`
- [x] T015 Modify `ChannelProductConfig` entity to add `category` ManyToOne relationship in `backend/src/main/java/com/cinema/channelproduct/domain/ChannelProductConfig.java`

### Backend Repository Layer

- [x] T016 [P] Create `MenuCategoryRepository` with custom queries in `backend/src/main/java/com/cinema/category/repository/MenuCategoryRepository.java`
- [x] T017 [P] Create `CategoryAuditLogRepository` in `backend/src/main/java/com/cinema/category/repository/CategoryAuditLogRepository.java`

### Backend DTO Layer

- [x] T018 [P] Create `MenuCategoryDTO` in `backend/src/main/java/com/cinema/category/dto/MenuCategoryDTO.java`
- [x] T019 [P] Create `CreateMenuCategoryRequest` in `backend/src/main/java/com/cinema/category/dto/CreateMenuCategoryRequest.java`
- [x] T020 [P] Create `UpdateMenuCategoryRequest` in `backend/src/main/java/com/cinema/category/dto/UpdateMenuCategoryRequest.java`
- [x] T021 [P] Create `BatchUpdateSortOrderRequest` in `backend/src/main/java/com/cinema/category/dto/BatchUpdateSortOrderRequest.java`
- [x] T022 [P] Create `ClientMenuCategoryDTO` (simplified for C端) in `backend/src/main/java/com/cinema/category/dto/ClientMenuCategoryDTO.java`
- [x] T023 [P] Create `DeleteCategoryResponse` in `backend/src/main/java/com/cinema/category/dto/DeleteCategoryResponse.java`

### Frontend Type Definitions

- [x] T024 [P] Create `MenuCategoryDTO` TypeScript type in `frontend/src/features/menu-category/types/index.ts`
- [x] T025 [P] Create request/response types in `frontend/src/features/menu-category/types/index.ts`
- [x] T026 [P] Create C端 `MenuCategoryDTO` type in `hall-reserve-taro/src/types/menuCategory.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

**Estimated Time**: 8 hours

---

## Phase 3: User Story 1 - Admin Configures Menu Categories (Priority: P1) 🎯 MVP

**Goal**: Cinema operations manager can create, read, update, and delete menu categories through admin interface

**Independent Test**: Create a category "季节限定", verify it appears in category list, update its name, delete it

### Backend Implementation for US1

- [x] T027 [US1] Create `MenuCategoryService` with CRUD operations in `backend/src/main/java/com/cinema/category/service/MenuCategoryService.java`
- [x] T028 [US1] Implement `createCategory()` with code uniqueness validation in MenuCategoryService
- [x] T029 [US1] Implement `updateCategory()` with default category protection in MenuCategoryService
- [x] T030 [US1] Implement `deleteCategory()` with product migration to default category in MenuCategoryService
- [x] T031 [US1] Implement `getCategories()` with includeHidden and includeProductCount options in MenuCategoryService
- [x] T032 [US1] Implement `getCategoryById()` in MenuCategoryService
- [x] T033 [US1] Create `CategoryAuditService` for audit logging in `backend/src/main/java/com/cinema/category/service/CategoryAuditService.java`
- [x] T034 [US1] Create `MenuCategoryAdminController` with CRUD endpoints in `backend/src/main/java/com/cinema/category/controller/MenuCategoryAdminController.java`
- [x] T035 [US1] Implement `GET /api/admin/menu-categories` endpoint
- [x] T036 [US1] Implement `POST /api/admin/menu-categories` endpoint
- [x] T037 [US1] Implement `GET /api/admin/menu-categories/{id}` endpoint
- [x] T038 [US1] Implement `PUT /api/admin/menu-categories/{id}` endpoint
- [x] T039 [US1] Implement `DELETE /api/admin/menu-categories/{id}` endpoint with confirm parameter

### Frontend B端 Implementation for US1

- [x] T040 [P] [US1] Create `menuCategoryService` API client in `frontend/src/features/menu-category/services/menuCategoryService.ts`
- [x] T041 [P] [US1] Create TanStack Query hooks in `frontend/src/features/menu-category/hooks/useMenuCategories.ts`
- [x] T042 [US1] Create `CategoryTable` component in `frontend/src/features/menu-category/components/CategoryTable.tsx`
- [x] T043 [US1] Create `CategoryForm` component (create/edit modal) in `frontend/src/features/menu-category/components/CategoryForm.tsx`
- [x] T044 [US1] Create `DeleteCategoryDialog` component in `frontend/src/features/menu-category/components/DeleteCategoryDialog.tsx`
- [x] T045 [US1] Create `MenuCategoryPage` page component in `frontend/src/pages/menu-category/MenuCategoryPage.tsx`
- [x] T046 [US1] Add route for `/menu-category` in router configuration

**Checkpoint**: At this point, admin can fully manage categories (CRUD) - core MVP complete

**Estimated Time**: 16 hours

---

## Phase 4: User Story 2 - Mini-Program Fetches Dynamic Categories (Priority: P1)

**Goal**: Mini-program fetches category list from API instead of using hardcoded frontend mapping

**Independent Test**: Call `GET /api/client/menu-categories`, verify response contains visible categories sorted by sortOrder

### Backend Implementation for US2

- [x] T047 [US2] Create `MenuCategoryClientController` in `backend/src/main/java/com/cinema/category/controller/MenuCategoryClientController.java`
- [x] T048 [US2] Implement `GET /api/client/menu-categories` endpoint returning visible categories with productCount
- [x] T049 [US2] Add caching for client category list (5 minute TTL)

### Frontend C端 Implementation for US2

- [x] T050 [P] [US2] Create `menuCategoryService` in `hall-reserve-taro/src/services/menuCategoryService.ts`
- [x] T051 [P] [US2] Create `useMenuCategories` hook in `hall-reserve-taro/src/hooks/useMenuCategories.ts`
- [x] T052 [US2] Create `menuCategoryStore` Zustand store in `hall-reserve-taro/src/stores/menuCategoryStore.ts`
- [x] T053 [US2] Update menu page to fetch categories from API in `hall-reserve-taro/src/pages/beverage/menu/index.tsx`
- [x] T054 [US2] Remove hardcoded `CATEGORY_DISPLAY_NAMES` mapping from C端 code

**Checkpoint**: Mini-program displays dynamic categories from API

**Estimated Time**: 8 hours

---

## Phase 5: User Story 5 - System Migrates ChannelCategory Data (Priority: P1)

**Goal**: Migrate existing `ChannelCategory` enum values and product associations to new `menu_category` table

**Independent Test**: Run migration script, verify 6 categories created with correct Chinese names, all products have valid category_id

### Migration Implementation for US5

- [x] T055 [US5] Create data migration script `V2026_01_03_002__migrate_category_data.sql` in `backend/src/main/resources/db/migration/`
- [x] T056 [US5] Insert initial category data (ALCOHOL→经典特调, COFFEE→精品咖啡, etc.) in migration script
- [x] T057 [US5] Set OTHER category as `is_default=true` in migration script
- [x] T058 [US5] Update `channel_product_config.category_id` based on `channel_category` enum values
- [x] T059 [US5] Handle products with null/invalid category by assigning to default category
- [x] T060 [US5] Add validation query to verify migration completeness
- [x] T061 [US5] Create rollback script `R2026_01_03_002__rollback_category_migration.sql`

**Checkpoint**: All existing data migrated, zero data loss

**Estimated Time**: 4 hours

---

## Phase 6: User Story 6 - Products Filtered by Dynamic Category (Priority: P1)

**Goal**: Product list API supports filtering by `categoryId` (new) and `category` (backward compatible)

**Independent Test**: Call product API with `?categoryId=xxx` and `?category=COFFEE`, verify correct filtering

### Backend Implementation for US6

- [x] T062 [US6] Modify product list query to support `categoryId` parameter in `ChannelProductService`
- [x] T063 [US6] Add backward compatible `category` (code) parameter support in product list query
- [x] T064 [US6] Implement priority logic: `categoryId` takes precedence over `category`
- [x] T065 [US6] Add nested `category` object to `ChannelProductDTO` response
- [x] T066 [US6] Update `GET /api/client/channel-products/mini-program` endpoint

### Frontend C端 Implementation for US6

- [x] T067 [US6] Update product list hook to use `categoryId` parameter in `miniapp-ordering-taro/src/hooks/useProducts.ts`
- [x] T068 [US6] Update menu page to pass selected category ID to product list

**Checkpoint**: Products correctly filtered by both new and legacy parameters

**Estimated Time**: 6 hours

---

## Phase 7: User Story 3 - Admin Reorders Menu Categories (Priority: P2)

**Goal**: Admin can drag-and-drop to reorder categories, changes reflected in mini-program

**Independent Test**: Drag "季节限定" to first position, verify mini-program shows it first

### Backend Implementation for US3

- [x] T069 [US3] Implement `batchUpdateSortOrder()` in MenuCategoryService
- [x] T070 [US3] Implement `PUT /api/admin/menu-categories/batch-sort` endpoint in MenuCategoryAdminController

### Frontend B端 Implementation for US3

- [x] T071 [P] [US3] Add `useBatchUpdateSortOrder` mutation hook in `frontend/src/features/menu-category/hooks/useMenuCategories.ts`
- [x] T072 [US3] Add drag-and-drop reordering to `CategoryTable` component using `@dnd-kit/sortable`
- [x] T073 [US3] Implement optimistic update for sort order changes

**Checkpoint**: Admin can reorder categories with drag-and-drop

**Estimated Time**: 4 hours

---

## Phase 8: User Story 4 - Admin Sets Category Visibility (Priority: P2)

**Goal**: Admin can hide/show categories without deleting them

**Independent Test**: Toggle visibility off for "冰品", verify it disappears from mini-program

### Backend Implementation for US4

- [x] T074 [US4] Implement `toggleVisibility()` in MenuCategoryService with default category protection
- [x] T075 [US4] Implement `PATCH /api/admin/menu-categories/{id}/visibility` endpoint

### Frontend B端 Implementation for US4

- [x] T076 [P] [US4] Add `useToggleVisibility` mutation hook in `frontend/src/features/menu-category/hooks/useMenuCategories.ts`
- [x] T077 [US4] Add visibility toggle switch to `CategoryTable` component
- [x] T078 [US4] Show hidden category indicator in table row

**Checkpoint**: Admin can toggle category visibility

**Estimated Time**: 3 hours

---

## Phase 9: User Story 7 - Admin Sets Category Icons and Descriptions (Priority: P3)

**Goal**: Admin can add visual icons and descriptions to improve menu clarity

**Independent Test**: Upload icon for a category, verify it displays in mini-program

### Backend Implementation for US7

- [ ] T079 [US7] Add icon URL and description validation in MenuCategoryService
- [ ] T080 [US7] Ensure icon/description fields included in all category responses

### Frontend B端 Implementation for US7

- [ ] T081 [US7] Add icon URL input field to `CategoryForm` component
- [ ] T082 [US7] Add description textarea to `CategoryForm` component
- [ ] T083 [US7] Add icon preview in `CategoryTable` component

### Frontend C端 Implementation for US7

- [ ] T084 [US7] Display category icons in menu sidebar in `hall-reserve-taro/src/pages/menu/index.tsx`
- [ ] T085 [US7] Handle missing icons with fallback display

**Checkpoint**: Categories display with icons and descriptions

**Estimated Time**: 4 hours

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

### Error Handling & Validation

- [ ] T086 [P] Add comprehensive error codes per API standards (CAT_NTF_001, CAT_VAL_001, etc.)
- [ ] T087 [P] Add Zod validation schemas for frontend forms
- [ ] T088 Add global exception handler for category-related errors

### Performance & Caching

- [ ] T089 Verify category list API response time < 200ms
- [ ] T090 Verify mini-program menu load time < 1s
- [ ] T091 Configure TanStack Query staleTime (5 min) and refetchInterval (1 min)

### Documentation

- [ ] T092 [P] Update API documentation with new endpoints
- [ ] T093 [P] Add operator guide for category management
- [ ] T094 Update O007 spec to reference O002 for category data

### Final Validation

- [ ] T095 Run full migration script on test database
- [ ] T096 Verify backward compatibility with legacy `category` parameter
- [ ] T097 Verify default category protection (cannot delete/hide)
- [ ] T098 Verify audit logging for all category operations

**Estimated Time**: 6 hours

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ←── BLOCKS ALL USER STORIES
    ↓
┌───────────────────────────────────────────────────────┐
│ P1 Stories (can run in parallel after Phase 2):       │
│   Phase 3 (US1: Admin CRUD)                           │
│   Phase 4 (US2: C端 API) - depends on US1 backend     │
│   Phase 5 (US5: Migration) - can run parallel         │
│   Phase 6 (US6: Product Filter) - depends on US5      │
└───────────────────────────────────────────────────────┘
    ↓
┌───────────────────────────────────────────────────────┐
│ P2 Stories (after P1 complete):                       │
│   Phase 7 (US3: Reorder) - extends US1                │
│   Phase 8 (US4: Visibility) - extends US1             │
└───────────────────────────────────────────────────────┘
    ↓
┌───────────────────────────────────────────────────────┐
│ P3 Stories (after P2 complete):                       │
│   Phase 9 (US7: Icons/Descriptions)                   │
└───────────────────────────────────────────────────────┘
    ↓
Phase 10 (Polish)
```

### User Story Dependencies

| Story | Depends On | Blocks |
|-------|------------|--------|
| US1 | Phase 2 (Foundational) | US2, US3, US4, US7 |
| US2 | US1 backend | - |
| US3 | US1 | - |
| US4 | US1 | - |
| US5 | Phase 2 (Foundational) | US6 |
| US6 | US5 | - |
| US7 | US1 | - |

### Within Each User Story

- Models → Services → Controllers → Frontend
- Backend before Frontend (for each story)
- Core implementation before integration

### Parallel Opportunities

**Phase 2 (Foundational)**:
- T013, T014 (Entities) can run in parallel
- T016, T017 (Repositories) can run in parallel
- T018-T023 (DTOs) can run in parallel
- T024-T026 (Frontend types) can run in parallel

**Phase 3 (US1)**:
- T040, T041 (Frontend services/hooks) can run in parallel
- Backend implementation sequential (service → controller)

**Phase 4 (US2)**:
- T050, T051 (C端 service/hook) can run in parallel

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Launch all entity creation in parallel:
Task T013: "Create MenuCategory JPA entity"
Task T014: "Create CategoryAuditLog JPA entity"

# Launch all DTOs in parallel:
Task T018: "Create MenuCategoryDTO"
Task T019: "Create CreateMenuCategoryRequest"
Task T020: "Create UpdateMenuCategoryRequest"
Task T021: "Create BatchUpdateSortOrderRequest"
Task T022: "Create ClientMenuCategoryDTO"
Task T023: "Create DeleteCategoryResponse"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (1.5h)
2. Complete Phase 2: Foundational (8h)
3. Complete Phase 3: User Story 1 - Admin CRUD (16h)
4. **STOP and VALIDATE**: Admin can create/edit/delete categories
5. Demo to stakeholders - core MVP delivered

### P1 Stories Complete

1. Add Phase 4: US2 - C端 Category API (8h)
2. Add Phase 5: US5 - Data Migration (4h)
3. Add Phase 6: US6 - Product Filtering (6h)
4. **STOP and VALIDATE**: Full end-to-end category system working
5. Ready for production deployment

### Full Feature Complete

1. Add Phase 7: US3 - Reorder (4h)
2. Add Phase 8: US4 - Visibility (3h)
3. Add Phase 9: US7 - Icons/Descriptions (4h)
4. Add Phase 10: Polish (6h)
5. Feature complete

---

## Estimated Timeline

| Phase | Hours | Cumulative |
|-------|-------|------------|
| Phase 1: Setup | 1.5h | 1.5h |
| Phase 2: Foundational | 8h | 9.5h |
| Phase 3: US1 (MVP) | 16h | 25.5h |
| Phase 4: US2 | 8h | 33.5h |
| Phase 5: US5 | 4h | 37.5h |
| Phase 6: US6 | 6h | 43.5h |
| Phase 7: US3 | 4h | 47.5h |
| Phase 8: US4 | 3h | 50.5h |
| Phase 9: US7 | 4h | 54.5h |
| Phase 10: Polish | 6h | 60.5h |
| **Total** | **60.5h** | - |

**MVP Milestone** (US1 only): 25.5 hours
**P1 Complete** (US1-US6): 43.5 hours
**Full Feature**: 60.5 hours

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Java 17 is mandatory for backend (per project rules)
- All business logic files must include `@spec O002-miniapp-menu-config` annotation
