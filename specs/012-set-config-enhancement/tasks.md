# Tasks: 改进 set-config 命令，支持 JSON 文件读取和 Shell 配置同步

**Input**: Design documents from `/specs/012-set-config-enhancement/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Manual testing only (CLI tool validation)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **CLI Script**: `scripts/claude_manager.py`
- **Core Modules**: `scripts/core/config_manager.py`, `scripts/core/env_manager.py`
- **Reference Implementation**: `scripts/commands/set_config.py`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify prerequisites and prepare for implementation

- [ ] T001 Verify existing modules are available: `scripts/core/config_manager.py` and `scripts/core/env_manager.py`
- [ ] T002 [P] Review `scripts/commands/set_config.py` as reference implementation for `--json-file` and `--to-shell` behavior
- [ ] T003 [P] Review current `cmd_set_config` implementation in `scripts/claude_manager.py` to understand existing parameter handling

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Verify `core/config_manager.py` has `set_claude_config(merge=True)` function for configuration merging
- [ ] T005 Verify `core/config_manager.py` has `set_env_vars_to_shell_config()` function for shell config writing
- [ ] T006 Verify `core/env_manager.py` has `detect_config_file()` function for shell config detection
- [ ] T007 [P] Import required modules in `scripts/claude_manager.py`: `from core.config_manager import set_claude_config, set_env_vars_to_shell_config, load_claude_config` and `from core.env_manager import detect_config_file`
- [ ] T008 [P] Import `Path` from `pathlib` and `json` module in `scripts/claude_manager.py` if not already imported

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 从 JSON 文件读取配置 (Priority: P1) 🎯 MVP

**Goal**: 添加 `--json-file` 参数支持，允许从 JSON 文件批量读取配置并合并到现有配置

**Independent Test**: 创建包含 `env` 和 `permissions` 字段的 JSON 文件，运行 `python scripts/claude_manager.py set-config --json-file scripts/config/claude/settings.json`，验证配置被正确读取并保存到 `~/.claude/settings.json`

### Implementation for User Story 1

- [ ] T009 [US1] Add `--json-file` argument to `set-config` subparser in `scripts/claude_manager.py` using `type=Path` and help text "从 JSON 文件读取配置"
- [ ] T010 [US1] Implement JSON file reading logic in `cmd_set_config()` function in `scripts/claude_manager.py`: resolve relative path to absolute (using `Path.resolve()`), check file exists, read and parse JSON
- [ ] T011 [US1] Extract `env` and `permissions` from JSON data in `cmd_set_config()` function in `scripts/claude_manager.py`, handle missing fields gracefully (use `.get()` with empty dict/list defaults)
- [ ] T012 [US1] Implement configuration merging in `cmd_set_config()` function in `scripts/claude_manager.py`: call `set_claude_config(env_vars=json_env_vars, permissions=json_permissions, merge=True)` when `--json-file` is provided
- [ ] T013 [US1] Add error handling for JSON file operations in `cmd_set_config()` function in `scripts/claude_manager.py`: handle `FileNotFoundError` (file doesn't exist), `json.JSONDecodeError` (invalid JSON), display clear error messages, return exit code 1 on error
- [ ] T014 [US1] Add logging for JSON file operations in `cmd_set_config()` function in `scripts/claude_manager.py`: log when JSON file is loaded, log which fields were extracted, log merge operation

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Test with `python scripts/claude_manager.py set-config --json-file scripts/config/claude/settings.json`

---

## Phase 4: User Story 2 - 同步环境变量到 Shell 配置文件 (Priority: P1)

**Goal**: 添加 `--to-shell` 参数支持，将环境变量同步到 shell 配置文件（`~/.zshrc` 或 `~/.zshenv`）

**Independent Test**: 运行 `python scripts/claude_manager.py set-config --json-file scripts/config/claude/settings.json --to-shell`，验证环境变量被正确写入 `~/.zshrc` 或 `~/.zshenv`

### Implementation for User Story 2

- [ ] T015 [US2] Add `--to-shell` argument to `set-config` subparser in `scripts/claude_manager.py` using `action='store_true'` and help text "同时设置到 shell 配置文件（~/.zshrc）"
- [ ] T016 [US2] Add `--shell-config` argument to `set-config` subparser in `scripts/claude_manager.py` using `type=Path` and help text "Shell 配置文件路径（默认: 自动检测）"
- [ ] T017 [US2] Implement shell config file detection logic in `cmd_set_config()` function in `scripts/claude_manager.py`: if `--shell-config` provided, use it (resolve to absolute path), else call `detect_config_file()` to auto-detect
- [ ] T018 [US2] Add shell config file existence check in `cmd_set_config()` function in `scripts/claude_manager.py`: if file doesn't exist, log error message "未找到 shell 配置文件（~/.zshrc 或 ~/.zshenv）" or "Shell 配置文件不存在: {path}", return exit code 1 (do NOT create file)
- [ ] T019 [US2] Implement shell config writing logic in `cmd_set_config()` function in `scripts/claude_manager.py`: when `--to-shell` is provided, collect all `env_vars` from JSON file and/or command line args, call `set_env_vars_to_shell_config(env_vars, shell_config_path)`
- [ ] T020 [US2] Add success message after shell config write in `cmd_set_config()` function in `scripts/claude_manager.py`: log "✓ 环境变量已设置到: {path}", log "请运行 'source ~/.zshrc' 或重新打开终端使环境变量生效"
- [ ] T021 [US2] Add error handling for shell config write failures in `cmd_set_config()` function in `scripts/claude_manager.py`: if `set_env_vars_to_shell_config()` returns False, log error "设置 shell 环境变量失败", return exit code 1

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Test with `python scripts/claude_manager.py set-config --json-file scripts/config/claude/settings.json --to-shell`

---

## Phase 5: User Story 3 - 统一命令接口 (Priority: P2)

**Goal**: 确保 `claude_manager.py` 的 `set-config` 命令与 `commands/set_config.py` 行为一致，保持向后兼容

**Independent Test**: 运行 `python scripts/claude_manager.py set-config --json-file config.json --to-shell` 和 `python scripts/claude_manager.py set-config --env KEY=VALUE`，验证新参数和现有参数都能正常工作，命令行参数优先于 JSON 文件

### Implementation for User Story 3

- [ ] T022 [US3] Implement configuration priority logic in `cmd_set_config()` function in `scripts/claude_manager.py`: initialize empty `env_vars` and `permissions` dicts, if `--json-file` provided, read JSON and update dicts, then if `--env`/`--permission`/`--alias` provided, update dicts (command line args override JSON values)
- [ ] T023 [US3] Ensure backward compatibility in `cmd_set_config()` function in `scripts/claude_manager.py`: existing `--env`, `--permission`, `--alias` logic continues to work when `--json-file` is NOT provided, existing behavior unchanged
- [ ] T024 [US3] Update `cmd_set_config()` function in `scripts/claude_manager.py` to handle combined usage: when both `--json-file` and `--env`/`--permission`/`--alias` are provided, command line args should override JSON values (implement priority: CLI args > JSON > existing config)
- [ ] T025 [US3] Add validation for parameter format in `cmd_set_config()` function in `scripts/claude_manager.py`: validate `--env`, `--permission`, `--alias` format is `KEY=VALUE`, display error message if format invalid, return exit code 2 for parameter errors
- [ ] T026 [US3] Add comprehensive logging in `cmd_set_config()` function in `scripts/claude_manager.py`: log configuration source (JSON file, command line, existing config), log merge operations, log final configuration being saved

**Checkpoint**: All user stories should now be independently functional. Test with various combinations: `--json-file` only, `--to-shell` only, `--env` only, `--json-file --env`, `--json-file --to-shell`, etc.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T027 [P] Update `scripts/README.md` to document new `--json-file` and `--to-shell` parameters for `set-config` command
- [ ] T028 [P] Add usage examples to `scripts/README.md` showing how to use `--json-file` and `--to-shell` parameters
- [ ] T029 [P] Run manual tests from `quickstart.md` to validate all acceptance scenarios
- [ ] T030 [P] Test edge cases: JSON file with partial config (only `env`, only `permissions`), JSON file with invalid format, shell config file doesn't exist, environment variable values with special characters
- [ ] T031 [P] Verify backward compatibility: test existing `--env`, `--permission`, `--alias` parameters still work as before
- [ ] T032 Code cleanup and refactoring: ensure consistent error messages, consistent logging format, remove any debug code
- [ ] T033 Performance validation: verify command completes in < 3 seconds for typical file sizes (< 100KB)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User Story 1 (P1) can start after Foundational
  - User Story 2 (P1) can start after Foundational (depends on US1 for env_vars collection)
  - User Story 3 (P2) depends on both US1 and US2 completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Depends on US1 for env_vars collection logic
- **User Story 3 (P2)**: Depends on US1 and US2 completion - Integrates priority logic and backward compatibility

### Within Each User Story

- Argument parsing before implementation logic
- Error handling after core logic
- Logging throughout implementation
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T002, T003)
- All Foundational tasks marked [P] can run in parallel (T007, T008)
- User Story 1 tasks T009-T014 can be done sequentially (each depends on previous)
- User Story 2 tasks T015-T021 can be done sequentially (each depends on previous)
- User Story 3 tasks T022-T026 can be done sequentially (each depends on previous)
- All Polish tasks marked [P] can run in parallel (T027, T028, T029, T030, T031)

---

## Parallel Example: User Story 1

```bash
# Sequential execution (recommended for US1):
# T009: Add --json-file argument
# T010: Implement JSON file reading
# T011: Extract env and permissions
# T012: Implement configuration merging
# T013: Add error handling
# T014: Add logging
```

---

## Parallel Example: Foundational Phase

```bash
# Can run in parallel:
Task: "Import required modules in scripts/claude_manager.py"
Task: "Import Path from pathlib and json module in scripts/claude_manager.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (JSON file reading)
4. **STOP and VALIDATE**: Test User Story 1 independently with `python scripts/claude_manager.py set-config --json-file scripts/config/claude/settings.json`
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (JSON file reading) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (Shell config sync) → Test independently → Deploy/Demo
4. Add User Story 3 (Unified interface) → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Sequential Strategy (Recommended)

Since this is a single-file modification with clear dependencies:

1. Complete Setup + Foundational sequentially
2. Complete User Story 1 sequentially (T009 → T010 → T011 → T012 → T013 → T014)
3. Complete User Story 2 sequentially (T015 → T016 → T017 → T018 → T019 → T020 → T021)
4. Complete User Story 3 sequentially (T022 → T023 → T024 → T025 → T026)
5. Complete Polish phase (parallel tasks where possible)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Manual testing required after each user story completion
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: modifying existing parameter behavior, breaking backward compatibility, creating duplicate code (reuse existing modules)

---

## Task Summary

- **Total Tasks**: 33
- **Phase 1 (Setup)**: 3 tasks
- **Phase 2 (Foundational)**: 5 tasks
- **Phase 3 (User Story 1)**: 6 tasks
- **Phase 4 (User Story 2)**: 7 tasks
- **Phase 5 (User Story 3)**: 5 tasks
- **Phase 6 (Polish)**: 7 tasks

**Parallel Opportunities**: 15 tasks marked [P] can run in parallel

**MVP Scope**: Phases 1-3 (User Story 1 only) = 14 tasks

**Independent Test Criteria**:
- **User Story 1**: Create JSON file with `env` and `permissions`, run `set-config --json-file`, verify config saved to `~/.claude/settings.json`
- **User Story 2**: Run `set-config --json-file --to-shell`, verify env vars written to `~/.zshrc` or `~/.zshenv`
- **User Story 3**: Test various parameter combinations, verify backward compatibility and priority rules

