# Feature Specification: Claude 卸载清理自动化脚本

**Feature Branch**: `001-claude-cleanup-script`  
**Created**: 2025-12-13  
**Status**: Draft  
**Input**: User description: "基于 Claude 卸载清理检查清单文档开发自动化脚本，脚本放在 scripts 目录"

## Clarifications

### Session 2025-12-13

- Q: 脚本应该采用什么结构来组织 install、uninstall 和 API key 管理功能？ → A: 单一 Python 脚本，通过子命令（如 `python script.py install`、`python script.py uninstall`）选择操作模式
- Q: 用户如何选择要安装的组件（Claude Code CLI 和/或 Claude Code Router）？ → A: 通过交互式提示让用户选择要安装的组件
- Q: API key 应该存储在哪里，使用什么格式？ → A: 存储在环境变量文件中（如 `~/.zshrc` 或 `~/.zshenv`），使用 `export ANTHROPIC_API_KEY=...` 格式
- Q: 用户如何选择安装方式（npm、Homebrew、Native）？ → A: 自动检测可用的安装方式，按优先级顺序尝试（npm > Homebrew > Native），如果用户有偏好可通过参数指定
- Q: API key 应该在什么时候设置，如何设置？ → A: 作为独立的子命令（如 `set-api-key`），可以在安装前、安装后或任何时候单独执行
- Q: Claude Code CLI 的安装方式支持范围？ → A: 安装时仅支持 npm（官方推荐方式），卸载时支持所有方式（npm、Homebrew、Native）以清理历史安装
- Q: API key 配置方式的支持范围？ → A: 仅支持环境变量方式（写入 `~/.zshrc` 或 `~/.zshenv`），使用 `export ANTHROPIC_API_KEY=...` 格式，不支持配置文件方式（`~/.claude/settings.json`）
- Q: 配置文件应该保存为默认的 settings.json 文件并默认读取？ → A: 使用 `~/.claude/settings.json` 作为默认配置文件，所有相关命令（`set-config`、`install`、`uninstall`）在启动时自动读取，命令行参数优先于配置文件
- Q: 用户常见的 Claude alias（如 `cc` 代表 `claude --dangerously-skip-permissions`）应该如何处理？ → A: Yes - The script should detect and remove common aliases (`cc`, `c`, `claude-dev`) during uninstall, and optionally create them during install with user confirmation
- Q: 脚本执行破坏性操作（卸载包、删除文件）前是否应支持预览模式？ → A: Yes - Add `--dry-run` flag that shows all operations that would be performed without executing them
- Q: 脚本应支持什么级别的日志详细程度？ → A: Multiple levels: `--verbose` for detailed output, default for normal, `--quiet` for minimal output
- Q: 如果检测到 Claude 通过多种方式同时安装（如 npm 和 Homebrew），卸载时应如何处理？ → A: Detect and remove ALL installations found across all methods during uninstall
- Q: 脚本修改 shell 配置文件时，应该修改所有常见的 zsh 配置文件还是只修改用户实际使用的文件？ → A: Detect and modify active file only

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 执行完整卸载清理流程 (Priority: P1)

用户需要一键执行完整的 Claude 卸载和清理流程，包括停止进程、卸载包、清理配置文件和环境变量等所有步骤，无需手动执行多个命令。

**Why this priority**: 这是核心功能，用户的主要需求是自动化执行检查清单中的所有步骤，减少手动操作和出错风险。

**Independent Test**: 可以在干净的系统上安装 Claude 相关组件，然后运行脚本，验证所有组件都被正确卸载和清理。

**Acceptance Scenarios**:

1. **Given** 系统已安装 Claude Code CLI 和 Claude Code Router，**When** 用户执行清理脚本，**Then** 脚本自动停止相关进程、卸载所有包、清理配置文件和环境变量
2. **Given** 系统通过 npm 全局安装了 Claude，**When** 用户执行清理脚本，**Then** 脚本成功卸载 npm 全局包
3. **Given** 系统通过 Homebrew 安装了 Claude，**When** 用户执行清理脚本，**Then** 脚本成功卸载 Homebrew 包
4. **Given** 系统使用 NVM 管理多个 Node 版本，**When** 用户执行清理脚本，**Then** 脚本在所有 Node 版本中清理 Claude 相关包
5. **Given** 系统存在用户级配置文件和项目级残留，**When** 用户执行清理脚本，**Then** 脚本清理所有配置文件和项目残留
6. **Given** 用户的 shell 配置文件中存在常见的 Claude alias（如 `cc`, `c`, `claude-dev`），**When** 用户执行清理脚本，**Then** 脚本检测并移除这些 alias 定义
7. **Given** 用户使用 `--dry-run` 标志执行清理脚本，**When** 脚本运行，**Then** 脚本显示所有将要执行的操作但不实际执行任何破坏性操作
8. **Given** 用户使用 `--verbose` 标志执行清理脚本，**When** 脚本运行，**Then** 脚本显示详细的执行日志，包括每个命令的输出和调试信息
9. **Given** 用户使用 `--quiet` 标志执行清理脚本，**When** 脚本运行，**Then** 脚本仅显示最终结果和错误信息，适合自动化场景
10. **Given** 系统同时通过多种方式安装了 Claude（如 npm 全局和 Homebrew），**When** 用户执行清理脚本，**Then** 脚本检测并移除所有安装方式的 Claude，确保完全清理

---

### User Story 2 - 验证清理结果 (Priority: P2)

用户需要验证清理是否彻底完成，确保没有残留的命令、配置文件、环境变量或进程。

**Why this priority**: 验证功能确保清理的完整性，让用户确信系统已完全清理干净，避免后续问题。

**Independent Test**: 可以在清理后运行验证步骤，检查命令、配置文件、环境变量和进程是否都已清理。

**Acceptance Scenarios**:

1. **Given** 清理脚本已执行完成，**When** 脚本执行验证步骤，**Then** 脚本检查并报告命令、配置文件、环境变量和进程的清理状态
2. **Given** 清理后仍有残留，**When** 脚本执行验证，**Then** 脚本准确识别并报告残留项
3. **Given** 清理完全成功，**When** 脚本执行验证，**Then** 脚本报告所有检查项通过

---

### User Story 3 - 安装 Claude 组件 (Priority: P1)

用户需要能够安装 Claude Code CLI 和/或 Claude Code Router，脚本应使用官方推荐的 npm 方式完成安装。

**Why this priority**: 安装功能与卸载功能同等重要，是用户使用 Claude 工具的前提。

**Independent Test**: 可以在干净的系统上运行安装命令，验证组件被正确安装到系统中。

**Acceptance Scenarios**:

1. **Given** 用户执行 `install` 子命令，**When** 脚本通过交互式提示询问要安装的组件，**Then** 用户可以选择安装 Claude Code CLI、Claude Code Router 或两者
2. **Given** 系统已安装 npm，**When** 用户执行安装命令，**Then** 脚本使用 npm 方式安装选定的组件（Claude Code CLI: `npm install -g @anthropic-ai/claude-code`，Router: `npm install -g @musistudio/claude-code-router`）
3. **Given** 系统未安装 npm，**When** 用户执行安装命令，**Then** 脚本提示用户需要先安装 Node.js 和 npm
4. **Given** 安装完成后，**When** 用户运行 `claude --version`，**Then** 命令返回已安装的版本号，验证安装成功
5. **Given** Claude Code CLI 安装完成后，**When** 脚本询问是否创建常见 alias（如 `cc` 代表 `claude --dangerously-skip-permissions`），**Then** 用户确认后脚本将 alias 定义写入 shell 配置文件
6. **Given** 用户使用 `--dry-run` 标志执行安装命令，**When** 脚本运行，**Then** 脚本显示所有将要执行的安装操作（npm 包安装、alias 创建等）但不实际执行

---

### User Story 4 - 设置和管理 API Key (Priority: P2)

用户需要能够设置和管理 API key，以便 Claude 工具能够正常工作。

**Why this priority**: API key 是使用 Claude 服务的必要条件，用户需要便捷的方式来设置和管理。

**Independent Test**: 可以运行 `set-api-key` 子命令，验证 API key 被正确写入环境变量配置文件。

**Acceptance Scenarios**:

1. **Given** 用户执行 `set-api-key` 子命令，**When** 用户输入 API key，**Then** 脚本将 API key 写入环境变量配置文件（如 `~/.zshrc`）
2. **Given** 环境变量文件中已存在 API key，**When** 用户执行 `set-api-key` 子命令，**Then** 脚本更新现有的 API key 配置
3. **Given** 用户执行 `set-api-key` 子命令，**When** 用户未提供 API key，**Then** 脚本通过交互式提示询问 API key
4. **Given** 用户执行 `set-config` 子命令，**When** 用户提供配置信息，**Then** 脚本将配置保存到 `~/.claude/settings.json` 文件
5. **Given** 存在 `~/.claude/settings.json` 配置文件，**When** 用户执行 `install` 或 `uninstall` 命令，**Then** 脚本自动读取配置文件中的环境变量设置（如 `ANTHROPIC_AUTH_TOKEN`、`ANTHROPIC_BASE_URL` 等）
6. **Given** 用户同时提供命令行参数和配置文件，**When** 脚本执行命令，**Then** 命令行参数优先于配置文件中的设置
7. **Given** 用户的 shell 使用特定的配置文件（如 `~/.zshrc` 或 `~/.zshenv`），**When** 脚本需要修改 shell 配置，**Then** 脚本检测并仅修改用户实际使用的配置文件

---

### User Story 5 - 可选备份功能 (Priority: P3)

用户在卸载前可以选择备份配置文件，以便需要时可以恢复。

**Why this priority**: 备份是可选的安全措施，不是核心功能，但能提供额外的安全保障。

**Independent Test**: 可以在执行清理前启用备份选项，验证配置文件被正确备份到指定位置。

**Acceptance Scenarios**:

1. **Given** 用户启用备份选项，**When** 脚本执行清理，**Then** 脚本在清理前备份所有配置文件到带时间戳的目录
2. **Given** 用户未启用备份选项，**When** 脚本执行清理，**Then** 脚本直接执行清理，不创建备份

---

### Edge Cases

- 如果某些组件未安装，脚本应优雅处理，不因单个步骤失败而中断整个流程
- 如果用户没有管理员权限，脚本应明确提示哪些步骤需要权限
- 如果 shell 配置文件不存在或无法写入，脚本应处理错误并继续执行
- 如果 NVM 未安装或未配置，脚本应跳过 NVM 相关步骤
- 如果项目目录不存在或无权限访问，脚本应跳过项目级清理或提示用户

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 脚本 MUST 能够停止所有 Claude Code Router 相关进程
- **FR-002**: 脚本 MUST 能够卸载 npm 全局安装的 Claude Code CLI 和 Claude Code Router
- **FR-003**: 脚本 MUST 能够卸载 Homebrew 安装的 Claude Code（如果存在）
- **FR-004**: 脚本 MUST 能够清理 Native 安装的残留文件（`~/.local/bin/claude`、`~/.claude-code`）
- **FR-035**: 脚本在卸载时 MUST 检测所有安装方式（npm、Homebrew、Native），并移除所有检测到的安装，无论用户通过几种方式安装了 Claude
- **FR-005**: 脚本 MUST 支持清理 NVM 管理的所有 Node 版本中的 Claude 相关包
- **FR-006**: 脚本 MUST 能够清理用户级配置文件（`~/.claude`、`~/.claude.json`、`~/.claude-code-router`、`~/.claude-code`）
- **FR-007**: 脚本 MUST 能够查找并清理项目级残留（`.claude/`、`.mcp.json`）
- **FR-008**: 脚本 MUST 能够清理当前终端会话的环境变量（`ANTHROPIC_*`、`SILICONFLOW_*`）
- **FR-009**: 脚本 MUST 能够从 shell 配置文件中移除 Claude 相关的环境变量和 alias（包括常见的 alias 如 `cc`, `c`, `claude-dev` 等）
- **FR-010**: 脚本 MUST 能够验证命令是否已从 PATH 中移除（`claude`、`ccr`）
- **FR-011**: 脚本 MUST 能够验证 npm 全局包是否已卸载
- **FR-012**: 脚本 MUST 能够验证用户配置目录是否已清理
- **FR-013**: 脚本 MUST 能够验证环境变量是否已清理
- **FR-014**: 脚本 MUST 能够验证 Router 进程和端口是否已清理
- **FR-015**: 脚本 MUST 提供可选的备份功能，在清理前备份配置文件
- **FR-016**: 脚本 MUST 使用 Python 实现，通过子命令模式支持不同操作（如 `install`、`uninstall`、`set-api-key`）
- **FR-020**: 脚本 MUST 支持安装 Claude Code CLI 和 Claude Code Router，通过交互式提示让用户选择要安装的组件
- **FR-021**: 脚本 MUST 支持设置 API key，将 API key 存储在环境变量文件中（如 `~/.zshrc` 或 `~/.zshenv`），使用 `export ANTHROPIC_API_KEY=...` 格式
- **FR-036**: 脚本 MUST 检测用户当前 shell 实际使用的配置文件（通过检查 `$ZDOTDIR`、`~/.zshenv`、`~/.zshrc` 等的存在和使用情况），仅修改检测到的活跃配置文件，避免造成配置不一致
- **FR-027**: 脚本 MUST 使用 `~/.claude/settings.json` 作为默认配置文件，支持保存和读取完整的配置（包括环境变量和权限设置）
- **FR-028**: 脚本的所有相关命令（`set-config`、`install`、`uninstall`）MUST 在启动时自动读取 `~/.claude/settings.json` 配置文件（如果存在）
- **FR-029**: 脚本 MUST 遵循配置优先级：命令行参数 > 配置文件 > 默认值
- **FR-022**: 脚本 MUST 在安装时仅支持 npm 方式（官方推荐），使用 `npm install -g @anthropic-ai/claude-code` 安装 Claude Code CLI，使用 `npm install -g @musistudio/claude-code-router` 安装 Router
- **FR-026**: 脚本 MUST 在安装前检查 npm 是否可用，如果不可用则提示用户需要先安装 Node.js 和 npm
- **FR-023**: 脚本 MUST 支持通过 `set-api-key` 子命令设置 API key，可以在任何时候单独执行
- **FR-024**: 脚本 MUST 在设置 API key 时，将 API key 安全地写入环境变量配置文件，如果已存在则更新
- **FR-030**: 脚本 MUST 在安装 Claude Code CLI 后，通过交互式提示询问用户是否创建常见 alias（如 `alias cc='claude --dangerously-skip-permissions'`），用户确认后将其写入 shell 配置文件
- **FR-031**: 脚本 MUST 支持 `--dry-run` 标志，在该模式下显示所有将要执行的操作（包括停止进程、卸载包、删除文件、修改配置等）但不实际执行任何破坏性操作
- **FR-032**: 脚本在 `--dry-run` 模式下 MUST 清晰标识每个操作的类型（如 [DRY-RUN] 前缀）和影响范围，便于用户评估
- **FR-025**: 脚本 MUST 在 macOS/zsh 环境下运行
- **FR-017**: 脚本 MUST 提供清晰的执行日志，默认模式下显示主要步骤和结果
- **FR-033**: 脚本 MUST 支持 `--verbose` 标志，在该模式下显示详细的执行日志，包括每个命令的完整输出、调试信息和中间状态
- **FR-034**: 脚本 MUST 支持 `--quiet` 标志，在该模式下仅显示最终结果摘要和错误信息，适合自动化和脚本集成场景
- **FR-018**: 脚本 MUST 在遇到错误时继续执行后续步骤，而不是立即退出
- **FR-019**: 脚本 MUST 在最后提供验证报告，总结清理结果

### Key Entities

- **清理步骤**: 代表一个独立的清理操作（如停止进程、卸载包、清理配置等），包含步骤名称、执行命令、成功/失败状态
- **验证检查项**: 代表一个验证规则（如检查命令是否存在、配置文件是否删除等），包含检查项名称、检查命令、期望结果、实际结果

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 脚本能在 macOS/zsh 环境下成功执行，无需手动干预
- **SC-002**: 脚本执行时间不超过 5 分钟（包括所有清理和验证步骤）
- **SC-003**: 脚本能正确识别并清理所有已安装的 Claude 组件（npm、Homebrew、Native 安装）
- **SC-004**: 验证步骤能准确检测残留，误报率低于 5%（即已清理的项目不应被报告为残留）
- **SC-005**: 脚本在组件未安装的情况下能正常执行，不因单个步骤失败而中断
- **SC-006**: 备份功能（如启用）能在 30 秒内完成配置文件备份
- **SC-007**: 脚本执行后，所有验证检查项应通过（命令不可用、配置文件已删除、环境变量已清理、进程已停止）

## Assumptions

- 用户使用 macOS 操作系统和 zsh shell
- 用户可能使用 NVM 管理 Node 版本
- 用户可能通过 npm、Homebrew 或 Native 方式安装过 Claude
- 用户有权限访问和修改 `~/.zshrc`、`~/.zshenv` 等 shell 配置文件
- 脚本执行时用户有足够的磁盘空间进行备份（如启用）
- 用户理解脚本会永久删除配置文件和卸载软件包

## Dependencies

- Python 3.x（脚本实现语言）
- macOS 操作系统
- zsh shell
- npm（如果通过 npm 安装过 Claude）
- Homebrew（如果通过 Homebrew 安装过 Claude）
- NVM（如果使用 NVM 管理 Node 版本，用于多版本清理）

## Out of Scope

- 不支持 Windows 或 Linux 系统
- 不支持 bash 或其他 shell（仅支持 zsh）
- 不自动清理 shell 历史记录中的敏感信息（仅提供查找方法）
- 不提供图形界面，仅支持命令行执行
- 不处理其他 AI 工具或 CLI 的清理（仅针对 Claude Code CLI 和 Claude Code Router）
- 不支持 API key 的加密存储（以明文形式存储在环境变量文件或配置文件中）
- 不支持多个 API key 的切换或管理（仅支持单个 API key 的设置和更新）
- 不支持配置文件加密或权限控制（配置文件以明文 JSON 格式存储）
