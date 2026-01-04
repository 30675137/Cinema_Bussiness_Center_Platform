# Tasks: B端商品配置 - 动态菜单分类集成

**Input**: Design documents from `/specs/O008-channel-product-category-migration/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api.yaml, quickstart.md

**Tests**: Tests are included only where explicitly needed for validation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/src/features/channel-product-config/`
- **Menu Category (reuse)**: `frontend/src/features/menu-category/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Type definitions and schema updates

- [ ] T001 [P] Delete `ChannelCategory` enum and `CHANNEL_CATEGORY_LABELS` from `frontend/src/features/channel-product-config/types/index.ts`
- [ ] T002 [P] Add `categoryId: string` and optional `category?: MenuCategoryDTO` to `ChannelProductConfig` type in `frontend/src/features/channel-product-config/types/index.ts`
- [ ] T003 [P] Update `CreateChannelProductRequest` type: replace `channelCategory` with `categoryId` in `frontend/src/features/channel-product-config/types/index.ts`
- [ ] T004 [P] Update `UpdateChannelProductRequest` type: replace `channelCategory` with `categoryId` in `frontend/src/features/channel-product-config/types/index.ts`
- [ ] T005 [P] Update `ChannelProductQueryParams` type: replace `channelCategory` with `categoryId` in `frontend/src/features/channel-product-config/types/index.ts`

**Checkpoint**: Type definitions updated, all downstream code will show TypeScript errors

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core components and schema updates that MUST be complete before user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Update Zod schema: replace `channelCategory` validation with `categoryId` UUID validation in `frontend/src/features/channel-product-config/schemas/channelProductSchema.ts`
- [ ] T007 Create `CategorySelect` component in `frontend/src/features/channel-product-config/components/CategorySelect.tsx`
  - Props: `value`, `onChange`, `mode` ('create' | 'edit'), `currentCategory`, `disabled`, `placeholder`
  - Use `useMenuCategories` hook from O002
  - Show "(已隐藏)" label for hidden categories in edit mode
  - Support search/filter functionality
  - Display loading and error states
- [ ] T008 Update MSW mock handlers to use `categoryId` instead of `channelCategory` in `frontend/src/mocks/handlers/channelProductHandlers.ts`

**Checkpoint**: Foundation ready - CategorySelect component available, schemas updated

---

## Phase 3: User Story 1 - 管理员使用动态分类创建商品 (Priority: P1) 🎯 MVP

**Goal**: Enable administrators to create new products with dynamically loaded menu categories instead of hardcoded enum values.

**Independent Test**: Create a new product, select any visible menu category from the dropdown, verify product is created with correct `categoryId` UUID.

### Implementation for User Story 1

- [ ] T009 [US1] Update `ChannelProductBasicForm.tsx` to use `CategorySelect` component with `mode="create"` in `frontend/src/features/channel-product-config/components/ChannelProductBasicForm.tsx`
  - Replace hardcoded `ChannelCategory` Select options with `CategorySelect`
  - Set `includeHidden: false` for create mode
- [ ] T010 [US1] Update `channelProductService.ts` to use `categoryId` in create request in `frontend/src/features/channel-product-config/services/channelProductService.ts`
- [ ] T011 [US1] Update `useChannelProductStore.ts` to handle `categoryId` field in `frontend/src/features/channel-product-config/stores/useChannelProductStore.ts`

**Checkpoint**: User Story 1 complete - administrators can create products with dynamic categories

---

## Phase 4: User Story 2 - 管理员编辑商品分类 (Priority: P1)

**Goal**: Enable administrators to edit product category assignments, including proper handling of hidden categories.

**Independent Test**: Edit an existing product, change its category, verify the update persists and displays correctly.

### Implementation for User Story 2

- [ ] T012 [US2] Update `ChannelProductBasicForm.tsx` edit mode to use `CategorySelect` with `mode="edit"` and pass `currentCategory` prop in `frontend/src/features/channel-product-config/components/ChannelProductBasicForm.tsx`
  - Pass current product's `category` to `CategorySelect` for hidden category display
- [ ] T013 [US2] Update `channelProductService.ts` to use `categoryId` in update request in `frontend/src/features/channel-product-config/services/channelProductService.ts`
- [ ] T014 [US2] Update `ChannelProductTable.tsx` to display category name from `category.displayName` in `frontend/src/features/channel-product-config/components/ChannelProductTable.tsx`
  - Handle case where `category` is undefined (show "未知分类")

**Checkpoint**: User Story 2 complete - administrators can edit product categories, hidden categories handled correctly

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Filter functionality and final cleanup

- [ ] T015 [P] Update `ChannelProductFilter.tsx` to use dynamic category list for filtering in `frontend/src/features/channel-product-config/components/ChannelProductFilter.tsx`
  - Use `useMenuCategories({ includeHidden: true })` to show all categories in filter
  - Update filter query to use `categoryId` parameter
- [ ] T016 [P] Clean up unused imports of `ChannelCategory` and `CHANNEL_CATEGORY_LABELS` across all modified files
- [ ] T017 Run TypeScript compilation to verify no type errors: `cd frontend && npm run build`
- [ ] T018 Run unit tests: `cd frontend && npm run test:unit`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3, 4)**: All depend on Foundational phase completion
  - US1 and US2 can proceed sequentially (both P1, but US2 builds on US1 form changes)
- **Polish (Phase 5)**: Depends on all user stories being complete

### Within Each User Story

- Type changes (Phase 1) must complete before schema updates (Phase 2)
- Schema updates must complete before component changes
- Form component updates before service updates
- All form/service updates before store updates

### Parallel Opportunities

- All Phase 1 tasks (T001-T005) can run in parallel
- T015 and T016 in Phase 5 can run in parallel
- Different files in the same user story marked [P] can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T008)
3. Complete Phase 3: User Story 1 (T009-T011)
4. **STOP and VALIDATE**: Test product creation with dynamic categories
5. Deploy/demo if ready

### Full Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test create flow → Checkpoint
3. Add User Story 2 → Test edit flow → Checkpoint
4. Complete Polish → Full feature validation

---

## Files Modified Summary

| File | Changes |
|------|---------|
| `types/index.ts` | Delete `ChannelCategory` enum, add `categoryId` field |
| `schemas/channelProductSchema.ts` | UUID validation for `categoryId` |
| `components/CategorySelect.tsx` | **New file** - dynamic category select component |
| `components/ChannelProductBasicForm.tsx` | Use `CategorySelect` component |
| `components/ChannelProductFilter.tsx` | Dynamic category filter |
| `components/ChannelProductTable.tsx` | Display `category.displayName` |
| `services/channelProductService.ts` | Use `categoryId` in API calls |
| `stores/useChannelProductStore.ts` | Update type references |
| `mocks/handlers/channelProductHandlers.ts` | Use `categoryId` in mock data |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each phase or logical group
- Stop at any checkpoint to validate story independently
- Reuse `useMenuCategories` hook from O002 - do not duplicate API calls
