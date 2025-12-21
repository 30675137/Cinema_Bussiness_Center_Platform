# Tasks: Claude 卸载清理自动化脚本

**Feature Branch**: `001-claude-cleanup-script`
**Date**: 2025-12-13
**Input**: Design documents from `/specs/001-claude-cleanup-script/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/cli-interface.md, research.md

**Tests**: OPTIONAL - Not required unless explicitly requested

**Organization**: Tasks grouped by user story to enable independent implementation and testing

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- **[P]**: Parallelizable (different files, no dependencies)
- **[Story]**: User story label (e.g., [US1], [US2])
- Include exact file paths

## Path Conventions

- **Single script**: `scripts/claude_manager.py` (~800 lines)
- **Tests**: `tests/unit/`, `tests/integration/`, `tests/fixtures/`
- **Docs**: `scripts/README.md`

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Create project structure and development environment

- [ ] T001 Create scripts directory and main script file `scripts/claude_manager.py`
- [ ] T002 [P] Create test directory structure `tests/unit/`, `tests/integration/`, `tests/fixtures/`
- [ ] T003 [P] Create pytest configuration file `pytest.ini`
- [ ] T004 [P] Create development requirements file `requirements-dev.txt` (pytest, pytest-cov, mypy)
- [ ] T005 [P] Create `.gitignore` for Python project (if not exists)

**Checkpoint**: Project structure ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure MUST be complete before ANY user story

**⚠️ CRITICAL**: No user story work until this phase completes

- [ ] T006 Implement main entry point with `argparse` in `scripts/claude_manager.py`
- [ ] T007 Implement global options (`--dry-run`, `--verbose`, `--quiet`) in `scripts/claude_manager.py`
- [ ] T008 Implement logging setup function (`setup_logging()`) using standard `logging` module in `scripts/claude_manager.py`
- [ ] T009 Implement command execution wrapper (`execute_command()`) with dry-run support in `scripts/claude_manager.py`
- [ ] T010 Define data structures (`CleanupStep`, `ValidationCheck`, `ClaudeSettings`, etc.) using `dataclass` and `Enum` in `scripts/claude_manager.py`
- [ ] T011 Implement shell config detection (`detect_zsh_config()`) with `$ZDOTDIR`, `~/.zshenv`, `~/.zshrc` fallback in `scripts/claude_manager.py`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - 执行完整卸载清理流程 (Priority: P1) 🎯 MVP

**Goal**: 用户需要一键执行完整的 Claude 卸载和清理流程

**Independent Test**: 在系统上安装 Claude，运行 `python scripts/claude_manager.py uninstall`，验证所有组件被正确卸载

### Tests for User Story 1 (OPTIONAL - NOT REQUIRED)

_Skip unless tests are explicitly requested or TDD approach chosen_

### Implementation for User Story 1

- [ ] T012 [US1] Create `uninstall` subcommand parser with `argparse.add_parser()` in `scripts/claude_manager.py`
- [ ] T013 [US1] Add `--backup` and `--skip-verification` options to uninstall parser in `scripts/claude_manager.py`
- [ ] T014 [US1] Implement process detection using `pgrep` command (`detect_processes()`) in `scripts/claude_manager.py`
- [ ] T015 [US1] Implement process termination using `pkill` (SIGTERM then SIGKILL) (`kill_processes()`) in `scripts/claude_manager.py`
- [ ] T016 [US1] Implement npm package detection using `npm list -g` + `which` double validation (`detect_npm_packages()`) in `scripts/claude_manager.py`
- [ ] T017 [US1] Implement npm package uninstallation using `npm uninstall -g` (`uninstall_npm_packages()`) in `scripts/claude_manager.py`
- [ ] T018 [US1] Implement Homebrew detection using `brew list` (`detect_homebrew()`) in `scripts/claude_manager.py`
- [ ] T019 [US1] Implement Homebrew uninstallation using `brew uninstall` (`uninstall_homebrew()`) in `scripts/claude_manager.py`
- [ ] T020 [US1] Implement Native installation detection (check `~/.local/bin/claude`, `~/.claude-code`) (`detect_native()`) in `scripts/claude_manager.py`
- [ ] T021 [US1] Implement Native installation cleanup (delete files) (`cleanup_native()`) in `scripts/claude_manager.py`
- [ ] T022 [US1] Implement NVM version traversal and package cleanup (`cleanup_nvm()`) in `scripts/claude_manager.py`
- [ ] T023 [US1] Implement user config cleanup (delete `~/.claude`, `~/.claude.json`, etc.) (`cleanup_user_configs()`) in `scripts/claude_manager.py`
- [ ] T024 [US1] Implement project residue search and cleanup (`.claude/`, `.mcp.json`) (`cleanup_project_residue()`) in `scripts/claude_manager.py`
- [ ] T025 [US1] Implement environment variable cleanup from shell config using regex (`cleanup_env_vars()`) in `scripts/claude_manager.py`
- [ ] T026 [US1] Implement alias cleanup from shell config using regex (`cleanup_aliases()`) in `scripts/claude_manager.py`
- [ ] T027 [US1] Implement main `cmd_uninstall()` function coordinating all cleanup steps in `scripts/claude_manager.py`
- [ ] T028 [US1] Add error handling with `try-except` for each cleanup step (FR-018: continue on error) in `scripts/claude_manager.py`
- [ ] T029 [US1] Add `CleanupStep` tracking for each operation with duration measurement in `scripts/claude_manager.py`
- [ ] T030 [US1] Implement uninstall report generation showing success/failed/skipped counts (FR-019) in `scripts/claude_manager.py`

**Checkpoint**: User Story 1 fully functional - can uninstall Claude completely

---

## Phase 4: User Story 3 - 安装 Claude 组件 (Priority: P1) 🎯 MVP

**Goal**: 用户需要能够安装 Claude Code CLI 和/或 Claude Code Router

**Independent Test**: 在干净系统运行 `python scripts/claude_manager.py install`，验证组件被正确安装

### Tests for User Story 3 (OPTIONAL - NOT REQUIRED)

_Skip unless tests are explicitly requested_

### Implementation for User Story 3

- [ ] T031 [US3] Create `install` subcommand parser with `argparse.add_parser()` in `scripts/claude_manager.py`
- [ ] T032 [US3] Add `--components`, `--api-key`, `--skip-alias` options to install parser in `scripts/claude_manager.py`
- [ ] T033 [US3] Implement npm availability check using `which npm` (`check_npm_available()`) in `scripts/claude_manager.py`
- [ ] T034 [US3] Implement interactive component selection using `input()` (`prompt_component_selection()`) in `scripts/claude_manager.py`
- [ ] T035 [US3] Implement CLI installation using `npm install -g @anthropic-ai/claude-code` (`install_cli()`) in `scripts/claude_manager.py`
- [ ] T036 [US3] Implement Router installation using `npm install -g @musistudio/claude-code-router` (`install_router()`) in `scripts/claude_manager.py`
- [ ] T037 [US3] Implement installation verification using `claude --version` (`verify_installation()`) in `scripts/claude_manager.py`
- [ ] T038 [US3] Implement alias creation prompt and shell config update (`create_aliases()`) in `scripts/claude_manager.py`
- [ ] T039 [US3] Implement main `cmd_install()` function coordinating installation steps in `scripts/claude_manager.py`
- [ ] T040 [US3] Add error handling for npm not available (exit code 3) in `scripts/claude_manager.py`
- [ ] T041 [US3] Add installation success/failure logging with step tracking in `scripts/claude_manager.py`

**Checkpoint**: User Stories 1 AND 3 both functional - MVP complete

---

## Phase 5: User Story 2 - 验证清理结果 (Priority: P2)

**Goal**: 用户需要验证清理是否彻底完成

**Independent Test**: 清理后运行验证，检查所有检查项

### Tests for User Story 2 (OPTIONAL - NOT REQUIRED)

_Skip unless tests are explicitly requested_

### Implementation for User Story 2

- [ ] T042 [US2] Create `verify` subcommand parser (no additional options needed) in `scripts/claude_manager.py`
- [ ] T043 [US2] Implement command availability check using `which claude` and `which ccr` (`check_commands()`) in `scripts/claude_manager.py`
- [ ] T044 [US2] Implement npm package check using `npm list -g` (`check_npm_packages()`) in `scripts/claude_manager.py`
- [ ] T045 [US2] Implement config directory check (verify `~/.claude` doesn't exist) (`check_config_dirs()`) in `scripts/claude_manager.py`
- [ ] T046 [US2] Implement environment variable check (grep shell config for ANTHROPIC_*) (`check_env_vars()`) in `scripts/claude_manager.py`
- [ ] T047 [US2] Implement process check using `pgrep` (`check_processes()`) in `scripts/claude_manager.py`
- [ ] T048 [US2] Implement main `cmd_verify()` function running all checks in `scripts/claude_manager.py`
- [ ] T049 [US2] Implement `ValidationCheck` result collection with PASS/FAIL/WARNING status in `scripts/claude_manager.py`
- [ ] T050 [US2] Generate formatted verification report with pass/fail counts in `scripts/claude_manager.py`

**Checkpoint**: User Stories 1, 2, AND 3 all functional

---

## Phase 6: User Story 4 - 设置和管理 API Key (Priority: P2)

**Goal**: 用户需要能够设置和管理 API key

**Independent Test**: 运行 `set-api-key` 命令，验证 API key 被正确写入

### Tests for User Story 4 (OPTIONAL - NOT REQUIRED)

_Skip unless tests are explicitly requested_

### Implementation for User Story 4

- [ ] T051 [US4] Create `set-api-key` subcommand parser with positional `api_key` argument in `scripts/claude_manager.py`
- [ ] T052 [US4] Add `--config-file` option to set-api-key parser in `scripts/claude_manager.py`
- [ ] T053 [US4] Implement interactive API key input using `input()` with prompt (`prompt_api_key()`) in `scripts/claude_manager.py`
- [ ] T054 [US4] Implement API key update logic using regex to replace existing line (`update_api_key_in_file()`) in `scripts/claude_manager.py`
- [ ] T055 [US4] Implement API key append logic if not exists (`append_api_key_to_file()`) in `scripts/claude_manager.py`
- [ ] T056 [US4] Create `set-config` subcommand parser with `--env`, `--permission`, `--alias` options in `scripts/claude_manager.py`
- [ ] T057 [US4] Implement config file load from `~/.claude/settings.json` using `json.load()` (`load_config()`) in `scripts/claude_manager.py`
- [ ] T058 [US4] Implement config file save to `~/.claude/settings.json` using `json.dump()` (`save_config()`) in `scripts/claude_manager.py`
- [ ] T059 [US4] Implement main `cmd_set_api_key()` function in `scripts/claude_manager.py`
- [ ] T060 [US4] Implement main `cmd_set_config()` function with config priority (CLI args > file > defaults) in `scripts/claude_manager.py`

**Checkpoint**: User Stories 1-4 all functional

---

## Phase 7: User Story 5 - 可选备份功能 (Priority: P3)

**Goal**: 用户在卸载前可以选择备份配置文件

**Independent Test**: 启用备份选项，验证文件被正确备份

### Tests for User Story 5 (OPTIONAL - NOT REQUIRED)

_Skip unless tests are explicitly requested_

### Implementation for User Story 5

- [ ] T061 [US5] Implement backup directory creation with timestamp (`create_backup_dir()`) in `scripts/claude_manager.py`
- [ ] T062 [US5] Implement config file copy using `shutil.copytree()` and `shutil.copy()` (`backup_files()`) in `scripts/claude_manager.py`
- [ ] T063 [US5] Integrate `create_backup()` call at start of `cmd_uninstall()` when `--backup` flag set in `scripts/claude_manager.py`
- [ ] T064 [US5] Add backup location to uninstall report in `scripts/claude_manager.py`
- [ ] T065 [US5] Add backup success/failure logging in `scripts/claude_manager.py`

**Checkpoint**: All user stories functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements affecting multiple user stories

- [ ] T066 [P] Add comprehensive help text to all subcommands in `scripts/claude_manager.py`
- [ ] T067 [P] Add docstrings to all functions in `scripts/claude_manager.py`
- [ ] T068 [P] Add type hints to all function signatures in `scripts/claude_manager.py`
- [ ] T069 [P] Implement `--version` option showing script version in `scripts/claude_manager.py`
- [ ] T070 [P] Validate all tasks follow checklist format (checkbox + ID + labels + path)
- [ ] T071 [P] Create `scripts/README.md` with usage examples and installation guide
- [ ] T072 Code cleanup: remove debug code, organize imports, format with black
- [ ] T073 Run `mypy` type checking and fix any type errors
- [ ] T074 Validate against Success Criteria (SC-001 to SC-007)
- [ ] T075 Performance test: verify uninstall completes in < 5 minutes (SC-002)

**Checkpoint**: Production-ready script

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Requires Setup - BLOCKS all user stories
- **User Stories (Phase 3+)**: All require Foundational
  - Can proceed in parallel or sequentially by priority
- **Polish (Phase 8)**: Requires desired user stories complete

### User Story Dependencies

- **US1 (Uninstall) - P1**: Independent, can start after Foundational
- **US3 (Install) - P1**: Independent, can parallel with US1
- **US2 (Verify) - P2**: Independent, can parallel with US1/US3
- **US4 (API Key) - P2**: Independent, can parallel with others
- **US5 (Backup) - P3**: Depends on US1 (integrates into uninstall)

### Parallel Opportunities

```
After Foundational (Phase 2):
├─ US1 (Uninstall) - Developer A
├─ US3 (Install) - Developer B   } Can run in parallel
├─ US2 (Verify) - Developer C
└─ US4 (API Key) - Developer D

Then:
└─ US5 (Backup) - Requires US1 complete
```

---

## Implementation Strategy

### MVP First (P1 Stories)

1. Phase 1: Setup (5 tasks)
2. Phase 2: Foundational (6 tasks) ⚠️ CRITICAL PATH
3. Phase 3: US1 Uninstall (19 tasks)
4. Phase 4: US3 Install (11 tasks)
5. **VALIDATE MVP**: Test both stories independently
6. Deploy/Demo

**MVP Total**: 41 tasks

### Incremental Delivery

1. Setup + Foundational → Foundation ✓
2. + US1 (Uninstall) → Deployable increment ✓
3. + US3 (Install) → Deployable increment ✓
4. + US2 (Verify) → Deployable increment ✓
5. + US4 (API Key) → Deployable increment ✓
6. + US5 (Backup) → Deployable increment ✓
7. + Polish → Production ready ✓

Each increment independently valuable and testable.

---

## Task Summary

- **Total Tasks**: 75
- **Setup**: 5 tasks
- **Foundational**: 6 tasks
- **US1 (Uninstall)**: 19 tasks
- **US3 (Install)**: 11 tasks
- **US2 (Verify)**: 9 tasks
- **US4 (API Key)**: 10 tasks
- **US5 (Backup)**: 5 tasks
- **Polish**: 10 tasks

**Parallelizable Tasks**: 15 (marked with [P])

**Suggested MVP**: Setup + Foundational + US1 + US3 = 41 tasks

**Critical Path**: Foundational phase (blocks all user stories)

---

## Notes

- **Single script approach**: All code in `scripts/claude_manager.py` (~800 lines)
- **Standard library only**: No third-party dependencies (argparse, logging, json, subprocess, pathlib, shutil, re)
- **Testing optional**: Tests not required unless explicitly requested
- **File paths**: All relative to repository root
- **Python 3.8+**: Use dataclasses, type hints, pathlib
- **Error handling**: FR-018 requires continue-on-error (don't stop on single step failure)
- **Performance**: SC-002 requires uninstall < 5 minutes
- **Logging levels**: Default, --verbose, --quiet (FR-017, FR-033, FR-034)
- **Dry-run support**: FR-031/FR-032 require `--dry-run` with [DRY-RUN] prefix
- **Shell detection**: FR-036 requires detect active file only ($ZDOTDIR, ~/.zshenv, ~/.zshrc)
- **Multi-method cleanup**: FR-035 requires detect and remove ALL installation methods
- **Config priority**: FR-029 requires CLI args > config file > defaults

---

## Format Validation

✅ All tasks follow required format:
- `- [ ]` checkbox
- `[TaskID]` sequential (T001-T075)
- `[P]` for parallelizable tasks
- `[Story]` for user story tasks (US1-US5)
- Description with file path

✅ User story organization:
- Each story in separate phase
- Independent test criteria specified
- Dependencies clearly marked

✅ MVP scope clearly defined:
- Setup + Foundational + US1 + US3 = 41 tasks
- Represents minimal deployable product
