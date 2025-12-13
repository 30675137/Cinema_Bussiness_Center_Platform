# Claude Code CLI/Router 管理工具

用于安装、卸载和管理 Claude Code CLI 和 Claude Code Router 的 Python 自动化脚本。

## 功能特性

- ✅ **安装功能**: 通过 npm 安装 Claude Code CLI 和/或 Router
- ✅ **卸载功能**: 一键卸载并清理所有相关配置和残留
- ✅ **验证功能**: 验证清理是否彻底完成
- ✅ **API Key 管理**: 设置和管理 API key
- ✅ **备份功能**: 卸载前可选备份配置文件

## 安装依赖

```bash
cd scripts
pip install -r requirements.txt
```

## 使用方法

### 安装 Claude Code CLI 和 Router

```bash
# 交互式安装（推荐）
python scripts/claude_manager.py install

# 仅安装 CLI
python scripts/claude_manager.py install --cli

# 安装 CLI 和 Router，并设置 API key
python scripts/claude_manager.py install --cli --router --api-key sk-ant-xxx
```

### 卸载 Claude Code

```bash
# 基本卸载（自动检测所有安装方式）
python scripts/claude_manager.py uninstall

# 卸载前备份配置文件
python scripts/claude_manager.py uninstall --backup

# 仅清理 npm 安装的包
python scripts/claude_manager.py uninstall --methods npm
```

### 验证清理结果

```bash
# 表格格式（默认）
python scripts/claude_manager.py verify

# JSON 格式
python scripts/claude_manager.py verify --format json
```

### 设置 API Key

```bash
# 交互式设置
python scripts/claude_manager.py set-api-key

# 直接提供 API key
python scripts/claude_manager.py set-api-key sk-ant-xxx

# 指定配置文件
python scripts/claude_manager.py set-api-key sk-ant-xxx --config-file ~/.zshenv
```

### 设置完整配置

```bash
# 从 JSON 文件设置配置
python scripts/claude_manager.py set-config --json-file example_config.json

# 命令行参数设置
python scripts/claude_manager.py set-config \
  --auth-token sk-mykey \
  --base-url https://cc.zhihuiapi.top \
  --disable-nonessential-traffic \
  --api-timeout-ms 600000 \
  --to-shell

# 交互式设置
python scripts/claude_manager.py set-config
```

## 命令选项

### 全局选项

- `--verbose, -v`: 启用详细输出
- `--quiet, -q`: 静默模式，仅输出错误
- `--help, -h`: 显示帮助信息

### install 命令

- `--cli`: 安装 Claude Code CLI
- `--router`: 安装 Claude Code Router
- `--api-key TEXT`: 可选的 API key，安装后自动设置
- `--no-interactive`: 非交互模式

### uninstall 命令

- `--backup`: 在卸载前备份配置文件
- `--backup-dir PATH`: 备份目录路径（默认: ~/.claude-cleanup-backup/）
- `--methods TEXT`: 要清理的安装方式，逗号分隔（npm,homebrew,native）
- `--skip-verify`: 卸载后不执行验证

### verify 命令

- `--format TEXT`: 输出格式（table 或 json，默认: table）

### set-api-key 命令

- `--config-file PATH`: 目标配置文件路径（默认: 自动检测）
- `--no-update`: 如果已存在则不更新

### set-config 命令

设置 Claude Code 完整配置（环境变量和权限）

- `--auth-token TEXT`: ANTHROPIC_AUTH_TOKEN (API key)
- `--base-url TEXT`: ANTHROPIC_BASE_URL
- `--disable-nonessential-traffic`: 启用 CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC
- `--api-timeout-ms INTEGER`: API_TIMEOUT_MS (毫秒)
- `--config-file PATH`: Claude 配置文件路径（默认: ~/.claude/settings.json）
- `--shell-config PATH`: Shell 配置文件路径（默认: 自动检测）
- `--to-shell`: 同时设置到 shell 配置文件（~/.zshrc）
- `--json-file PATH`: 从 JSON 文件读取配置

## 退出码

- `0`: 成功
- `1`: 一般错误
- `2`: 参数错误
- `3`: 权限不足
- `4`: 依赖缺失（如 npm 未安装）

## 系统要求

- Python 3.8+
- macOS (Darwin)
- zsh shell
- npm（用于安装功能）

## 项目结构

```
scripts/
├── claude_manager.py      # 主入口脚本
├── commands/              # 子命令模块
│   ├── install.py
│   ├── uninstall.py
│   ├── set_api_key.py
│   └── verify.py
├── core/                  # 核心功能模块
│   ├── process_manager.py
│   ├── package_manager.py
│   ├── config_cleaner.py
│   ├── env_manager.py
│   └── backup_manager.py
├── utils/                 # 工具函数
│   ├── logger.py
│   ├── shell.py
│   ├── file_ops.py
│   └── validators.py
└── tests/                 # 测试文件
```

## 开发

### 运行测试

```bash
cd scripts
pytest
```

### 代码风格

遵循 Python PEP 8 规范，使用中文注释（符合项目宪章要求）。

## 许可证

MIT

