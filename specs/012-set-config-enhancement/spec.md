# Feature Specification: 改进 set-config 命令，支持 JSON 文件读取和 Shell 配置同步

**Feature Branch**: `012-set-config-enhancement`  
**Created**: 2025-12-14  
**Status**: Draft  
**Input**: User description: "改进 set-config 命令，支持从 JSON 文件读取配置（--json-file 参数）并同步环境变量到 shell 配置文件（--to-shell 参数）。当前 claude_manager.py 的 set-config 命令不支持这些参数，但 commands/set_config.py 中已实现。需要统一接口，使 claude_manager.py 的 set-config 命令也支持这些功能。"

## Clarifications

### Session 2025-12-14

- Q: 如何实现 `claude_manager.py` 的 `set-config` 命令以支持 `--json-file` 和 `--to-shell` 参数？ → A: 复用现有模块：调用 `commands/set_config.py` 中的函数或 `core/config_manager.py` 中的工具函数
- Q: `--json-file` 参数指定的相对路径应该相对于哪里？ → A: 相对于当前工作目录（用户执行命令时的目录）
- Q: 如果使用 `--to-shell` 参数时，shell 配置文件（如 `~/.zshrc`）不存在，应该如何处理？ → A: 报错退出：如果文件不存在，显示错误信息并退出，不创建文件
- Q: 如果 JSON 文件只包含部分配置（例如只有 `env` 字段，没有 `permissions` 字段），如何与现有的 `~/.claude/settings.json` 配置合并？ → A: 部分更新（合并）：只更新 JSON 文件中存在的字段，保留现有配置中的其他字段
- Q: 如果同时使用 `--json-file` 和命令行参数（如 `--auth-token`），如何处理参数冲突？ → A: 先读取 JSON 文件，然后用命令行参数覆盖对应的值（命令行参数优先级更高）

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 从 JSON 文件读取配置 (Priority: P1)

作为一名开发者，我需要能够使用 `--json-file` 参数从 JSON 配置文件批量读取配置，这样我就不必逐个输入每个环境变量和权限设置。

**Why this priority**: 这是核心功能，允许用户从项目中的配置文件快速设置配置，提高效率和一致性。

**Independent Test**: 可以创建一个包含环境变量和权限配置的 JSON 文件，运行 `python scripts/claude_manager.py set-config --json-file path/to/config.json`，验证配置被正确读取并保存到 `~/.claude/settings.json`。

**Acceptance Scenarios**:

1. **Given** 存在 JSON 配置文件 `scripts/config/claude/settings.json` 包含 `env` 和 `permissions` 字段, **When** 运行 `python scripts/claude_manager.py set-config --json-file scripts/config/claude/settings.json`, **Then** 配置被正确读取并保存到 `~/.claude/settings.json`
2. **Given** JSON 文件包含部分配置（如只有 `env` 字段）, **When** 运行 set-config 命令, **Then** 只读取存在的字段，不影响其他配置
3. **Given** JSON 文件格式无效或不存在, **When** 运行 set-config 命令, **Then** 命令显示清晰的错误信息并退出

---

### User Story 2 - 同步环境变量到 Shell 配置文件 (Priority: P1)

作为一名开发者，我需要能够使用 `--to-shell` 参数将环境变量同步到 shell 配置文件（如 `~/.zshrc`），这样环境变量可以在新的终端会话中自动生效。

**Why this priority**: 这是核心功能，允许用户将配置同时保存到 Claude 配置文件和 shell 配置文件，确保环境变量在终端中可用。

**Independent Test**: 可以运行 `python scripts/claude_manager.py set-config --json-file config.json --to-shell`，验证环境变量被正确写入 `~/.zshrc` 或 `~/.zshenv`。

**Acceptance Scenarios**:

1. **Given** 运行 set-config 命令并指定 `--to-shell` 参数, **When** 命令执行成功, **Then** 环境变量被写入 shell 配置文件（自动检测 `~/.zshrc` 或 `~/.zshenv`）
2. **Given** shell 配置文件中已存在相同的环境变量, **When** 运行 set-config 命令, **Then** 更新现有的环境变量值，而不是创建重复的 export 语句
3. **Given** 运行 set-config 命令并指定 `--to-shell` 参数, **When** 命令执行成功, **Then** 显示提示信息，告知用户需要运行 `source ~/.zshrc` 或重新打开终端使环境变量生效
4. **Given** 未指定 `--to-shell` 参数, **When** 运行 set-config 命令, **Then** 只保存到 `~/.claude/settings.json`，不修改 shell 配置文件

---

### User Story 3 - 统一命令接口 (Priority: P2)

作为一名开发者，我需要 `claude_manager.py` 的 `set-config` 命令支持与 `commands/set_config.py` 相同的参数，这样我可以使用统一的命令接口，而不需要记住不同的命令格式。

**Why this priority**: 提高用户体验，统一接口减少混淆，向后兼容现有使用方式。

**Independent Test**: 可以运行 `python scripts/claude_manager.py set-config --json-file config.json --to-shell`，验证命令正常工作，与 `commands/set_config.py` 的行为一致。

**Acceptance Scenarios**:

1. **Given** 运行 `python scripts/claude_manager.py set-config --json-file config.json`, **When** 命令执行, **Then** 行为与 `commands/set_config.py` 的 `--json-file` 参数一致
2. **Given** 运行 `python scripts/claude_manager.py set-config --to-shell`, **When** 命令执行, **Then** 行为与 `commands/set_config.py` 的 `--to-shell` 参数一致
3. **Given** 使用现有的 `--env`, `--permission`, `--alias` 参数, **When** 运行 set-config 命令, **Then** 现有功能继续正常工作，不受新参数影响
4. **Given** 同时使用新参数和现有参数（如 `--json-file` 和 `--env`）, **When** 运行 set-config 命令, **Then** 命令行参数优先于 JSON 文件中的配置（符合现有优先级规则）

---

### Edge Cases

- **JSON 文件路径**: `--json-file` 指定的相对路径相对于当前工作目录（已澄清）
- **Shell 配置文件不存在**: 如果 `--to-shell` 指定的 shell 配置文件不存在，显示错误信息并退出，不自动创建文件（已澄清）
- **环境变量值包含特殊字符**: 如果环境变量值包含引号、换行符等特殊字符，写入 shell 配置文件时如何正确转义？
- **并发执行**: 如果同时运行多个 set-config 命令，如何避免配置文件冲突？
- **配置合并策略**: 采用部分更新（合并）策略：只更新 JSON 文件中存在的字段，保留现有配置中的其他字段（已澄清）

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `claude_manager.py` 的 `set-config` 命令 MUST 支持 `--json-file` 参数，从指定的 JSON 文件读取配置
- **FR-002**: `claude_manager.py` 的 `set-config` 命令 MUST 支持 `--to-shell` 参数，将环境变量同步到 shell 配置文件
- **FR-003**: `--json-file` 参数 MUST 支持相对路径和绝对路径，相对路径相对于当前工作目录（用户执行命令时的目录）
- **FR-004**: JSON 文件格式 MUST 包含 `env` 和 `permissions` 字段，格式与 `~/.claude/settings.json` 一致
- **FR-005**: `--to-shell` 参数 MUST 自动检测 shell 配置文件（优先 `~/.zshenv`，其次 `~/.zshrc`），如果文件不存在则显示错误信息并退出，不自动创建文件
- **FR-006**: `--to-shell` 参数 MUST 支持通过 `--shell-config` 参数指定自定义 shell 配置文件路径
- **FR-007**: 写入 shell 配置文件时 MUST 正确处理环境变量值的转义（引号、特殊字符等）
- **FR-008**: 如果 shell 配置文件中已存在相同的环境变量，MUST 更新现有值而不是创建重复的 export 语句
- **FR-009**: 配置优先级 MUST 遵循：命令行参数 > JSON 文件 > 现有配置文件 > 默认值（当同时使用 `--json-file` 和命令行参数时，先读取 JSON 文件，然后用命令行参数覆盖对应的值）
- **FR-013**: 使用 `--json-file` 读取配置时，MUST 采用合并策略：只更新 JSON 文件中存在的字段，保留现有配置中的其他字段，避免覆盖用户的其他设置
- **FR-010**: 命令 MUST 保持向后兼容，现有的 `--env`, `--permission`, `--alias` 参数继续工作
- **FR-011**: 命令 MUST 在成功执行后显示清晰的提示信息，告知用户如何使配置生效
- **FR-012**: 实现方式 MUST 复用现有模块（`core/config_manager.py` 中的 `set_claude_config`, `set_env_vars_to_shell_config`, `load_claude_config` 等函数），避免重复实现，保持代码一致性和可维护性

### Key Entities *(include if feature involves data)*

- **JSON 配置文件**: 包含 `env` 和 `permissions` 字段的 JSON 文件，格式与 `~/.claude/settings.json` 一致
- **Shell 配置文件**: zsh 配置文件（`~/.zshrc` 或 `~/.zshenv`），包含 `export` 语句定义环境变量
- **Claude 配置文件**: `~/.claude/settings.json`，存储 Claude Code 的完整配置

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 用户可以使用 `--json-file` 参数从 JSON 文件读取配置，成功率 100%
- **SC-002**: 用户可以使用 `--to-shell` 参数将环境变量同步到 shell 配置文件，成功率 100%
- **SC-003**: `claude_manager.py` 的 `set-config` 命令支持所有 `commands/set_config.py` 的参数，接口统一性 100%
- **SC-004**: 现有使用 `--env`, `--permission`, `--alias` 参数的用户不受影响，向后兼容性 100%
- **SC-005**: 命令执行后，环境变量在 shell 配置文件中格式正确，可以被 shell 正确解析
- **SC-006**: 命令在 3 秒内完成配置读取和写入操作（文件大小 < 100KB）

## Assumptions

- 用户使用 zsh 作为默认 shell（macOS 默认）
- JSON 配置文件使用 UTF-8 编码
- Shell 配置文件使用标准 shell 语法
- 用户有权限读取 JSON 配置文件和写入 shell 配置文件

## Out of Scope (一期不包含的功能)

- 支持其他 shell 配置文件格式（如 bash、fish）
- 支持配置文件加密或密钥管理
- 支持配置文件模板或变量替换
- 支持配置文件验证或 schema 检查
- 支持配置文件版本管理或迁移

