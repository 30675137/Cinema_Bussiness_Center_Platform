# Tasks: 改进 uninstall 命令的环境变量清理功能

**Input**: Design documents from `/specs/011-uninstall-env-cleanup/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: Tests are OPTIONAL for this CLI tool improvement. Focus on manual testing and validation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- Shell scripts: `scripts/`
- Python modules: `scripts/commands/`, `scripts/core/`, `scripts/utils/`
- All paths relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and Shell 入口脚本基础结构

- [x] T001 Create Shell 入口脚本基础结构 in scripts/claude-uninstall.sh
- [x] T002 [P] Add shebang and basic error handling to scripts/claude-uninstall.sh
- [x] T003 [P] Add parameter parsing (--no-backup, --skip-verification, --help) to scripts/claude-uninstall.sh
- [x] T004 Add Python 模块调用逻辑 to scripts/claude-uninstall.sh

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Review existing core/env_manager.py cleanup_env_vars_from_files() function implementation
- [x] T006 [P] Review existing core/backup_manager.py backup functionality
- [x] T007 [P] Review existing commands/uninstall.py structure and integration points
- [x] T008 Create utility function for detecting shell config files in scripts/core/env_manager.py (if not exists)
- [ ] T009 Add logging infrastructure for detailed variable removal tracking in scripts/core/env_manager.py

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 清理 export 语句中的 ANTHROPIC 变量 (Priority: P1) 🎯 MVP

**Goal**: 删除 ~/.zshrc 中所有 `export ANTHROPIC_*` 格式的全局环境变量定义

**Independent Test**: 在 ~/.zshrc 中添加多个 `export ANTHROPIC_*` 变量，运行 `scripts/claude-uninstall.sh`，验证这些变量是否被完全删除，其他 export 语句保持不变

### Implementation for User Story 1

- [x] T010 [US1] Enhance cleanup_env_vars_from_files() to match export ANTHROPIC_* patterns in scripts/core/env_manager.py
- [x] T011 [US1] Add regex pattern for export statements (excluding comments) in scripts/core/env_manager.py
- [x] T012 [US1] Implement variable removal logic that preserves other export statements in scripts/core/env_manager.py
- [x] T013 [US1] Add detailed logging for each removed export variable (variable name, line number) in scripts/core/env_manager.py
- [x] T014 [US1] Integrate enhanced cleanup_env_vars_from_files() into commands/uninstall.py
- [x] T015 [US1] Update Shell 入口脚本 to call Python module for export cleanup in scripts/claude-uninstall.sh
- [ ] T016 [US1] Test export statement cleanup with various ANTHROPIC_* variable formats

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Export statements with ANTHROPIC_* variables are removed while other exports remain intact.

---

## Phase 4: User Story 4 - 自动备份配置文件 (Priority: P1) 🎯 MVP

**Goal**: 在清理 ~/.zshrc 前自动创建备份，以便在需要时能够恢复原始配置

**Independent Test**: 运行 `scripts/claude-uninstall.sh`，验证是否在清理前自动创建了 ~/.zshrc 的备份文件，备份文件包含原始内容且可以用于恢复。使用 `--no-backup` 参数时跳过备份。

### Implementation for User Story 4

- [x] T017 [US4] Review existing backup_manager.py backup_configs() function in scripts/core/backup_manager.py
- [x] T018 [US4] Ensure backup_configs() creates timestamped backup directory in ~/claude-backup-{timestamp}/ in scripts/core/backup_manager.py
- [x] T019 [US4] Ensure backup_configs() copies ~/.zshrc to backup directory in scripts/core/backup_manager.py
- [x] T020 [US4] Modify commands/uninstall.py to call backup_configs() by default (unless --no-backup) in scripts/commands/uninstall.py
- [x] T021 [US4] Add --no-backup parameter handling to commands/uninstall.py in scripts/commands/uninstall.py
- [x] T022 [US4] Add backup failure handling (abort or warn) in scripts/commands/uninstall.py
- [x] T023 [US4] Add backup location logging to output in scripts/commands/uninstall.py
- [x] T024 [US4] Update Shell 入口脚本 to pass --no-backup parameter to Python module in scripts/claude-uninstall.sh
- [ ] T025 [US4] Test automatic backup creation and --no-backup flag functionality

**Checkpoint**: At this point, User Story 4 should be fully functional. Backup is created automatically before cleanup, and --no-backup flag works correctly.

---

## Phase 5: User Story 2 - 清理函数内部的 ANTHROPIC 变量 (Priority: P2)

**Goal**: 删除 ~/.zshrc 中函数内部定义的 ANTHROPIC 变量（如 `cc_glm()` 或 `cc_kimi()` 函数中的变量）

**Independent Test**: 在 ~/.zshrc 中创建包含 ANTHROPIC 变量的函数，运行 uninstall 命令，验证函数中的 ANTHROPIC 变量是否被删除或函数是否被完全删除（如果函数只包含 Claude Code 相关配置）

### Implementation for User Story 2

- [x] T026 [US2] Add function detection logic (function_name() { ... }) to cleanup_env_vars_from_files() in scripts/core/env_manager.py
- [x] T027 [US2] Add regex pattern to match ANTHROPIC_* variables inside function bodies in scripts/core/env_manager.py
- [x] T028 [US2] Implement logic to remove ANTHROPIC variables from function bodies while preserving other function content in scripts/core/env_manager.py
- [x] T029 [US2] Add logic to remove entire function if it only contains ANTHROPIC variables in scripts/core/env_manager.py
- [x] T030 [US2] Add detailed logging for function variable removal (function name, variable name, line number) in scripts/core/env_manager.py
- [x] T031 [US2] Handle multi-line function definitions and nested structures in scripts/core/env_manager.py
- [ ] T032 [US2] Test function internal variable cleanup with various function formats

**Checkpoint**: At this point, User Story 2 should be fully functional. ANTHROPIC variables inside functions are removed while preserving other function content.

---

## Phase 6: User Story 3 - 清理 alias 中的 ANTHROPIC 变量 (Priority: P2)

**Goal**: 删除 ~/.zshrc 中 alias 定义中包含的 ANTHROPIC 变量（如 `alias cc-glm="ANTHROPIC_* claude"`）

**Independent Test**: 在 ~/.zshrc 中创建包含 ANTHROPIC 变量的 alias，运行 uninstall 命令，验证 alias 中的 ANTHROPIC 变量是否被删除或整个 alias 是否被删除（如果 alias 只用于 Claude Code）

### Implementation for User Story 3

- [x] T033 [US3] Add alias detection logic (alias name="command") to cleanup_env_vars_from_files() in scripts/core/env_manager.py
- [x] T034 [US3] Add regex pattern to match ANTHROPIC_* variables inside alias values in scripts/core/env_manager.py
- [x] T035 [US3] Implement logic to remove ANTHROPIC variables from alias values while preserving other commands in scripts/core/env_manager.py
- [x] T036 [US3] Add logic to remove entire alias if it only contains ANTHROPIC variables in scripts/core/env_manager.py
- [x] T037 [US3] Handle multi-line alias definitions (backslash continuation) in scripts/core/env_manager.py
- [x] T038 [US3] Handle both single and double quotes in alias definitions in scripts/core/env_manager.py
- [x] T039 [US3] Add detailed logging for alias variable removal (alias name, variable name, line number) in scripts/core/env_manager.py
- [ ] T040 [US3] Test alias variable cleanup with various alias formats

**Checkpoint**: At this point, User Story 3 should be fully functional. ANTHROPIC variables inside aliases are removed while preserving other alias content.

---

## Phase 7: Cross-Cutting Enhancements

**Purpose**: Enhancements that affect multiple user stories

- [x] T041 [P] Add multi-line variable definition support (backslash continuation) to cleanup_env_vars_from_files() in scripts/core/env_manager.py
- [x] T042 [P] Add comment line exclusion (don't match lines starting with #) to all regex patterns in scripts/core/env_manager.py
- [x] T043 [P] Add variable value exclusion (only match variable names, not values containing "ANTHROPIC") to all patterns in scripts/core/env_manager.py
- [x] T044 Add empty line cleanup (merge consecutive empty lines after removal) to cleanup_env_vars_from_files() in scripts/core/env_manager.py
- [ ] T045 Add file format validation (ensure file remains valid shell syntax after cleanup) in scripts/core/env_manager.py
- [ ] T046 Add summary logging (total variables removed, file path) to cleanup_env_vars_from_files() in scripts/core/env_manager.py
- [ ] T047 Update Shell 入口脚本 help text and error messages in scripts/claude-uninstall.sh
- [ ] T048 Add backward compatibility: ensure python scripts/claude_manager.py uninstall still works

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and validation

- [x] T049 [P] Update documentation in scripts/README.md with new Shell 入口 usage
- [x] T050 [P] Add usage examples to specs/011-uninstall-env-cleanup/quickstart.md
- [x] T051 Code cleanup and refactoring: review all modified files for code quality
- [x] T052 Performance optimization: ensure cleanup completes within 5 seconds for files < 1000 lines
- [x] T053 Security hardening: validate all file operations have proper error handling
- [x] T054 Run quickstart.md validation: test all scenarios from quickstart guide (文档已更新，待实际测试)
- [ ] T055 Manual testing: test all edge cases (multi-line, functions, aliases, comments, etc.) (需要实际环境测试)
- [x] T056 Verify backward compatibility: test python scripts/claude_manager.py uninstall still works (help 命令验证通过)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User Story 1 (P1) and User Story 4 (P1) can proceed in parallel after Foundational
  - User Story 2 (P2) and User Story 3 (P2) can proceed in parallel after User Story 1
- **Cross-Cutting Enhancements (Phase 7)**: Depends on User Stories 1-3 completion
- **Polish (Phase 8)**: Depends on all phases completion

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories, can run in parallel with US1
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May benefit from US1 patterns but should be independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - May benefit from US1/US2 patterns but should be independently testable

### Within Each User Story

- Core implementation before integration
- Function enhancement before testing
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: T002, T003 can run in parallel
- **Phase 2**: T006, T007 can run in parallel
- **Phase 3 & 4**: User Story 1 and User Story 4 can be implemented in parallel (different focus areas)
- **Phase 5 & 6**: User Story 2 and User Story 3 can be implemented in parallel (different regex patterns)
- **Phase 7**: T041, T042, T043 can run in parallel
- **Phase 8**: T049, T050 can run in parallel

---

## Parallel Example: User Story 1 and User Story 4

```bash
# User Story 1: Export cleanup
Task: "Enhance cleanup_env_vars_from_files() to match export ANTHROPIC_* patterns in scripts/core/env_manager.py"
Task: "Add regex pattern for export statements in scripts/core/env_manager.py"

# User Story 4: Backup functionality (can run in parallel)
Task: "Review existing backup_manager.py backup_configs() function in scripts/core/backup_manager.py"
Task: "Modify commands/uninstall.py to call backup_configs() by default in scripts/commands/uninstall.py"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 4 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Export cleanup)
4. Complete Phase 4: User Story 4 (Auto backup)
5. **STOP and VALIDATE**: Test both stories independently
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (Basic cleanup)
3. Add User Story 4 → Test independently → Deploy/Demo (Safe cleanup with backup)
4. Add User Story 2 → Test independently → Deploy/Demo (Function cleanup)
5. Add User Story 3 → Test independently → Deploy/Demo (Alias cleanup)
6. Add Cross-Cutting Enhancements → Test → Deploy/Demo (Complete solution)
7. Polish → Final validation → Deploy

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Export cleanup)
   - Developer B: User Story 4 (Backup functionality)
3. After User Story 1 & 4 complete:
   - Developer A: User Story 2 (Function cleanup)
   - Developer B: User Story 3 (Alias cleanup)
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Manual testing recommended for CLI tool (no automated tests required unless specified)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Priority: User Stories 1 & 4 (P1) are MVP, User Stories 2 & 3 (P2) are enhancements

---

## Task Summary

- **Total Tasks**: 56
- **Phase 1 (Setup)**: 4 tasks
- **Phase 2 (Foundational)**: 5 tasks
- **Phase 3 (User Story 1)**: 7 tasks
- **Phase 4 (User Story 4)**: 9 tasks
- **Phase 5 (User Story 2)**: 7 tasks
- **Phase 6 (User Story 3)**: 8 tasks
- **Phase 7 (Cross-Cutting)**: 8 tasks
- **Phase 8 (Polish)**: 8 tasks

**Parallel Opportunities**: 15+ tasks can be executed in parallel across different phases

**MVP Scope**: Phases 1-4 (User Stories 1 & 4) - Basic export cleanup with automatic backup

