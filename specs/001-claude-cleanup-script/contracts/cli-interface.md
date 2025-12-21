# CLI Interface Contract: claude_manager.py

**Feature**: 001-claude-cleanup-script
**Date**: 2025-12-13
**Purpose**: 定义脚本的命令行接口契约，确保用户接口稳定

## Overview

`claude_manager.py` 提供子命令式 CLI 接口，用于管理 Claude Code CLI 和 Claude Code Router 的安装、卸载和配置。

## Global Options

所有子命令都支持以下全局选项：

| Option | Short | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--dry-run` | - | flag | False | 预览模式，显示将要执行的操作但不实际执行（FR-031） |
| `--verbose` | `-v` | flag | False | 详细日志模式，显示命令输出和调试信息（FR-033） |
| `--quiet` | `-q` | flag | False | 安静模式，仅显示错误和最终结果（FR-034） |

**Mutual Exclusivity**: `--verbose` 和 `--quiet` 互斥，不能同时使用

**Dry-run 行为**:
- 所有破坏性操作（删除文件、卸载包、停止进程）仅打印日志，不实际执行
- 日志前缀 `[DRY-RUN]` 清晰标识（FR-032）
- 退出码为 0（成功）

---

## Subcommand: `install`

安装 Claude Code CLI 和/或 Claude Code Router。

### Syntax

```bash
python claude_manager.py install [OPTIONS]
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--components` | choice | interactive | 要安装的组件：`cli`、`router` 或 `both`。如果未指定，交互式询问用户 |
| `--api-key` | string | None | 可选，安装后自动设置 API key（等同于先 install 再 set-api-key） |
| `--skip-alias` | flag | False | 跳过 alias 创建提示（不创建 alias） |
| `--dry-run` | flag | False | 预览安装操作 |
| `--verbose` | flag | False | 详细日志 |
| `--quiet` | flag | False | 安静模式 |

### Examples

```bash
# 交互式安装（询问用户选择组件）
python claude_manager.py install

# 安装 CLI 和 Router，同时设置 API key
python claude_manager.py install --components both --api-key sk-ant-xxx

# 仅安装 CLI，不创建 alias
python claude_manager.py install --components cli --skip-alias

# 预览安装操作
python claude_manager.py install --dry-run
```

### Behavior

1. **前置检查**（FR-026）：
   - 检查 npm 是否可用（`which npm`）
   - 如果 npm 不可用，输出错误并退出

2. **组件选择**（FR-020）：
   - 如果 `--components` 未指定，交互式询问用户
   - 选项：1) Claude Code CLI，2) Claude Code Router，3) 两者都安装

3. **安装执行**（FR-022）：
   - 使用 `npm install -g <package>` 安装选定组件
   - CLI: `@anthropic-ai/claude-code`
   - Router: `@musistudio/claude-code-router`

4. **Alias 创建**（FR-030）：
   - 如果安装了 CLI 且 `--skip-alias` 未设置
   - 交互式询问是否创建 alias（`cc`, `c` 等）
   - 用户确认后写入 shell 配置文件

5. **API Key 设置**（可选）：
   - 如果提供了 `--api-key`，调用 `set_api_key()` 函数

6. **验证**：
   - 执行 `claude --version` 或 `ccr --version` 验证安装成功

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | 安装成功 |
| 1 | npm 不可用 |
| 2 | 安装失败（npm install 失败） |
| 3 | 验证失败（命令不可用） |

### Output Format (Normal Mode)

```
检查 npm 可用性...
✓ npm 可用

请选择要安装的组件:
  1. Claude Code CLI
  2. Claude Code Router
  3. 两者都安装
请输入选项 (1/2/3) [默认: 3]: 3

安装 Claude Code CLI...
✓ 安装成功 (@anthropic-ai/claude-code@1.2.3)

安装 Claude Code Router...
✓ 安装成功 (@musistudio/claude-code-router@0.5.1)

是否创建常见 alias？
  cc -> claude --dangerously-skip-permissions
  c -> claude
是否创建？(y/n) [默认: y]: y
✓ alias 已写入 ~/.zshenv

验证安装...
✓ claude 命令可用 (版本 1.2.3)
✓ ccr 命令可用 (版本 0.5.1)

✅ 安装完成！
```

---

## Subcommand: `uninstall`

卸载 Claude Code CLI 和 Claude Code Router，清理所有相关配置和残留文件。

### Syntax

```bash
python claude_manager.py uninstall [OPTIONS]
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--backup` | flag | False | 卸载前备份配置文件到 `~/claude-backup-<timestamp>/`（FR-015） |
| `--skip-verification` | flag | False | 跳过卸载后的验证步骤 |
| `--dry-run` | flag | False | 预览卸载操作 |
| `--verbose` | flag | False | 详细日志 |
| `--quiet` | flag | False | 安静模式 |

### Examples

```bash
# 执行完整卸载（包含验证）
python claude_manager.py uninstall

# 卸载前备份配置文件
python claude_manager.py uninstall --backup

# 预览卸载操作（不实际执行）
python claude_manager.py uninstall --dry-run

# 安静模式卸载（适合脚本集成）
python claude_manager.py uninstall --quiet
```

### Behavior

1. **备份**（FR-015，可选）：
   - 如果 `--backup` 设置，创建备份目录 `~/claude-backup-<timestamp>/`
   - 备份 `~/.claude/`、`~/.claude.json`、shell 配置文件等
   - 30秒内完成（SC-006）

2. **停止进程**（FR-001）：
   - 使用 `pgrep -f claude-code-router` 查找进程
   - 发送 SIGTERM 信号优雅终止
   - 5秒后检查，如仍运行则发送 SIGKILL 强制终止

3. **检测安装方式**（FR-035）：
   - npm 全局：`npm list -g --depth=0` + `which`双重验证
   - Homebrew：`brew list claude-code`
   - Native：检查 `~/.local/bin/claude` 和 `~/.claude-code`
   - NVM：遍历 `$NVM_DIR/versions/node/*/lib/node_modules/`

4. **卸载包**（FR-002, FR-003, FR-004, FR-005）：
   - npm: `npm uninstall -g <package>`（所有 NVM 版本）
   - Homebrew: `brew uninstall claude-code`
   - Native: 删除 `~/.local/bin/claude` 和 `~/.claude-code`

5. **清理配置**（FR-006, FR-007, FR-008, FR-009）：
   - 删除用户配置：`~/.claude/`、`~/.claude.json`、`~/.claude-code-router/`、`~/.claude-code/`
   - 清理项目残留：查找当前目录下的 `.claude/`、`.mcp.json`
   - 清理环境变量：从 shell 配置文件中移除 `ANTHROPIC_*`、`SILICONFLOW_*`
   - 清理 alias：移除 `cc`、`c`、`claude-dev` 等

6. **验证**（FR-010 to FR-014，可选）：
   - 检查命令不可用：`which claude` 返回非0
   - 检查 npm 包已卸载：`npm list -g @anthropic-ai/claude-code` 不存在
   - 检查配置已清理：`~/.claude` 不存在
   - 检查环境变量已清理：shell 配置文件不含 Claude 相关变量
   - 检查进程已停止：`pgrep -f claude-code-router` 返回非0

7. **生成报告**（FR-019）：
   - 显示执行步骤统计（成功/失败/跳过）
   - 显示验证结果（如果执行）
   - 总耗时（必须 < 5分钟，SC-002）

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | 卸载成功，所有验证通过 |
| 1 | 部分步骤失败，但继续执行完成 |
| 2 | 验证失败，仍有残留 |

### Output Format (Normal Mode)

```
检测 Claude 安装...
✓ 检测到 npm 全局包: @anthropic-ai/claude-code, @musistudio/claude-code-router
- 未检测到 Homebrew 安装
✓ 检测到 NVM 版本: v16.20.0, v18.17.0

开始卸载...
✓ 停止 Router 进程 (PID 12345) (0.2s)
✓ 卸载 npm 全局包 @anthropic-ai/claude-code (3.1s)
✓ 卸载 npm 全局包 @musistudio/claude-code-router (2.8s)
✓ 清理 NVM 版本 v16.20.0 (1.2s)
✓ 清理 NVM 版本 v18.17.0 (1.1s)
- 跳过 Homebrew 卸载（未安装）
✓ 删除 ~/.claude 目录 (0.1s)
✓ 删除 ~/.claude.json 文件 (0.0s)
✓ 清理 ~/.zshenv 中的环境变量 (0.1s)
✓ 清理 ~/.zshenv 中的 alias (0.1s)

统计：
  成功：10 个
  失败：0 个
  跳过：1 个
  总耗时：8.7秒

验证...
✓ 命令 claude 不可用
✓ 命令 ccr 不可用
✓ npm 全局包已卸载
✓ 配置文件已清理
✓ 环境变量已清理
✓ 进程已停止

✅ 卸载完成！所有验证通过。
```

---

## Subcommand: `set-api-key`

设置 API key 到环境变量配置文件。

### Syntax

```bash
python claude_manager.py set-api-key [API_KEY] [OPTIONS]
```

### Arguments

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `API_KEY` | string | No | API key 值。如果未提供，交互式询问用户 |

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--config-file` | path | auto-detect | 目标配置文件路径。默认自动检测（~/.zshenv 或 ~/.zshrc） |
| `--dry-run` | flag | False | 预览操作 |
| `--verbose` | flag | False | 详细日志 |
| `--quiet` | flag | False | 安静模式 |

### Examples

```bash
# 交互式设置 API key
python claude_manager.py set-api-key

# 直接提供 API key
python claude_manager.py set-api-key sk-ant-xxx

# 指定配置文件
python claude_manager.py set-api-key sk-ant-xxx --config-file ~/.zshrc

# 预览操作
python claude_manager.py set-api-key sk-ant-xxx --dry-run
```

### Behavior

1. **API Key 获取**（FR-023）：
   - 如果命令行提供，直接使用
   - 否则交互式询问用户（隐藏输入）

2. **配置文件检测**（FR-036）：
   - 如果 `--config-file` 指定，使用指定文件
   - 否则自动检测：优先 `$ZDOTDIR/.zshenv` → `~/.zshenv` → `~/.zshrc`

3. **写入 API Key**（FR-024）：
   - 使用正则表达式检查是否已存在 `export ANTHROPIC_API_KEY=...`
   - 如果存在，替换现有行
   - 如果不存在，追加到文件末尾
   - 格式：`export ANTHROPIC_API_KEY=<key>`

4. **验证**：
   - 重新读取配置文件，确认 API key 已写入

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | API key 设置成功 |
| 1 | 配置文件不可写 |
| 2 | API key 格式无效 |

### Output Format (Normal Mode)

```
检测 shell 配置文件...
✓ 使用配置文件: ~/.zshenv

写入 API key...
✓ API key 已设置

验证...
✓ API key 已成功写入 ~/.zshenv

✅ 完成！请重新加载 shell 配置（source ~/.zshenv）或重启终端。
```

---

## Subcommand: `set-config`

保存完整配置到 `~/.claude/settings.json`。

### Syntax

```bash
python claude_manager.py set-config [OPTIONS]
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--env` | key=value | None | 设置环境变量，可多次使用。格式：`--env KEY=VALUE` |
| `--permission` | key=value | None | 设置权限，可多次使用。格式：`--permission KEY=true/false` |
| `--alias` | key=value | None | 设置 alias，可多次使用。格式：`--alias NAME=COMMAND` |
| `--dry-run` | flag | False | 预览操作 |
| `--verbose` | flag | False | 详细日志 |
| `--quiet` | flag | False | 安静模式 |

### Examples

```bash
# 设置环境变量
python claude_manager.py set-config --env ANTHROPIC_API_KEY=sk-ant-xxx --env ANTHROPIC_BASE_URL=https://api.anthropic.com

# 设置权限
python claude_manager.py set-config --permission dangerously_skip_permissions=true

# 设置 alias
python claude_manager.py set-config --alias cc='claude --dangerously-skip-permissions'

# 组合设置
python claude_manager.py set-config \
  --env ANTHROPIC_API_KEY=sk-ant-xxx \
  --permission dangerously_skip_permissions=false \
  --alias cc='claude --dangerously-skip-permissions'
```

### Behavior

1. **加载现有配置**（FR-028）：
   - 读取 `~/.claude/settings.json`（如果存在）
   - 解析 JSON，加载到 `ClaudeSettings` 对象

2. **合并新配置**（FR-029）：
   - 命令行参数优先于现有配置
   - 未指定的键保持不变

3. **保存配置**（FR-027）：
   - 确保 `~/.claude/` 目录存在
   - 写入 `settings.json`，格式化 JSON（indent=2）

4. **验证**：
   - 重新读取配置文件，确认写入成功

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | 配置保存成功 |
| 1 | 配置目录不可写 |
| 2 | 配置格式无效 |

### Output Format (Normal Mode)

```
加载现有配置...
✓ 从 ~/.claude/settings.json 加载

更新配置...
✓ 设置环境变量: ANTHROPIC_API_KEY
✓ 设置权限: dangerously_skip_permissions = false
✓ 设置 alias: cc = 'claude --dangerously-skip-permissions'

保存配置...
✓ 配置已保存到 ~/.claude/settings.json

✅ 完成！
```

---

## Exit Code Summary

全局退出码约定：

| Code | Meaning |
|------|---------|
| 0 | 成功 |
| 1 | 一般错误（权限不足、文件不可写等） |
| 2 | 验证失败或格式错误 |
| 3 | 依赖缺失（如 npm 不可用） |
| 130 | 用户中断（Ctrl+C） |

---

## Error Handling

所有子命令都应优雅处理错误（FR-018）：

1. **捕获异常**：所有可能抛出异常的操作都包装在 try-except 块中
2. **继续执行**：单个步骤失败不中断整个流程
3. **清晰日志**：错误信息包含足够上下文（文件路径、命令、返回码等）
4. **退出码**：根据失败严重程度选择合适的退出码

---

## Configuration Priority (FR-029)

配置优先级（从高到低）：

1. **命令行参数**：`--env KEY=VALUE`
2. **配置文件**：`~/.claude/settings.json`
3. **默认值**：脚本内置默认值

示例：如果 `settings.json` 包含 `ANTHROPIC_API_KEY=old-key`，用户执行 `set-config --env ANTHROPIC_API_KEY=new-key`，则最终 `new-key` 生效。

---

## Compatibility

- **Python Version**: 3.8+ (使用 dataclasses、typing 等特性)
- **Platform**: macOS only（依赖 zsh、pkill、pgrep 等 macOS 工具）
- **Shell**: zsh only（不支持 bash）

---

## Testing Contract

所有命令都应支持 Mock 测试：

- `subprocess.run()` 应可 Mock
- 文件系统操作应通过 `Path` 对象，便于 Mock
- 交互式输入（`input()`）应可 Mock

示例测试用例：
```python
def test_install_dry_run(mock_subprocess, mock_input):
    # Mock user选择 'both'
    mock_input.return_value = '3'

    # Mock npm 可用
    mock_subprocess.return_value = Mock(returncode=0)

    # 执行 install --dry-run
    result = main(['install', '--dry-run'])

    # 验证：无实际 npm install 调用
    assert not any('npm install' in str(call) for call in mock_subprocess.call_args_list)

    # 验证：退出码为 0
    assert result == 0
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-13 | Initial contract definition |

---

## Notes

- 所有路径都使用 `pathlib.Path` 对象，避免字符串路径拼接
- 所有子进程调用都包含超时（默认 30 秒），避免挂起
- dry-run 模式下，所有读操作正常执行，仅写/删除操作被跳过
- verbose 模式下，输出每个命令的完整 stdout/stderr
- quiet 模式下，仅输出最终结果和错误（无进度信息）
