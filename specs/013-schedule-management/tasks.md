# Tasks: 排期管理甘特图视图

**Input**: Design documents from `/specs/013-schedule-management/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Following TDD approach - tests are included and must be written FIRST before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/src/`
- **Tests**: `frontend/src/pages/schedule/__tests__/` and `frontend/src/features/schedule-management/__tests__/`
- **Mocks**: `frontend/src/mocks/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create feature directory structure in `frontend/src/pages/schedule/` per implementation plan
- [x] T002 [P] Create feature store directory in `frontend/src/features/schedule-management/stores/`
- [x] T003 [P] Create feature utils directory in `frontend/src/features/schedule-management/utils/`
- [x] T004 [P] Create mock data directory in `frontend/src/mocks/data/` for schedule data
- [x] T005 [P] Create mock handlers directory in `frontend/src/mocks/handlers/` for schedule handlers

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create TypeScript types for schedule entities in `frontend/src/pages/schedule/types/schedule.types.ts` (Hall, ScheduleEvent, TimelineConfig)
- [x] T007 [P] Create Zod validation schemas in `frontend/src/features/schedule-management/utils/validators.ts` (hallSchema, scheduleEventSchema)
- [x] T008 [P] Create time calculation utilities in `frontend/src/features/schedule-management/utils/timeCalculations.ts` (getLeftStyle, getWidthStyle, formatTime)
- [x] T009 [P] Create conflict detection utility in `frontend/src/features/schedule-management/utils/conflictDetection.ts` (checkTimeConflict, validateEventTimeRange)
- [x] T010 Create Zustand store for schedule UI state in `frontend/src/features/schedule-management/stores/scheduleStore.ts` (selectedDate, selectedEvent, filters, viewportScroll)
- [x] T011 Create schedule service class in `frontend/src/pages/schedule/services/scheduleService.ts` (following brandService pattern)
- [x] T012 [P] Create mock data for halls in `frontend/src/mocks/data/scheduleMockData.ts` (mockHalls array with 4+ halls)
- [x] T013 [P] Create mock data for schedule events in `frontend/src/mocks/data/scheduleMockData.ts` (mockEvents array with various event types)
- [x] T014 Create MSW handlers for schedule API in `frontend/src/mocks/handlers/scheduleHandlers.ts` (GET /api/schedules, GET /api/schedules/:id, POST /api/schedules, PUT /api/schedules/:id, DELETE /api/schedules/:id, POST /api/schedules/:id/conflict-check, GET /api/halls, GET /api/halls/:id)
- [x] T015 Register schedule handlers in `frontend/src/mocks/handlers/index.ts`
- [x] T016 Create TanStack Query key factory in `frontend/src/pages/schedule/hooks/useScheduleQueries.ts` (scheduleKeys factory)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 查看影厅排期甘特图 (Priority: P1) 🎯 MVP

**Goal**: 运营人员可以在统一的甘特图视图中查看所有影厅的排期安排，快速了解资源占用情况和时间分布。

**Independent Test**: 打开排期管理页面，系统显示甘特图视图，包含所有影厅资源和对应的时间轴，用户可以看到当天的所有排期事件。功能独立提供价值：让用户一目了然地看到资源占用情况。

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T017 [P] [US1] Unit test for scheduleStore in `frontend/src/features/schedule-management/stores/__tests__/scheduleStore.test.ts` (selectedDate, selectedEvent, filters)
- [x] T018 [P] [US1] Unit test for timeCalculations utility in `frontend/src/features/schedule-management/utils/__tests__/timeCalculations.test.ts` (getLeftStyle, getWidthStyle, formatTime)
- [x] T019 [P] [US1] Unit test for validators in `frontend/src/features/schedule-management/utils/__tests__/validators.test.ts` (hallSchema, scheduleEventSchema)
- [x] T020 [P] [US1] Integration test for schedule queries in `frontend/src/pages/schedule/__tests__/scheduleQueries.integration.test.ts` (useScheduleQueries hooks via MSW)
- [x] T021 [P] [US1] Integration test for gantt chart rendering in `frontend/src/pages/schedule/__tests__/ganttChart.integration.test.ts` (render halls, time axis, events)

### Implementation for User Story 1

- [x] T022 [P] [US1] Create HallCard atom component in `frontend/src/pages/schedule/components/atoms/HallCard.tsx` (display hall name, capacity, type, tags)
- [x] T023 [P] [US1] Create EventTypeTag atom component in `frontend/src/pages/schedule/components/atoms/EventTypeTag.tsx` (display event type badge with colors)
- [x] T024 [P] [US1] Create TimeSlot atom component in `frontend/src/pages/schedule/components/atoms/TimeSlot.tsx` (display time marker)
- [x] T025 [P] [US1] Create EventBlock atom component in `frontend/src/pages/schedule/components/atoms/EventBlock.tsx` (display event with title, time, customer, serviceManager, occupancy based on type)
- [x] T026 [US1] Create TimelineHeader molecule component in `frontend/src/pages/schedule/components/molecules/TimelineHeader.tsx` (display time axis with hour markers, configurable startHour/endHour)
- [x] T027 [US1] Create GanttRow molecule component in `frontend/src/pages/schedule/components/molecules/GanttRow.tsx` (combine HallCard + event blocks row, use absolute positioning for events)
- [ ] T028 [US1] Create GanttChart organism component in `frontend/src/pages/schedule/components/organisms/GanttChart.tsx` (combine TimelineHeader + multiple GanttRows, handle scrolling, current time indicator)
- [x] T028 [US1] Create GanttChart organism component in `frontend/src/pages/schedule/components/organisms/GanttChart.tsx` (combine TimelineHeader + multiple GanttRows, handle scrolling, current time indicator)
- [x] T029 [US1] Create useScheduleQueries hook in `frontend/src/pages/schedule/hooks/useScheduleQueries.ts` (useScheduleList, useScheduleDetail, useHallsList hooks with TanStack Query)
- [x] T030 [US1] Create main ScheduleManagement page in `frontend/src/pages/schedule/index.tsx` (integrate GanttChart, load data via useScheduleQueries, connect to scheduleStore)
- [x] T031 [US1] Add route for schedule page in `frontend/src/routes/index.tsx` (lazy load ScheduleManagement component)
- [x] T032 [US1] Add menu item for schedule management in `frontend/src/components/layout/AppLayout.tsx` (link to /schedule/gantt)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - users can view gantt chart with halls and events

---

## Phase 4: User Story 2 - 日期切换和导航 (Priority: P1)

**Goal**: 运营人员能够切换查看不同日期的排期安排，以便查看历史排期或规划未来排期。

**Independent Test**: 在排期管理页面，用户点击日期导航按钮（前一天、后一天、回到今天），系统更新甘特图显示对应日期的排期数据。功能独立提供价值：让用户能够查看任意日期的排期安排。

### Tests for User Story 2 ⚠️

- [ ] T033 [P] [US2] Unit test for date navigation logic in `frontend/src/pages/schedule/__tests__/dateNavigation.test.ts` (previousDay, nextDay, goToToday)
- [ ] T034 [P] [US2] Integration test for date switching in `frontend/src/pages/schedule/__tests__/dateSwitch.integration.test.ts` (switch date, verify data reload, verify date display)

### Implementation for User Story 2

- [x] T035 [P] [US2] Create DateNavigator molecule component in `frontend/src/pages/schedule/components/molecules/DateNavigator.tsx` (previous day, next day, go to today buttons, date display with weekday)
- [x] T036 [US2] Integrate DateNavigator into ScheduleManagement page in `frontend/src/pages/schedule/index.tsx` (connect to scheduleStore.selectedDate, update query on date change)
- [x] T037 [US2] Update scheduleStore to persist selectedDate to localStorage in `frontend/src/features/schedule-management/stores/scheduleStore.ts` (load from localStorage on init, save on change)
- [x] T038 [US2] Update useScheduleQueries to accept date parameter in `frontend/src/pages/schedule/hooks/useScheduleQueries.ts` (useScheduleList(date) query key includes date)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can view gantt chart and switch dates

---

## Phase 5: User Story 3 - 创建新排期预约 (Priority: P2)

**Goal**: 运营人员能够在空闲时间段创建新的排期预约，包括公映排片和包场预约。

**Independent Test**: 用户在甘特图的空闲时间段点击"新增预约"按钮，系统打开创建表单，用户填写必要信息（影厅、时间、类型、客户等）后提交，系统在甘特图中显示新创建的排期事件。功能独立提供价值：让用户能够创建新的排期安排。

### Tests for User Story 3 ⚠️

- [x] T039 [P] [US3] Unit test for conflict detection in `frontend/src/features/schedule-management/utils/__tests__/conflictDetection.test.ts` (checkTimeConflict, validateEventTimeRange, edge cases)
- [x] T040 [P] [US3] Integration test for event creation in `frontend/src/pages/schedule/__tests__/eventCreation.integration.test.ts` (create public event, create private event, conflict validation, form validation)

### Implementation for User Story 3

- [x] T041 [US3] Create EventForm molecule component in `frontend/src/pages/schedule/components/molecules/EventForm.tsx` (React Hook Form + Zod validation, fields: hallId, date, startHour, duration, title, type, status, customer, serviceManager, occupancy, details)
- [x] T042 [US3] Create useScheduleMutations hook in `frontend/src/pages/schedule/hooks/useScheduleMutations.ts` (useCreateEvent, useUpdateEvent, useDeleteEvent with TanStack Query mutations)
- [x] T043 [US3] Update scheduleService with create method in `frontend/src/pages/schedule/services/scheduleService.ts` (createEvent method with conflict check)
- [x] T044 [US3] Update MSW handler for POST /api/schedules in `frontend/src/mocks/handlers/scheduleHandlers.ts` (create event, conflict check, validation)
- [x] T045 [US3] Add "新增预约" button to ScheduleManagement page in `frontend/src/pages/schedule/index.tsx` (open EventForm modal)
- [x] T046 [US3] Add click handler for empty time slots in GanttRow in `frontend/src/pages/schedule/components/molecules/GanttRow.tsx` (pre-fill hallId and time range in form)
- [x] T047 [US3] Integrate EventForm with useScheduleMutations in `frontend/src/pages/schedule/components/molecules/EventForm.tsx` (onSubmit calls useCreateEvent, invalidate queries on success)
- [x] T048 [US3] Add client-side conflict detection before form submission in `frontend/src/pages/schedule/components/molecules/EventForm.tsx` (check conflicts, show error message)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently - users can view, switch dates, and create events

---

## Phase 6: User Story 4 - 查看和编辑排期详情 (Priority: P2)

**Goal**: 运营人员能够查看排期事件的详细信息，并在需要时进行编辑修改。

**Independent Test**: 用户点击甘特图中的某个排期事件块，系统显示该事件的详细信息（标题、时间、客户、服务经理、备注等），用户可以选择编辑，修改信息后保存，系统更新事件显示。功能独立提供价值：让用户能够查看和修改排期信息。

### Tests for User Story 4 ⚠️

- [x] T049 [P] [US4] Integration test for event detail view in `frontend/src/pages/schedule/__tests__/eventDetail.integration.test.ts` (click event, view details, edit event, update event)
- [x] T050 [P] [US4] Integration test for event update in `frontend/src/pages/schedule/__tests__/eventUpdate.integration.test.ts` (update event fields, conflict validation on update)

### Implementation for User Story 4

- [x] T051 [US4] Add click handler to EventBlock in `frontend/src/pages/schedule/components/atoms/EventBlock.tsx` (onClick sets selectedEvent in store)
- [x] T052 [US4] Create EventDetailDrawer organism component in `frontend/src/pages/schedule/components/organisms/EventDetailDrawer.tsx` (display event details, edit button, delete button)
- [x] T053 [US4] Update EventForm to support edit mode in `frontend/src/pages/schedule/components/molecules/EventForm.tsx` (mode prop, pre-fill with event data, useUpdateEvent mutation)
- [x] T054 [US4] Update scheduleService with update method in `frontend/src/pages/schedule/services/scheduleService.ts` (updateEvent method with conflict check excluding current event)
- [x] T055 [US4] Update MSW handler for PUT /api/schedules/:id in `frontend/src/mocks/handlers/scheduleHandlers.ts` (update event, conflict check, validation)
- [x] T056 [US4] Integrate EventDetailDrawer into ScheduleManagement page in `frontend/src/pages/schedule/index.tsx` (show drawer when selectedEvent is set, close on edit/delete)
- [x] T057 [US4] Add delete functionality to EventDetailDrawer in `frontend/src/pages/schedule/components/organisms/EventDetailDrawer.tsx` (useDeleteEvent mutation, confirm dialog)

**Checkpoint**: At this point, User Stories 1, 2, 3, AND 4 should all work independently - users can view, switch dates, create, view details, and edit events

---

## Phase 7: User Story 5 - 锁座和维护时段管理 (Priority: P3)

**Goal**: 运营人员能够标记影厅的锁座时段和维护时段，以便在排期中预留这些时间。

**Independent Test**: 用户点击"锁座/维护"按钮，系统打开创建表单，用户选择影厅、时间段和类型（锁座或维护），提交后系统在甘特图中显示对应的维护/锁座事件块。功能独立提供价值：让用户能够标记不可用的时间段。

### Tests for User Story 5 ⚠️

- [x] T058 [P] [US5] Integration test for maintenance/cleaning event creation in `frontend/src/pages/schedule/__tests__/maintenanceEvent.integration.test.ts` (create maintenance event, create cleaning event, verify special styling)

### Implementation for User Story 5

- [x] T059 [US5] Add "锁座/维护" button to ScheduleManagement page in `frontend/src/pages/schedule/index.tsx` (open EventForm modal with type pre-selected to maintenance/cleaning)
- [x] T060 [US5] Update EventForm to handle maintenance/cleaning types in `frontend/src/pages/schedule/components/molecules/EventForm.tsx` (show different fields for maintenance/cleaning, hide customer/serviceManager fields)
- [x] T061 [US5] Update EventBlock to display maintenance/cleaning with special styling in `frontend/src/pages/schedule/components/atoms/EventBlock.tsx` (striped background pattern, rotated text for maintenance/cleaning)
- [x] T062 [US5] Update conflict detection to allow maintenance/cleaning to overlap with business events in `frontend/src/features/schedule-management/utils/conflictDetection.ts` (maintenance/cleaning can overlap, but not with each other)

**Checkpoint**: At this point, all user stories should be independently functional - users can view, switch dates, create, edit, and manage maintenance/cleaning events

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T063 [P] Add current time indicator line in GanttChart in `frontend/src/pages/schedule/components/organisms/GanttChart.tsx` (red vertical line at current time if within displayed date range)
- [x] T064 [P] Add legend component in ScheduleManagement page in `frontend/src/pages/schedule/index.tsx` (explain event type colors and styles)
- [x] T065 [P] Add hover effects to GanttRow in `frontend/src/pages/schedule/components/molecules/GanttRow.tsx` (background color change on hover)
- [x] T066 [P] Add hover effect to empty time slots in GanttRow in `frontend/src/pages/schedule/components/molecules/GanttRow.tsx` (show "点击空闲时段添加排期" hint)
- [x] T067 [P] Add pending status indicator to EventBlock in `frontend/src/pages/schedule/components/atoms/EventBlock.tsx` (pulsing dot for pending status)
- [ ] T068 [P] Add responsive layout support in GanttChart in `frontend/src/pages/schedule/components/organisms/GanttChart.tsx` (mobile-friendly layout for screen width >= 768px)
- [x] T069 [P] Add viewport scroll position persistence in scheduleStore in `frontend/src/features/schedule-management/stores/scheduleStore.ts` (save/restore scroll position to localStorage)
- [x] T070 [P] Add performance optimizations in EventBlock in `frontend/src/pages/schedule/components/atoms/EventBlock.tsx` (React.memo, useMemo for style calculations)
- [x] T071 [P] Add performance optimizations in GanttRow in `frontend/src/pages/schedule/components/molecules/GanttRow.tsx` (useCallback for event handlers, useMemo for filtered events)
- [x] T072 [P] Add error handling and loading states in ScheduleManagement page in `frontend/src/pages/schedule/index.tsx` (error boundaries, loading spinners, empty states)
- [x] T073 [P] Add accessibility features in GanttChart in `frontend/src/pages/schedule/components/organisms/GanttChart.tsx` (ARIA labels, keyboard navigation support)
- [x] T074 [P] Add accessibility features in EventBlock in `frontend/src/pages/schedule/components/atoms/EventBlock.tsx` (ARIA labels, keyboard support for click)
- [ ] T075 [P] Add unit tests for conflict detection edge cases in `frontend/src/features/schedule-management/utils/__tests__/conflictDetection.test.ts` (overlapping events, boundary conditions, maintenance overlap rules)
- [ ] T076 [P] Add integration tests for edge cases in `frontend/src/pages/schedule/__tests__/edgeCases.integration.test.ts` (many events per hall, short duration events, empty halls, rapid date switching)
- [ ] T077 Documentation updates in `specs/013-schedule-management/quickstart.md` (verify all examples work)
- [ ] T078 Code cleanup and refactoring (remove unused code, optimize imports)
- [ ] T079 Performance testing and optimization (verify SC-004: 20+ halls, 100+ events without degradation)
- [ ] T080 Security review (Zod validation coverage, XSS prevention, input sanitization)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories - **MVP**
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Depends on US1 for GanttChart component but should be independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for GanttChart, US2 for date handling but should be independently testable
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for EventBlock, US3 for EventForm but should be independently testable
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - Depends on US1, US3 for EventForm but should be independently testable

### Within Each User Story

- Tests (included) MUST be written and FAIL before implementation
- Atoms before molecules
- Molecules before organisms
- Components before page integration
- Core implementation before polish
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T002-T005)
- All Foundational tasks marked [P] can run in parallel (T007-T009, T012-T013)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Atoms within a story marked [P] can run in parallel (T022-T025 for US1)
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit test for scheduleStore in frontend/src/features/schedule-management/stores/__tests__/scheduleStore.test.ts"
Task: "Unit test for timeCalculations utility in frontend/src/features/schedule-management/utils/__tests__/timeCalculations.test.ts"
Task: "Unit test for validators in frontend/src/features/schedule-management/utils/__tests__/validators.test.ts"
Task: "Integration test for schedule queries in frontend/src/pages/schedule/__tests__/scheduleQueries.integration.test.ts"
Task: "Integration test for gantt chart rendering in frontend/src/pages/schedule/__tests__/ganttChart.integration.test.ts"

# Launch all atoms for User Story 1 together:
Task: "Create HallCard atom component in frontend/src/pages/schedule/components/atoms/HallCard.tsx"
Task: "Create EventTypeTag atom component in frontend/src/pages/schedule/components/atoms/EventTypeTag.tsx"
Task: "Create TimeSlot atom component in frontend/src/pages/schedule/components/atoms/TimeSlot.tsx"
Task: "Create EventBlock atom component in frontend/src/pages/schedule/components/atoms/EventBlock.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (View Gantt Chart)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Add Polish phase → Final polish and optimization
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (MVP)
   - Developer B: User Story 2 (can start after US1 GanttChart is ready)
   - Developer C: User Story 3 (can start after US1 is ready)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Follow TDD: Write tests first, ensure they fail, then implement
- Follow Atomic Design: Atoms → Molecules → Organisms → Pages
- Follow project patterns: Zustand for UI state, TanStack Query for server state, MSW for mocking

