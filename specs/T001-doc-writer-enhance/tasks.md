# Tasks: Doc-Writer Skill Enhancement

**Input**: Design documents from `/specs/T001-doc-writer-enhance/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: This is a Claude Skill configuration project. Testing is done via manual acceptance testing in Claude Code CLI, not automated tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

This is a Claude Code Skill configuration project. Key paths:
- **Commands**: `.claude/commands/`
- **Skills**: `.claude/skills/doc-writer/`
- **Templates**: `.claude/skills/doc-writer/templates/`
- **Output Docs**: `docs/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify project structure and create base directories

- [x] T001 Verify `.claude/commands/` directory exists and create if missing
- [x] T002 Verify `.claude/skills/doc-writer/` directory structure exists
- [x] T003 [P] Create `docs/` output directory structure with subdirectories (tdd/, architecture/, api/, database/, detail-design/, product/, manual/, guide/, matrix/, release-notes/, readme/)
- [x] T004 [P] Review existing `.claude/commands/ops.md` as reference implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core files that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create command configuration file `.claude/commands/doc.md` with frontmatter (description, allowed-tools, argument-hint)
- [x] T006 [P] Create source parser configuration `.claude/skills/doc-writer/source-parsers.yaml`
- [x] T007 Add role definition and execution guide structure to `.claude/commands/doc.md`
- [x] T008 Update `.claude/skills/doc-writer/SKILL.md` to add command entry section referencing `/doc` command

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - 通过 /doc 命令快速生成设计文档 (Priority: P1) 🎯 MVP

**Goal**: Users can invoke `/doc` command to start document generation workflow, with type selection and existing document type support (TDD, Architecture, Detail Design, API, Database)

**Independent Test**: In Claude Code, type `/doc` and verify document type list is displayed; type `/doc tdd` and verify TDD generation starts with active spec

### Implementation for User Story 1

- [x] T009 [US1] Add document type listing to `.claude/commands/doc.md` - show all available types when user runs `/doc` without arguments
- [x] T010 [US1] Implement `/doc help` command output in `.claude/commands/doc.md` - display usage instructions and available types
- [x] T011 [US1] Add single document generation flow for `/doc <type>` in `.claude/commands/doc.md` - load active spec and generate document
- [x] T012 [US1] Add spec loading logic to `.claude/commands/doc.md` - read `.specify/active_spec.txt` and load spec.md, plan.md, data-model.md
- [x] T013 [US1] Add template selection logic to `.claude/commands/doc.md` - map type code to template file path
- [x] T014 [US1] Add output path generation logic to `.claude/commands/doc.md` - generate correct `docs/` path based on type category
- [x] T015 [US1] Add no-spec-active handling to `.claude/commands/doc.md` - prompt user to activate spec or provide info manually
- [x] T016 [US1] Add generation completion summary to `.claude/commands/doc.md` - show document type, output path, sections generated

**Checkpoint**: User Story 1 complete - `/doc` command works for basic document generation

---

## Phase 4: User Story 2 - 智能识别文档需求并推荐文档类型 (Priority: P2)

**Goal**: System can recognize natural language descriptions and map them to document types (e.g., "技术方案" → TDD)

**Independent Test**: Type `/doc 技术方案` and verify system recognizes intent as TDD type

### Implementation for User Story 2

- [x] T017 [US2] Create intent recognition table in `.claude/commands/doc.md` - keyword → document type mapping
- [x] T018 [US2] Add keyword matching logic to `.claude/commands/doc.md` - parse user input and match against keyword list
- [x] T019 [US2] Add ambiguous input handling to `.claude/commands/doc.md` - when intent unclear, show type selection menu
- [x] T020 [US2] Update `.claude/skills/doc-writer/SKILL.md` - add intent recognition keywords section with full keyword list
- [x] T021 [US2] Test all keyword mappings in `.claude/commands/doc.md`:
  - 技术方案/TDD/技术设计 → tdd
  - 架构/系统设计 → arch
  - 详细设计/DDD/模块设计 → detail
  - 接口/API → api
  - 数据库/表设计 → db
  - 手册/使用说明 → manual
  - README/项目说明 → readme
  - 发布/CHANGELOG → release-notes
  - 功能矩阵/功能列表 → matrix

**Checkpoint**: User Story 2 complete - natural language intent recognition works

---

## Phase 5: User Story 3 - 增量更新现有设计文档 (Priority: P3)

**Goal**: Users can update existing documents while preserving their manual modifications

**Independent Test**: Run `/doc update` on a document with manual edits and verify edits are preserved

### Implementation for User Story 3

- [x] T022 [US3] Add `/doc update` command handling to `.claude/commands/doc.md` - detect update intent
- [x] T023 [US3] Add document state tracking concept to `.claude/skills/doc-writer/SKILL.md` - explain `.doc-writer-state.json` usage
- [x] T024 [US3] Add change detection logic to `.claude/commands/doc.md` - compare spec modification time vs doc generation time
- [x] T025 [US3] Define user modification markers in `.claude/skills/doc-writer/SKILL.md`:
  - `<!-- DOC-WRITER: AUTO-GENERATED START/END -->`
  - `<!-- DOC-WRITER: USER-SECTION START/END -->`
- [x] T026 [US3] Add preservation logic to `.claude/commands/doc.md` - identify and preserve USER-SECTION content
- [x] T027 [US3] Add conflict detection to `.claude/commands/doc.md` - show warning when user edits conflict with generated content
- [x] T028 [US3] Add update summary to `.claude/commands/doc.md` - show changed sections, preserved sections, conflicts

**Checkpoint**: User Story 3 complete - incremental update preserves user modifications

---

## Phase 6: User Story 4 - 支持多种软件文档类型 (Priority: P4)

**Goal**: Support additional document types: Manual, README, Release Notes, Feature Matrix, with `/doc init` for full initialization

**Independent Test**: Run `/doc manual` and verify user manual is generated; run `/doc matrix` and verify feature matrix aggregates all specs

### Implementation for User Story 4

#### New Templates

- [x] T029 [P] [US4] Create user manual template `.claude/skills/doc-writer/templates/manual.md`
- [x] T030 [P] [US4] Create README template `.claude/skills/doc-writer/templates/readme.md`
- [x] T031 [P] [US4] Create release notes template `.claude/skills/doc-writer/templates/release-notes.md`
- [x] T032 [P] [US4] Create feature matrix template `.claude/skills/doc-writer/templates/feature-matrix.md`

#### Feature Matrix Generation

- [x] T033 [US4] Add `/doc matrix` handling to `.claude/commands/doc.md` - scan all specs and generate matrix
- [x] T034 [US4] Add spec metadata reading to `.claude/commands/doc.md` - extract System, Module, SubModule from spec headers
- [x] T035 [US4] Add matrix table generation to `.claude/commands/doc.md` - format as markdown table with proper columns

#### Full Initialization

- [x] T036 [US4] Add `/doc init` handling to `.claude/commands/doc.md` - full scan and batch generation
- [x] T037 [US4] Add `--source` parameter parsing to `.claude/commands/doc.md` - support additional source folders
- [x] T038 [US4] Add conflict handling for init to `.claude/commands/doc.md` - prompt overwrite/skip when docs exist
- [x] T039 [US4] Add init completion report to `.claude/commands/doc.md` - document count, by category, output paths

#### Module-based Organization

- [x] T040 [US4] Add module path generation to `.claude/commands/doc.md` - `docs/{category}/{module}/` for product/detail-design docs
- [x] T041 [US4] Update `.claude/skills/doc-writer/SKILL.md` - document module-based directory structure

#### Skill Definition Updates

- [x] T042 [US4] Add new document types section to `.claude/skills/doc-writer/SKILL.md` - manual, readme, release-notes, matrix
- [x] T043 [US4] Add output directory structure section to `.claude/skills/doc-writer/SKILL.md`
- [x] T044 [US4] Add spec metadata extension documentation to `.claude/skills/doc-writer/SKILL.md` - System, Module, SubModule fields

**Checkpoint**: User Story 4 complete - all document types and full initialization work

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and validation

- [x] T045 [P] Update `.claude/skills/doc-writer/README.md` with complete feature documentation
- [x] T046 Add error handling templates to `.claude/commands/doc.md`:
  - Missing spec file
  - Missing template
  - Invalid document type
  - Output directory creation failure
- [x] T047 Add edge case handling per spec.md Edge Cases section to `.claude/commands/doc.md`
- [x] T048 Run validation per `quickstart.md` verification steps
- [x] T049 Update `SKILL.md` version to 2.0.0 and add changelog entry

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can proceed sequentially in priority order (P1 → P2 → P3 → P4)
  - Some parallelization possible within US4 (templates can be created in parallel)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Enhances US1 but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Builds on US1 output but independently testable
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Extends US1 patterns but independently testable

### Within Each User Story

- Configuration file structure before specific implementations
- Base handling before extended features
- Core logic before error handling

### Parallel Opportunities

- T003 and T004 in Setup can run in parallel
- T006 in Foundational can run in parallel with T005
- T029, T030, T031, T032 (all templates) in US4 can run in parallel
- T045 in Polish can run in parallel with other Polish tasks

---

## Parallel Example: User Story 4 Templates

```bash
# Launch all template creation tasks together:
Task: "Create user manual template .claude/skills/doc-writer/templates/manual.md"
Task: "Create README template .claude/skills/doc-writer/templates/readme.md"
Task: "Create release notes template .claude/skills/doc-writer/templates/release-notes.md"
Task: "Create feature matrix template .claude/skills/doc-writer/templates/feature-matrix.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test `/doc` and `/doc tdd` commands
5. Deploy/demo if ready - basic document generation works

### Incremental Delivery

1. Complete Setup + Foundational → Command file created, skill updated
2. Add User Story 1 → Test `/doc tdd` → Deploy (MVP!)
3. Add User Story 2 → Test `/doc 技术方案` → Deploy
4. Add User Story 3 → Test `/doc update` → Deploy
5. Add User Story 4 → Test `/doc init`, `/doc matrix` → Deploy
6. Each story adds value without breaking previous stories

### Single Developer Strategy

Recommended execution order:
1. T001-T004 (Setup)
2. T005-T008 (Foundational)
3. T009-T016 (US1 - MVP)
4. T017-T021 (US2)
5. T022-T028 (US3)
6. T029-T044 (US4)
7. T045-T049 (Polish)

---

## Notes

- All tasks create or modify Markdown/YAML configuration files, not code
- Testing is manual via Claude Code CLI
- Each user story can be validated by running the corresponding `/doc` command
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
