# Claude Code CLI/Router 管理工具

用于安装、卸载和管理 Claude Code CLI 和 Claude Code Router 的 Python 自动化脚本。

## ✨ 功能特性

- ✅ **安装功能**: 通过 npm 安装 Claude Code CLI 和/或 Router
- ✅ **卸载功能**: 一键卸载并清理所有相关配置和残留
  - 支持多种安装方式检测（npm、Homebrew、Native、NVM）
  - 自动停止运行中的进程
  - 清理用户配置、环境变量、alias
- ✅ **验证功能**: 验证清理是否彻底完成
- ✅ **API Key 管理**: 设置和管理 API key
- ✅ **配置管理**: 保存完整配置到 ~/.claude/settings.json
- ✅ **备份功能**: 卸载前可选备份配置文件
- ✅ **Dry-run 模式**: 预览操作而不实际执行

## 📋 系统要求

- **Python**: 3.8+（仅使用标准库，无第三方依赖）
- **操作系统**: macOS (Darwin)
- **Shell**: zsh
- **npm**: 用于安装功能（可选）

## 🚀 快速开始

### 直接运行（无需安装依赖）

```bash
# 查看帮助
python scripts/claude_manager.py --help

# 安装 Claude Code CLI（交互式）
python scripts/claude_manager.py install

# 卸载 Claude Code
python scripts/claude_manager.py uninstall

# 验证清理结果
python scripts/claude_manager.py verify
```

## 📖 详细使用说明

### 1. 安装 Claude 组件

```bash
# 交互式安装（会询问选择组件）
python scripts/claude_manager.py install

# 仅安装 CLI
python scripts/claude_manager.py install --components cli

# 仅安装 Router
python scripts/claude_manager.py install --components router

# 安装两者
python scripts/claude_manager.py install --components both

# 安装时同时设置 API key
python scripts/claude_manager.py install --components both --api-key sk-ant-xxx

# 跳过 alias 创建
python scripts/claude_manager.py install --skip-alias

# 预览安装操作（dry-run）
python scripts/claude_manager.py install --dry-run --verbose
```

**安装流程**:
1. 检查 npm 是否可用
2. 选择要安装的组件（CLI、Router 或两者）
3. 使用 npm install -g 安装包
4. 验证安装是否成功
5. 可选：创建 alias（cc、c）
6. 可选：设置 API key

### 2. 卸载 Claude 组件

**推荐方式：使用 Shell 入口脚本**

```bash
# 基本卸载（默认自动备份）
scripts/claude-uninstall.sh

# 跳过备份（高级用户）
scripts/claude-uninstall.sh --no-backup

# 跳过验证步骤
scripts/claude-uninstall.sh --skip-verify

# 查看帮助
scripts/claude-uninstall.sh --help
```

**或使用 Python 入口（向后兼容）**

```bash
# 基本卸载（默认自动备份）
python scripts/claude_manager.py uninstall

# 跳过备份
python scripts/claude_manager.py uninstall --no-backup

# 跳过验证步骤
python scripts/claude_manager.py uninstall --skip-verification

# 预览卸载操作（dry-run）
python scripts/claude_manager.py uninstall --dry-run --verbose
```

**卸载流程**:
1. **自动备份**（默认启用）: 备份配置文件到 ~/claude-backup-YYYYMMDD-HHMMSS/
   - 备份 ~/.zshrc 和 ~/.zshenv（如果存在）
   - 备份 ~/.claude 等用户配置文件
   - 使用 `--no-backup` 可跳过备份
2. 检测所有安装方式（npm、Homebrew、Native、NVM）
3. 停止运行中的 Router 进程
4. 卸载 npm 全局包
5. 卸载 Homebrew 包（如果存在）
6. 清理 Native 安装（如果存在）
7. **增强的环境变量清理**:
   - 删除 `export ANTHROPIC_*` 语句
   - 删除函数内部的 ANTHROPIC 变量
   - 删除 alias 中的 ANTHROPIC 变量
   - 显示详细的清理日志（变量名、行号、类型）
8. 清理用户配置（~/.claude、~/.claude.json 等）
9. 清理会话环境变量（当前 Python 进程）
10. （可选）验证清理结果

**支持的安装方式**:
- ✅ npm 全局安装
- ✅ Homebrew 安装
- ✅ Native 安装（~/.local/bin/claude）
- ✅ NVM 多版本 Node 安装

### 3. 验证清理结果

```bash
# 运行验证检查
python scripts/claude_manager.py verify
```

**验证项目**:
- ✓ 命令 claude、ccr 是否可用
- ✓ npm 全局包是否已卸载
- ✓ 配置目录 ~/.claude 是否存在
- ✓ 环境变量是否已清理
- ✓ 进程是否已停止

### 4. 设置 API Key

```bash
# 交互式设置（会提示输入）
python scripts/claude_manager.py set-api-key

# 直接提供 API key
python scripts/claude_manager.py set-api-key sk-ant-xxx

# 指定配置文件路径
python scripts/claude_manager.py set-api-key sk-ant-xxx --config-file ~/.zshrc

# 预览操作
python scripts/claude_manager.py set-api-key sk-ant-xxx --dry-run
```

**配置文件检测优先级**:
1. `$ZDOTDIR/.zshenv`（如果 ZDOTDIR 设置）
2. `~/.zshenv`
3. `~/.zshrc`

### 5. 设置完整配置

```bash
# 设置环境变量
python scripts/claude_manager.py set-config \
  --env ANTHROPIC_API_KEY=sk-ant-xxx \
  --env ANTHROPIC_BASE_URL=https://api.anthropic.com

# 设置权限
python scripts/claude_manager.py set-config \
  --permission dangerously_skip_permissions=true

# 设置 alias
python scripts/claude_manager.py set-config \
  --alias cc='claude --dangerously-skip-permissions'

# 组合设置
python scripts/claude_manager.py set-config \
  --env ANTHROPIC_API_KEY=sk-ant-xxx \
  --permission dangerously_skip_permissions=false \
  --alias cc='claude --dangerously-skip-permissions' \
  --alias c='claude'

# 从 JSON 文件读取配置
python scripts/claude_manager.py set-config \
  --json-file scripts/config/claude/settings.json

# 从 JSON 文件读取并同步到 shell 配置文件
python scripts/claude_manager.py set-config \
  --json-file scripts/config/claude/settings.json \
  --to-shell

# 命令行参数覆盖 JSON 文件中的配置（优先级：命令行 > JSON > 现有配置）
python scripts/claude_manager.py set-config \
  --json-file scripts/config/claude/settings.json \
  --env ANTHROPIC_AUTH_TOKEN=sk-new-token

# 指定自定义 shell 配置文件路径
python scripts/claude_manager.py set-config \
  --json-file scripts/config/claude/settings.json \
  --to-shell \
  --shell-config ~/.custom_zshrc
```

**配置优先级**（从高到低）:
1. 命令行参数 (`--env`, `--permission`, `--alias`)
2. JSON 文件 (`--json-file`)
3. 现有配置文件 (`~/.claude/settings.json`)
4. 默认值

**JSON 文件格式**:
```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-xxx",
    "ANTHROPIC_BASE_URL": "https://api.example.com"
  },
  "permissions": {
    "allow": ["read", "write"],
    "deny": []
  },
  "aliases": {
    "cc": "claude --dangerously-skip-permissions"
  }
}
```

配置将保存到 `~/.claude/settings.json`。如果使用 `--to-shell`，环境变量也会写入 shell 配置文件（`~/.zshrc` 或 `~/.zshenv`）。

## ⚙️ 全局选项

所有子命令都支持以下全局选项：

| 选项 | 简写 | 说明 |
|------|------|------|
| `--dry-run` | - | 预览模式，显示将要执行的操作但不实际执行 |
| `--verbose` | `-v` | 详细日志模式，显示命令输出和调试信息 |
| `--quiet` | `-q` | 安静模式，仅显示错误和最终结果 |
| `--version` | - | 显示版本号 |

### Dry-run 示例

```bash
# 预览安装操作
python scripts/claude_manager.py install --dry-run --verbose

# 预览卸载操作
python scripts/claude_manager.py uninstall --dry-run --verbose
```

**Dry-run 输出示例**:
```
[DRY-RUN] Would execute: Install @anthropic-ai/claude-code
[DRY-RUN] Command: npm install -g @anthropic-ai/claude-code
```

## 📊 退出码

| 退出码 | 含义 |
|--------|------|
| 0 | 成功 |
| 1 | 一般错误（权限不足、文件不可写等） |
| 2 | 验证失败或格式错误 |
| 3 | 依赖缺失（如 npm 不可用） |
| 130 | 用户中断（Ctrl+C） |

## 🏗️ 项目结构

```
scripts/
└── claude_manager.py      # 单文件脚本（~725 行，标准库 only）

tests/
├── unit/                  # 单元测试
├── integration/           # 集成测试
└── fixtures/              # 测试fixtures

pytest.ini                 # pytest 配置
requirements-dev.txt       # 开发依赖
```

## 🛠️ 开发

### 安装开发依赖

```bash
# 注意：运行脚本无需任何依赖，开发依赖仅用于测试
pip install -r requirements-dev.txt
```

### 运行测试

```bash
# 运行所有测试
pytest

# 运行指定测试文件
pytest tests/unit/test_shell_detector.py

# 运行测试并显示覆盖率
pytest --cov=scripts --cov-report=html

# 运行测试并显示详细输出
pytest -v
```

### 类型检查（可选）

```bash
mypy scripts/claude_manager.py
```

### 代码风格

遵循 Python PEP 8 规范，使用中文注释。

## 🧪 测试脚本

```bash
# 测试帮助信息
python scripts/claude_manager.py --help
python scripts/claude_manager.py install --help
python scripts/claude_manager.py uninstall --help

# 测试 dry-run 模式
python scripts/claude_manager.py install --dry-run --verbose
python scripts/claude_manager.py uninstall --dry-run --verbose

# 测试 verbose 模式
python scripts/claude_manager.py verify --verbose

# 测试 quiet 模式
python scripts/claude_manager.py verify --quiet
```

## 📝 常见问题

### Q: 为什么不使用第三方库如 click、rich？

**A**: 为了保持脚本自包含、易于分发。用户可以直接运行 `python claude_manager.py`，无需安装依赖。

### Q: 如何测试不同 shell 配置场景？

**A**: 使用环境变量 `ZDOTDIR` 来测试自定义配置目录：

```bash
ZDOTDIR=/tmp/custom python scripts/claude_manager.py set-api-key sk-ant-xxx --dry-run
```

### Q: 卸载后如何恢复配置？

**A**: 使用 `--backup` 选项：

```bash
# 卸载时备份
python scripts/claude_manager.py uninstall --backup

# 备份位置会显示在输出中
# 备份位置: ~/claude-backup-20251213-143000/

# 手动恢复
cp -r ~/claude-backup-20251213-143000/.claude ~/.claude
```

### Q: 如何清理特定的安装方式？

**A**: 脚本会自动检测并清理所有安装方式（npm、Homebrew、Native、NVM）。如果只想清理特定方式，可以手动删除：

```bash
# 仅卸载 npm 包
npm uninstall -g @anthropic-ai/claude-code
npm uninstall -g @musistudio/claude-code-router

# 仅卸载 Homebrew
brew uninstall claude-code

# 仅删除配置
rm -rf ~/.claude ~/.claude.json
```

## 🔒 安全提示

- API key 将以明文形式写入 shell 配置文件（如 ~/.zshenv）
- 建议使用权限受限的 API key
- 不要在公共仓库中提交包含 API key 的配置文件

## 📄 许可证

MIT

## 🙏 贡献

欢迎提交 Issue 和 Pull Request！

---

**生成工具**: [SpecKit](https://github.com/anthropics/speckit)
**最后更新**: 2025-12-13
