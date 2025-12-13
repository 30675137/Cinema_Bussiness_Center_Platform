# Tasks: Claude 卸载清理自动化脚本

**Feature Branch**: `001-claude-cleanup-script`  
**Input**: Design documents from `/specs/001-claude-cleanup-script/`  
**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md, contracts/cli-spec.md, research.md

**Tests**: Tests are OPTIONAL - included for core functionality to ensure reliability.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2], [US3])
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `scripts/` at repository root
- Paths: `scripts/claude_manager.py`, `scripts/commands/`, `scripts/core/`, `scripts/utils/`, `scripts/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project directory structure (commands/, core/, utils/, tests/) in scripts/
- [x] T002 Create requirements.txt with dependencies (click>=8.1.0, rich>=13.0.0, psutil>=5.9.0) in scripts/requirements.txt
- [x] T003 Create requirements-dev.txt with dev dependencies (pytest>=7.0.0, pytest-cov>=4.0.0) in scripts/requirements-dev.txt
- [x] T004 [P] Create pytest.ini configuration file in scripts/pytest.ini
- [x] T005 [P] Create __init__.py files for all packages (commands/, core/, utils/, tests/) in scripts/
- [x] T006 [P] Create logger utility with rich console in scripts/utils/logger.py
- [x] T007 [P] Create shell command execution utility in scripts/utils/shell.py
- [x] T008 [P] Create file operations utility in scripts/utils/file_ops.py
- [x] T009 [P] Create validators utility in scripts/utils/validators.py

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T010 Create main CLI entry point with Click framework in scripts/claude_manager.py
- [x] T011 Implement base command group with global options (--verbose, --quiet, --help) in scripts/claude_manager.py
- [x] T012 Create command group structure for subcommands in scripts/commands/__init__.py
- [x] T013 Create data models (InstallationConfig, UninstallConfig, ApiKeyConfig, CleanupStep, ValidationResult, ProcessInfo) in scripts/core/__init__.py
- [x] T014 Implement StepStatus and ValidationStatus enums in scripts/core/__init__.py
- [x] T015 Implement error handling infrastructure with try-except patterns in scripts/utils/logger.py

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 执行完整卸载清理流程 (Priority: P1) 🎯 MVP

**Goal**: 用户需要一键执行完整的 Claude 卸载和清理流程，包括停止进程、卸载包、清理配置文件和环境变量等所有步骤

**Independent Test**: 在干净的系统上安装 Claude 相关组件，然后运行 `python scripts/claude_manager.py uninstall`，验证所有组件都被正确卸载和清理

### Implementation for User Story 1

- [x] T016 [US1] Implement uninstall command entry point with Click in scripts/commands/uninstall.py
- [x] T017 [US1] Implement process detection using psutil in scripts/core/process_manager.py (find_claude_processes function)
- [x] T018 [US1] Implement process stopping logic in scripts/core/process_manager.py (stop_processes function)
- [x] T019 [US1] Implement npm package detection in scripts/core/package_manager.py (detect_npm_packages function)
- [x] T020 [US1] Implement npm package uninstallation in scripts/core/package_manager.py (uninstall_npm_packages function)
- [x] T021 [US1] Implement Homebrew package detection in scripts/core/package_manager.py (detect_homebrew_packages function)
- [x] T022 [US1] Implement Homebrew package uninstallation in scripts/core/package_manager.py (uninstall_homebrew_packages function)
- [x] T023 [US1] Implement Native installation detection in scripts/core/package_manager.py (detect_native_installation function)
- [x] T024 [US1] Implement Native installation cleanup in scripts/core/package_manager.py (cleanup_native_installation function)
- [x] T025 [US1] Implement NVM detection and multi-version cleanup in scripts/core/package_manager.py (cleanup_nvm_packages function)
- [x] T026 [US1] Implement user config directory cleanup in scripts/core/config_cleaner.py (cleanup_user_configs function)
- [x] T027 [US1] Implement project residue cleanup in scripts/core/config_cleaner.py (cleanup_project_residue function)
- [x] T028 [US1] Implement environment variable cleanup from shell config files in scripts/core/env_manager.py (cleanup_env_vars_from_files function)
- [x] T029 [US1] Implement current session environment variable cleanup in scripts/core/env_manager.py (cleanup_session_env_vars function)
- [x] T030 [US1] Integrate all cleanup steps in uninstall command with error handling in scripts/commands/uninstall.py
- [x] T031 [US1] Add logging for each cleanup step with CleanupStep tracking in scripts/commands/uninstall.py
- [x] T032 [US1] Implement continue-on-error logic (don't stop on single step failure) in scripts/commands/uninstall.py

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 3 - 安装 Claude 组件 (Priority: P1) 🎯 MVP

**Goal**: 用户需要能够安装 Claude Code CLI 和/或 Claude Code Router，脚本应使用官方推荐的 npm 方式完成安装

**Independent Test**: 在干净的系统上运行 `python scripts/claude_manager.py install`，验证组件被正确安装到系统中

### Implementation for User Story 3

- [x] T033 [US3] Implement install command entry point with Click in scripts/commands/install.py
- [x] T034 [US3] Implement npm availability check in scripts/core/package_manager.py (check_npm_available function)
- [x] T035 [US3] Implement interactive component selection prompt using rich in scripts/commands/install.py
- [x] T036 [US3] Implement CLI installation via npm in scripts/core/package_manager.py (install_cli_npm function)
- [x] T037 [US3] Implement Router installation via npm in scripts/core/package_manager.py (install_router_npm function)
- [x] T038 [US3] Implement installation verification (claude --version) in scripts/core/package_manager.py (verify_installation function)
- [x] T039 [US3] Add error handling for npm not available in scripts/commands/install.py
- [x] T040 [US3] Add success/failure logging for installation steps in scripts/commands/install.py
- [x] T041 [US3] Integrate optional API key setting after installation in scripts/commands/install.py

**Checkpoint**: At this point, User Stories 1 AND 3 should both work independently

---

## Phase 5: User Story 2 - 验证清理结果 (Priority: P2)

**Goal**: 用户需要验证清理是否彻底完成，确保没有残留的命令、配置文件、环境变量或进程

**Independent Test**: 在清理后运行 `python scripts/claude_manager.py verify`，检查命令、配置文件、环境变量和进程是否都已清理

### Implementation for User Story 2

- [x] T042 [US2] Implement verify command entry point with Click in scripts/commands/verify.py
- [x] T043 [US2] Implement command PATH validation in scripts/core/validators.py (check_command_removed function)
- [x] T044 [US2] Implement npm package validation in scripts/core/validators.py (check_npm_packages_removed function)
- [x] T045 [US2] Implement config directory validation in scripts/core/validators.py (check_config_dirs_removed function)
- [x] T046 [US2] Implement environment variable validation in scripts/core/validators.py (check_env_vars_removed function)
- [x] T047 [US2] Implement process and port validation in scripts/core/validators.py (check_processes_removed function)
- [x] T048 [US2] Implement validation report generation with rich table in scripts/commands/verify.py
- [x] T049 [US2] Add JSON format output support (--format json) in scripts/commands/verify.py
- [x] T050 [US2] Integrate all validation checks and generate summary report in scripts/commands/verify.py

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - 设置和管理 API Key (Priority: P2)

**Goal**: 用户需要能够设置和管理 API key，以便 Claude 工具能够正常工作

**Independent Test**: 运行 `python scripts/claude_manager.py set-api-key`，验证 API key 被正确写入环境变量配置文件

### Implementation for User Story 4

- [x] T051 [US4] Implement set-api-key command entry point with Click in scripts/commands/set_api_key.py
- [x] T052 [US4] Implement interactive API key input prompt with hidden input using rich in scripts/commands/set_api_key.py
- [x] T053 [US4] Implement shell config file detection (priority: ~/.zshrc, then ~/.zshenv) in scripts/core/env_manager.py (detect_config_file function)
- [x] T054 [US4] Implement API key validation (format and length checks) in scripts/utils/validators.py (validate_api_key function)
- [x] T055 [US4] Implement API key update logic (update existing ANTHROPIC_API_KEY) in scripts/core/env_manager.py (update_api_key function)
- [x] T056 [US4] Implement API key append logic (append if not exists) in scripts/core/env_manager.py (append_api_key function)
- [x] T057 [US4] Add success message with reload instructions in scripts/commands/set_api_key.py
- [x] T058 [US4] Add error handling for file write failures in scripts/core/env_manager.py

**Checkpoint**: At this point, User Stories 1, 2, 3, AND 4 should all work independently

---

## Phase 7: User Story 5 - 可选备份功能 (Priority: P3)

**Goal**: 用户在卸载前可以选择备份配置文件，以便需要时可以恢复

**Independent Test**: 在执行清理前启用备份选项，验证配置文件被正确备份到指定位置

### Implementation for User Story 5

- [x] T059 [US5] Implement backup directory creation with timestamp in scripts/core/backup_manager.py (create_backup_dir function)
- [x] T060 [US5] Implement config file backup logic in scripts/core/backup_manager.py (backup_config_files function)
- [x] T061 [US5] Add --backup flag to uninstall command in scripts/commands/uninstall.py
- [x] T062 [US5] Add --backup-dir option to uninstall command in scripts/commands/uninstall.py
- [x] T063 [US5] Integrate backup functionality before cleanup in scripts/commands/uninstall.py
- [x] T064 [US5] Add backup success/failure logging in scripts/core/backup_manager.py

**Checkpoint**: All user stories should now be independently functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T065 [P] Add comprehensive error messages in Chinese to all commands in scripts/commands/
- [x] T066 [P] Add help text and docstrings to all commands in scripts/commands/
- [x] T067 [P] Implement version command (--version option) in scripts/claude_manager.py
- [ ] T068 [P] Add unit tests for core modules in scripts/tests/test_process_manager.py, test_package_manager.py, test_config_cleaner.py
- [ ] T069 [P] Add unit tests for utility modules in scripts/tests/test_shell.py, test_file_ops.py, test_validators.py
- [ ] T070 [P] Add integration tests for install workflow in scripts/tests/test_install_integration.py
- [ ] T071 [P] Add integration tests for uninstall workflow in scripts/tests/test_uninstall_integration.py
- [ ] T072 [P] Add integration tests for set-api-key workflow in scripts/tests/test_set_api_key_integration.py
- [ ] T073 [P] Add integration tests for verify workflow in scripts/tests/test_verify_integration.py
- [ ] T074 Code cleanup and refactoring across all modules
- [x] T075 Add input validation and sanitization in all command entry points
- [x] T076 Add progress indicators for long-running operations using rich.progress in scripts/commands/
- [x] T077 Run quickstart.md validation to ensure all examples work correctly
- [x] T078 Create README.md with usage examples and installation instructions in scripts/README.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1) - Uninstall**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P1) - Install**: Can start after Foundational (Phase 2) - No dependencies on other stories (can run in parallel with US1)
- **User Story 2 (P2) - Verify**: Can start after Foundational (Phase 2) - Uses validation utilities, independently testable
- **User Story 4 (P2) - Set API Key**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 5 (P3) - Backup**: Depends on US1 (uninstall command) - Backup is part of uninstall flow

### Within Each User Story

- Command entry points before core logic
- Core logic implementation before integration
- Error handling throughout
- Logging for each major operation
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T004-T009)
- Once Foundational phase completes, User Stories 1 and 3 can start in parallel (different commands, no dependencies)
- User Story 2 can start after Foundational, independently testable
- User Story 4 can start after Foundational, independently testable
- User Story 5 depends on US1, so must come after US1
- All Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch utility modules in parallel:
Task: "Create logger utility with rich console in scripts/utils/logger.py"
Task: "Create shell command execution utility in scripts/utils/shell.py"
Task: "Create file operations utility in scripts/utils/file_ops.py"
Task: "Create validators utility in scripts/utils/validators.py"

# Then implement core uninstall logic in parallel (different files):
Task: "Implement process detection using psutil in scripts/core/process_manager.py"
Task: "Implement npm package detection in scripts/core/package_manager.py"
Task: "Implement user config directory cleanup in scripts/core/config_cleaner.py"
Task: "Implement environment variable cleanup from shell config files in scripts/core/env_manager.py"
```

---

## Parallel Example: User Story 3

```bash
# After foundational phase, implement install in parallel with US1:
Task: "Implement install command entry point with Click in scripts/commands/install.py"
Task: "Implement CLI installation via npm in scripts/core/package_manager.py"
Task: "Implement Router installation via npm in scripts/core/package_manager.py"
Task: "Implement installation verification in scripts/core/package_manager.py"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 3 - Both P1)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Uninstall) OR Phase 4: User Story 3 (Install) - can do both in parallel
4. **STOP and VALIDATE**: Test User Stories 1 and 3 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Uninstall) → Test independently → Deploy/Demo
3. Add User Story 3 (Install) → Test independently → Deploy/Demo (can be parallel with US1)
4. Add User Story 2 (Verify) → Test independently → Deploy/Demo
5. Add User Story 4 (Set API Key) → Test independently → Deploy/Demo
6. Add User Story 5 (Backup) → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Uninstall)
   - Developer B: User Story 3 (Install) - can run in parallel with A
   - Developer C: User Story 2 (Verify) - can start independently
3. Then:
   - Developer A: User Story 4 (Set API Key)
   - Developer B: User Story 5 (Backup) - depends on US1
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (if tests are written)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All file paths are relative to repository root
- Use Python 3.8+ features and type hints where appropriate
- Follow Python PEP 8 style guide
- Add Chinese comments for complex logic (per project constitution)
- Installation only supports npm (official recommendation) - no Homebrew or Native installation methods
- API key only supports environment variable files (~/.zshrc, ~/.zshenv) - no config file support

---

## Task Summary

- **Total Tasks**: 78
- **Setup Phase**: 9 tasks
- **Foundational Phase**: 6 tasks
- **User Story 1 (Uninstall)**: 17 tasks
- **User Story 3 (Install)**: 9 tasks
- **User Story 2 (Verify)**: 9 tasks
- **User Story 4 (Set API Key)**: 8 tasks
- **User Story 5 (Backup)**: 6 tasks
- **Polish Phase**: 14 tasks

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1) + Phase 4 (User Story 3) = 41 tasks
