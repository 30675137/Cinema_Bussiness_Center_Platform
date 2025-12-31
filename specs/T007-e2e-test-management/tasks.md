# Tasks: E2E 测试管理规范

**@spec T007-e2e-test-management**

**Branch**: `T007-e2e-test-management` | **Date**: 2025-12-31 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Task Overview

| Phase | Tasks | Priority | Status |
|-------|-------|----------|--------|
| Phase 1: Setup | 3 | - | Complete |
| Phase 2: Foundational | 4 | - | Complete |
| Phase 3: US1 统一入口测试管理 | 5 | P1 | Complete |
| Phase 4: US2 人工测试用例文档管理 | 8 | P1 | Complete |
| Phase 5: US3 服务自动化管理 | 6 | P1 | Complete |
| Phase 6: US4 测试报告静态网站 | 5 | P2 | Complete |
| Phase 7: US5 优化的目录结构 | 4 | P2 | Complete |
| Phase 8: US6 测试执行调度 | 3 | P2 | Complete |
| Phase 9: Polish & Integration | 4 | - | Complete |
| **Total** | **42** | | **42/42 Complete** |

---

## Phase 1: Setup (项目初始化)

- [X] **T001** Setup: Create feature branch `T007-e2e-test-management` from dev
- [X] **T002** Setup: Create directory structure for new skill
  - `.claude/skills/manual-testcase-generator/`
  - `.claude/skills/manual-testcase-generator/assets/templates/`
  - `.claude/skills/manual-testcase-generator/references/`
- [X] **T003** Setup: Create testcases directory structure
  - `testcases/` root directory
  - `testcases/order/`, `testcases/inventory/` module subdirectories
  - `testcases/*/docs/` generated document directories

---

## Phase 2: Foundational (基础设施)

> Blocking prerequisites for all user stories

- [X] **T004** [P1] Foundational: Define ManualTestCase YAML schema validation
  - File: `.claude/skills/manual-testcase-generator/assets/schemas/testcase-schema.json`
  - Implements: data-model.md Section 1 ManualTestCase Schema
  - Validation rules: testcase_id pattern `^TC-[A-Z]+-\d{3}$`, priority enum, steps non-empty

- [X] **T005** [P1] Foundational: Create Markdown document template for TC YAML
  - File: `.claude/skills/manual-testcase-generator/assets/templates/testcase-doc.md.tpl`
  - Fields: title, testcase_id, module, priority, preconditions, test_data, steps table, assertions
  - Footer: Generated timestamp, source path

- [X] **T006** [P1] Foundational: Create Markdown document template for E2E YAML
  - File: `.claude/skills/manual-testcase-generator/assets/templates/scenario-doc.md.tpl`
  - Fields: scenario_id, title, description, preconditions, step descriptions only
  - Exclude: CSS selectors, locators, assertion code (per FR-040)

- [X] **T007** [P1] Foundational: Create ServiceConfig YAML schema
  - File: `.claude/skills/e2e-admin/assets/service-config.yaml`
  - Services: c-end (10086), b-end (3000), backend (8080)
  - Config: port_conflict_strategy (prompt/auto-kill/fail)
  - Implements: data-model.md Section 2 ServiceConfig Schema

---

## Phase 3: US1 统一入口测试管理 (P1)

> 作为 QA 工程师，我希望通过 `/e2e` 命令作为统一入口管理所有 E2E 测试活动

- [X] **T008** [P1] [US1] Update e2e skill.md with new subcommands
  - File: `.claude/skills/e2e/skill.md`
  - Add: testcase, report subcommands to description
  - Update: YAML frontmatter version
  - Implements: FR-001, FR-002

- [X] **T009** [P1] [US1] Implement `/e2e testcase` subcommand routing
  - File: `.claude/skills/e2e/skill.md`
  - Subcommands: create, list, execute, generate-doc, validate
  - Dispatch to manual-testcase-generator for generate-doc

- [X] **T010** [P1] [US1] Implement `/e2e scenario generate-doc` routing
  - File: `.claude/skills/e2e/skill.md`
  - Route to manual-testcase-generator with scenario YAML input
  - Implements: FR-039

- [X] **T011** [P1] [US1] Implement `/e2e report` subcommand routing
  - File: `.claude/skills/e2e/skill.md`
  - Subcommands: serve, list, compare
  - Implements: report system integration

- [X] **T012** [P1] [US1] Update `/e2e help` output with all subcommands
  - File: `.claude/skills/e2e/skill.md`
  - Include: generate, run, orchestrate, create-scenario, validate-scenario, testdata, testcase, report
  - Acceptance: `/e2e help` shows all commands with descriptions

---

## Phase 4: US2 人工测试用例文档管理 (P1)

> 作为 QA 工程师，我希望能够创建、管理和执行人工测试用例文档

- [X] **T013** [P1] [US2] Create manual-testcase-generator skill.md
  - File: `.claude/skills/manual-testcase-generator/skill.md`
  - YAML frontmatter: name, description (with 中英文 keywords), version
  - Core workflow: TC YAML → Markdown, E2E YAML → Markdown
  - @spec T007-e2e-test-management attribution
  - Implements: FR-033, FR-034

- [X] **T014** [P1] [US2] Implement TC YAML to Markdown conversion logic
  - File: `.claude/skills/manual-testcase-generator/skill.md`
  - Input: `testcases/<module>/TC-*.yaml`
  - Output: `testcases/<module>/docs/TC-*.md`
  - Field mapping: All human-readable fields
  - Implements: FR-035, FR-036

- [X] **T015** [P1] [US2] Implement E2E YAML to Markdown conversion logic
  - File: `.claude/skills/manual-testcase-generator/skill.md`
  - Input: `scenarios/<module>/E2E-*.yaml`
  - Output: `scenarios/<module>/docs/E2E-*.md`
  - Field extraction: metadata + step.description only
  - Implements: FR-039, FR-040

- [X] **T016** [P1] [US2] Implement batch document generation
  - File: `.claude/skills/manual-testcase-generator/skill.md`
  - Command: `/e2e testcase generate-doc --module <module>`
  - Scan all TC-*.yaml in module directory
  - Generate all corresponding Markdown files
  - Implements: FR-037

- [X] **T017** [P1] [US2] Implement `/e2e testcase create` interactive flow
  - File: `.claude/skills/e2e/skill.md`
  - Guided input: testcase_id, title, module, priority, preconditions, test_data, steps
  - Auto-suggest ID: TC-<MODULE>-<NEXT_NUMBER>
  - Output: YAML file to `testcases/<module>/`
  - Implements: FR-005, FR-006, FR-007, FR-009

- [X] **T018** [P1] [US2] Implement testdata_ref resolution
  - File: `.claude/skills/manual-testcase-generator/skill.md`
  - Parse `testdata_ref` field (format: `namespace.key`)
  - Load from e2e-testdata-planner blueprints
  - Inject resolved data into Markdown
  - Implements: FR-008

- [X] **T019** [P1] [US2] Implement `/e2e testcase execute` flow
  - File: `.claude/skills/e2e/skill.md`
  - Display testcase details step-by-step
  - Prompt for actual_result (Pass/Fail/Blocked/Skipped)
  - Record execution to YAML executions[] array
  - Implements: FR-010, FR-038

- [X] **T020** [P1] [US2] Implement `/e2e testcase list` filtering
  - File: `.claude/skills/e2e/skill.md`
  - Filter by: --module, --priority, --tags
  - Display: testcase_id, title, priority, last execution status
  - Implements: spec User Story 2 Scenario 3

---

## Phase 5: US3 服务自动化管理 (P1)

> 作为 QA 工程师或开发人员，我希望 E2E 测试执行时能自动检测、启动和管理所需的服务

- [X] **T021** [P1] [US3] Implement port detection logic
  - File: `.claude/skills/e2e-admin/skill.md`
  - Use: `lsof -i :PORT` or equivalent
  - Detect ports: 10086 (c-end), 3000 (b-end), 8080 (backend)
  - Return: occupied/available status, PID if occupied
  - Implements: FR-017, FR-018

- [X] **T022** [P1] [US3] Implement service startup logic
  - File: `.claude/skills/e2e-admin/skill.md`
  - Read config from service-config.yaml
  - Execute start_command in configured directory
  - Spawn background process, capture PID
  - Implements: FR-019

- [X] **T023** [P1] [US3] Implement health check polling
  - File: `.claude/skills/e2e-admin/skill.md`
  - Poll health_check_url with retry logic
  - Timeout: configurable (default 60s)
  - Return: healthy/unhealthy/timeout status
  - Implements: FR-020, FR-023

- [X] **T024** [P1] [US3] Implement port conflict handling
  - File: `.claude/skills/e2e-admin/skill.md`
  - Strategy based on port_conflict_strategy config
  - Options: prompt user, auto-kill, fail
  - Display PID and process name for user decision
  - Implements: FR-021

- [X] **T025** [P1] [US3] Implement service cleanup logic
  - File: `.claude/skills/e2e-admin/skill.md`
  - Track spawned PIDs during session
  - Send shutdown_signal (SIGTERM default)
  - Verify process termination
  - Implements: FR-022

- [X] **T026** [P1] [US3] Integrate service management into e2e-admin orchestration
  - File: `.claude/skills/e2e-admin/skill.md`
  - Add service lifecycle to execution flow
  - Order: detect → start → health check → run tests → cleanup
  - Implements: FR-031 service lifecycle integration

---

## Phase 6: US4 测试报告静态网站 (P2)

> 作为项目经理或 QA 主管，我希望有一个统一的测试报告网站

- [X] **T027** [P2] [US4] Create report portal HTML template
  - File: `reports/e2e/e2e-portal/index.html`
  - Features: Report list, filtering, comparison view
  - Load data from reports.json
  - Responsive design, < 3s load time
  - Implements: FR-026

- [X] **T028** [P2] [US4] Create ReportIndex JSON schema and initial file
  - File: `reports/e2e/e2e-portal/reports.json`
  - Schema: data-model.md Section 3 ReportIndex Schema
  - Fields: portal_version, generated_at, reports[]
  - Implements: FR-024

- [X] **T029** [P2] [US4] Implement report index auto-update
  - File: `.claude/skills/e2e-admin/skill.md`
  - After test run: Update reports.json with new entry
  - Generate unique run_id: YYYYMMDD-HHMMSS-hash
  - Implements: FR-024, FR-025

- [X] **T030** [P2] [US4] Implement `/e2e report serve` command
  - File: `.claude/skills/e2e/skill.md`
  - Start local HTTP server on port 9323
  - Serve reports/e2e/e2e-portal/ directory
  - Display access URL
  - Implements: FR-028

- [X] **T031** [P2] [US4] Implement report filtering in portal
  - File: `reports/e2e/e2e-portal/index.html`
  - Filters: time range, module (tags_filter), status (pass/fail)
  - Client-side JavaScript filtering
  - Implements: FR-027

---

## Phase 7: US5 优化的目录结构 (P2)

> 作为开发人员或 QA 工程师，我希望测试相关文件有清晰的目录结构

- [X] **T032** [P2] [US5] Create scenarios directory structure
  - Directories: `scenarios/<module>/`, `scenarios/<module>/docs/`
  - README.md with structure documentation
  - Implements: FR-012

- [X] **T033** [P2] [US5] Update e2e-test-generator output paths
  - File: `.claude/skills/e2e-test-generator/skill.md`
  - Output: `scenarios/<module>/<scenario-id>.spec.ts` (current convention maintained)
  - Ensure module subdirectory creation
  - Implements: FR-011

- [X] **T034** [P2] [US5] Verify testdata directory structure
  - Directories: `testdata/blueprints/`, `testdata/seeds/`, `testdata/scripts/`
  - Ensure compatibility with e2e-testdata-planner
  - Implements: FR-014

- [X] **T035** [P2] [US5] Configure report output directory structure
  - File: `.claude/skills/e2e-report-configurator/skill.md`
  - Output: `reports/e2e/run-<timestamp>-<hash>/`
  - Include: index.html, summary.json, artifacts/
  - Implements: FR-015

---

## Phase 8: US6 测试执行通过 e2e-admin 调度 (P2)

> 作为 QA 工程师，我希望所有测试执行都通过 e2e-admin 进行统一调度

- [X] **T036** [P2] [US6] Update `/e2e run` to delegate to e2e-admin
  - File: `.claude/skills/e2e/skill.md`
  - Internal call: `/e2e-admin --scenario-ids <id>`
  - Pass-through options: --headed, --debug
  - Implements: FR-003, FR-030

- [X] **T037** [P2] [US6] Update `/e2e orchestrate` to delegate to e2e-admin
  - File: `.claude/skills/e2e/skill.md`
  - Internal call: `/e2e-admin --tags <tags>`
  - Full workflow: load → validate → generate → configure → start → run → report → cleanup
  - Implements: FR-004, FR-030, FR-031

- [X] **T038** [P2] [US6] Implement skip options for execution phases
  - File: `.claude/skills/e2e-admin/skill.md`
  - Options: --skip-generation, --skip-validation, --skip-service-start
  - Document each skip option behavior
  - Implements: FR-032

---

## Phase 9: Polish & Cross-Cutting Concerns

- [X] **T039** Polish: Validate all skill.md files have correct YAML frontmatter
  - Check: name, description (中英文 keywords), version
  - Files: e2e, manual-testcase-generator, e2e-admin
  - Implements: Rule R10.3

- [X] **T040** Polish: Create example TC YAML file
  - File: `testcases/order/TC-ORDER-001.yaml`
  - Follow data-model.md ManualTestCase schema
  - Include sample execution record

- [X] **T041** Polish: Create example generated Markdown file
  - File: `testcases/order/docs/TC-ORDER-001.md`
  - Generated from TC-ORDER-001.yaml
  - Verify template rendering

- [X] **T042** Integration: End-to-end workflow validation
  - Test: `/e2e testcase create` → generate TC YAML
  - Test: `/e2e testcase generate-doc` → generate Markdown
  - Test: `/e2e orchestrate --tags "module:order"` → full workflow
  - Verify: SC-001 (≤ 5 minutes), SC-006 (90% no manual intervention)

---

## Dependency Graph

```
Phase 1 (Setup)
    │
    ▼
Phase 2 (Foundational) ─────────────────────────┐
    │                                           │
    ├──────────────┬──────────────┐            │
    ▼              ▼              ▼            │
Phase 3 (US1)  Phase 4 (US2)  Phase 5 (US3)   │
    │              │              │            │
    └──────────────┴──────────────┘            │
                   │                           │
    ┌──────────────┼──────────────┐            │
    ▼              ▼              ▼            │
Phase 6 (US4)  Phase 7 (US5)  Phase 8 (US6)   │
    │              │              │            │
    └──────────────┴──────────────┘            │
                   │                           │
                   ▼                           │
            Phase 9 (Polish) ◄─────────────────┘
```

---

## Success Criteria Mapping

| Criteria | Tasks | Validation |
|----------|-------|------------|
| SC-001: 完整测试流程 ≤ 5 分钟 | T042 | End-to-end timing test |
| SC-002: 服务自动管理减少 80% 准备时间 | T021-T026 | Before/after comparison |
| SC-003: 100% 用例遵循标准化格式 | T004, T017 | Schema validation |
| SC-004: 报告页面 < 3 秒加载 | T027 | Performance test |
| SC-005: 支持 3 种服务类型 | T007, T021-T025 | Service lifecycle test |
| SC-006: 90% 测试无需手动干预 | T042 | Automated execution rate |
| SC-007: 保留 30 次运行记录 | T028, T029 | Report index verification |

---

## Version

- **Spec**: T007-e2e-test-management
- **Tasks Version**: 1.0.0
- **Generated**: 2025-12-31
