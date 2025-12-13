# 命令行接口合约

**功能**: 008-env-preset-commands
**日期**: 2025-12-13
**版本**: 1.0

## 概述

本文档定义 cc-presets 工具的命令行接口（CLI）合约，包括所有命令、参数、选项、输出格式和退出码。

## 命令列表

### 1. 预设激活命令

#### 命令格式
```bash
cc-<preset-name>
```

#### 描述
激活指定名称的预设配置，设置相应的环境变量到当前 shell 会话。

#### 参数
- `<preset-name>`: 预设名称（在配置文件中定义）

#### 选项
无

#### 行为
1. 清理之前激活的预设的环境变量（如果有）
2. 从配置文件读取指定预设的环境变量
3. 在当前 shell 中设置环境变量
4. 更新全局设置中的 `active_preset` 字段

#### 输出
成功时：
```
✓ Activated preset 'claude'
  ANTHROPIC_API_KEY=sk-ant-****
  ANTHROPIC_MODEL=claude-3-sonnet-20240229
  ANTHROPIC_BASE_URL=https://api.anthropic.com
```

失败时（预设不存在）：
```
ERROR: Preset 'invalid-name' not found
Available presets: claude, glm, openai
Use 'cc-preset add <name>' to create a new preset
```

#### 退出码
- 0: 成功激活
- 3: 预设不存在
- 2: 配置文件错误（无法读取或解析）

#### 示例
```bash
$ cc-claude
✓ Activated preset 'claude'
  ANTHROPIC_API_KEY=sk-ant-****
  ANTHROPIC_MODEL=claude-3-sonnet-20240229
  ANTHROPIC_BASE_URL=https://api.anthropic.com

$ echo $ANTHROPIC_MODEL
claude-3-sonnet-20240229
```

---

### 2. 管理命令：cc-preset

#### 命令格式
```bash
cc-preset <subcommand> [options] [arguments]
```

#### 描述
预设配置管理工具，提供增删改查功能。

#### 子命令

##### 2.1 add - 添加新预设

**格式**:
```bash
cc-preset add <name> --api-key <key> --model <model> --base-url <url> [--env KEY=VALUE ...]
```

**必需参数**:
- `<name>`: 预设名称（小写字母、数字、连字符，以字母开头）

**必需选项**:
- `--api-key <key>`: API 密钥
- `--model <model>`: 模型名称
- `--base-url <url>`: API 基础 URL

**可选选项**:
- `--env KEY=VALUE`: 添加自定义环境变量（可多次使用）
- `--description <text>`: 预设描述（最多200字符）
- `--force`: 强制覆盖已存在的预设（跳过确认提示）

**输出**:
```
✓ Preset 'claude' created successfully
  Activate with: cc-claude
```

**退出码**:
- 0: 成功创建
- 1: 参数错误（名称无效、缺少必需选项）
- 2: 系统错误（无法写入配置文件）

**示例**:
```bash
$ cc-preset add claude \
    --api-key sk-ant-xxxxx \
    --model claude-3-sonnet-20240229 \
    --base-url https://api.anthropic.com \
    --description "Claude API configuration"
✓ Preset 'claude' created successfully
  Activate with: cc-claude

$ cc-preset add glm \
    --api-key xxxxx \
    --model GLM-4.6 \
    --base-url https://open.bigmodel.cn/api/anthropic \
    --env ANTHROPIC_SMALL_FAST_MODEL=GLM-4.6
✓ Preset 'glm' created successfully
  Activate with: cc-glm
```

---

##### 2.2 edit - 编辑预设

**格式**:
```bash
cc-preset edit <name> [--api-key <key>] [--model <model>] [--base-url <url>] [--env KEY=VALUE ...]
```

**必需参数**:
- `<name>`: 预设名称

**可选选项**:
- `--api-key <key>`: 更新 API 密钥
- `--model <model>`: 更新模型名称
- `--base-url <url>`: 更新 API 基础 URL
- `--env KEY=VALUE`: 更新或添加自定义环境变量
- `--unset-env KEY`: 删除指定的环境变量
- `--description <text>`: 更新描述

**行为**:
- 只更新指定的选项，未指定的保持不变
- 更新元数据中的 `modified` 时间戳

**输出**:
```
✓ Preset 'claude' updated successfully
  Modified: ANTHROPIC_MODEL
```

**退出码**:
- 0: 成功更新
- 1: 参数错误
- 3: 预设不存在
- 2: 系统错误

**示例**:
```bash
$ cc-preset edit claude --model claude-3-opus-20240229
✓ Preset 'claude' updated successfully
  Modified: ANTHROPIC_MODEL

$ cc-preset edit glm --env ANTHROPIC_TIMEOUT=300
✓ Preset 'glm' updated successfully
  Added: ANTHROPIC_TIMEOUT
```

---

##### 2.3 delete - 删除预设

**格式**:
```bash
cc-preset delete <name> [--force]
```

**必需参数**:
- `<name>`: 预设名称

**可选选项**:
- `--force`: 跳过确认提示

**行为**:
- 默认显示确认提示（除非使用 `--force`）
- 如果删除的是当前激活的预设，清理相关环境变量

**输出**:
```
WARNING: This will permanently delete preset 'claude'
Delete preset 'claude'? (y/N): y
✓ Preset 'claude' deleted successfully
```

**退出码**:
- 0: 成功删除或用户取消
- 3: 预设不存在
- 2: 系统错误

**示例**:
```bash
$ cc-preset delete old-preset
WARNING: This will permanently delete preset 'old-preset'
Delete preset 'old-preset'? (y/N): y
✓ Preset 'old-preset' deleted successfully

$ cc-preset delete test --force
✓ Preset 'test' deleted successfully
```

---

##### 2.4 list - 列出所有预设

**格式**:
```bash
cc-preset list [--verbose] [--json]
```

**可选选项**:
- `--verbose`: 显示详细信息（包括所有环境变量）
- `--json`: 以 JSON 格式输出
- `--no-mask`: 显示完整的敏感值（不掩码）

**输出（默认）**:
```
Available presets:
  * claude (active)
      ANTHROPIC_API_KEY=sk-ant-****
      ANTHROPIC_MODEL=claude-3-sonnet-20240229
      ANTHROPIC_BASE_URL=https://api.anthropic.com
      Created: 2025-12-13 10:30:00

    glm
      ANTHROPIC_AUTH_TOKEN=f408****
      ANTHROPIC_MODEL=GLM-4.6
      ANTHROPIC_BASE_URL=https://open.bigmodel.cn/api/anthropic
      Created: 2025-12-13 11:00:00

Use 'cc-<name>' to activate a preset
```

**输出（--json）**:
```json
{
  "active_preset": "claude",
  "presets": [
    {
      "name": "claude",
      "active": true,
      "env_vars": {
        "ANTHROPIC_API_KEY": "sk-ant-****",
        "ANTHROPIC_MODEL": "claude-3-sonnet-20240229",
        "ANTHROPIC_BASE_URL": "https://api.anthropic.com"
      },
      "metadata": {
        "created": "2025-12-13T10:30:00Z",
        "modified": "2025-12-13T10:30:00Z"
      }
    }
  ]
}
```

**退出码**:
- 0: 成功
- 2: 配置文件错误

**示例**:
```bash
$ cc-preset list
Available presets:
  * claude (active)
      ...

$ cc-preset list --json | jq '.presets[0].name'
"claude"
```

---

##### 2.5 status - 显示当前状态

**格式**:
```bash
cc-preset status [--verbose]
```

**可选选项**:
- `--verbose`: 显示所有环境变量的当前值
- `--no-mask`: 显示完整的敏感值

**输出**:
```
Current preset: claude
Active since: current shell session

Environment variables:
  ANTHROPIC_API_KEY=sk-ant-****
  ANTHROPIC_MODEL=claude-3-sonnet-20240229
  ANTHROPIC_BASE_URL=https://api.anthropic.com
```

无激活预设时：
```
No preset currently active
Use 'cc-<name>' to activate a preset
```

**退出码**:
- 0: 成功
- 2: 配置文件错误

**示例**:
```bash
$ cc-preset status
Current preset: claude
...

$ cc-claude
$ cc-preset status --verbose
Current preset: claude
...
```

---

##### 2.6 help - 显示帮助

**格式**:
```bash
cc-preset help [subcommand]
cc-preset --help
cc-preset -h
```

**参数**:
- `[subcommand]`: 可选，显示特定子命令的帮助

**输出**:
```
cc-preset - Environment preset manager for macOS

Usage:
  cc-preset <subcommand> [options]

Subcommands:
  add       Create a new preset
  edit      Edit an existing preset
  delete    Delete a preset
  list      List all presets
  status    Show current active preset
  help      Show this help message

Activation:
  cc-<name>  Activate preset <name>

Examples:
  cc-preset add claude --api-key xxx --model yyy --base-url zzz
  cc-claude
  cc-preset list

For more help: cc-preset help <subcommand>
```

**退出码**:
- 0: 总是成功

---

## 环境变量

工具使用以下环境变量进行内部跟踪（用户不应手动设置）：

- `_CC_ACTIVE_PRESET`: 当前激活的预设名称
- `_CC_ACTIVE_VARS`: 当前激活的预设设置的环境变量列表（逗号分隔）

## 文件路径

- 配置文件: `~/.config/cc-presets/config.json`
- Shell 函数库: `~/.config/cc-presets/functions.sh`
- Shell RC 文件: `~/.zshrc` 或 `~/.bash_profile`

## 退出码约定

| 码 | 含义 | 示例 |
|----|------|------|
| 0  | 成功 | 操作完成，用户取消 |
| 1  | 用户输入错误 | 参数缺失、格式错误、名称无效 |
| 2  | 系统错误 | 文件权限、JSON 解析失败、磁盘满 |
| 3  | 逻辑错误 | 预设不存在、配置损坏 |

## 输出格式约定

### 成功消息
```
✓ <operation> successful
  [details...]
```

### 错误消息
```
ERROR: <error description>
[usage or suggestion]
```

### 警告消息
```
WARNING: <warning description>
[additional info]
```

### 信息消息
```
INFO: <informational message>
```

## 安全和隐私

### 敏感数据掩码

默认情况下，包含 "KEY"、"TOKEN"、"SECRET"、"PASSWORD" 的环境变量值会被掩码显示：
- 显示前4个字符 + `****`
- 例如：`sk-ant-xxxxx` → `sk-ant-****`

使用 `--no-mask` 选项可显示完整值。

### 文件权限

所有配置文件自动设置为 `chmod 600`（仅用户可读写）。

## 版本兼容性

配置文件包含 `version` 字段，用于未来格式升级：
- 当前版本: `1.0`
- 向后兼容策略: 工具可读取旧版本配置，但写入时使用当前版本
- 主版本不兼容时，工具会提示用户迁移

## 错误恢复

### 配置文件损坏
```
ERROR: Configuration file is corrupted
  File: ~/.config/cc-presets/config.json
  Suggestion: Restore from backup or delete and reconfigure
```

### JSON 解析失败
```
ERROR: Failed to parse configuration file
  File: ~/.config/cc-presets/config.json
  Line: 15, Column: 8
  Error: Unexpected token '}'
```

### 权限问题
```
ERROR: Permission denied
  File: ~/.config/cc-presets/config.json
  Suggestion: Check file permissions with: ls -la ~/.config/cc-presets/
```
