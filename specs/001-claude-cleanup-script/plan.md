# Implementation Plan: Claude 卸载清理自动化脚本

**Branch**: `001-claude-cleanup-script` | **Date**: 2025-12-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-claude-cleanup-script/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

自动化 Claude Code CLI 和 Claude Code Router 的安装、卸载和配置管理流程。通过 Python 脚本提供子命令接口（install、uninstall、set-api-key、set-config），支持多种安装方式检测（npm、Homebrew、Native），提供 dry-run 预览、多级日志输出、shell 配置文件智能检测、alias 管理和配置文件备份等功能。目标是将繁琐的手动操作步骤简化为一键式自动化流程，确保清理彻底、安装便捷。

## Technical Context

**Language/Version**: Python 3.8+（与项目 CLAUDE.md 中指定的 Python 3.8+ 一致）
**Primary Dependencies**:
- 标准库：`subprocess`（执行系统命令）、`argparse`（CLI 参数解析）、`json`（配置文件读写）、`pathlib`（路径操作）、`shutil`（文件操作）、`re`（正则表达式匹配）
- 无第三方依赖（保持脚本自包含，便于分发）

**Storage**:
- 配置文件：`~/.claude/settings.json`（JSON 格式存储用户配置）
- 环境变量：`~/.zshrc` 或 `~/.zshenv`（存储 ANTHROPIC_API_KEY 等）
- 备份：`~/claude-backup-<timestamp>/`（可选备份目录）

**Testing**:
- `pytest` 用于单元测试和集成测试
- Mock 系统命令（subprocess）和文件系统操作
- 测试覆盖：命令解析、安装/卸载逻辑、配置文件读写、shell 配置检测、dry-run 模式

**Target Platform**: macOS with zsh shell
**Project Type**: single（单一 Python 脚本项目）
**Performance Goals**:
- 完整卸载流程：< 5 分钟（SC-002）
- 备份操作：< 30 秒（SC-006）
- 配置文件读写：< 100ms

**Constraints**:
- macOS only（不支持 Windows/Linux）
- zsh shell only（不支持 bash）
- 仅 npm 安装方式（卸载支持所有方式）
- 无 sudo 自动提权（需用户明确授权）
- 误报率 < 5%（SC-004）

**Scale/Scope**:
- 单用户脚本（非守护进程）
- 支持清理多个 NVM Node 版本
- 检测和移除 3 种安装方式
- 管理 5+ 种环境变量前缀（ANTHROPIC_*, SILICONFLOW_*）
- 验证 4 大类检查项（命令、包、配置、进程）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: 宪章文件为模板格式，无具体项目宪章定义。按通用最佳实践评估：

| Check Item | Status | Notes |
|------------|--------|-------|
| 独立性 | ✅ PASS | 单一 Python 脚本，无外部第三方依赖，可独立运行 |
| 可测试性 | ✅ PASS | 所有功能可通过 Mock 进行单元测试和集成测试 |
| 文档化 | ✅ PASS | 包含 spec.md、plan.md、quickstart.md（待生成） |
| CLI 接口 | ✅ PASS | 完整的子命令接口（install/uninstall/set-api-key/set-config） |
| 错误处理 | ✅ PASS | FR-018 要求错误不中断流程，提供清晰日志 |
| 简洁性 | ✅ PASS | 单脚本实现，遵循 YAGNI 原则 |

**No violations to justify.**

## Project Structure

### Documentation (this feature)

```text
specs/001-claude-cleanup-script/
├── spec.md              # Feature specification (exists)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── cli-interface.md # CLI 命令接口定义
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Single project structure (Python script)
scripts/
├── claude_manager.py    # 主脚本（install/uninstall/set-api-key/set-config 子命令）
└── README.md            # 脚本使用说明

tests/
├── unit/
│   ├── test_installer.py         # 安装逻辑测试
│   ├── test_uninstaller.py       # 卸载逻辑测试
│   ├── test_config_manager.py    # 配置管理测试
│   ├── test_shell_detector.py    # Shell 配置文件检测测试
│   └── test_validator.py         # 验证逻辑测试
├── integration/
│   ├── test_install_flow.py      # 完整安装流程测试
│   ├── test_uninstall_flow.py    # 完整卸载流程测试
│   └── test_dry_run.py            # dry-run 模式测试
└── fixtures/
    ├── mock_zshrc                 # Mock shell 配置文件
    ├── mock_settings.json         # Mock Claude 配置文件
    └── mock_npm_output            # Mock npm 命令输出
```

**Structure Decision**: 选择单项目结构（Option 1），因为这是一个独立的 Python 脚本工具，不涉及前后端分离或移动端。脚本放在 `scripts/` 目录，与项目约定一致（规范要求"脚本放在 scripts 目录"）。测试采用标准的 unit/integration 分层结构。

## Complexity Tracking

> **No violations - this section is empty.**

所有设计决策符合简洁性原则：
- 单一 Python 文件实现（避免过度模块化）
- 无第三方依赖（标准库足够）
- 直接子命令模式（无复杂框架）
- 配置文件使用标准 JSON（无引入配置库）
