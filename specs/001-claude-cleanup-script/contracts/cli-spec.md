# CLI Interface Specification: Claude 卸载清理自动化脚本

**Feature**: 001-claude-cleanup-script  
**Date**: 2025-12-13  
**Version**: 1.0.0

## Overview

本文档定义了 `claude_manager.py` 脚本的命令行接口规范。脚本使用 `click` 框架实现子命令模式。

## Base Command

```bash
python scripts/claude_manager.py [OPTIONS] COMMAND [ARGS]...
```

**Global Options**:
- `--verbose, -v`: 启用详细输出（默认: False）
- `--quiet, -q`: 静默模式，仅输出错误（默认: False）
- `--help, -h`: 显示帮助信息

**Exit Codes**:
- `0`: 成功
- `1`: 一般错误
- `2`: 参数错误
- `3`: 权限不足
- `4`: 依赖缺失（如 npm 未安装）

---

## Subcommands

### 1. install

安装 Claude Code CLI 和/或 Claude Code Router。

**Syntax**:
```bash
python scripts/claude_manager.py install [OPTIONS]
```

**Options**:
- `--cli`: 安装 Claude Code CLI（默认: 交互式询问）
- `--router`: 安装 Claude Code Router（默认: 交互式询问）
- `--api-key TEXT`: 可选的 API key，安装后自动设置（默认: 交互式询问）
- `--no-interactive`: 非交互模式，需要提供所有参数（默认: False）

**Behavior**:
1. 检查 npm 是否可用，如果不可用则提示错误并退出（exit code 4）
2. 如果未指定 `--cli` 或 `--router`，且未启用 `--no-interactive`，则交互式询问用户
3. 使用 `npm install -g` 安装选定的组件：
   - CLI: `npm install -g @anthropic-ai/claude-code`
   - Router: `npm install -g @musistudio/claude-code-router`
4. 如果提供了 `--api-key`，或交互式询问后用户选择设置，则调用 `set-api-key` 逻辑
5. 安装后运行 `claude --version` 验证安装成功

**Examples**:
```bash
# 交互式安装（推荐）
python scripts/claude_manager.py install

# 仅安装 CLI
python scripts/claude_manager.py install --cli

# 安装 CLI 和 Router，并设置 API key
python scripts/claude_manager.py install --cli --router --api-key sk-ant-xxx

# 非交互模式（需要提供所有参数）
python scripts/claude_manager.py install --cli --router --no-interactive
```

**Exit Codes**:
- `0`: 安装成功
- `1`: 安装失败
- `4`: npm 未安装或不可用

---

### 2. uninstall

卸载 Claude Code CLI 和 Claude Code Router，清理所有相关配置和残留。

**Syntax**:
```bash
python scripts/claude_manager.py uninstall [OPTIONS]
```

**Options**:
- `--backup`: 在卸载前备份配置文件（默认: False）
- `--backup-dir PATH`: 备份目录路径（默认: `~/.claude-cleanup-backup/`）
- `--methods TEXT`: 要清理的安装方式，逗号分隔（可选值: npm,homebrew,native，默认: 自动检测所有方式）
- `--skip-verify`: 卸载后不执行验证（默认: False）

**Behavior**:
1. 如果启用了 `--backup`，先备份所有相关配置文件
2. 停止所有 Claude Code Router 相关进程
3. 按检测到的安装方式卸载包：
   - npm: `npm uninstall -g @anthropic-ai/claude-code @musistudio/claude-code-router`
   - Homebrew: `brew uninstall claude-code`（如果存在）
   - Native: 删除 `~/.local/bin/claude` 和 `~/.claude-code` 目录
   - NVM: 遍历所有 Node 版本，卸载全局包
4. 清理用户级配置文件（`~/.claude`、`~/.claude.json`、`~/.claude-code-router`、`~/.claude-code`）
5. 清理项目级残留（查找并删除 `.claude/`、`.mcp.json`）
6. 从 shell 配置文件中移除 Claude 相关的环境变量和 alias
7. 如果未启用 `--skip-verify`，执行验证步骤
8. 生成清理报告

**Examples**:
```bash
# 基本卸载（自动检测所有安装方式）
python scripts/claude_manager.py uninstall

# 卸载前备份配置文件
python scripts/claude_manager.py uninstall --backup

# 仅清理 npm 安装的包
python scripts/claude_manager.py uninstall --methods npm

# 卸载后不验证
python scripts/claude_manager.py uninstall --skip-verify
```

**Exit Codes**:
- `0`: 卸载成功（即使某些步骤失败，只要主要步骤完成）
- `1`: 严重错误导致卸载中断

---

### 3. set-api-key

设置或更新 API key。

**Syntax**:
```bash
python scripts/claude_manager.py set-api-key [OPTIONS] [API_KEY]
```

**Options**:
- `--config-file PATH`: 目标配置文件路径（默认: 自动检测 `~/.zshrc` 或 `~/.zshenv`）
- `--no-update`: 如果已存在则不更新（默认: False，即更新）

**Arguments**:
- `API_KEY`: API key 值（如果未提供，则交互式询问）

**Behavior**:
1. 如果未提供 `API_KEY`，且未启用 `--no-interactive`，则交互式询问
2. 检测目标配置文件（如果未指定 `--config-file`）：
   - 优先使用 `~/.zshrc`
   - 如果不存在，使用 `~/.zshenv`
3. 如果配置文件中已存在 `ANTHROPIC_API_KEY`：
   - 如果未启用 `--no-update`，则更新它
   - 如果启用了 `--no-update`，则提示并退出
4. 如果不存在，则追加到文件末尾：`export ANTHROPIC_API_KEY=...`
5. 提示用户需要重新加载 shell 或运行 `source ~/.zshrc`

**Examples**:
```bash
# 交互式设置
python scripts/claude_manager.py set-api-key

# 直接提供 API key
python scripts/claude_manager.py set-api-key sk-ant-xxx

# 指定配置文件
python scripts/claude_manager.py set-api-key sk-ant-xxx --config-file ~/.zshenv

# 如果已存在则不更新
python scripts/claude_manager.py set-api-key --no-update
```

**Exit Codes**:
- `0`: 设置成功
- `1`: 设置失败（文件不可写等）
- `2`: 参数错误（API key 格式无效等）

---

### 4. verify

验证清理是否彻底完成。

**Syntax**:
```bash
python scripts/claude_manager.py verify [OPTIONS]
```

**Options**:
- `--format TEXT`: 输出格式（可选值: table, json, 默认: table）

**Behavior**:
1. 检查命令是否已从 PATH 中移除（`claude`、`ccr`）
2. 检查 npm 全局包是否已卸载
3. 检查用户配置目录是否已清理
4. 检查环境变量是否已清理
5. 检查 Router 进程和端口是否已清理
6. 生成验证报告（使用 `rich` 表格或 JSON 格式）

**Examples**:
```bash
# 基本验证（表格格式）
python scripts/claude_manager.py verify

# JSON 格式输出
python scripts/claude_manager.py verify --format json
```

**Exit Codes**:
- `0`: 所有检查项通过（已完全清理）
- `1`: 仍有残留（部分检查项失败）

---

## Interactive Prompts

当未启用 `--no-interactive` 时，脚本会使用 `rich.prompt` 进行交互式询问：

### Install Prompts

1. **组件选择**:
   ```
   ? 选择要安装的组件: (Use arrow keys)
   ❯ CLI 和 Router
    仅 CLI
    仅 Router
   ```

2. **API Key 设置**:
   ```
   ? 是否现在设置 API key? (y/N): 
   ? 请输入 API key: [输入会被隐藏]
   ```

### Uninstall Prompts

1. **备份确认**:
   ```
   ? 是否在卸载前备份配置文件? (y/N): 
   ```

### Set API Key Prompts

1. **API Key 输入**:
   ```
   ? 请输入 API key: [输入会被隐藏]
   ```

---

## Output Format

### Success Output

使用 `rich` 的绿色标记和成功图标：
```
✓ 安装成功: Claude Code CLI v1.0.0
```

### Error Output

使用 `rich` 的红色标记和错误图标：
```
✗ 安装失败: npm 未安装，请先安装 Node.js 和 npm
```

### Progress Output

使用 `rich.progress` 显示进度条：
```
正在卸载 npm 包...  [████████████████████] 100%
```

### Report Output

使用 `rich.table` 显示表格报告：
```
┌─────────────────────────┬──────────┬─────────────────────┐
│ 检查项                  │ 状态     │ 结果                │
├─────────────────────────┼──────────┼─────────────────────┤
│ 命令 claude 是否可用    │ ✓ 通过   │ 命令已移除          │
│ 配置文件 ~/.claude      │ ✓ 通过   │ 目录已删除          │
└─────────────────────────┴──────────┴─────────────────────┘
```

---

## Error Messages

所有错误消息应该：
1. 使用中文（符合项目文档语言规范）
2. 清晰说明问题原因
3. 提供解决建议（如果适用）
4. 使用 `rich` 格式化，提升可读性

**Example**:
```
✗ 错误: npm 未安装

请先安装 Node.js 和 npm:
  - 使用 Homebrew: brew install node
  - 或访问: https://nodejs.org/
```

---

## Compatibility

- **Python**: 3.8+
- **操作系统**: macOS (Darwin)
- **Shell**: zsh
- **依赖**: npm（用于安装）、Homebrew（可选，用于检测）

---

## Version

当前版本: 1.0.0  
最后更新: 2025-12-13
