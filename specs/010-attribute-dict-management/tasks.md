---
description: "Task list for attribute template and data dictionary management feature implementation"
---

# Tasks: 属性模板与数据字典管理

**Input**: Design documents from `/specs/010-attribute-dict-management/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Tests are OPTIONAL for this feature. Only include test tasks if explicitly requested.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend project**: `frontend/src/` at repository root
- **Feature module**: `frontend/src/features/attribute-dictionary/`
- **Pages**: `frontend/src/pages/attribute-dictionary/`
- **Mocks**: `frontend/src/mocks/handlers/attribute-dictionary.ts`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create feature directory structure at frontend/src/features/attribute-dictionary/
- [x] T002 [P] Create subdirectories: components/atoms/, components/molecules/, components/organisms/, hooks/, services/, stores/, types/, utils/
- [x] T003 [P] Install required dependencies: pinyin-pro, @hookform/resolvers, zod@4.1.13
- [x] T004 [P] Create base TypeScript type definitions in frontend/src/features/attribute-dictionary/types/index.ts
- [x] T005 [P] Create utility functions directory structure in frontend/src/features/attribute-dictionary/utils/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Create DictionaryType type definition in frontend/src/features/attribute-dictionary/types/index.ts
- [ ] T007 Create DictionaryItem type definition in frontend/src/features/attribute-dictionary/types/index.ts
- [ ] T008 Create AttributeTemplate type definition in frontend/src/features/attribute-dictionary/types/index.ts
- [ ] T009 Create Attribute type definition in frontend/src/features/attribute-dictionary/types/index.ts
- [ ] T010 [P] Create code generation utility using pinyin-pro in frontend/src/features/attribute-dictionary/utils/codeGenerator.ts
- [ ] T011 [P] Create validation utilities using Zod in frontend/src/features/attribute-dictionary/utils/validators.ts
- [ ] T012 Create Zustand store structure for dictionary management in frontend/src/features/attribute-dictionary/stores/dictionaryStore.ts
- [ ] T013 Create Zustand store structure for attribute template management in frontend/src/features/attribute-dictionary/stores/attributeTemplateStore.ts
- [ ] T014 Configure localStorage persistence middleware for Zustand stores
- [ ] T015 Create MSW handlers file structure in frontend/src/mocks/handlers/attribute-dictionary.ts
- [ ] T016 Create base API service structure in frontend/src/features/attribute-dictionary/services/api.ts
- [ ] T017 Create TanStack Query hooks structure in frontend/src/features/attribute-dictionary/hooks/useDictionaryQueries.ts
- [ ] T018 Create permission hook for role-based access control in frontend/src/features/attribute-dictionary/hooks/usePermission.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 数据字典项管理 (Priority: P1) 🎯 MVP

**Goal**: 作为主数据管理员,我需要管理全局数据字典(容量单位、口味、包装形式、系列标签等),以便为商品录入提供标准化的可选值,确保数据一致性。

**Independent Test**: 可通过访问数据字典管理页面,创建、编辑、启用/停用字典项来独立测试。不依赖类目或商品数据即可验证完整功能。

### Implementation for User Story 1

- [ ] T019 [P] [US1] Create DictionaryType model interface in frontend/src/features/attribute-dictionary/types/index.ts
- [ ] T020 [P] [US1] Create DictionaryItem model interface in frontend/src/features/attribute-dictionary/types/index.ts
- [ ] T021 [US1] Implement code generation function with conflict resolution in frontend/src/features/attribute-dictionary/utils/codeGenerator.ts
- [ ] T022 [US1] Implement DictionaryType Zod validation schema in frontend/src/features/attribute-dictionary/utils/validators.ts
- [ ] T023 [US1] Implement DictionaryItem Zod validation schema in frontend/src/features/attribute-dictionary/utils/validators.ts
- [ ] T024 [US1] Create Zustand store for DictionaryType management in frontend/src/features/attribute-dictionary/stores/dictionaryStore.ts
- [ ] T025 [US1] Create Zustand store for DictionaryItem management in frontend/src/features/attribute-dictionary/stores/dictionaryStore.ts
- [ ] T026 [US1] Implement localStorage persistence for dictionary stores
- [ ] T027 [US1] Create API service for DictionaryType CRUD in frontend/src/features/attribute-dictionary/services/dictionaryTypeService.ts
- [ ] T028 [US1] Create API service for DictionaryItem CRUD in frontend/src/features/attribute-dictionary/services/dictionaryItemService.ts
- [ ] T029 [US1] Create TanStack Query hooks for DictionaryType in frontend/src/features/attribute-dictionary/hooks/useDictionaryTypeQueries.ts
- [ ] T030 [US1] Create TanStack Query hooks for DictionaryItem in frontend/src/features/attribute-dictionary/hooks/useDictionaryItemQueries.ts
- [ ] T031 [US1] Create MSW handlers for /api/dictionary-types endpoints in frontend/src/mocks/handlers/attribute-dictionary.ts
- [ ] T032 [US1] Create MSW handlers for /api/dictionary-types/{typeId}/items endpoints in frontend/src/mocks/handlers/attribute-dictionary.ts
- [ ] T033 [US1] Create MSW handlers for /api/dictionary-items/{itemId} endpoints in frontend/src/mocks/handlers/attribute-dictionary.ts
- [ ] T034 [P] [US1] Create DictionaryTypeList component (atoms) in frontend/src/features/attribute-dictionary/components/atoms/DictionaryTypeList.tsx
- [ ] T035 [P] [US1] Create DictionaryItemList component (atoms) in frontend/src/features/attribute-dictionary/components/atoms/DictionaryItemList.tsx
- [ ] T036 [P] [US1] Create DictionaryTypeForm component (molecules) in frontend/src/features/attribute-dictionary/components/molecules/DictionaryTypeForm.tsx
- [ ] T037 [P] [US1] Create DictionaryItemForm component (molecules) in frontend/src/features/attribute-dictionary/components/molecules/DictionaryItemForm.tsx
- [ ] T038 [US1] Create DictionaryManagementPage component (organisms) in frontend/src/features/attribute-dictionary/components/organisms/DictionaryManagementPage.tsx
- [ ] T039 [US1] Implement tab-based navigation for dictionary types in DictionaryManagementPage
- [ ] T040 [US1] Implement dictionary item search functionality with debounce
- [ ] T041 [US1] Implement dictionary item enable/disable toggle functionality
- [ ] T042 [US1] Implement duplicate name validation within dictionary type
- [ ] T043 [US1] Implement code auto-generation with manual override in DictionaryItemForm
- [ ] T044 [US1] Create page route component in frontend/src/pages/attribute-dictionary/DictionaryManagementPage.tsx
- [ ] T045 [US1] Add route configuration for /attribute-dictionary/dictionary in frontend/src/router/routes.tsx
- [ ] T046 [US1] Add menu item for "数据字典管理" in frontend/src/components/layout/AppLayout.tsx
- [ ] T047 [US1] Implement permission-based UI rendering (hide edit buttons for read-only roles)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - 类目属性模板配置 (Priority: P2)

**Goal**: 作为主数据管理员,我需要为每个类目配置属性模板(定义该类目需要填写哪些属性),以便运营人员在创建SPU/SKU时能够按照标准结构填写商品信息。

**Independent Test**: 可通过选择一个类目,为其添加、编辑、删除属性模板来独立测试。测试时需要已有类目数据和字典数据,但不需要实际创建SPU/SKU即可验证功能。

### Implementation for User Story 2

- [ ] T048 [P] [US2] Create AttributeTemplate model interface in frontend/src/features/attribute-dictionary/types/index.ts
- [ ] T049 [P] [US2] Create Attribute model interface in frontend/src/features/attribute-dictionary/types/index.ts
- [ ] T050 [US2] Implement AttributeTemplate Zod validation schema in frontend/src/features/attribute-dictionary/utils/validators.ts
- [ ] T051 [US2] Implement Attribute Zod validation schema in frontend/src/features/attribute-dictionary/utils/validators.ts
- [ ] T052 [US2] Create Zustand store for AttributeTemplate management in frontend/src/features/attribute-dictionary/stores/attributeTemplateStore.ts
- [ ] T053 [US2] Create Zustand store for Attribute management in frontend/src/features/attribute-dictionary/stores/attributeTemplateStore.ts
- [ ] T054 [US2] Implement localStorage persistence for attribute template stores
- [ ] T055 [US2] Create API service for AttributeTemplate CRUD in frontend/src/features/attribute-dictionary/services/attributeTemplateService.ts
- [ ] T056 [US2] Create API service for Attribute CRUD in frontend/src/features/attribute-dictionary/services/attributeService.ts
- [ ] T057 [US2] Create TanStack Query hooks for AttributeTemplate in frontend/src/features/attribute-dictionary/hooks/useAttributeTemplateQueries.ts
- [ ] T058 [US2] Create TanStack Query hooks for Attribute in frontend/src/features/attribute-dictionary/hooks/useAttributeQueries.ts
- [ ] T059 [US2] Create MSW handlers for /api/attribute-templates endpoints in frontend/src/mocks/handlers/attribute-dictionary.ts
- [ ] T060 [US2] Create MSW handlers for /api/attribute-templates/{templateId}/attributes endpoints in frontend/src/mocks/handlers/attribute-dictionary.ts
- [ ] T061 [US2] Create MSW handlers for /api/attributes/{attributeId} endpoints in frontend/src/mocks/handlers/attribute-dictionary.ts
- [ ] T062 [P] [US2] Create CategorySelector component (molecules) in frontend/src/features/attribute-dictionary/components/molecules/CategorySelector.tsx
- [ ] T063 [P] [US2] Create AttributeForm component (molecules) in frontend/src/features/attribute-dictionary/components/molecules/AttributeForm.tsx
- [ ] T064 [P] [US2] Create AttributeTemplateForm component (molecules) in frontend/src/features/attribute-dictionary/components/molecules/AttributeTemplateForm.tsx
- [ ] T065 [US2] Create AttributeTemplateManagementPage component (organisms) in frontend/src/features/attribute-dictionary/components/organisms/AttributeTemplateManagementPage.tsx
- [ ] T066 [US2] Implement category selection with three-level hierarchy display
- [ ] T067 [US2] Implement attribute type selection (text/number/single-select/multi-select/boolean/date)
- [ ] T068 [US2] Implement dictionary binding for select/multi-select attribute types
- [ ] T069 [US2] Implement custom values configuration for select/multi-select attributes
- [ ] T070 [US2] Implement default value configuration for attributes
- [ ] T071 [US2] Implement attribute sorting with drag-and-drop or number input
- [ ] T072 [US2] Implement template copy functionality from other categories
- [ ] T073 [US2] Implement conflict resolution for copied attribute names (auto-rename with suffix)
- [ ] T074 [US2] Implement validation: select/multi-select must have dictionary or custom values
- [ ] T075 [US2] Implement validation: prevent duplicate attribute names within template
- [ ] T076 [US2] Implement deletion prevention for attributes used in SPU/SKU
- [ ] T077 [US2] Create page route component in frontend/src/pages/attribute-dictionary/AttributeTemplateManagementPage.tsx
- [ ] T078 [US2] Add route configuration for /attribute-dictionary/template in frontend/src/router/routes.tsx
- [ ] T079 [US2] Add menu item for "类目属性模板配置" in frontend/src/components/layout/AppLayout.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - 字典项排序与显示控制 (Priority: P3)

**Goal**: 作为主数据管理员,我需要控制字典项的显示顺序和状态,以便在SPU/SKU录入界面中按照业务优先级展示选项,提升运营效率。

**Independent Test**: 可通过调整字典项的显示顺序字段,验证在下拉列表中的排序效果。

### Implementation for User Story 3

- [ ] T080 [US3] Implement sort order update functionality in DictionaryItem store
- [ ] T081 [US3] Create API service for batch sort update in frontend/src/features/attribute-dictionary/services/dictionaryItemService.ts
- [ ] T082 [US3] Create MSW handler for /api/dictionary-items/batch-update-sort endpoint in frontend/src/mocks/handlers/attribute-dictionary.ts
- [ ] T083 [US3] Create TanStack Query mutation hook for batch sort update in frontend/src/features/attribute-dictionary/hooks/useDictionaryItemQueries.ts
- [ ] T084 [P] [US3] Create SortOrderInput component (atoms) in frontend/src/features/attribute-dictionary/components/atoms/SortOrderInput.tsx
- [ ] T085 [US3] Implement drag-and-drop sort functionality in DictionaryItemList component
- [ ] T086 [US3] Implement batch sort update UI in DictionaryManagementPage
- [ ] T087 [US3] Implement filter to show only active dictionary items in SPU/SKU forms
- [ ] T088 [US3] Implement display of inactive items as read-only/grayed in edit mode
- [ ] T089 [US3] Update DictionaryItemList to display items sorted by sort field

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - SPU/SKU表单动态生成 (Priority: P2)

**Goal**: 作为运营人员,我需要在创建或编辑SPU/SKU时,根据选择的类目自动加载该类目的属性模板并生成对应的输入控件,以便按照标准化流程填写商品信息。

**Independent Test**: 可通过创建SPU时选择不同类目,验证表单字段的动态生成和必填校验。

### Implementation for User Story 4

- [ ] T090 [P] [US4] Create SPUAttributeValue type definition in frontend/src/features/attribute-dictionary/types/index.ts
- [ ] T091 [P] [US4] Create SKUAttributeValue type definition in frontend/src/features/attribute-dictionary/types/index.ts
- [ ] T092 [US4] Create dynamic form generator utility in frontend/src/features/attribute-dictionary/utils/formGenerator.ts
- [ ] T093 [US4] Create attribute-to-control mapping configuration in frontend/src/features/attribute-dictionary/utils/formFieldMapper.ts
- [ ] T094 [US4] Create API service for SPU attribute values in frontend/src/features/attribute-dictionary/services/spuAttributeService.ts
- [ ] T095 [US4] Create API service for SKU attribute values in frontend/src/features/attribute-dictionary/services/skuAttributeService.ts
- [ ] T096 [US4] Create TanStack Query hooks for SPU attributes in frontend/src/features/attribute-dictionary/hooks/useSpuAttributeQueries.ts
- [ ] T097 [US4] Create TanStack Query hooks for SKU attributes in frontend/src/features/attribute-dictionary/hooks/useSkuAttributeQueries.ts
- [ ] T098 [US4] Create MSW handlers for /api/spu-attributes endpoints in frontend/src/mocks/handlers/attribute-dictionary.ts
- [ ] T099 [US4] Create MSW handlers for /api/sku-attributes endpoints in frontend/src/mocks/handlers/attribute-dictionary.ts
- [ ] T100 [P] [US4] Create FormField component (atoms) for rendering different attribute types in frontend/src/features/attribute-dictionary/components/atoms/FormField.tsx
- [ ] T101 [P] [US4] Create DynamicFormGenerator component (molecules) in frontend/src/features/attribute-dictionary/components/molecules/DynamicFormGenerator.tsx
- [ ] T102 [US4] Implement React Hook Form integration in DynamicFormGenerator
- [ ] T103 [US4] Implement attribute template loading based on selected category
- [ ] T104 [US4] Implement form field generation based on attribute type (text/number/select/multi-select/boolean/date)
- [ ] T105 [US4] Implement dictionary item options loading for select/multi-select fields
- [ ] T106 [US4] Implement default value population for form fields
- [ ] T107 [US4] Implement required field validation using React Hook Form
- [ ] T108 [US4] Implement category change handler with data clearing and warning
- [ ] T109 [US4] Implement inactive dictionary item display as read-only in edit mode
- [ ] T110 [US4] Integrate DynamicFormGenerator into existing SPU creation form
- [ ] T111 [US4] Integrate DynamicFormGenerator into existing SKU creation form
- [ ] T112 [US4] Implement form submission with attribute values
- [ ] T113 [US4] Implement form field sorting based on attribute sort order

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T114 [P] Add virtual scrolling to DictionaryItemList for performance (200+ items)
- [ ] T115 [P] Add virtual scrolling to AttributeList for performance
- [ ] T116 [P] Implement debounced search across all list components (300ms delay)
- [ ] T117 [P] Add loading states and error handling to all API calls
- [ ] T118 [P] Add success/error toast notifications for all CRUD operations
- [ ] T119 [P] Implement keyboard navigation support for all forms
- [ ] T120 [P] Add accessibility labels and ARIA attributes to all interactive components
- [ ] T121 [P] Add unit tests for utility functions in frontend/src/features/attribute-dictionary/utils/
- [ ] T122 [P] Add unit tests for store actions in frontend/src/features/attribute-dictionary/stores/
- [ ] T123 [P] Add integration tests for API services in frontend/src/features/attribute-dictionary/services/
- [ ] T124 [P] Add E2E tests for dictionary management workflow in frontend/tests/e2e/attribute-dictionary/
- [ ] T125 [P] Add E2E tests for attribute template management workflow in frontend/tests/e2e/attribute-dictionary/
- [ ] T126 [P] Add E2E tests for dynamic form generation in frontend/tests/e2e/attribute-dictionary/
- [ ] T127 Update documentation in frontend/src/features/attribute-dictionary/README.md
- [ ] T128 Run quickstart.md validation checklist
- [ ] T129 Code cleanup and refactoring
- [ ] T130 Performance optimization: verify <500ms response time for search operations
- [ ] T131 Security hardening: input sanitization and XSS prevention
- [ ] T132 Verify permission control works correctly for all roles

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for dictionary data, but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on US1 for dictionary items, but should be independently testable
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 (dictionary) and US2 (attribute templates), but should be independently testable

### Within Each User Story

- Models before services
- Services before components
- Components: atoms → molecules → organisms
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, user stories can start in parallel (if team capacity allows)
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members
- All Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all type definitions together:
Task: "Create DictionaryType model interface in frontend/src/features/attribute-dictionary/types/index.ts"
Task: "Create DictionaryItem model interface in frontend/src/features/attribute-dictionary/types/index.ts"

# Launch all component atoms together:
Task: "Create DictionaryTypeList component (atoms) in frontend/src/features/attribute-dictionary/components/atoms/DictionaryTypeList.tsx"
Task: "Create DictionaryItemList component (atoms) in frontend/src/features/attribute-dictionary/components/atoms/DictionaryItemList.tsx"
Task: "Create DictionaryTypeForm component (molecules) in frontend/src/features/attribute-dictionary/components/molecules/DictionaryTypeForm.tsx"
Task: "Create DictionaryItemForm component (molecules) in frontend/src/features/attribute-dictionary/components/molecules/DictionaryItemForm.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 4 → Test independently → Deploy/Demo (enables SPU/SKU integration)
5. Add User Story 3 → Test independently → Deploy/Demo (UX enhancement)
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (dictionary management)
   - Developer B: User Story 2 (attribute templates) - can start after US1 has dictionary types
   - Developer C: User Story 4 (dynamic forms) - can start after US1 and US2 complete
   - Developer D: User Story 3 (sorting) - can start after US1 complete
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Performance targets: <500ms search response (SC-005), <1s form field loading (SC-003)
- Support up to 50 dictionary types with 200 items each (SC-006)

