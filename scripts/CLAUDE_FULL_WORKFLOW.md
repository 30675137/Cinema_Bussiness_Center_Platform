# Claude Code 全流程操作指南

本文档提供完整的卸载、验证、安装和确认流程。

## 前置条件

1. 确保已安装 Python 3.8+
2. 确保已安装 Node.js 和 npm（用于安装 Claude Code）
3. 配置文件位置：`scripts/config/claude/settings.json`

## 完整流程

### 步骤 1: 卸载（清理现有安装）

```bash
# 基本卸载
python scripts/claude_manager.py uninstall

# 带备份的卸载（推荐）
python scripts/claude_manager.py uninstall --backup

# 指定备份目录
python scripts/claude_manager.py uninstall --backup --backup-dir ~/backup_claude_$(date +%Y%m%d)
```

**卸载内容**：
- 停止所有 Claude 相关进程
- 卸载 npm/Homebrew/Native 安装的包
- 清理 NVM 管理的所有 Node 版本中的包
- 删除用户级配置文件（`~/.claude`, `~/.claude-code-router` 等）
- 清理项目级残留（`.claude/`, `.mcp.json`）
- 从 shell 配置文件中移除环境变量和 alias
- 提示清理当前会话环境变量

**卸载后提示**：
- 执行 `source ~/.zshrc` 和 `hash -r` 使清理生效
- 或重新打开终端窗口

---

### 步骤 2: 验证清理结果

```bash
# 使用脚本验证
python scripts/claude_manager.py verify

# 表格格式输出（默认）
python scripts/claude_manager.py verify --format table

# JSON 格式输出
python scripts/claude_manager.py verify --format json
```

**手动验证命令**（可选）：

```bash
# 检查命令是否已移除
command -v claude || echo "✓ claude removed"
command -v ccr || echo "✓ ccr removed"

# 检查 PATH 中是否还有残留
which -a claude 2>/dev/null || echo "✓ no claude in PATH"
which -a ccr 2>/dev/null || echo "✓ no ccr in PATH"

# 检查环境变量
env | grep -E 'ANTHROPIC_|SILICONFLOW_' || echo "✓ env cleaned"

# 检查配置文件
ls -ld ~/.claude ~/.claude.json ~/.claude-code-router 2>/dev/null || echo "✓ config cleaned"
```

**期望结果**：
- 所有检查项应显示 `✓ 通过` 或 `✓ removed/cleaned`
- 如果仍有残留，根据提示手动清理

---

### 步骤 3: 安装

#### 3.1 使用配置文件安装（推荐）

```bash
# 安装前先设置配置（如果配置文件存在）
python scripts/claude_manager.py set-config --config-file scripts/config/claude/settings.json

# 执行安装（会自动读取配置文件）
python scripts/claude_manager.py install
```

#### 3.2 交互式安装

```bash
# 直接安装，脚本会提示选择组件和输入 API key
python scripts/claude_manager.py install
```

**安装选项**：
- 选择 1: 安装 CLI 和 Router（推荐）
- 选择 2: 仅安装 CLI
- 选择 3: 仅安装 Router

**安装过程**：
- 检查 npm 是否可用
- 使用 npm 全局安装选定的组件
- 可选：设置 API key（如果未在配置文件中设置）
- 验证安装是否成功
- 显示当前配置参数（API key 会部分掩码）

---

### 步骤 4: 确认安装成功

#### 4.1 检查命令是否可用

```bash
# 检查 CLI
claude --version

# 检查 Router（如果安装了）
ccr --version

# 检查命令路径
which claude
which ccr
```

**期望输出**：
- `claude --version` 应显示版本号（如 `claude 1.x.x`）
- `ccr --version` 应显示版本号（如果安装了 Router）

#### 4.2 使用验证命令检查

```bash
# 验证安装状态
python scripts/claude_manager.py verify
```

**期望结果**：
- 命令检查：`✓ 通过`（`claude` 和 `ccr` 可用）
- npm 包检查：`✓ 通过`（包已安装）
- 配置文件检查：`✓ 通过`（配置文件存在，如果设置了）

#### 4.3 检查环境变量

```bash
# 检查环境变量（如果设置了）
env | grep ANTHROPIC_

# 检查配置文件
cat ~/.claude/settings.json 2>/dev/null || echo "配置文件不存在"
```

#### 4.4 测试基本功能

```bash
# 测试 CLI（需要 API key）
claude --help

# 测试 Router（如果安装了）
ccr --help
```

---

## 一键执行完整流程

```bash
# 完整流程（按顺序执行）
python scripts/claude_manager.py uninstall && \
python scripts/claude_manager.py verify && \
python scripts/claude_manager.py install && \
claude --version && \
python scripts/claude_manager.py verify
```

---

## 常见问题

### Q1: 卸载后 `command -v claude` 仍然有路径

**原因**：shell 命令缓存未刷新

**解决**：
```bash
hash -r
# 或重新打开终端
```

### Q2: 新开终端环境变量又出现

**原因**：环境变量仍写在 `~/.zshrc` 中

**解决**：
```bash
# 检查并手动删除
grep -nE "ANTHROPIC_|SILICONFLOW_" ~/.zshrc ~/.zshenv
# 编辑文件删除相关行
# 然后执行
source ~/.zshrc
```

### Q3: 安装失败，提示 npm 不可用

**原因**：未安装 Node.js 和 npm

**解决**：
```bash
# macOS 使用 Homebrew 安装
brew install node

# 或使用 NVM 安装
nvm install node
nvm use node
```

### Q4: 安装后无法连接 API

**原因**：API key 或 base URL 配置错误

**解决**：
```bash
# 检查配置
cat ~/.claude/settings.json

# 重新设置配置
python scripts/claude_manager.py set-config \
  --auth-token "your-api-key" \
  --base-url "https://your-api-url"
```

---

## 配置文件说明

配置文件位置：`scripts/config/claude/settings.json`

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-...",
    "ANTHROPIC_BASE_URL": "https://...",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": 1,
    "API_TIMEOUT_MS": 600000
  },
  "permissions": {
    "allow": [],
    "deny": []
  }
}
```

**设置配置**：
```bash
# 从文件读取
python scripts/claude_manager.py set-config --config-file scripts/config/claude/settings.json

# 或手动设置
python scripts/claude_manager.py set-config \
  --auth-token "sk-..." \
  --base-url "https://..." \
  --disable-nonessential-traffic \
  --api-timeout-ms 600000
```

---

## 注意事项

1. **卸载前备份**：建议使用 `--backup` 选项备份配置文件
2. **环境变量**：卸载后需要执行 `source ~/.zshrc` 和 `hash -r` 使清理生效
3. **配置文件**：安装时会自动读取 `~/.claude/settings.json`（如果存在）
4. **API Key**：确保 API key 有效且有足够的权限
5. **网络连接**：安装和运行时需要网络连接访问 npm 和 API

---

## 快速参考

| 操作 | 命令 |
|------|------|
| 卸载 | `python scripts/claude_manager.py uninstall` |
| 验证 | `python scripts/claude_manager.py verify` |
| 安装 | `python scripts/claude_manager.py install` |
| 设置配置 | `python scripts/claude_manager.py set-config --config-file scripts/config/claude/settings.json` |
| 设置 API Key | `python scripts/claude_manager.py set-api-key` |
| 检查版本 | `claude --version` |



