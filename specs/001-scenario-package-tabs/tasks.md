---
description: "Task list for 场景包多标签页编辑界面 implementation"
---

# Tasks: 场景包多标签页编辑界面

**Input**: Design documents from `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/specs/001-scenario-package-tabs/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api.yaml

**Tests**: Tests are OPTIONAL per specification. This feature specification does NOT explicitly request TDD approach, therefore test tasks are NOT generated. Tests can be added later via separate implementation task.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Implementation Strategy

### MVP Scope (First Deliverable)
**User Story 1** (P1) - 多标签页导航与基础信息编辑
- Minimal viable product: Tab navigation + basic info form
- Independently testable: User can navigate tabs and save basic info
- Delivers core value: Foundation for all other tabs

### Incremental Delivery Order
1. **Phase 3 (US1)** → Deliver tab structure + basic info editing
2. **Phase 4 (US2)** → Add package management (P1 priority)
3. **Phase 7 (US5)** → Add publishing controls (P1 priority, validates US1+US2)
4. **Phase 5 (US3)** → Add add-on item association (P2 priority)
5. **Phase 6 (US4)** → Add time slot management (P2 priority, complex)

### Parallel Implementation Opportunities
- **Setup & Foundational** (Phase 1-2): Can run all [P] tasks in parallel
- **Per User Story**: Each story's [P] tasks can run in parallel (see sections below)

---

## Dependencies Between User Stories

```
Phase 1 (Setup) → Required by all
  ↓
Phase 2 (Foundational) → Required by all user stories
  ↓
  ├─→ Phase 3 (US1 - P1) → BLOCKS → Phase 7 (US5 - P1)
  │      ↓ (tab structure + routing)
  │      ├─→ Phase 4 (US2 - P1) [Independent after US1]
  │      ├─→ Phase 5 (US3 - P2) [Independent after US1]
  │      └─→ Phase 6 (US4 - P2) [Independent after US1]
  │
  └─→ Phase 8 (Polish) → After all user stories

Critical Path: Phase 1 → Phase 2 → Phase 3 (US1) → Phase 7 (US5)
Parallel Branches: US2, US3, US4 can develop in parallel after US1
```

---

## Phase 1: Setup (Project Initialization)

**Goal**: Prepare development environment and project structure

- [x] T001 [P] Install frontend dependencies: `npm install react@19.2.0 antd@6.1.0 react-hook-form@7.68.0 zod@4.1.13 @tanstack/react-query@5.90.12 zustand@5.0.9 @hookform/resolvers dayjs@1.11.19 axios` in `frontend/`
- [x] T002 [P] Install dev dependencies: `npm install -D @types/react @types/node vitest @testing-library/react @testing-library/user-event playwright msw@2.12.4` in `frontend/`
- [x] T003 [P] Create feature folder structure in `frontend/src/features/scenario-package-editor/`
- [x] T004 [P] Create TypeScript type definitions from data-model.md in `frontend/src/features/scenario-package-editor/types/index.ts`
- [x] T005 [P] Set up Zustand store for editor state in `frontend/src/features/scenario-package-editor/stores/useScenarioPackageStore.ts`
- [x] T006 [P] Set up TanStack Query hooks for API calls in `frontend/src/features/scenario-package-editor/hooks/useScenarioPackageQueries.ts`
- [x] T007 [P] Create Zod validation schemas from data-model.md in `frontend/src/features/scenario-package-editor/schemas/validationSchemas.ts`
- [x] T008 [P] Set up Axios API client with base configuration in `frontend/src/features/scenario-package-editor/services/apiClient.ts`
- [x] T009 Create MSW mock handlers for scenario package APIs in `frontend/src/mocks/handlers/scenarioPackageHandlers.ts`

**Parallel Execution**: Tasks T001-T008 can run in parallel (different files, no dependencies)

---

## Phase 2: Foundational Tasks (Blocking Prerequisites)

**Goal**: Build shared components and utilities required by all user stories

- [x] T010 [P] Create AppLayout component with sidebar in `frontend/src/components/layout/AppLayout.tsx`
- [x] T011 [P] Create React Router configuration with scenario package editor route in `frontend/src/components/layout/Router.tsx`
- [x] T012 [P] Implement image upload component using Ant Design Upload in `frontend/src/features/scenario-package-editor/components/forms/ImageUploader.tsx`
- [x] T013 [P] Create form field wrapper component for React Hook Form + Ant Design integration in `frontend/src/components/ui/FormField/`
- [x] T014 [P] Implement unsaved changes detection hook in `frontend/src/features/scenario-package-editor/hooks/useFormDirtyState.ts`
- [x] T015 [P] Create tab change confirmation Modal component in `frontend/src/features/scenario-package-editor/components/molecules/UnsavedChangesAlert.tsx`
- [x] T016 [P] Set up API service layer for scenario packages CRUD in `frontend/src/features/scenario-package-editor/services/apiClient.ts`

**Parallel Execution**: Tasks T010-T016 can run in parallel

**BLOCKING**: This phase MUST complete before any user story implementation begins

---

## Phase 3: User Story 1 - 多标签页导航与基础信息编辑 (P1)

**Story Goal**: Enable users to navigate between tabs and edit basic scenario package information

**Independent Test**:
- User can access /scenario-packages/:id/edit and see 5 tabs
- User can switch between tabs (with unsaved changes warning)
- User can fill basic info form and save successfully
- Data persists after page refresh

**Priority**: P1 (Highest - MVP foundation)

**Why This Priority**: Tab navigation is the foundational structure for all other features. Basic info is the minimum required data for any scenario package.

### Implementation Tasks

- [x] T017 [US1] Create main ScenarioPackageEditor container component in `frontend/src/features/scenario-package-editor/ScenarioPackageEditorPage.tsx`
- [x] T018 [US1] Implement Ant Design Tabs component with 5 tab panels in ScenarioPackageEditor
- [x] T019 [US1] Create BasicInfoTab component in `frontend/src/features/scenario-package-editor/components/tabs/BasicInfoTab.tsx`
- [x] T020 [US1] Set up React Hook Form with Zod resolver for basic info in BasicInfoTab
- [x] T021 [US1] Implement form fields: name (Input), description (TextArea), category (Select) in BasicInfoTab
- [x] T022 [US1] Integrate ImageUpload component for mainImage field in BasicInfoTab
- [x] T023 [US1] Wire up useUnsavedChanges hook to BasicInfoTab form state
- [x] T024 [US1] Implement tab change handler with confirmation modal when isDirty=true in ScenarioPackageEditor
- [x] T025 [US1] Connect BasicInfoTab to TanStack Query mutation for PUT /api/scenario-packages/:id
- [x] T026 [US1] Add success/error toast notifications for save operation in BasicInfoTab
- [x] T027 [US1] Implement page-level beforeunload event listener for unsaved changes warning in ScenarioPackageEditor

**Parallel Opportunities**:
- T019-T022 can be developed in parallel (different form fields)
- T023-T024 can run in parallel with T025-T026 initially, then integrate

**Deliverable**: User can navigate tabs and edit + save basic information independently

---

## Phase 4: User Story 2 - 套餐管理配置 (P1)

**Story Goal**: Enable users to create, edit, and delete package tiers with pricing and tags

**Independent Test**:
- User can navigate to "套餐管理" tab
- User can add new package tier with all fields (name, price, originalPrice, tags, description)
- System validates originalPrice >= price
- User can edit existing package tier
- User can delete package tier
- User can drag-and-drop to reorder packages
- System blocks publishing if 0 packages configured

**Priority**: P1 (Core business value - pricing is essential)

**Why This Priority**: Package tiers are the core monetization mechanism. Cannot sell scenario packages without defining pricing options.

**Dependencies**: Requires US1 (tab structure) to be complete

### Implementation Tasks

- [x] T028 [US2] Create PackagesTab component in `frontend/src/features/scenario-package-editor/components/tabs/PackagesTab.tsx`
- [x] T029 [US2] Implement package list display using Ant Design Table in PackagesTab
- [x] T030 [US2] Create PackageTierForm modal component in `frontend/src/features/scenario-package-editor/components/forms/PackageTierForm.tsx`
- [x] T031 [US2] Set up React Hook Form with packageTierSchema validation in PackageTierForm
- [x] T032 [US2] Implement form fields: name, price (InputNumber), originalPrice (InputNumber), tags (Select mode="tags") in PackageTierForm
- [x] T033 [US2] Add custom validation: originalPrice >= price in PackageTierForm schema
- [x] T034 [US2] Implement service description field (TextArea) and sortOrder (hidden, auto-managed) in PackageTierForm
- [x] T035 [US2] Create "Add Package" button handler opening PackageTierForm modal in create mode in PackagesTab
- [x] T036 [US2] Implement "Edit" action in table row opening PackageTierForm modal in edit mode in PackagesTab
- [x] T037 [US2] Implement "Delete" action with confirmation popconfirm in PackagesTab
- [x] T038 [US2] Wire up TanStack Query mutations: POST /api/scenario-packages/:id/packages, PUT /api/scenario-packages/:id/packages/:packageId, DELETE /api/scenario-packages/:id/packages/:packageId
- [x] T039 [US2] Implement drag-and-drop reordering using @dnd-kit/sortable in PackagesTab table
- [x] T040 [US2] Add originalPrice badge showing discount percentage when originalPrice exists in table render
- [x] T041 [US2] Display tags as Ant Design Tag components with color variants in table
- [x] T042 [US2] Add validation warning in publish settings if packages.length === 0

**Parallel Opportunities**:
- T029-T030 (list display vs form component) can be built in parallel
- T031-T034 (form fields) can be built in parallel
- T039-T041 (UI enhancements) can be added in parallel after T038 completes

**Deliverable**: User can fully manage package tiers independently of other tabs

---

## Phase 5: User Story 3 - 加购项关联配置 (P2)

**Story Goal**: Enable users to associate global add-on items with scenario package using transfer box UI

**Independent Test**:
- User can navigate to "加购项配置" tab
- User sees Transfer component with all active add-on items in left panel
- User can search add-on items by name
- User can transfer items from left to right (associate)
- User can remove items from right panel (disassociate)
- User can drag-and-drop to reorder associated items in right panel
- User can mark items as "required"
- C-end API correctly returns only associated items in correct order
- System hides inactive add-on items from C-end even if associated

**Priority**: P2 (Important but not blocking MVP)

**Why This Priority**: Add-ons enhance revenue but are not strictly required for basic scenario package sales. Can be added after core package configuration works.

**Dependencies**: Requires US1 (tab structure) to be complete

### Implementation Tasks

- [x] T043 [US3] Create AddOnsTab component in `frontend/src/features/scenario-package-editor/components/tabs/AddonsTab.tsx`
- [x] T044 [US3] Set up TanStack Query for fetching global add-on items: GET /api/add-on-items
- [x] T045 [US3] Set up TanStack Query for fetching associated add-ons: GET /api/scenario-packages/:id/add-ons
- [x] T046 [US3] Implement Ant Design Transfer component with add-on items as dataSource in AddOnsTab
- [x] T047 [US3] Transform add-on items to Transfer format: {key, title, description, disabled} based on isActive
- [x] T048 [US3] Implement Transfer search/filter by item name
- [x] T049 [US3] Add category grouping display in Transfer item render function
- [x] T050 [US3] Create associated add-ons table below Transfer showing selected items with sortOrder and isRequired columns
- [x] T051 [US3] Implement drag-and-drop reordering for associated items table using @dnd-kit/sortable
- [x] T052 [US3] Add "Required" checkbox toggle in associated items table
- [x] T053 [US3] Wire up batch update mutation: PUT /api/scenario-packages/:id/add-ons with complete association list
- [x] T054 [US3] Implement save button handler transforming Transfer targetKeys + table state into API request format
- [x] T055 [US3] Add inventory display (if applicable) and "Sold Out" badge for items with inventory=0

**Parallel Opportunities**:
- T044-T045 (data fetching) can run in parallel
- T046-T049 (Transfer UI) can be built while T050-T052 (table UI) is being built in parallel
- T053-T055 (save logic + enhancements) can be added after core UI is ready

**Deliverable**: User can fully manage add-on associations independently

---

## Phase 6: User Story 4 - 时段模板化管理配置 (P2)

**Story Goal**: Enable users to configure time slots using weekly templates and date-specific overrides

**Independent Test**:
- User can navigate to "时段管理" tab
- User sees week view (Mon-Sun) for configuring default time slots per day
- User can add/edit/delete time slot templates for each day of week
- User can set capacity and price adjustment per template
- User sees calendar view for next 30 days
- User can click specific date to add override (ADD/MODIFY/CANCEL)
- User can specify override reason
- System correctly applies override priority: CANCEL > MODIFY > ADD
- C-end query returns correct time slots for specific date (override takes precedence over template)
- System blocks publishing if 0 time slots configured (no templates AND no overrides)

**Priority**: P2 (Complex feature, not required for MVP)

**Why This Priority**: Time slot management is sophisticated and time-consuming to build. Basic scenario packages can function without time restrictions initially. High value for operations but lower urgency than pricing.

**Dependencies**: Requires US1 (tab structure) to be complete

### Implementation Tasks

- [x] T056 [US4] Create TimeSlotsTab component with Tab sub-navigation (Week View / Calendar View) in `frontend/src/features/scenario-package-editor/components/tabs/TimeSlotsTab.tsx`
- [x] T057 [US4] Create WeekTemplateView component in `frontend/src/features/scenario-package-editor/components/time-slots/WeekTemplateView.tsx`
- [x] T058 [US4] Implement 7-column layout (Sun-Sat) in WeekTemplateView
- [x] T059 [US4] Create TimeSlotTemplateItem component displaying startTime-endTime, capacity, priceAdjustment in `frontend/src/features/scenario-package-editor/components/time-slots/TimeSlotTemplateItem.tsx`
- [x] T060 [US4] Create TimeSlotTemplateForm modal for add/edit template in `frontend/src/features/scenario-package-editor/components/forms/TimeSlotTemplateForm.tsx`
- [x] T061 [US4] Implement form fields: dayOfWeek (Select), startTime (TimePicker), endTime (TimePicker), capacity (InputNumber), priceAdjustment (nested form) in TimeSlotTemplateForm
- [x] T062 [US4] Add validation: startTime < endTime in timeSlotTemplateSchema
- [x] T063 [US4] Implement "Add Slot" button per day-of-week column opening TimeSlotTemplateForm
- [x] T064 [US4] Wire up TanStack Query mutations: POST /api/scenario-packages/:id/time-slot-templates, PUT, DELETE (后端已实现)
- [x] T065 [US4] Implement "Copy to Other Days" feature allowing batch template duplication
- [x] T066 [US4] Create CalendarOverrideView component using Ant Design Calendar in `frontend/src/features/scenario-package-editor/components/time-slots/CalendarOverrideView.tsx`
- [x] T067 [US4] Implement custom dateCellRender showing override indicator badges (ADD=green, MODIFY=orange, CANCEL=red)
- [x] T068 [US4] Create DateOverrideForm modal for add/edit date-specific overrides in `frontend/src/features/scenario-package-editor/components/forms/DateOverrideForm.tsx`
- [x] T069 [US4] Implement form fields: date (DatePicker), overrideType (Radio), startTime (TimePicker, conditional), endTime (TimePicker, conditional), capacity, reason (TextArea) in DateOverrideForm
- [x] T070 [US4] Add conditional validation: if overrideType=ADD/MODIFY, startTime & endTime required
- [ ] T071 [US4] Wire up TanStack Query mutations: POST /api/scenario-packages/:id/time-slot-overrides, PUT, DELETE (待后端实现)
- [x] T072 [US4] Implement calendar cell click handler opening DateOverrideForm
- [x] T073 [US4] Display existing overrides in DateOverrideForm when editing specific date
- [x] T074 [US4] Add validation warning in publish settings if (templates.length + overrides.filter(type!==CANCEL).length) === 0

**Parallel Opportunities**:
- T057-T065 (Week Template View) and T066-T073 (Calendar Override View) can be built in parallel as they are independent sub-features
- Within Week View: T058-T063 can partially overlap
- Within Calendar View: T066-T070 can partially overlap

**Deliverable**: User can fully configure time slots using templates and overrides independently

---

## Phase 7: User Story 5 - 发布设置与状态管理 (P1)

**Story Goal**: Enable users to control publishing status, set effective date range, and configure booking rules

**Independent Test**:
- User can navigate to "发布设置" tab
- User can set effective start/end dates (optional)
- User can set advance booking days requirement
- User can click "Publish" button
- System validates before publish: basicInfo complete, packages.length >= 1, timeSlots configured
- System shows validation errors as list if publish fails
- User can successfully publish (status → PUBLISHED)
- User can unpublish (status → ARCHIVED)
- C-end correctly respects publish status and effective date range
- C-end correctly enforces advance booking days rule

**Priority**: P1 (Critical for launch - gates all other features)

**Why This Priority**: Publishing is the final gate before scenario packages go live. Validates that all required configuration is complete. Essential for production readiness.

**Dependencies**:
- REQUIRES US1 (basic info) to be complete
- REQUIRES US2 (packages) to be complete
- VALIDATES US4 (time slots) if configured

### Implementation Tasks

- [x] T075 [US5] Create PublishSettingsTab component in `frontend/src/features/scenario-package-editor/components/tabs/PublishTab.tsx`
- [x] T076 [US5] Implement status display badge showing current status (DRAFT/PUBLISHED/ARCHIVED) in PublishSettingsTab
- [x] T077 [US5] Create form fields: effectiveStartDate (DatePicker), effectiveEndDate (DatePicker), advanceBookingDays (InputNumber) in PublishSettingsTab
- [x] T078 [US5] Add date range validation: effectiveEndDate >= effectiveStartDate using Zod refine
- [x] T079 [US5] Implement "Save Settings" button for PUT /api/scenario-packages/:id/publish-settings
- [x] T080 [US5] Create PublishValidationChecker component displaying validation results in PublishTab
- [x] T081 [US5] Implement validation checks: basicInfo complete (name, category, mainImage), packages.length >= 1, hasTimeSlots
- [x] T082 [US5] Display validation results as Ant Design Alert components with checklist (✓ passed / ✗ failed)
- [x] T083 [US5] Implement "Publish" button with disabled state if validation fails
- [x] T084 [US5] Wire up publish mutation: POST /api/scenario-packages/:id/publish
- [x] T085 [US5] Handle publish validation error response (400) and display error.details.missingItems
- [x] T086 [US5] Implement "Unpublish" button for POST /api/scenario-packages/:id/unpublish
- [x] T087 [US5] Add confirmation modal for both publish and unpublish actions
- [x] T088 [US5] Implement success redirect to scenario package list page after publish/unpublish

**Parallel Opportunities**:
- T075-T079 (settings form) and T080-T082 (validation checker) can be built in parallel
- T083-T088 (publish/unpublish actions) can be built after both form and checker are ready

**Deliverable**: User can configure publish settings and publish/unpublish scenario packages with full validation

---

## Phase 8: Polish & Cross-Cutting Concerns

**Goal**: Refine UI/UX, add error handling, and ensure production readiness

- [x] T089 [P] Implement global error boundary component in `frontend/src/components/ErrorBoundary.tsx`
- [x] T090 [P] Add loading skeletons for all data-fetching components using Ant Design Skeleton
- [x] T091 [P] Implement optimistic updates for all mutations using TanStack Query optimistic update pattern
- [x] T092 [P] Add keyboard navigation support (Tab key, Enter to submit, Esc to close modals)
- [x] T093 [P] Implement accessibility improvements: ARIA labels, focus management, screen reader announcements
- [x] T094 [P] Add responsive design breakpoints for tablet and mobile (if applicable to B-end admin)
- [x] T095 [P] Implement comprehensive error messages for all API failure scenarios
- [ ] T096 [P] Add audit logging for publish/unpublish actions in backend
- [ ] T097 [P] Set up Sentry or error tracking for production monitoring
- [x] T098 Add end-to-end smoke test using Playwright covering full scenario package creation flow in `tests/e2e/scenario-package-editor.spec.ts`
- [ ] T099 Perform manual QA testing across all 5 tabs and document results
- [ ] T100 Update project documentation: README, API docs, user guide

**Parallel Execution**: Tasks T089-T097 can run in parallel as they are cross-cutting concerns affecting different aspects

**FINAL GATE**: This phase completes before feature is production-ready

---

## Task Statistics

- **Total Tasks**: 100
- **Setup Tasks**: 9 (Phase 1)
- **Foundational Tasks**: 7 (Phase 2)
- **User Story Tasks**:
  - US1: 11 tasks
  - US2: 15 tasks
  - US3: 13 tasks
  - US4: 19 tasks
  - US5: 14 tasks
- **Polish Tasks**: 12 (Phase 8)
- **Parallelizable Tasks**: 47 tasks marked with [P]

## Parallel Execution Summary

### Phase 1 (Setup)
- **Parallel Group 1**: T001-T008 (all 8 tasks can run concurrently)
- **Sequential**: T009 (depends on T008 for API client)

### Phase 2 (Foundational)
- **Parallel Group 1**: T010-T016 (all 7 tasks can run concurrently)

### Phase 3 (US1)
- **Parallel Group 1**: T019-T022 (form fields)
- **Parallel Group 2**: T023-T024, T025-T026 (state management and API calls)
- **Sequential**: T017-T018 (base structure), then parallel groups, then T027 (integration)

### Phase 4 (US2)
- **Parallel Group 1**: T028-T030 (list and form components)
- **Parallel Group 2**: T031-T034 (form field details)
- **Parallel Group 3**: T039-T041 (UI enhancements after T038 API integration)

### Phase 5 (US3)
- **Parallel Group 1**: T044-T045 (data fetching hooks)
- **Parallel Group 2**: T046-T049 (Transfer UI), T050-T052 (table UI)
- **Sequential**: T043 (container), then parallel groups, then T053-T055 (save logic)

### Phase 6 (US4)
- **Parallel Branch 1** (Week Templates): T057-T065
- **Parallel Branch 2** (Calendar Overrides): T066-T073
- **Sequential**: T056 (base structure), then parallel branches, then T074 (integration)

### Phase 7 (US5)
- **Parallel Group 1**: T075-T079 (settings form), T080-T082 (validation checker)
- **Sequential**: T083-T088 (publish actions after both groups complete)

### Phase 8 (Polish)
- **Parallel Group 1**: T089-T097 (all cross-cutting tasks can run concurrently)
- **Sequential**: T098-T100 (testing and documentation)

---

## Implementation Checklist

Before marking feature complete, ensure:

- [ ] All user stories are independently testable
- [ ] MVP (US1) can be deployed and used standalone
- [ ] Each user story delivers incremental value
- [ ] Publish validation (US5) correctly validates US2 and US4 requirements
- [ ] All API contracts match OpenAPI spec in contracts/api.yaml
- [ ] All TypeScript types match data-model.md definitions
- [ ] Unsaved changes detection works across all tabs
- [ ] All forms use Zod validation schemas
- [ ] Error handling is comprehensive and user-friendly
- [ ] Loading states and skeleton screens are implemented
- [ ] Accessibility requirements (WCAG 2.1 AA) are met
- [ ] Performance metrics: <500ms tab switching, <3s initial load
- [ ] Constitution check passes for all principles

---

**Generated**: 2025-12-23
**Updated**: 2025-12-23 (后端时段模板CRUD API完成, Taro详情页API集成完成)
**Feature Branch**: 001-scenario-package-tabs
**Total Estimated Tasks**: 100
**MVP Tasks (US1 only)**: 11 tasks (T017-T027)
**Critical Path**: Setup → Foundational → US1 → US2 → US5

**Next Step**: Begin Phase 1 (Setup) tasks, then proceed to Phase 2 (Foundational), then implement user stories in priority order: US1 (P1) → US2 (P1) → US5 (P1) → US3 (P2) → US4 (P2) → Polish
