# Claude Code 安装脚本使用指南

> **文档版本**: v1.0  
> **最后更新**: 2025-12-13  
> **适用系统**: macOS (Darwin) / zsh

本文档介绍如何使用 Claude Code 安装管理脚本进行安装、卸载、配置和验证操作。

---

## 目录

- [快速参考](#快速参考)
- [前置条件](#前置条件)
- [安装依赖](#安装依赖)
- [基本使用](#基本使用)
- [详细操作](#详细操作)
- [配置文件说明](#配置文件说明)
- [常见问题](#常见问题)
- [故障排除](#故障排除)

---

## 快速参考

### 常用命令速查表

| 操作 | 命令 | 说明 |
|------|------|------|
| **安装** | `python scripts/claude_manager.py install` | 交互式安装 CLI 和 Router |
| **卸载** | `python scripts/claude_manager.py uninstall` | 完整卸载并清理 |
| **验证** | `python scripts/claude_manager.py verify` | 验证安装/清理状态 |
| **设置配置** | `python scripts/claude_manager.py set-config --config-file scripts/config/claude/settings.json --to-shell` | 从配置文件设置并写入 shell |
| **更新 Token** | `python scripts/claude_manager.py set-api-key` | 交互式更新 API key |
| **检查版本** | `claude --version` | 检查 CLI 版本 |
| **快速更新 Token** | `./scripts/update_token.sh "sk-new-token"` | 使用快速脚本更新 |

### 一键完整流程

```bash
# 卸载 → 验证 → 安装 → 检查
python scripts/claude_manager.py uninstall && \
source ~/.zshrc && hash -r && \
python scripts/claude_manager.py verify && \
python scripts/claude_manager.py set-config --config-file scripts/config/claude/settings.json --to-shell && \
python scripts/claude_manager.py install && \
claude --version && \
python scripts/claude_manager.py verify
```

### 快速安装（首次使用）

```bash
# 1. 设置配置
python scripts/claude_manager.py set-config \
  --config-file scripts/config/claude/settings.json \
  --to-shell

# 2. 安装
python scripts/claude_manager.py install

# 3. 验证
claude --version
```

### 快速更新 Token

```bash
# 方法 1: 使用快速脚本
./scripts/update_token.sh "sk-your-new-token"

# 方法 2: 使用 Python 命令
python scripts/claude_manager.py set-api-key "sk-your-new-token"

# 重新加载配置
source ~/.zshrc
```

---

## 前置条件

### 系统要求

- **操作系统**: macOS (Darwin)
- **Shell**: zsh
- **Python**: 3.8 或更高版本
- **Node.js**: 已安装（用于安装 Claude Code）
- **npm**: 已安装（用于全局安装包）

### 检查环境

```bash
# 检查 Python 版本
python3 --version  # 应显示 Python 3.8+

# 检查 Node.js 和 npm
node --version
npm --version

# 检查 Shell
echo $SHELL  # 应显示 /bin/zsh
```

### 安装 Node.js（如未安装）

```bash
# 方法 1: 使用 Homebrew
brew install node

# 方法 2: 使用 NVM（推荐）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install node
nvm use node
```

---

## 安装依赖

### 安装 Python 依赖

```bash
cd scripts
pip install -r requirements.txt
```

### 依赖包列表

- `click>=8.1.0` - CLI 框架
- `rich>=13.0.0` - 终端美化输出
- `psutil>=5.9.0` - 进程管理

---

## 基本使用

### 1. 安装 Claude Code

#### 交互式安装（推荐）

```bash
python scripts/claude_manager.py install
```

安装过程：
1. 选择要安装的组件（CLI、Router 或两者）
2. 检查 npm 是否可用
3. 使用 npm 全局安装选定的组件
4. 可选：设置 API key（如果未在配置文件中设置）
5. 验证安装是否成功
6. 显示当前配置参数

#### 命令行参数安装

```bash
# 仅安装 CLI
python scripts/claude_manager.py install --cli

# 安装 CLI 和 Router
python scripts/claude_manager.py install --cli --router

# 安装并设置 API key
python scripts/claude_manager.py install --cli --router --api-key sk-ant-xxx
```

### 2. 卸载 Claude Code

#### 基本卸载

```bash
python scripts/claude_manager.py uninstall
```

卸载内容：
- 停止所有 Claude 相关进程
- 卸载 npm/Homebrew/Native 安装的包
- 清理 NVM 管理的所有 Node 版本中的包
- 删除用户级配置文件（`~/.claude`, `~/.claude-code-router` 等）
- 清理项目级残留（`.claude/`, `.mcp.json`）
- 从 shell 配置文件中移除环境变量和 alias

#### 带备份卸载

```bash
# 使用默认备份目录
python scripts/claude_manager.py uninstall --backup

# 指定备份目录
python scripts/claude_manager.py uninstall --backup --backup-dir ~/backup_claude_$(date +%Y%m%d)
```

#### 卸载后操作

```bash
# 重新加载配置（必须执行）
source ~/.zshrc
hash -r

# 或重新打开终端
```

### 3. 验证状态

```bash
# 表格格式（默认）
python scripts/claude_manager.py verify

# JSON 格式
python scripts/claude_manager.py verify --format json
```

验证项目：
- 命令是否可用（`claude`, `ccr`）
- npm 全局包是否已安装/卸载
- 用户配置目录是否已清理
- 环境变量是否已清理
- Router 进程和端口是否已清理

---

## 详细操作

### 配置管理

#### 设置完整配置

```bash
# 从配置文件设置（推荐）
python scripts/claude_manager.py set-config \
  --config-file scripts/config/claude/settings.json \
  --to-shell

# 命令行参数设置
python scripts/claude_manager.py set-config \
  --auth-token "sk-your-token" \
  --base-url "https://cc.zhihuiapi.top" \
  --disable-nonessential-traffic \
  --api-timeout-ms 600000 \
  --to-shell

# 交互式设置
python scripts/claude_manager.py set-config
```

#### 更新 API Key

```bash
# 方法 1: 交互式更新（推荐，隐藏输入）
python scripts/claude_manager.py set-api-key

# 方法 2: 直接提供新 token
python scripts/claude_manager.py set-api-key "sk-your-new-token"

# 方法 3: 使用快速脚本
./scripts/update_token.sh "sk-your-new-token"

# 更新后重新加载
source ~/.zshrc
```

#### 查看当前配置

```bash
# 查看 shell 配置文件中的环境变量
grep -n "ANTHROPIC_\|CLAUDE_CODE_\|API_TIMEOUT" ~/.zshrc

# 查看 Claude 配置文件
cat ~/.claude/settings.json

# 查看当前环境变量
env | grep -E "ANTHROPIC_|CLAUDE_CODE_|API_TIMEOUT"
```

### 安装选项详解

#### 组件选择

- **CLI 和 Router（推荐）**: 完整功能，支持路由代理
- **仅 CLI**: 基础功能，直接连接 API
- **仅 Router**: 仅安装路由代理（不常用）

#### 安装方式

脚本仅支持 **npm 全局安装**（官方推荐方式）：
- 安装命令：`npm install -g @anthropic-ai/claude-code`
- Router 安装：`npm install -g @musistudio/claude-code-router`

### 卸载选项详解

#### 清理范围

- **npm 包**: 全局卸载 `@anthropic-ai/claude-code` 和 `@musistudio/claude-code-router`
- **Homebrew 包**: 卸载 `claude-code` cask（如果存在）
- **Native 安装**: 清理 `~/.local/bin/claude` 和 `~/.claude-code`
- **NVM 包**: 清理所有 Node 版本中的 Claude 相关包
- **配置文件**: 删除 `~/.claude`, `~/.claude-code-router` 等
- **环境变量**: 从 `~/.zshrc` 等文件中移除相关配置

#### 卸载方法选择

```bash
# 清理所有安装方式（默认）
python scripts/claude_manager.py uninstall

# 仅清理 npm 安装
python scripts/claude_manager.py uninstall --methods npm

# 清理 npm 和 Homebrew
python scripts/claude_manager.py uninstall --methods npm,homebrew
```

---

## 配置文件说明

### 配置文件位置

- **项目配置**: `scripts/config/claude/settings.json`
- **用户配置**: `~/.claude/settings.json`
- **Shell 配置**: `~/.zshrc` 或 `~/.zshenv`

### 配置文件格式

`scripts/config/claude/settings.json`:

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-...",
    "ANTHROPIC_BASE_URL": "https://cc.zhihuiapi.top",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": 1,
    "API_TIMEOUT_MS": 600000
  },
  "permissions": {
    "allow": [],
    "deny": []
  }
}
```

### 环境变量说明

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `ANTHROPIC_AUTH_TOKEN` | API 认证 Token | `sk-...` |
| `ANTHROPIC_BASE_URL` | API 基础 URL | `https://cc.zhihuiapi.top` |
| `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` | 禁用非必要流量 | `1` 或 `0` |
| `API_TIMEOUT_MS` | API 超时时间（毫秒） | `600000` |

### 配置优先级

1. **命令行参数** > 配置文件 > 默认值
2. `~/.claude/settings.json` 在安装/卸载时自动读取
3. 使用 `--to-shell` 选项会将配置写入 `~/.zshrc`

---

## 常见问题

### Q1: 安装失败，提示 npm 不可用

**原因**: 未安装 Node.js 和 npm

**解决方案**:
```bash
# 使用 Homebrew 安装
brew install node

# 或使用 NVM 安装
nvm install node
nvm use node

# 验证安装
node --version
npm --version
```

### Q2: 安装后无法连接 API

**原因**: API key 或 base URL 配置错误

**解决方案**:
```bash
# 检查配置
cat ~/.claude/settings.json
env | grep ANTHROPIC_

# 重新设置配置
python scripts/claude_manager.py set-config \
  --auth-token "your-api-key" \
  --base-url "https://your-api-url" \
  --to-shell

# 重新加载配置
source ~/.zshrc
```

### Q3: 卸载后 `command -v claude` 仍然有路径

**原因**: shell 命令缓存未刷新

**解决方案**:
```bash
hash -r
# 或重新打开终端
```

### Q4: 新开终端环境变量又出现

**原因**: 环境变量仍写在 `~/.zshrc` 中

**解决方案**:
```bash
# 检查并手动删除
grep -nE "ANTHROPIC_|SILICONFLOW_" ~/.zshrc ~/.zshenv

# 编辑文件删除相关行
# 然后执行
source ~/.zshrc
```

### Q5: 如何更新 Token？

**解决方案**:
```bash
# 方法 1: 使用快速脚本（推荐）
./scripts/update_token.sh "sk-new-token"

# 方法 2: 使用 Python 命令
python scripts/claude_manager.py set-api-key "sk-new-token"

# 重新加载配置
source ~/.zshrc
```

### Q6: 配置文件中的环境变量没有写入 ~/.zshrc

**原因**: 使用 `set-config` 时未使用 `--to-shell` 选项

**解决方案**:
```bash
# 重新设置并写入 shell 配置
python scripts/claude_manager.py set-config \
  --config-file scripts/config/claude/settings.json \
  --to-shell

# 重新加载配置
source ~/.zshrc
```

---

## 故障排除

### 检查安装状态

```bash
# 检查命令是否可用
command -v claude
command -v ccr

# 检查版本
claude --version
ccr --version

# 检查 npm 包
npm list -g | grep claude

# 使用验证命令
python scripts/claude_manager.py verify
```

### 检查配置状态

```bash
# 检查环境变量
env | grep -E "ANTHROPIC_|CLAUDE_CODE_|API_TIMEOUT"

# 检查配置文件
cat ~/.claude/settings.json
grep -n "ANTHROPIC_\|CLAUDE_CODE_\|API_TIMEOUT" ~/.zshrc

# 检查进程
ps aux | grep -E "claude|ccr"
```

### 完全重置

如果遇到无法解决的问题，可以完全重置：

```bash
# 1. 完整卸载
python scripts/claude_manager.py uninstall --backup

# 2. 清理会话环境变量
for var in $(env | grep -E '^ANTHROPIC_|^SILICONFLOW_' | cut -d= -f1); do
    unset $var
done

# 3. 重新加载配置
source ~/.zshrc
hash -r

# 4. 验证清理
python scripts/claude_manager.py verify

# 5. 重新安装
python scripts/claude_manager.py set-config \
  --config-file scripts/config/claude/settings.json \
  --to-shell
python scripts/claude_manager.py install
```

### 获取帮助

```bash
# 查看主命令帮助
python scripts/claude_manager.py --help

# 查看子命令帮助
python scripts/claude_manager.py install --help
python scripts/claude_manager.py uninstall --help
python scripts/claude_manager.py set-config --help
python scripts/claude_manager.py set-api-key --help
python scripts/claude_manager.py verify --help
```

---

## 相关文档

- [Claude 卸载清理检查清单](../脚本开发/claude_uninstall_cleanup_checklist.md)
- [Claude 全流程操作指南](../../scripts/CLAUDE_FULL_WORKFLOW.md)
- [脚本 README](../../scripts/README.md)

---

## 更新日志

### v1.0 (2025-12-13)
- 初始版本
- 支持安装、卸载、配置、验证功能
- 支持快速更新 Token 脚本

---

**文档维护**: 如有问题或建议，请联系开发团队。

