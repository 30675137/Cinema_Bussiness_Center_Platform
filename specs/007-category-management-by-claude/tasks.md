# Tasks: 类目管理 (Category Management) - 纯前端实现

**Input**: Design documents from `/specs/007-category-management/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/api.yaml
**Scope**: 纯前端UI实现，通过Mock数据模拟后端API，不考虑权限控制

**Tests**: 包含基本测试任务，使用Vitest + React Testing Library进行组件测试

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/src/`, `frontend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create category management directory structure per implementation plan
- [ ] T002 [P] Set up TypeScript type definitions in frontend/src/pages/category-management/types/category.types.ts
- [ ] T003 [P] Create query keys management in frontend/src/services/queryKeys.ts
- [ ] T004 Create Zustand store for UI state in frontend/src/stores/categoryStore.ts
- [ ] T005 Set up MSW handlers for category API in frontend/src/mocks/handlers/categoryHandlers.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core components that all user stories depend on

- [ ] T006 [P] Create base API service functions in frontend/src/services/category/categoryService.ts
- [ ] T007 [P] Create TanStack Query hooks in frontend/src/services/category/categoryQueries.ts
- [ ] T008 [P] Create TanStack Query mutations in frontend/src/services/category/categoryMutations.ts
- [ ] T009 [P] Implement utility functions in frontend/src/utils/categoryUtils.ts
- [ ] T010 [P] Create Mock data generator in frontend/src/mocks/data/categoryMockData.ts

---

## Phase 3: User Story 1 - 类目树浏览与基本信息查看 (P1)

**Story Goal**: Display hierarchical category tree and show basic category information
**Independent Test**: Verify users can see complete category tree and view details by clicking nodes
**Implementation Order**: Tree → Detail Panel → Search → Integration

- [ ] T011 [US1] Create main category management page layout in frontend/src/pages/category-management/CategoryManagement.tsx
- [ ] T012 [P] [US1] Create CategoryTree component in frontend/src/pages/category-management/components/CategoryTree.tsx
- [ ] T013 [P] [US1] Create CategoryDetail component in frontend/src/pages/category-management/components/CategoryDetail.tsx
- [ ] T014 [P] [US1] Implement category search functionality in CategoryTree component
- [ ] T015 [US1] Integrate CategoryTree and CategoryDetail in main page
- [ ] T016 [P] [US1] Add virtual scrolling and lazy loading to CategoryTree component

---

## Phase 4: User Story 2 - 类目创建与编辑 (P1)

**Story Goal**: Create new categories and edit existing category information
**Independent Test**: Verify users can successfully create new categories and edit category information
**Implementation Order**: Form Component → Create Modal → Edit Mode → Integration

- [ ] T017 [US2] Create CategoryForm component in frontend/src/pages/category-management/components/CategoryForm.tsx
- [ ] T018 [P] [US2] Implement create category modal with form validation
- [ ] T019 [P] [US2] Implement edit category functionality with read/write mode switching
- [ ] T020 [US2] Add parent category selection and automatic level determination
- [ ] T021 [US2] Integrate CategoryForm with CategoryTree and CategoryDetail

---

## Phase 5: User Story 3 - 类目状态管理与删除控制 (P1)

**Story Goal**: Enable/disable categories and control deletion based on SPU usage
**Independent Test**: Verify status switching works and deletion is properly controlled
**Implementation Order**: Status Toggle → Delete Controls → Confirmation Dialogs → SPU Integration

- [ ] T022 [US3] Add status toggle (enable/disable) functionality to CategoryDetail component
- [ ] T023 [P] [US3] Implement delete button with usage checking in CategoryDetail
- [ ] T024 [P] [US3] Create confirmation dialogs for status changes and deletion
- [ ] T025 [US3] Add visual indicators (Tag/Badge) for category status in CategoryTree
- [ ] T026 [P] [US3] Implement SPU usage checking logic in categoryHandlers.ts

---

## Phase 6: User Story 4 - 属性模板配置 (P2)

**Story Goal**: Configure attribute templates for categories with various attribute types
**Independent Test**: Verify users can add/edit/delete attributes and templates work correctly
**Implementation Order**: Template List → Attribute Form → Attribute Types → Integration

- [ ] T027 [US4] Create AttributeTemplate component in frontend/src/pages/category-management/components/AttributeTemplate.tsx
- [ ] T028 [P] [US4] Implement attribute list display with table format
- [ ] T029 [P] [US4] Create attribute configuration form modal
- [ ] T030 [P] [US4] Implement support for all attribute types (text/number/single-select/multi-select)
- [ ] T031 [US4] Add optional values input with TextArea for select types
- [ ] T032 [P] [US4] Implement add/edit/delete attribute functionality
- [ ] T033 [US4] Add AutoComplete component for long optional value lists
- [ ] T034 [US4] Integrate AttributeTemplate with CategoryDetail

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Performance optimization, error handling, and final touches

- [ ] T035 Add error handling and loading states throughout all components
- [ ] T036 [P] Implement optimistic updates for better user experience
- [ ] T037 [P] Add toast notifications for user feedback (success/error messages)
- [ ] T038 [P] Optimize CategoryTree performance for 1000+ nodes
- [ ] T039 Implement proper form validation with error messages
- [ ] T040 [P] Add responsive design for different screen sizes
- [ ] T041 Add keyboard navigation and accessibility features

---

## Testing Phase (Optional)

**Purpose**: Ensure component reliability and user experience

- [ ] T042 [P] Create unit tests for CategoryService in frontend/tests/services/category/categoryService.test.ts
- [ ] T043 [P] Create unit tests for utility functions in frontend/tests/utils/categoryUtils.test.ts
- [ ] T044 [P] Create component tests for CategoryTree in frontend/tests/category-management/components/CategoryTree.test.tsx
- [ ] T045 [P] Create component tests for CategoryForm in frontend/tests/category-management/components/CategoryForm.test.tsx
- [ ] T046 [P] Create integration tests for main CategoryManagement page

---

## Dependencies

### Story Completion Order (Recommended)

1. **US1 (P1)** - Tree browsing and basic viewing (Foundation for all other stories)
2. **US2 (P1)** - Category creation and editing (Core functionality)
3. **US3 (P1)** - Status management and deletion (Data integrity)
4. **US4 (P2)** - Attribute templates (Advanced features)

### Inter-Story Dependencies

- US2, US3, US4 → US1 (All depend on basic tree structure from US1)
- US4 → US2 (Attribute templates may reference category creation)
- No circular dependencies

### Parallel Execution Opportunities

Within each user story phase:
- Component creation can be parallelized (T012, T013 in US1)
- Service layer tasks can be parallelized (T007, T008 in Foundational)
- Utility functions can be parallelized (T009, T010 in Foundational)
- Testing tasks can be parallelized (T042-T046 in Testing Phase)

---

## Implementation Strategy

### MVP Scope (First Delivery)

**Recommended first release**: Complete User Story 1 (US1) + basic setup
- Phase 1: Setup
- Phase 2: Foundational
- Phase 3: User Story 1 - Tree browsing and basic viewing
- Testing: Basic component tests for US1

**MVP deliverables**:
- Functional category tree with expand/collapse
- Category detail viewing
- Basic search functionality
- Mock data integration

### Incremental Delivery Plan

1. **Sprint 1**: Setup + US1 (Tree browsing) - Core navigation and viewing
2. **Sprint 2**: US2 (Create/Edit) - Basic category management operations
3. **Sprint 3**: US3 (Status/Delete) - Data integrity and lifecycle management
4. **Sprint 4**: US4 (Attributes) - Advanced configuration features
5. **Sprint 5**: Polish & Testing - Performance, UX, and comprehensive testing

### Risk Mitigation

- **Performance**: Implement virtual scrolling early (T016) to handle large category trees
- **Data Integrity**: Implement SPU checking logic before deletion features (T026)
- **User Experience**: Add loading states and error handling throughout (T035)
- **Mock Data Limitations**: Ensure localStorage persistence works correctly for cross-session data

---

## Technical Notes

### Mock Data Strategy

- Use MSW for API simulation
- Implement localStorage for persistence across page refreshes
- Generate realistic test data with proper hierarchical relationships
- Support data mutation (create/update/delete) with automatic localStorage sync

### Performance Considerations

- CategoryTree: Virtual scrolling + lazy loading for 1000+ nodes
- TanStack Query: Proper cache configuration with staleTime/gcTime
- Component rendering: Use React.memo where appropriate
- Bundle size: Lazy load components if needed

### State Management

- **Server State**: TanStack Query (categories, attribute templates, SPU references)
- **UI State**: Zustand (expandedKeys, selectedCategoryId, searchKeyword, isEditing)
- **Form State**: React Hook Form (CategoryForm, AttributeTemplate forms)