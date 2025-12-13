# Implementation Plan: Claude 卸载清理自动化脚本

**Branch**: `001-claude-cleanup-script` | **Date**: 2025-12-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-claude-cleanup-script/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

开发一个 Python 自动化脚本，用于管理 Claude Code CLI 和 Claude Code Router 的安装、卸载和 API key 配置。脚本采用子命令模式（`install`、`uninstall`、`set-api-key`、`verify`），支持交互式操作，能够自动检测和清理所有可能的安装方式（npm、Homebrew、Native），并提供验证和备份功能。

## Technical Context

**Language/Version**: Python 3.8+  
**Primary Dependencies**: 
- `click` - CLI 框架，用于子命令和参数解析
- `rich` - 终端样式和格式化输出
- `psutil` - 进程检测和管理
- `shutil` - 文件和目录操作（标准库）
- `subprocess` - 执行系统命令（标准库）
- `pathlib` - 路径操作（标准库）

**Storage**: 
- 环境变量文件：`~/.zshrc`、`~/.zshenv`（用于 API key 配置）
- 临时备份目录：`~/.claude-cleanup-backup/`（可选备份功能）

**Testing**: pytest（单元测试和集成测试）  
**Target Platform**: macOS（Darwin），zsh shell  
**Project Type**: single（单一 Python 脚本项目）  
**Performance Goals**: 
- 脚本执行时间不超过 5 分钟（包括所有清理和验证步骤）
- 备份功能（如启用）能在 30 秒内完成

**Constraints**: 
- 仅支持 macOS/zsh 环境
- 需要用户权限访问和修改 shell 配置文件
- 需要足够的磁盘空间进行备份（如启用）
- 必须优雅处理组件未安装的情况，不因单个步骤失败而中断

**Scale/Scope**: 
- 单个用户本地使用
- 支持清理 npm、Homebrew、Native 三种安装方式
- 支持 NVM 管理的多个 Node 版本清理
- 支持项目级残留清理（`.claude/`、`.mcp.json`）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Initial Check (Pre-Phase 0)

**Status**: ✅ **PASS**

**Analysis**:
- 本功能是一个独立的 Python 工具脚本，用于管理 Claude Code CLI 和 Router 的安装/卸载
- 该脚本不在项目的主要架构范围内（前端 React/后端 Spring Boot）
- 脚本位于 `scripts/` 目录，作为开发工具使用，不涉及业务逻辑
- 使用 Python 3.8+ 是合理的，因为：
  - Python 是成熟的脚本语言，适合系统管理任务
  - `click`、`rich`、`psutil` 是成熟稳定的库
  - 符合"稳定性优先"的技术选型原则

**Constitution Compliance**:
- ✅ 不违反架构模式原则（独立工具脚本）
- ✅ 不违反技术栈规范（不在前端/后端技术栈范围内）
- ✅ 符合代码风格规范（Python 标准命名约定）
- ✅ 符合 Git 工作流规范（功能分支开发）

**No Violations**: 无需填写 Complexity Tracking 表

### Post-Phase 1 Check (After Design)

**Status**: ✅ **PASS**

**Analysis**:
- Phase 1 设计完成后，所有技术决策都已明确：
  - CLI 框架：`click`（成熟稳定）
  - 终端美化：`rich`（用户体验优秀）
  - 进程管理：`psutil`（跨平台支持）
  - 数据模型：使用 Python `dataclasses` 和类型提示
  - CLI 接口：遵循标准 CLI 设计模式
- 所有依赖都是成熟稳定的库，符合"稳定性优先"原则
- 项目结构清晰，模块化设计，易于维护
- 测试策略明确（pytest），符合质量保证要求

**Constitution Compliance** (Re-evaluated):
- ✅ 不违反架构模式原则（独立工具脚本，不影响主架构）
- ✅ 不违反技术栈规范（Python 脚本不在前端/后端技术栈范围内）
- ✅ 符合代码风格规范（Python 标准命名约定，中文注释）
- ✅ 符合 Git 工作流规范（功能分支开发）
- ✅ 符合质量保证要求（测试策略明确）

**Conclusion**: 设计阶段完成后，所有技术决策都符合项目宪章要求，可以进入实施阶段。

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
├── claude_manager.py          # 主入口脚本（子命令模式）
├── commands/                   # 子命令模块
│   ├── __init__.py
│   ├── install.py             # install 子命令
│   ├── uninstall.py           # uninstall 子命令
│   ├── set_api_key.py         # set-api-key 子命令
│   └── verify.py              # verify 子命令
├── core/                      # 核心功能模块
│   ├── __init__.py
│   ├── process_manager.py     # 进程管理（停止、检测）
│   ├── package_manager.py     # 包管理（npm、Homebrew、Native）
│   ├── config_cleaner.py      # 配置文件清理
│   ├── env_manager.py         # 环境变量管理
│   └── backup_manager.py      # 备份管理
├── utils/                     # 工具函数
│   ├── __init__.py
│   ├── shell.py               # Shell 操作工具
│   ├── file_ops.py            # 文件操作工具
│   ├── validators.py          # 验证工具
│   └── logger.py              # 日志工具
└── tests/                     # 测试文件
    ├── __init__.py
    ├── test_install.py
    ├── test_uninstall.py
    ├── test_set_api_key.py
    ├── test_verify.py
    └── fixtures/              # 测试固件
        └── mock_data.py

requirements.txt               # Python 依赖
requirements-dev.txt           # 开发依赖（pytest 等）
README.md                      # 使用说明
```

**Structure Decision**: 
采用单一 Python 脚本项目的模块化结构。主入口 `claude_manager.py` 使用 `click` 框架实现子命令模式，各个子命令和核心功能分别组织在 `commands/` 和 `core/` 目录中，工具函数集中在 `utils/` 目录。测试文件使用 `pytest` 框架，遵循 Python 标准测试结构。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations**: 本功能不违反项目宪章，无需填写此表。
