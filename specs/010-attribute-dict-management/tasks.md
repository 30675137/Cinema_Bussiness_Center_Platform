---
description: "Task list for attribute template and data dictionary management feature implementation"
---

# Tasks: 属性模板与数据字典管理

**Input**: Design documents from `/specs/010-attribute-dict-management/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Included (TDD approach per constitution requirement - 测试驱动开发)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend project**: `frontend/src/` at repository root
- **Feature module** (data layer): `frontend/src/features/attribute-dictionary/` (stores, types, utils - partially implemented)
- **Page module** (UI layer): `frontend/src/pages/mdm-pim/attribute/` (services, hooks, components - new)
- **Mocks**: `frontend/src/mocks/handlers/attributeHandlers.ts`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and route configuration

- [x] T001 Create feature directory structure at `frontend/src/features/attribute-dictionary/` (stores/, types/, utils/)
- [x] T002 [P] Create base TypeScript type definitions in `frontend/src/features/attribute-dictionary/types/index.ts`
- [x] T003 [P] Create Zustand store for dictionary in `frontend/src/features/attribute-dictionary/stores/dictionaryStore.ts`
- [x] T004 [P] Create Zustand store for templates in `frontend/src/features/attribute-dictionary/stores/attributeTemplateStore.ts`
- [x] T005 [P] Create validation utilities using Zod in `frontend/src/features/attribute-dictionary/utils/validators.ts`
- [x] T006 [P] Create code generation utility in `frontend/src/features/attribute-dictionary/utils/codeGenerator.ts`
- [x] T007 Create page directory structure at `frontend/src/pages/mdm-pim/attribute/` with subdirectories: types/, services/, hooks/, components/atoms/, components/molecules/, components/organisms/
- [x] T008 [P] Configure route for attribute dictionary page at `/mdm-pim/attribute` in `frontend/src/router/index.tsx`
- [x] T009 [P] Create main page entry component with tab layout in `frontend/src/pages/mdm-pim/attribute/index.tsx`
- [x] T010 [P] Create page-level types and query keys in `frontend/src/pages/mdm-pim/attribute/types/attribute.types.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T011 Create MSW mock data generator in `frontend/src/mocks/data/attributeMockData.ts` with initial dictionary types (容量单位, 口味, 包装形式) and sample items
- [x] T012 [P] Create MSW handlers for dictionary type APIs (GET/POST/PUT/DELETE /dictionary-types) in `frontend/src/mocks/handlers/attributeHandlers.ts`
- [x] T013 [P] Create MSW handlers for dictionary item APIs (GET/POST items, PUT/DELETE items/:id, batch-sort) in `frontend/src/mocks/handlers/attributeHandlers.ts`
- [x] T014 [P] Create MSW handlers for attribute template APIs (GET/POST/PUT/DELETE /attribute-templates, copy) in `frontend/src/mocks/handlers/attributeHandlers.ts`
- [x] T015 [P] Create MSW handlers for attribute APIs (POST/PUT/DELETE /attributes) in `frontend/src/mocks/handlers/attributeHandlers.ts`
- [x] T016 Register attribute handlers in `frontend/src/mocks/handlers/index.ts`
- [x] T017 Create class-based service for dictionary and template API calls in `frontend/src/pages/mdm-pim/attribute/services/attributeService.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 数据字典项管理 (Priority: P1) 🎯 MVP

**Goal**: 作为主数据管理员,我需要管理全局数据字典(容量单位、口味、包装形式、系列标签等),以便为商品录入提供标准化的可选值,确保数据一致性。

**Independent Test**: 可通过访问数据字典管理页面,创建、编辑、启用/停用字典项来独立测试。不依赖类目或商品数据即可验证完整功能。

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T018 [P] [US1] Unit test for dictionaryStore actions (add/update/delete type and items) in `frontend/src/features/attribute-dictionary/stores/__tests__/dictionaryStore.test.ts`
- [x] T019 [P] [US1] Unit test for code generator utility (pinyin conversion, conflict resolution) in `frontend/src/features/attribute-dictionary/utils/__tests__/codeGenerator.test.ts`
- [x] T020 [P] [US1] Unit test for dictionary validators (Zod schemas for DictionaryType, DictionaryItem) in `frontend/src/features/attribute-dictionary/utils/__tests__/validators.test.ts`
- [x] T021 [P] [US1] Integration test for dictionary type CRUD operations via MSW in `frontend/src/pages/mdm-pim/attribute/__tests__/dictionaryType.integration.test.ts`
- [x] T022 [P] [US1] Integration test for dictionary item CRUD operations via MSW in `frontend/src/pages/mdm-pim/attribute/__tests__/dictionaryItem.integration.test.ts`

### Implementation for User Story 1

- [x] T023 [P] [US1] Create TanStack Query hooks for dictionary type queries in `frontend/src/pages/mdm-pim/attribute/hooks/useDictionaryQueries.ts`
- [x] T024 [P] [US1] Create TanStack Query hooks for dictionary type mutations in `frontend/src/pages/mdm-pim/attribute/hooks/useDictionaryMutations.ts`
- [x] T025 [P] [US1] Create AttributeStatusTag atom component (active/inactive badge) in `frontend/src/pages/mdm-pim/attribute/components/atoms/AttributeStatusTag.tsx`
- [x] T026 [P] [US1] Create DictionaryTypeForm molecule component with Zod validation in `frontend/src/pages/mdm-pim/attribute/components/molecules/DictionaryTypeForm.tsx`
- [x] T027 [P] [US1] Create DictionaryItemForm molecule component with code auto-generation in `frontend/src/pages/mdm-pim/attribute/components/molecules/DictionaryItemForm.tsx`
- [x] T028 [P] [US1] Create DictionaryItemTable molecule component with status/search/filter in `frontend/src/pages/mdm-pim/attribute/components/molecules/DictionaryItemTable.tsx`
- [x] T029 [US1] Create DictionaryTypeList organism component with tabs for each type in `frontend/src/pages/mdm-pim/attribute/components/organisms/DictionaryTypeList.tsx`
- [x] T030 [US1] Create DictionaryItemDrawer organism component for create/edit items in `frontend/src/pages/mdm-pim/attribute/components/organisms/DictionaryItemDrawer.tsx`
- [x] T031 [US1] Integrate dictionary management into main page tab (字典管理 tab) in `frontend/src/pages/mdm-pim/attribute/index.tsx`
- [x] T032 [US1] Implement duplicate name validation (FR-004) - show error "该字典类型下名称已存在"
- [x] T033 [US1] Implement dictionary type deletion constraint (FR-001b) - block delete if has items or referenced by attributes
- [x] T034 [US1] Implement dictionary item search functionality with 300ms debounce per FR-006
- [x] T035 [US1] Implement dictionary item enable/disable toggle functionality per FR-005

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - 类目属性模板配置 (Priority: P2)

**Goal**: 作为主数据管理员,我需要为每个类目配置属性模板(定义该类目需要填写哪些属性),以便运营人员在创建SPU/SKU时能够按照标准结构填写商品信息。

**Independent Test**: 可通过选择一个类目,为其添加、编辑、删除属性模板来独立测试。测试时需要已有类目数据和字典数据,但不需要实际创建SPU/SKU即可验证功能。

### Tests for User Story 2

- [x] T036 [P] [US2] Unit test for attributeTemplateStore actions (add/update/delete template and attributes) in `frontend/src/features/attribute-dictionary/stores/__tests__/attributeTemplateStore.test.ts`
- [x] T037 [P] [US2] Unit test for attribute validators (select type must have dictionary or custom values) in `frontend/src/features/attribute-dictionary/utils/__tests__/validators.test.ts`
- [x] T038 [P] [US2] Integration test for attribute template CRUD via MSW in `frontend/src/pages/mdm-pim/attribute/__tests__/attributeTemplate.integration.test.ts`
- [x] T039 [P] [US2] Integration test for template copy functionality via MSW in `frontend/src/pages/mdm-pim/attribute/__tests__/templateCopy.integration.test.ts`

### Implementation for User Story 2

- [x] T040 [P] [US2] Create TanStack Query hooks for template queries in `frontend/src/pages/mdm-pim/attribute/hooks/useTemplateQueries.ts`
- [x] T041 [P] [US2] Create TanStack Query hooks for template and attribute mutations in `frontend/src/pages/mdm-pim/attribute/hooks/useTemplateMutations.ts`
- [ ] T042 [P] [US2] Create AttributeTypeTag atom component (text/number/select/boolean/date badges) in `frontend/src/pages/mdm-pim/attribute/components/atoms/AttributeTypeTag.tsx`
- [ ] T043 [P] [US2] Create CategorySelector molecule component using existing category tree query in `frontend/src/pages/mdm-pim/attribute/components/molecules/CategorySelector.tsx`
- [ ] T044 [P] [US2] Create AttributeTemplateForm molecule component with category binding in `frontend/src/pages/mdm-pim/attribute/components/molecules/AttributeTemplateForm.tsx`
- [ ] T045 [P] [US2] Create AttributeForm molecule component with type/dictionary/customValues config in `frontend/src/pages/mdm-pim/attribute/components/molecules/AttributeForm.tsx`
- [ ] T046 [P] [US2] Create AttributeTable molecule component displaying template attributes in `frontend/src/pages/mdm-pim/attribute/components/molecules/AttributeTable.tsx`
- [ ] T047 [US2] Create TemplateList organism component with category filter in `frontend/src/pages/mdm-pim/attribute/components/organisms/TemplateList.tsx`
- [ ] T048 [US2] Create AttributeDrawer organism component for create/edit attributes in `frontend/src/pages/mdm-pim/attribute/components/organisms/AttributeDrawer.tsx`
- [ ] T049 [US2] Implement template copy modal with conflict handling (_copy suffix per FR-012) in `frontend/src/pages/mdm-pim/attribute/components/molecules/TemplateCopyModal.tsx`
- [ ] T050 [US2] Integrate template management into main page tab (属性模板 tab) in `frontend/src/pages/mdm-pim/attribute/index.tsx`
- [ ] T051 [US2] Implement select type validation (FR-010) - require dictionaryTypeId or customValues for single-select/multi-select
- [ ] T052 [US2] Implement attribute deletion constraint (FR-013) - block delete if used by SPU/SKU with warning "该属性已在商品中使用,为保证数据一致性,不支持直接删除"
- [ ] T053 [US2] Implement attribute type change prevention (FR-024) - disable type selector if attribute has usageCount > 0, show suggestion "建议创建新属性(如'属性名_v2')"
- [ ] T054 [US2] Implement default value configuration (FR-009a) in attribute form

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 4 - SPU/SKU表单动态生成 (Priority: P2)

**Goal**: 作为运营人员,我需要在创建或编辑SPU/SKU时,根据选择的类目自动加载该类目的属性模板并生成对应的输入控件,以便按照标准化流程填写商品信息。

**Independent Test**: 可通过创建SPU时选择不同类目,验证表单字段的动态生成和必填校验。

### Tests for User Story 4

- [ ] T055 [P] [US4] Unit test for DynamicFormField component rendering all 6 attribute types in `frontend/src/pages/mdm-pim/attribute/components/__tests__/DynamicFormField.test.tsx`
- [ ] T056 [P] [US4] Integration test for form generation based on category template in `frontend/src/pages/mdm-pim/attribute/__tests__/dynamicForm.integration.test.ts`
- [ ] T057 [P] [US4] Integration test for category switch clearing form data with confirmation in `frontend/src/pages/mdm-pim/attribute/__tests__/categorySwitch.integration.test.ts`

### Implementation for User Story 4

- [ ] T058 [P] [US4] Create DynamicFormField molecule component mapping attribute types to Ant Design controls in `frontend/src/pages/mdm-pim/attribute/components/molecules/DynamicFormField.tsx`
- [ ] T059 [US4] Create DynamicAttributeForm organism component loading template by categoryId in `frontend/src/pages/mdm-pim/attribute/components/organisms/DynamicAttributeForm.tsx`
- [ ] T060 [US4] Create shared DynamicFormRenderer component for SPU/SKU integration in `frontend/src/components/DynamicForm/DynamicFormRenderer.tsx`
- [ ] T061 [US4] Implement form control mapping per FR-016 (text→Input, number→InputNumber, single-select→Select, multi-select→Select mode="multiple", boolean→Switch, date→DatePicker)
- [ ] T062 [US4] Implement required field validation on form submit per FR-017
- [ ] T063 [US4] Implement category switch confirmation modal per FR-020 with data clearing warning "切换类目将清空已填写内容,是否继续?"
- [ ] T064 [US4] Implement default value auto-fill from template configuration per FR-009a
- [ ] T065 [US4] Implement deprecated dictionary item display (FR-019) - read-only gray state with tooltip "该选项已停用，无法修改" for inactive items in existing SPU

**Checkpoint**: At this point, User Stories 1, 2, AND 4 should all work independently

---

## Phase 6: User Story 3 - 字典项排序与显示控制 (Priority: P3)

**Goal**: 作为主数据管理员,我需要控制字典项的显示顺序和状态,以便在SPU/SKU录入界面中按照业务优先级展示选项,提升运营效率。

**Independent Test**: 可通过调整字典项的显示顺序字段,验证在下拉列表中的排序效果。

### Tests for User Story 3

- [ ] T066 [P] [US3] Unit test for batch sort update action in dictionaryStore in `frontend/src/features/attribute-dictionary/stores/__tests__/dictionaryStore.test.ts`
- [ ] T067 [P] [US3] Integration test for sort order persistence and effect on dropdowns in `frontend/src/pages/mdm-pim/attribute/__tests__/sortOrder.integration.test.ts`

### Implementation for User Story 3

- [ ] T068 [US3] Add drag-and-drop sort functionality to DictionaryItemTable in `frontend/src/pages/mdm-pim/attribute/components/molecules/DictionaryItemTable.tsx`
- [ ] T069 [US3] Implement batch sort update API call (POST /dictionary-items/batch-update-sort) and cache invalidation
- [ ] T070 [US3] Update DynamicFormField to sort dropdown options by dictionary item sort field per FR-007
- [ ] T071 [US3] Implement active-only item filtering in dropdowns per FR-005 and FR-018

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T072 [P] Create permission control hook (usePermission) per FR-021/FR-022/FR-023 in `frontend/src/pages/mdm-pim/attribute/hooks/usePermission.ts`
- [ ] T073 [P] Implement read-only mode for non-admin users - hide edit/delete buttons per FR-023
- [ ] T074 [P] Add loading states (Skeleton UI) for all list components
- [ ] T075 [P] Add error boundaries and error handling UI with toast notifications
- [ ] T076 [P] Add empty state components for lists with no data
- [ ] T077 [P] Add virtual scrolling to DictionaryItemTable for 200+ items per SC-006
- [ ] T078 Code cleanup - ensure consistent naming conventions per project patterns
- [ ] T079 Run TypeScript type check (npx tsc --noEmit) and fix any type errors
- [ ] T080 Run ESLint and fix any linting issues
- [ ] T081 E2E test for dictionary management workflow in `frontend/tests/e2e/attribute-dictionary/dictionary.spec.ts`
- [ ] T082 E2E test for template management workflow in `frontend/tests/e2e/attribute-dictionary/template.spec.ts`
- [ ] T083 Run quickstart.md validation - verify all implementation matches guide

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately (T001-T006 already complete)
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US4 → US3)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 2 - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Phase 2 - Uses dictionary data from US1 for select type binding but can use mock data
- **User Story 4 (P2)**: Can start after Phase 2 - Uses template data from US2 but can use mock data
- **User Story 3 (P3)**: Can start after Phase 2 - Extends US1 functionality but can be tested independently

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD)
- Atoms before molecules before organisms
- Hooks/queries before components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational MSW handler tasks (T012-T015) can run in parallel
- Once Foundational phase completes, all user stories can start in parallel
- All tests for a user story marked [P] can run in parallel
- Atom and molecule components within a story marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (write FIRST, should FAIL):
Task: "T018 [P] [US1] Unit test for dictionaryStore actions"
Task: "T019 [P] [US1] Unit test for code generator utility"
Task: "T020 [P] [US1] Unit test for dictionary validators"
Task: "T021 [P] [US1] Integration test for dictionary type CRUD"
Task: "T022 [P] [US1] Integration test for dictionary item CRUD"

# Then launch atom/molecule components together (after hooks):
Task: "T025 [P] [US1] Create AttributeStatusTag atom component"
Task: "T026 [P] [US1] Create DictionaryTypeForm molecule component"
Task: "T027 [P] [US1] Create DictionaryItemForm molecule component"
Task: "T028 [P] [US1] Create DictionaryItemTable molecule component"
```

---

## Parallel Example: Foundational Phase

```bash
# Launch all MSW handlers together:
Task: "T012 [P] Create MSW handlers for dictionary type APIs"
Task: "T013 [P] Create MSW handlers for dictionary item APIs"
Task: "T014 [P] Create MSW handlers for attribute template APIs"
Task: "T015 [P] Create MSW handlers for attribute APIs"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T010, some already done)
2. Complete Phase 2: Foundational (T011-T017)
3. Complete Phase 3: User Story 1 (T018-T035)
4. **STOP and VALIDATE**: Test dictionary management independently
5. Deploy/demo if ready - this is a complete, valuable feature!

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (attribute templates)
4. Add User Story 4 → Test independently → Deploy/Demo (dynamic forms)
5. Add User Story 3 → Test independently → Deploy/Demo (sorting/display)
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (dictionary management)
   - Developer B: User Story 2 (attribute templates)
3. After US1 + US2 complete:
   - Developer A: User Story 4 (dynamic forms)
   - Developer B: User Story 3 (sorting)
4. Stories complete and integrate independently

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| Phase 1: Setup | T001-T010 | Project structure and routing (T001-T006 complete) |
| Phase 2: Foundational | T011-T017 | MSW handlers and service layer |
| Phase 3: US1 (P1) | T018-T035 | Dictionary management (MVP) |
| Phase 4: US2 (P2) | T036-T054 | Attribute template configuration |
| Phase 5: US4 (P2) | T055-T065 | Dynamic form generation |
| Phase 6: US3 (P3) | T066-T071 | Sorting and display control |
| Phase 7: Polish | T072-T083 | Cross-cutting improvements |

**Total Tasks**: 83
**Tasks by User Story**:
- Setup: 10 (6 complete)
- Foundational: 7
- US1: 18 (including 5 test tasks)
- US2: 19 (including 4 test tasks)
- US4: 11 (including 3 test tasks)
- US3: 6 (including 2 test tasks)
- Polish: 12

**Parallel Opportunities**: 42 tasks marked [P]
**MVP Scope**: Phase 1 remaining + Phase 2 + Phase 3 = 4 + 7 + 18 = 29 tasks

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests FAIL before implementing (TDD per constitution)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Existing implementations in `features/attribute-dictionary/` (stores, types, validators, codeGenerator) are partially complete - verify and extend as needed
- Performance targets: <500ms search response (SC-005), <1s form field loading (SC-003)
- Support up to 50 dictionary types with 200 items each (SC-006)
