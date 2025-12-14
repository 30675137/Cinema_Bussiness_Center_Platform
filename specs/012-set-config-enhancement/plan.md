# Implementation Plan: 改进 set-config 命令，支持 JSON 文件读取和 Shell 配置同步

**Branch**: `012-set-config-enhancement` | **Date**: 2025-12-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-set-config-enhancement/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

改进 `claude_manager.py` 的 `set-config` 命令，添加 `--json-file` 和 `--to-shell` 参数支持，统一与 `commands/set_config.py` 的接口。通过复用现有模块（`core/config_manager.py` 和 `commands/set_config.py`）实现功能，避免代码重复，保持向后兼容。

## Technical Context

**Language/Version**: Python 3.8+ (标准库 + argparse)
**Primary Dependencies**: 
- `argparse` (标准库) - CLI 参数解析
- `pathlib` (标准库) - 路径处理
- `json` (标准库) - JSON 文件读写
- `re` (标准库) - 正则表达式（用于 shell 配置文件处理）
- `core/config_manager.py` - 配置管理模块（已存在）
- `core/env_manager.py` - 环境变量管理模块（已存在）
- `commands/set_config.py` - Click 版本的 set-config 命令（已存在，作为参考）

**Storage**: 
- `~/.claude/settings.json` - Claude 配置文件（JSON 格式）
- `~/.zshrc` 或 `~/.zshenv` - Shell 配置文件（文本格式，包含 export 语句）

**Testing**: 
- 手动测试 CLI 命令
- 验证 JSON 文件读取、配置合并、shell 配置文件写入等功能

**Target Platform**: macOS/Linux (zsh shell)
**Project Type**: CLI 工具（Python 脚本）
**Performance Goals**: 命令执行时间 < 3 秒（文件大小 < 100KB）
**Constraints**: 
- 必须保持向后兼容（现有的 `--env`, `--permission`, `--alias` 参数继续工作）
- 必须复用现有模块，避免代码重复
- 必须遵循配置优先级：命令行参数 > JSON 文件 > 现有配置文件 > 默认值
- Shell 配置文件不存在时，必须报错退出，不自动创建

**Scale/Scope**: 
- 单个 Python 脚本的增强（`claude_manager.py`）
- 添加 2 个新参数（`--json-file`, `--to-shell`）
- 复用现有模块，最小化代码变更

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支名 `012-set-config-enhancement` 中的 specId `012` 等于 active_spec 指向路径中的 specId
- [x] **测试驱动开发**: CLI 工具需要手动测试，关键功能需要验证（JSON 读取、配置合并、shell 写入）- 已在 quickstart.md 中定义测试场景
- [x] **组件化架构**: 复用现有模块（`core/config_manager.py`, `core/env_manager.py`），遵循模块化设计
- [x] **数据驱动状态管理**: 使用配置文件（JSON）作为数据源，配置管理模块处理状态变更
- [x] **代码质量工程化**: 必须通过 Python 类型检查、代码规范、保持与现有代码风格一致

### 性能与标准检查：
- [x] **性能标准**: 命令执行时间 < 3 秒（文件大小 < 100KB），符合要求
- [x] **安全标准**: 输入验证（JSON 格式、路径检查）、环境变量值转义（防止 shell 注入）
- [x] **可访问性标准**: CLI 工具，不适用前端可访问性标准

**Note**: 这是 CLI 工具增强，不涉及前端开发，部分宪法原则（如组件化架构、数据驱动状态管理）以 CLI 工具的方式体现（模块化、配置管理）。

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
scripts/
├── claude_manager.py          # 主 CLI 脚本（需要修改：添加 --json-file 和 --to-shell 参数）
├── commands/
│   └── set_config.py          # Click 版本的 set-config 命令（参考实现）
├── core/
│   ├── config_manager.py      # 配置管理模块（已存在，复用）
│   │   ├── get_claude_config_path()
│   │   ├── load_claude_config()
│   │   ├── save_claude_config()
│   │   ├── set_claude_config()  # 设置配置（支持 merge）
│   │   └── set_env_vars_to_shell_config()  # 写入 shell 配置文件
│   └── env_manager.py         # 环境变量管理模块（已存在，复用）
│       └── detect_config_file()  # 检测 shell 配置文件
├── utils/
│   ├── logger.py              # 日志工具
│   └── file_ops.py            # 文件操作工具
└── config/
    └── claude/
        └── settings.json       # 示例配置文件

specs/                          # Feature specifications
├── 012-set-config-enhancement/
│   ├── spec.md               # Feature specification
│   ├── plan.md               # Implementation plan (this file)
│   ├── research.md           # Research findings
│   ├── data-model.md         # Data model design
│   ├── quickstart.md         # Development quickstart
│   └── tasks.md              # Development tasks
└── [other-features]/
```

**Structure Decision**: CLI 工具使用模块化架构，核心功能封装在 `core/` 模块中，命令实现使用 `argparse`。通过复用现有模块（`core/config_manager.py`, `core/env_manager.py`）实现新功能，避免代码重复。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
