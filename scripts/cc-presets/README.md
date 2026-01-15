# CC-Presets - 环境预设管理工具

一个轻量级的 macOS 环境变量管理工具，帮助您快速在不同的 AI 服务提供商配置之间切换。

## 功能特性

- **快速切换**: 使用简单命令（如 `cc-claude`）立即设置完整的环境变量集合
- **配置管理**: 使用 `cc-preset` 命令管理预设（增删改查）
- **安全存储**: 文件权限保护（600）+ .gitignore 模板
- **Shell 原生**: 基于 shell 函数，直接修改当前 shell 环境
- **零依赖**: 仅使用 macOS 自带工具（bash/zsh + python3）

## 系统要求

- macOS 操作系统
- bash 3.2+ 或 zsh 5.8+（macOS 自带）
- python3（macOS 10.15+ 自带）

## 快速开始

### 安装

```bash
# 进入项目根目录
cd /path/to/Cinema_Bussiness_Center_Platform

# 运行安装脚本
./scripts/cc-presets/install.sh

# 重新加载 shell 配置
source ~/.zshrc  # 或 source ~/.bash_profile
```

### 创建第一个预设

```bash
cc-preset add claude \
  --api-key sk-ant-your-api-key-here \
  --model claude-3-sonnet-20240229 \
  --base-url https://api.anthropic.com \
  --description "Claude API for development"
```

### 激活预设

```bash
cc-claude
```

输出：
```
✓ Activated preset 'claude'
  ANTHROPIC_API_KEY=sk-an****
  ANTHROPIC_MODEL=claude-3-sonnet-20240229
  ANTHROPIC_BASE_URL=https://api.anthropic.com
```

### 验证环境变量

```bash
echo $ANTHROPIC_MODEL
# 输出: claude-3-sonnet-20240229
```

## 命令参考

### 激活预设

```bash
cc-<preset-name>
```

激活指定名称的预设，设置环境变量到当前 shell。

### 管理命令

#### 添加预设

```bash
cc-preset add <name> --api-key <key> --model <model> --base-url <url> [options]
```

**选项**:
- `--api-key <key>`: API 密钥（必需）
- `--model <model>`: 模型名称（必需）
- `--base-url <url>`: API 基础 URL（必需）
- `--env KEY=VALUE`: 添加自定义环境变量（可多次使用）
- `--description <text>`: 预设描述
- `--force`: 强制覆盖已存在的预设

**示例**:
```bash
# 创建 GLM 预设并添加自定义变量
cc-preset add glm \
  --api-key xxxxx \
  --model GLM-4.6 \
  --base-url https://open.bigmodel.cn/api/anthropic \
  --env ANTHROPIC_SMALL_FAST_MODEL=GLM-4.6
```

#### 编辑预设

```bash
cc-preset edit <name> [options]
```

**选项**:
- `--api-key <key>`: 更新 API 密钥
- `--model <model>`: 更新模型
- `--base-url <url>`: 更新 base URL
- `--env KEY=VALUE`: 更新或添加环境变量
- `--unset-env KEY`: 删除环境变量
- `--description <text>`: 更新描述

**示例**:
```bash
# 更新模型版本
cc-preset edit claude --model claude-3-opus-20240229

# 添加超时设置
cc-preset edit claude --env ANTHROPIC_TIMEOUT=300
```

#### 删除预设

```bash
cc-preset delete <name> [--force]
```

**示例**:
```bash
# 交互式删除
cc-preset delete old-preset

# 跳过确认
cc-preset delete test --force
```

#### 列出预设

```bash
cc-preset list [--verbose] [--json] [--no-mask]
```

**选项**:
- `--verbose`: 显示详细信息
- `--json`: JSON 格式输出
- `--no-mask`: 显示完整的敏感值

**示例**:
```bash
# 人类可读格式
cc-preset list

# JSON 格式（可配合 jq 使用）
cc-preset list --json | jq '.presets[0].name'
```

#### 查看状态

```bash
cc-preset status [--verbose] [--no-mask]
```

显示当前活动的预设和环境变量。

## 使用场景

### 场景 1：多个 API 提供商

```bash
# 创建多个预设
cc-preset add claude --api-key xxx --model yyy --base-url zzz
cc-preset add glm --api-key xxx --model yyy --base-url zzz
cc-preset add openai --api-key xxx --model yyy --base-url zzz

# 快速切换
cc-claude   # 使用 Claude
cc-glm      # 切换到 GLM
cc-openai   # 切换到 OpenAI
```

### 场景 2：开发/生产环境

```bash
# 开发环境
cc-preset add claude-dev \
  --api-key sk-ant-dev-key \
  --model claude-3-haiku-20240307 \
  --base-url https://api.anthropic.com

# 生产环境
cc-preset add claude-prod \
  --api-key sk-ant-prod-key \
  --model claude-3-opus-20240229 \
  --base-url https://api.anthropic.com

# 使用
cc-claude-dev   # 开发
cc-claude-prod  # 生产
```

## 配置文件

### 位置

- 配置目录: `~/.config/cc-presets/`
- 配置文件: `~/.config/cc-presets/config.json`
- 权限: `700`（目录）, `600`（文件）

### 格式

```json
{
  "version": "1.0",
  "presets": {
    "claude": {
      "env_vars": {
        "ANTHROPIC_API_KEY": "sk-ant-xxxxx",
        "ANTHROPIC_MODEL": "claude-3-sonnet-20240229",
        "ANTHROPIC_BASE_URL": "https://api.anthropic.com"
      },
      "metadata": {
        "created": "2025-12-13T10:30:00Z",
        "modified": "2025-12-13T10:30:00Z",
        "description": "Claude API configuration"
      }
    }
  },
  "settings": {
    "active_preset": "claude",
    "mask_sensitive": true
  }
}
```

## 安全最佳实践

1. **文件权限**: 配置文件自动设置为 600（仅用户可读写）
2. **版本控制**: 不要将包含密钥的配置文件提交到 Git
3. **密钥轮换**: 定期更新 API 密钥
4. **备份**: 将配置目录加入个人备份方案

### .gitignore 配置

项目提供了 .gitignore 模板：

```
.config/cc-presets/config.json
.config/cc-presets/config.json.bak
.config/cc-presets/*.tmp
```

## 故障排除

### 命令未找到

**问题**: `cc-preset: command not found`

**解决方案**:
```bash
# 检查安装
ls -la ~/.config/cc-presets/

# 重新加载配置
source ~/.zshrc  # 或 source ~/.bash_profile

# 重新安装
./scripts/cc-presets/install.sh
```

### 环境变量未设置

**问题**: 激活后环境变量仍为空

**解决方案**:
```bash
# 确保在当前 shell 执行（不要在子 shell）
cc-claude  # 正确
bash -c "cc-claude"  # 错误（子 shell）

# 验证配置文件
python3 -m json.tool ~/.config/cc-presets/config.json
```

### 权限错误

**问题**: `Permission denied`

**解决方案**:
```bash
chmod 600 ~/.config/cc-presets/config.json
chmod 700 ~/.config/cc-presets/
```

## 卸载

```bash
# 1. 编辑 shell 配置文件
vim ~/.zshrc  # 或 ~/.bash_profile
# 删除包含 cc-presets 的行

# 2. 删除配置目录
rm -rf ~/.config/cc-presets/

# 3. 重新加载 shell
source ~/.zshrc
```

## 项目结构

```
scripts/cc-presets/
├── core/
│   ├── activate.sh       # 预设激活逻辑
│   ├── config.sh         # 配置文件读写
│   └── utils.sh          # 通用工具函数
├── commands/
│   ├── add.sh            # add 子命令
│   ├── edit.sh           # edit 子命令
│   ├── delete.sh         # delete 子命令
│   ├── list.sh           # list 子命令
│   └── status.sh         # status 子命令
├── install.sh            # 安装脚本
├── cc-preset.sh          # 主命令入口
├── functions.sh          # Shell 函数库
└── README.md             # 本文件
```

## 开发

### 运行测试

```bash
# 单元测试
./tests/unit/test_config.sh
./tests/unit/test_activate.sh
./tests/unit/test_commands.sh

# 集成测试
./tests/integration/test_workflow.sh
```

## 许可证

本项目是 Cinema Business Center Platform 的一部分。

## 支持

遇到问题或有功能建议？请查阅：
- [快速入门指南](../../specs/008-env-preset-commands/quickstart.md)
- [CLI 接口文档](../../specs/008-env-preset-commands/contracts/cli-interface.md)
- [数据模型](../../specs/008-env-preset-commands/data-model.md)
