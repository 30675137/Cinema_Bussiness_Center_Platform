# Feature Specification: 改进 uninstall 命令的环境变量清理功能

**Feature Branch**: `011-uninstall-env-cleanup`  
**Created**: 2025-12-14  
**Status**: Draft  
**Input**: User description: "python scripts/claude_manager.py uninstall 应该删除 掉 ~/.zshrc  里面ANTHROPIC 相关的参数"  
**架构变更**: 调用入口由 Python 调整为 Shell，采用混合模式实现，充分利用 scripts 目录下的代码复用

## Clarifications

### Session 2025-12-14

- Q: 是否只删除 `export` 语句，还是包括函数和 alias 中的 ANTHROPIC 变量？ → A: 删除所有 ANTHROPIC 相关的变量，包括 export 语句、函数内部变量、alias 中的变量
- Q: 是否保留其他 API 服务（如 GLM、Kimi）的 ANTHROPIC 变量？ → A: 一期实现删除所有 ANTHROPIC_* 变量（简单规则），后续可改进为智能识别 Claude Code 相关的变量
- Q: 删除策略是删除整行还是只删除变量定义？ → A: 删除包含 ANTHROPIC 变量的整行，如果行中还有其他内容则只删除变量定义部分
- Q: ~/.zshrc 被清理前是否应该备份？ → A: 是的，清理 ~/.zshrc 前默认自动创建备份，但提供 `--no-backup` 参数允许跳过备份（适用于高级用户或自动化场景）
- Q: 调用程序入口应该使用 Python 还是 Shell？ → A: 使用 Shell 作为入口，但优先使用 Python 实现功能，充分利用现有的 Python 模块（commands/, core/, utils/）。只有在 Python 很难实现的情况下（如某些系统级操作、进程管理）才使用 Shell 脚本。Shell 脚本主要作为入口和参数解析，然后调用 Python 模块完成实际工作
- Q: Shell 入口脚本的命名和位置？ → A: 使用 `scripts/claude-uninstall.sh`，与现有脚本命名风格一致（如 `cleanup-claude-commands.sh`），放在 scripts 目录下

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 清理 export 语句中的 ANTHROPIC 变量 (Priority: P1)

作为系统管理员，我需要 uninstall 命令能够删除 ~/.zshrc 中所有 `export ANTHROPIC_*` 格式的全局环境变量定义，以便彻底清理 Claude Code 相关的配置。

**Why this priority**: 这是最基础的清理需求，当前实现已经部分支持，但需要确保所有 export 格式的变量都能被正确识别和删除。

**Independent Test**: 可以在 ~/.zshrc 中添加多个 `export ANTHROPIC_*` 变量，运行 uninstall 命令，验证这些变量是否被完全删除。

**Acceptance Scenarios**:

1. **Given** ~/.zshrc 文件包含 `export ANTHROPIC_API_KEY=xxx` 和 `export ANTHROPIC_BASE_URL=xxx`, **When** 运行 `scripts/claude-uninstall.sh` 或 `python scripts/claude_manager.py uninstall`, **Then** 这些 export 语句被删除
2. **Given** ~/.zshrc 文件包含 `export ANTHROPIC_AUTH_TOKEN=xxx` 和 `export ANTHROPIC_MODEL=xxx`, **When** 运行 uninstall 命令, **Then** 这些 export 语句被删除
3. **Given** ~/.zshrc 文件包含 `export ANTHROPIC_*` 变量和其他非 ANTHROPIC 的 export 语句, **When** 运行 uninstall 命令, **Then** 只删除 ANTHROPIC 相关的 export 语句，其他 export 语句保持不变

---

### User Story 2 - 清理函数内部的 ANTHROPIC 变量 (Priority: P2)

作为系统管理员，我需要 uninstall 命令能够删除 ~/.zshrc 中函数内部定义的 ANTHROPIC 变量（如 `cc_glm()` 或 `cc_kimi()` 函数中的变量），以便彻底清理所有 Claude Code 相关的配置。

**Why this priority**: 函数内部的变量定义也是环境变量配置的一部分，需要一并清理以确保彻底卸载。

**Independent Test**: 可以在 ~/.zshrc 中创建包含 ANTHROPIC 变量的函数，运行 uninstall 命令，验证函数中的 ANTHROPIC 变量是否被删除或函数是否被完全删除。

**Acceptance Scenarios**:

1. **Given** ~/.zshrc 文件包含函数 `cc_glm()` 其中定义了 `ANTHROPIC_AUTH_TOKEN` 和 `ANTHROPIC_BASE_URL`, **When** 运行 uninstall 命令, **Then** 函数中的 ANTHROPIC 变量被删除或整个函数被删除（如果函数只包含 Claude Code 相关配置）
2. **Given** ~/.zshrc 文件包含函数 `cc_kimi()` 其中定义了 `ANTHROPIC_MODEL`, **When** 运行 uninstall 命令, **Then** 函数中的 ANTHROPIC 变量被删除
3. **Given** ~/.zshrc 文件包含函数既有 ANTHROPIC 变量又有其他配置, **When** 运行 uninstall 命令, **Then** 只删除函数中的 ANTHROPIC 变量行，保留其他配置

---

### User Story 4 - 自动备份配置文件 (Priority: P1)

作为系统管理员，我需要在 uninstall 命令清理 ~/.zshrc 前自动创建备份，以便在需要时能够恢复原始配置。

**Why this priority**: 删除配置文件是破坏性操作，自动备份是安全最佳实践，可以防止意外数据丢失。这是 P1 优先级，因为应该在执行任何清理操作前完成。

**Independent Test**: 运行 uninstall 命令，验证是否在清理前自动创建了 ~/.zshrc 的备份文件，备份文件包含原始内容且可以用于恢复。

**Acceptance Scenarios**:

1. **Given** ~/.zshrc 文件存在且包含 ANTHROPIC 变量, **When** 运行 uninstall 命令（默认行为，不提供 `--no-backup` 参数）, **Then** 命令自动在清理前创建备份文件，备份位置显示在日志中
2. **Given** 用户需要跳过备份（如自动化脚本场景）, **When** 运行 uninstall 命令并添加 `--no-backup` 参数, **Then** 命令跳过备份步骤，直接执行清理操作
2. **Given** uninstall 命令执行备份, **When** 备份完成, **Then** 备份文件包含完整的原始 ~/.zshrc 内容，可以用于手动恢复
3. **Given** uninstall 命令执行备份失败, **When** 备份失败, **Then** 命令应该中止清理操作或至少警告用户备份失败，避免在没有备份的情况下删除配置

---

### User Story 3 - 清理 alias 中的 ANTHROPIC 变量 (Priority: P2)

作为系统管理员，我需要 uninstall 命令能够删除 ~/.zshrc 中 alias 定义中包含的 ANTHROPIC 变量（如 `alias cc-glm="ANTHROPIC_* claude"`），以便彻底清理所有 Claude Code 相关的配置。

**Why this priority**: alias 定义中可能包含临时环境变量设置，这些也需要被清理。

**Independent Test**: 可以在 ~/.zshrc 中创建包含 ANTHROPIC 变量的 alias，运行 uninstall 命令，验证 alias 中的 ANTHROPIC 变量是否被删除或整个 alias 是否被删除。

**Acceptance Scenarios**:

1. **Given** ~/.zshrc 文件包含 `alias cc-glm="ANTHROPIC_AUTH_TOKEN=xxx ANTHROPIC_BASE_URL=xxx claude"`, **When** 运行 uninstall 命令, **Then** alias 中的 ANTHROPIC 变量被删除或整个 alias 被删除（如果 alias 只用于 Claude Code）
2. **Given** ~/.zshrc 文件包含多行 alias 定义（使用反斜杠续行），其中包含 ANTHROPIC 变量, **When** 运行 uninstall 命令, **Then** 所有相关行中的 ANTHROPIC 变量被正确删除
3. **Given** ~/.zshrc 文件包含 alias 既有 ANTHROPIC 变量又有其他命令, **When** 运行 uninstall 命令, **Then** 只删除 alias 中的 ANTHROPIC 变量部分，保留其他命令

---

### Edge Cases

- **多行变量定义**: 如何处理使用反斜杠续行的多行 ANTHROPIC 变量定义？
  - 建议: 识别续行模式，删除所有相关行
- **注释中的 ANTHROPIC**: 如果注释中包含 "ANTHROPIC" 文本，是否会被误删？
  - 建议: 只匹配实际的变量定义模式，不匹配注释行
- **变量值中的 ANTHROPIC**: 如果其他变量的值中包含 "ANTHROPIC" 字符串，是否会被误删？
  - 建议: 只匹配变量名以 `ANTHROPIC_` 开头的模式，不匹配变量值
- **函数名包含 ANTHROPIC**: 如果函数名本身包含 "ANTHROPIC"，如何处理？
  - 建议: 只删除函数内部的 ANTHROPIC 变量定义，不删除函数定义本身（除非函数名明确表示是 Claude Code 相关）
- **条件判断中的 ANTHROPIC**: 如果 `if` 语句中检查 ANTHROPIC 变量，如何处理？
  - 建议: 删除包含 ANTHROPIC 变量检查的条件语句块（如果整个块都是 Claude Code 相关）
- **空行和格式**: 删除变量后是否保留空行，还是删除空行以保持文件整洁？
  - 建议: 删除变量后，如果产生连续多个空行，则合并为单个空行
- **备份失败**: 如果备份操作失败（如磁盘空间不足、权限问题、文件被锁定），如何处理？
  - 建议: 中止清理操作或显示严重警告，避免在没有备份的情况下删除配置
- **备份文件位置**: 备份文件应该保存在哪里，如何命名？
  - 建议: 使用 `~/claude-backup-{timestamp}/` 目录，与现有的 `create_backup()` 函数保持一致，备份文件名为 `.zshrc`
- **多次运行备份**: 如果用户多次运行 uninstall 命令，是否会创建多个备份？
  - 建议: 每次运行都创建新的带时间戳的备份目录，保留所有历史备份

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: uninstall 命令必须能够识别并删除 ~/.zshrc 中所有 `export ANTHROPIC_*` 格式的全局环境变量定义
- **FR-002**: uninstall 命令必须能够识别并删除 ~/.zshrc 中函数内部定义的 `ANTHROPIC_*` 变量
- **FR-003**: uninstall 命令必须能够识别并删除 ~/.zshrc 中 alias 定义中包含的 `ANTHROPIC_*` 变量
- **FR-004**: uninstall 命令必须能够处理多行变量定义（使用反斜杠续行的情况）
- **FR-005**: uninstall 命令必须只删除变量定义，不删除注释中包含 "ANTHROPIC" 文本的行
- **FR-006**: uninstall 命令必须只匹配变量名以 `ANTHROPIC_` 开头的模式，不匹配变量值中包含 "ANTHROPIC" 的情况
- **FR-007**: uninstall 命令必须能够识别并处理不同 shell 配置文件（~/.zshrc, ~/.zshenv, ~/.zprofile），优先处理实际使用的配置文件
- **FR-008**: uninstall 命令删除变量后必须保持文件格式整洁（合并多余空行）
- **FR-009**: uninstall 命令必须删除所有 `ANTHROPIC_*` 格式的变量（一期实现采用简单规则，删除所有匹配的变量；后续可改进为智能识别 Claude Code 相关的变量）
- **FR-010**: uninstall 命令必须提供详细的日志输出，显示删除了哪些变量和从哪个文件删除
- **FR-011**: uninstall 命令在清理 ~/.zshrc 前默认自动创建备份文件，备份文件保存在 `~/claude-backup-{timestamp}/` 目录中
- **FR-011a**: uninstall 命令必须提供 `--no-backup` 参数，允许用户跳过备份步骤（适用于高级用户或自动化场景）
- **FR-012**: uninstall 命令必须将备份文件路径记录在日志中，方便用户查找和恢复
- **FR-013**: uninstall 命令如果备份失败，应该中止清理操作或至少显示严重警告，避免在没有备份的情况下删除配置
- **FR-014**: uninstall 命令必须通过 Shell 脚本 `scripts/claude-uninstall.sh` 作为入口，但优先使用 Python 实现功能。Shell 脚本主要负责参数解析和调用 Python 模块，实际功能（如环境变量清理、备份、文本处理）优先使用现有的 Python 模块（`core/env_manager.py`, `core/backup_manager.py`, `commands/uninstall.py` 等）完成
- **FR-015**: Shell 入口脚本必须复用 scripts 目录下现有的 Python 代码，优先调用 Python 模块完成功能。只有在 Python 很难实现的情况下（如某些系统级操作、进程管理、文件权限处理）才使用 Shell 脚本直接实现。可复用的 Python 模块包括但不限于：`core/env_manager.py` 的 `cleanup_env_vars_from_files()` 函数、`core/backup_manager.py` 的备份功能、`commands/uninstall.py` 的卸载逻辑、`utils/` 目录下的工具函数

### Key Entities *(include if feature involves data)*

- **Shell 配置文件**: ~/.zshrc, ~/.zshenv, ~/.zprofile 等 zsh 配置文件
- **环境变量定义**: 各种格式的 ANTHROPIC_* 环境变量定义（export、函数内部、alias 中）
- **清理规则**: 用于识别和删除 ANTHROPIC 变量的正则表达式模式和匹配逻辑
- **备份文件**: 清理前自动创建的配置文件备份，保存在 `~/claude-backup-{timestamp}/` 目录中

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: uninstall 命令能够识别并删除 ~/.zshrc 中 100% 的 `export ANTHROPIC_*` 格式变量定义
- **SC-002**: uninstall 命令能够识别并删除 ~/.zshrc 中 100% 的函数内部 ANTHROPIC 变量定义
- **SC-003**: uninstall 命令能够识别并删除 ~/.zshrc 中 100% 的 alias 中 ANTHROPIC 变量定义
- **SC-004**: uninstall 命令执行后，运行 `grep -i anthropic ~/.zshrc` 应该返回 0 个匹配结果（或只返回注释中的文本）
- **SC-005**: uninstall 命令执行后，不会误删其他非 ANTHROPIC 的环境变量或配置（误删率 0%）
- **SC-006**: uninstall 命令执行后，配置文件格式保持有效（文件可以被 shell 正确解析，无语法错误）
- **SC-007**: uninstall 命令能够在 5 秒内完成对 ~/.zshrc 文件的清理操作（文件大小在 1000 行以内）
- **SC-008**: uninstall 命令在清理 ~/.zshrc 前默认自动创建备份文件（除非用户明确使用 `--no-backup` 参数跳过）
- **SC-009**: 备份文件包含完整的原始 ~/.zshrc 内容，可以用于手动恢复（通过 `cp ~/claude-backup-{timestamp}/.zshrc ~/.zshrc`）
- **SC-010**: 备份文件路径在日志中清晰显示，用户可以通过日志找到备份位置

## Assumptions

- 用户使用 zsh 作为默认 shell（macOS 默认）
- ~/.zshrc 文件使用标准 shell 语法，没有特殊字符或编码问题
- ANTHROPIC 变量名遵循 `ANTHROPIC_[A-Z_]+` 命名模式
- 用户希望彻底清理所有 Claude Code 相关的 ANTHROPIC 变量，包括函数和 alias 中的变量
- 一期实现采用简单规则：删除所有 `ANTHROPIC_*` 格式的变量，不区分用途（后续可改进为智能识别）
- 配置文件大小通常在 1000 行以内，性能要求不高

## Out of Scope (一期不包含的功能)

- 清理其他 shell 配置文件（如 ~/.bashrc, ~/.bash_profile）中的 ANTHROPIC 变量
- 清理系统级环境变量配置文件（如 /etc/profile, /etc/zshrc）
- 清理其他格式的配置文件（如 ~/.claude/settings.json 中的环境变量）
- 智能识别和保留其他服务使用的 ANTHROPIC 变量（一期采用简单规则：删除所有 ANTHROPIC_* 变量；此功能可在后续版本中实现）
- 自动恢复功能（用户需要手动从备份文件恢复，备份文件路径会在日志中显示）
