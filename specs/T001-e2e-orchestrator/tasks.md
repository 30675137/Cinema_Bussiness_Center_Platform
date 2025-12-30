# Tasks: E2E 测试编排器

**Input**: Design documents from `/specs/T001-e2e-orchestrator/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Unit tests are included per TDD requirements (Constitution Check: test coverage ≥80%)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Claude Code Skill**: `.claude/skills/e2e-admin/` (note: changed from e2e-orchestrator to e2e-admin per clarification)
- **Spec documentation**: `specs/T001-e2e-orchestrator/`
- **Test scenarios**: `scenarios/<module>/` (external, managed by T005-e2e-scenario-author)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and skill directory structure

- [ ] T001 Create skill directory structure at .claude/skills/e2e-admin/ per plan.md
- [ ] T002 [P] Create skill.md with YAML frontmatter (name: e2e-admin, description, version: 1.0.0) in .claude/skills/e2e-admin/skill.md
- [ ] T003 [P] Create default configuration template in .claude/skills/e2e-admin/assets/default-config.yaml
- [ ] T004 [P] Create run config JSON template in .claude/skills/e2e-admin/assets/run-config-template.json
- [ ] T005 [P] Create README for developers in .claude/skills/e2e-admin/README.md
- [ ] T006 Install Python dependencies (PyYAML 6.0+) and verify Python 3.8+ environment

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core modules that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T007 Create utils module with run_id generation in .claude/skills/e2e-admin/scripts/utils.py
- [ ] T008 [P] Create RunConfig dataclass with validation in .claude/skills/e2e-admin/scripts/config_assembler.py
- [ ] T009 [P] Create TestScenario parser (YAML loading) in .claude/skills/e2e-admin/scripts/scenario_filter.py
- [ ] T010 [P] Implement tag filter logic (AND/OR parsing) in .claude/skills/e2e-admin/scripts/scenario_filter.py
- [ ] T011 Create service manager base (port checking, process management) in .claude/skills/e2e-admin/scripts/service_manager.py
- [ ] T012 [P] Create skill executor framework (skill availability check, fallback) in .claude/skills/e2e-admin/scripts/skill_executor.py
- [ ] T013 [P] Create report generator (summary.json writer) in .claude/skills/e2e-admin/scripts/report_generator.py

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 按模块/优先级选择场景运行 (Priority: P1) 🎯 MVP

**Goal**: Enable QA engineers to filter scenarios by tags (module, priority) and execute selected subset with report generation

**Independent Test**: Run `/e2e-admin --tags "module:inventory"` with 8 inventory scenarios and verify exactly 8 scenarios execute, report shows 8/8 count

### Tests for User Story 1 (TDD Required)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T014 [P] [US1] Unit test for scenario loading from YAML in .claude/skills/e2e-admin/tests/test_scenario_filter.py
- [ ] T015 [P] [US1] Unit test for tag filtering (single tag) in .claude/skills/e2e-admin/tests/test_scenario_filter.py
- [ ] T016 [P] [US1] Unit test for AND/OR tag logic in .claude/skills/e2e-admin/tests/test_scenario_filter.py
- [ ] T017 [P] [US1] Unit test for RunConfig assembly in .claude/skills/e2e-admin/tests/test_config_assembler.py
- [ ] T018 [P] [US1] Integration test for end-to-end scenario selection in .claude/skills/e2e-admin/tests/test_orchestrate.py

### Implementation for User Story 1

- [ ] T019 [P] [US1] Implement YAML scenario loader (pathlib.rglob) in .claude/skills/e2e-admin/scripts/scenario_filter.py
- [ ] T020 [US1] Implement tag filter matcher (module, priority, channel, deploy) in .claude/skills/e2e-admin/scripts/scenario_filter.py
- [ ] T021 [US1] Implement CLI argument parser (--tags, --env) in .claude/skills/e2e-admin/scripts/orchestrate.py
- [ ] T022 [US1] Implement RunConfig assembly from CLI args + defaults in .claude/skills/e2e-admin/scripts/config_assembler.py
- [ ] T023 [US1] Implement scenario selection display (count + list preview) in .claude/skills/e2e-admin/scripts/orchestrate.py
- [ ] T024 [US1] Implement basic Playwright CLI execution (npx playwright test --project=chromium) in .claude/skills/e2e-admin/scripts/orchestrate.py
- [ ] T025 [US1] Implement basic report summary generation (total, passed, failed) in .claude/skills/e2e-admin/scripts/report_generator.py
- [ ] T026 [US1] Add error handling for no scenarios matched in .claude/skills/e2e-admin/scripts/orchestrate.py

**Checkpoint**: At this point, User Story 1 should be fully functional - tag-based scenario selection and report generation work

---

## Phase 4: User Story 2 - 跨系统集成测试 (Priority: P1)

**Goal**: Enable cross-system (C-end + B-end) test execution with automatic dev server management

**Independent Test**: Run scenario E2E-INVENTORY-002 requiring both systems and verify C-end (port 10086) and B-end (port 3000) auto-start before test execution

### Tests for User Story 2 (TDD Required)

- [ ] T027 [P] [US2] Unit test for system detection from scenario YAML in .claude/skills/e2e-admin/tests/test_service_manager.py
- [ ] T028 [P] [US2] Unit test for port availability check (TCP socket) in .claude/skills/e2e-admin/tests/test_service_manager.py
- [ ] T029 [P] [US2] Unit test for service startup command construction in .claude/skills/e2e-admin/tests/test_service_manager.py
- [ ] T030 [P] [US2] Mock test for subprocess.Popen service launch in .claude/skills/e2e-admin/tests/test_service_manager.py

### Implementation for User Story 2

- [ ] T031 [P] [US2] Implement system field parser from scenario YAML (c-end/b-end detection) in .claude/skills/e2e-admin/scripts/scenario_filter.py
- [ ] T032 [US2] Implement TCP port checker (localhost:10086, localhost:3000) in .claude/skills/e2e-admin/scripts/service_manager.py
- [ ] T033 [US2] Implement C-end dev server starter (cd hall-reserve-taro && npm run dev:h5) in .claude/skills/e2e-admin/scripts/service_manager.py
- [ ] T034 [US2] Implement B-end dev server starter (cd frontend && npm run dev) in .claude/skills/e2e-admin/scripts/service_manager.py
- [ ] T035 [US2] Implement graceful service shutdown (SIGTERM/SIGKILL) in .claude/skills/e2e-admin/scripts/service_manager.py
- [ ] T036 [US2] Integrate service lifecycle into orchestrate.py main flow (start before tests, stop after) in .claude/skills/e2e-admin/scripts/orchestrate.py
- [ ] T037 [US2] Add environment-specific baseURL configuration (dev/staging/prod) in .claude/skills/e2e-admin/scripts/config_assembler.py
- [ ] T038 [US2] Add error handling for port conflicts and service startup failures in .claude/skills/e2e-admin/scripts/service_manager.py

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - cross-system tests auto-start services

---

## Phase 5: User Story 3 - 并行执行以获得快速反馈 (Priority: P2)

**Goal**: Enable parallel test execution with configurable workers for faster feedback

**Independent Test**: Run 10 scenarios with `--workers 4` and verify execution time < sequential time, all tests complete correctly

### Tests for User Story 3 (TDD Required)

- [ ] T039 [P] [US3] Unit test for workers parameter validation (1-10 range) in .claude/skills/e2e-admin/tests/test_config_assembler.py
- [ ] T040 [P] [US3] Mock test for Playwright CLI with --workers argument in .claude/skills/e2e-admin/tests/test_orchestrate.py

### Implementation for User Story 3

- [ ] T041 [P] [US3] Add --workers CLI argument parsing in .claude/skills/e2e-admin/scripts/orchestrate.py
- [ ] T042 [US3] Implement workers parameter validation (1-10) in .claude/skills/e2e-admin/scripts/config_assembler.py
- [ ] T043 [US3] Pass --workers to Playwright CLI (npx playwright test --workers=N) in .claude/skills/e2e-admin/scripts/orchestrate.py
- [ ] T044 [US3] Update report generator to handle parallel execution results in .claude/skills/e2e-admin/scripts/report_generator.py

**Checkpoint**: User Stories 1, 2, AND 3 should all work - parallel execution with configurable workers

---

## Phase 6: User Story 4 - 自动重试失败的测试 (Priority: P2)

**Goal**: Enable automatic retry of flaky tests with configurable retry count

**Independent Test**: Run test with `--retries 2`, simulate intermittent failure, verify retry behavior in report

### Tests for User Story 4 (TDD Required)

- [ ] T045 [P] [US4] Unit test for retries parameter validation (0-3 range) in .claude/skills/e2e-admin/tests/test_config_assembler.py
- [ ] T046 [P] [US4] Mock test for retry statistics extraction from Playwright output in .claude/skills/e2e-admin/tests/test_report_generator.py

### Implementation for User Story 4

- [ ] T047 [P] [US4] Add --retries CLI argument parsing in .claude/skills/e2e-admin/scripts/orchestrate.py
- [ ] T048 [US4] Implement retries parameter validation (0-3) in .claude/skills/e2e-admin/scripts/config_assembler.py
- [ ] T049 [US4] Pass --retries to Playwright CLI (npx playwright test --retries=N) in .claude/skills/e2e-admin/scripts/orchestrate.py
- [ ] T050 [US4] Enhance report generator to extract retry statistics (total_retry_attempts, scenarios_retried) in .claude/skills/e2e-admin/scripts/report_generator.py

**Checkpoint**: All P2 user stories complete - parallel execution and retries work

---

## Phase 7: User Story 5 - 为每次运行生成隔离的报告 (Priority: P1)

**Goal**: Generate unique report directories per run with run_id isolation

**Independent Test**: Run orchestrator twice and verify two separate test-results/run-{run_id}/ directories exist

### Tests for User Story 5 (TDD Required)

- [ ] T051 [P] [US5] Unit test for run_id generation format (YYYYMMDD-HHMMSS-uuid) in .claude/skills/e2e-admin/tests/test_utils.py
- [ ] T052 [P] [US5] Unit test for output directory path construction in .claude/skills/e2e-admin/tests/test_config_assembler.py
- [ ] T053 [P] [US5] Integration test for report pack structure (index.html, summary.json, config.json) in .claude/skills/e2e-admin/tests/test_report_generator.py

### Implementation for User Story 5

- [ ] T054 [P] [US5] Implement run_id generator (datetime + uuid) in .claude/skills/e2e-admin/scripts/utils.py
- [ ] T055 [US5] Implement output directory creator (test-results/run-{run_id}/) in .claude/skills/e2e-admin/scripts/config_assembler.py
- [ ] T056 [US5] Configure Playwright to write reports to run_id directory in .claude/skills/e2e-admin/scripts/orchestrate.py
- [ ] T057 [US5] Implement summary.json writer (run_id, timestamp, duration, summary stats) in .claude/skills/e2e-admin/scripts/report_generator.py
- [ ] T058 [US5] Implement config.json snapshot writer (save RunConfig for audit) in .claude/skills/e2e-admin/scripts/report_generator.py
- [ ] T059 [US5] Create symlink test-results/latest → run-{latest_id} in .claude/skills/e2e-admin/scripts/report_generator.py

**Checkpoint**: All P1 user stories complete - isolated report generation works

---

## Phase 8: Skill Orchestration (FR-004 Requirements)

**Purpose**: Implement fixed-order skill calling with skip flags

- [ ] T060 [P] Add skip flags to CLI (--skip-scenario-validation, --skip-data-validation, etc.) in .claude/skills/e2e-admin/scripts/orchestrate.py
- [ ] T061 Implement test-scenario-author skill calling (or skip) in .claude/skills/e2e-admin/scripts/skill_executor.py
- [ ] T062 Implement e2e-testdata-planner skill calling with user prompt fallback in .claude/skills/e2e-admin/scripts/skill_executor.py
- [ ] T063 Implement e2e-test-generator skill calling (or skip) in .claude/skills/e2e-admin/scripts/skill_executor.py
- [ ] T064 [P] Implement e2e-report-configurator skill calling (or use Playwright default) in .claude/skills/e2e-admin/scripts/skill_executor.py
- [ ] T065 [P] Implement e2e-artifacts-policy skill calling (or use on-failure default) in .claude/skills/e2e-admin/scripts/skill_executor.py
- [ ] T066 Integrate skill orchestration into main orchestrate.py flow (steps 1-6) in .claude/skills/e2e-admin/scripts/orchestrate.py

---

## Phase 9: Error Handling & Edge Cases

**Purpose**: Handle edge cases per spec edge case section

- [ ] T067 [P] Implement "no scenarios matched" warning and graceful exit in .claude/skills/e2e-admin/scripts/orchestrate.py
- [ ] T068 [P] Implement missing test data file detection and e2e-testdata-planner prompt in .claude/skills/e2e-admin/scripts/skill_executor.py
- [ ] T069 [P] Implement port conflict detection and clear error messages in .claude/skills/e2e-admin/scripts/service_manager.py
- [ ] T070 [P] Implement partial report generation on Ctrl+C interrupt (SIGINT handler) in .claude/skills/e2e-admin/scripts/orchestrate.py
- [ ] T071 [P] Implement disk space warning for artifact storage in .claude/skills/e2e-admin/scripts/orchestrate.py
- [ ] T072 [P] Implement Playwright config conflict validation in .claude/skills/e2e-admin/scripts/config_assembler.py

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T073 [P] Add @spec T001-e2e-orchestrator attribution to all Python scripts in .claude/skills/e2e-admin/scripts/
- [ ] T074 [P] Run pylint and black formatting on all Python code in .claude/skills/e2e-admin/scripts/
- [ ] T075 [P] Add comprehensive docstrings (Google style) to all public functions
- [ ] T076 [P] Create pytest fixtures for mock scenarios in .claude/skills/e2e-admin/tests/fixtures/
- [ ] T077 Run full test suite and verify ≥80% coverage per constitution check
- [ ] T078 [P] Update skill.md with complete command reference and examples in .claude/skills/e2e-admin/skill.md
- [ ] T079 [P] Update quickstart.md with real examples (copy from specs/ to .claude/skills/e2e-admin/) in .claude/skills/e2e-admin/quickstart.md
- [ ] T080 Run quickstart.md validation (execute all example commands and verify outputs)
- [ ] T081 Performance benchmark: Verify orchestration overhead <30 seconds (SC-001)
- [ ] T082 Scale test: Run with 100+ scenarios and verify 4-worker parallel execution succeeds (SC-002)
- [ ] T083 Update agent context via .specify/scripts/bash/update-agent-context.sh claude

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P1)
- **Skill Orchestration (Phase 8)**: Depends on US1 completion (basic flow working)
- **Error Handling (Phase 9)**: Depends on core user stories being implemented
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1) - Tag Selection**: Can start after Foundational (Phase 2) - No dependencies on other stories ✅ MVP CORE
- **User Story 2 (P1) - Cross-System**: Can start after Foundational (Phase 2) - No dependencies on other stories, integrates with US1 orchestrate.py
- **User Story 3 (P2) - Parallel**: Can start after US1 - Extends US1 orchestrate.py with --workers
- **User Story 4 (P2) - Retry**: Can start after US1 - Extends US1 orchestrate.py with --retries
- **User Story 5 (P1) - Isolated Reports**: Can start after Foundational (Phase 2) - Independent but integrates with US1 report_generator.py ✅ MVP CORE

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD)
- Unit tests before implementation code
- Core implementation before error handling
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks (T001-T006) marked [P] can run in parallel
- All Foundational tasks (T007-T013) marked [P] can run in parallel within Phase 2
- Once Foundational phase completes:
  - US1 (T014-T026) can start
  - US2 (T027-T038) can start in parallel if team capacity allows
  - US5 (T051-T059) can start in parallel if team capacity allows
- All tests within a story marked [P] can run in parallel
- Phase 9 edge case tasks (T067-T072) can all run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all unit tests for User Story 1 together:
Task T014: "Unit test for scenario loading from YAML in .claude/skills/e2e-admin/tests/test_scenario_filter.py"
Task T015: "Unit test for tag filtering (single tag) in .claude/skills/e2e-admin/tests/test_scenario_filter.py"
Task T016: "Unit test for AND/OR tag logic in .claude/skills/e2e-admin/tests/test_scenario_filter.py"
Task T017: "Unit test for RunConfig assembly in .claude/skills/e2e-admin/tests/test_config_assembler.py"
Task T018: "Integration test for end-to-end scenario selection in .claude/skills/e2e-admin/tests/test_orchestrate.py"

# After tests pass, launch model implementations together:
Task T019: "Implement YAML scenario loader in .claude/skills/e2e-admin/scripts/scenario_filter.py"
Task T022: "Implement RunConfig assembly in .claude/skills/e2e-admin/scripts/config_assembler.py"
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 5 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T013) - CRITICAL
3. Complete Phase 3: User Story 1 (T014-T026) - Tag-based scenario selection ✅
4. Complete Phase 4: User Story 2 (T027-T038) - Cross-system service management ✅
5. Complete Phase 7: User Story 5 (T051-T059) - Isolated report generation ✅
6. **STOP and VALIDATE**: Test all three P1 stories independently
7. Deploy/demo MVP: `/e2e-admin --tags "module:inventory"` works with auto-service management and isolated reports

### Incremental Delivery

1. **Foundation** (Phases 1-2) → Core modules ready
2. **MVP** (US1 + US2 + US5) → Tag selection + cross-system + reports → Deploy/Demo ✅
3. **Enhancement 1** (US3) → Parallel execution → Deploy/Demo
4. **Enhancement 2** (US4) → Retry logic → Deploy/Demo
5. **Production Ready** (Phases 8-10) → Skill orchestration + edge cases + polish → Final Deploy

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T013)
2. Once Foundational is done:
   - Developer A: User Story 1 (T014-T026)
   - Developer B: User Story 2 (T027-T038)
   - Developer C: User Story 5 (T051-T059)
3. Sync point: Merge MVP stories
4. Then proceed:
   - Developer A: User Story 3 (T039-T044)
   - Developer B: User Story 4 (T045-T050)
   - Developer C: Skill Orchestration (T060-T066)

---

## Task Summary

**Total Tasks**: 83

**Task Count per User Story**:
- Setup (Phase 1): 6 tasks
- Foundational (Phase 2): 7 tasks
- User Story 1 (P1 - Tag Selection): 13 tasks (5 tests + 8 implementation)
- User Story 2 (P1 - Cross-System): 12 tasks (4 tests + 8 implementation)
- User Story 3 (P2 - Parallel): 6 tasks (2 tests + 4 implementation)
- User Story 4 (P2 - Retry): 6 tasks (2 tests + 4 implementation)
- User Story 5 (P1 - Reports): 9 tasks (3 tests + 6 implementation)
- Skill Orchestration (Phase 8): 7 tasks
- Error Handling (Phase 9): 6 tasks
- Polish (Phase 10): 11 tasks

**Parallel Opportunities**: 42 tasks marked [P] (51% parallelizable)

**MVP Scope**: Phases 1-2 + US1 + US2 + US5 = 47 tasks (57% of total)

**Independent Test Criteria**:
- US1: Run with --tags filter, verify only matched scenarios execute
- US2: Run cross-system scenario, verify both C-end/B-end auto-start
- US3: Run with --workers 4, verify parallel execution and correct results
- US4: Run with --retries 2, verify retry behavior and statistics
- US5: Run twice, verify two separate run_id directories exist

---

## Format Validation

✅ All tasks follow checklist format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
✅ All user story tasks have [US#] label
✅ All parallelizable tasks have [P] marker
✅ All task descriptions include specific file paths
✅ Sequential task IDs (T001-T083)

---

**Generated by**: `/speckit.tasks` command
**Date**: 2025-12-30
**Based on**: spec.md (7 clarifications), plan.md (Phase 0-1 complete), data-model.md, research.md

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD requirement)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- TDD coverage requirement: ≥80% per constitution check
- Skill name changed from `e2e-orchestrator` to `e2e-admin` per clarification (Q6)
- e2e-testdata-planner handled differently: prompt user if unavailable (no built-in fallback)
