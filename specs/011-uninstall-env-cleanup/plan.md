# Implementation Plan: 改进 uninstall 命令的环境变量清理功能

**Branch**: `011-uninstall-env-cleanup` | **Date**: 2025-12-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-uninstall-env-cleanup/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

改进 `uninstall` 命令，增强其清理 ~/.zshrc 中 ANTHROPIC 相关环境变量的能力。采用 Shell 脚本作为入口（`scripts/claude-uninstall.sh`），但优先使用 Python 模块实现功能。当前实现仅支持删除 `export` 语句，需要扩展以支持：
1. 删除函数内部定义的 ANTHROPIC 变量
2. 删除 alias 定义中包含的 ANTHROPIC 变量
3. 处理多行变量定义（反斜杠续行）
4. 默认自动备份配置文件（可通过 `--no-backup` 跳过）
5. 改进日志输出，显示删除的变量详情

技术方法：创建 Shell 入口脚本 `scripts/claude-uninstall.sh`，优先调用现有的 Python 模块（`core/env_manager.py`, `core/backup_manager.py`, `commands/uninstall.py`）完成功能。只有在 Python 很难实现的情况下（如系统级操作、进程管理）才使用 Shell 脚本直接实现。

## Technical Context

**Language/Version**: 
- Shell: Bash (POSIX-compliant)
- Python: 3.8+ (标准库 + pathlib, re, shutil)
- 现有 Python 模块：commands/, core/, utils/

**Primary Dependencies**: 
- 无外部依赖，仅使用 Python 标准库和 Shell 内置命令
- 复用现有的 Python 模块：`core/env_manager.py`, `core/backup_manager.py`, `commands/uninstall.py`, `utils/` 等

**Storage**: 文件系统操作（读取/写入 ~/.zshrc 等配置文件）

**Testing**: Python unittest 或 pytest（如果需要测试 Python 模块）

**Target Platform**: macOS/Linux (zsh shell 环境)

**Project Type**: CLI 工具（Shell 入口 + Python 实现）

**Performance Goals**: 清理操作在 5 秒内完成（文件大小 < 1000 行）

**Constraints**: 
- 必须保持向后兼容（不影响现有功能）
- 必须安全处理文件操作（备份、错误处理）
- 必须遵循现有的代码风格和结构
- 优先使用 Python 模块，只有在 Python 很难实现时才使用 Shell

**Scale/Scope**: 
- 新增 Shell 入口脚本：`scripts/claude-uninstall.sh`
- 增强现有 Python 模块：`core/env_manager.py` 的 `cleanup_env_vars_from_files()` 函数
- 复用现有模块：`core/backup_manager.py`, `commands/uninstall.py`, `utils/` 等

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支名 `011-uninstall-env-cleanup` 中的 specId `011` 等于 active_spec 指向路径中的 specId
- [N/A] **测试驱动开发**: 这是脚本工具改进，不是前端功能，测试策略需要评估（可能需要单元测试验证正则表达式模式）
- [N/A] **组件化架构**: 这是 Python CLI 工具，不适用前端组件化架构
- [N/A] **数据驱动状态管理**: 这是文件系统操作脚本，不涉及前端状态管理
- [x] **代码质量工程化**: 必须通过 Python 代码规范检查（PEP 8），保持现有代码风格一致性；Shell 脚本遵循 ShellCheck 规范

### 性能与标准检查：
- [x] **性能标准**: 清理操作在 5 秒内完成（文件大小 < 1000 行），符合要求
- [x] **安全标准**: 文件操作前必须备份，错误处理完善，避免数据丢失
- [N/A] **可访问性标准**: CLI 工具不涉及 Web 可访问性标准

**Note**: 此功能是 Python CLI 工具改进，不涉及前端开发，因此部分宪法原则（测试驱动、组件化、状态管理）不直接适用。但需要确保代码质量和安全性。

## Project Structure

### Documentation (this feature)

```text
specs/011-uninstall-env-cleanup/
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
├── claude-uninstall.sh  # 新增：Shell 入口脚本
├── claude_manager.py    # 现有：Python 主脚本（保持向后兼容）
├── commands/
│   └── uninstall.py     # 现有：卸载命令模块（需要增强）
├── core/
│   ├── env_manager.py   # 现有：环境变量管理（需要增强 cleanup_env_vars_from_files()）
│   ├── backup_manager.py # 现有：备份管理（复用）
│   └── ...              # 其他核心模块
└── utils/
    └── ...              # 工具函数（复用）
```

**Structure Decision**: 
- Shell 脚本作为入口：`scripts/claude-uninstall.sh` 负责参数解析和调用 Python 模块
- 优先使用 Python 模块：主要功能通过调用现有的 Python 模块实现
- 代码复用：充分利用 `commands/uninstall.py`, `core/env_manager.py`, `core/backup_manager.py` 等现有模块
- 向后兼容：保持 `python scripts/claude_manager.py uninstall` 继续工作

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
